export type Difficulty = "easy" | "medium" | "hard" | "insane";
export type ChallengeType = "text" | "mcq" | "multi" | "numeric" | "order";

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  levelFloor: number;
  nextLevelXp: number | null;
  progress: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarSeed: string;
  title: string;
  xp: number;
  level: LevelInfo;
  badges: string[];
  solvedCount: number;
  streak: number;
  createdAt: string;
}

export interface CourseSummary {
  slug: string;
  title: string;
  codename: string;
  domain: string;
  theme: string;
  icon: string;
  accent: string;
  order: number;
  difficulty: Difficulty;
  summary: string;
  objectives: string[];
  badge: Badge;
  challengeCount: number;
  totalPoints: number;
  solvedCount: number;
  progress: number;
  badgeEarned: boolean;
  completed: boolean;
}

export interface Hint {
  index: number;
  cost: number;
  unlocked: boolean;
  text: string | null;
}

export interface Challenge {
  id: string;
  courseSlug: string;
  title: string;
  order: number;
  difficulty: Difficulty;
  type: ChallengeType;
  prompt: string;
  points: number;
  timeLimitSec: number;
  options: string[];
  widget: string | null;
  tags: string[];
  hints: Hint[];
  solved: boolean;
  solvedPoints: number | null;
  explanation: string | null;
}

export interface CourseDetail {
  course: {
    slug: string;
    title: string;
    codename: string;
    domain: string;
    theme: string;
    icon: string;
    accent: string;
    difficulty: Difficulty;
    summary: string;
    objectives: string[];
    lesson: string;
    badge: Badge;
  };
  challenges: Challenge[];
  progress: { solvedCount: number; total: number; ratio: number; badgeEarned: boolean };
}

export interface LabItem extends Challenge {
  course: { slug: string; codename: string; accent: string; icon: string; domain: string } | null;
}

export interface SubmitResult {
  correct: boolean;
  alreadySolved?: boolean;
  awarded?: number;
  breakdown?: { base: number; speedBonus: number; hintPenalty: number };
  explanation?: string;
  level?: LevelInfo;
  newBadge?: Badge | null;
  courseCompleted?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName: string;
  avatarSeed: string;
  xp: number;
  level: number;
  title: string;
  badges: number;
  solvedCount: number;
}

export interface DomainStat {
  domain: string;
  solved: number;
  total: number;
  completion: number;
  successRate: number;
  attempts: number;
}

export interface CourseProgress {
  slug: string;
  codename: string;
  accent: string;
  icon: string;
  solved: number;
  total: number;
  badge: Badge;
  badgeEarned: boolean;
}

export interface ProgressPayload {
  user: User;
  level: LevelInfo;
  stats: {
    xp: number;
    solvedCount: number;
    totalChallenges: number;
    badges: number;
    streak: number;
    avgTimeMs: number;
    totalAttempts: number;
    successRate: number;
  };
  domainStats: DomainStat[];
  courseProgress: CourseProgress[];
  recentAttempts: {
    challengeId: string;
    courseSlug: string;
    correct: boolean;
    pointsAwarded: number;
    at: string;
  }[];
}
