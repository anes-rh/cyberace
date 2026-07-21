import type { ProjectSeed } from "../../types";

/**
 * Opération SOC Silencieux — 5e projet du checkpoint « cybersécurité — projets ».
 *
 * Premier projet PUREMENT DÉFENSIF de la plateforme : une intrusion a DÉJÀ eu
 * lieu sur `victim-host`. Le joueur, analyste SOC, reconstitue l'incident (DFIR)
 * à partir des journaux du SIEM, du trafic capturé (PCAP) et des artefacts
 * laissés sur l'hôte — sans jamais rien exploiter lui-même. Il termine par le
 * confinement de la menace (blocage C2 + arrêt du processus).
 *
 * ── IOC PAR SESSION (anti write-up) ──────────────────────────────────────────
 * L'IP externe de l'attaquant, le port du C2, le nom du processus malveillant,
 * le chemin de persistance et la durée de la fenêtre d'intrusion sont DÉRIVÉS de
 * `FLAG_SUFFIX` au démarrage (script `iocgen.sh` identique sur victim-host et
 * siem → IOC cohérents entre nœuds mais différents à chaque session). Écrits
 * dans `/opt/incident/state` (KEY=VALUE), que les commandes de validation
 * sourcent server-side. Le PCAP, lui, est figé au build (User-Agent d'exploit
 * fixe) et découplé des IOC de session.
 *
 * ── STRATÉGIE `yara_check` (Partie 0) ────────────────────────────────────────
 * La règle YARA soumise est écrite dans le conteneur d'analyse via `putArchive`
 * (jamais par interpolation shell) puis exécutée par `yara` sur un dossier mêlant
 * l'échantillon malveillant et des leurres légitimes : n'est acceptée qu'une
 * règle matchant EXACTEMENT le malveillant (ni faux positif, ni faux négatif).
 *
 * ── ADAPTATIONS ASSUMÉES (documentées) ───────────────────────────────────────
 * - Poste d'analyse outillé avec `tcpdump` (lecture du PCAP) plutôt que `tshark`
 *   (même capacité pour lire le User-Agent ; bien plus léger sur le disque VM).
 * - Objectif 7 (confinement) : la spec évoquait « active_probe + exec_check ».
 *   Les deux volets sont consolidés en UN `exec_check` server-side qui exécute
 *   une VRAIE sonde TCP depuis victim-host (l'aspect active_probe) ET vérifie
 *   l'absence de connexion vivante vers le C2 — ce qui n'est vrai que si le
 *   processus a été tué (le socket ESTABLISHED tombe) ET l'IP C2 bloquée par
 *   iptables (la nouvelle sonde échoue). Les deux actions sont donc exigées.
 * - Objectifs 3/4 : la spec disait `exec_check` ; on utilise `dynamic_text_compare`
 *   (la réponse — nom de processus / chemin de charge — est CALCULÉE en direct
 *   depuis l'état réel du conteneur), plus adapté qu'un `exec_check` à valeur
 *   fixe pour un IOC qui change par session. Reste 100 % server-side.
 */

const SLUG = "operation-soc-silencieux";

export const socSilencieux: ProjectSeed = {
  slug: SLUG,
  checkpoint: "cybersecurite-projets",
  title: "Opération SOC Silencieux",
  description:
    "Investigation forensique (DFIR) d'une intrusion déjà survenue. En analyste SOC, tu reconstitues la chaîne d'attaque à partir des journaux, d'une capture réseau et des artefacts laissés sur l'hôte — triage, analyse PCAP, identification du malware et de sa persistance, règle YARA, timeline — puis tu confines la menace. Aucune exploitation : de la détection pure à la réponse à incident.",
  difficulty: "hard",
  estimatedMinutes: 100,
  ttlSec: 7200,
  topology: {
    networks: [
      // Un seul segment plat : ce n'est pas un scénario de segmentation réseau.
      { name: "soc", cidr: "10.80.0.0/24", internal: true },
    ],
    nodes: [
      {
        id: "attacker",
        image: "cyberace/project-soc-attacker:latest",
        role: "attacker",
        terminal: true,
        // Poste d'analyse SOC : yara + tcpdump + jq + dossier d'échantillons.
        networks: [{ name: "soc", ip: "10.80.0.10" }],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
        resources: { memMb: 384, cpu: 0.4 },
      },
      {
        id: "victim-host",
        image: "cyberace/project-soc-victim:latest",
        role: "target",
        terminal: true,
        // NET_ADMIN/NET_RAW : l'analyste pose une règle iptables au confinement.
        capAdd: ["NET_ADMIN", "NET_RAW"],
        networks: [{ name: "soc", ip: "10.80.0.20" }],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
        resources: { memMb: 320, cpu: 0.4 },
      },
      {
        id: "siem",
        image: "cyberace/project-soc-siem:latest",
        role: "log",
        terminal: true,
        // Collecteur de logs + sinkhole du C2 (la balise de victim-host s'y connecte).
        networks: [{ name: "soc", ip: "10.80.0.30" }],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
        resources: { memMb: 320, cpu: 0.4 },
      },
    ],
  },

  objectives: [
    {
      id: "soc-triage",
      projectSlug: SLUG,
      order: 1,
      kind: "analysis",
      title: "Triage initial",
      description:
        "Depuis le SIEM (`/var/log/access.log`), repère le PREMIER événement suspect : la requête d'exploit initiale se distingue du trafic normal par un User-Agent d'outil malveillant (NovaRAT). Soumets l'horodatage (tel qu'écrit dans le log) et l'adresse IP source de cet événement.",
      points: 100,
      dependsOn: [],
      questions: [
        { id: "first_ts", prompt: "Horodatage du premier événement suspect (tel qu'écrit dans access.log)" },
        { id: "source_ip", prompt: "Adresse IP source de cet événement" },
      ],
      hints: [
        { text: "Sur le terminal du SIEM : `cat /var/log/access.log`. Le trafic normal a un User-Agent de navigateur (Mozilla/…).", cost: 0 },
        { text: "Isole l'anomalie : `grep NovaRAT /var/log/access.log`. Le premier de ces événements est l'exploit initial.", cost: 0 },
        { text: "L'horodatage est le 1er champ de la ligne (ISO 8601). L'IP est dans `src=…`.", cost: 0 },
      ],
      validation: {
        strategy: "dynamic_text_compare",
        spec: {
          questions: [
            {
              id: "first_ts",
              node: "siem",
              command: ["sh", "-c", "grep -m1 NovaRAT /var/log/access.log | cut -d' ' -f1"],
              extract: "(\\S+)",
            },
            {
              id: "source_ip",
              node: "siem",
              command: ["sh", "-c", "grep -m1 NovaRAT /var/log/access.log | grep -oE 'src=[0-9.]+' | cut -d= -f2"],
              extract: "([0-9.]+)",
            },
          ],
        },
      },
    },
    {
      id: "soc-pcap",
      projectSlug: SLUG,
      order: 2,
      kind: "analysis",
      title: "Analyse du PCAP",
      description:
        "Une capture de la fenêtre d'intrusion est disponible sur le SIEM (`/data/incident.pcap`). Ouvre-la hors-ligne et identifie le User-Agent utilisé par l'exploit initial — la signature de l'outil d'attaque.",
      points: 150,
      dependsOn: ["soc-triage"],
      questions: [{ id: "user_agent", prompt: "User-Agent de l'exploit initial (dans le PCAP)" }],
      hints: [
        { text: "Le PCAP est sur le SIEM. Copie-le vers ton poste d'analyse ou lis-le sur place : `tcpdump -r /data/incident.pcap -A`.", cost: 0 },
        { text: "Filtre le contenu ASCII : `tcpdump -r /data/incident.pcap -A | grep -i user-agent`.", cost: 0 },
        { text: "Le User-Agent malveillant n'est pas un navigateur — c'est le nom d'un outil (format Nom/Version).", cost: 0 },
      ],
      validation: {
        strategy: "text_compare",
        spec: {
          kind: "qa",
          questions: [
            { id: "user_agent", prompt: "user agent", value: "NovaRAT/2.1", accept: ["NovaRAT", "NovaRAT 2.1"] },
          ],
        },
      },
    },
    {
      id: "soc-malproc",
      projectSlug: SLUG,
      order: 3,
      kind: "analysis",
      title: "Identification du processus malveillant",
      description:
        "Connecte-toi à `victim-host`. En croisant l'historique bash de l'intrus (`~/.bash_history`) et la liste des processus actifs, identifie le processus malveillant en cours d'exécution. Soumets son nom.",
      points: 150,
      dependsOn: ["soc-triage"],
      questions: [{ id: "process", prompt: "Nom du processus malveillant actif" }],
      hints: [
        { text: "Regarde ce que l'intrus a lancé : `cat ~/.bash_history`. Puis liste les processus : `ps aux`.", cost: 0 },
        { text: "Le processus tourne depuis un dossier caché (`/tmp/.hidden/`). Son nom imite un composant système.", cost: 0 },
        { text: "Soumets le nom exact du binaire (ex. `sys-…worker`), tel qu'affiché dans `ps aux`.", cost: 0 },
      ],
      validation: {
        strategy: "dynamic_text_compare",
        spec: {
          questions: [
            {
              id: "process",
              node: "victim-host",
              command: ["sh", "-c", "ps -eo args= | grep -oE 'sys-[a-z0-9]+worker' | head -1"],
              extract: "(sys-[a-z0-9]+worker)",
            },
          ],
        },
      },
    },
    {
      id: "soc-persistence",
      projectSlug: SLUG,
      order: 4,
      kind: "analysis",
      title: "Mécanisme de persistance",
      description:
        "L'attaquant a assuré sa persistance via une tâche planifiée. Trouve la tâche cron malveillante sur `victim-host` et soumets le chemin complet du binaire qu'elle exécute.",
      points: 150,
      dependsOn: ["soc-malproc"],
      questions: [{ id: "payload_path", prompt: "Chemin complet du binaire lancé par la tâche cron malveillante" }],
      hints: [
        { text: "Les tâches cron système sont dans `/etc/cron.d/`. Inspecte-les : `cat /etc/cron.d/*`.", cost: 0 },
        { text: "Une des tâches lance un binaire depuis `/tmp/.hidden/` — c'est le persistance de l'intrus.", cost: 0 },
        { text: "Soumets le chemin complet (ex. `/tmp/.hidden/sys-…worker`).", cost: 0 },
      ],
      validation: {
        strategy: "dynamic_text_compare",
        spec: {
          questions: [
            {
              id: "payload_path",
              node: "victim-host",
              command: ["sh", "-c", "grep -hoE '/tmp/[^ ]+worker' /etc/cron.d/* 2>/dev/null | head -1"],
              extract: "(/tmp/\\S+worker)",
            },
          ],
        },
      },
    },
    {
      id: "soc-yara",
      projectSlug: SLUG,
      order: 5,
      kind: "analysis",
      title: "Règle YARA de détection",
      description:
        "Rédige une règle YARA qui détecte le binaire malveillant. Ton poste d'analyse contient un dossier d'échantillons (`/opt/samples`) mêlant le malware et des scripts légitimes. Ta règle doit matcher EXACTEMENT l'échantillon malveillant — sans faux positif sur les scripts légitimes (qui partagent pourtant des idiomes shell). Teste-la localement avant de soumettre : `yara ta_regle.yar /opt/samples`. Soumets le texte de ta règle dans le champ `rule`.",
      points: 150,
      dependsOn: ["soc-malproc"],
      questions: [{ id: "rule", prompt: "Texte complet de ta règle YARA (rule … { strings: … condition: … })" }],
      hints: [
        { text: "Examine les échantillons : `head /opt/samples/*`. Le malware contient une chaîne marqueur unique que les scripts légitimes n'ont pas.", cost: 0 },
        { text: "Une règle minimale : `rule nova { strings: $m = \"NOVA_C2_BEACON_MARK_...\" condition: $m }`. Cible une chaîne PROPRE au malware, pas `while`/`sleep`/`curl` (présents partout).", cost: 0 },
        { text: "Teste avant de soumettre : `yara /tmp/r.yar /opt/samples` ne doit lister QUE `malware_sample`.", cost: 0 },
      ],
      validation: {
        strategy: "yara_check",
        spec: {
          execNode: "attacker",
          fixtureDir: "/opt/samples",
          expectedMatchFiles: ["malware_sample"],
        },
      },
    },
    {
      id: "soc-timeline",
      projectSlug: SLUG,
      order: 6,
      kind: "analysis",
      title: "Reconstruction de la timeline",
      description:
        "Reconstitue la fenêtre d'intrusion : entre le premier événement malveillant (l'exploit initial) et le dernier (la balise C2), combien de temps s'est écoulé ? Soumets la durée totale de la compromission en MINUTES.",
      points: 100,
      dependsOn: ["soc-pcap", "soc-persistence"],
      questions: [{ id: "duration_min", prompt: "Durée totale de la compromission (en minutes)" }],
      hints: [
        { text: "Les événements malveillants sont marqués `NovaRAT` dans `/var/log/access.log`. Le premier = exploit, le dernier = balise C2.", cost: 0 },
        { text: "Récupère les deux horodatages : `grep NovaRAT /var/log/access.log`. Le premier et le dernier.", cost: 0 },
        { text: "Convertis en époque et soustrais : `date -d '<ts>' +%s`. Différence / 60 = minutes.", cost: 0 },
      ],
      validation: {
        strategy: "dynamic_text_compare",
        spec: {
          questions: [
            {
              id: "duration_min",
              node: "siem",
              command: [
                "sh",
                "-c",
                "f=$(grep NovaRAT /var/log/access.log | head -1 | cut -d' ' -f1); l=$(grep NovaRAT /var/log/access.log | tail -1 | cut -d' ' -f1); echo $(( ($(date -u -d \"$l\" +%s) - $(date -u -d \"$f\" +%s)) / 60 ))",
              ],
              extract: "(\\d+)",
            },
          ],
        },
      },
    },
    {
      id: "soc-containment",
      projectSlug: SLUG,
      order: 7,
      kind: "defense",
      title: "Confinement de la menace",
      description:
        "Neutralise l'incident sur `victim-host` : (1) coupe la balise C2 en bloquant, via iptables, le trafic sortant vers le sinkhole du C2, ET (2) tue le processus malveillant. Les deux actions sont nécessaires — bloquer sans tuer laisse la connexion établie vivante ; tuer sans bloquer laisse la persistance/le C2 réatteignable. Le contrôle vérifie qu'il n'existe plus aucune connexion vers le C2 et qu'une nouvelle tentative est bien bloquée.",
      points: 100,
      dependsOn: ["soc-persistence", "soc-yara"],
      hints: [
        { text: "Identifie la connexion sortante : `ss -tnp` sur victim-host montre une session ESTABLISHED vers `siem` sur un port haut — c'est la balise C2.", cost: 0 },
        { text: "Bloque-la : `iptables -A OUTPUT -d siem -p tcp --dport <PORT_C2> -j DROP` (le port vu dans `ss`).", cost: 0 },
        { text: "Puis tue le processus : `pkill -f sys-…worker` (ou `kill <PID>`). Vérifie ensuite qu'aucune session ESTABLISHED tenue par un processus ne subsiste : `ss -tnp state established | grep :<PORT_C2>` doit être vide (une entrée FIN-WAIT résiduelle, sans processus, est normale car le FIN sortant est lui aussi bloqué).", cost: 0 },
      ],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "victim-host",
          command: [
            "sh",
            "-c",
            ". /opt/incident/state; P=$(timeout 2 bash -c \"exec 3<>/dev/tcp/siem/$C2_PORT\" 2>/dev/null && echo open); E=$(ss -tnp state established 2>/dev/null | grep \":$C2_PORT\" | grep -c 'users:'); if [ -z \"$P\" ] && [ \"$E\" = \"0\" ]; then echo CONTAINED; else echo STILL_ACTIVE; fi",
          ],
          expectedContains: "CONTAINED",
        },
      },
    },
  ],

  solution: {
    summary:
      "Investigation DFIR de bout en bout sur un hôte compromis. La méthodologie suit la chaîne classique : TRIAGE (repérer le premier événement suspect dans le SIEM en isolant l'anomalie du bruit normal), ANALYSE RÉSEAU (extraire la signature de l'outil d'attaque du PCAP), ANALYSE HÔTE (croiser historique de commandes et processus actifs pour trouver le malware, puis sa persistance cron), DÉTECTION (écrire une règle YARA précise ciblant un marqueur propre au malware, sans faux positif), TIMELINE (borner la fenêtre d'intrusion), et enfin RÉPONSE (confiner : couper le C2 par pare-feu + tuer le processus). Le fil conducteur : ne jamais conclure sur une apparence — corréler plusieurs sources (logs, PCAP, artefacts) et prouver chaque hypothèse par la donnée.",
    steps: [
      {
        objectiveId: "soc-triage",
        explanation:
          "Le triage consiste à séparer le signal du bruit dans les journaux. Le trafic légitime porte un User-Agent de navigateur (Mozilla/…) ; l'exploit initial se trahit par un User-Agent d'outil (NovaRAT). On isole donc les lignes malveillantes, et la PREMIÈRE marque le début de l'intrusion : son horodatage et son IP source sont les premiers IOC à documenter.",
        commands: [
          "cat /var/log/access.log            # vue d'ensemble sur le SIEM",
          "grep NovaRAT /var/log/access.log   # isole les événements malveillants",
          "grep -m1 NovaRAT /var/log/access.log   # le premier = exploit initial (timestamp + src=IP)",
        ],
        expectedLogs: "La 1re ligne NovaRAT donne l'horodatage (1er champ) et l'IP (src=…) de l'exploit initial.",
      },
      {
        objectiveId: "soc-pcap",
        explanation:
          "Le PCAP contient le trafic brut de l'intrusion. On le lit HORS-LIGNE (aucune capture live nécessaire) avec `tcpdump -r`, en affichant le contenu ASCII (`-A`) pour voir les en-têtes HTTP en clair. Le User-Agent de la requête d'exploit est la signature de l'outil d'attaque — un IOC réseau réutilisable pour chasser d'autres victimes.",
        commands: [
          "# depuis le SIEM (ou après copie du pcap vers le poste d'analyse) :",
          "tcpdump -r /data/incident.pcap -A | grep -i user-agent",
          "# → User-Agent: NovaRAT/2.1",
        ],
        expectedLogs: "Le User-Agent NovaRAT/2.1 apparaît dans la requête d'exploit (POST /api/v2/import).",
      },
      {
        objectiveId: "soc-malproc",
        explanation:
          "Sur l'hôte, on croise deux sources : l'historique de commandes de l'intrus (`~/.bash_history`, qui révèle le téléchargement et le lancement du binaire) et la liste des processus réellement actifs (`ps aux`). Le processus malveillant tourne depuis un dossier caché (`/tmp/.hidden/`) et porte un nom imitant un composant système — un déguisement classique. On l'identifie par recoupement, jamais sur son seul nom.",
        commands: [
          "cat ~/.bash_history        # trace laissée : curl … -o /tmp/.hidden/sys-…worker ; chmod +x ; lancement",
          "ps aux                     # le processus /tmp/.hidden/sys-…worker est actif",
          "ps -eo args= | grep hidden",
        ],
        expectedLogs: "Le processus actif est le binaire déposé dans /tmp/.hidden/ (nom sys-…worker).",
      },
      {
        objectiveId: "soc-persistence",
        explanation:
          "Un malware cherche à survivre au redémarrage : la persistance. Ici, une tâche cron déposée dans `/etc/cron.d/` relance périodiquement le binaire malveillant. On inspecte le contenu des tâches planifiées et on repère celle qui exécute un binaire depuis un emplacement anormal (`/tmp/.hidden/`) — à supprimer lors de la remédiation complète.",
        commands: [
          "cat /etc/cron.d/*                       # inspecte toutes les tâches système",
          "grep -r /tmp/.hidden /etc/cron.d/       # la tâche malveillante référence le binaire caché",
        ],
        expectedLogs: "La tâche /etc/cron.d/apt-refresh lance /tmp/.hidden/sys-…worker toutes les 15 min.",
      },
      {
        objectiveId: "soc-yara",
        explanation:
          "YARA permet de créer une signature réutilisable pour détecter un malware sur tout le parc. La clé d'une BONNE règle : cibler une caractéristique PROPRE au malware (ici une chaîne marqueur unique, `NOVA_C2_BEACON_MARK_…`), pas des idiomes génériques (`while`, `sleep`, `curl`) présents dans des scripts légitimes — sinon on génère des faux positifs. On valide toujours la règle contre un jeu mêlant échantillons malveillants ET légitimes : elle ne doit matcher que le malveillant.",
        commands: [
          "head /opt/samples/*        # compare malware vs scripts légitimes → trouve la chaîne unique",
          "cat > r.yar <<'EOF'",
          "rule nova_beacon {",
          "  strings: $m = \"NOVA_C2_BEACON_MARK_7f3a91\"",
          "  condition: $m",
          "}",
          "EOF",
          "yara r.yar /opt/samples    # doit lister UNIQUEMENT malware_sample",
        ],
        expectedLogs: "La règle matche /opt/samples/malware_sample et aucun des benignN (pas de faux positif).",
      },
      {
        objectiveId: "soc-timeline",
        explanation:
          "Reconstituer la timeline borne la durée de la compromission — une donnée clé du rapport d'incident (fenêtre d'exposition). On prend le premier et le dernier événement malveillant du journal (exploit initial → dernière balise C2), on convertit leurs horodatages en époque Unix et on calcule la différence. Les horodatages ISO 8601 sont directement parseables par `date -d`.",
        commands: [
          "grep NovaRAT /var/log/access.log                   # premier (exploit) et dernier (balise C2)",
          "f=$(grep NovaRAT /var/log/access.log | head -1 | cut -d' ' -f1)",
          "l=$(grep NovaRAT /var/log/access.log | tail -1 | cut -d' ' -f1)",
          "echo $(( ($(date -u -d \"$l\" +%s) - $(date -u -d \"$f\" +%s)) / 60 ))   # durée en minutes",
        ],
        expectedLogs: "Durée = (timestamp balise C2 − timestamp exploit) / 60, en minutes.",
      },
      {
        objectiveId: "soc-containment",
        explanation:
          "La réponse à incident : confiner sans attendre. Deux gestes complémentaires sur l'hôte. (1) Couper la communication avec le C2 : on repère la connexion sortante (`ss -tnp`) vers le sinkhole et on la bloque au pare-feu (`iptables OUTPUT … DROP`) — cela empêche toute NOUVELLE connexion. (2) Tuer le processus malveillant : cela ferme le socket de la balise DÉJÀ établie (qu'une simple règle iptables ne coupe pas). Il faut donc les DEUX : bloquer empêche la reconnexion, tuer sévère la session en cours. Le contrôle final relance une sonde vers le C2 (doit échouer) et vérifie l'absence de toute session vers ce port.",
        commands: [
          ". /opt/incident/state                                   # récupère le port du C2 pour cet incident",
          "ss -tnp | grep \":$C2_PORT\"                             # la balise ESTABLISHED vers siem:$C2_PORT",
          "iptables -A OUTPUT -d siem -p tcp --dport \"$C2_PORT\" -j DROP   # (1) coupe le canal C2",
          "pkill -f sys-.*worker                                    # (2) tue le processus (ferme le socket établi)",
          "ss -tnp state established | grep \":$C2_PORT\"           # doit être vide : plus aucune session tenue par un processus",
        ],
        expectedLogs: "Après les deux actions : plus aucune session ESTABLISHED tenue par un processus vers le port C2, et une sonde vers siem:$C2_PORT échoue (bloquée) → CONTAINED. (Une entrée FIN-WAIT résiduelle sans processus est normale : le FIN sortant est bloqué par la règle.)",
      },
    ],
  },
};
