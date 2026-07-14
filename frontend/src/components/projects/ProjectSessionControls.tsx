"use client";

import { Play, Square, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/utils";
import type { ProjectSessionView } from "@/lib/projectTypes";

/**
 * Contrôles de session : démarrer/arrêter + minuteur TTL restant. Le
 * provisioning de 5 conteneurs peut prendre 15-30s (état de chargement).
 */
export function ProjectSessionControls({
  session,
  busy,
  now,
  onStart,
  onStop,
}: {
  session: ProjectSessionView | null;
  busy: "start" | "stop" | null;
  now: number;
  onStart: () => void;
  onStop: () => void;
}) {
  const running = session?.status === "running" || session?.status === "starting";
  const remainingMs = session ? Math.max(0, new Date(session.expiresAt).getTime() - now) : 0;

  return (
    <div className="flex items-center gap-3">
      {running && (
        <span
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm tnum"
          title="Temps restant avant l'arrêt automatique du projet"
        >
          <Clock className="h-4 w-4 text-primary" />
          {formatTime(remainingMs)}
        </span>
      )}
      {running ? (
        <Button variant="danger" onClick={onStop} disabled={busy !== null}>
          {busy === "stop" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
          Arrêter le projet
        </Button>
      ) : (
        <Button onClick={onStart} disabled={busy !== null}>
          {busy === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {busy === "start" ? "Démarrage… (15-30s)" : "Démarrer le projet"}
        </Button>
      )}
    </div>
  );
}
