import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 27 : audit défensif des binaires SUID (contraste avec M3). Lab Docker réel (mono-conteneur). */
export const module27SuidAudit: CourseSeed[] = [
  {
    slug: "prat-suid-audit",
    title: "Audit des binaires SUID",
    checkpoint: "prat-privesc-lateral",
    codename: "Silent Audit",
    domain: "Élévation de privilèges",
    theme: "grid",
    icon: "Route",
    accent: "#9E8F6B",
    order: 27,
    difficulty: "medium",
    summary:
      "Le Module 3 EXPLOITAIT un binaire SUID mal configuré. Ici, tu le REPÈRES. En comparant l'état réel du système à une liste de référence, tu identifies l'intrus — une porte dérobée discrète. Exercice d'audit défensif : tu es auditeur système, pas attaquant.",
    objectives: [
      "Énumérer tous les binaires SUID du système",
      "Consulter une liste de référence des SUID légitimes",
      "Comparer les deux listes pour trouver l'anomalie",
      "Comprendre le danger d'un env SUID (GTFOBins)",
      "Nommer et industrialiser l'audit d'intégrité",
    ],
    sandbox: {
      attackerImage: "cyberace/module27-suid-audit-lab:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🛣️ Audit des binaires SUID — Silent Audit

Renversement de perspective : au Module 3, tu **exploitais** un SUID. Ici, tu es **auditeur** — ton rôle est de **détecter** l'anomalie **avant** qu'un attaquant ne l'utilise. 🏎️

---

## 🧭 Le briefing

> Tu es cette fois **auditeur**, pas attaquant. Une **liste de référence** des binaires SUID légitimes t'a été fournie — vérifie que **rien** ne s'y est ajouté.

Tu es \`stagiaire\`. Aucun shell root à obtenir : le « flag » récompense l'**identification** correcte de l'intrus.

---

## 1. Le bit SUID, rappel 🧩

Un binaire **SUID** (\`chmod u+s\`) s'exécute avec les **droits de son propriétaire**, pas de celui qui le lance. Certains binaires système en ont **légitimement** besoin (\`passwd\`, \`mount\`, \`su\`…). Le problème : un binaire SUID **inattendu** peut offrir un chemin vers root.

---

## 2. Énumérer les SUID 🔎

\`\`\`bash
find / -perm -4000 -type f 2>/dev/null
#      │  │          │        └── masque les erreurs de permission
#      │  │          └── uniquement des fichiers
#      │  └── bit SUID positionné
#      └── depuis la racine
\`\`\`

Tu obtiens la **liste réelle** des binaires SUID du système.

---

## 3. Comparer à la référence 📋

\`\`\`bash
cat /opt/audit/baseline-suid.txt
\`\`\`

Cette liste énumère les SUID **attendus** (légitimes). **Compare** les deux : la plupart des entrées correspondent… **sauf une**. Ce binaire, présent en SUID mais **absent** de la référence, est l'**intrus**.

> 💡 Astuce : \`comm\` ou un simple \`diff\` entre la sortie de \`find\` triée et la baseline mettent l'écart en évidence.

---

## 4. L'intrus : env SUID 🚨

L'anomalie est **\`/usr/bin/env\`**, rendu SUID. Pourquoi c'est grave ? \`env\` permet de **lancer n'importe quel programme** — donc, en SUID root :

\`\`\`bash
env /bin/bash -p     # shell root en une commande (technique GTFOBins classique)
\`\`\`

Un utilitaire d'apparence anodine (souvent vu dans les shebangs \`#!/usr/bin/env python3\`) devient une **porte dérobée** directe.

---

## 5. Nommer et industrialiser 🛡️

Comparer l'état réel à une **référence connue** pour repérer toute modification suspecte s'appelle l'**audit d'intégrité** (*file integrity monitoring*). Fait **une fois** à la main, c'est utile ; fait **en continu** par un outil dédié (**AIDE**, **Tripwire**), c'est une vraie défense.

---

## 🧠 À retenir

- **\`find / -perm -4000 -type f\`** liste les binaires **SUID**.
- Comparer à une **baseline** révèle les SUID **inattendus**.
- **\`env\` SUID** = shell root en une commande (\`env /bin/bash -p\`, GTFOBins).
- **Audit d'intégrité** = comparer l'état réel à une référence connue ; à **automatiser** (AIDE, Tripwire).
- Ici, on **détecte** — on n'exploite pas.`,
    badge: {
      id: "badge-prat-suidaudit",
      name: "Auditeur Méticuleux",
      icon: "Route",
      description: "A repéré l'intrus dans une liste de binaires qu'il connaissait par cœur.",
    },
    challenges: [
      {
        id: "prat-suidaudit-t1",
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
        explanation: `**\`id\`** confirme que tu es \`stagiaire\` — ici dans un rôle d'**auditeur**, pas d'attaquant.`,
        tags: ["suid-audit", "recon", "id"],
      },
      {
        id: "prat-suidaudit-t2",
        title: "Énumérer les binaires SUID",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔎 Lister les SUID

**Question :** quelle **commande** liste tous les binaires SUID du système ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: "find / -perm -4000 -type f 2>/dev/null",
        accept: ["find / -perm -4000 -type f"],
        caseSensitive: true,
        explanation: `**\`find / -perm -4000 -type f 2>/dev/null\`** parcourt tout le système à la recherche des fichiers portant le bit **SUID** (\`-4000\`), en masquant les erreurs de permission.`,
        tags: ["suid-audit", "find"],
      },
      {
        id: "prat-suidaudit-t3",
        title: "Consulter la référence",
        order: 3,
        difficulty: "easy",
        type: "text",
        prompt: `## 📋 La liste de référence

\`\`\`bash
cat /opt/audit/baseline-suid.txt
\`\`\`

**Question :** quel **fichier** fournit la liste des binaires SUID légitimement attendus sur ce système ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "/opt/audit/baseline-suid.txt",
        accept: ["baseline-suid.txt"],
        caseSensitive: false,
        explanation: `**\`/opt/audit/baseline-suid.txt\`** liste les SUID **attendus**. C'est ta référence de comparaison.`,
        tags: ["suid-audit", "baseline"],
      },
      {
        id: "prat-suidaudit-t4",
        title: "Comparer les deux listes",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Trouver l'intrus

Compare la sortie du \`find\` (tâche 2) à la baseline (tâche 3). Un binaire est SUID **sans** figurer dans la référence.

**Question :** quel **binaire**, absent de la liste de référence, apparaît anormalement SUID ?`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "La plupart des résultats du find correspondent à la référence — cherche celui qui n'y figure PAS.", cost: 25 },
          { text: "C'est un utilitaire habituellement anodin, souvent vu dans les shebangs (#!/usr/bin/env ...).", cost: 40 },
        ],
        answer: "/usr/bin/env",
        accept: ["env"],
        caseSensitive: false,
        explanation: `**\`/usr/bin/env\`** est SUID sans figurer dans la baseline : c'est l'**intrus**, une porte dérobée discrète glissée parmi les binaires légitimes.`,
        tags: ["suid-audit", "env", "detection"],
      },
      {
        id: "prat-suidaudit-t5",
        title: "Pourquoi c'est dangereux",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚨 Pourquoi env SUID est dangereux

**Question :** pourquoi \`env\` rendu SUID est-il particulièrement dangereux ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Il permet de lancer n'importe quel programme avec les privilèges root en une seule commande (ex: env /bin/bash -p), une technique GTFOBins classique",
          "Il modifie automatiquement les variables d'environnement système",
          "Il ne peut être utilisé que par root de toute façon",
          "Il désactive les autres mécanismes de sécurité du système",
        ],
        answer: 0,
        explanation: `\`env\` **exécute un programme** ; en SUID root, \`env /bin/bash -p\` ouvre directement un shell root. C'est une entrée classique de **GTFOBins** — d'où le danger d'un env SUID inattendu.`,
        tags: ["suid-audit", "gtfobins"],
      },
      {
        id: "prat-suidaudit-t6",
        title: "Nommer la pratique",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Nommer la pratique

**Question :** comment appelle-t-on la pratique consistant à comparer périodiquement l'état réel d'un système à un état de référence connu, pour repérer toute modification suspecte ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "audit d'integrite",
        accept: ["controle d'integrite", "integrity monitoring", "file integrity monitoring"],
        caseSensitive: false,
        explanation: `C'est l'**audit d'intégrité** (*file integrity monitoring*) : comparer l'état courant à une **baseline** de confiance pour détecter toute dérive — exactement ce que tu viens de faire à la main.`,
        tags: ["suid-audit", "integrite", "vocabulaire"],
      },
      {
        id: "prat-suidaudit-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Industrialiser

**Question :** comment industrialiser cette pratique plutôt que de la faire manuellement une seule fois ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Automatiser la comparaison à intervalle régulier avec un outil dédié (ex: AIDE, Tripwire)",
          "Refaire la vérification manuellement une fois par an",
          "Supprimer tous les binaires SUID du système",
          "Changer le mot de passe root chaque semaine",
        ],
        answer: 0,
        explanation: `Des outils comme **AIDE** ou **Tripwire** automatisent la comparaison à une baseline et **alertent** à chaque dérive — bien plus fiable qu'un contrôle manuel ponctuel.`,
        tags: ["suid-audit", "aide", "contre-mesure"],
      },
      {
        id: "prat-suidaudit-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** en quoi ce module diffère-t-il fondamentalement du Module 3 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Ici, l'objectif est de DÉTECTER une anomalie déjà en place, pas de l'exploiter soi-même",
          "Ce module n'utilise pas la commande find, contrairement au Module 3",
          "Ce module nécessite les droits root dès la connexion",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Même outil (\`find -perm -4000\`), posture inverse : le Module 3 **exploitait** le SUID ; ici tu l'**audites** pour le **détecter** avant l'attaquant. Attaque vs défense.`,
        tags: ["suid-audit", "synthese"],
      },
    ],
  },
];
