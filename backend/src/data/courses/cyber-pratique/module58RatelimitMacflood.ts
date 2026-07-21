import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 58 (Défense) : limitation de débit iptables. Réutilise la cible du Module 4. */
export const module58RatelimitMacflood: CourseSeed[] = [
  {
    slug: "prat-defense-ratelimit-macflood",
    title: "Limitation de débit — réponse mesurée à un abus de trafic",
    checkpoint: "defense",
    codename: "Silent Throttle",
    domain: "Défense — Filtrage réseau",
    theme: "grid",
    icon: "Gauge",
    accent: "#C4C46B",
    order: 58,
    difficulty: "medium",
    summary:
      "L'hôte du Module 4 génère toujours son flot d'adresses MAC aléatoires. Plutôt qu'un blocage total, tu mets en place une limitation de débit iptables : accepter jusqu'à un seuil, rejeter le surplus. Une réponse proportionnée — mais la leçon est honnête : ce filtrage IP n'est PAS la contre-mesure structurelle du MAC flooding (couche 2).",
    objectives: [
      "Reconfirmer l'activité (tcpdump -e sur les MAC)",
      "Comprendre l'inconvénient d'un DROP total pour une source à usage mixte",
      "Utiliser le module iptables limit (-m limit)",
      "Ordonner correctement ACCEPT-limité puis DROP",
      "Reconnaître honnêtement la limite : IP (L3) vs table CAM (L2)",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module4-macflood-noise:latest",
      ttlSec: 900,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🎚️ Limitation de débit — Silent Throttle

Bloquer entièrement une source est parfois **trop brutal**. La **limitation de débit** offre une réponse graduée : on absorbe l'usage normal, on écrête l'abus. ⚖️

---

## 🧭 Le briefing

> *"L'hôte du Module 4 génère toujours son flot d'adresses MAC aléatoires. Cette fois, plutôt qu'un blocage total, mets en place une limitation de débit — une réponse plus mesurée, applicable même quand une source a aussi un usage légitime occasionnel."*

\`attacker\` a **NET_RAW** + **NET_ADMIN**.

---

## ⚠️ Honnêteté technique (à lire absolument)

**\`macof\` (Module 4) opère au niveau de la couche 2** (inondation de la table CAM d'un commutateur). La **limitation de débit iptables agit au niveau IP (couche 3/4)** : elle **ne s'attaque donc PAS** au mécanisme précis de saturation de la table CAM. La vraie contre-mesure **structurelle** du MAC flooding, vue au Module 4, reste la **sécurité de port / Dynamic ARP Inspection** au niveau du **commutateur**.

Ce module illustre un principe **général et différent** : la limitation de débit comme réponse proportionnée à **n'importe quel abus volumétrique** — pas une solution ciblée pour le MAC flooding en particulier. Ne t'y trompe pas.

---

## 1. Reconfirmer 🔍

\`\`\`bash
tcpdump -i eth0 -e -n        # -e affiche les adresses MAC (source/destination)
\`\`\`

Tu vois défiler une multitude d'**adresses MAC source différentes** — la signature de \`macof\`.

---

## 2. Limiter plutôt que bloquer 🎛️

Un **DROP total** couperait aussi tout **trafic légitime** de cette même source. À la place, le module **\`-m limit\`** autorise un débit maximal :

\`\`\`bash
iptables -A INPUT -s target -m limit --limit 10/second -j ACCEPT
iptables -A INPUT -s target -j DROP
\`\`\`

- 1re règle : accepte jusqu'à **10 paquets/seconde** de \`target\`.
- 2e règle : **rejette le surplus**.

---

## 3. L'ordre est crucial 🔢

iptables évalue les règles **dans l'ordre** : la **première qui correspond** s'applique. La règle **ACCEPT-limitée doit précéder** le DROP général — sinon le DROP attraperait tout en premier et la limite ne servirait à rien. Vérifie avec \`iptables -L -v -n\` que l'ACCEPT apparaît **avant** le DROP.

---

## 4. Quand c'est pertinent ✅

La limitation de débit brille pour **absorber des pics** tout en se protégeant d'un abus, **sans couper** une source qui a aussi un usage légitime. C'est une **mitigation partielle et proportionnée**, à la différence des blocages totaux des Modules 42/47/52.

## 🧠 À retenir

- Voir les MAC : \`tcpdump -i eth0 -e -n\`.
- Limiter : \`-m limit --limit 10/second\` (ACCEPT) + une règle DROP après.
- **Ordre** : ACCEPT-limité **avant** DROP (première règle qui matche gagne).
- **Honnêteté** : ce filtrage IP (L3) n'est **pas** la parade structurelle du MAC flooding (L2 = port security / DAI au switch).
- Utile en général pour **écrêter un abus volumétrique** sans couper une source à usage mixte.`,
    badge: {
      id: "badge-prat-ratelimit",
      name: "Régulateur de Débit",
      icon: "Gauge",
      description: "A choisi la limitation plutôt que le blocage total, et su expliquer pourquoi.",
    },
    challenges: [
      {
        id: "prat-ratelimit-t1",
        title: "Reconfirmer l'activité",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔍 Voir les adresses MAC

**Question :** quelle commande tcpdump affiche les adresses MAC (niveau liaison) pour observer le flot de macof ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "tcpdump -i eth0 -e -n",
        accept: ["tcpdump -e"],
        caseSensitive: false,
        explanation: `\`tcpdump -i eth0 -e -n\` : l'option \`-e\` affiche les **adresses MAC** source/destination. On voit alors défiler des centaines de MAC sources différentes — la signature de \`macof\` (Module 4).`,
        tags: ["defense", "ratelimit", "tcpdump"],
      },
      {
        id: "prat-ratelimit-t2",
        title: "Limite d'un blocage total",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ✂️ Le revers du DROP total

**Question :** quel inconvénient aurait un DROP total si cet hôte avait aussi un usage légitime occasionnel ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Il couperait aussi tout trafic légitime provenant de cette même source",
          "Il n'aurait aucun inconvénient",
          "Un DROP total est techniquement impossible avec iptables",
          "Cela ralentirait uniquement le trafic sortant",
        ],
        answer: 0,
        explanation: `Un DROP total est **binaire** : il coupe TOUT de la source, y compris ses éventuels échanges légitimes. Si l'hôte rend aussi un service utile, on le paralyse — d'où l'intérêt d'une limitation graduée.`,
        tags: ["defense", "ratelimit", "drop"],
      },
      {
        id: "prat-ratelimit-t3",
        title: "Le module de limitation",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎛️ L'option de débit

**Question :** quelle option iptables permet de limiter un débit plutôt que de tout bloquer ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "-m limit",
        caseSensitive: true,
        explanation: `Le module **\`-m limit\`** (avec \`--limit N/second\`) fait matcher une règle seulement jusqu'à un certain **débit**. Au-delà, elle cesse de matcher — ce qui permet de laisser passer une part et de traiter le reste autrement.`,
        tags: ["defense", "ratelimit", "iptables"],
      },
      {
        id: "prat-ratelimit-t4",
        title: "Écrire les deux règles",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🧩 Le duo ACCEPT + DROP

**Question :** quelles DEUX commandes combinées acceptent le trafic de 'target' jusqu'à 10 paquets/seconde et rejettent le surplus ?`,
        points: 250,
        timeLimitSec: 500,
        hints: [
          { text: "La première règle ACCEPT avec la limite doit être ajoutée AVANT la règle DROP générale.", cost: 25 },
        ],
        answer: "iptables -A INPUT -s target -m limit --limit 10/second -j ACCEPT puis iptables -A INPUT -s target -j DROP",
        caseSensitive: true,
        explanation: `\`iptables -A INPUT -s target -m limit --limit 10/second -j ACCEPT\` **puis** \`iptables -A INPUT -s target -j DROP\` : jusqu'à 10 pkt/s acceptés, le surplus tombe sur le DROP. L'ordre d'ajout garantit que l'ACCEPT-limité est évalué en premier.`,
        tags: ["defense", "ratelimit", "regles"],
      },
      {
        id: "prat-ratelimit-t5",
        title: "Pourquoi cet ordre précis",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔢 L'ordre des règles

**Question :** pourquoi la règle ACCEPT avec limite doit-elle être ajoutée AVANT la règle DROP générale ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "iptables traite les règles dans l'ordre ; la première qui correspond s'applique, donc le DROP général ne doit pas court-circuiter la règle de limite",
          "L'ordre des règles n'a jamais d'importance dans iptables",
          "DROP doit toujours être la toute première règle",
          "ACCEPT et DROP ne peuvent jamais coexister sur la même chaîne",
        ],
        answer: 0,
        explanation: `iptables évalue **de haut en bas** ; la première règle qui matche décide. Si le DROP général était en premier, il attraperait tout et l'ACCEPT-limité ne serait jamais atteint. L'ordre fait toute la logique.`,
        tags: ["defense", "ratelimit", "ordre"],
      },
      {
        id: "prat-ratelimit-t6",
        title: "La limite honnête de cette approche",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚠️ L2 vs L3

**Question :** cette limitation de débit constitue-t-elle la contre-mesure structurelle recommandée contre le MAC flooding spécifiquement (vu au Module 4) ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: [
          "Non — elle agit au niveau IP, pas sur la table CAM du commutateur ; la vraie contre-mesure structurelle reste la sécurité de port/DAI au niveau du commutateur",
          "Oui, c'est la solution recommandée en toutes circonstances",
          "Le MAC flooding n'a aucune contre-mesure connue",
          "iptables opère toujours au niveau de la couche 2",
        ],
        answer: 0,
        explanation: `**Non.** \`macof\` sature la table CAM en **couche 2** ; iptables filtre en **couche 3/4**. La parade structurelle du MAC flooding est la **sécurité de port / DAI** sur le **commutateur** (Module 4). Ce module illustre un principe général de rate-limiting, pas une solution CAM.`,
        tags: ["defense", "ratelimit", "couches"],
      },
      {
        id: "prat-ratelimit-t7",
        title: "Quand cette technique est pertinente",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ✅ Le bon cas d'usage

**Question :** dans quel cas général cette limitation de débit est-elle malgré tout une bonne pratique ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Pour absorber des pics de trafic tout en se protégeant d'un abus, sans couper complètement une source ayant aussi un usage légitime",
          "Uniquement contre le MAC flooding",
          "Uniquement sur les réseaux IPv6",
          "Jamais, cette technique est obsolète",
        ],
        answer: 0,
        explanation: `Le rate-limiting est idéal pour **écrêter un abus volumétrique** (pics, floods applicatifs) tout en laissant passer l'usage normal — protéger sans couper. C'est une mitigation proportionnée, largement utilisée (SSH, HTTP, ICMP…).`,
        tags: ["defense", "ratelimit", "usage"],
      },
      {
        id: "prat-ratelimit-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Mitigation partielle

**Question :** en quoi ce module diffère-t-il des Modules 42, 47 et 52 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Il introduit une mitigation PARTIELLE et proportionnée plutôt qu'un blocage total",
          "Il n'utilise pas iptables, contrairement à eux",
          "Il nécessite des capacités réseau différentes",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Les Modules 42 (blocage source), 47 (confinement), 52 (blocage type ICMP) **coupent**. Ici, on **module** : accepter jusqu'à un seuil, écrêter le reste. La limitation de débit est une réponse **graduée**, pas un tout-ou-rien.`,
        tags: ["defense", "ratelimit", "synthese"],
      },
    ],
  },
];
