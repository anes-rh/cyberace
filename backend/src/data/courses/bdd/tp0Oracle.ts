import type { CourseSeed } from "../../../types";

const ORACLE_FOLDER = "https://drive.google.com/drive/folders/1tnLstcIHNvVxykSijtoDDD2-Z4JHzBi2";

/** Base de données — Module 2 (TP 0) : installer Oracle. */
export const tp0Oracle: CourseSeed[] = [
  {
    slug: "bdd-tp0-oracle",
    title: "TP 0 — Installer Oracle & se connecter",
    checkpoint: "base-de-donnees",
    codename: "Engine Start",
    domain: "BDD — Environnement",
    theme: "vault",
    icon: "Server",
    accent: "#93B896",
    order: 2,
    difficulty: "easy",
    summary:
      "Ton moteur SQL : installe Oracle Database Express Edition (XE), branche SQL Developer (ou SQL*Plus), connecte-toi en SYSDBA, puis crée ton premier tablespace et ton utilisateur applicatif. À partir de là, tous les TP SQL se font ici.",
    objectives: [
      "Installer Oracle Database XE selon ton OS (Windows / Linux ; macOS via conteneur)",
      "Se connecter en administrateur (SYS as SYSDBA) via SQL*Plus ou SQL Developer",
      "Comprendre l'architecture instance / base / utilisateur (schéma)",
      "Créer un premier tablespace et un utilisateur applicatif",
      "Lancer sa toute première requête SQL",
    ],
    lesson: `# 🔑 TP 0 — Installer Oracle & se connecter — Engine Start

Pour écrire du SQL « pour de vrai », il te faut un moteur. On utilise **Oracle Database Express Edition (XE)** : la version **gratuite** et **allégée** d'Oracle, parfaite pour apprendre en local. 🏎️

> ⬇️ **Télécharge** Oracle XE + SQL Developer via les cartes **en bas de page**.

---

## 1. Choisir la bonne édition & le bon fichier 🧰

| OS | Installeur | Comment |
|---|---|---|
| **Windows** | Oracle XE \`.exe\` (dans un \`.zip\`) | dézippe → \`setup.exe\` → suivre l'assistant |
| **Linux (RHEL/Fedora)** | Oracle XE \`.rpm\` | \`sudo dnf install oracle-database-xe-*.rpm\` |
| **Linux (Debian/Ubuntu)** | via \`alien\` ou conteneur Docker | \`docker run oracle/database:xe\` |
| **macOS** | **pas d'installeur natif** | conteneur **Docker** (image Oracle XE) ou VM Linux |

> 💡 **SQL Developer** (client graphique gratuit, en Java) fonctionne sur **tous** les OS et se connecte à ton Oracle. C'est l'outil le plus confortable pour écrire des requêtes. Alternative en ligne de commande : **SQL\\*Plus** (fourni avec Oracle).

⚠️ Pendant l'installation Windows, l'assistant demande un **mot de passe** pour les comptes administrateurs **SYS** et **SYSTEM** : note-le précieusement, il sert à toutes les connexions admin.

---

## 2. Instance, base, schéma : le vocabulaire Oracle 🏗️

\`\`\`
   Instance Oracle (processus + mémoire)
   └── Base de données (les fichiers)
        ├── SYS / SYSTEM        ← comptes ADMINISTRATEUR (ne pas y créer tes tables)
        └── ATELIER (ton user)  ← ton SCHÉMA applicatif (tes tables à toi)
\`\`\`

- Une **instance** = les processus + la mémoire qui tournent.
- Un **utilisateur** Oracle **=** un **schéma** : ses tables lui appartiennent (\`ATELIER.CLIENT\`).
- **Règle d'or** : on **ne crée jamais** ses tables applicatives dans \`SYS\`/\`SYSTEM\` (comptes système). On crée un **utilisateur dédié**.

---

## 3. Se connecter en administrateur 🔐

**En ligne de commande (SQL\\*Plus) :**
\`\`\`bash
sqlplus sys/TON_MOT_DE_PASSE as sysdba
\`\`\`
\`as sysdba\` = connexion avec les **privilèges d'administration** les plus élevés (créer des utilisateurs, des tablespaces…).

**Avec SQL Developer :** *New Connection* → Username \`sys\`, Role **SYSDBA**, Hostname \`localhost\`, Port \`1521\`, SID/Service \`XE\` (ou \`XEPDB1\` selon la version) → *Test* → *Connect*.

Première requête pour vérifier que tout marche :
\`\`\`sql
SELECT 'Oracle fonctionne !' AS message FROM dual;
\`\`\`
> 🧠 \`DUAL\` est une **table système spéciale** à **une seule ligne**, pratique pour tester une expression ou un calcul sans vraie table : \`SELECT 1 + 1 FROM dual;\`.

---

## 4. Créer ton tablespace et ton utilisateur 📦

Un **tablespace** est un **espace de stockage logique** (où Oracle range physiquement les données). On en crée un pour l'atelier, puis un **utilisateur** qui l'utilisera :

\`\`\`sql
-- Connecté en SYS as SYSDBA :

-- 1) un espace de stockage pour nos données
CREATE TABLESPACE ts_atelier
  DATAFILE 'ts_atelier.dbf' SIZE 100M
  AUTOEXTEND ON;

-- 2) un utilisateur (= un schéma) qui stockera ses tables dans ce tablespace
CREATE USER atelier IDENTIFIED BY atelier123
  DEFAULT TABLESPACE ts_atelier
  QUOTA 50M ON ts_atelier;

-- 3) lui donner le droit de se connecter et de créer des tables
GRANT CREATE SESSION, CREATE TABLE TO atelier;
\`\`\`

Ensuite, on se **reconnecte** en tant que \`atelier\` :
\`\`\`bash
sqlplus atelier/atelier123
\`\`\`
… et on est prêt à créer les tables du schéma « atelier mécanique » (module DDL). 🎉

> ⚠️ Sans \`GRANT CREATE SESSION\`, l'utilisateur **ne peut même pas se connecter** (erreur **ORA-01045**). Sans **quota** sur le tablespace, il ne pourra **rien insérer** (erreur **ORA-01950**). On reverra ces erreurs en détail dans le module Administration.

---

## 🧠 Ce qu'il faut retenir

- **Oracle XE** = édition **gratuite/allégée** pour apprendre en local ; client conseillé : **SQL Developer** (tous OS), sinon **SQL\\*Plus**.
- On choisit l'installeur par OS (Windows \`.exe\`, Linux \`.rpm\`/Docker ; macOS via **Docker**).
- **Instance** (processus+mémoire) → **base** (fichiers) → **utilisateur = schéma** (ses tables).
- Connexion admin : \`sqlplus sys/motdepasse as sysdba\` ; **ne jamais** créer ses tables dans \`SYS\`/\`SYSTEM\`.
- Mise en route : \`CREATE TABLESPACE\` → \`CREATE USER … DEFAULT TABLESPACE … QUOTA\` → \`GRANT CREATE SESSION, CREATE TABLE\`.
- \`DUAL\` = table système à 1 ligne pour tester une expression.

## ⚠️ Erreurs fréquentes des débutants

**1. Créer ses tables dans SYS/SYSTEM.** Ce sont les comptes **système** d'Oracle. Crée **ton** utilisateur applicatif (\`atelier\`) et travaille dedans.

**2. Oublier \`GRANT CREATE SESSION\`.** L'utilisateur ne peut alors **pas se connecter** → **ORA-01045: user lacks CREATE SESSION privilege**.

**3. Oublier le quota sur le tablespace.** L'utilisateur peut créer une table mais **pas y insérer** → **ORA-01950: no privileges on tablespace**.

**4. Se tromper de Service/SID.** Selon la version XE, le service est \`XE\` ou \`XEPDB1\`. Si la connexion échoue, teste l'autre.

**5. Perdre le mot de passe SYS.** Il est demandé à l'installation et sert à toute l'administration. Note-le.`,
    videos: [
      {
        title: "Installer Oracle Database XE + SQL Developer (pas à pas)",
        youtubeId: "wSkVGWfMkxk",
      },
    ],
    resources: [
      {
        label: "Oracle Database XE — Windows (.zip → setup.exe)",
        url: ORACLE_FOLDER,
        kind: "installer",
        os: "win",
        note: "Dézippe puis lance setup.exe. Note le mot de passe SYS/SYSTEM demandé.",
      },
      {
        label: "Oracle Database XE — Linux (.rpm)",
        url: ORACLE_FOLDER,
        kind: "installer",
        os: "linux",
        note: "RHEL/Fedora : sudo dnf install oracle-database-xe-*.rpm. Debian/Ubuntu : conteneur Docker.",
      },
      {
        label: "macOS — via conteneur Docker",
        url: "https://container-registry.oracle.com/",
        kind: "installer",
        os: "mac",
        note: "Pas d'installeur natif macOS : utilise l'image Docker Oracle XE (ou une VM Linux + VirtualBox).",
      },
      {
        label: "Oracle SQL Developer (client graphique, tous OS)",
        url: "https://www.oracle.com/database/sqldeveloper/technologies/download/",
        kind: "link",
        note: "L'outil confortable pour écrire et exécuter des requêtes SQL. Nécessite Java.",
      },
      {
        label: "Dossier d'installation (Drive)",
        url: ORACLE_FOLDER,
        kind: "link",
        note: "Les fichiers d'installation Oracle fournis.",
      },
    ],
    badge: {
      id: "badge-engine-start",
      name: "Engine Start",
      icon: "Server",
      description: "A installé Oracle XE, s'est connecté en SYSDBA et a créé son premier tablespace/utilisateur.",
    },
    challenges: [
      {
        id: "bdd-tp0-edition",
        title: "Quelle édition Oracle ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧰 Pour apprendre en local

Quelle édition d'Oracle Database est **gratuite** et recommandée pour un usage **pédagogique local** ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "XE comme eXpress Edition.", cost: 10 },
          { text: "📖 Correction : Oracle Database XE (Express Edition).", cost: 30 },
        ],
        options: [
          "Oracle Database XE (Express Edition)",
          "Oracle Database Enterprise Edition (payante)",
          "Oracle Cloud Autonomous (facturée à l'usage)",
          "Il n'existe aucune version gratuite d'Oracle",
        ],
        answer: 0,
        explanation: `**Oracle Database XE** (*Express Edition*) est la version **gratuite** et **allégée** d'Oracle, idéale pour apprendre en local (limites de taille/CPU mais largement suffisantes). L'**Enterprise Edition** est payante ; **SQL Developer** est le client graphique gratuit qu'on y branche.`,
        tags: ["oracle", "xe", "install"],
      },
      {
        id: "bdd-tp0-sysdba",
        title: "Se connecter en admin",
        order: 2,
        difficulty: "easy",
        type: "code",
        language: "sql",
        prompt: `## 🔐 Connexion SYSDBA

Écris la commande **SQL\\*Plus** qui connecte l'utilisateur **sys** avec les privilèges d'administration les plus élevés (rôle **SYSDBA**). Utilise le mot de passe \`oracle\`.`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "sqlplus <user>/<mdp> as sysdba", cost: 15 },
          { text: "📖 Correction : sqlplus sys/oracle as sysdba", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Lance sqlplus avec l'utilisateur sys", pattern: "sqlplus\\s+sys/", flags: "i" },
            { label: "Avec le rôle sysdba", pattern: "as\\s+sysdba", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
sqlplus sys/oracle as sysdba
\`\`\`
\`as sysdba\` donne les **privilèges d'administration** maximaux (créer utilisateurs, tablespaces, arrêter/démarrer la base). Le compte \`sys\` est **le** super-administrateur d'Oracle. Dans SQL Developer, on choisit le **rôle SYSDBA** dans la fenêtre de connexion.`,
        tags: ["oracle", "sysdba", "connexion"],
      },
      {
        id: "bdd-tp0-dual",
        title: "La table DUAL",
        order: 3,
        difficulty: "easy",
        type: "code",
        language: "sql",
        prompt: `## 🧪 Première requête

Écris une requête qui **calcule 3 + 4** en utilisant la table système spéciale d'Oracle (celle qui a **une seule ligne** et sert à tester une expression sans vraie table).`,
        points: 100,
        timeLimitSec: 240,
        starter: ``,
        hints: [
          { text: "SELECT <expression> FROM dual;", cost: 10 },
          { text: "📖 Correction : SELECT 3 + 4 FROM dual;", cost: 30 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Sélectionne l'expression 3 + 4", pattern: "select\\s+3\\s*\\+\\s*4", flags: "i" },
            { label: "Depuis la table DUAL", pattern: "from\\s+dual", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
SELECT 3 + 4 FROM dual;   -- renvoie 7
\`\`\`
**\`DUAL\`** est une table système à **une seule ligne et une seule colonne**, propre à Oracle. Elle sert à évaluer une **expression** ou une fonction (\`SELECT SYSDATE FROM dual;\`) quand on n'a pas de table réelle à interroger. Indispensable pour tester rapidement.`,
        tags: ["oracle", "dual", "select"],
      },
      {
        id: "bdd-tp0-createuser",
        title: "Créer l'utilisateur applicatif",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 📦 Ton schéma de travail

Connecté en SYSDBA, crée un utilisateur nommé **atelier**, avec le mot de passe **atelier123**, dont le **tablespace par défaut** est \`ts_atelier\`.`,
        points: 200,
        timeLimitSec: 360,
        starter: ``,
        hints: [
          { text: "CREATE USER <nom> IDENTIFIED BY <mdp> DEFAULT TABLESPACE <ts>;", cost: 20 },
          { text: "📖 Correction : CREATE USER atelier IDENTIFIED BY atelier123 DEFAULT TABLESPACE ts_atelier;", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Crée l'utilisateur atelier", pattern: "create\\s+user\\s+atelier", flags: "i" },
            { label: "Avec le mot de passe atelier123", pattern: "identified\\s+by\\s+atelier123", flags: "i" },
            { label: "Tablespace par défaut ts_atelier", pattern: "default\\s+tablespace\\s+ts_atelier", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
CREATE USER atelier IDENTIFIED BY atelier123
  DEFAULT TABLESPACE ts_atelier
  QUOTA 50M ON ts_atelier;
\`\`\`
\`CREATE USER\` crée un **utilisateur = un schéma**. \`IDENTIFIED BY\` fixe le mot de passe, \`DEFAULT TABLESPACE\` indique **où** ranger ses objets, et \`QUOTA\` l'autorise à y **écrire**. Il faudra ensuite lui donner \`CREATE SESSION\` (se connecter) et \`CREATE TABLE\` — sinon erreurs ORA-01045 / ORA-01031.`,
        tags: ["oracle", "create-user", "tablespace"],
      },
      {
        id: "bdd-tp0-grant",
        title: "Le droit de se connecter",
        order: 5,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 🎟️ Autoriser la connexion

L'utilisateur \`atelier\` existe mais reçoit **ORA-01045: user ATELIER lacks CREATE SESSION privilege** quand il tente de se connecter. Écris la commande (en SYSDBA) qui lui donne le droit de **se connecter** ET de **créer des tables**.`,
        points: 200,
        timeLimitSec: 360,
        starter: ``,
        hints: [
          { text: "GRANT CREATE SESSION, CREATE TABLE TO <user>;", cost: 20 },
          { text: "📖 Correction : GRANT CREATE SESSION, CREATE TABLE TO atelier;", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Utilise GRANT", pattern: "grant", flags: "i" },
            { label: "Le privilège de connexion (CREATE SESSION)", pattern: "create\\s+session", flags: "i" },
            { label: "Le privilège CREATE TABLE", pattern: "create\\s+table", flags: "i" },
            { label: "Attribué à atelier", pattern: "to\\s+atelier", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
GRANT CREATE SESSION, CREATE TABLE TO atelier;
\`\`\`
**\`CREATE SESSION\`** est le privilège **système** qui autorise la **connexion** — sans lui, c'est l'erreur **ORA-01045**. **\`CREATE TABLE\`** autorise à créer des tables (sinon ORA-01031: insufficient privileges). On verra dans le module Administration comment regrouper ces privilèges dans un **rôle** (\`CONNECT\`, \`RESOURCE\`).`,
        tags: ["oracle", "grant", "privileges", "ORA-01045"],
      },
    ],
  },
];
