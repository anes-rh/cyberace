import { Request, Response } from "express";
import { Types } from "mongoose";
import { Challenge } from "../models/Challenge";
import { Course } from "../models/Course";
import { User } from "../models/User";
import { Attempt } from "../models/Attempt";
import { serializeChallenge } from "../utils/serialize";
import { checkAnswer, codeFeedback } from "../utils/answer";
import { computeAward, computeLevel, pointsForAttempt } from "../utils/scoring";
import { HttpError } from "../middleware/error";

/** Number of wrong attempts a user has already made on a challenge. */
function countErrors(userId: Types.ObjectId, challengeId: string): Promise<number> {
  return Attempt.countDocuments({ user: userId, challengeId, correct: false });
}

/** GET /api/labs — flat list of all challenges (optional filters). */
export async function listLabs(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> = {};
  if (req.query.courseSlug) filter.courseSlug = String(req.query.courseSlug);
  if (req.query.difficulty) filter.difficulty = String(req.query.difficulty);

  const [challenges, courses, user] = await Promise.all([
    Challenge.find(filter).sort({ courseSlug: 1, order: 1 }),
    Course.find({}, "slug codename accent icon domain theme").lean(),
    req.userId ? User.findById(req.userId) : Promise.resolve(null),
  ]);

  const courseMap = new Map(courses.map((c) => [c.slug, c]));
  const labs = challenges.map((c) => {
    const meta = courseMap.get(c.courseSlug);
    return {
      ...serializeChallenge(c, user),
      course: meta
        ? { slug: meta.slug, codename: meta.codename, accent: meta.accent, icon: meta.icon, domain: meta.domain }
        : null,
    };
  });

  res.json({ labs });
}

/** GET /api/labs/:challengeId */
export async function getLab(req: Request, res: Response): Promise<void> {
  const challengeId = String(req.params.challengeId);
  const [challenge, user] = await Promise.all([
    Challenge.findOne({ challengeId }),
    req.userId ? User.findById(req.userId) : Promise.resolve(null),
  ]);
  if (!challenge) throw new HttpError(404, "Challenge introuvable.");

  const course = await Course.findOne(
    { slug: challenge.courseSlug },
    "slug title codename accent icon domain theme"
  ).lean();

  // How many wrong attempts so far → drives the "points possibles" display.
  const errorCount = user ? await countErrors(user._id, challengeId) : 0;
  const pointsPossible = pointsForAttempt(challenge.points, errorCount);

  res.json({
    challenge: { ...serializeChallenge(challenge, user), errorCount, pointsPossible },
    course,
  });
}

/** POST /api/labs/:challengeId/hint  { index } */
export async function unlockHint(req: Request, res: Response): Promise<void> {
  const challengeId = String(req.params.challengeId);
  const index = Number(req.body?.index);

  const challenge = await Challenge.findOne({ challengeId });
  if (!challenge) throw new HttpError(404, "Challenge introuvable.");
  if (Number.isNaN(index) || index < 0 || index >= challenge.hints.length) {
    throw new HttpError(400, "Indice inexistant.");
  }

  const user = await User.findById(req.userId);
  if (!user) throw new HttpError(404, "Utilisateur introuvable.");

  const entryIndex = user.unlockedHints.findIndex((h) => h.challengeId === challengeId);
  if (entryIndex === -1) {
    user.unlockedHints.push({ challengeId, indexes: [index] });
    user.markModified("unlockedHints");
    await user.save();
  } else if (!user.unlockedHints[entryIndex].indexes.includes(index)) {
    user.unlockedHints[entryIndex].indexes.push(index);
    user.markModified("unlockedHints");
    await user.save();
  }

  const hint = challenge.hints[index];
  res.json({ index, text: hint.text, cost: hint.cost });
}

/** POST /api/labs/:challengeId/submit  { answer, timeMs } */
export async function submitAnswer(req: Request, res: Response): Promise<void> {
  const challengeId = String(req.params.challengeId);
  const { answer, timeMs } = req.body ?? {};

  const challenge = await Challenge.findOne({ challengeId }).select(
    "+answer +accept +caseSensitive"
  );
  if (!challenge) throw new HttpError(404, "Challenge introuvable.");

  const user = await User.findById(req.userId);
  if (!user) throw new HttpError(404, "Utilisateur introuvable.");

  const already = user.solved.find((s) => s.challengeId === challengeId);
  if (already) {
    res.json({
      correct: true,
      alreadySolved: true,
      explanation: challenge.explanation,
      awarded: already.points,
      level: computeLevel(user.xp),
    });
    return;
  }

  const correct = checkAnswer(challenge, answer);

  // Record every attempt for history/statistics.
  const unlocked =
    user.unlockedHints.find((h) => h.challengeId === challengeId)?.indexes ?? [];
  const hintCost = unlocked.reduce(
    (sum, i) => sum + (challenge.hints[i]?.cost ?? 0),
    0
  );
  const safeTimeMs =
    Number(timeMs) > 0 ? Number(timeMs) : challenge.timeLimitSec * 1000;

  if (!correct) {
    await Attempt.create({
      user: user._id,
      challengeId,
      courseSlug: challenge.courseSlug,
      correct: false,
      pointsAwarded: 0,
      timeMs: safeTimeMs,
      hintsUsed: unlocked.length,
      submitted: typeof answer === "string" ? answer.slice(0, 120) : JSON.stringify(answer).slice(0, 120),
    });
    // Total errors so far (incl. the one just recorded) → points left for the
    // NEXT attempt. -20% of base per error, down to 0 at 5 errors.
    const errorCount = await countErrors(user._id, challengeId);
    const pointsPossible = pointsForAttempt(challenge.points, errorCount);
    // Code challenges: tell the player WHICH expected keypoints are missing
    // (pedagogical labels only — the solution itself never leaves the server).
    const feedback =
      challenge.type === "code" ? (() => { const fb = codeFeedback(challenge, answer); return { missing: fb.missing, matched: fb.matched, total: fb.total }; })() : undefined;
    res.json({ correct: false, errorCount, pointsPossible, ...(feedback ? { feedback } : {}) });
    return;
  }

  // Errors made BEFORE this correct answer (no false attempt is logged now).
  const errorCount = await countErrors(user._id, challengeId);
  const { awarded, speedBonus, hintPenalty, errorPenalty } = computeAward({
    basePoints: challenge.points,
    timeLimitSec: challenge.timeLimitSec,
    timeMs: safeTimeMs,
    hintCost,
    errorCount,
  });

  user.solved.push({
    challengeId,
    courseSlug: challenge.courseSlug,
    points: awarded,
    timeMs: safeTimeMs,
    hintsUsed: unlocked.length,
    at: new Date(),
  });
  user.xp += awarded;
  user.title = computeLevel(user.xp).title;

  // Award the course badge when every challenge of the course is solved.
  let newBadge: { id: string; name: string; icon: string; description: string } | null = null;
  const [totalInCourse, course] = await Promise.all([
    Challenge.countDocuments({ courseSlug: challenge.courseSlug }),
    Course.findOne({ slug: challenge.courseSlug }).lean(),
  ]);
  const solvedInCourse = user.solved.filter(
    (s) => s.courseSlug === challenge.courseSlug
  ).length;
  if (course && solvedInCourse >= totalInCourse && !user.badges.includes(course.badge.id)) {
    user.badges.push(course.badge.id);
    newBadge = course.badge;
  }

  await user.save();
  await Attempt.create({
    user: user._id,
    challengeId,
    courseSlug: challenge.courseSlug,
    correct: true,
    pointsAwarded: awarded,
    timeMs: safeTimeMs,
    hintsUsed: unlocked.length,
    submitted: typeof answer === "string" ? answer.slice(0, 120) : JSON.stringify(answer).slice(0, 120),
  });

  res.json({
    correct: true,
    awarded,
    breakdown: { base: challenge.points, speedBonus, hintPenalty, errorPenalty, errorCount },
    explanation: challenge.explanation,
    level: computeLevel(user.xp),
    newBadge,
    courseCompleted: Boolean(newBadge),
  });
}
