"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Square, RefreshCw, Server, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";
import type { AdminSession } from "@/lib/adminTypes";

function remaining(expiresAt: string, now: number): string {
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return "expiré";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (m >= 60) return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`;
  return `${m}m${String(s).padStart(2, "0")}s`;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [stopping, setStopping] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(() => {
    api.admin
      .sessions()
      .then((d) => { setSessions(d.sessions); setError(null); })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erreur de chargement."));
  }, []);

  useEffect(() => {
    load();
    // Poll toutes les 10 s (vue temps réel des labs Docker).
    const poll = setInterval(load, 10_000);
    // Ticker 1 s pour le compte à rebours.
    timer.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(poll); if (timer.current) clearInterval(timer.current); };
  }, [load]);

  async function stop(s: AdminSession) {
    if (!window.confirm(`Arrêter la session ${s.type === "project" ? "projet" : "module"} « ${s.label} » de ${s.user.username} ? Le conteneur Docker sera détruit.`)) return;
    setStopping(`${s.type}-${s.id}`);
    try {
      await api.admin.stopSession(s.type, s.id);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Échec de l'arrêt.");
    } finally {
      setStopping(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-sm text-muted">
          <Server className="h-4 w-4" /> {sessions?.length ?? 0} session(s) active(s) · actualisation auto (10 s)
        </p>
        <Button variant="ghost" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /> Actualiser</Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line/60 text-left text-xs uppercase tracking-wide text-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Lab</th>
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Expire dans</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sessions === null ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center"><Spinner className="h-6 w-6" /></td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">Aucune session active.</td></tr>
              ) : (
                sessions.map((s) => (
                  <tr key={`${s.type}-${s.id}`} className="border-b border-line/40 last:border-0 hover:bg-surface-2/50">
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${s.type === "project" ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary"}`}>
                        {s.type === "project" ? "projet" : "module"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-fg">{s.label}</td>
                    <td className="px-4 py-3 text-muted">{s.user.username}</td>
                    <td className="px-4 py-3 text-muted">{s.status}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 tnum text-muted"><Clock className="h-3.5 w-3.5" /> {remaining(s.expiresAt, now)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="danger" size="sm" onClick={() => stop(s)} disabled={stopping === `${s.type}-${s.id}`}>
                        {stopping === `${s.type}-${s.id}` ? <Spinner className="h-4 w-4" /> : <Square className="h-3.5 w-3.5" />} Arrêter
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
