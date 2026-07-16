"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  X, Terminal, Play, Square, Clock, Loader2, AlertTriangle, Check, Flag, Lightbulb, ChevronDown,
} from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { ChallengePlayer } from "@/components/challenge/ChallengePlayer";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";
import { formatTime, cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { CourseDetail } from "@/lib/types";

type Session = { terminalUrl: string; expiresAt: string; status: string };

/**
 * Dedicated full-screen lab view: web terminal on the left, the course's
 * challenges (resolved inline, one open at a time) on the right. Reached from
 * the course page's "Démarrer le lab"; leaving it returns to the course page
 * without stopping the running containers.
 */
export default function LabPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { refresh } = useAuth();
  const [data, setData] = useState<CourseDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  // Sandbox session (start/stop/countdown) — mirrors SandboxPanel's logic.
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState<"start" | "stop" | null>(null);
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  const load = useCallback(() => {
    api.course(slug).then(setData).catch(() => setNotFound(true));
  }, [slug]);
  useEffect(() => { load(); }, [load]);

  // A lab page only exists for practical courses: bounce theory courses back.
  useEffect(() => {
    if (data && !data.course.sandbox) router.replace(`/courses/${slug}`);
  }, [data, slug, router]);

  // Restore an already-running session on mount (e.g. arriving from the course
  // page after "Démarrer le lab", or after a refresh).
  useEffect(() => {
    let cancelled = false;
    api.sandbox
      .status(slug)
      .then((res) => { if (!cancelled) { setSession(res.session); setNow(Date.now()); } })
      .catch(() => { /* not fatal: show the start prompt */ });
    return () => { cancelled = true; };
  }, [slug]);

  // Countdown: tick every second while a session runs; auto-clear when expired.
  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (new Date(session.expiresAt).getTime() - Date.now() <= 0) setSession(null);
    }, 1000);
    return () => clearInterval(id);
  }, [session]);

  const startLab = useCallback(async () => {
    setBusy("start");
    setSandboxError(null);
    try {
      const res = await api.sandbox.start(slug);
      setSession(res.session);
      setNow(Date.now());
    } catch (err) {
      setSandboxError(err instanceof ApiError ? err.message : "Impossible de démarrer le lab.");
    } finally {
      setBusy(null);
    }
  }, [slug]);

  const stopLab = useCallback(async () => {
    setBusy("stop");
    setSandboxError(null);
    try {
      await api.sandbox.stop(slug);
      setSession(null);
    } catch (err) {
      setSandboxError(err instanceof ApiError ? err.message : "Impossible d'arrêter le lab.");
    } finally {
      setBusy(null);
    }
  }, [slug]);

  // Refresh course progress + XP after a challenge is validated in the panel.
  const onSolved = useCallback(() => { load(); refresh(); }, [load, refresh]);

  if (notFound)
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Lab introuvable</h1>
        <Link href="/courses" className="mt-4 inline-block text-primary hover:underline">← Retour aux circuits</Link>
      </div>
    );
  if (!data) return <FullScreenLoader label="Chargement du lab…" />;
  // While the redirect effect fires for a theory course, avoid a flash of UI.
  if (!data.course.sandbox) return <FullScreenLoader label="Redirection…" />;

  const { course, challenges } = data;
  const accent = course.accent;
  const running = session?.status === "running" || session?.status === "starting";
  const remainingMs = session ? Math.max(0, new Date(session.expiresAt).getTime() - now) : 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-bg">
      {/* Minimal header: course identity + lab controls + exit. */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-surface/80 px-3 backdrop-blur sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
            style={{ background: `${accent}1a`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}55` }}
          >
            <Icon name={course.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold leading-tight text-fg">{course.codename}</p>
            <p className="truncate text-xs leading-tight text-muted">{course.title}</p>
          </div>
          {running && (
            <span
              className="ml-1 hidden items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs tnum sm:inline-flex"
              title="Temps restant avant l'arrêt automatique du lab"
            >
              <Clock className="h-3.5 w-3.5" style={{ color: accent }} />
              {formatTime(remainingMs)}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {running && (
            <Button variant="danger" size="sm" onClick={stopLab} disabled={busy !== null}>
              {busy === "stop" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
              <span className="hidden sm:inline">Arrêter</span>
            </Button>
          )}
          <Button variant="glass" size="sm" onClick={() => router.push(`/courses/${slug}`)}>
            <X className="h-4 w-4" /> Quitter<span className="hidden sm:inline">&nbsp;le lab</span>
          </Button>
        </div>
      </header>

      {/* Body: terminal (left) + challenges (right). Stacks on mobile. */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Terminal column */}
        <div className="flex min-h-0 shrink-0 flex-col border-b border-line lg:w-[60%] lg:shrink lg:border-b-0 lg:border-r">
          {running && session ? (
            <iframe
              src={session.terminalUrl}
              title="Terminal du lab CyberAce"
              className="h-[45vh] w-full grow bg-black lg:h-full"
            />
          ) : (
            <div className="grid grow place-items-center p-8 text-center">
              <div className="max-w-md">
                <div
                  className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
                  style={{ background: `${accent}1a`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}55` }}
                >
                  <Terminal className="h-7 w-7" />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold text-fg">Lab prêt à démarrer</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                  Un conteneur <span className="text-fg">attaquant</span> (tes outils) et une{" "}
                  <span className="text-fg">cible</span> isolée démarrent rien que pour toi. La cible est joignable au
                  nom d&apos;hôte <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-xs">target</code>.
                </p>
                {sandboxError && (
                  <div className="mx-auto mt-4 flex max-w-sm items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-3 text-left text-sm text-danger">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{sandboxError}</span>
                  </div>
                )}
                <Button onClick={startLab} disabled={busy !== null} className="mt-5" size="lg" style={{ background: accent }}>
                  {busy === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {busy === "start" ? "Démarrage des conteneurs…" : "Démarrer le lab"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Challenges column */}
        <aside className="min-h-0 flex-1 overflow-y-auto bg-surface/30 p-4 lg:w-[40%]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-fg">Les défis</h2>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Flag className="h-3.5 w-3.5" /> {challenges.length}
            </span>
          </div>
          <div className="space-y-3">
            {challenges.map((ch, i) => {
              const open = openId === ch.id;
              return (
                <div
                  key={ch.id}
                  className={cn(
                    "overflow-hidden rounded-xl border transition-colors",
                    ch.solved ? "border-success/40 bg-success/5" : "border-line bg-surface/50",
                    open && !ch.solved && "border-primary/40"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : ch.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                    aria-expanded={open}
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-sm font-bold",
                        ch.solved ? "bg-success/20 text-success" : "bg-surface-2 text-muted"
                      )}
                    >
                      {ch.solved ? <Check className="h-5 w-5" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-fg">{ch.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-faint">
                        <span className="tnum">{ch.points} pts</span>
                        {ch.hints.length > 0 && (
                          <span className="inline-flex items-center gap-0.5"><Lightbulb className="h-3 w-3" /> {ch.hints.length}</span>
                        )}
                      </div>
                    </div>
                    <DifficultyBadge difficulty={ch.difficulty} />
                    <ChevronDown className={cn("h-4 w-4 shrink-0 text-faint transition-transform", open && "rotate-180")} />
                  </button>
                  {open && (
                    <div className="border-t border-line p-4">
                      <ChallengePlayer key={ch.id} challenge={ch} nextHref={null} onSolved={onSolved} compact />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
