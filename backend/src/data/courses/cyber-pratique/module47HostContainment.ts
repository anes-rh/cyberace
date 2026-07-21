import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 47 (Défense) : confinement réseau d'un hôte compromis. Réutilise la cible du Module 18. */
export const module47HostContainment: CourseSeed[] = [
  {
    slug: "prat-defense-host-containment",
    title: "Confiner un hôte compromis — quarantaine réseau",
    checkpoint: "defense",
    codename: "Silent Quarantine",
    domain: "Défense — Réponse à incident",
    theme: "grid",
    icon: "Ban",
    accent: "#C44F4F",
    order: 47,
    difficulty: "medium",
    summary:
      "L'hôte que tu avais appris à repérer au Module 18 (celui qui « bat » à intervalle régulier) est confirmé compromis. Ta mission cette fois : le mettre en quarantaine réseau — bloquer entrant ET sortant — sans couper le reste du système. Le confinement, pas la destruction.",
    objectives: [
      "Reconfirmer l'activité de balise (beacon) avant d'agir",
      "Identifier l'hôte compromis sur le réseau isolé",
      "Bloquer le trafic entrant depuis cet hôte (chaîne INPUT)",
      "Bloquer le trafic sortant vers cet hôte (chaîne OUTPUT)",
      "Vérifier que seul l'hôte visé est isolé, pas tout le réseau",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module18-beacon-noise:latest",
      ttlSec: 1000,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🚧 Confiner un hôte — Silent Quarantine

Au Module 18, tu repérais une **balise** (beacon) : un hôte qui « bat » à intervalle régulier vers l'extérieur. Il est maintenant **confirmé compromis**. On le met en **quarantaine**. 🩹

---

## 🧭 Le briefing

> *"L'hôte que tu avais appris à repérer au Module 18 est confirmé compromis. Ta mission : le mettre en quarantaine réseau, sans couper le reste du système."*

\`attacker\` a **NET_RAW** + **NET_ADMIN**. L'hôte compromis est \`target\` (il tente une connexion vers \`attacker:443\` toutes les ~10 s).

---

## 1. Reconfirmer avant d'agir 🔍

\`\`\`bash
tcpdump -i eth0 tcp        # les battements réguliers de 'target'
\`\`\`

Un comportement de **balise** = des tentatives de connexion à intervalle **parfaitement régulier** — signature d'un malware qui « appelle la maison ».

---

## 2. Confinement bidirectionnel 🔒

Un simple blocage entrant ne suffit pas : un hôte compromis peut aussi bien **recevoir des ordres** (entrant) qu'**exfiltrer / relayer** (sortant). On coupe donc les **deux sens** :

\`\`\`bash
iptables -A INPUT  -s target -j DROP     # plus rien n'ENTRE depuis target
iptables -A OUTPUT -d target -j DROP     # plus rien ne SORT vers target
\`\`\`

- **INPUT / -s** : source = target (entrant).
- **OUTPUT / -d** : destination = target (sortant).

---

## 3. Confiner sans tout casser ⚖️

Le but est une **quarantaine chirurgicale** : isoler \`target\`, pas le réseau entier. On le vérifie en s'assurant que le **reste** (un autre hôte, la passerelle Docker) **reste joignable** :

\`\`\`bash
iptables -L -v -n           # les compteurs face à target augmentent
ping -c 2 <passerelle>      # doit toujours répondre
\`\`\`

Si la passerelle répond encore mais que \`target\` est muet, le confinement est **ciblé et réussi**.

## 🧠 À retenir

- **Beacon** = connexions à intervalle **régulier** → hôte compromis.
- **Confinement bidirectionnel** : \`iptables -A INPUT -s target -j DROP\` **et** \`iptables -A OUTPUT -d target -j DROP\`.
- Pourquoi les deux sens : un compromis **reçoit** des ordres (entrant) **et** **exfiltre/relaie** (sortant).
- **Vérifier la portée** : les compteurs de target montent, mais la passerelle/les autres hôtes restent joignables.
- Prolonge le Module 18 : de la **détection** à l'**action** de confinement.`,
    badge: {
      id: "badge-prat-contain",
      name: "Officier de Confinement",
      icon: "Ban",
      description: "A isolé un hôte compromis sans couper le reste du réseau.",
    },
    challenges: [
      {
        id: "prat-contain-t1",
        title: "Reconfirmer l'activité",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔍 Voir la balise

Avant de confiner, reconfirme le trafic suspect.

**Question :** quelle commande capture le trafic TCP sur eth0 pour reconfirmer l'activité ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "tcpdump -i eth0 tcp",
        accept: ["tcpdump tcp"],
        caseSensitive: false,
        explanation: `\`tcpdump -i eth0 tcp\` révèle les battements réguliers de \`target\` vers \`attacker:443\`. On confirme toujours la menace **avant** de poser des règles de confinement.`,
        tags: ["defense", "containment", "tcpdump"],
      },
      {
        id: "prat-contain-t2",
        title: "Reconnaître le signal",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📡 La signature d'une balise

**Question :** quel comportement confirme qu'il s'agit d'un hôte potentiellement compromis, et pas d'un trafic normal ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Des tentatives de connexion à intervalle parfaitement régulier vers ce poste (comportement de balise)",
          "Un unique paquet isolé, jamais répété",
          "Un trafic HTTPS classique et non répétitif",
          "Une absence totale de trafic",
        ],
        answer: 0,
        explanation: `Un **beacon** (balise) se reconnaît à sa **régularité** : des connexions à intervalle constant (ici ~10 s), signe d'un malware qui contacte périodiquement son serveur de commande (C2). Le trafic humain, lui, est irrégulier et varié.`,
        tags: ["defense", "beacon", "signature"],
      },
      {
        id: "prat-contain-t3",
        title: "Identifier la cible du confinement",
        order: 3,
        difficulty: "easy",
        type: "text",
        prompt: `## 🎯 Qui isoler ?

**Question :** quel nom d'hôte Docker désigne ce poste compromis sur ce réseau isolé ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "target",
        accept: ["l'hote target", "hote target"],
        caseSensitive: false,
        explanation: `L'hôte compromis porte l'alias Docker **\`target\`** — c'est lui que \`tcpdump\` montre comme source des battements, et lui qu'on va confiner. On peut résoudre son IP avec \`getent hosts target\` si besoin.`,
        tags: ["defense", "containment", "hote"],
      },
      {
        id: "prat-contain-t4",
        title: "Bloquer l'entrant",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## ⬇️ Couper l'entrée

**Question :** quelle commande bloque tout le trafic ENTRANT en provenance de cet hôte ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "iptables -A INPUT -s target -j DROP",
        caseSensitive: true,
        explanation: `\`iptables -A INPUT -s target -j DROP\` empêche tout paquet **venant** de \`target\` d'atteindre ta machine : il ne peut plus t'envoyer d'ordres ni te sonder. C'est la moitié entrante du confinement.`,
        tags: ["defense", "iptables", "input"],
      },
      {
        id: "prat-contain-t5",
        title: "Bloquer le sortant",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## ⬆️ Couper la sortie

**Question :** quelle commande bloque aussi le trafic SORTANT vers cet hôte, pour un confinement complet ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "iptables -A OUTPUT -d target -j DROP",
        caseSensitive: true,
        explanation: `\`iptables -A OUTPUT -d target -j DROP\` empêche ta machine d'**émettre** vers \`target\` (destination \`-d\`). Combinée à la règle INPUT, elle réalise une **quarantaine bidirectionnelle** : plus aucun échange dans un sens comme dans l'autre.`,
        tags: ["defense", "iptables", "output"],
      },
      {
        id: "prat-contain-t6",
        title: "Pourquoi les deux sens",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔄 Entrant ET sortant

**Question :** pourquoi confiner dans les DEUX sens plutôt qu'un seul ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Un hôte compromis peut aussi bien recevoir des instructions (entrant) qu'exfiltrer des données ou relayer une attaque (sortant)",
          "Le sens sortant n'a jamais d'importance en sécurité",
          "iptables ne fonctionne que dans un seul sens à la fois",
          "Cela ralentit le confinement",
        ],
        answer: 0,
        explanation: `Un hôte compromis est une menace **dans les deux sens** : il **reçoit** des ordres de son C2 (entrant) et **exfiltre** des données ou **rebondit** vers d'autres cibles (sortant). Ne bloquer qu'un sens laisse la moitié du danger actif.`,
        tags: ["defense", "containment", "bidirectionnel"],
      },
      {
        id: "prat-contain-t7",
        title: "Vérifier la portée du confinement",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚖️ Chirurgical, pas total

**Question :** quelle vérification confirme que SEUL l'hôte compromis a été isolé, et non l'ensemble du réseau ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Tenter de joindre un autre hôte ou la passerelle, qui doit rester accessible",
          "Redémarrer le conteneur",
          "Supprimer toutes les règles iptables",
          "Désactiver le réseau entièrement",
        ],
        answer: 0,
        explanation: `Un bon confinement est **ciblé** : \`target\` est muet, mais la **passerelle** et les autres hôtes répondent toujours (\`ping\`). Si tout le réseau tombait, ce ne serait plus une quarantaine mais une coupure générale — contre-productif.`,
        tags: ["defense", "containment", "verification"],
      },
      {
        id: "prat-contain-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Prolonger le Module 18

**Question :** en quoi ce module prolonge-t-il le Module 18 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Il passe de la simple détection à une action concrète de confinement de la menace identifiée",
          "Il n'a aucun lien avec le Module 18",
          "Il remplace complètement la détection par un blocage automatique",
          "Il nécessite une élévation de privilèges, contrairement au Module 18",
        ],
        answer: 0,
        explanation: `Le Module 18 s'arrêtait à **détecter** la balise. Ici, on **agit** : on confine l'hôte identifié. C'est le passage détection → réponse, cœur de la réponse à incident et fil rouge de la série défense.`,
        tags: ["defense", "containment", "synthese"],
      },
    ],
  },
];
