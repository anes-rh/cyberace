"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flag, Trophy, Target, Timer, Flame, ArrowRight, Zap, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Progress } from "@/components/ui/Progress";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatTime, pct } from "@/lib/utils";
import type { ProgressPayload } from "@/lib/types";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

function DashboardInner() {
  const [data, setData] = useState<ProgressPayload | null>(null);

  useEffect(() => {
    api.progress().then(setData).catch(() => {});
  }, []);

  if (!data) return <FullScreenLoader label="Chargement du tableau de bord…" />;

  const { user, level, stats, courseProgress, recentAttempts } = data;
  const nextLabel = level.nextLevelXp ? `${level.nextLevelXp - level.currentXp} XP jusqu'au niveau ${level.level + 1}` : "Niveau max atteint";

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar seed={user.avatarSeed} name={user.displayName} size={72} />
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary">{level.title} · Niveau {level.level}</p>
              <h1 className="mt-1 font-display text-3xl font-bold">{user.displayName}</h1>
              <p className="mt-1 flex items-center gap-3 text-sm text-muted">
                <span className="inline-flex items-center gap-1"><Zap className="h-4 w-4 text-primary" /> {user.xp} XP</span>
                <span className="inline-flex items-center gap-1"><Flame className="h-4 w-4 text-warning" /> {stats.streak} j de série</span>
              </p>
            </div>
          </div>
          <div className="w-full md:w-72">
            <div className="mb-1.5 flex justify-between text-xs text-faint">
              <span>Progression</span>
              <span className="tnum">{pct(level.progress)}</span>
            </div>
            <Progress value={level.progress} height={10} />
            <p className="mt-1.5 text-xs text-muted">{nextLabel}</p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Flag} label="Défis résolus" value={`${stats.solvedCount}/${stats.totalChallenges}`} accent="#22d3ee" />
        <StatCard icon={Trophy} label="Badges" value={`${stats.badges}`} accent="#f59e0b" />
        <StatCard icon={Target} label="Taux de réussite" value={pct(stats.successRate)} accent="#34d399" />
        <StatCard icon={Timer} label="Temps moyen" value={formatTime(stats.avgTimeMs)} accent="#8b5cf6" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Continue racing */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Continue la course</h2>
            <Link href="/courses" className="text-sm text-primary hover:underline">Tous les circuits</Link>
          </div>
          <div className="space-y-3">
            {courseProgress.map((c) => (
              <Link key={c.slug} href={`/courses/${c.slug}`} className="group flex items-center gap-4 rounded-xl border border-line bg-surface/50 p-4 transition-colors hover:border-primary/40">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ background: `${c.accent}1a`, color: c.accent }}>
                  <Icon name={c.icon} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-medium text-fg">{c.codename}</p>
                    <span className="text-xs text-faint tnum">{c.solved}/{c.total}</span>
                  </div>
                  <Progress value={c.total ? c.solved / c.total : 0} color={c.accent} className="mt-2" height={6} />
                </div>
                {c.badgeEarned && <Trophy className="h-4 w-4 text-warning" />}
                <ArrowRight className="h-4 w-4 text-faint transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <aside>
          <h2 className="mb-4 font-display text-xl font-bold">Activité récente</h2>
          <div className="glass rounded-2xl p-4">
            {recentAttempts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Aucune tentative pour l'instant. Lance ta première course !</p>
            ) : (
              <ul className="space-y-2">
                {recentAttempts.map((a, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
                    {a.correct ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <XCircle className="h-4 w-4 shrink-0 text-danger" />}
                    <span className="min-w-0 flex-1 truncate text-muted">{a.challengeId}</span>
                    {a.correct && <span className="text-xs text-success tnum">+{a.pointsAwarded}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: string; accent: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: `${accent}1a`, color: accent }}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-fg tnum">{value}</div>
      <div className="text-xs text-faint">{label}</div>
    </div>
  );
}
