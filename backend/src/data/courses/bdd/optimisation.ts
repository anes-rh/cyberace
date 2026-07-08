import type { CourseSeed } from "../../../types";

/** Base de données — Module 11 : optimisation des requêtes (M1). Chap. 4 + 5. */
export const optimisation: CourseSeed[] = [
  {
    slug: "bdd-optimisation",
    title: "Optimisation des requêtes",
    checkpoint: "base-de-donnees",
    codename: "Query Tuner",
    domain: "BDD — Performance (M1)",
    theme: "vault",
    icon: "Database",
    accent: "#93B896",
    order: 11,
    difficulty: "hard",
    summary:
      "Approfondissement M1 : comment le SGBD transforme ta requête en plan d'exécution efficace. Étapes du traitement (analyse, réécriture, choix du plan, estimation de coût), plans d'exécution (EXPLAIN PLAN), et techniques d'indexation avancées (bitmap, index de jointure).",
    objectives: [
      "Décrire les étapes de traitement d'une requête (analyse, réécriture, plan, coût, exécution)",
      "Lire un plan d'exécution (full scan vs index scan) via EXPLAIN PLAN",
      "Comprendre l'optimiseur basé sur les coûts et le rôle des statistiques",
      "Savoir quand un index B-arbre aide (sélectivité)",
      "Connaître l'index bitmap et l'index de jointure et leurs cas d'usage",
    ],
    lesson: `# ⚙️ Optimisation des requêtes — Query Tuner

Tu écris **quoi** tu veux (SQL déclaratif) ; le SGBD décide **comment** l'obtenir. L'**optimiseur** choisit, parmi des dizaines de plans possibles, le **moins coûteux**. 🏎️

---

## 1. Le chemin d'une requête 🛣️

Entre ton \`SELECT\` et le résultat, le SGBD enchaîne :

\`\`\`
 Requête SQL
   │ 1) ANALYSE (parsing)   : syntaxe + noms de tables/colonnes valides ?
   │ 2) RÉÉCRITURE           : forme canonique, expansion des vues, simplifications
   │ 3) OPTIMISATION         : génère des PLANS candidats, estime leur COÛT, choisit le meilleur
   │ 4) EXÉCUTION            : le plan choisi lit les données
   ▼
 Résultat
\`\`\`

Une même requête peut avoir **plusieurs plans** équivalents (ordre des jointures, index utilisé ou non…). L'optimiseur cherche le **plus rapide**.

---

## 2. L'optimiseur basé sur les coûts (CBO) 💰

Oracle utilise un **optimiseur par les coûts** : il **estime** le coût de chaque plan (nombre de blocs lus, de lignes, CPU) à partir de **statistiques** sur les données (nombre de lignes, distribution des valeurs, sélectivité).

> ⚠️ **Statistiques périmées = mauvais plans.** Si Oracle croit qu'une table a 10 lignes alors qu'elle en a 10 millions, il choisira un plan catastrophique. D'où l'importance de **recalculer les statistiques** (\`DBMS_STATS\`) régulièrement.

---

## 3. Lire un plan d'exécution 📋

\`\`\`sql
EXPLAIN PLAN FOR
SELECT * FROM CLIENT WHERE ville = 'Oran';

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
\`\`\`

Deux accès typiques à une table :
| Accès | Quand | Coût |
|---|---|---|
| **TABLE ACCESS FULL** (full scan) | pas d'index utile, ou on lit **beaucoup** de lignes | lit **toute** la table |
| **INDEX RANGE SCAN** (+ ACCESS BY ROWID) | filtre **très sélectif** avec un index | va **droit** aux lignes |

> 🧠 **Contre-intuitif** : si un \`WHERE\` sélectionne **80 %** des lignes, un **full scan** est souvent **plus rapide** qu'un index (moins d'allers-retours). L'index gagne sur les filtres **sélectifs** (peu de lignes retournées).

---

## 4. La sélectivité, clé de l'indexation 🎯

La **sélectivité** = fraction de lignes retenues par un filtre. Un index B-arbre est **rentable** quand la sélectivité est **forte** (peu de lignes) : \`WHERE id_client = 42\` (une ligne) → index parfait. \`WHERE actif = 'O'\` sur une colonne à 2 valeurs → index B-arbre **peu utile**.

---

## 5. Index bitmap & index de jointure (Chap. 5) 🗺️

**Index bitmap** : pour les colonnes à **faible cardinalité** (peu de valeurs distinctes : sexe, statut, ville parmi quelques-unes). Oracle stocke, **pour chaque valeur**, un **vecteur de bits** (1 = la ligne a cette valeur). Les combinaisons \`AND\`/\`OR\` deviennent des **opérations booléennes** ultra-rapides sur les bitmaps.

\`\`\`
 statut = 'ACTIF'   : 1 0 1 1 0 0 1 ...
 statut = 'INACTIF' : 0 1 0 0 1 1 0 ...
   → un AND/OR entre bitmaps est quasi instantané
\`\`\`
- **Idéal** : entrepôts de données (*data warehouse*), colonnes à peu de valeurs, requêtes analytiques.
- **À éviter** : tables très **mises à jour** (le bitmap est coûteux à maintenir et verrouille beaucoup) → réservé au décisionnel, pas au transactionnel.

**Index de jointure** : pré-calcule/matérialise la **correspondance entre deux tables** souvent jointes (ex. une table de faits et une dimension), pour éviter de refaire la jointure à chaque requête. Très utilisé en décisionnel (schémas en étoile).

---

## 🧠 Ce qu'il faut retenir

- Traitement d'une requête : **analyse → réécriture → optimisation (coûts) → exécution** ; plusieurs plans équivalents, on garde le **moins cher**.
- L'**optimiseur par coûts** s'appuie sur des **statistiques** ; des stats **périmées** donnent de **mauvais plans**.
- **EXPLAIN PLAN** montre le plan : **FULL SCAN** (beaucoup de lignes / pas d'index) vs **INDEX SCAN** (filtre **sélectif**).
- Un index B-arbre est rentable pour les filtres **sélectifs** ; inutile si on lit une grande part de la table.
- **Index bitmap** : colonnes à **faible cardinalité**, décisionnel (data warehouse), pas pour le transactionnel. **Index de jointure** : pré-calcule des jointures fréquentes.

## ⚠️ Erreurs fréquentes des débutants

**1. Indexer une colonne peu sélective en B-arbre.** \`WHERE sexe = 'M'\` (2 valeurs) : l'index B-arbre n'aide pas ; un **bitmap** conviendrait mieux (en décisionnel).

**2. Oublier de recalculer les statistiques.** Sans stats à jour, l'optimiseur se trompe de plan. \`DBMS_STATS.GATHER_TABLE_STATS(...)\`.

**3. Croire qu'un index accélère toujours.** Sur un filtre **peu sélectif** (80 % des lignes), le **full scan** gagne.

**4. Mettre un index bitmap sur une table très modifiée.** Le maintien du bitmap et le verrouillage plombent l'OLTP → bitmap = **décisionnel** uniquement.

**5. Optimiser sans mesurer.** On lit d'abord le **plan** (EXPLAIN PLAN) avant de « deviner » : la performance se **constate**, pas se suppose.`,
    badge: {
      id: "badge-query-tuner",
      name: "Query Tuner",
      icon: "Database",
      description: "Comprend le traitement/optimisation des requêtes, les plans d'exécution et les index bitmap/jointure.",
    },
    challenges: [
      {
        id: "bdd-opt-etapes",
        title: "Les étapes du traitement",
        order: 1,
        difficulty: "medium",
        type: "order",
        prompt: `## 🛣️ Le chemin d'une requête

Remets dans l'ordre les grandes étapes du traitement d'une requête SQL par le SGBD :`,
        points: 250,
        timeLimitSec: 420,
        options: [
          "Analyse syntaxique et sémantique (parsing)",
          "Réécriture (forme canonique, expansion des vues)",
          "Optimisation : génération des plans et choix par estimation de coût",
          "Exécution du plan retenu",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "On vérifie/parse, on réécrit, on choisit le meilleur plan, puis on exécute.", cost: 25 },
          { text: "📖 Correction : analyse → réécriture → optimisation (coût) → exécution.", cost: 60 },
        ],
        explanation: `Ordre : **analyse** (syntaxe + validité des objets) → **réécriture** (forme canonique, expansion des vues, simplifications) → **optimisation** (générer des plans candidats, **estimer leur coût**, choisir le meilleur) → **exécution**. L'optimisation est l'étape « intelligente » : plusieurs plans donnent le même résultat, on garde le **moins coûteux**.`,
        tags: ["optimisation", "traitement", "etapes"],
      },
      {
        id: "bdd-opt-stats",
        title: "Le rôle des statistiques",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 💰 Optimiseur par coûts

Pourquoi des **statistiques périmées** sur les tables mènent-elles à de **mauvaises performances** ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "L'optimiseur estime le coût des plans À PARTIR des stats.", cost: 20 },
          { text: "📖 Correction : l'optimiseur choisit un plan sur des estimations fausses → plan inadapté.", cost: 50 },
        ],
        options: [
          "L'optimiseur estime le coût des plans à partir des stats ; si elles sont fausses, il choisit un plan inadapté",
          "Les statistiques stockent les données elles-mêmes",
          "Sans statistiques, la base refuse d'exécuter les requêtes",
          "Les statistiques chiffrent les mots de passe",
        ],
        answer: 0,
        explanation: `L'**optimiseur par coûts** (CBO) s'appuie sur des **statistiques** (nombre de lignes, distribution des valeurs, sélectivité) pour **estimer** le coût de chaque plan. Si les stats sont **périmées** (Oracle croit qu'une table a 10 lignes au lieu de 10 M), il choisira un **plan catastrophique** (ex. une jointure imbriquée là où un hash join s'imposait). On les recalcule avec \`DBMS_STATS\`.`,
        tags: ["optimisation", "statistiques", "cbo"],
      },
      {
        id: "bdd-opt-fullscan",
        title: "Full scan vs index",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 📋 Choix d'accès

Une requête \`WHERE\` retourne **80 % des lignes** d'une grande table. Un **index** sur la colonne filtrée est-il probablement utile ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Si on lit presque tout, aller ligne par ligne via l'index coûte plus qu'un balayage direct.", cost: 25 },
          { text: "📖 Correction : non — pour un filtre peu sélectif, le full scan est souvent plus rapide.", cost: 60 },
        ],
        options: [
          "Non : pour un filtre peu sélectif (80 % des lignes), un TABLE ACCESS FULL est souvent plus rapide qu'un index",
          "Oui : un index est toujours plus rapide qu'un full scan",
          "Oui, car l'index supprime les 20 % restants",
          "Impossible à dire sans connaître le mot de passe",
        ],
        answer: 0,
        explanation: `Un index B-arbre gagne sur les filtres **très sélectifs** (peu de lignes). Ici, retourner **80 %** des lignes via un index impliquerait d'innombrables **allers-retours** index→table (ACCESS BY ROWID) — plus coûteux qu'un **balayage séquentiel** (TABLE ACCESS FULL) qui lit tout d'un bloc. L'optimiseur choisira donc le **full scan**. Contre-intuitif mais fondamental : l'index n'aide que si on **élimine beaucoup**.`,
        tags: ["optimisation", "full-scan", "selectivite"],
      },
      {
        id: "bdd-opt-bitmap",
        title: "Quand un index bitmap ?",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🗺️ Index bitmap

Pour quel type de colonne (et de contexte) un **index bitmap** est-il le plus adapté ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Bitmap = peu de valeurs distinctes (faible cardinalité) ; et plutôt en lecture (décisionnel).", cost: 25 },
          { text: "📖 Correction : colonne à faible cardinalité (sexe, statut…), en environnement décisionnel/peu modifié.", cost: 60 },
        ],
        options: [
          "Une colonne à faible cardinalité (peu de valeurs distinctes), dans un contexte décisionnel peu mis à jour",
          "Une clé primaire unique dans une table très modifiée",
          "Une colonne de texte libre unique par ligne",
          "N'importe quelle colonne d'une base transactionnelle très active",
        ],
        answer: 0,
        explanation: `L'**index bitmap** brille sur les colonnes à **faible cardinalité** (peu de valeurs : statut, sexe, région…) : Oracle stocke un **vecteur de bits par valeur**, et les \`AND\`/\`OR\` deviennent des opérations booléennes très rapides — idéal pour les requêtes **analytiques** d'un *data warehouse*. En revanche, il est **coûteux à maintenir** et **verrouille** beaucoup lors des mises à jour → **à éviter** en OLTP (transactionnel actif). Une clé unique appelle un index **B-arbre**, pas bitmap.`,
        tags: ["optimisation", "index-bitmap", "cardinalite"],
      },
      {
        id: "bdd-opt-explain",
        title: "Voir le plan d'exécution",
        order: 5,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 🔍 EXPLAIN PLAN

Écris l'instruction qui demande à Oracle de **calculer le plan d'exécution** (sans exécuter la requête) pour :

\`SELECT * FROM CLIENT WHERE ville = 'Oran'\`

*(Juste l'instruction qui prépare le plan.)*`,
        points: 200,
        timeLimitSec: 360,
        starter: ``,
        hints: [
          { text: "EXPLAIN PLAN FOR <ta requête>;", cost: 20 },
          { text: "📖 Correction : EXPLAIN PLAN FOR SELECT * FROM CLIENT WHERE ville = 'Oran';", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Utilise EXPLAIN PLAN FOR", pattern: "explain\\s+plan\\s+for", flags: "i" },
            { label: "Suivi de la requête SELECT sur CLIENT", pattern: "select\\s+.*from\\s+client", flags: "is" },
          ],
        }),
        explanation: `\`\`\`sql
EXPLAIN PLAN FOR
SELECT * FROM CLIENT WHERE ville = 'Oran';
-- puis pour l'afficher :
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
\`\`\`
\`EXPLAIN PLAN FOR\` demande à l'optimiseur le **plan** qu'il utiliserait, **sans exécuter** la requête. On le lit ensuite avec \`DBMS_XPLAN.DISPLAY\`. On y voit si Oracle prévoit un **TABLE ACCESS FULL** ou un **INDEX RANGE SCAN** — le point de départ de tout *tuning*.`,
        tags: ["optimisation", "explain-plan", "sql"],
      },
    ],
  },
];
