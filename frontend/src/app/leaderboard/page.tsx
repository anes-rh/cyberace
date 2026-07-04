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
          {/* Podium — visual order 2 · 1 · 3, the 1st place clearly dominant */}
          <div className="mb-10 flex items-end justify-center gap-3 sm:gap-5">
            {[1, 0, 2].map((rankIdx) => {
              const e = top3[rankIdx];
              if (!e) return <div key={rankIdx} className="w-1/3 max-w-[9rem]" />;
              const s = PODIUM_STYLE[rankIdx];
              const isFirst = rankIdx === 0;
              // Sizes indexed by RANK: 1st > 2nd > 3rd (this was the bug — heights
              // were indexed by visual position, making 2nd taller than 1st).
              const pedestalH = ["h-40", "h-28", "h-20"][rankIdx];
              const avatarSize = [88, 60, 52][rankIdx];
              const isMe = user?.username === e.username;
              const PIcon = s.icon;
              return (
                <motion.div
                  key={e.username}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rankIdx * 0.12, type: "spring", stiffness: 120, damping: 16 }}
                  className={cn("flex flex-1 flex-col items-center justify-end", isFirst ? "max-w-[12rem]" : "max-w-[9rem]")}
                >
                  {isFirst && (
                    <Crown className="mb-1 h-7 w-7" style={{ color: s.glow, filter: `drop-shadow(0 2px 6px ${s.glow}88)` }} />
                  )}
                  <div className="relative mb-3">
                    <span
                      className="absolute -inset-1 rounded-full blur-md"
                      style={{ background: isFirst ? `${s.glow}55` : `${s.glow}33` }}
                    />
                    <Avatar seed={e.avatarSeed} name={e.displayName} url={e.avatarUrl} size={avatarSize} className={cn("relative ring-2", s.ring)} />
                    <span
                      className="absolute -bottom-1 -right-1 grid place-items-center rounded-full bg-surface ring-1 ring-line"
                      style={{ color: s.glow, width: isFirst ? 28 : 22, height: isFirst ? 28 : 22 }}
                    >
                      <PIcon className={isFirst ? "h-4 w-4" : "h-3 w-3"} />
                    </span>
                  </div>
                  <p className={cn("max-w-full truncate text-center font-semibold text-fg", isFirst ? "text-base" : "text-sm")}>{e.displayName}</p>
                  <p className={cn("tnum", isFirst ? "text-sm font-medium text-primary" : "text-xs text-primary")}>{e.xp} XP</p>
                  <div
                    className={cn(
                      "mt-3 flex w-full items-start justify-center rounded-t-2xl border bg-gradient-to-b from-surface/80 to-surface/40",
                      pedestalH,
                      isMe ? "border-primary/60" : "border-line"
                    )}
                    style={{ boxShadow: `inset 0 3px 34px -10px ${s.glow}, 0 -1px 0 ${s.glow}66` }}
                  >
                    <div className={cn("pt-3 text-center font-display font-bold", isFirst ? "text-4xl" : "text-2xl")} style={{ color: s.glow }}>
                      #{e.rank}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Your rank — highlighted card */}
          {user && me && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 to-lavender/10 px-5 py-4 soft-shadow"
            >
              <span className="flex items-center gap-3">
                <Avatar seed={user.avatarSeed} name={user.displayName} url={user.avatarUrl} size={40} className="ring-2 ring-primary/40" />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-fg"><Flame className="h-4 w-4 text-primary" /> Ton rang</span>
                  <span className="text-xs text-muted">{user.displayName}</span>
                </span>
              </span>
              <span className="text-right">
                <span className="block font-display text-2xl font-bold text-primary tnum">#{me.rank}</span>
                <span className="text-xs text-muted tnum">{me.xp} XP</span>
              </span>
            </motion.div>
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
                  <Avatar seed={e.avatarSeed} name={e.displayName} url={e.avatarUrl} size={36} />
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
