"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Lock, CalendarDays, Zap, Target, type LucideIcon } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Progress } from "@/components/ui/Progress";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { pct } from "@/lib/utils";
import type { ProgressPayload } from "@/lib/types";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}

function ProfileInner() {
  const [data, setData] = useState<ProgressPayload | null>(null);

  useEffect(() => {
    api.progress().then(setData).catch(() => {});
  }, []);

  if (!data) return <FullScreenLoader label="Chargement du profil…" />;

  const { user, level, stats, domainStats, courseProgress } = data;
  const earned = courseProgress.filter((c) => c.badgeEarned).length;
  const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" });

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass relative overflow-hidden rounded-3xl p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <Avatar seed={user.avatarSeed} name={user.displayName} size={96} className="ring-2 ring-primary/40" />
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold">{user.displayName}</h1>
            <p className="text-muted">@{user.username}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Chip icon={Zap} text={`${user.xp} XP`} />
              <Chip icon={Trophy} text={`Nv.${level.level} · ${level.title}`} />
              <Chip icon={Target} text={`${stats.solvedCount} défis`} />
              <Chip icon={CalendarDays} text={`Depuis ${memberSince}`} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Badges</h2>
          <span className="text-sm text-muted tnum">{earned}/{courseProgress.length} débloqués</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {courseProgress.map((c) => (
            <div
              key={c.slug}
              className={`flex flex-col items-center rounded-2xl border p-5 text-center transition-colors ${
                c.badgeEarned ? "border-warning/40 bg-warning/5" : "border-line bg-surface/40"
              }`}
            >
              <div
                className="grid h-14 w-14 place-items-center rounded-2xl"
                style={
                  c.badgeEarned
                    ? { background: `${c.accent}1a`, color: c.accent, boxShadow: `inset 0 0 0 1px ${c.accent}55` }
                    : { background: "var(--color-surface-2)", color: "var(--color-faint)" }
                }
              >
                {c.badgeEarned ? <Icon name={c.badge.icon} className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
              </div>
              <p className={`mt-3 font-display text-sm font-semibold ${c.badgeEarned ? "text-fg" : "text-faint"}`}>
                {c.badge.name}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-faint">{c.badgeEarned ? c.badge.description : "Termine le circuit pour débloquer"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Domain mastery */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold">Maîtrise par domaine</h2>
        <div className="glass rounded-2xl p-6">
          <div className="space-y-5">
            {domainStats.map((d) => (
              <div key={d.domain}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-fg">{d.domain}</span>
                  <span className="text-xs text-faint tnum">
                    {d.solved}/{d.total} · réussite {pct(d.successRate)}
                  </span>
                </div>
                <Progress value={d.completion} height={8} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Chip({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs text-muted">
      <Icon className="h-3.5 w-3.5 text-primary" /> {text}
    </span>
  );
}
