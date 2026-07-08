import type { CourseSeed } from "../../../types";

/** Base de données — Module 1 : introduction (concepts, historique, architecture). */
export const intro: CourseSeed[] = [
  {
    slug: "bdd-intro",
    title: "Introduction aux bases de données",
    checkpoint: "base-de-donnees",
    codename: "Data Vault",
    domain: "BDD — Fondations",
    theme: "vault",
    icon: "Database",
    accent: "#93B896",
    order: 1,
    difficulty: "easy",
    summary:
      "Le minimum de théorie avant d'écrire du SQL : qu'est-ce qu'une BD et un SGBD, pourquoi on a abandonné les fichiers, l'évolution des modèles (hiérarchique → relationnel → NoSQL), les 3 niveaux ANSI/SPARC et les grands objectifs (indépendance, intégrité, partage).",
    objectives: [
      "Définir une base de données et un SGBD, et leur intérêt face aux fichiers plats",
      "Situer l'évolution des modèles : hiérarchique, réseau, relationnel, NoSQL",
      "Comprendre l'architecture ANSI/SPARC à 3 niveaux (externe, conceptuel, interne)",
      "Citer les objectifs d'un SGBD (indépendance des données, intégrité, partageabilité, sécurité)",
      "Connaître le vocabulaire relationnel (relation, tuple, attribut, clé)",
    ],
    lesson: `# 🗄️ Introduction aux bases de données — Data Vault

Ce checkpoint est **tourné vers la pratique du SQL**. Cette page pose juste les fondations : ensuite, on écrit et on exécute des requêtes. 🏎️

---

## 1. Du fichier plat à la base de données 📁➡️🗄️

Avant les SGBD, chaque application stockait ses données dans ses **propres fichiers**. Problèmes :
- **Redondance** : la même info (un client) recopiée dans dix fichiers → incohérences.
- **Dépendance** : changer le format d'un fichier obligeait à réécrire tous les programmes.
- **Pas de partage** contrôlé, pas d'intégrité garantie, accès concurrents chaotiques.

Une **base de données (BD)** est un **ensemble structuré et cohérent de données** partagées, décrivant un domaine (une entreprise, un atelier…). Le **SGBD** (Système de Gestion de Base de Données, *DBMS*) est le **logiciel** qui la crée, la stocke, la protège et permet de l'**interroger** (Oracle, PostgreSQL, MySQL, SQL Server…).

\`\`\`
   Applications  ─┐
   Utilisateurs  ─┼──►  SGBD  ──►  Base de données (sur disque)
   Analystes     ─┘   (Oracle…)     tables, index, contraintes
\`\`\`

---

## 2. L'évolution des modèles 📜

| Époque | Modèle | Idée |
|---|---|---|
| années 60 | **hiérarchique** | données en **arbre** (père → fils) ; rigide |
| années 70 | **réseau** | graphe de pointeurs ; puissant mais complexe |
| 1970+ | **relationnel** | **tables** (relations) + langage **SQL** ; le standard actuel |
| années 2000+ | **NoSQL** | clé-valeur, document, colonnes, graphe ; pour le très grand volume / le flexible |

Le **modèle relationnel** (E. F. Codd, 1970) domine : tout est **table**, on manipule les données avec l'**algèbre relationnelle** et **SQL**. C'est le cœur de ce checkpoint.

---

## 3. Le vocabulaire relationnel 📋

\`\`\`
                 attributs (colonnes)
              ┌──────┬──────────┬────────┐
   relation   │ id   │ nom      │ ville  │   ← schéma de la relation CLIENT
   (table)    ├──────┼──────────┼────────┤
              │ 1    │ Dupont   │ Alger  │   ← tuple (ligne, enregistrement)
              │ 2    │ Martin   │ Oran   │
              └──────┴──────────┴────────┘
\`\`\`

- **Relation** = **table**. **Tuple** = **ligne** (un enregistrement). **Attribut** = **colonne**.
- **Domaine** = ensemble des valeurs possibles d'un attribut (ex. un entier, une chaîne de 30 caractères).
- **Clé primaire** = attribut(s) qui **identifie(nt) de façon unique** chaque tuple.
- **Clé étrangère** = attribut qui **référence** la clé primaire d'une autre table (le lien entre tables).

---

## 4. L'architecture ANSI/SPARC — 3 niveaux 🏛️

Pour séparer « ce que voit l'utilisateur » de « comment c'est stocké », on définit **3 niveaux** :

\`\`\`
 ┌─────────────────────────────────────────────┐
 │ NIVEAU EXTERNE   : les VUES des utilisateurs  │  ← ce que chacun voit
 ├─────────────────────────────────────────────┤
 │ NIVEAU CONCEPTUEL: le schéma logique global   │  ← tables, contraintes
 ├─────────────────────────────────────────────┤
 │ NIVEAU INTERNE   : le stockage physique       │  ← fichiers, index, blocs
 └─────────────────────────────────────────────┘
\`\`\`

- **Externe** : différentes **vues** adaptées à chaque profil (le comptable ne voit pas les mêmes colonnes que le RH).
- **Conceptuel** : la description **logique** complète (toutes les tables et leurs liens), indépendante du profil.
- **Interne** : **comment** c'est réellement rangé sur le disque (organisation des fichiers, index).

Cette séparation apporte l'**indépendance des données** :
- **Indépendance physique** : changer le stockage (ajouter un index) **sans** toucher au schéma conceptuel ni aux applications.
- **Indépendance logique** : modifier le schéma conceptuel **sans** casser (idéalement) les vues externes existantes.

---

## 5. Les objectifs d'un SGBD 🎯

- **Indépendance des données** (physique et logique, voir ci-dessus).
- **Intégrité** : garantir que les données respectent des **règles** (contraintes : clé, NOT NULL, CHECK…).
- **Partageabilité** : plusieurs utilisateurs/applications accèdent **en même temps** (gestion de la concurrence).
- **Sécurité / confidentialité** : droits d'accès (GRANT/REVOKE), authentification.
- **Non-redondance & cohérence** : une info n'est stockée qu'une fois (normalisation).
- **Reprise après panne** : transactions, journalisation, sauvegardes.

Ces objectifs se retrouvent tout au long du checkpoint : contraintes (intégrité), privilèges (sécurité), transactions ACID (concurrence + reprise), normalisation (non-redondance).

---

## 🧠 Ce qu'il faut retenir

- Une **BD** = données structurées, cohérentes, partagées ; un **SGBD** = le logiciel qui les gère (Oracle, PostgreSQL…).
- Les BD remplacent les **fichiers plats** pour éliminer **redondance**, **dépendance** et incohérences.
- Modèles : hiérarchique → réseau → **relationnel** (tables + SQL, le standard) → NoSQL.
- Vocabulaire : **relation/table**, **tuple/ligne**, **attribut/colonne**, **clé primaire** (identifie), **clé étrangère** (référence).
- **ANSI/SPARC** : niveaux **externe** (vues), **conceptuel** (schéma logique), **interne** (stockage) → **indépendance** physique et logique.
- Objectifs SGBD : indépendance, **intégrité**, partage/concurrence, sécurité, non-redondance, reprise.

## ⚠️ Erreurs fréquentes des débutants

**1. Confondre BD et SGBD.** La **BD** = les données ; le **SGBD** = le logiciel qui les gère. Oracle est un SGBD ; l'atelier stocké dedans est la BD.

**2. Croire que « relationnel » veut dire « avec des relations/liens ».** Une **relation**, en théorie relationnelle, c'est une **table**. Les liens entre tables se font par **clés étrangères**.

**3. Mélanger les 3 niveaux ANSI/SPARC.** Externe = vues par profil ; conceptuel = schéma logique global ; interne = stockage physique.

**4. Négliger l'intégrité.** Sans contraintes (clé, NOT NULL, CHECK), une BD accepte des données incohérentes — le SGBD est là justement pour l'empêcher.`,
    badge: {
      id: "badge-data-vault",
      name: "Data Vault",
      icon: "Database",
      description: "Maîtrise les concepts BD/SGBD, le vocabulaire relationnel et l'architecture ANSI/SPARC.",
    },
    challenges: [
      {
        id: "bdd-intro-sgbd",
        title: "BD ou SGBD ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🗄️ Vocabulaire de base

Laquelle de ces affirmations est **correcte** ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "L'un est les données, l'autre le logiciel qui les gère.", cost: 10 },
          { text: "📖 Correction : le SGBD (Oracle…) est le logiciel ; la BD est l'ensemble des données gérées.", cost: 30 },
        ],
        options: [
          "Le SGBD est le logiciel (Oracle, PostgreSQL…) ; la base de données est l'ensemble structuré des données qu'il gère",
          "La base de données est le logiciel, le SGBD est le disque dur",
          "SGBD et base de données sont deux mots pour la même chose",
          "Un SGBD ne peut gérer qu'une seule table",
        ],
        answer: 0,
        explanation: `Le **SGBD** (Système de Gestion de Base de Données) est le **logiciel** — Oracle, PostgreSQL, MySQL… La **base de données** est l'**ensemble structuré et cohérent des données** qu'il stocke et protège. Un même SGBD gère plusieurs bases, chacune avec de nombreuses tables.`,
        tags: ["bdd", "sgbd", "definitions"],
      },
      {
        id: "bdd-intro-fichiers",
        title: "Pourquoi pas des fichiers ?",
        order: 2,
        difficulty: "easy",
        type: "multi",
        prompt: `## 📁 Les défauts des fichiers plats

Coche les **problèmes** des fichiers plats que résout un SGBD :`,
        points: 150,
        timeLimitSec: 300,
        options: [
          "La redondance des données (mêmes infos recopiées → incohérences)",
          "La dépendance programme/données (changer le format casse les programmes)",
          "L'absence de gestion des accès concurrents et de l'intégrité",
          "L'impossibilité totale de stocker des nombres",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Un fichier peut stocker des nombres ; le vrai problème est ailleurs.", cost: 15 },
          { text: "📖 Correction : redondance, dépendance, pas d'intégrité/concurrence. Stocker des nombres n'est pas le souci.", cost: 40 },
        ],
        explanation: `Les fichiers plats souffrent de **redondance** (donc d'incohérences), de **dépendance** programme/données, et de l'**absence** d'intégrité, de sécurité et de gestion des accès **concurrents**. Un SGBD corrige tout ça. Stocker des nombres n'a jamais été un problème — la 4e option est fausse.`,
        tags: ["bdd", "fichiers", "sgbd"],
      },
      {
        id: "bdd-intro-vocab",
        title: "Relation, tuple, attribut",
        order: 3,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 📋 Le jargon relationnel

Dans le modèle relationnel, une **relation**, un **tuple** et un **attribut** correspondent respectivement à… ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Relation = table. Le reste suit.", cost: 15 },
          { text: "📖 Correction : relation = table, tuple = ligne, attribut = colonne.", cost: 40 },
        ],
        options: [
          "une table, une ligne, une colonne",
          "une colonne, une table, une ligne",
          "une ligne, une colonne, une table",
          "une base, un fichier, un disque",
        ],
        answer: 0,
        explanation: `**Relation = table**, **tuple = ligne** (un enregistrement), **attribut = colonne**. Attention au faux ami : « relation » ne désigne PAS un lien entre tables — c'est la table elle-même. Les liens se font par **clés étrangères**.`,
        tags: ["bdd", "relationnel", "vocabulaire"],
      },
      {
        id: "bdd-intro-ansi",
        title: "Les 3 niveaux ANSI/SPARC",
        order: 4,
        difficulty: "medium",
        type: "order",
        prompt: `## 🏛️ Empile les niveaux

Range les 3 niveaux de l'architecture ANSI/SPARC, du **plus proche de l'utilisateur** au **plus proche du disque** :`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "Niveau externe (les vues adaptées à chaque utilisateur)",
          "Niveau conceptuel (le schéma logique global : tables et liens)",
          "Niveau interne (le stockage physique : fichiers, index)",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "L'utilisateur voit des vues ; le disque range des fichiers.", cost: 20 },
          { text: "📖 Correction : externe → conceptuel → interne.", cost: 50 },
        ],
        explanation: `De l'utilisateur vers le disque : **externe** (les **vues** propres à chaque profil) → **conceptuel** (le **schéma logique** global, indépendant des profils) → **interne** (le **stockage physique**). Cette séparation donne l'**indépendance des données** : on peut changer le stockage (interne) sans toucher aux vues (externe).`,
        tags: ["bdd", "ansi-sparc", "architecture"],
      },
      {
        id: "bdd-intro-independance",
        title: "Indépendance physique",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔗 Indépendance des données

Un administrateur ajoute un **index** pour accélérer les recherches, **sans** que les applications aient à être modifiées. De quel principe s'agit-il ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "L'index est un détail de STOCKAGE (niveau interne).", cost: 20 },
          { text: "📖 Correction : indépendance physique — changer le niveau interne sans impacter le conceptuel/les applis.", cost: 50 },
        ],
        options: [
          "L'indépendance physique : modifier le stockage (niveau interne) sans impacter le schéma conceptuel ni les applications",
          "L'indépendance logique : ajouter une table sans casser les vues",
          "La normalisation en 3e forme normale",
          "La gestion des transactions ACID",
        ],
        answer: 0,
        explanation: `Ajouter un **index** relève du **niveau interne** (stockage). Que ce changement n'affecte **ni** le schéma conceptuel **ni** les applications illustre l'**indépendance physique**. L'**indépendance logique**, elle, concerne les modifications du schéma **conceptuel** (ex. ajouter une colonne) sans casser les **vues** externes existantes.`,
        tags: ["bdd", "independance", "ansi-sparc"],
      },
      {
        id: "bdd-intro-modeles",
        title: "L'évolution des modèles",
        order: 6,
        difficulty: "medium",
        type: "order",
        prompt: `## 📜 Frise chronologique

Range ces modèles de données du **plus ancien** au **plus récent** :`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "Modèle hiérarchique (données en arbre)",
          "Modèle réseau (graphe de pointeurs)",
          "Modèle relationnel (tables + SQL)",
          "NoSQL (clé-valeur, document, graphe…)",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "Arbre (60s) → graphe (70s) → tables (70s+) → NoSQL (2000s).", cost: 20 },
          { text: "📖 Correction : hiérarchique → réseau → relationnel → NoSQL.", cost: 50 },
        ],
        explanation: `Ordre historique : **hiérarchique** (années 60, arbre) → **réseau** (graphe de pointeurs) → **relationnel** (Codd 1970, tables + SQL, le standard actuel) → **NoSQL** (années 2000, pour le très grand volume et les schémas flexibles). Le relationnel reste **dominant** — c'est tout l'objet de ce checkpoint.`,
        tags: ["bdd", "modeles", "histoire"],
      },
    ],
  },
];
