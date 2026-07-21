import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 54 (Défense) : chasse à une persistance cron encodée en base64. Lab Docker réel. */
export const module54CronPersistenceHunt: CourseSeed[] = [
  {
    slug: "prat-defense-cron-persistence-hunt",
    title: "Persistance cron — décoder une charge dissimulée",
    checkpoint: "defense",
    codename: "Silent Payload",
    domain: "Défense — Détection de persistance",
    theme: "grid",
    icon: "Timer",
    accent: "#C4A46B",
    order: 54,
    difficulty: "medium",
    summary:
      "Deux tâches planifiées existent sur ce système. L'une est un script de sauvegarde ordinaire. L'autre dissimule quelque chose derrière un encodage base64. À toi de repérer la tâche suspecte, d'isoler la chaîne encodée et de la décoder — en comprenant que base64 n'est pas du chiffrement, juste de l'obfuscation.",
    objectives: [
      "Lister le contenu des tâches planifiées (/etc/cron.d)",
      "Distinguer la tâche légitime de la tâche suspecte",
      "Isoler la ligne encodée et l'option de décodage base64",
      "Décoder la charge pour révéler son contenu",
      "Comprendre pourquoi on encode (obfuscation ≠ chiffrement) et comment détecter",
    ],
    sandbox: {
      attackerImage: "cyberace/module54-cron-persistence-hunt:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# ⏱️ Persistance cron — Silent Payload

Le **cron** est un mécanisme de persistance de choix : une tâche planifiée s'exécute à intervalle régulier, discrètement. Encore faut-il voir ce qu'elle fait vraiment. 🔎

---

## 🧭 Le briefing

> *"Deux tâches planifiées existent sur ce système. L'une est un script de sauvegarde tout à fait ordinaire. L'autre dissimule quelque chose derrière un encodage."*

Terminal **en root**. Les tâches sont dans **\`/etc/cron.d/\`**.

---

## 1. Lister les tâches 📄

\`\`\`bash
cat /etc/cron.d/*
\`\`\`

Deux fichiers :
- \`backup-daily\` : \`0 2 * * * root /usr/local/bin/backup.sh\` — une sauvegarde nocturne, banale.
- \`system-check\` : \`*/5 * * * * root echo <chaîne> | base64 -d\` — **pourquoi une tâche de « vérification » décoderait-elle du base64 toutes les 5 minutes ?**

---

## 2. Repérer l'anomalie 🎯

Une tâche cron légitime appelle un **script nommé**. Une tâche qui **\`echo ... | base64 -d\`** exécute une charge **cachée derrière un encodage** — signal d'alerte immédiat. Le fichier suspect est **\`/etc/cron.d/system-check\`**.

---

## 3. Décoder 🔓

\`base64 -d\` (ou \`--decode\`) fait l'inverse de l'encodage. On copie **exactement** la chaîne entre \`echo\` et \`| base64\`, puis :

\`\`\`bash
echo '<chaîne base64>' | base64 -d
\`\`\`

Et la charge apparaît en clair.

---

## 4. Encodage ≠ chiffrement 🧠

Pourquoi encoder ? Pour échapper à une **recherche naïve de mots-clés** (\`grep\` sur des chaînes suspectes en clair). Mais **base64 n'est PAS un chiffrement** : il n'y a pas de clé, n'importe qui décode en une commande. C'est de l'**obfuscation**, pas de la protection.

**Détection** : surveiller l'intégrité de \`/etc/cron.d/\` et auditer régulièrement le contenu des tâches — une charge encodée dans une cron est un motif à alerter.

## 🧠 À retenir

- Tâches planifiées : \`/etc/cron.d/\` → \`cat /etc/cron.d/*\`.
- **Anomalie** : une cron qui fait \`echo ... | base64 -d\` (charge cachée) vs un script nommé légitime.
- Décoder : \`echo '<chaîne>' | base64 -d\` (\`-d\`/\`--decode\`).
- **base64 = obfuscation, pas chiffrement** : pas de clé, décodage trivial. Sert juste à contourner une recherche naïve.
- **Détection** : intégrité de \`/etc/cron.d/\` + audit du contenu des tâches.`,
    badge: {
      id: "badge-prat-cronhunt",
      name: "Chasseur de Persistance",
      icon: "Timer",
      description: "A décodé une charge dissimulée dans une simple tâche planifiée.",
    },
    challenges: [
      {
        id: "prat-cronhunt-t1",
        title: "Lister les tâches",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 📄 Voir les tâches cron

**Question :** quelle commande affiche le contenu de tous les fichiers d'un dossier (ici /etc/cron.d) ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "cat /etc/cron.d/*",
        accept: ["cat"],
        caseSensitive: false,
        explanation: `\`cat /etc/cron.d/*\` déverse le contenu de toutes les tâches planifiées système. On y voit les deux crons : la sauvegarde et la « vérification système » suspecte.`,
        tags: ["defense", "cron", "cat"],
      },
      {
        id: "prat-cronhunt-t2",
        title: "Repérer l'anomalie",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎯 Laquelle est louche ?

**Question :** laquelle des deux tâches planifiées est suspecte ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Celle qui exécute 'echo ... | base64 -d'",
          "Celle qui exécute /usr/local/bin/backup.sh",
          "Les deux sont suspectes de façon identique",
          "Aucune des deux n'est suspecte",
        ],
        answer: 0,
        explanation: `Une tâche qui **décode du base64** (\`echo ... | base64 -d\`) cache sa charge — c'est anormal. Appeler un script nommé (\`backup.sh\`) est le fonctionnement standard d'une cron légitime.`,
        tags: ["defense", "cron", "anomalie"],
      },
      {
        id: "prat-cronhunt-t3",
        title: "Isoler le contenu encodé",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 📍 Le fichier suspect

**Question :** quel fichier contient la ligne suspecte à décoder ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "/etc/cron.d/system-check",
        accept: ["system-check"],
        caseSensitive: false,
        explanation: `**\`/etc/cron.d/system-check\`** contient la ligne \`*/5 * * * * root echo <base64> | base64 -d\`. Le nom « system-check » se veut rassurant ; son contenu ne l'est pas.`,
        tags: ["defense", "cron", "fichier"],
      },
      {
        id: "prat-cronhunt-t4",
        title: "Décoder",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔓 L'option de décodage

**Question :** quelle option de la commande base64 décode une chaîne plutôt que de l'encoder ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "-d",
        accept: ["--decode"],
        caseSensitive: false,
        explanation: `**\`-d\`** (ou \`--decode\`) fait décoder base64. \`echo '<chaîne>' | base64 -d\` renvoie la charge d'origine en clair.`,
        tags: ["defense", "base64", "decode"],
      },
      {
        id: "prat-cronhunt-t5",
        title: "Révéler le contenu (flag)",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 La charge en clair

Isole la chaîne encodée du fichier \`system-check\`, puis décode-la.

**Question :** quel est le contenu décodé (flag \`CYBERACE{...}\`) ?`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "Copie EXACTEMENT la chaîne située entre 'echo' et '| base64' dans la ligne cron.", cost: 20 },
          { text: "Puis : `echo \"<chaîne>\" | base64 -d`.", cost: 35 },
        ],
        answer: "CYBERACE{persistance_cron_payload_encode_en_base64}",
        caseSensitive: true,
        explanation: `Le décodage révèle **CYBERACE{persistance_cron_payload_encode_en_base64}**. La charge était juste **encodée** (pas chiffrée) : une fois la chaîne isolée, \`base64 -d\` suffit à tout révéler.`,
        tags: ["defense", "flag", "base64"],
      },
      {
        id: "prat-cronhunt-t6",
        title: "Pourquoi encoder plutôt que chiffrer",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Obfuscation, pas protection

**Question :** pourquoi un attaquant encode-t-il souvent ses charges en base64 dans une tâche cron, plutôt que de les laisser en clair ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Cela évite qu'une recherche naïve de mots-clés en clair (grep sur des chaînes suspectes) ne détecte immédiatement la charge — ce n'est PAS un chiffrement, seulement une obfuscation",
          "base64 rend le contenu totalement illisible même après décodage",
          "C'est la seule façon technique d'exécuter une commande via cron",
          "Cela accélère l'exécution de la tâche",
        ],
        answer: 0,
        explanation: `L'encodage **contourne** un \`grep\` naïf sur des mots-clés en clair (\`wget\`, \`/tmp\`, une IP…). Mais **base64 n'a pas de clé** : n'importe qui décode. C'est de l'obfuscation, pas de la sécurité — et le simple fait d'encoder est déjà suspect.`,
        tags: ["defense", "base64", "obfuscation"],
      },
      {
        id: "prat-cronhunt-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🛡️ Détecter ce type de persistance

**Question :** quelle pratique aide à détecter ce type de persistance ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Surveiller les modifications de /etc/cron.d/ (intégrité de fichiers) et auditer régulièrement le contenu des tâches planifiées",
          "Désactiver complètement cron sur tous les serveurs",
          "Changer le format de date du système",
          "Augmenter la fréquence d'exécution de cron",
        ],
        answer: 0,
        explanation: `Surveiller l'**intégrité** de \`/etc/cron.d/\` (cf. Module 46) alerte dès qu'une tâche apparaît ou change ; auditer le contenu repère les charges encodées. Désactiver cron casserait les tâches légitimes.`,
        tags: ["defense", "cron", "contre-mesure"],
      },
      {
        id: "prat-cronhunt-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Différence avec le Module 48

**Question :** en quoi ce module diffère-t-il du Module 48 (lecture d'un historique de commandes) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Ici, la persistance est trouvée directement dans la configuration système, sans avoir besoin d'un historique de commandes de l'attaquant",
          "Ce module concerne exclusivement le réseau",
          "Ce module nécessite une élévation de privilèges, contrairement au Module 48",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Le Module 48 reconstituait l'attaque depuis un **historique de commandes**. Ici, la persistance est **directement inscrite** dans la config système (\`/etc/cron.d/\`) : on la trouve en auditant le système lui-même, sans trace de l'attaquant.`,
        tags: ["defense", "cron", "synthese"],
      },
    ],
  },
];
