import type { ProjectTopology } from "../types";
import { execInNode, resolveNodeIp, copyTextToNode } from "./dockerTopology";
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
  /** Variables d'environnement injectées à la création de session (au moins
   *  `FLAG_SUFFIX`). Sert aux stratégies qui comparent une valeur attendue
   *  DYNAMIQUE par session (ex. `registry_probe`). Server-side uniquement. */
  sessionEnv?: Record<string, string>;
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

/**
 * Exec avec un retry (le conteneur peut ne pas être prêt). Timeout généreux :
 * certains outils AD/annuaire (samba-tool charge tout le stack Python) dépassent
 * plusieurs secondes, surtout quand la VM provisionne encore d'autres nœuds.
 */
async function execWithRetry(dockerId: string, cmd: string[]): Promise<{ exitCode: number; output: string }> {
  let r = await execInNode(dockerId, cmd, 20000);
  if (r.exitCode === -1) {
    await sleep(1500);
    r = await execInNode(dockerId, cmd, 20000);
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

interface RegistryProbeSpec {
  /** Nœud d'où sonder le registre (a `curl` et atteint le registre ; ex.
   *  "ci-runner"). registry:2 étant sans shell, on ne sonde pas depuis lui. */
  probeFromNode: string;
  /** Hôte:port du registre v2 depuis `probeFromNode` (ex. "registry:5000"). */
  registryHost: string;
  repository: string; // ex. "prod/webapp"
  tag: string; // ex. "latest"
  /** Label que l'image poussée DOIT porter pour prouver qu'elle est bien celle
   *  du joueur (et pas l'image légitime ni une image quelconque). */
  markerLabel: string; // ex. "ghost.session"
  /** Clé de `ctx.sessionEnv` portant la valeur attendue de ce label pour CETTE
   *  session (ex. "FLAG_SUFFIX") → dynamique, anti write-up. */
  expectedEnvVar: string;
}

/** Extrait le premier objet JSON d'une sortie curl (tolère un bruit résiduel). */
function parseJsonLoose(text: string): unknown | null {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s < 0 || e <= s) return null;
  try {
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return null;
  }
}

async function curlJson(dockerId: string, url: string): Promise<unknown | null> {
  const accept =
    "Accept: application/vnd.docker.distribution.manifest.v2+json," +
    "application/vnd.oci.image.manifest.v1+json," +
    "application/vnd.docker.distribution.manifest.list.v2+json," +
    "application/vnd.oci.image.index.v1+json";
  const { output } = await execWithRetry(dockerId, ["curl", "-s", "-H", accept, url]);
  return parseJsonLoose(output);
}

/**
 * Valide une attaque supply-chain : le joueur a-t-il bien poussé SON image sous
 * `repository:tag` ? On lit le manifeste PUIS le blob de config depuis le
 * registre (server-side, via `curl` depuis un nœud interne) et on vérifie que
 * la config porte un LABEL de session attendu.
 *
 * ADAPTATION ASSUMÉE (documentée) : la spec initiale comparait un « digest de
 * couche » attendu. Or le digest d'une couche construite par le joueur n'est
 * pas prédictible côté serveur (horodatages/ordre du tar non reproductibles).
 * On vérifie donc un MARQUEUR de session que le joueur doit incruster comme
 * label — ce qui prouve à la fois la PATERNITÉ de l'image ET empêche tout faux
 * positif (repousser une image quelconque, ou l'image légitime, échoue car le
 * label de session est absent). Entièrement server-side, dynamique par session.
 */
async function validateRegistryProbe(spec: RegistryProbeSpec, ctx: ValidationContext): Promise<ValidationResult> {
  const dockerId = ctx.containerIdByNode[spec.probeFromNode];
  if (!dockerId) return { ok: false, detail: `Nœud « ${spec.probeFromNode} » introuvable — la topologie est-elle démarrée ?` };
  const expected = ctx.sessionEnv?.[spec.expectedEnvVar];
  if (!expected) return { ok: false, detail: "Contexte de session incomplet (valeur attendue absente)." };

  const base = `http://${spec.registryHost}/v2/${spec.repository}`;
  const manifest = (await curlJson(dockerId, `${base}/manifests/${spec.tag}`)) as
    | { config?: { digest?: string }; manifests?: { digest?: string }[]; errors?: unknown[] }
    | null;
  if (!manifest || manifest.errors) {
    return { ok: false, detail: `Aucun manifeste pour ${spec.repository}:${spec.tag} — as-tu bien poussé ton image sur le registre ?` };
  }
  // Manifest list / index OCI → descendre d'un niveau vers un manifeste d'image.
  let configDigest = manifest.config?.digest;
  if (!configDigest && Array.isArray(manifest.manifests) && manifest.manifests[0]?.digest) {
    const sub = (await curlJson(dockerId, `${base}/manifests/${manifest.manifests[0].digest}`)) as
      | { config?: { digest?: string } }
      | null;
    configDigest = sub?.config?.digest;
  }
  if (!configDigest) return { ok: false, detail: "Manifeste illisible (pas de blob de config) — ton image est-elle bien un format Docker/OCI standard ?" };

  const cfg = (await curlJson(dockerId, `${base}/blobs/${configDigest}`)) as
    | { config?: { Labels?: Record<string, string> }; container_config?: { Labels?: Record<string, string> } }
    | null;
  const labels = cfg?.config?.Labels ?? cfg?.container_config?.Labels ?? {};
  const got = labels[spec.markerLabel];
  const ok = got === expected;
  return {
    ok,
    detail: ok
      ? `Manifeste ${spec.repository}:${spec.tag} : ta couche est bien en place (label de session ${spec.markerLabel} conforme).`
      : `Le tag ${spec.repository}:${spec.tag} existe mais ce n'est pas TON image — incruste le label ${spec.markerLabel} = jeton de build de la session (celui fuité dans l'historique Git) et repousse.`,
  };
}

interface YaraCheckSpec {
  /** Nœud d'analyse (a `yara` + le dossier d'échantillons ; ex. "attacker"). */
  execNode: string;
  /** Dossier d'échantillons à scanner (malveillants + légitimes pour piéger les
   *  faux positifs), ex. "/opt/samples". */
  fixtureDir: string;
  /** Basenames des SEULS fichiers que la règle doit matcher (les malveillants). */
  expectedMatchFiles: string[];
}

/**
 * Valide une règle YARA SOUMISE : on l'écrit dans le conteneur d'analyse via
 * putArchive (jamais par interpolation shell → aucune injection possible même
 * avec une règle piégée), puis on exécute `yara` sur un dossier d'échantillons
 * mêlant binaires malveillants ET légitimes. La règle n'est acceptée que si elle
 * matche EXACTEMENT les échantillons attendus : ni faux négatif (trop stricte),
 * ni faux positif (trop large). Entièrement server-side.
 */
async function validateYaraCheck(spec: YaraCheckSpec, submitted: unknown, ctx: ValidationContext): Promise<ValidationResult> {
  const dockerId = ctx.containerIdByNode[spec.execNode];
  if (!dockerId) return { ok: false, detail: `Nœud « ${spec.execNode} » introuvable — la session est-elle active ?` };
  const rule = submitted && typeof submitted === "object" ? String((submitted as { rule?: unknown }).rule ?? "") : String(submitted ?? "");
  if (!rule.trim()) return { ok: false, detail: "Aucune règle YARA soumise — colle le texte de ta règle (rule … { strings: … condition: … })." };

  try {
    await copyTextToNode(dockerId, "/tmp", "rule.yar", rule);
  } catch {
    return { ok: false, detail: "Impossible de déposer la règle sur le nœud d'analyse — réessaie." };
  }

  const { exitCode, output } = await execWithRetry(dockerId, ["yara", "-w", "/tmp/rule.yar", spec.fixtureDir]);
  // Règle invalide : yara écrit "error:" sur stderr et sort en code non nul, sans ligne de match.
  if (/error:/i.test(output) && exitCode !== 0) {
    return { ok: false, detail: "Ta règle YARA ne compile pas — vérifie la structure `rule nom { strings: $s = \"…\" condition: $s }`." };
  }

  // Sortie yara : "<rule_id> <chemin>" par ligne → on isole le basename du fichier.
  const matched = new Set(
    output.split("\n").map((l) => l.trim()).filter(Boolean)
      .map((l) => l.split(/\s+/).slice(1).join(" "))
      .map((p) => p.split("/").pop() ?? p)
      .filter(Boolean)
  );
  const expected = new Set(spec.expectedMatchFiles.map((f) => f.split("/").pop() ?? f));
  const missing = [...expected].filter((f) => !matched.has(f));
  const extra = [...matched].filter((f) => !expected.has(f));

  if (missing.length === 0 && extra.length === 0) {
    return { ok: true, detail: `Ta règle matche exactement les ${expected.size} échantillon(s) malveillant(s) attendu(s), sans faux positif.` };
  }
  if (extra.length) {
    return { ok: false, detail: `Règle trop LARGE : elle matche aussi ${extra.length} fichier(s) légitime(s) (faux positifs). Cible une chaîne ou une séquence d'octets PROPRE au binaire malveillant.` };
  }
  return { ok: false, detail: `Règle trop STRICTE : elle ne matche que ${matched.size}/${expected.size} des échantillons malveillants — ta condition est trop spécifique (ou vise une chaîne absente d'une variante).` };
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
    // `dynamic_text_compare` = même mécanique que log_forensics (vérité CALCULÉE
    // en direct depuis l'état/les journaux réels des conteneurs, comparée à la
    // réponse). Alias plutôt que duplication d'un mécanisme générique.
    case "dynamic_text_compare":
      return validateLogForensics(spec as unknown as LogForensicsSpec, ctx, submitted);
    case "cred_check":
      return validateCredCheck(spec as unknown as CredCheckSpec, submitted, ctx);
    case "registry_probe":
      return validateRegistryProbe(spec as unknown as RegistryProbeSpec, ctx);
    case "yara_check":
      return validateYaraCheck(spec as unknown as YaraCheckSpec, submitted, ctx);
    default:
      return { ok: false, detail: `stratégie inconnue: ${strategy}` };
  }
}
