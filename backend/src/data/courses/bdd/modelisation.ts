import type { CourseSeed } from "../../../types";

/** Base de données — Module 3 : modélisation (MCD → MLD, algèbre, normalisation). */
export const modelisation: CourseSeed[] = [
  {
    slug: "bdd-modelisation",
    title: "Modélisation : MCD, relationnel, normalisation",
    checkpoint: "base-de-donnees",
    codename: "Blueprint",
    domain: "BDD — Conception",
    theme: "vault",
    icon: "Boxes",
    accent: "#93B896",
    order: 3,
    difficulty: "medium",
    summary:
      "Avant d'écrire du SQL, on conçoit. Modèle entité-association (entités, associations, cardinalités), passage au modèle relationnel (les clés étrangères), algèbre relationnelle (sélection, projection, jointure…) et normalisation (1FN → BCNF) pour éliminer la redondance.",
    objectives: [
      "Lire/construire un MCD : entités, attributs, associations, cardinalités",
      "Passer du MCD au modèle relationnel (MLD) : clés primaires et étrangères",
      "Traiter une association plusieurs-à-plusieurs (table de jonction)",
      "Manipuler l'algèbre relationnelle : sélection (σ), projection (π), jointure (⋈)",
      "Normaliser un schéma : 1FN, 2FN, 3FN, BCNF, et pourquoi",
    ],
    lesson: `# 📐 Modélisation — Blueprint

Une bonne base commence par un bon **plan**. On modélise le monde réel (« un client possède des véhicules, chaque véhicule subit des interventions… ») avant de créer la moindre table. 🏎️

> 🔧 **Schéma fil rouge du checkpoint : un atelier mécanique.** Clients, véhicules, interventions et employés — on le retrouvera dans tous les TP SQL.

---

## 1. Le modèle entité-association (MCD) 🧩

Le **MCD** (Modèle Conceptuel de Données) décrit le réel avec :
- des **entités** (les « choses » : CLIENT, VEHICULE, INTERVENTION…) ;
- des **attributs** (leurs propriétés : nom, immatriculation, coût…) ;
- des **associations** (les liens : un client *possède* un véhicule) ;
- des **cardinalités** (combien ? min..max de chaque côté).

\`\`\`
   CLIENT ──1,n── (possède) ──1,1── VEHICULE ──1,1── (subit) ──0,n── INTERVENTION
     │                                  │
   nom, ville                     immatriculation
\`\`\`

**Lire une cardinalité** (côté CLIENT de « possède ») :
- **1,n** : un client possède **au moins 1** et **plusieurs** véhicules.
- côté VEHICULE **1,1** : un véhicule appartient à **exactement un** client.

Les grands types de liens :
- **un-à-plusieurs (1:N)** : un client → plusieurs véhicules, un véhicule → un client.
- **plusieurs-à-plusieurs (N:M)** : une intervention mobilise plusieurs employés, un employé travaille sur plusieurs interventions.

---

## 2. Passage au modèle relationnel (MLD) 🔑

On traduit le MCD en **tables**. Règles :

**Règle 1 — Chaque entité devient une table**, sa clé identifiante devient la **clé primaire (PK)**.
\`\`\`
 CLIENT(id_client PK, nom, ville)
 VEHICULE(id_vehicule PK, immatriculation, annee)
\`\`\`

**Règle 2 — Une association 1:N** : la clé du côté « 1 » **descend** comme **clé étrangère (FK)** du côté « N ».
\`\`\`
 VEHICULE(id_vehicule PK, immatriculation, annee, id_client FK → CLIENT)
\`\`\`
(le véhicule « porte » l'id de son client)

**Règle 3 — Une association N:M** devient une **table de jonction** dont la clé primaire est le **couple** des deux clés étrangères.
\`\`\`
 INTERVENANT(id_intervention FK → INTERVENTION,
             id_employe     FK → EMPLOYE,
             PRIMARY KEY (id_intervention, id_employe))
\`\`\`

### Le schéma relationnel complet de l'atelier 🗺️

\`\`\`
 CLIENT(id_client PK, nom, prenom, ville, telephone)
 EMPLOYE(id_employe PK, nom, prenom, poste, salaire, date_embauche)
 MARQUE(id_marque PK, libelle)
 MODELE(id_modele PK, libelle, id_marque FK → MARQUE)
 VEHICULE(id_vehicule PK, immatriculation, annee,
          id_modele FK → MODELE, id_client FK → CLIENT)
 INTERVENTION(id_intervention PK, date_intervention, description, cout,
              id_vehicule FK → VEHICULE)
 INTERVENANT(id_intervention FK, id_employe FK,
             PRIMARY KEY(id_intervention, id_employe))
\`\`\`

---

## 3. L'algèbre relationnelle ➗

C'est le **fondement mathématique** des requêtes. Les opérations de base :

| Opération | Symbole | Effet | Équivalent SQL |
|---|---|---|---|
| **Sélection** | σ (sigma) | garde les **lignes** qui vérifient un critère | \`WHERE\` |
| **Projection** | π (pi) | garde certaines **colonnes** | \`SELECT col1, col2\` |
| **Jointure** | ⋈ | **combine** deux tables sur un critère | \`JOIN … ON\` |
| **Union** | ∪ | lignes de A **ou** de B | \`UNION\` |
| **Différence** | − | lignes de A **pas dans** B | \`MINUS\` / \`EXCEPT\` |
| **Produit cartésien** | × | toutes les combinaisons A×B | \`CROSS JOIN\` |

\`\`\`
 σ(ville = 'Alger')(CLIENT)          → les clients d'Alger
 π(nom, ville)(CLIENT)               → seulement les colonnes nom et ville
 CLIENT ⋈ VEHICULE                   → chaque client avec ses véhicules
\`\`\`

> 🧠 SQL n'est qu'une **écriture concrète** de l'algèbre relationnelle. Comprendre σ/π/⋈ rend le SELECT limpide.

---

## 4. La normalisation : éliminer la redondance 🧼

Une table mal conçue **répète** des infos → risques d'incohérence. La **normalisation** découpe les tables pour supprimer ces redondances. On progresse par **formes normales** :

**1FN (Première Forme Normale)** : chaque attribut est **atomique** (une seule valeur, pas de liste). Interdit : une colonne \`telephones = "0555..., 0666..."\`. → une valeur par cellule.

**2FN** : être en 1FN **et** chaque attribut non-clé dépend de **toute** la clé primaire (pertinent quand la clé est **composée**). Interdit : une dépendance sur **une partie** de la clé.

**3FN** : être en 2FN **et** aucun attribut non-clé ne dépend d'un **autre attribut non-clé** (pas de **dépendance transitive**). Exemple à corriger :
\`\`\`
 MAUVAIS : VEHICULE(id_vehicule, id_modele, libelle_modele, id_marque, libelle_marque)
   → libelle_modele dépend de id_modele (non-clé) : transitif !
 BON : on sort MODELE et MARQUE dans leurs propres tables (voir schéma).
\`\`\`

**BCNF (Boyce-Codd)** : forme plus stricte de la 3FN — pour **tout** dépendance fonctionnelle X→Y, X doit être une **clé candidate**. Élimine des anomalies résiduelles rares.

> 🎯 En pratique, viser la **3FN/BCNF** : chaque fait est stocké **une seule fois**, au bon endroit. C'est exactement pour ça que l'atelier a des tables **MARQUE** et **MODELE** séparées plutôt que de répéter « Renault » dans chaque véhicule.

---

## 🧠 Ce qu'il faut retenir

- Le **MCD** décrit le réel : **entités**, **attributs**, **associations**, **cardinalités** (min..max).
- Passage au relationnel : entité → **table (PK)** ; association **1:N** → **FK** côté N ; association **N:M** → **table de jonction** (PK = couple de FK).
- L'**algèbre relationnelle** (σ sélection = WHERE, π projection = SELECT colonnes, ⋈ jointure = JOIN) est le socle du SQL.
- **Normaliser** élimine la redondance : **1FN** (atomique) → **2FN** (dépend de toute la clé) → **3FN** (pas de dépendance transitive) → **BCNF**.
- Objectif pratique : **3FN/BCNF** — chaque fait stocké **une seule fois** (d'où MARQUE et MODELE séparés).

## ⚠️ Erreurs fréquentes des débutants

**1. Oublier la table de jonction pour un N:M.** Une association plusieurs-à-plusieurs **ne peut pas** se représenter avec une simple FK : il faut une **table intermédiaire** (INTERVENANT).

**2. Mettre plusieurs valeurs dans une cellule.** \`telephones = "a, b, c"\` viole la **1FN**. Une valeur atomique par cellule.

**3. Répéter des libellés partout.** Recopier « Renault » dans chaque véhicule = **redondance** → violation de la 3FN. On externalise dans une table dédiée.

**4. Confondre sélection et projection.** **Sélection (σ)** filtre des **lignes** (WHERE) ; **projection (π)** choisit des **colonnes** (SELECT col…).

**5. Sur-normaliser au point de tout casser en mille tables.** La 3FN suffit dans l'immense majorité des cas ; l'excès nuit aux performances (trop de jointures).`,
    badge: {
      id: "badge-blueprint",
      name: "Blueprint",
      icon: "Boxes",
      description: "Conçoit un schéma : MCD, passage au relationnel, algèbre relationnelle et normalisation 3FN/BCNF.",
    },
    challenges: [
      {
        id: "bdd-model-cardinalite",
        title: "Lire une cardinalité",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧩 Cardinalités

Dans le MCD, l'association *possède* relie CLIENT (côté **1,n**) et VEHICULE (côté **1,1**). Qu'est-ce que ça signifie ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "1,n côté client = un client a 1 à plusieurs véhicules ; 1,1 côté véhicule = un véhicule a exactement un client.", cost: 20 },
          { text: "📖 Correction : un client possède 1..n véhicules ; un véhicule appartient à exactement 1 client (relation 1:N).", cost: 50 },
        ],
        options: [
          "Un client possède 1 à plusieurs véhicules ; chaque véhicule appartient à exactement un client",
          "Un client possède exactement un véhicule ; un véhicule a plusieurs clients",
          "Chaque client et chaque véhicule sont indépendants",
          "C'est une association plusieurs-à-plusieurs",
        ],
        answer: 0,
        explanation: `Côté CLIENT **1,n** : un client possède **au moins 1** et **jusqu'à plusieurs** véhicules. Côté VEHICULE **1,1** : un véhicule appartient à **exactement un** client. C'est une association **un-à-plusieurs (1:N)** → au passage relationnel, la clé du client **descend** en clé étrangère dans VEHICULE.`,
        tags: ["modelisation", "mcd", "cardinalites"],
      },
      {
        id: "bdd-model-1n",
        title: "Traduire un 1:N",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔑 Du MCD au relationnel

Association **1:N** : un MODELE appartient à une MARQUE, une MARQUE a plusieurs MODELE. Comment traduire ce lien en relationnel ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "La clé du côté '1' (MARQUE) descend où ?", cost: 20 },
          { text: "📖 Correction : id_marque devient une clé étrangère dans la table MODELE.", cost: 50 },
        ],
        options: [
          "Ajouter id_marque comme clé étrangère dans la table MODELE (le côté N porte la FK)",
          "Ajouter id_modele comme clé étrangère dans la table MARQUE",
          "Créer une table de jonction MODELE_MARQUE",
          "Fusionner MARQUE et MODELE en une seule table",
        ],
        answer: 0,
        explanation: `Pour un **1:N**, la clé du côté **« 1 »** (MARQUE) **descend** comme **clé étrangère** du côté **« N »** (MODELE) : \`MODELE(id_modele PK, libelle, id_marque FK → MARQUE)\`. Une **table de jonction** ne sert que pour les **N:M**. Fusionner créerait de la redondance (violation 3FN).`,
        tags: ["modelisation", "mld", "cle-etrangere"],
      },
      {
        id: "bdd-model-nm",
        title: "Une association N:M",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔗 Plusieurs-à-plusieurs

Une INTERVENTION mobilise plusieurs EMPLOYE, et un EMPLOYE participe à plusieurs INTERVENTION. Comment représenter ce **N:M** ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Un N:M ne tient pas dans une simple FK : il faut une table intermédiaire.", cost: 25 },
          { text: "📖 Correction : table de jonction INTERVENANT(id_intervention, id_employe) avec PK composée des deux.", cost: 60 },
        ],
        options: [
          "Une table de jonction INTERVENANT(id_intervention, id_employe) dont la clé primaire est le couple des deux FK",
          "Une clé étrangère id_employe dans INTERVENTION",
          "Une clé étrangère id_intervention dans EMPLOYE",
          "C'est impossible à modéliser",
        ],
        answer: 0,
        explanation: `Un **N:M** se traduit par une **table de jonction** : \`INTERVENANT(id_intervention FK, id_employe FK, PRIMARY KEY(id_intervention, id_employe))\`. Chaque ligne = « tel employé a travaillé sur telle intervention ». La **clé primaire composée** empêche les doublons. Une simple FK ne suffirait que pour un 1:N.`,
        tags: ["modelisation", "n-m", "jonction"],
      },
      {
        id: "bdd-model-projsel",
        title: "Sélection vs projection",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ➗ Algèbre relationnelle

L'opération **π (projection)** de l'algèbre relationnelle correspond à quoi en SQL ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "π garde des COLONNES ; σ garde des LIGNES.", cost: 20 },
          { text: "📖 Correction : la projection π = choisir des colonnes = la liste du SELECT.", cost: 50 },
        ],
        options: [
          "Choisir certaines colonnes (la liste après SELECT)",
          "Filtrer des lignes (la clause WHERE)",
          "Joindre deux tables (JOIN)",
          "Trier les résultats (ORDER BY)",
        ],
        answer: 0,
        explanation: `La **projection π** garde certaines **colonnes** → c'est la **liste après SELECT** (\`SELECT nom, ville\`). À ne pas confondre avec la **sélection σ**, qui filtre des **lignes** (\`WHERE\`). La **jointure ⋈** combine des tables (\`JOIN\`). SQL est une écriture concrète de cette algèbre.`,
        tags: ["modelisation", "algebre", "projection"],
      },
      {
        id: "bdd-model-1fn",
        title: "Violation de la 1FN",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧼 Première forme normale

Une table CLIENT a une colonne \`telephones\` contenant \`"0555111222, 0666333444"\`. Quelle règle est violée ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Une cellule doit contenir UNE seule valeur (atomique).", cost: 20 },
          { text: "📖 Correction : la 1FN — les valeurs doivent être atomiques (pas de liste dans une cellule).", cost: 50 },
        ],
        options: [
          "La 1FN : chaque attribut doit être atomique (une seule valeur par cellule)",
          "La 3FN : dépendance transitive",
          "L'intégrité référentielle",
          "Aucune : c'est correct",
        ],
        answer: 0,
        explanation: `Stocker **plusieurs numéros** dans une seule cellule viole la **1FN** (chaque valeur doit être **atomique**). Solution : soit des colonnes séparées si le nombre est fixe, soit — mieux — une **table TELEPHONE(id_client FK, numero)** pour un nombre variable. Sans 1FN, impossible de rechercher/trier proprement sur un numéro.`,
        tags: ["modelisation", "normalisation", "1fn"],
      },
      {
        id: "bdd-model-3fn",
        title: "Dépendance transitive (3FN)",
        order: 6,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🧼 Troisième forme normale

Table \`VEHICULE(id_vehicule, id_modele, libelle_modele, id_marque, libelle_marque)\`. Le \`libelle_modele\` dépend de \`id_modele\`, qui n'est pas la clé primaire. Quel est le problème et la solution ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Un attribut non-clé (libelle_modele) dépend d'un autre non-clé (id_modele) = dépendance transitive → 3FN violée.", cost: 25 },
          { text: "📖 Correction : externaliser MODELE (et MARQUE) dans leurs propres tables.", cost: 60 },
        ],
        options: [
          "Dépendance transitive (3FN violée) : il faut sortir MODELE et MARQUE dans des tables séparées",
          "Aucun problème, c'est en BCNF",
          "Violation de la 1FN",
          "Il faut fusionner toutes les tables en une seule",
        ],
        answer: 0,
        explanation: `\`libelle_modele\` dépend de \`id_modele\` (un attribut **non-clé**), lui-même distinct de la clé primaire \`id_vehicule\` → **dépendance transitive**, la **3FN est violée**. Recopier « Clio » dans chaque véhicule Clio = **redondance** et risque d'incohérence. Solution : tables **MODELE(id_modele PK, libelle, id_marque FK)** et **MARQUE(id_marque PK, libelle)** séparées ; VEHICULE ne garde que \`id_modele\` en FK. C'est exactement notre schéma fil rouge.`,
        tags: ["modelisation", "normalisation", "3fn"],
      },
    ],
  },
];
