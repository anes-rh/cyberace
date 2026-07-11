import type { CourseSeed } from "../../../../types";

/** Cyber · Système — Module 1 : rootkits et compromission du noyau. */
export const rootkits: CourseSeed[] = [
  {
    slug: "cys-rootkits",
    title: "Rootkits et compromission du noyau",
    checkpoint: "cyber-systeme",
    codename: "Ghost Kernel",
    domain: "Système — Rootkits",
    theme: "grid",
    icon: "Ghost",
    accent: "#E8A87C",
    order: 1,
    difficulty: "hard",
    summary:
      "Le malware qui prend racine : définition et catégories de rootkits (user-mode, kernel-mode, bootkit, firmware, hyperviseur), techniques d'injection en espace noyau, détournement de la table d'appels système (syscall hijacking), dissimulation (hooking, DKOM) et principes de détection (intégrité du noyau, analyse mémoire).",
    objectives: [
      "Définir un rootkit et le distinguer des autres malwares par son objectif",
      "Classer les rootkits par niveau de privilège (user, kernel, boot, firmware)",
      "Expliquer le syscall hijacking et le hooking de la table des appels système",
      "Comprendre la dissimulation par DKOM (manipulation directe des objets noyau)",
      "Connaître les principes de détection (intégrité du noyau, analyse mémoire)",
    ],
    resources: [
      {
        label: "MITRE ATT&CK — Rootkit (T1014)",
        url: "https://attack.mitre.org/techniques/T1014/",
        kind: "link",
        note: "Fiche technique sur les rootkits : dissimulation de la présence d'un attaquant sur un système.",
      },
      {
        label: "NIST SP 800-83 — Guide to Malware Incident Prevention and Handling",
        url: "https://csrc.nist.gov/pubs/sp/800/83/r1/final",
        kind: "link",
        note: "Guide de référence sur la prévention, la détection et le traitement des maliciels.",
      },
    ],
    lesson: `# 👻 Rootkits et compromission du noyau — Ghost Kernel

Un **rootkit** n'est pas une attaque « bruyante » : c'est un logiciel malveillant dont le seul but est de **rester invisible** tout en donnant à l'attaquant un **contrôle privilégié et persistant** de la machine. Plus il s'installe **bas** dans le système (vers le noyau, le firmware), plus il est **puissant et difficile à détecter**. 🏎️

---

## 1. Qu'est-ce qu'un rootkit ? 🎭

Le mot vient de « **root** » (le compte administrateur sous UNIX) + « **kit** » (boîte à outils). Un **rootkit** est un ensemble d'outils qui permet à un attaquant de :
- **maintenir un accès privilégié** (root/SYSTEM) à un système déjà compromis,
- **se dissimuler** (cacher ses processus, fichiers, connexions réseau, clés de registre),
- **survivre** aux redémarrages (persistance).

> 🧭 Distinction clé : un rootkit **ne sert pas à pénétrer** un système (ce n'est pas un exploit d'entrée) — il sert à **s'y cacher et à y rester** une fois l'accès obtenu. Son arme principale, c'est la **furtivité**, pas la propagation.

---

## 2. Les catégories de rootkits 🪜

On classe les rootkits selon le **niveau de privilège** où ils s'exécutent — plus c'est bas, plus c'est dangereux :

\`\`\`
   ┌──────────────────────────────────────────────┐  ← le plus difficile à détecter
   │ Firmware / matériel (BIOS/UEFI, périphériques) │
   ├──────────────────────────────────────────────┤
   │ Hyperviseur (rootkit de virtualisation)        │
   ├──────────────────────────────────────────────┤
   │ Bootkit (secteur d'amorçage / bootloader)      │
   ├──────────────────────────────────────────────┤
   │ Kernel-mode (Ring 0, dans le noyau)            │
   ├──────────────────────────────────────────────┤
   │ User-mode (Ring 3, applications)               │  ← le plus facile à détecter
   └──────────────────────────────────────────────┘
\`\`\`

- **User-mode (Ring 3)** : s'exécute dans l'espace **utilisateur**, en interceptant des appels de **bibliothèques** (ex. remplacement de binaires système, hooking d'API en espace utilisateur). Le **plus simple** à écrire… et à détecter.
- **Kernel-mode (Ring 0)** : s'exécute **dans le noyau**, souvent via un **module noyau/pilote** malveillant. Il a **tous les droits** et peut mentir au système lui-même (cacher processus/fichiers à la source). Beaucoup plus **furtif et dangereux**.
- **Bootkit** : infecte le **processus d'amorçage** (MBR/VBR, bootloader) → il se charge **avant** le système d'exploitation et le noyau, prenant le contrôle très tôt.
- **Firmware / matériel** : s'implante dans le **BIOS/UEFI** ou le firmware d'un périphérique → survit à une **réinstallation de l'OS** et même au **changement de disque**. Le plus **persistant**.
- **Rootkit d'hyperviseur** : déplace le système cible **dans une machine virtuelle** contrôlée par le rootkit (concept « Blue Pill ») → l'OS s'exécute « au-dessus » sans le savoir.

> 🧠 Règle : **plus le rootkit est bas dans la pile** (user → kernel → boot → firmware), **plus il est privilégié, persistant et furtif**, et plus la détection/désinfection est **difficile** (parfois impossible sans reflasher le firmware).

---

## 3. L'injection en espace noyau 💉

Pour atteindre le **Ring 0**, un rootkit kernel-mode doit **charger du code dans le noyau**. Techniques classiques :
- **Module noyau malveillant** (LKM sous Linux, **driver** signé/non signé sous Windows) : le moyen le plus direct — charger un pilote qui s'exécute avec les privilèges du noyau.
- **Exploitation d'une vulnérabilité noyau** : utiliser une faille (débordement, corruption mémoire dans un driver légitime) pour **injecter** du code sans charger de module visible.
- **/dev/kmem, /dev/mem** (historique, Linux) : écrire **directement** dans la mémoire noyau.
- **BYOVD** (*Bring Your Own Vulnerable Driver*) : charger un **pilote légitime mais vulnérable** (signé) puis l'exploiter pour exécuter du code noyau — contourne la signature des pilotes.

Une fois dans le noyau, le rootkit peut **modifier les structures et le comportement** du système à la racine.

---

## 4. Le syscall hijacking (détournement d'appels système) 🪝

Les **appels système** (*syscalls*) sont la **frontière** par laquelle les programmes utilisateur demandent des services au noyau (lire un fichier, lister des processus, ouvrir une socket). Le noyau conserve une **table des appels système** (*syscall table*) qui associe chaque numéro d'appel à l'**adresse** de la fonction qui le traite.

Un rootkit kernel-mode **détourne** cette table :

\`\`\`
   Table des appels système (normale)        Table détournée par le rootkit
   ─────────────────────────────────         ──────────────────────────────
   sys_read   →  0x...  (vraie fonction)      sys_read   →  0x...
   sys_getdents → 0x... (liste fichiers)      sys_getdents → HOOK_rootkit ──► filtre
   sys_kill   →  0x...                        sys_kill   →  0x...
                                                          │
                                          appelle la vraie fonction,
                                          puis RETIRE ses fichiers/PID de la liste
\`\`\`

Principe du **hooking** : le rootkit remplace l'adresse d'un appel (ex. celui qui **liste les fichiers** ou les **processus**) par l'adresse de **sa propre fonction**. Celle-ci appelle la vraie, puis **filtre le résultat** pour **effacer sa trace** (retirer ses fichiers, processus, ports de la liste renvoyée). Résultat : les outils standards (\`ls\`, \`ps\`, gestionnaire de tâches) ne **voient rien**, car ils s'appuient sur ces appels détournés.

Variantes : détournement de la **table des interruptions (IDT)**, de la **table des descripteurs**, ou de **pointeurs de fonctions** dans des structures noyau.

---

## 5. La dissimulation par DKOM 🧬

Une technique plus avancée que le hooking : le **DKOM** (*Direct Kernel Object Manipulation*). Au lieu de détourner des **appels**, le rootkit **modifie directement les structures de données** du noyau **en mémoire**.

Exemple emblématique : le noyau tient une **liste chaînée** des processus actifs. Pour **cacher un processus**, le rootkit **le retire de la liste** en réajustant les pointeurs (le processus **continue de s'exécuter** — l'ordonnanceur utilise une autre structure — mais il **n'apparaît plus** dans les énumérations).

\`\`\`
   Liste des processus (chaînée) :
   [A] ⇄ [MALVEILLANT] ⇄ [B]        →  DKOM : on "débranche" le maillon
   [A] ⇄──────────────────⇄ [B]     →  le processus tourne mais est INVISIBLE
\`\`\`

Le DKOM est **redoutable** car il ne laisse **aucun hook** à repérer : les structures semblent cohérentes pour les outils classiques. Autres cibles : cacher des **modules noyau**, des **ports**, élever des **privilèges** en modifiant le jeton (*token*) d'un processus.

> 🧭 Hooking vs DKOM : le **hooking** détourne le **chemin d'exécution** (les appels) ; le **DKOM** falsifie les **données** elles-mêmes. Les deux visent la **furtivité**, mais le DKOM est plus difficile à détecter par recherche de hooks.

---

## 6. Détecter un rootkit 🔬

Puisqu'un rootkit **ment au système**, on ne peut pas lui faire confiance pour se dénoncer. Principes de détection :

- **Vérification d'intégrité du noyau** : comparer la **syscall table**, l'IDT et le code noyau à une **référence connue** — toute modification (hook) est suspecte. Windows utilise **PatchGuard/KPP** pour empêcher la modification de structures noyau critiques.
- **Détection croisée** (*cross-view*) : comparer une vue « **haut niveau** » (via les API/appels, potentiellement piégés) à une vue « **bas niveau** » (lecture directe des structures/du disque). Une **différence** (un fichier/processus visible en bas mais pas en haut) **trahit** le rootkit. C'est le principe d'outils comme les *rootkit revealers*.
- **Analyse mémoire (forensic)** : examiner un **dump de la RAM** hors du système compromis pour retrouver processus cachés, modules, hooks et incohérences dans les structures noyau (memory forensics).
- **Analyse hors-ligne** : booter sur un **support sain** (Live CD) pour inspecter le disque **sans** exécuter le système infecté (qui mentirait).
- **Prévention** : **Secure Boot** (chaîne de confiance à l'amorçage contre les bootkits), **signature obligatoire des pilotes** (*Driver Signature Enforcement*), **HVCI**/virtualisation-based security (isoler le noyau), **moindre privilège** et **mises à jour** (réduire les vulnérabilités noyau exploitables).

> 🧠 Le meilleur point de vue pour détecter un rootkit est **extérieur** au système qu'il contrôle : depuis le **matériel/hyperviseur**, un **dump mémoire analysé ailleurs**, ou un **boot sain**. Vue de l'intérieur, la machine « ne voit pas » ce que le rootkit lui cache.

---

## 🧠 À retenir

- Un **rootkit** sert à **rester privilégié, persistant et invisible** sur un système **déjà compromis** (furtivité), pas à y pénétrer. Nom = **root** + **kit**.
- **Catégories par privilège** (du plus détectable au moins) : **user-mode (Ring 3)** → **kernel-mode (Ring 0)** → **bootkit** (amorçage, avant l'OS) → **firmware/matériel** (survit à la réinstallation) → **hyperviseur**. Plus bas = plus puissant et furtif.
- **Injection noyau** : **module/driver malveillant**, **exploitation de faille noyau**, **/dev/mem**, **BYOVD** (pilote signé vulnérable → contourne la signature).
- **Syscall hijacking** : détourner la **table des appels système** (hooking) — ex. filtrer \`getdents\`/l'énumération pour **effacer** fichiers/processus/ports de la vue.
- **DKOM** : modifier **directement les structures noyau** (ex. **débrancher** un processus de la liste chaînée → il tourne mais est **invisible**), sans hook repérable.
- **Détection** : **intégrité du noyau** (comparer syscall table/IDT à une référence, PatchGuard), **détection croisée** (vue haut ≠ vue bas), **analyse mémoire** (dump RAM), **boot sain** hors-ligne. **Prévention** : **Secure Boot**, **signature des pilotes**, HVCI, moindre privilège, MAJ. Le bon point de vue est **extérieur** au système compromis.`,
    badge: {
      id: "badge-cys-ghost-kernel",
      name: "Ghost Kernel",
      icon: "Ghost",
      description: "Maîtrise les catégories de rootkits, le syscall hijacking, le DKOM et les principes de détection.",
    },
    challenges: [
      {
        id: "cys-root-def",
        title: "Le but d'un rootkit",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 👻 Définition

Quel est l'objectif **principal** d'un rootkit ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Ce n'est pas un outil d'intrusion : il intervient APRÈS la compromission.", cost: 20 },
          { text: "📖 Correction : maintenir un accès privilégié tout en restant invisible et persistant.", cost: 50 },
        ],
        options: [
          "Maintenir un accès privilégié, persistant et invisible sur un système déjà compromis",
          "Pénétrer initialement un système via un exploit réseau",
          "Chiffrer les fichiers pour demander une rançon",
          "Augmenter les performances du système",
        ],
        answer: 0,
        explanation: `Un **rootkit** ne sert **pas à pénétrer** un système : il intervient **après** la compromission pour **maintenir un accès privilégié** (root/SYSTEM), **se dissimuler** (processus, fichiers, connexions) et **persister**. Son arme est la **furtivité**. La pénétration relève d'un **exploit**, le chiffrement pour rançon d'un **ransomware**.`,
        tags: ["rootkit", "furtivite", "persistance"],
      },
      {
        id: "cys-root-categories",
        title: "Du plus furtif au moins furtif",
        order: 2,
        difficulty: "hard",
        type: "order",
        prompt: `## 🪜 Niveaux de privilège

Classe ces types de rootkits du **plus facile à détecter** au **plus difficile/furtif** :`,
        points: 350,
        timeLimitSec: 420,
        options: [
          "User-mode (Ring 3)",
          "Kernel-mode (Ring 0)",
          "Bootkit (amorçage)",
          "Firmware / matériel",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "Plus le rootkit est bas dans la pile, plus il est furtif et persistant.", cost: 30 },
          { text: "📖 Correction : user-mode → kernel-mode → bootkit → firmware.", cost: 80 },
        ],
        explanation: `Du plus détectable au plus furtif : **user-mode (Ring 3)** → **kernel-mode (Ring 0)** → **bootkit** (se charge avant l'OS) → **firmware/matériel** (survit à la réinstallation de l'OS, voire au changement de disque). Plus le rootkit s'installe **bas**, plus il est **privilégié, persistant et difficile à éradiquer**.`,
        tags: ["categories", "ring", "firmware"],
      },
      {
        id: "cys-root-syscall",
        title: "Syscall hijacking",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🪝 Détournement d'appels

Comment un rootkit kernel-mode utilise-t-il le **détournement de la table des appels système** pour se cacher ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Il remplace l'adresse d'un appel (ex. lister les fichiers) par sa propre fonction qui filtre le résultat.", cost: 30 },
          { text: "📖 Correction : remplacer l'entrée d'un syscall par un hook qui retire ses traces du résultat.", cost: 80 },
        ],
        options: [
          "Il remplace l'adresse d'un appel (ex. l'énumération des fichiers/processus) par sa propre fonction, qui appelle la vraie puis retire ses traces du résultat",
          "Il supprime physiquement le noyau du disque",
          "Il chiffre la table des appels système avec AES",
          "Il augmente le nombre d'appels système disponibles",
        ],
        answer: 0,
        explanation: `Le **syscall hijacking** remplace, dans la **table des appels système**, l'adresse d'un appel (ex. \`getdents\` pour lister les fichiers, ou l'énumération des processus) par un **hook**. Ce hook appelle la **vraie** fonction, puis **filtre** le résultat pour **effacer** les fichiers/processus/ports du rootkit. Les outils standards (\`ls\`, \`ps\`) s'appuyant sur ces appels **ne voient rien**.`,
        tags: ["syscall", "hooking", "table-appels"],
      },
      {
        id: "cys-root-dkom",
        title: "DKOM",
        order: 4,
        difficulty: "insane",
        type: "mcq",
        prompt: `## 🧬 Direct Kernel Object Manipulation

En quoi consiste la technique **DKOM**, et pourquoi est-elle plus difficile à détecter que le hooking ?`,
        points: 550,
        timeLimitSec: 480,
        hints: [
          { text: "Elle modifie directement les structures du noyau (ex. débrancher un processus de la liste chaînée).", cost: 40 },
          { text: "📖 Correction : falsifier les données noyau elles-mêmes (pas d'appel détourné), ex. retirer un processus de la liste.", cost: 120 },
        ],
        options: [
          "Le rootkit modifie directement les structures de données du noyau (ex. retire un processus de la liste chaînée) : aucun hook à repérer, les données elles-mêmes sont falsifiées",
          "Il détourne uniquement les appels système sans toucher à la mémoire",
          "Il envoie les données du noyau vers Internet en clair",
          "Il augmente la priorité de tous les processus",
        ],
        answer: 0,
        explanation: `Le **DKOM** (*Direct Kernel Object Manipulation*) **modifie directement les structures noyau** en mémoire : par exemple, il **débranche** un processus de la **liste chaînée** des processus (le processus **tourne toujours** — l'ordonnanceur utilise une autre structure — mais il est **invisible** aux énumérations). Contrairement au **hooking** (qui détourne des **appels**, repérables), le DKOM falsifie les **données** elles-mêmes → **pas de hook** à détecter.`,
        tags: ["dkom", "furtivite", "liste-processus"],
      },
      {
        id: "cys-root-detection",
        title: "Détecter l'invisible",
        order: 5,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🔬 Détection

Puisqu'un rootkit ment au système qu'il contrôle, quelles approches permettent malgré tout de le **détecter** ? (Coche tout ce qui s'applique.)`,
        points: 350,
        timeLimitSec: 420,
        options: [
          "Vérifier l'intégrité du noyau (comparer la syscall table/IDT à une référence connue)",
          "Détection croisée : comparer une vue haut niveau (API) à une vue bas niveau (structures/disque brut)",
          "Analyser un dump mémoire hors du système, ou booter sur un support sain",
          "Demander gentiment au rootkit s'il est présent via un appel système standard",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Le bon point de vue est EXTÉRIEUR au système compromis. Le 4e est absurde.", cost: 30 },
          { text: "📖 Correction : intégrité noyau + détection croisée + analyse mémoire/boot sain.", cost: 80 },
        ],
        explanation: `On détecte un rootkit depuis un **point de vue extérieur** au système qu'il contrôle : **intégrité du noyau** (comparer syscall table/IDT/code à une référence — cf. PatchGuard), **détection croisée** (vue haut niveau via API **≠** vue bas niveau via structures/disque brut), **analyse mémoire** (dump RAM analysé ailleurs) ou **boot sain** hors-ligne. Interroger le système **via ses propres appels** est vain : le rootkit **ment** justement à ce niveau.`,
        tags: ["detection", "integrite", "cross-view"],
      },
      {
        id: "cys-root-byovd",
        title: "Contourner la signature",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## 💉 Injection noyau

Comment nomme-t-on la technique où l'attaquant charge un **pilote légitime mais vulnérable** (donc signé et accepté) pour ensuite l'exploiter et exécuter son code dans le noyau ?

*(Réponds par le sigle anglais, 4 lettres.)*`,
        points: 200,
        timeLimitSec: 240,
        hints: [
          { text: "Bring Your Own Vulnerable Driver.", cost: 20 },
          { text: "📖 Correction : BYOVD.", cost: 50 },
        ],
        answer: "BYOVD",
        accept: ["byovd", "bring your own vulnerable driver"],
        caseSensitive: false,
        explanation: `**BYOVD** (*Bring Your Own Vulnerable Driver*) : l'attaquant charge un **pilote légitime signé** mais **vulnérable**, puis exploite sa faille pour exécuter du code en **Ring 0**. Cela **contourne** la signature obligatoire des pilotes (le driver est authentique). Parade : listes de **blocage** de pilotes vulnérables connus, HVCI, et durcissement du chargement de pilotes.`,
        tags: ["byovd", "injection", "driver"],
      },
    ],
  },
];
