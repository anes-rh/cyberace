import type { CourseSeed } from "../../../types";

/**
 * Réseaux — Chapitres 1 & 2 : introduction (LAN/MAN/WAN, topologies, supports)
 * et modèles OSI / TCP-IP (couches, encapsulation, couche réseau).
 */
export const introOsi: CourseSeed[] = [
  {
    slug: "res-intro-osi",
    title: "Introduction aux réseaux & modèles OSI / TCP-IP",
    checkpoint: "reseaux",
    codename: "Grid Start",
    domain: "Réseaux — fondamentaux",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 3,
    difficulty: "easy",
    summary:
      "Le grand départ : ce qu'est un réseau (LAN/MAN/WAN), les topologies et supports de transmission, puis les deux modèles en couches qui structurent tout — OSI (7 couches) et TCP/IP (4 couches) — avec l'encapsulation des données de bout en bout.",
    objectives: [
      "Distinguer LAN, MAN et WAN et citer des exemples",
      "Reconnaître les topologies (bus, étoile, anneau, maillée) et les supports (cuivre, fibre, radio)",
      "Nommer et ordonner les 7 couches du modèle OSI et les 4 de TCP/IP",
      "Expliquer l'encapsulation et les noms des unités de données (PDU)",
      "Situer l'adressage et le routage dans la bonne couche",
    ],
    lesson: `# 🌐 Introduction aux réseaux & modèles en couches — le Grid Start

Un **réseau**, c'est un ensemble d'équipements reliés pour **échanger des données**. Derrière chaque « ça marche », il y a une organisation en **couches** ultra-rigoureuse. Ce module pose les fondations : vocabulaire, topologies, et les deux modèles de référence — **OSI** et **TCP/IP**. 🏎️

---

## 1. Classer les réseaux par étendue : LAN / MAN / WAN 📏

| Type | Étendue | Exemple |
|---|---|---|
| **LAN** (*Local Area Network*) | un site : bureau, campus, maison | le réseau d'une salle de TP, ton Wi-Fi domestique |
| **MAN** (*Metropolitan Area Network*) | une ville | réseau reliant plusieurs sites d'une entreprise dans une agglomération |
| **WAN** (*Wide Area Network*) | pays, continent, planète | **Internet**, liaison entre agences distantes via un opérateur |

> 🧠 Repère : c'est **l'étendue géographique** qui distingue LAN/MAN/WAN, pas le nombre de machines.

---

## 2. Topologies d'interconnexion 🕸️

La **topologie** décrit *comment* les équipements sont reliés.

\`\`\`
  BUS               ÉTOILE              ANNEAU            MAILLÉE
  A─B─C─D           A   B               A─B               A───B
  (un seul bus)      \\ /                │ │               │╲ ╱│
                      S (switch)        D─C               │ ╳ │
                     / \\                                  │╱ ╲│
                    C   D                                 D───C
\`\`\`

| Topologie | Idée | + / − |
|---|---|---|
| **Bus** | un câble partagé | simple / une coupure casse tout, collisions |
| **Étoile** | tout passe par un **switch** central | la plus courante en LAN / dépend du central |
| **Anneau** | chaque nœud relié au suivant en boucle | déterministe / une rupture gêne l'anneau |
| **Maillée** | chacun relié à plusieurs autres | très **résiliente** / coûteuse en liens |

En pratique, un LAN moderne est en **étoile** (autour de switches), et le cœur des opérateurs est **maillé** pour la redondance.

---

## 3. Supports de transmission 🔌

- **Cuivre (paire torsadée)** — câbles Ethernet RJ45 (UTP/STP). Bon marché, courtes distances (~100 m).
- **Fibre optique** — la lumière dans du verre. Très haut débit, longues distances, insensible aux perturbations électromagnétiques.
- **Sans fil (radio)** — Wi-Fi, 4G/5G. Mobilité, mais partagé et sensible aux interférences.

Types de câbles cuivre en TP : **droit** (PC ↔ switch/routeur), **croisé** (switch ↔ switch, PC ↔ PC, routeur ↔ routeur), **série** (liaisons WAN routeur ↔ routeur). Packet Tracer propose le **câble automatique** ⚡ qui choisit pour toi.

---

## 4. Pourquoi des couches ? 🍰

Faire dialoguer deux machines, c'est **énorme** : signal électrique, adresses, fiabilité, format des données… On **découpe** le problème en **couches** empilées : chaque couche rend un service à celle du dessus et s'appuie sur celle du dessous. Avantage : on peut changer une couche (ex. passer du cuivre à la fibre) **sans toucher aux autres**.

---

## 5. Le modèle OSI — 7 couches 🏛️

Le modèle de référence **OSI** (*Open Systems Interconnection*) définit **7 couches**, de la plus haute (l'application) à la plus basse (le câble) :

\`\`\`
 7  Application    ← les logiciels (HTTP, DNS, FTP…)
 6  Présentation   ← format, chiffrement, encodage
 5  Session        ← ouverture/suivi/fermeture des dialogues
 4  Transport      ← fiabilité, ports (TCP / UDP)
 3  Réseau         ← adressage logique (IP) & ROUTAGE
 2  Liaison        ← adressage physique (MAC), trames, switch
 1  Physique       ← bits, signaux, câbles, connecteurs
\`\`\`

**Moyen mnémotechnique** (du bas 1 vers le haut 7) : *« **P**hysique **L**iaison **R**éseau **T**ransport **S**ession **P**résentation **A**pplication »*.

À retenir absolument :
- **Couche 3 (Réseau)** = **adresse IP** et **routage** (choisir le chemin entre réseaux) → c'est LE cœur de ce checkpoint.
- **Couche 2 (Liaison)** = **adresse MAC**, trames, **switch** (commutation dans un même réseau local).
- **Couche 4 (Transport)** = **ports**, **TCP** (fiable, avec accusés) vs **UDP** (rapide, sans garantie).

---

## 6. Le modèle TCP/IP — 4 couches (celui d'Internet) 🌍

Internet suit le modèle **TCP/IP**, plus compact (**4 couches**). Correspondance avec OSI :

| TCP/IP (4) | ≈ OSI | Rôle | Exemples |
|---|---|---|---|
| **Application** | 5-6-7 | services utilisateur | HTTP, DNS, DHCP, FTP |
| **Transport** | 4 | bout à bout, ports | TCP, UDP |
| **Internet** | 3 | adressage IP, routage | IP, ICMP, routeurs |
| **Accès réseau** | 1-2 | trame + support physique | Ethernet, Wi-Fi, MAC |

---

## 7. L'encapsulation : des poupées russes 🪆

Quand tes données descendent la pile (émetteur), **chaque couche ajoute son en-tête** ; à la réception, chaque couche **retire** le sien (décapsulation). L'unité de données change de nom à chaque couche — la **PDU** :

\`\`\`
 Application :         [ Données ]
 Transport   :      [ TCP | Données ]            → SEGMENT (UDP: datagramme)
 Réseau      :   [ IP | TCP | Données ]          → PAQUET
 Liaison     : [ MAC | IP | TCP | Données | FCS ] → TRAME
 Physique    :  0101110101010101110…            → BITS
\`\`\`

**Vocabulaire à connaître par cœur** :
- Couche **Transport** → **segment** (TCP) / datagramme (UDP)
- Couche **Réseau** → **paquet**
- Couche **Liaison** → **trame**
- Couche **Physique** → **bits**

Chaque couche de la machine réceptrice « parle » à la **même couche** de l'émetteur (communication *pair-à-pair* logique).

---

## 8. Zoom sur la couche Réseau (couche 3) 📦

C'est la couche que ce checkpoint va disséquer :
- **Adressage logique** : chaque interface a une **adresse IP** (indépendante du matériel, contrairement à la MAC).
- **Routage** : les **routeurs** choisissent, paquet par paquet, le **meilleur chemin** vers le réseau de destination.
- **Segmentation / fragmentation** : découper les données pour respecter la taille maximale d'une trame (**MTU**), puis les réassembler.

Un **paquet** IP contient notamment : **adresse source**, **adresse destination**, **TTL** (durée de vie, décrémentée à chaque routeur pour éviter les boucles), et les données.

---

## 🧠 Ce qu'il faut retenir

- **LAN** (site) ⊂ **MAN** (ville) ⊂ **WAN** (Internet) — critère : l'**étendue**.
- Topologie LAN dominante = **étoile** (switch central) ; cœur opérateur = **maillé**.
- **OSI = 7 couches** (Physique→Application), **TCP/IP = 4 couches** (Accès→Application).
- **Couche 3 = IP + routage** ; **couche 2 = MAC + switch** ; **couche 4 = ports, TCP/UDP**.
- **Encapsulation** : segment (4) → paquet (3) → trame (2) → bits (1).
- Un paquet IP porte source, destination et **TTL** (anti-boucle).

## ⚠️ Erreurs fréquentes des débutants

**1. Confondre couche 2 et couche 3.** La **MAC** (couche 2) identifie une carte **dans un LAN** ; l'**IP** (couche 3) identifie une interface **à l'échelle d'Internet** et permet le **routage** entre réseaux. Un **switch** travaille en couche 2, un **routeur** en couche 3.

**2. Mélanger les noms de PDU.** À la couche transport c'est un **segment**, à la couche réseau un **paquet**, à la couche liaison une **trame**. Dire « une trame IP » est faux — IP transporte des **paquets**.

**3. Croire que TCP/IP et OSI s'opposent.** OSI est le **modèle de référence pédagogique** (7 couches) ; TCP/IP est le **modèle réellement utilisé** sur Internet (4 couches). Ils se **correspondent**, ils ne se concurrencent pas.

**4. Inverser l'ordre des couches.** La couche **1 est Physique** (le bas, le câble), la **7 est Application** (le haut). Beaucoup récitent la liste à l'envers — fixe le sens avec le moyen mnémotechnique.

**5. Penser que le câble croisé est « meilleur ».** Droit vs croisé dépend des **équipements reliés**, pas de la qualité. En Packet Tracer, le câble **automatique** évite l'erreur.`,
    badge: {
      id: "badge-grid-start",
      name: "Grid Start",
      icon: "Network",
      description: "Maîtrise le vocabulaire réseau, les topologies et les modèles OSI/TCP-IP avec l'encapsulation.",
    },
    challenges: [
      {
        id: "res-osi-lan-man-wan",
        title: "LAN, MAN ou WAN ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 📏 Classer par étendue

**Internet** — qui relie des équipements à l'échelle de la planète — est un exemple de quel type de réseau ?`,
        points: 100,
        timeLimitSec: 180,
        hints: [
          { text: "Le critère est l'étendue géographique. Internet couvre le monde entier.", cost: 15 },
          { text: "📖 Correction complète : WAN (Wide Area Network) — la plus grande étendue.", cost: 40 },
        ],
        options: ["LAN (réseau local)", "MAN (réseau métropolitain)", "WAN (réseau étendu)", "PAN (réseau personnel)"],
        answer: 2,
        explanation: `Internet est le **WAN** par excellence (*Wide Area Network*) : il relie des réseaux à l'échelle mondiale via des opérateurs. Le **LAN** couvre un site, le **MAN** une ville. Le critère décisif est **l'étendue géographique**.`,
        tags: ["reseaux", "lan-wan", "intro"],
      },
      {
        id: "res-osi-ordre-couches",
        title: "Ordonner les couches OSI",
        order: 2,
        difficulty: "medium",
        type: "order",
        prompt: `## 🏛️ Le modèle OSI

Remets les couches du modèle **OSI** dans l'ordre, **de la plus basse (1) à la plus haute (7)**.`,
        points: 200,
        timeLimitSec: 420,
        options: ["Physique", "Liaison", "Réseau", "Transport", "Session", "Présentation", "Application"],
        answer: [0, 1, 2, 3, 4, 5, 6],
        hints: [
          { text: "La couche 1 est la plus proche du câble (Physique), la 7 la plus proche de l'utilisateur (Application).", cost: 20 },
          { text: "Mnémo : Physique, Liaison, Réseau, Transport, Session, Présentation, Application.", cost: 30 },
          { text: "📖 Correction complète : 1 Physique · 2 Liaison · 3 Réseau · 4 Transport · 5 Session · 6 Présentation · 7 Application.", cost: 60 },
        ],
        explanation: `De bas en haut : **1 Physique · 2 Liaison · 3 Réseau · 4 Transport · 5 Session · 6 Présentation · 7 Application**.

Retiens surtout : **3 = Réseau (IP, routage)**, **2 = Liaison (MAC, switch)**, **4 = Transport (ports, TCP/UDP)** — ce sont celles qu'on manipule sans cesse en réseau.`,
        tags: ["reseaux", "osi", "intro"],
      },
      {
        id: "res-osi-couche-routage",
        title: "Où se fait le routage ?",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📦 La bonne couche

L'**adressage IP** et le **routage** (choisir le chemin entre réseaux) relèvent de quelle couche OSI ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "L'IP identifie une interface à l'échelle d'Internet ; ce n'est pas la couche du câble ni celle de la MAC.", cost: 20 },
          { text: "📖 Correction complète : couche 3, la couche Réseau (IP + routeurs).", cost: 50 },
        ],
        options: ["Couche 2 — Liaison", "Couche 3 — Réseau", "Couche 4 — Transport", "Couche 7 — Application"],
        answer: 1,
        explanation: `L'**adresse IP** et le **routage** sont en **couche 3 (Réseau)**. C'est là qu'opèrent les **routeurs**. La couche 2 (Liaison) gère la **MAC** et les **switches** dans un même LAN ; la couche 4 (Transport) gère les **ports** et TCP/UDP.`,
        tags: ["reseaux", "osi", "routage", "intro"],
      },
      {
        id: "res-osi-pdu",
        title: "Le nom de l'unité de données",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🪆 Encapsulation

À la **couche Réseau (3)**, comment s'appelle l'unité de données (la PDU) après ajout de l'en-tête IP ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Segment = transport (4), trame = liaison (2). La couche 3 a son propre nom.", cost: 20 },
          { text: "📖 Correction complète : à la couche Réseau, la PDU est le PAQUET.", cost: 50 },
        ],
        options: ["Une trame", "Un segment", "Un paquet", "Un bit"],
        answer: 2,
        explanation: `À la **couche Réseau**, la PDU est le **paquet** (en-tête IP + segment). Rappel de la chaîne d'encapsulation : **segment** (transport 4) → **paquet** (réseau 3) → **trame** (liaison 2) → **bits** (physique 1). Dire « trame IP » est donc incorrect.`,
        tags: ["reseaux", "encapsulation", "intro"],
      },
      {
        id: "res-osi-tcpip-couches",
        title: "Combien de couches dans TCP/IP ?",
        order: 5,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🌍 Le modèle d'Internet

Le modèle **TCP/IP** (celui réellement utilisé sur Internet) compte combien de couches ?`,
        points: 100,
        timeLimitSec: 180,
        hints: [
          { text: "Il est plus compact qu'OSI : Application, Transport, Internet, Accès réseau.", cost: 15 },
          { text: "📖 Correction complète : 4 couches (Accès réseau, Internet, Transport, Application).", cost: 40 },
        ],
        answer: 4,
        explanation: `**TCP/IP = 4 couches** : Accès réseau (≈ OSI 1-2), Internet (≈ 3), Transport (≈ 4), Application (≈ 5-6-7). Il **regroupe** les couches hautes et basses d'OSI. OSI en a 7, TCP/IP en a 4 — les deux se **correspondent**.`,
        tags: ["reseaux", "tcp-ip", "intro"],
      },
      {
        id: "res-osi-switch-vs-routeur",
        title: "Switch vs routeur",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔀 Deux équipements, deux couches

Lequel de ces énoncés est **correct** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Le switch travaille avec les adresses MAC (dans un LAN) ; le routeur avec les adresses IP (entre réseaux).", cost: 20 },
          { text: "📖 Correction complète : switch = couche 2 (MAC, commutation LAN) ; routeur = couche 3 (IP, routage entre réseaux).", cost: 50 },
        ],
        options: [
          "Le switch route les paquets entre réseaux différents (couche 3)",
          "Le switch commute les trames dans un LAN via les MAC (couche 2), le routeur relie des réseaux via les IP (couche 3)",
          "Le routeur travaille en couche 2 avec les adresses MAC",
          "Switch et routeur font exactement la même chose",
        ],
        answer: 1,
        explanation: `Le **switch** opère en **couche 2** : il commute des **trames** au sein d'un LAN en s'appuyant sur les **adresses MAC**. Le **routeur** opère en **couche 3** : il achemine des **paquets** entre **réseaux différents** grâce aux **adresses IP** et à sa table de routage. Ce sont deux rôles complémentaires, pas interchangeables.`,
        tags: ["reseaux", "switch", "routeur", "intro"],
      },
    ],
  },
];
