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

/**
 * Compute points awarded for a correct solve.
 *  - Speed bonus: up to +30% for solving well under the reference time.
 *  - Hint penalty: subtract the cost of every hint that was unlocked.
 *  - Floor: a correct answer always keeps at least 10% of the base points.
 */
export function computeAward(params: {
  basePoints: number;
  timeLimitSec: number;
  timeMs: number;
  hintCost: number;
}): { awarded: number; speedBonus: number; hintPenalty: number } {
  const { basePoints, timeLimitSec, timeMs, hintCost } = params;
  const timeSec = timeMs / 1000;
  const ratio = timeLimitSec > 0 ? Math.max(0, (timeLimitSec - timeSec) / timeLimitSec) : 0;
  const speedBonus = Math.round(basePoints * 0.3 * ratio);
  const hintPenalty = Math.max(0, Math.round(hintCost));
  const floor = Math.round(basePoints * 0.1);
  const awarded = Math.max(floor, basePoints + speedBonus - hintPenalty);
  return { awarded, speedBonus, hintPenalty };
}
