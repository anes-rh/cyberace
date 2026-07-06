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
    ],
  },
];
