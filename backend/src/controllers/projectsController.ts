import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { Project } from "../models/Project";
import { ProjectObjective } from "../models/ProjectObjective";
import { ProjectSession } from "../models/ProjectSession";
import { ProjectProgress } from "../models/ProjectProgress";
import { HttpError } from "../middleware/error";
import { docker } from "../services/dockerSandbox";
import { startProjectSession, stopProjectSessionForUser, getActiveProjectSession } from "../services/dockerTopology";
import { validateObjective } from "../services/objectiveValidation";

/** Objectif sans le bloc `validation` (jamais exposé). */
function serializeObjective(o: {
  id: string;
  order: number;
  kind: string;
  title: string;
  description: string;
  points: number;
  dependsOn: string[];
  questions?: { id: string; prompt: string }[];
}) {
  return {
    id: o.id,
    order: o.order,
    kind: o.kind,
    title: o.title,
    description: o.description,
    points: o.points,
    dependsOn: o.dependsOn ?? [],
    questions: o.questions ?? [],
  };
}

function remainingSec(expiresAt: Date): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

/** GET /api/projects — liste + statut par utilisateur (auth optionnelle). */
export async function listProjects(req: Request, res: Response): Promise<void> {
  const projects = await Project.find().sort({ createdAt: 1 }).lean();
  const progressBySlug: Record<string, { status: string; totalPoints: number }> = {};
  if (req.userId) {
    const progs = await ProjectProgress.find({ user: req.userId }).lean();
    for (const p of progs) progressBySlug[p.projectSlug] = { status: p.status, totalPoints: p.totalPoints };
  }
  res.json({
    projects: projects.map((p) => ({
      slug: p.slug,
      checkpoint: p.checkpoint,
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      estimatedMinutes: p.estimatedMinutes,
      status: progressBySlug[p.slug]?.status ?? "not_started",
      totalPoints: progressBySlug[p.slug]?.totalPoints ?? 0,
    })),
  });
}

/** GET /api/projects/:slug — détail + objectifs + progression. */
export async function getProject(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug);
  const project = await Project.findOne({ slug }).lean();
  if (!project) throw new HttpError(404, "Projet introuvable.");

  const objectives = await ProjectObjective.find({ projectSlug: slug }).sort({ order: 1 }).lean();
  const progress = req.userId ? await ProjectProgress.findOne({ user: req.userId, projectSlug: slug }).lean() : null;
  const completed = new Set((progress?.completedObjectives ?? []).map((c) => c.objectiveId));

  res.json({
    project: {
      slug: project.slug,
      checkpoint: project.checkpoint,
      title: project.title,
      description: project.description,
      difficulty: project.difficulty,
      estimatedMinutes: project.estimatedMinutes,
      topology: project.topology,
    },
    objectives: objectives.map((o) => ({ ...serializeObjective(o), completed: completed.has(o.id) })),
    progress: progress
      ? {
          status: progress.status,
          totalPoints: progress.totalPoints,
          completedObjectives: progress.completedObjectives,
          solutionRevealed: progress.solutionRevealed ?? false,
        }
      : null,
  });
}

/**
 * GET /api/projects/:slug/solution
 * Corrigé complet — 403 tant que le projet n'est pas terminé ET que le temps
 * n'est pas écoulé (solutionRevealed). Jamais exposé par les listings.
 */
export async function getProjectSolution(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug);
  const progress = await ProjectProgress.findOne({ user: req.userId, projectSlug: slug }).lean();
  const available = !!progress && (progress.status === "completed" || progress.solutionRevealed === true);
  if (!available) {
    throw new HttpError(403, "Le corrigé se débloque une fois le projet terminé — ou automatiquement à l'expiration du temps.");
  }
  const project = await Project.findOne({ slug }).select("+solution").lean();
  if (!project || !project.solution) throw new HttpError(404, "Corrigé indisponible pour ce projet.");
  res.json({ solution: project.solution });
}

/** POST /api/projects/:slug/session/start */
export async function startProjectSessionCtrl(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug);
  const project = await Project.findOne({ slug }).lean();
  if (!project) throw new HttpError(404, "Projet introuvable.");

  // Suffixe de flag aléatoire par session (anti write-up) : injecté en env dans
  // les conteneurs à flag, lu à la validation. Jamais une constante recompilée.
  const flagSuffix = randomBytes(4).toString("hex");
  const session = await startProjectSession(req.userId as string, {
    slug: project.slug,
    topology: project.topology,
    ttlSec: project.ttlSec,
    flagSuffix,
  });

  res.status(201).json({
    session: {
      status: session.status,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      remainingSec: remainingSec(session.expiresAt),
      terminalUrls: session.terminalUrls,
    },
  });
}

/** POST /api/projects/:slug/session/stop */
export async function stopProjectSessionCtrl(req: Request, res: Response): Promise<void> {
  await stopProjectSessionForUser(req.userId as string);
  res.status(204).end();
}

/** GET /api/projects/:slug/session */
export async function getProjectSession(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug);
  const session = await ProjectSession.findOne({
    user: req.userId,
    projectSlug: slug,
    status: { $in: ["starting", "running"] },
  }).lean();
  if (!session) {
    res.json({ session: null });
    return;
  }
  res.json({
    session: {
      status: session.status,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      remainingSec: remainingSec(session.expiresAt),
      terminalUrls: session.terminalUrls,
    },
  });
}

/** GET /api/projects/:slug/session/logs?node=waf — tail des logs d'un nœud. */
export async function getProjectLogs(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug);
  const node = String(req.query.node ?? "");
  const session = await ProjectSession.findOne({
    user: req.userId,
    projectSlug: slug,
    status: { $in: ["starting", "running"] },
  }).lean();
  if (!session) throw new HttpError(409, "Aucune session active pour ce projet.");

  const entry = session.containerIds.find((c) => c.nodeId === node);
  if (!entry) throw new HttpError(404, `Nœud « ${node} » introuvable dans la session.`);

  try {
    const buf = (await docker.getContainer(entry.dockerId).logs({
      stdout: true,
      stderr: true,
      tail: 200,
      timestamps: false,
    })) as unknown as Buffer;
    // Le flux multiplexé porte des en-têtes de 8 octets ; on retire les octets
    // de contrôle pour un affichage lisible.
    const text = Buffer.from(buf).toString("utf8").replace(/[\x00-\x08\x0b-\x1f]/g, (m) => (m === "\n" ? "\n" : ""));
    res.json({ node, logs: text });
  } catch (err) {
    throw new HttpError(500, `Impossible de lire les logs de « ${node} ».`);
  }
}

/** GET /api/projects/:slug/objectives — statut (locked/available/completed). */
export async function getProjectObjectives(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug);
  const objectives = await ProjectObjective.find({ projectSlug: slug }).sort({ order: 1 }).lean();
  if (objectives.length === 0) throw new HttpError(404, "Projet introuvable ou sans objectif.");

  const progress = await ProjectProgress.findOne({ user: req.userId, projectSlug: slug }).lean();
  const completed = new Set((progress?.completedObjectives ?? []).map((c) => c.objectiveId));

  res.json({
    objectives: objectives.map((o) => {
      const deps = o.dependsOn ?? [];
      const depsMet = deps.every((d) => completed.has(d));
      const status = completed.has(o.id) ? "completed" : depsMet ? "available" : "locked";
      return { ...serializeObjective(o), status };
    }),
  });
}

/** POST /api/projects/:slug/objectives/:objectiveId/validate */
export async function validateProjectObjective(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug);
  const objectiveId = String(req.params.objectiveId);

  const session = await ProjectSession.findOne({
    user: req.userId,
    projectSlug: slug,
    status: { $in: ["starting", "running"] },
  }).lean();
  if (!session) throw new HttpError(409, "Démarre d'abord une session pour ce projet.");

  const objective = await ProjectObjective.findOne({ projectSlug: slug, id: objectiveId }).select("+validation").lean();
  if (!objective) throw new HttpError(404, "Objectif introuvable.");

  const project = await Project.findOne({ slug }).lean();
  if (!project) throw new HttpError(404, "Projet introuvable.");

  // Progression (créée à la volée).
  let progress = await ProjectProgress.findOne({ user: req.userId, projectSlug: slug });
  if (!progress) {
    progress = await ProjectProgress.create({ user: req.userId, projectSlug: slug, completedObjectives: [], totalPoints: 0 });
  }
  const completedIds = new Set(progress.completedObjectives.map((c) => c.objectiveId));

  // Idempotence : déjà validé → succès, jamais de re-crédit.
  if (completedIds.has(objectiveId)) {
    res.json({ ok: true, alreadyCompleted: true, points: 0 });
    return;
  }

  // Dépendances non satisfaites → 403 clair, pas de validation.
  const deps = objective.dependsOn ?? [];
  const missing = deps.filter((d) => !completedIds.has(d));
  if (missing.length > 0) {
    throw new HttpError(403, `Objectif verrouillé : termine d'abord ${missing.join(", ")}.`);
  }

  // Validation côté serveur.
  const containerIdByNode: Record<string, string> = {};
  for (const c of session.containerIds) containerIdByNode[c.nodeId] = c.dockerId;
  const result = await validateObjective(
    objective.validation.strategy,
    objective.validation.spec as Record<string, unknown>,
    { topology: project.topology, containerIdByNode, flagSuffix: session.flagSuffix },
    (req.body ?? {}).answer
  );

  if (!result.ok) {
    res.json({ ok: false, detail: result.detail });
    return;
  }

  // Attribution des points (une seule fois).
  progress.completedObjectives.push({
    objectiveId,
    kind: objective.kind,
    completedAt: new Date(),
    points: objective.points,
  });
  progress.totalPoints += objective.points;
  const total = await ProjectObjective.countDocuments({ projectSlug: slug });
  if (progress.completedObjectives.length >= total) progress.status = "completed";
  await progress.save();

  res.json({ ok: true, points: objective.points, detail: result.detail });
}
