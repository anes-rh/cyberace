import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 5 : routage statique. */
export const routageStatique: CourseSeed[] = [
  {
    slug: "res-routage-statique",
    title: "Routage statique — tables, routes et route par défaut",
    checkpoint: "reseaux",
    codename: "Manual Pit Stop",
    domain: "Réseaux — routage",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 6,
    difficulty: "medium",
    summary:
      "Apprendre au routeur les chemins à la main : réseaux connectés, routes statiques (next-hop ou interface de sortie), route par défaut. Lecture d'une table de routage et configuration Cisco pas à pas.",
    objectives: [
      "Comprendre comment un routeur choisit une route (correspondance la plus longue)",
      "Distinguer réseaux connectés, routes statiques et route par défaut",
      "Écrire une route statique (next-hop vs interface de sortie)",
      "Lire une table de routage (codes C, S, S*)",
      "Vérifier la connectivité (ping, traceroute, show ip route)",
    ],
    resources: [
      {
        label: "Architecture 1 — topologie de départ (.pka)",
        url: "/pka/res-routage-statique-architecture-1.pka",
        kind: "pkt-start",
        note: "À ouvrir dans Cisco Packet Tracer : R1, R2 et R3 en chaîne (R2 au centre), non configurés. Adresse les liaisons et écris les routes statiques de l'Architecture 1.",
      },
    ],
    lesson: `# 🛠️ Routage statique — le Manual Pit Stop

Un **routeur** relie des réseaux différents et décide, paquet par paquet, **par où sortir**. Pour ça il consulte sa **table de routage**. En **statique**, c'est **toi** qui écris les routes à la main — parfait pour comprendre les fondations avant l'automatisation (routage dynamique). 🏎️

> 📎 Prérequis : adressage IPv4 / masques (module IPv4 & FLSM).

---

## 1. Comment un routeur décide 🧭

Pour chaque paquet, le routeur compare l'**adresse de destination** aux entrées de sa table et choisit la **correspondance la plus longue** (*longest prefix match*) : la route dont le préfixe (masque) est le **plus spécifique** l'emporte.

\`\`\`
 Destination du paquet : 192.168.2.10
 Table :
   192.168.2.0/24  → via R2      ✅ (plus spécifique)
   0.0.0.0/0       → via R3      (route par défaut, moins spécifique)
\`\`\`

Si **aucune** route ne correspond et qu'il n'y a **pas** de route par défaut → le paquet est **jeté** (*destination unreachable*).

---

## 2. Les trois origines d'une route 🚦

| Code | Origine | Comment elle arrive |
|---|---|---|
| **C** | *Connected* | réseau **directement branché** sur une interface active + IP configurée |
| **L** | *Local* | l'adresse **exacte** de l'interface (/32) |
| **S** | *Static* | **écrite à la main** par l'admin |
| **S\*** | défaut | route statique **par défaut** (0.0.0.0/0) |

Un réseau connecté apparaît **automatiquement** dès qu'on configure une IP sur une interface **activée** (\`no shutdown\`).

---

## 3. Écrire une route statique ✍️

**Syntaxe Cisco** :

\`\`\`
Router(config)# ip route <réseau> <masque> <next-hop | interface-sortie>
\`\`\`

Deux façons de désigner la sortie :
- **next-hop** (adresse IP du routeur voisin) : \`ip route 192.168.2.0 255.255.255.0 10.0.0.2\`
- **interface de sortie** : \`ip route 192.168.2.0 255.255.255.0 Serial0/0/0\`

> 🧠 Le **next-hop** doit être **joignable** (dans un réseau connecté). Sur une liaison point-à-point, l'interface de sortie suffit.

**Route par défaut** (« tout le reste part par là », utile vers Internet) :

\`\`\`
Router(config)# ip route 0.0.0.0 0.0.0.0 10.0.0.2
\`\`\`

---

## 4. Exemple : relier deux LAN 🔗

\`\`\`
 [LAN A 192.168.1.0/24]──R1──10.0.0.0/30──R2──[LAN B 192.168.2.0/24]
                        .1        .1  .2   .1
\`\`\`

Sur **R1**, le LAN B n'est **pas** connecté → il faut une route statique :
\`\`\`
R1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
\`\`\`
Sur **R2**, le LAN A n'est pas connecté → route retour :
\`\`\`
R2(config)# ip route 192.168.1.0 255.255.255.0 10.0.0.1
\`\`\`

⚠️ **Le routage doit être bidirectionnel** : sans la route retour sur R2, le ping partirait mais la **réponse** ne reviendrait jamais.

---

## 5. Lire la table & vérifier 🔎

\`\`\`
R1# show ip route
 C   192.168.1.0/24 is directly connected, GigabitEthernet0/0
 C   10.0.0.0/30    is directly connected, Serial0/0/0
 S   192.168.2.0/24 [1/0] via 10.0.0.2
\`\`\`

Le \`[1/0]\` = **[distance administrative / métrique]**. La distance administrative d'une route statique est **1** (très fiable).

**Vérifications** : \`ping 192.168.2.10\` (connectivité de bout en bout), \`traceroute\` (chemin sauté par sauté), \`show ip route\` (la table).

---

## 🧠 Ce qu'il faut retenir

- Un routeur choisit la **correspondance la plus longue** (préfixe le plus spécifique).
- **C** = connecté (auto), **S** = statique (manuel), **S\*** = route par défaut (0.0.0.0/0).
- Syntaxe : \`ip route <réseau> <masque> <next-hop | interface>\`.
- Le routage doit être **bidirectionnel** (route **aller ET retour**).
- Distance administrative d'une route statique = **1** ; connecté = **0**.
- Vérifier avec **ping**, **traceroute**, **show ip route**.

## ⚠️ Erreurs fréquentes des débutants

**1. Oublier la route retour.** Le ping « ne marche pas » alors que l'aller est bon : c'est la **réponse** qui n'a pas de chemin. Configure la route **dans les deux sens**.

**2. Oublier \`no shutdown\`.** Une interface administrativement éteinte ne fait apparaître **ni** le réseau connecté **ni** ne transporte de trafic. Active-la.

**3. Mauvais masque dans \`ip route\`.** Écrire \`255.255.0.0\` au lieu de \`255.255.255.0\` route un bloc trop large et peut capturer du trafic non voulu.

**4. Next-hop injoignable.** Si le next-hop n'est pas dans un réseau **connecté**, la route est inutilisable. Sur un lien point-à-point, préfère l'**interface de sortie**.

**5. Croire qu'une route par défaut remplace tout.** \`0.0.0.0/0\` n'est utilisée **que** si aucune route plus spécifique ne correspond — c'est le **dernier recours**, pas la priorité.`,
    videos: [
      { title: "Routage statique — cours", youtubeId: "vezX18XTs3E", moreUrl: "https://www.youtube.com/playlist?list=PLgAuOjTVwB6xyoFFor4O5ly03N4_ekV0D" },
      { title: "Routage statique — TP Packet Tracer", youtubeId: "K1b9c7HCkZA" },
    ],
    badge: {
      id: "badge-manual-pit-stop",
      name: "Manual Pit Stop",
      icon: "Network",
      description: "Configure et lit des routes statiques, y compris la route par défaut.",
    },
    challenges: [
      {
        id: "res-rs-longest-match",
        title: "La route qui gagne",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧭 Longest prefix match

La table contient \`192.168.2.0/24 via R2\` **et** \`0.0.0.0/0 via R3\`. Un paquet vise \`192.168.2.10\`.

**Par quelle route part-il ?**`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Le routeur choisit la correspondance la plus SPÉCIFIQUE (préfixe le plus long).", cost: 20 },
          { text: "📖 Correction complète : /24 est plus spécifique que /0 → via R2.", cost: 50 },
        ],
        options: ["Via R3 (route par défaut)", "Via R2 (192.168.2.0/24)", "Le paquet est jeté", "Les deux en même temps"],
        answer: 1,
        explanation: `\`192.168.2.0/24\` **correspond** à \`192.168.2.10\` et est **plus spécifique** (préfixe /24) que la route par défaut \`/0\`. Par la règle du *longest prefix match*, le paquet part **via R2**. La route par défaut ne sert que quand **rien** de plus précis ne matche.`,
        tags: ["routage", "statique", "longest-match"],
      },
      {
        id: "res-rs-code-c",
        title: "Que signifie le code C ?",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🚦 Lire la table

Dans \`show ip route\`, une entrée commence par **\`C\`**. Que signifie ce code ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "C comme… le réseau est branché directement sur une interface du routeur.", cost: 15 },
          { text: "📖 Correction complète : C = Connected, réseau directement connecté.", cost: 40 },
        ],
        options: [
          "Connected — réseau directement connecté à une interface",
          "Custom — route personnalisée",
          "Central — route vers le cœur de réseau",
          "Cached — route mise en cache",
        ],
        answer: 0,
        explanation: `**C = Connected** : le réseau est **directement branché** sur une interface active du routeur avec une IP configurée. Ces routes apparaissent **automatiquement** (distance administrative 0), sans configuration de \`ip route\`. **S** serait *Static*, **S\\*** la route par défaut.`,
        tags: ["routage", "statique", "table"],
      },
      {
        id: "res-rs-config",
        title: "Écrire une route statique",
        order: 3,
        difficulty: "hard",
        type: "text",
        prompt: `## ✍️ Configuration Cisco

Sur R1, écris la commande qui crée une **route statique** vers le réseau \`192.168.2.0/24\` en passant par le **next-hop \`10.0.0.2\`**.

💡 Utilise le masque **décimal** (pas /24).`,
        points: 350,
        timeLimitSec: 600,
        hints: [
          { text: "La commande commence par `ip route`, suivie du réseau, du masque, puis du next-hop.", cost: 30 },
          { text: "/24 en décimal = 255.255.255.0.", cost: 40 },
          { text: "📖 Correction complète : ip route 192.168.2.0 255.255.255.0 10.0.0.2", cost: 70 },
        ],
        answer: "ip route 192.168.2.0 255.255.255.0 10.0.0.2",
        accept: ["ip route 192.168.2.0 255.255.255.0 10.0.0.2 "],
        caseSensitive: false,
        explanation: `\`\`\`
R1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
\`\`\`

Structure : \`ip route <réseau> <masque> <next-hop>\`. On aurait aussi pu mettre l'**interface de sortie** (\`ip route 192.168.2.0 255.255.255.0 Serial0/0/0\`). ⚠️ N'oublie pas la **route retour** sur R2 vers 192.168.1.0/24, sinon les réponses ne reviennent pas.`,
        tags: ["routage", "statique", "config", "cisco"],
      },
      {
        id: "res-rs-defaut",
        title: "La route par défaut",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🌍 Tout le reste par là

Quel **réseau/masque** représente la **route par défaut** (celle utilisée quand aucune autre ne correspond, typiquement vers Internet) ?

💡 Écris-le sous la forme \`réseau masque\` (ex : \`X.X.X.X Y.Y.Y.Y\`).`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "C'est la route « la moins spécifique possible » : elle matche TOUT.", cost: 20 },
          { text: "📖 Correction complète : 0.0.0.0 0.0.0.0 (soit 0.0.0.0/0).", cost: 50 },
        ],
        answer: "0.0.0.0 0.0.0.0",
        accept: ["0.0.0.0/0", "0.0.0.0 0.0.0.0 "],
        caseSensitive: false,
        explanation: `La route par défaut est **\`0.0.0.0 0.0.0.0\`** (soit **/0**) : un masque à zéro bit ne fixe **aucune** contrainte, donc elle correspond à **toutes** les destinations. C'est la route de **dernier recours** (\`ip route 0.0.0.0 0.0.0.0 <next-hop>\`), typiquement vers le FAI/Internet.`,
        tags: ["routage", "statique", "defaut"],
      },
      {
        id: "res-rs-bidirectionnel",
        title: "Le ping ne revient pas",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔁 Débogage

Tu as configuré une route statique de R1 vers le LAN B. Le \`ping\` depuis le LAN A **échoue** quand même. R1 a bien sa route.

**Quelle est la cause la plus probable ?**`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Le paquet aller arrive peut-être bien… mais la réponse, elle, a-t-elle un chemin ?", cost: 20 },
          { text: "📖 Correction complète : il manque la route RETOUR sur R2 vers le LAN A.", cost: 50 },
        ],
        options: [
          "Il manque la route retour sur R2 vers le LAN A",
          "R1 est éteint",
          "Le ping ne fonctionne jamais entre deux LAN",
          "Il faut redémarrer les PC",
        ],
        answer: 0,
        explanation: `Le routage est **bidirectionnel** : l'aller atteint le LAN B, mais la **réponse** du LAN B vers le LAN A a besoin d'une **route retour** sur R2. Sans \`ip route 192.168.1.0 255.255.255.0 <R1>\` sur R2, la réponse est jetée et le ping « échoue ». Toujours configurer les routes **dans les deux sens**.`,
        tags: ["routage", "statique", "debug"],
      },
      {
        id: "res-tp-statique",
        title: "Architecture 1 — Trois routeurs en chaîne",
        order: 6,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 1 (niveau : intermédiaire)

**Topologie à monter dans Packet Tracer** (interfaces déjà adressées et actives — mais aucun LAN ne joint l'autre !) :

| Lien | Réseau | Adresses |
|---|---|---|
| LAN 1 → R1 (G0/0) | \`192.168.1.0/24\` | passerelle .1 |
| R1 (G0/1) ↔ R2 (G0/0) | \`10.0.12.0/30\` | R1 = .1, R2 = .2 |
| R2 (G0/1) ↔ R3 (G0/0) | \`10.0.23.0/30\` | R2 = .1, R3 = .2 |
| R3 (G0/1) → LAN 3 | \`192.168.3.0/24\` | passerelle .1 |

**Questions :**

1. Sur **R1** : configurez une **route par défaut** vers R2 ;
2. Sur **R2** : configurez une route vers **chaque LAN** (il ne les connaît pas !) ;
3. Sur **R3** : configurez une **route par défaut** vers R2 ;
4. Vérifiez : \`ping\` de bout en bout LAN 1 → LAN 3.

Blocs \`! === R1 ===\`, \`! === R2 ===\`, \`! === R3 ===\`.`,
        points: 400,
        timeLimitSec: 1200,
        starter: `! === R1 ===

! === R2 ===

! === R3 ===
`,
        hints: [
          { text: "Route par défaut : ip route 0.0.0.0 0.0.0.0 <next-hop>. R2 doit connaître 192.168.1.0/24 ET 192.168.3.0/24.", cost: 40 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\nip route 0.0.0.0 0.0.0.0 10.0.12.2\n! === R2 ===\nip route 192.168.1.0 255.255.255.0 10.0.12.1\nip route 192.168.3.0 255.255.255.0 10.0.23.2\n! === R3 ===\nip route 0.0.0.0 0.0.0.0 10.0.23.1\n```", cost: 90 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "R1 : route par défaut vers R2 (10.0.12.2)", pattern: "ip\\s+route\\s+0\\.0\\.0\\.0\\s+0\\.0\\.0\\.0\\s+10\\.0\\.12\\.2", flags: "i" },
            { label: "R2 : route vers le LAN 1 via R1", pattern: "ip\\s+route\\s+192\\.168\\.1\\.0\\s+255\\.255\\.255\\.0\\s+10\\.0\\.12\\.1", flags: "i" },
            { label: "R2 : route vers le LAN 3 via R3", pattern: "ip\\s+route\\s+192\\.168\\.3\\.0\\s+255\\.255\\.255\\.0\\s+10\\.0\\.23\\.2", flags: "i" },
            { label: "R3 : route par défaut vers R2 (10.0.23.1)", pattern: "ip\\s+route\\s+0\\.0\\.0\\.0\\s+0\\.0\\.0\\.0\\s+10\\.0\\.23\\.1", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
! === R1 ===
ip route 0.0.0.0 0.0.0.0 10.0.12.2          ! tout ce qui n'est pas local → R2
! === R2 ===
ip route 192.168.1.0 255.255.255.0 10.0.12.1  ! LAN 1 est derrière R1
ip route 192.168.3.0 255.255.255.0 10.0.23.2  ! LAN 3 est derrière R3
! === R3 ===
ip route 0.0.0.0 0.0.0.0 10.0.23.1          ! tout → R2
\`\`\`

R1 et R3 sont des **stub routers** (une seule sortie) → la **route par défaut** suffit. R2, au centre, doit connaître **les deux LAN** — c'est lui qui a besoin des routes précises. Sans la route retour sur R2, le ping partirait… mais la réponse serait jetée. Vérifie avec \`show ip route\` (codes S et S*) puis \`ping\` de bout en bout.`,
        tags: ["tp", "routage", "statique", "config", "architecture"],
      },
      {
        id: "res-tp-statique-2",
        title: "Architecture 2 — Étoile d'agences + Internet",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 2 (niveau : avancé)

Le siège (HQ) relie **deux agences** et fournit l'**accès Internet** à tout le monde.

**Topologie à monter dans Packet Tracer :**

| Lien | Réseau | Adresses |
|---|---|---|
| Agence A : LAN → R-A | \`192.168.1.0/24\` | passerelle .1 |
| R-A ↔ R-HQ | \`10.0.1.0/30\` | R-A = .1, HQ = .2 |
| Agence B : LAN → R-B | \`192.168.2.0/24\` | passerelle .1 |
| R-B ↔ R-HQ | \`10.0.2.0/30\` | R-B = .1, HQ = .2 |
| R-HQ ↔ FAI | \`203.0.113.0/30\` | HQ = .1, FAI = .2 |

**Questions :**

1. Sur **R-A** et **R-B** : une seule sortie → configurez la **route par défaut** vers HQ ;
2. Sur **R-HQ** : configurez les routes vers les **deux LAN d'agence** ;
3. Sur **R-HQ** : configurez la **route par défaut** vers le FAI (203.0.113.2) pour l'accès Internet ;
4. Question de réflexion : pourquoi HQ a-t-il besoin des routes précises **en plus** de sa route par défaut ? *(réponse dans la correction)*

Blocs \`! === R-A ===\`, \`! === R-B ===\`, \`! === R-HQ ===\`.`,
        points: 450,
        timeLimitSec: 1500,
        starter: `! === R-A ===

! === R-B ===

! === R-HQ ===
`,
        hints: [
          { text: "R-A : ip route 0.0.0.0 0.0.0.0 10.0.1.2 ; R-B : idem via 10.0.2.2. HQ : 2 routes /24 vers les agences + default vers 203.0.113.2.", cost: 45 },
          { text: "📖 Correction complète :\n```\n! === R-A ===\nip route 0.0.0.0 0.0.0.0 10.0.1.2\n! === R-B ===\nip route 0.0.0.0 0.0.0.0 10.0.2.2\n! === R-HQ ===\nip route 192.168.1.0 255.255.255.0 10.0.1.1\nip route 192.168.2.0 255.255.255.0 10.0.2.1\nip route 0.0.0.0 0.0.0.0 203.0.113.2\n```", cost: 100 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "R-A : route par défaut vers HQ", pattern: "ip\\s+route\\s+0\\.0\\.0\\.0\\s+0\\.0\\.0\\.0\\s+10\\.0\\.1\\.2", flags: "i" },
            { label: "R-B : route par défaut vers HQ", pattern: "ip\\s+route\\s+0\\.0\\.0\\.0\\s+0\\.0\\.0\\.0\\s+10\\.0\\.2\\.2", flags: "i" },
            { label: "HQ : route vers le LAN de l'agence A", pattern: "ip\\s+route\\s+192\\.168\\.1\\.0\\s+255\\.255\\.255\\.0\\s+10\\.0\\.1\\.1", flags: "i" },
            { label: "HQ : route vers le LAN de l'agence B", pattern: "ip\\s+route\\s+192\\.168\\.2\\.0\\s+255\\.255\\.255\\.0\\s+10\\.0\\.2\\.1", flags: "i" },
            { label: "HQ : route par défaut vers le FAI", pattern: "ip\\s+route\\s+0\\.0\\.0\\.0\\s+0\\.0\\.0\\.0\\s+203\\.0\\.113\\.2", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

\`\`\`
! === R-A ===  (stub : une seule sortie)
ip route 0.0.0.0 0.0.0.0 10.0.1.2
! === R-B ===
ip route 0.0.0.0 0.0.0.0 10.0.2.2
! === R-HQ ===
ip route 192.168.1.0 255.255.255.0 10.0.1.1   ! agence A
ip route 192.168.2.0 255.255.255.0 10.0.2.1   ! agence B
ip route 0.0.0.0 0.0.0.0 203.0.113.2          ! tout le reste → Internet
\`\`\`

**Réponse à la question 4 :** la table de routage choisit toujours la route la **plus précise** (*longest prefix match*). Sur HQ, un paquet vers 192.168.2.14 matche le /24 (→ agence B) **avant** le 0.0.0.0/0 (→ FAI). Sans les routes /24, HQ enverrait le trafic inter-agences… **vers Internet**, où les adresses privées RFC 1918 sont jetées. La route par défaut ne sert que pour *ce qu'on ne connaît pas*.

**Chaîne complète d'un ping A → Internet :** PC → R-A (default) → HQ (default) → FAI. Et le retour ? Le FAI doit avoir une route vers 192.168.x.x… c'est exactement pour ça qu'en réalité on ajoute du **NAT** sur HQ — aperçu du monde réel. 😉

**Vérification PT :** \`show ip route\` sur HQ (2 routes S + 1 S*), ping PC-A → PC-B, puis PC-A → 203.0.113.2.`,
        tags: ["tp", "routage", "statique", "config", "architecture"],
      },
      {
        id: "res-lab-statique-complet",
        title: "🏁 LAB COMPLET — 3 routeurs, ping de bout en bout",
        order: 8,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏁 Lab guidé complet (fichier : « topologie de départ » du module)

Ouvre le **.pka de départ** (sous le cours) : **R1 — R2 — R3 en chaîne** (liaisons série), non configurés. On simule le **LAN de chaque routeur** par une **boucle locale** (\`Loopback0\`). Objectif : **le ping doit passer entre TOUS les LAN** (les 3 boucles).

**Plan d'adressage imposé :**

| Élément | Réseau | Adresses |
|---|---|---|
| LAN de R1 (\`Loopback0\`) | \`192.168.1.0/24\` | R1 = .1 |
| Liaison R1 ↔ R2 (série) | \`10.0.12.0/30\` | R1 = .1, R2 = .2 |
| LAN de R2 (\`Loopback0\`) | \`192.168.2.0/24\` | R2 = .1 |
| Liaison R2 ↔ R3 (série) | \`10.0.23.0/30\` | R2 = .1, R3 = .2 |
| LAN de R3 (\`Loopback0\`) | \`192.168.3.0/24\` | R3 = .1 |

**Instructions — dans Packet Tracer :**

1. **Adresse toutes les interfaces** (les 2 boucles des extrémités + les liaisons série ; \`clock rate 64000\` côté DCE de chaque lien) et fais \`no shutdown\`.
2. **Routes statiques** — pour que chaque routeur atteigne les 2 LAN qu'il ne connaît pas :
   - **R1** : route par défaut vers R2 (\`0.0.0.0/0 → 10.0.12.2\`) ;
   - **R2** (au centre) : route vers le LAN de R1 (via 10.0.12.1) **et** vers le LAN de R3 (via 10.0.23.2) ;
   - **R3** : route par défaut vers R2 (\`0.0.0.0/0 → 10.0.23.1\`).

Écris ci-dessous la config **complète de R2** (Loopback0 + les 2 interfaces série + les 2 routes statiques). La correction complète (R1, R2, R3) + la **matrice de ping** s'affiche après validation.`,
        points: 700,
        timeLimitSec: 2400,
        starter: `! === R2 (au centre) ===
interface Loopback0
`,
        hints: [
          { text: "R2 porte Loopback0 (192.168.2.1/24), ses deux liaisons série (10.0.12.2 et 10.0.23.1), et DEUX routes statiques vers les LAN de R1 et R3.", cost: 60 },
          { text: "📖 Correction R2 :\n```\ninterface Loopback0\n ip address 192.168.2.1 255.255.255.0\ninterface Serial0/0/0\n ip address 10.0.12.2 255.255.255.252\n no shutdown\ninterface Serial0/0/1\n ip address 10.0.23.1 255.255.255.252\n clock rate 64000\n no shutdown\nip route 192.168.1.0 255.255.255.0 10.0.12.1\nip route 192.168.3.0 255.255.255.0 10.0.23.2\n```", cost: 140 },
        ],
        answer: JSON.stringify({
          minRatio: 0.6,
          keypoints: [
            { label: "Boucle locale de R2 (son LAN)", pattern: "interface\\s+Loopback0[\\s\\S]{0,60}ip\\s+address\\s+192\\.168\\.2\\.1", flags: "i" },
            { label: "Liaison vers R1 adressée", pattern: "ip\\s+address\\s+10\\.0\\.12\\.2\\s+255\\.255\\.255\\.252", flags: "i" },
            { label: "Liaison vers R3 adressée", pattern: "ip\\s+address\\s+10\\.0\\.23\\.1\\s+255\\.255\\.255\\.252", flags: "i" },
            { label: "Route vers le LAN de R1", pattern: "ip\\s+route\\s+192\\.168\\.1\\.0\\s+255\\.255\\.255\\.0\\s+10\\.0\\.12\\.1", flags: "i" },
            { label: "Route vers le LAN de R3", pattern: "ip\\s+route\\s+192\\.168\\.3\\.0\\s+255\\.255\\.255\\.0\\s+10\\.0\\.23\\.2", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction complète + vérification

\`\`\`
! === R1 ===
interface Loopback0
 ip address 192.168.1.1 255.255.255.0
interface Serial0/0/0
 ip address 10.0.12.1 255.255.255.252
 clock rate 64000            ! DCE de ce lien
 no shutdown
ip route 0.0.0.0 0.0.0.0 10.0.12.2
! === R2 (centre) ===
interface Loopback0
 ip address 192.168.2.1 255.255.255.0
interface Serial0/0/0
 ip address 10.0.12.2 255.255.255.252
 no shutdown
interface Serial0/0/1
 ip address 10.0.23.1 255.255.255.252
 clock rate 64000
 no shutdown
ip route 192.168.1.0 255.255.255.0 10.0.12.1
ip route 192.168.3.0 255.255.255.0 10.0.23.2
! === R3 ===
interface Loopback0
 ip address 192.168.3.1 255.255.255.0
interface Serial0/0/1
 ip address 10.0.23.2 255.255.255.252
 no shutdown
ip route 0.0.0.0 0.0.0.0 10.0.23.1
\`\`\`

### 🎯 Comment savoir que TOUT est bon : la matrice de ping

Depuis chaque routeur, teste les boucles des autres (\`ping <ip> source <sa boucle>\`). **Tout doit répondre :**

| Depuis \\ Vers | 192.168.1.1 | 192.168.2.1 | 192.168.3.1 |
|---|---|---|---|
| **R1** | — (local) | ✅ | ✅ |
| **R2** | ✅ | — | ✅ |
| **R3** | ✅ | ✅ | — |

Si les **3 LAN se pinguent tous entre eux**, le routage statique est complet. 🏆 Point clé : le routage est **bidirectionnel** — R2 doit connaître les DEUX LAN d'extrémité, sinon l'aller passe mais le retour est jeté.

**Si un ping échoue :** \`show ip route\` (la route existe-t-elle des DEUX côtés ?), \`show ip interface brief\` (interfaces up/up ? sinon \`clock rate\` manquant côté DCE), et teste de proche en proche (R1 → 10.0.12.2, puis → 10.0.23.2).`,
        tags: ["lab", "routage", "statique", "ping", "verification", "architecture"],
      },
    ],
  },
];
