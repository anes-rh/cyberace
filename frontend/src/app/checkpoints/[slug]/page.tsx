"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Trophy, Flag, Layers, ChevronRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Progress } from "@/components/ui/Progress";
import { CourseCard } from "@/components/CourseCard";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { buttonVariants } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { pct } from "@/lib/utils";
import type { CheckpointDetail, CheckpointSummary } from "@/lib/types";
import type { ProjectSummary } from "@/lib/projectTypes";

const PROJECT_STATUS: Record<ProjectSummary["status"], { text: string; cls: string }> = {
  not_started: { text: "À commencer", cls: "text-muted" },
  in_progress: { text: "En cours", cls: "text-amber-400" },
  completed: { text: "Terminé", cls: "text-emerald-400" },
};

/** Carte d'un projet, présenté comme un module du checkpoint « Projets ». */
function ProjectModuleCard({ p, accent, index }: { p: ProjectSummary; accent: string; index: number }) {
  const st = PROJECT_STATUS[p.status];
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + index * 0.06 }}>
      <Link
        href={`/apprentissage/projets/${p.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface/70 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 soft-shadow"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-40" style={{ background: accent }} />
        <div className="relative flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: `${accent}1f`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}55` }}>
            <ShieldAlert className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={p.difficulty} />
              <span className={`inline-flex items-center gap-1 text-xs ${st.cls}`}>
                {p.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5" />}{st.text}
              </span>
            </div>
            <h3 className="mt-1.5 font-display text-lg font-semibold text-fg">{p.title}</h3>
          </div>
        </div>
        <p className="relative mt-3 flex-1 text-sm text-muted">{p.description}</p>
        <div className="relative mt-5 flex items-center gap-4 text-xs text-faint">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ~{p.estimatedMinutes} min</span>
          {p.totalPoints > 0 && <span className="inline-flex items-center gap-1.5 text-warning"><Trophy className="h-3.5 w-3.5" /> {p.totalPoints} pts</span>}
        </div>
        <span className="absolute right-5 top-6 text-faint transition-transform group-hover:translate-x-1"><ChevronRight className="h-5 w-5" /></span>
      </Link>
    </motion.div>
  );
}

/** Card for a mini-checkpoint (sub-route). Mirrors the main roadmap station style. */
function MiniCheckpointCard({ cp, index }: { cp: CheckpointSummary; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + index * 0.06 }}>
      <Link
        href={`/checkpoints/${cp.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface/70 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 soft-shadow"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-40" style={{ background: cp.accent }} />
        <div className="relative flex items-start gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
            style={{ background: `${cp.accent}1f`, color: cp.accent, boxShadow: `inset 0 0 0 1px ${cp.accent}55` }}
          >
            <Icon name={cp.icon} className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: cp.accent }}>{cp.tagline}</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-fg">{cp.title}</h3>
          </div>
        </div>
        <p className="relative mt-3 flex-1 text-sm text-muted">{cp.description}</p>
        <div className="relative mt-5">
          {cp.challengeCount > 0 ? (
            <>
              <div className="mb-1.5 flex justify-between text-xs text-faint">
                <span className="tnum">{cp.solvedCount}/{cp.challengeCount} défis</span>
                <span className="tnum">{pct(cp.progress)}</span>
              </div>
              <Progress value={cp.progress} color={cp.accent} height={8} />
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs text-faint">
              <Clock className="h-3.5 w-3.5" /> Bientôt · 0 module
            </span>
          )}
        </div>
        <span className="absolute right-5 top-6 text-faint transition-transform group-hover:translate-x-1">
          <ChevronRight className="h-5 w-5" />
        </span>
      </Link>
    </motion.div>
  );
}

export default function CheckpointPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<CheckpointDetail | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    api.checkpoint(slug).then(setData).catch(() => setNotFound(true));
    // Les projets sont une collection distincte des cours : on récupère ceux
    // rattachés à CE checkpoint pour les afficher comme ses modules.
    api.projects
      .list()
      .then((r) => setProjects(r.projects.filter((p) => p.checkpoint === slug)))
      .catch(() => setProjects([]));
  }, [slug]);

  useEffect(() => { load(); }, [load, user]);

  if (notFound)
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Checkpoint introuvable</h1>
        <Link href="/apprentissage" className="mt-4 inline-block text-primary hover:underline">← La route d&apos;apprentissage</Link>
      </div>
    );
  if (!data) return <FullScreenLoader label="Chargement du checkpoint…" />;

  const { checkpoint: cp, courses, progress } = data;
  const children = data.children ?? [];
  const hasChildren = children.length > 0;
  const hasCourses = courses.length > 0;
  const hasProjects = projects.length > 0;
  const showProgress = progress.total > 0;

  // Back link: a mini-checkpoint returns to its parent; a top-level one to the roadmap.
  const backHref = cp.parent ? `/checkpoints/${cp.parent}` : "/apprentissage";
  const backLabel = cp.parent ? "Retour" : "La route d'apprentissage";

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link href={backHref} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-line bg-surface/80 p-8 soft-shadow"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: cp.accent }} />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl" style={{ background: `${cp.accent}1f`, color: cp.accent, boxShadow: `inset 0 0 0 1px ${cp.accent}55` }}>
              <Icon name={cp.icon} className="h-8 w-8" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: cp.accent }}>
                {cp.parent ? "Mini-checkpoint" : `Checkpoint ${cp.order}`}
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold">{cp.title}</h1>
              <p className="mt-1 max-w-xl text-sm text-muted">{cp.description}</p>
            </div>
          </div>
          {showProgress && (
            <div className="w-full md:w-56">
              <div className="mb-1.5 flex justify-between text-xs text-faint">
                <span className="tnum">{progress.solvedCount}/{progress.total} défis</span>
                <span className="tnum">{pct(progress.ratio)}</span>
              </div>
              <Progress value={progress.ratio} color={cp.accent} height={10} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      {hasChildren ? (
        <>
          <div className="mt-10 mb-5 flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Mini-checkpoints ({children.length})</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {children.map((c, i) => (
              <MiniCheckpointCard key={c.slug} cp={c} index={i} />
            ))}
          </div>
        </>
      ) : hasProjects ? (
        <>
          <div className="mt-10 mb-5 flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Modules ({projects.length})</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map((p, i) => (
              <ProjectModuleCard key={p.slug} p={p} accent={cp.accent} index={i} />
            ))}
          </div>
        </>
      ) : hasCourses ? (
        <>
          <div className="mt-10 mb-5 flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Modules ({courses.length})</h2>
            <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted">
              <Flag className="h-4 w-4" /> {courses.reduce((a, c) => a + c.challengeCount, 0)} défis
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => (
              <CourseCard key={c.slug} course={c} index={i} />
            ))}
          </div>
        </>
      ) : (
        /* Empty state — a mini-checkpoint (or top-level) with no content yet. */
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-10 flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-line bg-surface/50 px-6 py-20 text-center"
        >
          <div className="grid h-16 w-16 place-items-center rounded-full" style={{ background: `${cp.accent}18`, color: cp.accent }}>
            <Clock className="h-8 w-8" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold">Aucun module pour l&apos;instant</h2>
          <p className="mt-2 max-w-md text-muted">
            {cp.parent
              ? "Les modules de ce mini-checkpoint arrivent bientôt. Reviens vite — le contenu est en préparation."
              : "Le contenu de ce checkpoint arrive dans une prochaine étape."}
          </p>
          {cp.parent && (
            <Link href={`/checkpoints/${cp.parent}`} className={buttonVariants({ variant: "glass", size: "md" }) + " mt-6"}>
              <ArrowLeft className="h-4 w-4" /> Retour aux mini-checkpoints
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
}
