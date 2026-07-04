/**
 * CyberAce — Checkpoint Algorithmique
 * Modules "fondations" : Chap 0 + Chap 1 (parties 1 et 2)
 */
import type { CourseSeed } from "../../../types";

export const algoFondations: CourseSeed[] = [
  {
    slug: "algo-intro",
    title: "Introduction à l'algorithmique — de l'idée à la machine",
    checkpoint: "algorithmique",
    codename: "Tour de Chauffe",
    domain: "Algorithmique L1",
    theme: "circuit",
    icon: "Cpu",
    accent: "#6FA8DC",
    order: 1,
    difficulty: "easy",
    summary:
      "Découvre ce qu'est vraiment l'informatique, comment une machine traite l'information, et apprends à structurer ton tout premier algorithme : entête, déclarations, actions.",
    objectives: [
      "Expliquer l'origine du mot « informatique » et la définition du traitement automatique de l'information",
      "Décrire la machine de Von Neumann : MC, UAL, UCC et les trois BUS",
      "Appliquer les 4 étapes de résolution d'un problème (analyse, données, résultats, relations)",
      "Distinguer variables et constantes, et nommer un objet selon les règles des identificateurs",
      "Lire un organigramme et connaître la représentation textuelle normalisée",
      "Écrire le squelette complet d'un algorithme : Algorithme / Const / Var / Debut / Fin",
    ],
    lesson: `# 🏁 Introduction à l'algorithmique — bienvenue sur la grille de départ

Bienvenue sur CyberAce ! 🎓 Tu viens de t'installer dans le baquet du pilote : ce premier module est ton **tour de chauffe**. Avant d'écrire la moindre ligne de code, on va comprendre **ce qu'est l'informatique**, **comment une machine "pense"**, et surtout **comment on lui explique quoi faire** — c'est exactement ça, l'algorithmique.

> Ce module couvre l'intégralité des fondamentaux de l'algorithmique — juste raconté façon paddock de course. 🏎️

---

## 1. L'informatique, c'est quoi au juste ?

Quand on demande « c'est quoi l'informatique ? », on entend de tout :

- « C'est l'**ordinateur** ! »
- « C'est **Internet** ! »
- « C'est faire des **programmes** ! »
- « C'est **faire des calculs en utilisant un ordinateur** ! »

Bien vu : tout ça est **lié** à l'informatique. Mais d'où vient ce mot, exactement ?

### 1.1 L'origine du mot « informatique » 📜

- **1957** : un ingénieur **allemand**, **Karl Steinbuch**, écrit un livre intitulé *Informatik : Automatische Informationsverarbeitung* — en français : **« Informatique : traitement automatique de l'information »**. C'est la **première apparition** du mot.
- **1962** : le **français Philippe Dreyfus** reprend le terme pour désigner le **traitement automatique des données**, et fonde sa société **SIA** — acronyme de « **Société d'Informatique Appliquée** ».

Le mot lui-même est une contraction :

\`\`\`
INFORMATion  +  autoMATIQUE
    │                │
    └───► INFORMATIQUE ◄───┘
\`\`\`

### 1.2 La définition officielle

> **L'informatique** est un domaine d'activité scientifique, technique et industriel concernant le **traitement automatique de l'information numérique** par l'exécution de **programmes informatiques** par des **machines** : des systèmes embarqués, des ordinateurs, des robots, des automates, etc. *(Wikipédia)*

Retiens les **4 ingrédients** de cette définition :

| Ingrédient | Rôle dans la course |
|---|---|
| **Informations numériques** | le carburant : ce qu'on traite |
| **Traitements** | la course elle-même : ce qu'on fait subir aux données |
| **Machines** | la voiture : ce qui exécute |
| **Programmes** | le plan de course : la liste d'instructions |

Mais… comment faire tout ça ? C'est toute la suite du cours. 👇

---

## 2. Traiter l'information : l'humain d'abord, la machine ensuite

Depuis des **millénaires**, l'homme crée et utilise des **outils** qui l'aident à réaliser des tâches pénibles : la roue, le levier, le moulin…

⚠️ Point crucial : **pour créer un outil qui nous aide à réaliser une tâche, il faut d'abord bien comprendre ce qu'on doit faire**. Au final, cet outil va **nous remplacer** dans la réalisation de la tâche.

Alors, que se passe-t-il quand **toi**, être humain, tu traites une information ? Trois étapes :

1. **Avoir l'information** (tes yeux, tes oreilles…)
2. **Traiter l'information** (ton cerveau 🧠)
3. **Donner les résultats** (ta voix, ta main…)

L'outil qui va nous remplacer doit faire **exactement la même chose**… mais de manière **automatique** :

\`\`\`
        L'HUMAIN                            LA MACHINE
 ┌───────────────────────┐        ┌────────────────────────────────────┐
 │ 1. Avoir l'information │ ────►  │ Unité d'Entrée (UE)                │
 │ 2. Traiter l'information│ ────► │ Unité Centrale de Traitement (UCT) │
 │ 3. Donner les résultats │ ────► │ Unité de Sortie (US)               │
 └───────────────────────┘        └────────────────────────────────────┘
                                   └───── Système Informatique ─────┘
\`\`\`

L'ensemble **UE + UCT + US** forme ce qu'on appelle un **Système Informatique**. 🖥️

---

## 3. Parler à la machine : bits et binaire

Oui, mais **comment faire passer l'information** à la machine ?

Chaque être vivant a son propre langage de communication : les humains, les abeilles, les fourmis… Sauf que notre fameuse machine **n'est pas un être vivant** ! 😅

Pas grave : on peut toujours « lui donner une vie ». Avec une personne sourde, on trouve bien un moyen de transmettre l'information : un **langage de signes**. Pour la machine, ce sera pareil… mais avec un **signal** — un **signal électrique** !

Ça te rappelle quelque chose ? Le **MORSE** : \`.- -... -.-. --.-\` — des points et des tirets. Ici, au lieu de points (.) et de tirets (-), on utilise :

- des **zéros (0)**
- et des **uns (1)**

qu'on appelle des **BIT** : **BI**nary digi**T** (chiffre binaire). 💡

« Et qu'est-ce qu'on peut faire avec des 0 et des 1 ?! SOS… » Pas de panique : **les MATHÉMATIQUES sont là** ! On sait facilement passer :

- du système **DÉCIMAL** au système **BINAIRE**,
- et inversement du **BINAIRE** au **DÉCIMAL**.

*(Tu verras les conversions en détail dans le module machine — ici on retient le principe.)*

---

## 4. Le langage machine et la machine de Von Neumann

### 4.1 Comment la machine fait-elle des opérations ?

La machine, c'est **comme un enfant** : on lui apprend des choses de base, ensuite quand on lui demande de répéter, elle répète. Elle est dotée d'un ensemble de **circuits de base** qui réalisent des **opérations simples**.

Pour faire un traitement donné, c'est **à nous de nous adapter** : trouver des solutions **dans le langage de la machine** ! (Au primaire, on t'a bien appris à faire des additions sans rien connaître aux systèmes de numération, non ? 😉)

Mais quel langage parle la machine ?!

### 4.2 Le langage machine

> Le **langage machine**, ou **code machine**, est la suite de **bits** interprétée par le **processeur** (unité de traitement) d'un ordinateur exécutant un programme informatique. C'est le **langage natif** d'un processeur, c'est-à-dire **le seul qu'il puisse traiter**. Il est composé d'**instructions** et de **données à traiter** codées en **binaire**. *(Wikipédia)*

L'interprétation du code binaire se fait suivant un **modèle (architecture)** proposé par **John Von Neumann**, élaboré en **juin 1945** — et nos ordinateurs actuels suivent toujours ce plan !

### 4.3 La machine de Von Neumann 🏗️

L'**Unité Centrale de Traitement (UCT)** de cette machine est composée de **trois unités** :

| Unité | Rôle |
|---|---|
| **MC** — Mémoire Centrale | **stocker** les programmes, les données et les résultats |
| **UAL** — Unité Arithmétique et Logique | **réaliser** les opérations arithmétiques et logiques |
| **UCC** — Unité de Commande et de Contrôle | **contrôler** le déroulement de toutes les opérations |

Ces unités sont reliées entre elles par des liens physiques qu'on appelle des **BUS** :

\`\`\`
                ┌────────────────────────────┐
                │   UCC — Unité de Commande  │
                │       et de Contrôle       │
                └─────────────┬──────────────┘
                              │  BUS de commandes
              ┌───────────────┴────────────────┐
              │                                │
      ┌───────┴────────┐              ┌────────┴───────┐
      │      MC        │ BUS adresses │      UAL       │
      │   (Mémoire     │◄────────────►│  (opérations   │
      │   Centrale)    │ BUS données  │  arithmétiques │
      │                │◄────────────►│  et logiques)  │
      └────────────────┘              └────────────────┘
\`\`\`

Trois BUS, trois autoroutes : **BUS de commandes**, **BUS d'adresses**, **BUS de données**. 🛣️

### 4.4 Exemple : demander à cette machine de calculer 7 + 5

Imaginons que le circuit « somme » de la machine porte le code opération \`001\` :

- l'opération **+** se code : \`001\`
- **7** en binaire sur 4 bits : \`0111\`
- **5** en binaire sur 4 bits : \`0101\`

Le **mot machine** complet est donc :

\`\`\`
   001      0111     0101
   (+)       (7)      (5)
opération  opérande  opérande

mot machine :  001 0111 0101
\`\`\`

Voilà, tu parles Machine ! … Ah non, c'est pas si simple, monsieur ?! 😵 C'est vrai, ce n'est **pas** simple. Mais la machine ne comprend **que ça** ! Il n'y a pas un autre moyen ?

---

## 5. Le compilateur : notre traducteur officiel 🌐

Si, la solution existe : **un traducteur** !

Au lieu d'apprendre le langage machine, on préfère des langages plus simples — les **langages de programmation** : **Pascal, C, Python, Java**… — puis on passe par une **phase de traduction** pour arriver au langage machine.

Cette phase de traduction est généralement assurée par un programme appelé **Compilateur** :

> Un **compilateur** informatique est un **programme** qui **traduit le code source** (compréhensible par les humains) **en code binaire** (compréhensible par les machines). Le but étant de générer un **programme exécutable** par un ordinateur.

\`\`\`
 Code source            COMPILATEUR            Code binaire
 (humain) ────────────► traduction ──────────► (machine)
 Pascal, C,                                     001 0111 0101...
 Python, Java…                                  → exécutable
\`\`\`

**Mais quel langage de programmation doit-on apprendre ?** On peut choisir **n'importe lequel**. Le plus important est de **savoir présenter une solution informatique à un problème donné**, de sorte que la machine puisse l'exécuter.

🏆 **Ce savoir-faire est le but du module ALGORITHMIQUE.**

### Objectifs du cours

1. Apprendre les **concepts de base** de l'algorithmique et de la programmation.
2. Être capable de **mettre en œuvre ces concepts** pour analyser des problèmes simples et écrire les programmes correspondants.
3. Apprendre le **langage de programmation C**.

### Bibliographie 📚

- R. Malgouyres, R. Zrour et F. Feschet, *Initiation à l'algorithmique et à la programmation en C : cours avec 129 exercices corrigés*, DUNOD, 2011.
- Yves Granjon, *Informatique : algorithmes en Pascal et en langage C*, DUNOD, 2004.
- M.C. BELAID, *Initiation à l'Algorithmique*, Pages Bleues, 2020.
- M.C. BELAID, *Le Langage C : de l'algorithme au programme*, Pages Bleues, 2020.

---

## 6. Les étapes de résolution d'un problème 🗺️

Avant de foncer tête baissée, un bon pilote étudie le circuit. Résoudre un problème, c'est **toujours** suivre ces étapes :

1. **Analyse du problème** : qu'est-ce qu'on veut faire ?
2. **Définir les données** : leurs caractéristiques, leurs types.
3. **Définir les résultats** : leurs caractéristiques, leurs types.
4. **Définir les relations entre résultats et données** : comment passer des données aux résultats ?

### 6.1 Exemple grandeur nature : le jus d'orange 🍊

**Problème : préparer un litre de jus d'orange naturel concentré à 60 %.**

**① Analyse** — La préparation d'un jus d'orange naturel concentré à 60 % consiste à **extraire 60 cl de jus** du fruit orange, puis lui **rajouter 40 cl d'eau**. Pour le sucrer, on peut rajouter du miel ou des dattes.

**② Les données** :
- **5 à 8 oranges** suivant la qualité (plus ou moins juteuses),
- **40 cl d'eau**,
- du **miel** ou quelques **dattes**, suivant le goût qu'on veut,
- en plus des **outils** : couteau, presse (ou mixeur), récipient, bouteille, passoire, entonnoir.

**③ Le résultat** :
- **1 litre de jus** (liquide) **concentré à 60 %**.

**④ Relations entre résultats et données** — pour passer des données au résultat, on exécute les actions suivantes, **dans l'ordre** :

1. **Laver** les oranges si elles ne sont pas propres.
2. **Couper en deux** pour une presse, ou **peler puis couper en morceaux** pour un mixeur, puis **enlever les pépins**.
3. Si on utilise les dattes, **dénoyauter** puis **couper en morceaux**.
4. **Presser** les oranges, ou **mixer** les oranges et les dattes avec l'eau (suivant l'outil).
5. Si on utilise une presse, **diluer le miel dans l'eau**.
6. **Mettre le tout** dans le récipient.
7. **Verser dans la bouteille** à travers l'entonnoir. Utiliser la passoire si on veut un jus clair.

### 6.2 C'est ça… un ALGORITHME ! 🏁

> **Définition** — Un **algorithme** est une **suite finie d'actions élémentaires** exécutées dans un **ordre précis** sur un **ensemble de données** permettant de **résoudre un problème**.

Chaque mot compte :
- **suite finie** : ça se termine (pas de recette infinie !) ;
- **actions élémentaires** : chaque étape est simple et réalisable ;
- **ordre précis** : verser avant de presser… bonne chance 😅 ;
- **ensemble de données** : les oranges, l'eau, le miel ;
- **résoudre un problème** : obtenir le litre de jus.

### 6.3 Et pour un problème informatique ?

L'**analyse** consiste à :

1. **Définir tous les objets** utilisés, représentant les **données en entrée** et les **résultats en sortie**.
2. **Définir toutes les actions élémentaires** qui seront exécutées **dans l'ordre** pour aboutir aux résultats.

Nouveau mot au vocabulaire : **objet**. Voyons ça. 👇

---

## 7. Les objets : le carburant de l'algorithme ⛽

> **Définition** — Un **objet** est l'**entité manipulée par une action**. On distingue **deux classes** d'objets : les **constantes** et les **variables**.

### 7.1 Variables vs constantes

**Exemple** : l'action \`S = A + 2\` manipule **trois objets** :
- **2 objets variables** : \`S\` et \`A\`,
- **1 objet constant** : \`2\`.

Quelle est la différence ?

| Classe | Comportement | Analogie du jus 🍊 |
|---|---|---|
| **Variable** | peut **changer de valeur** dans l'algorithme, peut être modifiée | les **oranges** (on les lave, coupe, presse…) |
| **Constante** | **garde la même valeur** pendant toute l'exécution | le **couteau** (il reste un couteau du début à la fin) |

### 7.2 Les 3 caractéristiques d'un objet

Un objet est caractérisé par :

1. **Nom** : appelé **identificateur**, il permet d'**identifier** l'objet ;
2. **Type** : l'**ensemble des valeurs** que peut prendre l'objet (réel, entier, caractère…) — c'est son **domaine de définition** ;
3. **Valeur** : un **élément du type**, pris à un instant donné.

\`\`\`
┌────────────────────────┐
│  Nom    : Age          │   ← l'étiquette
│  Type   : entier       │   ← le domaine autorisé
│  Valeur : 18           │   ← le contenu à l'instant t
└────────────────────────┘
\`\`\`

---

## 8. Les identificateurs : la plaque d'immatriculation 🔤

Un identificateur doit respecter des **règles de construction** strictes :

1. Il est formé **uniquement** des caractères de l'alphabet (**A à Z** ou **a à z**), des **chiffres (0 à 9)** et du caractère **souligné \`_\`** (tiret du 8).
2. Il comporte **au moins un caractère**.
3. Le **premier caractère doit être une lettre**.

### Exemples

| Identificateur | Verdict | Pourquoi |
|---|---|---|
| \`TTC\` | ✅ correct | lettres uniquement |
| \`Gr3\` | ✅ correct | lettre puis lettre puis chiffre |
| \`sect\` | ✅ correct | minuscules autorisées |
| \`Nom_Et\` | ✅ correct | le souligné \`_\` est permis |
| \`Note_1_2_3\` | ✅ correct | lettres, chiffres, soulignés |
| \`X\`, \`y\` | ✅ corrects | un seul caractère suffit |
| \`9TH\` | ❌ incorrect | commence par un **chiffre** |
| \`Gr 3\` | ❌ incorrect | contient un **espace** |
| \`S?\` | ❌ incorrect | \`?\` n'est pas un caractère permis |
| \`Nom-Et\` | ❌ incorrect | le **tiret \`-\`** n'est pas permis (≠ souligné \`_\`) |

**Remarques** 📌
- De préférence, choisis des **noms significatifs** (\`Moyenne\` plutôt que \`M\`).
- Certains mots ne sont **pas permis** : ce sont les **mots clés** du langage (\`Algorithme\`, \`Var\`, \`Debut\`…).
- Évite les **noms trop longs**.

---

## 9. Deux façons de représenter un algorithme 🖊️

Historiquement, il existe **deux représentations**.

### 9.1 L'organigramme (représentation graphique)

C'est une représentation **graphique** utilisant des **symboles** :

\`\`\`
  (  Début / Fin  )      ovale        : Début ou Fin
   /  A , B  /           parallélogr. : Entrées / Sorties
  ┌───────────┐          rectangle    : Traitements
  │ X ← -B/A  │
  ◇ condition ◇          losange      : Tests (Oui / Non)
     ──────►             flèches      : enchaînement des actions
\`\`\`

**Exemple : résoudre l'équation A·x + B = 0.**

*Analyse* : c'est une équation du **premier degré**. Sa solution est **−B/A**, à condition que **A ≠ 0**. Si A est nul, l'équation **n'a pas de solution** dans ℝ.

\`\`\`
              ( Début )
                  │
              /  A, B  /          ← on récupère A et B
                  │
             ◇  A = 0 ?  ◇
              /         \\
           Non           Oui
            │             │
      ┌───────────┐   ┌──────────────────────────┐
      │ X ← -B/A  │   │ Afficher 'Pas de solution'│
      └───────────┘   └──────────────────────────┘
            │             │
      ┌───────────┐       │
      │ Afficher X│       │
      └───────────┘       │
            └──────┬──────┘
                ( Fin )
\`\`\`

**Petite trace pour vérifier** 🕵️ :

| Cas | A | B | Test A = 0 ? | Chemin | Affichage |
|---|---|---|---|---|---|
| 1 | 2 | −8 | Faux | X ← −B/A = 8/2 = **4** | \`4\` |
| 2 | 0 | 3 | Vrai | branche « Oui » | \`Pas de solution\` |

L'organigramme offre une **vue d'ensemble** de l'algorithme… mais il est **quasiment abandonné aujourd'hui** (essaie de dessiner un organigramme de 500 actions 😱).

### 9.2 L'algorithme (représentation textuelle)

C'est une représentation **textuelle normalisée**. La structure générale ressemble à… une **recette de cuisine** ! Elle est formée de **trois parties** :

| Recette 👩‍🍳 | Algorithme 💻 |
|---|---|
| Titre | **Partie Entête** |
| Ingrédients | **Partie Déclaration** |
| Préparation | **Partie Action** |

Au lieu d'utiliser des symboles, on utilise des mots spéciaux appelés **Mots Réservés** ou **Mots Clés** (\`Algorithme\`, \`Const\`, \`Var\`, \`Debut\`, \`Fin\`…).

---

## 10. La structure d'un algorithme, pièce par pièce 🧩

### 10.1 Partie Entête

Elle définit le **nom** de l'algorithme, avec le mot clé \`Algorithme\` et une syntaxe à respecter :

\`\`\`
Algorithme <nomAlgo> ;
\`\`\`

\`<nomAlgo>\` est un **identificateur** représentant le nom de l'algorithme. On peut donner n'importe quel nom, mais il est préférable qu'il soit **représentatif**.

**Exemples** :

\`\`\`
Algorithme Facture ;
Algorithme equation ;
Algorithme calcul_somme ;
\`\`\`

### 10.2 Partie Déclaration

On y déclare **tous les objets manipulés** dans l'algorithme (constantes et variables), en spécifiant **deux caractéristiques** :

- le **nom** et le **type** pour les **variables** ;
- le **nom** et la **valeur** pour les **constantes**.

Syntaxe :

\`\`\`
Const  <IdObj> = <ValeurObj> ;
Var    <IdObj> : <TypeObj> ;
\`\`\`

**Exemple** :

\`\`\`
Const Pi = 3.14 ;
Var   Age : entier ;
\`\`\`

📌 **Remarque** — les objets de **même type** peuvent être **regroupés** :

\`\`\`
Var Note1, Note2, Moyenne : reel ;
\`\`\`

### 10.3 Quel est l'effet de la déclaration dans le système ? 🧠

Les déclarations permettent au compilateur de **réserver un espace mémoire** à chaque objet, dont la **taille varie suivant le type** déclaré.

La machine possède une mémoire (la fameuse **MC** de Von Neumann !), qui peut recevoir des **ordres de mémorisation**. Chaque déclaration correspond à un ordre qui dit à la mémoire : « **Prépare-moi un espace appelé \`<IdObj>\`** ».

\`\`\`
Const Pi = 3.141592 ;              Mémoire Centrale
Var   Age     : entier ;      ┌────────────┬────────────┐
      Moyenne : reel ;        │ Age        │ Moyenne    │
      Sect    : caractere ;   │ [    ?   ] │ [    ?   ] │
                              ├────────────┼────────────┤
                              │ Sect       │ Pi         │
                              │ [    ?   ] │ 3.141592   │
                              └────────────┴────────────┘
\`\`\`

Les variables (\`Age\`, \`Moyenne\`, \`Sect\`) ont un espace réservé **mais pas encore de valeur** ; la constante \`Pi\` est déjà remplie avec \`3.141592\` **pour toujours**.

Mais c'est quoi, \`entier\`, \`reel\`, \`caractere\` ? 🤔 Ce sont les **types de base** — le sujet du prochain module ! Il en existe **quatre** : **entier**, **reel**, **caractere** et **booleen**.

### 10.4 Partie Action

Cette partie contient les **différentes actions élémentaires** décrivant la solution, encadrées par \`Debut\` et \`Fin.\` :

\`\`\`
Debut
    <Action1> ;
    <Action2> ;
    ---
    <ActionN> ;
Fin.
\`\`\`

### 10.5 Le squelette complet 🦴

\`\`\`
Algorithme <nomAlgo> ;          ← Entête   (le titre)
Const <Id> = <Valeur> ;         ← Déclarations (les ingrédients)
Var   <Id> : <Type> ;
Debut                           ← Action   (la préparation)
    <Action1> ;
    <Action2> ;
Fin.                            ← n'oublie pas le POINT final !
\`\`\`

Les actions (\`Lire\`, \`Ecrire\`, l'affectation \`←\`…), c'est le programme du prochain module. Garde ton casque, on y va juste après. 🪖

---

## 🧠 Ce qu'il faut retenir

- **Informatique** = **INFORMATion + autoMATIQUE** (Steinbuch 1957, Dreyfus 1962) : le **traitement automatique de l'information numérique** par des machines exécutant des programmes.
- Un **système informatique** = **Unité d'Entrée + Unité Centrale de Traitement + Unité de Sortie** — le miroir automatique de « avoir → traiter → restituer l'information ».
- La machine ne parle que **binaire** : des **0** et des **1**, les **BITs** (BInary digiT).
- **Machine de Von Neumann** (juin 1945) : l'UCT = **MC** (stockage) + **UAL** (calculs) + **UCC** (contrôle), reliées par les **BUS** de commandes, d'adresses et de données.
- Le **compilateur** traduit le **code source** (humain : Pascal, C, Python, Java…) en **code binaire** (machine) pour produire un **exécutable**.
- Résoudre un problème = **Analyse → Données → Résultats → Relations résultats-données**.
- Un **algorithme** = **suite finie d'actions élémentaires**, exécutées dans un **ordre précis**, sur un **ensemble de données**, pour **résoudre un problème**.
- Un **objet** (entité manipulée) est soit une **variable** (peut changer), soit une **constante** (figée). Il a **3 caractéristiques** : **Nom** (identificateur), **Type**, **Valeur**.
- **Identificateur** : lettres + chiffres + \`_\`, au moins 1 caractère, **commence par une lettre**, pas un mot clé.
- Deux représentations : l'**organigramme** (graphique, abandonné) et l'**algorithme textuel** (normalisé) en **3 parties** : **Entête** (\`Algorithme nom ;\`), **Déclaration** (\`Const\` / \`Var\`), **Action** (\`Debut … Fin.\`).
- **Déclarer** un objet = ordonner à la Mémoire Centrale de **réserver un espace** nommé, de taille adaptée au type.

## ⚠️ Erreurs fréquentes des débutants

### 1. L'identificateur illégal 🚫

**Ce qui ne va pas** : nommer un objet \`9TH\`, \`Gr 3\`, \`S?\` ou \`Nom-Et\`.

**Pourquoi ça casse** : le compilateur découpe ton texte caractère par caractère. Un nom qui commence par un chiffre est pris pour un nombre ; un espace coupe le nom en deux mots ; \`?\` et \`-\` sont des symboles réservés à d'autres usages (le \`-\` est une soustraction : \`Nom-Et\` = « Nom moins Et » !).

**Comment corriger** : uniquement lettres/chiffres/\`_\`, première position = lettre.

\`\`\`
Var 9TH    : entier ;    ← ✗ commence par un chiffre
Var Gr 3   : entier ;    ← ✗ espace interdit
Var Nom-Et : entier ;    ← ✗ tiret interdit (c'est un "moins" !)

Var TH9    : entier ;    ← ✓
Var Gr_3   : entier ;    ← ✓ le souligné remplace l'espace
Var Nom_Et : entier ;    ← ✓
\`\`\`

### 2. Utiliser un objet jamais déclaré 👻

**Ce qui ne va pas** : écrire des actions sur \`Moyenne\` alors qu'aucune ligne \`Var Moyenne : reel ;\` n'existe.

**Pourquoi ça casse** : sans déclaration, la Mémoire Centrale n'a **jamais reçu l'ordre** de réserver un espace nommé \`Moyenne\`. La machine ne sait ni où lire, ni où écrire : erreur immédiate.

**Comment corriger** : chaque objet manipulé dans la partie Action doit apparaître dans la partie Déclaration.

\`\`\`
Algorithme calcul ;           Algorithme calcul ;
Debut                         Var Moyenne : reel ;   ← ✓ espace réservé
   ... Moyenne ...     ─►     Debut
Fin.                             ... Moyenne ...
   ✗ Moyenne inconnue         Fin.
\`\`\`

### 3. Modifier une constante 🔒

**Ce qui ne va pas** : déclarer \`Const Pi = 3.14 ;\` puis vouloir changer Pi dans l'algorithme.

**Pourquoi ça casse** : une **constante garde la même valeur pendant toute l'exécution** — c'est son contrat. Elle est déclarée avec une **valeur**, pas avec un type modifiable. C'est le couteau du jus d'orange : il ne devient jamais une cuillère.

**Comment corriger** : si la valeur doit évoluer, c'est une **variable** — déclare-la avec \`Var\`.

\`\`\`
Const Pi = 3.14 ;             Var Taux : reel ;   ← ✓ variable : peut changer
... Pi prend 3.15 ...  ✗      ... Taux peut être modifié ...
\`\`\`

### 4. Oublier la ponctuation du squelette ✏️

**Ce qui ne va pas** : oublier le \`;\` après l'entête ou les déclarations, ou le **point** après \`Fin\`.

**Pourquoi ça casse** : les \`;\` séparent les actions et les déclarations — sans eux, le compilateur colle deux instructions et ne comprend plus rien. \`Fin.\` avec son point marque la **fin définitive** de l'algorithme.

**Comment corriger** : relis ton squelette — chaque déclaration et chaque action se termine par \`;\`, et l'algorithme entier par \`Fin.\`.

\`\`\`
Algorithme Facture            Algorithme Facture ;      ← ✓ ;
Var X : entier                Var X : entier ;          ← ✓ ;
Debut                         Debut
Fin                           Fin.                      ← ✓ point final
\`\`\`

### 5. Coder avant d'analyser 🏎️💥

**Ce qui ne va pas** : sauter directement à l'écriture de l'algorithme sans passer par les 4 étapes.

**Pourquoi ça casse** : sans analyse, tu ne sais ni **quelles données** il te faut, ni **quel résultat** produire, ni **comment** les relier. Résultat : des objets manquants, des actions dans le désordre — le jus d'orange où on verse avant de presser.

**Comment corriger** : toujours dans l'ordre — **Analyse → Données → Résultats → Relations** — puis seulement l'algorithme.
`,
    badge: {
      id: "badge-algo-intro",
      name: "Feu Vert Algorithmique",
      icon: "Flag",
      description:
        "A bouclé le tour de chauffe : origines de l'informatique, machine de Von Neumann, étapes d'analyse et squelette d'un algorithme n'ont plus de secret.",
    },
    challenges: [
      {
        id: "algo-intro-origine",
        title: "D'où vient le mot « informatique » ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 📜 Contrôle des papiers sur la grille de départ

En 1957, un ingénieur allemand publie un livre au titre prophétique. En 1962, un Français reprend le terme et fonde une société. Le mot « informatique » est né.

**Quelle est la véritable origine du mot « informatique » ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          {
            text: "Karl Steinbuch (1957) a intitulé son livre « Informatik : Automatische Informationsverarbeitung ». Traduis : « traitement automatique de l'information »… deux mots à fusionner.",
            cost: 15,
          },
          {
            text: "📖 Correction complète : INFORMATion + autoMATIQUE = INFORMATIQUE. Première apparition en 1957 chez l'Allemand Karl Steinbuch ; en 1962 le Français Philippe Dreyfus reprend le terme pour le traitement automatique des données et fonde la SIA (Société d'Informatique Appliquée).",
            cost: 60,
          },
        ],
        options: [
          "De l'anglais « informatics », inventé par IBM dans les années 70",
          "De la contraction d'« information » et d'« automatique »",
          "Du nom de la société SIA, fondée avant l'invention du mot",
          "De la contraction d'« information » et de « mathématique »",
        ],
        answer: 1,
        explanation: `**Informatique = INFORMATion + autoMATIQUE** : le traitement **automatique** de l'**information**.

- **1957** : Karl Steinbuch (ingénieur allemand) écrit *Informatik : Automatische Informationsverarbeitung* — « Informatique : traitement automatique de l'information ». C'est la première apparition du mot.
- **1962** : Philippe Dreyfus (français) l'utilise pour désigner le traitement automatique des données et fonde la **SIA** (« Société d'Informatique Appliquée ») — la société vient donc **après** le mot, pas avant.

Les pièges : « informatics » est la traduction anglaise (postérieure), et le « M » signifie Mathématiques mais n'entre pas dans la composition du mot informatique.`,
        tags: ["algo", "intro", "culture"],
      },
      {
        id: "algo-intro-von-neumann",
        title: "Dans le moteur : la machine de Von Neumann",
        order: 2,
        difficulty: "easy",
        type: "multi",
        prompt: `## 🏗️ Inspection moteur

En juin 1945, John Von Neumann propose l'architecture que nos ordinateurs suivent encore aujourd'hui. Son **Unité Centrale de Traitement (UCT)** est composée de **trois unités** reliées par des BUS.

**Coche les TROIS unités qui composent l'UCT :**`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          {
            text: "L'Unité d'Entrée et l'Unité de Sortie font partie du système informatique complet… mais pas de l'UCT elle-même.",
            cost: 20,
          },
          {
            text: "Les BUS (commandes, adresses, données) sont les liens physiques qui RELIENT les unités — ce ne sont pas des unités.",
            cost: 25,
          },
          {
            text: "📖 Correction complète : l'UCT = MC (Mémoire Centrale, stocke programmes/données/résultats) + UAL (Unité Arithmétique et Logique, réalise les opérations) + UCC (Unité de Commande et de Contrôle, contrôle le déroulement). UE/US encadrent l'UCT dans le système informatique, et les 3 BUS relient le tout.",
            cost: 60,
          },
        ],
        options: [
          "La Mémoire Centrale (MC)",
          "L'Unité d'Entrée (UE)",
          "L'Unité Arithmétique et Logique (UAL)",
          "L'Unité de Sortie (US)",
          "L'Unité de Commande et de Contrôle (UCC)",
          "Le BUS de données",
        ],
        answer: [0, 2, 4],
        explanation: `L'**UCT** de la machine de Von Neumann (juin 1945) contient exactement **trois unités** :

| Unité | Rôle |
|---|---|
| **MC** — Mémoire Centrale | stocker les programmes, les données et les résultats |
| **UAL** — Unité Arithmétique et Logique | réaliser les opérations arithmétiques et logiques |
| **UCC** — Unité de Commande et de Contrôle | contrôler le déroulement de toutes les opérations |

Les pièges :
- **UE** et **US** appartiennent au **système informatique** (UE → UCT → US) mais sont *à l'extérieur* de l'UCT ;
- les **BUS** (commandes, adresses, données) sont les **liens physiques** entre les unités — des autoroutes, pas des bâtiments.`,
        tags: ["algo", "intro", "von-neumann"],
      },
      {
        id: "algo-intro-objets",
        title: "Combien d'objets dans le coffre ?",
        order: 3,
        difficulty: "easy",
        type: "numeric",
        prompt: `## ⛽ Inventaire d'objets

Un **objet** est l'entité manipulée par une action. Il en existe deux classes : les **variables** et les **constantes**.

Considère l'action suivante :

\`\`\`
S = A + 2
\`\`\`

**Combien d'objets, au total, cette action manipule-t-elle ?** (compte les variables ET les constantes)`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          {
            text: "Un objet = TOUTE entité manipulée par l'action. Les nombres écrits en dur comptent aussi !",
            cost: 15,
          },
          {
            text: "📖 Correction complète : 3 objets — S et A sont des objets VARIABLES (leur valeur peut changer), et 2 est un objet CONSTANT (il garde sa valeur pendant toute l'exécution). Réponse : 3.",
            cost: 60,
          },
        ],
        answer: 3,
        explanation: `L'action \`S = A + 2\` manipule **3 objets** :

- **2 objets variables** : \`S\` (reçoit le résultat) et \`A\` (fournit sa valeur) — ils peuvent changer de valeur dans l'algorithme ;
- **1 objet constant** : \`2\` — il garde la même valeur pendant toute l'exécution.

L'analogie du cours : les variables sont comme les **oranges** du jus (transformées en cours de route), la constante est comme le **couteau** (identique du début à la fin). L'erreur classique est de ne compter que S et A : la constante 2 est bel et bien une entité manipulée, donc un objet.`,
        tags: ["algo", "intro", "objets"],
      },
      {
        id: "algo-intro-identificateurs",
        title: "Contrôle technique des identificateurs",
        order: 4,
        difficulty: "easy",
        type: "multi",
        prompt: `## 🔤 Plaques d'immatriculation

Rappel des règles de construction d'un **identificateur** :
1. uniquement des lettres (A–Z, a–z), des chiffres (0–9) et le souligné \`_\` ;
2. au moins un caractère ;
3. le **premier caractère doit être une lettre**.

**Coche tous les identificateurs VALIDES :**`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          {
            text: "Passe chaque candidat au triple contrôle : caractères permis ? au moins un caractère ? première position = lettre ?",
            cost: 20,
          },
          {
            text: "L'espace, le point d'interrogation et le tiret « - » (différent du souligné « _ » !) ne font PAS partie des caractères permis.",
            cost: 30,
          },
          {
            text: "📖 Correction complète : valides → TTC, Gr3, Nom_Et, Note_1_2_3. Invalides → 9TH (commence par un chiffre), Gr 3 (contient un espace), S? (le ? est interdit), Nom-Et (le tiret - est interdit, seul le souligné _ est permis).",
            cost: 60,
          },
        ],
        options: [
          "TTC",
          "9TH",
          "Gr3",
          "Gr 3",
          "Nom_Et",
          "S?",
          "Note_1_2_3",
          "Nom-Et",
        ],
        answer: [0, 2, 4, 6],
        explanation: `Verdict détaillé, règle par règle :

| Candidat | Verdict | Raison |
|---|---|---|
| \`TTC\` | ✅ | lettres uniquement |
| \`9TH\` | ❌ | commence par un **chiffre** (règle 3) |
| \`Gr3\` | ✅ | lettre en tête, chiffre ensuite : parfait |
| \`Gr 3\` | ❌ | l'**espace** n'est pas un caractère permis |
| \`Nom_Et\` | ✅ | le souligné \`_\` est explicitement autorisé |
| \`S?\` | ❌ | \`?\` n'est pas permis |
| \`Note_1_2_3\` | ✅ | lettres + chiffres + soulignés, lettre en tête |
| \`Nom-Et\` | ❌ | le **tiret** \`-\` est interdit — pour la machine, c'est une soustraction (« Nom moins Et ») ! |

Bonus du cours : choisis des noms **significatifs**, évite les noms trop longs, et n'utilise jamais un **mot clé** (\`Var\`, \`Debut\`…) comme identificateur.`,
        tags: ["algo", "intro", "identificateurs"],
      },
      {
        id: "algo-intro-etapes",
        title: "La check-list du pilote",
        order: 5,
        difficulty: "easy",
        type: "order",
        prompt: `## 🗺️ Avant de démarrer

Avant d'écrire le moindre algorithme, un bon pilote suit **les 4 étapes de résolution d'un problème** — toujours dans le même ordre (c'est comme ça qu'on a préparé le jus d'orange 🍊).

**Remets les étapes dans le bon ordre :**`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          {
            text: "On commence TOUJOURS par comprendre ce qu'on veut faire, et on finit par le « comment » (le passage des données aux résultats).",
            cost: 15,
          },
          {
            text: "📖 Correction complète : 1. Analyse du problème (qu'est-ce qu'on veut faire ?) → 2. Définir les données (caractéristiques, types) → 3. Définir les résultats (caractéristiques, types) → 4. Définir les relations résultats-données (comment passer des données aux résultats).",
            cost: 60,
          },
        ],
        options: [
          "Définir les relations résultats-données : comment passer des données aux résultats ?",
          "Analyse du problème : qu'est-ce qu'on veut faire ?",
          "Définir les résultats : leurs caractéristiques, leurs types",
          "Définir les données : leurs caractéristiques, leurs types",
        ],
        answer: [1, 3, 2, 0],
        explanation: `L'ordre canonique du cours :

1. **Analyse du problème** — qu'est-ce qu'on veut faire ? (comprendre avant d'agir)
2. **Définir les données** — leurs caractéristiques, leurs types (les oranges, l'eau, le miel…)
3. **Définir les résultats** — leurs caractéristiques, leurs types (1 litre de jus concentré à 60 %)
4. **Définir les relations résultats-données** — comment passer des données aux résultats (les 7 actions de la recette)

C'est seulement après ces 4 étapes qu'on écrit l'algorithme : une **suite finie d'actions élémentaires, exécutées dans un ordre précis, sur un ensemble de données, pour résoudre un problème**. Sauter l'analyse, c'est verser le jus avant d'avoir pressé les oranges. 🍊💦`,
        tags: ["algo", "intro", "analyse"],
      },
      {
        id: "algo-intro-organigramme-trace",
        title: "Trace d'organigramme : l'équation Ax + B = 0",
        order: 6,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🕵️ Lecture de carte

Voici l'organigramme du cours qui résout l'équation **A·x + B = 0** :

\`\`\`
          ( Début )
              │
          /  A, B  /
              │
         ◇  A = 0 ?  ◇
          /         \\
       Non           Oui
        │             │
   X ← -B/A    Afficher 'Pas de solution'
        │             │
   Afficher X         │
        └──────┬──────┘
            ( Fin )
\`\`\`

On exécute cet organigramme avec **A = 4** et **B = −10**.

**Quelle valeur est affichée ?**`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          {
            text: "Commence par le test : A = 0 ? Ici A vaut 4, donc le test est Faux → branche « Non ».",
            cost: 15,
          },
          {
            text: "Attention aux signes dans X ← −B/A : B vaut −10, donc −B vaut… +10 !",
            cost: 25,
          },
          {
            text: "📖 Correction complète : A = 4 ≠ 0 → branche Non → X ← −B/A = −(−10)/4 = 10/4 = 2.5 → l'organigramme affiche 2.5. (Vérification : 4 × 2.5 + (−10) = 10 − 10 = 0 ✓)",
            cost: 60,
          },
        ],
        answer: 2.5,
        explanation: `Déroulons la trace pas à pas :

| Étape | Action | État |
|---|---|---|
| 1 | Lecture de A et B | A = 4, B = −10 |
| 2 | Test \`A = 0 ?\` | 4 = 0 → **Faux** → branche « Non » |
| 3 | \`X ← −B/A\` | X ← −(−10)/4 = 10/4 = **2.5** |
| 4 | Afficher X | écran : \`2.5\` |

**Vérification** (le réflexe du pro) : A·x + B = 4 × 2.5 + (−10) = 10 − 10 = **0** ✓

Le piège classique est le double signe : −B avec B = −10 donne **+10**. L'autre branche (« Oui ») ne sert que si A = 0 : l'équation n'a alors pas de solution dans ℝ, et on affiche \`Pas de solution\`.`,
        tags: ["algo", "intro", "organigramme", "trace"],
      },
      {
        id: "algo-intro-squelette-code",
        title: "Monte le châssis : l'algorithme Facture",
        order: 7,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🦴 Ton premier squelette d'algorithme

On te demande de préparer la **structure complète** de l'algorithme \`Facture\` (les actions viendront plus tard — ici on valide le châssis !).

**Écris le squelette de l'algorithme avec :**

1. l'**entête** : l'algorithme s'appelle \`Facture\` ;
2. la **partie déclaration** :
   - une **constante** \`TVA\` de valeur \`0.19\`,
   - deux **variables** \`PrixHT\` et \`PrixTTC\` de type \`reel\` (regroupées en une seule déclaration) ;
3. la **partie action** : vide pour l'instant, mais correctement délimitée par \`Debut\` et \`Fin.\`

Respecte la syntaxe du cours : les \`;\` après chaque déclaration, et le **point** après \`Fin\`.`,
        points: 200,
        timeLimitSec: 900,
        hints: [
          {
            text: "Trois parties, dans l'ordre : Entête (Algorithme nom ;), Déclaration (Const puis Var), Action (Debut … Fin.).",
            cost: 20,
          },
          {
            text: "Syntaxe des déclarations : « Const TVA = 0.19 ; » (nom = valeur) et « Var PrixHT, PrixTTC : reel ; » (noms : type). Les objets de même type se regroupent avec une virgule.",
            cost: 35,
          },
          {
            text: "📖 Correction complète :\nAlgorithme Facture ;\nConst TVA = 0.19 ;\nVar PrixHT, PrixTTC : reel ;\nDebut\nFin.\n— L'entête nomme l'algorithme ; Const associe un NOM et une VALEUR ; Var associe des NOMS et un TYPE ; Debut/Fin. encadrent la partie action (vide ici) ; chaque ligne de déclaration finit par ; et l'algorithme par un point.",
            cost: 75,
          },
        ],
        starter: `{ Squelette de l'algorithme Facture }
{ 1. Entête : Algorithme <nom> ;         }
{ 2. Déclarations : Const … puis Var …   }
{ 3. Action : Debut … Fin.               }

`,
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            {
              label: "Commence par l'entête : le mot clé Algorithme suivi du nom Facture et d'un point-virgule",
              pattern: "Algorithme\\s+Facture\\s*;",
              flags: "i",
            },
            {
              label: "Déclare la constante TVA avec sa valeur 0.19 (syntaxe Const nom = valeur ;)",
              pattern: "Const[\\s\\S]{0,120}?TVA\\s*=\\s*0[.,]19",
              flags: "i",
            },
            {
              label: "Déclare PrixHT et PrixTTC regroupées, de type reel, dans la partie Var",
              pattern: "Var[\\s\\S]{0,200}?PrixHT\\s*,\\s*PrixTTC\\s*:\\s*r[ée]el",
              flags: "i",
            },
            {
              label: "Ouvre la partie action avec le mot clé Debut",
              pattern: "\\bDebut\\b",
              flags: "i",
            },
            {
              label: "Termine l'algorithme par Fin suivi d'un point",
              pattern: "\\bFin\\s*\\.",
              flags: "i",
            },
          ],
        }),
        explanation: `Le squelette attendu, ligne par ligne :

\`\`\`
Algorithme Facture ;              ← Entête : mot clé Algorithme + identificateur + ;
Const TVA = 0.19 ;                ← Constante : NOM = VALEUR (elle ne changera JAMAIS)
Var PrixHT, PrixTTC : reel ;      ← Variables : NOMS : TYPE (regroupées car même type)
Debut                             ← Ouverture de la partie action
Fin.                              ← Fermeture : Fin + POINT final obligatoire
\`\`\`

Points de syntaxe à retenir :
- l'**entête** utilise le mot clé \`Algorithme\` et un identificateur valide (\`Facture\` : lettres uniquement ✓) ;
- une **constante** se déclare avec son **nom et sa valeur** (\`TVA = 0.19\`) — pas de type à écrire ;
- des **variables de même type se regroupent** : \`PrixHT, PrixTTC : reel ;\` évite deux lignes ;
- la partie action peut être vide, mais \`Debut\` et \`Fin.\` sont obligatoires ;
- chaque déclaration se termine par \`;\`, et tout l'algorithme par le **point** de \`Fin.\`

Effet en mémoire : la déclaration ordonne à la Mémoire Centrale de réserver un espace nommé \`TVA\` (déjà rempli avec 0.19, verrouillé) et deux espaces \`PrixHT\` et \`PrixTTC\` (vides pour l'instant, taille « reel »).`,
        tags: ["algo", "intro", "structure", "pseudo-code"],
      },
    ],
  },
  {
    slug: "algo-variables-actions",
    title: "Variables, types et premières actions — Lire, Écrire, Affecter",
    checkpoint: "algorithmique",
    codename: "Circuit des Variables",
    domain: "Algorithmique L1",
    theme: "circuit",
    icon: "Binary",
    accent: "#E8A87C",
    order: 2,
    difficulty: "easy",
    summary:
      "Les 4 types de base, les expressions et leurs priorités, puis tes trois premières actions : Lire, Ecrire et l'affectation ← — jusqu'à ton premier algorithme complet.",
    objectives: [
      "Choisir le bon type de base (entier, reel, caractere, booleen) et connaître ses opérations",
      "Linéariser une expression mathématique et appliquer la priorité des opérateurs",
      "Évaluer une expression logique avec ET, OU, NON",
      "Utiliser Lire et Ecrire pour dialoguer entre clavier, mémoire et écran",
      "Dérouler la trace d'une suite d'affectations sans se tromper",
      "Écrire et tracer ton premier algorithme complet (somme, maximum)",
    ],
    lesson: `# 🔧 Variables, types et premières actions — le circuit des variables

Le châssis est monté (entête, déclarations, \`Debut\`/\`Fin.\`)… il est temps de mettre du **carburant dans le moteur** ! Dans ce module : les **4 types de base**, les **expressions** et leurs priorités, puis tes trois toutes premières actions — **Lire**, **Ecrire** et la mythique **affectation \`←\`**. À la fin, tu écriras et traceras ton **premier algorithme complet**. 🏎️

---

## 1. Pourquoi des types ? 🚌

Souviens-toi : \`entier\`, \`reel\`, \`caractere\`… ces mots clés correspondent aux **types de base**. Le type définit **la taille de l'espace mémoire** nécessaire à la sauvegarde d'un objet.

Pourquoi plusieurs types ? **Pour ne pas gaspiller l'espace mémoire**, on propose différents types avec différentes tailles, selon les besoins.

> 🚗 C'est comme les moyens de transport : pour transporter **3 personnes**, une **voiture** suffit. Pour **50 personnes**, il faut un **bus**. Mais mobiliser un bus pour 3 personnes, c'est… ?! 💸

On définit **4 types de base (simples)** : **entier**, **reel**, **caractere** et **booleen**.

---

## 2. Les 4 types de base 🧱

### 2.1 Le type entier

Le type \`entier\` représente un **sous-ensemble fini** des nombres entiers **relatifs** (∈ ℤ). Fini, car le nombre de bits est limité !

En général, l'espace réservé pour un entier est **4 octets = 32 bits**, mais on utilise aussi des entiers sur **8 octets = 64 bits** (entier **long**) :

| Entier | Valeur minimale | Valeur maximale |
|---|---|---|
| 2 octets = 16 bits | −32 768 | +32 767 |
| 4 octets = 32 bits | −2 147 483 648 | +2 147 483 647 |
| 8 octets = 64 bits | −2⁶³ | +(2⁶³ − 1) |

📌 **Remarque** : en algorithmique, on utilise le type \`entier\` **sans préciser** s'il est court ou long.

**Opérations sur les entiers** :

- **Arithmétiques** : \`+\`, \`−\`, \`*\`, \`div\`, \`mod\` — et \`/\` qui donne un **résultat réel** !
  - \`mod\` : **reste** de la division entière → \`5 mod 2 = 1\`
  - \`div\` : **quotient** de la division entière → \`5 div 2 = 2\`
- **Relations** : \`<\`, \`≤\`, \`>\`, \`≥\`, \`=\`, \`≠\` (claviers : \`<=\`, \`>=\`, \`<>\`)

\`\`\`
        5 div 2 = 2   ┐
   5 │ 2              ├─ le couple gagnant de la division entière
   4 │ 2  ← quotient  │
   ─      (div)       │
   1  ← reste (mod)   ┘        5 mod 2 = 1
\`\`\`

### 2.2 Le type reel

Le type \`reel\` représente **approximativement** un sous-ensemble fini des nombres réels (∈ ℝ). Les réels sont représentés au **format scientifique** : **± M · 10^E** (mantisse et exposant). Comme le nombre de bits est limité, la représentation est **approximative**.

En général : **4 octets = 32 bits**, mais aussi **8 octets = 64 bits** (réel **double**) :

| Réel | Nombres négatifs | Nombres positifs |
|---|---|---|
| 4 octets = 32 bits | −3,4 × 10³⁸ à −1,17 × 10⁻³⁸ | +1,17 × 10⁻³⁸ à +3,4 × 10³⁸ |
| 8 octets = 64 bits | −1,79 × 10³⁰⁸ à −2,2 × 10⁻³⁰⁸ | +2,2 × 10⁻³⁰⁸ à +1,79 × 10³⁰⁸ |

Deux subtilités à connaître 🔬 :
- la **différence entre deux nombres consécutifs** représentables est en général **1,4 × 10⁻⁴⁵** — entre deux réels machine, il y a des « trous » !
- les nombres **entre −1,17 × 10⁻³⁸ et +1,17 × 10⁻³⁸ sont considérés nuls** (trop petits pour être représentés).

📌 **Remarque** : en algorithmique, on utilise le type \`reel\` sans préciser s'il est simple ou double.

**Opérations sur les réels** :
- **Arithmétiques** : \`+\`, \`−\`, \`*\`, \`/\` (pas de \`div\` ni \`mod\` : c'est réservé aux entiers !)
- **Relations** : \`<\`, \`≤\`, \`>\`, \`≥\`, \`=\`, \`≠\`

### 2.3 Le type caractere

Le type \`caractere\` représente **tous les symboles manipulés** : alphabet, chiffres, signes de ponctuation… Il occupe **1 octet = 8 bits** en mémoire.

L'ensemble de ces caractères est regroupé dans une table appelée **Table ASCII** (*American Standard Code for Information Interchange*) : chaque caractère y possède un code numérique — c'est ce qui permet de les comparer.

**Opérations sur les caractères** : les **seules** opérations permises sont les **relations** : \`<\`, \`≤\`, \`>\`, \`≥\`, \`=\`, \`≠\`. (Pas d'addition de lettres ! \`'A' + 'B'\` n'existe pas ici.)

### 2.4 Le type booleen

Le type \`booleen\` représente des objets **logiques** ne pouvant prendre que **deux valeurs** : **Vrai** ou **Faux**. Il occupe **1 octet = 8 bits** en mémoire.

**Opérations sur les booléens** :
- **Logiques** : \`ET\`, \`OU\`, \`NON\` (la négation) ;
- **Relations** : \`=\`, \`≠\` (\`<>\`).

**La table de vérité à connaître par cœur** 🧠 :

| A | B | NON A | A ET B | A OU B |
|---|---|---|---|---|
| F | F | V | F | F |
| F | V | V | F | V |
| V | F | F | F | V |
| V | V | F | V | V |

Moyens mnémotechniques :
- \`ET\` = **exigeant** : Vrai seulement si **les deux** sont Vrais ;
- \`OU\` = **arrangeant** : Vrai dès qu'**au moins un** est Vrai ;
- \`NON\` = l'**inverseur** : il retourne la valeur.

---

## 3. La partie Action : Debut … Fin. 🎬

La partie action contient les **actions élémentaires** décrivant la solution :

\`\`\`
Debut
    <Action1> ;
    <Action2> ;
    ---
    <ActionN> ;
Fin.
\`\`\`

Il est temps d'apprendre ces actions qui nous permettent de **communiquer avec notre fameuse machine** ! Au menu : les actions de **Lecture/Écriture** (Entrée/Sortie), puis l'**affectation**.

---

## 4. Lire — l'action de lecture (Entrée) ⌨️

Cette action permet d'**introduire les données** d'une unité d'entrée (**clavier**) vers la **mémoire centrale**. Elle **initialise un objet** dont l'espace mémoire est **déjà réservé** (par la déclaration !).

**Syntaxe** :

\`\`\`
Lire(<IdObj>) ;
\`\`\`

où \`<IdObj>\` est l'identificateur (le nom) de l'objet manipulé.

**Exemple** — soient deux objets :

\`\`\`
Var Age     : entier ;
    Moyenne : reel ;
\`\`\`

\`\`\`
                        Mémoire Centrale
Lire(Age) ;          ┌───────────┬───────────┐
  clavier : 18  ──►  │ Age       │ Moyenne   │
                     │ [  18   ] │ [   ?   ] │
Lire(Moyenne) ;      └───────────┴───────────┘
  clavier : 15.5 ──►             ▲
                     ┌───────────┴───────────┐
                     │ Age       │ Moyenne   │
                     │ [  18   ] │ [ 15.5  ] │
                     └───────────┴───────────┘
\`\`\`

- L'exécution de \`Lire(Age)\` attend une **valeur entière au clavier**. Si on tape \`18\`, elle sera stockée dans l'espace nommé \`Age\`.
- L'exécution de \`Lire(Moyenne)\` : si on tape \`15.5\`, elle sera stockée dans l'espace nommé \`Moyenne\`.

📌 **Remarque** — on peut lire **plusieurs objets** avec une seule action, en séparant les noms par des **virgules** :

\`\`\`
Lire(Age) ;              est équivalent à :      Lire(Age, Moyenne) ;
Lire(Moyenne) ;
\`\`\`

Au moment de la saisie, on sépare les valeurs par des **espaces** : \`18 15.5\`

---

## 5. Ecrire — l'action d'écriture (Sortie) 🖥️

Cette action permet d'**afficher les données** depuis la mémoire centrale vers une unité de sortie (**écran**). Elle affiche la **valeur mémorisée** d'un objet **au moment de l'exécution** (à un instant t). Elle peut aussi afficher une **constante**.

**Syntaxe** :

\`\`\`
Ecrire(<Expression>) ;
\`\`\`

où \`<Expression>\` peut prendre différentes formes. Les 4 cas possibles (avec \`Moyenne = 14.75\` en mémoire) :

| Cas | Action | Écran |
|---|---|---|
| **constante numérique** | \`Ecrire(5.32) ;\` | \`5.32\` |
| **texte** (entre cotes) | \`Ecrire('Bonjour') ;\` | \`Bonjour\` |
| **identificateur** | \`Ecrire(Moyenne) ;\` | \`14.75\` |
| **expression arithmétique** | \`Ecrire(2*Moyenne) ;\` | \`29.5\` |

📌 **Remarque** — on peut écrire **plusieurs éléments** avec une seule action, séparés par des **virgules** :

\`\`\`
Ecrire('Moyenne= ') ;      est équivalent à :    Ecrire('Moyenne= ', Moyenne) ;
Ecrire(Moyenne) ;
                           → écran :  Moyenne= 14.75
\`\`\`

---

## 6. Les expressions : la boîte de vitesses 🧮

C'est quoi, exactement, une \`<Expression>\` ? Elle peut avoir **trois formes** :

### 6.1 L'expression de base (élémentaire)

Elle se réduit à :
- une **constante numérique** (réelle ou entière) : \`5.32\`, \`42\` ;
- une **constante caractère** (ou suite de caractères) mise **entre cotes** \`' '\` ou \`" "\` : \`'Bonjour'\` ;
- ou le **nom d'un objet** (identificateur) : \`Moyenne\`.

### 6.2 L'expression arithmétique et la linéarisation

C'est une **combinaison** d'objets de type numérique (\`reel\`, \`entier\`), d'**opérateurs arithmétiques** (\`+\`, \`−\`, \`*\`, \`/\`, \`mod\`, \`div\`) et éventuellement de **parenthèses** — bref, une formule mathématique.

⚠️ **Contrairement à une formule mathématique, l'expression en informatique doit être écrite sous forme LINÉAIRE** — sur une seule ligne !

**Exemple du cours** :

\`\`\`
        X² + 3X − 4
  E = ───────────────          (forme mathématique, sur 2 étages)
          2X − 1

  Forme linéaire :   E = (X*X + 3*X − 4) / (2*X − 1)
\`\`\`

**Linéariser**, c'est transformer l'expression en forme linéaire :
1. en **respectant la priorité des opérateurs**, à l'aide de **parenthèses** si nécessaire ;
2. en faisant apparaître l'opérateur de multiplication \`*\` de manière **explicite** : \`2X\` s'écrit \`2*X\` !

### 6.3 La priorité des opérateurs arithmétiques 🏁

Du plus prioritaire au moins prioritaire :

| Priorité | Opérateurs |
|---|---|
| 1 (max) | \`\` parenthèses |
| 2 | \`−\` unaire, \`+\` unaire (le signe d'un nombre) |
| 3 | \`*\`, \`/\` (et \`div\`, \`mod\`) |
| 4 (min) | \`+\`, \`−\` (binaires) |

À priorité **égale**, on évalue de **gauche à droite**.

**Exemple 1 du cours** — pas à pas :

\`\`\`
4 + 6 / 2 * 7 − 2
= 4 + 3 * 7 − 2        (6/2 d'abord : / prioritaire sur + et −)
= 4 + 21 − 2           (puis 3*7 : même niveau que /, gauche → droite)
= 23
\`\`\`

**Exemple 2 du cours** — les parenthèses changent TOUT :

\`\`\`
(4 + 6) / (2 * (7 − 2))
= 10 / (2 * 5)
= 10 / 10
= 1
\`\`\`

Même chiffres, résultats **23** vs **1** : les parenthèses sont tes meilleurs alliés. 🛡️

### 6.4 L'expression logique

C'est une **combinaison** d'objets de type \`booleen\` et d'**opérateurs logiques** (\`ET\`, \`OU\`, \`NON\`), avec éventuellement des parenthèses — ou encore combinée avec des objets **numériques** (\`entier\`, \`reel\`) via des **opérateurs de relations** (\`<\`, \`≤\`, \`>\`, \`≥\`, \`=\`, \`≠\`).

**Exemples du cours** :

\`\`\`
E1 = (A Ou B) Et (Non C Et A)
E2 = (J*J ≤ N) Et (Non Trouve)
E3 = (J + 2*K) > 2
\`\`\`

**Priorité des opérateurs logiques**, du plus fort au plus faible :

| Priorité | Opérateur |
|---|---|
| 1 (max) | \`\` parenthèses |
| 2 | \`Non\` |
| 3 | \`Et\` |
| 4 (min) | \`Ou\` |

**Évaluation guidée** — avec A = Vrai, B = Faux, C = Faux :

\`\`\`
E1 = (A Ou B) Et (Non C Et A)
   = (V Ou F) Et (Non F Et V)
   = V        Et (V Et V)          ← Non avant Et !
   = V Et V
   = Vrai
\`\`\`

---

## 7. L'affectation ← : l'action reine 👑

Cette action permet de **modifier la valeur d'un objet** au moment de l'exécution (à un instant t). Elle **change le contenu de l'espace mémoire** nommé \`<IdObj>\`.

**Syntaxe** :

\`\`\`
<IdObj> ← <Expression> ;
\`\`\`

- \`<IdObj>\` : l'identificateur de l'objet manipulé (la **destination**) ;
- \`<Expression>\` : expression de base, arithmétique ou logique (la **source**).

Lis toujours \`←\` comme : « **calcule la droite, range le résultat dans la gauche** ».

**Exemple du cours** — soient 2 objets \`A\` et \`B\` de type entier, avec **B qui vaut 20** :

\`\`\`
A ← 18 ;
A ← B + 5 ;
B ← 2*B + A ;
\`\`\`

**Trace d'exécution** (l'état de la mémoire après chaque action) :

| Action exécutée | A | B |
|---|---|---|
| *(départ)* | ? | 20 |
| \`A ← 18 ;\` | **18** | 20 |
| \`A ← B + 5 ;\` → 20 + 5 | **25** | 20 |
| \`B ← 2*B + A ;\` → 2×20 + 25 | 25 | **65** |

\`\`\`
 Mémoire Centrale (film image par image)

  A ← 18        A ← B + 5       B ← 2*B + A
 ┌────┬────┐   ┌────┬────┐    ┌────┬────┐
 │ A  │ B  │   │ A  │ B  │    │ A  │ B  │
 │ 18 │ 20 │ ─►│ 25 │ 20 │ ─► │ 25 │ 65 │
 └────┴────┘   └────┴────┘    └────┴────┘
        la valeur 18 de A est ÉCRASÉE par 25
\`\`\`

⚠️ **Attention** — après l'affectation, l'**ancienne valeur de l'objet est PERDUE** et on ne peut pas la récupérer ! (Le 18 de \`A\` a disparu pour toujours.)

📌 **Remarque : la compatibilité des types** — le type de \`<Expression>\` doit être **le même** que le type de \`<IdObj>\`… ou un type **compatible**. La compatibilité existe **entre reel et entier seulement** :

- on **peut** affecter un **entier à un reel** : \`X ← 3 ;\` avec X reel ✓ (3 devient 3.0)
- mais **pas l'inverse** : \`Age ← 15.5 ;\` avec Age entier ✗ (où mettre le .5 ?!)

---

## 8. Ton PREMIER ALGORITHME ! 🎉

**Problème : écrire un algorithme qui calcule et affiche la somme de deux entiers donnés.**

Appliquons la méthode des 4 étapes :

1. **Analyse** : calcul et affichage de la somme de deux entiers.
2. **Données en entrée** : on a besoin de 2 entiers (\`A\` et \`B\`).
3. **Résultat en sortie** : la somme des 2 entiers (\`S\`).
4. **Passage des entrées aux sorties** : calcul \`S = A + B\`, puis affichage.

### 8.1 Version 1 — l'algorithme brut

\`\`\`
Algorithme somme ;
Var A, B, S : entier ;
Debut
    Lire(A) ;
    Lire(B) ;
    S ← A + B ;
    Ecrire(S) ;
Fin.
\`\`\`

**Trace d'exécution** avec les valeurs du cours (frappe au clavier : \`1500\` puis \`2641\`) :

| Action | A | B | S | Écran |
|---|---|---|---|---|
| *(déclarations)* | ? | ? | ? | |
| \`Lire(A) ;\` ← 1500 | 1500 | ? | ? | |
| \`Lire(B) ;\` ← 2641 | 1500 | 2641 | ? | |
| \`S ← A + B ;\` | 1500 | 2641 | **4141** | |
| \`Ecrire(S) ;\` | 1500 | 2641 | 4141 | \`4141\` |

\`\`\`
 Mémoire Centrale                        Écran
┌────────┬────────┬────────┐           ┌─────────┐
│ A      │ B      │ S      │           │ 4141    │
│ [1500] │ [2641] │ [4141] │  ──────►  │         │
└────────┴────────┴────────┘           └─────────┘
\`\`\`

Ça marche ! Mais avoue : un écran qui affiche juste \`4141\` sans explication, c'est austère. 😐

### 8.2 Version 2 — on peut faire MIEUX : l'exécution conviviale ✨

Ajoutons des **messages** pour rendre l'exécution conviviale :

\`\`\`
Algorithme somme ;
Var A, B, S : entier ;
Debut
    Ecrire('Donner un entier A :') ;
    Lire(A) ;
    Ecrire('Donner un entier B :') ;
    Lire(B) ;
    S ← A + B ;
    Ecrire('La somme A+B= ', S) ;
Fin.
\`\`\`

**Ce que voit l'utilisateur à l'écran** :

\`\`\`
Donner un entier A : 1500
Donner un entier B : 2641
La somme A+B= 4141
\`\`\`

Même mémoire (A=1500, B=2641, S=4141), mais une expérience utilisateur digne d'un stand de F1. 🏁

---

## 9. Avant-goût : les structures de contrôle alternatives 🔀

Jusqu'ici, nos algorithmes foncent tout droit : action 1, action 2, action 3… Mais un pilote doit parfois **choisir sa trajectoire**. Les **structures alternatives (conditionnelles)** permettent d'exécuter **ou non** une série d'instructions **selon la valeur d'une condition**.

### 9.1 La structure alternative réduite : Si … Alors … Fsi

**Syntaxe** :

\`\`\`
Si <Condition> Alors
    <Bloc Action>
Fsi ;
\`\`\`

- \`<Condition>\` : une **expression booléenne** (Vrai ou Faux) ;
- \`<Bloc Action>\` : suite d'actions séparées par des \`;\` (\`Act1; Act2; … ; ActN ;\`) — le dernier \`;\` n'est pas obligatoire.

**Sémantique** — on évalue la \`<Condition>\` :
- si sa valeur = **Vrai** → on exécute \`<Bloc Action>\` ;
- si sa valeur = **Faux** → on continue directement **après** \`Fsi ;\`.

\`\`\`
        ◇ Cond ◇ ── Faux ──┐
           │Vrai           │
     ┌──────────────┐      │
     │ Bloc Action  │      │
     └──────────────┘      │
           │               │
           ▼◄──────────────┘
        (la suite)
\`\`\`

**Exemples du cours** :

\`\`\`
Si X < 0 Alors
    absX ← -X
Fsi ;
\`\`\`

\`\`\`
Si A > B ET Gr = 2 Alors
    A ← A - B ;
    C ← 2*Gr + A ;
    B ← A + C
Fsi ;
\`\`\`

### 9.2 La structure alternative complète : Si … Alors … Sinon … Fsi

**Syntaxe** :

\`\`\`
Si <Condition> Alors
    <Bloc Action1>
Sinon
    <Bloc Action2>
Fsi ;
\`\`\`

**Sémantique** — on évalue la \`<Condition>\` :
- si sa valeur = **Vrai** → on exécute \`<Bloc Action1>\` ;
- si sa valeur = **Faux** → on exécute \`<Bloc Action2>\`.

\`\`\`
   Faux ── ◇ Cond ◇ ── Vrai
     │                  │
┌─────────────┐   ┌─────────────┐
│ Bloc Action2│   │ Bloc Action1│
└─────────────┘   └─────────────┘
     └────────┬────────┘
              ▼
          (la suite)
\`\`\`

### 9.3 Exemple complet : le maximum de deux entiers

**Problème : écrire un algorithme qui détermine puis affiche le maximum entre deux entiers.**

**Analyse** : déterminer le maximum entre deux entiers revient à **comparer** les deux valeurs et prendre la plus grande.
- **Données en entrée** : deux entiers \`A\` et \`B\`.
- **Résultat en sortie** : un entier \`Max\`.

\`\`\`
Algorithme CalculMax ;
Var A, B, Max : entier ;
Debut
    Ecrire('Donner deux entiers A et B:') ;
    Lire(A, B) ;
    Si A > B Alors
        Max ← A
    Sinon
        Max ← B
    Fsi ;
    Ecrire('Le maximum est :', Max) ;
Fin.
\`\`\`

**Trace d'exécution** avec la saisie \`7 12\` :

| Action | A | B | Max | Écran |
|---|---|---|---|---|
| \`Ecrire('Donner deux entiers A et B:')\` | ? | ? | ? | \`Donner deux entiers A et B:\` |
| \`Lire(A, B)\` ← \`7 12\` | 7 | 12 | ? | |
| \`Si A > B\` → 7 > 12 → **Faux** | 7 | 12 | ? | |
| branche \`Sinon\` : \`Max ← B\` | 7 | 12 | **12** | |
| \`Ecrire('Le maximum est :', Max)\` | 7 | 12 | 12 | \`Le maximum est :12\` |

Les structures de contrôle méritent un module entier — c'est le programme de la suite. **À suivre…** 📬

---

## 🧠 Ce qu'il faut retenir

- **4 types de base** : \`entier\` (ℤ fini : ±32 767 sur 16 bits, ±2 147 483 647 sur 32 bits, ±2⁶³ sur 64 bits), \`reel\` (approximatif, format scientifique ±M·10^E), \`caractere\` (1 octet, table ASCII), \`booleen\` (Vrai/Faux, 1 octet).
- Opérations **entier** : \`+ − * div mod\` (\`/\` donne un réel !) → \`5 div 2 = 2\`, \`5 mod 2 = 1\`. Opérations **reel** : \`+ − * /\`. **caractere** : relations seulement. **booleen** : \`ET, OU, NON\` + \`=, ≠\`.
- Le **type** définit la **taille mémoire** réservée — on choisit la voiture pour 3 personnes, pas le bus. 🚌
- **\`Lire(X)\`** : clavier → mémoire (initialise un objet déjà déclaré). **\`Ecrire(expr)\`** : mémoire → écran (constante, texte entre cotes, identificateur ou expression). Les deux acceptent plusieurs éléments séparés par des **virgules**.
- Une **expression** a 3 formes : **de base**, **arithmétique** (à écrire en forme **linéaire** : \`2X\` → \`2*X\`, parenthèses au besoin), **logique**.
- **Priorité arithmétique** : \`\` puis signes unaires puis \`* / div mod\` puis \`+ −\` ; à égalité → gauche à droite. \`4 + 6/2*7 − 2 = 23\` mais \`(4+6)/(2*(7−2)) = 1\`.
- **Priorité logique** : \`\` puis \`Non\` puis \`Et\` puis \`Ou\`.
- **Affectation \`X ← expr ;\`** : calcule la droite, range dans la gauche. L'**ancienne valeur est PERDUE**. Compatibilité : **entier → reel OK**, **reel → entier INTERDIT**.
- Tout problème se traite en 4 temps : **analyse, données, résultats, relations** — puis l'algorithme (cf. \`somme\` et \`CalculMax\`).
- \`Si <Cond> Alors <Bloc> Fsi ;\` exécute le bloc si la condition est **Vraie** ; la version complète ajoute \`Sinon <Bloc2>\` pour le cas **Faux**.
- Toujours **dérouler la trace** (tableau état-des-variables) pour vérifier un algorithme. 📋

## ⚠️ Erreurs fréquentes des débutants

### 1. Affecter un réel à un entier 🚱

**Ce qui ne va pas** :

\`\`\`
Var Age : entier ;
Debut
    Age ← 15.5 ;      ← ✗ INTERDIT
\`\`\`

**Pourquoi ça casse** : la compatibilité n'existe que dans un sens ! Un espace mémoire « entier » ne sait pas stocker une partie décimale : le \`.5\` n'a nulle part où aller. Un réel accepte un entier (3 devient 3.0), mais un entier n'accepte **jamais** un réel.

**Comment corriger** : déclare l'objet en \`reel\` si des décimales sont possibles.

\`\`\`
Var Age : reel ;      ← ✓ le type correspond aux valeurs attendues
Debut
    Age ← 15.5 ;      ← ✓
\`\`\`

### 2. Oublier de linéariser (le fameux 2X) ✍️

**Ce qui ne va pas** :

\`\`\`
E ← 2X + 1 ;          ← ✗ la machine lit "2X" comme un identificateur…
                          qui commence par un chiffre : double faute !
\`\`\`

**Pourquoi ça casse** : en maths, la multiplication implicite \`2X\` est évidente. En informatique, **chaque opérateur doit être explicite** — et une expression doit être **linéaire** (une seule ligne, pas de fraction à étages).

**Comment corriger** :

\`\`\`
E ← 2*X + 1 ;                         ← ✓ le * apparaît explicitement
E ← (X*X + 3*X − 4) / (2*X − 1) ;     ← ✓ la fraction devient linéaire
\`\`\`

### 3. Ignorer la priorité des opérateurs 🎯

**Ce qui ne va pas** : croire que \`4 + 6 / 2 * 7 − 2\` se lit de gauche à droite comme une phrase → \`(4+6)/2*7−2 = 33\` ?! Faux.

**Pourquoi ça casse** : \`/\` et \`*\` sont **plus prioritaires** que \`+\` et \`−\`. L'évaluation réelle : \`6/2 = 3\`, puis \`3*7 = 21\`, puis \`4 + 21 − 2 = 23\`.

**Comment corriger** : apprends la table des priorités, et en cas de doute, **parenthèse** ! Les parenthèses sont gratuites et lèvent toute ambiguïté.

\`\`\`
Moy ← N1 + N2 / 2 ;         ← ✗ calcule N1 + (N2/2) : mauvaise moyenne !
Moy ← (N1 + N2) / 2 ;       ← ✓ les parenthèses forcent l'addition d'abord
\`\`\`

### 4. Confondre = et ← 🔁

**Ce qui ne va pas** :

\`\`\`
A = 18 ;              ← ✗ ceci n'est PAS une affectation
\`\`\`

**Pourquoi ça casse** : en algorithmique, \`=\` est un **opérateur de relation** (une comparaison qui répond Vrai/Faux, comme dans \`Si A = 0\`). L'action qui **range une valeur** dans un objet, c'est **\`←\`**. \`A = 18\` pose une question ; \`A ← 18\` donne un ordre.

**Comment corriger** :

\`\`\`
A ← 18 ;              ← ✓ affectation : range 18 dans A
Si A = 18 Alors …     ← ✓ comparaison : teste si A vaut 18
\`\`\`

### 5. Croire qu'on peut récupérer une valeur écrasée 🕳️

**Ce qui ne va pas** : échanger deux variables en écrivant

\`\`\`
A ← B ;               ← l'ancienne valeur de A vient d'être DÉTRUITE
B ← A ;               ← ✗ B reçoit… la valeur de B ! (A et B identiques)
\`\`\`

**Pourquoi ça casse** : après une affectation, l'**ancienne valeur est perdue à jamais**. Ici, dès la première ligne, le contenu initial de \`A\` a disparu — la deuxième ligne recopie donc B dans B.

**Comment corriger** : utilise une **variable temporaire** qui sauvegarde la valeur avant l'écrasement.

\`\`\`
T ← A ;               ← ✓ on met A à l'abri dans T
A ← B ;               ← ✓ A reçoit B (l'ancien A est sauvé dans T)
B ← T ;               ← ✓ B reçoit l'ancien A : échange réussi !
\`\`\`

### 6. Lire ou écrire un objet jamais déclaré 👻

**Ce qui ne va pas** :

\`\`\`
Algorithme somme ;
Var A, B : entier ;
Debut
    Lire(A, B) ;
    S ← A + B ;       ← ✗ S n'existe pas : aucun espace mémoire réservé
    Ecrire(S) ;
Fin.
\`\`\`

**Pourquoi ça casse** : \`Lire\` initialise et \`←\` modifie un espace mémoire **déjà réservé** par une déclaration. Sans \`S\` dans \`Var\`, la mémoire n'a jamais reçu l'ordre « prépare-moi un espace appelé S ».

**Comment corriger** : chaque objet de la partie Action doit figurer dans la partie Déclaration.

\`\`\`
Var A, B, S : entier ;    ← ✓ S a maintenant son espace en Mémoire Centrale
\`\`\`
`,
    badge: {
      id: "badge-algo-variables",
      name: "Chef de Stand Mémoire",
      icon: "Binary",
      description:
        "Maîtrise les 4 types de base, la priorité des opérateurs, Lire/Ecrire et l'affectation ← — et sait dérouler une trace d'exécution sans caler.",
    },
    challenges: [
      {
        id: "algo-var-type-choice",
        title: "Le bon réservoir pour la bonne donnée",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧱 Choix du châssis

Tu dois stocker la **moyenne d'un étudiant**, par exemple \`15.5\`.

**Quel type de base déclarer pour cet objet ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Une moyenne peut avoir une partie décimale (le .5). Un type entier ne sait stocker que des nombres sans virgule.", cost: 15 },
          { text: "📖 Correction complète : le type reel. Une moyenne comme 15.5 possède une partie décimale ; seul reel représente (approximativement) les nombres à virgule. entier tronquerait le .5, caractere sert aux symboles, booleen ne vaut que Vrai/Faux.", cost: 60 },
        ],
        options: ["entier", "reel", "caractere", "booleen"],
        answer: 1,
        explanation: `Une **moyenne** (\`15.5\`) a une **partie décimale** → il faut le type **\`reel\`**, seul capable de représenter (approximativement) les nombres à virgule.

- \`entier\` : pas de virgule (∈ ℤ) → il ne pourrait pas stocker le \`.5\`.
- \`caractere\` : un symbole sur 1 octet (\`'A'\`, \`'?'\`).
- \`booleen\` : seulement \`Vrai\` ou \`Faux\`.

📌 Rappel de compatibilité : on **peut** ranger un entier dans un reel (\`X ← 3\` donne 3.0), mais **jamais** un reel dans un entier (\`Age ← 15.5\` avec Age entier ✗).`,
        tags: ["algo", "types", "reel"],
      },
      {
        id: "algo-var-divmod",
        title: "Le couple gagnant : div & mod",
        order: 2,
        difficulty: "easy",
        type: "numeric",
        prompt: `## ⛽ Division entière

Rappel : \`div\` donne le **quotient** de la division entière, \`mod\` donne le **reste**.

Calcule la valeur de :

\`\`\`
(17 mod 5) + (17 div 5)
\`\`\``,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Pose la division : 17 = 5 × 3 + 2. Le quotient est 3 (div), le reste est 2 (mod).", cost: 15 },
          { text: "📖 Correction complète : 17 div 5 = 3 (quotient), 17 mod 5 = 2 (reste). Donc (17 mod 5) + (17 div 5) = 2 + 3 = 5.", cost: 60 },
        ],
        answer: 5,
        explanation: `On pose la division entière de 17 par 5 : **17 = 5 × 3 + 2**.

\`\`\`
  17 │ 5
  15 │ 3   ← quotient  (17 div 5 = 3)
  ──
   2       ← reste     (17 mod 5 = 2)
\`\`\`

Donc \`(17 mod 5) + (17 div 5) = 2 + 3 = \`**\`5\`**.

⚠️ \`div\` et \`mod\` sont réservés aux **entiers** : \`17.0 div 5\` n'a aucun sens en algorithmique.`,
        tags: ["algo", "entier", "div", "mod"],
      },
      {
        id: "algo-var-priorite-1",
        title: "Boîte de vitesses sans parenthèses",
        order: 3,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🏁 Priorité des opérateurs

Évalue cette expression arithmétique en respectant la **priorité des opérateurs** :

\`\`\`
4 + 6 / 2 * 7 − 2
\`\`\``,
        points: 100,
        timeLimitSec: 300,
        hints: [
          { text: "\`/\` et \`*\` sont prioritaires sur \`+\` et \`−\`. À priorité égale, on va de gauche à droite : d'abord 6/2, puis ×7.", cost: 15 },
          { text: "📖 Correction complète : 6/2 = 3 (division d'abord) ; 3*7 = 21 (même niveau, gauche→droite) ; il reste 4 + 21 − 2 = 23.", cost: 60 },
        ],
        answer: 23,
        explanation: `Étape par étape, en respectant la priorité \`*\`,\`/\` avant \`+\`,\`−\` (et gauche → droite à priorité égale) :

\`\`\`
4 + 6 / 2 * 7 − 2
= 4 + 3 * 7 − 2      (6/2 d'abord)
= 4 + 21 − 2         (puis 3*7)
= 23
\`\`\`

C'est l'**exemple 1** du cours. Compare avec le défi suivant : mêmes chiffres, mais des parenthèses… 👀`,
        tags: ["algo", "expression", "priorite"],
      },
      {
        id: "algo-var-priorite-2",
        title: "Les parenthèses changent tout",
        order: 4,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🛡️ Le pouvoir des parenthèses

Mêmes chiffres que le défi précédent, mais parenthésés :

\`\`\`
(4 + 6) / (2 * (7 − 2))
\`\`\`

**Que vaut l'expression ?**`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          { text: "Les parenthèses sont prioritaires sur tout. Commence par les plus internes : (7 − 2).", cost: 15 },
          { text: "📖 Correction complète : (7−2)=5 ; 2*5=10 ; (4+6)=10 ; 10/10 = 1. Résultat : 1 (contre 23 sans parenthèses !).", cost: 60 },
        ],
        answer: 1,
        explanation: `Les parenthèses ont la **priorité maximale**, en commençant par les plus internes :

\`\`\`
(4 + 6) / (2 * (7 − 2))
= 10 / (2 * 5)
= 10 / 10
= 1
\`\`\`

**23** (sans parenthèses) contre **1** (avec) : la preuve que parenthéser change radicalement le résultat. C'est l'**exemple 2** du cours.`,
        tags: ["algo", "expression", "parentheses"],
      },
      {
        id: "algo-var-logique",
        title: "Évaluer une expression logique",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔌 Circuit booléen

On donne **A = Vrai**, **B = Faux**, **C = Faux**. Évalue :

\`\`\`
E1 = (A Ou B) Et (Non C Et A)
\`\`\`

**Quelle est la valeur de E1 ?**`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "Rappelle la priorité logique : parenthèses, puis Non, puis Et, puis Ou. Traite Non C AVANT le Et à côté.", cost: 25 },
          { text: "Table de vérité : (V Ou F)=V. Non F=V, donc (Non C Et A)=(V Et V)=V.", cost: 30 },
          { text: "📖 Correction complète : (A Ou B)=(V Ou F)=V ; Non C=Non F=V ; (Non C Et A)=(V Et V)=V ; enfin V Et V = Vrai.", cost: 60 },
        ],
        options: ["Vrai", "Faux"],
        answer: 0,
        explanation: `On évalue en respectant la priorité ** > Non > Et > Ou** :

\`\`\`
E1 = (A Ou B) Et (Non C Et A)
   = (V Ou F) Et (Non F Et V)
   = V        Et (V Et V)       ← Non F = V, évalué avant le Et
   = V Et V
   = Vrai
\`\`\`

Rappels mnémotechniques : \`Ou\` est **arrangeant** (Vrai dès qu'un opérande est Vrai), \`Et\` est **exigeant** (Vrai seulement si les deux le sont), \`Non\` **inverse**.`,
        tags: ["algo", "booleen", "logique"],
      },
      {
        id: "algo-var-trace-affect",
        title: "Trace d'affectation : où finit B ?",
        order: 6,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 👑 L'action reine à la loupe

Les objets \`A\` et \`B\` sont des entiers. Au départ, **B vaut 20** (A n'est pas encore initialisé). On exécute dans l'ordre :

\`\`\`
A ← 18 ;
A ← B + 5 ;
B ← 2*B + A ;
\`\`\`

**Quelle est la valeur finale de \`B\` ?**`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "Déroule une trace ligne par ligne. Attention : à la 2e ligne, A est ÉCRASÉ (le 18 est perdu).", cost: 20 },
          { text: "Après \`A ← B + 5\`, A vaut 25 (20+5). B vaut toujours 20 à ce moment-là.", cost: 25 },
          { text: "📖 Correction complète : A←18 (A=18) ; A←B+5 = 20+5 (A=25) ; B←2*B+A = 2×20+25 = 45+... non : 2×20=40, +25 = 65. Donc B = 65.", cost: 60 },
        ],
        answer: 65,
        explanation: `Trace d'exécution état-par-état :

| Action | A | B |
|---|---|---|
| *(départ)* | ? | 20 |
| \`A ← 18\` | **18** | 20 |
| \`A ← B + 5\` → 20+5 | **25** | 20 |
| \`B ← 2*B + A\` → 2×20+25 | 25 | **65** |

La dernière ligne : \`2*B\` utilise le B **actuel** (20) → 40, plus A (25) = **65**.

⚠️ Piège classique : croire que \`A ← B + 5\` vaut 23 (18+5). Non ! \`←\` **calcule la droite avec les valeurs du moment** : B=20, donc 25. Et l'ancien 18 de A est **définitivement perdu**.`,
        tags: ["algo", "affectation", "trace"],
      },
      {
        id: "algo-var-code-somme",
        title: "Ton tout premier algorithme : la somme",
        order: 7,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🎉 Sur la grille de départ

Écris un **algorithme complet** qui **lit deux entiers** \`A\` et \`B\`, calcule leur **somme** \`S\`, et **affiche** le résultat.

Utilise la syntaxe CyberAce vue en cours : \`Algorithme\`, \`Var\`, \`Debut\` … \`Fin\`, \`Lire\`, \`Ecrire\`, et l'affectation \`←\` (tape \`<-\`, il devient \`←\`).

🎯 Rends l'exécution conviviale avec des messages \`Ecrire('…')\` si tu veux le bonus fierté.`,
        points: 200,
        timeLimitSec: 600,
        starter: `Algorithme somme ;
Var A, B, S : entier ;
Debut

Fin.`,
        hints: [
          { text: "Il te faut 4 actions dans l'ordre : Lire(A), Lire(B), l'affectation S ← A + B, puis Ecrire(S).", cost: 25 },
          { text: "L'affectation s'écrit `S <- A + B` (la flèche ←). On lit « calcule A+B, range dans S ».", cost: 30 },
          { text: "📖 Correction complète :\n```\nAlgorithme somme ;\nVar A, B, S : entier ;\nDebut\n    Ecrire('Donner un entier A :') ;\n    Lire(A) ;\n    Ecrire('Donner un entier B :') ;\n    Lire(B) ;\n    S <- A + B ;\n    Ecrire('La somme A+B= ', S) ;\nFin.\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Déclare tes objets de type entier dans Var", pattern: "Var[\\s\\S]{0,120}entier", flags: "i" },
            { label: "Lis les données au clavier avec Lire", pattern: "Lire\\s*\\(", flags: "i" },
            { label: "Calcule la somme avec l'affectation ← (ex: S <- A + B)", pattern: "(←|<-)[\\s\\S]{0,25}\\+", flags: "i" },
            { label: "Affiche le résultat avec Ecrire", pattern: "[EÉ]crire\\s*\\(", flags: "i" },
            { label: "Encadre tes actions par Debut … Fin", pattern: "Debut[\\s\\S]*Fin", flags: "i" },
          ],
        }),
        explanation: `**Version conviviale (version 2 du cours)** :

\`\`\`
Algorithme somme ;
Var A, B, S : entier ;
Debut
    Ecrire('Donner un entier A :') ;
    Lire(A) ;
    Ecrire('Donner un entier B :') ;
    Lire(B) ;
    S ← A + B ;
    Ecrire('La somme A+B= ', S) ;
Fin.
\`\`\`

**Pourquoi cette structure ?** On suit les 4 étapes : entrées (\`Lire\`), traitement (l'affectation \`←\` qui calcule et range), sortie (\`Ecrire\`). Les \`Ecrire('…')\` avant chaque \`Lire\` guident l'utilisateur — sans eux, l'écran attendrait une saisie sans rien dire.

Trace avec 1500 et 2641 : A=1500, B=2641, S=**4141**, écran → \`La somme A+B= 4141\`.`,
        tags: ["algo", "code", "pseudo", "somme"],
      },
      {
        id: "algo-var-code-max",
        title: "Décider sa trajectoire : le maximum",
        order: 8,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🔀 Premier virage : la conditionnelle

Écris un algorithme qui **lit deux entiers** \`A\` et \`B\`, détermine le **maximum** des deux, et l'**affiche**.

Utilise une **structure alternative** \`Si <Condition> Alors … Sinon … Fsi\` (avant-goût vu en fin de cours). Range le maximum dans un objet \`Max\`.`,
        points: 350,
        timeLimitSec: 900,
        starter: `Algorithme CalculMax ;
Var A, B, Max : entier ;
Debut
    Ecrire('Donner deux entiers A et B:') ;
    Lire(A, B) ;

Fin.`,
        hints: [
          { text: "Compare A et B avec Si A > B Alors … Sinon … Fsi. Dans chaque branche, une seule affectation de Max.", cost: 30 },
          { text: "Si A > B, alors Max ← A ; sinon Max ← B. N'oublie pas le Fsi qui ferme la structure.", cost: 35 },
          { text: "📖 Correction complète :\n```\nSi A > B Alors\n    Max <- A\nSinon\n    Max <- B\nFsi ;\nEcrire('Le maximum est :', Max) ;\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Compare A et B avec une structure Si … Alors", pattern: "Si[\\s\\S]{0,60}(>|<|≥|≤|>=|<=)[\\s\\S]{0,40}Alors", flags: "i" },
            { label: "Prévois la branche Sinon", pattern: "Sinon", flags: "i" },
            { label: "Ferme la conditionnelle avec Fsi", pattern: "Fsi", flags: "i" },
            { label: "Affecte le maximum à Max avec ← dans chaque branche", pattern: "Max\\s*(←|<-)", flags: "i" },
            { label: "Affiche le résultat avec Ecrire", pattern: "[EÉ]crire\\s*\\(", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Algorithme CalculMax ;
Var A, B, Max : entier ;
Debut
    Ecrire('Donner deux entiers A et B:') ;
    Lire(A, B) ;
    Si A > B Alors
        Max ← A
    Sinon
        Max ← B
    Fsi ;
    Ecrire('Le maximum est :', Max) ;
Fin.
\`\`\`

**Pourquoi \`Si … Sinon\` (alternative complète) et pas deux \`Si\` séparés ?** Avec la version complète, **exactement une** des deux branches s'exécute — pas de risque d'oublier un cas ni d'exécuter les deux. Deux \`Si\` indépendants (\`Si A>B … Fsi ; Si A≤B … Fsi\`) marcheraient mais évaluent la condition **deux fois** : moins élégant et plus coûteux.

Trace avec la saisie \`7 12\` : \`A>B\` → 7>12 → **Faux** → branche \`Sinon\` → \`Max ← 12\` → écran \`Le maximum est :12\`.`,
        tags: ["algo", "code", "pseudo", "conditionnelle", "maximum"],
      },
    ],
  },
];
