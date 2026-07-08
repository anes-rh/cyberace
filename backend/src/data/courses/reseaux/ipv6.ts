import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 15 : IPv6 (adressage, types, SLAAC, config). */
export const ipv6: CourseSeed[] = [
  {
    slug: "res-ipv6",
    title: "IPv6 — adressage et configuration",
    checkpoint: "reseaux",
    codename: "Next Address",
    domain: "Réseaux — Adressage L3",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 16,
    difficulty: "hard",
    summary:
      "L'IPv4 est à court d'adresses : place à l'IPv6 et ses 128 bits. Notation hexadécimale, règles de compression (::), types d'adresses (global unicast, link-local, multicast), préfixe /64, EUI-64 et SLAAC, et la configuration sur un routeur.",
    objectives: [
      "Expliquer pourquoi IPv6 remplace IPv4 (épuisement, taille de l'espace)",
      "Lire, écrire et compresser une adresse IPv6 (règles :: et zéros de tête)",
      "Distinguer les types : global unicast, link-local (FE80::/10), unique local, multicast, anycast",
      "Comprendre le préfixe /64, l'ID d'interface et la génération EUI-64",
      "Décrire SLAAC (autoconfiguration) et configurer IPv6 sur une interface",
    ],
    resources: [
      {
        label: "Architecture 1 — topologie de départ (.pka)",
        url: "/pka/res-ipv6-architecture-1.pka",
        kind: "pkt-start",
        note: "À ouvrir dans Cisco Packet Tracer : R1 et R2 reliés, non configurés. Active le routage IPv6, adresse les interfaces et ajoute les routes statiques IPv6 selon l'Architecture 1.",
      },
    ],
    lesson: `# 🌐 IPv6 — le Next Address

L'**IPv4** (32 bits) offre ~4,3 milliards d'adresses… épuisées depuis des années. La NAT a repoussé l'échéance, mais la vraie solution s'appelle **IPv6** : **128 bits**, soit **3,4 × 10³⁸** adresses — assez pour attribuer une adresse à chaque grain de sable de la planète, des milliards de fois. 🏎️

> 📎 Prérequis : numération **hexadécimale** (module Bases), adressage IPv4, masques/préfixes.

---

## 1. Pourquoi IPv6 ? 📉

- **Épuisement d'IPv4** : 2³² ≈ 4,3 milliards d'adresses, insuffisant pour la planète connectée (IoT, mobiles…).
- **Fin de la NAT obligatoire** : chaque hôte peut avoir une adresse **publique** unique → communication **de bout en bout**.
- **En-tête simplifié** (traitement plus rapide par les routeurs), **autoconfiguration** native (SLAAC), **pas de broadcast** (remplacé par le multicast).

---

## 2. Notation : 128 bits en hexadécimal 🔢

Une adresse IPv6 = **8 groupes** (hextets) de **16 bits**, en **hexadécimal**, séparés par « **:** » :

\`\`\`
 2001:0db8:0000:0000:0000:ff00:0042:8329
 └8 groupes de 4 chiffres hex = 8 × 16 = 128 bits┘
\`\`\`

### Règles de compression

**Règle 1 — zéros de tête** : dans chaque groupe, on **supprime les 0 de gauche** (jamais le dernier chiffre) :

\`\`\`
 0db8 → db8      0000 → 0      ff00 → ff00 (aucun zéro de tête)
 0042 → 42
\`\`\`

**Règle 2 — le « :: »** : on remplace **une seule** suite **contiguë** de groupes **entièrement nuls** par « **::** » :

\`\`\`
 2001:0db8:0000:0000:0000:ff00:0042:8329
     ↓ règle 1
 2001:db8:0:0:0:ff00:42:8329
     ↓ règle 2 (les trois 0 contigus → ::)
 2001:db8::ff00:42:8329
\`\`\`

⚠️ Le « **::** » ne peut apparaître **qu'une seule fois** (sinon on ne saurait pas combien de groupes il représente).

---

## 3. Structure : préfixe /64 + ID d'interface 🧩

L'adresse unicast type se coupe en **deux moitiés de 64 bits** :

\`\`\`
 |◄────── 64 bits : préfixe réseau ──────►|◄──── 64 bits : ID d'interface ────►|
   2001:db8:acad:0001         :          0000:0000:0000:0010
   └ routage / sous-réseau ┘              └── identifie l'hôte sur le lien ──┘
\`\`\`

- Le préfixe standard d'un LAN est **/64** (les 64 premiers bits) — 2⁶⁴ hôtes par sous-réseau.
- Les **16 bits** de sous-réseau (entre le préfixe global /48 du site et le /64) permettent **65 536 sous-réseaux**.

---

## 4. Les types d'adresses IPv6 🏷️

| Type | Préfixe | Rôle |
|---|---|---|
| **Global unicast (GUA)** | \`2000::/3\` | adresse **publique** routable sur Internet |
| **Link-local (LLA)** | \`FE80::/10\` | valable **sur le lien local uniquement**, jamais routée |
| **Unique local (ULA)** | \`FC00::/7\` (\`FD00::/8\`) | équivalent des adresses **privées** IPv4 |
| **Multicast** | \`FF00::/8\` | vers un **groupe** (remplace le broadcast) |
| **Loopback** | \`::1\` | l'hôte lui-même (= 127.0.0.1) |
| **Non spécifiée** | \`::\` | « aucune adresse » |

> 🧭 Chaque interface IPv6 a **au moins** une **link-local** (FE80::…) — générée automatiquement, indispensable au fonctionnement (voisinage, IGP, next-hop). Elle a souvent **aussi** une **global unicast**.

**Multicast utiles** : \`FF02::1\` = **tous les nœuds** du lien ; \`FF02::2\` = **tous les routeurs** du lien.

---

## 5. ID d'interface : EUI-64 & SLAAC ⚙️

Comment remplir les **64 bits d'hôte** ?

**EUI-64** dérive l'ID d'interface de l'**adresse MAC** (48 bits) :
1. couper la MAC en deux ; **insérer \`FFFE\`** au milieu (→ 64 bits) ;
2. **inverser le 7ᵉ bit** (bit U/L) du premier octet.

\`\`\`
 MAC   : 00:1A:2B:3C:4D:5E
 +FFFE : 001A:2BFF:FE3C:4D5E
 flip  : 021A:2BFF:FE3C:4D5E   ← ID d'interface EUI-64
\`\`\`

**SLAAC** (*StateLess Address AutoConfiguration*) : l'hôte se configure **tout seul**, **sans serveur DHCP**. Il écoute les messages **RA** (*Router Advertisement*, ICMPv6) du routeur, qui annoncent le **préfixe /64**. L'hôte **combine** ce préfixe avec un ID d'interface (EUI-64 ou aléatoire) → adresse complète. Le routeur devient sa **passerelle**.

> 🔁 Alternatives : **DHCPv6 stateful** (comme en IPv4, un serveur attribue tout) ou **SLAAC + DHCPv6 stateless** (préfixe par SLAAC, DNS par DHCPv6).

---

## 6. Configuration sur un routeur 🖥️

\`\`\`
R1(config)# ipv6 unicast-routing              ! ACTIVE le routage IPv6 (sinon rien ne route)
R1(config)# interface g0/0
R1(config-if)# ipv6 address 2001:db8:acad:1::1/64   ! GUA manuelle
R1(config-if)# ipv6 address fe80::1 link-local      ! LLA choisie (optionnel)
R1(config-if)# no shutdown
\`\`\`

Vérification : \`show ipv6 interface brief\`, \`show ipv6 route\`, \`ping ipv6 2001:db8:acad:1::2\`.

⚠️ Sans \`ipv6 unicast-routing\`, le routeur a des adresses IPv6 mais **ne route pas** et n'envoie pas de **RA** (SLAAC ne marche pas côté clients).

---

## 🧠 Ce qu'il faut retenir

- IPv6 = **128 bits** (2¹²⁸ adresses) → résout l'**épuisement** d'IPv4 ; **pas de broadcast** (→ multicast), **SLAAC** natif.
- Notation : **8 hextets** hex ; compression = **zéros de tête supprimés** + **une seule** occurrence de « **::** » pour des groupes nuls contigus.
- Structure unicast : **/64 de préfixe** + **64 bits d'ID d'interface**.
- Types : **GUA** (\`2000::/3\`, public), **link-local** (\`FE80::/10\`, sur le lien), **ULA** (\`FC00::/7\`, privé), **multicast** (\`FF00::/8\`), \`::1\` (loopback).
- **EUI-64** dérive l'ID d'interface d'une MAC (insérer \`FFFE\`, inverser le bit U/L).
- **SLAAC** : l'hôte s'auto-configure à partir du **préfixe** annoncé par le routeur (message **RA**), sans DHCP.
- Sur routeur : **\`ipv6 unicast-routing\`** est **obligatoire** pour router et envoyer des RA.

## ⚠️ Erreurs fréquentes des débutants

**1. Mettre plusieurs « :: » dans une adresse.** Interdit ! Le « :: » ne peut apparaître **qu'une fois** — sinon la longueur des blocs de zéros devient ambiguë.

**2. Compresser un seul zéro en « :: » sans raison.** Le « :: » remplace des **groupes entiers nuls** contigus. \`2001:db8:0:1::\` est correct ; enchaîner deux \`::\` ne l'est pas.

**3. Oublier \`ipv6 unicast-routing\`.** Sans elle, le routeur porte des adresses IPv6 mais **ne route pas** et n'émet **aucun RA** → les hôtes en SLAAC restent sans adresse globale.

**4. Croire que le broadcast existe encore.** IPv6 **supprime le broadcast** : on utilise le **multicast** (ex. \`FF02::1\` = tous les nœuds du lien).

**5. Négliger l'adresse link-local.** Toute interface IPv6 a une **FE80::…** — c'est elle qui sert de **next-hop** aux protocoles de routage et au voisinage. Elle n'est **jamais routée** hors du lien.`,
    videos: [
      {
        title: "IPv6 — adressage et fonctionnement expliqués",
        youtubeId: "icdyZN_ORYU",
      },
    ],
    badge: {
      id: "badge-next-address",
      name: "Next Address",
      icon: "Network",
      description: "Lit, compresse et configure des adresses IPv6 (types, /64, EUI-64, SLAAC).",
    },
    challenges: [
      {
        id: "res-ipv6-compress",
        title: "Compresser une adresse IPv6",
        order: 1,
        difficulty: "medium",
        type: "text",
        prompt: `## 🗜️ Compression

Compresse au maximum cette adresse (règles : zéros de tête + « :: ») :

\`\`\`
2001:0db8:0000:0000:0000:0000:0000:0001
\`\`\`

Écris la forme **la plus courte** (respecte la casse minuscule et les « : »).`,
        points: 250,
        timeLimitSec: 360,
        hints: [
          { text: "Supprime les zéros de tête de chaque groupe, puis remplace la longue suite de 0 par ::", cost: 25 },
          { text: "📖 Correction complète : 2001:db8::1", cost: 60 },
        ],
        answer: "2001:db8::1",
        accept: ["2001:0db8::1"],
        explanation: `Étapes : (1) zéros de tête → \`2001:db8:0:0:0:0:0:1\` ; (2) la suite de six groupes nuls contigus → « :: ». Résultat : **\`2001:db8::1\`**. Le « :: » représente ici les 6 groupes à zéro. Une seule occurrence de « :: » est autorisée.`,
        tags: ["ipv6", "compression", "notation"],
      },
      {
        id: "res-ipv6-linklocal",
        title: "Reconnaître une link-local",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🏷️ Quel type d'adresse ?

À quel **type** appartient l'adresse \`FE80::1\` ?`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "FE80::/10 est un préfixe réservé bien particulier.", cost: 15 },
          { text: "📖 Correction complète : link-local (FE80::/10), valable uniquement sur le lien.", cost: 40 },
        ],
        options: [
          "Link-local (FE80::/10) — valable seulement sur le lien local",
          "Global unicast, routable sur Internet",
          "Multicast (groupe)",
          "Loopback",
        ],
        answer: 0,
        explanation: `\`FE80::/10\` est le préfixe des adresses **link-local** : valables **uniquement sur le lien** (jamais routées). Chaque interface IPv6 en possède une automatiquement ; elle sert de **next-hop** aux protocoles de routage. La **global unicast** commence par \`2000::/3\`, le **multicast** par \`FF00::/8\`, la **loopback** est \`::1\`.`,
        tags: ["ipv6", "link-local", "types"],
      },
      {
        id: "res-ipv6-slaac",
        title: "SLAAC vs DHCP",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚙️ Autoconfiguration

Avec **SLAAC**, comment un hôte IPv6 obtient-il son adresse ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "SLAAC = StateLess. Un serveur DHCP est-il indispensable ?", cost: 20 },
          { text: "📖 Correction complète : l'hôte combine le préfixe /64 annoncé par le routeur (RA) avec un ID d'interface, sans serveur DHCP.", cost: 50 },
        ],
        options: [
          "Il combine le préfixe /64 annoncé par le routeur (message RA) avec un ID d'interface, sans serveur DHCP",
          "Un serveur DHCP lui attribue obligatoirement toute l'adresse",
          "L'administrateur la saisit à la main sur chaque poste",
          "Elle est identique à l'adresse MAC, sans transformation",
        ],
        answer: 0,
        explanation: `**SLAAC** (*StateLess Address AutoConfiguration*) : le routeur diffuse un **RA** (*Router Advertisement*) contenant le **préfixe /64**. L'hôte y **ajoute** un **ID d'interface** (EUI-64 ou aléatoire) pour former son adresse complète — **sans serveur DHCP**. Le routeur devient sa passerelle. DHCPv6 stateful reste une alternative (le serveur attribue tout).`,
        tags: ["ipv6", "slaac", "ra", "autoconfiguration"],
      },
      {
        id: "res-ipv6-eui64",
        title: "Générer un ID EUI-64",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🧮 EUI-64

À partir de la MAC \`00:1A:2B:3C:4D:5E\`, quel est l'**ID d'interface EUI-64** obtenu ?`,
        points: 350,
        timeLimitSec: 480,
        hints: [
          { text: "Insère FFFE au milieu, puis inverse le 7e bit du 1er octet (00 → 02).", cost: 35 },
          { text: "📖 Correction complète : 021A:2BFF:FE3C:4D5E (00→02 après flip du bit U/L, FFFE inséré).", cost: 80 },
        ],
        options: [
          "021A:2BFF:FE3C:4D5E",
          "001A:2BFF:FE3C:4D5E",
          "001A:2B3C:4D5E:FFFE",
          "FFFE:001A:2B3C:4D5E",
        ],
        answer: 0,
        explanation: `Deux étapes : (1) **insérer \`FFFE\`** au milieu de la MAC → \`001A:2BFF:FE3C:4D5E\` ; (2) **inverser le 7ᵉ bit** (bit U/L) du 1ᵉʳ octet : \`00\` = \`0000 0000\` → \`0000 0010\` = \`02\`. Résultat : **\`021A:2BFF:FE3C:4D5E\`**. C'est ce que fait la commande \`eui-64\` sur les routeurs.`,
        tags: ["ipv6", "eui-64", "mac"],
      },
      {
        id: "res-ipv6-config",
        title: "Configurer IPv6 sur un routeur",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🖥️ Config Cisco

Active le **routage IPv6** globalement, puis mets sur l'interface \`GigabitEthernet0/0\` l'adresse **global unicast** \`2001:db8:acad:1::1/64\` et active l'interface.`,
        points: 350,
        timeLimitSec: 600,
        starter: `! mode configuration globale
`,
        hints: [
          { text: "ipv6 unicast-routing (global), puis interface, ipv6 address .../64, no shutdown.", cost: 35 },
          { text: "📖 Correction complète :\n```\nipv6 unicast-routing\ninterface GigabitEthernet0/0\nipv6 address 2001:db8:acad:1::1/64\nno shutdown\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Active le routage IPv6 global", pattern: "ipv6\\s+unicast-routing", flags: "i" },
            { label: "Sélectionne l'interface", pattern: "interface\\s+GigabitEthernet0/0", flags: "i" },
            { label: "Configure l'adresse GUA en /64", pattern: "ipv6\\s+address\\s+2001:db8:acad:1::1/64", flags: "i" },
            { label: "Active l'interface", pattern: "no\\s+shut", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
ipv6 unicast-routing                       ! INDISPENSABLE : active le routage IPv6 + les RA
interface GigabitEthernet0/0
 ipv6 address 2001:db8:acad:1::1/64        ! global unicast /64
 no shutdown
\`\`\`

Sans **\`ipv6 unicast-routing\`**, le routeur porte l'adresse mais **ne route pas** et n'émet pas de **RA** (SLAAC KO côté clients). Vérifie avec \`show ipv6 interface brief\` et \`show ipv6 route\`.`,
        tags: ["ipv6", "config", "cisco", "unicast-routing"],
      },
      {
        id: "res-tp-ipv6",
        title: "Architecture 1 — Réseau IPv6 routé",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 1 (niveau : avancé+)

**Topologie à monter dans Packet Tracer :**

| Élément | Réseau | Adresses |
|---|---|---|
| LAN A → R1 (G0/0) | \`2001:db8:1::/64\` | R1 = \`::1\` |
| R1 (G0/1) ↔ R2 (G0/1) | \`2001:db8:12::/64\` | R1 = \`::1\`, R2 = \`::2\` |
| LAN B → R2 (G0/0) | \`2001:db8:2::/64\` | R2 = \`::1\` |

**Questions :**

1. **Activez le routage IPv6** sur les deux routeurs (\`ipv6 unicast-routing\` — l'oubli classique !) ;
2. Adressez les 4 interfaces ;
3. Ajoutez la **route statique IPv6** vers le LAN distant sur chaque routeur ;
4. Vérifiez : \`show ipv6 route\` puis ping LAN à LAN.

Blocs \`! === R1 ===\` et \`! === R2 ===\`.`,
        points: 550,
        timeLimitSec: 1500,
        starter: `! === R1 ===
ipv6 unicast-routing
`,
        hints: [
          { text: "ipv6 unicast-routing (les 2 !), ipv6 address <préfixe>::X/64 sur chaque interface, puis ipv6 route 2001:db8:2::/64 2001:db8:12::2 (et le miroir sur R2).", cost: 55 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\nipv6 unicast-routing\ninterface g0/0\nipv6 address 2001:db8:1::1/64\nno shutdown\ninterface g0/1\nipv6 address 2001:db8:12::1/64\nno shutdown\nipv6 route 2001:db8:2::/64 2001:db8:12::2\n! === R2 ===\nipv6 unicast-routing\ninterface g0/0\nipv6 address 2001:db8:2::1/64\nno shutdown\ninterface g0/1\nipv6 address 2001:db8:12::2/64\nno shutdown\nipv6 route 2001:db8:1::/64 2001:db8:12::1\n```", cost: 120 },
        ],
        answer: JSON.stringify({
          minRatio: 0.6,
          keypoints: [
            { label: "Active le routage IPv6", pattern: "ipv6\\s+unicast-routing", flags: "i" },
            { label: "Adresse du LAN A sur R1", pattern: "ipv6\\s+address\\s+2001:db8:1::1/64", flags: "i" },
            { label: "Adresse du lien côté R1", pattern: "ipv6\\s+address\\s+2001:db8:12::1/64", flags: "i" },
            { label: "Adresse du lien côté R2", pattern: "ipv6\\s+address\\s+2001:db8:12::2/64", flags: "i" },
            { label: "Adresse du LAN B sur R2", pattern: "ipv6\\s+address\\s+2001:db8:2::1/64", flags: "i" },
            { label: "R1 : route statique vers le LAN B", pattern: "ipv6\\s+route\\s+2001:db8:2::/64\\s+2001:db8:12::2", flags: "i" },
            { label: "R2 : route statique vers le LAN A", pattern: "ipv6\\s+route\\s+2001:db8:1::/64\\s+2001:db8:12::1", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
! === R1 ===
ipv6 unicast-routing                       ! sans ça : pas de routage, pas de RA
interface g0/0
 ipv6 address 2001:db8:1::1/64
 no shutdown
interface g0/1
 ipv6 address 2001:db8:12::1/64
 no shutdown
ipv6 route 2001:db8:2::/64 2001:db8:12::2  ! LAN B via R2
! === R2 ===  (miroir)
ipv6 unicast-routing
interface g0/0
 ipv6 address 2001:db8:2::1/64
 no shutdown
interface g0/1
 ipv6 address 2001:db8:12::2/64
 no shutdown
ipv6 route 2001:db8:1::/64 2001:db8:12::1
\`\`\`

La logique est identique à IPv4 (adresser → router → les 2 sens), mais **trois différences** : le \`ipv6 unicast-routing\` global **obligatoire**, la notation **préfixe/longueur** (\`/64\` collé à l'adresse, pas de masque décimal), et les PC des LAN qui s'autoconfigureront en **SLAAC** grâce aux RA des routeurs. Vérifie : \`show ipv6 interface brief\`, \`show ipv6 route\`, puis \`ping 2001:db8:2::1\` depuis R1.`,
        tags: ["tp", "ipv6", "routage", "config", "architecture"],
      },
      {
        id: "res-tp-ipv6-2",
        title: "Architecture 2 — SLAAC, EUI-64 et sortie Internet",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 2 (niveau : expert)

Un site IPv6 réaliste : les PC s'auto-configurent en **SLAAC**, le routeur utilise **EUI-64** sur son lien montant, et tout le monde sort vers Internet via une **route par défaut IPv6**.

**Topologie à monter dans Packet Tracer :**

| Élément | Réseau | Détail |
|---|---|---|
| LAN → R1 (G0/0) | \`2001:db8:acad:10::/64\` | R1 = \`::1\` — les PC en **SLAAC** (auto) |
| R1 (G0/1) ↔ FAI | \`2001:db8:feed:12::/64\` | R1 en **EUI-64** ; FAI = \`2001:db8:feed:12::2\` |

**Questions :**

1. Activez le routage IPv6 ;
2. \`G0/0\` : adresse \`2001:db8:acad:10::1/64\` — les PC du LAN, en « IPv6 Autoconfig » dans PT, obtiendront leur adresse **tout seuls** via les RA du routeur ;
3. \`G0/1\` : adresse construite par le routeur avec **\`eui-64\`** sur le préfixe \`2001:db8:feed:12::/64\` ;
4. Route **par défaut IPv6** (\`::/0\`) vers le FAI ;
5. Question : d'où les PC tiennent-ils leur passerelle, alors qu'on n'a rien configuré ? *(réponse dans la correction)*`,
        points: 550,
        timeLimitSec: 1500,
        starter: `! === R1 ===
ipv6 unicast-routing
`,
        hints: [
          { text: "eui-64 : ipv6 address 2001:db8:feed:12::/64 eui-64. Default : ipv6 route ::/0 2001:db8:feed:12::2.", cost: 55 },
          { text: "📖 Correction complète :\n```\nipv6 unicast-routing\ninterface g0/0\nipv6 address 2001:db8:acad:10::1/64\nno shutdown\ninterface g0/1\nipv6 address 2001:db8:feed:12::/64 eui-64\nno shutdown\nipv6 route ::/0 2001:db8:feed:12::2\n```", cost: 120 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Routage IPv6 activé", pattern: "ipv6\\s+unicast-routing", flags: "i" },
            { label: "Passerelle du LAN SLAAC", pattern: "ipv6\\s+address\\s+2001:db8:acad:10::1/64", flags: "i" },
            { label: "Adresse EUI-64 sur le lien FAI", pattern: "ipv6\\s+address\\s+2001:db8:feed:12::/64\\s+eui-64", flags: "i" },
            { label: "Route par défaut IPv6 (::/0)", pattern: "ipv6\\s+route\\s+::/0\\s+2001:db8:feed:12::2", flags: "i" },
            { label: "Interfaces activées", pattern: "no\\s+shut", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

\`\`\`
ipv6 unicast-routing                          ! active routage + émission des RA
interface g0/0
 ipv6 address 2001:db8:acad:10::1/64          ! préfixe annoncé en RA → SLAAC des PC
 no shutdown
interface g0/1
 ipv6 address 2001:db8:feed:12::/64 eui-64    ! l'ID d'interface dérive de la MAC
 no shutdown
ipv6 route ::/0 2001:db8:feed:12::2           ! ::/0 = « 0.0.0.0/0 » version IPv6
\`\`\`

**Réponse à la question 5 :** les PC apprennent **tout** du message **RA** (*Router Advertisement*) que R1 émet sur le LAN : le **préfixe /64** (pour fabriquer leur adresse en SLAAC) **et la passerelle** — qui n'est pas l'adresse globale de R1, mais sa **link-local** (\`FE80::…\`) ! C'est la grande différence avec IPv4 : en IPv6, la passerelle par défaut d'un hôte est presque toujours une adresse **FE80::**, apprise automatiquement, jamais tapée à la main.

**EUI-64 en pratique :** le routeur prend sa MAC, insère \`FFFE\` au milieu, inverse le 7ᵉ bit — et voilà son ID d'interface. \`show ipv6 interface g0/1\` te montre l'adresse résultante.

**Vérification PT :** mets un PC en « Automatic » IPv6 → il obtient \`2001:db8:acad:10:…\` sans DHCP ; \`show ipv6 route\` → \`S ::/0\` ; ping du PC vers \`2001:db8:feed:12::2\`. 🎯`,
        tags: ["tp", "ipv6", "slaac", "eui-64", "architecture"],
      },
      {
        id: "res-lab-ipv6-complet",
        title: "🏁 LAB COMPLET — Réseau IPv6 routé, ping6 de bout en bout",
        order: 8,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏁 Lab guidé complet (fichier : « topologie de départ » du module)

Ouvre le **.pka de départ** (sous le cours) : **R1 et R2 reliés**, non configurés. Chaque routeur a son **LAN IPv6** (boucle locale). Objectif : réseau **IPv6 routé**, et **le \`ping6\` doit passer entre les deux LAN**.

**Plan imposé :**

| Élément | R1 | R2 |
|---|---|---|
| Liaison inter-routeurs (\`2001:db8:12::/64\`) | \`::1\` | \`::2\` |
| LAN (\`Loopback0\`, /64) | \`2001:db8:1::1\` | \`2001:db8:2::1\` |

**Instructions — dans Packet Tracer :**

1. **Active le routage IPv6** (les deux) : \`ipv6 unicast-routing\` — l'oubli classique !
2. **Adresse** la liaison et la boucle, \`no shutdown\`.
3. **Route statique IPv6** vers le LAN distant : R1 → \`ipv6 route 2001:db8:2::/64 2001:db8:12::2\` ; R2 → symétrique vers \`2001:db8:1::/64\`.

Écris ci-dessous la config **complète de R1** (unicast-routing + adresses + route). La correction (R1 + R2) + la **matrice de ping** s'affiche après validation.`,
        points: 700,
        timeLimitSec: 2400,
        starter: `! === R1 ===
ipv6 unicast-routing
`,
        hints: [
          { text: "ipv6 unicast-routing (global) ; ipv6 address sur la liaison + la boucle ; ipv6 route 2001:db8:2::/64 2001:db8:12::2.", cost: 60 },
          { text: "📖 Correction R1 :\n```\nipv6 unicast-routing\ninterface g0/0\n ipv6 address 2001:db8:12::1/64\n no shutdown\ninterface Loopback0\n ipv6 address 2001:db8:1::1/64\nipv6 route 2001:db8:2::/64 2001:db8:12::2\n```", cost: 140 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Routage IPv6 activé", pattern: "ipv6\\s+unicast-routing", flags: "i" },
            { label: "Liaison adressée en IPv6", pattern: "ipv6\\s+address\\s+2001:db8:12::1/64", flags: "i" },
            { label: "LAN (boucle) adressé en IPv6", pattern: "ipv6\\s+address\\s+2001:db8:1::1/64", flags: "i" },
            { label: "Route statique IPv6 vers le LAN distant", pattern: "ipv6\\s+route\\s+2001:db8:2::/64\\s+2001:db8:12::2", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction complète + vérification

\`\`\`
! === R1 ===
ipv6 unicast-routing                      ! sans ça, aucun routage IPv6
interface g0/0
 ipv6 address 2001:db8:12::1/64
 no shutdown
interface Loopback0
 ipv6 address 2001:db8:1::1/64
ipv6 route 2001:db8:2::/64 2001:db8:12::2
! === R2 (miroir) ===
ipv6 unicast-routing
interface g0/0
 ipv6 address 2001:db8:12::2/64
 no shutdown
interface Loopback0
 ipv6 address 2001:db8:2::1/64
ipv6 route 2001:db8:1::/64 2001:db8:12::1
\`\`\`

### 🎯 Comment savoir que TOUT est bon : la matrice de ping

1. \`show ipv6 interface brief\` → interfaces **up/up** avec leurs adresses. ✅
2. R1 → \`ping 2001:db8:12::2\` (l'autre bout) ✅
3. R1 → \`ping 2001:db8:2::1\` (LAN de R2) ✅ · R2 → \`ping 2001:db8:1::1\` ✅

Si les **deux LAN IPv6 se pinguent**, le routage IPv6 est bon. 🏆 Vérifie \`show ipv6 route\` → le préfixe distant en **S** (statique).

**Si le ping6 échoue :** \`ipv6 unicast-routing\` est-il activé (sinon rien ne route) ? La **route statique** existe-t-elle des DEUX côtés ? Les adresses sont-elles bien en **/64** ?`,
        tags: ["lab", "ipv6", "ping", "verification", "architecture"],
      },
    ],
  },
];
