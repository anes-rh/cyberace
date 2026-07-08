import type { CourseSeed } from "../../../types";

/** Base de données — Module 6 : SQL DQL (SELECT, jointures, sous-requêtes, agrégations). */
export const dql: CourseSeed[] = [
  {
    slug: "bdd-dql",
    title: "SQL DQL — interroger les données (SELECT)",
    checkpoint: "base-de-donnees",
    codename: "Query Master",
    domain: "BDD — SQL SELECT",
    theme: "vault",
    icon: "Database",
    accent: "#93B896",
    order: 6,
    difficulty: "hard",
    summary:
      "Le module central : extraire l'info. SELECT, WHERE, ORDER BY, jointures (INNER/LEFT/RIGHT/FULL), agrégations (COUNT/SUM/AVG/MIN/MAX), GROUP BY/HAVING, et sous-requêtes (imbriquées, corrélées). Beaucoup de vrais SELECT à écrire sur l'atelier.",
    objectives: [
      "Sélectionner et filtrer (SELECT, DISTINCT, WHERE, opérateurs, LIKE, IN, BETWEEN)",
      "Trier les résultats (ORDER BY ASC/DESC)",
      "Joindre plusieurs tables (INNER JOIN, LEFT/RIGHT/FULL OUTER JOIN)",
      "Agréger (COUNT/SUM/AVG/MIN/MAX) et grouper (GROUP BY … HAVING)",
      "Écrire des sous-requêtes imbriquées et corrélées, et savoir choisir entre jointure et sous-requête",
    ],
    lesson: `# 🔍 SQL DQL — Query Master

Le \`SELECT\` est **la** commande reine : 90 % du travail en base, c'est **interroger**. On travaille sur l'atelier mécanique (CLIENT, VEHICULE, INTERVENTION, EMPLOYE, MODELE, MARQUE…). 🏎️

---

## 1. SELECT … FROM … WHERE 🎯

\`\`\`sql
SELECT nom, ville            -- projection : les colonnes voulues (* = toutes)
FROM CLIENT                  -- la table source
WHERE ville = 'Alger';       -- sélection : filtre les lignes
\`\`\`

**Opérateurs de la clause WHERE :**
| Opérateur | Exemple |
|---|---|
| \`=\`, \`<>\`, \`<\`, \`>\`, \`<=\`, \`>=\` | \`WHERE salaire >= 40000\` |
| \`AND\`, \`OR\`, \`NOT\` | \`WHERE ville='Oran' AND salaire>30000\` |
| \`BETWEEN a AND b\` | \`WHERE annee BETWEEN 2018 AND 2022\` |
| \`IN (…)\` | \`WHERE ville IN ('Alger','Oran')\` |
| \`LIKE\` (\`%\` = n caractères, \`_\` = 1) | \`WHERE nom LIKE 'B%'\` (commence par B) |
| \`IS NULL\` / \`IS NOT NULL\` | \`WHERE prenom IS NULL\` |

\`SELECT DISTINCT ville FROM CLIENT;\` → supprime les **doublons**.

---

## 2. ORDER BY — trier ↕️

\`\`\`sql
SELECT nom, salaire FROM EMPLOYE
ORDER BY salaire DESC;        -- du plus grand au plus petit (ASC par défaut)
\`\`\`
On peut trier sur plusieurs colonnes : \`ORDER BY ville ASC, nom ASC\`.

---

## 3. Les jointures 🔗

Combiner plusieurs tables via leurs clés. **INNER JOIN** ne garde que les lignes qui **matchent des deux côtés** :

\`\`\`sql
-- chaque véhicule avec le nom de son client
SELECT v.immatriculation, c.nom
FROM VEHICULE v
INNER JOIN CLIENT c ON v.id_client = c.id_client;
\`\`\`
(les **alias** \`v\` et \`c\` évitent de réécrire les noms de tables.)

**Jointures externes** (gardent les lignes non appariées) :
\`\`\`
 A LEFT JOIN B   : toutes les lignes de A (+ B si match, sinon NULL)
 A RIGHT JOIN B  : toutes les lignes de B
 A FULL JOIN B   : toutes les lignes des deux
\`\`\`
\`\`\`sql
-- tous les clients, MÊME ceux sans véhicule (colonnes véhicule = NULL)
SELECT c.nom, v.immatriculation
FROM CLIENT c
LEFT JOIN VEHICULE v ON v.id_client = c.id_client;
\`\`\`

On enchaîne les jointures pour traverser plusieurs tables : VEHICULE → MODELE → MARQUE.

---

## 4. Les fonctions d'agrégation 🧮

Elles **résument** un ensemble de lignes en une valeur :

| Fonction | Rôle |
|---|---|
| \`COUNT(*)\` | nombre de lignes |
| \`SUM(col)\` | somme |
| \`AVG(col)\` | moyenne |
| \`MIN(col)\` / \`MAX(col)\` | minimum / maximum |

\`\`\`sql
SELECT COUNT(*) AS nb_clients FROM CLIENT;
SELECT AVG(salaire) AS salaire_moyen FROM EMPLOYE;
\`\`\`

---

## 5. GROUP BY … HAVING — agréger par groupe 📊

**GROUP BY** applique l'agrégation **par paquet** :

\`\`\`sql
-- nombre de véhicules PAR client
SELECT id_client, COUNT(*) AS nb
FROM VEHICULE
GROUP BY id_client;
\`\`\`

**HAVING** filtre **les groupes** (là où WHERE filtre les lignes) :
\`\`\`sql
-- les clients ayant PLUS DE 2 véhicules
SELECT id_client, COUNT(*) AS nb
FROM VEHICULE
GROUP BY id_client
HAVING COUNT(*) > 2;
\`\`\`

> 🧠 **Règle d'or** : toute colonne du \`SELECT\` qui n'est pas dans une fonction d'agrégation **doit** figurer dans le \`GROUP BY\`. Et **WHERE** filtre **avant** le regroupement, **HAVING** filtre **après**.

---

## 6. Les sous-requêtes 🪆

Une requête **dans** une requête.

**Imbriquée (non corrélée)** — la sous-requête se calcule **une fois** :
\`\`\`sql
-- les employés qui gagnent plus que la moyenne
SELECT nom, salaire FROM EMPLOYE
WHERE salaire > (SELECT AVG(salaire) FROM EMPLOYE);
\`\`\`

**Avec IN** — comparer à un ensemble :
\`\`\`sql
-- les clients qui possèdent au moins un véhicule
SELECT nom FROM CLIENT
WHERE id_client IN (SELECT id_client FROM VEHICULE);
\`\`\`

**Corrélée** — la sous-requête référence la requête externe (recalculée **par ligne**) :
\`\`\`sql
-- les véhicules dont le coût d'intervention dépasse la moyenne DE CE véhicule
SELECT i.id_intervention, i.cout
FROM INTERVENTION i
WHERE i.cout > (SELECT AVG(i2.cout) FROM INTERVENTION i2
                WHERE i2.id_vehicule = i.id_vehicule);
\`\`\`

### Jointure ou sous-requête ? 🤔

Souvent, on peut faire **les deux**. Ex. « les clients ayant un véhicule » :
- **Sous-requête IN** : lisible, mais peut être moins efficace.
- **Jointure (+ DISTINCT)** : \`SELECT DISTINCT c.nom FROM CLIENT c JOIN VEHICULE v ON …\` — souvent plus rapide et permet d'afficher des colonnes des deux tables.

En général : si tu as besoin de **colonnes des deux tables** → **jointure** ; si tu ne veux que **tester l'existence/appartenance** → **sous-requête (IN/EXISTS)**.

---

## 🧠 Ce qu'il faut retenir

- \`SELECT colonnes FROM table WHERE condition ORDER BY …\` ; \`DISTINCT\` retire les doublons.
- WHERE : \`=\`, \`AND/OR\`, \`BETWEEN\`, \`IN\`, \`LIKE\` (\`%\`/\`_\`), \`IS NULL\`.
- **Jointures** : \`INNER JOIN\` (intersection), \`LEFT/RIGHT/FULL OUTER JOIN\` (garde les non-appariés, NULL) ; utilise des **alias**.
- **Agrégats** : \`COUNT/SUM/AVG/MIN/MAX\` ; **GROUP BY** agrège par paquet ; **HAVING** filtre les **groupes** (WHERE filtre les **lignes**).
- **Sous-requêtes** : imbriquée (calculée une fois), corrélée (par ligne, référence l'externe) ; jointure si on veut des colonnes des deux tables, sous-requête pour un test d'appartenance.

## ⚠️ Erreurs fréquentes des débutants

**1. Colonne hors agrégat absente du GROUP BY.** \`SELECT id_client, COUNT(*) … GROUP BY\` **doit** contenir \`id_client\` → sinon **ORA-00979: not a GROUP BY expression**.

**2. Mettre un agrégat dans WHERE.** \`WHERE COUNT(*) > 2\` est interdit : les agrégats se filtrent avec **HAVING** (après le GROUP BY).

**3. Confondre INNER et LEFT JOIN.** \`INNER\` **perd** les clients sans véhicule ; \`LEFT JOIN\` les **garde** (colonnes véhicule à NULL).

**4. Oublier DISTINCT avec une jointure.** Joindre CLIENT et VEHICULE peut **dupliquer** un client (un par véhicule) ; \`DISTINCT\` corrige quand on ne veut que la liste des clients.

**5. \`= (sous-requête)\` qui renvoie plusieurs lignes.** \`WHERE x = (SELECT …)\` exige **une seule** valeur ; s'il y en a plusieurs → **ORA-01427: single-row subquery returns more than one row**. Utilise **IN** à la place.`,
    badge: {
      id: "badge-query-master",
      name: "Query Master",
      icon: "Database",
      description: "Interroge une base : SELECT, jointures, agrégations GROUP BY/HAVING et sous-requêtes.",
    },
    challenges: [
      {
        id: "bdd-dql-where",
        title: "Filtrer avec WHERE",
        order: 1,
        difficulty: "easy",
        type: "code",
        language: "sql",
        prompt: `## 🎯 SELECT + WHERE

Affiche le **nom** et la **ville** de tous les clients habitant **'Alger'**.`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "SELECT nom, ville FROM CLIENT WHERE ville = 'Alger';", cost: 15 },
          { text: "📖 Correction : SELECT nom, ville FROM CLIENT WHERE ville = 'Alger';", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Sélectionne nom et ville", pattern: "select\\s+nom\\s*,\\s*ville", flags: "i" },
            { label: "Depuis CLIENT", pattern: "from\\s+client", flags: "i" },
            { label: "Filtre ville = Alger", pattern: "where\\s+ville\\s*=\\s*'Alger'", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT nom, ville FROM CLIENT WHERE ville = 'Alger';
\`\`\`
\`SELECT nom, ville\` = **projection** (les colonnes), \`WHERE ville = 'Alger'\` = **sélection** (les lignes). Chaîne entre **apostrophes simples**. Pour toutes les colonnes : \`SELECT *\`.`,
        tags: ["dql", "select", "where"],
      },
      {
        id: "bdd-dql-like",
        title: "Recherche avec LIKE",
        order: 2,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 🔤 LIKE

Affiche tous les clients (\`SELECT *\`) dont le **nom commence par la lettre B**.`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "LIKE 'B%' : % remplace n'importe quelle suite de caractères.", cost: 15 },
          { text: "📖 Correction : SELECT * FROM CLIENT WHERE nom LIKE 'B%';", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "SELECT * FROM CLIENT", pattern: "select\\s+\\*\\s+from\\s+client", flags: "i" },
            { label: "Utilise LIKE", pattern: "like", flags: "i" },
            { label: "Motif commençant par B", pattern: "'B%'", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT * FROM CLIENT WHERE nom LIKE 'B%';
\`\`\`
\`LIKE\` fait de la recherche par **motif** : **\`%\`** remplace **n'importe quelle suite** de caractères (\`'B%'\` = commence par B), **\`_\`** remplace **un seul** caractère. \`'%son'\` = finit par « son », \`'%car%'\` = contient « car ».`,
        tags: ["dql", "like", "motif"],
      },
      {
        id: "bdd-dql-orderby",
        title: "Trier les salaires",
        order: 3,
        difficulty: "easy",
        type: "code",
        language: "sql",
        prompt: `## ↕️ ORDER BY

Affiche le **nom** et le **salaire** de tous les employés, triés du **salaire le plus élevé au plus bas**.`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "ORDER BY salaire DESC (DESC = décroissant).", cost: 15 },
          { text: "📖 Correction : SELECT nom, salaire FROM EMPLOYE ORDER BY salaire DESC;", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Sélectionne nom et salaire", pattern: "select\\s+nom\\s*,\\s*salaire", flags: "i" },
            { label: "Depuis EMPLOYE", pattern: "from\\s+employe", flags: "i" },
            { label: "Trie par salaire décroissant", pattern: "order\\s+by\\s+salaire\\s+desc", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT nom, salaire FROM EMPLOYE ORDER BY salaire DESC;
\`\`\`
\`ORDER BY salaire DESC\` trie du plus grand au plus petit (**DESC** = décroissant ; **ASC** = croissant, la valeur par défaut). On peut trier sur plusieurs colonnes : \`ORDER BY ville ASC, salaire DESC\`.`,
        tags: ["dql", "order-by", "tri"],
      },
      {
        id: "bdd-dql-innerjoin",
        title: "Jointure véhicule ↔ client",
        order: 4,
        difficulty: "hard",
        type: "code",
        language: "sql",
        prompt: `## 🔗 INNER JOIN

Affiche l'**immatriculation** de chaque véhicule avec le **nom** de son client. Joins VEHICULE et CLIENT sur \`id_client\`.`,
        points: 250,
        timeLimitSec: 480,
        starter: ``,
        hints: [
          { text: "FROM VEHICULE v JOIN CLIENT c ON v.id_client = c.id_client", cost: 25 },
          { text: "📖 Correction :\n```\nSELECT v.immatriculation, c.nom\nFROM VEHICULE v\nJOIN CLIENT c ON v.id_client = c.id_client;\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Sélectionne immatriculation et nom", pattern: "select\\s+.*immatriculation.*nom", flags: "i" },
            { label: "Jointure entre VEHICULE et CLIENT", pattern: "from\\s+vehicule.*join\\s+client", flags: "is" },
            { label: "Condition de jointure sur id_client", pattern: "on\\s+\\w*\\.?id_client\\s*=\\s*\\w*\\.?id_client", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT v.immatriculation, c.nom
FROM VEHICULE v
JOIN CLIENT c ON v.id_client = c.id_client;
\`\`\`
La **jointure** relie les deux tables via la clé \`id_client\`. Les **alias** \`v\` et \`c\` allègent l'écriture (\`v.immatriculation\`). \`JOIN\` = \`INNER JOIN\` : seuls les véhicules **ayant** un client (et réciproquement) apparaissent. Un véhicule sans client valide serait exclu.`,
        tags: ["dql", "join", "inner-join"],
      },
      {
        id: "bdd-dql-leftjoin",
        title: "Tous les clients, même sans véhicule",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "sql",
        prompt: `## 🔗 LEFT JOIN

Affiche le **nom** de **tous** les clients et, s'il existe, l'**immatriculation** de leurs véhicules — **y compris les clients qui n'ont aucun véhicule** (immatriculation à NULL pour eux).`,
        points: 250,
        timeLimitSec: 480,
        starter: ``,
        hints: [
          { text: "CLIENT LEFT JOIN VEHICULE : garde TOUS les clients (côté gauche).", cost: 25 },
          { text: "📖 Correction :\n```\nSELECT c.nom, v.immatriculation\nFROM CLIENT c\nLEFT JOIN VEHICULE v ON v.id_client = c.id_client;\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Part de CLIENT (côté gauche)", pattern: "from\\s+client", flags: "i" },
            { label: "Utilise LEFT JOIN sur VEHICULE", pattern: "left\\s+(outer\\s+)?join\\s+vehicule", flags: "i" },
            { label: "Condition sur id_client", pattern: "on\\s+\\w*\\.?id_client\\s*=\\s*\\w*\\.?id_client", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT c.nom, v.immatriculation
FROM CLIENT c
LEFT JOIN VEHICULE v ON v.id_client = c.id_client;
\`\`\`
Le **LEFT JOIN** garde **toutes** les lignes de la table de **gauche** (CLIENT), même celles sans correspondance à droite : pour un client sans véhicule, \`immatriculation\` vaut **NULL**. Un \`INNER JOIN\` aurait **exclu** ces clients. C'est LA différence à maîtriser.`,
        tags: ["dql", "left-join", "outer-join"],
      },
      {
        id: "bdd-dql-count",
        title: "Compter les clients",
        order: 6,
        difficulty: "easy",
        type: "code",
        language: "sql",
        prompt: `## 🧮 COUNT

Affiche le **nombre total de clients** dans la table CLIENT (renomme la colonne résultat en \`nb_clients\`).`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "SELECT COUNT(*) AS nb_clients FROM CLIENT;", cost: 15 },
          { text: "📖 Correction : SELECT COUNT(*) AS nb_clients FROM CLIENT;", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Utilise COUNT(*)", pattern: "count\\s*\\(\\s*\\*\\s*\\)", flags: "i" },
            { label: "Alias nb_clients", pattern: "as\\s+nb_clients", flags: "i" },
            { label: "Depuis CLIENT", pattern: "from\\s+client", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT COUNT(*) AS nb_clients FROM CLIENT;
\`\`\`
\`COUNT(*)\` compte les **lignes**. \`AS nb_clients\` renomme la colonne du résultat (alias). Variantes : \`COUNT(prenom)\` ne compte que les lignes où \`prenom\` **n'est pas NULL** ; \`COUNT(DISTINCT ville)\` compte les villes distinctes.`,
        tags: ["dql", "count", "agregation"],
      },
      {
        id: "bdd-dql-groupby",
        title: "Véhicules par client",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "sql",
        prompt: `## 📊 GROUP BY

Pour **chaque client**, affiche son \`id_client\` et le **nombre de véhicules** qu'il possède (colonne \`nb\`). Groupe par client.`,
        points: 250,
        timeLimitSec: 480,
        starter: ``,
        hints: [
          { text: "SELECT id_client, COUNT(*) AS nb FROM VEHICULE GROUP BY id_client;", cost: 25 },
          { text: "📖 Correction :\n```\nSELECT id_client, COUNT(*) AS nb\nFROM VEHICULE\nGROUP BY id_client;\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Sélectionne id_client et COUNT", pattern: "select\\s+id_client\\s*,\\s*count\\s*\\(\\s*\\*\\s*\\)", flags: "i" },
            { label: "Depuis VEHICULE", pattern: "from\\s+vehicule", flags: "i" },
            { label: "Groupe par id_client", pattern: "group\\s+by\\s+id_client", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT id_client, COUNT(*) AS nb
FROM VEHICULE
GROUP BY id_client;
\`\`\`
\`GROUP BY id_client\` forme **un paquet par client** ; \`COUNT(*)\` compte les véhicules **de chaque paquet**. **Règle d'or** : \`id_client\` est dans le SELECT **et** dans le GROUP BY (toute colonne non-agrégée doit y être) — sinon **ORA-00979**.`,
        tags: ["dql", "group-by", "count"],
      },
      {
        id: "bdd-dql-having",
        title: "Clients à plus de 2 véhicules",
        order: 8,
        difficulty: "hard",
        type: "code",
        language: "sql",
        prompt: `## 📊 HAVING

Affiche les \`id_client\` qui possèdent **strictement plus de 2 véhicules**, avec leur nombre de véhicules (\`nb\`). Filtre bien **les groupes**.`,
        points: 300,
        timeLimitSec: 540,
        starter: ``,
        hints: [
          { text: "Filtrer un agrégat = HAVING (pas WHERE). HAVING COUNT(*) > 2.", cost: 30 },
          { text: "📖 Correction :\n```\nSELECT id_client, COUNT(*) AS nb\nFROM VEHICULE\nGROUP BY id_client\nHAVING COUNT(*) > 2;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Groupe par id_client", pattern: "group\\s+by\\s+id_client", flags: "i" },
            { label: "Filtre les groupes avec HAVING", pattern: "having\\s+count\\s*\\(\\s*\\*\\s*\\)\\s*>\\s*2", flags: "i" },
            { label: "Depuis VEHICULE", pattern: "from\\s+vehicule", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT id_client, COUNT(*) AS nb
FROM VEHICULE
GROUP BY id_client
HAVING COUNT(*) > 2;
\`\`\`
**\`HAVING\`** filtre **les groupes** (après agrégation), là où **\`WHERE\`** filtre **les lignes** (avant). On **ne peut pas** écrire \`WHERE COUNT(*) > 2\` — l'agrégat n'existe qu'après le GROUP BY. Ordre logique : FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.`,
        tags: ["dql", "having", "group-by"],
      },
      {
        id: "bdd-dql-subquery",
        title: "Au-dessus de la moyenne",
        order: 9,
        difficulty: "hard",
        type: "code",
        language: "sql",
        prompt: `## 🪆 Sous-requête

Affiche le **nom** et le **salaire** des employés qui gagnent **plus que le salaire moyen** de tous les employés. Utilise une **sous-requête**.`,
        points: 300,
        timeLimitSec: 540,
        starter: ``,
        hints: [
          { text: "WHERE salaire > (SELECT AVG(salaire) FROM EMPLOYE)", cost: 30 },
          { text: "📖 Correction :\n```\nSELECT nom, salaire FROM EMPLOYE\nWHERE salaire > (SELECT AVG(salaire) FROM EMPLOYE);\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Sélectionne nom et salaire d'EMPLOYE", pattern: "select\\s+nom\\s*,\\s*salaire\\s+from\\s+employe", flags: "i" },
            { label: "Compare au résultat d'une sous-requête", pattern: "where\\s+salaire\\s*>\\s*\\(\\s*select", flags: "i" },
            { label: "La sous-requête calcule AVG(salaire)", pattern: "avg\\s*\\(\\s*salaire\\s*\\)", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT nom, salaire FROM EMPLOYE
WHERE salaire > (SELECT AVG(salaire) FROM EMPLOYE);
\`\`\`
La **sous-requête** \`(SELECT AVG(salaire) FROM EMPLOYE)\` calcule **une seule** valeur (la moyenne), utilisée dans le \`WHERE\`. On ne peut pas écrire \`WHERE salaire > AVG(salaire)\` directement (agrégat interdit dans WHERE). Comme elle renvoie **une** valeur, l'opérateur \`>\` convient ; si elle renvoyait plusieurs lignes, il faudrait **IN** (sinon ORA-01427).`,
        tags: ["dql", "sous-requete", "avg"],
      },
      {
        id: "bdd-dql-in-subquery",
        title: "Clients possédant un véhicule",
        order: 10,
        difficulty: "hard",
        type: "code",
        language: "sql",
        prompt: `## 🪆 Sous-requête avec IN

Affiche le **nom** des clients qui possèdent **au moins un véhicule**, en utilisant une **sous-requête avec IN** (sur la table VEHICULE).`,
        points: 300,
        timeLimitSec: 540,
        starter: ``,
        hints: [
          { text: "WHERE id_client IN (SELECT id_client FROM VEHICULE)", cost: 30 },
          { text: "📖 Correction :\n```\nSELECT nom FROM CLIENT\nWHERE id_client IN (SELECT id_client FROM VEHICULE);\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Sélectionne nom depuis CLIENT", pattern: "select\\s+nom\\s+from\\s+client", flags: "i" },
            { label: "Teste l'appartenance avec IN", pattern: "where\\s+id_client\\s+in\\s*\\(\\s*select", flags: "i" },
            { label: "La sous-requête liste les id_client de VEHICULE", pattern: "select\\s+id_client\\s+from\\s+vehicule", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT nom FROM CLIENT
WHERE id_client IN (SELECT id_client FROM VEHICULE);
\`\`\`
La sous-requête \`(SELECT id_client FROM VEHICULE)\` renvoie **l'ensemble** des clients qui ont un véhicule ; \`IN\` teste l'**appartenance**. Alternative en **jointure** : \`SELECT DISTINCT c.nom FROM CLIENT c JOIN VEHICULE v ON v.id_client = c.id_client;\`. La sous-requête est idéale ici car on ne veut **que** tester l'existence (pas afficher de colonnes du véhicule).`,
        tags: ["dql", "sous-requete", "in"],
      },
      {
        id: "bdd-dql-groupby-error",
        title: "Comprendre ORA-00979",
        order: 11,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🐞 Erreur d'agrégation

\`SELECT id_client, ville, COUNT(*) FROM VEHICULE GROUP BY id_client;\` renvoie **ORA-00979: not a GROUP BY expression**. Pourquoi ? *(NB : ville n'existe pas dans VEHICULE, imaginons une colonne non agrégée oubliée du GROUP BY.)*`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "Toute colonne du SELECT hors agrégat doit être dans le GROUP BY.", cost: 20 },
          { text: "📖 Correction : une colonne non agrégée du SELECT manque dans le GROUP BY.", cost: 50 },
        ],
        options: [
          "Une colonne du SELECT qui n'est pas dans une fonction d'agrégation doit figurer dans le GROUP BY",
          "COUNT(*) est interdit avec GROUP BY",
          "GROUP BY ne peut porter que sur une colonne texte",
          "Il faut remplacer GROUP BY par WHERE",
        ],
        answer: 0,
        explanation: `**ORA-00979** signale qu'une colonne du \`SELECT\` **hors agrégat** ne figure **pas** dans le \`GROUP BY\`. Règle : chaque colonne non agrégée du SELECT **doit** être dans le GROUP BY. Solution : soit l'ajouter au GROUP BY, soit la mettre dans un agrégat (\`MAX(...)\`), soit la retirer du SELECT.`,
        tags: ["dql", "ORA-00979", "group-by", "erreur"],
      },
    ],
  },
];
