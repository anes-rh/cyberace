"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb, Clock } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Indices d'un objectif de projet, débloqués AU FIL DU TEMPS (un de plus toutes
 * les 10 min de session — pas de bouton « révéler », pas de coût). Poll toutes
 * les 15 s tant que l'objectif n'est ni verrouillé ni terminé.
 */
export function ProjectObjectiveHints({ slug, objectiveId }: { slug: string; objectiveId: string }) {
  const [hints, setHints] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [nextSec, setNextSec] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await api.projects.hints(slug, objectiveId);
        if (cancelled) return;
        setHints(r.hints);
        setTotal(r.totalHints);
        setNextSec(r.unlockedCount < r.totalHints ? r.nextUnlockInSec : null);
      } catch {
        /* pas de session / objectif : on n'affiche rien */
      }
    };
    poll();
    timer.current = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
    };
  }, [slug, objectiveId]);

  // Décompte visuel local entre deux polls.
  useEffect(() => {
    if (nextSec === null) return;
    const id = setInterval(() => setNextSec((s) => (s === null ? null : Math.max(0, s - 1))), 1000);
    return () => clearInterval(id);
  }, [nextSec === null]);

  if (total === 0) return null;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-400">
        <Lightbulb className="h-3.5 w-3.5" /> Indices ({hints.length}/{total})
        <span className="ml-1 font-normal text-faint">— un de plus toutes les 10 min</span>
      </p>
      {hints.length === 0 ? (
        <p className="text-xs text-muted">
          Aucun indice débloqué pour l&apos;instant.{" "}
          {nextSec !== null && (
            <span className="inline-flex items-center gap-1 text-faint">
              <Clock className="h-3 w-3" /> premier indice dans {fmt(nextSec)}
            </span>
          )}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {hints.map((h, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted">
              <span className="font-mono text-[11px] text-amber-400/70">{i + 1}.</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
      {hints.length > 0 && nextSec !== null && (
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-faint">
          <Clock className="h-3 w-3" /> prochain indice dans {fmt(nextSec)}
        </p>
      )}
    </div>
  );
}
