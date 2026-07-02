import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format milliseconds as mm:ss. */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export type DifficultyKey = "easy" | "medium" | "hard" | "insane";

export const DIFFICULTY: Record<
  DifficultyKey,
  { label: string; color: string; ring: string; text: string }
> = {
  easy: { label: "Rookie", color: "#34d399", ring: "ring-success/40", text: "text-success" },
  medium: { label: "Driver", color: "#22d3ee", ring: "ring-primary/40", text: "text-primary" },
  hard: { label: "Pro", color: "#f59e0b", ring: "ring-warning/40", text: "text-warning" },
  insane: { label: "Ace", color: "#fb7185", ring: "ring-danger/40", text: "text-danger" },
};

/** Deterministic two-colour gradient derived from a string seed (for avatars). */
export function seedGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const a = h;
  const b = (h + 90) % 360;
  return `linear-gradient(135deg, hsl(${a} 85% 60%), hsl(${b} 85% 55%))`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
