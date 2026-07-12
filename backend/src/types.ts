/** Shared domain types for content seeds and API payloads. */

export type Difficulty = "easy" | "medium" | "hard" | "insane";

export type ChallengeType = "text" | "mcq" | "multi" | "numeric" | "order" | "code";

/** Language of a `code` challenge editor. */
export type CodeLanguage = "pseudo" | "c" | "bash" | "sql";

/**
 * Canonical grading payload for `code` challenges, stored as a JSON string in
 * `answer`: each keypoint regex must match the submission (comments stripped)
 * unless `minRatio` (< 1) relaxes it. `label` is safe to show the player as
 * feedback — it must describe the expectation, never reveal the solution.
 * Example answer value:
 * `JSON.stringify({ keypoints: [{ label: "Déclare un compteur entier", pattern: "Var[\\s\\S]*?:\\s*entier", flags: "i" }], minRatio: 1 })`
 */
export interface CodeKeypoint {
  label: string;
  pattern: string;
  flags?: string;
}

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
  /** `code` challenges: editor language (pseudo-code CyberAce ou C). */
  language?: CodeLanguage;
  /** `code` challenges: starter skeleton pre-filled in the editor. */
  starter?: string;
  /** `code` (C) challenges: expected stdout used by the run-feedback loop. */
  expectedOutput?: string;
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

/** An embedded YouTube lesson shown on a course/TP page. */
export interface CourseVideo {
  title: string;
  /** YouTube video id (the `v=` part), e.g. "0lZo5CWndTY". */
  youtubeId: string;
  /** Optional extra "pour aller plus loin" playlist/URL. */
  moreUrl?: string;
}

/** A downloadable resource (Packet Tracer installer, .pkt topology, link…). */
export interface CourseResource {
  label: string;
  url: string;
  /**
   * installer  : Packet Tracer setup (paired with `os` for the OS selector)
   * pkt-start  : starting .pkt topology to download
   * pkt-solution: solution .pkt to compare against
   * link       : any external resource
   */
  kind: "installer" | "pkt-start" | "pkt-solution" | "link";
  /** For installers: which OS this file targets. */
  os?: "win" | "linux" | "mac";
  note?: string;
}

export type CheckpointStatus = "empty" | "active";

export interface CheckpointSeed {
  slug: string;
  title: string;
  order: number;
  status: CheckpointStatus;
  /** lucide-react icon name. */
  icon: string;
  /** Pastel accent colour (hex). */
  accent: string;
  description: string;
  /** Short line shown on the roadmap station. */
  tagline: string;
  /**
   * Parent checkpoint slug for a "mini-checkpoint" (sub-route). Top-level
   * checkpoints on the main roadmap leave this undefined. A parent's progress
   * aggregates all of its children's modules.
   */
  parent?: string;
}

export interface SandboxPort {
  containerPort: number;
  label: string; // ex. "Terminal web (ttyd)"
}

export interface SandboxNetwork {
  subnet: string; // ex. "10.55.0.0/24"
  gateway: string; // ex. "10.55.0.1"
}

export interface SandboxConfig {
  /** Image Docker de l'attaquant, partagée entre tous les modules pratiques. */
  attackerImage: string;
  /** Image Docker de la cible, spécifique à ce module. Absent = mode mono-conteneur (l'attaquant EST l'environnement). */
  targetImage?: string;
  /** Durée de vie max de la session avant nettoyage forcé. */
  ttlSec: number;
  /** Capabilities Linux additionnelles à donner au conteneur attaquant (jamais à la cible). */
  attackerCapAdd?: string[];
  /** Port(s) à publier côté attaquant (typiquement le terminal web). */
  ports: SandboxPort[];
  /** Sous-réseau dédié avec IP statiques. Absent = comportement Module 1 (IPAM auto). */
  network?: SandboxNetwork;
  /** IP statique du conteneur cible, utilisée seulement si `network` est défini. */
  targetStaticIp?: string;
  /** IP statique du conteneur attaquant, utilisée seulement si `network` est défini. */
  attackerStaticIp?: string;
}

export interface CourseSeed {
  slug: string;
  title: string;
  /** Top-level checkpoint this course belongs to (defaults to "cybersecurite"). */
  checkpoint?: string;
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
  /** Embedded YouTube lessons (TP pages especially). */
  videos?: CourseVideo[];
  /** Downloadable resources: PT installers, .pkt files, links. */
  resources?: CourseResource[];
  /** Practical courses only: the Docker sandbox started for the whole course. */
  sandbox?: SandboxConfig;
  badge: BadgeSeed;
  challenges: ChallengeSeed[];
}

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  easy: 100,
  medium: 200,
  hard: 350,
  insane: 550,
};
