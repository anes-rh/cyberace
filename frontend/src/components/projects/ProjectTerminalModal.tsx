"use client";

import { useEffect } from "react";
import { X, TerminalSquare } from "lucide-react";

/**
 * Terminal web d'un nœud, en modal (secondaire au dashboard de topologie).
 * Ouvert à la demande depuis un nœud `terminal:true` de la topologie.
 */
export function ProjectTerminalModal({
  nodeId,
  url,
  onClose,
}: {
  nodeId: string;
  url: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-[78vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-fg">
            <TerminalSquare className="h-4 w-4 text-primary" />
            Terminal — <span className="font-mono">{nodeId}</span>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
            aria-label="Fermer le terminal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <iframe src={url} title={`Terminal ${nodeId}`} className="h-full w-full flex-1 bg-black" />
      </div>
    </div>
  );
}
