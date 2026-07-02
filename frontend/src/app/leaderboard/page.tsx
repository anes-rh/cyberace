"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Crown, Medal } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

const PODIUM_STYLE = [
  { ring: "ring-warning", glow: "#f59e0b", icon: Crown },
  { ring: "ring-muted", glow: "#97a3c4", icon: Medal },
  { ring: "ring-danger", glow: "#fb7185", icon: Medal },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [me, setMe] = useState<{ rank: number; xp: number } | null>(null);

  useEffect(() => {
    api.leaderboard(50).then((r) => { setEntries(r.leaderboard); setMe(r.me); }).catch(() => setEntries([]));
  }, [user]);

  if (!entries) return <FullScreenLoader label="Chargement du classement…" />;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <header className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Podium</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Classement global</h1>
        <p className="mt-2 text-muted">Les pilotes les plus rapides du circuit CyberAce.</p>
      </header>

      {entries.length === 0 ? (
        <p className="py-20 text-center text-muted">Aucun pilote classé pour l'instant. Sois le premier !</p>
      ) : (
        <>
          {/* Podium */}
          <div className="mb-10 grid grid-cols-3 gap-3 sm:gap-5">
            {[1, 0, 2].map((order) => {
              const e = top3[order];
              if (!e) return <div key={order} />;
              const s = PODIUM_STYLE[order];
              const heights = ["h-28", "h-36", "h-24"];
              const PIcon = s.icon;
              return (
                <motion.div
                  key={e.username}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: order * 0.1 }}
                  className={cn("flex flex-col items-center justify-end", order === 0 && "order-2", order === 1 && "order-1", order === 2 && "order-3")}
                >
                  <div className="relative mb-3">
                    <Avatar seed={e.avatarSeed} name={e.displayName} size={order === 0 ? 72 : 56} className={cn("ring-2", s.ring)} />
                    <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-surface ring-1 ring-line" style={{ color: s.glow }}>
                      <PIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="max-w-full truncate text-center text-sm font-semibold text-fg">{e.displayName}</p>
                  <p className="text-xs text-primary tnum">{e.xp} XP</p>
                  <div
                    className={cn("mt-3 w-full rounded-t-xl border border-line bg-surface/60", heights[order])}
                    style={{ boxShadow: `inset 0 2px 24px -8px ${s.glow}` }}
                  >
                    <div className="pt-3 text-center font-display text-2xl font-bold" style={{ color: s.glow }}>#{e.rank}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Your rank */}
          {user && me && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 px-5 py-3">
              <span className="flex items-center gap-2 text-sm text-fg"><Flame className="h-4 w-4 text-primary" /> Ton rang</span>
              <span className="font-display text-lg font-bold text-primary tnum">#{me.rank} · {me.xp} XP</span>
            </div>
          )}

          {/* Rest of table */}
          {rest.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-line">
              {rest.map((e, i) => (
                <div
                  key={e.username}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3",
                    i % 2 ? "bg-surface/40" : "bg-surface/20",
                    user?.username === e.username && "bg-primary/10"
                  )}
                >
                  <span className="w-8 text-center font-display font-bold text-faint tnum">{e.rank}</span>
                  <Avatar seed={e.avatarSeed} name={e.displayName} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-fg">{e.displayName}</p>
                    <p className="text-xs text-faint">Nv.{e.level} · {e.title}</p>
                  </div>
                  <span className="hidden items-center gap-1 text-sm text-warning sm:inline-flex"><Trophy className="h-3.5 w-3.5" /> {e.badges}</span>
                  <span className="w-24 text-right font-display font-bold text-primary tnum">{e.xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
