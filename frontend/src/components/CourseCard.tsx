"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Trophy, Flag } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { Progress } from "@/components/ui/Progress";
import type { CourseSummary } from "@/lib/types";
import { pct } from "@/lib/utils";

export function CourseCard({ course, index = 0 }: { course: CourseSummary; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    >
      <Link
        href={`/courses/${course.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-line bg-surface/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-transparent"
        style={{ boxShadow: "0 0 0 1px transparent" }}
      >
        {/* Accent glow */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
          style={{ background: course.accent }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px ${course.accent}66, 0 0 30px -10px ${course.accent}` }}
        />

        <div className="relative flex items-start justify-between">
          <div
            className="grid h-12 w-12 place-items-center rounded-xl"
            style={{ background: `${course.accent}1a`, color: course.accent, boxShadow: `inset 0 0 0 1px ${course.accent}55` }}
          >
            <Icon name={course.icon} className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <DifficultyBadge difficulty={course.difficulty} />
            {course.badgeEarned && (
              <span className="inline-flex items-center gap-1 text-xs text-warning">
                <Trophy className="h-3.5 w-3.5" /> Badge
              </span>
            )}
          </div>
        </div>

        <div className="relative mt-5">
          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: course.accent }}>
            {course.domain}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-fg">{course.codename}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{course.summary}</p>
        </div>

        <div className="relative mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs text-faint">
            <span className="tnum">{course.solvedCount}/{course.challengeCount} défis</span>
            <span className="tnum">{pct(course.progress)}</span>
          </div>
          <Progress value={course.progress} color={course.accent} />
        </div>

        <div className="relative mt-5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Flag className="h-3.5 w-3.5" /> {course.totalPoints} pts en jeu
          </span>
          <span className="inline-flex items-center gap-1 font-display text-sm font-medium transition-transform group-hover:translate-x-1" style={{ color: course.accent }}>
            Courir <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
