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

const ZERO: Aggregates = { courseCount: 0, challengeCount: 0, totalPoints: 0 };

/** Build per-checkpoint aggregates (courses + challenges), keyed by the course's own checkpoint slug. */
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
    const agg = byCheckpoint.get(cp) ?? { ...ZERO };
    agg.courseCount += 1;
    byCheckpoint.set(cp, agg);
  }
  for (const ch of challenges) {
    const cp = courseToCheckpoint.get(ch.courseSlug);
    if (!cp) continue;
    const agg = byCheckpoint.get(cp) ?? { ...ZERO };
    agg.challengeCount += 1;
    agg.totalPoints += ch.points ?? 0;
    byCheckpoint.set(cp, agg);
  }
  return { byCheckpoint, courseToCheckpoint };
}

/** Count solved challenges per checkpoint slug for the given user. */
function solvedPerCheckpoint(user: { solved: { courseSlug: string }[] } | null, courseToCheckpoint: Map<string, string>) {
  const solved = new Map<string, number>();
  if (user) {
    for (const s of user.solved) {
      const cp = courseToCheckpoint.get(s.courseSlug);
      if (cp) solved.set(cp, (solved.get(cp) ?? 0) + 1);
    }
  }
  return solved;
}

/** GET /api/checkpoints — only TOP-LEVEL checkpoints; a parent aggregates its children. */
export async function listCheckpoints(req: Request, res: Response): Promise<void> {
  const [checkpoints, { byCheckpoint, courseToCheckpoint }, user] = await Promise.all([
    Checkpoint.find().sort({ order: 1 }).lean(),
    buildAggregates(),
    req.userId ? User.findById(req.userId) : Promise.resolve(null),
  ]);

  const solvedByCp = solvedPerCheckpoint(user, courseToCheckpoint);
  const childrenOf = new Map<string, string[]>();
  for (const cp of checkpoints) {
    if (cp.parent) childrenOf.set(cp.parent, [...(childrenOf.get(cp.parent) ?? []), cp.slug]);
  }

  /** Effective aggregate = own + every child (2-level hierarchy). */
  const effectiveAgg = (slug: string): Aggregates => {
    const own = byCheckpoint.get(slug) ?? ZERO;
    const agg: Aggregates = { ...own };
    for (const child of childrenOf.get(slug) ?? []) {
      const c = byCheckpoint.get(child) ?? ZERO;
      agg.courseCount += c.courseCount;
      agg.challengeCount += c.challengeCount;
      agg.totalPoints += c.totalPoints;
    }
    return agg;
  };
  const effectiveSolved = (slug: string): number => {
    let s = solvedByCp.get(slug) ?? 0;
    for (const child of childrenOf.get(slug) ?? []) s += solvedByCp.get(child) ?? 0;
    return s;
  };

  const payload = checkpoints
    .filter((cp) => !cp.parent) // main roadmap = top-level only
    .map((cp) => {
      const agg = effectiveAgg(cp.slug);
      const solved = effectiveSolved(cp.slug);
      return {
        slug: cp.slug,
        title: cp.title,
        order: cp.order,
        status: cp.status,
        icon: cp.icon,
        accent: cp.accent,
        description: cp.description,
        tagline: cp.tagline,
        parent: cp.parent ?? null,
        courseCount: agg.courseCount,
        challengeCount: agg.challengeCount,
        totalPoints: agg.totalPoints,
        solvedCount: solved,
        progress: agg.challengeCount > 0 ? solved / agg.challengeCount : 0,
        completed: agg.challengeCount > 0 && solved >= agg.challengeCount,
      };
    });

  res.json({ checkpoints: payload });
}

/** Shape of a checkpoint summary card (used for children / mini-checkpoints). */
function checkpointSummary(cp: { slug: string; title: string; order: number; status: string; icon: string; accent: string; description: string; tagline: string; parent?: string | null }, agg: Aggregates, solved: number) {
  return {
    slug: cp.slug,
    title: cp.title,
    order: cp.order,
    status: cp.status,
    icon: cp.icon,
    accent: cp.accent,
    description: cp.description,
    tagline: cp.tagline,
    parent: cp.parent ?? null,
    courseCount: agg.courseCount,
    challengeCount: agg.challengeCount,
    totalPoints: agg.totalPoints,
    solvedCount: solved,
    progress: agg.challengeCount > 0 ? solved / agg.challengeCount : 0,
    completed: agg.challengeCount > 0 && solved >= agg.challengeCount,
  };
}

/**
 * GET /api/checkpoints/:slug
 *  - If the checkpoint has children (mini-checkpoints) → returns `children` cards.
 *  - Otherwise → returns its `courses`.
 */
export async function getCheckpoint(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug);
  const checkpoint = await Checkpoint.findOne({ slug }).lean();
  if (!checkpoint) throw new HttpError(404, "Checkpoint introuvable.");

  const [children, courses, challenges, user] = await Promise.all([
    Checkpoint.find({ parent: slug }).sort({ order: 1 }).lean(),
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

  // Build children (mini-checkpoint) cards + roll their progress into this checkpoint.
  let childrenPayload: ReturnType<typeof checkpointSummary>[] | undefined;
  let childSolved = 0;
  let childTotal = 0;
  if (children.length) {
    const { byCheckpoint, courseToCheckpoint } = await buildAggregates();
    const solvedByCp = solvedPerCheckpoint(user, courseToCheckpoint);
    childrenPayload = children.map((ch) => {
      const agg = byCheckpoint.get(ch.slug) ?? ZERO;
      const solved = solvedByCp.get(ch.slug) ?? 0;
      childSolved += solved;
      childTotal += agg.challengeCount;
      return checkpointSummary(ch, agg, solved);
    });
  }

  const ownSolved = coursePayload.reduce((a, c) => a + c.solvedCount, 0);
  const ownTotal = coursePayload.reduce((a, c) => a + c.challengeCount, 0);
  const solvedTotal = ownSolved + childSolved;
  const challengeTotal = ownTotal + childTotal;

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
      parent: checkpoint.parent ?? null,
    },
    courses: [...coursePayload].sort((a, b) => a.order - b.order),
    children: childrenPayload,
    progress: {
      solvedCount: solvedTotal,
      total: challengeTotal,
      ratio: challengeTotal > 0 ? solvedTotal / challengeTotal : 0,
    },
  });
}
