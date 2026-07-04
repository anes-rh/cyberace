import type { CourseSeed } from "../../../types";

/**
 * Module de pratique intensive du checkpoint Algorithmique (dernier module).
 * Deux paliers : « Renforcement » (combine les notions vues) et « Défis
 * avancés » (esprit programmation compétitive, astuces algorithmiques),
 * niveau L1/L2. Mélange pseudo-code (conception) et C (mémoire/exécution).
 */
export const codesComplexes: CourseSeed[] = [
  {
    slug: "algo-codes-complexes",
    title: "Codes complexes — pratique intensive & défis algorithmiques",
    checkpoint: "algorithmique",
    codename: "Grand Prix Final",
    domain: "Algorithmique — pratique",
    theme: "circuit",
    icon: "Brain",
    accent: "#C084C7",
    order: 10,
    difficulty: "hard",
    summary:
      "Le grand prix final : de la pratique, rien que de la pratique. Un palier « Renforcement » qui combine boucles, tableaux, récursivité et listes, puis un palier « Défis avancés » façon prog compétitive — chaque problème cache une astuce algorithmique à débusquer.",
    objectives: [
      "Combiner plusieurs notions du checkpoint dans un même exercice",
      "Traduire un problème en algorithme, en pseudo-code ou en C selon le cas",
      "Manipuler chiffres, tableaux, chaînes et récursivité avec aisance",
      "Repérer et appliquer une astuce algorithmique (invariant, un seul passage)",
      "Optimiser la complexité d'une solution naïve",
      "Dérouler mentalement un algorithme sur un petit exemple pour le valider",
    ],
    lesson: `# 🏆 Codes complexes — le Grand Prix Final

Tu as appris la théorie, décortiqué chaque notion. Place à l'**endurance** : ce module est **100 % pratique**. Pas de nouveau concept lourd — juste des problèmes qui te forcent à **combiner** ce que tu sais et, pour les plus corsés, à **trouver l'astuce**. 🏎️

---

## 🎚️ Deux paliers

### Palier 1 — Renforcement
Des mises en situation qui **assemblent** les briques déjà vues : boucles imbriquées + tableaux, manipulation des chiffres d'un nombre, récursivité simple, tri. Rien de nouveau conceptuellement, mais **plus corsé** que les TD de base. Objectif : que les réflexes deviennent automatiques.

### Palier 2 — Défis avancés
Des problèmes dans l'esprit de la **programmation compétitive** : originaux, souvent avec une **astuce non triviale** (un invariant malin, un seul passage au lieu de deux boucles, un renversement plutôt qu'un tableau auxiliaire). On reste au **niveau L1/L2** : pas d'arbres équilibrés ni de graphes — juste de la finesse algorithmique sur ce que tu connais déjà. Les points y sont **plus élevés** : ils se méritent. 🥇

---

## 🧠 La méthode pour un problème corsé

1. **Comprends** l'énoncé — reformule-le avec tes mots, repère les **entrées** et la **sortie**.
2. **Traite un petit exemple à la main** — c'est le meilleur moyen de **découvrir la logique** avant de coder.
3. **Décompose** — quel est le sous-problème répétitif ? une boucle ? une récursion ?
4. **Pense complexité** — ta solution est en O(n²) ? Peux-tu faire un **seul passage** (O(n)) ? Souvent, l'astuce est là.
5. **Cherche l'invariant** — « à chaque étape, telle variable contient toujours … ». Beaucoup d'astuces (2ᵈ max, élément majoritaire, somme max) reposent sur un invariant maintenu en un passage.

> 💡 **Pseudo-code ou C ?** Conception d'algorithme abstrait → **pseudo-code** (on se concentre sur la logique). Manipulation fine de mémoire, chaînes, pointeurs → **C** (on touche la machine). Ce module mélange les deux, selon la nature du défi.

---

## 🧰 Boîte à outils express

| Besoin | Idiome |
|---|---|
| Extraire le dernier chiffre de N | \`N mod 10\` |
| Retirer le dernier chiffre de N | \`N div 10\` |
| Échanger deux cases | \`temp ← a ; a ← b ; b ← temp\` |
| Accumuler | init à **0** (somme) ou **1** (produit) |
| « existe-t-il… ? » | un **booléen** + parcours |
| Parcourir en symétrie | indices \`i\` et \`n-i+1\` (pseudo) / \`i\` et \`n-1-i\` (C) |

---

## 🧠 Ce qu'il faut retenir

- Un problème corsé se **décompose** en sous-problèmes déjà connus.
- **Tracer sur un petit exemple** révèle la logique avant même d'écrire une ligne.
- Passer de **deux boucles à un passage** (O(n²) → O(n)) est l'optimisation la plus fréquente.
- Beaucoup d'astuces = un **invariant** maintenu pendant un unique parcours.
- \`mod 10\` / \`div 10\` sont tes amis pour travailler les **chiffres** d'un nombre.

## ⚠️ Erreurs fréquentes des débutants

**1. Coder avant d'avoir compris.** Toujours dérouler l'algo **à la main** sur un petit exemple d'abord — sinon tu débogues à l'aveugle.

**2. Les erreurs d'indice (off-by-one).** \`< N\` ou \`≤ N\` ? \`N-1\` ou \`N\` ? En C les indices vont de \`0\` à \`n-1\`, en pseudo-code souvent de \`1\` à \`n\`. Une case en trop = plantage ou résultat faux.

**3. Oublier les cas limites.** Tableau vide, un seul élément, valeurs négatives, N = 0… Un algo juste « en général » mais faux sur un bord est un algo **faux**.

**4. Optimiser trop tôt.** Écris d'abord une version **correcte** (même en O(n²)), vérifie-la, **puis** cherche l'astuce pour l'accélérer.

**5. Réinitialiser au mauvais endroit.** Un accumulateur remis à zéro **dans** la boucle au lieu d'**avant** fausse tout le calcul.`,
    badge: {
      id: "badge-code-ace",
      name: "Code Ace",
      icon: "Brain",
      description:
        "A dompté la pratique intensive : combine les notions, optimise les complexités et déniche les astuces algorithmiques.",
    },
    challenges: [
      // ───────────────────── Palier 1 · Renforcement ─────────────────────
      {
        id: "cx-somme-chiffres",
        title: "Renforcement · Somme des chiffres d'un nombre",
        order: 1,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🔢 Décortiquer un entier

Écris un algorithme qui lit un entier \`N ≥ 0\` et calcule la **somme de ses chiffres**.

> Exemple : \`N = 1234\` → \`1 + 2 + 3 + 4 = 10\`.

💡 Le dernier chiffre de \`N\` est \`N mod 10\` ; \`N div 10\` retire ce dernier chiffre. Répète jusqu'à ce que \`N\` devienne 0.`,
        points: 200,
        timeLimitSec: 600,
        starter: `Algorithme SommeChiffres ;
Var N, S : entier ;
Debut
    Ecrire("Donner un entier N") ; Lire(N) ;

Fin.`,
        hints: [
          { text: "S ← 0. Tant que N > 0 : ajoute N mod 10 à S, puis N ← N div 10.", cost: 25 },
          { text: "N mod 10 isole le dernier chiffre ; N div 10 « fait tomber » ce chiffre. La boucle s'arrête quand N = 0.", cost: 30 },
          { text: "📖 Correction complète :\n```\nS <- 0 ;\nTantque N > 0 Faire\n    S <- S + (N mod 10) ;\n    N <- N div 10 ;\nFait ;\nEcrire('Somme des chiffres = ', S) ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Initialise la somme S à 0", pattern: "S\\s*(←|<-)\\s*0", flags: "i" },
            { label: "Boucle tant que N > 0", pattern: "Tant\\s*que[\\s\\S]{0,10}N\\s*>\\s*0", flags: "i" },
            { label: "Ajoute le dernier chiffre (N mod 10) à la somme", pattern: "N\\s*mod\\s*10", flags: "i" },
            { label: "Retire le dernier chiffre (N div 10)", pattern: "N\\s*(←|<-)\\s*N\\s*div\\s*10", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
S ← 0 ;
Tantque N > 0 Faire
    S ← S + (N mod 10) ;   // ajoute le dernier chiffre
    N ← N div 10 ;         // retire le dernier chiffre
Fait ;
Ecrire('Somme des chiffres = ', S) ;
\`\`\`

**Trace pour N = 1234** :

| N | N mod 10 | S | N div 10 |
|---|---|---|---|
| 1234 | 4 | 4 | 123 |
| 123 | 3 | 7 | 12 |
| 12 | 2 | 9 | 1 |
| 1 | 1 | 10 | 0 → stop |

Le couple **\`mod 10\` / \`div 10\`** est l'outil universel pour parcourir les chiffres d'un nombre « par la droite ». On le réutilisera pour inverser un entier, tester un palindrome numérique, convertir en binaire…`,
        tags: ["renforcement", "code", "chiffres"],
      },
      {
        id: "cx-inverser-entier",
        title: "Renforcement · Inverser un entier",
        order: 2,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🔁 Le nombre à l'envers

Écris un algorithme qui lit un entier \`N ≥ 0\` et construit le nombre **renversé** \`R\`.

> Exemple : \`N = 1234\` → \`R = 4321\`.

💡 À chaque tour, « pousse » les chiffres déjà accumulés d'un rang vers la gauche : \`R ← R × 10 + (dernier chiffre de N)\`.`,
        points: 200,
        timeLimitSec: 600,
        starter: `Algorithme Inverser ;
Var N, R : entier ;
Debut
    Ecrire("Donner un entier N") ; Lire(N) ;

Fin.`,
        hints: [
          { text: "R ← 0. Tant que N > 0 : R ← R × 10 + (N mod 10), puis N ← N div 10.", cost: 25 },
          { text: "Le × 10 décale R d'un cran à gauche pour faire de la place au nouveau chiffre (celui de droite de N).", cost: 30 },
          { text: "📖 Correction complète :\n```\nR <- 0 ;\nTantque N > 0 Faire\n    R <- R * 10 + (N mod 10) ;\n    N <- N div 10 ;\nFait ;\nEcrire('Renverse = ', R) ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Initialise le résultat R à 0", pattern: "R\\s*(←|<-)\\s*0", flags: "i" },
            { label: "Boucle tant que N > 0", pattern: "Tant\\s*que[\\s\\S]{0,10}N\\s*>\\s*0", flags: "i" },
            { label: "Décale R et ajoute le dernier chiffre (R*10 + N mod 10)", pattern: "R\\s*\\*\\s*10\\s*\\+[\\s\\S]{0,10}mod\\s*10", flags: "i" },
            { label: "Retire le dernier chiffre de N", pattern: "N\\s*(←|<-)\\s*N\\s*div\\s*10", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
R ← 0 ;
Tantque N > 0 Faire
    R ← R × 10 + (N mod 10) ;   // pousse R à gauche, colle le chiffre de droite
    N ← N div 10 ;
Fait ;
Ecrire('Renversé = ', R) ;
\`\`\`

**Trace pour N = 1234** : R : 0 → 4 → 43 → 432 → 4321.

L'astuce est le **\`R × 10\`** : il ouvre une nouvelle « case des unités » dans \`R\`, qu'on remplit aussitôt avec le dernier chiffre de \`N\`. En parcourant \`N\` de droite à gauche et en construisant \`R\` de gauche à droite, on obtient le miroir. (Base du test de **palindrome numérique** : \`N\` est palindrome ⇔ \`R = N_initial\`.)`,
        tags: ["renforcement", "code", "chiffres"],
      },
      {
        id: "cx-fibonacci",
        title: "Renforcement · Le Nième terme de Fibonacci",
        order: 3,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🐇 La suite de Fibonacci

La suite est définie par \`F(0) = 0\`, \`F(1) = 1\`, et \`F(n) = F(n-1) + F(n-2)\`.

> 0, 1, 1, 2, 3, 5, 8, 13, 21, …

Écris un algorithme **itératif** (pas récursif) qui lit \`N ≥ 0\` et affiche \`F(N)\`, en ne gardant que **deux variables** (les deux derniers termes).`,
        points: 250,
        timeLimitSec: 720,
        starter: `Algorithme Fibonacci ;
Var N, I, a, b, temp : entier ;
Debut
    Ecrire("Donner un entier N") ; Lire(N) ;

Fin.`,
        hints: [
          { text: "a ← 0 (F0), b ← 1 (F1). Pour I ← 1 à N : le nouveau terme est a+b ; décale : a ← b, b ← a+b.", cost: 25 },
          { text: "Utilise temp pour ne pas écraser une valeur avant de l'avoir utilisée : temp ← a+b ; a ← b ; b ← temp.", cost: 30 },
          { text: "📖 Correction complète :\n```\na <- 0 ; b <- 1 ;\nPour I <- 1 à N Faire\n    temp <- a + b ;\n    a <- b ;\n    b <- temp ;\nFait ;\nEcrire('F(N) = ', a) ;\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Initialise les deux premiers termes (0 et 1)", pattern: "a\\s*(←|<-)\\s*0[\\s\\S]{0,20}b\\s*(←|<-)\\s*1", flags: "i" },
            { label: "Boucle N fois", pattern: "(Pour|Tant\\s*que)[\\s\\S]{0,30}N", flags: "i" },
            { label: "Calcule le terme suivant comme somme des deux précédents", pattern: "a\\s*\\+\\s*b", flags: "i" },
            { label: "Fait glisser les deux variables", pattern: "a\\s*(←|<-)\\s*b", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
a ← 0 ; b ← 1 ;              // a = F(0), b = F(1)
Pour I ← 1 à N Faire
    temp ← a + b ;          // F suivant
    a ← b ;                 // on décale la fenêtre
    b ← temp ;
Fait ;
Ecrire('F(N) = ', a) ;      // après N tours, a = F(N)
\`\`\`

**L'idée de la fenêtre glissante** : au lieu de stocker toute la suite (tableau), on ne garde que les **deux derniers termes**. À chaque tour, on calcule le suivant et on « fait glisser » : l'ancien \`b\` devient \`a\`. La variable \`temp\` est indispensable — sans elle, \`a ← b\` puis \`b ← a+b\` utiliserait le **nouveau** \`a\`, donnant un résultat faux.

Version **récursive** (\`F(n) = F(n-1)+F(n-2)\`) : élégante mais **catastrophique** en O(2ⁿ) (elle recalcule les mêmes termes des milliers de fois). L'itératif est en **O(n)** et O(1) mémoire. Bel exemple où *récursif ≠ meilleur*.`,
        tags: ["renforcement", "code", "fibonacci", "suite"],
      },
      {
        id: "cx-palindrome-c",
        title: "Renforcement · Palindrome (en C)",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "c",
        expectedOutput: "palindrome",
        prompt: `## 🪞 Un mot et son reflet

Un **palindrome** se lit pareil dans les deux sens (\`radar\`, \`kayak\`, \`ressasser\`).

Le mot \`char mot[] = "radar";\` est fourni. Écris le programme C qui affiche **exactement** \`palindrome\` s'il en est un, sinon \`non\`.

💡 Compare les caractères **symétriques** : \`mot[i]\` avec \`mot[len-1-i]\`, en avançant vers le milieu. \`strlen(mot)\` (dans \`<string.h>\`) donne la longueur.

**🔧 Comment tester** : Compiler & Exécuter → tu dois voir \`palindrome\`.`,
        points: 250,
        timeLimitSec: 900,
        starter: `#include <stdio.h>
#include <string.h>

int main(void) {
    char mot[] = "radar";
    int len = strlen(mot);
    int estPalindrome = 1;   // 1 = vrai, 0 = faux
    // compare mot[i] et mot[len-1-i]

    if (estPalindrome) printf("palindrome\\n");
    else printf("non\\n");
    return 0;
}
`,
        hints: [
          { text: "for (int i = 0; i < len/2; i++) if (mot[i] != mot[len-1-i]) estPalindrome = 0;", cost: 30 },
          { text: "Il suffit d'aller jusqu'à len/2 : au-delà on recompare les mêmes paires. Une seule différence suffit à invalider.", cost: 40 },
          { text: "📖 Correction complète :\n```c\nfor (int i = 0; i < len/2; i++)\n    if (mot[i] != mot[len-1-i]) { estPalindrome = 0; break; }\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Boucle jusqu'au milieu (len/2)", pattern: "len\\s*/\\s*2", flags: "i" },
            { label: "Compare les caractères symétriques mot[i] et mot[len-1-i]", pattern: "mot\\s*\\[\\s*i\\s*\\][\\s\\S]{0,6}mot\\s*\\[\\s*len\\s*-\\s*1\\s*-\\s*i", flags: "i" },
            { label: "Met le drapeau à faux si une paire diffère", pattern: "estPalindrome\\s*=\\s*0", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
#include <stdio.h>
#include <string.h>
int main(void) {
    char mot[] = "radar";
    int len = strlen(mot);
    int estPalindrome = 1;
    for (int i = 0; i < len / 2; i++)
        if (mot[i] != mot[len - 1 - i]) { estPalindrome = 0; break; }
    if (estPalindrome) printf("palindrome\\n");
    else printf("non\\n");
    return 0;
}
\`\`\`

**La technique des deux extrémités** : un indice \`i\` part du début, son symétrique \`len-1-i\` part de la fin ; ils se rejoignent au **milieu**. Dès qu'une paire diffère, ce n'est pas un palindrome — le \`break\` évite de continuer inutilement. Aller seulement jusqu'à \`len/2\` suffit (au-delà, on recompare les mêmes couples). Complexité **O(n)**, mémoire **O(1)**. En C, rappelle-toi que les indices vont de \`0\` à \`len-1\`.`,
        tags: ["renforcement", "code", "c", "chaine", "palindrome"],
      },
      {
        id: "cx-tri-bulles",
        title: "Renforcement · Tri à bulles",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🫧 Faire remonter les bulles

Écris le fragment qui **trie** un tableau \`T\` de \`N\` entiers dans l'**ordre croissant** par la méthode du **tri à bulles** :

> On parcourt le tableau en comparant chaque paire d'éléments **voisins** ; si l'ordre est mauvais (\`T[j] > T[j+1]\`), on les **échange**. On répète ces passages jusqu'à ce que tout soit trié — à chaque passage, le plus grand « remonte » à sa place finale.`,
        points: 350,
        timeLimitSec: 1200,
        starter: `Var T : Tableau[1..100] de entier ;
    I, J, N, temp : entier ;
Debut
    // ... T rempli, N connu ...

Fin.`,
        hints: [
          { text: "Deux boucles imbriquées : Pour I ← 1 à N-1 (les passages), Pour J ← 1 à N-I (les comparaisons).", cost: 30 },
          { text: "Dans la boucle interne : Si T[J] > T[J+1] Alors échange T[J] et T[J+1] via temp.", cost: 40 },
          { text: "📖 Correction complète :\n```\nPour I <- 1 à N-1 Faire\n    Pour J <- 1 à N-I Faire\n        Si T[J] > T[J+1] Alors\n            temp <- T[J] ; T[J] <- T[J+1] ; T[J+1] <- temp ;\n        Fsi ;\n    Fait ;\nFait ;\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Deux boucles imbriquées", pattern: "Pour[\\s\\S]{0,120}Pour", flags: "i" },
            { label: "Compare deux éléments voisins (T[J] > T[J+1])", pattern: "T\\s*\\[\\s*J\\s*\\]\\s*>\\s*T\\s*\\[\\s*J\\s*\\+\\s*1", flags: "i" },
            { label: "Sauvegarde dans temp avant l'échange", pattern: "temp\\s*(←|<-)\\s*T\\s*\\[\\s*J\\s*\\]", flags: "i" },
            { label: "Complète l'échange des deux cases", pattern: "T\\s*\\[\\s*J\\s*\\+\\s*1\\s*\\]\\s*(←|<-)\\s*temp", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Pour I ← 1 à N-1 Faire            // N-1 passages suffisent
    Pour J ← 1 à N-I Faire        // le sommet déjà placé rétrécit la zone
        Si T[J] > T[J+1] Alors
            temp ← T[J] ;
            T[J] ← T[J+1] ;
            T[J+1] ← temp ;      // échange des voisins mal ordonnés
        Fsi ;
    Fait ;
Fait ;
\`\`\`

**Pourquoi \`N-I\` à la boucle interne ?** Après le passage \`I\`, les \`I\` plus grands éléments sont **déjà remontés** à leur place finale (à droite) — inutile de les re-comparer. C'est la petite optimisation classique du tri à bulles.

Ce tri combine **boucles imbriquées** + **échange à 3 temps** + **comparaison de voisins**. Sa complexité est **O(n²)** : simple à écrire, mais lent sur de grands tableaux (les tris performants comme le tri fusion sont en O(n log n)).`,
        tags: ["renforcement", "code", "tri", "tableau"],
      },

      // ───────────────────── Palier 2 · Défis avancés ─────────────────────
      {
        id: "cx-second-max",
        title: "Défi avancé · Le 2ᵈ maximum en un seul passage",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🥈 Trouver le deuxième plus grand — en O(n)

Trouve le **deuxième maximum** d'un tableau \`T\` de \`N ≥ 2\` entiers **en un seul parcours** (pas de tri, pas de double boucle).

> Ex : \`[3, 9, 4, 9, 7]\` → le max est 9, le **2ᵈ max** (strictement plus petit) est **7**.

🎯 **L'astuce** : maintiens **deux** variables, \`max1\` (le plus grand vu) et \`max2\` (le second). À chaque élément, mets-les à jour intelligemment.`,
        points: 350,
        timeLimitSec: 1200,
        starter: `Var T : Tableau[1..100] de entier ;
    I, N, max1, max2 : entier ;
Debut
    // ... T rempli, N >= 2 connu ...

Fin.`,
        hints: [
          { text: "Initialise max1 et max2 avec les deux premiers éléments (le plus grand dans max1). Puis parcours à partir du 3e.", cost: 30 },
          { text: "Pour chaque T[I] : s'il dépasse max1, alors max2 ← max1 et max1 ← T[I] ; sinon s'il est entre max2 et max1, max2 ← T[I].", cost: 45 },
          { text: "📖 Correction complète :\n```\nSi T[1] > T[2] Alors max1 <- T[1] ; max2 <- T[2] ; Sinon max1 <- T[2] ; max2 <- T[1] ; Fsi ;\nPour I <- 3 à N Faire\n    Si T[I] > max1 Alors max2 <- max1 ; max1 <- T[I] ;\n    Sinon Si T[I] > max2 Alors max2 <- T[I] ; Fsi ;\n    Fsi ;\nFait ;\nEcrire('2e max = ', max2) ;\n```", cost: 90 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Maintient deux variables max1 et max2", pattern: "max1[\\s\\S]{0,80}max2|max2[\\s\\S]{0,80}max1", flags: "i" },
            { label: "Un seul parcours du tableau (une seule boucle)", pattern: "Pour[\\s\\S]{0,30}N", flags: "i" },
            { label: "Quand on bat max1, l'ancien max1 devient max2", pattern: "max2\\s*(←|<-)\\s*max1", flags: "i" },
            { label: "Cas intermédiaire : mise à jour de max2 seul", pattern: "T\\s*\\[\\s*I\\s*\\]\\s*>\\s*max2", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
// initialise avec les 2 premiers, le plus grand dans max1
Si T[1] > T[2] Alors max1 ← T[1] ; max2 ← T[2] ;
Sinon max1 ← T[2] ; max2 ← T[1] ; Fsi ;
Pour I ← 3 à N Faire
    Si T[I] > max1 Alors        // nouveau champion :
        max2 ← max1 ;           //   l'ancien roi devient dauphin
        max1 ← T[I] ;
    Sinon Si T[I] > max2 Alors  // pas roi, mais meilleur dauphin
        max2 ← T[I] ;
    Fsi ;
    Fsi ;
Fait ;
Ecrire('2e max = ', max2) ;
\`\`\`

**L'astuce = l'invariant** : *après chaque élément traité, \`max1\` et \`max2\` contiennent toujours les deux plus grands vus jusqu'ici*. La subtilité est le cas « \`T[I]\` dépasse \`max1\` » : il ne faut pas juste remplacer \`max1\`, mais d'abord **sauver l'ancien \`max1\` dans \`max2\`** (il était le plus grand, il devient le deuxième).

Naïvement, on ferait un tri (O(n log n)) ou deux passages. Ici : **un seul passage, O(n), O(1) mémoire**. C'est le genre d'optimisation que les défis avancés récompensent.`,
        tags: ["avance", "code", "tableau", "un-passage", "invariant"],
      },
      {
        id: "cx-majoritaire-c",
        title: "Défi avancé · Élément majoritaire (Boyer-Moore, en C)",
        order: 7,
        difficulty: "insane",
        type: "code",
        language: "c",
        expectedOutput: "Majoritaire: 3",
        prompt: `## 👑 L'élément majoritaire — l'astuce du vote

Un tableau contient un élément **majoritaire** (présent **strictement plus de N/2 fois**). Trouve-le **en un seul passage et en O(1) mémoire** — sans compter les occurrences de chaque valeur !

Données : \`int T[7] = {3, 3, 4, 2, 3, 3, 3};\` (le 3 apparaît 5 fois sur 7). Affiche **exactement** \`Majoritaire: 3\`.

🎯 **L'astuce (vote de Boyer-Moore)** : garde un \`candidat\` et un \`compteur\`. Si le compteur tombe à 0, le prochain élément devient candidat. Même valeur → +1, valeur différente → −1. À la fin, le candidat survivant est le majoritaire.`,
        points: 550,
        timeLimitSec: 1800,
        starter: `#include <stdio.h>

int main(void) {
    int T[7] = {3, 3, 4, 2, 3, 3, 3};
    int n = 7;
    int candidat = T[0], compteur = 1;
    // parcours à partir de i = 1 : applique le vote

    printf("Majoritaire: %d\\n", candidat);
    return 0;
}
`,
        hints: [
          { text: "Pour i de 1 à n-1 : si compteur == 0 → candidat = T[i], compteur = 1. Sinon si T[i]==candidat → compteur++ ; sinon compteur--.", cost: 40 },
          { text: "L'idée : chaque élément différent du candidat « annule » une voix. Le majoritaire (>N/2) ne peut jamais être totalement annulé.", cost: 55 },
          { text: "📖 Correction complète :\n```c\nfor (int i = 1; i < n; i++) {\n    if (compteur == 0) { candidat = T[i]; compteur = 1; }\n    else if (T[i] == candidat) compteur++;\n    else compteur--;\n}\n```", cost: 110 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Parcourt le tableau en un seul passage", pattern: "for\\s*\\([\\s\\S]{0,40}i\\s*<\\s*n", flags: "i" },
            { label: "Réinitialise le candidat quand le compteur atteint 0", pattern: "compteur\\s*==\\s*0", flags: "i" },
            { label: "Incrémente le compteur si même valeur que le candidat", pattern: "T\\s*\\[\\s*i\\s*\\]\\s*==\\s*candidat", flags: "i" },
            { label: "Décrémente le compteur sinon", pattern: "compteur\\s*--|compteur\\s*-=\\s*1", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
int candidat = T[0], compteur = 1;
for (int i = 1; i < n; i++) {
    if (compteur == 0) { candidat = T[i]; compteur = 1; }  // plus de meneur → nouveau candidat
    else if (T[i] == candidat) compteur++;                 // une voix pour
    else compteur--;                                       // une voix contre
}
printf("Majoritaire: %d\\n", candidat);
\`\`\`

**Pourquoi ça marche (l'invariant du vote)** : imagine que chaque élément « vote ». Un élément **égal** au candidat le **soutient** (+1), un élément **différent** l'**annule** (−1). Comme le majoritaire apparaît **plus de N/2 fois**, il y a **plus de voix pour que contre** lui : son compteur ne peut **jamais** atteindre 0 pour de bon — il finit **toujours** candidat.

C'est spectaculaire : là où l'approche naïve compte les occurrences de chaque valeur (double boucle O(n²), ou un tableau de comptage O(n) mémoire), Boyer-Moore résout tout en **O(n) temps et O(1) mémoire**. ⚠️ L'algorithme **suppose** qu'un majoritaire existe ; sinon il faudrait un 2ᵈ passage pour vérifier.`,
        tags: ["avance", "code", "c", "boyer-moore", "astuce"],
      },
      {
        id: "cx-kadane-c",
        title: "Défi avancé · Sous-tableau de somme maximale (Kadane, en C)",
        order: 8,
        difficulty: "insane",
        type: "code",
        language: "c",
        expectedOutput: "Somme max = 6",
        prompt: `## 📈 La meilleure tranche

Dans un tableau d'entiers (positifs **et négatifs**), trouve la **somme maximale** d'un **sous-tableau contigu** (au moins un élément).

Données : \`int T[9] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\`. La meilleure tranche est \`[4, -1, 2, 1]\` de somme **6**. Affiche **exactement** \`Somme max = 6\`.

🎯 **L'astuce (algorithme de Kadane)** : parcours une seule fois. Garde \`courant\` = meilleure somme se terminant à l'indice actuel, et \`meilleur\` = meilleure somme vue globalement. À chaque élément, \`courant\` repart de zéro s'il devient négatif.`,
        points: 550,
        timeLimitSec: 1800,
        starter: `#include <stdio.h>

int main(void) {
    int T[9] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    int n = 9;
    int courant = T[0], meilleur = T[0];
    // pour i de 1 à n-1 : etend ou repart, puis mets a jour meilleur

    printf("Somme max = %d\\n", meilleur);
    return 0;
}
`,
        hints: [
          { text: "courant = max(T[i], courant + T[i]) : soit on prolonge la tranche, soit on repart de T[i] seul.", cost: 40 },
          { text: "Puis meilleur = max(meilleur, courant). En C sans fonction max : if (courant + T[i] > T[i]) ... ou if (courant < 0) courant = 0; puis courant += T[i].", cost: 55 },
          { text: "📖 Correction complète :\n```c\nfor (int i = 1; i < n; i++) {\n    if (courant < 0) courant = 0;\n    courant += T[i];\n    if (courant > meilleur) meilleur = courant;\n}\n```", cost: 110 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Parcourt le tableau en un seul passage", pattern: "for\\s*\\([\\s\\S]{0,40}i\\s*<\\s*n", flags: "i" },
            { label: "Étend la somme courante avec T[i]", pattern: "courant\\s*(\\+=|=\\s*courant\\s*\\+)[\\s\\S]{0,12}T\\s*\\[\\s*i\\s*\\]|courant\\s*\\+\\s*T\\s*\\[\\s*i", flags: "i" },
            { label: "Repart quand la somme courante devient négative", pattern: "courant\\s*<\\s*0|courant\\s*=\\s*0|T\\s*\\[\\s*i\\s*\\]\\s*,\\s*courant", flags: "i" },
            { label: "Met à jour le meilleur global", pattern: "meilleur\\s*=\\s*courant|courant\\s*>\\s*meilleur", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
int courant = T[0], meilleur = T[0];
for (int i = 1; i < n; i++) {
    if (courant < 0) courant = 0;   // une tranche à somme négative ne sert qu'à plomber la suite → on repart
    courant += T[i];                // on étend la tranche courante
    if (courant > meilleur) meilleur = courant;  // record global ?
}
printf("Somme max = %d\\n", meilleur);
\`\`\`

**L'intuition de Kadane** : à chaque position, on se demande *« la meilleure tranche qui se termine ICI, vaut-elle mieux en prolongeant ce qui précède, ou en repartant de zéro ? »*. Si la somme accumulée (\`courant\`) est **négative**, la traîner ne peut que **diminuer** la suite — autant repartir. On garde en parallèle le **meilleur** score jamais atteint.

C'est un cas de **programmation dynamique** dans sa forme la plus simple (un invariant sur « le meilleur se terminant ici »). Résultat : **O(n)** au lieu du **O(n²)** de la solution naïve (tester toutes les tranches). ⚠️ On initialise avec \`T[0]\` (et non 0) pour gérer le cas où **tous** les éléments sont négatifs.`,
        tags: ["avance", "code", "c", "kadane", "prog-dynamique", "astuce"],
      },
      {
        id: "cx-two-sum",
        title: "Défi avancé · Deux éléments dont la somme vaut la cible",
        order: 9,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🎯 La paire gagnante

Étant donné un tableau \`T\` de \`N\` entiers et une valeur cible \`C\`, détermine s'il **existe deux éléments distincts** (à deux positions différentes) dont la **somme vaut \`C\`**. Affiche « oui » (et la paire) ou « non ».

> Ex : \`T = [2, 7, 11, 15]\`, \`C = 9\` → oui (\`2 + 7\`).

Écris une solution **correcte** (une double boucle suffit ici). La correction expliquera comment faire **mieux**.`,
        points: 350,
        timeLimitSec: 1200,
        starter: `Var T : Tableau[1..100] de entier ;
    I, J, N, C : entier ; trouve : booleen ;
Debut
    // ... T rempli, N et C connus ...

Fin.`,
        hints: [
          { text: "trouve ← faux. Pour I ← 1 à N-1, Pour J ← I+1 à N : si T[I] + T[J] = C alors trouve ← vrai (et affiche la paire).", cost: 30 },
          { text: "Commencer J à I+1 évite de réutiliser le même élément et de tester deux fois la même paire.", cost: 40 },
          { text: "📖 Correction complète :\n```\ntrouve <- faux ;\nPour I <- 1 à N-1 Faire\n    Pour J <- I+1 à N Faire\n        Si T[I] + T[J] = C Alors trouve <- vrai ; Ecrire(T[I], ' + ', T[J]) ; Fsi ;\n    Fait ;\nFait ;\nSi trouve Alors Ecrire('oui') Sinon Ecrire('non') Fsi ;\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Initialise un booléen trouve à faux", pattern: "trouve\\s*(←|<-)\\s*faux", flags: "i" },
            { label: "Boucle interne démarrant après I (J de I+1)", pattern: "J\\s*(←|<-)\\s*I\\s*\\+\\s*1", flags: "i" },
            { label: "Teste si la somme des deux éléments vaut la cible", pattern: "T\\s*\\[\\s*I\\s*\\]\\s*\\+\\s*T\\s*\\[\\s*J\\s*\\]\\s*=\\s*C", flags: "i" },
            { label: "Marque trouvé quand la paire existe", pattern: "trouve\\s*(←|<-)\\s*vrai", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
trouve ← faux ;
Pour I ← 1 à N-1 Faire
    Pour J ← I+1 à N Faire            // J > I : paires distinctes, une seule fois
        Si T[I] + T[J] = C Alors
            trouve ← vrai ;
            Ecrire('Paire : ', T[I], ' + ', T[J]) ;
        Fsi ;
    Fait ;
Fait ;
Si trouve Alors Ecrire('oui') Sinon Ecrire('non') Fsi ;
\`\`\`

**Version correcte, O(n²)** : on teste toutes les paires. Le détail qui compte : \`J\` démarre à \`I+1\` — ainsi on ne réutilise **pas** un élément avec lui-même et on ne teste **pas** deux fois la même paire.

**Comment faire mieux (l'astuce, O(n))** : pour chaque \`T[I]\`, le partenaire cherché est \`C − T[I]\`. Si on **mémorise les valeurs déjà vues** (dans une table / un ensemble), on peut vérifier en O(1) si le complément est déjà passé → **un seul parcours, O(n)**. C'est le fameux « two-sum par table de hachage ». Au niveau L1/L2, la version O(n²) est acceptable ; savoir qu'on peut descendre à O(n) grâce à une structure d'accès rapide est le vrai enseignement.`,
        tags: ["avance", "code", "tableau", "two-sum"],
      },
      {
        id: "cx-rotation-c",
        title: "Défi avancé · Rotation d'un tableau par renversement (en C)",
        order: 10,
        difficulty: "hard",
        type: "code",
        language: "c",
        expectedOutput: "4 5 6 7 1 2 3",
        prompt: `## 🔄 Faire tourner sans tableau auxiliaire

Fais tourner un tableau de \`k\` positions vers la **gauche**, **sur place** (O(1) mémoire).

Données : \`int T[7] = {1,2,3,4,5,6,7};\`, \`k = 3\`. Résultat attendu affiché : \`4 5 6 7 1 2 3\`.

🎯 **L'astuce des trois renversements** : pour une rotation gauche de \`k\` :
1. renverse les \`k\` premiers éléments,
2. renverse les \`n−k\` restants,
3. renverse **tout** le tableau.

Une fonction \`inverser(T, debut, fin)\` t'est donnée dans le squelette.`,
        points: 350,
        timeLimitSec: 1500,
        starter: `#include <stdio.h>

void inverser(int T[], int debut, int fin) {
    while (debut < fin) {
        int temp = T[debut]; T[debut] = T[fin]; T[fin] = temp;
        debut++; fin--;
    }
}

int main(void) {
    int T[7] = {1,2,3,4,5,6,7};
    int n = 7, k = 3;
    // 1) inverser les k premiers  2) inverser les n-k restants  3) inverser tout

    for (int i = 0; i < n; i++) printf("%d%s", T[i], i < n-1 ? " " : "\\n");
    return 0;
}
`,
        hints: [
          { text: "inverser(T, 0, k-1) ; puis inverser(T, k, n-1) ; puis inverser(T, 0, n-1).", cost: 30 },
          { text: "Après les 2 premiers renversements, chaque bloc est à l'envers ; le renversement global remet chaque bloc à l'endroit, mais échangés de place.", cost: 40 },
          { text: "📖 Correction complète :\n```c\ninverser(T, 0, k-1);\ninverser(T, k, n-1);\ninverser(T, 0, n-1);\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Renverse le premier bloc (les k premiers)", pattern: "inverser\\s*\\(\\s*T\\s*,\\s*0\\s*,\\s*k\\s*-\\s*1", flags: "i" },
            { label: "Renverse le second bloc (de k à n-1)", pattern: "inverser\\s*\\(\\s*T\\s*,\\s*k\\s*,\\s*n\\s*-\\s*1", flags: "i" },
            { label: "Renverse l'ensemble du tableau", pattern: "inverser\\s*\\(\\s*T\\s*,\\s*0\\s*,\\s*n\\s*-\\s*1", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
inverser(T, 0, k-1);     // {1,2,3} → {3,2,1}  →  3 2 1 4 5 6 7
inverser(T, k, n-1);     // {4,5,6,7} → {7,6,5,4}  →  3 2 1 7 6 5 4
inverser(T, 0, n-1);     // tout renversé  →  4 5 6 7 1 2 3   ✅
\`\`\`

**Pourquoi trois renversements ?** Une rotation gauche de \`k\` revient à **échanger deux blocs** : \`[0..k-1]\` et \`[k..n-1]\`. Or « échanger deux blocs adjacents » = renverser chacun **puis** renverser le tout. Vérifie sur l'exemple : les 3 étapes amènent \`{4,5,6,7,1,2,3}\`.

L'alternative naïve (décaler les éléments un par un, \`k\` fois) est en **O(n·k)** et lourde ; la version par renversement est en **O(n)** temps et **O(1)** mémoire (aucun tableau auxiliaire). C'est une astuce très prisée en entretien technique. 🧠`,
        tags: ["avance", "code", "c", "rotation", "renversement", "astuce"],
      },
    ],
  },
];
