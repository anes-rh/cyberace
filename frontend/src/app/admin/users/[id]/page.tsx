"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Trash2, Trophy, Boxes, Server, AlertTriangle, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";
import type { AdminUserDetail } from "@/lib/adminTypes";

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.admin
      .user(id)
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erreur de chargement."));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function doReset() {
    if (!data || confirmText !== data.user.username) return;
    setBusy(true);
    try {
      await api.admin.resetProgress(id);
      setShowReset(false);
      setConfirmText("");
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Échec de la réinitialisation.");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!data) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>;

  const u = data.user;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Retour à la liste
      </Link>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar seed={u.avatarSeed} name={u.displayName} url={u.avatarUrl} size={56} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-fg">{u.displayName}</h2>
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${u.role === "admin" ? "bg-primary/15 text-primary" : "bg-surface-2 text-muted"}`}>
                {u.role}
              </span>
            </div>
            <p className="text-sm text-muted">@{u.username} · {u.email}</p>
            <p className="text-xs text-faint">Inscrit le {fmt(u.createdAt)} · Vu {fmt(u.lastActive)}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="font-display text-lg font-bold text-fg tnum">{u.xp}</div><div className="text-xs text-faint">XP · Nv.{u.level.level}</div></div>
          <div><div className="font-display text-lg font-bold text-fg tnum">{u.solvedCount}</div><div className="text-xs text-faint">résolus</div></div>
          <div><div className="font-display text-lg font-bold text-fg tnum">{u.streak}</div><div className="text-xs text-faint">série</div></div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3 flex items-center gap-2"><Boxes className="h-4 w-4 text-primary" /> Progression projets</CardTitle>
          {data.projectProgress.length === 0 ? (
            <p className="text-sm text-muted">Aucun projet entamé.</p>
          ) : (
            <ul className="space-y-2">
              {data.projectProgress.map((p) => (
                <li key={p.projectSlug} className="flex items-center justify-between rounded-lg bg-surface-2/40 px-3 py-2 text-sm">
                  <span className="text-fg">{p.projectTitle}</span>
                  <span className="text-xs text-muted">{p.completedObjectives} obj · {p.totalPoints} pts · {p.status === "completed" ? "terminé" : "en cours"}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-3 flex items-center gap-2"><Server className="h-4 w-4 text-primary" /> Sessions récentes</CardTitle>
          {data.recentSessions.length === 0 ? (
            <p className="text-sm text-muted">Aucune session récente.</p>
          ) : (
            <ul className="space-y-2">
              {data.recentSessions.slice(0, 8).map((s) => (
                <li key={`${s.type}-${s.id}`} className="flex items-center justify-between rounded-lg bg-surface-2/40 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${s.type === "project" ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary"}`}>{s.type === "project" ? "projet" : "module"}</span>
                    <span className="text-fg">{s.label}</span>
                  </span>
                  <span className="text-xs text-faint">{s.status} · {fmt(s.startedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle className="mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Défis résolus récents</CardTitle>
        {data.solved.length === 0 ? (
          <p className="text-sm text-muted">Aucun défi résolu.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.solved.slice(0, 24).map((s, i) => (
              <span key={i} className="rounded-md bg-surface-2/50 px-2 py-1 text-xs text-muted">
                {s.challengeId} <span className="text-primary tnum">+{s.points}</span>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Zone dangereuse */}
      <Card className="border border-danger/30">
        <CardTitle className="mb-1 flex items-center gap-2 text-danger"><AlertTriangle className="h-4 w-4" /> Zone dangereuse</CardTitle>
        <p className="mb-3 text-sm text-muted">
          Réinitialise la progression (XP, défis résolus, badges, série) — le compte est conservé. Action journalisée et irréversible.
        </p>
        <Button variant="danger" size="sm" onClick={() => setShowReset(true)}>
          <Trash2 className="h-4 w-4" /> Réinitialiser la progression
        </Button>
      </Card>

      {showReset && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-void/70 p-4 backdrop-blur-sm" onClick={() => !busy && setShowReset(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-danger"><AlertTriangle className="h-5 w-5" /> Confirmer la réinitialisation</CardTitle>
              <button onClick={() => !busy && setShowReset(false)} className="text-faint hover:text-fg"><X className="h-4 w-4" /></button>
            </div>
            <p className="mb-4 text-sm text-muted">
              Cette action remet à zéro la progression de <span className="font-semibold text-fg">{u.username}</span>. Pour confirmer, retape son pseudo ci-dessous.
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={u.username}
              autoFocus
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowReset(false)} disabled={busy}>Annuler</Button>
              <Button variant="danger" size="sm" onClick={doReset} disabled={busy || confirmText !== u.username}>
                {busy ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />} Réinitialiser
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
