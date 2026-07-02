import type { ChallengeDoc } from "../models/Challenge";

function normalizeText(value: string, caseSensitive: boolean): string {
  let s = String(value).trim().replace(/\s+/g, " ");
  if (!caseSensitive) s = s.toLowerCase();
  return s;
}

function toIndexArray(value: unknown): number[] {
  if (Array.isArray(value)) return value.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
  if (typeof value === "string") {
    return value
      .split(/[,\s]+/)
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n));
  }
  return [];
}

/**
 * Validate a submission against a challenge's canonical answer.
 * All comparison happens on the server; the answer never leaves it.
 */
export function checkAnswer(
  challenge: Pick<ChallengeDoc, "type" | "answer" | "accept" | "caseSensitive">,
  submitted: unknown
): boolean {
  switch (challenge.type) {
    case "text": {
      const caseSensitive = Boolean(challenge.caseSensitive);
      const candidate = normalizeText(String(submitted ?? ""), caseSensitive);
      if (!candidate) return false;
      const accepted = [String(challenge.answer), ...(challenge.accept ?? [])].map((a) =>
        normalizeText(a, caseSensitive)
      );
      return accepted.includes(candidate);
    }
    case "numeric": {
      const value = Number(submitted);
      if (Number.isNaN(value)) return false;
      return value === Number(challenge.answer);
    }
    case "mcq": {
      const value = Number(submitted);
      if (Number.isNaN(value)) return false;
      return value === Number(challenge.answer);
    }
    case "multi": {
      const submittedSet = new Set(toIndexArray(submitted));
      const answerSet = new Set(toIndexArray(challenge.answer));
      if (submittedSet.size !== answerSet.size) return false;
      for (const v of answerSet) if (!submittedSet.has(v)) return false;
      return true;
    }
    case "order": {
      const a = toIndexArray(submitted);
      const b = toIndexArray(challenge.answer);
      if (a.length !== b.length) return false;
      return a.every((v, i) => v === b[i]);
    }
    default:
      return false;
  }
}
