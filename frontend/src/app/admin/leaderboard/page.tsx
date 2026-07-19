"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";
import type { AdminLeaderboardEntry } from "@/lib/adminTypes";

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<AdminLeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin
      .leaderboard(500)
      .then((d) => setEntries(d.leaderboard))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erreur de chargement."));
  }, []);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!entries) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line/60 text-left text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium text-right">XP</th>
              <th className="px-4 py-3 font-medium text-right">Nv.</th>
              <th className="px-4 py-3 font-medium text-right">Résolus</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-line/40 last:border-0 hover:bg-surface-2/50">
                <td className="px-4 py-3 tnum text-faint">{e.rank}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${e.id}`} className="flex items-center gap-2 font-medium text-fg hover:text-primary">
                    <Avatar seed={e.avatarSeed} name={e.displayName} url={e.avatarUrl} size={28} />
                    <span>{e.displayName}</span>
                    <span className="text-xs text-faint">@{e.username}</span>
                    {e.role === "admin" && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">admin</span>}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{e.title}</td>
                <td className="px-4 py-3 text-right tnum text-fg">{e.xp}</td>
                <td className="px-4 py-3 text-right tnum text-muted">{e.level}</td>
                <td className="px-4 py-3 text-right tnum text-muted">{e.solvedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
