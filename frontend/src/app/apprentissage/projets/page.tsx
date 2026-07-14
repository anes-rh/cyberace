"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldAlert, Clock, ArrowRight, Trophy, CheckCircle2 } from "lucide-react";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ProjectSummary } from "@/lib/projectTypes";

const STATUS_LABEL: Record<ProjectSummary["status"], { text: string; cls: string }> = {
  not_started: { text: "À commencer", cls: "text-muted" },
  in_progress: { text: "En cours", cls: "text-amber-400" },
  completed: { text: "Terminé", cls: "text-emerald-400" },
};

export default function ProjectsListPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);

  useEffect(() => {
    api.projects.list().then((r) => setProjects(r.projects)).catch(() => setProjects([]));
  }, [user]);

  if (!projects) return <FullScreenLoader label="Chargement des projets…" />;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#D96BA0]/10 text-[#D96BA0]" style={{ boxShadow: "inset 0 0 0 1px #D96BA055" }}>
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#D96BA0]">Cybersécurité — Projets</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Scénarios complets</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Tu construis ET tu attaques ta propre architecture : DMZ, firewall, WAF. Défense et attaque, dans le même scénario.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="mt-12 text-center text-muted">Aucun projet disponible pour le moment.</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {projects.map((p) => {
            const st = STATUS_LABEL[p.status];
            return (
              <Link
                key={p.slug}
                href={`/apprentissage/projets/${p.slug}`}
                className="group flex flex-col rounded-3xl border border-line bg-surface/60 p-6 transition-colors hover:border-[#D96BA0]/50"
              >
                <div className="flex items-center justify-between">
                  <DifficultyBadge difficulty={p.difficulty} />
                  <span className={`inline-flex items-center gap-1 text-xs ${st.cls}`}>
                    {p.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {st.text}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-xl font-bold text-fg">{p.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">{p.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-faint">
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ~{p.estimatedMinutes} min</span>
                  {p.totalPoints > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-warning"><Trophy className="h-3.5 w-3.5" /> {p.totalPoints} pts</span>
                  )}
                  <span className="inline-flex items-center gap-1 font-medium text-[#D96BA0] group-hover:gap-2 transition-all">
                    Ouvrir <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
