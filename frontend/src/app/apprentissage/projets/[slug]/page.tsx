"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert, Trophy, AlertTriangle, CheckCircle2 } from "lucide-react";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { ProjectTopologyView } from "@/components/projects/ProjectTopologyView";
import { ProjectObjectivesChecklist } from "@/components/projects/ProjectObjectivesChecklist";
import { ProjectLogsPanel } from "@/components/projects/ProjectLogsPanel";
import { ProjectSessionControls } from "@/components/projects/ProjectSessionControls";
import { ProjectTerminalModal } from "@/components/projects/ProjectTerminalModal";
import { ProjectSolutionView } from "@/components/projects/ProjectSolutionView";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ProjectDetail, ProjectObjectiveView, ProjectSessionView } from "@/lib/projectTypes";

export default function ProjectDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [objectives, setObjectives] = useState<ProjectObjectiveView[]>([]);
  const [session, setSession] = useState<ProjectSessionView | null>(null);
  const [busy, setBusy] = useState<"start" | "stop" | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [terminal, setTerminal] = useState<{ nodeId: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const running = session?.status === "running" || session?.status === "starting";

  const loadObjectives = useCallback(() => {
    api.projects
      .objectives(slug)
      .then((r) => setObjectives(r.objectives.map((o) => ({ ...o, completed: o.status === "completed" }))))
      .catch(() => { /* liste vide tolérée */ });
  }, [slug]);

  const loadDetail = useCallback(() => {
    api.projects
      .detail(slug)
      .then((d) => setDetail(d))
      .catch((e) => { if (e instanceof ApiError && e.status === 404) setNotFound(true); });
  }, [slug]);

  // Chargement initial.
  useEffect(() => {
    loadDetail();
    if (user) {
      loadObjectives();
      api.projects.session(slug).then((r) => setSession(r.session)).catch(() => {});
    }
  }, [slug, user, loadDetail, loadObjectives]);

  // Polling session + objectifs toutes les 5s pendant que ça tourne.
  useEffect(() => {
    if (!running || !user) return;
    const id = setInterval(() => {
      api.projects.session(slug).then((r) => setSession(r.session)).catch(() => {});
      loadObjectives();
    }, 5000);
    return () => clearInterval(id);
  }, [running, user, slug, loadObjectives]);

  // Minuteur TTL.
  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (new Date(session.expiresAt).getTime() - Date.now() <= 0) setSession(null);
    }, 1000);
    return () => clearInterval(id);
  }, [session]);

  // Tant que le corrigé n'est pas disponible, on rafraîchit le détail : à
  // l'expiration, le reaper marque `solutionRevealed` côté serveur (≤ 30 s).
  useEffect(() => {
    if (!user || !detail) return;
    if (detail.progress?.status === "completed" || detail.progress?.solutionRevealed) return;
    const id = setInterval(loadDetail, 15000);
    return () => clearInterval(id);
  }, [user, detail, loadDetail]);

  const start = useCallback(async () => {
    setBusy("start");
    setError(null);
    try {
      const r = await api.projects.startSession(slug);
      setSession(r.session);
      setNow(Date.now());
      loadObjectives();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de démarrer le projet.");
    } finally {
      setBusy(null);
    }
  }, [slug, loadObjectives]);

  const stop = useCallback(async () => {
    setBusy("stop");
    setError(null);
    try {
      await api.projects.stopSession(slug);
      setSession(null);
      setTerminal(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible d'arrêter le projet.");
    } finally {
      setBusy(null);
    }
  }, [slug]);

  const openTerminal = useCallback(
    (nodeId: string) => {
      const url = session?.terminalUrls.find((t) => t.nodeId === nodeId)?.url;
      if (url) setTerminal({ nodeId, url });
    },
    [session]
  );

  if (notFound)
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Projet introuvable</h1>
        <Link href="/apprentissage/projets" className="mt-4 inline-block text-primary hover:underline">← Retour aux projets</Link>
      </div>
    );
  if (!detail) return <FullScreenLoader label="Chargement du projet…" />;

  const { project, progress } = detail;
  const totalPoints = objectives.reduce((n, o) => n + o.points, 0);
  const nodeIds = project.topology.nodes.map((n) => n.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link href="/apprentissage/projets" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Retour aux projets
      </Link>

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-line bg-surface/60 p-6"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-25 blur-3xl bg-[#D96BA0]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#D96BA0]/10 text-[#D96BA0]" style={{ boxShadow: "inset 0 0 0 1px #D96BA055" }}>
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{project.title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted">{project.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <DifficultyBadge difficulty={project.difficulty} />
                <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                  <Trophy className="h-4 w-4 text-warning" />
                  {progress?.totalPoints ?? 0} / {totalPoints} pts
                </span>
                {progress?.status === "completed" && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Terminé</span>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {user ? (
              <ProjectSessionControls session={session} busy={busy} now={now} onStart={start} onStop={stop} />
            ) : (
              <Link href="/login" className="text-sm text-primary hover:underline">Connecte-toi pour démarrer →</Link>
            )}
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      {/* Dashboard : topologie (grande, en premier) + objectifs, puis logs. */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-6">
          <ProjectTopologyView
            topology={project.topology}
            objectives={objectives}
            terminalUrls={session?.terminalUrls ?? []}
            onOpenTerminal={openTerminal}
          />
          <ProjectLogsPanel slug={slug} running={running} nodes={nodeIds} />
        </div>
        <div className="min-w-0">
          <h3 className="mb-3 font-display text-lg font-semibold">Objectifs</h3>
          <ProjectObjectivesChecklist slug={slug} objectives={objectives} running={running} onValidated={() => { loadObjectives(); loadDetail(); }} />
        </div>
      </div>

      {/* Corrigé auto-révélé (terminé OU temps écoulé). */}
      <ProjectSolutionView
        slug={slug}
        objectives={objectives}
        available={progress?.status === "completed" || progress?.solutionRevealed === true}
      />

      {terminal && <ProjectTerminalModal nodeId={terminal.nodeId} url={terminal.url} onClose={() => setTerminal(null)} />}
    </div>
  );
}
