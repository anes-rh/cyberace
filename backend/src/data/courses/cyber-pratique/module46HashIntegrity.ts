import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 46 (Défense) : contrôle d'intégrité par hachage SHA-256. Pendant du Module 27. */
export const module46HashIntegrity: CourseSeed[] = [
  {
    slug: "prat-defense-hash-integrity",
    title: "Intégrité par hachage — repérer un fichier altéré",
    checkpoint: "defense",
    codename: "Silent Fingerprint",
    domain: "Défense — Intégrité des fichiers",
    theme: "grid",
    icon: "FileCheck",
    accent: "#4FC46B",
    order: 46,
    difficulty: "medium",
    summary:
      "Une empreinte de référence de l'application a été prise il y a plusieurs semaines. Depuis, un fichier a été discrètement modifié. À toi de le prouver : en comparant les empreintes SHA-256 actuelles à la référence, tu identifies en une commande le fichier dont le contenu a changé — même d'un seul octet.",
    objectives: [
      "Calculer l'empreinte SHA-256 d'un fichier",
      "Comprendre le rôle d'un fichier de référence (baseline)",
      "Vérifier des fichiers par rapport à une liste d'empreintes (sha256sum -c)",
      "Interpréter un résultat FAILED et retrouver l'altération",
      "Justifier le hachage face à une simple comparaison de date",
    ],
    sandbox: {
      attackerImage: "cyberace/module46-integrity-hash-check:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🧬 Intégrité par hachage — Silent Fingerprint

Au Module 27, tu comparais une liste de binaires SUID à une référence. Ici, même esprit d'**audit par comparaison**, mais sur le **contenu** des fichiers. 🔬

---

## 🧭 Le briefing

> *"Une empreinte de référence de l'application a été prise il y a plusieurs semaines. Vérifie si quelque chose a changé depuis."*

Terminal **en root**. L'application est dans **\`/opt/app\`**, la référence dans **\`/opt/baseline_sha256sums.txt\`**.

---

## 1. L'empreinte d'un fichier 🔑

Une fonction de hachage (SHA-256) transforme un fichier en une **empreinte** de 64 caractères. Le moindre changement de contenu — un seul octet — produit une empreinte **totalement différente** :

\`\`\`bash
sha256sum /opt/app/server.py
\`\`\`

---

## 2. La référence (baseline) 📌

Avant tout incident, on a figé les empreintes de tous les fichiers dans un fichier de **référence** :

\`\`\`bash
cat /opt/baseline_sha256sums.txt        # les empreintes "saines"
\`\`\`

C'est notre point de comparaison de confiance.

---

## 3. Vérifier en une commande ✅

\`sha256sum\` sait **vérifier** un lot de fichiers contre une liste d'empreintes, avec l'option **\`-c\`** :

\`\`\`bash
cd /opt/app && sha256sum -c /opt/baseline_sha256sums.txt
\`\`\`

Sortie :

\`\`\`
server.py: OK
config.ini: OK
utils.py: FAILED
README.md: OK
\`\`\`

\`FAILED\` = le contenu **ne correspond plus** à la référence : le fichier a été **modifié** depuis la prise d'empreinte.

---

## 4. Pourquoi le hachage, pas la date 🧠

Une date de modification (\`ls -l\`, \`stat\`) est **falsifiable** en une commande (\`touch -d\`). Un attaquant peut modifier un fichier puis remettre l'ancienne date. Le **hachage**, lui, dépend du **contenu** : reproduire la même empreinte avec un contenu différent est **infaisable en pratique**. C'est pour ça que les systèmes de contrôle d'intégrité (AIDE, Tripwire) reposent sur le hachage, pas sur les timestamps.

## 🧠 À retenir

- **SHA-256** : \`sha256sum fichier\` → une empreinte unique du **contenu**.
- Une **baseline** (\`/opt/baseline_sha256sums.txt\`) fige l'état sain de référence.
- **Vérifier** : \`sha256sum -c baseline.txt\` → \`OK\` / \`FAILED\` par fichier.
- \`FAILED\` = contenu modifié depuis la référence.
- Le hachage bat la date : une date se **falsifie** (\`touch -d\`), une empreinte non.`,
    badge: {
      id: "badge-prat-hashintegrity",
      name: "Vérificateur d'Empreintes",
      icon: "FileCheck",
      description: "A repéré un octet modifié parmi des milliers, grâce au hachage.",
    },
    challenges: [
      {
        id: "prat-hashintegrity-t1",
        title: "L'outil de base",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔑 Calculer une empreinte

**Question :** quelle commande calcule l'empreinte SHA-256 d'un fichier ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "sha256sum",
        accept: ["sha256sum fichier"],
        caseSensitive: false,
        explanation: `**\`sha256sum <fichier>\`** produit l'empreinte SHA-256 (64 caractères hexa) du contenu. Deux fichiers identiques → même empreinte ; le moindre changement → empreinte totalement différente.`,
        tags: ["defense", "hash", "sha256"],
      },
      {
        id: "prat-hashintegrity-t2",
        title: "La référence",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📌 Le point de comparaison

**Question :** quel fichier contient les empreintes de référence prises avant tout incident ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        answer: "/opt/baseline_sha256sums.txt",
        accept: ["baseline_sha256sums.txt"],
        caseSensitive: false,
        explanation: `**\`/opt/baseline_sha256sums.txt\`** fige les empreintes « saines » de chaque fichier de l'application. C'est la vérité de référence : tout écart par rapport à ce fichier signale une altération.`,
        tags: ["defense", "hash", "baseline"],
      },
      {
        id: "prat-hashintegrity-t3",
        title: "L'option de vérification",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## ✅ Vérifier, pas recalculer

**Question :** quelle option de sha256sum permet de VÉRIFIER des fichiers par rapport à une liste d'empreintes, plutôt que d'en calculer de nouvelles ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "-c",
        accept: ["--check"],
        caseSensitive: true,
        explanation: `L'option **\`-c\`** (\`--check\`) fait lire à \`sha256sum\` une liste d'empreintes et vérifier chaque fichier : il recalcule l'empreinte actuelle et la compare, affichant \`OK\` ou \`FAILED\`. C'est le mode « contrôle d'intégrité ».`,
        tags: ["defense", "hash", "check"],
      },
      {
        id: "prat-hashintegrity-t4",
        title: "Lancer la vérification",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔍 Trouver le fautif

\`\`\`bash
cd /opt/app && sha256sum -c /opt/baseline_sha256sums.txt
\`\`\`

**Question :** quel fichier échoue à la vérification (FAILED) ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [
          { text: "La sortie affiche 'OK' pour chaque fichier conforme et 'FAILED' pour celui qui a changé.", cost: 20 },
        ],
        answer: "utils.py",
        accept: ["/opt/app/utils.py"],
        caseSensitive: false,
        explanation: `**\`utils.py\`** ressort en \`FAILED\` : son contenu a changé depuis la baseline. Les trois autres (\`server.py\`, \`config.ini\`, \`README.md\`) sont \`OK\`. En une commande, on a isolé le seul fichier altéré.`,
        tags: ["defense", "hash", "failed"],
      },
      {
        id: "prat-hashintegrity-t5",
        title: "Interpréter FAILED",
        order: 5,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 📖 Que signifie FAILED ?

**Question :** que signifie ce résultat FAILED ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Le contenu du fichier a changé depuis la prise d'empreinte de référence",
          "Le fichier a été supprimé",
          "Le fichier n'a jamais existé",
          "L'empreinte de référence est corrompue",
        ],
        answer: 0,
        explanation: `\`FAILED\` signifie que l'empreinte **actuelle** du fichier ne correspond plus à celle enregistrée dans la baseline : son **contenu a été modifié**. (Un fichier supprimé donnerait plutôt une erreur « No such file ».)`,
        tags: ["defense", "hash", "interpretation"],
      },
      {
        id: "prat-hashintegrity-t6",
        title: "Lire l'altération (flag)",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Ce qui a été ajouté

Ouvre le fichier altéré et regarde ce qui y a été glissé.

\`\`\`bash
cat /opt/app/utils.py
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` a été inséré dans le fichier ?`,
        points: 300,
        timeLimitSec: 500,
        hints: [
          { text: "Le contenu suspect se trouve à la toute fin du fichier.", cost: 25 },
        ],
        answer: "CYBERACE{integrite_rompue_detectee_par_hachage}",
        caseSensitive: true,
        explanation: `À la fin de \`utils.py\`, un « maintenance hook » non autorisé cache **CYBERACE{integrite_rompue_detectee_par_hachage}**. C'est exactement le genre d'ajout discret (backdoor, ligne malveillante) que le contrôle d'intégrité par hachage sait révéler.`,
        tags: ["defense", "flag", "integrite"],
      },
      {
        id: "prat-hashintegrity-t7",
        title: "Pourquoi le hachage plutôt que la date",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Hachage vs timestamp

**Question :** pourquoi une vérification par hachage est-elle plus fiable qu'une simple comparaison de date de modification ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Un attaquant peut facilement falsifier une date de modification, mais reproduire un hachage identique pour un contenu différent est infaisable en pratique",
          "Le hachage est toujours plus rapide à calculer",
          "La date de modification n'existe pas sous Linux",
          "Le hachage change automatiquement chaque jour",
        ],
        answer: 0,
        explanation: `Une date se **falsifie** en une commande (\`touch -d\`) : l'attaquant remet l'ancienne date après sa modif. Le hachage dépend du **contenu** ; produire deux contenus différents avec la même empreinte SHA-256 est **infaisable en pratique**. D'où sa fiabilité pour l'intégrité.`,
        tags: ["defense", "hash", "fiabilite"],
      },
      {
        id: "prat-hashintegrity-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Lien avec le Module 27

**Question :** quel principe relie ce module au Module 27 (audit SUID) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Les deux comparent un état système réel à un état de référence connu pour repérer une anomalie",
          "Les deux nécessitent une élévation de privilèges",
          "Les deux concernent uniquement des fichiers Python",
          "Il n'y a aucun lien",
        ],
        answer: 0,
        explanation: `Même principe d'**audit par comparaison à une référence** : le Module 27 comparait la liste des binaires SUID à un état attendu ; ici, on compare les empreintes de contenu à une baseline. Détecter une anomalie = mesurer un **écart** par rapport à un état sain connu.`,
        tags: ["defense", "hash", "synthese"],
      },
    ],
  },
];
