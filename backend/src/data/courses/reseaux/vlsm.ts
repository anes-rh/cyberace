import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 4 : sous-réseautage à masque variable (VLSM). */
export const vlsm: CourseSeed[] = [
  {
    slug: "res-vlsm",
    title: "Sous-réseautage VLSM — masques de longueur variable",
    checkpoint: "reseaux",
    codename: "Variable Circuit",
    domain: "Réseaux — adressage",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 5,
    difficulty: "hard",
    summary:
      "Le sous-réseautage intelligent : au lieu de découper en parts égales (FLSM), on taille chaque sous-réseau à son besoin réel (VLSM) pour ne gaspiller aucune adresse. Méthode « du plus grand au plus petit » déroulée sur un plan complet.",
    objectives: [
      "Comprendre le gaspillage du FLSM et l'intérêt du VLSM",
      "Choisir le plus petit masque couvrant un besoin en hôtes donné",
      "Appliquer la méthode VLSM : trier par taille décroissante et allouer en cascade",
      "Réserver des /30 pour les liens point-à-point entre routeurs",
      "Construire un plan d'adressage VLSM complet sans chevauchement",
    ],
    lesson: `# 🧩 VLSM — le Variable Circuit

En **FLSM**, tous les sous-réseaux ont la **même taille** : pratique, mais **gâchis** garanti dès que les besoins sont inégaux. Un lien entre 2 routeurs n'a besoin que de **2 hôtes** — lui donner 62 adresses, c'est du gaspillage. Le **VLSM** (*Variable Length Subnet Mask*) taille **chaque** sous-réseau à son besoin. 🏎️

> 📎 Prérequis : le module **IPv4 & FLSM**. On réutilise la taille de bloc, l'adresse réseau, la diffusion.

---

## 1. Le problème du FLSM 💸

Imagine \`192.168.1.0/24\` et ces besoins :
- Réseau **A** : 100 hôtes
- Réseau **B** : 50 hôtes
- Réseau **C** : 25 hôtes
- Liens routeurs **L1, L2** : 2 hôtes chacun

En **FLSM**, il faudrait un masque unique assez grand pour le plus gros (A = 100 → /25 = 126 hôtes). Or un /24 ne contient que **deux** /25 → **impossible** de loger 5 réseaux. Le FLSM **échoue** ou gaspille énormément. 🚫

---

## 2. L'idée du VLSM 🎯

On **adapte le masque à chaque sous-réseau**. Règle d'or :

> **On alloue du PLUS GRAND besoin au PLUS PETIT**, en prenant à chaque fois le **plus petit bloc** qui suffit.

Pourquoi du plus grand au plus petit ? Parce qu'un gros bloc doit s'aligner sur une frontière « ronde » ; le placer en premier évite qu'un petit sous-réseau vienne « couper » l'espace au mauvais endroit.

---

## 3. Choisir le masque d'un besoin 📐

Pour **h** hôtes, on cherche le plus petit **n** tel que \`2ⁿ − 2 ≥ h\` (n = bits d'hôte) :

| Besoin (hôtes) | Bits hôte | Masque | Hôtes dispo |
|---|---|---|---|
| ≤ 2 | 2 | /30 | 2 |
| ≤ 6 | 3 | /29 | 6 |
| ≤ 14 | 4 | /28 | 14 |
| ≤ 30 | 5 | /27 | 30 |
| ≤ 62 | 6 | /26 | 62 |
| ≤ 126 | 7 | /25 | 126 |
| ≤ 254 | 8 | /24 | 254 |

> 🧠 100 hôtes → il faut 126 dispo → **/25**. 50 hôtes → 62 dispo → **/26**. 2 hôtes → **/30**.

---

## 4. Plan VLSM déroulé pas à pas 🗺️

Reprenons \`192.168.1.0/24\` avec A=100, B=50, C=25, L1=2, L2=2. On **trie décroissant** : A(100) > B(50) > C(25) > L1(2) = L2(2).

\`\`\`
 Réseau  Besoin  Masque  Bloc  Adresse réseau     Plage hôtes         Diffusion
 A       100     /25     128   192.168.1.0/25     .1   →  .126        192.168.1.127
 B        50     /26      64   192.168.1.128/26   .129 →  .190        192.168.1.191
 C        25     /27      32   192.168.1.192/27   .193 →  .222        192.168.1.223
 L1        2     /30       4   192.168.1.224/30   .225 →  .226        192.168.1.227
 L2        2     /30       4   192.168.1.228/30   .229 →  .230        192.168.1.231
\`\`\`

**Comment on avance** : chaque sous-réseau commence **juste après** la diffusion du précédent.
- A finit à .127 → B commence à **.128** (bloc 64 → finit à .191).
- B finit à .191 → C commence à **.192** (bloc 32 → finit à .223).
- C finit à .223 → L1 commence à **.224** (bloc 4 → finit à .227).
- L1 finit à .227 → L2 commence à **.228** (finit à .231).

Il **reste** de la place de .232 à .255 (24 adresses) pour de futurs besoins. Avec le FLSM, on n'aurait **jamais** casé tout ça. VLSM = **zéro gaspillage**. ✅

---

## 5. Vérifier un plan 🔎

Un plan VLSM est correct si :
1. **Aucun chevauchement** : la plage d'un sous-réseau ne mord pas sur un autre.
2. Chaque sous-réseau **couvre son besoin** (masque assez large).
3. Les adresses **réseau** tombent sur une frontière de bloc (multiple de la taille de bloc).

---

## 🧠 Ce qu'il faut retenir

- **VLSM = masque adapté à chaque sous-réseau** → aucun gaspillage (contrairement au FLSM).
- Méthode : **trier les besoins par ordre décroissant**, allouer le **plus petit bloc suffisant**, enchaîner après chaque diffusion.
- Masque pour *h* hôtes : plus petit *n* avec \`2ⁿ − 2 ≥ h\`.
- Les **liens point-à-point** → **/30** (2 hôtes) systématiquement.
- Vérifier : pas de chevauchement, besoin couvert, réseau aligné sur le bloc.

## ⚠️ Erreurs fréquentes des débutants

**1. Allouer du plus petit au plus grand.** En commençant par les petits, on fragmente l'espace et un gros sous-réseau ne trouve plus de bloc aligné. **Toujours du plus grand au plus petit.**

**2. Prendre le masque « juste » sans le −2.** Pour 30 hôtes, un /27 donne \`2⁵ − 2 = 30\` — **pile** bon. Pour **31** hôtes il faut /26. Ne pas oublier les 2 adresses réservées.

**3. Chevaucher les plages.** Faire commencer un sous-réseau **avant** la fin (diffusion) du précédent crée un conflit. Le suivant démarre **toujours** à *diffusion précédente + 1*.

**4. Mal aligner l'adresse réseau.** Un /27 (bloc 32) doit commencer sur un multiple de 32 : .0, .32, .64, .96, .128… Le faire démarrer à .130 est invalide.

**5. Gaspiller sur les liens.** Donner un /24 ou /26 à un lien entre 2 routeurs est un gâchis énorme : un **/30** suffit. (Certains utilisent même /31 sur les liaisons modernes.)`,
    videos: [
      { title: "VLSM — cours & TD (partie 1)", youtubeId: "cuVODaweu7M", moreUrl: "https://www.youtube.com/playlist?list=PLgAuOjTVwB6zeyQckSyU5lr3HY55PIzsc" },
      { title: "VLSM — cours & TD (partie 2)", youtubeId: "vBuEqabAfn0" },
    ],
    badge: {
      id: "badge-variable-circuit",
      name: "Variable Circuit",
      icon: "Network",
      description: "Sait construire un plan d'adressage VLSM sans gaspillage ni chevauchement.",
    },
    challenges: [
      {
        id: "res-vlsm-masque-besoin",
        title: "Le bon masque pour 50 hôtes",
        order: 1,
        difficulty: "medium",
        type: "text",
        prompt: `## 📐 Dimensionner

Un sous-réseau doit accueillir **50 hôtes**. Quel est le **plus petit masque CIDR** (/n) qui suffit ?

💡 Cherche le plus petit *n* de bits d'hôte tel que \`2ⁿ − 2 ≥ 50\`, puis /(32−n).`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "2^5−2 = 30 (trop peu), 2^6−2 = 62 (suffit). Donc 6 bits d'hôte.", cost: 20 },
          { text: "📖 Correction complète : 6 bits d'hôte → préfixe 32−6 = /26 (62 hôtes).", cost: 50 },
        ],
        answer: "/26",
        accept: ["26", "255.255.255.192"],
        caseSensitive: false,
        explanation: `Il faut \`2ⁿ − 2 ≥ 50\`. \`2⁵ − 2 = 30\` (insuffisant), \`2⁶ − 2 = 62\` (suffit) → **6 bits d'hôte** → préfixe **/26** (masque 255.255.255.192), qui offre 62 hôtes. On ne descend pas plus bas car /27 ne donnerait que 30 hôtes.`,
        tags: ["vlsm", "masque"],
      },
      {
        id: "res-vlsm-ordre",
        title: "Dans quel ordre allouer ?",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎯 La règle d'or du VLSM

Pour construire un plan VLSM sans chevauchement ni fragmentation, dans quel ordre alloue-t-on les sous-réseaux ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un gros bloc doit s'aligner sur une frontière « ronde » — mieux vaut le placer avant les petits.", cost: 20 },
          { text: "📖 Correction complète : du plus grand besoin au plus petit.", cost: 50 },
        ],
        options: [
          "Du plus petit besoin au plus grand",
          "Du plus grand besoin au plus petit",
          "Dans l'ordre alphabétique des réseaux",
          "L'ordre n'a aucune importance",
        ],
        answer: 1,
        explanation: `On alloue **du plus grand au plus petit**. Les gros sous-réseaux ont des blocs larges qui doivent tomber sur des frontières alignées ; en les plaçant d'abord, on évite qu'un petit sous-réseau vienne « couper » l'espace au mauvais endroit et bloque une grosse allocation ultérieure.`,
        tags: ["vlsm", "methode"],
      },
      {
        id: "res-vlsm-lien-p2p",
        title: "Masque d'un lien routeur-routeur",
        order: 3,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔗 Ne rien gaspiller

Quel masque CIDR utilises-tu pour un **lien point-à-point** entre deux routeurs (exactement 2 hôtes) ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "2 hôtes utilisables = 2 bits d'hôte = 2^2−2.", cost: 15 },
          { text: "📖 Correction complète : /30 (2 hôtes utilisables).", cost: 40 },
        ],
        answer: "/30",
        accept: ["30", "255.255.255.252"],
        caseSensitive: false,
        explanation: `Un **/30** offre \`2² − 2 = 2\` hôtes utilisables — exactement ce qu'il faut pour relier **2 routeurs**, sans une seule adresse gaspillée. C'est le masque canonique des liaisons point-à-point (les réseaux modernes utilisent parfois /31).`,
        tags: ["vlsm", "point-a-point"],
      },
      {
        id: "res-vlsm-plan-suivant",
        title: "Où commence le sous-réseau suivant ?",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🗺️ Enchaîner les blocs

Dans un plan VLSM sur \`192.168.1.0/24\`, tu viens de placer le réseau **B** en \`192.168.1.128/26\` (diffusion .191).

**Quelle est l'adresse réseau du sous-réseau suivant** (C, qui a besoin d'un /27) ?`,
        points: 350,
        timeLimitSec: 600,
        hints: [
          { text: "Le suivant démarre juste après la diffusion de B, donc à .192.", cost: 30 },
          { text: "Un /27 (bloc 32) commençant à .192 est bien aligné (192 est multiple de 32).", cost: 40 },
          { text: "📖 Correction complète : B finit à .191 → C commence à 192.168.1.192/27.", cost: 70 },
        ],
        answer: "192.168.1.192",
        accept: ["192.168.1.192/27"],
        caseSensitive: false,
        explanation: `Le sous-réseau suivant commence à **diffusion précédente + 1** = .191 + 1 = **.192**. Un /27 (bloc 32) démarrant à .192 est correctement aligné (192 = 6 × 32). Sa plage : réseau .192, hôtes .193→.222, diffusion .223.`,
        tags: ["vlsm", "plan"],
      },
      {
        id: "res-vlsm-vs-flsm",
        title: "VLSM vs FLSM",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚖️ Quelle différence ?

Quel est l'**avantage principal** du VLSM sur le FLSM ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Pense à un lien routeur (2 hôtes) qui reçoit 62 adresses en FLSM.", cost: 20 },
          { text: "📖 Correction complète : VLSM adapte chaque masque au besoin → économise les adresses.", cost: 50 },
        ],
        options: [
          "Le VLSM est plus rapide à router",
          "Le VLSM adapte la taille de chaque sous-réseau à son besoin réel, sans gaspiller d'adresses",
          "Le VLSM ne nécessite pas de masque",
          "Le VLSM fonctionne uniquement en IPv6",
        ],
        answer: 1,
        explanation: `Le **VLSM taille chaque sous-réseau à son besoin** (masque variable), là où le **FLSM** impose une taille unique. Résultat : **aucun gaspillage** — un lien point-à-point prend un /30, un grand LAN prend un /25, dans le même espace d'adressage. Le FLSM, lui, aurait donné 62 adresses à un lien qui n'en veut que 2.`,
        tags: ["vlsm", "flsm", "comparaison"],
      },
      {
        id: "res-tp-vlsm",
        title: "Architecture 1 — Trois LAN inégaux",
        order: 6,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 1 (niveau : simple+)

On découpe \`172.16.0.0/24\` en **VLSM** — du plus grand besoin au plus petit.

**Topologie à monter dans Packet Tracer :**

| Équipement | Interface | LAN | Besoin | Sous-réseau attendu |
|---|---|---|---|---|
| R1 | G0/0 | A | 100 hôtes | \`172.16.0.0/25\` |
| R1 | G0/1 | B | 40 hôtes | \`172.16.0.128/26\` |
| R1 | G0/2 | C | 10 hôtes | \`172.16.0.192/28\` |

**Questions :**

1. Configurez chaque interface de R1 avec la **première adresse utilisable** de son sous-réseau ;
2. Activez les interfaces ;
3. Vérifiez avec \`show ip interface brief\` puis un \`ping\` inter-LAN.

La **correction détaillée** s'affiche après validation.`,
        points: 350,
        timeLimitSec: 1080,
        starter: `! === R1 ===
interface g0/0
`,
        hints: [
          { text: "/25 = 255.255.255.128, /26 = 255.255.255.192, /28 = 255.255.255.240. Premières utilisables : .1, .129, .193.", cost: 35 },
          { text: "📖 Correction complète :\n```\ninterface g0/0\nip address 172.16.0.1 255.255.255.128\nno shutdown\ninterface g0/1\nip address 172.16.0.129 255.255.255.192\nno shutdown\ninterface g0/2\nip address 172.16.0.193 255.255.255.240\nno shutdown\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "G0/0 : passerelle du LAN A en /25", pattern: "ip\\s+address\\s+172\\.16\\.0\\.1\\s+255\\.255\\.255\\.128", flags: "i" },
            { label: "G0/1 : passerelle du LAN B en /26", pattern: "ip\\s+address\\s+172\\.16\\.0\\.129\\s+255\\.255\\.255\\.192", flags: "i" },
            { label: "G0/2 : passerelle du LAN C en /28", pattern: "ip\\s+address\\s+172\\.16\\.0\\.193\\s+255\\.255\\.255\\.240", flags: "i" },
            { label: "Active les interfaces (no shutdown)", pattern: "no\\s+shut", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
interface g0/0
 ip address 172.16.0.1 255.255.255.128     ! LAN A : /25 → 126 hôtes (≥ 100)
 no shutdown
interface g0/1
 ip address 172.16.0.129 255.255.255.192   ! LAN B : /26 → 62 hôtes (≥ 40)
 no shutdown
interface g0/2
 ip address 172.16.0.193 255.255.255.240   ! LAN C : /28 → 14 hôtes (≥ 10)
 no shutdown
\`\`\`

Règle d'or du VLSM : allouer **du plus grand au plus petit** — le /25 d'abord (0–127), puis le /26 (128–191), puis le /28 (192–207). Il reste même 172.16.0.208 → 172.16.0.255 pour l'avenir. En FLSM, ces 3 LAN auraient exigé trois /25… qui ne tiennent pas dans un /24 !`,
        tags: ["tp", "vlsm", "config", "cisco", "architecture"],
      },
      {
        id: "res-tp-vlsm-2",
        title: "Architecture 2 — Deux routeurs + lien /30",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 2 (niveau : intermédiaire)

Cette fois le plan VLSM inclut un **lien inter-routeurs** — le cas d'école du /30. Tout doit tenir dans \`10.0.0.0/25\`.

**Topologie à monter dans Packet Tracer :**

| Équipement | Interface | Rôle | Besoin | Sous-réseau attendu |
|---|---|---|---|---|
| R1 | G0/0 | LAN A | 60 hôtes | \`10.0.0.0/26\` |
| R1 | G0/1 | LAN B | 20 hôtes | \`10.0.0.64/27\` |
| R2 | G0/0 | LAN C | 10 hôtes | \`10.0.0.96/28\` |
| R1 ↔ R2 | G0/2 ↔ G0/1 | lien série | 2 adresses | \`10.0.0.112/30\` |

**Questions :**

1. Configurez R1 : G0/0 et G0/1 (première utilisable de chaque LAN) + G0/2 = \`10.0.0.113\` ;
2. Configurez R2 : G0/0 (première utilisable du LAN C) + G0/1 = \`10.0.0.114\` ;
3. Activez toutes les interfaces.

Blocs \`! === R1 ===\` et \`! === R2 ===\`.`,
        points: 450,
        timeLimitSec: 1500,
        starter: `! === R1 ===
interface g0/0
`,
        hints: [
          { text: "Masques : /26 = .192, /27 = .224, /28 = .240, /30 = .252. Premières utilisables : .1, .65, .97 ; lien : .113 et .114.", cost: 45 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\ninterface g0/0\nip address 10.0.0.1 255.255.255.192\nno shutdown\ninterface g0/1\nip address 10.0.0.65 255.255.255.224\nno shutdown\ninterface g0/2\nip address 10.0.0.113 255.255.255.252\nno shutdown\n! === R2 ===\ninterface g0/0\nip address 10.0.0.97 255.255.255.240\nno shutdown\ninterface g0/1\nip address 10.0.0.114 255.255.255.252\nno shutdown\n```", cost: 100 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "LAN A : 10.0.0.1 /26", pattern: "ip\\s+address\\s+10\\.0\\.0\\.1\\s+255\\.255\\.255\\.192", flags: "i" },
            { label: "LAN B : 10.0.0.65 /27", pattern: "ip\\s+address\\s+10\\.0\\.0\\.65\\s+255\\.255\\.255\\.224", flags: "i" },
            { label: "LAN C : 10.0.0.97 /28", pattern: "ip\\s+address\\s+10\\.0\\.0\\.97\\s+255\\.255\\.255\\.240", flags: "i" },
            { label: "Lien côté R1 : 10.0.0.113 /30", pattern: "ip\\s+address\\s+10\\.0\\.0\\.113\\s+255\\.255\\.255\\.252", flags: "i" },
            { label: "Lien côté R2 : 10.0.0.114 /30", pattern: "ip\\s+address\\s+10\\.0\\.0\\.114\\s+255\\.255\\.255\\.252", flags: "i" },
            { label: "Active les interfaces", pattern: "no\\s+shut", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

**Le plan VLSM** (toujours du plus grand au plus petit) :

| Besoin | Taille | Bloc alloué | Utilisables |
|---|---|---|---|
| LAN A — 60 | /26 (62) | 10.0.0.0 – 63 | .1 → .62 |
| LAN B — 20 | /27 (30) | 10.0.0.64 – 95 | .65 → .94 |
| LAN C — 10 | /28 (14) | 10.0.0.96 – 111 | .97 → .110 |
| Lien R1-R2 | **/30 (2)** | 10.0.0.112 – 115 | .113 et .114 |

**La configuration :**
\`\`\`
! === R1 ===
interface g0/0
 ip address 10.0.0.1 255.255.255.192
 no shutdown
interface g0/1
 ip address 10.0.0.65 255.255.255.224
 no shutdown
interface g0/2
 ip address 10.0.0.113 255.255.255.252   ! lien inter-routeurs
 no shutdown
! === R2 ===
interface g0/0
 ip address 10.0.0.97 255.255.255.240
 no shutdown
interface g0/1
 ip address 10.0.0.114 255.255.255.252
 no shutdown
\`\`\`

Le **/30** est la taille parfaite d'un lien point-à-point : 2 adresses utilisables, zéro gaspillage — en FLSM il aurait fallu lui donner un /26 entier (62 adresses pour 2 !). Note : sans routes (statiques ou IGP), le LAN C reste injoignable depuis A/B — c'est l'objet du chapitre suivant. 😉`,
        tags: ["tp", "vlsm", "config", "cisco", "architecture"],
      },
    ],
  },
];
