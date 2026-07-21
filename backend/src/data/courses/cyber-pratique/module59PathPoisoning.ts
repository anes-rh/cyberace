import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 59 (Défense) : PATH système empoisonné via profil global. Pendant "persistance" du Module 3. */
export const module59PathPoisoning: CourseSeed[] = [
  {
    slug: "prat-defense-path-poisoning",
    title: "PATH empoisonné — une commande qui n'est plus elle-même",
    checkpoint: "defense",
    codename: "Silent Substitute",
    domain: "Défense — Détection de persistance",
    theme: "grid",
    icon: "Route",
    accent: "#C48F4F",
    order: 59,
    difficulty: "medium",
    summary:
      "Quelque chose ne va pas avec la commande 'ls' sur ce système. En observant le PATH, tu découvres un répertoire intrus en tête (/opt/.sys_cache), inséré par un profil global. Un faux 'ls' y intercepte chaque appel avant le vrai. C'est un empoisonnement PERSISTANT et système-entier, à la différence du détournement ponctuel du Module 3.",
    objectives: [
      "Observer la valeur du PATH et repérer un répertoire intrus",
      "Remonter au fichier de profil global qui l'a inséré",
      "Identifier quel exécutable est réellement lancé (which)",
      "Lire le faux binaire et comprendre son action cachée",
      "Distinguer ce mécanisme du détournement PATH ponctuel du Module 3",
    ],
    sandbox: {
      attackerImage: "cyberace/module59-path-poisoning:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🛣️ PATH empoisonné — Silent Substitute

La variable **PATH** décide **quel** binaire s'exécute quand tu tapes une commande. La détourner, c'est remplacer sournoisement les outils du quotidien par des versions piégées. 🎭

---

## 🧭 Le briefing

> *"Quelque chose ne va pas avec la commande \`ls\` sur ce système. Remonte jusqu'à la cause."*

Terminal **en root**.

---

## 1. Observer le PATH 🔎

\`\`\`bash
echo $PATH
# /opt/.sys_cache:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
\`\`\`

Un répertoire **en tête** ne devrait pas être là : **\`/opt/.sys_cache\`** (nom discret, dossier caché). Comme il est **prioritaire**, tout binaire qui s'y trouve **masque** le vrai.

---

## 2. La source de l'injection 📄

Qui a inséré ce répertoire ? Un **profil de connexion global** :

\`\`\`bash
cat /etc/profile.d/00-custom.sh
# export PATH=/opt/.sys_cache:$PATH
\`\`\`

\`/etc/profile.d/*.sh\` est chargé à **chaque session** : l'empoisonnement est **persistant et global**, pas limité à une commande.

---

## 3. Quel 'ls' s'exécute vraiment ? 🎯

\`\`\`bash
which ls        # ou : type ls
# /opt/.sys_cache/ls   ← PAS /bin/ls !
\`\`\`

Le vrai \`ls\` est \`/bin/ls\`, mais le PATH pointe d'abord vers le faux.

---

## 4. Le faux binaire 🐍

\`\`\`bash
cat /opt/.sys_cache/ls
# #!/bin/bash
# /bin/ls "$@"
# echo collecte silencieuse ... >> /tmp/.harvest.log
\`\`\`

Il appelle bien le vrai \`/bin/ls\` (pour que rien ne paraisse anormal) **mais journalise discrètement** chaque appel dans un fichier caché. C'est un **wrapper malveillant** : l'utilisateur ne voit aucune différence, l'attaquant collecte.

**Vs Module 3** : là, le PATH était détourné le temps d'**un** appel sudo. Ici, il est empoisonné pour **toute session**, via un profil global.

## 🧠 À retenir

- \`echo $PATH\` : un répertoire **inattendu en tête** est suspect (ici \`/opt/.sys_cache\`).
- Source : un profil global \`/etc/profile.d/*.sh\` (chargé à chaque login).
- \`which ls\` / \`type ls\` révèle le binaire **réellement** lancé.
- Faux binaire = wrapper qui appelle le vrai **+** une action cachée (log, exfiltration).
- Vs Module 3 : ponctuel (un sudo) → **persistant et système-entier** (profil global).`,
    badge: {
      id: "badge-prat-pathpoison",
      name: "Traceur de Chemins",
      icon: "Route",
      description: "A repéré une commande de tous les jours qui n'était plus vraiment elle-même.",
    },
    challenges: [
      {
        id: "prat-pathpoison-t1",
        title: "Observer le PATH",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔎 Afficher le PATH

**Question :** quelle commande affiche la valeur actuelle de la variable PATH ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "echo $PATH",
        accept: ["echo \"$PATH\""],
        caseSensitive: false,
        explanation: `\`echo $PATH\` affiche la liste des répertoires où bash cherche les commandes, dans l'ordre. Un dossier inattendu **en tête** est prioritaire — donc dangereux.`,
        tags: ["defense", "path", "echo"],
      },
      {
        id: "prat-pathpoison-t2",
        title: "Repérer l'intrus",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 Le répertoire de trop

**Question :** quel répertoire, en tête de PATH, ne devrait normalement pas s'y trouver ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "/opt/.sys_cache",
        caseSensitive: false,
        explanation: `**\`/opt/.sys_cache\`** : un dossier caché (\`.\`), au nom faussement système (« sys_cache »), placé **en tête** du PATH pour intercepter les commandes avant les vrais binaires de \`/bin\`, \`/usr/bin\`…`,
        tags: ["defense", "path", "intrus"],
      },
      {
        id: "prat-pathpoison-t3",
        title: "La source de l'injection",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 📄 Qui l'a inséré ?

**Question :** quel fichier de profil global a inséré ce répertoire dans le PATH ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "/etc/profile.d/00-custom.sh",
        caseSensitive: false,
        explanation: `**\`/etc/profile.d/00-custom.sh\`** contient \`export PATH=/opt/.sys_cache:$PATH\`. Les scripts de \`/etc/profile.d/\` sont chargés à chaque session de login : la persistance est globale et automatique.`,
        tags: ["defense", "path", "profile"],
      },
      {
        id: "prat-pathpoison-t4",
        title: "Identifier l'exécutable réel",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 Le vrai 'ls' ?

**Question :** quelle commande détermine quel exécutable sera réellement lancé quand on tape 'ls' ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "which ls",
        accept: ["type ls"],
        caseSensitive: true,
        explanation: `**\`which ls\`** (ou \`type ls\`) parcourt le PATH dans l'ordre et affiche le **premier** \`ls\` trouvé — celui qui sera exécuté. Avec le PATH empoisonné, ce n'est plus \`/bin/ls\`.`,
        tags: ["defense", "path", "which"],
      },
      {
        id: "prat-pathpoison-t5",
        title: "Ce que révèle la vérification",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔍 Le chemin réel

**Question :** quel chemin 'which ls' révèle-t-il, au lieu du /bin/ls attendu ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "/opt/.sys_cache/ls",
        caseSensitive: false,
        explanation: `**\`/opt/.sys_cache/ls\`** : c'est ce faux \`ls\` (prioritaire dans le PATH) qui s'exécute à ta place, pas le vrai \`/bin/ls\`. La substitution est confirmée.`,
        tags: ["defense", "path", "substitution"],
      },
      {
        id: "prat-pathpoison-t6",
        title: "Lire le faux binaire",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🐍 Que fait ce faux 'ls' ?

\`\`\`bash
cat /opt/.sys_cache/ls
\`\`\`

**Question :** que fait ce faux 'ls', au-delà d'appeler le vrai /bin/ls ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Il journalise discrètement chaque appel dans un fichier caché",
          "Il supprime tous les fichiers du dossier courant",
          "Il ne fait rigoureusement rien d'autre",
          "Il redémarre le système",
        ],
        answer: 0,
        explanation: `Le wrapper appelle \`/bin/ls "$@"\` (pour que la sortie paraisse normale) **puis** écrit dans \`/tmp/.harvest.log\`. L'utilisateur ne voit rien d'anormal ; l'attaquant collecte silencieusement — un cheval de Troie sur une commande banale.`,
        tags: ["defense", "path", "wrapper"],
      },
      {
        id: "prat-pathpoison-t7",
        title: "Confirmer (flag)",
        order: 7,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le rapport

\`\`\`bash
cat /root/path_audit_report.txt
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` figure dans le rapport ?`,
        points: 300,
        timeLimitSec: 500,
        hints: [],
        answer: "CYBERACE{path_systeme_empoisonne_profil_global}",
        caseSensitive: true,
        explanation: `\`cat /root/path_audit_report.txt\` → **CYBERACE{path_systeme_empoisonne_profil_global}**. Le flag résume : un PATH système détourné via un profil de connexion global.`,
        tags: ["defense", "flag", "path"],
      },
      {
        id: "prat-pathpoison-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Différence avec le Module 3

**Question :** en quoi ce module diffère-t-il du Module 3 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Le Module 3 exploitait le PATH lors d'un seul appel sudo ; celui-ci empoisonne le PATH pour TOUTE session de connexion, via un fichier de profil global",
          "Ce module ne concerne pas la variable PATH",
          "Ce module nécessite une élévation de privilèges pour être détecté",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Module 3 : détournement du PATH le temps d'**un** appel sudo (ponctuel, offensif). Module 59 : empoisonnement **persistant et global** via \`/etc/profile.d/\`, affectant chaque session. Même primitive (PATH), portée et pérennité différentes.`,
        tags: ["defense", "path", "synthese"],
      },
    ],
  },
];
