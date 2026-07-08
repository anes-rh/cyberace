import type { CourseSeed } from "../../../types";

/** Base de données — Module 8 : administration Oracle (privilèges, rôles, quotas). TP Oracle N°2. */
export const oracleAdmin: CourseSeed[] = [
  {
    slug: "bdd-oracle-admin",
    title: "Administration Oracle : privilèges & rôles",
    checkpoint: "base-de-donnees",
    codename: "Access Control",
    domain: "BDD — Administration",
    theme: "vault",
    icon: "Server",
    accent: "#93B896",
    order: 8,
    difficulty: "hard",
    summary:
      "Qui a le droit de faire quoi ? Tablespaces et quotas, privilèges système (CREATE SESSION/TABLE/USER) et objet (GRANT/REVOKE SELECT/UPDATE), rôles pour regrouper les droits — avec les vraies erreurs Oracle (ORA-01045, ORA-00942, ORA-01031, ORA-01950) et leur résolution.",
    objectives: [
      "Distinguer privilèges système et privilèges objet",
      "Accorder/retirer des droits avec GRANT et REVOKE",
      "Gérer les quotas sur un tablespace",
      "Créer et attribuer un rôle pour regrouper des privilèges",
      "Diagnostiquer les erreurs Oracle ORA-01045/00942/01031/01950",
    ],
    lesson: `# 🔐 Administration Oracle — Access Control

Une base multi-utilisateurs se protège par des **droits**. On reprend la progression du TP Oracle : créer un utilisateur, lui donner **juste** ce qu'il faut, et comprendre les erreurs quand un droit manque. 🏎️

---

## 1. Deux familles de privilèges 🗝️

- **Privilèges système** : le droit de faire une **action générale**. Ex. \`CREATE SESSION\` (se connecter), \`CREATE TABLE\`, \`CREATE USER\`, \`CREATE VIEW\`.
- **Privilèges objet** : le droit d'agir sur **un objet précis** (une table, une vue) d'un autre utilisateur. Ex. \`SELECT\`, \`INSERT\`, \`UPDATE\`, \`DELETE\`, \`INDEX\` sur \`atelier.CLIENT\`.

\`\`\`
 GRANT CREATE SESSION TO atelier;               -- système : peut se connecter
 GRANT SELECT, UPDATE ON atelier.CLIENT TO paul; -- objet : paul lit/modifie CLIENT
\`\`\`

---

## 2. GRANT et REVOKE 🎟️

\`\`\`sql
-- accorder
GRANT SELECT, UPDATE ON CLIENT TO paul;
-- accorder AVEC le droit de re-transmettre
GRANT SELECT ON CLIENT TO paul WITH GRANT OPTION;
-- retirer
REVOKE UPDATE ON CLIENT FROM paul;
\`\`\`

- \`WITH GRANT OPTION\` : le bénéficiaire peut à son tour **accorder** ce droit à d'autres.
- \`GRANT … TO PUBLIC\` : à **tout le monde** (à éviter sauf cas précis).

---

## 3. Tablespaces & quotas 📦

Un **utilisateur** doit avoir un **quota** sur un tablespace pour pouvoir y **stocker** des données :

\`\`\`sql
ALTER USER atelier QUOTA 100M ON ts_atelier;   -- 100 Mo autorisés
ALTER USER atelier QUOTA UNLIMITED ON ts_atelier;
\`\`\`

> ⚠️ Sans quota, l'utilisateur peut **créer** une table (s'il a \`CREATE TABLE\`) mais **échoue à insérer** → **ORA-01950: no privileges on tablespace 'TS_ATELIER'**.

---

## 4. Les rôles : regrouper des privilèges 👥

Donner 10 privilèges à 50 utilisateurs = 500 GRANT. Un **rôle** regroupe des privilèges qu'on accorde d'un coup :

\`\`\`sql
CREATE ROLE dev_atelier;
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW TO dev_atelier;  -- on remplit le rôle
GRANT dev_atelier TO paul;                                       -- on donne le rôle
REVOKE dev_atelier FROM paul;                                    -- on le retire d'un coup
\`\`\`

Oracle fournit aussi des rôles prédéfinis : **\`CONNECT\`** (se connecter) et **\`RESOURCE\`** (créer tables, séquences…), pratiques pour démarrer.

---

## 5. Les erreurs Oracle à connaître 🐞 (reprises du TP)

Ces erreurs sont **pédagogiquement précieuses** — elles disent exactement quel droit manque :

| Erreur | Signification | Résolution |
|---|---|---|
| **ORA-01045** | l'utilisateur n'a pas \`CREATE SESSION\` | \`GRANT CREATE SESSION TO user;\` |
| **ORA-01031** | *insufficient privileges* : action interdite | accorder le privilège requis (ex. \`CREATE TABLE\`) |
| **ORA-00942** | *table or view does not exist* : table absente **ou** pas de droit dessus | créer la table / \`GRANT SELECT ON …\` |
| **ORA-01950** | pas de quota sur le tablespace | \`ALTER USER … QUOTA … ON tablespace;\` |

> 🧠 **ORA-00942 piégeuse** : parfois la table **existe** mais **chez un autre utilisateur** et tu n'as **aucun droit** dessus → Oracle fait comme si elle n'existait pas (par sécurité). Il faut un \`GRANT SELECT\` du propriétaire.

---

## 🧠 Ce qu'il faut retenir

- **Privilège système** = action générale (\`CREATE SESSION/TABLE/USER\`) ; **privilège objet** = droit sur une table précise (\`SELECT/UPDATE …\`).
- **\`GRANT priv ON objet TO user\`** / **\`REVOKE …\`** ; \`WITH GRANT OPTION\` = peut re-transmettre.
- Un utilisateur a besoin d'un **quota** sur un tablespace pour y **insérer** (sinon **ORA-01950**).
- Un **rôle** regroupe des privilèges (\`CREATE ROLE\`, on le remplit, on le \`GRANT\`) → gestion à grande échelle ; rôles prédéfinis \`CONNECT\`/\`RESOURCE\`.
- Erreurs clés : **ORA-01045** (pas de CREATE SESSION), **ORA-01031** (privilège manquant), **ORA-00942** (table absente **ou** pas de droit), **ORA-01950** (pas de quota).

## ⚠️ Erreurs fréquentes des débutants (vraies erreurs Oracle du TP)

**1. Créer un user sans \`CREATE SESSION\`.** Il ne peut pas se connecter → **ORA-01045**. \`GRANT CREATE SESSION TO user;\`.

**2. Créer un user sans quota.** \`CREATE TABLE\` marche, mais l'\`INSERT\` échoue → **ORA-01950**. Donne un \`QUOTA\` sur le tablespace.

**3. Interroger la table d'un autre sans droit.** → **ORA-00942** (la table « n'existe pas » de ton point de vue). Le propriétaire doit \`GRANT SELECT\`.

**4. Tenter une action non autorisée.** → **ORA-01031: insufficient privileges**. Il manque le privilège système/objet correspondant.

**5. Redonner 15 privilèges à chaque nouvel employé.** Crée un **rôle** une fois, puis \`GRANT le_role TO …\` — bien plus maintenable.`,
    badge: {
      id: "badge-access-control-bdd",
      name: "DB Access Control",
      icon: "Server",
      description: "Gère privilèges, quotas et rôles Oracle (GRANT/REVOKE) et diagnostique les erreurs ORA.",
    },
    challenges: [
      {
        id: "bdd-adm-grant-obj",
        title: "Accorder un droit objet",
        order: 1,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 🎟️ GRANT

Autorise l'utilisateur **paul** à **lire (SELECT)** et **modifier (UPDATE)** la table **CLIENT**. Écris la commande.`,
        points: 200,
        timeLimitSec: 360,
        starter: ``,
        hints: [
          { text: "GRANT SELECT, UPDATE ON CLIENT TO paul;", cost: 20 },
          { text: "📖 Correction : GRANT SELECT, UPDATE ON CLIENT TO paul;", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Utilise GRANT avec SELECT et UPDATE", pattern: "grant\\s+select\\s*,\\s*update", flags: "i" },
            { label: "Sur la table CLIENT", pattern: "on\\s+client", flags: "i" },
            { label: "À l'utilisateur paul", pattern: "to\\s+paul", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
GRANT SELECT, UPDATE ON CLIENT TO paul;
\`\`\`
Ce sont des **privilèges objet** : le droit d'agir sur **une table précise**. Paul pourra lire et modifier CLIENT, mais pas la supprimer (pas de \`DELETE\`) ni la structurer. Pour lui permettre de re-donner ce droit : \`… TO paul WITH GRANT OPTION\`. Pour retirer : \`REVOKE UPDATE ON CLIENT FROM paul;\`.`,
        tags: ["admin", "grant", "privileges-objet"],
      },
      {
        id: "bdd-adm-revoke",
        title: "Retirer un droit",
        order: 2,
        difficulty: "easy",
        type: "code",
        language: "sql",
        prompt: `## 🚫 REVOKE

Finalement, retire à **paul** le droit de **modifier (UPDATE)** la table **CLIENT** (il garde le SELECT). Écris la commande.`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "REVOKE UPDATE ON CLIENT FROM paul;", cost: 15 },
          { text: "📖 Correction : REVOKE UPDATE ON CLIENT FROM paul;", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Utilise REVOKE UPDATE", pattern: "revoke\\s+update", flags: "i" },
            { label: "Sur CLIENT", pattern: "on\\s+client", flags: "i" },
            { label: "À paul (FROM)", pattern: "from\\s+paul", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
REVOKE UPDATE ON CLIENT FROM paul;
\`\`\`
\`REVOKE\` retire un privilège précédemment accordé. On cible **le** droit (\`UPDATE\`), l'objet (\`CLIENT\`) et le bénéficiaire (\`paul\`). Le \`SELECT\` accordé auparavant **reste**. Note : \`GRANT\` utilise \`TO\`, \`REVOKE\` utilise \`FROM\`.`,
        tags: ["admin", "revoke", "privileges"],
      },
      {
        id: "bdd-adm-ora01950",
        title: "Diagnostiquer ORA-01950",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🐞 ORA-01950

L'utilisateur \`atelier\` a bien \`CREATE TABLE\`. Il crée une table sans problème, mais dès qu'il fait un \`INSERT\`, Oracle renvoie **ORA-01950: no privileges on tablespace 'TS_ATELIER'**. Quelle est la cause et la solution ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Créer une table ≠ pouvoir y stocker des données. Il manque un… quota.", cost: 25 },
          { text: "📖 Correction : pas de quota sur le tablespace → ALTER USER atelier QUOTA … ON ts_atelier;", cost: 60 },
        ],
        options: [
          "L'utilisateur n'a aucun quota sur le tablespace : ALTER USER atelier QUOTA 100M ON ts_atelier;",
          "Il faut lui donner CREATE SESSION",
          "La table n'existe pas",
          "Il faut redémarrer Oracle",
        ],
        answer: 0,
        explanation: `**ORA-01950** : l'utilisateur peut **créer** la table (il a \`CREATE TABLE\`) mais n'a **aucun quota** pour **stocker** des lignes dans le tablespace → l'\`INSERT\` échoue. Solution : \`ALTER USER atelier QUOTA 100M ON ts_atelier;\` (ou \`QUOTA UNLIMITED\`). C'est une distinction subtile : **droit de créer** ≠ **espace pour stocker**.`,
        tags: ["admin", "ORA-01950", "quota", "tablespace"],
      },
      {
        id: "bdd-adm-role",
        title: "Créer un rôle",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 👥 CREATE ROLE

Crée un rôle nommé **dev_atelier**, puis donne-lui les privilèges système **CREATE SESSION** et **CREATE TABLE** (deux commandes).`,
        points: 250,
        timeLimitSec: 480,
        starter: `-- 1) créer le rôle
-- 2) lui donner les privilèges
`,
        hints: [
          { text: "CREATE ROLE dev_atelier; puis GRANT CREATE SESSION, CREATE TABLE TO dev_atelier;", cost: 25 },
          { text: "📖 Correction :\n```\nCREATE ROLE dev_atelier;\nGRANT CREATE SESSION, CREATE TABLE TO dev_atelier;\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Crée le rôle dev_atelier", pattern: "create\\s+role\\s+dev_atelier", flags: "i" },
            { label: "Accorde CREATE SESSION au rôle", pattern: "grant\\s+.*create\\s+session", flags: "i" },
            { label: "Accorde CREATE TABLE au rôle", pattern: "create\\s+table\\s+to\\s+dev_atelier", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
CREATE ROLE dev_atelier;
GRANT CREATE SESSION, CREATE TABLE TO dev_atelier;
-- ensuite : GRANT dev_atelier TO paul;  (Paul hérite des 2 privilèges d'un coup)
\`\`\`
Un **rôle** est un « paquet » de privilèges. On le remplit une fois, puis on l'accorde à autant d'utilisateurs qu'on veut (\`GRANT dev_atelier TO …\`). Modifier le rôle **répercute** sur tous ses membres. C'est la façon **scalable** de gérer les droits.`,
        tags: ["admin", "role", "grant"],
      },
      {
        id: "bdd-adm-syst-vs-obj",
        title: "Système ou objet ?",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🗝️ Types de privilèges

Parmi ces privilèges, lequel est un **privilège objet** (agit sur une table précise) et non un privilège système ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Objet = sur une table nommée (SELECT ON …). Système = action générale.", cost: 20 },
          { text: "📖 Correction : SELECT ON CLIENT est un privilège objet ; CREATE SESSION/TABLE/USER sont système.", cost: 50 },
        ],
        options: [
          "SELECT ON CLIENT",
          "CREATE SESSION",
          "CREATE TABLE",
          "CREATE USER",
        ],
        answer: 0,
        explanation: `**\`SELECT ON CLIENT\`** est un **privilège objet** : il porte sur **une table précise**. \`CREATE SESSION\` (se connecter), \`CREATE TABLE\` et \`CREATE USER\` sont des **privilèges système** : ils autorisent une **action générale**, pas liée à un objet particulier. La distinction guide la syntaxe : \`GRANT … ON objet TO …\` (objet) vs \`GRANT priv TO …\` (système).`,
        tags: ["admin", "privileges", "systeme-objet"],
      },
    ],
  },
];
