import type { ProjectTopology } from "../types";
import { execInNode, resolveNodeIp } from "./dockerTopology";
import { normalizeText } from "../utils/answer";

/**
 * Moteur de validation des objectifs de projet. Trois stratégies, toutes
 * vérifiées CÔTÉ SERVEUR (sondes réelles / requête WAF / comparaison de texte) —
 * jamais sur simple affirmation du client.
 */

export interface ValidationContext {
  topology: ProjectTopology;
  /** nodeId -> id du conteneur docker de la session en cours. */
  containerIdByNode: Record<string, string>;
}

export interface ValidationResult {
  ok: boolean;
  detail?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Exec avec un retry (le conteneur peut ne pas être prêt — spec §7). */
async function execWithRetry(dockerId: string, cmd: string[]): Promise<{ exitCode: number; output: string }> {
  let r = await execInNode(dockerId, cmd, 7000);
  if (r.exitCode === -1) {
    await sleep(1000);
    r = await execInNode(dockerId, cmd, 7000);
  }
  return r;
}

/** Test de connectivité TCP via /dev/tcp (bash) — aucun binaire requis. */
async function tcpProbe(fromDockerId: string, ip: string, port: number): Promise<"open" | "closed"> {
  const cmd = ["bash", "-c", `timeout 3 bash -c 'exec 3<>/dev/tcp/${ip}/${port}' 2>/dev/null`];
  const { exitCode } = await execWithRetry(fromDockerId, cmd);
  return exitCode === 0 ? "open" : "closed";
}

interface ActiveProbeSpec {
  checks: { from: string; to: string; port: number; expect: "open" | "closed" }[];
}

async function validateActiveProbe(spec: ActiveProbeSpec, ctx: ValidationContext): Promise<ValidationResult> {
  if (!Array.isArray(spec.checks) || spec.checks.length === 0) return { ok: false, detail: "aucun check défini" };
  for (const c of spec.checks) {
    const fromId = ctx.containerIdByNode[c.from];
    const toIp = resolveNodeIp(ctx.topology, c.to);
    if (!fromId || !toIp) return { ok: false, detail: `nœud introuvable (${c.from}→${c.to})` };
    const state = await tcpProbe(fromId, toIp, c.port);
    if (state !== c.expect) {
      return { ok: false, detail: `${c.from}→${c.to}:${c.port} = ${state}, attendu ${c.expect}` };
    }
  }
  return { ok: true };
}

interface WafProbeSpec {
  path: string;
  testParam: string;
  testPayload: string;
  expectedStatus: number;
}

async function validateWafProbe(spec: WafProbeSpec, ctx: ValidationContext): Promise<ValidationResult> {
  const attackerId = ctx.containerIdByNode["attacker"];
  const wafIp = resolveNodeIp(ctx.topology, "waf");
  if (!attackerId || !wafIp) return { ok: false, detail: "attaquant ou WAF introuvable" };
  // Requête envoyée par le backend DEPUIS l'attaquant (le vrai chemin, à travers
  // le firewall). CRS décode l'URL-encoding avant d'évaluer ses règles.
  const url = `http://${wafIp}${spec.path}?${spec.testParam}=${encodeURIComponent(spec.testPayload)}`;
  const cmd = ["bash", "-c", `curl -s -o /dev/null -w '%{http_code}' --max-time 8 "${url}"`];
  const { output } = await execWithRetry(attackerId, cmd);
  const status = parseInt(output.trim().match(/\d{3}/)?.[0] ?? "0", 10);
  return { ok: status === spec.expectedStatus, detail: `code ${status}, attendu ${spec.expectedStatus}` };
}

interface TextFlagSpec {
  kind: "flag";
  value: string;
  caseSensitive?: boolean;
}
interface TextQaSpec {
  kind: "qa";
  questions: { id: string; prompt: string; value: string; accept?: string[] }[];
}
type TextCompareSpec = TextFlagSpec | TextQaSpec;

function validateTextCompare(spec: TextCompareSpec, submitted: unknown): ValidationResult {
  if (spec.kind === "flag") {
    const cs = Boolean(spec.caseSensitive);
    const raw = submitted && typeof submitted === "object" ? (submitted as { flag?: unknown }).flag : submitted;
    const candidate = normalizeText(String(raw ?? ""), cs);
    if (!candidate) return { ok: false, detail: "réponse vide" };
    return { ok: candidate === normalizeText(spec.value, cs) };
  }
  if (spec.kind === "qa") {
    const answers = (submitted && typeof submitted === "object" ? submitted : {}) as Record<string, unknown>;
    for (const q of spec.questions) {
      const candidate = normalizeText(String(answers[q.id] ?? ""), false);
      const accepted = [q.value, ...(q.accept ?? [])].map((a) => normalizeText(String(a), false));
      if (!candidate || !accepted.includes(candidate)) {
        return { ok: false, detail: `réponse « ${q.id} » incorrecte` };
      }
    }
    return { ok: true };
  }
  return { ok: false, detail: "spec text_compare invalide" };
}

/** Point d'entrée : valide un objectif selon sa stratégie. */
export async function validateObjective(
  strategy: string,
  spec: Record<string, unknown>,
  ctx: ValidationContext,
  submitted: unknown
): Promise<ValidationResult> {
  switch (strategy) {
    case "active_probe":
      return validateActiveProbe(spec as unknown as ActiveProbeSpec, ctx);
    case "waf_probe":
      return validateWafProbe(spec as unknown as WafProbeSpec, ctx);
    case "text_compare":
      return validateTextCompare(spec as unknown as TextCompareSpec, submitted);
    default:
      return { ok: false, detail: `stratégie inconnue: ${strategy}` };
  }
}
