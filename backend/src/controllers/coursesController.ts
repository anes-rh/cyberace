import { Request, Response } from "express";
import { Course } from "../models/Course";
import { Challenge } from "../models/Challenge";
import { User } from "../models/User";
import { serializeChallenge } from "../utils/serialize";
import { HttpError } from "../middleware/error";

export async function listCourses(req: Request, res: Response): Promise<void> {
  const [courses, challenges, user] = await Promise.all([
    Course.find().sort({ order: 1 }).lean(),
    Challenge.find({}, "challengeId courseSlug points difficulty").lean(),
    req.userId ? User.findById(req.userId) : Promise.resolve(null),
  ]);

  const byCourse = new Map<string, { count: number; points: number }>();
  for (const c of challenges) {
    const agg = byCourse.get(c.courseSlug) ?? { count: 0, points: 0 };
    agg.count += 1;
    agg.points += c.points ?? 0;
    byCourse.set(c.courseSlug, agg);
  }

  const solvedByCourse = new Map<string, number>();
  if (user) {
    for (const s of user.solved) {
      solvedByCourse.set(s.courseSlug, (solvedByCourse.get(s.courseSlug) ?? 0) + 1);
    }
  }

  const payload = courses.map((course) => {
    const agg = byCourse.get(course.slug) ?? { count: 0, points: 0 };
    const solvedCount = solvedByCourse.get(course.slug) ?? 0;
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
      solvedCount,
      progress: agg.count > 0 ? solvedCount / agg.count : 0,
      badgeEarned: user ? user.badges.includes(course.badge.id) : false,
      completed: agg.count > 0 && solvedCount >= agg.count,
    };
  });

  res.json({ courses: payload });
}

export async function getCourse(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug);
  const [course, challenges, user] = await Promise.all([
    Course.findOne({ slug }).lean(),
    Challenge.find({ courseSlug: slug }).sort({ order: 1 }),
    req.userId ? User.findById(req.userId) : Promise.resolve(null),
  ]);

  if (!course) throw new HttpError(404, "Course introuvable.");

  const serialized = challenges.map((c) => serializeChallenge(c, user));
  const solvedCount = serialized.filter((c) => c.solved).length;

  res.json({
    course: {
      slug: course.slug,
      title: course.title,
      codename: course.codename,
      domain: course.domain,
      theme: course.theme,
      icon: course.icon,
      accent: course.accent,
      difficulty: course.difficulty,
      summary: course.summary,
      objectives: course.objectives,
      lesson: course.lesson,
      badge: course.badge,
    },
    challenges: serialized,
    progress: {
      solvedCount,
      total: serialized.length,
      ratio: serialized.length ? solvedCount / serialized.length : 0,
      badgeEarned: user ? user.badges.includes(course.badge.id) : false,
    },
  });
}
