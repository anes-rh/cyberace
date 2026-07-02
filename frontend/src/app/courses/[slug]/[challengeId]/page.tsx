"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChallengePlayer } from "@/components/challenge/ChallengePlayer";
import { FullScreenLoader } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { CourseDetail, Challenge } from "@/lib/types";

export default function ChallengePage() {
  const { slug, challengeId } = useParams<{ slug: string; challengeId: string }>();
  const { refresh } = useAuth();
  const [data, setData] = useState<CourseDetail | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    api.course(slug).then(setData).catch(() => setError(true));
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  if (error)
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Défi introuvable</h1>
        <Link href="/courses" className="mt-4 inline-block text-primary hover:underline">← Retour aux circuits</Link>
      </div>
    );
  if (!data) return <FullScreenLoader label="Chargement du défi…" />;

  const idx = data.challenges.findIndex((c) => c.id === challengeId);
  const challenge: Challenge | undefined = data.challenges[idx];
  if (!challenge)
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Défi introuvable</h1>
        <Link href={`/courses/${slug}`} className="mt-4 inline-block text-primary hover:underline">← Retour au circuit</Link>
      </div>
    );

  const next = data.challenges[idx + 1];
  const nextHref = next ? `/courses/${slug}/${next.id}` : null;

  const onSolved = () => {
    load();
    refresh();
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href={`/courses/${slug}`} className="inline-flex items-center gap-1.5 hover:text-fg">
          <ArrowLeft className="h-4 w-4" /> {data.course.codename}
        </Link>
        <span className="text-faint">/</span>
        <span className="text-fg">Défi {idx + 1}/{data.challenges.length}</span>
      </div>

      <ChallengePlayer
        key={challenge.id}
        challenge={challenge}
        nextHref={nextHref}
        onSolved={onSolved}
      />
    </div>
  );
}
