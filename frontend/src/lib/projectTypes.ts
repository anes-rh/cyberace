// Types du système de Projets (distinct des Courses/Challenges).

export type Difficulty = "easy" | "medium" | "hard" | "insane";
export type NodeRole =
  | "attacker"
  | "firewall"
  | "waf"
  | "target"
  | "database"
  | "log"
  | "directory"
  | "pipeline"
  | "registry"
  | "cloud";
export type ObjectiveKind = "defense" | "attack" | "analysis";
export type ObjectiveStatus = "locked" | "available" | "completed";

export interface TopologyNetwork {
  name: string;
  cidr: string;
  internal: boolean;
}
export interface TopologyNodeView {
  id: string;
  role: NodeRole;
  terminal: boolean;
  networks: { name: string; ip: string }[];
}
export interface ProjectTopology {
  networks: TopologyNetwork[];
  nodes: TopologyNodeView[];
}

export interface ProjectSummary {
  slug: string;
  checkpoint: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  status: "not_started" | "in_progress" | "completed";
  totalPoints: number;
}

export interface ProjectObjectiveView {
  id: string;
  order: number;
  kind: ObjectiveKind;
  title: string;
  description: string;
  points: number;
  dependsOn: string[];
  questions?: { id: string; prompt: string }[];
  completed?: boolean;
  status?: ObjectiveStatus;
}

export interface ProjectProgressView {
  status: "in_progress" | "completed";
  totalPoints: number;
  completedObjectives: { objectiveId: string; kind: ObjectiveKind; completedAt: string; points: number }[];
  solutionRevealed?: boolean;
}

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

export interface ProjectDetail {
  project: {
    slug: string;
    checkpoint: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    estimatedMinutes: number;
    topology: ProjectTopology;
  };
  objectives: ProjectObjectiveView[];
  progress: ProjectProgressView | null;
}

export interface ProjectSessionView {
  status: "starting" | "running" | "stopping" | "stopped" | "error";
  startedAt: string;
  expiresAt: string;
  remainingSec: number;
  terminalUrls: { nodeId: string; url: string }[];
}

export interface ValidateResult {
  ok: boolean;
  points?: number;
  detail?: string;
  alreadyCompleted?: boolean;
}
