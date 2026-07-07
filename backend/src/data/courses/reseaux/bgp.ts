import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 12 : protocole BGP. */
export const bgp: CourseSeed[] = [
  {
    slug: "res-bgp",
    title: "BGP — le protocole qui tient Internet",
    checkpoint: "reseaux",
    codename: "Border Grand Prix",
    domain: "Réseaux — routage",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 13,
    difficulty: "hard",
    summary:
      "Le protocole de routage entre opérateurs : BGP relie les systèmes autonomes (AS) qui composent Internet. Vecteur de chemin, AS-PATH, eBGP vs iBGP, sessions TCP 179 et attributs de décision — avec une configuration Cisco de base.",
    objectives: [
      "Comprendre le rôle de BGP (EGP entre systèmes autonomes)",
      "Définir un AS (Autonomous System) et le numéro d'AS",
      "Distinguer eBGP (entre AS) et iBGP (dans un AS)",
      "Comprendre le vecteur de chemin (AS-PATH) et la prévention des boucles",
      "Configurer une session BGP de base (router bgp, neighbor, network)",
    ],
    lesson: `# 🌍 BGP — le Border Grand Prix

Les IGP (RIP, OSPF) routent **à l'intérieur** d'une organisation. Mais Internet, c'est **des dizaines de milliers d'organisations** (opérateurs, entreprises) qui doivent s'interconnecter. Le protocole qui fait tenir tout ça : **BGP** (*Border Gateway Protocol*), le seul **EGP** utilisé. 🏎️

> 📎 Prérequis : routage dynamique (IGP/EGP, AD, métrique).

---

## 1. Le système autonome (AS) 🏢

Un **AS** (*Autonomous System*) est un ensemble de réseaux sous **une même administration** avec une **politique de routage commune** — typiquement un opérateur (Orange, un FAI) ou une grande entreprise. Chaque AS a un **numéro** unique (**ASN**), attribué mondialement.

BGP route **entre** les AS : il ne dit pas « le chemin le plus court en sauts » mais « **par quels AS** passer pour atteindre tel réseau ».

---

## 2. Vecteur de chemin & AS-PATH 🛤️

BGP est un protocole **à vecteur de chemin** (*path vector*) : pour chaque réseau annoncé, il transporte la **liste des AS traversés** — l'**AS-PATH**.

\`\`\`
 Réseau 200.1.1.0/24  AS-PATH: 65002 65003 65004
        (il faut traverser l'AS 65002, puis 65003, puis 65004)
\`\`\`

Deux usages majeurs de l'AS-PATH :
- **Prévention des boucles** : si un AS voit **son propre numéro** dans l'AS-PATH d'une annonce reçue, il la **rejette** (elle a déjà fait le tour).
- **Choix du chemin** : à égalité par ailleurs, l'AS-PATH **le plus court** (le moins d'AS traversés) est préféré.

BGP privilégie la **politique** et la **fiabilité** sur la « rapidité » — d'où sa robustesse à l'échelle planétaire.

---

## 3. eBGP vs iBGP 🔗

| | **eBGP** (*external*) | **iBGP** (*internal*) |
|---|---|---|
| Entre… | routeurs d'AS **différents** | routeurs du **même** AS |
| But | échanger des routes **entre** opérateurs | propager les routes externes **à l'intérieur** de l'AS |
| AD (Cisco) | **20** | **200** |

BGP établit une **session** entre voisins via **TCP port 179** (fiable). Les voisins ne sont **pas** découverts automatiquement : on les **déclare** explicitement (\`neighbor\`).

---

## 4. Décider parmi plusieurs chemins 🧮

Quand BGP connaît plusieurs routes vers un même préfixe, il applique une **liste d'attributs** dans l'ordre (simplifié) :
1. **Weight** (Cisco, local) — le plus grand gagne ;
2. **Local Preference** — la plus grande (préférence de sortie de l'AS) ;
3. **AS-PATH** — le **plus court** ;
4. **origine**, **MED**, etc.

> 🧠 Contrairement à OSPF (coût = bande passante), BGP décide surtout selon la **politique** (Weight, Local Pref) et la **longueur de l'AS-PATH**.

---

## 5. Configuration Cisco (de base) 🖥️

\`\`\`
Router(config)# router bgp 65001                       ! notre numéro d'AS
Router(config-router)# neighbor 10.0.0.2 remote-as 65002   ! voisin eBGP (AS différent)
Router(config-router)# network 192.168.1.0 mask 255.255.255.0   ! réseau qu'on annonce
\`\`\`

- \`router bgp <ASN>\` : notre AS.
- \`neighbor <ip> remote-as <ASN>\` : déclare un voisin ; si l'ASN diffère → **eBGP**, si identique → **iBGP**.
- \`network … mask …\` : annonce **précisément** un réseau (⚠️ le réseau doit exister dans la table de routage).

**Vérification** :
\`\`\`
Router# show ip bgp                 ! table BGP, AS-PATH
Router# show ip bgp summary         ! voisins, état (Established)
Router# show ip route bgp           ! routes BGP installées (code B)
\`\`\`

---

## 🧠 Ce qu'il faut retenir

- BGP = seul **EGP** : il route **entre** systèmes autonomes (**AS**) → il fait tenir **Internet**.
- Protocole **à vecteur de chemin** : l'**AS-PATH** liste les AS traversés (anti-boucle + choix du chemin).
- **eBGP** (entre AS, AD 20) vs **iBGP** (même AS, AD 200) ; sessions via **TCP 179**.
- Voisins **déclarés manuellement** (\`neighbor … remote-as …\`), pas de découverte auto.
- Décision par **politique** (Weight, Local Pref) puis **AS-PATH le plus court**.

## ⚠️ Erreurs fréquentes des débutants

**1. Croire que BGP choisit « le plus rapide ».** BGP privilégie la **politique** et la **longueur d'AS-PATH**, pas la bande passante. Deux opérateurs peuvent router « long » pour des raisons commerciales.

**2. Oublier que les voisins sont manuels.** BGP **ne découvre pas** ses voisins (contrairement à OSPF/RIP). Il faut **déclarer** chaque \`neighbor\`.

**3. Confondre eBGP et iBGP.** \`remote-as\` **différent** de notre AS → eBGP ; **identique** → iBGP. Les deux n'ont pas les mêmes règles de propagation.

**4. Annoncer un réseau absent de la table.** \`network …\` n'annonce un préfixe **que s'il existe** déjà (connecté ou appris) dans la table de routage. Sinon, rien n'est publié.

**5. Utiliser BGP pour un petit réseau interne.** BGP est fait pour **l'inter-AS**. À l'intérieur d'une organisation, on utilise un **IGP** (OSPF, EIGRP), pas BGP.`,
    videos: [
      { title: "BGP — cours", youtubeId: "vVHbTKtBbLE", moreUrl: "https://www.youtube.com/playlist?list=PLgAuOjTVwB6xyoFFor4O5ly03N4_ekV0D" },
      { title: "BGP — TP Packet Tracer", youtubeId: "0nJeG5KEd7I" },
    ],
    badge: {
      id: "badge-border-grand-prix",
      name: "Border Grand Prix",
      icon: "Network",
      description: "Comprend le routage inter-AS avec BGP : AS-PATH, eBGP/iBGP et configuration de voisins.",
    },
    challenges: [
      {
        id: "res-bgp-role",
        title: "Le rôle de BGP",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🌍 EGP

Quel est le rôle de **BGP** sur Internet ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "IGP = à l'intérieur d'une organisation. BGP fait l'inverse.", cost: 20 },
          { text: "📖 Correction complète : router entre systèmes autonomes (AS) — c'est l'EGP d'Internet.", cost: 50 },
        ],
        options: [
          "Router entre systèmes autonomes (AS) — le protocole inter-opérateurs d'Internet",
          "Router à l'intérieur d'un petit LAN d'entreprise",
          "Attribuer des adresses IP aux PC",
          "Commuter des trames en couche 2",
        ],
        answer: 0,
        explanation: `**BGP** est le seul **EGP** en usage : il route **entre systèmes autonomes (AS)** — c'est lui qui interconnecte les opérateurs et **fait tenir Internet**. À l'intérieur d'une organisation, on utilise un **IGP** (OSPF, RIP). BGP ne fait ni DHCP (couche appli) ni commutation (couche 2).`,
        tags: ["bgp", "egp", "as"],
      },
      {
        id: "res-bgp-as-path",
        title: "L'AS-PATH",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🛤️ Vecteur de chemin

À quoi sert l'attribut **AS-PATH** de BGP (la liste des AS traversés) ?`,
        points: 350,
        timeLimitSec: 420,
        hints: [
          { text: "Deux usages : détecter les boucles, et départager les chemins.", cost: 30 },
          { text: "📖 Correction complète : éviter les boucles (rejeter une annonce contenant son propre AS) et préférer l'AS-PATH le plus court.", cost: 70 },
        ],
        options: [
          "Prévenir les boucles (rejet si son propre AS apparaît) et préférer le chemin le plus court en AS",
          "Chiffrer les annonces",
          "Attribuer des adresses IP",
          "Mesurer la bande passante des liens",
        ],
        answer: 0,
        explanation: `L'**AS-PATH** liste les AS à traverser pour atteindre un réseau. Deux usages : (1) **anti-boucle** — si un AS voit **son propre numéro** dans l'AS-PATH reçu, il **rejette** l'annonce ; (2) **choix du chemin** — à égalité par ailleurs, l'AS-PATH **le plus court** est préféré. BGP raisonne en **AS traversés**, pas en bande passante.`,
        tags: ["bgp", "as-path", "path-vector"],
      },
      {
        id: "res-bgp-ebgp-ibgp",
        title: "eBGP ou iBGP ?",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔗 Interne ou externe

Une session BGP entre deux routeurs appartenant à des **AS différents** s'appelle…`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "external = entre AS différents ; internal = même AS.", cost: 20 },
          { text: "📖 Correction complète : eBGP (external BGP), entre AS différents.", cost: 50 },
        ],
        options: ["eBGP (external)", "iBGP (internal)", "OSPF", "RIP"],
        answer: 0,
        explanation: `Entre **AS différents** → **eBGP** (*external* BGP, AD 20). Entre routeurs du **même** AS → **iBGP** (*internal*, AD 200). Concrètement, si le \`remote-as\` du voisin **diffère** de notre propre AS, la session est **eBGP**.`,
        tags: ["bgp", "ebgp", "ibgp"],
      },
      {
        id: "res-bgp-tcp-port",
        title: "Le transport de BGP",
        order: 4,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔌 Session fiable

BGP établit ses sessions entre voisins sur **TCP**. Sur quel **numéro de port** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "C'est un port bien connu, spécifique à BGP.", cost: 20 },
          { text: "📖 Correction complète : TCP port 179.", cost: 50 },
        ],
        answer: 179,
        explanation: `BGP s'appuie sur **TCP port 179** : le transport fiable de TCP garantit que les annonces (qui peuvent être volumineuses et critiques) arrivent **intactes et ordonnées**. C'est aussi pourquoi les voisins BGP doivent être **joignables en IP** avant que la session ne s'établisse (état **Established**).`,
        tags: ["bgp", "tcp", "port"],
      },
      {
        id: "res-bgp-config",
        title: "Déclarer un voisin eBGP",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🖥️ Config Cisco

Ton routeur est dans l'**AS 65001**. Configure BGP pour établir une session **eBGP** avec le voisin \`10.0.0.2\` situé dans l'**AS 65002**.`,
        points: 350,
        timeLimitSec: 480,
        starter: `router bgp 65001
`,
        hints: [
          { text: "neighbor 10.0.0.2 remote-as 65002 (AS différent → eBGP).", cost: 30 },
          { text: "📖 Correction complète :\n```\nrouter bgp 65001\nneighbor 10.0.0.2 remote-as 65002\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Démarre BGP avec notre numéro d'AS (router bgp 65001)", pattern: "router\\s+bgp\\s+65001", flags: "i" },
            { label: "Déclare le voisin avec son adresse IP", pattern: "neighbor\\s+10\\.0\\.0\\.2", flags: "i" },
            { label: "Indique l'AS distant du voisin (remote-as 65002)", pattern: "remote-as\\s+65002", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
router bgp 65001
neighbor 10.0.0.2 remote-as 65002   ! AS différent → session eBGP
\`\`\`

\`router bgp 65001\` fixe **notre** AS. \`neighbor 10.0.0.2 remote-as 65002\` **déclare** le voisin (BGP ne le découvre pas tout seul) ; comme 65002 ≠ 65001, c'est de l'**eBGP**. On ajouterait \`network … mask …\` pour annoncer nos réseaux. Vérifie l'état **Established** avec \`show ip bgp summary\`.`,
        tags: ["bgp", "config", "cisco", "neighbor"],
      },
      {
        id: "res-tp-bgp",
        title: "TP — Peering eBGP entre deux AS",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🧪 TP 9 — Architecture : deux systèmes autonomes (niveau : avancé)

\`\`\`
        AS 65001                          AS 65002
   LAN 10.1.1.0/24                   LAN 10.2.2.0/24
        │                                 │
      [ R1 ]── 203.0.113.0/30 lien inter-AS ──[ R2 ]
          .1                             .2
\`\`\`

**Mission :** établis la session **eBGP** et fais s'échanger les deux LAN :
1. **R1** (AS 65001) : déclare R2 comme voisin et **annonce** \`10.1.1.0/24\` (avec \`mask\`) ;
2. **R2** (AS 65002) : symétrique.

Préfixe les blocs par \`! === R1 ===\` et \`! === R2 ===\`.`,
        points: 500,
        timeLimitSec: 1200,
        starter: `! === R1 ===
router bgp 65001
`,
        hints: [
          { text: "router bgp <mon AS> / neighbor <IP voisin> remote-as <son AS> / network <LAN> mask 255.255.255.0 — des deux côtés.", cost: 50 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\nrouter bgp 65001\nneighbor 203.0.113.2 remote-as 65002\nnetwork 10.1.1.0 mask 255.255.255.0\n! === R2 ===\nrouter bgp 65002\nneighbor 203.0.113.1 remote-as 65001\nnetwork 10.2.2.0 mask 255.255.255.0\n```", cost: 110 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Démarre BGP dans l'AS 65001", pattern: "router\\s+bgp\\s+65001", flags: "i" },
            { label: "R1 déclare son voisin eBGP", pattern: "neighbor\\s+203\\.0\\.113\\.2\\s+remote-as\\s+65002", flags: "i" },
            { label: "R1 annonce son LAN avec mask", pattern: "network\\s+10\\.1\\.1\\.0\\s+mask\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "Démarre BGP dans l'AS 65002", pattern: "router\\s+bgp\\s+65002", flags: "i" },
            { label: "R2 déclare son voisin eBGP", pattern: "neighbor\\s+203\\.0\\.113\\.1\\s+remote-as\\s+65001", flags: "i" },
            { label: "R2 annonce son LAN avec mask", pattern: "network\\s+10\\.2\\.2\\.0\\s+mask\\s+255\\.255\\.255\\.0", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
! === R1 ===
router bgp 65001
 neighbor 203.0.113.2 remote-as 65002   ! AS distant ≠ le mien → eBGP
 network 10.1.1.0 mask 255.255.255.0    ! j'annonce MON LAN
! === R2 ===
router bgp 65002
 neighbor 203.0.113.1 remote-as 65001
 network 10.2.2.0 mask 255.255.255.0
\`\`\`

Contrairement à OSPF/RIP, BGP ne **découvre pas** ses voisins : on les **déclare** à la main (session TCP **179**). Le \`network … mask …\` n'annonce la route que si elle existe déjà dans la table locale. Une fois la session **Established** (\`show ip bgp summary\`), chaque AS voit le LAN de l'autre avec son **AS-PATH**. C'est exactement — en miniature — ce que font les opérateurs sur Internet.`,
        tags: ["tp", "bgp", "ebgp", "config", "architecture"],
      },
    ],
  },
];
