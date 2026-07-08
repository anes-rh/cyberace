import type { CourseSeed } from "../../../types";

/** Système — Module 1 : introduction condensée aux systèmes d'exploitation. */
export const intro: CourseSeed[] = [
  {
    slug: "se-intro",
    title: "Introduction aux systèmes d'exploitation",
    checkpoint: "systeme-exploitation",
    codename: "Boot Sequence",
    domain: "Système — Fondations",
    theme: "track",
    icon: "Cpu",
    accent: "#E8A87C",
    order: 1,
    difficulty: "easy",
    summary:
      "Le strict nécessaire de théorie avant de mettre les mains dans le cambouis : à quoi sert un SE, la frontière noyau/utilisateur, ce qu'est un appel système, et pourquoi on va tout pratiquer sous Linux.",
    objectives: [
      "Expliquer le rôle d'un système d'exploitation (intermédiaire matériel ↔ applications)",
      "Distinguer les grandes fonctions du SE : processus, mémoire, fichiers, E/S",
      "Comprendre la séparation mode noyau / mode utilisateur",
      "Définir un appel système (system call) et son rôle",
      "Situer Linux, son noyau et l'espace utilisateur",
    ],
    lesson: `# 💻 Introduction aux systèmes d'exploitation — Boot Sequence

Ce checkpoint est **100 % pratique**. Cette page, c'est juste le carburant théorique minimal avant de démarrer la VM et le terminal. On va vite. 🏎️

---

## 1. C'est quoi, un système d'exploitation ? 🎛️

Un **système d'exploitation** (SE / OS) est le **programme chef d'orchestre** entre le **matériel** (CPU, RAM, disque, clavier…) et les **applications** (navigateur, éditeur, jeux). Sans lui, chaque programme devrait parler directement au matériel — impossible à gérer.

\`\`\`
   Applications  (Firefox, gcc, ton script bash…)
 ───────────────────────────────────────────────
   Système d'exploitation  (noyau + utilitaires)
 ───────────────────────────────────────────────
   Matériel  (CPU · RAM · Disque · Réseau · E/S)
\`\`\`

Le SE rend deux grands services :
- **Machine étendue** (abstraction) : il cache la complexité du matériel derrière des objets simples — un « fichier », un « processus », une « socket ».
- **Gestionnaire de ressources** : il **partage** équitablement le CPU, la mémoire et les périphériques entre tous les programmes qui tournent en même temps.

---

## 2. Les 4 grandes fonctions 🧩

| Fonction | Ce que le SE gère | Modules du checkpoint |
|---|---|---|
| **Processus** | lancer, arrêter, ordonnancer les programmes | Processus · Ordonnancement · Synchro · IPC |
| **Mémoire** | attribuer/libérer la RAM, mémoire virtuelle | Gestion de la mémoire |
| **Fichiers** | organiser les données sur le disque | Systèmes de fichiers |
| **Entrées/Sorties** | dialoguer avec clavier, écran, disque, réseau | (transversal) |

---

## 3. Noyau vs utilisateur : deux mondes séparés 🔐

Le processeur fonctionne dans **deux modes** :

\`\`\`
 ┌──────────────────────────────────────────────┐
 │  MODE UTILISATEUR (user space)                │  ← tes programmes
 │  droits limités : pas d'accès direct matériel │
 ├──────────────────────────────────────────────┤
 │  MODE NOYAU (kernel space)                     │  ← le cœur du SE
 │  tous les droits : accès matériel, mémoire…    │
 └──────────────────────────────────────────────┘
\`\`\`

- En **mode utilisateur**, un programme ne peut PAS toucher directement au disque, à la mémoire d'un autre processus, etc. C'est ce qui protège le système (un bug dans ton programme ne fait pas planter la machine).
- En **mode noyau**, le **noyau** (*kernel*) a tous les droits. C'est lui qui exécute les opérations sensibles.

> 🛡️ Cette séparation est la base de la **stabilité** et de la **sécurité** d'un SE moderne.

---

## 4. L'appel système : le pont entre les deux mondes 🌉

Comment ton programme (mode utilisateur) fait-il pour lire un fichier (opération matérielle réservée au noyau) ? Il demande poliment au noyau via un **appel système** (*system call*).

\`\`\`
 Ton programme          Noyau
  read(fd, buf, n)  ──►  bascule en mode noyau
                         lit réellement le disque
                   ◄──   retourne les octets + repasse en mode utilisateur
\`\`\`

Exemples d'appels système Linux que tu vas **vraiment utiliser** dans ce checkpoint : \`open\`, \`read\`, \`write\`, \`close\`, \`fork\`, \`exec\`, \`wait\`, \`pipe\`. La commande \`strace ./monprog\` montre en direct tous les appels système d'un programme — un régal pour comprendre ce qui se passe sous le capot.

---

## 5. Les types de SE (culture rapide) 🗂️

- **Mono-tâche vs multi-tâches** : un seul programme à la fois (MS-DOS) vs plusieurs « en même temps » (Linux, Windows).
- **Mono-utilisateur vs multi-utilisateurs** : Linux est nativement **multi-utilisateurs** (plusieurs comptes, permissions) — d'où toute la partie droits/permissions qu'on pratiquera.
- **Temps partagé** : le CPU alterne très vite entre les programmes (ordonnancement) → illusion du parallélisme.
- **Temps réel** : garantit des délais stricts (systèmes embarqués, avionique).

---

## 6. Pourquoi Linux pour la pratique ? 🐧

- **Ouvert et transparent** : on voit tout (le noyau est libre), idéal pour apprendre.
- **Le terminal est roi** : administration, scripts, programmation système — tout passe par la ligne de commande.
- **Standard du monde pro** : serveurs, cloud, DevOps, cybersécurité tournent massivement sous Linux.

**Anatomie de Linux :**
\`\`\`
  Espace utilisateur : bash, coreutils (ls, cp…), gcc, tes programmes
 ──────────────────────────────────────────────────────────────────
  Noyau Linux (kernel) : ordonnanceur, gestion mémoire, pilotes, VFS
 ──────────────────────────────────────────────────────────────────
  Matériel
\`\`\`

> ⚠️ **Linux** = le **noyau**. **Ubuntu** = une **distribution** = le noyau Linux + un ensemble de logiciels (bureau, gestionnaire de paquets \`apt\`…). Dans le prochain module, tu installes **Ubuntu** dans une machine virtuelle.

---

## 🧠 Ce qu'il faut retenir

- Un **SE** est l'intermédiaire entre le **matériel** et les **applications** ; il fait **abstraction** et **gestion de ressources**.
- Ses 4 fonctions : **processus, mémoire, fichiers, E/S**.
- Le CPU sépare **mode utilisateur** (droits limités, tes programmes) et **mode noyau** (tous les droits, le SE) → stabilité + sécurité.
- Un **appel système** (\`read\`, \`fork\`…) est la porte par laquelle un programme demande un service au noyau.
- **Linux** = le noyau ; **Ubuntu** = une distribution complète qu'on installera en VM.

## ⚠️ Erreurs fréquentes des débutants

**1. Confondre « Linux » et « Ubuntu ».** Linux est le **noyau** ; Ubuntu est une **distribution** (noyau + logiciels). On dit « une distrib Linux ».

**2. Croire que les programmes accèdent au matériel directement.** Non : ils passent **toujours** par des **appels système** au noyau. C'est la barrière user/kernel.

**3. Penser que le SE « exécute » les programmes lui-même.** Le SE **ordonnance** : il décide **qui** utilise le CPU et **quand**, mais c'est le **CPU** qui exécute les instructions.

**4. Négliger la théorie « parce que c'est pratique ».** Comprendre user/kernel et les appels système rend TOUTE la suite (processus, fork, permissions) beaucoup plus claire.`,
    badge: {
      id: "badge-boot-sequence",
      name: "Boot Sequence",
      icon: "Cpu",
      description: "Comprend le rôle d'un SE, la frontière noyau/utilisateur et les appels système.",
    },
    challenges: [
      {
        id: "se-intro-role",
        title: "Le rôle du SE",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎛️ À quoi sert un SE ?

Quelle est la **meilleure** description du rôle d'un système d'exploitation ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Pense à ce qui se trouve ENTRE le matériel et les applications.", cost: 10 },
          { text: "📖 Correction : intermédiaire matériel↔applications, qui fait l'abstraction et gère les ressources.", cost: 30 },
        ],
        options: [
          "Un intermédiaire entre le matériel et les applications, qui abstrait le matériel et partage les ressources",
          "Un logiciel qui accélère le processeur physiquement",
          "Un antivirus intégré au disque dur",
          "Un langage de programmation bas niveau",
        ],
        answer: 0,
        explanation: `Le SE est le **chef d'orchestre** entre le **matériel** et les **applications**. Il rend deux services : la **machine étendue** (abstraire le matériel derrière des objets simples : fichiers, processus…) et le **gestionnaire de ressources** (partager CPU, RAM, périphériques). Il n'accélère pas le CPU et n'est ni un antivirus ni un langage.`,
        tags: ["se", "role", "intro"],
      },
      {
        id: "se-intro-fonctions",
        title: "Les fonctions du noyau",
        order: 2,
        difficulty: "easy",
        type: "multi",
        prompt: `## 🧩 Que gère le SE ?

Coche **toutes** les grandes fonctions assurées par un système d'exploitation :`,
        points: 150,
        timeLimitSec: 300,
        options: [
          "La gestion des processus (lancer, arrêter, ordonnancer)",
          "La gestion de la mémoire (attribuer/libérer la RAM)",
          "La gestion des fichiers (organiser les données sur disque)",
          "La conception physique des puces électroniques",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Le SE est un logiciel : il ne fabrique pas le matériel.", cost: 15 },
          { text: "📖 Correction : processus + mémoire + fichiers (+ E/S). Pas la fabrication des puces.", cost: 40 },
        ],
        explanation: `Le SE gère les **processus**, la **mémoire**, les **fichiers** et les **entrées/sorties**. La **conception des puces** relève du matériel (fondeurs comme Intel/AMD), pas du logiciel système.`,
        tags: ["se", "fonctions", "intro"],
      },
      {
        id: "se-intro-modes",
        title: "Mode noyau vs utilisateur",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔐 Deux mondes

Pourquoi le processeur sépare-t-il **mode utilisateur** et **mode noyau** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Que se passerait-il si n'importe quel programme pouvait tout faire sur le matériel ?", cost: 20 },
          { text: "📖 Correction : pour la sécurité et la stabilité — les programmes ont des droits limités, le noyau a tous les droits.", cost: 50 },
        ],
        options: [
          "Pour la sécurité et la stabilité : les programmes ont des droits limités, seul le noyau accède au matériel",
          "Pour rendre le processeur deux fois plus rapide",
          "Parce que Linux et Windows ne peuvent pas cohabiter",
          "Pour économiser de la mémoire vive",
        ],
        answer: 0,
        explanation: `En **mode utilisateur**, un programme a des **droits limités** : il ne peut pas toucher le matériel ni la mémoire des autres processus. En **mode noyau**, le noyau a **tous les droits**. Résultat : un bug dans ton programme ne peut pas faire planter tout le système ni corrompre un autre processus → **stabilité + sécurité**.`,
        tags: ["se", "noyau", "user-space", "intro"],
      },
      {
        id: "se-intro-syscall",
        title: "L'appel système",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🌉 Lire un fichier

Ton programme (mode utilisateur) veut lire un fichier sur le disque. Comment y arrive-t-il ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Le programme ne peut pas toucher le disque lui-même. À qui demande-t-il ?", cost: 20 },
          { text: "📖 Correction : via un appel système (ex. read) qui bascule en mode noyau.", cost: 50 },
        ],
        options: [
          "Il fait un appel système (ex. read) : le noyau bascule en mode noyau, lit le disque, puis rend la main",
          "Il accède directement au disque en mode utilisateur",
          "Il recompile le noyau à chaque lecture",
          "Il demande à l'antivirus de lire le fichier",
        ],
        answer: 0,
        explanation: `Un programme en mode utilisateur **ne peut pas** lire le disque directement. Il déclenche un **appel système** (\`read\`) : le CPU **bascule en mode noyau**, le noyau effectue réellement la lecture, puis **repasse en mode utilisateur** en rendant les données. \`open\`, \`write\`, \`fork\`, \`pipe\`… sont d'autres appels système que tu utiliseras.`,
        tags: ["se", "syscall", "intro"],
      },
      {
        id: "se-intro-linux-ubuntu",
        title: "Linux ≠ Ubuntu",
        order: 5,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🐧 Une histoire de vocabulaire

Quelle affirmation est **correcte** ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "L'un est le noyau, l'autre est le noyau + tous les logiciels autour.", cost: 10 },
          { text: "📖 Correction : Linux = le noyau ; Ubuntu = une distribution (noyau + logiciels).", cost: 30 },
        ],
        options: [
          "Linux est le noyau ; Ubuntu est une distribution (noyau Linux + logiciels, apt, bureau…)",
          "Ubuntu est le noyau et Linux est une application",
          "Linux et Ubuntu sont deux noyaux concurrents incompatibles",
          "Ubuntu est une version payante de Linux",
        ],
        answer: 0,
        explanation: `**Linux** désigne le **noyau** (le cœur du SE). **Ubuntu** est une **distribution** : le noyau Linux **+** un ensemble cohérent de logiciels (gestionnaire de paquets \`apt\`, environnement de bureau, utilitaires…). Debian, Fedora, Arch sont d'autres distributions. Ubuntu est **gratuit**.`,
        tags: ["se", "linux", "ubuntu", "intro"],
      },
      {
        id: "se-intro-couches",
        title: "Empile les couches",
        order: 6,
        difficulty: "medium",
        type: "order",
        prompt: `## 🥞 Du bas vers le haut

Range ces couches de la **plus basse** (matériel) à la **plus haute** (ce que tu utilises) :`,
        points: 200,
        timeLimitSec: 300,
        options: [
          "Le matériel (CPU, RAM, disque)",
          "Le noyau (ordonnanceur, gestion mémoire, pilotes)",
          "Les utilitaires système (bash, ls, gcc…)",
          "Tes applications (ton script, ton programme C)",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "Le matériel est tout en bas ; tes applications tout en haut.", cost: 20 },
          { text: "📖 Correction : Matériel → Noyau → Utilitaires → Applications.", cost: 50 },
        ],
        explanation: `De bas en haut : **Matériel** (physique) → **Noyau** (parle au matériel, mode noyau) → **Utilitaires système** (bash, coreutils, gcc — espace utilisateur) → **Applications** (ce que tu écris). Chaque couche s'appuie sur celle du dessous ; tes programmes ne « voient » jamais le matériel directement.`,
        tags: ["se", "couches", "architecture", "intro"],
      },
    ],
  },
];
