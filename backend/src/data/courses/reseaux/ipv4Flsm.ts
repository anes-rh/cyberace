import type { CourseSeed } from "../../../types";

/**
 * Réseaux — Chapitre 3 : adressage IPv4 et sous-réseautage à taille fixe (FLSM).
 * Structure IP, classes, CIDR, adresses privées/publiques, plan de sous-réseaux.
 */
export const ipv4Flsm: CourseSeed[] = [
  {
    slug: "res-ipv4-flsm",
    title: "Adressage IPv4 & sous-réseautage FLSM",
    checkpoint: "reseaux",
    codename: "Subnet Sprint",
    domain: "Réseaux — adressage",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 4,
    difficulty: "medium",
    summary:
      "Le cœur du métier réseau : structure d'une adresse IPv4, masque et notation CIDR, adresses privées/publiques et spéciales, puis le découpage en sous-réseaux de taille égale (FLSM) avec plan d'adressage déroulé pas à pas.",
    objectives: [
      "Décomposer une IPv4 en partie réseau et partie hôte via le masque",
      "Convertir un préfixe CIDR (/n) en masque décimal et inversement",
      "Distinguer adresses privées (RFC 1918), publiques et spéciales",
      "Emprunter des bits pour créer des sous-réseaux de taille égale (FLSM)",
      "Calculer adresse réseau, diffusion, plage d'hôtes et nombre d'hôtes",
    ],
    lesson: `# 🎯 Adressage IPv4 & FLSM — le Subnet Sprint

Une **adresse IPv4** identifie une interface sur un réseau. Mais une adresse seule ne suffit pas : il faut savoir **où finit le réseau et où commence l'hôte** — c'est le rôle du **masque**. Et quand un grand réseau doit être découpé, on **sous-réseaute**. Prérequis : le module **Numération** (binaire, ET logique). 🏎️

---

## 1. Structure d'une adresse IPv4 🧱

**32 bits = 4 octets** en décimal pointé, chacun de 0 à 255 :

\`\`\`
   192  .  168  .   1   .  10
 11000000.10101000.00000001.00001010
\`\`\`

Une IP se scinde en **deux parties**, délimitées par le **masque** :
- **partie réseau** (bits à 1 du masque) — commune à toutes les machines du réseau ;
- **partie hôte** (bits à 0 du masque) — identifie chaque machine.

---

## 2. Le masque & la notation CIDR ✂️

Le **masque** indique le nombre de bits de la partie réseau. Deux écritures équivalentes :

| CIDR | Masque décimal | Binaire du masque |
|---|---|---|
| /8 | 255.0.0.0 | 11111111.00000000.00000000.00000000 |
| /16 | 255.255.0.0 | 11111111.11111111.00000000.00000000 |
| /24 | 255.255.255.0 | 11111111.11111111.11111111.00000000 |
| /25 | 255.255.255.128 | …11111111.10000000 |
| /26 | 255.255.255.192 | …11111111.11000000 |
| /27 | 255.255.255.224 | …11111111.11100000 |
| /28 | 255.255.255.240 | …11111111.11110000 |
| /29 | 255.255.255.248 | …11111111.11111000 |
| /30 | 255.255.255.252 | …11111111.11111100 |

**Valeurs de masque possibles pour un octet** (à mémoriser) : \`0, 128, 192, 224, 240, 248, 252, 254, 255\` (on ajoute les bits de gauche à droite).

> 🧠 \`/n\` = *n* bits à 1 dans le masque. \`/26\` = 26 bits réseau, donc 32−26 = **6 bits d'hôte**.

---

## 3. Classes historiques & CIDR 🏷️

Historiquement, les adresses étaient découpées en **classes** selon le 1ᵉʳ octet :

| Classe | 1ᵉʳ octet | Masque par défaut | Usage |
|---|---|---|---|
| **A** | 1 – 126 | /8 | très grands réseaux |
| **B** | 128 – 191 | /16 | réseaux moyens |
| **C** | 192 – 223 | /24 | petits réseaux |
| D | 224 – 239 | — | **multicast** |
| E | 240 – 255 | — | expérimental |

Aujourd'hui on utilise **CIDR** (*Classless Inter-Domain Routing*) : le masque est **libre** (n'importe quel /n), ce qui permet un découpage bien plus fin que les classes.

---

## 4. Adresses privées, publiques & spéciales 🔒

**Privées (RFC 1918)** — réutilisables dans chaque réseau local, **non routées sur Internet** (elles passent par du NAT) :

\`\`\`
 10.0.0.0     /8    (10.0.0.0     → 10.255.255.255)
 172.16.0.0   /12   (172.16.0.0   → 172.31.255.255)
 192.168.0.0  /16   (192.168.0.0  → 192.168.255.255)
\`\`\`

**Spéciales** :
- **127.0.0.0/8** → **loopback** (127.0.0.1 = la machine elle-même) ;
- **169.254.0.0/16** → **APIPA** (auto-attribuée quand le DHCP échoue) ;
- dans **chaque** réseau : la **1ère** adresse = **adresse réseau** (hôte tout à 0), la **dernière** = **diffusion/broadcast** (hôte tout à 1) — **ni l'une ni l'autre** n'est attribuable à une machine.

---

## 5. Trouver les 4 infos d'un réseau 🔍

Pour une IP + masque, on cherche : **adresse réseau**, **1ᵉʳ hôte**, **dernier hôte**, **diffusion**.

**Exemple** — \`192.168.1.130 /26\` (masque 255.255.255.192).
- Bits d'hôte = 32−26 = 6 → **bloc** = 2⁶ = **64** (les sous-réseaux avancent de 64 en 64 sur le dernier octet : 0, 64, 128, 192).
- 130 tombe dans le bloc **128 → 191**.

\`\`\`
 Adresse réseau  : 192.168.1.128   (130 ET 192 = 128)
 1ᵉʳ hôte        : 192.168.1.129
 Dernier hôte    : 192.168.1.190
 Diffusion       : 192.168.1.191   (128 + 64 − 1)
 Hôtes utiles    : 2⁶ − 2 = 62
\`\`\`

**Astuce du bloc** : \`taille de bloc = 256 − valeur du masque dans l'octet intéressant\`. Ici 256 − 192 = **64**.

---

## 6. FLSM — découper en sous-réseaux de taille ÉGALE ✂️✂️

**FLSM** (*Fixed Length Subnet Mask*) : on découpe un réseau en **sous-réseaux tous identiques**. On **emprunte** des bits à la partie hôte pour créer la partie sous-réseau.

- **Nombre de sous-réseaux** = 2^(bits empruntés)
- **Hôtes par sous-réseau** = 2^(bits d'hôte restants) − 2

**Exemple guidé** — découper \`192.168.1.0/24\` en **4 sous-réseaux égaux**.
1. 4 sous-réseaux → il faut \`2^b ≥ 4\` → **b = 2 bits empruntés**.
2. Nouveau masque : /24 + 2 = **/26** (255.255.255.192).
3. Bits d'hôte restants = 6 → **62 hôtes** par sous-réseau, **bloc = 64**.

\`\`\`
 Sous-réseau  Adresse réseau   Plage d'hôtes            Diffusion
 SR0          192.168.1.0/26   .1   →  .62              192.168.1.63
 SR1          192.168.1.64/26  .65  →  .126             192.168.1.127
 SR2          192.168.1.128/26 .129 →  .190             192.168.1.191
 SR3          192.168.1.192/26 .193 →  .254             192.168.1.255
\`\`\`

Chaque sous-réseau avance de **64** (la taille de bloc). Simple et régulier — mais **on gaspille** si les besoins sont inégaux (un lien point-à-point n'a besoin que de 2 hôtes mais reçoit 62 adresses). Ce gaspillage, c'est **VLSM** qui le corrige (chapitre suivant).

---

## 🧠 Ce qu'il faut retenir

- IPv4 = **32 bits / 4 octets** ; le **masque** sépare partie réseau et partie hôte.
- **/n** = n bits réseau. Masques d'octet valides : 0,128,192,224,240,248,252,254,255.
- **Privées** : 10/8, 172.16/12, 192.168/16 ; **loopback** 127/8 ; **APIPA** 169.254/16.
- Dans chaque (sous-)réseau : 1ère adresse = **réseau**, dernière = **diffusion**, non attribuables.
- **Taille de bloc = 256 − masque** (octet intéressant). **Hôtes = 2^(bits hôte) − 2**.
- **FLSM** : sous-réseaux **égaux**, nb = 2^(bits empruntés).

## ⚠️ Erreurs fréquentes des débutants

**1. Attribuer l'adresse réseau ou la diffusion à une machine.** La **1ère** (hôte tout à 0) et la **dernière** (hôte tout à 1) d'un sous-réseau sont **réservées**. Sur un /24, les hôtes vont de \`.1\` à \`.254\`, pas \`.0\` ni \`.255\`.

**2. Oublier le « −2 ».** \`2^(bits hôte)\` compte **toutes** les adresses ; les hôtes **utilisables** sont **−2**. Un /30 a 4 adresses mais **2** hôtes (parfait pour un lien point-à-point).

**3. Se tromper de bloc.** La taille de bloc se lit sur **l'octet où le masque n'est ni 0 ni 255**. Pour /26 c'est le 4ᵉ octet (bloc 64) ; pour /21 c'est le 3ᵉ octet (bloc 8).

**4. Confondre « bits empruntés » et « bits d'hôte ».** Emprunter des bits **augmente** le préfixe (donc le masque) et **réduit** le nombre d'hôtes par sous-réseau. Plus de sous-réseaux ⇒ moins d'hôtes chacun.

**5. Croire qu'une adresse privée est routable sur Internet.** 10.x, 172.16-31.x, 192.168.x restent **locales** : elles doivent passer par du **NAT** pour sortir.`,
    videos: [
      { title: "Exercices d'adressage IPv4 — Partie 1", youtubeId: "f4JsVFT9IvI", moreUrl: "https://www.youtube.com/playlist?list=PLgAuOjTVwB6xU7CLeGmI3Fru9Zs9Kb-7y" },
      { title: "Exercices d'adressage IPv4 — Partie 2", youtubeId: "YSDFjdwT4-A" },
      { title: "FLSM — cours & TD", youtubeId: "rIH16-HTSmE", moreUrl: "https://www.youtube.com/playlist?list=PLgAuOjTVwB6xl7TXCWQGHBorNZ5l7qpA_" },
    ],
    badge: {
      id: "badge-subnet-sprint",
      name: "Subnet Sprint",
      icon: "Network",
      description: "Maîtrise la structure IPv4, les masques CIDR et le découpage FLSM en sous-réseaux égaux.",
    },
    challenges: [
      {
        id: "res-ipv4-cidr-mask",
        title: "/26 en masque décimal",
        order: 1,
        difficulty: "medium",
        type: "text",
        prompt: `## ✂️ CIDR → masque

Écris le **masque décimal** correspondant au préfixe **/26**.

💡 26 bits à 1 = trois octets pleins (255.255.255) + 2 bits dans le 4ᵉ octet.`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Les 2 bits de poids fort du 4ᵉ octet : 128 + 64 = 192.", cost: 20 },
          { text: "📖 Correction complète : 255.255.255.192.", cost: 50 },
        ],
        answer: "255.255.255.192",
        accept: ["255 255 255 192"],
        caseSensitive: false,
        explanation: `/26 = 26 bits réseau : les 3 premiers octets pleins (\`255.255.255\`) + **2 bits** dans le 4ᵉ octet → \`11000000\` = 128+64 = **192**. Donc **255.255.255.192**.`,
        tags: ["ipv4", "cidr", "masque"],
      },
      {
        id: "res-ipv4-nb-sousreseaux",
        title: "Emprunter 3 bits",
        order: 2,
        difficulty: "easy",
        type: "numeric",
        prompt: `## ✂️✂️ FLSM

Tu empruntes **3 bits** à la partie hôte pour créer des sous-réseaux.

**Combien de sous-réseaux de taille égale obtiens-tu ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Nombre de sous-réseaux = 2 puissance (bits empruntés).", cost: 15 },
          { text: "📖 Correction complète : 2^3 = 8 sous-réseaux.", cost: 40 },
        ],
        answer: 8,
        explanation: `**Nombre de sous-réseaux = 2^(bits empruntés) = 2³ = 8**. Emprunter plus de bits crée plus de sous-réseaux… mais laisse moins de bits (donc moins d'hôtes) à chacun.`,
        tags: ["ipv4", "flsm", "sous-reseaux"],
      },
      {
        id: "res-ipv4-broadcast",
        title: "Adresse de diffusion d'un /26",
        order: 3,
        difficulty: "hard",
        type: "text",
        prompt: `## 🔍 Les 4 infos

Soit l'adresse \`192.168.1.130\` avec le masque **/26**.

**Quelle est l'adresse de diffusion (broadcast) de son sous-réseau ?**`,
        points: 350,
        timeLimitSec: 600,
        hints: [
          { text: "Taille de bloc = 256 − 192 = 64. Les réseaux : .0, .64, .128, .192. 130 est dans le bloc .128.", cost: 30 },
          { text: "La diffusion = dernière adresse du bloc = 128 + 64 − 1 = 191.", cost: 40 },
          { text: "📖 Correction complète : réseau 192.168.1.128, diffusion 192.168.1.191.", cost: 70 },
        ],
        answer: "192.168.1.191",
        accept: ["192.168.1.191/26"],
        caseSensitive: false,
        explanation: `Bloc = 256 − 192 = **64** → sous-réseaux : .0, .64, .128, .192. L'adresse .130 appartient au bloc **.128 → .191**. La **diffusion** est la dernière adresse du bloc : \`128 + 64 − 1 = 191\` → **192.168.1.191**. (Réseau = .128, hôtes .129→.190.)`,
        tags: ["ipv4", "broadcast", "sous-reseaux"],
      },
      {
        id: "res-ipv4-flsm-plan",
        title: "Plan FLSM : quel sous-réseau ?",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🗺️ Découpage en 4

On découpe \`192.168.1.0/24\` en **4 sous-réseaux égaux** (donc /26, bloc 64).

**Quelle est l'adresse RÉSEAU du sous-réseau auquel appartient l'hôte \`192.168.1.200\` ?**`,
        points: 350,
        timeLimitSec: 600,
        hints: [
          { text: "Les 4 réseaux /26 : .0, .64, .128, .192. Dans lequel tombe 200 ?", cost: 30 },
          { text: "200 ≥ 192 → dernier bloc, qui commence à .192.", cost: 40 },
          { text: "📖 Correction complète : 200 appartient au bloc .192 → .255, donc adresse réseau 192.168.1.192.", cost: 70 },
        ],
        answer: "192.168.1.192",
        accept: ["192.168.1.192/26"],
        caseSensitive: false,
        explanation: `Avec un bloc de 64, les 4 sous-réseaux /26 sont : \`.0\`, \`.64\`, \`.128\`, \`.192\`. L'hôte \`.200\` (≥ 192) tombe dans le **dernier** → adresse réseau **192.168.1.192** (plage .193→.254, diffusion .255).`,
        tags: ["ipv4", "flsm", "plan"],
      },
      {
        id: "res-ipv4-hotes-30",
        title: "Hôtes d'un /30",
        order: 5,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔗 Le masque des liens point-à-point

Un lien entre deux routeurs utilise un masque **/30**.

**Combien d'adresses d'hôtes utilisables contient un /30 ?**`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Bits d'hôte = 32 − 30 = 2, donc 2^2 adresses, moins les 2 réservées.", cost: 20 },
          { text: "📖 Correction complète : 2^2 − 2 = 2 hôtes. Parfait pour relier exactement 2 routeurs.", cost: 50 },
        ],
        answer: 2,
        explanation: `/30 → 2 bits d'hôte → \`2² − 2 = 2\` hôtes utilisables. C'est **le** masque des liaisons **point-à-point** (2 routeurs) : aucune adresse gaspillée. C'est aussi l'exemple type de l'intérêt de **VLSM**.`,
        tags: ["ipv4", "point-a-point", "hotes"],
      },
      {
        id: "res-ipv4-privee",
        title: "Adresse privée ou publique ?",
        order: 6,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔒 RFC 1918

Laquelle de ces adresses est une adresse **privée** (non routable sur Internet) ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Les plages privées : 10.x, 172.16–31.x, 192.168.x.", cost: 15 },
          { text: "📖 Correction complète : 10.5.4.3 est dans 10.0.0.0/8 → privée.", cost: 40 },
        ],
        options: ["8.8.8.8", "10.5.4.3", "172.15.0.1", "200.100.50.25"],
        answer: 1,
        explanation: `**10.5.4.3** appartient à \`10.0.0.0/8\` → **privée** (RFC 1918). Pièges : \`172.15.0.1\` est **hors** de la plage privée (qui va de 172.**16** à 172.**31**), \`8.8.8.8\` (DNS Google) et \`200.100.50.25\` sont **publiques**.`,
        tags: ["ipv4", "prive", "rfc1918"],
      },
      {
        id: "res-tp-flsm",
        title: "TP — Deux LAN sur un routeur",
        order: 7,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🧪 TP 1 — Architecture : 1 routeur, 2 LAN (niveau : simple)

\`\`\`
   LAN A — 60 hôtes                LAN B — 60 hôtes
   192.168.1.0/26                  192.168.1.64/26
        │                               │
     [ SW-A ]                        [ SW-B ]
        │                               │
        └── G0/0 ──── [ R1 ] ──── G0/1 ─┘
\`\`\`

**Mission :** sur R1, configure :
1. \`G0/0\` avec la **première adresse utilisable** du LAN A ;
2. \`G0/1\` avec la **première adresse utilisable** du LAN B ;
3. active les deux interfaces.

*(Rappelle-toi : un /26 = masque 255.255.255.192.)*`,
        points: 300,
        timeLimitSec: 900,
        starter: `! === R1 ===
interface g0/0
`,
        hints: [
          { text: "Première utilisable de 192.168.1.0/26 → .1 ; de 192.168.1.64/26 → .65. Masque /26 = 255.255.255.192.", cost: 30 },
          { text: "📖 Correction complète :\n```\ninterface g0/0\nip address 192.168.1.1 255.255.255.192\nno shutdown\ninterface g0/1\nip address 192.168.1.65 255.255.255.192\nno shutdown\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Configure G0/0 avec la 1re utilisable du LAN A", pattern: "ip\\s+address\\s+192\\.168\\.1\\.1\\s+255\\.255\\.255\\.192", flags: "i" },
            { label: "Sélectionne l'interface G0/1", pattern: "interface\\s+g\\S*0/1", flags: "i" },
            { label: "Configure G0/1 avec la 1re utilisable du LAN B", pattern: "ip\\s+address\\s+192\\.168\\.1\\.65\\s+255\\.255\\.255\\.192", flags: "i" },
            { label: "Active les interfaces (no shutdown)", pattern: "no\\s+shut", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
interface g0/0
 ip address 192.168.1.1 255.255.255.192    ! 1re utilisable de 192.168.1.0/26
 no shutdown
interface g0/1
 ip address 192.168.1.65 255.255.255.192   ! 1re utilisable de 192.168.1.64/26
 no shutdown
\`\`\`

Le /26 laisse 6 bits d'hôte → 62 utilisables par LAN (assez pour 60). LAN A va de .1 à .62 (broadcast .63), LAN B de .65 à .126 (broadcast .127). Les PC prendront R1 comme **passerelle** (.1 ou .65). Teste dans Packet Tracer : \`ping\` d'un PC du LAN A vers un PC du LAN B.`,
        tags: ["tp", "flsm", "config", "cisco", "architecture"],
      },
    ],
  },
];
