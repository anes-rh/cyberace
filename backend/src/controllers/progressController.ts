import { Request, Response } from "express";
import { User } from "../models/User";
import { Course } from "../models/Course";
import { Challenge } from "../models/Challenge";
import { Attempt } from "../models/Attempt";
import { computeLevel } from "../utils/scoring";
import { serializeUser } from "../utils/serialize";
import { HttpError } from "../middleware/error";

/** GET /api/progress — full personal dashboard payload. */
export async function getProgress(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId);
  if (!user) throw new HttpError(404, "Utilisateur introuvable.");

  const [courses, challenges, attempts] = await Promise.all([
    Course.find().sort({ order: 1 }).lean(),
    Challenge.find({}, "challengeId courseSlug").lean(),
    Attempt.find({ user: user._id }).sort({ createdAt: -1 }).limit(200).lean(),
  ]);

  const domainBySlug = new Map(courses.map((c) => [c.slug, c.domain]));
  const totalByDomain = new Map<string, number>();
  for (const ch of challenges) {
    const d = domainBySlug.get(ch.courseSlug) ?? "Autre";
    totalByDomain.set(d, (totalByDomain.get(d) ?? 0) + 1);
  }

  // Solved counts per domain.
  const solvedByDomain = new Map<string, number>();
  for (const s of user.solved) {
    const d = domainBySlug.get(s.courseSlug) ?? "Autre";
    solvedByDomain.set(d, (solvedByDomain.get(d) ?? 0) + 1);
  }

  // Attempt-based success rate per domain.
  const attemptsByDomain = new Map<string, { correct: number; total: number }>();
  for (const a of attempts) {
    const d = domainBySlug.get(a.courseSlug) ?? "Autre";
    const agg = attemptsByDomain.get(d) ?? { correct: 0, total: 0 };
    agg.total += 1;
    if (a.correct) agg.correct += 1;
    attemptsByDomain.set(d, agg);
  }

  const domainStats = [...totalByDomain.entries()].map(([domain, total]) => {
    const solved = solvedByDomain.get(domain) ?? 0;
    const att = attemptsByDomain.get(domain) ?? { correct: 0, total: 0 };
    return {
      domain,
      solved,
      total,
      completion: total ? solved / total : 0,
      successRate: att.total ? att.correct / att.total : 0,
      attempts: att.total,
    };
  });

  // Per-course progress.
  const solvedByCourse = new Map<string, number>();
  for (const s of user.solved) {
    solvedByCourse.set(s.courseSlug, (solvedByCourse.get(s.courseSlug) ?? 0) + 1);
  }
  const totalByCourse = new Map<string, number>();
  for (const ch of challenges) {
    totalByCourse.set(ch.courseSlug, (totalByCourse.get(ch.courseSlug) ?? 0) + 1);
  }
  const courseProgress = courses.map((c) => ({
    slug: c.slug,
    codename: c.codename,
    accent: c.accent,
    icon: c.icon,
    solved: solvedByCourse.get(c.slug) ?? 0,
    total: totalByCourse.get(c.slug) ?? 0,
    badge: c.badge,
    badgeEarned: user.badges.includes(c.badge.id),
  }));

  const solvedTimes = user.solved.map((s) => s.timeMs).filter((t) => t > 0);
  const avgTimeMs = solvedTimes.length
    ? Math.round(solvedTimes.reduce((a, b) => a + b, 0) / solvedTimes.length)
    : 0;
  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.correct).length;

  res.json({
    user: serializeUser(user),
    level: computeLevel(user.xp),
    stats: {
      xp: user.xp,
      solvedCount: user.solved.length,
      totalChallenges: challenges.length,
      badges: user.badges.length,
      streak: user.streak,
      avgTimeMs,
      totalAttempts,
      successRate: totalAttempts ? correctAttempts / totalAttempts : 0,
    },
    domainStats,
    courseProgress,
    recentAttempts: attempts.slice(0, 15).map((a) => ({
      challengeId: a.challengeId,
      courseSlug: a.courseSlug,
      correct: a.correct,
      pointsAwarded: a.pointsAwarded,
      at: a.createdAt,
    })),
  });
}

/** GET /api/progress/attempts — full attempt history. */
export async function getAttempts(req: Request, res: Response): Promise<void> {
  const attempts = await Attempt.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();
  res.json({
    attempts: attempts.map((a) => ({
      challengeId: a.challengeId,
      courseSlug: a.courseSlug,
      correct: a.correct,
      pointsAwarded: a.pointsAwarded,
      timeMs: a.timeMs,
      hintsUsed: a.hintsUsed,
      at: a.createdAt,
    })),
  });
}
