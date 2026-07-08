import type { CourseSeed } from "../../../types";

/** Base de données — Module 4 : SQL DDL (CREATE/ALTER/DROP, contraintes). TP Oracle N°1. */
export const ddl: CourseSeed[] = [
  {
    slug: "bdd-ddl",
    title: "SQL DDL — créer et structurer les tables",
    checkpoint: "base-de-donnees",
    codename: "Table Forge",
    domain: "BDD — SQL DDL",
    theme: "vault",
    icon: "Database",
    accent: "#93B896",
    order: 4,
    difficulty: "medium",
    summary:
      "On construit le schéma de l'atelier pour de vrai. Types de données Oracle, CREATE TABLE avec contraintes (PRIMARY KEY, FOREIGN KEY, NOT NULL, CHECK, UNIQUE, DEFAULT), ALTER TABLE (ajouter/modifier colonnes et contraintes) et DROP. Chaque défi = du SQL DDL à écrire.",
    objectives: [
      "Choisir les bons types de données Oracle (NUMBER, VARCHAR2, DATE, CHAR)",
      "Écrire un CREATE TABLE complet avec ses contraintes",
      "Poser une PRIMARY KEY, une FOREIGN KEY, NOT NULL, CHECK, UNIQUE, DEFAULT",
      "Modifier une table existante avec ALTER TABLE (ADD/MODIFY, contraintes)",
      "Supprimer une table (DROP TABLE) et gérer les dépendances",
    ],
    lesson: `# 🛠️ SQL DDL — Table Forge

Le **DDL** (*Data Definition Language*) sert à **définir la structure** : créer, modifier, supprimer des tables et leurs contraintes. On y forge le schéma de l'**atelier mécanique** qui servira à tout le reste du checkpoint. 🏎️

> ✍️ À partir d'ici, chaque défi est du **vrai SQL** : écris-le dans l'éditeur (teste-le dans Oracle SQL Developer).

---

## 1. Les types de données Oracle 🔤

| Type | Usage |
|---|---|
| \`NUMBER(p, s)\` | nombres ; \`p\` chiffres, \`s\` décimales. \`NUMBER(8,2)\` = jusqu'à 999999.99 |
| \`VARCHAR2(n)\` | chaîne **variable** jusqu'à \`n\` caractères (le type texte standard d'Oracle) |
| \`CHAR(n)\` | chaîne **fixe** de \`n\` caractères (complétée par des espaces) |
| \`DATE\` | date + heure |
| \`INTEGER\` | entier (synonyme de \`NUMBER(38)\`) |

> 💡 En Oracle, on utilise \`VARCHAR2\` (et non \`VARCHAR\`) pour le texte.

---

## 2. CREATE TABLE + contraintes 🏗️

Les **contraintes** garantissent l'**intégrité** des données :

| Contrainte | Rôle |
|---|---|
| \`PRIMARY KEY\` | identifiant **unique** et non nul de la table |
| \`FOREIGN KEY … REFERENCES\` | valeur qui doit exister dans une autre table (intégrité référentielle) |
| \`NOT NULL\` | valeur **obligatoire** |
| \`UNIQUE\` | valeurs **distinctes** (sans être la clé primaire) |
| \`CHECK (condition)\` | règle métier (ex. \`salaire > 0\`) |
| \`DEFAULT valeur\` | valeur par défaut si non fournie |

**Exemple — la table CLIENT :**
\`\`\`sql
CREATE TABLE CLIENT (
  id_client   NUMBER        PRIMARY KEY,
  nom         VARCHAR2(50)  NOT NULL,
  prenom      VARCHAR2(50),
  ville       VARCHAR2(40)  DEFAULT 'Alger',
  telephone   VARCHAR2(20)  UNIQUE
);
\`\`\`

**Exemple avec CHECK et FOREIGN KEY — EMPLOYE et MODELE :**
\`\`\`sql
CREATE TABLE EMPLOYE (
  id_employe     NUMBER        PRIMARY KEY,
  nom            VARCHAR2(50)  NOT NULL,
  poste          VARCHAR2(30),
  salaire        NUMBER(8,2)   CHECK (salaire > 0),
  date_embauche  DATE
);

CREATE TABLE MODELE (
  id_modele  NUMBER        PRIMARY KEY,
  libelle    VARCHAR2(50)  NOT NULL,
  id_marque  NUMBER,
  CONSTRAINT fk_modele_marque FOREIGN KEY (id_marque) REFERENCES MARQUE(id_marque)
);
\`\`\`

> 🧠 On peut **nommer** ses contraintes (\`CONSTRAINT fk_modele_marque …\`) : très utile pour les modifier/supprimer ensuite, et pour lire les messages d'erreur.

---

## 3. La clé primaire composée 🔐🔐

Pour la table de jonction **INTERVENANT**, la clé est le **couple** :
\`\`\`sql
CREATE TABLE INTERVENANT (
  id_intervention NUMBER,
  id_employe      NUMBER,
  CONSTRAINT pk_intervenant PRIMARY KEY (id_intervention, id_employe),
  CONSTRAINT fk_int  FOREIGN KEY (id_intervention) REFERENCES INTERVENTION(id_intervention),
  CONSTRAINT fk_emp  FOREIGN KEY (id_employe)      REFERENCES EMPLOYE(id_employe)
);
\`\`\`

---

## 4. ALTER TABLE — faire évoluer une table 🔧

On modifie une table **sans la recréer** :

\`\`\`sql
-- ajouter une colonne
ALTER TABLE CLIENT ADD (email VARCHAR2(80));

-- modifier le type / la longueur d'une colonne
ALTER TABLE CLIENT MODIFY (ville VARCHAR2(60));

-- ajouter une contrainte à une table existante
ALTER TABLE VEHICULE ADD CONSTRAINT fk_veh_client
  FOREIGN KEY (id_client) REFERENCES CLIENT(id_client);

-- supprimer une contrainte (par son nom)
ALTER TABLE VEHICULE DROP CONSTRAINT fk_veh_client;

-- supprimer une colonne
ALTER TABLE CLIENT DROP COLUMN email;
\`\`\`

> ⚠️ On **ne peut pas** réduire la longueur d'une colonne (\`MODIFY ville VARCHAR2(10)\`) si des données existantes dépassent la nouvelle taille → Oracle refuse.

---

## 5. DROP TABLE — supprimer 🗑️

\`\`\`sql
DROP TABLE INTERVENANT;                    -- supprime la table et ses données
DROP TABLE CLIENT CASCADE CONSTRAINTS;     -- + supprime les FK qui la référencent
\`\`\`

> ⚠️ Impossible de supprimer une table **référencée** par une clé étrangère sans traiter la dépendance (\`CASCADE CONSTRAINTS\`) → sinon **ORA-02449**. Ordre de création : les tables **référencées** (MARQUE, CLIENT, EMPLOYE, INTERVENTION) **avant** celles qui les référencent (MODELE, VEHICULE, INTERVENANT).

---

## 🧠 Ce qu'il faut retenir

- **DDL** = structure : \`CREATE\`, \`ALTER\`, \`DROP\`. Types Oracle : \`NUMBER(p,s)\`, \`VARCHAR2(n)\`, \`DATE\`, \`CHAR(n)\`.
- Contraintes : \`PRIMARY KEY\` (identifiant), \`FOREIGN KEY … REFERENCES\` (intégrité référentielle), \`NOT NULL\`, \`UNIQUE\`, \`CHECK\`, \`DEFAULT\`.
- Clé **composée** dans la table de jonction : \`PRIMARY KEY (colA, colB)\`.
- \`ALTER TABLE … ADD/MODIFY (…)\` (colonnes), \`ADD/DROP CONSTRAINT\` (contraintes).
- Créer les tables **référencées avant** celles qui les référencent ; \`DROP … CASCADE CONSTRAINTS\` pour les dépendances.

## ⚠️ Erreurs fréquentes des débutants (dont vraies erreurs Oracle)

**1. \`VARCHAR\` au lieu de \`VARCHAR2\`.** En Oracle, le type texte est **\`VARCHAR2\`**.

**2. Créer une FK vers une table pas encore créée.** Crée d'abord la table **référencée** (MARQUE) puis la table **référençante** (MODELE), sinon **ORA-00942: table or view does not exist**.

**3. Réduire une colonne pleine.** \`MODIFY ville VARCHAR2(5)\` échoue s'il existe des villes plus longues → erreur. Agrandir est possible, réduire non (si données incompatibles).

**4. Oublier de nommer ses contraintes.** Sans nom, Oracle en génère un cryptique (\`SYS_C00…\`) difficile à cibler pour un \`DROP CONSTRAINT\`.

**5. \`DROP TABLE\` d'une table référencée.** → **ORA-02449: unique/primary keys referenced by foreign keys**. Utilise \`CASCADE CONSTRAINTS\` ou supprime d'abord les tables filles.`,
    badge: {
      id: "badge-table-forge",
      name: "Table Forge",
      icon: "Database",
      description: "Crée et fait évoluer des tables SQL avec toutes les contraintes (PK, FK, CHECK, NOT NULL…).",
    },
    challenges: [
      {
        id: "bdd-ddl-create-client",
        title: "Créer la table CLIENT",
        order: 1,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 🏗️ CREATE TABLE

Crée la table **CLIENT** avec :
- \`id_client\` : entier, **clé primaire**
- \`nom\` : chaîne jusqu'à 50 caractères, **obligatoire**
- \`prenom\` : chaîne jusqu'à 50 caractères
- \`ville\` : chaîne jusqu'à 40 caractères

Écris l'instruction \`CREATE TABLE\` complète.`,
        points: 200,
        timeLimitSec: 480,
        starter: `CREATE TABLE CLIENT (
`,
        hints: [
          { text: "id_client NUMBER PRIMARY KEY, nom VARCHAR2(50) NOT NULL, prenom VARCHAR2(50), ville VARCHAR2(40).", cost: 20 },
          { text: "📖 Correction :\n```\nCREATE TABLE CLIENT (\n  id_client NUMBER PRIMARY KEY,\n  nom VARCHAR2(50) NOT NULL,\n  prenom VARCHAR2(50),\n  ville VARCHAR2(40)\n);\n```", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "CREATE TABLE CLIENT", pattern: "create\\s+table\\s+client", flags: "i" },
            { label: "id_client en clé primaire", pattern: "id_client\\s+number\\s+primary\\s+key", flags: "i" },
            { label: "nom VARCHAR2(50) NOT NULL", pattern: "nom\\s+varchar2\\s*\\(\\s*50\\s*\\)\\s+not\\s+null", flags: "i" },
            { label: "ville en VARCHAR2(40)", pattern: "ville\\s+varchar2\\s*\\(\\s*40\\s*\\)", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
CREATE TABLE CLIENT (
  id_client  NUMBER        PRIMARY KEY,
  nom        VARCHAR2(50)  NOT NULL,
  prenom     VARCHAR2(50),
  ville      VARCHAR2(40)
);
\`\`\`
\`NUMBER\` pour l'entier, \`VARCHAR2(n)\` pour le texte variable (jamais \`VARCHAR\` en Oracle). \`PRIMARY KEY\` rend \`id_client\` **unique et non nul**. \`NOT NULL\` sur \`nom\` le rend **obligatoire**. \`prenom\` et \`ville\` acceptent NULL (facultatifs).`,
        tags: ["ddl", "create-table", "sql"],
      },
      {
        id: "bdd-ddl-check",
        title: "Contrainte CHECK sur le salaire",
        order: 2,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## ✅ CHECK

Crée la table **EMPLOYE** avec \`id_employe\` (clé primaire), \`nom\` (VARCHAR2(50), obligatoire) et \`salaire\` (NUMBER(8,2)) avec une **contrainte CHECK** garantissant que le salaire est **strictement positif**.`,
        points: 250,
        timeLimitSec: 480,
        starter: `CREATE TABLE EMPLOYE (
`,
        hints: [
          { text: "salaire NUMBER(8,2) CHECK (salaire > 0)", cost: 25 },
          { text: "📖 Correction :\n```\nCREATE TABLE EMPLOYE (\n  id_employe NUMBER PRIMARY KEY,\n  nom VARCHAR2(50) NOT NULL,\n  salaire NUMBER(8,2) CHECK (salaire > 0)\n);\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "CREATE TABLE EMPLOYE", pattern: "create\\s+table\\s+employe", flags: "i" },
            { label: "Clé primaire id_employe", pattern: "id_employe\\s+number\\s+primary\\s+key", flags: "i" },
            { label: "salaire NUMBER(8,2)", pattern: "salaire\\s+number\\s*\\(\\s*8\\s*,\\s*2\\s*\\)", flags: "i" },
            { label: "CHECK salaire > 0", pattern: "check\\s*\\(\\s*salaire\\s*>\\s*0\\s*\\)", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
CREATE TABLE EMPLOYE (
  id_employe NUMBER       PRIMARY KEY,
  nom        VARCHAR2(50) NOT NULL,
  salaire    NUMBER(8,2)  CHECK (salaire > 0)
);
\`\`\`
La contrainte **\`CHECK (salaire > 0)\`** est une **règle métier** : Oracle **refusera** tout INSERT/UPDATE avec un salaire ≤ 0. \`NUMBER(8,2)\` = 8 chiffres dont 2 décimales (max 999 999.99). C'est le SGBD qui garantit l'intégrité, pas l'application.`,
        tags: ["ddl", "check", "contrainte"],
      },
      {
        id: "bdd-ddl-fk",
        title: "Clé étrangère MODELE → MARQUE",
        order: 3,
        difficulty: "hard",
        type: "code",
        language: "sql",
        prompt: `## 🔗 FOREIGN KEY

Crée la table **MODELE** avec \`id_modele\` (clé primaire), \`libelle\` (VARCHAR2(50), obligatoire) et \`id_marque\` (NUMBER) qui est une **clé étrangère** référençant \`MARQUE(id_marque)\`.`,
        points: 250,
        timeLimitSec: 480,
        starter: `CREATE TABLE MODELE (
`,
        hints: [
          { text: "FOREIGN KEY (id_marque) REFERENCES MARQUE(id_marque)", cost: 25 },
          { text: "📖 Correction :\n```\nCREATE TABLE MODELE (\n  id_modele NUMBER PRIMARY KEY,\n  libelle VARCHAR2(50) NOT NULL,\n  id_marque NUMBER,\n  CONSTRAINT fk_modele_marque FOREIGN KEY (id_marque) REFERENCES MARQUE(id_marque)\n);\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "CREATE TABLE MODELE", pattern: "create\\s+table\\s+modele", flags: "i" },
            { label: "Clé primaire id_modele", pattern: "id_modele\\s+number\\s+primary\\s+key", flags: "i" },
            { label: "Déclare une clé étrangère", pattern: "foreign\\s+key\\s*\\(\\s*id_marque\\s*\\)", flags: "i" },
            { label: "Référence MARQUE(id_marque)", pattern: "references\\s+marque\\s*\\(\\s*id_marque\\s*\\)", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
CREATE TABLE MODELE (
  id_modele  NUMBER        PRIMARY KEY,
  libelle    VARCHAR2(50)  NOT NULL,
  id_marque  NUMBER,
  CONSTRAINT fk_modele_marque FOREIGN KEY (id_marque) REFERENCES MARQUE(id_marque)
);
\`\`\`
La **FOREIGN KEY** impose l'**intégrité référentielle** : \`id_marque\` doit correspondre à une marque **existante** (ou être NULL). ⚠️ La table **MARQUE doit exister avant** (sinon **ORA-00942**). Nommer la contrainte (\`fk_modele_marque\`) facilite sa gestion ultérieure.`,
        tags: ["ddl", "foreign-key", "integrite"],
      },
      {
        id: "bdd-ddl-alter-add",
        title: "ALTER TABLE — ajouter une colonne",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 🔧 ALTER ADD

La table CLIENT existe déjà. Ajoute-lui une colonne \`email\` de type VARCHAR2(80).`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "ALTER TABLE <table> ADD (<colonne> <type>);", cost: 15 },
          { text: "📖 Correction : ALTER TABLE CLIENT ADD (email VARCHAR2(80));", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "ALTER TABLE CLIENT", pattern: "alter\\s+table\\s+client", flags: "i" },
            { label: "Ajoute une colonne (ADD)", pattern: "add\\s*\\(?\\s*email", flags: "i" },
            { label: "De type VARCHAR2(80)", pattern: "varchar2\\s*\\(\\s*80\\s*\\)", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
ALTER TABLE CLIENT ADD (email VARCHAR2(80));
\`\`\`
\`ALTER TABLE … ADD\` fait **évoluer** la table sans la recréer ni perdre ses données. La nouvelle colonne \`email\` sera **NULL** pour les lignes existantes. Pour modifier un type/longueur : \`ALTER TABLE CLIENT MODIFY (ville VARCHAR2(60));\`.`,
        tags: ["ddl", "alter-table", "add-column"],
      },
      {
        id: "bdd-ddl-alter-constraint",
        title: "ALTER TABLE — ajouter une FK",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "sql",
        prompt: `## 🔧 ALTER ADD CONSTRAINT

La table VEHICULE existe avec une colonne \`id_client\`. Ajoute (par ALTER) une **contrainte de clé étrangère** nommée \`fk_veh_client\` reliant \`VEHICULE.id_client\` à \`CLIENT(id_client)\`.`,
        points: 250,
        timeLimitSec: 420,
        starter: ``,
        hints: [
          { text: "ALTER TABLE VEHICULE ADD CONSTRAINT <nom> FOREIGN KEY (id_client) REFERENCES CLIENT(id_client);", cost: 25 },
          { text: "📖 Correction : ALTER TABLE VEHICULE ADD CONSTRAINT fk_veh_client FOREIGN KEY (id_client) REFERENCES CLIENT(id_client);", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "ALTER TABLE VEHICULE", pattern: "alter\\s+table\\s+vehicule", flags: "i" },
            { label: "Ajoute une contrainte nommée", pattern: "add\\s+constraint\\s+fk_veh_client", flags: "i" },
            { label: "Clé étrangère sur id_client", pattern: "foreign\\s+key\\s*\\(\\s*id_client\\s*\\)", flags: "i" },
            { label: "Référence CLIENT(id_client)", pattern: "references\\s+client\\s*\\(\\s*id_client\\s*\\)", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
ALTER TABLE VEHICULE ADD CONSTRAINT fk_veh_client
  FOREIGN KEY (id_client) REFERENCES CLIENT(id_client);
\`\`\`
On peut ajouter une **contrainte après coup** avec \`ALTER TABLE … ADD CONSTRAINT\`. La **nommer** (\`fk_veh_client\`) permet ensuite de la supprimer facilement : \`ALTER TABLE VEHICULE DROP CONSTRAINT fk_veh_client;\`. ⚠️ Oracle refusera l'ajout si des \`id_client\` existants ne correspondent à aucun client (intégrité violée).`,
        tags: ["ddl", "alter-table", "foreign-key"],
      },
      {
        id: "bdd-ddl-ora00942",
        title: "Comprendre ORA-00942",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🐞 Erreur Oracle réelle

Tu lances \`CREATE TABLE MODELE (… FOREIGN KEY (id_marque) REFERENCES MARQUE(id_marque));\` et Oracle renvoie **ORA-00942: table or view does not exist**. Pourquoi ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "La FK référence MARQUE… qui doit exister AVANT.", cost: 20 },
          { text: "📖 Correction : la table MARQUE n'a pas encore été créée ; il faut créer les tables référencées d'abord.", cost: 50 },
        ],
        options: [
          "La table MARQUE référencée n'existe pas encore : il faut créer les tables référencées AVANT celles qui les référencent",
          "VARCHAR2 n'existe pas en Oracle",
          "id_marque doit être une chaîne, pas un nombre",
          "Il manque un point-virgule à la fin",
        ],
        answer: 0,
        explanation: `**ORA-00942: table or view does not exist** ici signifie qu'on référence **MARQUE** alors qu'elle **n'a pas encore été créée**. L'ordre de création compte : les tables **référencées** (MARQUE, CLIENT, EMPLOYE, INTERVENTION) doivent exister **avant** les tables qui les référencent (MODELE, VEHICULE, INTERVENANT). Crée MARQUE d'abord, puis MODELE.`,
        tags: ["ddl", "ORA-00942", "erreur-oracle", "ordre-creation"],
      },
    ],
  },
];
