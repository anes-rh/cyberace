import type { ProjectSeed } from "../../types";

/**
 * Projet « Opération Sentinelle » — checkpoint cybersecurite-projets.
 *
 * L'étudiant est consultant sécurité pour NovaBank : il configure une DMZ
 * (firewall nftables + WAF ModSecurity/CRS), puis l'audite lui-même (SQLi à
 * travers le WAF), puis analyse l'incident.
 *
 * NOTE SUR LES CHECKS DU FIREWALL (déviation assumée vs spec §7) :
 * l'isolation attacker→internal et waf→internal est déjà garantie par le
 * ROUTAGE (aucune route). Tester ces chemins passerait donc dès la baseline
 * permissive, et l'objectif 1 réussirait sans configuration — ce qui viole le
 * critère « échoue avant la config, réussit après ». Pour rendre l'objectif
 * réellement discriminant :
 *   - on ajoute au WAF une route vers `internal` (via le firewall) afin que la
 *     règle « seul webapp accède à 3306 » soit vraiment testée (waf→db doit être
 *     bloqué par le FIREWALL, pas par l'absence de route) ;
 *   - on teste attacker→waf:7681 (doit être fermé) pour vérifier que
 *     external→dmz est bien limité au web (80/443), pas ouvert à tout.
 */

const FLAG = "NOVA{sqli_union_bypass_waf_exfil}";

export const operationSentinelle: ProjectSeed = {
  slug: "operation-sentinelle",
  checkpoint: "cybersecurite-projets",
  title: "Opération Sentinelle",
  description:
    "NovaBank te mandate pour sécuriser sa DMZ, puis t'engage comme pentester externe pour l'auditer toi-même. Configure le firewall et le WAF, puis exploite la faille SQL que tu viens de laisser passer — ou pas.",
  difficulty: "hard",
  estimatedMinutes: 90,
  ttlSec: 7200,
  topology: {
    networks: [
      { name: "external", cidr: "10.10.0.0/24", internal: true },
      { name: "dmz", cidr: "10.20.0.0/24", internal: true },
      { name: "internal", cidr: "10.30.0.0/24", internal: true },
    ],
    nodes: [
      {
        id: "attacker",
        image: "cyberace/attacker-base:latest",
        role: "attacker",
        terminal: true,
        networks: [{ name: "external", ip: "10.10.0.10" }],
        postStartRoutes: [{ network: "10.20.0.0/24", viaIp: "10.10.0.2" }],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
        resources: { memMb: 192, cpu: 0.3 },
      },
      {
        id: "firewall",
        image: "cyberace/project-sentinelle-firewall:latest",
        role: "firewall",
        terminal: true,
        capAdd: ["NET_ADMIN"],
        sysctls: { "net.ipv4.ip_forward": "1" },
        networks: [
          { name: "external", ip: "10.10.0.2" },
          { name: "dmz", ip: "10.20.0.2" },
          { name: "internal", ip: "10.30.0.2" },
        ],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
        resources: { memMb: 128, cpu: 0.3 },
      },
      {
        id: "waf",
        image: "cyberace/project-sentinelle-waf:latest",
        role: "waf",
        terminal: true,
        env: {
          BACKEND: "http://webapp:80",
          PORT: "80",
          MODSEC_RULE_ENGINE: "DetectionOnly",
          PARANOIA: "1",
        },
        networks: [{ name: "dmz", ip: "10.20.0.20" }],
        // Route external (réponses vers l'attaquant) + internal (pour que la
        // règle firewall « webapp uniquement » soit réellement testable).
        postStartRoutes: [
          { network: "10.10.0.0/24", viaIp: "10.20.0.2" },
          { network: "10.30.0.0/24", viaIp: "10.20.0.2" },
        ],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
        resources: { memMb: 256, cpu: 0.25 },
      },
      {
        id: "webapp",
        image: "cyberace/project-sentinelle-webapp:latest",
        role: "target",
        terminal: false,
        env: {
          DB_SERVER: "10.30.0.40",
          DB_DATABASE: "dvwa",
          DB_USER: "dvwa",
          DB_PASSWORD: "p@ssw0rd",
          DB_PORT: "3306",
        },
        networks: [{ name: "dmz", ip: "10.20.0.30" }],
        postStartRoutes: [{ network: "10.30.0.0/24", viaIp: "10.20.0.2" }],
        resources: { memMb: 320, cpu: 0.25 },
      },
      {
        id: "db",
        image: "cyberace/project-sentinelle-db:latest",
        role: "database",
        terminal: false,
        env: {
          MYSQL_ROOT_PASSWORD: "rootpw",
          MYSQL_DATABASE: "dvwa",
          MYSQL_USER: "dvwa",
          MYSQL_PASSWORD: "p@ssw0rd",
        },
        networks: [{ name: "internal", ip: "10.30.0.40" }],
        postStartRoutes: [{ network: "10.20.0.0/24", viaIp: "10.30.0.2" }],
        resources: { memMb: 768, cpu: 0.25 },
      },
    ],
  },
  objectives: [
    {
      id: "firewall-dmz-policy",
      projectSlug: "operation-sentinelle",
      order: 1,
      kind: "defense",
      title: "Durcir le firewall (DMZ)",
      description:
        "Configure nftables sur le firewall : passe la policy forward à `drop`, puis n'autorise QUE external→dmz sur 80/443, et webapp (10.20.0.30) → internal sur 3306. Tout le reste doit être bloqué (y compris l'accès d'un autre hôte de la DMZ à la base).",
      points: 150,
      validation: {
        strategy: "active_probe",
        spec: {
          checks: [
            { from: "attacker", to: "waf", port: 80, expect: "open" },
            { from: "attacker", to: "waf", port: 7681, expect: "closed" },
            { from: "webapp", to: "db", port: 3306, expect: "open" },
            { from: "waf", to: "db", port: 3306, expect: "closed" },
          ],
        },
      },
    },
    {
      id: "waf-crs-activation",
      projectSlug: "operation-sentinelle",
      order: 2,
      kind: "defense",
      title: "Activer le WAF (ModSecurity/CRS)",
      description:
        "Le WAF est en mode détection seule (rien n'est bloqué). Passe-le en blocage actif : ajoute `SecRuleEngine On` à /etc/modsecurity.d/modsecurity-override.conf puis `nginx -s reload`, pour filtrer les injections SQL basiques.",
      points: 150,
      validation: {
        strategy: "waf_probe",
        spec: {
          path: "/vulnerabilities/sqli/",
          testParam: "id",
          testPayload: "1' OR '1'='1",
          expectedStatus: 403,
        },
      },
    },
    {
      id: "sqli-bypass-exfil",
      projectSlug: "operation-sentinelle",
      order: 3,
      kind: "attack",
      title: "Contourner le WAF et exfiltrer (SQLi)",
      description:
        "Le WAF est actif. Trouve un moyen de le contourner (encodage, commentaires, casse, fragmentation — techniques vues en cyber-pratique) pour exploiter la SQLi sur webapp et récupérer le flag stocké dans la table `secrets` de la base.",
      points: 300,
      dependsOn: ["firewall-dmz-policy", "waf-crs-activation"],
      validation: {
        strategy: "text_compare",
        spec: { kind: "flag", value: FLAG, caseSensitive: true },
      },
    },
    {
      id: "incident-analysis",
      projectSlug: "operation-sentinelle",
      order: 4,
      kind: "analysis",
      title: "Analyser l'incident",
      description:
        "Consulte les logs du WAF et du firewall après l'attaque. Réponds aux questions sur l'incident.",
      points: 100,
      dependsOn: ["sqli-bypass-exfil"],
      validation: {
        strategy: "text_compare",
        spec: {
          kind: "qa",
          questions: [
            {
              id: "q1",
              prompt: "Quel port, refusé par le firewall aux hôtes non autorisés de la DMZ, protège la base de données ?",
              value: "3306",
            },
            {
              id: "q2",
              prompt: "Quel type d'attaque le WAF a-t-il journalisé puis bloqué ?",
              value: "sql injection",
              accept: ["sqli", "injection sql", "injection sqli"],
            },
          ],
        },
      },
    },
  ],
};

export const allProjects: ProjectSeed[] = [operationSentinelle];
