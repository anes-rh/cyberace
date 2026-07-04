import type {
  User,
  CourseSummary,
  CourseDetail,
  CheckpointSummary,
  CheckpointDetail,
  LabItem,
  Challenge,
  SubmitResult,
  LeaderboardEntry,
  ProgressPayload,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000/api";

const TOKEN_KEY = "cyberace_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, "Impossible de joindre l'API. Le backend est-il démarré ?");
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new ApiError(res.status, data.error || `Erreur ${res.status}`);
  }
  return data as T;
}

export const api = {
  register: (body: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => request<{ token: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { emailOrUsername: string; password: string }) =>
    request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => request<{ user: User }>("/auth/me"),

  updateProfile: (body: { username?: string; avatarUrl?: string | null }) =>
    request<{ user: User }>("/auth/profile", { method: "PATCH", body: JSON.stringify(body) }),

  updatePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ user: User }>("/auth/password", { method: "PATCH", body: JSON.stringify(body) }),

  checkpoints: () => request<{ checkpoints: CheckpointSummary[] }>("/checkpoints"),
  checkpoint: (slug: string) => request<CheckpointDetail>(`/checkpoints/${slug}`),

  courses: () => request<{ courses: CourseSummary[] }>("/courses"),
  course: (slug: string) => request<CourseDetail>(`/courses/${slug}`),

  labs: (params?: { courseSlug?: string; difficulty?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ labs: LabItem[] }>(`/labs${qs ? `?${qs}` : ""}`);
  },
  lab: (id: string) =>
    request<{ challenge: Challenge; course: CourseDetail["course"] | null }>(`/labs/${id}`),

  unlockHint: (id: string, index: number) =>
    request<{ index: number; text: string; cost: number }>(`/labs/${id}/hint`, {
      method: "POST",
      body: JSON.stringify({ index }),
    }),

  submit: (id: string, answer: string | number | number[], timeMs: number) =>
    request<SubmitResult>(`/labs/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answer, timeMs }),
    }),

  leaderboard: (limit = 50) =>
    request<{ leaderboard: LeaderboardEntry[]; me: { rank: number; xp: number } | null }>(
      `/leaderboard?limit=${limit}`
    ),

  progress: () => request<ProgressPayload>("/progress"),

  executeC: (code: string, stdin?: string) =>
    request<import("./types").ExecuteResult>("/execute", {
      method: "POST",
      body: JSON.stringify({ code, stdin }),
    }),
};

export type { User, Challenge };
