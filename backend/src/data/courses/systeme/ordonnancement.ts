import type { CourseSeed } from "../../../types";

/** Système — Module 6 : ordonnancement (scheduling), TD Master intégrés. */
export const ordonnancement: CourseSeed[] = [
  {
    slug: "se-ordonnancement",
    title: "Ordonnancement des processus",
    checkpoint: "systeme-exploitation",
    codename: "Grid Manager",
    domain: "Système — CPU scheduling",
    theme: "track",
    icon: "Layers",
    accent: "#E8A87C",
    order: 6,
    difficulty: "hard",
    summary:
      "Plusieurs processus, un seul CPU : qui passe et dans quel ordre ? FCFS, SJF, Round Robin, priorités, files multi-niveaux et partage équitable UNIX. On calcule vraiment temps d'attente et temps de séjour, diagrammes de Gantt à l'appui.",
    objectives: [
      "Distinguer ordonnancement préemptif et non préemptif",
      "Dérouler FCFS, SJF, Round Robin (avec quantum) sur un diagramme de Gantt",
      "Calculer temps d'attente, temps de séjour (turnaround) et leurs moyennes",
      "Comprendre les files multi-niveaux (MLFQ) et le partage équitable UNIX",
      "Éviter la famine (starvation) grâce au vieillissement (aging)",
    ],
    lesson: `# 🏁 Ordonnancement des processus — Grid Manager

Sur la grille de départ, dix processus veulent le CPU. L'**ordonnanceur** (*scheduler*) du noyau décide **qui roule et quand**. Un bon ordonnanceur maximise l'utilisation du CPU tout en restant **équitable** et **réactif**. 🏎️

---

## 1. Le vocabulaire du chrono ⏱️

Pour chaque processus, on note :
- **temps d'arrivée** (quand il devient prêt) ;
- **temps d'exécution** / *burst* (combien de CPU il lui faut).

On mesure ensuite :
- **Temps de séjour** (*turnaround*) = **fin − arrivée** (durée totale dans le système).
- **Temps d'attente** (*waiting*) = temps de séjour − temps d'exécution (temps passé à **attendre** le CPU).
- **Temps de réponse** = premier accès au CPU − arrivée.

> 🎯 Objectifs (souvent contradictoires) : maximiser le **débit**, minimiser le **temps d'attente moyen**, garantir l'**équité** et éviter la **famine**.

---

## 2. Préemptif ou non ? ✋

- **Non préemptif** : un processus élu **garde** le CPU jusqu'à ce qu'il finisse ou se bloque. Simple, mais un gros calcul bloque tout le monde.
- **Préemptif** : le noyau peut **retirer** le CPU (fin de quantum, arrivée d'un plus prioritaire). Plus réactif — c'est ce qu'utilisent Linux/Windows.

---

## 3. FCFS — Premier arrivé, premier servi 🚶

*First-Come, First-Served* : non préemptif, ordre d'arrivée. Simple mais souffre de l'**effet convoi** (un long processus fait attendre tous les autres).

**Exemple** — arrivées à t=0 : P1(24), P2(3), P3(3).
\`\`\`
 | P1 (24)                      | P2 (3) | P3 (3) |
 0                             24      27       30
\`\`\`
Attentes : P1=0, P2=24, P3=27 → **moyenne = (0+24+27)/3 = 17**. Énorme, à cause de P1 devant.

---

## 4. SJF — Le plus court d'abord ⚡

*Shortest Job First* : on choisit le processus au **plus petit burst**. **Optimal** pour le temps d'attente moyen, mais suppose de **connaître** les durées (on les estime), et peut **affamer** les longs.

Même exemple, SJF : P2(3), P3(3), P1(24).
\`\`\`
 | P2 | P3 | P1 (24)                      |
 0    3    6                             30
\`\`\`
Attentes : P2=0, P3=3, P1=6 → **moyenne = 3**. Bien mieux que FCFS (17) !

---

## 5. Round Robin — Chacun son tour 🔄

*Round Robin* (RR) : **préemptif**, chaque processus reçoit un **quantum** (tranche de temps fixe). À la fin du quantum, il repasse **en queue** de la file prête. Idéal pour le **temps partagé** (réactivité).

**Exemple** — quantum = 4, arrivées t=0 : P1(24), P2(3), P3(3).
\`\`\`
 |P1(4)|P2(3)|P3(3)|P1(4)|P1(4)|P1(4)|P1(4)|P1(1)|
 0     4     7    10    14    18    22    26   30
\`\`\`
- **Quantum trop grand** → RR ≈ FCFS (peu de préemption).
- **Quantum trop petit** → trop de **changements de contexte** (coûteux) : on passe son temps à commuter.
- Bon compromis : le quantum couvre ~80 % des bursts.

---

## 6. Priorités et famine 🥇

Chaque processus a une **priorité** ; on élit le plus prioritaire. Problème : un processus **peu prioritaire** peut **ne jamais** passer → **famine** (*starvation*).

**Remède : le vieillissement (*aging*)** — on **augmente** progressivement la priorité d'un processus qui attend depuis longtemps. Il finit toujours par passer.

---

## 7. Files multi-niveaux (MLFQ) 🪜

*Multi-Level Feedback Queue* : plusieurs files de **priorités différentes**, chacune avec son **quantum** ; un processus peut **descendre** (s'il consomme tout son quantum → il est « gourmand en CPU ») ou **monter** (s'il rend la main tôt → interactif).

\`\`\`
 File 0 (haute prio, quantum court)  ← processus interactifs
 File 1 (prio moyenne, quantum moyen)
 File 2 (basse prio, quantum long)   ← gros calculs (CPU-bound)
\`\`\`

- Un processus qui **épuise** son quantum **descend** d'une file (on le suppose CPU-bound).
- Un processus qui se **bloque tôt** (E/S) **reste haut** ou **remonte** (on le suppose interactif → on le veut réactif).
- Le **vieillissement** fait remonter ceux qui stagnent en bas → pas de famine.

C'est l'idée derrière l'ordonnancement historique d'UNIX : favoriser l'**interactivité** sans affamer les calculs.

---

## 8. Partage équitable UNIX (fair-share) ⚖️

Objectif : répartir le CPU **équitablement entre utilisateurs** (pas seulement entre processus). Si Alice lance 1 processus et Bob en lance 9, un partage « par processus » donnerait 90 % à Bob. Le **partage équitable** vise plutôt **50/50 entre Alice et Bob**, puis subdivise la part de chacun entre ses processus.

Concrètement, la priorité d'un processus baisse d'autant plus que **son utilisateur** a déjà consommé de CPU récemment → chaque utilisateur reçoit une **fraction équitable**. C'est l'ancêtre des *cgroups* et de l'ordonnanceur **CFS** (*Completely Fair Scheduler*) de Linux, qui vise à donner à chaque tâche une **part proportionnelle** du CPU.

---

## 🧠 Ce qu'il faut retenir

- **Séjour** = fin − arrivée ; **attente** = séjour − exécution. On minimise l'attente **moyenne**.
- **FCFS** : simple, mais **effet convoi**. **SJF** : optimal pour l'attente moyenne, mais affame les longs.
- **Round Robin** : préemptif, **quantum** fixe → réactivité ; quantum trop petit = trop de commutations.
- **Priorités** → risque de **famine** ; remède = **vieillissement (aging)**.
- **MLFQ** : files à priorités/quantums variés ; un CPU-bound **descend**, un interactif **reste haut**.
- **Partage équitable UNIX / CFS** : répartir le CPU entre **utilisateurs**/tâches de façon proportionnelle.

## ⚠️ Erreurs fréquentes des débutants

**1. Confondre séjour et attente.** **Séjour** inclut l'exécution ; **attente** = séjour **moins** l'exécution.

**2. Oublier les préemptions en Round Robin.** Un processus non terminé après son quantum **repart en queue** ; il faut suivre la file dans le temps.

**3. Croire que SJF est toujours utilisable.** Il faut **connaître/estimer** les durées à l'avance, ce qui est rarement exact.

**4. Ignorer le coût du changement de contexte.** Un quantum minuscule rend le système « équitable » mais **lent** (on commute sans arrêt).

**5. Confondre priorité et équité.** Les priorités peuvent **affamer** ; le **partage équitable** garantit une fraction à chacun, priorité ou pas.`,
    badge: {
      id: "badge-grid-manager",
      name: "Grid Manager",
      icon: "Layers",
      description: "Déroule FCFS/SJF/Round Robin, calcule attente et séjour, comprend MLFQ et partage équitable.",
    },
    challenges: [
      {
        id: "se-ordo-preemptif",
        title: "Préemptif ou non ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## ✋ Définition

Qu'est-ce qu'un ordonnancement **préemptif** ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Le noyau peut-il RETIRER le CPU à un processus en cours ?", cost: 10 },
          { text: "📖 Correction : oui — le noyau peut interrompre un processus pour en élire un autre.", cost: 30 },
        ],
        options: [
          "Le noyau peut retirer le CPU à un processus en cours pour en élire un autre",
          "Chaque processus garde le CPU jusqu'à la fin, quoi qu'il arrive",
          "Les processus s'exécutent tous en même temps sur un seul cœur",
          "Le CPU s'éteint entre deux processus",
        ],
        answer: 0,
        explanation: `En **préemptif**, le noyau peut **retirer** le CPU à un processus (fin de quantum, arrivée d'un plus prioritaire) → réactivité. En **non préemptif**, un processus élu **garde** le CPU jusqu'à finir ou se bloquer. Linux/Windows sont préemptifs (Round Robin + priorités).`,
        tags: ["ordonnancement", "preemptif", "definitions"],
      },
      {
        id: "se-ordo-fcfs-attente",
        title: "FCFS — attente moyenne",
        order: 2,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🚶 FCFS

Trois processus arrivent à **t=0** dans l'ordre P1, P2, P3 avec des durées d'exécution : **P1 = 6**, **P2 = 8**, **P3 = 4**. Ordonnancement **FCFS** (non préemptif).

Calcule le **temps d'attente moyen**.

*(Rappel : attente = instant de début − arrivée. Arrivées toutes à 0.)*`,
        points: 250,
        timeLimitSec: 480,
        hints: [
          { text: "P1 commence à 0, P2 à 6 (après P1), P3 à 14 (après P1+P2). Attentes : 0, 6, 14.", cost: 25 },
          { text: "📖 Correction : (0 + 6 + 14) / 3 = 20/3 ≈ 6.67.", cost: 60 },
        ],
        answer: 6.67,
        accept: ["6.67", "6,67", "20/3", "6.666", "6.6667"],
        explanation: `Dans l'ordre P1(6), P2(8), P3(4) :
- P1 démarre à 0 → attente **0**
- P2 démarre à 6 (après P1) → attente **6**
- P3 démarre à 14 (après P1+P2) → attente **14**

Moyenne = (0 + 6 + 14) / 3 = **20/3 ≈ 6,67**. FCFS suit strictement l'ordre d'arrivée : si un long processus est devant, tout le monde attend (**effet convoi**).`,
        tags: ["ordonnancement", "fcfs", "calcul"],
      },
      {
        id: "se-ordo-sjf",
        title: "SJF fait mieux",
        order: 3,
        difficulty: "medium",
        type: "numeric",
        prompt: `## ⚡ SJF

Mêmes processus, tous arrivés à **t=0** : **P1 = 6**, **P2 = 8**, **P3 = 4**. Cette fois, ordonnancement **SJF** (le plus court d'abord, non préemptif).

Calcule le **temps d'attente moyen**.`,
        points: 250,
        timeLimitSec: 480,
        hints: [
          { text: "Ordre SJF : P3(4), P1(6), P2(8). Attentes : 0, 4, 10.", cost: 25 },
          { text: "📖 Correction : (0 + 4 + 10) / 3 = 14/3 ≈ 4.67.", cost: 60 },
        ],
        answer: 4.67,
        accept: ["4.67", "4,67", "14/3", "4.666", "4.6667"],
        explanation: `SJF trie par durée croissante : **P3(4) → P1(6) → P2(8)**.
- P3 démarre à 0 → attente **0**
- P1 démarre à 4 → attente **4**
- P2 démarre à 10 → attente **10**

Moyenne = (0 + 4 + 10)/3 = **14/3 ≈ 4,67** — mieux que FCFS (6,67). SJF **minimise** l'attente moyenne… au prix d'une possible **famine** des longs processus et du besoin de connaître les durées.`,
        tags: ["ordonnancement", "sjf", "calcul"],
      },
      {
        id: "se-ordo-rr-gantt",
        title: "Round Robin — l'ordre d'exécution",
        order: 4,
        difficulty: "hard",
        type: "order",
        prompt: `## 🔄 Round Robin, quantum = 2

Arrivées à **t=0** : P1(exéc=4), P2(exéc=2), P3(exéc=1). File initiale : P1, P2, P3. **Quantum = 2**.

Remets les **tranches d'exécution** dans l'ordre chronologique où le CPU les exécute :`,
        points: 300,
        timeLimitSec: 600,
        options: [
          "P1 (tranche 1 : 2 unités, il lui en reste 2)",
          "P2 (2 unités : terminé)",
          "P3 (1 unité : terminé)",
          "P1 (tranche 2 : 2 unités : terminé)",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "P1 prend le quantum (2), repart en queue ; P2 (2) finit ; P3 (1) finit ; puis P1 revient finir ses 2 dernières.", cost: 30 },
          { text: "📖 Correction : P1(2) → P2(2) → P3(1) → P1(2). Ordre : 0,1,2,3.", cost: 70 },
        ],
        explanation: `File : [P1, P2, P3], quantum 2.
1. **P1** s'exécute 2 (reste 2) → préempté, repart **en queue** : file [P2, P3, P1].
2. **P2** s'exécute 2 → **terminé**.
3. **P3** s'exécute 1 (< quantum) → **terminé**.
4. **P1** revient et s'exécute ses 2 dernières → **terminé**.

\`\`\`
 |P1(2)|P2(2)|P3(1)|P1(2)|
 0     2     4     5     7
\`\`\`
Round Robin **tourne** : à la fin du quantum, le processus non fini repasse **derrière** tout le monde. C'est ce qui donne la réactivité du temps partagé.`,
        tags: ["ordonnancement", "round-robin", "gantt"],
      },
      {
        id: "se-ordo-quantum",
        title: "Choisir le quantum",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⏲️ Taille du quantum

En Round Robin, que se passe-t-il si le **quantum** est **beaucoup trop petit** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Que fait le CPU chaque fois qu'un quantum se termine ?", cost: 20 },
          { text: "📖 Correction : trop de changements de contexte → beaucoup de temps perdu à commuter.", cost: 50 },
        ],
        options: [
          "Trop de changements de contexte : le CPU passe son temps à commuter au lieu de calculer",
          "Les processus ne s'exécutent jamais",
          "Le Round Robin devient identique à SJF",
          "La mémoire vive se remplit automatiquement",
        ],
        answer: 0,
        explanation: `Un **quantum minuscule** provoque énormément de **changements de contexte** (sauvegarder/restaurer l'état d'un processus). Chaque commutation a un **coût** : on gaspille du CPU en gestion au lieu de calcul utile. À l'inverse, un quantum **trop grand** rapproche RR du FCFS (peu de préemption, moins réactif). On cherche un **compromis**.`,
        tags: ["ordonnancement", "round-robin", "quantum", "contexte"],
      },
      {
        id: "se-ordo-famine",
        title: "Famine et vieillissement",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🥇 Priorités

Avec un ordonnancement par **priorités strictes**, un processus peu prioritaire risque la **famine** (ne jamais passer). Quel mécanisme corrige ça ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "On fait 'vieillir' la priorité d'un processus qui attend longtemps.", cost: 20 },
          { text: "📖 Correction : le vieillissement (aging) augmente la priorité avec le temps d'attente.", cost: 50 },
        ],
        options: [
          "Le vieillissement (aging) : la priorité augmente avec le temps d'attente",
          "Supprimer les processus qui attendent trop",
          "Doubler la fréquence du CPU",
          "Interdire les priorités",
        ],
        answer: 0,
        explanation: `Le **vieillissement (aging)** **augmente progressivement** la priorité d'un processus qui attend depuis longtemps. Ainsi, même un processus initialement peu prioritaire finit par devenir prioritaire et **passer** → plus de **famine**. C'est un ingrédient clé des files multi-niveaux (MLFQ).`,
        tags: ["ordonnancement", "famine", "aging", "priorites"],
      },
      {
        id: "se-ordo-fairshare",
        title: "Partage équitable UNIX",
        order: 7,
        difficulty: "hard",
        type: "mcq",
        prompt: `## ⚖️ Fair-share

Alice lance **1** processus, Bob en lance **9**, tous gourmands en CPU. Avec un **partage équitable par utilisateur** (fair-share), comment le CPU est-il réparti ?

*(Reprise du TD : partage équitable UNIX.)*`,
        points: 300,
        timeLimitSec: 420,
        hints: [
          { text: "Le partage se fait d'abord ENTRE UTILISATEURS, puis entre leurs processus.", cost: 30 },
          { text: "📖 Correction : ~50 % à Alice, ~50 % à Bob (puis Bob divise sa part entre ses 9 processus).", cost: 70 },
        ],
        options: [
          "Environ 50 % pour Alice et 50 % pour Bob ; Bob partage ensuite sa moitié entre ses 9 processus",
          "10 % à Alice et 90 % à Bob (un partage par processus)",
          "100 % à Alice car elle a le moins de processus",
          "Le CPU alterne aléatoirement sans règle",
        ],
        answer: 0,
        explanation: `Le **partage équitable (fair-share)** répartit d'abord le CPU **entre utilisateurs**, pas entre processus. Alice et Bob reçoivent **chacun ~50 %**, puis Bob **subdivise** sa moitié entre ses 9 processus (~5,5 % chacun), tandis que l'unique processus d'Alice reçoit ~50 %. Un partage naïf « par processus » aurait donné 90 % à Bob — injuste. C'est l'esprit du CFS de Linux et des cgroups.`,
        tags: ["ordonnancement", "fair-share", "unix", "equite"],
      },
      {
        id: "se-ordo-mlfq",
        title: "Files multi-niveaux",
        order: 8,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🪜 MLFQ

Dans une file multi-niveaux à rétroaction (MLFQ), que devient un processus qui **épuise systématiquement tout son quantum** (gros calcul CPU) ?`,
        points: 250,
        timeLimitSec: 360,
        hints: [
          { text: "Un CPU-bound est 'rétrogradé' pour laisser les interactifs réactifs.", cost: 25 },
          { text: "📖 Correction : il descend vers une file de priorité plus basse (quantum plus long).", cost: 60 },
        ],
        options: [
          "Il descend vers une file de priorité plus basse (avec un quantum plus long)",
          "Il monte vers la file la plus prioritaire",
          "Il est immédiatement supprimé",
          "Il double sa priorité à chaque quantum",
        ],
        answer: 0,
        explanation: `En **MLFQ**, un processus qui **consomme tout son quantum** est supposé **CPU-bound** → on le **rétrograde** vers une file de priorité **plus basse** (quantum plus long, moins d'interruptions). À l'inverse, un processus qui **rend la main tôt** (E/S) est supposé **interactif** → il **reste haut** pour rester réactif. Le **vieillissement** évite que les rétrogradés ne meurent de faim.`,
        tags: ["ordonnancement", "mlfq", "multi-niveaux"],
      },
    ],
  },
];
