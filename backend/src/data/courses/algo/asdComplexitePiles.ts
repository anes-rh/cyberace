import type { CourseSeed } from "../../../types";

export const asdComplexitePiles: CourseSeed[] = [
  {
    slug: "asd-complexite",
    title: "Complexité des algorithmes",
    checkpoint: "algorithmique",
    codename: "Grand Prix du Grand O",
    domain: "Algorithmique L2",
    theme: "circuit",
    icon: "Cpu",
    accent: "#9B8CCB",
    order: 6,
    difficulty: "medium",
    summary:
      "Apprends à chronométrer tes algorithmes sans chronomètre : unités de temps abstraites, pire des cas, notation Grand O et règles de calcul, avec toutes les démonstrations déroulées pas à pas.",
    objectives: [
      "Comprendre pourquoi on analyse un algorithme : correction ET efficacité",
      "Compter le coût d'un algorithme en unités de temps abstraites",
      "Distinguer meilleur cas, cas moyen et pire cas, et savoir pourquoi le pire cas domine",
      "Maîtriser la notation de Landau O(f(n)) et l'échelle des ordres de complexité",
      "Appliquer les règles de calcul : séquence, alternative, boucles, imbrication",
      "Comparer deux algorithmes résolvant le même problème avant de les implémenter",
    ],
    lesson: `# 🏎️ Complexité des algorithmes — le chrono du code

> Deux pilotes partent du même point et arrivent au même endroit. L'un prend l'autoroute, l'autre les petites routes de montagne. Même résultat… mais pas le même temps. Les algorithmes, c'est pareil : **plusieurs algorithmes peuvent résoudre un même problème de manières différentes**, et notre boulot est de savoir lequel est le plus rapide — *avant* même de prendre le volant.

## 1. Pourquoi analyser un algorithme ?

Pour résoudre un problème donné, on écrit un algorithme. Mais un algorithme doit résoudre le problème **de manière efficace, quelles que soient les données à traiter**. Dans l'analyse des algorithmes, on s'intéresse à deux aspects principaux :

- **Correction** : est-ce que l'algorithme répond correctement au problème posé **dans tous les cas** ?
- **Efficacité** : quel est le **temps d'exécution** de l'algorithme et l'ensemble des **ressources** utilisées ?

Ce chapitre est une **introduction à la complexité (en temps d'exécution)** des algorithmes.

### Le processus de construction et d'analyse d'un algorithme

\`\`\`
 Énoncé du problème
        │
        ▼
 ① Analyser l'énoncé du problème
        │
        ▼
 ② Élaborer un algorithme
        │
        ▼
 ③ Vérification / validation        ← « preuve de programme »
        │
        ▼
 ④ Calcul de complexité             ← indépendant de la machine !
        │
        ▼
 ⑤ Implémentation + évaluation expérimentale
        │
        ▼
 ⑥ Optimisation ?
        │
        ▼
 🏁 « Meilleur » algorithme trouvé
\`\`\`

- **Étape ③ — vérification ou validation** : montrer que l'algorithme **se termine** et **fait bien ce que l'on attend de lui**. C'est la « preuve de programme » (méthodes théoriques de la logique mathématique).
- **Étape ④ — calcul de la complexité théorique** : mesurer l'efficacité de l'algorithme **indépendamment de l'environnement** (machine, système, compilateur, …).

## 2. La complexité théorique

La complexité théorique est calculée en évaluant le **nombre d'opérations élémentaires** (affectations, comparaisons, boucles, appels de fonctions/procédures, …) **en fonction de la taille des données et de la nature des données**.

**Notations :**
- **n** : taille des données ;
- **T(n)** ou **C(n)** : fonction qui donne le nombre d'opérations élémentaires.

\`\`\`
 Entrées (taille n) ──►  Algorithme                     ──► Résultats
                         = opérations élémentaires
                         + boucles
                         + appels de procédures/fonctions

 Ressources consommées = temps d'exécution (CPU) + espace mémoire
\`\`\`

L'analyse de complexité d'un algorithme consiste à déterminer la **quantité de ressources nécessaires à son exécution** : mémoire utilisée, largeur d'une bande passante, temps de calcul, etc. Ici on se concentre sur le **temps**.

### Les paramètres du calcul de complexité

1. la **taille des entrées** ;
2. la **distribution des données** (leur répartition) ;
3. les **structures de données** utilisées.

### Problème et instance de problème

Un **problème** est une question qui a les propriétés suivantes :
- elle est **générique** (s'applique à un ensemble d'éléments) ;
- toute question posée pour chaque élément **admet une réponse**.

*Exemple :* « rechercher une valeur dans un vecteur trié de taille n ≤ 100 ».

Une **instance de problème** est la question posée pour des **données spécifiques** de ce problème.

*Exemple :* « rechercher la valeur 40 dans le vecteur T = {10, 25, 37, 42, 67, 80} ».

Pour un problème donné, on peut avoir **plusieurs instances** (souvent une infinité !) qui diffèrent selon les données. Et attention : **le temps d'exécution diffère d'une instance à l'autre** du même problème. Chercher 10 dans T (première case, bingo 🎯) ne coûte pas la même chose que chercher 99 (absent, il faut tout parcourir).

### À quoi sert la notion de complexité ?

Elle répond à **trois besoins principaux** :

1. **classer les problèmes** selon leur degré de difficulté ;
2. **classer les algorithmes** selon leur efficacité ;
3. **comparer les algorithmes** résolvant un même problème afin de faire un **choix avant de les implémenter**.

### Complexité expérimentale vs complexité théorique

| | Expérimentale 🧪 | Théorique 📐 |
|---|---|---|
| Comment ? | Tests sur des données de différentes tailles (surtout de grande taille) | Formule mathématique en fonction de la taille des données |
| Inconvénients | Les résultats **dépendent des performances de la machine** ; il faut **implémenter** l'algorithme pour le tester | — |
| Avantages | Mesure réelle | Permet de **comparer avant d'implémenter** et de choisir le meilleur algorithme |

**But final** : face à plusieurs algorithmes qui résolvent un même problème, identifier le plus efficace (le plus rapide et/ou celui qui consomme le moins de mémoire) → **trouver une équation qui relie le temps d'exécution à la taille des données**.

## 3. Le barème : les unités de temps abstraites ⏱️

On ne compte pas en secondes ni en minutes : on utilise des **unités de temps abstraites**.

| Élément | Coût |
|---|---|
| Une instruction basique (affectation, +, −, comparaison, …) | **1 unité de temps** |
| Une itération de boucle | **somme des unités** des instructions de la boucle |
| Appel d'une fonction/procédure | **nombre d'unités des instructions** de la fonction/procédure |

## 4. Exemple 1 — la fonction Factorielle : comptage complet 🔢

\`\`\`
Fonction factorielle (E/ n: entier): réel;
Var i: entier; fact: réel;
Debut
    fact ← 1 ;                    // 1 affectation
    i ← 2;                        // 1 affectation
    Tant que (i <= n)             // 1 comparaison        ┐
    faire                         //                      │
        fact ← fact * i;          // 1 multiplication     │ (n-1) fois
                                  // + 1 affectation      │
        i ← i + 1;                // 1 incrémentation     │
                                  // + 1 affectation      ┘
    fait;
    retourner fact;               // 1 retour
Fin ;
\`\`\`

**Comptage.** Avant la boucle : 2 affectations. La boucle s'exécute **(n−1) fois** (pour i = 2, 3, …, n) et chaque tour coûte 5 unités (1 comparaison + 1 multiplication + 1 affectation + 1 incrémentation + 1 affectation). Puis 1 retour :

\`\`\`
C(n) = 2 + (n-1)*5 + 1 = (n-1)*5 + 3 = 5*n - 2 unités
\`\`\`

**Trace d'exécution pour n = 4 :**

| Étape | i | fact | test i ≤ n |
|---|---|---|---|
| initialisation | 2 | 1 | — |
| tour 1 (i=2) | 3 | 2 | 2 ≤ 4 ✅ |
| tour 2 (i=3) | 4 | 6 | 3 ≤ 4 ✅ |
| tour 3 (i=4) | 5 | 24 | 4 ≤ 4 ✅ |
| sortie | 5 | 24 | 5 ≤ 4 ❌ → retourner 24 |

> **Remarque capitale 💡** : en réalité, il ne s'agit pas de calculer *exactement* le nombre d'unités de temps, mais seulement de donner un **ordre de grandeur** du temps d'exécution en fonction de la taille des données. Ici, on dira que le temps d'exécution de Factorielle est **proportionnel à n**.

## 5. Exemple 2 — Recherche séquentielle : quand le comptage exact devient impossible

Chercher une valeur val dans un vecteur d'entiers de taille n :

\`\`\`
Fonction Recherche (E/ T: TAB, E/ n : entier, val: entier): booleen;
Var i: entier;
Debut
    i ← 0                          // 1 affectation
    Tant que (i < n et T[i] <> val)  // 2 comparaisons     ┐ exécutée
    Faire                            //                    │ AU PLUS
        i ← i + 1;                   // 1 incrémentation   │ n fois
    fait;                            // + 1 affectation    ┘
    Si (i = n) alors retourner faux ;   // 1 comparaison
    sinon retourner vrai;               // 1 retour
Fin ;
\`\`\`

Le nombre d'exécutions de la boucle **dépend de la position de val dans le vecteur** : la boucle est exécutée **au plus n fois**. Ici, le nombre d'opérations **ne peut pas être calculé de manière exacte** : il diffère **d'une instance de problème à l'autre**.

## 6. Exemple 3 — le Minimum d'un vecteur

\`\`\`
Fonction Minimum (E/ T: TAB, E/ n : entier): entier;
Var i, Min: entier;
Debut
    Min ← T[0];                        // 1 affectation
    Pour i ← 1 à n-1 Faire             // 1 incrémentation par tour, (n-2) incréments
        Si (Min > T[i])                // 1 comparaison, n-1 fois
            alors Min ← T[i] ;         // 1 affectation SI condition vraie
                                       //  → au plus n-1 fois, imprévisible !
    Fait;
    retourner (Min);                   // 1 retour
Fin ;
\`\`\`

La comparaison a lieu à chaque tour, mais **on ne peut pas savoir combien de fois l'affectation Min ← T[i] sera exécutée** (au plus n−1 fois : cas d'un vecteur strictement décroissant). Là encore, le nombre exact d'opérations diffère d'une instance à l'autre.

> **Conclusion des exemples 2 et 3** : le nombre d'opérations ne peut pas toujours être calculé exactement — il dépend de la **répartition des données**. Le calcul de complexité vise donc à donner une **approximation** du nombre d'opérations en fonction de la taille des données.

## 7. Les trois types de complexité 🥇🥈🥉

La complexité d'un algorithme est une mesure de sa **performance asymptotique dans le pire des cas**. Décortiquons.

### 1. La complexité au meilleur des cas 😇

C'est le cas où l'on effectue **le moins d'opérations possible**. Exemple : pour un tri, le cas où le tableau est **déjà trié** ; pour la recherche du minimum, le cas où le minimum est **à la première position**.

⚠️ Cette complexité **n'est pas très intéressante** : tous les algorithmes réagissent à peu près de la même manière dans ce cas, elle ne permet pas de distinguer l'efficacité de deux solutions différentes.

### 2. La complexité en moyenne 📊

Elle nécessite la connaissance de la **distribution des données** (fonctions de probabilités sur les données), obtenue après plusieurs **tests expérimentaux** — donc une **implémentation préalable** de l'algorithme.

### 3. La complexité au pire des cas 😈 (la vedette)

Elle fournit une **borne supérieure** (un maximum) du temps d'exécution : **dans toutes les situations, l'algorithme ne peut pas dépasser cette borne**. Il s'agit de trouver une équation reliant le temps d'exécution à la taille des données ; avec cette équation on peut **comparer deux algorithmes** qui résolvent le même problème.

*Exemple :* pour le tri d'un vecteur dans l'ordre croissant, le pire des cas est un vecteur **initialement trié dans l'ordre décroissant**.

### Pourquoi « asymptotique » et pourquoi « pire cas » ?

- **Asymptotique** : on s'intéresse à des **données très grandes**, car les petites valeurs ne sont pas assez informatives pour évaluer une complexité.
- **Pire cas** : on veut être **sûr** que l'algorithme ne prendra pas plus de temps que celui estimé — c'est une garantie, comme le temps au tour maximal d'une voiture.

## 8. La notation de Landau : Grand O 🅾️

La **complexité asymptotique** est une approximation du nombre d'opérations exécutées en fonction de la taille des données d'entrée. Elle est « asymptotique » parce qu'elle considère une donnée de **grande taille**, ne retient que le **terme de poids fort** de la formule et **ignore le coefficient multiplicateur**.

On la note **O(f(n))** — lire « grand O de f(n) » — où n est la taille des données.

**Démonstrations pas à pas (exemples du cours) :**

- Si **C(n) = 5n⁴ + 20n² + 5** : quand n grandit, n⁴ écrase n² et la constante ; on jette le coefficient 5 → l'algorithme opère en **O(n⁴)**.
- Si **C(n) = n·log n + 12n + 8** : entre n·log n et 12n, le terme de poids fort est n·log n (log n grandit, même lentement) → **O(n log n)**.
- Si **C(n) = 10n¹⁰ − n⁴ + 2ⁿ/3** : l'exponentielle 2ⁿ finit TOUJOURS par dépasser n'importe quel polynôme, même n¹⁰ → **O(2ⁿ)**.
- Pour nos premiers exemples (**Factorielle** avec 5n−2, **Recherche**, **Minimum**), la complexité est de l'ordre de **O(n)**.

**Méthode en 2 gestes :** ① garder le terme qui croît le plus vite, ② supprimer les constantes multiplicatives.

## 9. Les ordres de complexité — l'échelle des vitesses 🏁

- **O(1)** — complexité **constante**, indépendante de la taille des données. C'est le **cas optimal** : les algorithmes les plus rapides. Ex. : un algorithme qui effectue 8 opérations quelle que soit la taille des données est en O(1).
- **O(nᵏ)** — complexité **polynomiale** :
  - k = 1 : **linéaire** — cas de la recherche séquentielle dans une liste ;
  - k = 2 : **quadratique** — cas du tri par permutations ;
  - k = 3 : **cubique** — cas du produit de deux matrices ;
  - k = 0 : complexité constante, O(n⁰) = O(1).
- **O(log n)** ou **O(n log n)** — complexité **logarithmique** (n log n est dite **sous-quadratique** ou semi-quadratique) ;
- **O(2ⁿ)** ou **O(n!)** — complexité **exponentielle** : les algorithmes les plus lents. 🐌

**Par ordre croissant des grandeurs de complexité :**

\`\`\`
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)
 🚀      ⚡        🏎️       🚗          🚜      🐢      🐌      💀
\`\`\`

**Concrètement, pour sentir la différence :**

| n | log₂ n | n | n·log₂ n | n² | n³ | 2ⁿ |
|---|---|---|---|---|---|---|
| 10 | ≈ 3 | 10 | ≈ 33 | 100 | 1 000 | 1 024 |
| 100 | ≈ 7 | 100 | ≈ 664 | 10 000 | 10⁶ | ≈ 1,3·10³⁰ |
| 1 000 | ≈ 10 | 1 000 | ≈ 10⁴ | 10⁶ | 10⁹ | 😱 |

\`\`\`
temps ▲                                        2ⁿ    n²
      │                                       /     /
      │                                      /    /
      │                                     /   /        n log n
      │                                    /  /       ／
      │                                   / /     ／
      │                                  //   ／            n
      │                              ／ ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
      │                      ＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿  log n
      │  ＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿  1
      └──────────────────────────────────────────────────► n
\`\`\`

## 10. Les règles de calcul 🧮

### Règle 1 — Séquence de deux traitements : ADDITION

Traitement1 de complexité C1(n) **puis** Traitement2 de complexité C2(n) :

\`\`\`
C(n) = C1(n) + C2(n)
\`\`\`

### Règle 2 — Traitement alternatif (Si … Alors … Sinon) : MAX

\`\`\`
Si (condition) alors Traitement1;    // complexité C1(n)
Sinon Traitement2;                   // complexité C2(n)

C(n) = Max (C1(n), C2(n))
\`\`\`

(Pire cas oblige : on prend la branche la plus chère.)

### Règle 3 — Traitement itératif (boucle) : SOMME DES COÛTS DES ITÉRATIONS

\`\`\`
Tant que (condition)
faire Traitement_i;   // coût Ci(n) à l'itération i
fait;

C(n) = C1(n) + … + Ci(n) + … + Cm(n)     // pour m itérations
\`\`\`

- Si le corps coûte **c constant** et la boucle tourne **m fois** → C(n) = c·m.
- Si le corps est **lui-même une boucle** (imbrication), on somme des coûts variables. Exemple classique : une boucle interne qui fait n−i tours quand i va de 1 à n−1 donne 1 + 2 + … + (n−1) = **n(n−1)/2** → **O(n²)**.

## 11. Exercices d'application du chapitre — corrigés déroulés 📝

### Exercice 1 — La somme des n premières valeurs positives, de deux manières

**Méthode 1 : la boucle.**

\`\`\`
Fonction Somme (E/ n : entier): entier
Var i, S: entier;                 // variables locales
Debut
    S ← 0;                        // 1 affectation
    i ← 1;                        // 1 affectation
    Tant que (i <= n)             // 1 comparaison   ┐
    faire                         //                 │
        S ← S + i;                // 1 addition      │ n fois
                                  // + 1 affectation │
        i ← i + 1;                // 1 incrémentation│
                                  // + 1 affectation ┘
    fait;
    retourner (S);                // 1 retour
fin ;
\`\`\`

\`\`\`
C(n) = 2 + 5*n + 1 = 5*n + 3   →   C(n) = O(n)   complexité LINÉAIRE
\`\`\`

**Trace pour n = 5 :**

| tour | i (après) | S (après) |
|---|---|---|
| init | 1 | 0 |
| 1 | 2 | 1 |
| 2 | 3 | 3 |
| 3 | 4 | 6 |
| 4 | 5 | 10 |
| 5 | 6 | 15 → retour |

**Méthode 2 : la formule de Gauss.** 🧠

\`\`\`
Fonction Somme (E/ n : entier): entier
Var S: entier;
Debut
    S ← n*(n+1)/2;      // 1 addition + 1 multiplication + 1 division + 1 affectation
    retourner (S);      // 1 retour
fin ;
\`\`\`

\`\`\`
C(n) = 5 quelle que soit la valeur de n  →  C(n) = O(1)  complexité CONSTANTE
→ algorithme PLUS EFFICACE que le précédent
\`\`\`

Même problème, deux algorithmes, deux mondes : O(n) contre O(1). Voilà exactement pourquoi on calcule la complexité **avant** d'implémenter.

### Exercice 2 — Insérer une valeur dans un vecteur trié

Idée : **décaler à droite** toutes les valeurs supérieures à val en commençant par la fin, puis insérer val au bon endroit.

\`\`\`
Procédure Insère ( E/S T : tab, E/S n: entier, E/ val: entier)
Var i, X: entier;
Debut
    // décalage à droite de toutes les valeurs supérieures à val,
    // en commençant par la fin
    i ← n-1;                        // 1 soustraction + 1 affectation
    Tant que (i > 0 et T[i] > val)  // 2 comparaisons       ┐
    faire                           //                      │ au plus
        T[i+1] ← T[i];              // 1 incrémentation     │ n fois
                                    // + 1 affectation      │
        i ← i - 1;                  // 1 décrémentation     │
                                    // + 1 affectation      ┘
    fait;
    T[i+1] ← val;                   // insertion : 1 incrémentation + 1 affectation
    n ← n + 1;                      // 1 incrémentation + 1 affectation
Fin;
\`\`\`

\`\`\`
C(n) = 2 + 6*n + 3 = 6*n + 5   →   C(n) = O(n)   complexité LINÉAIRE
\`\`\`

**Schéma avant/après pour insérer val = 20 dans T :**

\`\`\`
AVANT :  T : [ 5 | 12 | 25 | 37 | 60 |  . ]      n = 5
              T[0] T[1] T[2] T[3] T[4]

décalages : 60 → case 5, 37 → case 4, 25 → case 3   (25, 37, 60 > 20)

APRÈS :  T : [ 5 | 12 | 20 | 25 | 37 | 60 ]      n = 6
              T[0] T[1] T[2] T[3] T[4] T[5]
                         ▲
                        val
\`\`\`

### Exercices 3 et 4 du chapitre

- **Exercice 3** — écrire une action Supprime qui supprime une valeur val dans une **liste chaînée** d'entiers de point d'entrée Tete, puis donner la complexité **au meilleur des cas** et **au pire des cas** → c'est le défi « Supprime dans la liste » de cette course. Spoiler : meilleur cas **O(1)** (val en tête), pire cas **O(n)** (val en queue… ou absente).
- **Exercice 4** — écrire ProduitMatrice qui calcule le produit de deux matrices A(n,m) et B(m,p) et donner sa complexité → c'est le défi « Produit de matrices » : trois boucles imbriquées, **O(n·m·p)**.

## 🧠 Ce qu'il faut retenir

- Analyser un algorithme = vérifier sa **correction** ET mesurer son **efficacité**.
- La complexité théorique compte les **opérations élémentaires** en **unités de temps abstraites**, en fonction de la **taille n** des données — indépendamment de la machine.
- 1 instruction basique = 1 unité ; boucle = somme des coûts des itérations ; appel = coût du corps de la fonction.
- Le nombre exact d'opérations dépend souvent de l'**instance** (répartition des données) → on donne un **ordre de grandeur**.
- Trois complexités : **meilleur cas** (peu informatif), **moyenne** (exige la distribution des données), **pire cas** (borne supérieure garantie — la référence).
- **O(f(n))** : on garde le **terme de poids fort**, on jette **constantes et termes faibles**.
- Échelle : O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!).
- Règles : **séquence → addition**, **alternative → max**, **boucle → somme des itérations** (imbrication dépendante → penser à 1+2+…+(n−1) = n(n−1)/2).
- Deux algorithmes corrects pour un même problème peuvent être à des années-lumière : Somme en O(n) vs formule de Gauss en O(1).

## ⚠️ Erreurs fréquentes des débutants

### 1. Compter les unités à l'unité près… et s'y noyer

**Ce qui ne va pas :** passer 20 minutes à savoir si C(n) = 5n+3 ou 5n+4.
**Pourquoi ça casse :** la notation asymptotique jette de toute façon constantes et termes faibles ; l'énergie est dépensée au mauvais endroit et on perd de vue l'ordre de grandeur.
**Comment corriger :** compter proprement une fois (comme Factorielle : 5n−2), puis conclure immédiatement « proportionnel à n → O(n) ».

### 2. Additionner des boucles imbriquées au lieu de les multiplier

\`\`\`
// ❌ FAUX raisonnement : « une boucle n + une boucle n = O(n) + O(n) = O(n) »
Pour i ← 0 à n-1 faire
    Pour j ← 0 à n-1 faire
        Ecrire (T[i,j]);
    fait;
fait;
\`\`\`

**Pourquoi ça casse :** la boucle interne s'exécute **en entier à CHAQUE tour** de la boucle externe : n tours × n tours = n² exécutions du corps.

\`\`\`
// ✅ CORRECT : coût = somme sur i des coûts internes = n * (c*n) → O(n²)
\`\`\`

### 3. Croire que deux boucles EN SÉQUENCE donnent du O(n²)

\`\`\`
// ❌ « Deux boucles = n² » — NON : elles sont l'une APRÈS l'autre
Pour i ← 0 à n-1 faire lire (T1[i]); fait;
Pour i ← 0 à n-1 faire lire (T2[i]); fait;
\`\`\`

**Pourquoi ça casse :** règle de la séquence = **addition** : C(n) = c·n + c·n = 2c·n → **O(n)**.
**Comment corriger :** ne multiplier que si une boucle est **à l'intérieur** de l'autre.

### 4. Juger un algorithme sur de petites valeurs de n

**Ce qui ne va pas :** « pour n = 5, l'algo en n² fait 25 opérations et l'algo en 40n en fait 200, donc n² est meilleur ! »
**Pourquoi ça casse :** la complexité est **asymptotique** : dès n = 40, 40n < n², et l'écart explose ensuite. Les petites valeurs ne sont pas informatives.
**Comment corriger :** toujours raisonner « n très grand » ; les coefficients disparaissent.

### 5. Confondre meilleur cas et pire cas

**Ce qui ne va pas :** annoncer O(1) pour la recherche séquentielle « parce que la valeur peut être en première position ».
**Pourquoi ça casse :** la complexité (par défaut) est une mesure **au pire des cas** : c'est une **garantie** de borne supérieure. Le meilleur cas ne distingue pas les algorithmes.
**Comment corriger :** chercher l'instance la plus défavorable (valeur absente → n tours → O(n)) ; préciser explicitement quand on parle du meilleur cas.

### 6. Supposer que le corps d'une boucle coûte toujours pareil

\`\`\`
// ❌ « boucle externe n fois, donc O(n) » — le corps N'EST PAS constant !
Pour i ← 1 à n-1 faire
    j ← n - i;                       // la boucle interne fait n-i tours
    Tant que (j > 0) faire … j ← j-1; fait;
fait;
\`\`\`

**Pourquoi ça casse :** règle 3 = **somme des coûts des itérations** : (n−1) + (n−2) + … + 1 = n(n−1)/2 → **O(n²)**, pas O(n).
**Comment corriger :** écrire la somme des coûts réels de chaque itération avant de conclure.

### 7. Garder les constantes dans le Grand O

**Ce qui ne va pas :** écrire O(5n−2), O(3n²), O(n²+n).
**Pourquoi ça casse :** par définition, la notation de Landau ignore le coefficient multiplicateur et les termes de poids faible ; O(5n) = O(n).
**Comment corriger :** réduire systématiquement : 5n−2 → O(n) ; 3n² + 7n + 12 → O(n²) ; n·log n + 12n + 8 → O(n log n) ; 10n¹⁰ − n⁴ + 2ⁿ/3 → O(2ⁿ).`,
    badge: {
      id: "badge-grand-o",
      name: "Maître du Grand O",
      icon: "Cpu",
      description: "A dompté la notation de Landau : sait chronométrer n'importe quel algorithme sans l'exécuter.",
    },
    challenges: [
      {
        id: "asd-cx-s3e1-seq",
        title: "Ex.1 : itérations en séquence",
        order: 1,
        difficulty: "easy",
        type: "text",
        points: 100,
        timeLimitSec: 360,
        prompt: `**Exercice 1 (première action).** Évalue la complexité de l'action suivante (tableaux d'entiers **sans répétition** de valeurs) :

\`\`\`
Action Seq_itérations;
const max = 1000;
Var nb, i, n : entier ;
    T1, T2 : tableau[max] entier;
Debut
    lire (n);
    nb ← 0 ;
    Pour i ← 0 à n-1 faire lire (T1[i]); fait ;
    Pour i ← 0 à n-1 faire lire (T2[i]); fait ;
    Pour i ← 0 à n-1
    faire
        si (T1[i] = T2[i]) alors nb ← nb + 1 ; fsi ;
    fait ;
    Ecrire (nb) ;
Fin ;
\`\`\`

Donne la complexité au pire des cas en notation de Landau (ex : O(n)).`,
        hints: [
          { text: "Compte les boucles : sont-elles imbriquées ou l'une après l'autre ?", cost: 15 },
          { text: "Règle de la séquence : les complexités s'ADDITIONNENT. Trois boucles de n tours chacune, en séquence…", cost: 30 },
          { text: "📖 Correction complète : les trois boucles Pour sont en SÉQUENCE, chacune fait n itérations à coût constant (lecture, ou comparaison + incrément éventuel). C(n) = c1·n + c2·n + c3·n + constantes = O(n) + O(n) + O(n) = O(n). Complexité LINÉAIRE.", cost: 60 },
        ],
        answer: "O(n)",
        accept: ["o(n)", "O(N)", "on", "0(n)", "O( n )", "lineaire O(n)"],
        explanation: `**Corrigé.** L'action enchaîne trois boucles *Pour* **en séquence** (aucune n'est à l'intérieur d'une autre) :

1. lecture de T1 : n itérations, coût constant par tour → c1·n ;
2. lecture de T2 : n itérations → c2·n ;
3. comparaison case à case : n itérations, chaque tour = 1 comparaison + au plus 1 incrémentation → c3·n.

**Règle de la séquence** : C(n) = C1(n) + C2(n) + C3(n) = c1·n + c2·n + c3·n + constantes (lire(n), nb←0, Ecrire(nb)).

Le terme de poids fort est proportionnel à n → **C(n) = O(n)**, complexité **linéaire**.

⚠️ Piège classique : « trois boucles » ne veut pas dire O(n³) — elles ne sont pas imbriquées !`,
        tags: ["complexite", "sequence"],
      },
      {
        id: "asd-cx-s3e1-imb",
        title: "Ex.1 : itérations imbriquées",
        order: 2,
        difficulty: "medium",
        type: "text",
        points: 200,
        timeLimitSec: 720,
        prompt: `**Exercice 1 (deuxième action).** Même question pour cette action :

\`\`\`
Action Imb_itérations;
const max = 1000;
Var nb, i, j, n : entier ;
    T1, T2 : tableau[max] entier;
Debut
    lire (n);
    nb ← 0 ;
    Pour i ← 0 à n-1 faire lire (T1[i]); fait ;
    Pour i ← 0 à n-1 faire lire (T2[i]); fait ;
    Pour i ← 0 à n-1
    faire
        j ← 0 ;
        Tant que (j < n et T1[i] <> T2[j])
        faire j ← j + 1 ; fait ;
        si (j < n) alors nb ← nb + 1 ; fsi ;
    fait ;
    Ecrire (nb) ;
Fin ;
\`\`\`

Donne la complexité au pire des cas en notation de Landau.`,
        hints: [
          { text: "Regarde la troisième boucle Pour : que contient son corps cette fois ?", cost: 15 },
          { text: "La boucle Tant que interne fait au PIRE n tours (valeur absente de T2), et elle est relancée pour CHAQUE i.", cost: 30 },
          { text: "📖 Correction complète : les deux premières boucles de lecture coûtent O(n) chacune (séquence). La troisième boucle Pour contient une boucle Tant que qui, au pire (T1[i] absent de T2), fait n tours. Coût : n tours externes × n tours internes = n² → O(n²). Séquence totale : O(n) + O(n) + O(n²) = O(n²). Complexité QUADRATIQUE.", cost: 70 },
        ],
        answer: "O(n^2)",
        accept: ["O(n²)", "o(n2)", "O(n*n)", "0(n^2)", "O(n^2)", "on2", "O( n² )", "quadratique O(n^2)"],
        explanation: `**Corrigé.** Les deux boucles de lecture restent en O(n) chacune. La différence est dans la troisième boucle :

- boucle externe *Pour i* : **n itérations** ;
- pour chaque i, boucle interne *Tant que (j < n et T1[i] <> T2[j])* : elle cherche T1[i] dans T2 ; **au pire des cas** (valeur absente, ou trouvée en dernière position), elle fait **n tours**.

**Règle des boucles imbriquées** (somme des coûts des itérations) : chaque itération externe coûte au pire c·n, il y en a n → C3(n) = n × c·n = c·n².

**Séquence totale** : C(n) = O(n) + O(n) + O(n²) = **O(n²)**, complexité **quadratique**.

💡 Comparaison instructive avec Seq_itérations : même problème d'apparence (comparer deux tableaux), mais chercher chaque élément *partout* dans l'autre tableau (imbrication) au lieu de comparer *case à case* (séquence) fait passer de O(n) à O(n²).`,
        tags: ["complexite", "imbrication"],
      },
      {
        id: "asd-cx-s3e2-ab",
        title: "Ex.2 : algorithmes A et B",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        points: 200,
        timeLimitSec: 720,
        prompt: `**Exercice 2 (algorithmes A et B).** Détermine la complexité **en nombre d'itérations effectuées** des algorithmes suivants, où m et n sont deux entiers positifs :

\`\`\`
Algorithme A                      Algorithme B
i ← 1 ; j ← 1                     i ← 1 ; j ← 1
Tant que (i <= m) et (j <= n)     Tant que (i <= m) ou (j <= n)
faire                             faire
    i ← i+1                           i ← i+1
    j ← j+1                           j ← j+1
fait ;                            fait ;
\`\`\`

Quelle paire de complexités est correcte ?`,
        options: [
          "A : O(min(m,n))  —  B : O(max(m,n))",
          "A : O(max(m,n))  —  B : O(min(m,n))",
          "A : O(m+n)  —  B : O(m·n)",
          "A : O(m·n)  —  B : O(m+n)",
        ],
        answer: 0,
        hints: [
          { text: "i et j avancent ENSEMBLE d'un cran à chaque tour. Quand chaque boucle s'arrête-t-elle ?", cost: 15 },
          { text: "A s'arrête dès que l'UNE des conditions lâche (ET logique). B continue tant que l'UNE tient encore (OU logique).", cost: 30 },
          { text: "📖 Correction complète : à chaque itération, i et j augmentent de 1 en même temps. A (condition ET) s'arrête dès que i dépasse m OU j dépasse n, c'est-à-dire après min(m,n) itérations → O(min(m,n)). B (condition OU) continue tant qu'au moins un compteur n'a pas dépassé sa borne, donc s'arrête après max(m,n) itérations → O(max(m,n)). Réponse : A : O(min(m,n)) — B : O(max(m,n)).", cost: 60 },
        ],
        explanation: `**Corrigé déroulé.** Dans les deux algorithmes, i et j sont incrémentés **simultanément** à chaque itération : après k tours, i = 1+k et j = 1+k.

**Algorithme A — condition (i ≤ m) ET (j ≤ n).** La boucle tourne tant que les DEUX conditions sont vraies ; elle s'arrête dès que la première borne est atteinte. Si m = 3 et n = 10 : au tour 3, i passe à 4 > m → stop. Nombre d'itérations = **min(m,n)** → **O(min(m,n))**.

**Algorithme B — condition (i ≤ m) OU (j ≤ n).** La boucle tourne tant qu'AU MOINS une condition est vraie ; elle ne s'arrête que quand les deux bornes sont dépassées. Si m = 3 et n = 10 : il faut 10 tours pour que j dépasse n. Nombre d'itérations = **max(m,n)** → **O(max(m,n))**.

*Vérification croisée* : pour m = n, les deux donnent n itérations — cohérent, car min(n,n) = max(n,n) = n.`,
        tags: ["complexite", "boucles"],
      },
      {
        id: "asd-cx-s3e2-cd",
        title: "Ex.2 : algorithmes C et D",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        points: 350,
        timeLimitSec: 1500,
        prompt: `**Exercice 2 (algorithmes C et D).** Même question pour :

\`\`\`
Algorithme C                      Algorithme D
i ← 1 ; j ← 1                     i ← 1 ; j ← 1
Tant que (j <= n)                 Tant que (j <= n)
faire                             faire
    si (i <= m)                       si (i <= m)
        alors i ← i+1                     alors i ← i+1
        sinon j ← j+1;                    sinon j ← j+1 ; i ← 1;
    fsi;                              fsi ;
Fait;                             fait ;
\`\`\`

⚠️ Note la SEULE différence : dans D, i est **remis à 1** à chaque incrément de j.

Quelle paire de complexités est correcte ?`,
        options: [
          "C : O(m+n)  —  D : O(m·n)",
          "C : O(m·n)  —  D : O(m+n)",
          "C : O(max(m,n))  —  D : O(m+n)",
          "C : O(m+n)  —  D : O(m+n)",
        ],
        answer: 0,
        hints: [
          { text: "Dans C, combien de fois AU TOTAL i peut-il être incrémenté sur toute la vie de la boucle ? Et j ?", cost: 20 },
          { text: "Dans D, chaque incrément de j « recharge » i à 1 : il faudra de nouveau m itérations pour que i re-dépasse m.", cost: 35 },
          { text: "📖 Correction complète : C — chaque itération incrémente SOIT i (au plus m fois au total, jusqu'à i = m+1), SOIT j (n fois, jusqu'à j = n+1). Total ≤ m + n itérations → O(m+n). D — pour faire passer j de k à k+1, il faut d'abord faire monter i de 1 à m+1 (m itérations) puis 1 itération pour incrémenter j (qui remet i à 1). Chaque unité de j coûte donc m+1 itérations, et j doit croître n fois → n·(m+1) ≈ O(m·n). Réponse : C : O(m+n) — D : O(m·n).", cost: 80 },
        ],
        explanation: `**Corrigé déroulé.**

**Algorithme C.** Chaque itération fait exactement UNE des deux choses : incrémenter i (branche alors) ou incrémenter j (branche sinon). i part de 1 et n'est jamais remis à zéro : la branche « alors » ne peut s'exécuter que **m fois** au total (jusqu'à i = m+1). La branche « sinon » s'exécute **n fois** (jusqu'à j = n+1, arrêt). Total d'itérations = m + n → **O(m+n)**.

*Trace (m = 2, n = 2)* : (i,j) = (1,1)→(2,1)→(3,1)→(3,2)→(3,3) stop : 4 itérations = m + n. ✅

**Algorithme D.** La remise à 1 de i change tout. Pour incrémenter j une fois, il faut : m itérations pour faire grimper i de 1 à m+1, puis 1 itération « sinon » qui fait j+1 **et** i ← 1. Donc chaque progression de j coûte **m+1 itérations**, et j doit progresser n fois avant de dépasser n. Total ≈ n·(m+1) → **O(m·n)**.

*Trace (m = 2, n = 2)* : (1,1)→(2,1)→(3,1)→(1,2)→(2,2)→(3,2)→(1,3) stop : 6 itérations = n·(m+1). ✅

💡 Moralité : une simple instruction (i ← 1) fait passer l'algorithme de linéaire O(m+n) à quadratique O(m·n). Toujours regarder si les compteurs sont *réinitialisés*.`,
        tags: ["complexite", "boucles"],
      },
      {
        id: "asd-cx-s3e3-dicho",
        title: "Ex.3.1 : recherche dichotomique",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        points: 350,
        timeLimitSec: 1500,
        prompt: `**Exercice 3, question 1.** Écris l'algorithme de **recherche dichotomique** d'une valeur val dans un vecteur **trié** d'entiers T de taille n, puis calcule sa complexité (tu la retrouveras dans la correction).

Principe : comparer val à l'élément du **milieu** ; selon le résultat, éliminer la moitié gauche ou la moitié droite, et recommencer sur la moitié restante.

\`\`\`
T : [ 3 | 8 | 15 | 21 | 40 | 57 | 62 ]   chercher val = 40
      inf          mid            sup
\`\`\``,
        starter: `Fonction RechDicho (E/ T: TAB, E/ n: entier, E/ val: entier): booleen
Var inf, sup, mid: entier;
Debut
    // TODO : initialiser les bornes inf et sup
    // TODO : Tant que l'intervalle n'est pas vide
    //          calculer mid, comparer T[mid] a val
    //          reduire l'intervalle du bon cote
    // TODO : retourner vrai ou faux
Fin;`,
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Utilise une boucle Tant que contrôlée par les deux bornes de l'intervalle", pattern: "Tant\\s*que[\\s\\S]{0,80}?<=", flags: "i" },
            { label: "Calcule l'indice du milieu par division par 2", pattern: "(mid|milieu|m)\\s*←[\\s\\S]{0,40}?(div\\s*2|/\\s*2)", flags: "i" },
            { label: "Compare T[milieu] à val", pattern: "T\\s*\\[\\s*(mid|milieu|m)\\s*\\]", flags: "i" },
            { label: "Réduit l'intervalle en déplaçant une borne juste à côté du milieu (mid±1)", pattern: "←\\s*(mid|milieu|m)\\s*[+-]\\s*1", flags: "i" },
            { label: "Retourne un booléen (vrai/faux)", pattern: "retourner\\s*\\(?\\s*(vrai|faux)", flags: "i" },
          ],
        }),
        hints: [
          { text: "Deux bornes inf ← 0 et sup ← n-1. La boucle vit tant que inf <= sup.", cost: 20 },
          { text: "mid ← (inf + sup) div 2. Si T[mid] = val → trouvé. Si T[mid] < val → la valeur est à droite : inf ← mid+1. Sinon sup ← mid-1.", cost: 35 },
          { text: "📖 Correction complète :\nFonction RechDicho (E/ T: TAB, E/ n: entier, E/ val: entier): booleen\nVar inf, sup, mid: entier;\nDebut\n    inf ← 0; sup ← n-1;\n    Tant que (inf <= sup)\n    faire\n        mid ← (inf + sup) div 2;\n        si (T[mid] = val) alors retourner (vrai);\n        sinon si (T[mid] < val) alors inf ← mid + 1;\n              sinon sup ← mid - 1;\n        fsi; fsi;\n    fait;\n    retourner (faux);\nFin;\nComplexité : chaque tour divise l'intervalle par 2 → au plus log2(n) tours → O(log n).", cost: 85 },
        ],
        explanation: `**Corrigé ligne par ligne :**

\`\`\`
Fonction RechDicho (E/ T: TAB, E/ n: entier, E/ val: entier): booleen
Var inf, sup, mid: entier;
Debut
    inf ← 0;                       // borne gauche de la zone de recherche
    sup ← n-1;                     // borne droite
    Tant que (inf <= sup)          // tant qu'il reste au moins une case
    faire
        mid ← (inf + sup) div 2;   // indice du milieu (division entière)
        si (T[mid] = val)
            alors retourner (vrai);        // trouvé !
        sinon si (T[mid] < val)
            alors inf ← mid + 1;   // val est forcément à DROITE du milieu
        sinon sup ← mid - 1;       // val est forcément à GAUCHE du milieu
        fsi; fsi;
    fait;
    retourner (faux);              // intervalle vide : val absente
Fin;
\`\`\`

**Calcul de complexité.** À chaque itération, la taille de l'intervalle de recherche est **divisée par 2** : n → n/2 → n/4 → … → 1. Le nombre maximal d'itérations k vérifie n/2ᵏ ≥ 1, soit k ≤ log₂(n). Chaque itération a un coût constant (1 calcul de milieu + au plus 2 comparaisons + 1 affectation de borne).

**C(n) = O(log n)** — complexité **logarithmique**, à comparer avec la recherche séquentielle en O(n) : pour n = 1 000 000, environ 20 tours au lieu d'un million. La contrepartie : le vecteur doit être **trié**.

*Déroulement sur l'exemple (chercher 40 dans [3, 8, 15, 21, 40, 57, 62])* : inf=0, sup=6 → mid=3, T[3]=21 < 40 → inf=4 ; mid=(4+6)/2=5, T[5]=57 > 40 → sup=4 ; mid=4, T[4]=40 → vrai, en 3 tours.`,
        tags: ["complexite", "dichotomie", "code"],
      },
      {
        id: "asd-cx-s3e3-prodmat",
        title: "Ex.3.2 : produit de matrices",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        points: 350,
        timeLimitSec: 1500,
        prompt: `**Exercice 3, question 2** (aussi Exercice 4 du chapitre 3). Écris l'algorithme du **produit de deux matrices** A(n, m) et B(m, p) d'entiers, dans une matrice C(n, p), et calcule sa complexité.

Rappel : C[i, j] = somme sur k de A[i, k] × B[k, j].

\`\`\`
        m                p                    p
   ┌─────────┐      ┌─────────┐         ┌─────────┐
 n │    A    │  ×  m│    B    │   =   n │    C    │
   └─────────┘      └─────────┘         └─────────┘
\`\`\``,
        starter: `Procédure ProduitMatrice (E/ A: MAT, E/ B: MAT, S/ C: MAT,
                          E/ n: entier, E/ m: entier, E/ p: entier)
Var i, j, k: entier;
Debut
    // TODO : pour chaque case C[i, j] :
    //   initialiser a 0 puis accumuler A[i, k] * B[k, j]
Fin;`,
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Utilise trois boucles Pour imbriquées (i, j, k)", pattern: "Pour[\\s\\S]{1,300}?Pour[\\s\\S]{1,300}?Pour", flags: "i" },
            { label: "Initialise chaque case résultat à 0 avant d'accumuler", pattern: "C\\s*\\[[^\\]]{1,20}\\]\\s*←\\s*0", flags: "i" },
            { label: "Accumule le produit A[i,k] * B[k,j] dans C[i,j]", pattern: "C\\s*\\[[^\\]]{1,20}\\]\\s*←\\s*C\\s*\\[[^\\]]{1,20}\\]\\s*\\+[\\s\\S]{0,60}?\\*", flags: "i" },
          ],
        }),
        hints: [
          { text: "Il faut remplir n×p cases, et chaque case demande une somme de m produits : ça sent la triple boucle.", cost: 20 },
          { text: "Boucle i (lignes de A), boucle j (colonnes de B), C[i,j] ← 0 puis boucle k : C[i,j] ← C[i,j] + A[i,k]*B[k,j].", cost: 35 },
          { text: "📖 Correction complète :\nProcédure ProduitMatrice (E/ A: MAT, E/ B: MAT, S/ C: MAT, E/ n, m, p: entier)\nVar i, j, k: entier;\nDebut\n    Pour i ← 0 à n-1 faire\n        Pour j ← 0 à p-1 faire\n            C[i, j] ← 0;\n            Pour k ← 0 à m-1 faire\n                C[i, j] ← C[i, j] + A[i, k] * B[k, j];\n            fait;\n        fait;\n    fait;\nFin;\nComplexité : n × p × m itérations internes → O(n·m·p), soit O(n³) pour des matrices carrées.", cost: 85 },
        ],
        explanation: `**Corrigé ligne par ligne :**

\`\`\`
Procédure ProduitMatrice (E/ A: MAT, E/ B: MAT, S/ C: MAT,
                          E/ n: entier, E/ m: entier, E/ p: entier)
Var i, j, k: entier;
Debut
    Pour i ← 0 à n-1 faire            // chaque ligne de A      (n tours)
        Pour j ← 0 à p-1 faire        // chaque colonne de B    (p tours)
            C[i, j] ← 0;              // préparer l'accumulateur
            Pour k ← 0 à m-1 faire    // somme des m produits   (m tours)
                C[i, j] ← C[i, j] + A[i, k] * B[k, j];
            fait;
        fait;
    fait;
Fin;
\`\`\`

**Calcul de complexité.** Le corps le plus profond (1 multiplication + 1 addition + 1 affectation, coût constant c) s'exécute pour chaque triplet (i, j, k) : n × p × m fois.

C(n, m, p) = c·n·m·p + (termes de poids faible pour les initialisations) → **O(n·m·p)**.

Pour des matrices carrées (n = m = p), on retrouve la fameuse complexité **cubique O(n³)** citée dans le cours comme exemple type de O(nᵏ) avec k = 3.`,
        tags: ["complexite", "matrices", "code"],
      },
      {
        id: "asd-cx-s3e3-triselect",
        title: "Ex.3.3 : tri par sélection",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        points: 350,
        timeLimitSec: 1500,
        prompt: `**Exercice 3, question 3.** Écris l'algorithme du **tri par sélection** d'un vecteur V d'entiers de taille n (ordre croissant), et calcule sa complexité.

Principe : à l'étape i, chercher le **minimum** de V[i..n-1] et l'**échanger** avec V[i].

\`\`\`
étape 0 :  [ 25 | 7 | 12 | 3 ]   min = 3  → échange avec V[0]
étape 1 :  [ 3 | 7 | 12 | 25 ]   min = 7  → déjà en place
...
\`\`\``,
        starter: `Procédure TriSelection (E/S V: TAB, E/ n: entier)
Var i, j, imin, temp: entier;
Debut
    // TODO : pour i de 0 a n-2 :
    //   chercher l'indice imin du minimum de V[i..n-1]
    //   echanger V[i] et V[imin]
Fin;`,
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Utilise deux boucles Pour imbriquées", pattern: "Pour[\\s\\S]{1,400}?Pour", flags: "i" },
            { label: "Mémorise l'indice (ou la valeur) du minimum courant", pattern: "(imin|indmin|posmin|min)\\s*←", flags: "i" },
            { label: "Compare les éléments pour mettre à jour le minimum", pattern: "si\\s*\\(?\\s*V\\s*\\[[^\\]]{1,20}\\]\\s*<", flags: "i" },
            { label: "Échange deux cases via une variable temporaire", pattern: "(temp|tmp|aux|x)\\s*←\\s*V\\s*\\[", flags: "i" },
          ],
        }),
        hints: [
          { text: "Boucle externe i de 0 à n-2. Au début de chaque tour : imin ← i.", cost: 20 },
          { text: "Boucle interne j de i+1 à n-1 : si V[j] < V[imin] alors imin ← j. À la sortie : échange V[i] ↔ V[imin] avec temp.", cost: 35 },
          { text: "📖 Correction complète :\nProcédure TriSelection (E/S V: TAB, E/ n: entier)\nVar i, j, imin, temp: entier;\nDebut\n    Pour i ← 0 à n-2 faire\n        imin ← i;\n        Pour j ← i+1 à n-1 faire\n            si (V[j] < V[imin]) alors imin ← j; fsi;\n        fait;\n        si (imin <> i) alors\n            temp ← V[i]; V[i] ← V[imin]; V[imin] ← temp;\n        fsi;\n    fait;\nFin;\nComplexité : (n-1) + (n-2) + … + 1 = n(n-1)/2 comparaisons → O(n²).", cost: 85 },
        ],
        explanation: `**Corrigé ligne par ligne :**

\`\`\`
Procédure TriSelection (E/S V: TAB, E/ n: entier)
Var i, j, imin, temp: entier;
Debut
    Pour i ← 0 à n-2 faire             // frontière trié / non trié
        imin ← i;                      // candidat minimum de V[i..n-1]
        Pour j ← i+1 à n-1 faire       // balayer la zone non triée
            si (V[j] < V[imin])
                alors imin ← j;        // nouveau minimum repéré
            fsi;
        fait;
        si (imin <> i) alors           // échange (inutile si déjà en place)
            temp ← V[i];
            V[i] ← V[imin];
            V[imin] ← temp;
        fsi;
    fait;
Fin;
\`\`\`

**Calcul de complexité.** Règle 3 (somme des coûts des itérations) : la boucle interne fait n−1−i comparaisons à l'étape i, pour i = 0, …, n−2 :

\`\`\`
(n-1) + (n-2) + … + 1 = n(n-1)/2 comparaisons
\`\`\`

C(n) = n(n−1)/2 × coût constant + (n−1) échanges au plus → terme de poids fort n²/2 → **O(n²)**, complexité **quadratique** — l'exemple type du cours (« tri par permutations »).

💡 Remarque : le nombre de comparaisons est le MÊME quel que soit le vecteur (déjà trié ou non) — meilleur cas = pire cas = O(n²) pour les comparaisons ; seuls les échanges varient.`,
        tags: ["complexite", "tri", "code"],
      },
      {
        id: "asd-cx-s3e4-binaire",
        title: "Ex.4 : décomposition binaire en liste chaînée",
        order: 8,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        points: 350,
        timeLimitSec: 1500,
        prompt: `**Exercice 4.** Écris une **action paramétrée** qui décompose un nombre entier positif N en **binaire** dans une **liste chaînée** d'entiers, puis calcule la complexité de l'algorithme.

Méthode des divisions successives : N mod 2 donne le bit de poids faible, puis N ← N div 2, et on recommence tant que N > 0.

\`\`\`
N = 13 :  13 mod 2 = 1 ; 6 mod 2 = 0 ; 3 mod 2 = 1 ; 1 mod 2 = 1
13 en binaire = 1101

liste (bits de poids fort en tête, grâce à l'insertion en tête) :
Tete ──► [1|·]──►[1|·]──►[0|·]──►[1|NIL]
\`\`\`

💡 Astuce : les bits sortent du poids **faible** vers le poids **fort** ; en insérant chaque nouveau bit **en tête** de liste, la liste se lit naturellement dans le bon ordre.`,
        starter: `// Type Liste = ^Element;
// Element = Enregistrement
//     info: entier;        // un bit : 0 ou 1
//     suivant: ^Element;
// FinEnreg;

Procédure DecompBinaire (E/ N: entier, S/ Tete: Liste)
Var nouv: Liste;
Debut
    Tete ← NIL;
    // TODO : tant que N > 0 :
    //   allouer un element, y mettre N mod 2,
    //   l'inserer EN TETE de la liste, puis N ← N div 2
Fin;`,
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Boucle tant que le nombre n'est pas épuisé (N > 0)", pattern: "Tant\\s*que[\\s\\S]{0,60}?(>\\s*0|<>\\s*0|≠\\s*0)", flags: "i" },
            { label: "Extrait le bit courant avec mod 2", pattern: "mod\\s*2", flags: "i" },
            { label: "Divise le nombre par 2 à chaque tour", pattern: "(div\\s*2|/\\s*2)", flags: "i" },
            { label: "Alloue un nouvel élément de liste", pattern: "Allouer", flags: "i" },
            { label: "Chaîne le nouvel élément à la liste (champ suivant)", pattern: "suivant\\s*←", flags: "i" },
          ],
        }),
        hints: [
          { text: "À chaque tour : nouv ← Allouer(...) ; (^nouv).info ← N mod 2 ; puis chaîne nouv devant Tete.", cost: 20 },
          { text: "Insertion en tête : (^nouv).suivant ← Tete ; Tete ← nouv. Et n'oublie pas N ← N div 2 pour faire avancer la boucle !", cost: 35 },
          { text: "📖 Correction complète :\nProcédure DecompBinaire (E/ N: entier, S/ Tete: Liste)\nVar nouv: Liste;\nDebut\n    Tete ← NIL;\n    Tant que (N > 0)\n    faire\n        nouv ← Allouer (tailleDe (Element));\n        (^nouv).info ← N mod 2;\n        (^nouv).suivant ← Tete;   // insertion en tête\n        Tete ← nouv;\n        N ← N div 2;\n    fait;\nFin;\nComplexité : la boucle divise N par 2 à chaque tour → log2(N) itérations → O(log N).", cost: 85 },
        ],
        explanation: `**Corrigé ligne par ligne :**

\`\`\`
Procédure DecompBinaire (E/ N: entier, S/ Tete: Liste)
Var nouv: Liste;
Debut
    Tete ← NIL;                          // liste vide au départ
    Tant que (N > 0)
    faire
        nouv ← Allouer (tailleDe (Element));  // nouvel élément
        (^nouv).info ← N mod 2;          // bit de poids faible courant
        (^nouv).suivant ← Tete;          // insertion EN TÊTE :
        Tete ← nouv;                     //   le bit remonte devant
        N ← N div 2;                     // on passe au bit suivant
    fait;
Fin;
\`\`\`

**Déroulement pour N = 13 :**

| tour | N (avant) | bit = N mod 2 | liste après insertion |
|---|---|---|---|
| 1 | 13 | 1 | [1] |
| 2 | 6 | 0 | [0]→[1] |
| 3 | 3 | 1 | [1]→[0]→[1] |
| 4 | 1 | 1 | [1]→[1]→[0]→[1] ✅ = 1101 |

**Calcul de complexité.** Chaque itération a un coût constant (allocation + 2 affectations de champs + mod + div). La boucle s'exécute tant que N > 0 en divisant N par 2 à chaque tour : nombre d'itérations = nombre de bits de N = ⌊log₂ N⌋ + 1.

**C(N) = O(log N)** — complexité **logarithmique** : ici la « taille de la donnée » est la valeur N, et on la ronge par moitiés successives, exactement comme la dichotomie.`,
        tags: ["complexite", "liste-chainee", "code"],
      },
      {
        id: "asd-cx-s3e5-naif",
        title: "Ex.5a : l'élément égal à la somme des autres (naïf)",
        order: 9,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        points: 200,
        timeLimitSec: 900,
        prompt: `**Exercice 5a.** Étant donné un tableau A de n entiers, on cherche à savoir si **l'un de ses éléments est égal à la somme des n−1 autres**.

\`\`\`
A : [ 3 | 8 | -6 | 3 | -1 | 9 ]
Le 2ème élément (8) est égal à la somme des 5 autres : 3 + (-6) + 3 + (-1) + 9 = 8 ✅
\`\`\`

**Première méthode (naïve)** : pour chaque élément du tableau, calculer la somme des **autres** éléments et vérifier si elle est égale à l'élément. Écris cet algorithme et donne sa complexité (tu la retrouveras dans la correction).`,
        starter: `Fonction ExisteSommeAutres (E/ A: TAB, E/ n: entier): booleen
Var i, j, S: entier;
Debut
    // TODO : pour chaque i :
    //   calculer S = somme des A[j] pour j <> i
    //   si S = A[i] alors retourner vrai
    // retourner faux a la fin
Fin;`,
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Deux boucles imbriquées (pour chaque élément, somme des autres)", pattern: "Pour[\\s\\S]{1,400}?Pour", flags: "i" },
            { label: "Exclut l'élément courant de la somme (j différent de i)", pattern: "(<>|≠|!=)", flags: "i" },
            { label: "Accumule la somme des autres éléments", pattern: "S\\s*←\\s*S\\s*\\+", flags: "i" },
            { label: "Compare la somme à l'élément courant et retourne un booléen", pattern: "retourner\\s*\\(?\\s*(vrai|faux)", flags: "i" },
          ],
        }),
        hints: [
          { text: "Boucle externe sur i. À chaque tour : S ← 0, puis boucle interne sur j pour accumuler.", cost: 15 },
          { text: "Dans la boucle interne : si (j <> i) alors S ← S + A[j]. Après la boucle interne : si (S = A[i]) alors retourner (vrai).", cost: 30 },
          { text: "📖 Correction complète :\nFonction ExisteSommeAutres (E/ A: TAB, E/ n: entier): booleen\nVar i, j, S: entier;\nDebut\n    Pour i ← 0 à n-1 faire\n        S ← 0;\n        Pour j ← 0 à n-1 faire\n            si (j <> i) alors S ← S + A[j]; fsi;\n        fait;\n        si (S = A[i]) alors retourner (vrai); fsi;\n    fait;\n    retourner (faux);\nFin;\nComplexité : n itérations externes × n itérations internes → O(n²).", cost: 65 },
        ],
        explanation: `**Corrigé ligne par ligne :**

\`\`\`
Fonction ExisteSommeAutres (E/ A: TAB, E/ n: entier): booleen
Var i, j, S: entier;
Debut
    Pour i ← 0 à n-1 faire            // candidat A[i]           (n tours)
        S ← 0;                        // remise à zéro de la somme
        Pour j ← 0 à n-1 faire        // parcourir tout le tableau (n tours)
            si (j <> i)               // … sauf l'élément candidat
                alors S ← S + A[j];
            fsi;
        fait;
        si (S = A[i])                 // A[i] = somme des autres ?
            alors retourner (vrai);
        fsi;
    fait;
    retourner (faux);                 // aucun candidat ne convient
Fin;
\`\`\`

**Calcul de complexité.** Pour chacun des n candidats, on refait une somme complète de n−1 additions : C(n) = n × (n−1) additions + n comparaisons → terme de poids fort n² → **O(n²)**, quadratique.

Le gaspillage saute aux yeux : on recalcule presque la même somme n fois. D'où la question b de l'exercice… (défi suivant 😉).`,
        tags: ["complexite", "tableaux", "code"],
      },
      {
        id: "asd-cx-s3e5-ameliore",
        title: "Ex.5b : la même chose, mais en malin",
        order: 10,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        points: 200,
        timeLimitSec: 900,
        prompt: `**Exercice 5b.** On peut améliorer, **au sens de la complexité**, l'algorithme précédent. Écris ce deuxième algorithme et donne sa complexité.

💡 Piste mathématique : si S est la somme de TOUS les éléments, alors « A[i] égale la somme des autres » s'écrit A[i] = S − A[i], c'est-à-dire **2·A[i] = S**.`,
        starter: `Fonction ExisteSommeAutres2 (E/ A: TAB, E/ n: entier): booleen
Var i, S: entier;
Debut
    // TODO : 1) calculer S = somme de TOUS les elements (un seul parcours)
    //         2) chercher un i tel que 2*A[i] = S (un seul parcours)
Fin;`,
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Calcule d'abord la somme totale en un seul parcours", pattern: "S\\s*←\\s*S\\s*\\+\\s*A\\s*\\[", flags: "i" },
            { label: "Teste chaque élément contre la somme totale (2*A[i] = S ou A[i] = S - A[i])", pattern: "(2\\s*\\*\\s*A\\s*\\[|S\\s*-\\s*A\\s*\\[)", flags: "i" },
            { label: "Aucune boucle imbriquée : les deux parcours sont en séquence", pattern: "Pour[\\s\\S]{1,400}?fait\\s*;?[\\s\\S]{1,400}?Pour", flags: "i" },
            { label: "Retourne un booléen (vrai/faux)", pattern: "retourner\\s*\\(?\\s*(vrai|faux)", flags: "i" },
          ],
        }),
        hints: [
          { text: "Un premier Pour pour accumuler S. Puis un second Pour, SÉPARÉ (pas imbriqué !), pour tester chaque élément.", cost: 15 },
          { text: "Le test magique : si (2*A[i] = S) alors retourner (vrai). Pas besoin de recalculer quoi que ce soit.", cost: 30 },
          { text: "📖 Correction complète :\nFonction ExisteSommeAutres2 (E/ A: TAB, E/ n: entier): booleen\nVar i, S: entier;\nDebut\n    S ← 0;\n    Pour i ← 0 à n-1 faire S ← S + A[i]; fait;\n    Pour i ← 0 à n-1 faire\n        si (2*A[i] = S) alors retourner (vrai); fsi;\n    fait;\n    retourner (faux);\nFin;\nComplexité : deux boucles EN SÉQUENCE de n tours chacune → O(n) + O(n) = O(n).", cost: 65 },
        ],
        explanation: `**Corrigé ligne par ligne :**

\`\`\`
Fonction ExisteSommeAutres2 (E/ A: TAB, E/ n: entier): booleen
Var i, S: entier;
Debut
    S ← 0;
    Pour i ← 0 à n-1 faire            // parcours 1 : somme totale
        S ← S + A[i];
    fait;
    Pour i ← 0 à n-1 faire            // parcours 2 : test de chaque élément
        si (2*A[i] = S)               // A[i] = S - A[i]  ⟺  2·A[i] = S
            alors retourner (vrai);
        fsi;
    fait;
    retourner (faux);
Fin;
\`\`\`

**L'idée clé.** La somme des « autres » éléments vaut toujours S − A[i], où S est la somme totale. Inutile de la recalculer pour chaque i : une seule passe suffit pour connaître S, puis chaque test devient une opération en O(1).

**Calcul de complexité.** Deux boucles **en séquence** (règle 1 : addition) : C(n) = c₁·n + c₂·n → **O(n)**, linéaire.

**Vérification sur l'exemple** A = [3, 8, −6, 3, −1, 9] : S = 16 ; on cherche un élément tel que 2·A[i] = 16 → A[1] = 8 ✅.

🏁 Bilan de l'exercice 5 : O(n²) → O(n) juste en réorganisant le calcul. C'est exactement le but du calcul de complexité : détecter ce genre de gain **avant** d'implémenter.`,
        tags: ["complexite", "optimisation", "code"],
      },
      {
        id: "asd-cx-s3e6-deroule",
        title: "Ex.6 : dérouler Fusion_B",
        order: 11,
        difficulty: "medium",
        type: "text",
        points: 200,
        timeLimitSec: 720,
        prompt: `**Exercice 6 (déroulement).** On dispose de deux tableaux triés T1[1..n] et T2[1..n]. **Fusion_B** remplit T3[1..2n] en parcourant **simultanément** T1 et T2 (indices courants i1 et i2) :

- si T1[i1] < T2[i2] : mettre T1[i1] à la fin de T3 et avancer dans T1 ;
- si T1[i1] > T2[i2] : mettre T2[i2] à la fin de T3 et avancer dans T2 ;
- sinon (égalité) : mettre T1[i1] **puis** T2[i2] à la fin de T3 et avancer dans les deux.

Déroule Fusion_B sur :

\`\`\`
T1 : [ 1 | 3 | 5 ]        T2 : [ 2 | 3 | 4 ]
\`\`\`

Donne le contenu final de T3 (valeurs séparées par des espaces).`,
        hints: [
          { text: "Compare toujours les éléments courants des deux tableaux, écris le plus petit dans T3, avance dans le tableau d'où il vient.", cost: 15 },
          { text: "Attention au cas d'égalité (3 et 3) : on écrit LES DEUX, T1 d'abord. Et quand un tableau est épuisé, on recopie le reste de l'autre.", cost: 30 },
          { text: "📖 Correction complète : 1<2 → T3=1 (avance T1) ; 3>2 → T3=1 2 (avance T2) ; 3=3 → T3=1 2 3 3 (avance les deux) ; T1 propose 5, T2 propose 4 : 5>4 → T3=1 2 3 3 4 (avance T2) ; T2 épuisé → recopier le reste de T1 : T3 = 1 2 3 3 4 5.", cost: 60 },
        ],
        answer: "1 2 3 3 4 5",
        accept: ["1,2,3,3,4,5", "1 2 3 3 4 5", "[1,2,3,3,4,5]", "1;2;3;3;4;5", "123345", "1 2 3 3 4 5 "],
        explanation: `**Déroulement pas à pas** (i1 et i2 pointent l'élément courant de chaque tableau) :

| étape | T1[i1] | T2[i2] | comparaison | action | T3 |
|---|---|---|---|---|---|
| 1 | 1 | 2 | 1 < 2 | écrire 1, avancer T1 | 1 |
| 2 | 3 | 2 | 3 > 2 | écrire 2, avancer T2 | 1 2 |
| 3 | 3 | 3 | égalité | écrire 3 (T1) puis 3 (T2), avancer les deux | 1 2 3 3 |
| 4 | 5 | 4 | 5 > 4 | écrire 4, avancer T2 | 1 2 3 3 4 |
| 5 | 5 | — | T2 épuisé | recopier le reste de T1 | **1 2 3 3 4 5** |

Chaque comparaison fait progresser au moins un indice : après au plus 2n étapes, tout est recopié. C'est ce qui rend Fusion_B **linéaire** — la preuve au prochain défi.`,
        tags: ["complexite", "fusion"],
      },
      {
        id: "asd-cx-s3e6-fusion-a",
        title: "Ex.6 : écrire Fusion_A",
        order: 12,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        points: 350,
        timeLimitSec: 1800,
        prompt: `**Exercice 6 (Fusion_A).** Écris l'algorithme **Fusion_A** : initialiser T3 avec T1 (déjà trié), puis y **insérer un à un** les éléments de T2 de façon à ce que l'ordre soit respecté (comme la procédure Insère du cours : décalage à droite puis insertion).

Entrées : T1[0..n-1] et T2[0..n-1] triés croissants. Sortie : T3[0..2n-1] trié.`,
        starter: `Procédure Fusion_A (E/ T1: TAB, E/ T2: TAB, S/ T3: TAB, E/ n: entier)
Var i, j, k, taille: entier;
Debut
    // TODO : 1) recopier T1 dans T3 (taille courante = n)
    //         2) pour chaque element de T2 :
    //            decaler a droite les elements de T3 superieurs
    //            inserer l'element, taille ← taille + 1
Fin;`,
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Recopie d'abord T1 dans T3", pattern: "T3\\s*\\[[^\\]]{1,20}\\]\\s*←\\s*T1\\s*\\[", flags: "i" },
            { label: "Boucle sur chaque élément de T2 à insérer", pattern: "Pour[\\s\\S]{0,120}?T2", flags: "i" },
            { label: "Décale à droite les éléments supérieurs (T3[k+1] ← T3[k])", pattern: "T3\\s*\\[[^\\]]{1,20}\\+\\s*1\\s*\\]\\s*←\\s*T3\\s*\\[", flags: "i" },
            { label: "Recherche la position d'insertion avec un Tant que sur la comparaison", pattern: "Tant\\s*que[\\s\\S]{0,120}?>", flags: "i" },
            { label: "Met à jour la taille courante de T3 après chaque insertion", pattern: "(taille|k|nb)\\s*←\\s*(taille|k|nb)\\s*\\+\\s*1", flags: "i" },
          ],
        }),
        hints: [
          { text: "Étape 1 : Pour i de 0 à n-1 : T3[i] ← T1[i]. La taille utile de T3 vaut alors n.", cost: 20 },
          { text: "Étape 2 : pour chaque T2[j], pars de la fin de T3 (k ← taille-1) et décale tant que (k >= 0 et T3[k] > T2[j]) : T3[k+1] ← T3[k] ; k ← k-1. Puis T3[k+1] ← T2[j].", cost: 35 },
          { text: "📖 Correction complète :\nProcédure Fusion_A (E/ T1, T2: TAB, S/ T3: TAB, E/ n: entier)\nVar i, j, k, taille: entier;\nDebut\n    Pour i ← 0 à n-1 faire T3[i] ← T1[i]; fait;\n    taille ← n;\n    Pour j ← 0 à n-1 faire\n        k ← taille - 1;\n        Tant que (k >= 0 et T3[k] > T2[j])\n        faire T3[k+1] ← T3[k]; k ← k-1; fait;\n        T3[k+1] ← T2[j];\n        taille ← taille + 1;\n    fait;\nFin;\nComplexité au pire : chaque insertion peut décaler jusqu'à taille éléments → n + (n+1) + … + (2n-1) ≈ 3n²/2 → O(n²).", cost: 85 },
        ],
        explanation: `**Corrigé ligne par ligne :**

\`\`\`
Procédure Fusion_A (E/ T1: TAB, E/ T2: TAB, S/ T3: TAB, E/ n: entier)
Var i, j, k, taille: entier;
Debut
    Pour i ← 0 à n-1 faire            // ① initialiser T3 avec T1
        T3[i] ← T1[i];                //    (déjà trié)
    fait;
    taille ← n;                       // taille utile courante de T3
    Pour j ← 0 à n-1 faire            // ② insérer chaque T2[j]
        k ← taille - 1;               //    partir de la fin de T3
        Tant que (k >= 0 et T3[k] > T2[j])
        faire
            T3[k+1] ← T3[k];          //    décalage à droite
            k ← k - 1;
        fait;
        T3[k+1] ← T2[j];              //    insertion au bon endroit
        taille ← taille + 1;
    fait;
Fin;
\`\`\`

**Déroulement sur T1 = [1, 3, 5], T2 = [2, 3, 4] :**

| insertion | T3 avant | décalages | T3 après |
|---|---|---|---|
| 2 | [1, 3, 5] | 5 et 3 décalés | [1, 2, 3, 5] |
| 3 | [1, 2, 3, 5] | 5 décalé | [1, 2, 3, 3, 5] |
| 4 | [1, 2, 3, 3, 5] | 5 décalé | [1, 2, 3, 3, 4, 5] ✅ |

**Complexité au pire des cas.** La recopie initiale coûte n. Pour la j-ième insertion, T3 contient n+j éléments et le décalage peut tous les toucher (cas T2 dont tous les éléments sont plus petits que ceux de T1) : n + (n+1) + … + (2n−1) = somme d'environ n termes de l'ordre de n → ≈ 3n²/2.

**C(n) = O(n²)** — quadratique.`,
        tags: ["complexite", "fusion", "code"],
      },
      {
        id: "asd-cx-s3e6-fusion-b",
        title: "Ex.6 : écrire Fusion_B",
        order: 13,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        points: 350,
        timeLimitSec: 1800,
        prompt: `**Exercice 6 (Fusion_B).** Écris l'algorithme **Fusion_B** : remplir T3 en parcourant **simultanément** T1 et T2 du début jusqu'à leur fin. Soient i1 et i2 les indices courants dans T1 et T2 ; trois cas :

- si T1[i1] < T2[i2] : mettre T1[i1] à la fin de T3 et avancer dans T1 ;
- si T1[i1] > T2[i2] : mettre T2[i2] à la fin de T3 et avancer dans T2 ;
- sinon : mettre T1[i1] **puis** T2[i2] à la fin de T3 et avancer dans les deux.

N'oublie pas de recopier le **reste** du tableau non épuisé à la fin !`,
        starter: `Procédure Fusion_B (E/ T1: TAB, E/ T2: TAB, S/ T3: TAB, E/ n: entier)
Var i1, i2, i3: entier;
Debut
    i1 ← 0; i2 ← 0; i3 ← 0;
    // TODO : tant que les deux tableaux ont des elements :
    //   comparer T1[i1] et T2[i2], recopier le(s) plus petit(s) dans T3
    // TODO : recopier le reste de T1 puis le reste de T2
Fin;`,
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Boucle principale tant que les DEUX tableaux ont des éléments", pattern: "Tant\\s*que[\\s\\S]{0,80}?et", flags: "i" },
            { label: "Compare les éléments courants T1[i1] et T2[i2]", pattern: "T1\\s*\\[\\s*i1\\s*\\]\\s*(<|>)\\s*T2\\s*\\[\\s*i2\\s*\\]", flags: "i" },
            { label: "Avance les indices après chaque recopie", pattern: "i1\\s*←\\s*i1\\s*\\+\\s*1", flags: "i" },
            { label: "Recopie les restes avec des boucles supplémentaires après la boucle principale", pattern: "fait\\s*;?[\\s\\S]{1,400}?Tant\\s*que", flags: "i" },
          ],
        }),
        hints: [
          { text: "Boucle principale : Tant que (i1 < n et i2 < n). Dans le corps, les trois cas de l'énoncé, avec i3 qui avance à chaque écriture dans T3.", cost: 20 },
          { text: "Après la boucle principale, DEUX boucles de vidage : Tant que (i1 < n) → recopier T1 ; Tant que (i2 < n) → recopier T2 (une seule des deux tournera).", cost: 35 },
          { text: "📖 Correction complète :\nProcédure Fusion_B (E/ T1, T2: TAB, S/ T3: TAB, E/ n: entier)\nVar i1, i2, i3: entier;\nDebut\n    i1 ← 0; i2 ← 0; i3 ← 0;\n    Tant que (i1 < n et i2 < n)\n    faire\n        si (T1[i1] < T2[i2]) alors T3[i3] ← T1[i1]; i1 ← i1+1; i3 ← i3+1;\n        sinon si (T1[i1] > T2[i2]) alors T3[i3] ← T2[i2]; i2 ← i2+1; i3 ← i3+1;\n        sinon T3[i3] ← T1[i1]; i3 ← i3+1; T3[i3] ← T2[i2];\n              i1 ← i1+1; i2 ← i2+1; i3 ← i3+1;\n        fsi; fsi;\n    fait;\n    Tant que (i1 < n) faire T3[i3] ← T1[i1]; i1 ← i1+1; i3 ← i3+1; fait;\n    Tant que (i2 < n) faire T3[i3] ← T2[i2]; i2 ← i2+1; i3 ← i3+1; fait;\nFin;\nComplexité : chaque itération avance au moins un indice, 2n cases à remplir → O(n).", cost: 85 },
        ],
        explanation: `**Corrigé ligne par ligne :**

\`\`\`
Procédure Fusion_B (E/ T1: TAB, E/ T2: TAB, S/ T3: TAB, E/ n: entier)
Var i1, i2, i3: entier;
Debut
    i1 ← 0; i2 ← 0; i3 ← 0;              // trois curseurs
    Tant que (i1 < n et i2 < n)          // les deux tableaux sont vivants
    faire
        si (T1[i1] < T2[i2]) alors       // cas 1 : T1 gagne
            T3[i3] ← T1[i1]; i1 ← i1+1; i3 ← i3+1;
        sinon si (T1[i1] > T2[i2]) alors // cas 2 : T2 gagne
            T3[i3] ← T2[i2]; i2 ← i2+1; i3 ← i3+1;
        sinon                            // cas 3 : égalité → les deux
            T3[i3] ← T1[i1]; i3 ← i3+1;
            T3[i3] ← T2[i2];
            i1 ← i1+1; i2 ← i2+1; i3 ← i3+1;
        fsi; fsi;
    fait;
    Tant que (i1 < n)                    // vider le reste de T1
    faire T3[i3] ← T1[i1]; i1 ← i1+1; i3 ← i3+1; fait;
    Tant que (i2 < n)                    // ou vider le reste de T2
    faire T3[i3] ← T2[i2]; i2 ← i2+1; i3 ← i3+1; fait;
Fin;
\`\`\`

**Complexité au pire des cas.** Chaque itération (boucle principale ou boucles de vidage) écrit au moins une valeur dans T3 et fait avancer au moins un indice. Or T3 contient exactement 2n cases : le nombre total d'itérations est **au plus 2n**, à coût constant chacune.

**C(n) = O(n)** — linéaire.

**Comparaison finale (question 2 de l'exercice)** : Fusion_A = O(n²), Fusion_B = O(n) → on choisit **Fusion_B** pour l'implémentation. Détails au défi suivant.`,
        tags: ["complexite", "fusion", "code"],
      },
      {
        id: "asd-cx-s3e6-choix",
        title: "Ex.6 : quel algorithme implémenter ?",
        order: 14,
        difficulty: "easy",
        type: "mcq",
        points: 100,
        timeLimitSec: 300,
        prompt: `**Exercice 6, question 2.** Donne la complexité, **au pire des cas**, des algorithmes Fusion_A et Fusion_B en fonction de la taille des données. Quel algorithme choisis-tu d'implémenter ?`,
        options: [
          "Fusion_A : O(n²), Fusion_B : O(n) → j'implémente Fusion_B",
          "Fusion_A : O(n), Fusion_B : O(n²) → j'implémente Fusion_A",
          "Fusion_A : O(n log n), Fusion_B : O(n log n) → peu importe",
          "Fusion_A : O(n²), Fusion_B : O(n²) → peu importe",
        ],
        answer: 0,
        hints: [
          { text: "Fusion_A insère chaque élément de T2 avec décalages ; Fusion_B avance trois curseurs sans jamais reculer.", cost: 15 },
          { text: "📖 Correction complète : Fusion_A fait au pire n insertions coûtant chacune jusqu'à 2n décalages → O(n²). Fusion_B remplit 2n cases en avançant toujours → O(n). On implémente Fusion_B (règle du cours : comparer les complexités AVANT d'implémenter, et choisir la meilleure).", cost: 60 },
        ],
        explanation: `**Corrigé.** Fusion_A = insertion avec décalage répétée n fois dans un tableau qui grossit : au pire n + (n+1) + … + (2n−1) ≈ 3n²/2 opérations → **O(n²)**. Fusion_B = parcours simultané, chaque itération avance au moins un curseur, 2n cases à remplir → **O(n)**.

**Choix : Fusion_B.** C'est exactement le troisième « besoin » de la notion de complexité vu au cours : *comparer les algorithmes résolvant un problème donné afin de faire un choix avant de les implémenter*. À taille égale, l'écart est colossal : pour n = 10 000, environ 150 millions d'opérations pour A contre 20 000 pour B.`,
        tags: ["complexite", "fusion"],
      },
      // __C1_MORE2__
    ],
  },
  {
    slug: "asd-piles-files",
    title: "Piles & Files — LIFO, FIFO et leurs primitives",
    checkpoint: "algorithmique",
    codename: "Stack & Queue Rally",
    domain: "Structures de données L2",
    theme: "circuit",
    icon: "Cpu",
    accent: "#5FB3C6",
    order: 7,
    difficulty: "medium",
    summary:
      "Deux structures reines : la Pile (LIFO, on empile/dépile par le sommet) et la File (FIFO, on enfile en queue, on défile en tête). Primitives sur liste chaînée, schémas avant/après, et les exercices.",
    objectives: [
      "Distinguer une Pile (LIFO) d'une File (FIFO) et savoir quand utiliser chacune",
      "Déclarer une pile et une file en représentation chaînée (pointeurs ^)",
      "Écrire les primitives Empiler, Dépiler, SommetPile, Enfiler, Défiler",
      "Résoudre un problème avec des piles/files intermédiaires (motif « tout dépiler/défiler »)",
      "Analyser la complexité d'un algorithme à piles imbriquées (SUPPR en O(n²))",
      "Fusionner deux files triées et trier une pile par insertion",
    ],
    lesson: `# 🥞 Piles & Files — les deux structures reines

Après les listes chaînées libres, voici deux structures **disciplinées** : elles imposent **où** on ajoute et **où** on retire. Cette contrainte, loin d'être un défaut, est exactement ce qui les rend puissantes. 🏎️

---

## 1. La Pile (Stack) — LIFO 🥞

Une **pile** fonctionne comme une **pile d'assiettes** : on pose une assiette **au-dessus**, et on reprend toujours celle **du dessus**. Le dernier arrivé est le premier servi : **LIFO** (*Last In, First Out*).

On ne manipule la pile que par **un seul bout** : le **sommet**.

\`\`\`
Empiler(S, C)              Dépiler(S) → retourne C
  ┌───┐                      ┌───┐
  │ C │ ← sommet             │ C │ ─── sort
  ├───┤                      └───┘
  │ B │                      ┌───┐
  ├───┤          ══►         │ B │ ← nouveau sommet
  │ A │                      ├───┤
  └───┘                      │ A │
                             └───┘
\`\`\`

### 1.1 Les primitives d'une pile

| Primitive | Rôle |
|---|---|
| \`InitPile(S)\` | crée une pile **vide** |
| \`PileVide(S)\` | retourne **Vrai** si la pile est vide |
| \`Empiler(S, x)\` | ajoute \`x\` **au sommet** |
| \`Dépiler(S, x)\` | retire l'élément du sommet et le range dans \`x\` |
| \`SommetPile(S)\` | **consulte** le sommet **sans** le retirer |

### 1.2 Représentation par liste chaînée

La pile pointe directement sur son **sommet** ; chaque élément pointe vers celui **en dessous**.

\`\`\`
Type Pile = ^Elément ;
Type Elément = Enregistrement
                   info : chaine ;
                   suivant : ^Elément ;
               FinEnreg ;
\`\`\`

**Empiler** = créer un maillon et le brancher **devant** le sommet :

\`\`\`
Procédure Empiler (E/S S: Pile, E/ x: chaine)
Var nouv : Pile ;
Debut
    nouv ← Allouer(tailleDe(Elément)) ;
    (^nouv).info ← x ;
    (^nouv).suivant ← S ;   // le nouveau pointe sur l'ancien sommet
    S ← nouv ;              // le sommet devient le nouveau maillon
Fin ;
\`\`\`

**Dépiler** = sauver l'info du sommet, avancer S, libérer l'ancien sommet :

\`\`\`
Procédure Dépiler (E/S S: Pile, E/S x: chaine)
Var temp : Pile ;
Debut
    x ← (^S).info ;
    temp ← S ;
    S ← (^S).suivant ;   // le sommet descend d'un cran
    libérer(temp) ;      // on rend la mémoire de l'ancien sommet
Fin ;

Fonction SommetPile (E/ S: Pile): chaine
Debut
    retourner (^S).info ;   // consulte sans retirer
Fin ;
\`\`\`

---

## 2. La File (Queue) — FIFO 🎟️

Une **file** fonctionne comme une **file d'attente** au guichet : on entre **par la queue**, on est servi **par la tête**. Premier arrivé, premier servi : **FIFO** (*First In, First Out*).

Deux bouts distincts : on **enfile** en **queue**, on **défile** en **tête**.

\`\`\`
              défiler ◄── tête              queue ◄── enfiler
                        ┌────┬────┬────┬────┐
   Défiler → A          │ A  │ B  │ C  │ D  │       Enfiler(F, E)
                        └────┴────┴────┴────┘
                          ▲                ▲
                        tête             queue
\`\`\`

### 2.1 Les primitives d'une file

| Primitive | Rôle |
|---|---|
| \`InitFile(F)\` | crée une file **vide** |
| \`FileVide(F)\` | **Vrai** si la file est vide |
| \`Enfiler(F, x)\` | ajoute \`x\` **en queue** |
| \`Défiler(F, x)\` | retire l'élément **de tête** dans \`x\` |
| \`TeteFile(F)\` | consulte la tête sans la retirer |

### 2.2 Représentation par liste chaînée

Une file garde **deux** pointeurs — **tête** (pour défiler) et **queue** (pour enfiler en O(1)) :

\`\`\`
Type File = Enregistrement
                tete, queue : ^Elément ;
            FinEnreg ;
Type Elément = Enregistrement
                   info : entier ;
                   suivant : ^Elément ;
               FinEnreg ;
\`\`\`

> 🧠 **Astuce mémo** — dans beaucoup d'exercices de cet atelier, on **ne peut consulter que la tête** d'une file. Pour parcourir toute la file (ex : \`affiche_File\`), on **défile** chaque élément vers une **file intermédiaire F1**, puis on fait \`F ← F1\` pour tout remettre. C'est le motif à connaître par cœur ! 🔁

---

## 3. Le motif « piles/files intermédiaires » 🔄

Comme on n'accède qu'à **un bout**, presque tous les traitements suivent le même réflexe :

> **Pour fouiller une pile/file sans la perdre, on la vide dans une structure temporaire, puis on la reconstruit.**

C'est exactement ce que font \`affiche_File\` (via \`F1\`), \`vérifOrdre\` (via \`B\`), \`supprim\`, \`insert\` (via \`F1\`) et \`SUPPR\` (via \`T\` et \`R\`) dans cet atelier.

---

## 🧠 Ce qu'il faut retenir

- **Pile = LIFO**, un seul bout (**sommet**) : \`Empiler\`, \`Dépiler\`, \`SommetPile\`.
- **File = FIFO**, deux bouts (**tête** pour défiler, **queue** pour enfiler).
- En **chaîné**, \`Empiler\` branche un maillon devant le sommet ; \`Dépiler\` avance \`S\` et **libère** l'ancien sommet.
- Pour **parcourir** une pile/file, on transvase dans une **structure intermédiaire** puis on **reconstruit**.
- Des boucles imbriquées « dépiler tout » donnent souvent une complexité **O(n²)** (voir SUPPR).

## ⚠️ Erreurs fréquentes des débutants

**1. Confondre l'ordre LIFO et FIFO.**
- ❌ Croire qu'une pile rend les éléments dans l'ordre d'insertion. Non : le **dernier** empilé sort **en premier**.
- ✅ Pile = assiettes (dernier posé, premier repris) ; File = guichet (premier arrivé, premier servi).

**2. Oublier de \`libérer\` en dépilant.**
\`\`\`
// ❌ fuite mémoire : l'ancien sommet n'est jamais rendu
S ← (^S).suivant ;
// ✅ on garde une trace AVANT d'avancer, puis on libère
temp ← S ;  S ← (^S).suivant ;  libérer(temp) ;
\`\`\`
Pourquoi ça casse : sans \`libérer\`, la mémoire de l'ancien sommet reste réservée mais inaccessible → **fuite**. Sur des milliers de dépilements, le programme épuise la mémoire.

**3. Mal ordonner les branchements dans \`Empiler\`.**
\`\`\`
// ❌ on écrase S avant d'avoir mémorisé l'ancien sommet
S ← nouv ;
(^nouv).suivant ← S ;   // nouv pointe sur… lui-même ! Pile corrompue.
// ✅ d'abord brancher nouv sur l'ancien sommet, PUIS déplacer S
(^nouv).suivant ← S ;
S ← nouv ;
\`\`\`

**4. Parcourir une file en consultant autre chose que la tête.**
Une file n'expose que sa **tête**. Vouloir lire « le 3ᵉ élément » directement est impossible : il faut **défiler** jusqu'à lui (en sauvegardant dans une file intermédiaire), sinon on perd les éléments défilés.

**5. Boucler sur une pile vide.**
\`\`\`
// ❌ Dépiler une pile déjà vide → (^S).info avec S = NIL → plantage
Dépiler(S, x) ;
// ✅ toujours tester d'abord
Si non PileVide(S) Alors Dépiler(S, x) Fsi ;
\`\`\``,
    badge: {
      id: "badge-stack-queue",
      name: "Stack & Queue Master",
      icon: "Cpu",
      description:
        "Maîtrise les piles (LIFO) et files (FIFO), leurs primitives chaînées et le motif des structures intermédiaires.",
    },
    challenges: [
      {
        id: "asd-pf-lifo",
        title: "Qui sort en premier de la pile ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🥞 Principe LIFO

Sur une pile \`S\` initialement vide, on exécute :

\`\`\`
Empiler(S, 'A') ;
Empiler(S, 'B') ;
Empiler(S, 'C') ;
Dépiler(S, x) ;
\`\`\`

**Quelle valeur se retrouve dans \`x\` ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Une pile est LIFO : Last In, First Out. Le dernier empilé est au sommet.", cost: 15 },
          { text: "📖 Correction complète : après les 3 empilements, le sommet est 'C' (dernier arrivé). Dépiler retire le sommet → x = 'C'.", cost: 60 },
        ],
        options: ["'A'", "'B'", "'C'", "La pile est vide, erreur"],
        answer: 2,
        explanation: `**LIFO** = *Last In, First Out*. Le **dernier** empilé (\`'C'\`) est au **sommet**, donc c'est lui qui sort en premier.

\`\`\`
  ┌───┐          Dépiler
  │ C │ ← sommet ═══════► x = 'C'
  ├───┤
  │ B │ ← nouveau sommet
  ├───┤
  │ A │
  └───┘
\`\`\``,
        tags: ["pile", "lifo"],
      },
      {
        id: "asd-pf-fifo",
        title: "Qui sort en premier de la file ?",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎟️ Principe FIFO

Sur une file \`F\` initialement vide, on exécute :

\`\`\`
Enfiler(F, 'A') ;
Enfiler(F, 'B') ;
Enfiler(F, 'C') ;
Défiler(F, x) ;
\`\`\`

**Quelle valeur se retrouve dans \`x\` ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Une file est FIFO : First In, First Out. On défile toujours par la tête.", cost: 15 },
          { text: "📖 Correction complète : 'A' est arrivé en premier, il est en tête. Défiler retire la tête → x = 'A'.", cost: 60 },
        ],
        options: ["'A'", "'B'", "'C'", "La file est vide, erreur"],
        answer: 0,
        explanation: `**FIFO** = *First In, First Out*. \`'A'\`, arrivé **en premier**, occupe la **tête** ; on défile par la tête, donc \`x = 'A'\`.

C'est toute la différence avec la pile : même séquence d'insertion, résultat **opposé** ('A' pour la file, 'C' pour la pile).`,
        tags: ["file", "fifo"],
      },
      {
        id: "asd-pf-empiler",
        title: "Écris la primitive Empiler",
        order: 3,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🔧 Primitive Empiler (pile chaînée)

La pile est déclarée ainsi :

\`\`\`
Type Pile = ^Elément ;
Type Elément = Enregistrement info : chaine ; suivant : ^Elément ; FinEnreg ;
\`\`\`

**Écris la procédure \`Empiler(E/S S: Pile, E/ x: chaine)\`** qui ajoute \`x\` au sommet.

⚠️ Ordre des branchements crucial : d'abord relier le nouveau maillon à l'ancien sommet, **puis** déplacer \`S\`.`,
        points: 200,
        timeLimitSec: 600,
        starter: `Procédure Empiler (E/S S: Pile, E/ x: chaine)
Var nouv : Pile ;
Debut

Fin ;`,
        hints: [
          { text: "4 étapes : Allouer un maillon, ranger x dans son info, brancher son suivant sur S, puis faire pointer S sur ce maillon.", cost: 25 },
          { text: "L'ordre `(^nouv).suivant ← S` PUIS `S ← nouv` est obligatoire : l'inverse ferait pointer nouv sur lui-même.", cost: 30 },
          { text: "📖 Correction complète :\n```\nnouv <- Allouer(tailleDe(Elément)) ;\n(^nouv).info <- x ;\n(^nouv).suivant <- S ;\nS <- nouv ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Alloue un nouveau maillon avec Allouer", pattern: "Allouer", flags: "i" },
            { label: "Range x dans le champ info du nouveau maillon", pattern: "info\\s*(←|<-)\\s*x", flags: "i" },
            { label: "Branche le suivant du nouveau maillon sur l'ancien sommet S", pattern: "suivant\\s*(←|<-)\\s*S", flags: "i" },
            { label: "Fais pointer S sur le nouveau maillon (après le branchement)", pattern: "S\\s*(←|<-)\\s*nouv", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Procédure Empiler (E/S S: Pile, E/ x: chaine)
Var nouv : Pile ;
Debut
    nouv ← Allouer(tailleDe(Elément)) ;
    (^nouv).info ← x ;
    (^nouv).suivant ← S ;   // nouv pointe sur l'ancien sommet
    S ← nouv ;              // S pointe sur nouv → nouveau sommet
Fin ;
\`\`\`

**Pourquoi cet ordre ?** Si on écrivait \`S ← nouv\` **avant** \`(^nouv).suivant ← S\`, alors \`S\` vaudrait déjà \`nouv\`, et \`nouv\` finirait par **pointer sur lui-même** — la pile serait corrompue et on perdrait tous les anciens éléments.`,
        tags: ["pile", "code", "primitive"],
      },
      {
        id: "asd-pf-depiler",
        title: "Écris la primitive Dépiler (sans fuite mémoire)",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🔧 Primitive Dépiler (pile chaînée)

**Écris la procédure \`Dépiler(E/S S: Pile, E/S x: chaine)\`** qui retire l'élément du sommet, le range dans \`x\`, et **libère** sa mémoire (pas de fuite !).`,
        points: 200,
        timeLimitSec: 600,
        starter: `Procédure Dépiler (E/S S: Pile, E/S x: chaine)
Var temp : Pile ;
Debut

Fin ;`,
        hints: [
          { text: "Sauve d'abord l'info du sommet dans x. Garde un pointeur temp sur le sommet AVANT d'avancer S.", cost: 25 },
          { text: "Après `S ← (^S).suivant`, l'ancien sommet n'est plus atteignable que par temp : c'est lui qu'il faut libérer.", cost: 30 },
          { text: "📖 Correction complète :\n```\nx <- (^S).info ;\ntemp <- S ;\nS <- (^S).suivant ;\nlibérer(temp) ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Sauvegarde l'info du sommet dans x", pattern: "x\\s*(←|<-)\\s*\\(\\s*\\^\\s*S\\s*\\)\\s*\\.\\s*info", flags: "i" },
            { label: "Garde un pointeur temp sur le sommet avant d'avancer", pattern: "temp\\s*(←|<-)\\s*S", flags: "i" },
            { label: "Fais descendre S sur l'élément suivant", pattern: "S\\s*(←|<-)\\s*\\(\\s*\\^\\s*S\\s*\\)\\s*\\.\\s*suivant", flags: "i" },
            { label: "Libère l'ancien sommet (évite la fuite mémoire)", pattern: "lib[eé]rer\\s*\\(\\s*temp", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Procédure Dépiler (E/S S: Pile, E/S x: chaine)
Var temp : Pile ;
Debut
    x ← (^S).info ;      // on récupère la valeur du sommet
    temp ← S ;           // on retient l'ancien sommet
    S ← (^S).suivant ;   // le sommet descend d'un cran
    libérer(temp) ;      // on rend la mémoire → PAS de fuite
Fin ;
\`\`\`

Sans la ligne \`libérer(temp)\`, chaque \`Dépiler\` laisserait un maillon fantôme en mémoire : c'est la **fuite mémoire** classique. Et sans \`temp\`, après \`S ← (^S).suivant\` on n'aurait **plus aucun moyen** d'atteindre l'ancien sommet pour le libérer.`,
        tags: ["pile", "code", "primitive", "memoire"],
      },
      {
        id: "asd-pf-suppr-complexite",
        title: "Complexité de SUPPR (Exercice 3)",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 📊 Analyse de complexité

Dans l'Exercice 3, la procédure \`SUPPR\` retire d'une pile tous les mots qui sont suffixes d'un autre. Elle utilise **une boucle externe** (dépiler chaque \`M1\`) et, à l'intérieur, **une boucle qui dépile tous les mots restants** (\`M2\`), puis remet les éléments — soit, pour \`n\` mots au départ :

\`\`\`
1 + 2 + … + (n−1) = n(n−1)/2  itérations
\`\`\`

La fonction \`suffixe\` étant en coût **constant** (mots de longueur ≤ 30).

**Donne la complexité de \`SUPPR\` en notation Grand O.** (forme : \`O(...)\`)`,
        points: 350,
        timeLimitSec: 900,
        hints: [
          { text: "n(n−1)/2 = (n² − n)/2. En Grand O, on garde le terme dominant et on ignore les constantes.", cost: 30 },
          { text: "Les boucles (1) et (2) sont chacune en O(n²) et séquentielles ; la boucle (3) en O(n) est négligeable devant.", cost: 40 },
          { text: "📖 Correction complète : n(n−1)/2 = (n²−n)/2 → terme dominant n² → O(n²). Les deux boucles quadratiques séquentielles restent en O(n²), et la boucle finale en O(n) ne change rien. Réponse : O(n²).", cost: 70 },
        ],
        answer: "O(n^2)",
        accept: ["O(n²)", "O(n2)", "o(n^2)", "o(n²)", "O( n^2 )", "O(n*n)", "grand o de n carré", "n^2", "n²"],
        caseSensitive: false,
        explanation: `La boucle interne se répète \`n−1\`, puis \`n−2\`, … puis \`1\` fois selon l'itération externe :

\`\`\`
1 + 2 + … + (n−1) = n(n−1)/2 = (n² − n) / 2
\`\`\`

En **Grand O**, on ne garde que le **terme dominant** (\`n²\`) et on ignore les constantes (le \`/2\`) et les termes de plus bas degré (\`−n\`) :

> **complexité de SUPPR = O(n²)**

Détail du corrigé : la boucle (1) et la boucle (2) sont toutes deux en O(n²) et **séquentielles** (donc O(n²) + O(n²) = O(n²)) ; la boucle (3) de remise en place est en O(n), négligeable devant O(n²).`,
        tags: ["complexite", "pile", "grand-o"],
      },
      {
        id: "asd-pf-compare-dates",
        title: "Comparer deux dates (Exercice 4)",
        order: 6,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 📅 Fonction Compare

On définit :

\`\`\`
Type Date = Enregistrement jour, mois, année : entier ; FinEnreg ;
\`\`\`

**Écris la fonction \`Compare(E/ D1: Date, D2: Date): entier\`** qui retourne :
- \`-1\` si \`D1 < D2\`,
- \`0\` si \`D1 = D2\`,
- \`1\` si \`D1 > D2\`.

💡 Compare d'abord les **années**, puis (si égales) les **mois**, puis (si égaux) les **jours**.`,
        points: 200,
        timeLimitSec: 720,
        starter: `Fonction Compare (E/ D1: Date, D2: Date): entier
Debut

Fin ;`,
        hints: [
          { text: "Structure en cascade : Si année différentes → décider. Sinon comparer les mois. Sinon comparer les jours.", cost: 25 },
          { text: "À chaque niveau : si le champ de D1 > celui de D2 → retourner 1 ; s'il est < → retourner -1 ; sinon descendre au champ suivant.", cost: 30 },
          { text: "📖 Correction complète :\n```\nSi D1.année > D2.année Alors retourner(1)\nSinon Si D1.année < D2.année Alors retourner(-1)\nSinon Si D1.mois > D2.mois Alors retourner(1)\nSinon Si D1.mois < D2.mois Alors retourner(-1)\nSinon Si D1.jour > D2.jour Alors retourner(1)\nSinon Si D1.jour < D2.jour Alors retourner(-1)\nSinon retourner(0) Fsi…\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Compare le champ année de D1 et D2", pattern: "ann[eé]e", flags: "i" },
            { label: "Compare aussi le champ mois", pattern: "mois", flags: "i" },
            { label: "Compare enfin le champ jour", pattern: "jour", flags: "i" },
            { label: "Retourne 1 quand D1 > D2", pattern: "retourner\\s*\\(?\\s*1", flags: "i" },
            { label: "Retourne -1 quand D1 < D2", pattern: "retourner\\s*\\(?\\s*-\\s*1", flags: "i" },
            { label: "Retourne 0 en cas d'égalité", pattern: "retourner\\s*\\(?\\s*0", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Fonction Compare (E/ D1: Date, D2: Date): entier
Debut
    Si (D1.année > D2.année) Alors retourner(1)
    Sinon Si (D1.année < D2.année) Alors retourner(-1)
    Sinon   // même année
        Si (D1.mois > D2.mois) Alors retourner(1)
        Sinon Si (D1.mois < D2.mois) Alors retourner(-1)
        Sinon   // même année et même mois
            Si (D1.jour > D2.jour) Alors retourner(1)
            Sinon Si (D1.jour < D2.jour) Alors retourner(-1)
            Sinon retourner(0)   // dates égales
            Fsi ; Fsi ; Fsi ;
Fin ;
\`\`\`

**Pourquoi cet ordre année → mois → jour ?** L'année a le **poids** le plus fort : deux dates de la même année ne se départagent que par le mois, et à mois égal, par le jour. Comparer le jour en premier donnerait des non-sens (le 31/01/2020 « après » le 01/12/2025). Cette fonction \`Compare\` sert ensuite à \`vérifOrdre\` pour tester si une pile de dates est triée.`,
        tags: ["pile", "code", "date", "enregistrement"],
      },
      {
        id: "asd-pf-affiche-file",
        title: "Pourquoi une file intermédiaire ?",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔁 Le motif de la structure intermédiaire

Dans l'Exercice 5, la procédure \`affiche_File(F)\` doit afficher **tous** les éléments d'une file. Le corrigé **défile** chaque élément vers une file intermédiaire \`F1\`, l'affiche, puis termine par \`F ← F1\`.

**Pourquoi passer par \`F1\` au lieu d'afficher directement ?**`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "Une file n'expose que sa tête. Comment lire le 2e élément sans retirer le 1er ?", cost: 20 },
          { text: "Défiler est destructif : sans sauvegarde, la file serait vide après affichage.", cost: 25 },
          { text: "📖 Correction complète : on ne peut consulter qu'un bout de la file, et défiler retire l'élément. Pour lire tout le contenu il faut défiler chaque valeur — ce qui viderait F. On sauvegarde donc dans F1, puis F ← F1 reconstruit la file intacte.", cost: 60 },
        ],
        options: [
          "Parce qu'une file ne permet de consulter qu'un bout ; défiler est destructif, donc on sauvegarde dans F1 puis on restaure avec F ← F1",
          "Parce que F1 trie automatiquement les éléments",
          "Parce que l'affichage est plus rapide depuis une file vide",
          "Parce qu'une file ne peut pas contenir plus de 30 éléments",
        ],
        answer: 0,
        explanation: `Une file **n'expose que sa tête**, et \`Défiler\` est une opération **destructive** : pour lire le 2ᵉ élément, il faut d'abord retirer le 1ᵉʳ. Afficher toute la file **la viderait** donc.

La parade (le **motif à connaître**) : on défile chaque valeur dans une **file intermédiaire \`F1\`** au fur et à mesure qu'on l'affiche, puis \`F ← F1\` **reconstruit** la file d'origine, intacte.

\`\`\`
Procédure affiche_File (E/S F: File)
Var x: entier; F1: File;
Debut
    InitFile(F1) ;
    Tant que non FileVide(F) faire
        Défiler(F, x) ; Ecrire(x) ; Enfiler(F1, x) ;
    fait ;
    F ← F1 ;
Fin ;
\`\`\`

Le même motif sert pour \`supprim\`, \`insert\` (via \`F1\`) et \`vérifOrdre\` (via une pile \`B\`).`,
        tags: ["file", "motif"],
      },
      {
        id: "asd-pf-fusion-trace",
        title: "Fusion de deux files triées",
        order: 8,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔗 Fusion (Exercice 5-6)

On fusionne deux files **triées** croissantes en une file triée \`C\` (on compare les têtes, on défile la plus petite dans \`C\`, on répète) :

\`\`\`
A : 10 → 20 → 30 → 70
B : 12 → 15 → 60 → 70 → 82
\`\`\`

Après fusion, \`C\` est triée. **Quelle est la 3ᵉ valeur de \`C\` (en partant de la tête) ?**`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "Écris C en fusionnant : compare les têtes, prends la plus petite à chaque étape. Commence : 10 (de A), 12 (de B)…", cost: 20 },
          { text: "C = 10 → 12 → 15 → 20 → 30 → 60 → 70 → 70 → 82. Compte jusqu'au 3e.", cost: 30 },
          { text: "📖 Correction complète : la fusion donne C = 10, 12, 15, 20, 30, 60, 70, 70, 82. La 3ᵉ valeur est 15.", cost: 60 },
        ],
        answer: 15,
        explanation: `On compare les têtes de \`A\` et \`B\` et on défile la plus petite dans \`C\`, jusqu'à épuisement :

\`\`\`
A : 10 → 20 → 30 → 70
B : 12 → 15 → 60 → 70 → 82

C : 10 → 12 → 15 → 20 → 30 → 60 → 70 → 70 → 82
        ①    ②    ③
\`\`\`

- \`10\` (A) < \`12\` (B) → C = [10]
- \`20\` (A) > \`12\` (B) → C = [10, 12]
- \`20\` (A) > \`15\` (B) → C = [10, 12, **15**] ← la **3ᵉ** valeur est **15**.

La file résultat contient les 4 + 5 = **9** éléments, triés. Note : le \`70\` apparaît **deux fois** (une fois de chaque file) — la fusion conserve les doublons.`,
        tags: ["file", "fusion", "trace"],
      },
      {
        id: "asd-pf-tri-pile",
        title: "Trier une pile par insertion (TP)",
        order: 9,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏆 Tri d'une pile

Écris la procédure \`Tri-Pile(E/S A: Pile)\` qui trie les entiers d'une pile \`A\` (résultat : **minimum au sommet**), selon la méthode du TD :

> On utilise une pile intermédiaire. Tant que \`A\` n'est pas vide :
> - si \`B\` est vide **ou** \`SommetPile(A) < SommetPile(B)\` : dépiler \`A\` vers \`B\`, puis vider toute la pile \`C\` dans \`B\` ;
> - sinon : déplacer le sommet de \`B\` vers \`C\`.
>
> À la fin, \`A ← B\`.`,
        points: 350,
        timeLimitSec: 1200,
        starter: `Procédure Tri-Pile (E/S A: Pile)
Var x : entier ; B, C : Pile ;
Debut
    InitPile(B) ; InitPile(C) ;

Fin ;`,
        hints: [
          { text: "Boucle externe : Tant que non PileVide(A). À l'intérieur, le test `PileVide(B) ou SommetPile(A) < SommetPile(B)` décide la branche.", cost: 30 },
          { text: "Branche vraie : dépiler A dans x, empiler x dans B, puis une boucle qui vide C dans B. Branche fausse : dépiler B, empiler dans C.", cost: 40 },
          { text: "📖 Correction complète :\n```\nTant que non PileVide(A) faire\n  Si PileVide(B) ou (SommetPile(A) < SommetPile(B)) Alors\n    Dépiler(A, x) ; Empiler(B, x) ;\n    Tant que non PileVide(C) faire Dépiler(C, x) ; Empiler(B, x) ; fait ;\n  Sinon Dépiler(B, x) ; Empiler(C, x) ;\n  Fsi ;\nfait ;\nA <- B ;\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Boucle externe tant que A n'est pas vide", pattern: "Tant\\s*que[\\s\\S]{0,40}Pile[Vv]ide\\s*\\(\\s*A", flags: "i" },
            { label: "Teste PileVide(B) ou SommetPile(A) < SommetPile(B)", pattern: "Sommet[Pp]ile\\s*\\(\\s*A[\\s\\S]{0,20}<[\\s\\S]{0,20}Sommet[Pp]ile\\s*\\(\\s*B", flags: "i" },
            { label: "Déplace le sommet de A vers B", pattern: "Empiler\\s*\\(\\s*B", flags: "i" },
            { label: "Vide la pile C dans B (boucle interne)", pattern: "D[eé]piler\\s*\\(\\s*C", flags: "i" },
            { label: "Sinon, déplace le sommet de B vers C", pattern: "Empiler\\s*\\(\\s*C", flags: "i" },
            { label: "À la fin, A ← B", pattern: "A\\s*(←|<-)\\s*B", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Procédure Tri-Pile (E/S A: Pile)
Var x : entier ; B, C : Pile ;
Debut
    InitPile(B) ; InitPile(C) ;
    Tant que non PileVide(A) faire
        Si PileVide(B) ou (SommetPile(A) < SommetPile(B)) Alors
            Dépiler(A, x) ; Empiler(B, x) ;
            Tant que non PileVide(C) faire   // on rapatrie C dans B
                Dépiler(C, x) ; Empiler(B, x) ;
            fait ;
        Sinon
            Dépiler(B, x) ; Empiler(C, x) ; // on met de côté dans C
        Fsi ;
    fait ;
    A ← B ;
Fin ;
\`\`\`

**Idée du tri par insertion sur pile :** \`B\` garde les éléments **déjà triés** (min au sommet). Quand le sommet de \`A\` est plus petit que celui de \`B\`, il a sa place au sommet → on l'y met et on **rapatrie** ce qu'on avait mis de côté dans \`C\`. Sinon, on **déblaie** temporairement le sommet de \`B\` vers \`C\` pour créer la place. C'est l'analogue « à trois piles » de l'insertion dans un tableau trié. Complexité : **O(n²)** dans le pire cas (chaque insertion peut re-transvaser toute la pile).`,
        tags: ["pile", "code", "tri", "tp"],
      },
    ],
  },
];
