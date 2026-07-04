"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Trophy, Flag, Layers } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Progress } from "@/components/ui/Progress";
import { CourseCard } from "@/components/CourseCard";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { buttonVariants } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { pct } from "@/lib/utils";
import type { CheckpointDetail } from "@/lib/types";

export default function CheckpointPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<CheckpointDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    api.checkpoint(slug).then(setData).catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => { load(); }, [load, user]);

  if (notFound)
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Checkpoint introuvable</h1>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">← Retour à la route</Link>
      </div>
    );
  if (!data) return <FullScreenLoader label="Chargement du checkpoint…" />;

  const { checkpoint: cp, courses, progress } = data;
  const empty = cp.status === "empty";

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> La route des checkpoints
      </Link>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-line bg-surface/80 p-8 soft-shadow"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: cp.accent }} />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl" style={{ background: `${cp.accent}1f`, color: cp.accent, boxShadow: `inset 0 0 0 1px ${cp.accent}55` }}>
              <Icon name={cp.icon} className="h-8 w-8" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: cp.accent }}>Checkpoint {cp.order}</p>
              <h1 className="mt-1 font-display text-3xl font-semibold">{cp.title}</h1>
              <p className="mt-1 max-w-xl text-sm text-muted">{cp.description}</p>
            </div>
          </div>
          {!empty && (
            <div className="w-full md:w-56">
              <div className="mb-1.5 flex justify-between text-xs text-faint">
                <span className="tnum">{progress.solvedCount}/{progress.total} défis</span>
                <span className="tnum">{pct(progress.ratio)}</span>
              </div>
              <Progress value={progress.ratio} color={cp.accent} height={10} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      {empty ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-10 flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-line bg-surface/50 px-6 py-20 text-center"
        >
          <div className="grid h-16 w-16 place-items-center rounded-full" style={{ background: `${cp.accent}18`, color: cp.accent }}>
            <Clock className="h-8 w-8" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold">Bientôt disponible</h2>
          <p className="mt-2 max-w-md text-muted">
            Le contenu de ce checkpoint arrive dans une prochaine étape. En attendant, tu peux avancer sur le checkpoint <span className="font-medium text-fg">Cybersécurité</span>.
          </p>
          <Link href="/checkpoints/cybersecurite" className={buttonVariants({ variant: "glass", size: "md" }) + " mt-6"}>
            Aller à la Cybersécurité
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="mt-10 mb-5 flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Modules ({courses.length})</h2>
            <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted">
              <Flag className="h-4 w-4" /> {courses.reduce((a, c) => a + c.challengeCount, 0)} défis
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => (
              <CourseCard key={c.slug} course={c} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
