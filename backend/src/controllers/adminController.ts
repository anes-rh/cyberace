import { Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../models/User";
import { SandboxSession } from "../models/SandboxSession";
import { ProjectSession } from "../models/ProjectSession";
import { ProjectProgress } from "../models/ProjectProgress";
import { Project } from "../models/Project";
import { AdminAuditLog } from "../models/AdminAuditLog";
import { stopSessionForUser } from "../services/dockerSandbox";
import { stopProjectSessionForUser } from "../services/dockerTopology";
import { computeLevel } from "../utils/scoring";
import { HttpError } from "../middleware/error";

/** Journalise une action admin. Toujours appelé AVANT de confirmer au client. */
async function audit(
  adminId: string | undefined,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>
): Promise<void> {
  await AdminAuditLog.create({ admin: adminId, action, targetType, targetId, details, at: new Date() });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** GET /api/admin/stats — chiffres du tableau de bord. */
export async function getStats(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalUsers, newUsersThisWeek, runningSandboxSessions, activeProjectSessions, solvedTodayAgg] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    SandboxSession.countDocuments({ status: "running" }),
    ProjectSession.countDocuments({ status: { $in: ["starting", "running"] }, expiresAt: { $gt: now } }),
    User.aggregate([
      { $unwind: "$solved" },
      { $match: { "solved.at": { $gte: startOfDay } } },
      { $count: "n" },
    ]),
  ]);

  res.json({
    totalUsers,
    newUsersThisWeek,
    runningSandboxSessions,
    activeProjectSessions,
    solvedToday: solvedTodayAgg[0]?.n ?? 0,
  });
}

/** GET /api/admin/users — liste paginée, recherche, tri. Jamais passwordHash. */
export async function listUsers(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const q = String(req.query.q ?? "").trim();
  const sortField = ["xp", "createdAt", "lastActive"].includes(String(req.query.sort)) ? String(req.query.sort) : "createdAt";
  const dir = String(req.query.order) === "asc" ? 1 : -1;

  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ username: rx }, { email: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter, "username email role xp createdAt lastActive")
      .sort({ [sortField]: dir })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({
    users: users.map((u) => ({
      id: String(u._id),
      username: u.username,
      email: u.email,
      role: u.role,
      xp: u.xp,
      level: computeLevel(u.xp).level,
      createdAt: u.createdAt,
      lastActive: u.lastActive,
    })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
}

/** GET /api/admin/users/:id — détail complet (profil + progression + sessions). */
export async function getUserDetail(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "Identifiant utilisateur invalide.");
  const user = await User.findById(id).lean();
  if (!user) throw new HttpError(404, "Utilisateur introuvable.");

  const [projectProgress, sandboxSessions, projectSessions, projects] = await Promise.all([
    ProjectProgress.find({ user: id }).lean(),
    SandboxSession.find({ user: id }).sort({ startedAt: -1 }).limit(10).lean(),
    ProjectSession.find({ user: id }).sort({ startedAt: -1 }).limit(10).lean(),
    Project.find({}, "slug title").lean(),
  ]);
  const titleBySlug = new Map(projects.map((p) => [p.slug, p.title]));
  const lvl = computeLevel(user.xp);

  const recentSessions = [
    ...sandboxSessions.map((s) => ({
      type: "module" as const,
      id: String(s._id),
      label: s.courseSlug,
      status: s.status,
      startedAt: s.startedAt,
      expiresAt: s.expiresAt,
    })),
    ...projectSessions.map((s) => ({
      type: "project" as const,
      id: String(s._id),
      label: titleBySlug.get(s.projectSlug) ?? s.projectSlug,
      status: s.status,
      startedAt: s.startedAt,
      expiresAt: s.expiresAt,
    })),
  ].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  res.json({
    user: {
      id: String(user._id),
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarSeed: user.avatarSeed,
      avatarUrl: user.avatarUrl ?? null,
      title: user.title,
      role: user.role,
      xp: user.xp,
      level: lvl,
      badges: user.badges,
      streak: user.streak,
      solvedCount: user.solved.length,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    },
    solved: user.solved
      .slice()
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    projectProgress: projectProgress.map((p) => ({
      projectSlug: p.projectSlug,
      projectTitle: titleBySlug.get(p.projectSlug) ?? p.projectSlug,
      status: p.status,
      totalPoints: p.totalPoints,
      completedObjectives: p.completedObjectives.length,
      solutionRevealed: p.solutionRevealed,
    })),
    recentSessions,
  });
}

/** PATCH /api/admin/users/:id/role — avec garde anti auto-verrouillage. Audité. */
export async function changeUserRole(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const newRole = (req.body ?? {}).role;
  if (newRole !== "user" && newRole !== "admin") throw new HttpError(400, "Rôle invalide (attendu \"user\" ou \"admin\").");
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "Identifiant utilisateur invalide.");

  const target = await User.findById(id).select("role username");
  if (!target) throw new HttpError(404, "Utilisateur introuvable.");

  // Garde 1 : un admin ne peut pas se retirer son propre rôle admin.
  if (String(req.userId) === String(id) && newRole !== "admin") {
    throw new HttpError(400, "Tu ne peux pas retirer ton propre rôle administrateur.");
  }
  // Garde 2 : ne pas rétrograder le DERNIER admin restant.
  if (target.role === "admin" && newRole !== "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) throw new HttpError(400, "Impossible de rétrograder le dernier administrateur restant.");
  }

  const previousRole = target.role;
  if (previousRole !== newRole) {
    target.role = newRole;
    await target.save();
    await audit(req.userId, "user.role_change", "user", String(id), {
      targetUsername: target.username,
      from: previousRole,
      to: newRole,
    });
  }

  res.json({ id: String(id), username: target.username, role: target.role });
}

/** DELETE /api/admin/users/:id/progress — reset (confirm:true requis). Audité. */
export async function resetUserProgress(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "Identifiant utilisateur invalide.");
  if ((req.body ?? {}).confirm !== true) throw new HttpError(400, "Confirmation requise (confirm: true) pour réinitialiser la progression.");

  const user = await User.findById(id).select("username xp solved badges streak");
  if (!user) throw new HttpError(404, "Utilisateur introuvable.");

  const before = { xp: user.xp, solvedCount: user.solved.length, badges: user.badges.length, streak: user.streak };
  user.xp = 0;
  user.solved = [] as never;
  user.badges = [];
  user.streak = 0;
  await user.save();

  await audit(req.userId, "user.progress_reset", "user", String(id), {
    targetUsername: user.username,
    before,
  });

  res.json({ ok: true, id: String(id), username: user.username });
}

/** GET /api/admin/sessions — vue UNIFIÉE (module + projet), triée par expiration. */
export async function listSessions(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const [sandbox, project, projects] = await Promise.all([
    SandboxSession.find({ status: { $in: ["starting", "running"] } })
      .populate<{ user: { username: string } }>("user", "username")
      .lean(),
    ProjectSession.find({ status: { $in: ["starting", "running"] }, expiresAt: { $gt: now } })
      .populate<{ user: { username: string } }>("user", "username")
      .lean(),
    Project.find({}, "slug title").lean(),
  ]);
  const titleBySlug = new Map(projects.map((p) => [p.slug, p.title]));

  const sessions = [
    ...sandbox.map((s) => ({
      type: "module" as const,
      id: String(s._id),
      user: { username: s.user?.username ?? "—" },
      label: s.courseSlug,
      startedAt: s.startedAt,
      expiresAt: s.expiresAt,
      status: s.status,
    })),
    ...project.map((s) => ({
      type: "project" as const,
      id: String(s._id),
      user: { username: s.user?.username ?? "—" },
      label: titleBySlug.get(s.projectSlug) ?? s.projectSlug,
      startedAt: s.startedAt,
      expiresAt: s.expiresAt,
      status: s.status,
    })),
  ].sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

  res.json({ sessions });
}

/** DELETE /api/admin/sessions/:type/:id — force-stop. Réutilise le teardown existant. Audité. */
export async function forceStopSession(req: Request, res: Response): Promise<void> {
  const type = String(req.params.type);
  const id = String(req.params.id);
  if (type !== "module" && type !== "project") throw new HttpError(400, "Type de session invalide (attendu \"module\" ou \"project\").");
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, "Identifiant de session invalide.");

  if (type === "module") {
    const session = await SandboxSession.findById(id).populate<{ user: { _id: Types.ObjectId; username: string } }>("user", "username");
    if (!session) throw new HttpError(404, "Session introuvable.");
    const ownerId = String((session.user as unknown as { _id: Types.ObjectId })?._id ?? session.user);
    const ownerUsername = (session.user as unknown as { username?: string })?.username ?? "—";
    // Réutilise le teardown Docker existant — ne PAS réimplémenter.
    await stopSessionForUser(ownerId);
    await audit(req.userId, "session.force_stop", "sandboxSession", String(id), {
      type, ownerUserId: ownerId, ownerUsername, label: session.courseSlug,
    });
  } else {
    const session = await ProjectSession.findById(id).populate<{ user: { _id: Types.ObjectId; username: string } }>("user", "username");
    if (!session) throw new HttpError(404, "Session introuvable.");
    const ownerId = String((session.user as unknown as { _id: Types.ObjectId })?._id ?? session.user);
    const ownerUsername = (session.user as unknown as { username?: string })?.username ?? "—";
    await stopProjectSessionForUser(ownerId);
    await audit(req.userId, "session.force_stop", "projectSession", String(id), {
      type, ownerUserId: ownerId, ownerUsername, label: session.projectSlug,
    });
  }

  res.json({ ok: true });
}

/** GET /api/admin/leaderboard — vue complète (modération), sans limite publique. */
export async function getFullLeaderboard(req: Request, res: Response): Promise<void> {
  const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 200));
  const users = await User.find({}, "username displayName avatarSeed avatarUrl xp role solved lastActive")
    .sort({ xp: -1, updatedAt: 1 })
    .limit(limit)
    .lean();

  res.json({
    leaderboard: users.map((u, i) => {
      const lvl = computeLevel(u.xp);
      return {
        rank: i + 1,
        id: String(u._id),
        username: u.username,
        displayName: u.displayName,
        avatarSeed: u.avatarSeed,
        avatarUrl: u.avatarUrl ?? null,
        xp: u.xp,
        level: lvl.level,
        title: lvl.title,
        role: u.role,
        solvedCount: u.solved?.length ?? 0,
        lastActive: u.lastActive,
      };
    }),
  });
}
