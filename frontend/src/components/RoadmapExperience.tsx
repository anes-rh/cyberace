"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, ArrowRight, Sparkles, Clock, Check, MapPin } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Progress } from "@/components/ui/Progress";
import { buttonVariants } from "@/components/ui/Button";
import RoadmapFallback from "@/components/RoadmapFallback";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn, pct } from "@/lib/utils";
import type { CheckpointSummary } from "@/lib/types";

const RoadmapScene = dynamic(() => import("@/components/three/RoadmapScene"), { ssr: false });

function pick3D(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.innerWidth < 768) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function RoadmapExperience() {
  const { user } = useAuth();
  const [checkpoints, setCheckpoints] = useState<CheckpointSummary[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUse3D(pick3D());
    setReady(true);
  }, []);

  useEffect(() => {
    api.checkpoints().then((r) => setCheckpoints(r.checkpoints)).catch(() => setCheckpoints([]));
  }, [user]);

  const active = checkpoints[activeIndex];
  const go = (i: number) => setActiveIndex(Math.max(0, Math.min(checkpoints.length - 1, i)));

  const sceneEl = useMemo(() => {
    if (!ready || checkpoints.length === 0) return null;
    return use3D ? (
      <RoadmapScene checkpoints={checkpoints} activeIndex={activeIndex} onSelect={go} />
    ) : (
      <RoadmapFallback checkpoints={checkpoints} activeIndex={activeIndex} onSelect={go} />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, use3D, checkpoints, activeIndex]);

  return (
    <section className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden">
      <div className="absolute inset-0">{sceneEl}</div>

      {/* right checkpoint navigator */}
      {checkpoints.length > 0 && (
        <div className="pointer-events-none absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block xl:right-6">
          <motion.nav
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            aria-label="Navigation des checkpoints"
            className="pointer-events-auto w-64 rounded-2xl border border-line bg-surface/85 p-3 backdrop-blur-xl soft-shadow"
          >
            <p className="flex items-center gap-1.5 px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              <MapPin className="h-3 w-3" /> Itinéraire
            </p>
            <ul className="space-y-1">
              {checkpoints.map((cp, i) => {
                const isActive = i === activeIndex;
                const locked = cp.status === "empty";
                return (
                  <motion.li
                    key={cp.slug}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.5 + i * 0.07 }}
                  >
                    <button
                      onClick={() => go(i)}
                      aria-current={isActive ? "step" : undefined}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-300",
                        isActive ? "bg-surface" : "hover:bg-surface-2"
                      )}
                      style={isActive ? { boxShadow: `inset 0 0 0 1.5px ${cp.accent}66, 0 10px 22px -14px ${cp.accent}` } : undefined}
                    >
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-white transition-transform duration-300 group-hover:scale-105"
                        style={{ background: locked ? `${cp.accent}77` : cp.accent }}
                      >
                        {cp.completed ? <Check className="h-4 w-4" /> : cp.order}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-sm font-semibold transition-colors", isActive ? "text-fg" : "text-muted")}>
                          {cp.title}
                        </span>
                        <span className="block text-[11px] text-faint">
                          {locked ? "Bientôt" : cp.completed ? "Terminé" : cp.challengeCount > 0 ? `${pct(cp.progress)} complété` : "En cours"}
                        </span>
                      </span>
                      {locked ? (
                        <Lock className="h-3.5 w-3.5 shrink-0 text-faint" />
                      ) : (
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-all duration-300",
                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                          )}
                          style={{ color: cp.accent }}
                        />
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.nav>
        </div>
      )}

      {/* bottom-left HUD — compact, never hides the road */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10 sm:right-auto sm:w-[360px]">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.slug}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{
                opacity: 1, y: 0, scale: 1,
                transition: { duration: 0.5, delay: 0.85, ease: [0.22, 1, 0.36, 1] },
              }}
              exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2 } }}
              className="pointer-events-auto rounded-2xl border border-line bg-surface/75 p-4 backdrop-blur-xl soft-shadow"
            >
              {/* header row */}
              <div className="flex items-center gap-3">
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${active.accent}1f`, color: active.accent, boxShadow: `inset 0 0 0 1px ${active.accent}55` }}
                >
                  <Icon name={active.icon} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-faint">Checkpoint {active.order}/{checkpoints.length}</span>
                    {active.status === "empty" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-faint">
                        <Clock className="h-3 w-3" /> Bientôt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]" style={{ background: `${active.accent}22`, color: active.accent }}>
                        <Sparkles className="h-3 w-3" /> Actif
                      </span>
                    )}
                  </div>
                  <h2 className="truncate font-display text-lg font-semibold leading-tight text-fg">{active.title}</h2>
                </div>
                {/* prev / next */}
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => go(activeIndex - 1)}
                    disabled={activeIndex === 0}
                    aria-label="Checkpoint précédent"
                    className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => go(activeIndex + 1)}
                    disabled={activeIndex === checkpoints.length - 1}
                    aria-label="Checkpoint suivant"
                    className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{active.description}</p>

              {active.status === "active" && active.challengeCount > 0 && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px] text-faint">
                    <span>{active.courseCount} modules · {active.challengeCount} défis</span>
                    <span className="tnum">{pct(active.progress)}</span>
                  </div>
                  <Progress value={active.progress} color={active.accent} />
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-3">
                {active.status === "empty" ? (
                  <button disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-line bg-surface-2 px-4 py-2 text-xs text-faint">
                    <Lock className="h-3.5 w-3.5" /> Bientôt disponible
                  </button>
                ) : (
                  <Link href={`/checkpoints/${active.slug}`} className={buttonVariants({ size: "sm" })}>
                    Entrer <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
                {/* dots (mobile-friendly quick nav) */}
                <div className="flex gap-1.5">
                  {checkpoints.map((cp, i) => (
                    <button
                      key={cp.slug}
                      onClick={() => go(i)}
                      className={cn("h-1.5 rounded-full transition-all", i === activeIndex ? "w-6" : "w-1.5")}
                      style={{ background: i === activeIndex ? cp.accent : `${cp.accent}55` }}
                      aria-label={cp.title}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
