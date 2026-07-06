export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  levelFloor: number;
  nextLevelXp: number | null;
  progress: number; // 0..1 towards next level
}

/** Race-themed progression ladder. */
export const LEVELS: { level: number; min: number; title: string }[] = [
  { level: 1, min: 0, title: "Recrue" },
  { level: 2, min: 250, title: "Cadet" },
  { level: 3, min: 600, title: "Pilote" },
  { level: 4, min: 1100, title: "Coureur" },
  { level: 5, min: 1800, title: "Analyste" },
  { level: 6, min: 2800, title: "Vétéran" },
  { level: 7, min: 4200, title: "As" },
  { level: 8, min: 6000, title: "Élite" },
  { level: 9, min: 8500, title: "Maître" },
  { level: 10, min: 12000, title: "Légende" },
];

export function computeLevel(xp: number): LevelInfo {
  let current = LEVELS[0];
  let next: (typeof LEVELS)[number] | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  const nextLevelXp = next ? next.min : null;
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.min(1, (xp - current.min) / span) : 1;
  return {
    level: current.level,
    title: current.title,
    currentXp: xp,
    levelFloor: current.min,
    nextLevelXp,
    progress,
  };
}

/** -20% of the base points per wrong attempt made before solving. */
export const ERROR_PENALTY_RATE = 0.2;

/**
 * Effective base points still up for grabs after `errorCount` wrong attempts.
 * Linear decay of 20% of the ORIGINAL base per error: 100% → 80% → … → 0%.
 * Reaches 0 at 5 errors and never goes negative. This is THE single source of
 * truth for the "points possibles" shown to the user and for crediting XP.
 */
export function pointsForAttempt(basePoints: number, errorCount: number): number {
  const factor = Math.max(0, 1 - ERROR_PENALTY_RATE * Math.max(0, errorCount));
  return Math.round(basePoints * factor);
}

/**
 * Compute points awarded for a correct solve.
 *  - Error penalty: -20% of the base per wrong attempt on THIS challenge
 *    (dégressif linéaire jusqu'à 0). Applied centrally so every checkpoint /
 *    challenge type behaves the same.
 *  - Speed bonus: up to +30% for solving well under the reference time
 *    (scaled by the same error factor, so it also vanishes once base hits 0).
 *  - Hint penalty: subtract the cost of every hint that was unlocked.
 *  - Floor at 0: a solve after 5+ errors credits 0 pt but still counts as done.
 */
export function computeAward(params: {
  basePoints: number;
  timeLimitSec: number;
  timeMs: number;
  hintCost: number;
  errorCount?: number;
}): { awarded: number; speedBonus: number; hintPenalty: number; errorPenalty: number; effectiveBase: number } {
  const { basePoints, timeLimitSec, timeMs, hintCost } = params;
  const errorCount = Math.max(0, params.errorCount ?? 0);
  const factor = Math.max(0, 1 - ERROR_PENALTY_RATE * errorCount);

  const effectiveBase = Math.round(basePoints * factor);
  const errorPenalty = basePoints - effectiveBase;

  const timeSec = timeMs / 1000;
  const ratio = timeLimitSec > 0 ? Math.max(0, (timeLimitSec - timeSec) / timeLimitSec) : 0;
  const speedBonus = Math.round(basePoints * 0.3 * ratio * factor);
  const hintPenalty = Math.max(0, Math.round(hintCost));

  const awarded = Math.max(0, effectiveBase + speedBonus - hintPenalty);
  return { awarded, speedBonus, hintPenalty, errorPenalty, effectiveBase };
}
