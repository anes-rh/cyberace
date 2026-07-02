"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, ArrowRight, Sparkles, Clock } from "lucide-react";
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

      {/* top heading */}
      <div className="pointer-events-none absolute left-0 right-0 top-6 z-10 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Ton parcours</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-fg sm:text-4xl">
          La route des <span className="gradient-text">checkpoints</span>
        </h1>
      </div>

      {/* info panel */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-2xl rounded-3xl border border-line bg-surface/85 p-6 backdrop-blur-xl soft-shadow"
            >
              <div className="flex items-start gap-4">
                <div
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
                  style={{ background: `${active.accent}1f`, color: active.accent, boxShadow: `inset 0 0 0 1px ${active.accent}55` }}
                >
                  <Icon name={active.icon} className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-faint">Checkpoint {active.order}/4</span>
                    {active.status === "empty" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-faint">
                        <Clock className="h-3 w-3" /> Bientôt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]" style={{ background: `${active.accent}22`, color: active.accent }}>
                        <Sparkles className="h-3 w-3" /> Actif
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-fg">{active.title}</h2>
                  <p className="mt-1 text-sm text-muted">{active.description}</p>

                  {active.status === "active" && active.challengeCount > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-faint">
                        <span>{active.courseCount} modules · {active.challengeCount} défis</span>
                        <span className="tnum">{pct(active.progress)}</span>
                      </div>
                      <Progress value={active.progress} color={active.accent} />
                    </div>
                  )}

                  <div className="mt-4">
                    {active.status === "empty" ? (
                      <button disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-line bg-surface-2 px-5 py-2.5 text-sm text-faint">
                        <Lock className="h-4 w-4" /> Bientôt disponible
                      </button>
                    ) : (
                      <Link href={`/checkpoints/${active.slug}`} className={buttonVariants({ size: "md" })}>
                        Entrer dans le checkpoint <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* nav row */}
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <button onClick={() => go(activeIndex - 1)} disabled={activeIndex === 0} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex gap-2">
                  {checkpoints.map((cp, i) => (
                    <button
                      key={cp.slug}
                      onClick={() => go(i)}
                      className={cn("h-2 rounded-full transition-all", i === activeIndex ? "w-8" : "w-2")}
                      style={{ background: i === activeIndex ? cp.accent : `${cp.accent}55` }}
                      aria-label={cp.title}
                    />
                  ))}
                </div>
                <button onClick={() => go(activeIndex + 1)} disabled={activeIndex === checkpoints.length - 1} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
