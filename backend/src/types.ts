/** Shared domain types for content seeds and API payloads. */

export type Difficulty = "easy" | "medium" | "hard" | "insane";

export type ChallengeType = "text" | "mcq" | "multi" | "numeric" | "order";

export interface Hint {
  text: string;
  cost: number;
}

export interface ChallengeSeed {
  id: string;
  title: string;
  order: number;
  difficulty: Difficulty;
  type: ChallengeType;
  /** Markdown statement shown to the player. */
  prompt: string;
  points: number;
  /** Reference time in seconds; solving faster grants a speed bonus. */
  timeLimitSec: number;
  hints: Hint[];
  /** Options for mcq / multi / order challenges. */
  options?: string[];
  /**
   * Canonical answer (server-only, never serialised to clients):
   *  - text:    string
   *  - numeric: number
   *  - mcq:     number (option index)
   *  - multi:   number[] (option indexes)
   *  - order:   number[] (indexes in correct order)
   */
  answer: string | number | number[];
  /** Extra accepted strings for `text` challenges. */
  accept?: string[];
  caseSensitive?: boolean;
  /** Optional interactive helper widget rendered on the client. */
  widget?: string;
  /** Shown after the challenge is solved. */
  explanation: string;
  tags?: string[];
}

export interface BadgeSeed {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface CourseSeed {
  slug: string;
  title: string;
  /** Race-style codename, e.g. "Crypto Circuit". */
  codename: string;
  domain: string;
  /** Visual theme key consumed by the frontend. */
  theme: string;
  /** lucide-react icon name. */
  icon: string;
  /** Accent colour (hex). */
  accent: string;
  order: number;
  difficulty: Difficulty;
  summary: string;
  objectives: string[];
  /** Markdown mini-course. */
  lesson: string;
  badge: BadgeSeed;
  challenges: ChallengeSeed[];
}

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  easy: 100,
  medium: 200,
  hard: 350,
  insane: 550,
};
