import type { CourseSeed } from "../../../types";

/** Base de données — Module 9 : dictionnaire de données Oracle (TP Oracle N°3). */
export const dictionnaire: CourseSeed[] = [
  {
    slug: "bdd-dictionnaire",
    title: "Le dictionnaire de données Oracle",
    checkpoint: "base-de-donnees",
    codename: "Meta Query",
    domain: "BDD — Métadonnées",
    theme: "vault",
    icon: "Database",
    accent: "#93B896",
    order: 9,
    difficulty: "medium",
    summary:
      "La base se décrit elle-même. Le dictionnaire de données Oracle expose sous forme de vues (USER_*, ALL_*, DBA_*, V$*) tout ce qu'Oracle sait de tes objets : tables, colonnes, contraintes. On l'interroge en SQL pour explorer un schéma.",
    objectives: [
      "Comprendre le dictionnaire de données et son intérêt",
      "Distinguer les familles de vues : USER_*, ALL_*, DBA_*, V$*",
      "Lister ses tables via USER_TABLES",
      "Décrire les colonnes via USER_TAB_COLUMNS",
      "Retrouver les contraintes via USER_CONSTRAINTS",
    ],
    lesson: `# 🔎 Le dictionnaire de données Oracle — Meta Query

Comment savoir quelles tables/colonnes/contraintes existent dans un schéma ? Oracle **se décrit lui-même** dans le **dictionnaire de données** : un ensemble de **vues système** qu'on interroge… en SQL. 🏎️

---

## 1. Qu'est-ce que le dictionnaire ? 📖

Le **dictionnaire de données** est l'ensemble des **métadonnées** d'Oracle : la description de **tous** les objets (tables, colonnes, index, contraintes, utilisateurs, privilèges…). Oracle le tient à jour **automatiquement** à chaque \`CREATE\`/\`ALTER\`/\`DROP\`. On le consulte via des **vues** au nom normalisé.

---

## 2. Les 4 familles de vues 👀

Le **préfixe** indique la **portée** :

| Préfixe | Portée | Exemple |
|---|---|---|
| **USER_** | **mes** objets (mon schéma) | \`USER_TABLES\` = mes tables |
| **ALL_** | les objets **auxquels j'ai accès** (les miens + ceux qu'on m'a partagés) | \`ALL_TABLES\` |
| **DBA_** | **tous** les objets de la base (réservé aux administrateurs) | \`DBA_TABLES\` |
| **V$** | vues **dynamiques de performance** (état temps réel de l'instance) | \`V$SESSION\` |

> 🧠 **USER_ vs ALL_** : \`USER_TABLES\` ne montre que **tes** tables (colonne propriétaire implicite = toi) ; \`ALL_TABLES\` ajoute celles d'autres schémas **sur lesquelles tu as un droit** (avec une colonne \`OWNER\`). \`DBA_TABLES\` voit **tout** mais exige des privilèges d'admin.

---

## 3. Explorer ses tables et colonnes 🗂️

\`\`\`sql
-- la liste de mes tables
SELECT table_name FROM USER_TABLES;

-- les colonnes de la table CLIENT (nom, type, longueur, nullable)
SELECT column_name, data_type, data_length, nullable
FROM USER_TAB_COLUMNS
WHERE table_name = 'CLIENT';
\`\`\`

> ⚠️ Oracle stocke les noms d'objets en **MAJUSCULES** par défaut. Dans le \`WHERE\`, écris \`table_name = 'CLIENT'\` (majuscules), pas \`'client'\` — sinon zéro résultat !

La commande **\`DESCRIBE CLIENT\`** (ou \`DESC CLIENT\`) de SQL*Plus est un raccourci qui interroge en réalité ces vues pour afficher la structure d'une table.

---

## 4. Retrouver les contraintes 🔐

\`\`\`sql
-- les contraintes de la table VEHICULE
SELECT constraint_name, constraint_type
FROM USER_CONSTRAINTS
WHERE table_name = 'VEHICULE';
\`\`\`

La colonne \`constraint_type\` code le genre :
| Code | Type |
|---|---|
| **P** | PRIMARY KEY |
| **R** | FOREIGN KEY (Référentielle) |
| **U** | UNIQUE |
| **C** | CHECK (et NOT NULL) |

Pour voir **quelles colonnes** sont concernées : \`USER_CONS_COLUMNS\`.

---

## 5. À quoi ça sert concrètement ? 🛠️

- **Explorer** un schéma inconnu (« quelles tables, quelles colonnes ? »).
- **Auditer** : lister toutes les clés étrangères, tous les index, les privilèges accordés (\`USER_TAB_PRIVS\`).
- **Générer** du SQL automatiquement (scripts de sauvegarde, documentation).
- **Diagnostiquer** : \`V$SESSION\` (qui est connecté), \`V$SQL\` (requêtes en cours).

> 🎯 Un bon réflexe pro : face à une base inconnue, on commence **toujours** par \`SELECT table_name FROM USER_TABLES;\`.

---

## 🧠 Ce qu'il faut retenir

- Le **dictionnaire de données** = les **métadonnées** d'Oracle, exposées en **vues** qu'on interroge en SQL, tenues à jour automatiquement.
- Préfixes : **USER_** (mes objets), **ALL_** (mes objets + ceux partagés), **DBA_** (tout, admin), **V$** (perf temps réel).
- \`USER_TABLES\` (mes tables), \`USER_TAB_COLUMNS\` (colonnes), \`USER_CONSTRAINTS\` (contraintes : P/R/U/C).
- Les noms d'objets sont en **MAJUSCULES** dans le dictionnaire → filtrer avec \`'CLIENT'\`.
- \`DESCRIBE table\` est un raccourci vers ces vues.

## ⚠️ Erreurs fréquentes des débutants (reprises du TP)

**1. Filtrer en minuscules.** \`WHERE table_name = 'client'\` renvoie **zéro** ligne : Oracle stocke les noms en **MAJUSCULES**.

**2. Confondre USER_ et ALL_.** \`USER_TABLES\` = seulement **tes** tables ; \`ALL_TABLES\` inclut celles **partagées** par d'autres (avec la colonne OWNER).

**3. Utiliser DBA_ sans droits.** Les vues **DBA_** exigent des **privilèges d'administration** → sinon ORA-00942 (comme si la vue n'existait pas).

**4. Oublier que le dictionnaire est en lecture seule.** On **interroge** ces vues, on ne les modifie pas directement : elles reflètent l'état réel des objets.`,
    badge: {
      id: "badge-meta-query",
      name: "Meta Query",
      icon: "Database",
      description: "Explore un schéma via le dictionnaire Oracle (USER_TABLES, USER_TAB_COLUMNS, USER_CONSTRAINTS).",
    },
    challenges: [
      {
        id: "bdd-dico-usertables",
        title: "Lister mes tables",
        order: 1,
        difficulty: "easy",
        type: "code",
        language: "sql",
        prompt: `## 🗂️ USER_TABLES

Écris la requête qui affiche le **nom (table_name)** de **toutes tes tables** (celles de ton schéma).`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "SELECT table_name FROM USER_TABLES;", cost: 15 },
          { text: "📖 Correction : SELECT table_name FROM USER_TABLES;", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Sélectionne table_name", pattern: "select\\s+table_name", flags: "i" },
            { label: "Depuis USER_TABLES", pattern: "from\\s+user_tables", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT table_name FROM USER_TABLES;
\`\`\`
**\`USER_TABLES\`** est la vue du dictionnaire qui liste **tes** tables. C'est le premier réflexe face à une base : savoir ce qu'elle contient. Pour les tables d'autres schémas auxquelles tu as accès : \`ALL_TABLES\` (avec la colonne \`OWNER\`).`,
        tags: ["dictionnaire", "user_tables", "metadonnees"],
      },
      {
        id: "bdd-dico-columns",
        title: "Décrire les colonnes",
        order: 2,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 📋 USER_TAB_COLUMNS

Affiche le **nom** et le **type** (\`column_name\`, \`data_type\`) de toutes les colonnes de la table **CLIENT**, via le dictionnaire.

*(Attention à la casse du nom de table !)*`,
        points: 200,
        timeLimitSec: 420,
        starter: ``,
        hints: [
          { text: "FROM USER_TAB_COLUMNS WHERE table_name = 'CLIENT' (en MAJUSCULES).", cost: 20 },
          { text: "📖 Correction :\n```\nSELECT column_name, data_type\nFROM USER_TAB_COLUMNS\nWHERE table_name = 'CLIENT';\n```", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Sélectionne column_name et data_type", pattern: "select\\s+column_name\\s*,\\s*data_type", flags: "i" },
            { label: "Depuis USER_TAB_COLUMNS", pattern: "from\\s+user_tab_columns", flags: "i" },
            { label: "Filtre sur CLIENT en majuscules", pattern: "where\\s+table_name\\s*=\\s*'CLIENT'", flags: "" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT column_name, data_type
FROM USER_TAB_COLUMNS
WHERE table_name = 'CLIENT';
\`\`\`
**\`USER_TAB_COLUMNS\`** décrit **chaque colonne** (nom, type, longueur, nullable…). Le filtre \`table_name = 'CLIENT'\` **doit** être en **MAJUSCULES** : Oracle stocke les noms d'objets ainsi. Le raccourci \`DESC CLIENT\` interroge la même chose.`,
        tags: ["dictionnaire", "user_tab_columns", "casse"],
      },
      {
        id: "bdd-dico-user-all",
        title: "USER_ vs ALL_",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 👀 Portée des vues

Quelle est la différence entre **USER_TABLES** et **ALL_TABLES** ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "USER_ = à moi ; ALL_ = à moi + ce à quoi j'ai accès.", cost: 20 },
          { text: "📖 Correction : USER_TABLES = mes tables ; ALL_TABLES = les miennes + celles partagées par d'autres.", cost: 50 },
        ],
        options: [
          "USER_TABLES ne liste que MES tables ; ALL_TABLES ajoute celles d'autres schémas auxquelles j'ai accès (avec la colonne OWNER)",
          "ALL_TABLES ne montre que mes tables, USER_TABLES montre toute la base",
          "Les deux sont strictement identiques",
          "ALL_TABLES nécessite d'être administrateur, USER_TABLES aussi",
        ],
        answer: 0,
        explanation: `**\`USER_TABLES\`** = uniquement **tes** tables (ton schéma). **\`ALL_TABLES\`** = les tiennes **plus** celles d'autres utilisateurs **sur lesquelles tu as un droit** (elle a une colonne \`OWNER\`). **\`DBA_TABLES\`** voit **toute** la base mais exige des privilèges d'admin. La logique de préfixe (USER_/ALL_/DBA_) s'applique à toutes les vues du dictionnaire.`,
        tags: ["dictionnaire", "user-all-dba", "portee"],
      },
      {
        id: "bdd-dico-constraints",
        title: "Lister les contraintes",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 🔐 USER_CONSTRAINTS

Affiche le **nom** et le **type** (\`constraint_name\`, \`constraint_type\`) de toutes les contraintes de la table **VEHICULE**.`,
        points: 200,
        timeLimitSec: 420,
        starter: ``,
        hints: [
          { text: "FROM USER_CONSTRAINTS WHERE table_name = 'VEHICULE';", cost: 20 },
          { text: "📖 Correction :\n```\nSELECT constraint_name, constraint_type\nFROM USER_CONSTRAINTS\nWHERE table_name = 'VEHICULE';\n```", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Sélectionne constraint_name et constraint_type", pattern: "select\\s+constraint_name\\s*,\\s*constraint_type", flags: "i" },
            { label: "Depuis USER_CONSTRAINTS", pattern: "from\\s+user_constraints", flags: "i" },
            { label: "Filtre sur VEHICULE (majuscules)", pattern: "where\\s+table_name\\s*=\\s*'VEHICULE'", flags: "" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT constraint_name, constraint_type
FROM USER_CONSTRAINTS
WHERE table_name = 'VEHICULE';
\`\`\`
\`constraint_type\` code le genre : **P** (PRIMARY KEY), **R** (FOREIGN KEY référentielle), **U** (UNIQUE), **C** (CHECK/NOT NULL). Pour savoir **quelles colonnes** portent la contrainte, on joint avec \`USER_CONS_COLUMNS\`. C'est comme ça qu'on **audite** l'intégrité d'un schéma.`,
        tags: ["dictionnaire", "user_constraints", "audit"],
      },
      {
        id: "bdd-dico-casse",
        title: "Le piège de la casse",
        order: 5,
        difficulty: "easy",
        type: "mcq",
        prompt: `## ⚠️ Zéro résultat

\`SELECT * FROM USER_TABLES WHERE table_name = 'client';\` ne renvoie **aucune ligne**, alors que la table CLIENT existe bien. Pourquoi ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Comment Oracle stocke-t-il les noms d'objets par défaut ?", cost: 15 },
          { text: "📖 Correction : en MAJUSCULES → il faut WHERE table_name = 'CLIENT'.", cost: 40 },
        ],
        options: [
          "Oracle stocke les noms d'objets en MAJUSCULES : il faut chercher 'CLIENT', pas 'client'",
          "USER_TABLES n'existe pas",
          "Il faut être administrateur",
          "La table CLIENT est vide",
        ],
        answer: 0,
        explanation: `Oracle range les noms d'objets en **MAJUSCULES** dans le dictionnaire (sauf si on les crée entre guillemets doubles). La comparaison \`= 'client'\` (minuscules) ne correspond donc à rien. Solution : \`WHERE table_name = 'CLIENT'\`, ou \`WHERE UPPER(table_name) = 'CLIENT'\` pour être robuste. Une erreur classique du TP.`,
        tags: ["dictionnaire", "casse", "erreur"],
      },
    ],
  },
];
