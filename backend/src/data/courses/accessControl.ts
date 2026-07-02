import type { CourseSeed } from "../../types";

export const accessControl: CourseSeed = {
  slug: "access-control",
  title: "Contrôle d'accès",
  codename: "Access Grid",
  domain: "Contrôle d'accès",
  theme: "grid",
  icon: "Grid3x3",
  accent: "#a78bfa",
  order: 2,
  difficulty: "medium",
  summary:
    "Lis les matrices de droits, propage les permissions avec Take-Grant, et fais respecter Bell-LaPadula sans laisser fuir un octet.",
  objectives: [
    "Lire et interpréter une matrice d'accès (modèle TAM/HRU)",
    "Raisonner sur la propagation de droits avec Take-Grant",
    "Appliquer les propriétés de Bell-LaPadula (confidentialité)",
    "Comparer RBAC, RuBAC et OrBAC",
  ],
  lesson: `## La matrice d'accès (TAM / HRU)

Le modèle **Take-Access-Matrix** représente qui (sujets, en lignes) peut faire quoi (droits) sur quoi (objets, en colonnes). Harrison-Ruzzo-Ullman (HRU) ajoute des **commandes** qui modifient la matrice (créer un objet, accorder/retirer un droit). Résultat clé : la question « ce système est-il sûr ? » (un droit peut-il *fuiter*) est **indécidable** dans le cas général.

## Take-Grant

Un graphe orienté où les arcs portent des droits, dont deux spéciaux : **take** (t) et **grant** (g). Si A a *take* sur B, A peut prendre n'importe quel droit que B possède. Si A a *grant* sur B, A peut donner à B un de ses droits. La propagation se résout en **temps linéaire** — contrairement à HRU — via les règles take/grant/create/remove.

## Bell-LaPadula (confidentialité)

Modèle multiniveau (Non classifié < Confidentiel < Secret < Très secret) :
- **Propriété de sécurité simple** : *no read up* — on ne lit pas plus haut que son niveau.
- **Propriété étoile (\\*-property)** : *no write down* — on n'écrit pas plus bas que son niveau (sinon fuite vers le bas).
- **Tranquillité** : les niveaux ne changent pas pendant une opération.

BLP protège la **confidentialité**. Son miroir, **Biba**, protège l'**intégrité** (no write up / no read down).

## RBAC, RuBAC, OrBAC

- **RBAC** : les permissions sont attachées à des **rôles**, les utilisateurs héritent des rôles. Hiérarchies et séparation des tâches (SoD).
- **RuBAC** : contrôle par **règles** (Rule-Based), typiquement un pare-feu (conditions sur attributs).
- **OrBAC** : *Organisation-Based Access Control* — exprime la politique de façon abstraite (rôle, activité, vue, **contexte**) puis la concrétise. Idéal pour des contextes temporels ou d'urgence.`,
  badge: {
    id: "badge-gatekeeper",
    name: "Gatekeeper",
    icon: "Grid3x3",
    description: "Maîtrise des matrices de droits et des modèles de contrôle d'accès.",
  },
  challenges: [
    {
      id: "ac-matrix-count",
      title: "Audit de la matrice",
      order: 1,
      difficulty: "easy",
      type: "numeric",
      points: 110,
      timeLimitSec: 180,
      prompt:
        "Voici une matrice d'accès (r = read, w = write, x = exec) :\n\n| Sujet | F1 | F2 | Imprimante |\n|-------|----|----|-----------|\n| Alice | r,w | r  | x |\n| Bob   | r   | r,w | — |\n| Carol | —   | r  | x |\n\n**Combien de droits `w` (write) apparaissent au total dans la matrice ?**",
      hints: [{ text: "Cherche chaque cellule contenant un w.", cost: 15 }],
      answer: 2,
      explanation:
        "Deux occurrences : Alice→F1 et Bob→F2. La matrice d'accès énumère explicitement chaque triplet (sujet, objet, droit).",
      tags: ["tam", "matrice"],
    },
    {
      id: "ac-blp-readup",
      title: "Interdiction de lecture vers le haut",
      order: 2,
      difficulty: "easy",
      type: "mcq",
      points: 120,
      timeLimitSec: 150,
      prompt:
        "Un sujet habilité **Confidentiel** tente de lire un document classé **Secret**.\n\nD'après Bell-LaPadula, cet accès est-il autorisé ?",
      options: [
        "Non — cela violerait la propriété de sécurité simple (no read up)",
        "Oui — la lecture est toujours permise",
        "Oui, mais uniquement s'il n'écrit rien",
        "Non — cela violerait la propriété étoile (no write down)",
      ],
      answer: 0,
      hints: [{ text: "Lire au-dessus de son niveau = read up.", cost: 20 }],
      explanation:
        "Confidentiel < Secret : lire vers le haut viole la propriété de sécurité simple (no read up). La \\*-property, elle, concerne l'écriture vers le bas.",
      tags: ["bell-lapadula", "confidentialite"],
    },
    {
      id: "ac-take-grant",
      title: "Propagation take/grant",
      order: 3,
      difficulty: "medium",
      type: "mcq",
      points: 210,
      timeLimitSec: 240,
      prompt:
        "Dans un graphe Take-Grant : le sujet **A** possède le droit **take** sur **B**, et **B** possède le droit **read** sur l'objet **O**.\n\nA peut-il obtenir le droit **read** sur **O** ?",
      options: [
        "Oui : via la règle take, A prend le droit read que B détient sur O",
        "Non : take ne permet pas d'acquérir les droits d'autrui",
        "Uniquement si O accorde explicitement le droit à A",
        "Non : il faudrait que A ait le droit grant sur B",
      ],
      answer: 0,
      hints: [{ text: "take = « je prends un droit que la cible possède ».", cost: 30 }],
      explanation:
        "La règle take autorise A à s'attribuer n'importe quel droit détenu par B, donc read sur O. C'est pourquoi la propagation Take-Grant se calcule en temps linéaire.",
      tags: ["take-grant", "propagation"],
    },
    {
      id: "ac-models-compare",
      title: "Le bon modèle",
      order: 4,
      difficulty: "hard",
      type: "multi",
      points: 320,
      timeLimitSec: 300,
      prompt:
        "Sélectionne **toutes** les affirmations correctes :",
      options: [
        "RBAC attache les permissions à des rôles, pas directement aux utilisateurs",
        "OrBAC introduit explicitement la notion de contexte (temporel, urgence…)",
        "Bell-LaPadula est un modèle d'intégrité, pas de confidentialité",
        "RuBAC (Rule-Based) est typique d'un pare-feu réseau",
      ],
      answer: [0, 1, 3],
      hints: [
        { text: "Un seul énoncé est faux : il confond deux modèles multiniveaux.", cost: 40 },
      ],
      explanation:
        "BLP protège la confidentialité ; c'est Biba qui vise l'intégrité — l'affirmation 3 est donc fausse. RBAC (rôles), OrBAC (contexte) et RuBAC (règles) sont correctement décrits.",
      tags: ["rbac", "orbac", "rubac"],
    },
  ],
};
