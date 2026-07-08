import type { CourseSeed } from "../../../types";

/** Base de données — Module 7 : SQL avancé (vues, index, contraintes complexes). */
export const sqlAvance: CourseSeed[] = [
  {
    slug: "bdd-sql-avance",
    title: "SQL avancé : vues, index, contraintes",
    checkpoint: "base-de-donnees",
    codename: "Turbo SQL",
    domain: "BDD — SQL avancé",
    theme: "vault",
    icon: "Database",
    accent: "#93B896",
    order: 7,
    difficulty: "hard",
    summary:
      "Passer au niveau supérieur : les vues (requêtes stockées, sécurité et simplification), les index (accélérer les recherches), les contraintes nommées et complexes. Toujours du SQL réel sur l'atelier.",
    objectives: [
      "Créer et utiliser une vue (CREATE VIEW) et comprendre son intérêt",
      "Créer un index (CREATE INDEX) et savoir quand il aide (ou pas)",
      "Nommer et gérer des contraintes (ajout, désactivation)",
      "Comprendre l'impact des index sur lecture vs écriture",
      "Distinguer vue simple (mise à jour possible) et vue complexe (lecture seule)",
    ],
    lesson: `# 🚀 SQL avancé — Turbo SQL

Après les bases, les outils qui font la différence en production : **vues** (simplifier & sécuriser), **index** (accélérer), **contraintes** (fiabiliser). 🏎️

---

## 1. Les vues — des requêtes stockées 👓

Une **vue** (*view*) est une **requête SELECT enregistrée** sous un nom, qu'on interroge **comme une table**. Elle ne stocke **pas** de données (sauf vue matérialisée) : elle se recalcule à chaque appel.

\`\`\`sql
CREATE VIEW v_clients_alger AS
SELECT id_client, nom, telephone
FROM CLIENT
WHERE ville = 'Alger';

-- ensuite on l'interroge comme une table :
SELECT * FROM v_clients_alger;
\`\`\`

**À quoi ça sert ?**
- **Simplifier** : cacher une jointure complexe derrière un nom simple.
- **Sécuriser** : donner accès à **certaines colonnes/lignes** seulement (on \`GRANT SELECT\` sur la vue, pas sur la table → l'utilisateur ne voit pas les salaires par ex.).
- **Stabilité** : les applications interrogent la vue ; on peut réorganiser les tables derrière sans les casser (indépendance logique !).

> 🧠 Une vue **simple** (une seule table, sans agrégat ni DISTINCT) peut parfois être **mise à jour** (INSERT/UPDATE au travers). Une vue **complexe** (jointures, GROUP BY, fonctions) est en **lecture seule**.

---

## 2. Les index — accélérer les recherches ⚡

Un **index** est une structure (souvent un **arbre B**) qui permet de retrouver des lignes **sans parcourir toute la table**. C'est l'équivalent de l'**index d'un livre** : au lieu de lire toutes les pages, on va directement à la bonne.

\`\`\`sql
CREATE INDEX idx_client_ville ON CLIENT(ville);
\`\`\`

- Une recherche \`WHERE ville = 'Oran'\` peut alors utiliser l'index au lieu d'un **balayage complet** (*full table scan*).
- La **clé primaire** et les contraintes **UNIQUE** créent **automatiquement** un index.

**Le compromis lecture/écriture :**
| | Effet d'un index |
|---|---|
| **Lecture** (SELECT WHERE/JOIN) | **plus rapide** 🚀 |
| **Écriture** (INSERT/UPDATE/DELETE) | **plus lente** (l'index doit être maintenu) |
| **Espace disque** | **consommé en plus** |

> ⚠️ **N'indexe pas tout !** Un index sur une colonne rarement filtrée, ou sur une table minuscule, coûte plus qu'il ne rapporte. On indexe les colonnes des \`WHERE\` et des \`JOIN\` fréquents. (On approfondira les index bitmap/jointure dans le module Optimisation.)

---

## 3. Contraintes nommées & gestion fine 🏷️

Nommer ses contraintes rend leur **gestion** possible :

\`\`\`sql
-- ajouter une contrainte nommée
ALTER TABLE EMPLOYE ADD CONSTRAINT chk_salaire CHECK (salaire > 0);

-- désactiver temporairement (ex. pour un import massif)
ALTER TABLE EMPLOYE DISABLE CONSTRAINT chk_salaire;
ALTER TABLE EMPLOYE ENABLE  CONSTRAINT chk_salaire;

-- supprimer
ALTER TABLE EMPLOYE DROP CONSTRAINT chk_salaire;
\`\`\`

Contrainte **UNIQUE** vs **PRIMARY KEY** : une table a **une seule** clé primaire (qui refuse aussi les NULL) mais peut avoir **plusieurs** contraintes UNIQUE (qui, elles, tolèrent un NULL en Oracle).

Clé étrangère avec action en cascade :
\`\`\`sql
... FOREIGN KEY (id_client) REFERENCES CLIENT(id_client) ON DELETE CASCADE
\`\`\`
\`ON DELETE CASCADE\` : supprimer un client supprime **automatiquement** ses véhicules (à manier avec précaution !).

---

## 🧠 Ce qu'il faut retenir

- Une **vue** = un \`SELECT\` stocké, interrogé comme une table ; sert à **simplifier**, **sécuriser** (colonnes/lignes filtrées) et **stabiliser**. Vue simple = parfois modifiable ; vue complexe = lecture seule.
- Un **index** accélère les **lectures** (\`WHERE\`/\`JOIN\`) mais **ralentit les écritures** et prend de l'espace. PK et UNIQUE créent un index automatiquement.
- **N'indexe que** les colonnes filtrées/jointes souvent, sur des tables assez grandes.
- **Nommer** ses contraintes permet de les \`ENABLE\`/\`DISABLE\`/\`DROP\`. \`ON DELETE CASCADE\` propage les suppressions.

## ⚠️ Erreurs fréquentes des débutants

**1. Croire qu'une vue stocke les données.** Une vue **recalcule** son SELECT à chaque appel (sauf vue **matérialisée**). Modifier la table met à jour la vue automatiquement.

**2. Vouloir modifier une vue complexe.** INSERT/UPDATE sur une vue avec **jointure/GROUP BY** est refusé : elle est en **lecture seule**.

**3. Indexer à outrance.** Chaque index **ralentit** les INSERT/UPDATE/DELETE. Trop d'index = base lente en écriture.

**4. Recréer un index sur la clé primaire.** Inutile : la **PK** et les contraintes **UNIQUE** génèrent déjà leur index.

**5. \`ON DELETE CASCADE\` sans réfléchir.** Supprimer un parent peut effacer en chaîne des tonnes d'enfants. Puissant mais dangereux.`,
    badge: {
      id: "badge-turbo-sql",
      name: "Turbo SQL",
      icon: "Database",
      description: "Crée des vues et des index, gère des contraintes nommées, comprend le compromis lecture/écriture.",
    },
    challenges: [
      {
        id: "bdd-adv-view",
        title: "Créer une vue",
        order: 1,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 👓 CREATE VIEW

Crée une vue nommée **v_clients_alger** qui affiche \`id_client\`, \`nom\` et \`telephone\` des clients dont la ville est **'Alger'**.`,
        points: 250,
        timeLimitSec: 480,
        starter: ``,
        hints: [
          { text: "CREATE VIEW <nom> AS SELECT … FROM CLIENT WHERE …;", cost: 25 },
          { text: "📖 Correction :\n```\nCREATE VIEW v_clients_alger AS\nSELECT id_client, nom, telephone\nFROM CLIENT\nWHERE ville = 'Alger';\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "CREATE VIEW v_clients_alger", pattern: "create\\s+view\\s+v_clients_alger", flags: "i" },
            { label: "Définie par AS SELECT", pattern: "as\\s+select", flags: "i" },
            { label: "Sur la table CLIENT", pattern: "from\\s+client", flags: "i" },
            { label: "Filtrée sur Alger", pattern: "where\\s+ville\\s*=\\s*'Alger'", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
CREATE VIEW v_clients_alger AS
SELECT id_client, nom, telephone
FROM CLIENT
WHERE ville = 'Alger';
\`\`\`
La vue **stocke la requête**, pas les données : \`SELECT * FROM v_clients_alger;\` réexécute le SELECT à jour. Intérêt sécurité : on peut \`GRANT SELECT ON v_clients_alger\` sans donner accès à **toute** la table CLIENT ni à toutes ses colonnes.`,
        tags: ["sql-avance", "view", "create-view"],
      },
      {
        id: "bdd-adv-index",
        title: "Créer un index",
        order: 2,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## ⚡ CREATE INDEX

Les recherches par ville sont fréquentes et lentes. Crée un index nommé **idx_client_ville** sur la colonne \`ville\` de la table CLIENT.`,
        points: 200,
        timeLimitSec: 360,
        starter: ``,
        hints: [
          { text: "CREATE INDEX <nom> ON <table>(<colonne>);", cost: 20 },
          { text: "📖 Correction : CREATE INDEX idx_client_ville ON CLIENT(ville);", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "CREATE INDEX idx_client_ville", pattern: "create\\s+index\\s+idx_client_ville", flags: "i" },
            { label: "Sur CLIENT(ville)", pattern: "on\\s+client\\s*\\(\\s*ville\\s*\\)", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
CREATE INDEX idx_client_ville ON CLIENT(ville);
\`\`\`
L'index permet à \`WHERE ville = 'Oran'\` de trouver les lignes **sans balayer toute la table** (via un arbre B). ⚠️ En contrepartie, chaque \`INSERT\`/\`UPDATE\`/\`DELETE\` sur CLIENT doit **maintenir** l'index (un peu plus lent). On indexe donc les colonnes **souvent filtrées/jointes**, pas toutes.`,
        tags: ["sql-avance", "index", "performance"],
      },
      {
        id: "bdd-adv-index-tradeoff",
        title: "Le prix d'un index",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚖️ Compromis

Ajouter un index sur une colonne a quel effet **négatif** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "L'index doit être tenu à jour à chaque modification de données.", cost: 20 },
          { text: "📖 Correction : il ralentit les écritures (INSERT/UPDATE/DELETE) et consomme de l'espace.", cost: 50 },
        ],
        options: [
          "Il ralentit les écritures (INSERT/UPDATE/DELETE) et consomme de l'espace disque",
          "Il ralentit les lectures (SELECT)",
          "Il supprime des lignes de la table",
          "Il n'a aucun inconvénient",
        ],
        answer: 0,
        explanation: `Un index **accélère les lectures** mais chaque **écriture** doit aussi **mettre à jour l'index** → INSERT/UPDATE/DELETE plus lents, et espace disque en plus. D'où la règle : indexer seulement les colonnes **fréquemment filtrées/jointes**, sur des tables **assez grandes**. Sur une petite table, un full scan est déjà rapide.`,
        tags: ["sql-avance", "index", "compromis"],
      },
      {
        id: "bdd-adv-view-update",
        title: "Vue modifiable ?",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 👓 Lecture seule

Une vue définie par une **jointure entre CLIENT et VEHICULE avec un GROUP BY** — peut-on faire un \`UPDATE\` **au travers** de cette vue ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Vue avec jointure/agrégat = trop complexe pour savoir quelle ligne modifier.", cost: 25 },
          { text: "📖 Correction : non, une vue complexe (jointure/GROUP BY) est en lecture seule.", cost: 60 },
        ],
        options: [
          "Non : une vue complexe (jointure, GROUP BY, agrégats) est en lecture seule",
          "Oui, toutes les vues sont modifiables",
          "Oui, mais seulement le dimanche",
          "Non, aucune vue ne peut jamais être lue",
        ],
        answer: 0,
        explanation: `Une vue **complexe** (jointures, \`GROUP BY\`, fonctions d'agrégation, \`DISTINCT\`) est en **lecture seule** : le SGBD ne peut pas déterminer **quelle ligne de quelle table** modifier de façon non ambiguë. Seule une vue **simple** (une table, sans agrégat) peut parfois accepter un INSERT/UPDATE. Pour modifier, on agit directement sur les **tables** sources.`,
        tags: ["sql-avance", "view", "lecture-seule"],
      },
      {
        id: "bdd-adv-disable",
        title: "Désactiver une contrainte",
        order: 5,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 🏷️ Gestion de contrainte

Pour un import massif, tu veux **désactiver temporairement** la contrainte nommée \`chk_salaire\` sur la table EMPLOYE. Écris la commande.`,
        points: 200,
        timeLimitSec: 360,
        starter: ``,
        hints: [
          { text: "ALTER TABLE … DISABLE CONSTRAINT …;", cost: 20 },
          { text: "📖 Correction : ALTER TABLE EMPLOYE DISABLE CONSTRAINT chk_salaire;", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "ALTER TABLE EMPLOYE", pattern: "alter\\s+table\\s+employe", flags: "i" },
            { label: "Désactive la contrainte", pattern: "disable\\s+constraint\\s+chk_salaire", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
ALTER TABLE EMPLOYE DISABLE CONSTRAINT chk_salaire;
-- ... import massif ...
ALTER TABLE EMPLOYE ENABLE CONSTRAINT chk_salaire;
\`\`\`
Désactiver une contrainte (\`DISABLE\`) accélère les gros chargements en évitant la vérification ligne à ligne, puis on la **réactive** (\`ENABLE\`) — Oracle revalide alors l'ensemble. Cela n'est possible que parce que la contrainte est **nommée** (\`chk_salaire\`).`,
        tags: ["sql-avance", "contrainte", "disable"],
      },
    ],
  },
];
