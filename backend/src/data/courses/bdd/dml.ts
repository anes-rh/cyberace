import type { CourseSeed } from "../../../types";

/** Base de données — Module 5 : SQL DML (INSERT/UPDATE/DELETE). */
export const dml: CourseSeed[] = [
  {
    slug: "bdd-dml",
    title: "SQL DML — insérer, modifier, supprimer",
    checkpoint: "base-de-donnees",
    codename: "Data Loader",
    domain: "BDD — SQL DML",
    theme: "vault",
    icon: "Database",
    accent: "#93B896",
    order: 5,
    difficulty: "medium",
    summary:
      "Le schéma existe : on le remplit et on le fait vivre. INSERT (ajouter des lignes), UPDATE (modifier), DELETE (supprimer), avec l'importance capitale de la clause WHERE. Chaque défi = une instruction DML sur l'atelier.",
    objectives: [
      "Insérer des lignes avec INSERT INTO … VALUES (et la liste de colonnes)",
      "Modifier des lignes avec UPDATE … SET … WHERE",
      "Supprimer des lignes avec DELETE … WHERE",
      "Comprendre le danger d'un UPDATE/DELETE sans WHERE",
      "Respecter l'intégrité référentielle lors des insertions/suppressions",
    ],
    lesson: `# 📥 SQL DML — Data Loader

Le **DML** (*Data Manipulation Language*) modifie les **données** (pas la structure) : \`INSERT\`, \`UPDATE\`, \`DELETE\`. On alimente et on fait vivre l'atelier mécanique. 🏎️

> ⚠️ Après un DML, pense à **\`COMMIT;\`** pour rendre les changements permanents (voir le module Transactions).

---

## 1. INSERT — ajouter des lignes ➕

\`\`\`sql
-- forme recommandée : on liste les colonnes
INSERT INTO CLIENT (id_client, nom, prenom, ville)
VALUES (1, 'Dupont', 'Ali', 'Alger');

-- forme courte (déconseillée) : ordre EXACT des colonnes de la table
INSERT INTO CLIENT VALUES (2, 'Martin', 'Sara', 'Oran', '0555123456');
\`\`\`

- **Toujours préférer** la forme **avec liste de colonnes** : robuste si l'ordre change, et on peut **omettre** les colonnes facultatives (elles prennent NULL ou leur \`DEFAULT\`).
- Les chaînes sont entre **apostrophes simples** \`'…'\` ; les dates : \`DATE '2024-03-15'\` ou \`TO_DATE('15/03/2024','DD/MM/YYYY')\`.

⚠️ **Intégrité** : insérer un VEHICULE avec un \`id_client\` inexistant → **ORA-02291** (clé étrangère violée). Il faut que le client existe **d'abord**.

---

## 2. UPDATE — modifier des lignes ✏️

\`\`\`sql
UPDATE EMPLOYE
SET salaire = salaire * 1.10           -- +10 %
WHERE poste = 'Mécanicien';
\`\`\`

- \`SET\` liste les colonnes à changer (plusieurs séparées par des virgules).
- **La clause \`WHERE\` décide QUELLES lignes** sont modifiées.

> 🚨 **UPDATE sans WHERE = TOUTES les lignes modifiées !**
> \`UPDATE EMPLOYE SET salaire = 0;\` met **tous** les salaires à 0. Toujours vérifier son \`WHERE\` (voire tester d'abord avec un \`SELECT … WHERE\` identique).

---

## 3. DELETE — supprimer des lignes 🗑️

\`\`\`sql
DELETE FROM INTERVENTION
WHERE date_intervention < DATE '2020-01-01';
\`\`\`

- Supprime les lignes qui **vérifient le WHERE**.
- Même danger : **DELETE sans WHERE vide toute la table** (\`DELETE FROM CLIENT;\` supprime tous les clients).

**DELETE vs TRUNCATE vs DROP :**
| Commande | Effet |
|---|---|
| \`DELETE FROM t WHERE …\` | supprime des **lignes** (DML, annulable par ROLLBACK) |
| \`TRUNCATE TABLE t\` | vide **toute** la table, très vite (DDL, non annulable) |
| \`DROP TABLE t\` | supprime la **table entière** (structure comprise) |

⚠️ Supprimer un CLIENT référencé par des VEHICULE → **ORA-02292** (enregistrement fils trouvé). Il faut d'abord supprimer/rattacher les véhicules, ou définir la FK en \`ON DELETE CASCADE\`.

---

## 🧠 Ce qu'il faut retenir

- **INSERT INTO t (colonnes) VALUES (…)** — préfère **toujours** la liste de colonnes ; chaînes en \`'…'\`.
- **UPDATE t SET col = … WHERE …** — le \`WHERE\` choisit les lignes ; **sans WHERE = tout est modifié**.
- **DELETE FROM t WHERE …** — **sans WHERE = table vidée**. \`TRUNCATE\` vide tout (rapide, non annulable) ; \`DROP\` supprime la table.
- Respecte l'**intégrité référentielle** : le parent doit exister avant l'enfant (INSERT), et pas d'enfant orphelin (DELETE) → sinon ORA-02291 / ORA-02292.
- Un DML n'est définitif qu'après **\`COMMIT\`**.

## ⚠️ Erreurs fréquentes des débutants (dont vraies erreurs Oracle)

**1. UPDATE/DELETE sans WHERE.** La catastrophe classique : **toutes** les lignes touchées. Réflexe : écrire d'abord un \`SELECT … WHERE\` pour visualiser la cible.

**2. Guillemets doubles pour les chaînes.** En SQL, les valeurs texte sont entre **apostrophes simples** \`'Alger'\`. Les doubles \`"\` servent aux identifiants.

**3. Insérer un enfant sans parent.** \`INSERT\` d'un VEHICULE avec un \`id_client\` inexistant → **ORA-02291** (clé étrangère). Insère le client d'abord.

**4. Supprimer un parent référencé.** \`DELETE\` d'un CLIENT ayant des véhicules → **ORA-02292**. Traite les enfants d'abord (ou \`ON DELETE CASCADE\`).

**5. Oublier le COMMIT.** Sans \`COMMIT\`, tes changements ne sont visibles que dans ta session et disparaissent au ROLLBACK/déconnexion.`,
    badge: {
      id: "badge-data-loader",
      name: "Data Loader",
      icon: "Database",
      description: "Alimente et fait vivre une base : INSERT, UPDATE, DELETE avec la maîtrise du WHERE.",
    },
    challenges: [
      {
        id: "bdd-dml-insert",
        title: "Insérer un client",
        order: 1,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## ➕ INSERT

Insère dans **CLIENT** une ligne avec : \`id_client\` = 10, \`nom\` = 'Benali', \`prenom\` = 'Karim', \`ville\` = 'Constantine'. Utilise la forme avec **liste de colonnes**.`,
        points: 200,
        timeLimitSec: 420,
        starter: ``,
        hints: [
          { text: "INSERT INTO CLIENT (id_client, nom, prenom, ville) VALUES (10, 'Benali', 'Karim', 'Constantine');", cost: 20 },
          { text: "📖 Correction :\n```\nINSERT INTO CLIENT (id_client, nom, prenom, ville)\nVALUES (10, 'Benali', 'Karim', 'Constantine');\n```", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "INSERT INTO CLIENT avec liste de colonnes", pattern: "insert\\s+into\\s+client\\s*\\([^)]*id_client", flags: "i" },
            { label: "Clause VALUES", pattern: "values\\s*\\(", flags: "i" },
            { label: "La valeur nom entre apostrophes", pattern: "'Benali'", flags: "i" },
            { label: "La ville Constantine", pattern: "'Constantine'", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
INSERT INTO CLIENT (id_client, nom, prenom, ville)
VALUES (10, 'Benali', 'Karim', 'Constantine');
\`\`\`
La **liste de colonnes** rend l'INSERT robuste (indépendant de l'ordre physique) et permet d'**omettre** les colonnes facultatives. Les chaînes sont entre **apostrophes simples**. N'oublie pas \`COMMIT;\` pour valider.`,
        tags: ["dml", "insert", "sql"],
      },
      {
        id: "bdd-dml-update",
        title: "Augmenter les mécaniciens",
        order: 2,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## ✏️ UPDATE ciblé

Augmente de **10 %** le salaire de **tous les employés dont le poste est 'Mécanicien'** (et seulement eux).`,
        points: 250,
        timeLimitSec: 420,
        starter: ``,
        hints: [
          { text: "UPDATE EMPLOYE SET salaire = salaire * 1.10 WHERE poste = 'Mécanicien';", cost: 25 },
          { text: "📖 Correction :\n```\nUPDATE EMPLOYE\nSET salaire = salaire * 1.10\nWHERE poste = 'Mécanicien';\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "UPDATE EMPLOYE", pattern: "update\\s+employe", flags: "i" },
            { label: "SET salaire augmenté de 10%", pattern: "set\\s+salaire\\s*=\\s*salaire\\s*\\*\\s*1\\.1", flags: "i" },
            { label: "WHERE cible les mécaniciens", pattern: "where\\s+poste\\s*=\\s*'M[eé]canicien'", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
UPDATE EMPLOYE
SET salaire = salaire * 1.10
WHERE poste = 'Mécanicien';
\`\`\`
Le calcul \`salaire = salaire * 1.10\` applique **+10 %** à la valeur actuelle de chaque ligne. Le **\`WHERE poste = 'Mécanicien'\`** restreint aux mécaniciens. **Sans ce WHERE**, TOUS les employés seraient augmentés — l'erreur la plus dangereuse en DML.`,
        tags: ["dml", "update", "where"],
      },
      {
        id: "bdd-dml-delete",
        title: "Supprimer les vieilles interventions",
        order: 3,
        difficulty: "medium",
        type: "code",
        language: "sql",
        prompt: `## 🗑️ DELETE

Supprime de la table **INTERVENTION** toutes les lignes dont la \`date_intervention\` est **antérieure au 1er janvier 2020**.`,
        points: 200,
        timeLimitSec: 420,
        starter: ``,
        hints: [
          { text: "DELETE FROM INTERVENTION WHERE date_intervention < DATE '2020-01-01';", cost: 20 },
          { text: "📖 Correction :\n```\nDELETE FROM INTERVENTION\nWHERE date_intervention < DATE '2020-01-01';\n```", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "DELETE FROM INTERVENTION", pattern: "delete\\s+from\\s+intervention", flags: "i" },
            { label: "Filtre sur la date", pattern: "where\\s+date_intervention\\s*<", flags: "i" },
            { label: "La date 2020-01-01", pattern: "2020-01-01|01/01/2020", flags: "i" },
          ],
        }),
        explanation: `\`\`\`sql
DELETE FROM INTERVENTION
WHERE date_intervention < DATE '2020-01-01';
\`\`\`
\`DELETE\` supprime les **lignes** vérifiant le \`WHERE\`. La syntaxe \`DATE '2020-01-01'\` (format ISO) désigne une date littérale. **Sans WHERE**, \`DELETE FROM INTERVENTION;\` viderait **toute** la table. Contrairement à \`TRUNCATE\`, un \`DELETE\` est **annulable** par \`ROLLBACK\` (avant COMMIT).`,
        tags: ["dml", "delete", "date"],
      },
      {
        id: "bdd-dml-danger",
        title: "Le piège du WHERE oublié",
        order: 4,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🚨 Danger

Que fait cette instruction ?

\`\`\`sql
UPDATE CLIENT SET ville = 'Alger';
\`\`\``,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "Il n'y a pas de WHERE…", cost: 15 },
          { text: "📖 Correction : elle met la ville de TOUS les clients à 'Alger'.", cost: 40 },
        ],
        options: [
          "Elle met la ville de TOUS les clients à 'Alger' (aucun WHERE = toutes les lignes)",
          "Elle ne modifie qu'un seul client au hasard",
          "Elle ajoute un nouveau client à Alger",
          "Elle échoue car il manque un WHERE obligatoire",
        ],
        answer: 0,
        explanation: `Sans **\`WHERE\`**, un \`UPDATE\` s'applique à **toutes les lignes** : ici, **chaque** client se retrouve à Alger. Le \`WHERE\` n'est **pas** obligatoire syntaxiquement — d'où le danger. Réflexe de survie : écrire d'abord \`SELECT * FROM CLIENT WHERE …;\` pour vérifier la cible, puis transformer en UPDATE.`,
        tags: ["dml", "update", "where", "danger"],
      },
      {
        id: "bdd-dml-ora02291",
        title: "Comprendre ORA-02291",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🐞 Erreur d'intégrité

Tu insères un VEHICULE avec \`id_client = 999\`, mais Oracle renvoie **ORA-02291: integrity constraint violated - parent key not found**. Pourquoi ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "La FK exige que le client référencé EXISTE.", cost: 20 },
          { text: "📖 Correction : aucun CLIENT n'a l'id 999 → la clé étrangère est violée. Insère le client d'abord.", cost: 50 },
        ],
        options: [
          "Aucun client avec id_client = 999 n'existe : la clé étrangère (parent) est violée. Il faut insérer le client d'abord",
          "Le numéro 999 est trop grand pour un NUMBER",
          "La table VEHICULE n'existe pas",
          "Il faut mettre id_client entre apostrophes",
        ],
        answer: 0,
        explanation: `**ORA-02291** = violation d'**intégrité référentielle** : la valeur \`id_client = 999\` de la clé étrangère **ne correspond à aucun** client existant (la « parent key » est introuvable). Solution : **insérer d'abord** le client 999 dans CLIENT, puis le véhicule. C'est le SGBD qui garantit qu'on ne crée pas de véhicule « orphelin ».`,
        tags: ["dml", "ORA-02291", "integrite", "foreign-key"],
      },
    ],
  },
];
