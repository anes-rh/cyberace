/** Types miroir des réponses de l'API admin (`/api/admin/*`). */

export interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  runningSandboxSessions: number;
  activeProjectSessions: number;
  solvedToday: number;
}

export interface AdminUserRow {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  xp: number;
  level: number;
  createdAt: string;
  lastActive: string;
}

export interface AdminUsersPage {
  users: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminUserDetail {
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatarSeed: string;
    avatarUrl: string | null;
    title: string;
    role: "user" | "admin";
    xp: number;
    level: { level: number; title: string };
    badges: string[];
    streak: number;
    solvedCount: number;
    createdAt: string;
    lastActive: string;
  };
  solved: { challengeId: string; courseSlug: string; points: number; at: string }[];
  projectProgress: {
    projectSlug: string;
    projectTitle: string;
    status: string;
    totalPoints: number;
    completedObjectives: number;
    solutionRevealed: boolean;
  }[];
  recentSessions: AdminSessionRef[];
}

export interface AdminSessionRef {
  type: "module" | "project";
  id: string;
  label: string;
  status: string;
  startedAt: string;
  expiresAt: string;
}

export interface AdminSession {
  type: "module" | "project";
  id: string;
  user: { username: string };
  label: string;
  startedAt: string;
  expiresAt: string;
  status: string;
}

export interface AdminLeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatarSeed: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  title: string;
  role: "user" | "admin";
  solvedCount: number;
  lastActive: string;
}
