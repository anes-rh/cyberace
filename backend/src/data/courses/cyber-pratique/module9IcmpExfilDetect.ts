import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 9 : détection d'un canal caché ICMP. Lab Docker réel. */
export const module9IcmpExfilDetect: CourseSeed[] = [
  {
    slug: "prat-icmp-exfil-detect",
    title: "Canal caché ICMP : données cachées dans un ping",
    checkpoint: "prat-interception-detect",
    codename: "Silent Echo",
    domain: "Détection réseau",
    theme: "grid",
    icon: "Binary",
    accent: "#8A9B6E",
    order: 9,
    difficulty: "medium",
    summary:
      "Neuvième lab réel : de nouveau analyste, tu surveilles un segment où un poste envoie des pings réguliers vers un autre. Rien d'alarmant en apparence — sauf que le payload de ces pings cache une chaîne de données. Un canal caché ICMP, la théorie du checkpoint « canaux cachés » rendue concrète.",
    objectives: [
      "Adopter la posture analyste : observer un trafic généré automatiquement",
      "Capturer précisément le trafic ICMP (tcpdump)",
      "Repérer une anomalie dans le payload d'un ping (contenu lisible répété)",
      "Décoder le marqueur caché et nommer la technique (canal caché)",
      "Connaître la détection (DPI) et comprendre l'indépendance d'ICMP vis-à-vis de TCP",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module9-icmp-exfil:latest",
      ttlSec: 900,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🔢 Canal caché ICMP : données cachées dans un ping — Silent Echo

Le checkpoint théorique **« Canaux cachés »** expliquait qu'on peut détourner un protocole légitime pour faire passer des données interdites. Ce lab en donne un exemple **concret et détectable** : de l'exfiltration cachée dans de simples **pings**. 🏎️

---

## 🧭 Le briefing

> Tu **surveilles ce segment**. Un poste envoie des **pings** vers un autre à **intervalles réguliers** — rien d'alarmant en soi, le ping est un outil de diagnostic banal. **Regarde d'un peu plus près** : parfois, l'anomalie n'est pas dans le *fait* de communiquer, mais dans **ce que** contient la communication.

**Comment jouer :** « Démarrer le lab », terminal (posture **défensive**). La cible \`target\` émet quelque chose ; à toi de l'**observer** et de **diagnostiquer**. Tu ne déclenches rien.

---

## 1. Rappel : le canal caché 🕳️

Un **canal caché** (*covert channel*) détourne un mécanisme **légitime** pour transmettre de l'information **en violation** de la politique de sécurité — là où **aucune communication** n'est censée exister (revoir le module théorique « Canaux cachés »). Les pare-feu laissent souvent passer le **ping** (ICMP echo) pour le diagnostic → c'est un **véhicule discret** idéal pour **exfiltrer** des données hors d'un réseau surveillé.

---

## 2. ICMP et le payload du ping 📦

Le **ping** repose sur **ICMP echo request/reply**. Détail clé : un paquet ICMP echo transporte un **payload** (champ de données/bourrage). Normalement, \`ping\` le remplit d'un **motif d'octets incrémental** (00 01 02 03 …) — **non lisible**, juste du remplissage.

Mais l'option **\`-p\`** de \`ping\` permet de **choisir** ce motif :

\`\`\`bash
ping -c 1 -p 4341434531333337 -s 64 attacker
#            │                  └── -s 64 : taille du paquet (64 octets de données)
#            └── -p <hex> : motif de remplissage EN HEXADÉCIMAL, répété
\`\`\`

Ici, \`4341434531333337\` est de l'**hexadécimal** qui, décodé en ASCII, donne **\`CACE1337\`** (43='C', 41='A', 43='C', 45='E', 31='1', 33='3', 33='3', 37='7'). Ce motif est **répété** pour remplir les 64 octets → la chaîne \`CACE1337\` apparaît **plusieurs fois** dans le payload. C'est ainsi qu'on **cache des données** dans un ping.

> ⚠️ **Limite technique honnête** : \`ping -p\` accepte **au maximum 16 octets** de motif. Un vrai canal caché doit donc **fragmenter** les données sur **plusieurs paquets** successifs. Ce n'est pas un détail à cacher : c'est une contrainte réelle avec laquelle l'exfiltration doit composer.

---

## 3. Détecter : capturer le trafic ICMP 🔍

En analyste, tu captures **uniquement** l'ICMP avec \`tcpdump\` :

\`\`\`bash
tcpdump -i eth0 icmp                  # ne garde que l'ICMP
tcpdump -i eth0 -A -s0 icmp           # + contenu en ASCII (-A), paquet entier (-s0)
\`\`\`

- \`icmp\` : filtre ne conservant **que** le trafic ICMP.
- \`-A\` : affiche le **payload en ASCII** → la chaîne cachée devient **lisible**.
- \`-s0\` : capture le **paquet entier** (pas de troncature).

En laissant tourner ~20-30 s, tu verras défiler les pings, et dans leur payload : **\`CACE1337\`** répété. Un ping normal n'a **jamais** de chaîne ASCII lisible dans son payload → c'est **l'anomalie** qui trahit le canal caché.

---

## 4. Détecter à l'échelle & se défendre 🛡️

Repérer ça à l'œil sur un lab est facile ; à l'échelle d'un réseau, on automatise :
- **DPI** (*Deep Packet Inspection*) : inspection **approfondie** des paquets, cherchant des payloads ICMP au **contenu** ou à la **taille** inhabituels (un ping avec du texte lisible, ou anormalement gros/fréquent).
- **Baselining** : un volume/rythme d'ICMP inhabituel entre deux hôtes est suspect.
- ⚠️ **Ne pas** bloquer **tout** l'ICMP aveuglément (le ping et des messages ICMP essentiels — *fragmentation needed*, *time exceeded* — sont utiles au bon fonctionnement du réseau). On **inspecte** et on **filtre finement**, on ne coupe pas tout.

---

## 5. Pourquoi ça marche sans « connexion » ⚡

Contrairement aux Modules 2 et 6 (où il fallait détourner du trafic TCP/UDP applicatif), **ICMP echo n'établit aucune connexion** : pas de poignée de main, chaque paquet est **indépendant** et **part dès qu'il est émis**. La donnée cachée voyage donc **immédiatement**, sans dépendre de quoi que ce soit côté destinataire — ce qui rend la capture triviale dès que le paquet passe sur le fil.

---

## 🎯 Ta mission (résumé)

1. Prends ton poste (\`ping -c 2 target\`).
2. **Capture l'ICMP** (\`tcpdump -i eth0 -A -s0 icmp\`), observe le payload.
3. **Décode** le marqueur répété, **nomme** la technique, connais la **détection**.

## 🧠 À retenir

- **Canal caché** : détourner un protocole **légitime** (ici **ICMP/ping**, souvent laissé passer) pour faire transiter des **données cachées**.
- Le **payload** d'un ping normal est un **motif incrémental non lisible** ; l'option **\`-p <hex>\`** permet d'y **injecter** un motif choisi. \`4341434531333337\` = **\`CACE1337\`** en ASCII, **répété** dans le paquet.
- **Limite réelle** : \`ping -p\` = **16 octets max** → un vrai canal caché **fragmente** les données sur plusieurs paquets.
- **Détection** : \`tcpdump -i eth0 -A -s0 icmp\` → une **chaîne ASCII lisible** dans le payload = anomalie. À l'échelle : **DPI** (contenu/taille ICMP inhabituels), sans **bloquer tout l'ICMP**.
- **ICMP echo n'a pas de connexion** : chaque paquet est **indépendant** et part immédiatement (pas de poignée de main comme en TCP).`,
    badge: {
      id: "badge-prat-icmp",
      name: "Détective du Silence",
      icon: "Binary",
      description: "A repéré des données cachées dans un simple ping.",
    },
    challenges: [
      {
        id: "prat-icmp-t1",
        title: "Prise de poste",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Prise de poste

Démarre le lab (posture analyste). Confirme que le segment répond :

\`\`\`bash
ping -c 2 target
\`\`\`

**Question :** quelle **commande** de base teste la connectivité vers un hôte ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "ping",
        accept: ["ping target", "ping -c 2 target"],
        caseSensitive: false,
        explanation: `**\`ping\`** confirme que \`target\` répond — ironique, puisque c'est précisément le protocole (**ICMP**) que quelqu'un détourne ici pour cacher des données. Passons à l'observation fine du trafic.`,
        tags: ["icmp", "detection", "ping"],
      },
      {
        id: "prat-icmp-t2",
        title: "Capturer le trafic ICMP",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📡 Filtrer l'ICMP

Mets-toi à l'écoute **du seul** trafic ICMP :

\`\`\`bash
tcpdump -i eth0 icmp
\`\`\`

**Question :** quelle **commande tcpdump** ne capture **que** le trafic ICMP sur l'interface eth0 ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "tcpdump -i eth0 icmp",
        accept: ["tcpdump icmp", "tcpdump -i eth0 -A -s0 icmp"],
        caseSensitive: true,
        explanation: `Le filtre **\`icmp\`** placé après \`tcpdump -i eth0\` ne conserve **que** les paquets ICMP — parfait pour isoler les pings suspects du reste du bruit réseau. On ajoutera \`-A -s0\` pour en lire le **contenu**.`,
        tags: ["icmp", "tcpdump", "filtre"],
      },
      {
        id: "prat-icmp-t3",
        title: "Repérer l'anomalie",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔍 Lire le payload

Capture le contenu des paquets ICMP pendant ~20-30 s :

\`\`\`bash
tcpdump -i eth0 -A -s0 icmp
\`\`\`

**Question :** qu'observes-tu dans le **contenu (payload)** de ces paquets ICMP, qui est **anormal** par rapport à un ping standard ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: [
          "Une chaîne de caractères ASCII lisible qui se répète, alors qu'un ping normal contient un motif d'octets incrémental non-lisible",
          "Rien d'anormal, c'est le comportement standard de ping",
          "Le paquet est entièrement chiffré",
          "Le paquet ne contient aucune donnée",
        ],
        answer: 0,
        explanation: `Un ping **normal** remplit son payload d'un **motif incrémental** (00 01 02 03…), **non lisible**. Ici, tu vois une **chaîne ASCII lisible qui se répète** — c'est le motif injecté via \`ping -p\`. Cette lisibilité est **l'anomalie** qui trahit le canal caché.`,
        tags: ["icmp", "payload", "anomalie"],
      },
      {
        id: "prat-icmp-t4",
        title: "Décoder le marqueur",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🔡 Le marqueur caché

Regarde attentivement la chaîne répétée dans le payload (\`tcpdump -A\`).

**Question :** quelle **chaîne de caractères ASCII** vois-tu se répéter dans le payload ?`,
        points: 250,
        timeLimitSec: 500,
        hints: [
          { text: "La chaîne fait 8 caractères et se répète plusieurs fois dans les 64 octets du paquet. Elle mélange lettres et chiffres.", cost: 20 },
        ],
        answer: "CACE1337",
        accept: ["cace1337"],
        caseSensitive: true,
        explanation: `La chaîne **\`CACE1337\`** apparaît en clair, répétée. Elle vient du motif hexadécimal \`4341434531333337\` passé à \`ping -p\` (43='C', 41='A', 43='C', 45='E', 31='1', 33='3', 33='3', 37='7'), répété pour remplir le paquet. Un attaquant encoderait ainsi de **vraies données** (fragmentées sur 16 octets max par paquet).`,
        tags: ["icmp", "decode", "marqueur"],
      },
      {
        id: "prat-icmp-t5",
        title: "Nommer la technique",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Le nom

**Question :** comment appelle-t-on l'utilisation détournée d'un protocole légitime (ici **ICMP**) pour faire transiter des **données cachées** ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "canal caché",
        accept: ["canal cache", "covert channel", "canal caché", "canal de communication caché"],
        caseSensitive: false,
        explanation: `C'est un **canal caché** (*covert channel*) : un protocole **légitime** (ICMP) détourné pour transporter de l'information **en douce**, contournant la surveillance. Vu en théorie dans le module « Canaux cachés », ici rendu concret par l'exfiltration dans le payload d'un ping.`,
        tags: ["icmp", "canal-cache", "covert-channel"],
      },
      {
        id: "prat-icmp-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Détecter à l'échelle

**Question :** quelle mesure de détection réseau permettrait de repérer ce type d'exfiltration ICMP ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Une inspection approfondie des paquets (DPI) recherchant des payloads ICMP de contenu ou de taille inhabituels",
          "Le blocage total du protocole ICMP sur tout le réseau, sans exception",
          "Le chiffrement systématique de tous les paquets ICMP",
          "L'augmentation de la bande passante disponible",
        ],
        answer: 0,
        explanation: `Le **DPI** (*Deep Packet Inspection*) inspecte le **contenu** et la **taille** des paquets ICMP et alerte sur l'inhabituel (texte lisible, paquets trop gros/fréquents). **Bloquer tout l'ICMP** serait excessif (certains messages ICMP sont vitaux au réseau) ; on ne « chiffre » pas l'ICMP, et la bande passante n'a rien à voir.`,
        tags: ["icmp", "dpi", "detection"],
      },
      {
        id: "prat-icmp-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## ⚡ ICMP sans connexion

**Question :** pourquoi ce canal caché n'a-t-il **pas** eu besoin d'une poignée de main pour transmettre sa donnée, contrairement à une connexion **TCP** ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "ICMP echo n'établit pas de connexion : chaque paquet est indépendant et part dès qu'il est émis",
          "ICMP chiffre automatiquement chaque paquet",
          "ICMP nécessite toujours une authentification préalable",
          "ICMP n'existe qu'en IPv6",
        ],
        answer: 0,
        explanation: `**ICMP echo est sans connexion** : aucune poignée de main (SYN/SYN-ACK/ACK) à établir, chaque paquet est **autonome** et part **immédiatement**. La donnée cachée voyage donc dès l'émission — d'où une capture triviale, sans dépendre du destinataire (contrairement au TCP des Modules 2 et 6).`,
        tags: ["icmp", "sans-connexion", "synthese"],
      },
    ],
  },
];
