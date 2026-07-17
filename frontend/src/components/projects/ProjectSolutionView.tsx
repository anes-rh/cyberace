"use client";

import { useState } from "react";
import { BookOpen, Loader2, ChevronRight, Terminal, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import type { ProjectObjectiveView, ProjectSolution } from "@/lib/projectTypes";

/**
 * Corrigé détaillé du projet, débloqué une fois le projet terminé OU le temps
 * écoulé. Le bouton n'apparaît que si le corrigé est disponible ; le contenu est
 * chargé à la demande (l'endpoint renvoie 403 tant qu'il n'est pas débloqué).
 */
export function ProjectSolutionView({
  slug,
  objectives,
  available,
}: {
  slug: string;
  objectives: ProjectObjectiveView[];
  available: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [solution, setSolution] = useState<ProjectSolution | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!available) return null;

  const titleOf = (objectiveId: string) =>
    objectives.find((o) => o.id === objectiveId)?.title ?? objectiveId;

  const reveal = async () => {
    if (solution) {
      setOpen((o) => !o);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await api.projects.solution(slug);
      setSolution(r.solution);
      setOpen(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Corrigé indisponible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-secondary/30 bg-secondary/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-secondary" />
          <div>
            <h3 className="font-display font-semibold text-fg">Solution détaillée</h3>
            <p className="text-xs text-muted">Le corrigé pas à pas de toute la chaîne, débloqué pour toi.</p>
          </div>
        </div>
        <Button variant="glass" onClick={reveal} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
          {open ? "Masquer" : "Voir la solution détaillée"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {open && solution && (
        <div className="mt-5 space-y-5">
          <p className="rounded-xl border border-line bg-surface/60 p-4 text-sm text-muted">{solution.summary}</p>
          <ol className="space-y-4">
            {solution.steps.map((step, i) => (
              <li key={step.objectiveId} className="rounded-xl border border-line bg-surface/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary/15 font-mono text-xs text-secondary">
                    {i + 1}
                  </span>
                  <h4 className="font-semibold text-fg">{titleOf(step.objectiveId)}</h4>
                </div>
                <p className="flex gap-1.5 text-sm text-muted">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
                  {step.explanation}
                </p>
                {step.commands.length > 0 && (
                  <div className="mt-3 overflow-x-auto rounded-lg border border-line bg-void/40 p-3">
                    <p className="mb-1 flex items-center gap-1.5 text-[11px] text-faint">
                      <Terminal className="h-3 w-3" /> commandes
                    </p>
                    <pre className="whitespace-pre font-mono text-xs text-fg">{step.commands.join("\n")}</pre>
                  </div>
                )}
                {step.expectedLogs && (
                  <p className="mt-2 flex gap-1.5 text-xs text-faint">
                    <ScrollText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {step.expectedLogs}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
