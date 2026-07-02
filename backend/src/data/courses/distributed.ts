import type { CourseSeed } from "../../types";

export const distributed: CourseSeed = {
  slug: "distributed-systems",
  title: "Systèmes distribués & sécurité",
  codename: "Sync Orbit",
  domain: "Systèmes distribués",
  theme: "orbit",
  icon: "Orbit",
  accent: "#818cf8",
  order: 7,
  difficulty: "medium",
  summary:
    "Ordonne le temps sans horloge globale (Lamport), partage la section critique (Ricart-Agrawala) et élis un leader dans l'anneau (Chang-Roberts).",
  objectives: [
    "Appliquer les règles des horloges logiques de Lamport",
    "Calculer le coût en messages de Ricart-Agrawala",
    "Dérouler l'algorithme d'élection de Chang-Roberts",
    "Relier ordonnancement et cohérence à la sécurité",
  ],
  lesson: `## Le temps sans horloge globale : Lamport

Sans horloge physique commune, on ordonne les événements avec une **horloge logique** (un compteur par processus) :

1. Avant tout événement local ou envoi : \`C = C + 1\`.
2. Un message emporte l'estampille \`C\` de l'envoi.
3. À la réception d'un message d'estampille \`t\` : \`C = max(C, t) + 1\`.

Cela garantit la relation *happened-before* (→) : si a → b alors C(a) < C(b). Les **horloges vectorielles** vont plus loin en caractérisant aussi la concurrence.

## Exclusion mutuelle : Ricart-Agrawala

Pour entrer en **section critique**, un processus envoie un **REQUEST** (horodaté) à tous les autres et attend un **REPLY** de chacun. Un pair répond tout de suite sauf s'il veut lui-même entrer avec une estampille plus petite (priorité au plus ancien). Coût : **2·(N-1)** messages par entrée pour N processus.

## Élection : Chang-Roberts (anneau)

Sur un anneau unidirectionnel, chaque candidat fait circuler son **identifiant**. Chaque nœud ne relaie que l'ID **supérieur** au sien (et abandonne sinon). L'identifiant **maximum** finit par revenir à son émetteur : il devient **leader**. Complexité O(N²) au pire, O(N log N) en moyenne.

## Lien avec la sécurité

L'ordonnancement fiable et l'exclusion mutuelle sont la base de la **cohérence** et de la **tolérance aux pannes** (jusqu'aux consensus byzantins). Une horloge manipulée, c'est des logs incohérents et des rejeux non détectés.`,
  badge: {
    id: "badge-clockmaster",
    name: "Clockmaster",
    icon: "Orbit",
    description: "Maîtrise le temps logique, l'exclusion mutuelle et l'élection distribuée.",
  },
  challenges: [
    {
      id: "dist-lamport-rule",
      title: "Règle de réception",
      order: 1,
      difficulty: "easy",
      type: "mcq",
      points: 120,
      timeLimitSec: 150,
      prompt:
        "À la **réception** d'un message estampillé `t`, comment un processus met-il à jour son horloge de Lamport `C` ?",
      options: [
        "C = max(C, t) + 1",
        "C = C + t",
        "C = t",
        "C = min(C, t)",
      ],
      answer: 0,
      hints: [{ text: "On prend le plus grand des deux, puis on avance d'un cran.", cost: 20 }],
      explanation:
        "La règle de réception est C = max(C, t) + 1 : elle garantit que la réception suit strictement l'envoi dans l'ordre causal.",
      tags: ["lamport", "horloge"],
    },
    {
      id: "dist-lamport-compute",
      title: "Estampille de réception",
      order: 2,
      difficulty: "medium",
      type: "numeric",
      points: 220,
      timeLimitSec: 300,
      widget: "lamport",
      prompt:
        "Deux processus démarrent à C = 0.\n\n**P1** : événement local (C→1), puis **envoi** du message m (C→2, m porte l'estampille 2).\n\n**P2** : événement local (C→1), puis **réception** de m.\n\nQuelle est la valeur de l'horloge de Lamport de **P2 à la réception de m** ? (le simulateur peut t'aider)",
      hints: [
        { text: "Applique C = max(C_local, t_message) + 1.", cost: 30 },
        { text: "max(1, 2) + 1.", cost: 45 },
      ],
      answer: 3,
      explanation:
        "P2 a C = 1 avant réception ; m porte 2. Donc C = max(1, 2) + 1 = 3. L'estampille de réception dépasse toujours celle de l'envoi.",
      tags: ["lamport", "calcul"],
    },
    {
      id: "dist-ricart-cost",
      title: "Coût de la section critique",
      order: 3,
      difficulty: "medium",
      type: "numeric",
      points: 210,
      timeLimitSec: 200,
      prompt:
        "Avec **Ricart-Agrawala** et **N = 5** processus, combien de messages (REQUEST + REPLY) sont échangés pour **une** entrée en section critique ?",
      hints: [{ text: "2 messages (REQUEST puis REPLY) avec chacun des N-1 autres.", cost: 30 }],
      answer: 8,
      explanation:
        "2·(N-1) = 2·4 = 8 messages : un REQUEST vers chaque autre processus, puis un REPLY de chacun.",
      tags: ["ricart-agrawala", "exclusion-mutuelle"],
    },
    {
      id: "dist-chang-roberts",
      title: "Le roi de l'anneau",
      order: 4,
      difficulty: "hard",
      type: "numeric",
      points: 320,
      timeLimitSec: 240,
      prompt:
        "Sur un anneau, l'élection de **Chang-Roberts** est lancée. Les identifiants présents sont : **3, 7, 2, 9, 5**.\n\nQuel identifiant devient **leader** ?",
      hints: [{ text: "Seul l'ID maximum survit à un tour complet de l'anneau.", cost: 40 }],
      answer: 9,
      explanation:
        "Chaque nœud ne relaie que les ID supérieurs au sien ; l'identifiant maximum (9) est le seul à revenir à son émetteur → il est élu leader.",
      tags: ["chang-roberts", "election"],
    },
  ],
};
