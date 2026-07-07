import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 8 : protocole OSPF. */
export const ospf: CourseSeed[] = [
  {
    slug: "res-ospf",
    title: "Protocole OSPF — état de liens & plus court chemin",
    checkpoint: "reseaux",
    codename: "Dijkstra Drive",
    domain: "Réseaux — routage",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 9,
    difficulty: "hard",
    summary:
      "Le protocole IGP de référence : OSPF construit la carte complète du réseau (LSDB), calcule les plus courts chemins avec Dijkstra, se base sur la bande passante et converge vite. Router ID, zones, Hello, DR/BDR et configuration Cisco.",
    objectives: [
      "Comprendre OSPF : état de liens, LSA, LSDB, algorithme SPF (Dijkstra)",
      "Calculer le coût OSPF (basé sur la bande passante)",
      "Comprendre Router ID, zones (area 0 backbone), voisinage Hello",
      "Savoir à quoi servent le DR et le BDR sur un réseau multi-accès",
      "Configurer OSPF (router ospf, network wildcard area)",
    ],
    lesson: `# 🗺️ OSPF — le Dijkstra Drive

**OSPF** (*Open Shortest Path First*) est **le** protocole IGP le plus utilisé en entreprise. Contrairement à RIP (« ouï-dire »), chaque routeur OSPF possède la **carte complète** du réseau et calcule le **plus court chemin** avec **Dijkstra**. Résultat : convergence rapide, pas de boucle, prise en compte de la **vitesse** des liens. 🏎️

> 📎 Prérequis : le module **Routage dynamique** (état de liens, AD, métrique).

---

## 1. Le principe état de liens 🧠

Chaque routeur :
1. **Découvre ses voisins** en échangeant des messages **Hello**.
2. Décrit ses liens dans des **LSA** (*Link-State Advertisements*) qu'il **inonde** dans la zone.
3. Assemble tous les LSA reçus dans une **base de données topologique** (**LSDB**) — **identique** sur tous les routeurs d'une zone.
4. Applique **SPF (Dijkstra)** sur cette carte pour trouver le **plus court chemin** vers chaque réseau.

> 🧠 Tous les routeurs d'une zone ont la **même LSDB** — c'est ce qui **élimine les boucles** et accélère la convergence.

---

## 2. La métrique = le coût (bande passante) 💰

Le **coût** d'un lien OSPF est inversement proportionnel à sa **bande passante** :

\`\`\`
 coût = bande passante de référence (10^8 = 100 Mbps) / bande passante du lien
\`\`\`

| Lien | Débit | Coût |
|---|---|---|
| Ethernet 10 Mbps | 10 Mbps | 10 |
| Fast Ethernet | 100 Mbps | 1 |
| Gigabit | 1 Gbps | 1 (⚠️ plancher — voir remarque) |

Le **coût total** d'un chemin = la **somme** des coûts des liens traversés. OSPF choisit le chemin de coût **minimal** — donc il **préfère les liens rapides**, là où RIP compte bêtement les sauts.

> ⚠️ Avec la référence par défaut (100 Mbps), Gigabit et Fast Ethernet ont tous deux un coût de 1. On ajuste avec \`auto-cost reference-bandwidth\` pour départager les liens > 100 Mbps.

---

## 3. Router ID & zones 🆔

- **Router ID** : identifiant unique du routeur (format IP). Choix : l'IP de **loopback** la plus haute, sinon l'IP d'interface active la plus haute, sinon fixé manuellement (\`router-id\`).
- **Zones** : OSPF découpe un grand réseau en **zones** pour limiter la taille de la LSDB. La **zone 0** est le **backbone** (dorsale) — toutes les autres zones s'y raccordent. Dans un réseau simple, **tout est en area 0**.

---

## 4. Voisinage & DR/BDR 🤝

Les routeurs deviennent **voisins** via les **Hello** (envoyés en multicast **224.0.0.5**). Sur un réseau **multi-accès** (plusieurs routeurs sur le même segment, ex. un LAN), pour éviter que **chacun** échange avec **tous** (explosion des adjacences), on élit :
- un **DR** (*Designated Router*) : le point de rendez-vous, il centralise les LSA ;
- un **BDR** (*Backup DR*) : prend le relais si le DR tombe.

Les autres routeurs ne dialoguent en détail qu'avec le **DR/BDR** (multicast **224.0.0.6**). L'élection se base sur la **priorité** (la plus haute), puis le **Router ID** le plus élevé.

---

## 5. Configuration Cisco 🖥️

\`\`\`
Router(config)# router ospf 1                                  ! 1 = process ID (local)
Router(config-router)# router-id 1.1.1.1                       ! (optionnel mais recommandé)
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0    ! wildcard + zone
Router(config-router)# network 10.0.0.0 0.0.0.3 area 0
\`\`\`

**Attention au masque générique (*wildcard*)** : OSPF utilise l'**inverse** du masque. \`/24\` (255.255.255.0) → wildcard **0.0.0.255**. \`/30\` (255.255.255.252) → wildcard **0.0.0.3**.

**Vérification** :
\`\`\`
Router# show ip route ospf        ! routes OSPF, code "O", AD 110
Router# show ip ospf neighbor     ! voisins, état FULL, DR/BDR
Router# show ip ospf interface    ! coût, Hello, zone
\`\`\`
Une route OSPF : \`O 192.168.2.0/24 [110/2] via 10.0.0.2\` → AD **110**, coût **2**.

---

## 🧠 Ce qu'il faut retenir

- OSPF = **état de liens** : LSA inondés → **LSDB** identique partout → **SPF/Dijkstra**.
- Métrique = **coût** = 10⁸ / bande passante ; **coût total = somme** des liens. OSPF préfère les liens **rapides**.
- **Router ID** (loopback la plus haute) ; **zone 0 = backbone**.
- **Hello** (224.0.0.5) pour le voisinage ; **DR/BDR** sur les réseaux multi-accès (224.0.0.6).
- Config : \`router ospf <id>\` + \`network <ip> <wildcard> area <n>\`. Code **O**, AD **110**.

## ⚠️ Erreurs fréquentes des débutants

**1. Mettre le masque au lieu de la wildcard.** OSPF veut le masque **inversé** : /24 → \`0.0.0.255\`, /30 → \`0.0.0.3\`. Mettre \`255.255.255.0\` échoue.

**2. Confondre process ID et Router ID.** Le \`1\` de \`router ospf 1\` est **local** au routeur (il n'a pas besoin d'être identique entre voisins). Le **Router ID** (1.1.1.1) est l'identité globale du routeur.

**3. Oublier que les zones doivent toucher l'area 0.** Toute zone OSPF se raccorde au **backbone (area 0)**. Une zone isolée ne route pas correctement.

**4. Négliger le plancher de coût.** Avec la référence par défaut (100 Mbps), Gigabit et Fast Ethernet ont le **même** coût (1). Ajuste \`reference-bandwidth\` pour de vrais réseaux rapides.

**5. Croire que le DR route pour les autres.** Le **DR** n'est pas une passerelle : il **centralise les LSA** sur un segment multi-accès pour réduire les échanges. Les paquets, eux, suivent toujours le plus court chemin calculé par chaque routeur.`,
    videos: [
      { title: "OSPF — cours", youtubeId: "Q1i8KuKrmQY", moreUrl: "https://www.youtube.com/playlist?list=PLgAuOjTVwB6xyoFFor4O5ly03N4_ekV0D" },
      { title: "OSPF — TP Packet Tracer", youtubeId: "mvNu4LQ-ejk" },
    ],
    badge: {
      id: "badge-dijkstra-drive",
      name: "Dijkstra Drive",
      icon: "Network",
      description: "Configure OSPF et comprend LSDB, coût, zones et DR/BDR.",
    },
    challenges: [
      {
        id: "res-ospf-metrique",
        title: "Sur quoi OSPF calcule le coût",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 💰 La métrique OSPF

Contrairement à RIP (qui compte les sauts), OSPF calcule sa métrique (le **coût**) à partir de… ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un lien rapide doit avoir un coût faible : la formule utilise la bande passante.", cost: 20 },
          { text: "📖 Correction complète : le coût = 10^8 / bande passante du lien.", cost: 50 },
        ],
        options: [
          "La bande passante des liens (coût = 10^8 / débit)",
          "Le nombre de sauts",
          "L'adresse IP la plus basse",
          "Le temps depuis le dernier redémarrage",
        ],
        answer: 0,
        explanation: `OSPF calcule un **coût** inversement proportionnel à la **bande passante** : \`coût = 10⁸ / débit\`. Un lien rapide a un coût **faible**, donc il est **préféré**. Le coût d'un chemin est la **somme** des coûts des liens. C'est bien plus fin que le simple *hop count* de RIP.`,
        tags: ["ospf", "metrique", "cout"],
      },
      {
        id: "res-ospf-lsdb",
        title: "La base de données OSPF",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 État de liens

Qu'est-ce qui caractérise un protocole **à état de liens** comme OSPF ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Chaque routeur ne se contente pas de ce que disent ses voisins : il a la carte complète.", cost: 20 },
          { text: "📖 Correction complète : tous les routeurs d'une zone ont la MÊME carte (LSDB) et calculent le plus court chemin (Dijkstra).", cost: 50 },
        ],
        options: [
          "Chaque routeur a la carte complète du réseau (LSDB) et applique Dijkstra",
          "Chaque routeur ne connaît que ses voisins directs",
          "Il n'y a pas de calcul de chemin",
          "Il compte uniquement les sauts",
        ],
        answer: 0,
        explanation: `Dans un protocole **à état de liens**, chaque routeur inonde ses **LSA**, tous assemblent la **même** base topologique (**LSDB**), puis appliquent **SPF (Dijkstra)** pour trouver le plus court chemin. Cette vision **globale et partagée** élimine les boucles et accélère la convergence — l'opposé de RIP qui route « par ouï-dire ».`,
        tags: ["ospf", "lsdb", "etat-de-liens"],
      },
      {
        id: "res-ospf-wildcard",
        title: "Le masque générique (wildcard)",
        order: 3,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎭 Wildcard OSPF

Dans la commande \`network\`, OSPF veut le **masque générique** (wildcard), c'est-à-dire l'**inverse** du masque.

**Quel est le wildcard correspondant à un réseau /24 (255.255.255.0) ?**`,
        points: 350,
        timeLimitSec: 420,
        hints: [
          { text: "Wildcard = 255.255.255.255 − masque. Pour 255.255.255.0…", cost: 30 },
          { text: "📖 Correction complète : 255-255=0, 255-255=0, 255-255=0, 255-0=255 → 0.0.0.255.", cost: 70 },
        ],
        answer: "0.0.0.255",
        accept: ["0.0.0.255 "],
        caseSensitive: false,
        explanation: `Le **wildcard** est l'inverse bit à bit du masque : \`255.255.255.255 − 255.255.255.0 = \`**\`0.0.0.255\`**. On l'utilise ainsi : \`network 192.168.1.0 0.0.0.255 area 0\`. Pour un /30 (255.255.255.252), le wildcard serait \`0.0.0.3\`. Mettre le masque normal à la place échoue.`,
        tags: ["ospf", "wildcard", "config"],
      },
      {
        id: "res-ospf-dr-bdr",
        title: "À quoi sert le DR ?",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🤝 DR / BDR

Sur un réseau **multi-accès** (plusieurs routeurs sur le même segment), OSPF élit un **DR** (Designated Router). Pourquoi ?`,
        points: 350,
        timeLimitSec: 420,
        hints: [
          { text: "Sans DR, chaque routeur devrait échanger ses LSA avec TOUS les autres (n²).", cost: 30 },
          { text: "📖 Correction complète : le DR centralise les LSA pour réduire le nombre d'adjacences sur le segment.", cost: 70 },
        ],
        options: [
          "Pour centraliser les échanges de LSA et réduire le nombre d'adjacences sur le segment",
          "Pour router tout le trafic du segment (c'est la passerelle)",
          "Pour attribuer les adresses IP",
          "Pour remplacer l'algorithme de Dijkstra",
        ],
        answer: 0,
        explanation: `Sur un segment multi-accès, sans DR chaque routeur formerait une adjacence avec **tous** les autres (explosion en n²). Le **DR** sert de **point de rendez-vous** : chacun lui envoie ses LSA, il les redistribue (le **BDR** est son secours). Ça **réduit** drastiquement les échanges. Attention : le DR **n'est pas** une passerelle — les paquets suivent toujours le plus court chemin calculé localement.`,
        tags: ["ospf", "dr-bdr", "multi-acces"],
      },
      {
        id: "res-ospf-config",
        title: "Activer OSPF en area 0",
        order: 5,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🖥️ Config Cisco

Écris les commandes qui lancent le **processus OSPF n°1** et **annoncent** le réseau \`192.168.1.0/24\` dans la **zone 0**.

💡 N'oublie pas le **wildcard** (inverse du masque) et \`area 0\`.`,
        points: 200,
        timeLimitSec: 600,
        starter: `router ospf 1
`,
        hints: [
          { text: "network <ip> <wildcard> area <n>. Pour /24 le wildcard est 0.0.0.255.", cost: 25 },
          { text: "📖 Correction complète :\n```\nrouter ospf 1\nnetwork 192.168.1.0 0.0.0.255 area 0\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Lance le processus OSPF (router ospf <id>)", pattern: "router\\s+ospf\\s+\\d", flags: "i" },
            { label: "Annonce le réseau avec la commande network", pattern: "network\\s+192\\.168\\.1\\.0", flags: "i" },
            { label: "Utilise le wildcard 0.0.0.255", pattern: "0\\.0\\.0\\.255", flags: "i" },
            { label: "Place le réseau dans la zone 0", pattern: "area\\s+0", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
router ospf 1
network 192.168.1.0 0.0.0.255 area 0
\`\`\`

\`router ospf 1\` démarre le processus (le \`1\` est **local**). \`network 192.168.1.0 0.0.0.255 area 0\` annonce le /24 (wildcard **0.0.0.255**) dans la **zone backbone**. On peut fixer \`router-id 1.1.1.1\` pour une identité stable. Vérifie avec \`show ip ospf neighbor\` (état **FULL**).`,
        tags: ["ospf", "config", "cisco", "code"],
      },
      {
        id: "res-tp-ospf",
        title: "TP — OSPF zone 0 sur 3 routeurs",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🧪 TP 5 — Architecture : triangle OSPF (niveau : intermédiaire+)

\`\`\`
                    [ R1 ]─ G0/0 ─ LAN 192.168.1.0/24
                   /      \\
      10.0.12.0/30         10.0.13.0/30
                 /            \\
   LAN ─[ R2 ]── 10.0.23.0/30 ──[ R3 ]─ LAN
   192.168.2.0/24            192.168.3.0/24
\`\`\`

**Mission :** configure **OSPF processus 1, zone 0** sur les 3 routeurs :
1. \`router-id\` : \`1.1.1.1\` (R1), \`2.2.2.2\` (R2), \`3.3.3.3\` (R3) ;
2. annonce chaque réseau avec le **bon wildcard** (/24 → \`0.0.0.255\`, /30 → \`0.0.0.3\`) dans \`area 0\` ;
3. passe l'interface **LAN** de chaque routeur en \`passive-interface\` (pas de Hello vers les PC !).

Préfixe chaque bloc par \`! === R1 ===\`, etc.`,
        points: 450,
        timeLimitSec: 1500,
        starter: `! === R1 ===
router ospf 1
`,
        hints: [
          { text: "Par routeur : router ospf 1 / router-id X.X.X.X / network <LAN> 0.0.0.255 area 0 / network <liens> 0.0.0.3 area 0 / passive-interface g0/0.", cost: 45 },
          { text: "📖 Correction complète (R1 ; R2/R3 symétriques) :\n```\n! === R1 ===\nrouter ospf 1\nrouter-id 1.1.1.1\nnetwork 192.168.1.0 0.0.0.255 area 0\nnetwork 10.0.12.0 0.0.0.3 area 0\nnetwork 10.0.13.0 0.0.0.3 area 0\npassive-interface g0/0\n```", cost: 100 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Démarre le processus OSPF 1", pattern: "router\\s+ospf\\s+1", flags: "i" },
            { label: "Fixe le router-id de R1", pattern: "router-id\\s+1\\.1\\.1\\.1", flags: "i" },
            { label: "Fixe le router-id de R2", pattern: "router-id\\s+2\\.2\\.2\\.2", flags: "i" },
            { label: "Fixe le router-id de R3", pattern: "router-id\\s+3\\.3\\.3\\.3", flags: "i" },
            { label: "Annonce un LAN /24 avec wildcard 0.0.0.255 en area 0", pattern: "network\\s+192\\.168\\.\\d\\.0\\s+0\\.0\\.0\\.255\\s+area\\s+0", flags: "i" },
            { label: "Annonce un lien /30 avec wildcard 0.0.0.3 en area 0", pattern: "network\\s+10\\.0\\.\\d+\\.0\\s+0\\.0\\.0\\.3\\s+area\\s+0", flags: "i" },
            { label: "Passe l'interface LAN en passive", pattern: "passive-interface", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
! === R1 ===
router ospf 1
 router-id 1.1.1.1
 network 192.168.1.0 0.0.0.255 area 0    ! LAN /24 → wildcard 0.0.0.255
 network 10.0.12.0 0.0.0.3 area 0        ! lien /30 → wildcard 0.0.0.3
 network 10.0.13.0 0.0.0.3 area 0
 passive-interface g0/0                  ! pas de Hello vers les PC
\`\`\`

(R2 : router-id 2.2.2.2, réseaux 192.168.2.0, 10.0.12.0, 10.0.23.0 ; R3 : 3.3.3.3, 192.168.3.0, 10.0.13.0, 10.0.23.0.)

Le **wildcard** est l'inverse du masque (/30 → 0.0.0.3). \`passive-interface\` supprime les Hello inutiles côté LAN (sécurité + économie). Contrairement à RIP, OSPF choisira le chemin au meilleur **coût** (bande passante), pas au moins de sauts. Vérifie : \`show ip ospf neighbor\` (état **FULL**), \`show ip route ospf\` (codes **O [110/…]**).`,
        tags: ["tp", "ospf", "config", "cisco", "architecture"],
      },
    ],
  },
];
