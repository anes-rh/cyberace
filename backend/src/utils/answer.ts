import type { ChallengeDoc } from "../models/Challenge";
import type { CodeKeypoint } from "../types";

/** Strip pseudo-code and C comments so keypoints match real code only. */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, " ") // C block comments
    .replace(/\/\/[^\n]*/g, " ") // C line comments
    // pseudo-code {comments}: strip ONLY prose-looking braces. Never touch a
    // C block `{ ...statements... }` (contains ; = ( ) or an assignment arrow).
    .replace(/\{[^{}\n]*\}/g, (m) => (/[;=()]|←|<-/.test(m) ? m : " "))
    .replace(/^\s*\*.*$/gm, " ");
}

interface CodeAnswerSpec {
  keypoints: CodeKeypoint[];
  minRatio?: number;
}

function parseCodeSpec(answer: unknown): CodeAnswerSpec | null {
  try {
    const spec = typeof answer === "string" ? JSON.parse(answer) : answer;
    if (spec && Array.isArray(spec.keypoints) && spec.keypoints.length > 0) return spec as CodeAnswerSpec;
  } catch {
    /* malformed spec → treated as no match */
  }
  return null;
}

/**
 * Structured feedback for a `code` submission: which expected keypoints are
 * present and which are missing. Labels are pedagogical, never the solution.
 */
export function codeFeedback(
  challenge: Pick<ChallengeDoc, "answer">,
  submitted: unknown
): { ok: boolean; missing: string[]; matched: number; total: number } {
  const spec = parseCodeSpec(challenge.answer);
  const code = stripComments(String(submitted ?? ""));
  if (!spec || code.trim().length < 5) {
    return { ok: false, missing: spec ? spec.keypoints.map((k) => k.label) : [], matched: 0, total: spec?.keypoints.length ?? 0 };
  }
  const missing: string[] = [];
  let matched = 0;
  for (const kp of spec.keypoints) {
    let hit = false;
    try {
      hit = new RegExp(kp.pattern, kp.flags ?? "i").test(code);
    } catch {
      hit = false; // invalid pattern in seed — count as missing, never crash
    }
    if (hit) matched += 1;
    else missing.push(kp.label);
  }
  const ratio = matched / spec.keypoints.length;
  return { ok: ratio >= (spec.minRatio ?? 1), missing, matched, total: spec.keypoints.length };
}

export function normalizeText(value: string, caseSensitive: boolean): string {
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
    case "code":
      return codeFeedback(challenge, submitted).ok;
    default:
      return false;
  }
}
