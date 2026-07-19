"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, ShieldCheck, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { AdminUsersPage, AdminUserRow } from "@/lib/adminTypes";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminUsersPageView() {
  const { user: me, refresh } = useAuth();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminUsersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.admin
      .users({ page, limit: 20, q, sort, order: "desc" })
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, [page, q, sort]);

  useEffect(() => { load(); }, [load]);

  async function onRoleChange(u: AdminUserRow, role: "user" | "admin") {
    if (role === u.role) return;
    if (!window.confirm(`Changer le rôle de « ${u.username} » de « ${u.role} » vers « ${role} » ?`)) return;
    try {
      await api.admin.setRole(u.id, role);
      // Si l'admin a modifié son propre rôle, rafraîchir le profil (nav, garde).
      if (me && me.id === u.id) await refresh();
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Échec du changement de rôle.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <Input
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            placeholder="Rechercher par pseudo ou email…"
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => { setPage(1); setSort(e.target.value); }}
          className="h-11 rounded-lg border border-line bg-surface/70 px-3 text-sm text-fg focus:border-primary/60 focus:outline-none"
        >
          <option value="createdAt">Tri : inscription</option>
          <option value="xp">Tri : XP</option>
          <option value="lastActive">Tri : dernière activité</option>
        </select>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line/60 text-left text-xs uppercase tracking-wide text-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium text-right">XP</th>
                <th className="px-4 py-3 font-medium">Inscription</th>
                <th className="px-4 py-3 font-medium">Dernière activité</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center"><Spinner className="h-6 w-6" /></td></tr>
              ) : data && data.users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">Aucun utilisateur.</td></tr>
              ) : (
                data?.users.map((u) => (
                  <tr key={u.id} className="border-b border-line/40 last:border-0 hover:bg-surface-2/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="font-medium text-fg hover:text-primary">
                        {u.username}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => onRoleChange(u, e.target.value as "user" | "admin")}
                        className={`rounded-md border border-line bg-surface/70 px-2 py-1 text-xs focus:border-primary/60 focus:outline-none ${u.role === "admin" ? "text-primary" : "text-muted"}`}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right tnum text-fg">{u.xp}</td>
                    <td className="px-4 py-3 text-muted">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-muted">{fmtDate(u.lastActive)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/users/${u.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        Détail <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> {data.total} utilisateur(s)</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <span className="tnum">Page {data.page} / {data.pages}</span>
            <Button variant="ghost" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
