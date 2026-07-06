import type { CourseSeed } from "../../../types";

/**
 * Module prérequis du checkpoint Réseaux : numération (binaire/décimal/hexa),
 * ET logique pour les masques, octets et tailles IPv4/IPv6. Tout le socle
 * nécessaire avant l'adressage réseau.
 */
export const numeration: CourseSeed[] = [
  {
    slug: "res-numeration",
    title: "Bases de la machine & numération — binaire, décimal, hexadécimal",
    checkpoint: "reseaux",
    codename: "Binary Warm-up",
    domain: "Réseaux — prérequis",
    theme: "circuit",
    icon: "Binary",
    accent: "#5FB3C6",
    order: 1,
    difficulty: "easy",
    summary:
      "Le prérequis indispensable avant l'adressage IP : compter en binaire et en hexadécimal, convertir dans les trois bases, faire un ET logique bit à bit (le secret des masques) et comprendre pourquoi une IPv4 tient sur 32 bits.",
    objectives: [
      "Convertir un nombre entre décimal, binaire et hexadécimal (méthodes pas à pas)",
      "Poser un ET logique bit à bit et comprendre son rôle dans les masques",
      "Manier les puissances de 2 et les décalages de bits",
      "Comprendre l'octet, et le découpage d'une IPv4 (32 bits) / IPv6 (128 bits)",
      "Calculer une adresse réseau et un nombre d'hôtes à partir d'un masque",
    ],
    lesson: `# 🔢 Bases de la machine & numération — le Binary Warm-up

Avant de router le moindre paquet, il faut parler la **langue des machines** : le **binaire**. Toute l'adressage réseau (IP, masques, sous-réseaux) n'est que du binaire déguisé en décimal. Ce module est le **prérequis** : on le muscle une fois, et tout le reste devient limpide. 🏎️

---

## 1. Pourquoi le binaire ? ⚡

Un ordinateur ne connaît que **deux états** : courant (**1**) ou pas de courant (**0**). Un **bit** (*binary digit*) est cette unité : 0 ou 1. On regroupe les bits par **8** → un **octet** (*byte*), qui peut représenter **2⁸ = 256** valeurs (de 0 à 255).

> 🎯 Retiens ce nombre : **une case d'adresse IPv4 va de 0 à 255** — c'est exactement un octet.

---

## 2. Les trois bases 🧮

| Base | Chiffres | Usage |
|---|---|---|
| **Décimale** (base 10) | 0–9 | ce qu'on lit tous les jours |
| **Binaire** (base 2) | 0, 1 | ce que la machine manipule |
| **Hexadécimale** (base 16) | 0–9 puis A–F | notation compacte (MAC, IPv6) |

En hexadécimal, après 9 viennent **A=10, B=11, C=12, D=13, E=14, F=15**.

### 2.1 Les poids des bits (à connaître par cœur)

Chaque position d'un octet a un **poids**, puissance de 2, de gauche à droite :

\`\`\`
  bit :   b7   b6   b5   b4   b3   b2   b1   b0
 poids : 128   64   32   16    8    4    2    1
\`\`\`

**La somme de tous les poids = 255** (c'est la valeur max d'un octet, tous les bits à 1).

---

## 3. Décimal → binaire 🔽

**Méthode 1 — soustraction des poids** (la plus rapide pour un octet). On part de 128 et on descend : « est-ce que ça rentre ? »

Exemple : **convertir 173**.

\`\`\`
173 ≥ 128 ? oui → bit 1, reste 173-128 = 45
 45 ≥  64 ? non → bit 0
 45 ≥  32 ? oui → bit 1, reste 45-32 = 13
 13 ≥  16 ? non → bit 0
 13 ≥   8 ? oui → bit 1, reste 13-8 = 5
  5 ≥   4 ? oui → bit 1, reste 5-4 = 1
  1 ≥   2 ? non → bit 0
  1 ≥   1 ? oui → bit 1, reste 0

→ 173 = 1 0 1 0 1 1 0 1 = 10101101
\`\`\`

**Méthode 2 — divisions successives par 2** (marche pour tout nombre) : on divise par 2, on note les restes, et on **lit les restes de bas en haut**.

\`\`\`
173 / 2 = 86 reste 1
 86 / 2 = 43 reste 0
 43 / 2 = 21 reste 1
 21 / 2 = 10 reste 1
 10 / 2 =  5 reste 0
  5 / 2 =  2 reste 1
  2 / 2 =  1 reste 0
  1 / 2 =  0 reste 1
lecture ↑ : 10101101   ✅ (même résultat)
\`\`\`

---

## 4. Binaire → décimal 🔼

On **additionne les poids** des bits à 1.

\`\`\`
   1  1  0  0  0  0  0  0
 128 64 32 16  8  4  2  1
→ 128 + 64 = 192
\`\`\`

Donc \`11000000\` = **192**. (C'est le 1ᵉʳ octet du masque /26, on y reviendra !)

---

## 5. Hexadécimal ↔ décimal ↔ binaire 🔠

**Astuce en or** : **1 chiffre hexa = exactement 4 bits** (un *quartet*). On convertit donc **par groupes de 4 bits**.

| Hexa | Déc | Binaire | Hexa | Déc | Binaire |
|---|---|---|---|---|---|
| 0 | 0 | 0000 | 8 | 8 | 1000 |
| 1 | 1 | 0001 | 9 | 9 | 1001 |
| 2 | 2 | 0010 | A | 10 | 1010 |
| 3 | 3 | 0011 | B | 11 | 1011 |
| 4 | 4 | 0100 | C | 12 | 1100 |
| 5 | 5 | 0101 | D | 13 | 1101 |
| 6 | 6 | 0110 | E | 14 | 1110 |
| 7 | 7 | 0111 | F | 15 | 1111 |

**Décimal → hexa** (divisions successives par 16) : \`250 / 16 = 15 reste 10\` → 15=F, 10=A → **FA**.

**Hexa → binaire** : chaque chiffre devient 4 bits. \`FA\` → F=\`1111\`, A=\`1010\` → \`11111010\`. Vérif : 128+64+32+16+8+2 = **250**. ✅

---

## 6. L'opération reine du réseau : le ET logique 🔑

Le **ET logique (AND)** compare deux bits : le résultat vaut **1 seulement si les DEUX bits valent 1**.

| A | B | A ET B |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

**Pourquoi c'est capital ?** Pour trouver l'**adresse réseau**, un routeur fait un **ET bit à bit** entre l'**adresse IP** et le **masque**. Le masque « laisse passer » (bits à 1) la partie réseau et « efface » (bits à 0) la partie hôte.

**Exemple** — IP \`192.168.1.130\` avec le masque \`255.255.255.192\` (/26). On ne travaille que le **dernier octet** (les autres sont \`x AND 255 = x\`) :

\`\`\`
  130 = 1 0 0 0 0 0 1 0
  192 = 1 1 0 0 0 0 0 0   (masque)
  ────────────────────  ET bit à bit
  128 = 1 0 0 0 0 0 0 0
\`\`\`

→ adresse réseau = \`192.168.1.128\`. Le ET a **effacé** les 6 bits d'hôte de droite (poids 0 dans le masque). C'est **tout** le secret du sous-réseautage. 🎯

---

## 7. Décalages & puissances de 2 🚀

Multiplier par 2 = **décaler tous les bits d'un cran à gauche** ; diviser par 2 = décaler à droite. À mémoriser :

\`\`\`
2⁰=1  2¹=2  2²=4  2³=8  2⁴=16  2⁵=32  2⁶=64  2⁷=128  2⁸=256
2⁹=512  2¹⁰=1024
\`\`\`

**Nombre d'hôtes d'un sous-réseau** = \`2^(bits d'hôte) − 2\` (on retire l'adresse **réseau** et l'adresse de **diffusion**). Ex : masque /26 → 32−26 = **6 bits d'hôte** → \`2⁶ − 2 = 62\` hôtes utilisables.

---

## 8. Octets, IPv4 et IPv6 🧱

- Une **adresse IPv4** = **32 bits** = **4 octets**, notés en décimal séparés par des points : \`192.168.1.130\`. Chaque octet ∈ [0, 255].
- Une **adresse IPv6** = **128 bits** = **16 octets**, notés en **hexadécimal** par blocs de 16 bits (4 chiffres hexa) séparés par \`:\` — ex \`2001:0db8:0000:0000:0000:0000:0000:0001\`.

C'est pour ça que l'hexadécimal est **partout** en réseau : il est **compact** (2 chiffres hexa = 1 octet) et se convertit trivialement en binaire.

---

## 🧠 Ce qu'il faut retenir

- **1 octet = 8 bits = 0 à 255**. Poids : 128 64 32 16 8 4 2 1 (somme 255).
- **Déc → bin** : soustraction des poids, ou divisions par 2 (restes lus de bas en haut).
- **Bin → déc** : somme des poids des bits à 1.
- **1 chiffre hexa = 4 bits** ; hexa ↔ binaire se fait par quartets.
- Le **ET logique** IP ⋀ masque donne l'**adresse réseau** (1 seulement si les deux bits sont à 1).
- **Hôtes** = 2^(bits d'hôte) − 2. **IPv4 = 32 bits (4 octets)**, **IPv6 = 128 bits (16 octets)**.

## ⚠️ Erreurs fréquentes des débutants

**1. Oublier de compléter à 8 bits.** \`5\` en binaire c'est \`101\`, mais dans un octet on écrit \`00000101\`. Un octet a **toujours 8 bits** — les zéros de gauche comptent pour l'alignement.

**2. Confondre A–F et des lettres « décoratives ».** En hexa, \`A\` vaut **10**, \`F\` vaut **15** — ce sont des chiffres, pas du texte. \`1F\` = 1×16 + 15 = **31**.

**3. Se tromper de sens en lisant les restes.** Dans la méthode des divisions par 2, on lit les restes **du dernier au premier** (de bas en haut). Les lire à l'endroit donne le nombre… à l'envers.

**4. Oublier le « −2 » du nombre d'hôtes.** Sur \`n\` bits d'hôte il y a \`2ⁿ\` combinaisons, mais **2 sont réservées** (adresse réseau = tout à 0, diffusion = tout à 1). Un /24 a 2⁸ = 256 adresses mais **254** hôtes utilisables.

**5. Appliquer le ET sur le mauvais octet.** Un octet du masque à \`255\` laisse l'octet IP **inchangé** ; c'est seulement l'octet où le masque n'est **pas** 255 (ni 0) qu'il faut vraiment poser le ET bit à bit.`,
    badge: {
      id: "badge-binary-warmup",
      name: "Binary Warm-up",
      icon: "Binary",
      description: "Maîtrise les conversions binaire/décimal/hexa, le ET logique et les tailles d'adresses IPv4/IPv6.",
    },
    challenges: [
      {
        id: "res-num-dec2bin",
        title: "Décimal → binaire",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔽 Conversion

Convertis le nombre décimal **173** en binaire sur **8 bits**.

💡 Soustrais les poids depuis 128, ou divise successivement par 2. Écris les 8 bits sans espaces (ex : \`00001010\`).`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          { text: "128 rentre dans 173 (reste 45), 64 non, 32 oui (reste 13), 16 non, 8 oui (reste 5), 4 oui (reste 1), 2 non, 1 oui.", cost: 15 },
          { text: "📖 Correction complète : 173 = 128+32+8+4+1 → bits 128,32,8,4,1 à 1 → 10101101.", cost: 40 },
        ],
        answer: "10101101",
        accept: ["1010 1101", "10101101b"],
        caseSensitive: false,
        explanation: `**173 = 128 + 32 + 8 + 4 + 1**. On place un 1 sous chaque poids utilisé :

\`\`\`
 128  64  32  16   8   4   2   1
  1   0   1   0   1   1   0   1   → 10101101
\`\`\`

Vérification : 128+32+8+4+1 = 173. ✅ (Sur 8 bits, on garde bien les 8 positions.)`,
        tags: ["numeration", "binaire", "prerequis"],
      },
      {
        id: "res-num-bin2dec",
        title: "Binaire → décimal",
        order: 2,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🔼 Conversion

Quelle est la valeur **décimale** de l'octet binaire suivant ?

\`\`\`
11000000
\`\`\``,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Additionne les poids des bits à 1 : ici les deux premiers, 128 et 64.", cost: 15 },
          { text: "📖 Correction complète : 128 + 64 = 192.", cost: 40 },
        ],
        answer: 192,
        explanation: `Les deux bits de poids fort sont à 1 : \`128 + 64 = 192\`. C'est le 1ᵉʳ octet du masque **/26** (\`255.255.255.192\`) — tu le recroiseras souvent en sous-réseautage.`,
        tags: ["numeration", "binaire", "prerequis"],
      },
      {
        id: "res-num-dec2hex",
        title: "Décimal → hexadécimal",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔠 Conversion hexa

Convertis **250** (décimal) en **hexadécimal**.

💡 Divise par 16 ; le reste 10 s'écrit \`A\`, 11=\`B\`, …, 15=\`F\`.`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "250 / 16 = 15 reste 10. 15 → F, 10 → A.", cost: 20 },
          { text: "📖 Correction complète : 250 = 15×16 + 10 = F puis A → FA.", cost: 50 },
        ],
        answer: "FA",
        accept: ["0xFA", "fa", "0xfa"],
        caseSensitive: false,
        explanation: `\`250 / 16 = 15\` reste \`10\`. Le quotient 15 → **F**, le reste 10 → **A**. Donc \`250 = \`**\`FA\`** en hexa.

Vérif par quartets : F=\`1111\`, A=\`1010\` → \`11111010\` = 128+64+32+16+8+2 = 250. ✅`,
        tags: ["numeration", "hexadecimal", "prerequis"],
      },
      {
        id: "res-num-hex2dec",
        title: "Hexadécimal → décimal",
        order: 4,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔠 Conversion inverse

Quelle est la valeur **décimale** de l'hexadécimal **\`2F\`** ?`,
        points: 200,
        timeLimitSec: 240,
        hints: [
          { text: "2F = 2×16 + F. Et F vaut 15.", cost: 20 },
          { text: "📖 Correction complète : 2×16 + 15 = 32 + 15 = 47.", cost: 50 },
        ],
        answer: 47,
        explanation: `\`2F\` = \`2 × 16 + F\` = \`32 + 15\` = **47**. (Chaque position hexa a un poids : 16¹ pour le \`2\`, 16⁰ pour le \`F\`.)`,
        tags: ["numeration", "hexadecimal", "prerequis"],
      },
      {
        id: "res-num-et-masque",
        title: "ET logique : trouver l'adresse réseau",
        order: 5,
        difficulty: "hard",
        type: "numeric",
        prompt: `## 🔑 Le ET des masques

On applique le masque \`255.255.255.192\` à l'adresse IP \`192.168.1.130\`. Seul le **dernier octet** est intéressant (les autres valent \`x AND 255 = x\`).

**Quelle est la valeur du dernier octet de l'adresse réseau** (résultat de \`130 ET 192\` bit à bit) ?`,
        points: 350,
        timeLimitSec: 600,
        hints: [
          { text: "Écris 130 et 192 en binaire, puis pose le ET colonne par colonne (1 seulement si les deux bits sont à 1).", cost: 30 },
          { text: "130 = 10000010, 192 = 11000000. Le ET ne garde que le bit de poids 128.", cost: 40 },
          { text: "📖 Correction complète : 10000010 ET 11000000 = 10000000 = 128.", cost: 70 },
        ],
        answer: 128,
        explanation: `\`\`\`
  130 = 1 0 0 0 0 0 1 0
  192 = 1 1 0 0 0 0 0 0   (masque /26)
  ─────────────────────  ET
  128 = 1 0 0 0 0 0 0 0
\`\`\`

Le résultat vaut **128** → l'adresse réseau est \`192.168.1.128\`. Le masque a **effacé** les 6 bits de droite (bits d'hôte). C'est exactement ce que fait un routeur pour savoir à quel sous-réseau appartient une adresse.`,
        tags: ["numeration", "et-logique", "masque", "prerequis"],
      },
      {
        id: "res-num-hotes",
        title: "Nombre d'hôtes d'un /26",
        order: 6,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🚀 Puissances de 2

Un sous-réseau utilise le masque **/26**. Le préfixe occupe 26 bits sur 32.

**Combien d'adresses d'hôtes UTILISABLES contient-il ?** (n'oublie pas de retirer l'adresse réseau et l'adresse de diffusion)`,
        points: 200,
        timeLimitSec: 420,
        hints: [
          { text: "Bits d'hôte = 32 − 26 = 6. Nombre d'adresses = 2^6.", cost: 20 },
          { text: "📖 Correction complète : 2^6 = 64 adresses, moins 2 réservées (réseau + diffusion) = 62.", cost: 50 },
        ],
        answer: 62,
        explanation: `Bits d'hôte = \`32 − 26 = 6\`. Donc \`2⁶ = 64\` adresses au total, **moins 2** (adresse **réseau** = tout à 0, adresse de **diffusion** = tout à 1) → **62 hôtes** utilisables.

Formule à retenir : **hôtes = 2^(32 − préfixe) − 2**.`,
        tags: ["numeration", "puissances", "masque", "prerequis"],
      },
      {
        id: "res-num-ipv4-bits",
        title: "IPv4 vs IPv6 : combien de bits ?",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧱 Tailles d'adresses

**Combien de bits compte une adresse IPv4, et une adresse IPv6 ?**`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "IPv4 = 4 octets. IPv6 est bien plus grande (c'est pour ça qu'on l'a créée).", cost: 15 },
          { text: "📖 Correction complète : IPv4 = 32 bits (4 octets), IPv6 = 128 bits (16 octets).", cost: 40 },
        ],
        options: [
          "IPv4 = 32 bits (4 octets) · IPv6 = 128 bits (16 octets)",
          "IPv4 = 64 bits · IPv6 = 128 bits",
          "IPv4 = 16 bits · IPv6 = 64 bits",
          "IPv4 = 32 bits · IPv6 = 64 bits",
        ],
        answer: 0,
        explanation: `Une **IPv4** tient sur **32 bits** = 4 octets (\`192.168.1.130\`, chaque octet de 0 à 255). Une **IPv6** occupe **128 bits** = 16 octets, notés en hexadécimal par blocs (\`2001:0db8:…\`). IPv6 offre donc 2⁹⁶ fois plus d'adresses — de quoi ne jamais retomber en pénurie.`,
        tags: ["numeration", "ipv4", "ipv6", "prerequis"],
      },
      {
        id: "res-num-code-dec2bin",
        title: "Algorithme de conversion décimal → binaire",
        order: 8,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🧮 Coder la conversion

Écris un algorithme qui lit un entier \`N ≥ 0\` et affiche les **restes** de ses divisions successives par 2 (les bits, du poids faible au poids fort).

> Méthode : tant que \`N > 0\`, afficher \`N mod 2\`, puis \`N ← N div 2\`.`,
        points: 200,
        timeLimitSec: 600,
        starter: `Algorithme DecVersBin ;
Var N : entier ;
Debut
    Ecrire("Donner un entier N") ; Lire(N) ;

Fin.`,
        hints: [
          { text: "Boucle Tantque N > 0 : Ecrire(N mod 2) puis N ← N div 2.", cost: 25 },
          { text: "N mod 2 donne le bit courant (0 ou 1), N div 2 « retire » ce bit.", cost: 30 },
          { text: "📖 Correction complète :\n```\nTantque N > 0 Faire\n    Ecrire(N mod 2) ;\n    N <- N div 2 ;\nFait ;\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Boucle tant que N > 0", pattern: "Tant\\s*que[\\s\\S]{0,10}N\\s*>\\s*0", flags: "i" },
            { label: "Affiche le bit courant N mod 2", pattern: "N\\s*mod\\s*2", flags: "i" },
            { label: "Retire le bit courant avec N div 2", pattern: "N\\s*(←|<-)\\s*N\\s*div\\s*2", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
Algorithme DecVersBin ;
Var N : entier ;
Debut
    Ecrire("Donner un entier N") ; Lire(N) ;
    Tantque N > 0 Faire
        Ecrire(N mod 2) ;   // bit de poids faible courant
        N ← N div 2 ;       // on décale vers la droite
    Fait ;
Fin.
\`\`\`

L'algorithme affiche les bits **du poids faible au poids fort** (ordre inverse de l'écriture usuelle). Pour les afficher dans le bon sens, on les empilerait dans une pile (LIFO) puis on dépilerait — un joli pont avec le checkpoint Algorithmique ! Le couple **\`mod 2\` / \`div 2\`** est l'exact équivalent binaire du \`mod 10\` / \`div 10\` décimal.`,
        tags: ["numeration", "code", "conversion", "prerequis"],
      },
    ],
  },
];
