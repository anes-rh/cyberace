import type { CourseSeed } from "../../../types";

/** Base de données — Module 10 : transactions & ACID (Chapitre 05 + TD sérialisabilité). */
export const transactions: CourseSeed[] = [
  {
    slug: "bdd-transactions",
    title: "Transactions & propriétés ACID",
    checkpoint: "base-de-donnees",
    codename: "All or Nothing",
    domain: "BDD — Concurrence",
    theme: "vault",
    icon: "Database",
    accent: "#93B896",
    order: 10,
    difficulty: "hard",
    summary:
      "Une transaction = un bloc « tout ou rien ». Propriétés ACID, COMMIT/ROLLBACK/SAVEPOINT en pratique, problèmes de concurrence (mise à jour perdue, lecture sale) et, en approfondissement, la sérialisabilité des ordonnancements et les graphes de précédence.",
    objectives: [
      "Définir une transaction et les 4 propriétés ACID",
      "Utiliser COMMIT, ROLLBACK et SAVEPOINT",
      "Identifier les problèmes de concurrence (mise à jour perdue, lecture sale, non répétable)",
      "Comprendre les niveaux d'isolation et le verrouillage",
      "Analyser la sérialisabilité d'un ordonnancement (graphe de précédence)",
    ],
    lesson: `# 🔄 Transactions & ACID — All or Nothing

Un virement bancaire : débiter A **et** créditer B. Si le système plante entre les deux, l'argent disparaît. Une **transaction** garantit que c'est **tout ou rien**. 🏎️

---

## 1. La transaction 🎯

Une **transaction** est une **suite d'opérations** traitée comme **une seule unité indivisible**. Elle se termine par :
- **\`COMMIT\`** : on **valide** → les changements deviennent **permanents et visibles** ;
- **\`ROLLBACK\`** : on **annule** → retour à l'état d'avant.

\`\`\`sql
-- exemple : réaffecter un véhicule d'un client à un autre
UPDATE VEHICULE SET id_client = 2 WHERE id_vehicule = 10;
UPDATE VEHICULE SET id_client = 2 WHERE id_vehicule = 11;
COMMIT;    -- les deux changements sont validés ensemble
-- (ou ROLLBACK; pour tout annuler)
\`\`\`

---

## 2. Les propriétés ACID 🧪

| Lettre | Propriété | Garantie |
|---|---|---|
| **A** | **Atomicité** | tout ou rien : soit **toutes** les opérations réussissent, soit **aucune** |
| **C** | **Cohérence** | la BD passe d'un état **valide** à un autre état **valide** (contraintes respectées) |
| **I** | **Isolation** | les transactions **concurrentes** ne se perturbent pas (comme si elles étaient seules) |
| **D** | **Durabilité** | une fois **COMMIT**, les données **survivent** même à une panne (journalisation) |

> 🧠 **Atomicité** = le virement complet ou rien. **Durabilité** = après COMMIT, même une coupure de courant ne perd pas les données (grâce au **journal**/redo log).

---

## 3. SAVEPOINT — annuler partiellement 📍

\`\`\`sql
INSERT INTO CLIENT VALUES (20, 'Sami', 'Réda', 'Blida', NULL);
SAVEPOINT apres_client;
INSERT INTO VEHICULE VALUES (50, '123-ABC-16', 2021, 3, 20);
-- oups, mauvais véhicule :
ROLLBACK TO apres_client;   -- annule le véhicule, GARDE le client
COMMIT;                     -- valide le client seul
\`\`\`
Un \`SAVEPOINT\` est un **point de reprise** dans la transaction : \`ROLLBACK TO\` revient à ce point **sans** tout annuler.

---

## 4. Les problèmes de concurrence 💥

Quand des transactions s'exécutent **en même temps** sans isolation :

- **Mise à jour perdue** (*lost update*) : T1 et T2 lisent la même valeur, la modifient, écrivent chacune → une des deux écritures **écrase** l'autre (l'incrément est perdu).
- **Lecture sale** (*dirty read* / dépendance non validée) : T2 lit une valeur que T1 a modifiée **mais pas encore validée** ; si T1 fait \`ROLLBACK\`, T2 a lu une valeur **qui n'a jamais existé**.
- **Lecture non répétable** : T1 lit une ligne, T2 la modifie et commit, T1 relit → **valeur différente** dans la même transaction.
- **Lignes fantômes** : T1 relit un ensemble et de **nouvelles** lignes sont apparues (insérées par T2).

**La parade : le verrouillage** (*locking*) et les **niveaux d'isolation** :
| Niveau | Empêche |
|---|---|
| READ COMMITTED (défaut Oracle) | lecture sale |
| REPEATABLE READ | + lecture non répétable |
| SERIALIZABLE | + fantômes (isolation maximale) |

---

## 5. Sérialisabilité (approfondissement) 🔬

Un **ordonnancement** (*schedule*) est l'entrelacement des opérations de plusieurs transactions concurrentes. Il est **sérialisable** s'il produit **le même résultat** qu'une exécution **en série** (l'une après l'autre) — c'est le **critère de correction** de la concurrence.

**Le graphe de précédence** (graphe de sérialisabilité) permet de le vérifier :
- un **nœud** par transaction ;
- un **arc** T_i → T_j si une opération de T_i doit précéder une opération **conflictuelle** de T_j (deux opérations sont en conflit si elles portent sur **la même donnée** et qu'au moins une est une **écriture** : lire/écrire, écrire/écrire).

\`\`\`
   T1 ──► T2 ──► T3      pas de cycle  → SÉRIALISABLE
   T1 ──► T2 ──► T1      CYCLE (T1↔T2) → NON sérialisable
\`\`\`

> 🎯 **Règle** : l'ordonnancement est **sérialisable ⇔ le graphe de précédence est SANS CYCLE** (acyclique). Un cycle = conflit circulaire = pas d'ordre série équivalent. C'est exactement la méthode du TD de sérialisabilité.

---

## 🧠 Ce qu'il faut retenir

- Une **transaction** = un bloc **atomique** terminé par **COMMIT** (valide) ou **ROLLBACK** (annule). \`SAVEPOINT\` = annulation **partielle**.
- **ACID** : **A**tomicité (tout ou rien), **C**ohérence (états valides), **I**solation (concurrentes sans interférence), **D**urabilité (survit aux pannes après COMMIT).
- Problèmes de concurrence : **mise à jour perdue**, **lecture sale** (dirty read), **non répétable**, **fantômes** → réglés par **verrouillage** et **niveaux d'isolation** (READ COMMITTED → SERIALIZABLE).
- Un ordonnancement est **sérialisable** s'il équivaut à une exécution en série ⇔ son **graphe de précédence est acyclique**.

## ⚠️ Erreurs fréquentes des débutants

**1. Oublier le COMMIT.** Sans lui, tes changements ne sont **pas** visibles des autres et disparaissent à la déconnexion. En SQL*Plus, rien n'est permanent avant COMMIT.

**2. Croire qu'un ROLLBACK annule après COMMIT.** Non : une fois **validée**, une transaction est **durable**. ROLLBACK ne défait que ce qui n'est **pas encore** committé.

**3. Confondre atomicité et cohérence.** Atomicité = tout ou rien (mécanique) ; cohérence = respect des **contraintes** métier (le résultat est valide).

**4. Sous-estimer les lectures sales.** Lire une donnée **non validée** peut mener à décider sur une valeur qui sera **annulée** — d'où les niveaux d'isolation.

**5. Déclarer sérialisable un ordonnancement avec cycle.** Un **cycle** dans le graphe de précédence = **non** sérialisable, point.`,
    badge: {
      id: "badge-all-or-nothing",
      name: "All or Nothing",
      icon: "Database",
      description: "Maîtrise transactions ACID, COMMIT/ROLLBACK/SAVEPOINT, concurrence et sérialisabilité.",
    },
    challenges: [
      {
        id: "bdd-tx-acid",
        title: "Le A d'ACID",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧪 Atomicité

Dans ACID, que garantit l'**atomicité** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Pense au virement : débit ET crédit, ou rien.", cost: 20 },
          { text: "📖 Correction : tout ou rien — soit toutes les opérations de la transaction s'appliquent, soit aucune.", cost: 50 },
        ],
        options: [
          "Tout ou rien : soit toutes les opérations de la transaction réussissent, soit aucune n'est appliquée",
          "Que les données survivent à une panne après COMMIT",
          "Que deux transactions ne se perturbent pas",
          "Que la base respecte toujours ses contraintes",
        ],
        answer: 0,
        explanation: `L'**atomicité** = **tout ou rien** : si une opération de la transaction échoue, **toutes** sont annulées (ROLLBACK). Un virement débite A **et** crédite B, jamais l'un sans l'autre. Les autres lettres : **D**urabilité (survit aux pannes après COMMIT), **I**solation (transactions concurrentes indépendantes), **C**ohérence (contraintes respectées).`,
        tags: ["transactions", "acid", "atomicite"],
      },
      {
        id: "bdd-tx-commit",
        title: "Valider une transaction",
        order: 2,
        difficulty: "easy",
        type: "code",
        language: "sql",
        prompt: `## ✅ COMMIT

Tu viens de faire deux UPDATE que tu veux rendre **permanents et visibles** des autres utilisateurs. Écris l'instruction qui **valide** la transaction.`,
        points: 100,
        timeLimitSec: 180,
        starter: ``,
        hints: [
          { text: "Un seul mot-clé.", cost: 10 },
          { text: "📖 Correction : COMMIT;", cost: 25 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [{ label: "Valide avec COMMIT", pattern: "commit", flags: "i" }],
        }),
        explanation: `\`\`\`sql
COMMIT;
\`\`\`
\`COMMIT\` rend les modifications **permanentes** (durabilité) et **visibles** des autres sessions. Avant le COMMIT, tes changements ne sont visibles que dans **ta** session et peuvent être annulés par \`ROLLBACK\`. Après COMMIT, plus de retour en arrière possible.`,
        tags: ["transactions", "commit", "sql"],
      },
      {
        id: "bdd-tx-rollback",
        title: "Annuler après erreur",
        order: 3,
        difficulty: "easy",
        type: "code",
        language: "sql",
        prompt: `## ↩️ ROLLBACK

Tu as fait un \`DELETE\` par erreur (mais **pas encore** de COMMIT). Écris l'instruction qui **annule** toutes les modifications non validées de la transaction en cours.`,
        points: 100,
        timeLimitSec: 180,
        starter: ``,
        hints: [
          { text: "Un seul mot-clé, l'inverse de COMMIT.", cost: 10 },
          { text: "📖 Correction : ROLLBACK;", cost: 25 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [{ label: "Annule avec ROLLBACK", pattern: "rollback", flags: "i" }],
        }),
        explanation: `\`\`\`sql
ROLLBACK;
\`\`\`
\`ROLLBACK\` **annule** toutes les modifications **non encore validées** (pas de COMMIT depuis). C'est le filet de sécurité du DML : un \`DELETE\`/\`UPDATE\` malheureux se rattrape… **tant qu'on n'a pas fait COMMIT**. Après COMMIT, c'est trop tard (durabilité).`,
        tags: ["transactions", "rollback", "sql"],
      },
      {
        id: "bdd-tx-lostupdate",
        title: "La mise à jour perdue",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 💥 Concurrence

T1 et T2 lisent toutes deux \`stock = 10\`, chacune calcule \`stock - 1 = 9\` et écrit 9. Résultat final : **9** (au lieu de 8). Quel problème est-ce ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Une des deux écritures a écrasé l'autre → une décrémentation est perdue.", cost: 25 },
          { text: "📖 Correction : mise à jour perdue (lost update).", cost: 60 },
        ],
        options: [
          "Une mise à jour perdue (lost update) : l'écriture de T2 écrase celle de T1",
          "Une lecture sale (dirty read)",
          "Un interblocage (deadlock)",
          "Une violation de clé étrangère",
        ],
        answer: 0,
        explanation: `C'est une **mise à jour perdue** (*lost update*) : les deux transactions lisent **la même** valeur (10), la modifient indépendamment et écrivent 9 ; la seconde écriture **écrase** la première → une décrémentation est **perdue** (on devrait avoir 8). La parade : **verrouillage** (l'une attend l'autre) ou un niveau d'**isolation** adéquat, ou \`UPDATE stock = stock - 1\` (atomique côté SGBD).`,
        tags: ["transactions", "concurrence", "lost-update"],
      },
      {
        id: "bdd-tx-dirtyread",
        title: "La lecture sale",
        order: 5,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 💥 Dirty read

T1 modifie une ligne **sans encore valider**. T2 **lit** cette valeur modifiée, puis T1 fait **ROLLBACK**. Quel est le problème ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "T2 a lu une valeur qui, finalement, n'a jamais été validée.", cost: 25 },
          { text: "📖 Correction : lecture sale — T2 a lu une donnée non validée qui a été annulée (dépendance non validée).", cost: 60 },
        ],
        options: [
          "Une lecture sale (dirty read) : T2 a lu une donnée non validée qui a ensuite été annulée — elle n'a jamais 'existé'",
          "Une mise à jour perdue",
          "Une lecture non répétable",
          "Aucun problème, c'est normal",
        ],
        answer: 0,
        explanation: `C'est une **lecture sale** (*dirty read* / dépendance non validée) : T2 s'est basée sur une valeur que T1 a finalement **annulée** (ROLLBACK). T2 a donc travaillé sur une donnée **qui n'a jamais été confirmée**. Le niveau d'isolation **READ COMMITTED** (défaut d'Oracle) empêche déjà ce problème : on ne lit que des données **validées**.`,
        tags: ["transactions", "concurrence", "dirty-read"],
      },
      {
        id: "bdd-tx-serial",
        title: "Sérialisabilité par le graphe",
        order: 6,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔬 Graphe de précédence

Pour un ordonnancement de transactions concurrentes, on construit le **graphe de précédence** (un arc T_i → T_j par conflit ordonné). À quelle condition l'ordonnancement est-il **sérialisable** ?

*(Reprise du TD sérialisabilité.)*`,
        points: 300,
        timeLimitSec: 480,
        hints: [
          { text: "Pense à ce qu'un cycle signifierait (T1 avant T2 ET T2 avant T1).", cost: 30 },
          { text: "📖 Correction : sérialisable ⇔ le graphe de précédence est ACYCLIQUE (sans cycle).", cost: 70 },
        ],
        options: [
          "Si et seulement si le graphe de précédence est acyclique (aucun cycle)",
          "Si le graphe contient au moins un cycle",
          "Si toutes les transactions lisent la même donnée",
          "Si toutes les transactions font un COMMIT",
        ],
        answer: 0,
        explanation: `Un ordonnancement est **sérialisable** (⇔ équivalent à une exécution en série) **si et seulement si** son **graphe de précédence est acyclique**. Un **cycle** T1→T2→T1 signifierait « T1 doit passer avant T2 **et** T2 avant T1 » — impossible à sérialiser. On construit le graphe (arc T_i→T_j pour chaque conflit lecture/écriture ou écriture/écriture sur la même donnée où T_i précède T_j), puis on cherche un cycle : **pas de cycle = sérialisable**. C'est la méthode exacte du TD.`,
        tags: ["transactions", "serialisabilite", "graphe-precedence"],
      },
    ],
  },
];
