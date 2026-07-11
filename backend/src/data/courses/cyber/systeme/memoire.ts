import type { CourseSeed } from "../../../../types";

/** Cyber · Système — Module 2 : protection mémoire et exploitation (ASLR, DEP, canaries, ROP). */
export const memoire: CourseSeed[] = [
  {
    slug: "cys-memoire",
    title: "Protection mémoire et exploitation",
    checkpoint: "cyber-systeme",
    codename: "Memory Guard",
    domain: "Système — Protection mémoire",
    theme: "grid",
    icon: "MemoryStick",
    accent: "#E8A87C",
    order: 2,
    difficulty: "insane",
    summary:
      "La bataille de la mémoire : le débordement de tampon comme faille fondatrice, puis les protections modernes — stack canaries (intégrité de la pile), W^X/DEP (mémoire non exécutable), ASLR (randomisation des adresses) — et la parade des attaquants : le ROP (Return-Oriented Programming) par chaînage de gadgets.",
    objectives: [
      "Comprendre le débordement de tampon sur la pile et l'écrasement de l'adresse de retour",
      "Expliquer le rôle des stack canaries contre l'écrasement de la pile",
      "Décrire W^X / DEP et pourquoi il bloque l'exécution de shellcode injecté",
      "Comprendre l'ASLR et ce qu'il randomise",
      "Expliquer le ROP : gadgets, chaînage et contournement de DEP",
    ],
    resources: [
      {
        label: "OWASP — Buffer Overflow & Memory Safety",
        url: "https://owasp.org/",
        kind: "link",
        note: "Ressources sur les vulnérabilités mémoire (débordements) et les protections associées.",
      },
      {
        label: "MITRE CWE-121 / CWE-787 — Stack Overflow & Out-of-bounds Write",
        url: "https://cwe.mitre.org/data/definitions/787.html",
        kind: "link",
        note: "Catalogue des faiblesses d'écriture hors limites, à la racine des exploitations mémoire.",
      },
    ],
    lesson: `# 🧠 Protection mémoire et exploitation — Memory Guard

Les langages **C/C++** laissent le programmeur gérer la mémoire « à la main » — et donc **se tromper**. Une seule erreur (écrire au-delà d'un tampon) peut donner à un attaquant le **contrôle du flux d'exécution**. Ce module raconte le **duel** entre les techniques d'exploitation mémoire et les protections successives des systèmes. 🏎️

---

## 1. La faille fondatrice : le débordement de tampon 💥

Un **débordement de tampon** (*buffer overflow*) survient quand un programme **écrit plus de données** qu'un tampon ne peut en contenir → les octets **débordent** sur la mémoire adjacente. Sur la **pile** (*stack*), c'est particulièrement dangereux.

### Rappel : la pile d'appel

Quand une fonction est appelée, la pile stocke ses **variables locales**, la **sauvegarde de registres** et surtout l'**adresse de retour** (*return address*) — l'adresse où l'exécution reprendra **après** la fonction.

\`\`\`
   Pile (croît vers le bas)          Un buffer[64] qu'on remplit vers le HAUT :
   ┌───────────────────────┐
   │  adresse de retour      │ ◄─── CIBLE : l'écraser détourne l'exécution
   ├───────────────────────┤
   │  sauvegarde EBP/RBP     │
   ├───────────────────────┤
   │  buffer[64]  (locale)   │ ◄─── on écrit ici… et si on dépasse 64 octets ?
   └───────────────────────┘
        │ overflow ▲ les octets en trop remontent vers l'adresse de retour
\`\`\`

Si l'attaquant fournit une entrée **plus longue** que \`buffer\`, il peut **écraser l'adresse de retour** et la remplacer par une adresse de **son choix**. À la fin de la fonction, le processeur « saute » là → **détournement du flux d'exécution**.

### L'exploitation historique : injecter du shellcode

Autrefois, l'attaquant plaçait son **code malveillant** (*shellcode*) **dans le tampon lui-même** (sur la pile) et faisait pointer l'adresse de retour **vers ce code** → le processeur **exécutait la pile**. Les protections modernes ont été conçues pour **casser** exactement ce scénario, une couche à la fois.

---

## 2. Stack canaries : détecter l'écrasement de la pile 🐤

Un **canary** (« canari », en référence aux canaris des mines) est une **valeur secrète et aléatoire** placée par le compilateur **juste avant l'adresse de retour**, à l'entrée de la fonction.

\`\`\`
   │  adresse de retour  │
   ├────────────────────┤
   │  CANARY (aléatoire) │ ◄─── vérifié avant le "return"
   ├────────────────────┤
   │  buffer[64]         │
\`\`\`

Pour écraser l'adresse de retour par débordement **linéaire**, l'attaquant doit **passer par-dessus** le canary → il l'**écrase** aussi. **Avant de rendre la main** (\`return\`), la fonction **vérifie** que le canary est intact : s'il a changé, le programme **s'arrête immédiatement** (abort) → l'exploitation échoue.

- **Contournements** : **fuite d'information** (lire le canary via une autre faille), débordements **non linéaires** (écrire directement à une adresse sans toucher le canary), ou **fork** (le canary reste identique après fork → brute-force octet par octet).

> 🧠 Le canary protège **l'intégrité de la pile** : il ne bloque pas le débordement, il **le détecte** avant qu'il ne serve à détourner l'exécution.

---

## 3. W^X / DEP : rendre la mémoire non exécutable 🚫

**W^X** (*Write XOR eXecute*) — sous Windows **DEP** (*Data Execution Prevention*), matériellement le bit **NX** (*No-eXecute*) — impose qu'une zone mémoire soit **soit inscriptible, soit exécutable, mais jamais les deux**.

Conséquence directe : la **pile** et le **tas**, qui sont **inscriptibles** (on y met des données), deviennent **non exécutables**. Le **shellcode injecté** dans le tampon **ne peut plus s'exécuter** → l'attaque historique « injecter du code sur la pile et y sauter » **échoue** (le processeur refuse d'exécuter cette zone → crash).

\`\`\`
   Sans W^X :  pile = inscriptible ET exécutable  →  shellcode sur la pile s'exécute ✅ (pour l'attaquant)
   Avec W^X :  pile = inscriptible, NON exécutable →  saut vers la pile = crash ❌
\`\`\`

> 🧭 W^X ne corrige pas le débordement : il **enlève à l'attaquant la possibilité d'exécuter son propre code injecté**. C'est ce qui a poussé les attaquants à **réutiliser le code déjà présent** (→ le ROP, §5).

---

## 4. ASLR : randomiser les adresses 🎲

Pour détourner l'exécution, l'attaquant doit **connaître des adresses** (où sauter, où se trouve une fonction utile). L'**ASLR** (*Address Space Layout Randomization*) **place aléatoirement**, à chaque exécution, la position des zones mémoire : la **pile**, le **tas**, les **bibliothèques** (libc), et le code de l'exécutable (si compilé en **PIE**, *Position-Independent Executable*).

Résultat : l'attaquant **ne sait plus** où se trouvent les éléments qu'il veut cibler → une adresse « en dur » dans son exploit tombera **au mauvais endroit** (crash au lieu d'exécution).

- **Efficacité** : très forte en **64 bits** (grande entropie). Plus faible en **32 bits** (entropie limitée → brute-force parfois possible).
- **Contournements** : **fuite d'adresse** (*info leak* via une autre vulnérabilité) qui **révèle** une adresse réelle et permet de **recalculer** les autres ; absence de **PIE** (le binaire lui-même reste à adresse fixe).

> 🧠 ASLR attaque le **savoir** de l'attaquant (les adresses), pendant que W^X attaque son **pouvoir** (exécuter du code injecté). Combinés, ils rendent l'exploitation bien plus difficile — mais pas impossible.

---

## 5. ROP : réutiliser le code existant 🧩

Puisque **W^X** empêche d'exécuter du **code injecté**, les attaquants ont inventé le **ROP** (*Return-Oriented Programming*) : au lieu d'apporter leur code, ils **réutilisent des morceaux de code déjà présents** (dans le binaire ou les bibliothèques, qui sont **exécutables** et **légitimes**).

### Les gadgets

Un **gadget** est une **petite séquence d'instructions existantes** qui se termine par une instruction **\`ret\`** (retour). Exemples : \`pop rax ; ret\` (charger une valeur dans un registre), \`mov [rbx], rax ; ret\` (écrire en mémoire), etc.

### Le chaînage

Le ROP exploite le **débordement** pour écraser la pile avec une **suite d'adresses de gadgets** (une **chaîne ROP**). Le principe du \`ret\` — « dépiler une adresse et y sauter » — est détourné : chaque gadget se termine par \`ret\`, qui **passe au gadget suivant** de la chaîne. En **enchaînant** les bons gadgets, l'attaquant compose n'importe quel calcul — typiquement, préparer les registres et **appeler une fonction système** (ex. \`execve\`, ou \`mprotect\`/\`VirtualProtect\` pour **rendre la pile exécutable** et revenir au shellcode).

\`\`\`
   Pile écrasée par une chaîne ROP :
   ┌─────────────────────┐
   │ @gadget 1 : pop rdi;ret │ ──► charge un argument
   │ valeur pour rdi         │
   │ @gadget 2 : pop rsi;ret │ ──► charge un autre argument
   │ valeur pour rsi         │
   │ @adresse de system()    │ ──► appel de la fonction
   └─────────────────────┘
        chaque "ret" enchaîne automatiquement le gadget suivant
\`\`\`

Le ROP **contourne W^X** car il n'exécute **que du code déjà marqué exécutable** (le code légitime), simplement **détourné**. Variantes : **ret2libc** (sauter directement dans une fonction de la libc comme \`system\`), **JOP** (*Jump-Oriented Programming*).

> ⚠️ Mais le ROP a besoin de **connaître les adresses** des gadgets → c'est là qu'**ASLR** redevient crucial : sans **fuite d'adresse**, l'attaquant ne sait pas où sont les gadgets. D'où la course : **info leak** (contre ASLR) **+** **chaîne ROP** (contre W^X) sont souvent **combinés** dans une exploitation moderne.

### Défenses de nouvelle génération

- **CFI** (*Control-Flow Integrity*) : vérifier que les sauts/retours suivent des **cibles légitimes** → casse le chaînage ROP.
- **Shadow stack / CET** (*Control-flow Enforcement Technology*, matériel) : une **copie protégée** des adresses de retour, comparée à chaque \`ret\` → détecte l'écrasement.
- **Fortification du compilateur** (\`_FORTIFY_SOURCE\`), langages **mémoire-sûrs** (Rust) qui **éliminent** la classe de bugs à la source.

---

## 6. La course en résumé 🏁

\`\`\`
   Attaque : débordement → écraser l'adresse de retour → exécuter du code
      ├─ Défense : STACK CANARY   → détecte l'écrasement de la pile
      ├─ Défense : W^X / DEP      → interdit d'exécuter le code injecté
      │     └─ Riposte : ROP      → réutilise du code existant (gadgets) → contourne W^X
      ├─ Défense : ASLR           → cache les adresses (gadgets/fonctions)
      │     └─ Riposte : INFO LEAK → révèle une adresse → recalcule le reste
      └─ Défense : CFI / Shadow stack (CET) → casse le chaînage ROP
\`\`\`

> 🧠 Aucune protection n'est suffisante **seule** : canary + W^X + ASLR + CFI forment une **défense en profondeur** au niveau du système/compilateur. La vraie solution de fond reste d'**éviter la classe de bugs** (validation, langages mémoire-sûrs).

---

## 🧠 À retenir

- **Débordement de tampon** (surtout sur la **pile**) → écrasement de l'**adresse de retour** → **détournement du flux d'exécution**. Exploitation historique : injecter du **shellcode** sur la pile et y sauter.
- **Stack canary** : valeur **aléatoire** placée avant l'adresse de retour, **vérifiée avant le \`return\`** → **détecte** l'écrasement (le programme s'arrête). Contourné par **fuite** du canary.
- **W^X / DEP (NX)** : une zone est **inscriptible XOR exécutable** → la **pile/tas non exécutables** → le **shellcode injecté ne s'exécute plus**. Retire le **pouvoir** d'exécuter du code injecté.
- **ASLR** : **randomise** les adresses (pile, tas, libc, code PIE) → l'attaquant **ne connaît plus** les adresses. Retire le **savoir**. Fort en **64 bits**, contourné par **info leak** ou absence de **PIE**.
- **ROP** (*Return-Oriented Programming*) : **réutilise du code existant** via des **gadgets** (séquences finissant par \`ret\`), **chaînés** en écrasant la pile d'une suite d'adresses → **contourne W^X** (n'exécute que du code légitime). Souvent **combiné à un info leak** (contre ASLR). Variantes : **ret2libc**, **JOP**.
- **Défenses avancées** : **CFI**, **shadow stack / CET** (protéger les adresses de retour), \`_FORTIFY_SOURCE\`, **langages mémoire-sûrs (Rust)**. La sécurité mémoire est une **défense en profondeur** ; le fond = **supprimer la classe de bugs**.`,
    badge: {
      id: "badge-cys-memory-guard",
      name: "Memory Guard",
      icon: "MemoryStick",
      description: "Maîtrise le débordement de pile, les canaries, W^X/DEP, l'ASLR et le contournement par ROP.",
    },
    challenges: [
      {
        id: "cys-mem-overflow",
        title: "La cible du débordement",
        order: 1,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 💥 Buffer overflow

Lors d'un débordement de tampon **sur la pile**, quel élément l'attaquant cherche-t-il typiquement à **écraser** pour prendre le contrôle de l'exécution ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "L'endroit où le processeur reprendra APRÈS la fonction.", cost: 30 },
          { text: "📖 Correction : l'adresse de retour (return address).", cost: 80 },
        ],
        options: [
          "L'adresse de retour (return address) de la fonction",
          "Le nom du fichier source du programme",
          "La température du processeur",
          "La clé de chiffrement du disque",
        ],
        answer: 0,
        explanation: `Sur la pile se trouve l'**adresse de retour** : là où l'exécution **reprend après** la fonction. En débordant du tampon, l'attaquant **écrase cette adresse** par une adresse de son choix → à la fin de la fonction, le processeur **saute** là où il veut (détournement du flux). C'est la cible fondamentale de l'exploitation de pile.`,
        tags: ["buffer-overflow", "pile", "adresse-retour"],
      },
      {
        id: "cys-mem-canary",
        title: "Le rôle du canary",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🐤 Stack canary

Comment un **stack canary** protège-t-il contre l'écrasement de l'adresse de retour ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Une valeur secrète placée avant l'adresse de retour, contrôlée juste avant le return.", cost: 30 },
          { text: "📖 Correction : valeur aléatoire vérifiée avant le return ; si modifiée → arrêt du programme.", cost: 80 },
        ],
        options: [
          "Une valeur aléatoire est placée avant l'adresse de retour et vérifiée avant le return : si elle a changé (débordement), le programme s'arrête",
          "Il chiffre toute la pile en permanence",
          "Il double la taille du tampon automatiquement",
          "Il empêche physiquement toute écriture en mémoire",
        ],
        answer: 0,
        explanation: `Le **canary** est une **valeur secrète aléatoire** placée **avant l'adresse de retour**. Un débordement **linéaire** qui vise l'adresse de retour doit **écraser le canary** au passage. Avant le \`return\`, la fonction **vérifie** le canary : s'il a changé, elle **abandonne** (abort) → l'exploitation échoue. Il **détecte** l'écrasement (il ne l'empêche pas). Contourné par **fuite** du canary.`,
        tags: ["canary", "integrite-pile", "detection"],
      },
      {
        id: "cys-mem-wx",
        title: "W^X / DEP",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🚫 Mémoire non exécutable

Quelle attaque historique le mécanisme **W^X / DEP (NX)** bloque-t-il directement ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Il rend la pile inscriptible mais NON exécutable.", cost: 30 },
          { text: "📖 Correction : l'exécution de shellcode injecté sur la pile/le tas.", cost: 80 },
        ],
        options: [
          "L'exécution d'un shellcode injecté sur la pile ou le tas (zones inscriptibles rendues non exécutables)",
          "La lecture des variables locales",
          "L'appel de fonctions légitimes du programme",
          "La randomisation des adresses mémoire",
        ],
        answer: 0,
        explanation: `**W^X / DEP** impose qu'une zone soit **inscriptible XOR exécutable**. La **pile** et le **tas** (inscriptibles) deviennent **non exécutables** → un **shellcode injecté** dedans **ne peut plus s'exécuter** (le processeur refuse → crash). Cela **retire le pouvoir** d'exécuter du code injecté, poussant les attaquants vers le **ROP** (réutilisation de code existant).`,
        tags: ["w^x", "dep", "nx"],
      },
      {
        id: "cys-mem-aslr",
        title: "Ce que randomise l'ASLR",
        order: 4,
        difficulty: "medium",
        type: "multi",
        prompt: `## 🎲 ASLR

Que **randomise** l'ASLR à chaque exécution pour empêcher l'attaquant d'utiliser des adresses « en dur » ? (Coche tout ce qui s'applique.)`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "La position de la pile",
          "La position du tas",
          "L'emplacement des bibliothèques (libc) et du code PIE",
          "Le contenu des fichiers sur le disque dur",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "L'ASLR agit sur la disposition des zones MÉMOIRE, pas sur le disque.", cost: 20 },
          { text: "📖 Correction : pile + tas + bibliothèques/code PIE.", cost: 50 },
        ],
        explanation: `L'**ASLR** place **aléatoirement** en mémoire la **pile**, le **tas**, les **bibliothèques** (libc) et le **code de l'exécutable** (s'il est **PIE**). L'attaquant **ne connaît plus** les adresses de ses cibles (gadgets, fonctions). Il n'agit **pas** sur le contenu du **disque**. Très efficace en **64 bits** ; contourné par une **fuite d'adresse**.`,
        tags: ["aslr", "randomisation", "pie"],
      },
      {
        id: "cys-mem-rop",
        title: "Le principe du ROP",
        order: 5,
        difficulty: "insane",
        type: "mcq",
        prompt: `## 🧩 Return-Oriented Programming

Comment le **ROP** parvient-il à contourner **W^X / DEP** ?`,
        points: 550,
        timeLimitSec: 480,
        hints: [
          { text: "Il n'injecte pas de code : il réutilise des morceaux de code déjà exécutables (gadgets).", cost: 40 },
          { text: "📖 Correction : chaîner des gadgets (séquences finissant par ret) du code légitime existant.", cost: 120 },
        ],
        options: [
          "Il n'injecte aucun code : il enchaîne des « gadgets » (petites séquences finissant par ret) déjà présents dans le code exécutable légitime",
          "Il désactive physiquement le bit NX du processeur à distance",
          "Il chiffre la pile pour la rendre exécutable",
          "Il augmente la taille du tampon jusqu'à saturer la RAM",
        ],
        answer: 0,
        explanation: `Le **ROP** contourne **W^X** en **ne fournissant aucun code** : il **réutilise** des **gadgets** — de courtes séquences d'instructions **existantes** se terminant par \`ret\` — présents dans le binaire/les bibliothèques (zones **déjà exécutables**). En écrasant la pile d'une **suite d'adresses de gadgets**, chaque \`ret\` **enchaîne** le gadget suivant → l'attaquant compose son calcul (souvent : appeler \`system\`/\`mprotect\`). Comme il n'exécute que du **code légitime**, W^X est **inopérant**. Mais il faut **connaître les adresses** → souvent couplé à un **info leak** contre l'ASLR.`,
        tags: ["rop", "gadgets", "contournement"],
      },
      {
        id: "cys-mem-leak",
        title: "Le nerf de la guerre contre l'ASLR",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## 🔎 Contourner l'ASLR

De quoi l'attaquant a-t-il besoin (souvent obtenu via une seconde vulnérabilité) pour **contourner l'ASLR** en révélant une adresse réelle, à partir de laquelle recalculer les autres ?

*(Réponds par le terme, en français ou en anglais — 2 mots.)*`,
        points: 200,
        timeLimitSec: 240,
        hints: [
          { text: "En anglais : information leak / info leak. En français : fuite d'information/d'adresse.", cost: 20 },
          { text: "📖 Correction : une fuite d'information (info leak / fuite d'adresse).", cost: 50 },
        ],
        answer: "info leak",
        accept: ["info leak", "information leak", "fuite d'information", "fuite d'adresse", "fuite d information", "fuite memoire", "fuite mémoire", "infoleak", "leak"],
        caseSensitive: false,
        explanation: `Pour vaincre l'**ASLR**, l'attaquant a besoin d'une **fuite d'information** (*info leak*) — souvent via une **autre vulnérabilité** — qui **révèle une adresse réelle** en mémoire. À partir de cette adresse connue, il **recalcule** les positions des gadgets/fonctions (les décalages internes étant fixes). C'est pourquoi **info leak + ROP** sont typiquement **combinés** dans une exploitation moderne.`,
        tags: ["info-leak", "aslr", "contournement"],
      },
    ],
  },
];
