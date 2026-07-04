import type { CourseSeed } from "../../../types";

/**
 * ASD L2 — Arbres binaires de recherche .
 * Terminologie, représentation chaînée (succg/succd), parcours, recherche,
 * insertion, suppression (feuille / 1 fils / 2 fils via successeur infixe).
 */
export const asdArbres: CourseSeed[] = [
  {
    slug: "asd-arbres",
    title: "Arbres binaires de recherche — parcours, insertion, suppression",
    checkpoint: "algorithmique",
    codename: "Binary Tree Rally",
    domain: "Structures de données L2",
    theme: "circuit",
    icon: "Orbit",
    accent: "#D98F6D",
    order: 8,
    difficulty: "hard",
    summary:
      "La structure hiérarchique reine : l'arbre binaire de recherche (ABR). Terminologie, représentation chaînée (succg/succd), les trois parcours (préfixe/infixe/postfixe), recherche, insertion, et la suppression dans ses trois cas.",
    objectives: [
      "Maîtriser le vocabulaire des arbres (racine, feuille, nœud, fils, degré, profondeur)",
      "Comprendre la propriété d'un ABR (gauche < nœud < droite)",
      "Dérouler les trois parcours : préfixe, infixe, postfixe",
      "Savoir que le parcours infixe d'un ABR donne l'ordre trié",
      "Écrire la recherche (récursive et itérative) et l'insertion dans un ABR",
      "Traiter les trois cas de suppression (feuille, un fils, deux fils)",
    ],
    lesson: `# 🌳 Arbres binaires de recherche — le Binary Tree Rally

Fini les structures **linéaires** (listes, piles, files) où l'on avance en file indienne. L'**arbre** est **hiérarchique** : il se ramifie, comme un arbre généalogique ou l'organisation d'une entreprise. Et l'**arbre binaire de recherche** est une petite merveille d'efficacité. 🏎️

---

## 1. Vocabulaire des arbres 🌲

\`\`\`
              (50)          ← racine (le sommet, sans père)
             /    \\
          (30)    (70)      ← nœuds internes
          /  \\    /  \\
       (20) (40)(60) (80)   ← feuilles (sans fils)
\`\`\`

| Terme | Définition |
|---|---|
| **Racine** | le nœud du sommet, **sans père** (unique) |
| **Nœud** | un élément de l'arbre (info + liens vers ses fils) |
| **Fils gauche / droit** | les deux descendants directs d'un nœud (binaire = **≤ 2 fils**) |
| **Père** | le nœud dont un nœud est le fils |
| **Feuille** | un nœud **sans fils** (succg = succd = nil) |
| **Degré d'un nœud** | son nombre de fils (0, 1 ou 2) |
| **Profondeur / niveau** | distance (en nombre d'arêtes) depuis la racine |
| **Hauteur** | la profondeur maximale de l'arbre |

Un **arbre binaire** est soit **vide**, soit composé d'une racine et de **deux sous-arbres** binaires (gauche et droit).

---

## 2. La propriété ABR 🔑

Un **Arbre Binaire de Recherche (ABR)** respecte, pour **chaque** nœud, la règle d'or :

> **Tout ce qui est à GAUCHE est plus petit ; tout ce qui est à DROITE est plus grand.**

\`\`\`
          (50)
         /    \\
     < 50      > 50
       (30)    (70)
      /   \\   /   \\
   (20) (40)(60) (80)
\`\`\`

Conséquence magique : rechercher revient à **descendre** en choisissant gauche ou droite → on **divise par deux** l'espace de recherche à chaque étape (dans un arbre équilibré : **O(log n)** !).

---

## 3. Représentation chaînée 🔗

Chaque nœud contient une **info** et **deux pointeurs** (fils gauche, fils droit) :

\`\`\`
Type Elt_arbre = Enregistrement
                     info : <typeElement> ;
                     succg, succd : ^Elt_arbre ;   // fils gauche, fils droit
                 FinEnreg ;
Type noeud = ^Elt_arbre ;
\`\`\`

Primitives utiles (supposées disponibles) : \`Nonvide(a)\` (a ≠ nil), \`Feuille(a)\` (succg = succd = nil), \`filsgauche(a)\` = \`(^a).succg\`, \`filsdroit(a)\` = \`(^a).succd\`.

---

## 4. Les trois parcours 🚶

Visiter tous les nœuds. La différence : **quand** on traite la racine par rapport à ses sous-arbres.

Sur l'arbre exemple :

\`\`\`
          (50)
         /    \\
       (30)   (70)
      /  \\    /  \\
   (20)(40) (60)(80)
\`\`\`

### 4.1 Préfixe (Racine → Gauche → Droite)
\`\`\`
Procédure Prefixe (E/ a : noeud)
Debut
    Si Nonvide(a) Alors
        Ecrire((^a).info) ;       // 1. racine d'abord
        Prefixe(filsgauche(a)) ;  // 2. sous-arbre gauche
        Prefixe(filsdroit(a)) ;   // 3. sous-arbre droit
    Fsi ;
Fin ;
\`\`\`
→ **50, 30, 20, 40, 70, 60, 80**

### 4.2 Infixe (Gauche → Racine → Droite)
\`\`\`
Procédure Infixe (E/ a : noeud)
Debut
    Si Nonvide(a) Alors
        Infixe(filsgauche(a)) ;   // 1. gauche
        Ecrire((^a).info) ;       // 2. racine au milieu
        Infixe(filsdroit(a)) ;    // 3. droite
    Fsi ;
Fin ;
\`\`\`
→ **20, 30, 40, 50, 60, 70, 80** — **TRIÉ !** 🎯 (propriété fondamentale de l'ABR)

### 4.3 Postfixe (Gauche → Droite → Racine)
\`\`\`
Procédure Postfixe (E/ a : noeud)
Debut
    Si Nonvide(a) Alors
        Postfixe(filsgauche(a)) ; // 1. gauche
        Postfixe(filsdroit(a)) ;  // 2. droite
        Ecrire((^a).info) ;       // 3. racine en dernier
    Fsi ;
Fin ;
\`\`\`
→ **20, 40, 30, 60, 80, 70, 50**

> 🧠 Mémo : **Pré/In/Post** indique **quand** on traite la **racine** — a**v**ant, a**u** milieu, a**p**rès ses fils. Les fils sont **toujours** gauche puis droite.

---

## 5. Recherche dans un ABR 🔎

On compare, puis on descend à gauche (si plus petit) ou à droite (si plus grand).

**Version récursive** :

\`\`\`
Fonction RECHERCHE (E/ a : noeud, E/ M : <type>, E/S pere : noeud) : noeud
Debut
    Si Nonvide(a) Alors
        Si compare((^a).info, M) = 0 Alors
            Retourner(a) ;                      // trouvé
        Sinon
            pere ← a ;
            Si compare((^a).info, M) > 0 Alors  // M plus petit → à gauche
                Retourner(RECHERCHE(filsgauche(a), M, pere)) ;
            Sinon                                // M plus grand → à droite
                Retourner(RECHERCHE(filsdroit(a), M, pere)) ;
            Fsi ;
        Fsi ;
    Sinon Retourner(nil) ;                       // pas trouvé
    Fsi ;
Fin ;
\`\`\`

**Version itérative** (même logique, avec une boucle) :

\`\`\`
Fonction RECH_iter (E/ a : noeud, E/ M : <type>, E/S pere : noeud) : noeud
Debut
    Tantque Nonvide(a) Faire
        Si compare((^a).info, M) = 0 Alors Retourner(a) ; Fsi ;
        pere ← a ;
        Si compare((^a).info, M) > 0 Alors a ← filsgauche(a) ;
        Sinon a ← filsdroit(a) ; Fsi ;
    Fait ;
    Retourner(nil) ;
Fin ;
\`\`\`

Le paramètre \`pere\` mémorise le **parent** — indispensable pour l'insertion et la suppression.

---

## 6. Insertion dans un ABR ➕

On **cherche** d'abord la valeur. Si elle existe déjà, rien à faire (ou on met à jour). Sinon, on crée un nœud et on le **raccorde au père** trouvé, à gauche ou à droite selon la comparaison :

\`\`\`
Procédure Ajout (E/S a : noeud, E/ M : <type>)
Var adr, pere, nd : noeud ;
Debut
    pere ← nil ;
    adr ← RECHERCHE(a, M, pere) ;
    Si adr = nil Alors                       // le mot n'existe pas → on l'insère
        nd ← Allouer(TailleDe(Elt_arbre)) ;
        (^nd).info ← M ;
        (^nd).succg ← nil ; (^nd).succd ← nil ;
        Si a = nil Alors a ← nd ;            // arbre vide → nd devient racine
        Sinon Si compare((^pere).info, M) > 0 Alors (^pere).succg ← nd ;
              Sinon (^pere).succd ← nd ; Fsi ;
        Fsi ;
    Fsi ;
Fin ;
\`\`\`

---

## 7. Suppression : trois cas 🗑️

Après avoir localisé le nœud \`adr\` (et son \`père\`) :

### Cas 1 — feuille (0 fils)
On la détache simplement (le père pointe nil à sa place) et on la libère.
\`\`\`
Si (^pere).succg = adr Alors (^pere).succg ← nil ; Sinon (^pere).succd ← nil ; Fsi ;
libérer(adr) ;
\`\`\`

### Cas 2 — un seul fils
On **court-circuite** : le père adopte le fils unique du nœud supprimé.
\`\`\`
// si adr est fils gauche du père et a un fils gauche :
(^pere).succg ← (^adr).succg ;   // (ou succd selon la configuration)
libérer(adr) ;
\`\`\`

### Cas 3 — deux fils (le cas subtil !)
On ne peut pas simplement détacher. On remplace la valeur de \`adr\` par celle de son **successeur infixe** = **le plus petit nœud du sous-arbre droit** (le plus à gauche en partant du fils droit), puis on supprime **ce successeur** (qui est forcément une feuille ou un nœud à 1 fils) :

\`\`\`
pere ← adr ; Succ_inf ← filsdroit(adr) ;
Tantque Nonvide(filsgauche(Succ_inf)) Faire   // descendre tout à gauche
    pere ← Succ_inf ; Succ_inf ← filsgauche(Succ_inf) ;
Fait ;
(^adr).info ← (^Succ_inf).info ;              // on recopie la valeur
// puis on supprime Succ_inf (feuille ou 1 fils)
\`\`\`

> 🎯 **Pourquoi le successeur infixe ?** C'est la **plus petite valeur supérieure** à celle du nœud : la mettre à la place de \`adr\` **conserve** la propriété ABR (tout à gauche reste plus petit, tout à droite reste plus grand).

---

## 🧠 Ce qu'il faut retenir

- **Arbre binaire** = vide, ou une racine + 2 sous-arbres. Feuille = sans fils.
- **ABR** : gauche < nœud < droite pour **chaque** nœud → recherche en **O(log n)** si équilibré.
- Nœud chaîné = \`info\` + \`succg\` + \`succd\`.
- **Préfixe** (R,G,D), **Infixe** (G,R,D), **Postfixe** (G,D,R). L'**infixe d'un ABR = trié**.
- Recherche : comparer et descendre gauche/droite ; garder le **père**.
- Insertion : chercher, créer, raccorder au père.
- Suppression : **feuille** (détacher), **1 fils** (court-circuiter), **2 fils** (remplacer par le **successeur infixe** puis le supprimer).

## ⚠️ Erreurs fréquentes des débutants

**1. Traiter la racine au mauvais moment dans le parcours.**
\`\`\`
// ❌ « infixe » mais racine écrite en premier → c'est du préfixe !
Ecrire((^a).info) ; Infixe(filsgauche(a)) ; Infixe(filsdroit(a)) ;
// ✅ infixe = gauche, PUIS racine, PUIS droite
Infixe(filsgauche(a)) ; Ecrire((^a).info) ; Infixe(filsdroit(a)) ;
\`\`\`

**2. Oublier le cas de base (arbre vide) dans une fonction récursive.** Sans \`Si Nonvide(a)\`, la récursion déréférence nil → **plantage**. Le \`Sinon\` (arbre vide) est la **condition d'arrêt**.

**3. Casser la propriété ABR à l'insertion.** Insérer « quelque part » sans comparer détruit l'ABR. Il faut **toujours** descendre selon \`compare\` et raccorder au bon côté du **père**.

**4. Supprimer un nœud à 2 fils comme une feuille.** Détacher un nœud à deux fils **perd** tout un sous-arbre. Le cas à 2 fils **exige** le remplacement par le successeur infixe.

**5. Confondre profondeur d'un nœud et hauteur de l'arbre.** La profondeur est propre à **un nœud** (distance à la racine) ; la hauteur est le **maximum** sur tout l'arbre.`,
    badge: {
      id: "badge-tree-master",
      name: "Tree Master",
      icon: "Orbit",
      description:
        "Maîtrise les arbres binaires de recherche : parcours, recherche, insertion et les trois cas de suppression.",
    },
    challenges: [
      {
        id: "asd-arb-vocab",
        title: "Le vocabulaire de l'arbre",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🌲 Terminologie

**Qu'est-ce qu'une FEUILLE dans un arbre binaire ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Pense à un vrai arbre : la feuille est au bout d'une branche, rien ne pousse après.", cost: 15 },
          { text: "📖 Correction complète : une feuille est un nœud SANS fils (succg = succd = nil), donc de degré 0.", cost: 60 },
        ],
        options: [
          "Un nœud sans aucun fils (succg = succd = nil)",
          "Le nœud du sommet, sans père",
          "Un nœud qui a exactement deux fils",
          "N'importe quel nœud interne de l'arbre",
        ],
        answer: 0,
        explanation: `Une **feuille** est un nœud **sans fils** : \`succg = succd = nil\`, donc de **degré 0**. C'est le bout d'une branche.

Les distracteurs : le nœud « sans père » est la **racine** ; un nœud à deux fils est un nœud **interne** (degré 2).`,
        tags: ["arbre", "vocabulaire"],
      },
      {
        id: "asd-arb-propriete",
        title: "La règle d'or de l'ABR",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔑 Propriété d'un arbre binaire de recherche

Dans un **ABR**, pour n'importe quel nœud contenant la valeur \`v\` :

**Quelle relation lient ses sous-arbres gauche et droit ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Le tri se fait de gauche à droite : les petites valeurs d'un côté, les grandes de l'autre.", cost: 15 },
          { text: "📖 Correction complète : tout le sous-arbre gauche < v < tout le sous-arbre droit. C'est ce qui rend la recherche dichotomique (O(log n)).", cost: 60 },
        ],
        options: [
          "Toutes les valeurs à gauche sont < v, toutes celles à droite sont > v",
          "Toutes les valeurs à gauche sont > v, toutes celles à droite sont < v",
          "Les deux sous-arbres contiennent des valeurs quelconques",
          "Le sous-arbre gauche est toujours une feuille",
        ],
        answer: 0,
        explanation: `La règle d'or de l'ABR : pour **chaque** nœud \`v\`, **tout le sous-arbre gauche < v < tout le sous-arbre droit**.

C'est exactement ce qui permet la recherche **dichotomique** : à chaque nœud on élimine la moitié des possibilités en descendant d'un seul côté → **O(log n)** dans un arbre équilibré.`,
        tags: ["arbre", "abr"],
      },
      {
        id: "asd-arb-infixe-trie",
        title: "Le parcours qui trie",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚶 Quel parcours donne l'ordre croissant ?

Sur un **arbre binaire de recherche**, un des trois parcours affiche les valeurs **triées par ordre croissant**.

**Lequel ?**`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "Ce parcours traite le sous-arbre gauche (les petits), puis la racine, puis le droit (les grands).", cost: 20 },
          { text: "📖 Correction complète : le parcours INFIXE (Gauche, Racine, Droite) donne l'ordre trié, car dans un ABR gauche < racine < droite à chaque niveau.", cost: 60 },
        ],
        options: ["Le parcours préfixe (R, G, D)", "Le parcours infixe (G, R, D)", "Le parcours postfixe (G, D, R)", "Aucun, il faut trier après"],
        answer: 1,
        explanation: `Le parcours **infixe** (**G**auche → **R**acine → **D**roite) affiche un ABR **dans l'ordre croissant**.

Pourquoi ? À chaque nœud, on visite d'abord **tout ce qui est plus petit** (sous-arbre gauche), puis le nœud, puis **tout ce qui est plus grand** (sous-arbre droit). Appliqué récursivement, cela produit la suite triée.

\`\`\`
        (50)
       /    \\
     (30)   (70)      Infixe → 20, 30, 40, 50, 60, 70, 80  ✅ trié
    /  \\   /  \\
  (20)(40)(60)(80)
\`\`\``,
        tags: ["arbre", "parcours", "infixe"],
      },
      {
        id: "asd-arb-prefixe-trace",
        title: "Dérouler un parcours préfixe",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🌳 Parcours préfixe

Soit l'ABR :

\`\`\`
          (50)
         /    \\
       (30)   (70)
      /  \\    /  \\
   (20)(40) (60)(80)
\`\`\`

Donne le résultat du parcours **préfixe** (Racine, Gauche, Droite). Écris les 7 valeurs **séparées par des espaces**, dans l'ordre de visite.`,
        points: 200,
        timeLimitSec: 600,
        hints: [
          { text: "Préfixe = racine d'ABORD, puis tout le sous-arbre gauche (en préfixe), puis tout le droit. Commence par 50, puis descends à gauche : 30…", cost: 25 },
          { text: "50, puis (30, 20, 40), puis (70, 60, 80).", cost: 30 },
          { text: "📖 Correction complète : 50 30 20 40 70 60 80. On écrit la racine 50, on part à gauche (30 puis ses fils 20 et 40), puis à droite (70 puis 60 et 80).", cost: 60 },
        ],
        answer: "50 30 20 40 70 60 80",
        accept: ["50,30,20,40,70,60,80", "50 30 20 40 70 60 80 "],
        caseSensitive: false,
        explanation: `Préfixe = **Racine, puis Gauche (en préfixe), puis Droite (en préfixe)** :

\`\`\`
50                     ← racine
  → sous-arbre gauche : 30, puis 20, puis 40
  → sous-arbre droit  : 70, puis 60, puis 80
\`\`\`

Résultat : **50 30 20 40 70 60 80**.

(À comparer : infixe → 20 30 40 50 60 70 80 (trié) ; postfixe → 20 40 30 60 80 70 50.)`,
        tags: ["arbre", "parcours", "prefixe", "trace"],
      },
      {
        id: "asd-arb-recherche-code",
        title: "Recherche itérative dans un ABR",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🔎 Chercher en descendant

Écris la fonction **itérative** \`RECH_iter(E/ a : noeud, E/ M : entier) : noeud\` qui retourne l'adresse du nœud contenant \`M\`, ou **nil** s'il n'existe pas. Descends à gauche si \`M\` est plus petit que la valeur du nœud, à droite sinon.`,
        points: 350,
        timeLimitSec: 1200,
        starter: `Fonction RECH_iter (E/ a : noeud, E/ M : entier) : noeud
Debut

Fin ;`,
        hints: [
          { text: "Boucle Tantque Nonvide(a). Si (^a).info = M → retourner a. Sinon descendre : si M < (^a).info → a ← filsgauche(a), sinon a ← filsdroit(a).", cost: 30 },
          { text: "Après la boucle (a devenu nil), retourner nil : la valeur est absente.", cost: 40 },
          { text: "📖 Correction complète :\n```\nTantque Nonvide(a) Faire\n    Si (^a).info = M Alors Retourner(a) ;\n    Sinon Si M < (^a).info Alors a <- filsgauche(a) ;\n          Sinon a <- filsdroit(a) ; Fsi ;\n    Fsi ;\nFait ;\nRetourner(nil) ;\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Boucle Tantque tant que le nœud a est non vide", pattern: "Tant\\s*que[\\s\\S]{0,30}(Nonvide|nil|NIL|<>)", flags: "i" },
            { label: "Compare la valeur du nœud (^a).info à M", pattern: "\\(\\s*\\^\\s*a\\s*\\)\\s*\\.\\s*info", flags: "i" },
            { label: "Descend à gauche (filsgauche ou succg)", pattern: "(filsgauche|succg)", flags: "i" },
            { label: "Descend à droite (filsdroit ou succd)", pattern: "(filsdroit|succd)", flags: "i" },
            { label: "Retourne nil si la valeur est absente", pattern: "[Rr]etourner\\s*\\(?\\s*(nil|NIL)", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Fonction RECH_iter (E/ a : noeud, E/ M : entier) : noeud
Debut
    Tantque Nonvide(a) Faire
        Si (^a).info = M Alors
            Retourner(a) ;                     // trouvé
        Sinon
            Si M < (^a).info Alors a ← filsgauche(a) ;   // M plus petit → gauche
            Sinon a ← filsdroit(a) ;                     // M plus grand → droite
            Fsi ;
        Fsi ;
    Fait ;
    Retourner(nil) ;                           // sorti de l'arbre → absent
Fin ;
\`\`\`

**Pourquoi c'est efficace ?** À chaque tour, on **élimine la moitié** de l'arbre (on ne descend que d'un côté). Dans un ABR équilibré de \`n\` nœuds, on fait au plus **log₂(n)** comparaisons — bien mieux que les \`n\` d'une liste. La version **récursive** fait exactement la même chose, en remplaçant la boucle par des appels sur \`filsgauche\`/\`filsdroit\`.`,
        tags: ["arbre", "recherche", "code"],
      },
      {
        id: "asd-arb-suppression",
        title: "Supprimer un nœud à deux fils",
        order: 6,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🗑️ Le cas subtil de la suppression

On veut supprimer d'un ABR un nœud qui possède **deux fils**. On ne peut pas simplement le détacher (on perdrait un sous-arbre).

**Par quelle valeur remplace-t-on ce nœud pour conserver la propriété ABR ?**`,
        points: 350,
        timeLimitSec: 900,
        hints: [
          { text: "Il faut la plus petite valeur qui reste supérieure à celle du nœud supprimé : le successeur infixe.", cost: 30 },
          { text: "Le successeur infixe est le nœud le plus à GAUCHE du sous-arbre DROIT.", cost: 40 },
          { text: "📖 Correction complète : on remplace par le SUCCESSEUR INFIXE = le plus petit nœud du sous-arbre droit (descendre à droite une fois, puis tout à gauche). Puis on supprime ce successeur (feuille ou 1 fils). Cela préserve gauche < nœud < droite.", cost: 70 },
        ],
        options: [
          "Par son successeur infixe : le plus petit nœud de son sous-arbre droit",
          "Par son fils gauche, systématiquement",
          "Par la racine de l'arbre",
          "Par la plus grande valeur de tout l'arbre",
        ],
        answer: 0,
        explanation: `On remplace la valeur du nœud par celle de son **successeur infixe** = le **plus petit nœud du sous-arbre droit** (on descend une fois à droite, puis **tout à gauche**), puis on **supprime ce successeur** (qui est forcément une feuille ou un nœud à un seul fils — cas faciles).

\`\`\`
Succ_inf ← filsdroit(a) ;
Tantque Nonvide(filsgauche(Succ_inf)) Faire
    pere ← Succ_inf ; Succ_inf ← filsgauche(Succ_inf) ;
Fait ;
(^a).info ← (^Succ_inf).info ;   // on recopie, puis on supprime Succ_inf
\`\`\`

**Pourquoi ça marche ?** Le successeur infixe est la **plus petite valeur supérieure** à celle du nœud. La placer là **conserve** l'invariant ABR : tout ce qui est à gauche reste plus petit, tout ce qui est à droite reste plus grand.`,
        tags: ["arbre", "suppression"],
      },
    ],
  },
];
