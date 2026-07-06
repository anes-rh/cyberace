import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 14 : technologies WAN & encapsulation (PPP/HDLC). */
export const wan: CourseSeed[] = [
  {
    slug: "res-wan",
    title: "Technologies WAN & PPP",
    checkpoint: "reseaux",
    codename: "Long Haul",
    domain: "Réseaux — WAN",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 15,
    difficulty: "medium",
    summary:
      "Sortir du LAN : relier des sites à l'échelle d'une ville, d'un pays, d'un continent. Liaisons dédiées vs commutées, technologies (MPLS, Metro Ethernet, xDSL, fibre, cellulaire), encapsulation série HDLC vs PPP, et l'authentification PPP (PAP/CHAP).",
    objectives: [
      "Distinguer LAN et WAN (portée, propriété, débit, fournisseur)",
      "Classer les technologies WAN : dédiées, commutées, à commutation de paquets, Internet",
      "Comprendre le rôle du fournisseur d'accès (opérateur), du CPE, DTE/DCE",
      "Comparer les encapsulations série HDLC et PPP",
      "Expliquer PPP (LCP, NCP) et son authentification PAP vs CHAP",
    ],
    lesson: `# 🛰️ Technologies WAN & PPP — le Long Haul

Un **LAN** couvre un bâtiment. Mais comment relier le **siège à Paris** et l'**agence à Alger** ? On ne tire pas son propre câble sur 1 500 km : on loue les services d'un **opérateur** (fournisseur d'accès). Bienvenue dans le monde du **WAN**. 🏎️

> 📎 Prérequis : modèle OSI (couches 1-2), adressage IP, routage.

---

## 1. LAN vs WAN : deux mondes 🌍

| Critère | **LAN** | **WAN** |
|---|---|---|
| Portée | un site (bâtiment, campus) | ville, pays, continent |
| Propriété | l'**entreprise** possède le réseau | l'**opérateur** possède l'infrastructure |
| Débit | très élevé (1-100 Gbit/s) | souvent plus limité, **loué** |
| Coût | achat unique du matériel | **abonnement** mensuel récurrent |
| Couches OSI | 1-2 (Ethernet, Wi-Fi) | surtout 1-2 côté liaison |

> 🧭 Un WAN **relie des LAN** entre eux à travers un territoire géographique étendu, via les services d'un **fournisseur d'accès**.

---

## 2. Le vocabulaire de la bordure WAN 📐

Là où le réseau de l'entreprise rencontre celui de l'opérateur, on parle du **point de démarcation** :

\`\`\`
   Réseau client (entreprise)     │  Réseau opérateur (WAN)
                                  │
 [Routeur]───[CSU/DSU]───────────┤ boucle locale ├─────► nuage opérateur
   DTE          DCE           démarcation
   (CPE : Customer Premises Equipment)
\`\`\`

- **CPE** : équipement chez le client (routeur, modem…).
- **DTE** (*Data Terminal Equipment*) : l'équipement **terminal** (le routeur du client).
- **DCE** (*Data Communications Equipment*) : équipement qui fournit **l'horloge** et l'accès au réseau opérateur (modem, CSU/DSU). En labo Packet Tracer, le côté **DCE** d'un câble série impose le \`clock rate\`.
- **Boucle locale** : le câble entre le client et le central de l'opérateur.

---

## 3. Panorama des technologies WAN 🗺️

On les classe par **mode de connexion** :

**a) Liaisons dédiées (leased lines)** — un lien **point-à-point** loué en permanence (ex. T1/E1). Débit garanti, simple, mais **cher** et peu flexible. Encapsulation série : **HDLC** ou **PPP**.

**b) Commutation de circuits** — un circuit est **établi à la demande** puis libéré (RTC, RNIS/ISDN). Historique, aujourd'hui marginal.

**c) Commutation de paquets** — le trafic partage l'infrastructure de l'opérateur : **Frame Relay** (ancien), **MPLS** (moderne, l'opérateur commute selon des **labels**, gère la QoS et les VPN), **Metro Ethernet** (Ethernet à l'échelle métropolitaine).

**d) Accès Internet / haut débit** — **xDSL** (sur la paire téléphonique), **câble** (coaxial), **fibre** (FTTH), **cellulaire 4G/5G**, **satellite**. Souvent combinés à un **VPN** pour sécuriser (voir chapitre précédent).

> 🏁 Tendance actuelle : **MPLS**, **Metro Ethernet** et **VPN sur Internet fibre** dominent ; Frame Relay et RNIS sont en voie de disparition.

---

## 4. Encapsulation série : HDLC vs PPP 🔌

Sur une **liaison série** point-à-point, il faut une **encapsulation** de couche 2 :

- **HDLC** (*High-Level Data Link Control*) : simple, encapsulation **par défaut** sur les interfaces série Cisco. Problème : la version Cisco est **propriétaire** → un HDLC Cisco ne dialogue pas forcément avec un routeur d'une autre marque.
- **PPP** (*Point-to-Point Protocol*) : **standard ouvert**, interopérable, riche en fonctions. À privilégier entre équipements **multi-constructeurs**.

---

## 5. PPP en détail : LCP + NCP 🧩

PPP fonctionne en **deux sous-couches** :

\`\`\`
 ┌─────────────────────────────────────────────┐
 │  NCP  (Network Control Protocol)             │  ← 1 par protocole L3 (IPCP pour IP…)
 ├─────────────────────────────────────────────┤
 │  LCP  (Link Control Protocol)                │  ← établit/teste/ferme le lien,
 │                                              │    négocie authentification, compression…
 ├─────────────────────────────────────────────┤
 │  Média physique série                        │
 └─────────────────────────────────────────────┘
\`\`\`

- **LCP** établit, configure et teste la liaison ; il négocie les **options** (authentification, compression, détection de boucle, multilink).
- **NCP** configure chaque **protocole de couche 3** transporté (IPCP pour IPv4, etc.).

### Authentification PPP : PAP vs CHAP

PPP peut **authentifier** le pair avant d'ouvrir le lien :

| | **PAP** | **CHAP** |
|---|---|---|
| Mot de passe | envoyé **en clair** | **jamais** envoyé en clair |
| Mécanisme | 2 échanges (login/mot de passe) | **défi-réponse** (challenge) + hachage MD5 |
| Répétition | une seule fois à l'ouverture | **périodique** pendant la session |
| Sécurité | **faible** | **forte** (à privilégier) |

> 🔐 **CHAP** ne transmet jamais le mot de passe : l'authentifieur envoie un **défi** aléatoire, le pair renvoie un **hachage** (défi + secret). Impossible à rejouer.

---

## 🧠 Ce qu'il faut retenir

- Le **WAN** relie des LAN à l'échelle géographique via un **opérateur** (l'entreprise **loue**, ne possède pas l'infra).
- **DTE** = routeur client ; **DCE** = fournit l'**horloge** (\`clock rate\`) et l'accès opérateur ; **CPE** = équipement chez le client.
- Technologies : **dédiées** (leased line), **commutation de circuits** (RTC/RNIS), **de paquets** (Frame Relay, **MPLS**, Metro Ethernet), **haut débit** (xDSL, câble, fibre, 4G/5G).
- Encapsulation série : **HDLC** (défaut, propriétaire Cisco) vs **PPP** (standard, interopérable).
- **PPP** = **LCP** (établit/négocie le lien) + **NCP** (configure chaque protocole L3).
- Authentification PPP : **PAP** (clair, faible) vs **CHAP** (défi-réponse haché, **fort**).

## ⚠️ Erreurs fréquentes des débutants

**1. Croire que l'entreprise « possède » son WAN.** Non : elle **loue** les services de l'**opérateur**, qui possède l'infrastructure. C'est pour ça qu'on paie un **abonnement**.

**2. Oublier le \`clock rate\` côté DCE.** Sur une liaison série de labo, c'est le côté **DCE** qui **cadence** le lien. Sans \`clock rate\`, l'interface reste down (line protocol down).

**3. Laisser HDLC entre deux marques différentes.** Le HDLC Cisco est **propriétaire** ; entre un routeur Cisco et un autre constructeur, utilise **PPP** (standard).

**4. Utiliser PAP en production.** PAP envoie le mot de passe **en clair** → **CHAP** est presque toujours préférable (défi-réponse, jamais de mot de passe transmis).

**5. Confondre LCP et NCP.** **LCP** gère le **lien** (ouverture, auth, options) ; **NCP** gère les **protocoles L3** transportés (IPCP pour IP). L'un ne remplace pas l'autre.`,
    badge: {
      id: "badge-long-haul",
      name: "Long Haul",
      icon: "Network",
      description: "Maîtrise les technologies WAN et l'encapsulation série PPP (LCP/NCP, PAP/CHAP).",
    },
    challenges: [
      {
        id: "res-wan-proprio",
        title: "Qui possède le WAN ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🌍 LAN vs WAN

Quelle affirmation décrit correctement un **WAN** par rapport à un **LAN** ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Qui possède les câbles longue distance : l'entreprise ou l'opérateur ?", cost: 15 },
          { text: "📖 Correction complète : l'entreprise loue les services d'un opérateur qui possède l'infra WAN.", cost: 40 },
        ],
        options: [
          "Le WAN couvre une grande zone géographique et l'entreprise loue les services d'un opérateur",
          "Le WAN est toujours plus rapide qu'un LAN",
          "Le WAN appartient entièrement à l'entreprise, comme le LAN",
          "Le WAN ne relie jamais deux LAN",
        ],
        answer: 0,
        explanation: `Un **WAN** relie des LAN à l'échelle **géographique** (ville, pays, continent). Contrairement au LAN — que l'entreprise **possède** —, l'infrastructure WAN appartient à un **opérateur** dont l'entreprise **loue** les services (abonnement récurrent). Le débit WAN est souvent **inférieur** au LAN, pas supérieur.`,
        tags: ["wan", "lan", "operateur"],
      },
      {
        id: "res-wan-dce",
        title: "DTE, DCE et horloge",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔌 Liaison série

Sur une liaison série point-à-point, quel équipement fournit le **signal d'horloge** (\`clock rate\`) ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "DTE = terminal (routeur client) ; DCE = communication (fournit l'accès et le rythme).", cost: 20 },
          { text: "📖 Correction complète : le DCE fournit l'horloge ; sans clock rate côté DCE, le lien reste down.", cost: 50 },
        ],
        options: [
          "Le DCE (Data Communications Equipment)",
          "Le DTE (Data Terminal Equipment)",
          "Le CPE uniquement",
          "Aucun : l'horloge est automatique",
        ],
        answer: 0,
        explanation: `Le **DCE** (*Data Communications Equipment*, ex. CSU/DSU, modem) fournit le **signal d'horloge** qui cadence la liaison. Le **DTE** (le routeur client) s'y synchronise. En labo Packet Tracer, on met \`clock rate\` sur l'extrémité **DCE** du câble série — sinon l'interface reste **down**.`,
        tags: ["wan", "serie", "dte", "dce"],
      },
      {
        id: "res-wan-hdlc-ppp",
        title: "HDLC ou PPP ?",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔗 Encapsulation entre deux marques

Tu dois relier un routeur **Cisco** et un routeur d'un **autre constructeur** par une liaison série. Quelle encapsulation choisir et pourquoi ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "Le HDLC de Cisco est propriétaire. Quel protocole est un standard ouvert ?", cost: 20 },
          { text: "📖 Correction complète : PPP, car standard et interopérable ; le HDLC Cisco est propriétaire.", cost: 50 },
        ],
        options: [
          "PPP : standard ouvert et interopérable entre constructeurs",
          "HDLC : c'est toujours le meilleur choix",
          "Aucune encapsulation n'est nécessaire",
          "Ethernet, car il fonctionne sur les liens série",
        ],
        answer: 0,
        explanation: `Le **HDLC** de Cisco est **propriétaire** : il ne s'entend pas forcément avec un routeur d'une autre marque. **PPP** est un **standard ouvert**, **interopérable** et plus riche (authentification, compression, multilink). Entre équipements **multi-constructeurs**, on choisit **PPP**.`,
        tags: ["wan", "ppp", "hdlc", "encapsulation"],
      },
      {
        id: "res-wan-pap-chap",
        title: "PAP vs CHAP",
        order: 4,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🔐 Authentification PPP

Coche **toutes** les affirmations **vraies** au sujet de **CHAP** (comparé à PAP) :`,
        points: 300,
        timeLimitSec: 420,
        options: [
          "CHAP n'envoie jamais le mot de passe en clair",
          "CHAP utilise un mécanisme de défi-réponse (challenge)",
          "CHAP peut ré-authentifier périodiquement pendant la session",
          "CHAP envoie le mot de passe en clair, comme PAP",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "PAP = clair, une fois. CHAP = défi-réponse haché, répétable.", cost: 30 },
          { text: "📖 Correction complète : CHAP ne transmet jamais le mot de passe (défi-réponse MD5) et peut se répéter en cours de session.", cost: 70 },
        ],
        explanation: `**CHAP** ne transmet **jamais** le mot de passe : l'authentifieur envoie un **défi** aléatoire, le pair renvoie un **hachage** (défi + secret, MD5). Il peut se **répéter** pendant la session. **PAP**, lui, envoie login/mot de passe **en clair**, une seule fois → **faible**. La dernière affirmation décrit PAP, pas CHAP.`,
        tags: ["wan", "ppp", "chap", "pap", "authentification"],
      },
      {
        id: "res-wan-ppp-config",
        title: "Activer PPP + CHAP",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🖥️ Config Cisco

Sur l'interface \`Serial0/0/0\` de R1, active l'encapsulation **PPP** et l'authentification **CHAP**. (On suppose que le nom d'utilisateur/mot de passe du pair est déjà défini avec \`username\`.)`,
        points: 300,
        timeLimitSec: 480,
        starter: `interface Serial0/0/0
`,
        hints: [
          { text: "encapsulation ppp, puis ppp authentication chap.", cost: 30 },
          { text: "📖 Correction complète :\n```\ninterface Serial0/0/0\nencapsulation ppp\nppp authentication chap\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.9,
          keypoints: [
            { label: "Sélectionne l'interface série", pattern: "interface\\s+Serial0/0/0", flags: "i" },
            { label: "Active l'encapsulation PPP", pattern: "encapsulation\\s+ppp", flags: "i" },
            { label: "Active l'authentification CHAP", pattern: "ppp\\s+authentication\\s+chap", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
interface Serial0/0/0
 encapsulation ppp            ! passe de HDLC (défaut) à PPP
 ppp authentication chap      ! exige CHAP à l'ouverture du lien
\`\`\`

Il faut aussi, en amont, un \`username <nom-du-pair> password <secret>\` **identique des deux côtés** (le hostname du pair sert de nom). Vérifie avec \`show interfaces serial 0/0/0\` (doit indiquer *Encapsulation PPP*, LCP *Open*).`,
        tags: ["wan", "ppp", "chap", "config", "cisco"],
      },
    ],
  },
];
