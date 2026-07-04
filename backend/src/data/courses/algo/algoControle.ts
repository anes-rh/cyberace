import type { CourseSeed } from "../../../types";

/**
 * Algorithmique L1 (Dr. B. BESSAA) — structures itératives (les 3 boucles)
 * et tableaux/vecteurs. Reconstruit depuis les parties 5, 6 et 7 du cours.
 */
export const algoControle: CourseSeed[] = [
  {
    slug: "algo-iteratives",
    title: "Structures itératives — Pour, Tantque, Répéter",
    checkpoint: "algorithmique",
    codename: "Loop Circuit",
    domain: "Algorithmique L1",
    theme: "circuit",
    icon: "Binary",
    accent: "#93B896",
    order: 3,
    difficulty: "easy",
    summary:
      "Faire tourner le moteur en boucle : les trois structures répétitives (Pour, Tantque, Répéter), quand utiliser chacune, leurs équivalences, et les traces d'exécution déroulées pas à pas.",
    objectives: [
      "Choisir la bonne boucle selon que le nombre d'itérations est connu ou non",
      "Écrire et tracer une boucle Pour, Tantque et Répéter",
      "Comprendre qu'il faut modifier la condition SOI-MÊME dans Tantque",
      "Convertir une boucle Pour en Tantque et en Répéter",
      "Maîtriser les boucles imbriquées (boucle dans une boucle)",
      "Documenter un algorithme avec des commentaires",
    ],
    lesson: `# 🔁 Structures itératives — le Loop Circuit

Un pilote fait des **tours de circuit** : la même portion de piste, encore et encore. En algorithmique, répéter un traitement s'appelle **itérer**. Il existe **trois** structures répétitives — apprenons à choisir la bonne. 🏁

---

## 1. La boucle Pour — quand on connaît le nombre de tours 🔢

**Syntaxe** :

\`\`\`
Pour <Compteur> ← <BI> à <BS> Faire
    <Bloc Action>
Fait ;
\`\`\`

Le **compteur** part de la borne inférieure \`BI\`, s'incrémente **automatiquement de 1** à chaque tour, jusqu'à la borne supérieure \`BS\`.

**Exemple — somme des N premiers entiers** \`S = 1 + 2 + … + N\` :

\`\`\`
Algorithme SommeN ;
Var S, I, N : entier ;
Debut
    Ecrire("Donner le nombre N") ; Lire(N) ;
    S ← 0 ;
    Pour I ← 1 à N Faire
        S ← S + I ;
    Fait ;
    Ecrire('La somme S = ', S) ;
Fin.
\`\`\`

**Trace d'exécution pour N = 6** :

| Étape | N | I | S |
|---|---|---|---|
| Initiale | 6 | — | 0 |
| 1 | 6 | 1 | 1 |
| 2 | 6 | 2 | 3 |
| 3 | 6 | 3 | 6 |
| 4 | 6 | 4 | 10 |
| 5 | 6 | 5 | 15 |
| 6 | 6 | 6 | 21 |

Résultat : \`S = 21\`. 🎯

📌 **Détail** : le compteur \`I\` sert **aussi** de valeur à additionner ici — ce n'est pas toujours le cas (voir la somme de N éléments **lus**, où on ajoute \`A\` et pas \`I\`).

---

## 2. La boucle Tantque — quand on NE connaît PAS le nombre de tours 🎲

Quand le nombre de répétitions dépend d'une **condition** (pas d'un compteur fixe), on utilise **Tantque**.

**Syntaxe** :

\`\`\`
Tantque <Condition> Faire
    <Bloc Action>
Fait ;
\`\`\`

**Sémantique** :
1. **initialiser** la condition ;
2. si la condition vaut **Vrai** → exécuter le bloc, **modifier la condition**, retourner en 2 ;
3. si la condition vaut **Faux** → continuer **après** la boucle.

⚠️ **La règle d'or** : la condition **n'est PAS modifiée automatiquement**. Le bloc action **doit** contenir une action (affectation ou lecture) qui change au moins un objet de la condition — **sinon boucle infinie** !

**Exemple — le jeu de dé** : on relance tant qu'on n'obtient pas la face 1 ; la note = somme des faces.

\`\`\`
Algorithme JeuDe ;
Var Face, Note : entier ;
Debut
    Ecrire("Donner les valeurs des faces obtenues") ;
    Lire(Face) ;
    Note ← Face ;
    Tantque Face ≠ 1 Faire
        Lire(Face) ;
        Note ← Note + Face ;
    Fait ;
    Ecrire('La note du joueur est : ', Note) ;
Fin.
\`\`\`

**Trace** pour les faces obtenues \`3 - 2 - 3 - 4 - 1\` :

| Face lue | Condition Face ≠ 1 | Note |
|---|---|---|
| 3 (init) | — | 3 |
| 2 | 3 ≠ 1 → Vrai | 5 |
| 3 | 2 ≠ 1 → Vrai | 8 |
| 4 | 3 ≠ 1 → Vrai | 12 |
| 1 | 4 ≠ 1 → Vrai | 13 |
| — | 1 ≠ 1 → **Faux** → stop | 13 |

Résultat : **Note = 13**. Remarque : la face \`1\` finale **est** ajoutée (elle est lue puis cumulée avant que la condition ne devienne Faux).

---

## 3. La boucle Répéter — exécuter AU MOINS une fois 🔂

**Syntaxe** :

\`\`\`
Répéter
    <Bloc Action>
Jusqu'à <Condition> ;
\`\`\`

**Sémantique** :
1. **exécuter** le bloc, **modifier la condition** ;
2. si la condition vaut **Faux** → retourner en 1 ;
3. si la condition vaut **Vrai** → continuer après la boucle.

Deux différences majeures avec Tantque :
- le bloc s'exécute **au moins une fois** (la condition est testée **à la fin**) ;
- on **arrête quand la condition devient Vraie** — la condition de \`Répéter\` est donc la **négation** de celle de \`Tantque\`.

**Même jeu de dé, version Répéter** :

\`\`\`
Note ← 0 ;
Répéter
    Lire(Face) ;
    Note ← Note + Face ;
Jusqu'à Face = 1 ;
\`\`\`

**Usage type — valider une saisie** (on redemande TANT QUE c'est invalide, donc au moins une saisie) :

\`\`\`
Répéter
    Lire(N) ;
Jusqu'à (N > 0 Et N ≤ 200) ;   // limites d'un tableau, par exemple
\`\`\`

---

## 4. Quelle boucle choisir ? 🧭

\`\`\`
              nombre d'itérations connu ?
                 ┌──────────┴──────────┐
               OUI                     NON
                │                       │
             Pour            au moins 1 exécution ?
                             ┌──────────┴─────────┐
                           OUI                    NON
                            │                      │
                         Répéter               Tantque
\`\`\`

**Règle de conversion** :
- **Toute** boucle \`Pour\` peut devenir une \`Tantque\` **ou** une \`Répéter\` (on initialise le compteur, on l'incrémente **à la main**, on teste).
- L'**inverse n'est pas toujours vrai** : on ne peut transformer un \`Tantque\`/\`Répéter\` en \`Pour\` **que si le nombre d'itérations est connu**.

\`\`\`
Pour I ← 1 à N Faire        │  I ← 1 ;
    S ← S + I ;             │  Tantque I ≤ N Faire
Fait ;                      │      S ← S + I ;
                            │      I ← I + 1 ;   ← incrément MANUEL
                            │  Fait ;
\`\`\`

---

## 5. Boucles imbriquées 🪆

Une boucle **dans** une boucle. Exemple : \`N\` joueurs (boucle externe), chacun lance le dé plusieurs fois (boucle interne).

\`\`\`
Pour J ← 1 à N Faire              // boucle externe : les joueurs
    Lire(Face) ; Note ← Face ;
    Tantque Face ≠ 1 Faire        // boucle interne : les lancers
        Lire(Face) ; Note ← Note + Face ;
    Fait ;
    Ecrire('Note du joueur ', J, ' = ', Note) ;
Fait ;
\`\`\`

À chaque tour de la boucle **externe**, la boucle **interne** s'exécute **entièrement**.

---

## 6. Les commentaires 💬

Des messages **non exécutés**, destinés au programmeur :

\`\`\`
// commentaire sur une seule ligne
/* commentaire
   sur plusieurs lignes */
\`\`\`

---

## 🧠 Ce qu'il faut retenir

- **Pour** : nombre de tours **connu**, compteur incrémenté **automatiquement**.
- **Tantque** : condition testée **au début** (0 ou plusieurs tours) — **modifie la condition toi-même** !
- **Répéter** : condition testée **à la fin** (**au moins 1 tour**), on s'arrête quand elle devient **Vraie**.
- Condition de \`Répéter\` = **négation** de celle de \`Tantque\`.
- Toute \`Pour\` → \`Tantque\`/\`Répéter\` ; l'inverse seulement si le nombre de tours est connu.
- Boucles imbriquées : l'interne tourne **en entier** à chaque tour de l'externe.

## ⚠️ Erreurs fréquentes des débutants

**1. Boucle infinie : oublier de modifier la condition.**
\`\`\`
// ❌ Face n'est jamais relu → la condition reste Vraie pour toujours
Tantque Face ≠ 1 Faire
    Note ← Note + Face ;
Fait ;
// ✅ le bloc DOIT changer un objet de la condition
Tantque Face ≠ 1 Faire
    Lire(Face) ;            // ← modifie la condition
    Note ← Note + Face ;
Fait ;
\`\`\`

**2. Oublier l'incrément manuel en convertissant Pour → Tantque.**
\`\`\`
// ❌ I ne change jamais → boucle infinie
I ← 1 ; Tantque I ≤ N Faire S ← S + I ; Fait ;
// ✅ incrémenter I soi-même
I ← 1 ; Tantque I ≤ N Faire S ← S + I ; I ← I + 1 ; Fait ;
\`\`\`

**3. Utiliser Répéter quand le bloc ne doit parfois PAS s'exécuter.** \`Répéter\` s'exécute **toujours au moins une fois**. Si le cas « zéro itération » est possible (ex : liste vide), il faut un \`Tantque\`.

**4. Se tromper de sens de condition entre Tantque et Répéter.** \`Tantque cond\` **continue** tant que \`cond\` est vraie ; \`Répéter … Jusqu'à cond\` **s'arrête** quand \`cond\` devient vraie. Ce sont des conditions **opposées**.

**5. Oublier d'initialiser l'accumulateur.** Un \`S ← S + …\` sans \`S ← 0\` au départ part d'une valeur **indéfinie** → résultat faux.`,
    badge: {
      id: "badge-loop-master",
      name: "Loop Master",
      icon: "Binary",
      description:
        "Maîtrise les trois boucles Pour, Tantque, Répéter, leurs conversions et les boucles imbriquées.",
    },
    challenges: [
      {
        id: "algo-iter-jeude-trace",
        title: "Trace du jeu de dé",
        order: 1,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🎲 Dérouler une boucle Tantque

L'algorithme \`JeuDe\` lit une première face dans \`Note\`, puis \`Tantque Face ≠ 1\` relit une face et l'ajoute à \`Note\`.

Le joueur obtient successivement les faces : **3, 2, 3, 4, 1**.

**Quelle est la note finale du joueur ?**`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          { text: "Note démarre à la 1ère face (3). Puis on ajoute chaque face suivante, Y COMPRIS le 1 final (il est lu puis ajouté avant l'arrêt).", cost: 15 },
          { text: "📖 Correction complète : Note = 3, puis +2=5, +3=8, +4=12, +1=13. La face 1 est ajoutée car la condition n'est testée qu'après l'ajout. Note = 13.", cost: 60 },
        ],
        answer: 13,
        explanation: `Trace pas à pas :

| Face | Note |
|---|---|
| 3 (initiale) | 3 |
| 2 | 5 |
| 3 | 8 |
| 4 | 12 |
| 1 | 13 |

La face \`1\` **est bien ajoutée** : dans un \`Tantque\`, la condition (\`Face ≠ 1\`) n'est retestée **qu'après** le bloc. Donc on lit 1, on l'ajoute (Note = 13), **puis** la condition \`1 ≠ 1\` devient Faux et on sort. Résultat : **13**.`,
        tags: ["boucle", "tantque", "trace", "L1"],
      },
      {
        id: "algo-iter-sommen-trace",
        title: "Somme des N premiers entiers",
        order: 2,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🔢 Trace d'une boucle Pour

L'algorithme \`SommeN\` calcule \`S = 1 + 2 + … + N\` avec :

\`\`\`
S ← 0 ;
Pour I ← 1 à N Faire
    S ← S + I ;
Fait ;
\`\`\`

**Quelle est la valeur de \`S\` pour \`N = 6\` ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Additionne 1+2+3+4+5+6, ou utilise la formule N(N+1)/2.", cost: 15 },
          { text: "📖 Correction complète : S = 1+2+3+4+5+6 = 21 (ou 6×7/2 = 21).", cost: 60 },
        ],
        answer: 21,
        explanation: `La boucle cumule chaque valeur de \`I\` de 1 à 6 :

\`\`\`
S : 0 → 1 → 3 → 6 → 10 → 15 → 21
I :     1   2   3    4    5    6
\`\`\`

\`S = 1+2+3+4+5+6 = 21\`. On peut vérifier avec la formule de Gauss : \`N(N+1)/2 = 6×7/2 = 21\`. ✅`,
        tags: ["boucle", "pour", "trace", "L1"],
      },
      {
        id: "algo-iter-repeter-vrai",
        title: "Tantque vs Répéter : le vrai du faux",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔂 Bien distinguer les deux boucles conditionnelles

**Quelle affirmation est EXACTE à propos de la boucle \`Répéter … Jusqu'à\` (comparée à \`Tantque\`) ?**`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "Où la condition est-elle testée dans Répéter : au début ou à la fin ?", cost: 20 },
          { text: "📖 Correction complète : Répéter teste la condition À LA FIN, donc le bloc s'exécute AU MOINS UNE FOIS ; et on s'arrête quand la condition devient VRAIE (négation du Tantque).", cost: 60 },
        ],
        options: [
          "Le bloc de Répéter s'exécute au moins une fois, et on s'arrête quand la condition devient Vraie",
          "Répéter et Tantque sont strictement identiques",
          "Le bloc de Répéter peut ne jamais s'exécuter",
          "Répéter s'arrête quand la condition devient Fausse",
        ],
        answer: 0,
        explanation: `\`Répéter\` teste la condition **à la fin** → le bloc s'exécute **au moins une fois**, et on **s'arrête quand la condition devient Vraie**.

C'est l'**inverse** du \`Tantque\`, qui teste **au début** (0 tour possible) et **continue** tant que la condition est vraie. D'où : **condition de Répéter = négation de la condition de Tantque**.

\`\`\`
Tantque Face ≠ 1 Faire … Fait ;    ⇔    Répéter … Jusqu'à Face = 1 ;
\`\`\``,
        tags: ["boucle", "repeter", "tantque", "L1"],
      },
      {
        id: "algo-iter-code-sommen-tq",
        title: "Somme de N entiers lus (avec Tantque)",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🔧 Convertir Pour en Tantque

Écris un algorithme qui **lit N**, puis **lit N entiers** un par un et affiche leur **somme** — mais en utilisant une boucle **\`Tantque\`** (pas Pour).

⚠️ N'oublie pas d'initialiser l'accumulateur **et** d'incrémenter le compteur **toi-même**.`,
        points: 200,
        timeLimitSec: 720,
        starter: `Algorithme SommeN ;
Var A, S, I, N : entier ;
Debut
    Ecrire("Donner le nombre d'éléments N") ; Lire(N) ;

Fin.`,
        hints: [
          { text: "Initialise S ← 0 et I ← 1. Boucle Tantque I ≤ N : lire A, S ← S + A, puis I ← I + 1.", cost: 25 },
          { text: "Sans le I ← I + 1 dans la boucle, I resterait à 1 → boucle infinie.", cost: 30 },
          { text: "📖 Correction complète :\n```\nS <- 0 ; I <- 1 ;\nTantque I <= N Faire\n    Lire(A) ; S <- S + A ; I <- I + 1 ;\nFait ;\nEcrire('La somme est : ', S) ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Initialise l'accumulateur S à 0", pattern: "S\\s*(←|<-)\\s*0", flags: "i" },
            { label: "Initialise le compteur I avant la boucle", pattern: "I\\s*(←|<-)\\s*1", flags: "i" },
            { label: "Utilise une boucle Tantque avec la condition I ≤ N", pattern: "Tant\\s*que[\\s\\S]{0,20}I[\\s\\S]{0,10}(≤|<=)[\\s\\S]{0,10}N", flags: "i" },
            { label: "Incrémente le compteur I toi-même dans la boucle", pattern: "I\\s*(←|<-)\\s*I\\s*\\+\\s*1", flags: "i" },
            { label: "Affiche la somme avec Ecrire", pattern: "[EÉ]crire\\s*\\(", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Algorithme SommeN ;
Var A, S, I, N : entier ;
Debut
    Ecrire("Donner le nombre d'éléments N") ; Lire(N) ;
    S ← 0 ; I ← 1 ;
    Tantque I ≤ N Faire
        Lire(A) ;
        S ← S + A ;
        I ← I + 1 ;      // incrément MANUEL (indispensable !)
    Fait ;
    Ecrire('La somme est : ', S) ;
Fin.
\`\`\`

Trois pièges évités : \`S ← 0\` (sinon accumulation sur une valeur indéfinie), \`I ← 1\` avant la boucle, et surtout \`I ← I + 1\` **dans** la boucle — que le \`Pour\` faisait automatiquement, mais que le \`Tantque\` exige à la main.`,
        tags: ["boucle", "code", "tantque", "L1"],
      },
      {
        id: "algo-iter-code-prodsomme",
        title: "Produit par additions successives",
        order: 5,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## ✖️➕ Multiplier sans multiplier

Écris un algorithme qui lit deux entiers positifs \`A\` et \`B\` et calcule leur **produit \`P = A × B\`** en utilisant **uniquement l'addition** (car \`A × B = A + A + … + A\`, B fois).

💡 Si \`A\` vaut 0, inutile de boucler : le résultat est 0.`,
        points: 200,
        timeLimitSec: 720,
        starter: `Algorithme ProdSomme ;
Var A, B, P, I : entier ;
Debut
    Ecrire("Donner deux entiers positifs A et B") ; Lire(A, B) ;

Fin.`,
        hints: [
          { text: "P ← 0. Puis une boucle Pour I ← 1 à B qui fait P ← P + A à chaque tour.", cost: 25 },
          { text: "On peut encadrer la boucle par Si A ≠ 0 pour éviter de boucler inutilement.", cost: 30 },
          { text: "📖 Correction complète :\n```\nP <- 0 ;\nSi A <> 0 Alors\n    Pour I <- 1 à B Faire P <- P + A ; Fait ;\nFsi ;\nEcrire('Le produit A*B = ', P) ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Initialise le produit P à 0", pattern: "P\\s*(←|<-)\\s*0", flags: "i" },
            { label: "Boucle B fois (Pour ou Tantque)", pattern: "(Pour|Tant\\s*que)", flags: "i" },
            { label: "Additionne A au produit à chaque tour", pattern: "P\\s*(←|<-)\\s*P\\s*\\+\\s*A", flags: "i" },
            { label: "Affiche le produit", pattern: "[EÉ]crire\\s*\\(", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Algorithme ProdSomme ;
Var A, B, P, I : entier ;
Debut
    Ecrire("Donner deux entiers positifs A et B") ; Lire(A, B) ;
    P ← 0 ;
    Si A ≠ 0 Alors
        Pour I ← 1 à B Faire
            P ← P + A ;      // on additionne A, B fois
        Fait ;
    Fsi ;
    Ecrire('Le produit A*B = ', P) ;
Fin.
\`\`\`

**L'idée** : transformer la multiplication en additions répétées. \`A × B\` = « ajouter \`A\` à lui-même \`B\` fois ». Le test \`Si A ≠ 0\` est une petite optimisation : si \`A = 0\`, le produit est 0 sans avoir à boucler. (On pourrait aussi boucler sur \`A\` fois en ajoutant \`B\` — même résultat.)`,
        tags: ["boucle", "code", "pour", "L1"],
      },
    ],
  },
  {
    slug: "algo-tableaux",
    title: "Les tableaux (vecteurs) — indices, remplissage, recherche",
    checkpoint: "algorithmique",
    codename: "Array Speedway",
    domain: "Algorithmique L1",
    theme: "circuit",
    icon: "Grid3x3",
    accent: "#E8A87C",
    order: 4,
    difficulty: "medium",
    summary:
      "Regrouper 200 variables sous un seul nom : le tableau. Déclaration, référence par indice, remplissage et affichage en boucle, et l'algorithme roi : la recherche séquentielle.",
    objectives: [
      "Comprendre pourquoi le tableau remplace des variables séparées",
      "Déclarer correctement un vecteur (bornes, taille, constantes)",
      "Référencer un élément par son indice et le manipuler comme une variable",
      "Remplir et afficher un tableau à l'aide d'une boucle",
      "Écrire la recherche séquentielle d'une valeur dans un tableau",
      "Valider la taille saisie avec une boucle Répéter",
    ],
    lesson: `# 🏟️ Les tableaux (vecteurs) — l'Array Speedway

**Le problème** : une compétition à **200 joueurs**. Faut-il déclarer \`S1, S2, …, S200\` et écrire 200 lignes de lecture ? 😱 Non ! On **regroupe** toutes ces variables sous **un seul nom**, chacune identifiée par un **numéro**. C'est le **tableau**. 🏎️

> ⚽ Comme au foot : on ne dit pas « A, B, C… contre X, Y, Z… » mais « **Équipe 1** contre **Équipe 2** », et chaque joueur porte un **numéro**.

---

## 1. Définition 📦

Un **tableau** est une structure de données qui stocke, **dans une même variable**, un nombre **fini** d'éléments de **même type**. Chaque élément est identifié par un **indice**.

Comme tout objet, un tableau a un **Nom**, un **Type**, une **Valeur** — et en plus une **Taille** (le nombre d'éléments).

On distingue les tableaux **à une dimension** (les **vecteurs**) et à **deux ou plusieurs dimensions** (matrices…). Ici : les **vecteurs**.

\`\`\`
        ┌────┬────┬────┬────┬─────┬─────┐
   S :  │    │    │    │    │ ... │     │
        └────┴────┴────┴────┴─────┴─────┘
          1    2    3    4         200      ← indices
\`\`\`

---

## 2. Déclaration d'un vecteur 📐

**Syntaxe** :

\`\`\`
<IdTab> : Tableau[BI .. BS] de <TypeElement> ;   // avec bornes
<IdTab> : Tableau[Max] de <TypeElement> ;        // avec taille
\`\`\`

- \`Max\` : constante positive = taille (\`Max = BS − BI + 1\`) ;
- \`BI..BS\` : intervalle des **indices**.

⚠️ **Max, BI, BS doivent être des CONSTANTES entières**, jamais des variables ! (Cas particulier : BI et BS peuvent être des constantes **caractères**.)

**Déclarations correctes** ✅ :

\`\`\`
S : Tableau[1 .. 200] de entier ;
T : Tableau[-10 .. 49] de reel ;      // taille = 49 − (−10) + 1 = 60
Lmaj : Tableau[1 .. 26] de caractère ;
Fre : Tableau['A' .. 'K'] de entier ; // indices caractères : autorisé
Const N = 200 ;
S : Tableau[1 .. N] de entier ;       // N est une CONSTANTE : OK
\`\`\`

**Déclarations FAUSSES** ❌ :

\`\`\`
S : Tableau[1 .. N] de entier ;   // si N est une VARIABLE → interdit
T : Tableau[-10 .. -49] de reel ; // BI > BS → taille négative
Fre : Tableau[A .. K] de entier ; // A, K sans cotes → pas des constantes
\`\`\`

Règles : \`N\` doit être une **constante**, \`BI ≤ BS\`, taille **positive**.

---

## 3. Référencer et manipuler un élément 🎯

**Syntaxe** : \`<IdTab>[<Indice>]\` où \`<Indice>\` est une **expression arithmétique entière** (ou une constante caractère).

\`\`\`
S[1]   T[10]   Tab[2*I+3]   Lmaj['S']
\`\`\`

Un élément référencé se comporte **exactement comme une variable indépendante** — toutes les actions valables sur une variable le sont sur \`S[i]\` :

\`\`\`
Lire(S[4]) ;      Ecrire(S[4]) ;      S[4] ← 26 ;      X ← S[4] ;
\`\`\`

---

## 4. Remplir et afficher avec une boucle 🔁

Puisque les indices varient régulièrement, on utilise une **boucle Pour** :

\`\`\`
// remplissage
Pour I ← 1 à 4 Faire
    Lire(S[I]) ;
Fait ;

// affichage
Pour I ← 1 à 4 Faire
    Ecrire(S[I]) ;
Fait ;
\`\`\`

**Exemple complet — la compétition à N joueurs** :

\`\`\`
Algorithme Competition ;
Var S : Tableau[1..200] de entier ;
    I, N, Som : entier ; Moy : reel ;
Debut
    Ecrire('Donner le nombre de joueurs :') ;
    Répéter Lire(N) ; Jusqu'à (N > 0 Et N ≤ 200) ;   // valider la taille
    Som ← 0 ;
    Pour I ← 1 à N Faire
        Lire(S[I]) ; Som ← Som + S[I] ;
    Fait ;
    Moy ← Som / N ;
    Ecrire('Les joueurs récompensés sont :') ;
    Pour I ← 1 à N Faire
        Si S[I] > Moy Alors
            Ecrire('Le joueur ', I, ' ayant le score : ', S[I]) ;
        Fsi ;
    Fait ;
Fin.
\`\`\`

📌 Le \`Répéter … Jusqu'à (N > 0 Et N ≤ 200)\` **protège les limites du tableau** : on refuse une taille absurde qui déborderait.

---

## 5. L'algorithme roi : la recherche séquentielle 🔎

**Problème** : la valeur \`V\` existe-t-elle dans le tableau ? Quand les éléments sont **en désordre**, on parcourt **du début**, et on s'arrête soit en **trouvant** \`V\`, soit en atteignant la **fin**. On utilise donc un **Tantque**.

\`\`\`
Algorithme Recherche_Seq ;
Var T : Tableau[1..100] de entier ;
    I, N, V : entier ;
Debut
    Ecrire('Donner la taille du tableau') ;
    Répéter Lire(N) ; Jusqu'à (N > 0 Et N ≤ 100) ;
    Ecrire('Donner les éléments du tableau :') ;
    Pour I ← 1 à N Faire Lire(T[I]) ; Fait ;
    Ecrire('Donner la valeur à rechercher :') ; Lire(V) ;
    I ← 1 ;
    Tantque (I ≤ N Et T[I] ≠ V) Faire
        I ← I + 1 ;
    Fait ;
    Si I > N Alors
        Ecrire("La valeur ", V, " n'existe pas dans le tableau")
    Sinon
        Ecrire("La valeur ", V, " existe dans le tableau")
    Fsi ;
Fin.
\`\`\`

**Le test final \`Si I > N\`** distingue les deux causes d'arrêt :
- on est sorti car \`I > N\` → on a **parcouru tout** sans trouver → **absente** ;
- on est sorti car \`T[I] = V\` (donc \`I ≤ N\`) → **trouvée** à la position \`I\`.

⚠️ **L'ordre \`I ≤ N Et T[I] ≠ V\` est vital** : on teste \`I ≤ N\` **d'abord**. Si \`I\` dépasse \`N\`, on n'évalue pas \`T[I]\` (qui serait hors des bornes).

---

## 🧠 Ce qu'il faut retenir

- Un **tableau** regroupe **n éléments de même type** sous un seul nom, chacun repéré par un **indice**.
- Déclaration : bornes/taille = **constantes entières** (\`Max = BS − BI + 1\`), \`BI ≤ BS\`.
- \`T[i]\` se manipule **comme une variable** (Lire, Ecrire, affectation).
- On **remplit/affiche** avec une boucle **Pour**.
- **Recherche séquentielle** : \`Tantque (I ≤ N Et T[I] ≠ V)\`, puis \`Si I > N\` → absente, sinon trouvée en \`I\`.
- Valider la taille saisie avec **Répéter … Jusqu'à** pour respecter les bornes du tableau.

## ⚠️ Erreurs fréquentes des débutants

**1. Déclarer un tableau avec une variable comme taille.**
\`\`\`
// ❌ N est une variable → interdit
Var N : entier ; T : Tableau[1..N] de entier ;
// ✅ N doit être une constante
Const N = 100 ; Var T : Tableau[1..N] de entier ;
\`\`\`
Pourquoi : la taille doit être connue **à la compilation** pour réserver l'espace (tableau statique).

**2. Dépasser les bornes (indice hors [BI..BS]).**
\`\`\`
// ❌ accès à S[201] sur un Tableau[1..200] → hors limites
// ✅ valider N ≤ 200 avant, et ne boucler que Pour I ← 1 à N
\`\`\`

**3. Inverser l'ordre du ET dans la recherche.**
\`\`\`
// ❌ si I dépasse N, T[I] est évalué HORS bornes → plantage
Tantque (T[I] ≠ V Et I ≤ N) Faire …
// ✅ tester I ≤ N D'ABORD (court-circuit du ET)
Tantque (I ≤ N Et T[I] ≠ V) Faire …
\`\`\`

**4. Confondre l'indice et la valeur.** \`T[3]\` n'est **pas** le nombre 3 : c'est la **valeur rangée à la position 3**. L'indice **désigne la case**, pas son contenu.

**5. Oublier d'initialiser \`I ← 1\` avant la recherche**, ou tester \`Si I ≥ N\` au lieu de \`Si I > N\` → mauvais diagnostic trouvé/absent.`,
    badge: {
      id: "badge-array-ace",
      name: "Array Ace",
      icon: "Grid3x3",
      description:
        "Maîtrise la déclaration, le remplissage, l'affichage et la recherche séquentielle dans les tableaux (vecteurs).",
    },
    challenges: [
      {
        id: "algo-tab-declaration",
        title: "Quelle déclaration est valide ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 📐 Déclarer un vecteur correctement

**Parmi ces déclarations de tableau, laquelle est CORRECTE ?**`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          { text: "Les bornes doivent être des CONSTANTES entières, et BI ≤ BS.", cost: 15 },
          { text: "📖 Correction complète : seule `Const N=100 ; T : Tableau[1..N]` est valide (N est une constante). Tableau[1..N] avec N variable est interdit ; [-10..-49] a BI>BS ; [A..K] sans cotes n'utilise pas des constantes.", cost: 60 },
        ],
        options: [
          "Var N : entier ; T : Tableau[1 .. N] de entier ;",
          "T : Tableau[-10 .. -49] de reel ;",
          "Const N = 100 ; T : Tableau[1 .. N] de entier ;",
          "Fre : Tableau[A .. K] de entier ;",
        ],
        answer: 2,
        explanation: `Seule **\`Const N = 100 ; T : Tableau[1 .. N] de entier ;\`** est correcte : \`N\` est une **constante** entière.

Les autres échouent :
- \`Tableau[1..N]\` avec \`N\` **variable** → interdit (la taille doit être connue à la compilation) ;
- \`Tableau[-10..-49]\` → **BI > BS** (−10 > −49), taille négative ;
- \`Tableau[A..K]\` → \`A\` et \`K\` **sans cotes** ne sont pas des constantes caractères (il faudrait \`['A'..'K']\`).`,
        tags: ["tableau", "declaration", "L1"],
      },
      {
        id: "algo-tab-taille",
        title: "Calculer la taille d'un tableau",
        order: 2,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 📏 Taille = BS − BI + 1

Soit la déclaration :

\`\`\`
T : Tableau[-10 .. 49] de reel ;
\`\`\`

**Combien d'éléments \`T\` peut-il contenir ?** (sa taille Max)`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Applique Max = BS − BI + 1, avec BS = 49 et BI = −10.", cost: 15 },
          { text: "📖 Correction complète : Max = 49 − (−10) + 1 = 49 + 10 + 1 = 60.", cost: 60 },
        ],
        answer: 60,
        explanation: `La taille d'un vecteur se calcule par :

\`\`\`
Max = BS − BI + 1 = 49 − (−10) + 1 = 49 + 10 + 1 = 60
\`\`\`

Le \`+1\` est important : les indices vont de −10 **à** 49 **inclus**, donc on compte les deux bornes. \`T\` contient **60** réels.`,
        tags: ["tableau", "taille", "L1"],
      },
      {
        id: "algo-tab-pourquoi",
        title: "Pourquoi un tableau plutôt que 200 variables ?",
        order: 3,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🏟️ L'idée du regroupement

Dans le problème de la compétition à 200 joueurs, écrire \`S1, S2, …, S200\` en variables séparées pose un problème dans la boucle de lecture.

**Pourquoi \`Lire(S)\` dans une boucle (avec une seule variable \`S\`) ne fonctionne-t-il PAS, alors que \`Lire(S[I])\` fonctionne ?**`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          { text: "Une seule variable S ne peut retenir qu'une valeur à la fois : chaque lecture écrase la précédente.", cost: 20 },
          { text: "📖 Correction complète : avec une variable simple S, chaque Lire(S) écrase la valeur précédente — à la fin S ne contient que le dernier score. Le tableau S[I] range chaque score dans une case distincte, toutes conservées.", cost: 60 },
        ],
        options: [
          "Parce qu'une variable simple S est écrasée à chaque lecture : à la fin elle ne contient que le dernier score, tandis que S[I] range chaque valeur dans une case distincte",
          "Parce que Lire ne fonctionne jamais dans une boucle",
          "Parce qu'un tableau est plus rapide à lire",
          "Parce qu'il faut 200 variables et 200 lignes obligatoirement",
        ],
        answer: 0,
        explanation: `Une **variable simple** ne retient qu'**une seule valeur** : chaque \`Lire(S)\` **écrase** la précédente. Après la boucle, \`S\` ne contient que le **dernier** score — impossible de recalculer une moyenne ou de re-parcourir.

Le **tableau** \`S[I]\` range **chaque** score dans une **case distincte** (indice \`I\`), toutes **conservées** simultanément. On peut alors les re-parcourir autant qu'on veut (calcul de moyenne **puis** comparaison de chaque élément).`,
        tags: ["tableau", "concept", "L1"],
      },
      {
        id: "algo-tab-remplir",
        title: "Remplir et sommer un tableau",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🔁 Boucle de remplissage

Écris le fragment qui **lit N éléments** dans un tableau \`T\` (déclaré \`Tableau[1..100]\`) **et calcule leur somme** \`Som\`, en une seule boucle. Suppose \`N\` déjà lu et valide.`,
        points: 200,
        timeLimitSec: 600,
        starter: `Var T : Tableau[1..100] de entier ;
    I, N, Som : entier ;
Debut
    // ... N déjà lu ...
    Som ← 0 ;

Fin.`,
        hints: [
          { text: "Une boucle Pour I ← 1 à N : Lire(T[I]) puis Som ← Som + T[I].", cost: 25 },
          { text: "Accède à l'élément courant par son indice : T[I].", cost: 30 },
          { text: "📖 Correction complète :\n```\nSom <- 0 ;\nPour I <- 1 à N Faire\n    Lire(T[I]) ;\n    Som <- Som + T[I] ;\nFait ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Initialise la somme à 0", pattern: "Som\\s*(←|<-)\\s*0", flags: "i" },
            { label: "Boucle Pour de 1 à N", pattern: "Pour[\\s\\S]{0,30}(à|a)[\\s\\S]{0,10}N", flags: "i" },
            { label: "Lit chaque élément par son indice T[I]", pattern: "Lire\\s*\\(\\s*T\\s*\\[\\s*I\\s*\\]", flags: "i" },
            { label: "Cumule T[I] dans la somme", pattern: "Som\\s*(←|<-)\\s*Som\\s*\\+\\s*T\\s*\\[\\s*I\\s*\\]", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Som ← 0 ;
Pour I ← 1 à N Faire
    Lire(T[I]) ;          // range le i-ème élément dans la case I
    Som ← Som + T[I] ;    // cumule ce même élément
Fait ;
\`\`\`

Chaque \`T[I]\` se manipule **comme une variable** : on peut le lire **et** l'utiliser dans le calcul dans la même boucle. L'indice \`I\`, piloté par le \`Pour\`, balaie toutes les cases de 1 à N.`,
        tags: ["tableau", "code", "boucle", "L1"],
      },
      {
        id: "algo-tab-recherche-trace",
        title: "Recherche séquentielle : trouvée ou pas ?",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔎 Diagnostic de la recherche

Soit le tableau \`T = [5, 3, -6, 1, 18, 49, 2]\` (indices 1 à 7, donc N = 7). On lance la recherche séquentielle de la valeur \`V = 7\` :

\`\`\`
I ← 1 ;
Tantque (I ≤ N Et T[I] ≠ V) Faire I ← I + 1 ; Fait ;
Si I > N Alors ... Sinon ... Fsi ;
\`\`\`

**Que vaut \`I\` à la sortie de la boucle, et quelle branche est prise ?**`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "7 n'est dans aucune case. La boucle avance I jusqu'à dépasser N.", cost: 20 },
          { text: "📖 Correction complète : 7 est absent, donc la boucle incrémente I jusqu'à I = 8 (> N = 7). La condition I ≤ N devient fausse. À la sortie I = 8, et Si I > N → branche « n'existe pas ».", cost: 60 },
        ],
        options: [
          "I = 8, branche « la valeur n'existe pas »",
          "I = 7, branche « la valeur existe »",
          "I = 1, branche « la valeur existe »",
          "I = 0, la boucle plante",
        ],
        answer: 0,
        explanation: `La valeur \`7\` n'est dans **aucune** case. La boucle incrémente \`I\` : 1, 2, …, 7, puis \`I = 8\`. À ce moment \`I ≤ N\` (8 ≤ 7) est **Faux**, donc on **sort** (le \`Et\` court-circuite : \`T[8]\` n'est jamais évalué, ce qui évite un accès hors bornes).

À la sortie, \`I = 8\`. Le test \`Si I > N\` (8 > 7) est **Vrai** → branche **« la valeur n'existe pas »**.

Si on avait cherché \`V = 1\`, la boucle se serait arrêtée à \`I = 4\` (car \`T[4] = 1 = V\`), et \`Si I > N\` (4 > 7) étant Faux → branche **« existe »**.`,
        tags: ["tableau", "recherche", "trace", "L1"],
      },
      {
        id: "algo-tab-recherche-code",
        title: "Écris la recherche séquentielle",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏆 L'algorithme roi

Écris le fragment de **recherche séquentielle** d'une valeur \`V\` dans un tableau \`T\` de \`N\` éléments : la boucle qui avance dans le tableau, puis le test qui affiche si \`V\` **existe** ou **n'existe pas**.`,
        points: 350,
        timeLimitSec: 1200,
        starter: `Var T : Tableau[1..100] de entier ;
    I, N, V : entier ;
Debut
    // ... T rempli, N et V déjà lus ...

Fin.`,
        hints: [
          { text: "I ← 1 ; puis Tantque (I ≤ N Et T[I] ≠ V) Faire I ← I + 1 ; Fait ;", cost: 30 },
          { text: "Après la boucle : Si I > N alors « n'existe pas » Sinon « existe ». L'ordre I ≤ N AVANT T[I] ≠ V est crucial.", cost: 40 },
          { text: "📖 Correction complète :\n```\nI <- 1 ;\nTantque (I <= N Et T[I] <> V) Faire\n    I <- I + 1 ;\nFait ;\nSi I > N Alors\n    Ecrire(\"La valeur n'existe pas\")\nSinon\n    Ecrire(\"La valeur existe\")\nFsi ;\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Initialise l'indice I à 1", pattern: "I\\s*(←|<-)\\s*1", flags: "i" },
            { label: "Boucle Tantque avec I ≤ N ET T[I] ≠ V (dans cet ordre)", pattern: "Tant\\s*que[\\s\\S]{0,20}I[\\s\\S]{0,10}(≤|<=)[\\s\\S]{0,10}N[\\s\\S]{0,20}(Et|et)[\\s\\S]{0,20}T\\s*\\[\\s*I\\s*\\][\\s\\S]{0,10}(≠|<>|!=)[\\s\\S]{0,6}V", flags: "i" },
            { label: "Avance l'indice dans la boucle", pattern: "I\\s*(←|<-)\\s*I\\s*\\+\\s*1", flags: "i" },
            { label: "Teste Si I > N pour diagnostiquer l'absence", pattern: "Si\\s*[\\s\\S]{0,6}I\\s*>\\s*N", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
I ← 1 ;
Tantque (I ≤ N Et T[I] ≠ V) Faire
    I ← I + 1 ;
Fait ;
Si I > N Alors
    Ecrire("La valeur ", V, " n'existe pas dans le tableau")
Sinon
    Ecrire("La valeur ", V, " existe dans le tableau")
Fsi ;
\`\`\`

**Deux causes d'arrêt, un seul test pour les distinguer** :
- sortie car \`I > N\` → tout parcouru sans trouver → **absente** ;
- sortie car \`T[I] = V\` (donc \`I ≤ N\`) → **trouvée** en position \`I\`.

**Pourquoi \`I ≤ N\` en premier dans le ET ?** Grâce au court-circuit, si \`I\` dépasse \`N\`, la 2ᵉ condition \`T[I] ≠ V\` n'est **pas évaluée** — sinon on lirait \`T[I]\` **hors des bornes** du tableau (plantage). Complexité : **O(n)** dans le pire cas (valeur absente ou en dernière position).`,
        tags: ["tableau", "recherche", "code", "L1"],
      },
    ],
  },
];
