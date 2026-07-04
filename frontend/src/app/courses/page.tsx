"use client";

import { useEffect, useMemo, useState } from "react";
import { CourseCard } from "@/components/CourseCard";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { cn, DIFFICULTY, type DifficultyKey } from "@/lib/utils";
import type { CourseSummary } from "@/lib/types";

const FILTERS: ("all" | DifficultyKey)[] = ["all", "easy", "medium", "hard"];

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [filter, setFilter] = useState<"all" | DifficultyKey>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.courses().then((r) => setCourses(r.courses)).catch(() => setCourses([]));
  }, []);

  const filtered = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c) => {
      const okDiff = filter === "all" || c.difficulty === filter;
      const q = query.toLowerCase();
      const okQuery = !q || c.codename.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
      return okDiff && okQuery;
    });
  }, [courses, filter, query]);

  if (!courses) return <FullScreenLoader label="Chargement des circuits…" />;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Grille de départ</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Tous les circuits</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {courses.length} circuits couvrant l&apos;informatique et la cybersécurité, avec des défis inédits (OSINT, forensic, cloud, web, social engineering éthique).
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-4 py-1.5 font-display text-sm transition-colors",
                filter === f ? "bg-primary text-void" : "bg-surface-2 text-muted hover:text-fg"
              )}
            >
              {f === "all" ? "Tous" : DIFFICULTY[f].label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un circuit…"
          className="w-full rounded-lg border border-line bg-surface/70 px-4 py-2 text-sm text-fg placeholder:text-faint focus:border-primary/60 focus:outline-none sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted">Aucun circuit ne correspond à ta recherche.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <CourseCard key={c.slug} course={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
