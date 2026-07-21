import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 56 (Défense) : persistance système via /etc/ld.so.preload. Pendant "persistance" du Module 21. */
export const module56LdpreloadPersistence: CourseSeed[] = [
  {
    slug: "prat-defense-ldpreload-persistence",
    title: "ld.so.preload — le fichier qui ne devrait pas exister",
    checkpoint: "defense",
    codename: "Silent Loader",
    domain: "Défense — Détection de persistance",
    theme: "grid",
    icon: "MemoryStick",
    accent: "#6BC4A6",
    order: 56,
    difficulty: "medium",
    summary:
      "Au Module 21, LD_PRELOAD détournait UNE commande via sudo. Ici, le même mécanisme de préchargement est rendu PERSISTANT et SYSTÈME-ENTIER via /etc/ld.so.preload — un fichier absent ou vide sur une machine saine. Sa seule présence avec du contenu est déjà un signal de rootkit. Tu apprends à le repérer.",
    objectives: [
      "Savoir que /etc/ld.so.preload est normalement absent/vide",
      "Lire son contenu et le fichier qu'il référence",
      "Comprendre l'effet système-entier du préchargement",
      "Distinguer ce mécanisme du LD_PRELOAD ponctuel du Module 21",
      "Nommer la contre-mesure (surveillance d'intégrité)",
    ],
    sandbox: {
      attackerImage: "cyberace/module56-ldpreload-persistence:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🧬 ld.so.preload — Silent Loader

Certains fichiers sont si rarement légitimes que leur **simple existence** avec du contenu suffit à alerter. \`/etc/ld.so.preload\` en fait partie. 🚨

---

## 🧭 Le briefing

> *"Vérifie si ce système contient un fichier qui, sur une machine saine, ne devrait quasiment jamais exister avec du contenu."*

Terminal **en root**.

---

## 1. L'anomalie de base 🔎

Sur une installation Debian saine, **\`/etc/ld.so.preload\` est absent ou vide**. Ce n'est pas un fichier de config courant : très peu de logiciels légitimes l'utilisent. Le trouver **rempli** est donc déjà, en soi, suspect.

\`\`\`bash
cat /etc/ld.so.preload
# → /usr/lib/x86_64-linux-gnu/security/libcap_helper.so
\`\`\`

---

## 2. Ce que fait ce mécanisme ⚙️

Quand \`/etc/ld.so.preload\` liste une bibliothèque, le **chargeur dynamique** (\`ld.so\`) la **précharge dans QUASIMENT TOUS les processus** dynamiquement liés du système — pas un seul programme ciblé, mais l'ensemble. Une bibliothèque malveillante peut ainsi intercepter des appels (ouverture de fichiers, authentification…) partout : c'est un **rootkit userland** persistant.

---

## 3. Vérifier le fichier référencé 📁

\`\`\`bash
ls -la /usr/lib/x86_64-linux-gnu/security/libcap_helper.so
\`\`\`

Ici c'est un stub (place-holder pour le lab), mais dans un cas réel ce serait la bibliothèque du rootkit. Son emplacement (\`.../security/libcap_helper.so\`) imite un nom système crédible.

---

## 4. Différence avec le Module 21 + contre-mesure 🛡️

- **Module 21** : LD_PRELOAD via \`sudo env_keep\` → détournait **une seule** invocation.
- **Ici** : \`/etc/ld.so.preload\` → effet **système-entier et durable**, à chaque nouveau processus.

**Contre-mesure** : surveiller l'existence et le contenu de ce fichier (intégrité, cf. Module 46) ; le **vider** si aucune bibliothèque légitime n'y a explicitement sa place.

## 🧠 À retenir

- \`/etc/ld.so.preload\` est **normalement absent/vide** : rempli = suspect.
- Il force le **préchargement système-entier** d'une bibliothèque dans presque tous les processus.
- Vérifier la lib référencée : \`ls -la <chemin>\`.
- Vs Module 21 : ponctuel (une commande sudo) → **persistant et global** (tout le système).
- **Contre-mesure** : intégrité de fichiers (surveiller/vider ce fichier). Comme Module 46 : un **état anormal trahit la compromission**.`,
    badge: {
      id: "badge-prat-ldpreloadpersist",
      name: "Traqueur de Rootkits",
      icon: "MemoryStick",
      description: "A trouvé un fichier qui ne devrait presque jamais exister sur un système sain.",
    },
    challenges: [
      {
        id: "prat-ldpreloadpersist-t1",
        title: "L'anomalie de base",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔎 Un fichier rare

**Question :** sur une installation Linux standard, le fichier /etc/ld.so.preload existe-t-il rempli par défaut ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Non, il est absent ou vide par défaut — sa seule présence avec du contenu est déjà suspecte",
          "Oui, toujours rempli",
          "Cela dépend du fuseau horaire configuré",
          "Il n'existe que sous Windows",
        ],
        answer: 0,
        explanation: `\`/etc/ld.so.preload\` est **absent ou vide** sur un système sain — très peu de logiciels légitimes s'en servent. Le voir **rempli** est un indicateur de compromission à part entière, avant même d'analyser son contenu.`,
        tags: ["defense", "ldpreload", "persistance"],
      },
      {
        id: "prat-ldpreloadpersist-t2",
        title: "Lire son contenu",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📄 Voir le fichier

**Question :** quelle commande affiche le contenu d'un fichier texte ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "cat",
        accept: ["cat /etc/ld.so.preload"],
        caseSensitive: false,
        explanation: `\`cat /etc/ld.so.preload\` montre le chemin de la bibliothèque préchargée — ici \`/usr/lib/x86_64-linux-gnu/security/libcap_helper.so\`.`,
        tags: ["defense", "ldpreload", "cat"],
      },
      {
        id: "prat-ldpreloadpersist-t3",
        title: "Comprendre le mécanisme",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚙️ L'effet du préchargement

**Question :** à quoi sert ce mécanisme lorsqu'il est rempli ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: [
          "Il force le chargeur dynamique à précharger la bibliothèque listée dans QUASIMENT TOUS les processus dynamiquement liés du système, pas seulement un programme ciblé",
          "Il chiffre automatiquement toutes les bibliothèques du système",
          "Il n'affecte qu'un seul processus choisi à l'avance",
          "Il désactive le réseau",
        ],
        answer: 0,
        explanation: `Le chargeur dynamique (\`ld.so\`) précharge la lib listée dans **presque tous** les processus dynamiquement liés. Une bibliothèque malveillante y intercepte alors des appels partout — un rootkit userland persistant et global.`,
        tags: ["defense", "ldpreload", "mecanisme"],
      },
      {
        id: "prat-ldpreloadpersist-t4",
        title: "Vérifier le fichier référencé",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 📁 La bibliothèque en question

**Question :** quelle commande vérifie l'existence et les détails du fichier référencé dans ld.so.preload ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "ls -la /usr/lib/x86_64-linux-gnu/security/libcap_helper.so",
        accept: ["ls -la"],
        caseSensitive: false,
        explanation: `\`ls -la /usr/lib/x86_64-linux-gnu/security/libcap_helper.so\` confirme la présence de la bibliothèque préchargée. Son nom imite un composant système (\`security/libcap_helper\`) pour paraître crédible.`,
        tags: ["defense", "ldpreload", "ls"],
      },
      {
        id: "prat-ldpreloadpersist-t5",
        title: "Différence avec le Module 21",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔀 Ponctuel vs système-entier

**Question :** en quoi ce mécanisme diffère-t-il du détournement LD_PRELOAD vu au Module 21 ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: [
          "Le Module 21 ciblait une seule invocation via sudo ; celui-ci affecte systématiquement et durablement tous les processus dynamiquement liés du système",
          "Ils sont rigoureusement identiques en tout point",
          "Celui-ci ne concerne que les processus lancés par root",
          "Le Module 21 était objectivement plus dangereux",
        ],
        answer: 0,
        explanation: `Module 21 : \`LD_PRELOAD\` transmis via \`sudo env_keep\` → **une** commande détournée. Module 56 : \`/etc/ld.so.preload\` → **tout le système, en permanence**. Même primitive (préchargement), portée radicalement différente.`,
        tags: ["defense", "ldpreload", "comparaison"],
      },
      {
        id: "prat-ldpreloadpersist-t6",
        title: "Confirmer (flag)",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le rapport

\`\`\`bash
cat /root/rootkit_report.txt
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` figure dans le rapport ?`,
        points: 300,
        timeLimitSec: 500,
        hints: [],
        answer: "CYBERACE{ldsopreload_persistance_systeme_wide}",
        caseSensitive: true,
        explanation: `\`cat /root/rootkit_report.txt\` → **CYBERACE{ldsopreload_persistance_systeme_wide}**. Le flag résume la nature de la menace : une persistance à l'échelle du système via ld.so.preload.`,
        tags: ["defense", "flag", "ldpreload"],
      },
      {
        id: "prat-ldpreloadpersist-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Détecter la persistance

**Question :** quelle pratique détecte ce type de persistance ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Surveiller l'existence et le contenu de ce fichier (intégrité de fichiers), le vider si aucune bibliothèque légitime n'y a explicitement sa place",
          "Désactiver complètement le chargeur dynamique",
          "Chiffrer le disque",
          "Redémarrer le système chaque heure",
        ],
        answer: 0,
        explanation: `Surveiller \`/etc/ld.so.preload\` (existence + contenu) via un contrôle d'intégrité alerte dès son apparition. On le vide si rien de légitime n'y a sa place. Désactiver \`ld.so\` rendrait le système inutilisable.`,
        tags: ["defense", "ldpreload", "contre-mesure"],
      },
      {
        id: "prat-ldpreloadpersist-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Lien avec le Module 46

**Question :** quel est le point commun avec le Module 46 (intégrité par hachage) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Les deux reposent sur le fait qu'un état système anormal (fichier modifié, fichier qui ne devrait pas exister) trahit une compromission",
          "Les deux nécessitent une élévation de privilèges",
          "Les deux concernent exclusivement le réseau",
          "Il n'y a aucun lien",
        ],
        answer: 0,
        explanation: `Même logique : comparer l'état réel à un état sain **attendu**. Module 46 : un fichier au contenu modifié (hash). Module 56 : un fichier qui ne devrait pas exister avec du contenu. Dans les deux cas, l'**écart** trahit la compromission.`,
        tags: ["defense", "ldpreload", "synthese"],
      },
    ],
  },
];
