import type { CourseSeed } from "../../../types";

/**
 * Atelier TP en C — du « Hello World » aux structures dynamiques et à la
 * simulation d'allocation mémoire (First/Best/Worst Fit). Défis de type
 * `code` en language "c" : éditeur + bouton « Compiler & Exécuter » (Piston)
 * avec sortie attendue déterministe (pas de scanf → exécution reproductible).
 */
export const tpCAtelier: CourseSeed[] = [
  {
    slug: "tp-c-atelier",
    title: "Atelier TP en C — du Hello World à l'allocation mémoire",
    checkpoint: "algorithmique",
    codename: "C Pit Lane",
    domain: "Travaux pratiques L1/L2",
    theme: "circuit",
    icon: "Cpu",
    accent: "#5FB3C6",
    order: 9,
    difficulty: "medium",
    summary:
      "Passe du pseudo-code au vrai code : installe ton atelier, compile ton premier programme, puis traduis progressivement variables, boucles, tableaux, fonctions et pointeurs en C — jusqu'à simuler l'allocation mémoire First/Best/Worst Fit. Éditeur avec « Compiler & Exécuter » intégré.",
    objectives: [
      "Installer et configurer Code::Blocks + MinGW (Windows/Mac/Linux)",
      "Compiler et exécuter un programme C, et lire les erreurs de compilation",
      "Traduire variables, conditions et boucles du pseudo-code vers le C",
      "Manipuler tableaux et fonctions en C",
      "Comprendre les pointeurs, malloc et free (et éviter les fuites/segfaults)",
      "Simuler l'allocation mémoire par partitions (First/Best/Worst Fit)",
    ],
    lesson: `# 🏁 Atelier TP en C — le C Pit Lane

Le pseudo-code, c'est le **plan de course**. Le **C**, c'est la **vraie voiture** qui roule sur une vraie machine. Ce module te fait passer de l'un à l'autre, **pas à pas**, avec un éditeur où tu peux **compiler et exécuter** ton code directement. 🔧

> 💡 Dans les défis « code » de ce module, écris ton programme puis clique sur **« Compiler & Exécuter »** : la sortie s'affiche, et elle est comparée à la sortie attendue. Comme le bouton n'envoie pas de saisie clavier, on **fixe les valeurs dans le code** (pas de \`scanf\`) pour que le résultat soit toujours reproductible.

---

## TP 0 — Installer ton atelier (Code::Blocks + MinGW) 🛠️

**Code::Blocks** est un environnement de développement (IDE) gratuit ; **MinGW** est le compilateur C (\`gcc\`) sous Windows.

### Windows
1. Va sur **codeblocks.org** → *Downloads* → *Download the binary release*.
2. Choisis la version **\`codeblocks-XX.XXmingw-setup.exe\`** — ⚠️ celle avec **« mingw »** dans le nom (elle inclut le compilateur !).
3. Installe (Next → Next → Install).
4. Au **premier lancement**, Code::Blocks détecte le compilateur GNU GCC : sélectionne-le et clique *Set as default*.

### macOS / Linux
- **macOS** : installe les *Command Line Tools* (\`xcode-select --install\`) qui fournissent \`clang\`/\`gcc\`, puis Code::Blocks (ou VS Code).
- **Linux (Debian/Ubuntu)** : \`sudo apt install build-essential codeblocks\` — \`build-essential\` apporte \`gcc\`.

### Créer un projet Console
*File → New → Project → Console application → C →* nomme le projet *→ Finish*. Le fichier \`main.c\` est prêt. Le bouton **Build and run** (▶, ou **F9**) compile **et** exécute.

---

## TP 1 — Hello World, ligne par ligne 👋

\`\`\`c
#include <stdio.h>   // 1. bibliothèque d'entrées/sorties (printf, scanf)

int main(void) {     // 2. point d'entrée : l'exécution commence ici
    printf("Bonjour CyberAce!\\n");  // 3. affiche le texte ; \\n = retour ligne
    return 0;        // 4. 0 = « le programme s'est bien terminé »
}
\`\`\`

- \`#include <stdio.h>\` : sans elle, \`printf\` est **inconnu** du compilateur.
- \`int main(void)\` : **toute** exécution C démarre par \`main\`. Elle retourne un \`int\`.
- \`printf("…")\` : affiche à l'écran. \`\\n\` provoque un **saut de ligne**.
- \`return 0\` : code de sortie ; **0 = succès**.

**🔧 Comment tester** : clique **Compiler & Exécuter**. Tu dois voir \`Bonjour CyberAce!\`.

**🐛 Erreurs fréquentes** :
- \`undefined reference to printf\` / \`implicit declaration\` → tu as oublié \`#include <stdio.h>\`.
- \`expected ';' before …\` → un **point-virgule** manquant à la ligne **précédente**.
- \`error: expected declaration or statement at end of input\` → une **accolade \`}\`** manquante.

---

## TP 2 — Variables et affichage formaté 🔢

En C, chaque variable a un **type** et se **déclare** avant usage. \`printf\` utilise des **spécificateurs de format** : \`%d\` (entier), \`%f\` (réel), \`%c\` (caractère).

\`\`\`c
#include <stdio.h>
int main(void) {
    int a = 1500;
    int b = 2641;
    int somme = a + b;              // affectation (= en C, ← en pseudo-code)
    printf("Somme = %d\\n", somme); // %d remplacé par la valeur de somme
    return 0;
}
\`\`\`

> ⚠️ Le \`=\` du C est l'**affectation** (le \`←\` du pseudo-code). L'**égalité** se teste avec \`==\`. Confondre les deux est **l'erreur n°1** du débutant.

---

## TP 3 — Conditions et boucles 🔁

\`\`\`c
if (x > 0) { ... } else { ... }      // Si … Alors … Sinon
while (cond) { ... }                 // Tantque
for (i = 1; i <= n; i = i + 1) { }   // Pour i ← 1 à n
\`\`\`

La boucle \`for\` condense **initialisation ; condition ; incrément**.

---

## TP 4 — Tableaux et fonctions 📊

\`\`\`c
int T[7] = {3, 21, 6, 13, 68, 4, 29};  // tableau de 7 entiers (indices 0..6 !)
\`\`\`

⚠️ En C, les indices commencent à **0** (pas à 1 comme souvent en pseudo-code) : \`T[0]\` est le 1er élément, \`T[6]\` le dernier.

Une **fonction** se déclare avec son type de retour :

\`\`\`c
int maximum(int t[], int n) {
    int m = t[0];
    for (int i = 1; i < n; i++)
        if (t[i] > m) m = t[i];
    return m;
}
\`\`\`

---

## TP 5 — Pointeurs, malloc et free 🧭

Le pseudo-code \`^\` devient \`*\` en C, et \`@\` devient \`&\` :

\`\`\`c
int a = 10;
int *p = &a;   // p pointe sur a   (pseudo : p ← @a)
printf("%d\\n", *p);  // affiche le contenu pointé = 10  (pseudo : ^p)
*p = 20;       // modifie a via p  → a vaut 20
\`\`\`

**Allocation dynamique** — \`malloc\` (le \`Allouer\`) et \`free\` (le \`Libérer\`) :

\`\`\`c
#include <stdlib.h>            // pour malloc / free
int *t = (int*) malloc(n * sizeof(int));  // un tableau de n entiers
// ... usage ...
free(t);                        // TOUJOURS libérer → sinon fuite mémoire
\`\`\`

**🐛 Erreurs fréquentes** :
- **Segmentation fault** (segfault) : tu déréférences un pointeur \`NULL\` ou hors zone (\`*p\` alors que \`p\` ne pointe nulle part, ou \`t[i]\` hors bornes).
- **Fuite mémoire** : un \`malloc\` sans \`free\` → la mémoire n'est jamais rendue.
- **Double free** : appeler \`free(p)\` deux fois → comportement indéfini.

---

## TP Final — Simuler l'allocation mémoire (First/Best/Worst Fit) 🧩

La mémoire est vue comme une liste de **partitions libres**, chacune de taille donnée. Quand un processus demande \`taille\` octets, on choisit une partition **selon une stratégie** :

| Stratégie | Choix de la partition libre |
|---|---|
| **First Fit** | la **première** assez grande (parcours depuis le début) |
| **Best Fit** | la **plus petite** assez grande (minimise le gaspillage) |
| **Worst Fit** | la **plus grande** assez grande (laisse un grand reste) |

\`\`\`
Partitions libres : [100] [500] [200] [300] [600]
Demande : 212 octets

First Fit → [500]  (1ère ≥ 212)        reste 288
Best Fit  → [300]  (plus petite ≥ 212) reste  88
Worst Fit → [600]  (plus grande ≥ 212) reste 388
\`\`\`

C'est l'objet du **projet TP** : représenter les partitions dans un tableau, écrire une fonction par stratégie qui **retourne l'indice** de la partition choisie (ou −1 si aucune ne convient), puis mettre à jour la taille restante.

---

## 🧠 Ce qu'il faut retenir

- \`#include <stdio.h>\` pour \`printf\`/\`scanf\`, \`#include <stdlib.h>\` pour \`malloc\`/\`free\`.
- \`main\` est le point d'entrée ; \`return 0\` = succès.
- \`=\` affecte, \`==\` teste l'égalité (**ne pas confondre !**).
- Indices de tableau à partir de **0** en C.
- \`*\` = contenu de (\`^\`), \`&\` = adresse de (\`@\`), \`malloc\`/\`free\` = \`Allouer\`/\`Libérer\`.
- **Chaque \`malloc\` doit avoir son \`free\`** ; déréférencer \`NULL\` = **segfault**.
- First/Best/Worst Fit = 3 stratégies de choix d'une partition libre.

## ⚠️ Erreurs fréquentes des débutants

**1. \`=\` au lieu de \`==\` dans un test.**
\`\`\`c
if (x = 5) { ... }   // ❌ AFFECTE 5 à x (toujours vrai !) — bug silencieux
if (x == 5) { ... }  // ✅ teste l'égalité
\`\`\`

**2. Oublier \`#include\`.** Pas de \`<stdio.h>\` → \`printf\` inconnu ; pas de \`<stdlib.h>\` → \`malloc\` inconnu.

**3. Oublier le \`\\n\`.** Sans lui, les affichages se **collent** sur une seule ligne.

**4. Dépasser les bornes d'un tableau.** \`int T[7]\` va de \`T[0]\` à \`T[6]\` ; \`T[7]\` est **hors zone** → comportement indéfini / segfault.

**5. Déréférencer NULL ou ne pas libérer.** \`*p\` quand \`p == NULL\` → **segfault** ; \`malloc\` sans \`free\` → **fuite**.`,
    badge: {
      id: "badge-c-mechanic",
      name: "C Mechanic",
      icon: "Cpu",
      description:
        "A installé son atelier C, compilé et débogué du code, et simulé l'allocation mémoire First/Best/Worst Fit.",
    },
    challenges: [
      {
        id: "tp-c-setup",
        title: "TP 0 — Le bon installeur",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🛠️ Installer Code::Blocks

Tu télécharges Code::Blocks sur Windows pour programmer en C.

**Quel fichier faut-il choisir pour avoir aussi le compilateur (et pouvoir compiler tout de suite) ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Le compilateur GCC sous Windows s'appelle MinGW. Cherche ce mot dans le nom du fichier.", cost: 15 },
          { text: "📖 Correction complète : il faut la version dont le nom contient « mingw » (codeblocks-XX.XXmingw-setup.exe). Sans mingw, tu as l'éditeur mais PAS le compilateur, donc rien ne compile.", cost: 60 },
        ],
        options: [
          "codeblocks-XX.XXmingw-setup.exe (avec « mingw »)",
          "codeblocks-XX.XX-setup.exe (sans « mingw »)",
          "codeblocks-XX.XX-nosetup.zip",
          "N'importe lequel, le compilateur s'installe seul",
        ],
        answer: 0,
        explanation: `Il faut la version **\`codeblocks-XX.XXmingw-setup.exe\`** — celle dont le nom contient **« mingw »**. **MinGW** est le compilateur GCC pour Windows ; il est **inclus** dans cette version.

Si tu prends la version **sans** « mingw », tu obtiens l'éditeur mais **pas de compilateur** → aucun programme ne compilera, et Code::Blocks se plaindra de ne pas trouver \`gcc\`.

Au premier lancement, sélectionne **GNU GCC Compiler** et *Set as default*.`,
        tags: ["tp", "c", "setup"],
      },
      {
        id: "tp-c-hello",
        title: "TP 1 — Hello World",
        order: 2,
        difficulty: "easy",
        type: "code",
        language: "c",
        expectedOutput: "Bonjour CyberAce!",
        prompt: `## 👋 Ton premier programme C

Complète le programme pour qu'il affiche **exactement** :

\`\`\`
Bonjour CyberAce!
\`\`\`

**🔧 Comment tester** : clique « Compiler & Exécuter ». La sortie doit correspondre à l'attendu.

**🐛 Rappel** : n'oublie ni \`#include <stdio.h>\`, ni le \`\\n\`, ni le point-virgule.`,
        points: 100,
        timeLimitSec: 300,
        starter: `#include <stdio.h>

int main(void) {
    // écris ton printf ici
    return 0;
}
`,
        hints: [
          { text: "Utilise printf(\"...\\n\"); avec le texte exact Bonjour CyberAce!", cost: 15 },
          { text: "📖 Correction complète :\n```c\n#include <stdio.h>\nint main(void) {\n    printf(\"Bonjour CyberAce!\\n\");\n    return 0;\n}\n```", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [
            { label: "Inclure la bibliothèque stdio.h", pattern: "#\\s*include\\s*<\\s*stdio\\.h\\s*>", flags: "i" },
            { label: "Afficher le texte exact avec printf", pattern: "printf\\s*\\(\\s*\"Bonjour CyberAce!", flags: "" },
            { label: "Terminer par return 0", pattern: "return\\s+0", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
#include <stdio.h>
int main(void) {
    printf("Bonjour CyberAce!\\n");
    return 0;
}
\`\`\`

Chaque brique compte : \`#include <stdio.h>\` rend \`printf\` disponible, \`main\` est le point d'entrée, \`\\n\` saute une ligne, et \`return 0\` signale la réussite. Bienvenue en C ! 🎉`,
        tags: ["tp", "c", "hello"],
      },
      {
        id: "tp-c-variables",
        title: "TP 2 — Variables et somme",
        order: 3,
        difficulty: "easy",
        type: "code",
        language: "c",
        expectedOutput: "Somme = 4141",
        prompt: `## 🔢 Traduire l'affectation en C

Déclare deux entiers \`a = 1500\` et \`b = 2641\`, calcule leur somme, et affiche **exactement** :

\`\`\`
Somme = 4141
\`\`\`

💡 Utilise le spécificateur \`%d\` pour afficher un entier.`,
        points: 100,
        timeLimitSec: 420,
        starter: `#include <stdio.h>

int main(void) {
    int a = 1500;
    int b = 2641;
    // calcule la somme et affiche-la avec %d
    return 0;
}
`,
        hints: [
          { text: "int somme = a + b; puis printf(\"Somme = %d\\n\", somme);", cost: 15 },
          { text: "%d sera remplacé par la valeur de l'entier passé en 2e argument de printf.", cost: 20 },
          { text: "📖 Correction complète :\n```c\nint somme = a + b;\nprintf(\"Somme = %d\\n\", somme);\n```", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Calcule la somme a + b", pattern: "a\\s*\\+\\s*b", flags: "i" },
            { label: "Affiche avec le format %d", pattern: "printf\\s*\\([\\s\\S]*%d", flags: "i" },
            { label: "Le texte affiché commence par 'Somme = '", pattern: "\"Somme = ", flags: "" },
          ],
        }),
        explanation: `\`\`\`c
#include <stdio.h>
int main(void) {
    int a = 1500;
    int b = 2641;
    int somme = a + b;
    printf("Somme = %d\\n", somme);
    return 0;
}
\`\`\`

\`%d\` est **remplacé** par la valeur de \`somme\` (le 2ᵉ argument de \`printf\`). Le \`=\` ici est l'**affectation** — l'équivalent C du \`←\` du pseudo-code. Résultat : \`Somme = 4141\`.`,
        tags: ["tp", "c", "variables"],
      },
      {
        id: "tp-c-boucle",
        title: "TP 3 — Boucle for : somme 1 à 10",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "c",
        expectedOutput: "Somme 1 a 10 = 55",
        prompt: `## 🔁 La boucle for

À l'aide d'une boucle \`for\`, calcule la somme des entiers de **1 à 10** et affiche **exactement** :

\`\`\`
Somme 1 a 10 = 55
\`\`\``,
        points: 200,
        timeLimitSec: 600,
        starter: `#include <stdio.h>

int main(void) {
    int somme = 0;
    // boucle for de 1 à 10 : somme += i
    printf("Somme 1 a 10 = %d\\n", somme);
    return 0;
}
`,
        hints: [
          { text: "for (int i = 1; i <= 10; i++) somme = somme + i;", cost: 25 },
          { text: "N'oublie pas d'initialiser somme à 0 avant la boucle (déjà fait dans le squelette).", cost: 30 },
          { text: "📖 Correction complète :\n```c\nint somme = 0;\nfor (int i = 1; i <= 10; i++)\n    somme += i;\nprintf(\"Somme 1 a 10 = %d\\n\", somme);\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Utilise une boucle for", pattern: "for\\s*\\(", flags: "i" },
            { label: "La boucle va jusqu'à 10 (i <= 10)", pattern: "<=\\s*10", flags: "i" },
            { label: "Cumule i dans somme", pattern: "somme\\s*(\\+=|=\\s*somme\\s*\\+)", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
int somme = 0;
for (int i = 1; i <= 10; i++)
    somme += i;   // somme = somme + i
printf("Somme 1 a 10 = %d\\n", somme);
\`\`\`

La \`for\` condense **initialisation** (\`i = 1\`), **condition** (\`i <= 10\`) et **incrément** (\`i++\`, équivalent à \`i = i + 1\`). \`somme += i\` est un raccourci de \`somme = somme + i\`. Résultat : 1+2+…+10 = **55**.`,
        tags: ["tp", "c", "boucle"],
      },
      {
        id: "tp-c-tableau-max",
        title: "TP 4 — Tableau : trouver le maximum",
        order: 5,
        difficulty: "medium",
        type: "code",
        language: "c",
        expectedOutput: "Max = 68",
        prompt: `## 📊 Tableaux et parcours

Le tableau \`int T[7] = {3, 21, 6, 13, 68, 4, 29};\` est fourni. Parcours-le pour trouver le **maximum** et affiche **exactement** :

\`\`\`
Max = 68
\`\`\`

⚠️ En C, les indices vont de \`0\` à \`6\`.`,
        points: 200,
        timeLimitSec: 720,
        starter: `#include <stdio.h>

int main(void) {
    int T[7] = {3, 21, 6, 13, 68, 4, 29};
    int max = T[0];
    // parcours T[1..6] et mets à jour max
    printf("Max = %d\\n", max);
    return 0;
}
`,
        hints: [
          { text: "Initialise max à T[0], puis for (i=1; i<7; i++) if (T[i] > max) max = T[i];", cost: 25 },
          { text: "La comparaison se fait avec > et l'affectation avec = (pas ==).", cost: 30 },
          { text: "📖 Correction complète :\n```c\nint max = T[0];\nfor (int i = 1; i < 7; i++)\n    if (T[i] > max) max = T[i];\nprintf(\"Max = %d\\n\", max);\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Parcourt le tableau avec une boucle for", pattern: "for\\s*\\(", flags: "i" },
            { label: "Compare l'élément courant T[i] au maximum", pattern: "T\\s*\\[\\s*i\\s*\\]\\s*>", flags: "i" },
            { label: "Met à jour max quand un plus grand est trouvé", pattern: "max\\s*=\\s*T\\s*\\[\\s*i\\s*\\]", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
int max = T[0];
for (int i = 1; i < 7; i++)
    if (T[i] > max)
        max = T[i];
printf("Max = %d\\n", max);
\`\`\`

On initialise \`max\` avec le **premier** élément, puis on compare chaque suivant : dès qu'on trouve plus grand, on met à jour. La condition \`i < 7\` s'arrête à \`T[6]\` (dernier élément) — dépasser à \`T[7]\` serait **hors bornes**. Résultat : **68**.`,
        tags: ["tp", "c", "tableau"],
      },
      {
        id: "tp-c-pointeurs",
        title: "TP 5 — Pointeurs, malloc et free",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "c",
        expectedOutput: "Valeur = 42",
        prompt: `## 🧭 Allocation dynamique en C

Alloue dynamiquement **un entier** avec \`malloc\`, range la valeur **42** dedans **via un pointeur**, affiche-la, puis **libère** la mémoire. Sortie attendue :

\`\`\`
Valeur = 42
\`\`\`

**🐛 Erreurs à éviter** : oublier \`#include <stdlib.h>\`, déréférencer un pointeur NULL, ou oublier \`free\` (fuite mémoire).`,
        points: 350,
        timeLimitSec: 1200,
        starter: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = (int*) malloc(sizeof(int));
    // range 42 dans *p, affiche-le, puis libère
    return 0;
}
`,
        hints: [
          { text: "*p = 42 ; puis printf(\"Valeur = %d\\n\", *p); enfin free(p);", cost: 30 },
          { text: "*p désigne le contenu pointé (le ^p du pseudo-code). free(p) rend la mémoire.", cost: 40 },
          { text: "📖 Correction complète :\n```c\nint *p = (int*) malloc(sizeof(int));\n*p = 42;\nprintf(\"Valeur = %d\\n\", *p);\nfree(p);\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Alloue la mémoire avec malloc", pattern: "malloc\\s*\\(", flags: "i" },
            { label: "Range 42 dans la case pointée (*p = 42)", pattern: "\\*\\s*p\\s*=\\s*42", flags: "i" },
            { label: "Affiche le contenu pointé *p", pattern: "printf\\s*\\([\\s\\S]*\\*\\s*p", flags: "i" },
            { label: "Libère la mémoire avec free (pas de fuite)", pattern: "free\\s*\\(\\s*p\\s*\\)", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int *p = (int*) malloc(sizeof(int));  // réserve un entier (Allouer)
    *p = 42;                              // range 42 dans la case pointée (^p ← 42)
    printf("Valeur = %d\\n", *p);         // lit le contenu pointé
    free(p);                             // libère (Libérer) → pas de fuite
    return 0;
}
\`\`\`

Correspondances pseudo-code → C : \`Allouer\` = \`malloc\`, \`Libérer\` = \`free\`, \`^p\` = \`*p\`, \`@a\` = \`&a\`. **Chaque \`malloc\` doit avoir son \`free\`** : ici on rend la mémoire juste après usage. Déréférencer \`p\` s'il valait \`NULL\` (malloc échoué) provoquerait un **segfault** — en production on testerait \`if (p != NULL)\`.`,
        tags: ["tp", "c", "pointeurs", "malloc"],
      },
      {
        id: "tp-c-allocation",
        title: "TP Final — First Fit (allocation mémoire)",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "c",
        expectedOutput: "First Fit: partition 1",
        prompt: `## 🧩 Simuler l'allocation mémoire

On représente les **partitions libres** par \`int part[5] = {100, 500, 200, 300, 600};\`. Un processus demande **212** octets.

Écris la stratégie **First Fit** : trouve l'**indice de la première partition** dont la taille est **≥ 212**, et affiche **exactement** :

\`\`\`
First Fit: partition 1
\`\`\`

(l'indice 1 correspond à la partition de taille 500, la 1ère assez grande).

**🔧 Comment tester** : Compiler & Exécuter, compare à l'attendu. **🐛 Attention** aux bornes du tableau et à bien t'arrêter dès la première partition trouvée (\`break\`).`,
        points: 350,
        timeLimitSec: 1500,
        starter: `#include <stdio.h>

int main(void) {
    int part[5] = {100, 500, 200, 300, 600};
    int demande = 212;
    int choix = -1;
    // First Fit : première partition >= demande
    for (int i = 0; i < 5; i++) {
        // ... complète : si part[i] >= demande, garde i et arrête
    }
    printf("First Fit: partition %d\\n", choix);
    return 0;
}
`,
        hints: [
          { text: "Dans la boucle : if (part[i] >= demande) { choix = i; break; }", cost: 30 },
          { text: "break arrête la boucle dès la PREMIÈRE partition assez grande (c'est le principe du First Fit).", cost: 40 },
          { text: "📖 Correction complète :\n```c\nfor (int i = 0; i < 5; i++) {\n    if (part[i] >= demande) { choix = i; break; }\n}\nprintf(\"First Fit: partition %d\\n\", choix);\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Parcourt les partitions avec une boucle for", pattern: "for\\s*\\(", flags: "i" },
            { label: "Teste si la partition est assez grande (part[i] >= demande)", pattern: "part\\s*\\[\\s*i\\s*\\]\\s*>=\\s*demande", flags: "i" },
            { label: "Mémorise l'indice choisi", pattern: "choix\\s*=\\s*i", flags: "i" },
            { label: "Arrête à la première trouvée avec break", pattern: "break", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
for (int i = 0; i < 5; i++) {
    if (part[i] >= demande) {
        choix = i;
        break;          // First Fit : on s'arrête à la PREMIÈRE qui convient
    }
}
printf("First Fit: partition %d\\n", choix);
\`\`\`

Avec \`part = {100, 500, 200, 300, 600}\` et \`demande = 212\` : la partition d'indice 0 (100) est trop petite, l'indice 1 (500) convient → \`choix = 1\`, et le \`break\` **arrête immédiatement** (c'est ce qui distingue First Fit des autres).

**Pour aller plus loin** (le projet complet) :
- **Best Fit** : ne pas s'arrêter, garder l'indice de la **plus petite** partition ≥ demande → ici l'indice 3 (300).
- **Worst Fit** : garder la **plus grande** ≥ demande → l'indice 4 (600).
- puis \`part[choix] -= demande\` pour mettre à jour la taille restante.`,
        tags: ["tp", "c", "allocation", "first-fit"],
      },
    ],
  },
];
