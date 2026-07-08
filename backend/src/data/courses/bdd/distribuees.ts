import type { CourseSeed } from "../../../types";

/** Base de données — Module 12 : bases de données distribuées (M1). Chap. 6 + 7 + TD fragmentation. */
export const distribuees: CourseSeed[] = [
  {
    slug: "bdd-distribuees",
    title: "Bases de données distribuées",
    checkpoint: "base-de-donnees",
    codename: "Split Grid",
    domain: "BDD — Distribué (M1)",
    theme: "vault",
    icon: "Boxes",
    accent: "#93B896",
    order: 12,
    difficulty: "hard",
    summary:
      "Approfondissement M1 : quand les données sont réparties sur plusieurs sites. Objectifs et transparence, fragmentation (horizontale, verticale, mixte), réplication, et traitement des requêtes distribuées (décomposition → localisation → optimisation), avec le TD de fragmentation verticale.",
    objectives: [
      "Définir une base de données distribuée et la transparence de répartition",
      "Distinguer fragmentation horizontale, verticale et mixte",
      "Comprendre la réplication (avantages / inconvénients)",
      "Décrire les étapes du traitement d'une requête distribuée",
      "Réécrire une requête sur des fragments (reconstruction par jointure/union)",
    ],
    lesson: `# 🌐 Bases de données distribuées — Split Grid

Une entreprise a des agences à Alger, Oran, Constantine. Faut-il **une** base centrale ou **répartir** les données là où elles sont utilisées ? Bienvenue dans le **distribué**. 🏎️

> 🎯 Ce module est un **approfondissement** : l'essentiel du checkpoint reste le SQL pratique.

---

## 1. C'est quoi une BD distribuée ? 🗺️

Une **base de données distribuée** (BDD répartie) est une base **logiquement unique** mais **physiquement répartie** sur **plusieurs sites** reliés par un réseau, gérée par un **SGBD réparti**.

**La transparence** est l'objectif clé : l'utilisateur écrit ses requêtes **comme si** la base était centralisée, sans savoir **où** sont les données.
- **Transparence de localisation** : on ne précise pas le site.
- **Transparence de fragmentation** : on ignore que la table est découpée.
- **Transparence de réplication** : on ignore qu'il existe plusieurs copies.

**Avantages** : performance locale, disponibilité (un site tombe, les autres tiennent), passage à l'échelle. **Inconvénients** : complexité, cohérence des copies, requêtes plus difficiles à optimiser.

---

## 2. La fragmentation ✂️

**Fragmenter** = découper une table en **morceaux** répartis sur les sites.

**Fragmentation horizontale** : on découpe par **lignes** (une sélection σ). Ex. les clients d'Alger sur le site d'Alger, ceux d'Oran sur celui d'Oran.
\`\`\`
 CLIENT_ALGER = σ(ville='Alger')(CLIENT)      → site 1
 CLIENT_ORAN  = σ(ville='Oran')(CLIENT)       → site 2
 Reconstruction : CLIENT = CLIENT_ALGER ∪ CLIENT_ORAN   (UNION)
\`\`\`

**Fragmentation verticale** : on découpe par **colonnes** (une projection π), en **gardant la clé** dans chaque fragment pour pouvoir recoller.
\`\`\`
 CLIENT_1 = π(id_client, nom, prenom)(CLIENT)   → site RH
 CLIENT_2 = π(id_client, ville, telephone)(CLIENT) → site commercial
 Reconstruction : CLIENT = CLIENT_1 ⋈ CLIENT_2   (JOINTURE sur id_client)
\`\`\`

**Fragmentation mixte** : combinaison des deux (on découpe en colonnes puis en lignes, ou l'inverse).

> 🧠 **Règle de reconstruction** : horizontale → **UNION** des fragments ; verticale → **JOINTURE** sur la clé (qui **doit** figurer dans chaque fragment vertical). C'est exactement le TD de fragmentation.

---

## 3. La réplication 📑

**Répliquer** = maintenir **plusieurs copies** d'une donnée sur différents sites.
- **Avantages** : lectures locales très rapides, **haute disponibilité** (si un site tombe, une copie subsiste).
- **Inconvénients** : les **écritures** doivent propager la mise à jour à **toutes les copies** → coût et risque d'**incohérence** temporaire.

Il y a un **compromis** classique : plus on réplique, meilleures sont les **lectures** et la **disponibilité**, mais plus les **écritures** et la **cohérence** deviennent coûteuses.

---

## 4. Traiter une requête distribuée 🔧

Une requête posée sur la vue globale doit être transformée pour s'exécuter sur les fragments répartis. Étapes :

\`\`\`
 1) DÉCOMPOSITION   : traduire la requête globale en algèbre relationnelle,
                      indépendamment de la répartition (comme en centralisé).
 2) LOCALISATION    : remplacer chaque relation globale par sa RECONSTRUCTION
                      à partir des fragments (∪ pour l'horizontal, ⋈ pour le vertical),
                      puis simplifier (élaguer les fragments inutiles).
 3) OPTIMISATION    : choisir un plan qui MINIMISE le coût — surtout le COÛT DE
                      TRANSFERT réseau (déplacer des données entre sites coûte cher).
 4) EXÉCUTION        : exécuter localement + rapatrier/combiner les résultats.
\`\`\`

> 🧠 Différence majeure avec le centralisé : le **coût dominant** n'est plus le disque mais le **transfert réseau** entre sites. L'optimiseur distribué cherche à **déplacer le moins de données possible** (ex. filtrer/agréger **localement** avant d'envoyer). L'**élagage** (*pruning*) supprime les fragments qui ne peuvent pas contenir de résultat (ex. un fragment « ville=Oran » est inutile pour \`WHERE ville='Alger'\`).

---

## 🧠 Ce qu'il faut retenir

- Une **BDD distribuée** = logiquement unique, physiquement répartie ; objectif = **transparence** (localisation, fragmentation, réplication).
- **Fragmentation horizontale** = par **lignes** (σ), reconstruite par **UNION** ; **verticale** = par **colonnes** (π, clé conservée), reconstruite par **JOINTURE** ; **mixte** = les deux.
- **Réplication** = plusieurs copies → lectures/disponibilité meilleures, mais **écritures** et **cohérence** plus coûteuses.
- Requête distribuée : **décomposition → localisation → optimisation → exécution** ; le coût dominant est le **transfert réseau** → minimiser les données déplacées, **élaguer** les fragments inutiles.

## ⚠️ Erreurs fréquentes des débutants

**1. Oublier la clé dans un fragment vertical.** Sans la clé (\`id_client\`) dans **chaque** fragment vertical, impossible de **recoller** par jointure → fragmentation invalide.

**2. Reconstruire un fragment horizontal par jointure.** Non : horizontal = **UNION** ; c'est le **vertical** qui se reconstruit par **jointure**.

**3. Ignorer le coût réseau.** En distribué, déplacer 1 M de lignes entre deux sites peut dominer tout le reste : on **filtre/agrège d'abord localement**.

**4. Sur-répliquer.** Beaucoup de copies = lectures rapides mais **écritures** lentes et **cohérence** difficile. C'est un **compromis**, pas un gain gratuit.

**5. Ne pas élaguer les fragments.** Interroger tous les fragments alors que le \`WHERE\` en exclut la plupart gaspille du réseau : l'optimiseur **élague** les fragments non pertinents.`,
    badge: {
      id: "badge-split-grid",
      name: "Split Grid",
      icon: "Boxes",
      description: "Comprend la fragmentation (H/V/mixte), la réplication et le traitement des requêtes distribuées.",
    },
    challenges: [
      {
        id: "bdd-dist-transparence",
        title: "La transparence",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🗺️ Objectif clé

Qu'est-ce que la **transparence de répartition** dans une base distribuée ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "L'utilisateur doit-il savoir OÙ sont les données ?", cost: 20 },
          { text: "📖 Correction : l'utilisateur interroge la base comme si elle était centralisée, sans savoir où/comment les données sont réparties.", cost: 50 },
        ],
        options: [
          "L'utilisateur interroge la base comme si elle était centralisée, sans se soucier du site, de la fragmentation ni de la réplication",
          "Toutes les données sont visibles en lecture par tout le monde",
          "Le mot de passe est transmis en clair",
          "Chaque requête doit préciser le site où exécuter",
        ],
        answer: 0,
        explanation: `La **transparence** signifie que l'utilisateur écrit ses requêtes **comme en centralisé**, sans connaître la **localisation**, la **fragmentation** ni la **réplication** des données. Le SGBD réparti se charge de router et recombiner. C'est l'objectif fondamental d'une BDD distribuée : masquer la complexité de la répartition.`,
        tags: ["distribuees", "transparence", "definitions"],
      },
      {
        id: "bdd-dist-horiz-vert",
        title: "Horizontale ou verticale ?",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ✂️ Types de fragmentation

On découpe la table CLIENT en deux : un fragment \`(id_client, nom, prenom)\` et un fragment \`(id_client, ville, telephone)\`. De quelle fragmentation s'agit-il ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "On a découpé par COLONNES (avec la clé dans chaque morceau).", cost: 20 },
          { text: "📖 Correction : fragmentation verticale (par colonnes, clé conservée).", cost: 50 },
        ],
        options: [
          "Verticale : on découpe par colonnes, en gardant la clé (id_client) dans chaque fragment",
          "Horizontale : on découpe par lignes",
          "Mixte : lignes et colonnes en même temps",
          "Ce n'est pas une fragmentation valide",
        ],
        answer: 0,
        explanation: `Découper par **colonnes** = fragmentation **verticale** (une projection π). La **clé** \`id_client\` est **répétée** dans chaque fragment — indispensable pour **reconstruire** la table par **jointure**. La fragmentation **horizontale** découperait par **lignes** (ex. clients d'Alger vs d'Oran), reconstruite par **UNION**.`,
        tags: ["distribuees", "fragmentation", "verticale"],
      },
      {
        id: "bdd-dist-reconstruction",
        title: "Recoller les fragments",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🧩 Reconstruction

Comment reconstruit-on la table d'origine à partir de fragments **horizontaux** d'un côté, et **verticaux** de l'autre ?

*(Reprise du TD fragmentation.)*`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Horizontal = lignes → on empile ; vertical = colonnes → on recolle sur la clé.", cost: 25 },
          { text: "📖 Correction : horizontal → UNION ; vertical → JOINTURE sur la clé.", cost: 60 },
        ],
        options: [
          "Fragments horizontaux → UNION ; fragments verticaux → JOINTURE sur la clé",
          "Fragments horizontaux → JOINTURE ; fragments verticaux → UNION",
          "Les deux se reconstruisent toujours par UNION",
          "On ne peut jamais reconstruire une table fragmentée",
        ],
        answer: 0,
        explanation: `Règle de reconstruction : les fragments **horizontaux** (des sous-ensembles de **lignes**) se recollent par **UNION (∪)** ; les fragments **verticaux** (des sous-ensembles de **colonnes**) se recollent par **JOINTURE (⋈) sur la clé** commune. C'est pourquoi la clé **doit** figurer dans chaque fragment vertical — sans elle, pas de jointure possible.`,
        tags: ["distribuees", "reconstruction", "union-jointure"],
      },
      {
        id: "bdd-dist-replication",
        title: "Le compromis de la réplication",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📑 Réplication

Répliquer une donnée sur plusieurs sites améliore les lectures et la disponibilité. Quel est le principal **inconvénient** ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "Que se passe-t-il à chaque ÉCRITURE quand il y a N copies ?", cost: 20 },
          { text: "📖 Correction : les écritures doivent propager à toutes les copies → coût + risque d'incohérence.", cost: 50 },
        ],
        options: [
          "Les écritures doivent être propagées à toutes les copies : coût accru et risque d'incohérence temporaire",
          "Les lectures deviennent impossibles",
          "La base ne peut plus être interrogée en SQL",
          "Aucun inconvénient : c'est toujours gagnant",
        ],
        answer: 0,
        explanation: `La **réplication** accélère les **lectures** (locales) et améliore la **disponibilité** (une copie survit à une panne), mais chaque **écriture** doit être **propagée à toutes les copies** → surcoût réseau et **risque d'incohérence** le temps de la synchronisation. C'est un **compromis** lecture/écriture, disponibilité/cohérence — au cœur des systèmes distribués.`,
        tags: ["distribuees", "replication", "compromis"],
      },
      {
        id: "bdd-dist-requete",
        title: "Traiter une requête distribuée",
        order: 5,
        difficulty: "hard",
        type: "order",
        prompt: `## 🔧 Étapes

Remets dans l'ordre les étapes du traitement d'une **requête distribuée** :`,
        points: 250,
        timeLimitSec: 480,
        options: [
          "Décomposition : traduire la requête globale en algèbre relationnelle",
          "Localisation : remplacer les relations globales par la reconstruction des fragments",
          "Optimisation : choisir le plan minimisant le coût (surtout le transfert réseau)",
          "Exécution : traiter localement puis combiner les résultats",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "D'abord traduire, puis localiser sur les fragments, puis optimiser (réseau!), puis exécuter.", cost: 25 },
          { text: "📖 Correction : décomposition → localisation → optimisation → exécution.", cost: 60 },
        ],
        explanation: `Ordre : **décomposition** (requête globale → algèbre, comme en centralisé) → **localisation** (remplacer chaque relation par la **reconstruction** de ses fragments : ∪/⋈, puis élaguer les inutiles) → **optimisation** (plan minimisant surtout le **coût de transfert réseau**) → **exécution** (local + combinaison). La grande différence avec le centralisé : le **réseau** domine le coût, donc on **déplace le moins de données** possible.`,
        tags: ["distribuees", "requete-distribuee", "etapes"],
      },
    ],
  },
];
