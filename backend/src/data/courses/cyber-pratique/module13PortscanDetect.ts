import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 13 : détection d'un scan de ports (posture analyste). Lab Docker réel. */
export const module13PortscanDetect: CourseSeed[] = [
  {
    slug: "prat-portscan-detect",
    title: "Détecter un scan de ports (l'autre côté du Module 1)",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Radar",
    domain: "Détection réseau",
    theme: "grid",
    icon: "Grid3x3",
    accent: "#B25E9E",
    order: 13,
    difficulty: "medium",
    summary:
      "Treizième lab réel : bouclage du Module 1. Cette fois, c'est TON conteneur qui est scanné. Un poste teste discrètement une série de ports contre toi — la signature classique d'un scan. Tu apprends à la reconnaître à la capture, du point de vue du défenseur.",
    objectives: [
      "Adopter la posture défensive : reconnaître une attaque plutôt que la mener",
      "Capturer le trafic TCP entrant (tcpdump)",
      "Identifier la signature d'un scan (une source, de nombreux ports en peu de temps)",
      "Nommer le comportement et réagir de façon appropriée",
      "Boucler la boucle pédagogique avec le Module 1 (scanner vs être scanné)",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module13-portscan-noise:latest",
      ttlSec: 900,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 📡 Détecter un scan de ports — Silent Radar

Au **Module 1**, tu as appris à **scanner** une cible avec nmap. Ce module **retourne la perspective** : cette fois, **c'est toi qui es scanné**, et tu dois **le reconnaître** — le réflexe du défenseur. 🏎️

---

## 🧭 Le briefing

> Cette fois, c'est **TON conteneur** (\`attacker\`) qui est visé. Le poste **\`target\`** teste discrètement une **série de ports** contre toi — **remarque-le**. Tu ne déclenches rien : tu **observes** et tu **diagnostiques**.

**Comment jouer :** « Démarrer le lab », terminal (posture **défensive**). Le poste \`target\` s'active tout seul contre toi.

---

## 1. Rappel : qu'est-ce qu'un scan de ports ? 🔭

Un **scan de ports** (Module 1) consiste à **tester** quels ports d'une cible sont **ouverts**, en tentant une **connexion** sur chacun. Côté attaquant, c'est de la **reconnaissance**. Côté **défenseur**, ça laisse une **trace caractéristique** : une **même source** qui tente de joindre **beaucoup de ports différents** en **très peu de temps** — un comportement qu'**aucun usage normal** ne produit.

---

## 2. Capturer le trafic entrant 🔍

En analyste, tu captures le trafic **TCP** avec \`tcpdump\` :

\`\`\`bash
tcpdump -i eth0 tcp           # ne garde que le TCP
tcpdump -i eth0 -n tcp        # + sans resolution DNS (-n), plus lisible
\`\`\`

Laisse tourner ~25 s et observe les paquets **venant de \`target\`**.

---

## 3. Reconnaître la signature 🎯

Dans un usage **normal**, une source ouvre **une** connexion vers **un** service précis (ex. le port 443 d'un site). Sous **scan**, tu vois l'inverse :

\`\`\`
   target.51000 > toi.21    (SYN)
   target.51001 > toi.22    (SYN)
   target.51002 > toi.23    (SYN)
   target.51003 > toi.25    (SYN)
   … des dizaines de ports DESTINATION différents, même SOURCE, en quelques secondes
\`\`\`

La **signature** : **une seule source** (\`target\`) → **de nombreux ports de destination différents** → en **peu de temps**. Ici, \`target\` teste **~20 ports** (21, 22, 23, 25, 53, 80, 443, 3306, 3389…) par salve. C'est **manifestement** un scan, pas un usage légitime.

> 🧠 C'est exactement ce que faisait **ton** \`nmap\` au Module 1, vu **de l'autre côté** : là où tu voyais « scanner efficacement », le défenseur voit « une source qui frappe à toutes les portes ».

---

## 4. Réagir en défenseur 🛡️

Face à un scan détecté, la bonne réaction n'est ni de paniquer ni de riposter :
- **Alerter/surveiller** (un IDS comme Snort/Suricata a des règles de détection de scan).
- **Vérifier sa propre surface** : quels services sont **réellement** exposés ? Sont-ils **nécessaires** et **à jour** ? Un scan est souvent le **prélude** à une exploitation → autant s'assurer qu'il ne trouvera **rien** d'exploitable.
- **Ne pas** éteindre bêtement la machine, **ne pas** riposter par un scan (illégal et inutile).

> 🧭 Un scan en lui-même ne « casse » rien — mais il **révèle** ta surface d'attaque. Le repérer permet d'**anticiper** la suite et de **durcir** ce qui doit l'être.

---

## 🎯 Ta mission (résumé)

1. Prends ton poste, capture le **TCP** (\`tcpdump -i eth0 -n tcp\`).
2. Repère la **signature** : une source, plein de ports, vite.
3. **Nomme** le comportement et connais la **réaction** appropriée.

## 🧠 À retenir

- Un **scan de ports** teste quels ports d'une cible sont ouverts (Module 1, côté offensif). Côté **défenseur**, il laisse une **signature** nette.
- **Capture** : \`tcpdump -i eth0 -n tcp\`. **Signature d'un scan** : **une même source** → **de nombreux ports de destination différents** → en **peu de temps** (ici ~20 ports par salve).
- Un usage **normal** = une source, **un** port ciblé. Le scan = une source, **plein** de ports → anomalie évidente.
- **Réaction** : **alerter/surveiller** (IDS), **vérifier sa surface** (services exposés nécessaires et à jour). **Pas** de riposte, **pas** d'extinction réflexe.
- **Bouclage Module 1** : scanner (offensif) ↔ reconnaître qu'on est scanné (défensif) — deux faces du même acte.`,
    badge: {
      id: "badge-prat-portscan",
      name: "Radar Silencieux",
      icon: "Grid3x3",
      description: "A reconnu la signature d'un scan de ports, cette fois du côté de la cible.",
    },
    challenges: [
      {
        id: "prat-portscan-t1",
        title: "Prise de poste",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Prise de poste

Démarre le lab. Avant d'observer, confirme la connectivité de base vers le voisin :

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
        explanation: `**\`ping\`** confirme que \`target\` est joignable. Mais \`target\` ne se contente pas d'être là : il **teste tes ports** en douce. Il faut passer à la **capture** pour le voir.`,
        tags: ["portscan", "detection", "ping"],
      },
      {
        id: "prat-portscan-t2",
        title: "Capturer le trafic TCP",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📡 Filtrer le TCP

Capture uniquement le trafic **TCP** sur ton interface :

\`\`\`bash
tcpdump -i eth0 tcp
\`\`\`

**Question :** quelle **commande tcpdump** capture **uniquement** le trafic TCP sur eth0 ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "tcpdump -i eth0 tcp",
        accept: ["tcpdump tcp", "tcpdump -i eth0 -n tcp"],
        caseSensitive: true,
        explanation: `Le filtre **\`tcp\`** après \`tcpdump -i eth0\` ne garde que les paquets **TCP** — c'est là qu'apparaît la signature d'un scan (tentatives de connexion SYN). Ajouter \`-n\` (pas de résolution DNS) rend la lecture plus rapide.`,
        tags: ["portscan", "tcpdump", "tcp"],
      },
      {
        id: "prat-portscan-t3",
        title: "Observer la signature",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎯 Ce qui trahit le scan

Capture ~25 secondes :

\`\`\`bash
tcpdump -i eth0 -n tcp
\`\`\`

**Question :** que remarques-tu dans le trafic provenant d'une **seule et même source** (\`target\`) ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: [
          "De nombreuses tentatives de connexion vers des ports de destination différents, en peu de temps",
          "Un seul flux de données continu vers un seul port",
          "Aucun trafic TCP visible",
          "Uniquement du trafic UDP",
        ],
        answer: 0,
        explanation: `La signature d'un scan : **une même source** (\`target\`) tente d'ouvrir des connexions vers **beaucoup de ports de destination différents**, en **peu de temps**. Un usage normal, lui, ouvrirait **un** flux vers **un** port. C'est l'anomalie qui trahit le balayage.`,
        tags: ["portscan", "signature", "detection"],
      },
      {
        id: "prat-portscan-t4",
        title: "Compter les ports visés",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔢 Combien de ports ?

**Question :** approximativement, **combien** de ports de destination différents sont sollicités par cette même source en une seule salve ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: ["Environ 20", "Exactement 1", "Environ 3", "Plus de 1000"],
        answer: 0,
        explanation: `La salve vise **~20 ports** (21, 22, 23, 25, 53, 80, 110, 139, 143, 443, 445, 3306, 3389, 5432, 6379, 8080, 8443, 9200, 27017, 6667). Bien plus qu'un usage normal (1), mais pas un scan exhaustif de 65535 ports non plus — un balayage ciblé des services courants.`,
        tags: ["portscan", "comptage", "ports"],
      },
      {
        id: "prat-portscan-t5",
        title: "Nommer le comportement",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Le nom

**Question :** comment qualifie-t-on ce type de comportement réseau (une **source**, de **nombreux ports distincts** en **peu de temps**) ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "scan de ports",
        accept: ["port scan", "balayage de ports", "scan", "portscan"],
        caseSensitive: false,
        explanation: `C'est un **scan de ports** (*port scan* / balayage de ports) : une source teste systématiquement de nombreux ports pour cartographier les services ouverts. C'est exactement ce que faisait ton \`nmap\` au Module 1 — ici vu **du côté de la cible**.`,
        tags: ["portscan", "nom", "scan"],
      },
      {
        id: "prat-portscan-t6",
        title: "Réaction appropriée",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Que faire ?

**Question :** quelle est une **réponse défensive appropriée** face à un scan de ports détecté ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Vérifier quels services sont réellement exposés et s'assurer qu'ils sont nécessaires et à jour, en complément d'une alerte/surveillance",
          "Éteindre définitivement la machine ciblée",
          "Ignorer, un scan ne présente jamais de risque",
          "Répondre par un scan identique vers la source",
        ],
        answer: 0,
        explanation: `La bonne réaction : **surveiller/alerter** (IDS) et **vérifier sa propre surface** — quels services sont exposés, sont-ils **nécessaires** et **à jour** ? Un scan précède souvent une exploitation. Éteindre la machine est disproportionné, ignorer est imprudent, et riposter par un scan est illégal et contre-productif.`,
        tags: ["portscan", "reaction", "defense"],
      },
      {
        id: "prat-portscan-t7",
        title: "Synthèse du parcours",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Boucler avec le Module 1

**Question :** en quoi ce module **referme-t-il une boucle** avec le Module 1 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Le Module 1 enseignait à scanner ; celui-ci enseigne à reconnaître qu'on est soi-même scanné",
          "Les deux modules utilisent exactement les mêmes commandes sans différence",
          "Ce module n'a aucun lien avec le Module 1",
          "Le Module 1 était défensif, celui-ci est offensif",
        ],
        answer: 0,
        explanation: `Le Module 1 t'apprenait à **scanner** (offensif, avec nmap) ; ce module t'apprend à **reconnaître qu'on te scanne** (défensif, avec tcpdump). Même acte, **deux perspectives** — c'est le bouclage pédagogique attaque/défense du parcours.`,
        tags: ["portscan", "synthese", "module1"],
      },
    ],
  },
];
