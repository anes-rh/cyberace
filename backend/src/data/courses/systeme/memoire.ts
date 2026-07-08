import type { CourseSeed } from "../../../types";

/** Système — Module 9 : gestion de la mémoire (pagination, mémoire virtuelle). */
export const memoire: CourseSeed[] = [
  {
    slug: "se-memoire",
    title: "Gestion de la mémoire",
    checkpoint: "systeme-exploitation",
    codename: "Address Space",
    domain: "Système — Mémoire",
    theme: "track",
    icon: "MemoryStick",
    accent: "#E8A87C",
    order: 9,
    difficulty: "hard",
    summary:
      "Comment faire tenir 10 programmes qui croient chacun avoir toute la RAM ? Adresses logiques vs physiques, pagination (pages/cadres, table des pages, offset), mémoire virtuelle et swap, défauts de page, TLB, et un mot sur la segmentation.",
    objectives: [
      "Distinguer adresse logique (virtuelle) et adresse physique",
      "Comprendre la pagination : pages, cadres, table des pages, déplacement (offset)",
      "Traduire une adresse virtuelle en adresse physique (numéro de page + offset)",
      "Comprendre la mémoire virtuelle, le swap et le défaut de page",
      "Connaître le rôle du TLB et distinguer pagination et segmentation",
    ],
    lesson: `# 🧠 Gestion de la mémoire — Address Space

Chaque programme est écrit comme s'il possédait **toute** la mémoire à partir de l'adresse 0. Or ils tournent à dix, dans une RAM limitée, sans se marcher dessus. Le tour de magie s'appelle la **mémoire virtuelle**. 🏎️

---

## 1. Adresse logique vs physique 🎭

- **Adresse logique** (ou **virtuelle**) : celle que **le programme** manipule. Chaque processus a son **propre espace d'adressage** virtuel, à partir de 0.
- **Adresse physique** : l'emplacement **réel** dans la barrette de RAM.

Un composant matériel, la **MMU** (*Memory Management Unit*), **traduit** à la volée chaque adresse virtuelle en adresse physique, en s'appuyant sur des tables gérées par le noyau.

\`\`\`
  CPU (adresse virtuelle)  ──►  MMU  ──►  RAM (adresse physique)
                                 ↑
                       table des pages (par processus)
\`\`\`

> 🛡️ Bénéfice majeur : **isolation**. Le processus A ne peut pas lire/écrire la mémoire de B, car leurs espaces virtuels pointent vers des zones physiques différentes.

---

## 2. La pagination 📄

On découpe :
- l'espace **virtuel** en **pages** de taille fixe (souvent **4 Ko**) ;
- la RAM **physique** en **cadres** (*frames*) de **même taille**.

Une page virtuelle est chargée dans **n'importe quel** cadre libre : plus besoin d'un bloc contigu → fini la **fragmentation externe**.

La **table des pages** (par processus) fait la correspondance **page → cadre** :

\`\`\`
   Adresse virtuelle = [ numéro de page | déplacement (offset) ]

   table des pages :  page 0 → cadre 5
                      page 1 → cadre 2
                      page 2 → cadre 9
   Adresse physique = [ numéro de cadre | même offset ]
\`\`\`

### Traduire une adresse (l'exercice clé) 🔢

Avec des pages de **taille P** :
- **numéro de page** = adresse **/** P (division entière)
- **déplacement (offset)** = adresse **mod** P

\`\`\`
 Pages de 1 Ko (1024 octets). Adresse virtuelle = 2500.
   page   = 2500 / 1024 = 2        (3e page)
   offset = 2500 % 1024 = 452
 Si la table dit : page 2 → cadre 7, alors
   adresse physique = 7 * 1024 + 452 = 7620
\`\`\`

> 🧠 L'**offset ne change pas** entre virtuel et physique : seul le **numéro** de page devient un **numéro de cadre**.

---

## 3. Mémoire virtuelle & swap 💽

La **mémoire virtuelle** permet d'exécuter un programme **plus gros que la RAM** : on ne garde en RAM que les pages **réellement utilisées**, les autres restent sur le **disque** (zone de **swap**).

- Une page peut être **présente** (en RAM) ou **absente** (sur disque).
- Un bit **présent/absent** dans la table des pages l'indique.

### Le défaut de page (page fault) ⚠️

Quand le programme accède à une page **absente** de la RAM :
\`\`\`
 1. La MMU lève un DÉFAUT DE PAGE (page fault) → interruption vers le noyau.
 2. Le noyau trouve la page sur le disque (swap).
 3. Il choisit un cadre libre (ou en libère un : algo de remplacement).
 4. Il charge la page depuis le disque dans ce cadre.
 5. Il met à jour la table des pages, puis relance l'instruction.
\`\`\`

Un défaut de page est **lent** (accès disque). **Trop** de défauts de page = **thrashing** (le système passe son temps à swapper au lieu de calculer). Algos de **remplacement** de page : **FIFO**, **LRU** (*Least Recently Used*, on vire la page la moins récemment utilisée), **optimal** (théorique).

---

## 4. Le TLB : le cache de traduction 🚀

Consulter la table des pages **à chaque** accès mémoire serait lent (la table est elle-même en RAM). Le **TLB** (*Translation Lookaside Buffer*) est un **petit cache matériel** qui garde les traductions **page → cadre** récentes.

- **TLB hit** : traduction trouvée dans le cache → **ultra rapide**.
- **TLB miss** : on consulte la table des pages, puis on met le résultat dans le TLB.

Grâce à la **localité** (on réutilise souvent les mêmes pages), le TLB atteint des taux de succès très élevés.

---

## 5. Segmentation (en bref) 🧩

La **segmentation** découpe la mémoire selon la **logique du programme** : un segment **code**, un segment **données**, un segment **pile**… Une adresse = **[numéro de segment | déplacement]**. Chaque segment a une **base** et une **limite** (protection : dépasser la limite → erreur).

- **Pagination** : taille **fixe**, pas de fragmentation externe, transparent pour le programme.
- **Segmentation** : taille **variable**, colle à la structure logique, mais souffre de fragmentation externe.

Les systèmes modernes combinent souvent les deux (**segmentation paginée**), mais Linux/x86-64 s'appuie essentiellement sur la **pagination**.

---

## 🧠 Ce qu'il faut retenir

- **Adresse virtuelle** (par processus, dès 0) → **MMU** → **adresse physique** ; d'où l'**isolation** des processus.
- **Pagination** : pages virtuelles ↔ cadres physiques de **taille fixe** ; la **table des pages** fait page→cadre.
- Traduction : **page = adr / P**, **offset = adr mod P** ; l'**offset est conservé**, seul le numéro change.
- **Mémoire virtuelle + swap** : exécuter plus gros que la RAM ; page absente → **défaut de page** (lent) ; trop de défauts → **thrashing**. Remplacement : FIFO, **LRU**.
- **TLB** : cache matériel des traductions récentes (hit = rapide, miss = consulter la table).
- **Segmentation** : découpage **logique** (code/données/pile), taille variable ; les modernes privilégient la **pagination**.

## ⚠️ Erreurs fréquentes des débutants

**1. Confondre adresse logique et physique.** Le programme ne voit **que** du virtuel ; la MMU traduit.

**2. Se tromper dans page vs offset.** \`page = adresse / taillepage\`, \`offset = adresse mod taillepage\`. L'**offset ne change pas** en physique.

**3. Croire que tout le programme est en RAM.** Avec la mémoire virtuelle, seules les pages **utilisées** y sont ; le reste est en **swap**.

**4. Sous-estimer le coût d'un défaut de page.** C'est un **accès disque** : des milliers de fois plus lent qu'un accès RAM. Le **thrashing** peut figer une machine.

**5. Oublier le TLB.** Sans lui, chaque accès mémoire ferait une lecture de table supplémentaire. Le TLB rend la pagination viable.`,
    badge: {
      id: "badge-address-space",
      name: "Address Space",
      icon: "MemoryStick",
      description: "Traduit des adresses (pagination), comprend mémoire virtuelle, défauts de page, TLB et segmentation.",
    },
    challenges: [
      {
        id: "se-mem-logique",
        title: "Virtuel vs physique",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎭 Qui traduit ?

Quel composant traduit une **adresse virtuelle** (vue par le programme) en **adresse physique** (dans la RAM) ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Un composant matériel dédié à la mémoire : Memory Management Unit.", cost: 10 },
          { text: "📖 Correction : la MMU, à l'aide de la table des pages.", cost: 30 },
        ],
        options: [
          "La MMU (Memory Management Unit), à l'aide de la table des pages",
          "Le disque dur",
          "Le compilateur, au moment de la compilation",
          "L'utilisateur, manuellement",
        ],
        answer: 0,
        explanation: `La **MMU** est un composant **matériel** qui traduit **à la volée** chaque adresse virtuelle en adresse physique, en consultant la **table des pages** (gérée par le noyau, une par processus). C'est ce mécanisme qui donne à chaque processus l'**illusion** de posséder toute la mémoire, et qui les **isole** les uns des autres.`,
        tags: ["memoire", "mmu", "virtuel-physique"],
      },
      {
        id: "se-mem-page-offset",
        title: "Numéro de page",
        order: 2,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔢 Découper l'adresse

Les pages font **1024 octets** (1 Ko). Une adresse virtuelle vaut **3200**.

Quel est le **numéro de page** (division entière) ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "page = adresse / taille_page (division entière).", cost: 20 },
          { text: "📖 Correction : 3200 / 1024 = 3 (reste 128).", cost: 50 },
        ],
        answer: 3,
        explanation: `**numéro de page** = adresse **/** taille_page = 3200 / 1024 = **3** (division entière). Le **déplacement** serait 3200 mod 1024 = **128**. L'adresse 3200 se trouve donc dans la **page 3**, à 128 octets du début de la page.`,
        tags: ["memoire", "pagination", "calcul"],
      },
      {
        id: "se-mem-traduction",
        title: "Traduire en adresse physique",
        order: 3,
        difficulty: "hard",
        type: "numeric",
        prompt: `## 🧮 Page → cadre

Pages de **1024 octets**. Adresse virtuelle = **3200** (donc page 3, offset 128). La **table des pages** indique : **page 3 → cadre 5**.

Quelle est l'**adresse physique** ?`,
        points: 300,
        timeLimitSec: 480,
        hints: [
          { text: "adresse physique = numéro_cadre * taille_page + offset.", cost: 30 },
          { text: "📖 Correction : 5 * 1024 + 128 = 5248.", cost: 70 },
        ],
        answer: 5248,
        explanation: `**adresse physique** = numéro_de_cadre × taille_page + offset = 5 × 1024 + 128 = **5248**. On remplace le **numéro de page** (3) par le **numéro de cadre** (5) donné par la table, et on **conserve l'offset** (128). C'est tout le principe : seul le numéro change, le déplacement dans la page reste identique.`,
        tags: ["memoire", "pagination", "traduction"],
      },
      {
        id: "se-mem-fragmentation",
        title: "L'atout de la pagination",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📄 Pourquoi paginer ?

Quel problème la **pagination** élimine-t-elle, comparée à une allocation en blocs contigus ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Avec des cadres de taille fixe, plus besoin d'un grand espace CONTIGU.", cost: 20 },
          { text: "📖 Correction : la fragmentation externe (une page va dans n'importe quel cadre libre).", cost: 50 },
        ],
        options: [
          "La fragmentation externe : une page tient dans n'importe quel cadre libre (pas besoin d'espace contigu)",
          "Les défauts de page (elle les supprime totalement)",
          "Le besoin d'un processeur",
          "L'existence des adresses virtuelles",
        ],
        answer: 0,
        explanation: `Comme toutes les pages/cadres ont la **même taille fixe**, une page peut aller dans **n'importe quel** cadre libre : on n'a plus besoin d'un grand bloc **contigu** en RAM → la **fragmentation externe** disparaît. (Il reste une petite **fragmentation interne** : la dernière page d'un processus est rarement pleine.) La pagination **ne supprime pas** les défauts de page — elle les rend possibles via la mémoire virtuelle.`,
        tags: ["memoire", "pagination", "fragmentation"],
      },
      {
        id: "se-mem-pagefault",
        title: "Le défaut de page",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚠️ Page absente

Le programme accède à une page qui **n'est pas en RAM** (elle est sur le disque, en swap). Que se passe-t-il ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "La MMU lève une interruption ; le noyau va CHERCHER la page.", cost: 20 },
          { text: "📖 Correction : défaut de page → le noyau charge la page du disque dans un cadre, puis relance l'instruction.", cost: 50 },
        ],
        options: [
          "Un défaut de page : le noyau charge la page depuis le disque dans un cadre, met à jour la table, puis relance l'instruction",
          "Le programme plante immédiatement et définitivement",
          "La RAM double automatiquement de taille",
          "La page est ignorée et l'accès renvoie 0",
        ],
        answer: 0,
        explanation: `L'accès à une page **absente** déclenche un **défaut de page** (*page fault*) : la MMU interrompt, le noyau **localise** la page sur le disque (swap), choisit/libère un **cadre** (algo de remplacement : FIFO, **LRU**…), **charge** la page, **met à jour** la table, puis **relance** l'instruction fautive. C'est **lent** (accès disque). Trop de défauts = **thrashing**.`,
        tags: ["memoire", "page-fault", "swap"],
      },
      {
        id: "se-mem-lru",
        title: "Remplacement de page LRU",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ♻️ Quelle page virer ?

La RAM est pleine et il faut charger une nouvelle page. L'algorithme **LRU** choisit de retirer **quelle** page ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "LRU = Least Recently Used.", cost: 20 },
          { text: "📖 Correction : la page la moins récemment utilisée.", cost: 50 },
        ],
        options: [
          "La page la moins récemment utilisée (Least Recently Used)",
          "La page la plus récemment utilisée",
          "Une page au hasard, toujours",
          "La première page du programme, toujours",
        ],
        answer: 0,
        explanation: `**LRU** (*Least Recently Used*) retire la page **la moins récemment utilisée**, en pariant sur la **localité temporelle** : ce qu'on n'a pas touché depuis longtemps a peu de chances de resservir bientôt. C'est un bon compromis. **FIFO** (la plus ancienne chargée) est plus simple mais moins efficace ; l'algo **optimal** (virer celle qui resservira le plus tard) est théorique (on ne connaît pas le futur).`,
        tags: ["memoire", "lru", "remplacement"],
      },
      {
        id: "se-mem-tlb",
        title: "À quoi sert le TLB ?",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚀 TLB

Quel est le rôle du **TLB** (*Translation Lookaside Buffer*) ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "C'est un petit cache matériel de TRADUCTIONS récentes.", cost: 20 },
          { text: "📖 Correction : cacher les traductions page→cadre récentes pour éviter de relire la table des pages.", cost: 50 },
        ],
        options: [
          "C'est un cache matériel des traductions page→cadre récentes, pour éviter de consulter la table des pages à chaque accès",
          "C'est la zone de swap sur le disque",
          "C'est le compteur de défauts de page",
          "C'est un algorithme de remplacement de page",
        ],
        answer: 0,
        explanation: `Le **TLB** est un **petit cache matériel** qui mémorise les **traductions** page→cadre les plus récentes. Sans lui, chaque accès mémoire nécessiterait une **lecture supplémentaire** de la table des pages (elle-même en RAM). Un **TLB hit** rend la traduction quasi instantanée ; un **TLB miss** consulte la table puis met le résultat en cache. La **localité** rend le TLB très efficace.`,
        tags: ["memoire", "tlb", "cache"],
      },
      {
        id: "se-mem-seg",
        title: "Pagination vs segmentation",
        order: 8,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧩 Deux découpages

Quelle est la différence essentielle entre **pagination** et **segmentation** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "L'une découpe en morceaux de taille FIXE, l'autre selon la LOGIQUE du programme (taille variable).", cost: 20 },
          { text: "📖 Correction : pages = taille fixe ; segments = taille variable, selon la structure logique (code/données/pile).", cost: 50 },
        ],
        options: [
          "La pagination découpe en blocs de taille fixe ; la segmentation en segments de taille variable selon la logique (code, données, pile)",
          "La pagination est logicielle, la segmentation est matérielle",
          "La segmentation supprime le besoin de RAM",
          "Ce sont deux mots pour la même chose",
        ],
        answer: 0,
        explanation: `**Pagination** : découpage en **pages/cadres de taille fixe** (transparent pour le programme, pas de fragmentation externe). **Segmentation** : découpage en **segments de taille variable** qui collent à la **structure logique** (segment code, données, pile), chacun avec une **base** et une **limite** (protection). Les systèmes modernes (Linux/x86-64) reposent surtout sur la **pagination**.`,
        tags: ["memoire", "segmentation", "pagination"],
      },
    ],
  },
];
