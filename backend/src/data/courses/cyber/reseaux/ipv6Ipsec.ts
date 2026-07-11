import type { CourseSeed } from "../../../../types";

/** Cyber · Réseaux — Module 6 : IPv6 et IPsec approfondi (AH/ESP, modes, IKE, VPN). */
export const ipv6Ipsec: CourseSeed[] = [
  {
    slug: "cyr-ipv6-ipsec",
    title: "IPv6 et IPsec approfondi",
    checkpoint: "cyber-reseaux",
    codename: "Secure Tunnel",
    domain: "Réseaux — IPv6 & IPsec",
    theme: "grid",
    icon: "Lock",
    accent: "#5FB3C6",
    order: 6,
    difficulty: "hard",
    summary:
      "Le chiffrement réseau en profondeur : caractéristiques d'IPv6 et ses enjeux de sécurité (NDP), IPsec en détail — en-têtes AH (authentification/intégrité) et ESP (chiffrement), modes transport vs tunnel, associations de sécurité (SA) et IKE — puis les technologies VPN (PPTP, L2TP/IPsec, VPN SSL).",
    objectives: [
      "Connaître les caractéristiques d'IPv6 et ses risques de sécurité (NDP, RA)",
      "Distinguer les en-têtes IPsec AH (intégrité/authenticité) et ESP (chiffrement)",
      "Différencier les modes transport et tunnel d'IPsec",
      "Comprendre les associations de sécurité (SA) et le rôle d'IKE",
      "Comparer les VPN : PPTP, L2TP/IPsec et VPN SSL",
    ],
    resources: [
      {
        label: "IETF RFC 4301 — Security Architecture for the Internet Protocol (IPsec)",
        url: "https://datatracker.ietf.org/doc/html/rfc4301",
        kind: "link",
        note: "L'architecture de référence d'IPsec : SA, AH, ESP, modes, politiques de sécurité.",
      },
      {
        label: "IETF RFC 8200 — Internet Protocol, Version 6 (IPv6) Specification",
        url: "https://datatracker.ietf.org/doc/html/rfc8200",
        kind: "link",
        note: "La spécification de référence d'IPv6 (format d'en-tête, adressage, extensions).",
      },
    ],
    lesson: `# 🔐 IPv6 et IPsec approfondi — Secure Tunnel

Deux sujets liés à la couche 3 : **IPv6**, le protocole d'adressage moderne (qui **intègre** nativement IPsec), et **IPsec** lui-même, la boîte à outils qui **chiffre et authentifie** le trafic IP. Ce module détaille les **en-têtes AH/ESP**, les **modes**, et les **VPN**. 🏎️

---

## 1. IPv6 : caractéristiques et sécurité 🌐

IPv4 est **à court d'adresses** (~4,3 milliards, épuisées). **IPv6** le remplace progressivement.

### Caractéristiques clés

- **Adresses sur 128 bits** (contre 32 en IPv4) → un espace **quasi illimité** (~3,4 × 10³⁸ adresses). Notation **hexadécimale** en 8 groupes (ex. \`2001:db8::1\`).
- **Fin du NAT** : chaque appareil peut avoir une **adresse publique** unique → retour du modèle **bout-en-bout** (mais le NAT n'était pas une sécurité, cf. module 4).
- **Autoconfiguration (SLAAC)** : un hôte se **configure seul** son adresse à partir des annonces du routeur (**RA**, *Router Advertisement*), sans DHCP obligatoire.
- **En-tête simplifié et fixe** (40 octets) + **en-têtes d'extension** chaînés → traitement plus efficace par les routeurs.
- **NDP** (*Neighbor Discovery Protocol*) remplace ARP (et utilise **ICMPv6**) pour la découverte des voisins et des routeurs.
- **IPsec** : historiquement présenté comme **obligatoire** dans IPv6 (désormais **recommandé**), il est **intégré** à l'architecture.

### Enjeux de sécurité IPv6

- **Attaques sur NDP/RA** : comme ARP en IPv4, **NDP n'est pas authentifié** par défaut → **spoofing NDP**, **faux Router Advertisement** (un attaquant s'annonce comme routeur → MITM). Parades : **RA Guard**, **ND Inspection**, **SEND** (*Secure Neighbor Discovery*).
- **Double pile IPv4/IPv6** : IPv6 souvent **actif par défaut** mais **non surveillé** (pare-feu/IDS réglés pour IPv4) → **angle mort**. Il faut **filtrer et surveiller IPv6 autant qu'IPv4**.
- **Tunnels de transition** (6to4, Teredo) : peuvent **contourner** les contrôles s'ils ne sont pas maîtrisés.

> 🧭 Erreur classique : croire qu'IPv6 est « plus sûr » et l'ignorer. En réalité, un IPv6 **non filtré** est une **porte ouverte** parallèle. La règle : appliquer à IPv6 **la même rigueur** qu'à IPv4.

---

## 2. IPsec : l'architecture 🧰

**IPsec** protège le trafic IP grâce à un ensemble de composants :
- Des **protocoles de protection** : **AH** et **ESP**.
- Des **modes** : **transport** et **tunnel**.
- Des **associations de sécurité (SA)** : un « contrat » unidirectionnel définissant les algorithmes, clés et paramètres pour un flux (identifié par un **SPI**, *Security Parameter Index*).
- **IKE** (*Internet Key Exchange*) : négocie les SA et **échange les clés** de façon sécurisée (authentification par clé pré-partagée ou **certificats**, puis Diffie-Hellman).

---

## 3. Les en-têtes AH et ESP 📑

C'est le cœur du sujet. IPsec offre **deux** protocoles, aux rôles distincts :

### AH — Authentication Header

**AH** assure l'**intégrité** et l'**authenticité** de l'origine, ainsi que l'**anti-rejeu** — **mais PAS la confidentialité** (aucun chiffrement). Il calcule un **ICV** (condensat authentifié) couvrant le paquet, **y compris certains champs de l'en-tête IP** (l'authentification est « étendue »).

\`\`\`
   AH protège :  ✅ intégrité   ✅ authenticité   ✅ anti-rejeu   ❌ confidentialité
\`\`\`

Conséquence : AH étant lié à l'en-tête IP, il est **incompatible avec le NAT** (le NAT modifie l'IP → l'ICV devient invalide). AH est aujourd'hui **peu utilisé seul**.

### ESP — Encapsulating Security Payload

**ESP** assure la **confidentialité** (chiffrement de la charge utile) **et**, optionnellement, l'**intégrité/authenticité** et l'**anti-rejeu**. C'est le protocole **le plus utilisé** (il offre tout ce qu'on attend d'un VPN).

\`\`\`
   ESP protège :  ✅ confidentialité   ✅ intégrité*   ✅ authenticité*   ✅ anti-rejeu
                  (* si l'authentification ESP est activée)
\`\`\`

À la différence d'AH, ESP **n'authentifie pas l'en-tête IP externe** → il est **compatible avec le NAT** (via **NAT-T**, *NAT Traversal*, qui encapsule ESP dans UDP).

| | **AH** | **ESP** |
|---|---|---|
| Confidentialité (chiffrement) | ❌ | ✅ |
| Intégrité / authenticité | ✅ | ✅ (optionnel) |
| Anti-rejeu | ✅ | ✅ |
| Authentifie l'en-tête IP | ✅ (d'où incompatibilité NAT) | ❌ (compatible NAT via NAT-T) |
| Usage courant | rare (seul) | **standard des VPN** |

> 🧠 Retenir : **AH = intégrité/authenticité sans chiffrement** ; **ESP = chiffrement (+ intégrité optionnelle)**. Pour un VPN moderne, on utilise **ESP** (souvent seul). On peut combiner AH+ESP, mais c'est rare.

---

## 4. Les modes : transport vs tunnel 🚇

IPsec s'applique de deux façons :

### Mode transport

Seule la **charge utile** (les données) du paquet IP est protégée ; l'**en-tête IP original est conservé**. Utilisé pour une communication **d'hôte à hôte** (les deux extrémités font elles-mêmes l'IPsec).

\`\`\`
   Transport :  [ IP orig ][ ESP ][ données chiffrées ]
                 ▲ en-tête IP visible (routage inchangé)
\`\`\`

### Mode tunnel

Le **paquet IP entier** (en-tête inclus) est **encapsulé et chiffré** dans un **nouveau** paquet IP. Utilisé pour les **VPN site-à-site** et **accès distant** entre **passerelles** : l'adressage interne est **caché**.

\`\`\`
   Tunnel :  [ NOUVELLE IP ][ ESP ][ IP orig + données  →  tout chiffré ]
              ▲ en-têtes des passerelles ; l'IP interne d'origine est masquée
\`\`\`

> 🧭 Règle : **hôte-à-hôte** → **transport** ; **passerelle-à-passerelle (VPN de site / accès distant)** → **tunnel**. Le mode **tunnel** est le plus courant en entreprise (module 5).

---

## 5. Les technologies VPN 🔒

Un **VPN** (*Virtual Private Network*) crée un **réseau privé virtuel** au-dessus d'un réseau public. Principales technologies :

- **PPTP** (*Point-to-Point Tunneling Protocol*) : ancien, simple, mais **cryptographiquement cassé** (MS-CHAPv2, MPPE) → **à ne plus utiliser**. Cité pour mémoire historique.
- **L2TP/IPsec** : **L2TP** crée le tunnel (mais **ne chiffre pas** à lui seul), et **IPsec** (ESP) apporte le **chiffrement/l'intégrité**. Combinaison **robuste et répandue** pour l'accès distant.
- **VPN SSL/TLS** (*SSL VPN*) : utilise **TLS** (le même que HTTPS) pour établir le tunnel. Deux formes : **portail** (accès à des applications web via le navigateur, sans client) et **client** (*full tunnel*, agent installé). Avantages : passe facilement les **pare-feu** (port 443), **granularité** applicative, pas de configuration IPsec lourde. Très utilisé pour le **télétravail**.
- **IPsec (tunnel)** : le standard **site-à-site** (module 5), aussi utilisé en **accès distant** (client IPsec).

> 🧠 Choix typique : **IPsec (tunnel)** pour relier des **sites**, **VPN SSL** ou **L2TP/IPsec** pour l'**accès distant** des utilisateurs. **PPTP est à bannir** (cassé). Un VPN chiffre le transport mais **n'authentifie pas** l'utilisateur à lui seul → à coupler avec une **authentification forte (MFA)**.

---

## 🧠 À retenir

- **IPv6** : adresses **128 bits** (espace immense), **fin du NAT** (bout-en-bout), **SLAAC** (autoconfig via **RA**), **NDP/ICMPv6** remplace ARP, **IPsec intégré**. Risques : **NDP/RA non authentifiés** (spoofing, faux routeur → parades **RA Guard**, **SEND**), IPv6 **actif mais non filtré** (angle mort) → **même rigueur qu'IPv4**.
- **IPsec** = **AH** + **ESP**, modes **transport/tunnel**, **SA** (contrat unidirectionnel, id **SPI**), **IKE** (négocie SA + échange de clés).
- **AH** : **intégrité + authenticité + anti-rejeu**, **PAS de chiffrement** ; authentifie l'en-tête IP → **incompatible NAT** ; peu utilisé seul.
- **ESP** : **chiffrement** (+ intégrité/authenticité **optionnelles** + anti-rejeu) ; **compatible NAT** (NAT-T) → **standard des VPN**.
- **Modes** : **transport** (protège la charge utile, en-tête IP conservé, **hôte-à-hôte**) vs **tunnel** (encapsule **tout** le paquet, **passerelle-à-passerelle**, masque l'adressage interne).
- **VPN** : **PPTP** = **cassé, à bannir** ; **L2TP/IPsec** = L2TP tunnelise + IPsec chiffre (robuste) ; **VPN SSL/TLS** = via port 443, portail ou client, idéal **télétravail** ; **IPsec tunnel** = **site-à-site**. Toujours coupler à une **authentification forte (MFA)**.`,
    badge: {
      id: "badge-cyr-secure-tunnel",
      name: "Secure Tunnel",
      icon: "Lock",
      description: "Maîtrise IPv6 et sa sécurité, les en-têtes AH/ESP, les modes IPsec et les technologies VPN.",
    },
    challenges: [
      {
        id: "cyr-ipsec-ah-esp",
        title: "AH ou ESP ?",
        order: 1,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 📑 En-têtes IPsec

Quelle est la différence fondamentale entre les en-têtes IPsec **AH** et **ESP** ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Un seul des deux chiffre réellement la charge utile.", cost: 30 },
          { text: "📖 Correction : AH = intégrité/authenticité sans chiffrement ; ESP = chiffrement (+ intégrité optionnelle).", cost: 80 },
        ],
        options: [
          "AH assure intégrité/authenticité mais PAS la confidentialité ; ESP assure le chiffrement (+ intégrité optionnelle)",
          "AH chiffre tout, ESP ne fait que de l'intégrité",
          "Les deux sont identiques et interchangeables",
          "AH et ESP ne servent qu'en IPv4",
        ],
        answer: 0,
        explanation: `**AH** (*Authentication Header*) garantit **intégrité + authenticité + anti-rejeu** mais **ne chiffre pas** (pas de confidentialité), et authentifie l'en-tête IP → **incompatible NAT**. **ESP** (*Encapsulating Security Payload*) **chiffre** la charge utile (+ intégrité/authenticité **optionnelles**) et est **compatible NAT** (NAT-T) → c'est le **standard des VPN**.`,
        tags: ["ipsec", "ah", "esp"],
      },
      {
        id: "cyr-ipsec-nat",
        title: "IPsec et le NAT",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔀 Compatibilité NAT

Pourquoi **AH** pose-t-il problème lorsqu'il y a du **NAT** sur le chemin, alors qu'**ESP** s'en accommode ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "AH authentifie des champs de l'en-tête IP… que le NAT modifie justement.", cost: 30 },
          { text: "📖 Correction : AH protège l'en-tête IP (que le NAT change → ICV invalide) ; ESP non (NAT-T).", cost: 80 },
        ],
        options: [
          "AH authentifie l'en-tête IP, que le NAT modifie → l'intégrité échoue ; ESP n'authentifie pas l'en-tête externe et passe via NAT-T",
          "AH chiffre l'adresse MAC, incompatible avec Ethernet",
          "ESP interdit tout usage de NAT",
          "Le NAT supprime purement et simplement IPsec",
        ],
        answer: 0,
        explanation: `**AH** couvre certains **champs de l'en-tête IP** dans son ICV ; or le **NAT réécrit l'IP** → l'ICV devient **invalide** et le paquet est rejeté. **ESP** n'authentifie **pas** l'en-tête IP externe et peut être encapsulé dans **UDP** via **NAT-T** → il **traverse le NAT**. C'est une raison de plus de préférer **ESP**.`,
        tags: ["ah", "esp", "nat-t"],
      },
      {
        id: "cyr-ipsec-modes",
        title: "Transport vs tunnel",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚇 Modes IPsec

Pour un **VPN site-à-site entre deux passerelles** qui doit **masquer l'adressage interne**, quel mode IPsec utilise-t-on ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Le mode qui encapsule le paquet IP entier dans un nouveau paquet.", cost: 20 },
          { text: "📖 Correction : le mode tunnel.", cost: 50 },
        ],
        options: [
          "Le mode tunnel (le paquet IP entier est encapsulé et chiffré dans un nouveau paquet)",
          "Le mode transport (seule la charge utile est protégée, en-tête IP conservé)",
          "Le mode broadcast",
          "Le mode promiscuous",
        ],
        answer: 0,
        explanation: `Le **mode tunnel** encapsule le **paquet IP entier** (en-tête d'origine inclus) dans un **nouveau** paquet entre passerelles → l'**adressage interne est masqué**. Le **mode transport** ne protège que la **charge utile** en conservant l'en-tête IP, pour de l'**hôte-à-hôte**. Site-à-site = **tunnel**.`,
        tags: ["tunnel", "transport", "vpn"],
      },
      {
        id: "cyr-ipsec-pptp",
        title: "Le VPN à bannir",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔒 Technologies VPN

Parmi ces technologies VPN, laquelle est considérée comme **cryptographiquement cassée** et **à ne plus utiliser** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un ancien protocole de Microsoft à base de MS-CHAPv2/MPPE.", cost: 20 },
          { text: "📖 Correction : PPTP.", cost: 50 },
        ],
        options: [
          "PPTP",
          "L2TP/IPsec",
          "VPN SSL/TLS",
          "IPsec en mode tunnel",
        ],
        answer: 0,
        explanation: `**PPTP** est **obsolète et cassé** (faiblesses de MS-CHAPv2 et MPPE) → **à bannir**. **L2TP/IPsec** (L2TP tunnelise, IPsec chiffre), **VPN SSL/TLS** (via 443, idéal télétravail) et **IPsec tunnel** (site-à-site) sont les options **saines**. Rappel : un VPN chiffre le transport mais doit être **couplé à une authentification forte (MFA)**.`,
        tags: ["pptp", "vpn", "obsolete"],
      },
      {
        id: "cyr-ipv6-ndp",
        title: "IPv6 et NDP",
        order: 5,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🌐 Sécurité IPv6

En IPv6, **NDP** (Neighbor Discovery, via ICMPv6) remplace ARP. Quel risque de sécurité en découle par défaut, et quelle est une parade ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Comme ARP, NDP n'est pas authentifié → faux Router Advertisement possible.", cost: 30 },
          { text: "📖 Correction : spoofing NDP / faux RA → MITM ; parades RA Guard, SEND.", cost: 80 },
        ],
        options: [
          "NDP n'est pas authentifié : un attaquant peut faire du spoofing NDP ou annoncer un faux routeur (RA) → MITM. Parades : RA Guard, SEND",
          "NDP chiffre tout par défaut, aucun risque",
          "NDP supprime le besoin d'adresses IP",
          "NDP n'existe qu'en IPv4",
        ],
        answer: 0,
        explanation: `Comme **ARP** en IPv4, **NDP** (couche 3 via **ICMPv6**) **n'est pas authentifié** par défaut → **spoofing NDP** et **faux Router Advertisement** (l'attaquant se fait passer pour le routeur → **MITM**). Parades : **RA Guard**, **ND Inspection**, **SEND** (*Secure Neighbor Discovery*). Et surtout : **filtrer/surveiller IPv6 autant qu'IPv4** (éviter l'angle mort).`,
        tags: ["ipv6", "ndp", "ra-guard"],
      },
      {
        id: "cyr-ipv6-carac",
        title: "Caractéristiques d'IPv6",
        order: 6,
        difficulty: "medium",
        type: "multi",
        prompt: `## 🌐 IPv6

Quelles affirmations sont **exactes** à propos d'IPv6 ? (Coche toutes les bonnes.)`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "Les adresses sont sur 128 bits, offrant un espace d'adressage immense",
          "L'autoconfiguration SLAAC permet à un hôte de se configurer via les annonces du routeur (RA)",
          "IPsec est intégré à l'architecture IPv6",
          "IPv6 est intrinsèquement sûr et n'a donc pas besoin d'être filtré",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Trois vraies caractéristiques ; la dernière est un mythe dangereux.", cost: 20 },
          { text: "📖 Correction : 128 bits + SLAAC + IPsec intégré ; mais IPv6 DOIT être filtré comme IPv4.", cost: 50 },
        ],
        explanation: `IPv6 : adresses **128 bits**, **SLAAC** (autoconfig via **RA**), **IPsec intégré**. En revanche, IPv6 **n'est pas « automatiquement sûr »** : un IPv6 **non filtré/non surveillé** (souvent actif par défaut) est une **porte ouverte** parallèle → il faut lui appliquer **la même rigueur** qu'à IPv4.`,
        tags: ["ipv6", "slaac", "128-bits"],
      },
    ],
  },
];
