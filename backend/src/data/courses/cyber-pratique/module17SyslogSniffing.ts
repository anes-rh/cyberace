import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 17 : interception de syslog en clair (UDP 514). Lab Docker réel. */
export const module17SyslogSniffing: CourseSeed[] = [
  {
    slug: "prat-syslog-sniffing",
    title: "Interception de syslog en clair",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Log",
    domain: "Interception réseau",
    theme: "grid",
    icon: "Boxes",
    accent: "#C46B4F",
    order: 17,
    difficulty: "medium",
    summary:
      "Un poste envoie régulièrement ses événements d'authentification vers un serveur de centralisation de logs — en clair, sur UDP 514. Tu reprends la mécanique ARP du Module 2 pour te glisser sur le chemin de ces journaux et lire ce qui devait rester interne.",
    objectives: [
      "Cartographier le sous-réseau et repérer le poste émetteur de logs",
      "Constater qu'avant l'attaque, aucun message syslog n'est capturable",
      "Empoisonner le cache ARP pour usurper le serveur de logs (IP fantôme)",
      "Intercepter un journal d'authentification en clair avec tcpdump",
      "Nommer la parade : syslog chiffré sur TLS",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module17-syslog-victim:latest",
      ttlSec: 1200,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
      network: { subnet: "10.67.0.0/24", gateway: "10.67.0.1" },
      targetStaticIp: "10.67.0.10",
      attackerStaticIp: "10.67.0.20",
    },
    lesson: `# 📦 Interception de syslog en clair — Silent Log

Au Module 2, tu as détourné une communication interne en empoisonnant un cache ARP. **Même technique ici**, mais la donnée volée change de nature : ce sont des **journaux système** (*syslog*) censés ne jamais quitter le réseau interne. 🏎️

---

## 🧭 Le briefing

> Un **poste** (\`10.67.0.10\`) envoie régulièrement des **événements d'authentification** vers un **serveur de centralisation de logs** situé en \`10.67.0.99\`. Beaucoup d'équipements (routeurs, imprimantes, serveurs anciens) envoient encore leurs journaux **ainsi, sans aucun chiffrement**.
>
> **Ta mission :** te glisser à la place du serveur de logs et **lire** ce que le poste lui envoie.

⚠️ \`10.67.0.99\` est une **adresse fantôme** : aucune machine ne s'y trouve. Le poste *essaie* d'y envoyer ses logs, mais tant que personne ne répond à sa requête ARP, **rien ne part**. Tu es l'attaquant, en **\`10.67.0.20\`**.

---

## 1. Syslog : le protocole des journaux 📜

**syslog** est le format historique de journalisation Unix. Le mode le plus répandu — et le plus fragile — l'envoie sur **UDP port 514**, **en clair** :

- **UDP** = sans connexion (comme aux Modules 2/6/9) → **un message = un datagramme**, aucune poignée de main.
- **En clair** = le contenu (utilisateur, jeton, événement) est **lisible tel quel** par quiconque le capture.

C'est pratique (léger, simple) mais désastreux pour la confidentialité dès que quelqu'un se met sur le chemin.

---

## 2. Avant l'attaque : rien ne fuit 🔇

Le poste \`10.67.0.10\` émet ses logs vers \`10.67.0.99\`. Mais cette IP n'existe pas → sa requête ARP « Who has 10.67.0.99 ? » reste **sans réponse** → le datagramme UDP **ne part jamais** sur le fil. Une écoute \`tcpdump\` **avant** intervention ne montre donc **aucun** message lisible. Tu le vérifieras à la tâche 3.

---

## 3. L'empoisonnement ARP 💉

L'outil **\`arpspoof\`** (paquet *dsniff*, déjà dans \`attacker-base\`) répète à la victime de fausses réponses ARP :

\`\`\`bash
arpspoof -i eth0 -t 10.67.0.10 10.67.0.99 &
#            │        │            └── l'IP qu'on USURPE (le serveur de logs)
#            │        └── la CIBLE empoisonnée (le poste émetteur)
#            └── notre interface
\`\`\`

La victime croit alors que \`10.67.0.99\` **= la MAC de l'attaquant** et lui **livre** ses journaux. Lance-le **en arrière-plan** (\`&\`) et vérifie avec \`jobs\` qu'il tourne encore pendant ta capture.

---

## 4. Capturer le journal 🎯

\`\`\`bash
tcpdump -i eth0 -A -s0 udp port 514
#              │  │   │   └── ne garde que le trafic syslog UDP
#              │  │   └── -s0 : paquet entier
#              │  └── -A : contenu en ASCII (lisible)
#              └── interface
\`\`\`

Le prochain envoi (toutes les ~5 s) apparaît **en clair** : une ligne \`AUTH_EVENT user=svc-backup token=...\`. Le flag est là.

---

## 5. La contre-mesure 🛡️

La parade directe : **ne plus jamais envoyer syslog en clair**. On utilise **syslog over TLS** (RFC 5425, souvent via *rsyslog* configuré en TLS sur le port 6514) : les journaux sont **chiffrés en transit**, et même sur le chemin, l'attaquant ne lit **rien d'exploitable**. En complément, la **Dynamic ARP Inspection (DAI)** bloquerait l'empoisonnement lui-même.

---

## 🎯 Ta mission (résumé)

1. Repère-toi (\`ip addr\`), cartographie \`10.67.0.0/24\`, trouve le poste émetteur.
2. Vérifie qu'**avant** l'attaque, aucun syslog n'est capturable.
3. **Empoisonne** le cache ARP, **capture** le journal, récupère le **flag**.

## 🧠 À retenir

- **syslog en clair sur UDP 514** = journaux **lisibles** par quiconque sur le chemin.
- Une **IP fantôme** ne se découvre pas au scan ; l'écoute passive **ne suffit pas** avant l'empoisonnement.
- **\`arpspoof -i eth0 -t <victime> <ip_usurpée>\`** détourne le trafic vers la MAC de l'attaquant.
- **UDP sans connexion** → capture en **un seul paquet, en clair**.
- Contre-mesure : **syslog over TLS** (chiffrement en transit) + **DAI** contre l'ARP spoofing.`,
    badge: {
      id: "badge-prat-syslog",
      name: "Archiviste Discret",
      icon: "Boxes",
      description: "A intercepté un journal système censé rester interne.",
    },
    challenges: [
      {
        id: "prat-syslog-t1",
        title: "Prise de repères",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Prise de repères

Démarre le lab et ouvre le terminal. Situe-toi sur le réseau :

\`\`\`bash
ip addr show eth0
\`\`\`

Tu es l'attaquant, en \`10.67.0.20\` (sous-réseau \`10.67.0.0/24\`).

**Question :** quelle **commande Linux** affiche les interfaces réseau et leurs adresses IP ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "ip addr",
        accept: ["ip a", "ip addr show", "ip addr show eth0"],
        caseSensitive: false,
        explanation: `**\`ip addr\`** (abrégé \`ip a\`) liste les interfaces et leurs adresses. Tu confirmes que tu es en \`10.67.0.20\` sur \`10.67.0.0/24\`.`,
        tags: ["syslog", "recon", "ip-addr"],
      },
      {
        id: "prat-syslog-t2",
        title: "Repérer le poste complice",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📡 Repérer le poste émetteur

Balaie le sous-réseau pour trouver le poste qui émet les logs :

\`\`\`bash
nmap -sn 10.67.0.0/24
\`\`\`

Tu verras la passerelle (\`.1\`) et **un** autre hôte. L'IP fantôme \`10.67.0.99\` n'apparaîtra **pas** (personne ne répond).

**Question :** quelle est l'**adresse IP** du poste émetteur (hors passerelle) ?`,
        points: 100,
        timeLimitSec: 350,
        hints: [
          { text: "La passerelle se termine par .1 — ce n'est pas elle. Cherche l'autre hôte « up ».", cost: 20 },
        ],
        answer: "10.67.0.10",
        caseSensitive: true,
        explanation: `Le *ping sweep* **\`nmap -sn\`** révèle la victime en **\`10.67.0.10\`**. Le serveur de logs \`10.67.0.99\` reste invisible : aucune machine ne s'y trouve.`,
        tags: ["syslog", "ping-sweep", "nmap"],
      },
      {
        id: "prat-syslog-t3",
        title: "Écoute passive, avant intervention",
        order: 3,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔇 Écoute passive (avant l'attaque)

Mets-toi à l'écoute du trafic syslog, **sans rien lancer d'autre** :

\`\`\`bash
tcpdump -i eth0 -A -s0 udp port 514
\`\`\`

Laisse tourner **~30 secondes**, puis \`Ctrl+C\`.

**Question :** combien de messages syslog **lisibles** apparaissent pendant cette écoute ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: 0,
        explanation: `**Zéro.** Le poste *essaie* d'émettre vers \`10.67.0.99\`, mais sa requête ARP reste sans réponse → le datagramme UDP ne part jamais. L'écoute passive ne suffit pas : il faut **intervenir**.`,
        tags: ["syslog", "tcpdump", "ecoute-passive"],
      },
      {
        id: "prat-syslog-t4",
        title: "Empoisonner le cache ARP",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 💉 Empoisonner le cache ARP

Lance l'attaque **en arrière-plan** :

\`\`\`bash
arpspoof -i eth0 -t 10.67.0.10 10.67.0.99 &
jobs   # vérifie : [1] Running arpspoof …
\`\`\`

**Question :** que fait concrètement cette commande ?`,
        points: 200,
        timeLimitSec: 500,
        hints: [],
        options: [
          "Elle fait croire au poste 10.67.0.10 que le serveur de logs (10.67.0.99) se trouve à l'adresse MAC de l'attaquant",
          "Elle chiffre le trafic syslog",
          "Elle bloque tout le trafic du poste",
          "Elle installe un serveur syslog sur l'attaquant",
        ],
        answer: 0,
        explanation: `\`arpspoof\` envoie de fausses réponses ARP : le poste associe désormais \`10.67.0.99\` à la MAC de l'attaquant et lui **livre** ses journaux. Aucun chiffrement, aucun blocage — juste un cache ARP empoisonné.`,
        tags: ["syslog", "arpspoof", "poisoning"],
      },
      {
        id: "prat-syslog-t5",
        title: "Intercepter le journal",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Intercepter le journal (flag)

Avec \`arpspoof\` **toujours actif**, remets-toi à l'écoute et attends le prochain message (~5 s) :

\`\`\`bash
tcpdump -i eth0 -A -s0 udp port 514
\`\`\`

Lis la ligne \`AUTH_EVENT user=svc-backup token=...\`.

**Question :** colle le **flag** intercepté.`,
        points: 300,
        timeLimitSec: 700,
        hints: [
          { text: "Rien ne s'affiche ? Vérifie que arpspoof tourne encore : tape « jobs ». S'il s'est arrêté, relance-le en arrière-plan.", cost: 20 },
          { text: "Filtre de capture exact : tcpdump -i eth0 -A -s0 udp port 514 (laisse tourner ~10 s).", cost: 35 },
        ],
        answer: "CYBERACE{syslog_udp_jamais_chiffre}",
        caseSensitive: true,
        explanation: `Le cache empoisonné, la victime te livre ses logs : \`tcpdump -A\` les affiche en clair → \`CYBERACE{syslog_udp_jamais_chiffre}\`. Aucun chiffrement ne protégeait ce journal interne.`,
        tags: ["syslog", "interception", "flag"],
      },
      {
        id: "prat-syslog-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## 🛡️ La parade

**Question :** quel **mécanisme sécurisé** remplace l'envoi de syslog en clair sur UDP ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "syslog over TLS",
        accept: ["syslog-tls", "rsyslog tls", "tls"],
        caseSensitive: false,
        explanation: `**syslog over TLS** (RFC 5425, port 6514, souvent via *rsyslog*) chiffre les journaux **en transit**. Même sur le chemin, l'attaquant ne lit rien d'exploitable — la parade directe au sniffing que tu viens de réaliser.`,
        tags: ["syslog", "tls", "contre-mesure"],
      },
      {
        id: "prat-syslog-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** en quoi ce module diffère-t-il du Module 6 (SNMP) tout en partageant la même technique d'interception ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Même mécanisme ARP spoof + capture, mais un protocole et une donnée sensible différents (journaux d'authentification plutôt qu'une communauté SNMP)",
          "Ce module utilise le protocole TCP au lieu d'UDP",
          "Ce module nécessite l'installation de dsniff, contrairement au Module 6",
          "Il n'y a aucune différence entre les deux modules",
        ],
        answer: 0,
        explanation: `La technique (ARP spoof + tcpdump) est identique au Module 6 ; seuls changent le **protocole** (syslog vs SNMP) et la **donnée** interceptée (journaux d'authentification vs communauté SNMP). Une même faille de conception — le clair sur le réseau — se décline sur mille protocoles.`,
        tags: ["syslog", "synthese"],
      },
    ],
  },
];
