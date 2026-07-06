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
    ],
  },
];
