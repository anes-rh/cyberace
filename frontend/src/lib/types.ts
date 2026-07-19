export type Difficulty = "easy" | "medium" | "hard" | "insane";
export type ChallengeType = "text" | "mcq" | "multi" | "numeric" | "order" | "code";
export type CodeLanguage = "pseudo" | "c" | "bash" | "sql";
export type CheckpointStatus = "empty" | "active";

export interface CheckpointSummary {
  slug: string;
  title: string;
  order: number;
  status: CheckpointStatus;
  icon: string;
  accent: string;
  description: string;
  tagline: string;
  courseCount: number;
  challengeCount: number;
  totalPoints: number;
  solvedCount: number;
  progress: number;
  completed: boolean;
  /** Parent checkpoint slug for a mini-checkpoint; null for top-level. */
  parent?: string | null;
}

export interface CheckpointDetail {
  checkpoint: {
    slug: string;
    title: string;
    order: number;
    status: CheckpointStatus;
    icon: string;
    accent: string;
    description: string;
    tagline: string;
    parent?: string | null;
  };
  courses: CourseSummary[];
  /** Present when this checkpoint is a hub of mini-checkpoints. */
  children?: CheckpointSummary[];
  progress: { solvedCount: number; total: number; ratio: number };
}

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
  avatarUrl?: string | null;
  usernameChangedAt?: string | null;
  passwordChangedAt?: string | null;
  title: string;
  xp: number;
  level: LevelInfo;
  badges: string[];
  solvedCount: number;
  streak: number;
  createdAt: string;
  role: "user" | "admin";
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
  language: CodeLanguage | null;
  starter: string | null;
  expectedOutput: string | null;
  tags: string[];
  hints: Hint[];
  solved: boolean;
  solvedPoints: number | null;
  explanation: string | null;
  /** Wrong attempts already made on this challenge (drives the penalty). */
  errorCount?: number;
  /** Points still winnable right now (base − 20%×errorCount, floored at 0). */
  pointsPossible?: number;
}

export interface SandboxPort {
  containerPort: number;
  label: string;
}

export interface SandboxNetwork {
  subnet: string;
  gateway: string;
}

export interface SandboxConfig {
  attackerImage: string;
  targetImage?: string;
  ttlSec: number;
  attackerCapAdd?: string[];
  targetCapAdd?: string[];
  ports: SandboxPort[];
  network?: SandboxNetwork;
  targetStaticIp?: string;
  attackerStaticIp?: string;
}

export interface CourseDetail {
  course: {
    slug: string;
    title: string;
    checkpoint?: string;
    codename: string;
    domain: string;
    theme: string;
    icon: string;
    accent: string;
    difficulty: Difficulty;
    summary: string;
    objectives: string[];
    lesson: string;
    videos?: CourseVideo[];
    resources?: CourseResource[];
    sandbox?: SandboxConfig;
    badge: Badge;
  };
  challenges: Challenge[];
  progress: { solvedCount: number; total: number; ratio: number; badgeEarned: boolean };
}

export interface CourseVideo {
  title: string;
  youtubeId: string;
  moreUrl?: string;
}

export interface CourseResource {
  label: string;
  url: string;
  kind: "installer" | "pkt-start" | "pkt-solution" | "link";
  os?: "win" | "linux" | "mac";
  note?: string;
}

export interface LabItem extends Challenge {
  course: { slug: string; codename: string; accent: string; icon: string; domain: string } | null;
}

export interface SubmitResult {
  correct: boolean;
  alreadySolved?: boolean;
  awarded?: number;
  breakdown?: { base: number; speedBonus: number; hintPenalty: number; errorPenalty?: number; errorCount?: number };
  explanation?: string;
  level?: LevelInfo;
  newBadge?: Badge | null;
  courseCompleted?: boolean;
  /** Wrong attempts so far after this submission (on a wrong answer). */
  errorCount?: number;
  /** Points winnable on the NEXT attempt (on a wrong answer). */
  pointsPossible?: number;
  /** `code` challenges: pedagogical keypoint feedback on a wrong submission. */
  feedback?: { missing: string[]; matched: number; total: number };
}

export interface ExecuteResult {
  compile: { stdout: string; stderr: string; code: number | null } | null;
  run: { stdout: string; stderr: string; code: number | null; signal: string | null } | null;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName: string;
  avatarSeed: string;
  avatarUrl?: string | null;
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
