import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 18 : détection de beaconing (C2) par la régularité. Lab Docker réel. */
export const module18BeaconDetect: CourseSeed[] = [
  {
    slug: "prat-beacon-detect",
    title: "Détection de beaconing (C2)",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Pulse",
    domain: "Détection réseau",
    theme: "grid",
    icon: "Orbit",
    accent: "#4F86C4",
    order: 18,
    difficulty: "medium",
    summary:
      "Cette fois, l'anomalie n'est pas dans le CONTENU d'un paquet mais dans son RYTHME. Un poste tente de joindre une même destination à intervalle mécaniquement régulier : la signature classique d'un logiciel malveillant qui « rentre en contact » avec son serveur de contrôle. Tu es l'analyste.",
    objectives: [
      "Capturer le trafic TCP sortant d'un poste surveillé",
      "Observer un rythme de connexion parfaitement périodique",
      "Nommer ce comportement : beaconing (balise C2)",
      "Comprendre pourquoi une régularité parfaite est plus suspecte que le hasard",
      "Situer la détection par jitter parmi les techniques anti-C2",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module18-beacon-noise:latest",
      ttlSec: 900,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🛰️ Détection de beaconing (C2) — Silent Pulse

Dans les modules précédents, l'anomalie se **lisait** dans un paquet : un mot de passe, un jeton, une communauté SNMP. Ici, **il n'y a rien à lire**. L'indice est ailleurs : dans le **rythme**. 🏎️

---

## 🧭 Le briefing

> Tu surveilles ce segment réseau. Le poste \`target\` tente **régulièrement** de joindre \`attacker\` sur le **port 443**. Observe **combien de fois**, et surtout **à quel rythme**.

Aucune interception, aucun flag à capturer : c'est un exercice d'**analyse** et de **déduction**. Tu es en posture **analyste** (comme aux Modules 4, 9, 13).

---

## 1. Beaconing : rentrer en contact 📡

Un logiciel malveillant installé sur une machine doit **recevoir des ordres** de son opérateur. Pour cela, il « appelle la maison » (*call home*) à intervalles réguliers vers un serveur de **command-and-control (C2)**. Chaque appel s'appelle une **balise** (*beacon*).

La caractéristique clé : ces appels sont **automatisés**, donc **mécaniquement réguliers** — toutes les 10 s, toutes les 60 s, etc. C'est un **script** qui les émet, pas un humain.

---

## 2. Pourquoi la régularité trahit 🧠

Un trafic **humain ou applicatif normal** est **rarement parfaitement périodique** : on ouvre une page, on attend, on clique, on part boire un café. Les intervalles sont **irréguliers**.

À l'inverse, un intervalle **mécaniquement constant** (par ex. exactement 10,0 s entre chaque tentative) est **anormal** : c'est la signature d'un programme automatisé. **Ce n'est pas le contenu qui alerte, c'est la métronomie.**

---

## 3. Observer le rythme avec tcpdump ⏱️

\`\`\`bash
tcpdump -i eth0 -n tcp
#              │  │  └── ne garde que le TCP
#              │  └── -n : pas de résolution DNS (garde les horodatages nets)
#              └── interface
\`\`\`

Laisse tourner **40 à 50 secondes** en notant l'**heure** (colonne de gauche) de chaque tentative de connexion vers le port 443. Tu verras un motif : une tentative **toutes les ~10 secondes**, comme un métronome.

> 💡 Il n'y a **aucun payload** à décoder ici : le \`nc -z\` de la cible ne fait qu'ouvrir puis fermer la connexion. Seul le **timing** compte.

---

## 4. La contre-mesure : analyser le jitter 🛡️

Les outils de détection de C2 mesurent précisément cette régularité : le **jitter** (la variation d'intervalle entre connexions). Un jitter proche de **zéro** (intervalles quasi identiques) vers une même destination est un **signal fort** de beaconing. Les vrais malwares ajoutent parfois du jitter aléatoire pour se cacher — mais une régularité brute comme ici est **immédiatement suspecte**.

---

## 🎯 Ta mission (résumé)

1. Prends ton poste d'analyste (\`ping\` pour confirmer que \`target\` répond).
2. **Capture** le trafic TCP, **observe** le rythme.
3. **Nomme** le comportement et comprends pourquoi il est suspect.

## 🧠 À retenir

- Le **beaconing** = appels réguliers d'un malware vers son **serveur C2** (*call home*).
- L'anomalie est **temporelle** (le rythme), pas dans le contenu.
- Un trafic **automatisé** est **parfaitement périodique** ; un trafic **humain** ne l'est jamais.
- La détection repose sur l'**analyse du jitter** (variation d'intervalle) des connexions sortantes.`,
    badge: {
      id: "badge-prat-beacon",
      name: "Chasseur de Rythme",
      icon: "Orbit",
      description: "A repéré la régularité suspecte d'une balise silencieuse.",
    },
    challenges: [
      {
        id: "prat-beacon-t1",
        title: "Prise de poste",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Prise de poste

Démarre le lab. Confirme d'abord que le poste surveillé répond :

\`\`\`bash
ping -c 3 target
\`\`\`

**Question :** quelle **commande** teste qu'un hôte est joignable en envoyant des paquets ICMP echo ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "ping",
        caseSensitive: false,
        explanation: `**\`ping\`** envoie des paquets ICMP *echo request* et mesure les réponses. Il confirme que \`target\` est vivant avant que tu ne l'observes.`,
        tags: ["beacon", "recon", "ping"],
      },
      {
        id: "prat-beacon-t2",
        title: "Capturer le trafic TCP",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📡 Capturer le trafic TCP

Mets-toi à l'écoute du trafic TCP sur ton interface :

\`\`\`bash
tcpdump -i eth0 tcp
\`\`\`

**Question :** quelle commande capture uniquement le trafic **TCP** sur l'interface \`eth0\` ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "tcpdump -i eth0 tcp",
        accept: ["tcpdump tcp"],
        caseSensitive: true,
        explanation: `**\`tcpdump -i eth0 tcp\`** capture le trafic TCP sur \`eth0\`. C'est ta fenêtre d'observation sur les tentatives de connexion de \`target\`.`,
        tags: ["beacon", "tcpdump"],
      },
      {
        id: "prat-beacon-t3",
        title: "Observer le rythme",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⏱️ Observer le rythme

Laisse tourner la capture **40 à 50 secondes** en notant l'heure de chaque tentative :

\`\`\`bash
tcpdump -i eth0 -n tcp
\`\`\`

**Question :** quel est le comportement temporel des tentatives de connexion provenant de \`target\` ?`,
        points: 200,
        timeLimitSec: 500,
        hints: [],
        options: [
          "Elles se répètent à intervalle très régulier (environ toutes les 10 secondes)",
          "Elles sont totalement aléatoires",
          "Une seule tentative, jamais répétée",
          "Elles s'accélèrent progressivement jusqu'à saturer le réseau",
        ],
        answer: 0,
        explanation: `Le motif est **métronomique** : une tentative toutes les **~10 secondes**. Cette régularité mécanique est exactement ce qui distingue un programme automatisé d'un usage humain.`,
        tags: ["beacon", "rythme", "timing"],
      },
      {
        id: "prat-beacon-t4",
        title: "Nommer le comportement",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Nommer le comportement

**Question :** comment appelle-t-on, en détection de menaces, un trafic sortant émis à intervalle très régulier vers une même destination, caractéristique d'un logiciel malveillant qui contacte périodiquement son opérateur ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        answer: "beaconing",
        accept: ["balise", "beacon"],
        caseSensitive: false,
        explanation: `Ce comportement s'appelle le **beaconing** (émission de **balises**). Chaque connexion régulière est une balise vers le serveur C2 — le malware « rentre en contact » pour recevoir ses ordres.`,
        tags: ["beacon", "c2", "vocabulaire"],
      },
      {
        id: "prat-beacon-t5",
        title: "Pourquoi c'est suspect",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Pourquoi c'est suspect

**Question :** pourquoi une régularité quasi parfaite est-elle **plus** suspecte qu'un trafic irrégulier ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Le trafic humain ou applicatif normal est rarement parfaitement périodique ; une régularité mécanique trahit un script ou un programme automatisé",
          "Un trafic régulier est toujours légitime et jamais suspect",
          "Le protocole TCP impose naturellement des intervalles fixes",
          "C'est uniquement un problème si le port utilisé est le port 443",
        ],
        answer: 0,
        explanation: `Un humain génère des intervalles **irréguliers** ; seul un **programme** produit une métronomie parfaite. C'est donc précisément la régularité qui trahit l'automatisation malveillante.`,
        tags: ["beacon", "analyse"],
      },
      {
        id: "prat-beacon-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure

**Question :** quelle approche de détection s'appuie précisément sur ce que ce module vient d'illustrer ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "L'analyse de la régularité temporelle (jitter) des connexions sortantes, typique des outils de détection de command-and-control",
          "Le blocage total du port 443 sur tout le réseau",
          "L'inspection du contenu chiffré des paquets",
          "L'augmentation de la bande passante disponible",
        ],
        answer: 0,
        explanation: `Les outils anti-C2 mesurent le **jitter** (variation d'intervalle) des connexions sortantes : un jitter quasi nul vers une même destination signale un beaconing, **sans jamais lire le contenu** (qui peut être chiffré).`,
        tags: ["beacon", "jitter", "contre-mesure"],
      },
      {
        id: "prat-beacon-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** qu'est-ce qui distingue fondamentalement ce module des Modules 4, 9 et 13 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "L'anomalie ici est temporelle (le rythme), alors que les précédents portaient sur le contenu ou le volume du trafic",
          "Ce module n'utilise pas tcpdump, contrairement aux précédents",
          "Ce module nécessite des capacités NET_RAW, contrairement aux précédents",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Les Modules 4/9/13 détectaient une anomalie de **contenu** ou de **volume** ; ici l'indice est purement **temporel** — le rythme des connexions. Même outil (tcpdump), dimension d'analyse différente.`,
        tags: ["beacon", "synthese"],
      },
    ],
  },
];
