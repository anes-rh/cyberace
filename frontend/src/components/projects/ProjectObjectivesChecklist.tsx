"use client";

import { useState } from "react";
import { Check, Lock, ShieldCheck, Swords, FileSearch, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProjectObjectiveHints } from "@/components/projects/ProjectObjectiveHints";
import { api, ApiError } from "@/lib/api";
import type { ProjectObjectiveView, ObjectiveKind } from "@/lib/projectTypes";

const KIND_ICON: Record<ObjectiveKind, typeof ShieldCheck> = {
  defense: ShieldCheck,
  attack: Swords,
  analysis: FileSearch,
};
const KIND_LABEL: Record<ObjectiveKind, string> = {
  defense: "Défense",
  attack: "Attaque",
  analysis: "Analyse",
};

function ObjectiveCard({
  obj,
  slug,
  running,
  onValidated,
}: {
  obj: ProjectObjectiveView;
  slug: string;
  running: boolean;
  onValidated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [flag, setFlag] = useState("");
  const [qa, setQa] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const status = obj.status ?? (obj.completed ? "completed" : "available");
  const KindIcon = KIND_ICON[obj.kind];
  const locked = status === "locked";
  const done = status === "completed";

  const submit = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      // Objectifs à champs multiples (ex. cred_check → username/password, ou une
      // question calculée) : on envoie l'objet `qa`. Sinon, saisie unique = flag.
      const hasFields = (obj.questions ?? []).length > 0;
      const answer: unknown = hasFields ? qa : { flag };
      const res = await api.projects.validate(slug, obj.id, answer);
      if (res.ok) {
        setFeedback({ ok: true, msg: res.alreadyCompleted ? "Déjà validé." : `Validé ! +${res.points ?? 0} pts` });
        onValidated();
      } else {
        setFeedback({ ok: false, msg: res.detail || "Pas encore — réessaie." });
      }
    } catch (err) {
      setFeedback({ ok: false, msg: err instanceof ApiError ? err.message : "Erreur de validation." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        done ? "border-emerald-500/40 bg-emerald-500/5" : locked ? "border-line bg-surface/40 opacity-70" : "border-line bg-surface/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
            done ? "bg-emerald-500/15 text-emerald-400" : locked ? "bg-surface-2 text-faint" : "bg-primary/10 text-primary"
          }`}
        >
          {done ? <Check className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : <KindIcon className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
              {KIND_LABEL[obj.kind]}
            </span>
            <span className="text-xs text-faint tnum">{obj.points} pts</span>
          </div>
          <h4 className="mt-1 font-semibold text-fg">{obj.title}</h4>
          <p className="mt-1 text-sm text-muted">{obj.description}</p>

          {running && !done && !locked && <ProjectObjectiveHints slug={slug} objectiveId={obj.id} />}

          {locked && (
            <p className="mt-2 text-xs text-faint">🔒 Termine d&apos;abord : {obj.dependsOn.join(", ")}</p>
          )}

          {!done && !locked && running && (
            <div className="mt-3 space-y-2">
              {(obj.questions ?? []).length > 0
                ? (obj.questions ?? []).map((q) => (
                    <div key={q.id}>
                      <label className="text-xs text-muted">{q.prompt}</label>
                      <input
                        value={qa[q.id] ?? ""}
                        onChange={(e) => setQa((s) => ({ ...s, [q.id]: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-sm text-fg"
                      />
                    </div>
                  ))
                : (
                  <input
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="Réponse / flag…"
                    className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-sm text-fg placeholder:text-faint"
                  />
                )}
              <Button onClick={submit} disabled={busy} className="w-full sm:w-auto">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Valider
              </Button>
            </div>
          )}

          {!running && !done && !locked && (
            <p className="mt-2 text-xs text-faint">Démarre le projet pour valider cet objectif.</p>
          )}

          {feedback && (
            <p className={`mt-2 flex items-center gap-1.5 text-sm ${feedback.ok ? "text-emerald-400" : "text-danger"}`}>
              {feedback.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {feedback.msg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Liste des objectifs avec statut verrouillé/disponible/validé et validation. */
export function ProjectObjectivesChecklist({
  slug,
  objectives,
  running,
  onValidated,
}: {
  slug: string;
  objectives: ProjectObjectiveView[];
  running: boolean;
  onValidated: () => void;
}) {
  return (
    <div className="space-y-3">
      {objectives.map((o) => (
        <ObjectiveCard key={o.id} obj={o} slug={slug} running={running} onValidated={onValidated} />
      ))}
    </div>
  );
}
