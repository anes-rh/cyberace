import type { ChallengeDoc } from "../models/Challenge";
import type { CourseDoc } from "../models/Course";
import type { UserDoc } from "../models/User";
import { computeLevel } from "./scoring";

/** Public, answer-free view of a challenge. */
export function serializeChallenge(challenge: ChallengeDoc, user?: UserDoc | null) {
  const solvedEntry = user?.solved.find((s) => s.challengeId === challenge.challengeId);
  const unlocked = new Set(
    user?.unlockedHints.find((h) => h.challengeId === challenge.challengeId)?.indexes ?? []
  );
  const solved = Boolean(solvedEntry);

  return {
    id: challenge.challengeId,
    courseSlug: challenge.courseSlug,
    title: challenge.title,
    order: challenge.order,
    difficulty: challenge.difficulty,
    type: challenge.type,
    prompt: challenge.prompt,
    points: challenge.points,
    timeLimitSec: challenge.timeLimitSec,
    options: challenge.options ?? [],
    widget: challenge.widget ?? null,
    language: challenge.language ?? null,
    starter: challenge.starter ?? null,
    expectedOutput: challenge.expectedOutput ?? null,
    tags: challenge.tags ?? [],
    hints: (challenge.hints ?? []).map((h, index) => {
      const isOpen = solved || unlocked.has(index);
      return {
        index,
        cost: h.cost,
        unlocked: isOpen,
        text: isOpen ? h.text : null,
      };
    }),
    solved,
    solvedPoints: solvedEntry?.points ?? null,
    explanation: solved ? challenge.explanation : null,
  };
}

export function serializeUser(user: UserDoc) {
  const level = computeLevel(user.xp);
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarSeed: user.avatarSeed,
    title: user.title,
    xp: user.xp,
    level,
    badges: user.badges,
    solvedCount: user.solved.length,
    streak: user.streak,
    createdAt: user.createdAt,
  };
}
