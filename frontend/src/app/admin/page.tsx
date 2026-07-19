"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, Server, Boxes, Target, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiError } from "@/lib/api";
import type { AdminStats } from "@/lib/adminTypes";

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: number | string; sub?: string }) {
  return (
    <Card className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="font-display text-3xl font-bold text-fg tnum">{value}</div>
        <div className="text-sm text-muted">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-faint">{sub}</div>}
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin
      .stats()
      .then(setStats)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erreur de chargement."));
  }, []);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!stats) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Users} label="Utilisateurs" value={stats.totalUsers} />
        <StatCard icon={UserPlus} label="Nouveaux cette semaine" value={stats.newUsersThisWeek} />
        <StatCard icon={Target} label="Défis résolus aujourd'hui" value={stats.solvedToday} />
        <StatCard icon={Server} label="Sessions module actives" value={stats.runningSandboxSessions} />
        <StatCard icon={Boxes} label="Sessions projet actives" value={stats.activeProjectSessions} />
      </div>

      <Card className="flex items-center justify-between">
        <div>
          <p className="font-display font-semibold text-fg">Sessions Docker en cours</p>
          <p className="text-sm text-muted">
            {stats.runningSandboxSessions + stats.activeProjectSessions} session(s) active(s) — surveille les processus qui traînent.
          </p>
        </div>
        <Link href="/admin/sessions" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          Voir les sessions <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  );
}
