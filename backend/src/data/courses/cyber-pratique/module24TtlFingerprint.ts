import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 24 : fingerprinting passif d'OS par le TTL. Lab Docker réel. */
export const module24TtlFingerprint: CourseSeed[] = [
  {
    slug: "prat-os-fingerprint-ttl",
    title: "Fingerprinting passif par TTL",
    checkpoint: "prat-recon-reseau",
    codename: "Silent Signature",
    domain: "Reconnaissance passive",
    theme: "grid",
    icon: "Fingerprint",
    accent: "#8FA6C4",
    order: 24,
    difficulty: "medium",
    summary:
      "Deviner un système d'exploitation sans jamais s'y connecter, juste en observant sa réponse. La valeur de TTL des paquets renvoyés trahit traditionnellement la famille d'OS. Exercice d'analyse et de déduction — avec un piège : ici, le TTL a été truqué exprès, pour illustrer la limite de la technique.",
    objectives: [
      "Observer la valeur de TTL dans une réponse ping",
      "Associer un TTL initial à une famille de systèmes",
      "Nommer la technique : fingerprinting passif",
      "Comprendre sa limite (le TTL est falsifiable)",
      "Citer d'autres indices passifs (taille de fenêtre TCP)",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module24-ttl-fingerprint:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      targetCapAdd: ["NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🫆 Fingerprinting passif par TTL — Silent Signature

Peut-on **deviner** le système d'exploitation d'une machine **sans s'y connecter** ? Souvent oui — en lisant les **indices** que son trafic laisse fuir. Mais ces indices peuvent **mentir**. 🏎️

---

## 🧭 Le briefing

> Observe la réponse de \`target\` à un simple \`ping\`. La valeur de **TTL** qu'elle renvoie va te suggérer un système d'exploitation… mais reste critique.

⚠️ Ce module **n'a pas de flag** : c'est un exercice d'**analyse** et de **déduction**.

---

## 1. Le TTL : un indice qui fuit 📉

Le **TTL** (*Time To Live*) est un champ de l'en-tête IP décrémenté à chaque routeur traversé, pour éviter qu'un paquet ne tourne en boucle éternellement. Chaque système d'exploitation part d'une **valeur initiale** caractéristique :

| Valeur initiale de TTL | Famille traditionnellement associée |
|---|---|
| **~64** | Linux, macOS, BSD |
| **~128** | Windows |
| **~255** | Anciens Unix, certains équipements réseau |

En observant le TTL **reçu** (proche de la valeur initiale si peu de sauts), on **devine** l'OS.

---

## 2. Observer 🔍

\`\`\`bash
ping -c 3 target
\`\`\`

Regarde le champ \`ttl=\` dans chaque réponse. Ici, il est proche de **128** → cela **suggère Windows**.

---

## 3. Le piège : le TTL ment 🎭

**Attention :** dans ce lab, la cible est en réalité **Linux** (TTL par défaut 64), mais une règle \`iptables\` **force** son TTL sortant à **128**. C'est une **simulation pédagogique** : en pratique, le TTL initial dépend du noyau et n'est **pas** modifié artificiellement — mais rien n'**empêche** de le faire.

C'est la **limite** de la technique : le TTL est **falsifiable**. Une déduction basée dessus peut être **trompeuse**.

---

## 4. D'autres indices passifs 🧠

Le TTL n'est pas le seul signal. La **taille de la fenêtre TCP initiale** (*TCP window size*) varie aussi selon les systèmes et complète le fingerprinting passif (outils comme *p0f*). Là encore, ce sont des **indices**, pas des preuves.

---

## 🎯 Ta mission (résumé)

1. \`ping\` la cible, observe le **TTL**.
2. Associe-le à une **famille d'OS**.
3. Nomme la **technique** et comprends sa **limite**.

## 🧠 À retenir

- Le **TTL** initial (~64 Linux, ~128 Windows, ~255 anciens Unix) **suggère** l'OS.
- **Fingerprinting passif** = déduire un système par **observation**, sans connexion active.
- **Limite majeure** : le TTL est **falsifiable** → déduction potentiellement trompeuse.
- Autre indice passif : la **taille de la fenêtre TCP** initiale.`,
    badge: {
      id: "badge-prat-ttl",
      name: "Lecteur d'Empreintes",
      icon: "Fingerprint",
      description: "A deviné un système d'exploitation sans jamais s'y connecter.",
    },
    challenges: [
      {
        id: "prat-ttl-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Premier contact

Démarre le lab. Envoie quelques paquets à la cible :

\`\`\`bash
ping -c 3 target
\`\`\`

**Question :** quelle **commande** envoie des paquets ICMP echo pour tester un hôte ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "ping",
        caseSensitive: false,
        explanation: `**\`ping\`** envoie des ICMP *echo request* ; chaque réponse contient un champ \`ttl=\` qu'on va exploiter.`,
        tags: ["ttl", "ping", "recon"],
      },
      {
        id: "prat-ttl-t2",
        title: "Observer le TTL",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔍 Observer le TTL

Regarde le champ \`ttl=\` dans les réponses de \`ping -c 3 target\`.

**Question :** quelle est approximativement la valeur du TTL observée ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: ["Environ 128", "Environ 64", "Environ 255", "Environ 32"],
        answer: 0,
        explanation: `Le TTL renvoyé est proche de **128**. Sur un même segment (aucun routeur traversé), c'est quasiment la valeur **initiale** de l'émetteur.`,
        tags: ["ttl", "observation"],
      },
      {
        id: "prat-ttl-t3",
        title: "Associer à un système",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧩 À quel OS ?

**Question :** à quelle famille de systèmes ce TTL initial (~128) est-il traditionnellement associé ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Windows",
          "Linux",
          "D'anciens Unix/équipements réseau (TTL initial ~255)",
          "Aucun système ne démarre avec cette valeur",
        ],
        answer: 0,
        explanation: `Un TTL initial de **128** est traditionnellement celui de **Windows** (Linux/macOS partent de 64). C'est ce que la déduction **suggère**… mais lis la suite.`,
        tags: ["ttl", "windows"],
      },
      {
        id: "prat-ttl-t4",
        title: "Nommer la technique",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Nommer la technique

**Question :** comment appelle-t-on la technique consistant à déduire des informations sur un système à partir de caractéristiques observables de son trafic, sans jamais s'y connecter activement ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        answer: "fingerprinting passif",
        accept: ["passive fingerprinting", "prise d'empreinte passive", "fingerprinting"],
        caseSensitive: false,
        explanation: `Le **fingerprinting passif** déduit un système par simple **observation** de son trafic (TTL, fenêtre TCP…), sans jamais initier de connexion — donc sans laisser de trace côté cible.`,
        tags: ["ttl", "fingerprinting", "vocabulaire"],
      },
      {
        id: "prat-ttl-t5",
        title: "La limite de cette technique",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎭 La limite

**Question :** quelle est la principale limite de cette technique de déduction ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Le TTL initial peut être modifié manuellement (comme ici), rendant la déduction potentiellement trompeuse",
          "Elle ne fonctionne qu'avec IPv6",
          "Elle nécessite obligatoirement les droits root sur la machine cible",
          "Elle ne fonctionne que sur un réseau Wi-Fi",
        ],
        answer: 0,
        explanation: `Ici, la cible est **Linux** mais affiche un TTL de **128** (forcé par iptables). Le TTL est **falsifiable** : s'y fier aveuglément mène à une conclusion **fausse**.`,
        tags: ["ttl", "limite"],
      },
      {
        id: "prat-ttl-t6",
        title: "Autres indices de fingerprinting passif",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Au-delà du TTL

**Question :** au-delà du TTL, quel autre indicateur réseau permet aussi de déduire un système d'exploitation sans connexion active ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "La taille de la fenêtre TCP initiale (TCP window size), qui varie aussi selon les systèmes",
          "Le nom de domaine de la machine",
          "La couleur de l'interface d'administration",
          "Le fuseau horaire configuré",
        ],
        answer: 0,
        explanation: `La **taille de la fenêtre TCP** initiale varie selon les piles réseau et complète le fingerprinting passif (cf. l'outil *p0f*). Elle aussi reste un **indice**, pas une preuve.`,
        tags: ["ttl", "tcp-window"],
      },
      {
        id: "prat-ttl-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** en quoi ce module diffère-t-il des autres modules de reconnaissance de ce parcours ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Aucune connexion active n'est établie avec la cible — seule l'observation passive de sa réponse suffit",
          "Il nécessite une élévation de privilèges root",
          "Il ne fonctionne qu'en IPv6",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Contrairement à un scan actif (nmap) qui **interroge** la cible, le fingerprinting passif se contente d'**observer** ce qu'elle renvoie — plus discret, mais tributaire d'indices falsifiables.`,
        tags: ["ttl", "synthese"],
      },
    ],
  },
];
