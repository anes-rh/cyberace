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
  /** Capabilities Linux additionnelles pour le conteneur cible (miroir de attackerCapAdd, introduit au Module 24). */
  targetCapAdd?: string[];
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

// ── Projets (checkpoint "cybersecurite-projets") ────────────────
// Système distinct des Courses/Challenges : une session = topologie
// multi-nœuds / multi-réseaux, avec des objectifs validés côté serveur.

export type NodeRole = "attacker" | "firewall" | "waf" | "target" | "database" | "log" | "directory";

/** Un réseau Docker de la topologie (bridge isolé ou non). */
export interface TopologyNetwork {
  name: string; // ex. "external" | "dmz" | "internal"
  cidr: string; // ex. "10.10.0.0/24"
  internal: boolean; // Internal:true = pas d'accès Internet
}

/** Rattachement d'un nœud à un réseau, avec son IP statique. */
export interface NodeNetworkAttachment {
  name: string; // nom du réseau
  ip: string; // IP statique du nœud sur ce réseau (jamais .1 = gateway Docker)
}

/**
 * Route à injecter après démarrage (docker ne route pas entre bridges tout
 * seul) : `ip route add <network> via <viaIp>` sur le conteneur.
 */
export interface PostStartRoute {
  network: string; // CIDR destination, ex. "10.20.0.0/24"
  viaIp: string; // passerelle intermédiaire (IP du firewall sur le réseau source)
}

/** Un port à publier côté hôte (terminal ttyd, HTTP du WAF pour les probes…). */
export interface TopologyPort {
  containerPort: number;
  label: string;
  /** Usage, pour retrouver l'URL par fonction (terminal vs http de probe). */
  kind?: "terminal" | "http";
}

/** Quotas de ressources par nœud (section 14 — les services réels comme MySQL
 *  ont besoin de plus que le quota par défaut d'un lab léger). */
export interface NodeResources {
  memMb?: number; // mémoire max en Mo
  cpu?: number; // fraction de CPU (ex. 0.25)
}

export interface TopologyNode {
  id: string; // "attacker" | "firewall" | "waf" | "webapp" | "db"
  image: string;
  role: NodeRole;
  capAdd?: string[];
  sysctls?: Record<string, string>;
  env?: Record<string, string>; // variables d'environnement (creds DVWA→db, etc.)
  terminal: boolean; // expose un terminal web (ttyd)
  networks: NodeNetworkAttachment[];
  postStartRoutes?: PostStartRoute[];
  ports?: TopologyPort[]; // ports publiés côté hôte
  resources?: NodeResources;
}

export interface ProjectTopology {
  networks: TopologyNetwork[];
  nodes: TopologyNode[];
}

export type ObjectiveKind = "defense" | "attack" | "analysis";
export type ValidationStrategy =
  | "active_probe"
  | "waf_probe"
  | "text_compare"
  | "exec_check"
  | "log_forensics"
  | "cred_check";

/** Bloc de validation — JAMAIS exposé au client (select:false côté modèle). */
export interface ProjectObjectiveValidation {
  strategy: ValidationStrategy;
  spec: Record<string, unknown>; // forme dépendante de la stratégie (voir objectiveValidation.ts)
}

export interface ProjectObjectiveSeed {
  id: string; // slug court, ex. "firewall-dmz-policy"
  projectSlug: string;
  order: number;
  kind: ObjectiveKind;
  title: string;
  description: string;
  points: number;
  dependsOn?: string[]; // ids d'objectifs requis avant déblocage
  /** Intitulés PUBLICS des questions d'un objectif d'analyse (réponses dans `validation`). */
  questions?: { id: string; prompt: string }[];
  /** Indices progressifs, débloqués UN PAR UN toutes les 10 min de session
   *  (déblocage temporel, pas payant : `cost: 0`). */
  hints?: Hint[];
  validation: ProjectObjectiveValidation;
}

/** Une étape de la solution guidée (auto-révélée à la complétion ou à l'expiration). */
export interface ProjectSolutionStep {
  objectiveId: string;
  explanation: string;
  commands: string[];
  expectedLogs?: string;
}
export interface ProjectSolution {
  summary: string;
  steps: ProjectSolutionStep[];
}

export interface ProjectSeed {
  slug: string; // unique
  checkpoint: string; // "cybersecurite-projets"
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  topology: ProjectTopology;
  ttlSec: number;
  objectives: ProjectObjectiveSeed[];
  /** Corrigé complet — JAMAIS exposé dans les listings ; servi seulement par
   *  l'endpoint dédié, une fois le projet terminé OU le temps écoulé. */
  solution: ProjectSolution;
}
