import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 6 : routage dynamique, vue d'ensemble + statique vs dynamique. */
export const routageDynamique: CourseSeed[] = [
  {
    slug: "res-routage-dynamique",
    title: "Routage dynamique — vue d'ensemble & statique vs dynamique",
    checkpoint: "reseaux",
    codename: "Auto Pilot",
    domain: "Réseaux — routage",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 7,
    difficulty: "medium",
    summary:
      "Quand écrire les routes à la main devient ingérable, les routeurs apprennent tout seuls : protocoles à vecteur de distance vs à état de liens, distance administrative, métriques, IGP/EGP, convergence. Et surtout : quand choisir statique ou dynamique.",
    objectives: [
      "Comparer routage statique et dynamique (avantages/inconvénients)",
      "Distinguer protocoles à vecteur de distance et à état de liens",
      "Comprendre la distance administrative (départager plusieurs sources)",
      "Situer IGP (RIP, OSPF) vs EGP (BGP)",
      "Comprendre métrique et convergence",
    ],
    lesson: `# 🤖 Routage dynamique — l'Auto Pilot

En **statique**, l'admin écrit chaque route. Sur 3 routeurs, ça va ; sur **300**, c'est un cauchemar — et si un lien tombe, **rien** ne se réadapte. Le **routage dynamique** : les routeurs **s'échangent** leurs informations et **construisent eux-mêmes** leurs tables, puis **réagissent** aux pannes. 🏎️

---

## 1. Statique vs dynamique ⚖️

| Critère | Statique | Dynamique |
|---|---|---|
| Configuration | manuelle, route par route | automatique (le protocole apprend) |
| Passage à l'échelle | pénible dès quelques routeurs | excellent |
| Réaction aux pannes | **aucune** (il faut réécrire) | **automatique** (reconverge) |
| Charge CPU/bande passante | nulle | consomme (messages, calculs) |
| Sécurité / prévisibilité | totale, déterministe | dépend des annonces reçues |

> 🧠 En pratique on **combine** : dynamique au cœur (grands réseaux), statique pour un cas simple ou une route par défaut vers Internet.

---

## 2. Deux grandes familles 🌳

### 2.1 Vecteur de distance (*distance vector*)
Chaque routeur annonce à ses voisins **« voici les réseaux que je connais et à quelle distance »** — il ne voit que ce que ses voisins lui disent (« routage par ouï-dire »). Exemples : **RIP**, EIGRP.
- Simple, peu gourmand ; convergence plus lente, risque de **boucles** (parades : split horizon, holddown).

### 2.2 État de liens (*link state*)
Chaque routeur connaît la **carte complète** du réseau (tous les liens) et calcule le plus court chemin (**algorithme de Dijkstra**). Exemple : **OSPF**.
- Convergence rapide, sans boucle ; plus gourmand en CPU/mémoire.

---

## 3. La distance administrative (AD) 🏅

Un routeur peut apprendre le **même** réseau de **plusieurs** sources (statique **et** OSPF, par ex.). Laquelle croire ? La **distance administrative** = indice de **confiance** (plus **petit** = plus fiable) :

| Source | AD |
|---|---|
| Connecté (C) | **0** |
| Statique (S) | **1** |
| EIGRP | 90 |
| OSPF | **110** |
| RIP | **120** |
| Externe / inconnu | 255 (jamais utilisé) |

> Exemple : si un réseau est appris par **OSPF (110)** et par **RIP (120)**, le routeur garde la route **OSPF** (AD plus faible).

---

## 4. La métrique 📏

À l'intérieur d'un **même** protocole, s'il y a plusieurs chemins, on départage par la **métrique** (le « coût ») — définie différemment selon le protocole :

- **RIP** : nombre de **sauts** (*hop count*), max 15.
- **OSPF** : **coût** basé sur la **bande passante** (liens rapides = coût faible).
- **EIGRP** : combinaison bande passante + délai.

**AD d'abord** (quelle source croire), **métrique ensuite** (quel chemin dans cette source).

---

## 5. IGP vs EGP & convergence 🌍

- **IGP** (*Interior Gateway Protocol*) : routage **à l'intérieur** d'une organisation (un *AS*). Ex : **RIP, OSPF, EIGRP**.
- **EGP** (*Exterior Gateway Protocol*) : routage **entre** organisations, à l'échelle d'Internet. Ex : **BGP**.

La **convergence** = le temps que **tous** les routeurs aient une vision cohérente **après** un changement (panne, nouveau lien). Un bon protocole **converge vite**. Pendant la convergence, des paquets peuvent se perdre ou boucler.

---

## 🧠 Ce qu'il faut retenir

- **Statique** = manuel, déterministe, aucune réaction aux pannes ; **dynamique** = auto-apprentissage + reconvergence.
- **Vecteur de distance** (RIP, ouï-dire) vs **état de liens** (OSPF, carte complète + Dijkstra).
- **Distance administrative** = confiance dans la **source** (C=0, S=1, OSPF=110, RIP=120) → plus petit gagne.
- **Métrique** = coût **au sein** d'un protocole (RIP = sauts, OSPF = bande passante).
- **IGP** (RIP/OSPF) à l'intérieur d'un AS, **EGP** (BGP) entre AS.

## ⚠️ Erreurs fréquentes des débutants

**1. Confondre distance administrative et métrique.** L'**AD** départage des **sources différentes** (statique vs OSPF) ; la **métrique** départage des chemins **dans la même** source. On regarde l'AD **d'abord**.

**2. Croire qu'un « meilleur » protocole gagne toujours.** Le routeur garde la route de **plus petite AD**, pas la plus « intelligente ». Une route **statique (1)** l'emporte sur une route **OSPF (110)** du même réseau.

**3. Penser que le dynamique élimine tout statique.** On garde souvent une **route par défaut statique** vers Internet, même avec OSPF à l'intérieur.

**4. Oublier le coût du dynamique.** Les protocoles consomment CPU, mémoire et bande passante (messages périodiques ou événementiels) — négligeable en général, mais réel.

**5. Confondre vecteur de distance et état de liens.** RIP ne voit **que ses voisins** (par ouï-dire) ; OSPF connaît **toute la carte**. C'est la différence fondamentale.`,
    videos: [
      { title: "Routage statique vs dynamique — différences", youtubeId: "74C4OMP08J4", moreUrl: "https://www.youtube.com/playlist?list=PLgAuOjTVwB6xyoFFor4O5ly03N4_ekV0D" },
    ],
    badge: {
      id: "badge-auto-pilot",
      name: "Auto Pilot",
      icon: "Network",
      description: "Comprend le routage dynamique, la distance administrative et le choix statique/dynamique.",
    },
    challenges: [
      {
        id: "res-rd-ad-choix",
        title: "OSPF ou RIP : qui gagne ?",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🏅 Distance administrative

Un routeur apprend le réseau \`10.0.0.0/8\` **à la fois** par **OSPF** (AD 110) et par **RIP** (AD 120).

**Quelle route installe-t-il dans sa table ?**`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "La distance administrative la plus PETITE = la plus fiable.", cost: 20 },
          { text: "📖 Correction complète : OSPF (110) < RIP (120) → route OSPF.", cost: 50 },
        ],
        options: ["La route RIP", "La route OSPF", "Les deux (partage de charge)", "Aucune, conflit"],
        answer: 1,
        explanation: `On compare la **distance administrative** : OSPF = **110**, RIP = **120**. La plus **petite** = la plus fiable → le routeur installe la route **OSPF**. La métrique n'intervient qu'**après**, pour départager des chemins d'une **même** source.`,
        tags: ["routage", "dynamique", "distance-administrative"],
      },
      {
        id: "res-rd-familles",
        title: "Vecteur de distance ou état de liens ?",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🌳 Familles de protocoles

Quel protocole construit une **carte complète** du réseau et calcule les plus courts chemins avec **Dijkstra** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "C'est un protocole à ÉTAT DE LIENS (link state), pas à vecteur de distance.", cost: 20 },
          { text: "📖 Correction complète : OSPF (link state, Dijkstra). RIP est à vecteur de distance.", cost: 50 },
        ],
        options: ["RIP", "OSPF", "Route statique", "DHCP"],
        answer: 1,
        explanation: `**OSPF** est un protocole **à état de liens** : chaque routeur possède la **carte complète** du réseau et applique **Dijkstra** pour trouver les plus courts chemins. **RIP**, lui, est à **vecteur de distance** (il ne connaît que ce que ses voisins lui annoncent). DHCP et les routes statiques ne sont pas des protocoles de routage dynamique.`,
        tags: ["routage", "dynamique", "ospf", "rip"],
      },
      {
        id: "res-rd-ad-statique",
        title: "AD d'une route statique",
        order: 3,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🏅 Valeur à connaître

Quelle est la **distance administrative** par défaut d'une **route statique** ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Juste après le connecté (0), très fiable.", cost: 15 },
          { text: "📖 Correction complète : 1.", cost: 40 },
        ],
        answer: 1,
        explanation: `Une **route statique** a une AD de **1** (juste après le **connecté** = 0). C'est pourquoi une route statique l'emporte sur toute route apprise dynamiquement (OSPF 110, RIP 120) pour le même réseau — l'admin est présumé savoir ce qu'il fait.`,
        tags: ["routage", "distance-administrative"],
      },
      {
        id: "res-rd-igp-egp",
        title: "IGP ou EGP ?",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🌍 À l'intérieur ou entre organisations ?

Le protocole **BGP**, qui fait fonctionner le routage **entre** les grands opérateurs d'Internet, est un…`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Il route ENTRE les systèmes autonomes (AS), pas à l'intérieur.", cost: 20 },
          { text: "📖 Correction complète : BGP = EGP (Exterior Gateway Protocol).", cost: 50 },
        ],
        options: ["IGP (Interior Gateway Protocol)", "EGP (Exterior Gateway Protocol)", "Un protocole statique", "Un protocole de couche 2"],
        answer: 1,
        explanation: `**BGP** est un **EGP** : il assure le routage **entre** systèmes autonomes (AS) — c'est le protocole qui « tient » Internet. Les **IGP** (RIP, OSPF, EIGRP) routent **à l'intérieur** d'une même organisation/AS.`,
        tags: ["routage", "igp", "egp", "bgp"],
      },
      {
        id: "res-rd-metrique-rip",
        title: "La métrique de RIP",
        order: 5,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 📏 Le coût selon RIP

Sur quoi RIP se base-t-il pour choisir entre deux chemins (sa **métrique**) ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "RIP compte quelque chose de très simple entre la source et la destination.", cost: 15 },
          { text: "📖 Correction complète : le nombre de sauts (hop count), max 15.", cost: 40 },
        ],
        options: [
          "Le nombre de sauts (routeurs traversés)",
          "La bande passante des liens",
          "Le délai et la charge",
          "L'adresse IP la plus basse",
        ],
        answer: 0,
        explanation: `La métrique de **RIP** est le **nombre de sauts** (*hop count*) : le chemin qui traverse **le moins de routeurs** gagne, avec un maximum de **15** (16 = « inatteignable »). C'est simple mais naïf : RIP ignore la **vitesse** des liens (OSPF, lui, se base sur la **bande passante**).`,
        tags: ["routage", "rip", "metrique"],
      },
    ],
  },
];
