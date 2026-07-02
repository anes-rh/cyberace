import { Request, Response } from "express";
import { Checkpoint } from "../models/Checkpoint";
import { Course } from "../models/Course";
import { Challenge } from "../models/Challenge";
import { User } from "../models/User";
import { HttpError } from "../middleware/error";

interface Aggregates {
  courseCount: number;
  challengeCount: number;
  totalPoints: number;
}

/** Build per-checkpoint aggregates from courses + challenges. */
async function buildAggregates(): Promise<{
  byCheckpoint: Map<string, Aggregates>;
  courseToCheckpoint: Map<string, string>;
}> {
  const [courses, challenges] = await Promise.all([
    Course.find({}, "slug checkpoint").lean(),
    Challenge.find({}, "courseSlug points").lean(),
  ]);

  const courseToCheckpoint = new Map<string, string>();
  const byCheckpoint = new Map<string, Aggregates>();
  for (const c of courses) {
    const cp = c.checkpoint || "cybersecurite";
    courseToCheckpoint.set(c.slug, cp);
    const agg = byCheckpoint.get(cp) ?? { courseCount: 0, challengeCount: 0, totalPoints: 0 };
    agg.courseCount += 1;
    byCheckpoint.set(cp, agg);
  }
  for (const ch of challenges) {
    const cp = courseToCheckpoint.get(ch.courseSlug);
    if (!cp) continue;
    const agg = byCheckpoint.get(cp) ?? { courseCount: 0, challengeCount: 0, totalPoints: 0 };
    agg.challengeCount += 1;
    agg.totalPoints += ch.points ?? 0;
    byCheckpoint.set(cp, agg);
  }
  return { byCheckpoint, courseToCheckpoint };
}

/** GET /api/checkpoints */
export async function listCheckpoints(req: Request, res: Response): Promise<void> {
  const [checkpoints, { byCheckpoint, courseToCheckpoint }, user] = await Promise.all([
    Checkpoint.find().sort({ order: 1 }).lean(),
    buildAggregates(),
    req.userId ? User.findById(req.userId) : Promise.resolve(null),
  ]);

  const solvedByCheckpoint = new Map<string, number>();
  if (user) {
    for (const s of user.solved) {
      const cp = courseToCheckpoint.get(s.courseSlug);
      if (cp) solvedByCheckpoint.set(cp, (solvedByCheckpoint.get(cp) ?? 0) + 1);
    }
  }

  const payload = checkpoints.map((cp) => {
    const agg = byCheckpoint.get(cp.slug) ?? { courseCount: 0, challengeCount: 0, totalPoints: 0 };
    const solved = solvedByCheckpoint.get(cp.slug) ?? 0;
    const progress = agg.challengeCount > 0 ? solved / agg.challengeCount : 0;
    return {
      slug: cp.slug,
      title: cp.title,
      order: cp.order,
      status: cp.status,
      icon: cp.icon,
      accent: cp.accent,
      description: cp.description,
      tagline: cp.tagline,
      courseCount: agg.courseCount,
      challengeCount: agg.challengeCount,
      totalPoints: agg.totalPoints,
      solvedCount: solved,
      progress,
      completed: agg.challengeCount > 0 && solved >= agg.challengeCount,
    };
  });

  res.json({ checkpoints: payload });
}

/** GET /api/checkpoints/:slug — includes courses when the checkpoint is active. */
export async function getCheckpoint(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug);
  const checkpoint = await Checkpoint.findOne({ slug }).lean();
  if (!checkpoint) throw new HttpError(404, "Checkpoint introuvable.");

  const [courses, challenges, user] = await Promise.all([
    Course.find({ checkpoint: slug }).sort({ order: 1 }).lean(),
    Challenge.find({}, "challengeId courseSlug points").lean(),
    req.userId ? User.findById(req.userId) : Promise.resolve(null),
  ]);

  const countByCourse = new Map<string, { count: number; points: number }>();
  for (const ch of challenges) {
    const agg = countByCourse.get(ch.courseSlug) ?? { count: 0, points: 0 };
    agg.count += 1;
    agg.points += ch.points ?? 0;
    countByCourse.set(ch.courseSlug, agg);
  }
  const solvedByCourse = new Map<string, number>();
  if (user) for (const s of user.solved) solvedByCourse.set(s.courseSlug, (solvedByCourse.get(s.courseSlug) ?? 0) + 1);

  const coursePayload = courses.map((course) => {
    const agg = countByCourse.get(course.slug) ?? { count: 0, points: 0 };
    const solved = solvedByCourse.get(course.slug) ?? 0;
    return {
      slug: course.slug,
      title: course.title,
      codename: course.codename,
      domain: course.domain,
      theme: course.theme,
      icon: course.icon,
      accent: course.accent,
      order: course.order,
      difficulty: course.difficulty,
      summary: course.summary,
      objectives: course.objectives,
      badge: course.badge,
      challengeCount: agg.count,
      totalPoints: agg.points,
      solvedCount: solved,
      progress: agg.count > 0 ? solved / agg.count : 0,
      badgeEarned: user ? user.badges.includes(course.badge.id) : false,
      completed: agg.count > 0 && solved >= agg.count,
    };
  });

  const solvedTotal = coursePayload.reduce((a, c) => a + c.solvedCount, 0);
  const challengeTotal = coursePayload.reduce((a, c) => a + c.challengeCount, 0);

  res.json({
    checkpoint: {
      slug: checkpoint.slug,
      title: checkpoint.title,
      order: checkpoint.order,
      status: checkpoint.status,
      icon: checkpoint.icon,
      accent: checkpoint.accent,
      description: checkpoint.description,
      tagline: checkpoint.tagline,
    },
    courses: coursePayloadSorted(coursePayload),
    progress: {
      solvedCount: solvedTotal,
      total: challengeTotal,
      ratio: challengeTotal > 0 ? solvedTotal / challengeTotal : 0,
    },
  });
}

function coursePayloadSorted<T extends { order: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => a.order - b.order);
}
