import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 48 (Défense) : reconnaître une technique de privesc dans un journal d'audit. Rejoue le Module 22 côté investigation. */
export const module48AuditLogPrivescReview: CourseSeed[] = [
  {
    slug: "prat-defense-privesc-audit-log",
    title: "Journal d'audit — reconnaître une élévation de privilèges",
    checkpoint: "defense",
    codename: "Silent Trail",
    domain: "Défense — Analyse de journaux",
    theme: "grid",
    icon: "History",
    accent: "#8F6BC4",
    order: 48,
    difficulty: "hard",
    summary:
      "L'historique de commandes d'un utilisateur suspect a été archivé. Sans avoir observé l'attaque en direct, tu dois reconstituer ce qui s'est passé et identifier PRÉCISÉMENT la technique employée — parmi toutes celles du parcours. Ici, la signature de deux touch juxtaposés trahit l'injection par joker tar dans une tâche cron (Module 22).",
    objectives: [
      "Lire un historique de commandes archivé (journal d'audit)",
      "Repérer les indices caractéristiques d'une technique précise",
      "Distinguer l'injection par joker tar des autres privesc du parcours",
      "Retrouver l'artefact de persistance créé (rootbash SUID)",
      "Confirmer que la technique a réussi (id exécuté en root)",
    ],
    sandbox: {
      attackerImage: "cyberace/module48-audit-log-privesc-review:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🧭 Enquête sur un historique — Silent Trail

Parfois, l'attaque est déjà passée et il ne reste qu'un **historique de commandes**. En analyste, tu dois **reconnaître** la technique rien qu'à ces lignes. 🕵️

---

## 🧭 Le briefing

> *"L'historique de commandes d'un utilisateur suspect a été archivé. Sans avoir observé l'attaque en direct, détermine ce qui s'est passé — et identifie précisément la technique utilisée."*

Terminal **en root**. Le journal est dans **\`/var/log/session_audit.log\`**.

---

## 1. Lire l'historique 📜

\`\`\`bash
cat /var/log/session_audit.log
\`\`\`

On y voit la séquence de l'utilisateur \`stagiaire\` : \`id\`, exploration d'une tâche cron (\`/etc/cron.d/archive\`), création d'un \`payload.sh\`, puis deux commandes \`touch\` très étranges, et enfin un \`id\` exécuté par **root**.

---

## 2. La signature qui ne trompe pas 🎯

Le cœur de l'indice, ce sont ces deux lignes :

\`\`\`
touch -- --checkpoint=1
touch -- --checkpoint-action=exec=sh payload.sh
\`\`\`

Créer des **fichiers dont le nom commence par \`--\`** n'a aucun sens en usage normal. Ici, ces noms sont en réalité des **options de \`tar\`** déguisées en fichiers. Quand une tâche cron lance un \`tar *\` dans ce dossier, le shell **développe le joker \`*\`** et passe ces « fichiers » comme **arguments** à tar — qui exécute alors \`payload.sh\` avec les privilèges de la tâche (root).

C'est exactement l'**injection par joker (wildcard) tar dans une tâche cron** du **Module 22**.

---

## 3. Ne pas confondre les techniques 🧩

Le parcours contient plusieurs privesc — il faut les distinguer :
- **SUID** (Module 3) : abus d'un binaire au bit setuid.
- **cron simple** (Module 5) : script cron modifiable.
- **LD_PRELOAD** (Module 21) : détournement de bibliothèque.
- **capacités** (Module 8) : capabilities Linux.
- **joker tar + cron** (Module 22) : **← notre cas**, reconnaissable aux \`touch -- --checkpoint...\`.

---

## 4. La preuve du succès ✅

La dernière ligne :

\`\`\`
2026-07-18 09:16:35 root: id
\`\`\`

L'utilisateur \`stagiaire\` est devenu **root** : la commande \`id\` est désormais exécutée sous l'identité root. L'artefact laissé, \`/tmp/rootbash\` (un bash copié + SUID), assure un **shell root persistant**.

## 🧠 À retenir

- Journal d'audit = **historique de commandes** rejouable après coup.
- **Signature du joker tar/cron** : des \`touch -- --checkpoint...\` créant des fichiers-options.
- Mécanisme : le \`*\` d'un \`tar *\` en cron développe ces noms en **arguments** → exécution de \`payload.sh\` en root.
- **Artefact** classique : \`/tmp/rootbash\` (bash SUID root).
- **Preuve** : \`id\` exécuté par **root** en fin d'historique.
- Savoir **lire** ce journal permet de détecter une compromission **sans** avoir vu l'attaque en direct.`,
    badge: {
      id: "badge-prat-auditreview",
      name: "Enquêteur Rétrospectif",
      icon: "History",
      description: "A reconnu une technique d'élévation de privilèges rien qu'à la lecture d'un historique de commandes.",
    },
    challenges: [
      {
        id: "prat-auditreview-t1",
        title: "Prise en main",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Ouvrir l'historique

**Question :** quelle commande affiche le contenu d'un fichier texte ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "cat",
        accept: ["cat /var/log/session_audit.log"],
        caseSensitive: false,
        explanation: `**\`cat\`** affiche le journal. \`cat /var/log/session_audit.log\` déroule toute la séquence de commandes de l'utilisateur suspect — c'est le point de départ de l'enquête.`,
        tags: ["defense", "audit", "cat"],
      },
      {
        id: "prat-auditreview-t2",
        title: "Localiser l'historique",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🗺️ Le fichier d'audit

**Question :** quel fichier contient l'historique des commandes de l'utilisateur surveillé ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        answer: "/var/log/session_audit.log",
        accept: ["session_audit.log"],
        caseSensitive: false,
        explanation: `L'historique est dans **\`/var/log/session_audit.log\`** : chaque ligne horodate une commande et son auteur (\`stagiaire\` puis \`root\`). C'est la trace laissée par l'attaquant.`,
        tags: ["defense", "audit", "fichier"],
      },
      {
        id: "prat-auditreview-t3",
        title: "Repérer les indices caractéristiques",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎯 Ce qui saute aux yeux

**Question :** quelles commandes, dans cet historique, sont les indices les plus caractéristiques d'une technique précise ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: [
          "Les deux commandes 'touch' créant des fichiers dont le nom commence par --",
          "Les commandes 'ls' et 'cd'",
          "La commande 'id' répétée",
          "Aucune commande n'est un indice pertinent",
        ],
        answer: 0,
        explanation: `Les deux \`touch -- --checkpoint=1\` et \`touch -- --checkpoint-action=exec=sh payload.sh\` créent des fichiers dont le nom **commence par \`--\`** : ce ne sont pas des fichiers, ce sont des **options de tar** déguisées. Aucun usage légitime ne fait ça — c'est la signature de l'attaque.`,
        tags: ["defense", "audit", "indices"],
      },
      {
        id: "prat-auditreview-t4",
        title: "Identifier la technique",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🧩 Quelle technique exactement ?

**Question :** à quelle technique précise, vue plus tôt dans ce parcours, cette séquence correspond-elle ?`,
        points: 250,
        timeLimitSec: 500,
        hints: [
          { text: "La clé est dans les deux commandes 'touch' juxtaposées, très spécifiques à une seule technique du parcours (revois le Module 22).", cost: 25 },
        ],
        options: [
          "Injection par joker (wildcard) tar dans une tâche cron",
          "Exploitation d'un binaire SUID",
          "Détournement LD_PRELOAD",
          "Écriture directe dans /etc/passwd",
        ],
        answer: 0,
        explanation: `C'est l'**injection par joker tar dans une tâche cron** (Module 22) : les fichiers \`--checkpoint...\` sont interprétés comme des options par un \`tar *\` lancé en cron, ce qui exécute \`payload.sh\` en root. Les autres techniques (SUID, LD_PRELOAD, /etc/passwd) ont des signatures totalement différentes.`,
        tags: ["defense", "audit", "tar-wildcard"],
      },
      {
        id: "prat-auditreview-t5",
        title: "L'artefact laissé",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔧 La porte dérobée

Le \`payload.sh\` copie bash et lui met le bit SUID.

**Question :** quel fichier a manifestement été créé pour obtenir un shell root persistant après l'exécution de la tâche planifiée ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "/tmp/rootbash",
        accept: ["rootbash"],
        caseSensitive: false,
        explanation: `Le payload fait \`cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash\` : **\`/tmp/rootbash\`** est un bash **SUID root**. En le lançant avec \`-p\`, l'utilisateur obtient un shell root à volonté — une **persistance** classique après élévation.`,
        tags: ["defense", "audit", "artefact"],
      },
      {
        id: "prat-auditreview-t6",
        title: "La preuve du succès",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ✅ La technique a-t-elle marché ?

**Question :** quelle preuve, dans le dernier événement de l'historique, confirme que la technique a réussi ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "La commande 'id' est désormais exécutée par 'root' et non plus 'stagiaire'",
          "L'historique s'arrête brusquement",
          "Aucune preuve n'est présente",
          "La date change de jour",
        ],
        answer: 0,
        explanation: `La dernière ligne montre \`root: id\` : la commande est exécutée sous l'identité **root**, alors que toutes les précédentes étaient sous \`stagiaire\`. Ce changement d'utilisateur est la **preuve** que l'élévation a abouti.`,
        tags: ["defense", "audit", "preuve"],
      },
      {
        id: "prat-auditreview-t7",
        title: "Confirmer l'analyse (flag)",
        order: 7,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le rapport SOC

\`\`\`bash
cat /root/soc_report.txt
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` figure dans le rapport ?`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "Le rapport se trouve dans le dossier personnel de root (`/root`).", cost: 25 },
        ],
        answer: "CYBERACE{technique_identifiee_joker_tar_cron}",
        caseSensitive: true,
        explanation: `\`cat /root/soc_report.txt\` confirme **CYBERACE{technique_identifiee_joker_tar_cron}**. Le flag valide ton diagnostic : la technique reconnue est bien l'injection par joker tar dans une tâche cron.`,
        tags: ["defense", "flag", "soc"],
      },
      {
        id: "prat-auditreview-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 L'intérêt de savoir lire

**Question :** quel est l'intérêt de savoir lire ce type de journal, au-delà de savoir exploiter la technique soi-même ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Cela permet de détecter une compromission après coup, même sans avoir observé l'attaque en direct",
          "Cela n'a aucune utilité pratique",
          "Cela remplace complètement la nécessité de corriger la vulnérabilité",
          "Cela ne concerne que les environnements Windows",
        ],
        answer: 0,
        explanation: `Connaître les techniques **de l'intérieur** permet de les **reconnaître dans les journaux** après coup — la compétence clé de l'analyste forensique. On détecte la compromission même sans l'avoir vue se produire, en lisant les traces qu'elle laisse.`,
        tags: ["defense", "audit", "synthese"],
      },
    ],
  },
];
