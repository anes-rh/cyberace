import type { CourseSeed } from "../../../types";

/**
 * ASD L2 — Chapitre 2 : Représentation des données en mémoire & allocation
 * dynamique (S. Boukhedouma). Contigu vs chaîné, pointeurs, Allouer/Libérer,
 * listes uni/bi/circulaires. Exercices de la Série 2.
 */
export const asdMemoire: CourseSeed[] = [
  {
    slug: "asd-memoire-listes",
    title: "Mémoire & listes chaînées — pointeurs, allocation dynamique",
    checkpoint: "algorithmique",
    codename: "Pointer Grand Prix",
    domain: "Structures de données L2",
    theme: "circuit",
    icon: "Binary",
    accent: "#9B8CCB",
    order: 5,
    difficulty: "medium",
    summary:
      "Le grand saut de L2 : sortir des tableaux figés pour des structures qui grandissent à l'exécution. Pointeurs (@, ^, nil), Allouer/Libérer, et les listes chaînées unidirectionnelles, bidirectionnelles et circulaires avec toutes leurs primitives.",
    objectives: [
      "Distinguer représentation contiguë (tableau) et chaînée (liste) et leurs limites",
      "Manipuler les pointeurs : opérateurs @ (adresse de), ^ (contenu de), constante nil",
      "Allouer et libérer dynamiquement une variable, un vecteur, une matrice",
      "Déclarer une liste chaînée et écrire ses primitives (ajout/suppression tête et après)",
      "Parcourir et rechercher dans une liste, la créer en mode FIFO ou LIFO",
      "Adapter les primitives aux listes bidirectionnelles et circulaires",
    ],
    lesson: `# 🧬 Mémoire & listes chaînées — le Pointer Grand Prix

Jusqu'ici, tes données tenaient dans des **tableaux** : pratiques, mais **figés** — taille fixée d'avance, insertions coûteuses. En L2, on passe à la vitesse supérieure : des structures qui **naissent et grandissent pendant l'exécution**. Le carburant de cette magie : les **pointeurs**. 🏎️

---

## 1. Une structure de données, c'est quoi ? 📦

Une **structure de données (SDD)** est une **organisation** des données facilitant leur accès et leur manipulation pour un problème donné. Elle est définie par le **type de base** des éléments **et** les **opérations** qu'on peut leur appliquer (accès, modification, ajout, suppression).

Objectif d'une bonne SDD — satisfaire **deux critères parfois contradictoires** :
1. **un minimum de place mémoire** ;
2. **un minimum d'instructions** pour réaliser une opération.

> 🏁 Le choix de bonnes structures peut faire la différence entre un programme qui tourne en **quelques secondes** ou en **quelques jours** !

Quelques SDD usuelles : tableaux (accès direct), listes/piles/files (linéaires), arbres (hiérarchiques), graphes (relationnels), tables (accès par clé).

---

## 2. Deux façons de ranger les données en mémoire 🗄️

### 2.1 Représentation contiguë — le tableau

Les éléments sont rangés **l'un à la suite de l'autre** dans un espace **contigu**. Connaître l'adresse du **premier** suffit pour atteindre n'importe quel élément par un **calcul d'adresse** :

\`\`\`
        a0   a1   a2   a3   a4   a5   a6
   T :  3    21   6    13   68   4    29
        0    1    2    3    4    5    6      ← indices
\`\`\`

**Formule d'adresse** (accès **direct**, en O(1)) :

\`\`\`
  aᵢ = aᵢ₋₁ + <taille du type>
  aᵢ = a0 + i × <taille du type>
\`\`\`

**Limites du tableau** :
- il faut **connaître la taille max à l'avance** ;
- insertion/suppression → **décalages** coûteux ;
- la libération se fait **automatiquement à la fin** du programme, pas avant ;
- **insertion impossible** si le tableau est plein.

### 2.2 Représentation chaînée — la liste

Les éléments sont **éparpillés** en mémoire. Chaque élément contient l'**adresse de son suivant**. On connaît un **point d'entrée** (l'adresse du premier), on suit les chaînons.

\`\`\`
  tete ──► [ 14 | @ ]──► [ -25 | @ ]──► [ 29 | @ ]──► [ 52 | nil ]
             info suiv                                       │
                                                    fin de liste
\`\`\`

**Propriétés** :
- **aucune contrainte** sur le nombre d'éléments ;
- la structure **grandit/rétrécit** à chaque ajout/suppression ;
- accès **séquentiel** (on part toujours de la tête) ;
- insertion/suppression **sans décalage** ;
- allocation/libération **par programme**.

---

## 3. Variables statiques vs dynamiques 🔑

- **Variable statique** : réservée **automatiquement** à la compilation (on connaît la taille d'avance), libérée à la fin. Définie par *nom, adresse, type, valeur*. Ex : \`Var tab : tableau[20] entier ;\`
- **Variable dynamique** : réservée **manuellement pendant l'exécution**, quand on ne peut pas prévoir le nombre d'éléments. On y accède **via un pointeur**. Définie par *adresse, type, valeur* (**pas de nom** !).

---

## 4. Les pointeurs : @ et ^ 🧭

Un **pointeur** est une variable qui contient l'**adresse mémoire** d'une autre variable. Si \`P\` contient l'adresse de \`A\`, on dit « **P pointe vers A** ».

Deux opérateurs :
- \`@\` : « **adresse de** » (en C : \`&\`) — \`P ← @A\` range l'adresse de A dans P ;
- \`^\` : « **contenu de** » (en C : \`*\`) — \`^P\` désigne la variable **pointée** par P.

**Déclaration** : \`P : ^entier ;\` (« P pointe vers un entier »).

**Exemple guidé** — A vaut 10, B vaut 50 :

\`\`\`
P ← @A ;     // P pointe sur A
B ← ^P ;     // B reçoit le contenu de A (=10)  →  B = 10
^P ← 20 ;    // on met 20 dans la case pointée  →  A = 20  (!)
\`\`\`

⚠️ **Retiens bien** : modifier \`^P\`, c'est modifier **A elle-même**. Le pointeur est une **télécommande** de la variable pointée.

**La constante \`nil\`** (NULL en C) : le pointeur admet une seule constante prédéfinie. \`P ← nil\` signifie « **P ne pointe vers rien** ». C'est le marqueur de **fin de liste** et de **liste vide**.

---

## 5. Allocation & libération dynamiques 🧱

**Allouer** réserve un bloc mémoire et retourne son adresse (en C : \`malloc\`) :

\`\`\`
p : ^entier ;
p ← Allouer(TailleDe(entier)) ;   // en C : p = (int*)malloc(sizeof(int))
^p ← 5 ;                          // on range 5 dans le bloc alloué
\`\`\`

**Libérer** rend le bloc (en C : \`free\`) — **indispensable** pour éviter les fuites :

\`\`\`
Libérer(p) ;   // en C : free(p)
\`\`\`

**Vecteur dynamique** (taille connue à l'exécution seulement) :

\`\`\`
t : ^entier ; n : entier ;
Lire(n) ;
t ← Allouer(n × TailleDe(entier)) ;   // n cases
\`\`\`

**Matrice dynamique** (vecteur de pointeurs vers les lignes) :

\`\`\`
A : ^^entier ; n, m : entier ;
Lire(n) ; Lire(m) ;
A ← Allouer(n × TailleDe(^entier)) ;         // n pointeurs de lignes
Pour i ← 0 à n-1 faire
    A[i] ← Allouer(m × TailleDe(entier)) ;   // chaque ligne : m entiers
Fait ;
// A[i][j] équivaut à ^(^(A+i)+j)
\`\`\`

---

## 6. La liste chaînée unidirectionnelle 🔗

**Déclaration** — une cellule = **info** + **suivant** (pointeur vers la cellule suivante) :

\`\`\`
Type Liste = ^Cellule ;
Type Cellule = Enregistrement
                   info : <typeElement> ;
                   suivant : Liste ;
               FinEnreg ;
Var L : Liste ;
\`\`\`

- point d'entrée = pointeur sur la **1ère cellule** (tête) ;
- le \`suivant\` du **dernier** vaut **nil** ;
- la **liste vide** = le pointeur **nil**.

### 6.1 Créer un nœud

\`\`\`
Fonction Creer_noeud() : Liste
Var L : Liste ;
Début
    L ← Allouer(TailleDe(Cellule)) ;
    Retourner(L) ;
Fin ;
\`\`\`

### 6.2 Ajout en tête

\`\`\`
Procédure Ajout_tete (E/S tete : Liste ; E/ X : <typeElement>)
Var nouv : Liste ;
Début
    nouv ← Creer_noeud() ;
    Si (nouv <> nil) Alors
        (^nouv).info ← X ;
        (^nouv).suivant ← tete ;   // nouv pointe sur l'ancienne tête
        tete ← nouv ;              // la tête devient nouv
    Finsi ;
Fin ;
\`\`\`

\`\`\`
 Avant :  tete ──► [B|@]──► [C|nil]
 Ajout_tete(A) :
          nouv ──► [A|@]─┐
                          └──► [B|@]──► [C|nil]
 Après :  tete ──► [A|@]──► [B|@]──► [C|nil]
\`\`\`

### 6.3 Ajout après une adresse q

\`\`\`
Procédure Ajout_après (E/ q : Liste ; E/ X : <typeElement>)
Var nouv : Liste ;
Début
    nouv ← Creer_noeud() ;
    Si (nouv <> nil) Alors
        (^nouv).info ← X ;
        (^nouv).suivant ← (^q).suivant ;   // 1) nouv reprend le suivant de q
        (^q).suivant ← nouv ;              // 2) q pointe sur nouv
    Finsi ;
Fin ;
\`\`\`

⚠️ **L'ordre est vital** : d'abord \`(^nouv).suivant ← (^q).suivant\`, **puis** \`(^q).suivant ← nouv\`. L'inverse **perdrait** toute la fin de la liste !

### 6.4 Suppression en tête / après q

\`\`\`
Procédure Supprim_Tete (E/S tete : Liste)
Var temp : Liste ;
Début
    temp ← tete ;
    tete ← (^tete).suivant ;   // la tête avance
    libérer(temp) ;            // on rend l'ancienne tête
Fin ;

Procédure Supprim (E/ q : Liste)   // supprime l'élément APRÈS q
Var p : Liste ;
Début
    p ← (^q).suivant ;
    (^q).suivant ← (^p).suivant ;   // q saute par-dessus p
    libérer(p) ;
Fin ;
\`\`\`

### 6.5 Parcours & recherche

\`\`\`
Procédure Affiche_liste (E/ tete : Liste)
Début
    Tantque (tete <> nil) faire
        Ecrire((^tete).info) ;
        tete ← (^tete).suivant ;
    fait ;
Fin ;

Fonction recherche (E/ L : Liste ; E/ val : typeElem) : Liste
Var p : Liste ;
Début
    p ← L ;
    Tantque (p <> nil) et ((^p).info <> val) faire
        p ← (^p).suivant ;
    fait ;
    Retourner p ;   // adresse de la cellule, ou nil si absente
Fin ;
\`\`\`

### 6.6 Création FIFO vs LIFO

- **FIFO** (*First In First Out*) : le **premier** élément créé est la **tête** → on ajoute **en queue** à chaque fois, l'ordre est **conservé**.
- **LIFO** (*Last In First Out*) : le **dernier** créé est **toujours la tête** → on fait \`Ajout_tete\` à chaque fois, l'ordre est **inversé**.

---

## 7. La liste bidirectionnelle ↔️

Deux points d'entrée (**tete** et **queue**) et chaque cellule a **trois** parties : \`info\`, \`suivant\`, **\`precedent\`**. Le \`precedent\` de la tête et le \`suivant\` de la queue valent **nil**.

\`\`\`
  nil ◄─┐                                           ┌─► nil
        [prec|14|suiv] ⇄ [prec|29|suiv] ⇄ [prec|52|suiv]
  tete ─┘                                           └─ queue
\`\`\`

\`\`\`
Type Listebd = ^Cellule ;
Type Cellule = Enregistrement
                   info : <typeElement> ;
                   suivant : Listebd ;
                   precedent : Listebd ;
               FinEnreg ;
Var tete, queue : Listebd ;
\`\`\`

Ajout en queue (liste non vide) — **4 branchements** :

\`\`\`
Procédure Ajout_queue (E/S queue : Listebd ; E/ X : <typeElement>)
Var nouv : Listebd ;
Début
    nouv ← Creer_noeud() ;
    Si (nouv ≠ nil) Alors
        (^nouv).info ← X ;
        (^nouv).suivant ← nil ;
        (^nouv).precedent ← queue ;   // nouv regarde en arrière l'ancienne queue
        (^queue).suivant ← nouv ;     // l'ancienne queue regarde nouv
        queue ← nouv ;                // la queue devient nouv
    Finsi ;
Fin ;
\`\`\`

Avantage : on peut parcourir **dans les deux sens** (tete→queue via \`suivant\`, queue→tete via \`precedent\`).

---

## 8. La liste circulaire 🔄

Un seul sens, un seul point d'entrée (**tete**), mais le \`suivant\` du **dernier** élément pointe **sur la tête** (au lieu de nil) : la liste **boucle**.

\`\`\`
   tete ──► [-45|@]──► [28|@]──► [500|@]──► [62|@]─┐
              ▲                                     │
              └─────────────────────────────────────┘
\`\`\`

Conséquence : pour parcourir, on **isole** le premier (ou dernier) élément, puis on boucle **tant que** \`p <> tete\` :

\`\`\`
Procédure AfficherCir (E/ tete : Liste)
Var p : Liste ;
Début
    p ← tete ;
    Ecrire((^p).info) ;         // on traite le 1er à part
    p ← (^p).suivant ;
    Tantque (p <> tete) faire   // on s'arrête quand on RETOMBE sur tete
        Ecrire((^p).info) ;
        p ← (^p).suivant ;
    fait ;
Fin ;
\`\`\`

---

## 🧠 Ce qu'il faut retenir

- **Contigu (tableau)** = accès direct O(1) mais taille figée ; **chaîné (liste)** = flexible, sans décalage, mais accès séquentiel.
- \`@\` = adresse de, \`^\` = contenu de ; modifier \`^P\` modifie la variable pointée. \`nil\` = pointe vers rien / fin de liste / liste vide.
- \`Allouer\` / \`Libérer\` gèrent la mémoire **à la main** — un \`Allouer\` sans \`Libérer\` = **fuite**.
- Cellule uni = \`info\` + \`suivant\` ; bi = + \`precedent\` (2 points d'entrée) ; circulaire = le dernier \`suivant\` pointe sur la tête.
- Dans les insertions, **relier le nouveau maillon AVANT de casser l'ancien chaînage**.
- **FIFO** conserve l'ordre (ajout en queue), **LIFO** l'inverse (ajout en tête).

## ⚠️ Erreurs fréquentes des débutants

**1. Déréférencer un pointeur nil (ou non initialisé).**
\`\`\`
// ❌ p vaut nil → (^p).info n'existe pas → PLANTAGE (segfault en C)
Ecrire((^p).info) ;
// ✅ toujours tester avant
Si (p <> nil) Alors Ecrire((^p).info) Finsi ;
\`\`\`
Pourquoi : \`^p\` demande « le contenu de l'adresse dans p » ; si p ne pointe nulle part, il n'y a pas de contenu.

**2. Casser le chaînage dans le mauvais ordre.**
\`\`\`
// ❌ on perd toute la fin de la liste
(^q).suivant ← nouv ;          // la suite de q est oubliée
(^nouv).suivant ← (^q).suivant ; // ← vaut déjà nouv : nouv pointe sur lui-même !
// ✅ le nouveau récupère d'abord l'ancien suivant
(^nouv).suivant ← (^q).suivant ;
(^q).suivant ← nouv ;
\`\`\`

**3. Oublier \`Libérer\` → fuite mémoire.** Chaque \`Allouer\` doit avoir son \`Libérer\` quand la cellule disparaît. Sinon la mémoire réservée n'est jamais rendue.

**4. Confondre \`P\` et \`^P\`.** \`P ← nil\` fait pointer P vers rien ; \`^P ← 0\` met 0 **dans la variable pointée**. Écrire \`P ← 20\` (au lieu de \`^P ← 20\`) écrase l'**adresse** par un nombre : catastrophe.

**5. Boucle infinie sur une liste circulaire.**
\`\`\`
// ❌ 'tete' n'étant jamais nil dans un cercle, la boucle ne s'arrête jamais
Tantque (p <> nil) faire … fait ;
// ✅ on s'arrête en retombant sur la tête
Tantque (p <> tete) faire … fait ;
\`\`\`

**6. Oublier le cas « un seul élément » dans les suppressions bi/circulaires.** Quand \`tete = queue\`, supprimer doit remettre \`tete\` **et** \`queue\` à nil, pas juste avancer un pointeur.`,
    badge: {
      id: "badge-pointer-master",
      name: "Pointer Master",
      icon: "Binary",
      description:
        "Maîtrise les pointeurs, l'allocation dynamique et les listes chaînées uni/bi/circulaires avec leurs primitives.",
    },
    challenges: [
      {
        id: "asd-mem-pointeur-trace",
        title: "La télécommande ^P",
        order: 1,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🧭 Contenu de vs adresse de

On exécute (A et P sont respectivement un entier et un pointeur vers entier) :

\`\`\`
A ← 10 ;
P ← @A ;
^P ← 20 ;
\`\`\`

**Quelle est la valeur finale de \`A\` ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "P ← @A fait pointer P sur A. Ensuite ^P désigne la case pointée, c'est-à-dire A elle-même.", cost: 15 },
          { text: "📖 Correction complète : P pointe sur A, donc ^P EST A. L'instruction ^P ← 20 range 20 dans A. Résultat : A = 20.", cost: 60 },
        ],
        answer: 20,
        explanation: `\`P ← @A\` fait pointer \`P\` sur \`A\`. À partir de là, \`^P\` (« contenu de l'adresse dans P ») **désigne \`A\` elle-même**.

Donc \`^P ← 20\` écrit **20 dans A** → \`A = 20\`.

C'est le principe de la **télécommande** : agir sur \`^P\`, c'est agir sur la variable pointée. (Piège fréquent : croire que seule une copie change — non, c'est bien l'original.)`,
        tags: ["pointeur", "chap2"],
      },
      {
        id: "asd-mem-adresse-calc",
        title: "Calcul d'adresse dans un tableau",
        order: 2,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🗄️ Accès direct en représentation contiguë

Un tableau \`T\` d'entiers est rangé de façon contiguë. L'adresse de \`T[0]\` est **1000**, et un entier occupe **4 octets**.

Avec la formule \`aᵢ = a0 + i × <taille du type>\`, **quelle est l'adresse de \`T[5]\` ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Applique aᵢ = a0 + i × taille, avec a0 = 1000, i = 5, taille = 4.", cost: 15 },
          { text: "📖 Correction complète : a5 = 1000 + 5 × 4 = 1000 + 20 = 1020.", cost: 60 },
        ],
        answer: 1020,
        explanation: `La représentation **contiguë** permet un accès **direct** par calcul d'adresse :

\`\`\`
a₅ = a0 + 5 × taille = 1000 + 5 × 4 = 1020
\`\`\`

C'est **le** point fort du tableau : atteindre \`T[5]\` ne coûte qu'**une multiplication et une addition** (O(1)), sans parcourir les cases précédentes. Une liste chaînée, elle, devrait suivre 5 chaînons un par un.`,
        tags: ["tableau", "contigu", "chap2"],
      },
      {
        id: "asd-mem-chaine-avantages",
        title: "Pourquoi passer au chaîné ?",
        order: 3,
        difficulty: "easy",
        type: "multi",
        prompt: `## ⚖️ Contigu vs chaîné

**Coche TOUS les avantages de la représentation chaînée (liste) par rapport au tableau :**`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          { text: "Pense à la taille (fixe ou variable ?), aux décalages lors des insertions, et à la gestion mémoire.", cost: 20 },
          { text: "📖 Correction complète : la liste (1) n'impose aucune taille max, (2) grandit/rétrécit dynamiquement, (3) insère/supprime sans décalage. En revanche l'accès y est SÉQUENTIEL (pas direct) — ce n'est PAS un avantage. Réponses : les trois premières.", cost: 60 },
        ],
        options: [
          "Aucune taille maximale à fixer à l'avance",
          "La structure grandit et rétrécit à l'exécution",
          "Insertion et suppression sans décalage d'éléments",
          "Accès direct au i-ème élément par calcul d'adresse",
        ],
        answer: [0, 1, 2],
        explanation: `La liste chaînée gagne sur la **flexibilité** :

| Avantage | Liste | Tableau |
|---|---|---|
| Pas de taille max | ✅ | ❌ (taille figée) |
| Grandit/rétrécit dynamiquement | ✅ | ❌ |
| Insertion/suppression sans décalage | ✅ | ❌ (décalages) |
| **Accès direct au i-ème** | ❌ (séquentiel) | ✅ (O(1)) |

La dernière proposition est **le point fort du tableau**, pas de la liste : dans une liste, atteindre le i-ème élément oblige à suivre les chaînons depuis la tête.`,
        tags: ["liste", "tableau", "chap2"],
      },
      {
        id: "asd-mem-ajout-tete",
        title: "Écris Ajout_tete (liste unidirectionnelle)",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🔗 Insertion en tête

La liste est déclarée :

\`\`\`
Type Liste = ^Cellule ;
Type Cellule = Enregistrement info : entier ; suivant : Liste ; FinEnreg ;
\`\`\`

**Écris \`Procédure Ajout_tete(E/S tete : Liste ; E/ X : entier)\`** qui insère \`X\` en tête. Suppose \`Creer_noeud()\` déjà disponible (elle retourne une cellule allouée).`,
        points: 200,
        timeLimitSec: 600,
        starter: `Procédure Ajout_tete (E/S tete : Liste ; E/ X : entier)
Var nouv : Liste ;
Debut

Fin ;`,
        hints: [
          { text: "Crée un nœud, range X dans son info, branche son suivant sur l'ancienne tête, puis fais pointer tete sur nouv.", cost: 25 },
          { text: "L'ordre `(^nouv).suivant ← tete` PUIS `tete ← nouv` évite de perdre la liste existante.", cost: 30 },
          { text: "📖 Correction complète :\n```\nnouv <- Creer_noeud() ;\nSi (nouv <> nil) Alors\n    (^nouv).info <- X ;\n    (^nouv).suivant <- tete ;\n    tete <- nouv ;\nFinsi ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Crée un nouveau nœud (Creer_noeud ou Allouer)", pattern: "(Creer_noeud|Allouer)", flags: "i" },
            { label: "Range X dans le champ info du nouveau nœud", pattern: "info\\s*(←|<-)\\s*X", flags: "i" },
            { label: "Branche le suivant du nouveau nœud sur l'ancienne tête", pattern: "suivant\\s*(←|<-)\\s*tete", flags: "i" },
            { label: "Fais pointer tete sur le nouveau nœud", pattern: "tete\\s*(←|<-)\\s*nouv", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Procédure Ajout_tete (E/S tete : Liste ; E/ X : entier)
Var nouv : Liste ;
Debut
    nouv ← Creer_noeud() ;
    Si (nouv <> nil) Alors
        (^nouv).info ← X ;
        (^nouv).suivant ← tete ;   // nouv reprend l'ancienne tête
        tete ← nouv ;              // la tête devient nouv
    Finsi ;
Fin ;
\`\`\`

On teste \`nouv <> nil\` car \`Allouer\` peut **échouer** si la mémoire est pleine. L'ordre des deux dernières lignes est crucial : inverser ferait pointer \`nouv\` sur lui-même et **perdrait** toute la liste existante.`,
        tags: ["liste", "code", "insertion", "chap2"],
      },
      {
        id: "asd-mem-supprim-tete",
        title: "Écris Supprim_Tete (sans fuite)",
        order: 5,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## ✂️ Suppression en tête

**Écris \`Procédure Supprim_Tete(E/S tete : Liste)\`** qui retire le premier élément d'une liste unidirectionnelle **et libère sa mémoire**.`,
        points: 200,
        timeLimitSec: 600,
        starter: `Procédure Supprim_Tete (E/S tete : Liste)
Var temp : Liste ;
Debut

Fin ;`,
        hints: [
          { text: "Garde l'ancienne tête dans temp, avance tete sur le suivant, puis libère temp.", cost: 25 },
          { text: "Si tu avances tete AVANT de mémoriser temp, tu perds l'adresse à libérer.", cost: 30 },
          { text: "📖 Correction complète :\n```\ntemp <- tete ;\ntete <- (^tete).suivant ;\nlibérer(temp) ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Mémorise l'ancienne tête dans temp", pattern: "temp\\s*(←|<-)\\s*tete", flags: "i" },
            { label: "Fais avancer tete sur l'élément suivant", pattern: "tete\\s*(←|<-)\\s*\\(\\s*\\^\\s*tete\\s*\\)\\s*\\.\\s*suivant", flags: "i" },
            { label: "Libère l'ancienne tête (pas de fuite mémoire)", pattern: "lib[eé]rer\\s*\\(\\s*temp", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Procédure Supprim_Tete (E/S tete : Liste)
Var temp : Liste ;
Debut
    temp ← tete ;              // on retient l'ancienne tête
    tete ← (^tete).suivant ;   // la tête avance
    libérer(temp) ;            // on rend la mémoire
Fin ;
\`\`\`

Sans \`temp\`, après \`tete ← (^tete).suivant\` l'ancienne tête serait **inaccessible** → impossible à libérer → **fuite mémoire**. (En pratique on ajouterait un test \`Si tete <> nil\` pour ne pas dépiler une liste vide.)`,
        tags: ["liste", "code", "suppression", "memoire", "chap2"],
      },
      {
        id: "asd-mem-recherche",
        title: "Rechercher une valeur dans une liste",
        order: 6,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🔎 Recherche séquentielle

**Écris \`Fonction recherche(E/ L : Liste ; E/ val : entier) : Liste\`** qui retourne l'**adresse** de la première cellule contenant \`val\`, ou **nil** si elle n'existe pas.`,
        points: 200,
        timeLimitSec: 720,
        starter: `Fonction recherche (E/ L : Liste ; E/ val : entier) : Liste
Var p : Liste ;
Debut

Fin ;`,
        hints: [
          { text: "Parcours avec un pointeur p depuis L, tant que p <> nil ET que (^p).info <> val.", cost: 25 },
          { text: "À la sortie de la boucle, p vaut soit l'adresse trouvée, soit nil : il suffit de le retourner.", cost: 30 },
          { text: "📖 Correction complète :\n```\np <- L ;\nTantque (p <> nil) et ((^p).info <> val) faire\n    p <- (^p).suivant ;\nfait ;\nRetourner p ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Initialise le pointeur de parcours p sur L", pattern: "p\\s*(←|<-)\\s*L", flags: "i" },
            { label: "Boucle tant que p <> nil et info <> val", pattern: "Tant\\s*que[\\s\\S]{0,60}(nil|NIL)[\\s\\S]{0,40}(<>|≠|!=)[\\s\\S]{0,20}val", flags: "i" },
            { label: "Avance p vers le suivant dans la boucle", pattern: "p\\s*(←|<-)\\s*\\(\\s*\\^\\s*p\\s*\\)\\s*\\.\\s*suivant", flags: "i" },
            { label: "Retourne p (adresse trouvée ou nil)", pattern: "[Rr]etourner\\s*\\(?\\s*p", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Fonction recherche (E/ L : Liste ; E/ val : entier) : Liste
Var p : Liste ;
Debut
    p ← L ;
    Tantque (p <> nil) et ((^p).info <> val) faire
        p ← (^p).suivant ;
    fait ;
    Retourner p ;
Fin ;
\`\`\`

**Pourquoi tester \`p <> nil\` EN PREMIER ?** Grâce à l'évaluation de gauche à droite, si \`p\` vaut nil la 2ᵉ condition \`(^p).info\` n'est **pas évaluée** — sinon on déréférencerait nil (plantage). À la sortie : soit \`p\` pointe sur la cellule trouvée, soit \`p = nil\` (valeur absente). Complexité : **O(n)** (parcours séquentiel).`,
        tags: ["liste", "code", "recherche", "chap2"],
      },
      {
        id: "asd-mem-fifo-lifo",
        title: "FIFO ou LIFO ? L'ordre de création",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔀 Modes de création d'une liste

On crée une liste en insérant les valeurs **10, 20, 30** (dans cet ordre) en utilisant **\`Ajout_tete\`** à chaque insertion.

**Dans quel ordre les valeurs apparaissent-elles quand on parcourt la liste de la tête vers la fin ?**`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "Ajout_tete place chaque nouvelle valeur DEVANT les précédentes. La dernière insérée devient la tête.", cost: 20 },
          { text: "C'est le mode LIFO : Last In, First Out → l'ordre de parcours est inversé.", cost: 25 },
          { text: "📖 Correction complète : Ajout_tete(10)→[10] ; Ajout_tete(20)→[20,10] ; Ajout_tete(30)→[30,20,10]. Parcours : 30, 20, 10 (mode LIFO, ordre inversé).", cost: 60 },
        ],
        options: ["10, 20, 30", "30, 20, 10", "20, 10, 30", "L'ordre est indéterminé"],
        answer: 1,
        explanation: `\`Ajout_tete\` insère **toujours devant** → la dernière valeur insérée devient la **tête** :

\`\`\`
Ajout_tete(10)  →  [10]
Ajout_tete(20)  →  [20]→[10]
Ajout_tete(30)  →  [30]→[20]→[10]
\`\`\`

Parcours tête→fin : **30, 20, 10** — l'ordre est **inversé**. C'est le mode **LIFO** (*Last In, First Out*).

Pour conserver l'ordre d'insertion (**FIFO** : 10, 20, 30), il aurait fallu ajouter **en queue** à chaque fois.`,
        tags: ["liste", "fifo", "lifo", "chap2"],
      },
      {
        id: "asd-mem-circulaire",
        title: "La boucle sans fin… maîtrisée",
        order: 8,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔄 Parcours d'une liste circulaire

Dans une **liste circulaire**, le champ \`suivant\` du dernier élément pointe sur la tête.

**Quelle condition d'arrêt utilise-t-on pour parcourir une liste circulaire (après avoir traité le 1er élément à part) ?**`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "Dans un cercle, aucun suivant ne vaut nil : la condition p <> nil ne s'arrêterait jamais.", cost: 20 },
          { text: "📖 Correction complète : on s'arrête quand on RETOMBE sur la tête, donc Tantque (p <> tete). Tester p <> nil boucle à l'infini car le cercle n'a pas de nil.", cost: 60 },
        ],
        options: [
          "Tantque (p <> nil)",
          "Tantque (p <> tete)",
          "Tantque ((^p).suivant = nil)",
          "Tantque (p = tete)",
        ],
        answer: 1,
        explanation: `Une liste circulaire **n'a pas de nil** : le dernier \`suivant\` reboucle sur la **tête**. Tester \`p <> nil\` provoquerait donc une **boucle infinie**.

On traite le premier élément **à part**, on avance, puis on boucle **\`Tantque (p <> tete)\`** : on s'arrête pile quand on **retombe** sur la tête.

\`\`\`
p ← tete ; Ecrire((^p).info) ; p ← (^p).suivant ;
Tantque (p <> tete) faire
    Ecrire((^p).info) ; p ← (^p).suivant ;
fait ;
\`\`\``,
        tags: ["liste", "circulaire", "chap2"],
      },
      {
        id: "asd-mem-matrice-dyn",
        title: "Allouer une matrice dynamiquement",
        order: 9,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🧱 Matrice dynamique n × m

Une matrice dynamique se représente par un **vecteur de \`n\` pointeurs** (les lignes), chaque ligne étant un vecteur de \`m\` entiers.

**Écris le fragment qui alloue une matrice \`A : ^^entier\` de \`n\` lignes et \`m\` colonnes** (n et m déjà lus). Alloue d'abord le vecteur de lignes, puis chaque ligne dans une boucle.`,
        points: 350,
        timeLimitSec: 900,
        starter: `Var A : ^^entier ; n, m, i : entier ;
Debut
    Lire(n) ; Lire(m) ;

Fin.`,
        hints: [
          { text: "Alloue A avec n × TailleDe(^entier) : c'est le tableau des adresses de lignes.", cost: 30 },
          { text: "Puis Pour i ← 0 à n-1 : A[i] ← Allouer(m × TailleDe(entier)).", cost: 35 },
          { text: "📖 Correction complète :\n```\nA <- Allouer(n * TailleDe(^entier)) ;\nPour i <- 0 à n-1 faire\n    A[i] <- Allouer(m * TailleDe(entier)) ;\nFait ;\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Alloue le vecteur de n pointeurs de lignes", pattern: "A\\s*(←|<-)\\s*Allouer\\s*\\([\\s\\S]{0,40}(\\^\\s*entier|pointeur)", flags: "i" },
            { label: "Boucle Pour sur les n lignes", pattern: "Pour[\\s\\S]{0,40}(n-1|n\\s*-\\s*1)", flags: "i" },
            { label: "Alloue chaque ligne avec m entiers", pattern: "A\\s*\\[\\s*i\\s*\\]\\s*(←|<-)\\s*Allouer\\s*\\([\\s\\S]{0,30}entier", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Lire(n) ; Lire(m) ;
A ← Allouer(n × TailleDe(^entier)) ;      // n adresses de lignes
Pour i ← 0 à n-1 faire
    A[i] ← Allouer(m × TailleDe(entier)) ; // chaque ligne : m entiers
Fait ;
\`\`\`

**Deux niveaux d'allocation** : \`A\` est un \`^^entier\` (pointeur vers un tableau de pointeurs). On alloue d'abord le **vecteur des lignes** (n cases de type \`^entier\`), puis **chaque ligne** séparément (m entiers). \`A[i][j]\` équivaut alors à \`^(^(A+i)+j)\` : on suit \`A[i]\` (adresse de la ligne i) puis on décale de j. Ne pas oublier, à la fin du programme, de \`Libérer\` chaque ligne **puis** le vecteur de lignes (dans l'ordre inverse).`,
        tags: ["matrice", "allocation", "code", "chap2"],
      },
    ],
  },
];
