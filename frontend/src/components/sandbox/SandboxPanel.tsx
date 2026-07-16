"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Terminal, Play, Square, Clock, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { formatTime } from "@/lib/utils";
import type { CourseDetail } from "@/lib/types";

type Session = { terminalUrl: string; expiresAt: string; status: string };

/**
 * Practical-lab control panel: starts/stops the course's Docker sandbox and
 * embeds the web terminal. Renders nothing for theory courses (no sandbox).
 */
export function SandboxPanel({ course }: { course: CourseDetail["course"] }) {
  const router = useRouter();
  const labHref = `/courses/${course.slug}/lab`;
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState<"start" | "stop" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // `now` drives the countdown; it is only ever written from event/interval
  // callbacks (never synchronously in an effect body).
  const [now, setNow] = useState<number>(() => Date.now());

  // Restore an already-running session on mount (e.g. after a page refresh).
  useEffect(() => {
    let cancelled = false;
    api.sandbox
      .status(course.slug)
      .then((res) => { if (!cancelled) { setSession(res.session); setNow(Date.now()); } })
      .catch(() => { /* not fatal: just show the start button */ });
    return () => { cancelled = true; };
  }, [course.slug]);

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
    setError(null);
    try {
      const res = await api.sandbox.start(course.slug);
      setSession(res.session);
      setNow(Date.now());
      // The terminal + challenges now live on the dedicated lab view.
      router.push(labHref);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de démarrer le lab.");
      setBusy(null);
    }
  }, [course.slug, router, labHref]);

  const stopLab = useCallback(async () => {
    setBusy("stop");
    setError(null);
    try {
      await api.sandbox.stop(course.slug);
      setSession(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'arrêter le lab.");
    } finally {
      setBusy(null);
    }
  }, [course.slug]);

  if (!course.sandbox) return null;

  const accent = course.accent;
  const running = session?.status === "running" || session?.status === "starting";
  const remainingMs = session ? Math.max(0, new Date(session.expiresAt).getTime() - now) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface/60"
    >
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
            style={{ background: `${accent}1a`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}55` }}
          >
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-fg">Lab pratique</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Un conteneur <span className="text-fg">attaquant</span> (tes outils) et une{" "}
              <span className="text-fg">cible</span> isolée démarrent rien que pour toi. La cible est
              joignable au nom d&apos;hôte <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-xs">target</code>.
              Garde ce terminal ouvert et résous les tâches à droite.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {running && (
            <span
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm tnum"
              title="Temps restant avant l'arrêt automatique du lab"
            >
              <Clock className="h-4 w-4" style={{ color: accent }} />
              {formatTime(remainingMs)}
            </span>
          )}
          {running ? (
            <>
              <Button onClick={() => router.push(labHref)} style={{ background: accent }}>
                <ArrowRight className="h-4 w-4" /> Reprendre le lab
              </Button>
              <Button variant="danger" onClick={stopLab} disabled={busy !== null}>
                {busy === "stop" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
                Arrêter le lab
              </Button>
            </>
          ) : (
            <Button onClick={startLab} disabled={busy !== null} style={{ background: accent }}>
              {busy === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Démarrer le lab
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {busy === "start" && !session && (
        <div className="mx-6 mb-6 flex items-center gap-3 rounded-xl border border-line bg-surface-2/50 p-4 text-sm text-muted">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: accent }} />
          Démarrage des conteneurs… (quelques secondes)
        </div>
      )}

      {running && session && (
        <button
          type="button"
          onClick={() => router.push(labHref)}
          className="flex w-full items-center gap-3 border-t border-line bg-bg/40 p-4 text-left transition-colors hover:bg-bg/60"
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ background: `${accent}1a`, color: accent }}
          >
            <Terminal className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-fg">Lab en cours</span>
            <span className="block text-xs text-muted">
              Ton terminal et les défis t&apos;attendent dans la vue labo dédiée.
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium" style={{ color: accent }}>
            Reprendre <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      )}
    </motion.section>
  );
}
