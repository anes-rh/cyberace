import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 29 : fuite de données via symlink sur fichier temporaire prévisible. Lab Docker réel (mono-conteneur). */
export const module29SymlinkLeak: CourseSeed[] = [
  {
    slug: "prat-symlink-leak",
    title: "Fuite via symlink prévisible",
    checkpoint: "prat-privesc-lateral",
    codename: "Silent Redirect",
    domain: "Élévation de privilèges",
    theme: "grid",
    icon: "Siren",
    accent: "#C4706B",
    order: 29,
    difficulty: "hard",
    summary:
      "Cette élévation ne donne PAS de shell root : elle fait FUIR des données. Un script root écrit vers un chemin prévisible dans /tmp sans création atomique. En y plaçant un lien symbolique AVANT son exécution, tu détournes l'écriture root vers un fichier qui t'appartient.",
    objectives: [
      "Repérer une tâche cron root et son chemin de sortie fixe",
      "Comprendre le risque d'un chemin /tmp prévisible",
      "Créer un lien symbolique de détournement",
      "Récupérer des données écrites par un processus root",
      "Prévenir la faille par création atomique/exclusive",
    ],
    sandbox: {
      attackerImage: "cyberace/module29-symlink-leak-lab:latest",
      ttlSec: 1500,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🚨 Fuite via symlink prévisible — Silent Redirect

Une **huitième voie**, différente de toutes les autres : tu ne gagnes **pas** un shell root — tu fais **fuir** une donnée qu'un processus root écrit **sans le vouloir** à un endroit accessible. ⏳🏎️

---

## 🧭 Le briefing

> Un **script root** s'exécute chaque minute (via cron) et écrit un rapport vers un chemin **prévisible** dans \`/tmp\`, **sans** création exclusive. N'importe qui peut y placer un **lien symbolique** avant l'exécution.

⏳ **Latence** : comme aux Modules 5 et 22, il faut **attendre** la prochaine minute.

---

## 1. Repérer la cible 🔍

\`\`\`bash
cat /etc/cron.d/*          # la tâche root chaque minute
cat /opt/status_check.sh   # ce que fait le script
\`\`\`

Le script fait quelque chose comme :

\`\`\`bash
echo "Rapport interne : token=..." > /tmp/status_report.tmp
\`\`\`

Le chemin \`/tmp/status_report.tmp\` est **fixe** et **prévisible** — et l'écriture est une simple **redirection** \`>\`.

---

## 2. Pourquoi c'est une faille 🧩

Une redirection \`>\` vers un chemin qui **n'existe pas encore** : si **tu** crées un **lien symbolique** à cet emplacement **avant** le script, la redirection **suit le lien** et écrit **là où le lien pointe** — potentiellement un fichier **à toi**. Le script root écrit donc son contenu… dans **ton** fichier.

> 🧠 C'est une **fuite de données**, pas un shell root : tu ne prends pas le contrôle, tu **détournes une sortie**.

---

## 3. Poser le piège 🪤

\`\`\`bash
ln -s ~/loot.txt /tmp/status_report.tmp
#  │    │            └── l'emplacement prévisible visé par le script root
#  │    └── ta cible : un fichier dans ton dossier
#  └── créer un lien symbolique
\`\`\`

Le lien doit être créé **AVANT** le prochain passage du cron.

---

## 4. Attendre et récupérer ⏳

À la prochaine minute, le script root fait \`echo "..." > /tmp/status_report.tmp\` → l'écriture **suit ton lien** → \`~/loot.txt\` reçoit le contenu :

\`\`\`bash
cat ~/loot.txt
\`\`\`

Le \`token=...\` (le flag) que root croyait écrire dans \`/tmp\` est maintenant **chez toi**.

---

## 5. La contre-mesure 🛡️

Ne **jamais** écrire vers un chemin **fixe et prévisible** avec une redirection simple. Utiliser une **création atomique et exclusive** :
- \`mktemp\` (nom imprévisible, créé de façon sûre) ;
- ou une redirection avec \`set -o noclobber\` (\`>|\` refusé si la cible existe) ;
- vérifier que la cible n'est **pas** un lien symbolique avant d'écrire.

---

## 🧠 À retenir

- Un script root écrivant vers un **chemin /tmp prévisible** avec \`>\` est **détournable**.
- Un **lien symbolique** posé avant l'exécution **redirige** l'écriture root ailleurs.
- Résultat : **fuite de données**, pas shell root — nuance importante.
- **\`ln -s <cible> <chemin_prévisible>\`** pose le piège ; il faut le créer **avant** le cron.
- Parade : **création atomique/exclusive** (\`mktemp\`, \`noclobber\`), jamais de chemin fixe prévisible.`,
    badge: {
      id: "badge-prat-symlink",
      name: "Intercepteur de Redirections",
      icon: "Siren",
      description: "A détourné la sortie d'un script root vers son propre fichier.",
    },
    challenges: [
      {
        id: "prat-symlink-t1",
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
        tags: ["symlink", "recon", "id"],
      },
      {
        id: "prat-symlink-t2",
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
        answer: "/opt/status_check.sh",
        accept: ["status_check.sh"],
        caseSensitive: true,
        explanation: `\`/etc/cron.d/status\` lance **\`/opt/status_check.sh\`** en root chaque minute. C'est lui qui écrit dans \`/tmp\`.`,
        tags: ["symlink", "cron"],
      },
      {
        id: "prat-symlink-t3",
        title: "Repérer le chemin prévisible",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 Le chemin de sortie

\`\`\`bash
cat /opt/status_check.sh
\`\`\`

**Question :** vers quel **chemin** ce script redirige-t-il sa sortie ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "/tmp/status_report.tmp",
        caseSensitive: false,
        explanation: `Le script fait \`echo "..." > \`**\`/tmp/status_report.tmp\`** — un chemin **fixe** et **prévisible**, écrit par une simple redirection.`,
        tags: ["symlink", "tmp"],
      },
      {
        id: "prat-symlink-t4",
        title: "Comprendre la faille",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧩 Pourquoi c'est risqué

**Question :** pourquoi ce chemin fixe et prévisible dans \`/tmp\` pose-t-il un risque ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: [
          "Si ce chemin n'existe pas encore, n'importe quel utilisateur peut y créer un lien symbolique avant l'exécution du script root, redirigeant sa sortie ailleurs",
          "Les fichiers dans /tmp sont automatiquement lisibles par tous, quel que soit leur contenu",
          "Le script s'exécute deux fois par erreur",
          "cron ignore toujours les chemins commençant par /tmp",
        ],
        answer: 0,
        explanation: `Le chemin étant **prévisible** et l'écriture non atomique, tu peux y placer un **symlink** avant le script : sa redirection **suit le lien** et écrit là où **tu** décides.`,
        tags: ["symlink", "analyse"],
      },
      {
        id: "prat-symlink-t5",
        title: "Poser le piège",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🪤 Créer le lien symbolique

Tu vas faire pointer le chemin prévisible vers un fichier à toi.

**Question :** quelle **commande** crée un lien symbolique sous Unix ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        answer: "ln -s",
        caseSensitive: true,
        explanation: `**\`ln -s <cible> <lien>\`** crée un lien symbolique. Ici : \`ln -s ~/loot.txt /tmp/status_report.tmp\` détourne l'écriture root vers \`~/loot.txt\`.`,
        tags: ["symlink", "ln"],
      },
      {
        id: "prat-symlink-t6",
        title: "Attendre et récupérer le flag",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Attendre le cron, puis lire

\`\`\`bash
ln -s ~/loot.txt /tmp/status_report.tmp
# attendre jusqu'à 60 s (prochaine minute), puis :
cat ~/loot.txt
\`\`\`

**Question :** colle le **flag** récupéré.`,
        points: 300,
        timeLimitSec: 800,
        hints: [
          { text: "Le lien doit être créé AVANT le prochain déclenchement du cron (prochaine minute pleine).", cost: 20 },
          { text: "Commande exacte du piège : ln -s ~/loot.txt /tmp/status_report.tmp", cost: 35 },
        ],
        answer: "CYBERACE{symlink_predictible_fuite_de_donnees}",
        caseSensitive: true,
        explanation: `Le script root écrit dans \`/tmp/status_report.tmp\`, qui est ton lien → \`~/loot.txt\` reçoit \`token=CYBERACE{symlink_predictible_fuite_de_donnees}\`. Tu as **détourné** la sortie d'un processus root.`,
        tags: ["symlink", "flag"],
      },
      {
        id: "prat-symlink-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure

**Question :** quelle pratique aurait empêché cette fuite ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Utiliser une création de fichier atomique et exclusive (ex: mktemp, ou une redirection avec l'option noclobber) plutôt qu'un chemin fixe et prévisible",
          "Changer le nom du script tous les jours",
          "Exécuter le script en tant que stagiaire plutôt que root",
          "Supprimer complètement le dossier /tmp",
        ],
        answer: 0,
        explanation: `Un fichier temporaire doit être créé de façon **atomique et exclusive** : \`mktemp\` (nom imprévisible) ou \`noclobber\` (refus si la cible existe déjà). Un chemin fixe et prévisible est la racine du problème.`,
        tags: ["symlink", "mktemp", "contre-mesure"],
      },
      {
        id: "prat-symlink-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** qu'est-ce qui distingue fondamentalement ce module des sept précédentes élévations de privilèges de ce parcours ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Il ne donne pas directement un accès root — il fait fuir une information via une écriture root mal sécurisée",
          "Il ne nécessite aucune attente, contrairement aux autres",
          "Il exploite une faille réseau, pas système",
          "Il nécessite un accès root dès la connexion",
        ],
        answer: 0,
        explanation: `Les élévations précédentes visaient un **shell root**. Ici, l'objectif est une **fuite de données** : tu détournes une **écriture** root vers ton fichier, sans jamais devenir root toi-même.`,
        tags: ["symlink", "synthese"],
      },
    ],
  },
];
