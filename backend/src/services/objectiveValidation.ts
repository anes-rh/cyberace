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
  /** Suffixe de flag de la session (anti write-up) : substitué à `{{SUFFIX}}`
   *  dans les valeurs attendues. Jamais une constante recompilée. */
  flagSuffix?: string;
}

/** Remplace le marqueur `{{SUFFIX}}` par le suffixe de flag de la session. */
function withSuffix(value: string, ctx: ValidationContext): string {
  return value.replace(/\{\{SUFFIX\}\}/g, ctx.flagSuffix ?? "static");
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
      const detail =
        c.expect === "open"
          ? `Le flux ${c.from}→${c.to}:${c.port} devrait être AUTORISÉ mais il est bloqué : vérifie que ta règle nftables accepte bien ce chemin (et que le service écoute).`
          : `Le flux ${c.from}→${c.to}:${c.port} devrait être BLOQUÉ mais il passe : mets la policy forward à drop et n'autorise que les chemins nécessaires — celui-ci n'en fait pas partie.`;
      return { ok: false, detail };
    }
  }
  return { ok: true, detail: "Tous les flux réseau attendus sont conformes (les chemins autorisés passent, les interdits sont bloqués)." };
}

interface WafProbeSpec {
  path: string;
  testParam: string;
  testPayload: string;
  expectedStatus: number;
  port?: number;
}

async function validateWafProbe(spec: WafProbeSpec, ctx: ValidationContext): Promise<ValidationResult> {
  const attackerId = ctx.containerIdByNode["attacker"];
  const wafIp = resolveNodeIp(ctx.topology, "waf");
  if (!attackerId || !wafIp) return { ok: false, detail: "attaquant ou WAF introuvable" };
  // Requête envoyée par le backend DEPUIS l'attaquant (le vrai chemin, à travers
  // le firewall). CRS décode l'URL-encoding avant d'évaluer ses règles.
  const host = `${wafIp}:${spec.port ?? 8080}`;
  const url = `http://${host}${spec.path}?${spec.testParam}=${encodeURIComponent(spec.testPayload)}`;
  const cmd = ["bash", "-c", `curl -s -o /dev/null -w '%{http_code}' --max-time 8 "${url}"`];
  const { output } = await execWithRetry(attackerId, cmd);
  const status = parseInt(output.trim().match(/\d{3}/)?.[0] ?? "0", 10);
  const payloadShort = spec.testPayload.length > 24 ? spec.testPayload.slice(0, 24) + "…" : spec.testPayload;
  if (status === spec.expectedStatus) {
    return { ok: true, detail: `Le WAF bloque bien l'injection (payload « ${payloadShort} » → HTTP ${status}).` };
  }
  return {
    ok: false,
    detail:
      status === 0
        ? `Aucune réponse du WAF sur le port ${spec.port ?? 8080} — vérifie qu'il tourne et que le firewall autorise external→dmz.`
        : `Le WAF n'a pas bloqué l'injection (payload « ${payloadShort} » → HTTP ${status}, attendu ${spec.expectedStatus}). As-tu bien mis SecRuleEngine On puis rechargé nginx ?`,
  };
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

function validateTextCompare(spec: TextCompareSpec, submitted: unknown, ctx: ValidationContext): ValidationResult {
  if (spec.kind === "flag") {
    const cs = Boolean(spec.caseSensitive);
    const raw = submitted && typeof submitted === "object" ? (submitted as { flag?: unknown }).flag : submitted;
    const candidate = normalizeText(String(raw ?? ""), cs);
    if (!candidate) return { ok: false, detail: "Aucun flag soumis — colle la valeur NOVA{…} exfiltrée." };
    // La valeur attendue intègre le suffixe de session (jamais une constante figée).
    const expected = normalizeText(withSuffix(spec.value, ctx), cs);
    if (candidate === expected) return { ok: true, detail: "Flag correct — exfiltration confirmée." };
    return { ok: false, detail: "Ce flag ne correspond pas à cette session — vérifie que tu l'as bien exfiltré depuis CETTE base (il change à chaque session)." };
  }
  if (spec.kind === "qa") {
    const answers = (submitted && typeof submitted === "object" ? submitted : {}) as Record<string, unknown>;
    for (const q of spec.questions) {
      const candidate = normalizeText(String(answers[q.id] ?? ""), false);
      const accepted = [q.value, ...(q.accept ?? [])].map((a) => normalizeText(withSuffix(String(a), ctx), false));
      if (!candidate || !accepted.includes(candidate)) {
        return { ok: false, detail: `Réponse « ${q.id} » incorrecte — relis les journaux avant de conclure.` };
      }
    }
    return { ok: true, detail: "Analyse correcte." };
  }
  return { ok: false, detail: "spec text_compare invalide" };
}

interface ExecCheckSpec {
  node: string;
  command: string[];
  expectedContains: string;
}

/**
 * Exécute une commande dans un nœud et vérifie que sa sortie contient une preuve
 * attendue. Sert à valider les objectifs d'attaque par leur EFFET de bord réel
 * (fichier de preuve écrit via la RCE, root_proof créé par le cron, connexion
 * SSH acceptée journalisée) — jamais sur simple affirmation du client.
 */
async function validateExecCheck(spec: ExecCheckSpec, ctx: ValidationContext): Promise<ValidationResult> {
  const dockerId = ctx.containerIdByNode[spec.node];
  if (!dockerId) {
    return { ok: false, detail: `Nœud « ${spec.node} » introuvable — vérifie que la topologie est bien démarrée.` };
  }
  const expected = withSuffix(spec.expectedContains, ctx);
  const { output } = await execWithRetry(dockerId, spec.command);
  const ok = output.includes(expected);
  return {
    ok,
    detail: ok
      ? `Preuve trouvée sur ${spec.node} : ${output.trim().slice(0, 180)}`
      : `Aucune preuve sur ${spec.node} — l'action attendue n'a pas laissé sa trace. Vérifie que tu l'as bien exécutée (bon nœud, bon chemin) puis reteste ; le contenu exact de la commande de résolution n'est pas divulgué.`,
  };
}

interface ForensicsQuestion {
  id: string;
  node: string;
  command: string[];
  /** Regex : le 1er groupe capturant (sinon le match complet) est la vérité attendue. */
  extract?: string;
}
interface LogForensicsSpec {
  questions: ForensicsQuestion[];
}

/**
 * Valide un objectif d'analyse d'incident : pour chaque question, la vérité est
 * CALCULÉE au moment de la validation en lisant les journaux réels du SIEM
 * (grep/wc côté serveur), jamais codée en dur. La réponse de l'étudiant est
 * comparée à cette vérité.
 */
async function validateLogForensics(
  spec: LogForensicsSpec,
  ctx: ValidationContext,
  submitted: unknown
): Promise<ValidationResult> {
  if (!Array.isArray(spec.questions) || spec.questions.length === 0) {
    return { ok: false, detail: "aucune question définie" };
  }
  const answers = (submitted && typeof submitted === "object" ? submitted : {}) as Record<string, unknown>;
  for (const q of spec.questions) {
    const dockerId = ctx.containerIdByNode[q.node];
    if (!dockerId) return { ok: false, detail: `Nœud « ${q.node} » introuvable — la session est-elle active ?` };
    const { output } = await execWithRetry(dockerId, q.command);
    let truth = output.trim();
    if (q.extract) {
      const m = truth.match(new RegExp(q.extract));
      truth = m ? (m[1] ?? m[0]) : "";
    }
    const expected = normalizeText(truth, false);
    const candidate = normalizeText(String(answers[q.id] ?? ""), false);
    if (!expected) {
      return {
        ok: false,
        detail: `Le journal ne contient pas encore de quoi répondre à « ${q.id} » — l'attaque a-t-elle bien eu lieu ? Rejoue la chaîne, puis relis le SIEM.`,
      };
    }
    if (candidate !== expected) {
      return {
        ok: false,
        detail: `Réponse « ${q.id} » incorrecte — la vérité est dans les journaux du SIEM (grep/wc -l). Recompte ou relis précisément.`,
      };
    }
  }
  return { ok: true, detail: "Analyse d'incident correcte — tes réponses concordent avec les journaux du SIEM." };
}

interface CredCheckSpec {
  /** Nœud d'où lancer la tentative d'authentification (ex. "attacker"). */
  execNode: string;
  /**
   * Gabarit de commande en forme ARGV (jamais `bash -c`) : les marqueurs
   * `{champ}` sont remplacés par les valeurs de `answer` DANS DES ÉLÉMENTS
   * SÉPARÉS → aucune interprétation shell, donc pas d'injection possible même
   * si l'étudiant soumet un mot de passe piégé. Ex. :
   *   ["crackmapexec","smb","10.50.0.30","-u","{username}","-p","{password}"]
   * (Une fonction `buildCommand` ne serait pas sérialisable en base : on passe
   * donc par un gabarit + substitution.)
   */
  commandTemplate: string[];
  /** Sous-chaîne indiquant le succès dans la sortie (ex. "[+]", "Pwn3d!"). */
  successPattern: string;
  /** Champs requis dans `answer` (pour un message clair s'ils manquent). */
  requiredFields?: string[];
}

/**
 * Valide un objectif par une TENTATIVE D'AUTHENTIFICATION réelle avec les
 * identifiants soumis (AS-REP / Kerberoasting / abus d'ACL) — jamais sur
 * confiance dans le mot de passe envoyé. Le gabarit de commande est fixé côté
 * serveur ; seules les VALEURS de `answer` y sont injectées (en argv → sûr).
 */
async function validateCredCheck(
  spec: CredCheckSpec,
  answer: unknown,
  ctx: ValidationContext
): Promise<ValidationResult> {
  const dockerId = ctx.containerIdByNode[spec.execNode];
  if (!dockerId) {
    return { ok: false, detail: `Nœud « ${spec.execNode} » introuvable — la topologie est-elle démarrée ?` };
  }
  const a = (answer && typeof answer === "object" ? answer : {}) as Record<string, unknown>;
  const missing = (spec.requiredFields ?? []).filter((f) => !a[f]);
  if (missing.length) {
    return { ok: false, detail: `Identifiants incomplets — renseigne : ${missing.join(", ")}.` };
  }
  // Substitution en argv (chaque élément reste un argument distinct → pas de shell).
  const command = spec.commandTemplate.map((part) =>
    part.replace(/\{(\w+)\}/g, (_m, k: string) => String(a[k] ?? ""))
  );
  const { output } = await execWithRetry(dockerId, command);
  const ok = output.includes(spec.successPattern);
  return {
    ok,
    detail: ok
      ? `Authentification réussie : ${output.trim().slice(0, 150)}`
      : "Échec d'authentification avec ces identifiants — vérifie ton craquage (bon compte, bon mot de passe ?).",
  };
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
      return validateTextCompare(spec as unknown as TextCompareSpec, submitted, ctx);
    case "exec_check":
      return validateExecCheck(spec as unknown as ExecCheckSpec, ctx);
    case "log_forensics":
      return validateLogForensics(spec as unknown as LogForensicsSpec, ctx, submitted);
    case "cred_check":
      return validateCredCheck(spec as unknown as CredCheckSpec, submitted, ctx);
    default:
      return { ok: false, detail: `stratégie inconnue: ${strategy}` };
  }
}
