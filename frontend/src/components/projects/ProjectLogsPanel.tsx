"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollText } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Tail des logs d'un nœud, rafraîchi toutes les 4s (polling — pas de WebSocket,
 * cohérent avec le reste du projet). Sélecteur de nœud, affichage terminal.
 */
export function ProjectLogsPanel({
  slug,
  running,
  nodes,
}: {
  slug: string;
  running: boolean;
  nodes: string[];
}) {
  const [node, setNode] = useState<string>(nodes[0] ?? "waf");
  const [logs, setLogs] = useState<string>("");
  const boxRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!running) {
      setLogs("");
      return;
    }
    let cancelled = false;
    const fetchLogs = () => {
      api.projects
        .logs(slug, node)
        .then((res) => { if (!cancelled) setLogs(res.logs || "(aucune sortie)"); })
        .catch(() => { if (!cancelled) setLogs("(logs indisponibles)"); });
    };
    fetchLogs();
    const id = setInterval(fetchLogs, 4000);
    return () => { cancelled = true; clearInterval(id); };
  }, [slug, node, running]);

  // Auto-scroll vers le bas à chaque mise à jour.
  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface/60">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-fg">
          <ScrollText className="h-4 w-4 text-primary" /> Logs en direct
        </div>
        <select
          value={node}
          onChange={(e) => setNode(e.target.value)}
          disabled={!running}
          className="rounded-lg border border-line bg-surface-2 px-2 py-1 text-sm text-fg disabled:opacity-50"
          aria-label="Nœud à surveiller"
        >
          {nodes.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <pre
        ref={boxRef}
        className="h-64 overflow-auto whitespace-pre-wrap break-words bg-black/80 p-4 font-mono text-xs leading-relaxed text-emerald-200/90"
      >
        {running ? logs || "Chargement…" : "Démarre le projet pour voir les logs."}
      </pre>
    </div>
  );
}
