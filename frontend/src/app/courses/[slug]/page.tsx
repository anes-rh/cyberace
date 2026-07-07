"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Flag, Lightbulb, Trophy, Target, ChevronRight, ArrowLeft, PlayCircle } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { Progress } from "@/components/ui/Progress";
import { Markdown, slugifyHeading } from "@/components/Markdown";
import { LessonMedia } from "@/components/LessonMedia";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn, pct } from "@/lib/utils";
import type { CourseDetail } from "@/lib/types";

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<CourseDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    api.course(slug).then(setData).catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => { load(); }, [load, user]);

  if (notFound)
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Circuit introuvable</h1>
        <Link href="/courses" className="mt-4 inline-block text-primary hover:underline">← Retour aux circuits</Link>
      </div>
    );
  if (!data) return <FullScreenLoader label="Chargement du circuit…" />;

  const { course, challenges, progress } = data;
  // Back link returns to the PARENT checkpoint's module list, never the global one.
  const backHref = course.checkpoint ? `/checkpoints/${course.checkpoint}` : "/courses";

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link href={backHref} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Retour au checkpoint
      </Link>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-line bg-surface/60 p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-25 blur-3xl" style={{ background: course.accent }} />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl" style={{ background: `${course.accent}1a`, color: course.accent, boxShadow: `inset 0 0 0 1px ${course.accent}55` }}>
              <Icon name={course.icon} className="h-8 w-8" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: course.accent }}>{course.domain}</p>
              <h1 className="mt-1 font-display text-3xl font-bold">{course.codename}</h1>
              <p className="mt-1 text-sm text-muted">{course.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <DifficultyBadge difficulty={course.difficulty} />
                <span className="inline-flex items-center gap-1.5 text-sm text-muted"><Flag className="h-4 w-4" /> {challenges.length} défis</span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted"><Trophy className="h-4 w-4 text-warning" /> Badge {course.badge.name}</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-56">
            <div className="mb-1.5 flex justify-between text-xs text-faint">
              <span className="tnum">{progress.solvedCount}/{progress.total} résolus</span>
              <span className="tnum">{pct(progress.ratio)}</span>
            </div>
            <Progress value={progress.ratio} color={course.accent} height={10} />
            {progress.badgeEarned && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-warning"><Trophy className="h-3.5 w-3.5" /> Badge débloqué !</p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lesson */}
        <section className="glass rounded-2xl p-7">
          <div className="mb-5 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Mini-cours</h2>
          </div>
          {course.objectives.length > 0 && (
            <div className="mb-6 rounded-xl border border-line bg-surface/50 p-4">
              <p className="mb-2 text-sm font-medium text-fg">Objectifs</p>
              <ul className="space-y-1.5">
                {course.objectives.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {course.videos && course.videos.length > 0 && (
            <a
              href="#lesson-videos"
              className="mb-6 flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm transition-colors hover:border-danger/60"
            >
              <PlayCircle className="h-5 w-5 shrink-0 text-danger" />
              <span className="text-fg">
                {course.videos.length > 1
                  ? `${course.videos.length} vidéos explicatives sont disponibles`
                  : "Une vidéo explicative est disponible"}{" "}
                tout en bas de cette page.
                <span className="ml-1 font-medium text-danger">Clique pour y aller ↓</span>
              </span>
            </a>
          )}
          <LessonTOC lesson={course.lesson} />
          <Markdown>{course.lesson}</Markdown>
          <LessonMedia videos={course.videos} resources={course.resources} />
        </section>

        {/* Challenge list */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="mb-4 font-display text-xl font-bold">Les défis</h2>
          <div className="space-y-3">
            {challenges.map((ch, i) => (
              <Link
                key={ch.id}
                href={`/courses/${course.slug}/${ch.id}`}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border p-4 transition-colors",
                  ch.solved ? "border-success/40 bg-success/5" : "border-line bg-surface/50 hover:border-primary/40"
                )}
              >
                <span className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-sm font-bold",
                  ch.solved ? "bg-success/20 text-success" : "bg-surface-2 text-muted"
                )}>
                  {ch.solved ? <Check className="h-5 w-5" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{ch.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-faint">
                    <span className="tnum">{ch.points} pts</span>
                    {ch.hints.length > 0 && (
                      <span className="inline-flex items-center gap-0.5"><Lightbulb className="h-3 w-3" /> {ch.hints.length}</span>
                    )}
                  </div>
                </div>
                <DifficultyBadge difficulty={ch.difficulty} />
                <ChevronRight className="h-4 w-4 text-faint transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Anchored table of contents for long lessons (university-grade chapters).
 * Parses `## ` headings outside code fences; hidden under 4 sections so the
 * shorter legacy lessons keep their current compact look.
 */
function LessonTOC({ lesson }: { lesson: string }) {
  const headings: string[] = [];
  let inFence = false;
  for (const line of lesson.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    else if (!inFence) {
      const m = line.match(/^##\s+(.+?)\s*$/);
      if (m) headings.push(m[1]);
    }
  }
  if (headings.length < 4) return null;
  return (
    <nav aria-label="Sommaire du cours" className="mb-6 rounded-xl border border-line bg-surface/50 p-4">
      <p className="mb-2 text-sm font-medium text-fg">Sommaire</p>
      <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {headings.map((h, i) => (
          <li key={`${h}-${i}`} className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] text-faint tnum">{String(i + 1).padStart(2, "0")}</span>
            <a
              href={`#${slugifyHeading(h)}`}
              className="text-muted transition-colors hover:text-primary"
            >
              {h.replace(/^[^\p{L}\p{N}]+\s*/u, "")}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
