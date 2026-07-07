import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 7 : protocole RIP (v1 & v2). */
export const rip: CourseSeed[] = [
  {
    slug: "res-rip",
    title: "Protocole RIP — v1 et v2",
    checkpoint: "reseaux",
    codename: "Hop Rally",
    domain: "Réseaux — routage",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 8,
    difficulty: "medium",
    summary:
      "Le doyen des protocoles dynamiques : RIP, à vecteur de distance, compte les sauts (max 15). Différences RIPv1 (classful) / RIPv2 (VLSM, multicast), mécanismes anti-boucle, et configuration Cisco complète.",
    objectives: [
      "Comprendre RIP : vecteur de distance, métrique = sauts, max 15",
      "Différencier RIPv1 (classful, broadcast) et RIPv2 (CIDR/VLSM, multicast)",
      "Connaître les mécanismes anti-boucle (split horizon, holddown, poison)",
      "Configurer RIP sur un routeur Cisco (router rip, network, version 2)",
      "Vérifier avec show ip route et show ip protocols",
    ],
    lesson: `# 🐢 Protocole RIP — le Hop Rally

**RIP** (*Routing Information Protocol*) est le plus ancien protocole de routage dynamique — simple à comprendre, idéal pour débuter. C'est un protocole **à vecteur de distance** : chaque routeur annonce périodiquement ses réseaux à ses voisins. 🏎️

> 📎 Prérequis : le module **Routage dynamique** (vecteur de distance, AD, métrique).

---

## 1. Le principe : compter les sauts 👣

La **métrique** de RIP est le **nombre de sauts** (*hop count*) = le nombre de routeurs à traverser.
- Le chemin avec **le moins de sauts** gagne.
- **Maximum = 15**. Une distance de **16 = ∞ = réseau inatteignable** — c'est ce qui **limite la taille** d'un réseau RIP (16 routeurs de diamètre max).

⚠️ RIP **ignore la vitesse** des liens : un chemin en 1 saut sur une liaison lente battra un chemin en 2 sauts sur de la fibre. C'est sa grande faiblesse.

---

## 2. Les échanges & les temporisateurs ⏱️

RIP envoie **toute sa table** à ses voisins **toutes les 30 secondes** (mise à jour périodique). Temporisateurs classiques :

| Timer | Durée | Rôle |
|---|---|---|
| **Update** | 30 s | envoi périodique de la table |
| **Invalid** | 180 s | une route non rafraîchie est marquée invalide |
| **Holddown** | 180 s | on ignore les nouvelles infos douteuses le temps de se stabiliser |
| **Flush** | 240 s | la route est **supprimée** de la table |

---

## 3. RIPv1 vs RIPv2 ⚔️

| | **RIPv1** | **RIPv2** |
|---|---|---|
| Masque envoyé ? | **Non** (*classful*) | **Oui** (*classless*, CIDR/VLSM) |
| Diffusion des updates | **broadcast** (255.255.255.255) | **multicast** (224.0.0.9) |
| VLSM / sous-réseaux discontinus | **impossible** | **possible** |
| Authentification | non | oui |

> 🧠 **Conclusion** : on utilise **RIPv2** en pratique. RIPv1 ne transporte pas le masque → incompatible avec le **VLSM** (chapitre 4). Il faut souvent \`no auto-summary\` pour éviter que RIPv2 résume automatiquement aux frontières de classe.

---

## 4. Éviter les boucles 🔄

Comme RIP fonctionne « par ouï-dire », il peut créer des **boucles**. Parades :
- **Split horizon** : ne pas réannoncer une route **par l'interface d'où on l'a apprise**.
- **Route poisoning** : annoncer une route tombée avec une métrique **16** (∞) pour prévenir explicitement.
- **Holddown** : ignorer temporairement les changements suspects.
- **Compteur de sauts max (15)** : borne ultime contre les boucles infinies.

---

## 5. Configuration Cisco 🖥️

\`\`\`
Router(config)# router rip
Router(config-router)# version 2                 ! utiliser RIPv2
Router(config-router)# no auto-summary           ! pas de résumé automatique (VLSM)
Router(config-router)# network 192.168.1.0       ! annoncer ce réseau connecté
Router(config-router)# network 10.0.0.0
\`\`\`

**Points clés** :
- \`network <réseau>\` indique **quelles interfaces** participent à RIP (celles dont l'IP tombe dans ce réseau) **et** quels réseaux sont annoncés.
- \`version 2\` est quasi obligatoire (VLSM, multicast).
- \`no auto-summary\` évite le résumé aux frontières de classe (indispensable avec des sous-réseaux discontinus).

**Vérification** :
\`\`\`
Router# show ip route          ! les routes RIP sont marquées "R"
Router# show ip protocols      ! version, réseaux annoncés, timers
Router# debug ip rip           ! voir les updates en direct (à désactiver après)
\`\`\`
Une route RIP apparaît avec le code **R** et une AD de **120** : \`R 192.168.2.0/24 [120/1] via 10.0.0.2\` (\`[120/1]\` = AD 120, **1 saut**).

---

## 🧠 Ce qu'il faut retenir

- RIP = **vecteur de distance**, métrique = **sauts**, **max 15** (16 = inatteignable).
- Updates **périodiques toutes les 30 s** (toute la table).
- **RIPv1 classful** (pas de masque, broadcast) vs **RIPv2 classless** (VLSM, multicast 224.0.0.9).
- Anti-boucle : **split horizon**, **route poisoning**, **holddown**, max 15.
- Config : \`router rip\` → \`version 2\` → \`no auto-summary\` → \`network …\`. Code **R**, AD **120**.

## ⚠️ Erreurs fréquentes des débutants

**1. Oublier \`version 2\`.** Par défaut le routeur peut se comporter en RIPv1 → pas de masque transmis → le **VLSM casse**. Toujours forcer \`version 2\`.

**2. Oublier \`no auto-summary\`.** Sans ça, RIPv2 **résume** aux frontières de classe (A/B/C) et casse les **sous-réseaux discontinus**.

**3. Mettre un masque dans \`network\`.** La commande \`network\` prend une adresse **classful** (ex \`network 10.0.0.0\`), sans masque. On annonce le réseau, pas le sous-réseau.

**4. Dépasser 15 sauts.** Au-delà de 15 routeurs de diamètre, RIP considère la destination **inatteignable**. RIP ne convient **qu'aux petits réseaux**.

**5. Choisir un chemin lent.** RIP compte les **sauts**, pas la vitesse : il peut préférer 1 saut lent à 2 sauts rapides. Pour tenir compte de la bande passante, il faut **OSPF**.`,
    videos: [
      { title: "RIP — cours", youtubeId: "g7AfJ0RM4l0", moreUrl: "https://www.youtube.com/playlist?list=PLgAuOjTVwB6xyoFFor4O5ly03N4_ekV0D" },
      { title: "RIPv2 — TP Packet Tracer", youtubeId: "pX3d6aXk1yk" },
      { title: "RIPv1 — TP Packet Tracer", youtubeId: "7r08d0nsPO0" },
    ],
    badge: {
      id: "badge-hop-rally",
      name: "Hop Rally",
      icon: "Network",
      description: "Configure RIPv2 et comprend le vecteur de distance et ses garde-fous anti-boucle.",
    },
    challenges: [
      {
        id: "res-rip-max-hop",
        title: "Le mur des 15 sauts",
        order: 1,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 👣 Métrique RIP

En RIP, quelle valeur de saut signifie « réseau **inatteignable** » (l'infini) ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Le maximum utilisable est 15 ; l'infini est juste au-dessus.", cost: 15 },
          { text: "📖 Correction complète : 16 = infini = inatteignable.", cost: 40 },
        ],
        answer: 16,
        explanation: `RIP tolère au **maximum 15 sauts**. La valeur **16** signifie **infini / inatteignable** — c'est ce qui borne la taille d'un réseau RIP et sert au *route poisoning* (annoncer une route morte avec 16). Au-delà de 15 routeurs de diamètre, RIP ne convient plus.`,
        tags: ["rip", "metrique"],
      },
      {
        id: "res-rip-v1-v2",
        title: "Pourquoi RIPv2 ?",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚔️ v1 vs v2

Quelle est la **différence clé** qui rend RIPv2 indispensable dès qu'on fait du **VLSM** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "VLSM = masques variables. Que faut-il transmettre pour que le voisin connaisse le sous-réseau exact ?", cost: 20 },
          { text: "📖 Correction complète : RIPv2 transmet le masque (classless) ; RIPv1 non (classful).", cost: 50 },
        ],
        options: [
          "RIPv2 transmet le masque de sous-réseau (classless), RIPv1 non (classful)",
          "RIPv2 est plus rapide de 30 secondes",
          "RIPv2 compte jusqu'à 30 sauts",
          "RIPv1 n'existe pas sur Cisco",
        ],
        answer: 0,
        explanation: `**RIPv2 est *classless*** : il **transmet le masque** dans ses mises à jour, ce qui permet le **VLSM** et les sous-réseaux discontinus. **RIPv1** est *classful* (il n'envoie **pas** le masque) → incompatible avec le VLSM. RIPv2 utilise aussi le **multicast** (224.0.0.9) au lieu du broadcast et supporte l'authentification.`,
        tags: ["rip", "vlsm", "v1-v2"],
      },
      {
        id: "res-rip-config-network",
        title: "Activer RIPv2",
        order: 3,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🖥️ Config Cisco

Écris les commandes qui **activent RIP version 2**, **désactivent le résumé automatique** et **annoncent** le réseau \`192.168.1.0\`.

(Une commande par ligne, dans l'ordre logique.)`,
        points: 200,
        timeLimitSec: 600,
        starter: `router rip
`,
        hints: [
          { text: "Après 'router rip' : version 2, puis no auto-summary, puis network 192.168.1.0.", cost: 25 },
          { text: "network prend l'adresse SANS masque.", cost: 30 },
          { text: "📖 Correction complète :\n```\nrouter rip\nversion 2\nno auto-summary\nnetwork 192.168.1.0\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Entre dans la configuration RIP (router rip)", pattern: "router\\s+rip", flags: "i" },
            { label: "Force la version 2", pattern: "version\\s+2", flags: "i" },
            { label: "Désactive le résumé automatique", pattern: "no\\s+auto-?summary", flags: "i" },
            { label: "Annonce le réseau 192.168.1.0", pattern: "network\\s+192\\.168\\.1\\.0", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
router rip
version 2            ! RIPv2 : transmet le masque (VLSM), multicast 224.0.0.9
no auto-summary      ! pas de résumé aux frontières de classe
network 192.168.1.0  ! annonce ce réseau et active RIP sur ses interfaces
\`\`\`

\`network 192.168.1.0\` fait **deux** choses : il **annonce** ce réseau aux voisins **et** active RIP sur les interfaces dont l'IP tombe dedans. Sans \`version 2\` + \`no auto-summary\`, le VLSM casserait.`,
        tags: ["rip", "config", "cisco", "code"],
      },
      {
        id: "res-rip-split-horizon",
        title: "Le split horizon",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔄 Anti-boucle

En quoi consiste le mécanisme **split horizon** de RIP ?`,
        points: 350,
        timeLimitSec: 420,
        hints: [
          { text: "Il empêche de renvoyer une info… à celui qui vient de te la donner.", cost: 30 },
          { text: "📖 Correction complète : ne pas réannoncer une route par l'interface par laquelle on l'a apprise.", cost: 70 },
        ],
        options: [
          "Ne pas réannoncer une route par l'interface d'où on l'a apprise",
          "Diviser la bande passante en deux",
          "Envoyer les updates deux fois plus vite",
          "Couper la route toutes les 30 secondes",
        ],
        answer: 0,
        explanation: `Le **split horizon** interdit de **réannoncer** une route **par l'interface** qui a servi à l'**apprendre**. Logique : « inutile de dire à mon voisin comment atteindre un réseau… que c'est **lui** qui m'a appris ». Ça évite les boucles de retour immédiates, aux côtés du *route poisoning* (métrique 16), du *holddown* et de la limite des 15 sauts.`,
        tags: ["rip", "anti-boucle", "split-horizon"],
      },
      {
        id: "res-rip-code-r",
        title: "Lire une route RIP",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔎 show ip route

Tu vois cette ligne :

\`\`\`
R 192.168.2.0/24 [120/1] via 10.0.0.2
\`\`\`

**Que signifie \`[120/1]\` ?**`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Le format est toujours [distance administrative / métrique].", cost: 20 },
          { text: "📖 Correction complète : AD 120 (RIP) et métrique 1 (1 saut).", cost: 50 },
        ],
        options: [
          "Distance administrative 120 (RIP) et métrique 1 saut",
          "120 secondes et 1 minute",
          "120 hôtes et 1 sous-réseau",
          "Version 120, révision 1",
        ],
        answer: 0,
        explanation: `Le format est toujours **[distance administrative / métrique]**. Ici **120** = l'AD de **RIP** (donc le code **R**), et **1** = la métrique = **1 saut** pour atteindre \`192.168.2.0/24\` via \`10.0.0.2\`. C'est ainsi qu'on lit toute route dynamique dans \`show ip route\`.`,
        tags: ["rip", "table", "lecture"],
      },
      {
        id: "res-tp-rip",
        title: "Architecture 1 — Triangle RIPv2",
        order: 6,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 1 (niveau : intermédiaire)

**Topologie à monter dans Packet Tracer** — un triangle : chaque routeur est relié aux deux autres (interfaces déjà adressées) :

| Élément | Réseau |
|---|---|
| LAN de R1 | \`192.168.1.0/24\` |
| LAN de R2 | \`192.168.2.0/24\` |
| LAN de R3 | \`192.168.3.0/24\` |
| Lien R1 ↔ R2 | \`10.0.12.0/30\` |
| Lien R1 ↔ R3 | \`10.0.13.0/30\` |
| Lien R2 ↔ R3 | \`10.0.23.0/30\` |

**Questions :**

1. Activez **RIPv2** sur les 3 routeurs (\`router rip\` + \`version 2\`) ;
2. Désactivez le **résumé automatique** ;
3. Annoncez les réseaux de chaque routeur — ⚠️ la commande \`network\` de RIP est **classful** : un seul \`network 10.0.0.0\` couvre TOUS les liens 10.x ;
4. Vérifiez : \`show ip route\` doit montrer les LAN distants en **R [120/1]**.

Blocs \`! === R1 ===\`, \`! === R2 ===\`, \`! === R3 ===\`.`,
        points: 400,
        timeLimitSec: 1200,
        starter: `! === R1 ===
router rip
`,
        hints: [
          { text: "Sur chaque routeur : router rip / version 2 / no auto-summary / network 10.0.0.0 / network 192.168.X.0.", cost: 40 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\nrouter rip\nversion 2\nno auto-summary\nnetwork 10.0.0.0\nnetwork 192.168.1.0\n! === R2 ===\nrouter rip\nversion 2\nno auto-summary\nnetwork 10.0.0.0\nnetwork 192.168.2.0\n! === R3 ===\nrouter rip\nversion 2\nno auto-summary\nnetwork 10.0.0.0\nnetwork 192.168.3.0\n```", cost: 90 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Active le processus RIP", pattern: "router\\s+rip", flags: "i" },
            { label: "Passe en version 2", pattern: "version\\s+2", flags: "i" },
            { label: "Désactive le résumé automatique", pattern: "no\\s+auto-summary", flags: "i" },
            { label: "Annonce les liens 10.x (network classful)", pattern: "network\\s+10\\.0\\.0\\.0", flags: "i" },
            { label: "Annonce le LAN de R1", pattern: "network\\s+192\\.168\\.1\\.0", flags: "i" },
            { label: "Annonce le LAN de R2", pattern: "network\\s+192\\.168\\.2\\.0", flags: "i" },
            { label: "Annonce le LAN de R3", pattern: "network\\s+192\\.168\\.3\\.0", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
! === R1 ===                 ! (même squelette sur R2 et R3)
router rip
 version 2                   ! RIPv2 : masques transportés, multicast 224.0.0.9
 no auto-summary             ! ne résume pas aux frontières classful
 network 10.0.0.0            ! UN SEUL network couvre 10.0.12.0 ET 10.0.13.0 (classful !)
 network 192.168.1.0
\`\`\`

Le piège : la commande \`network\` de RIP est **classful** — inutile (et refusé) d'écrire \`network 10.0.12.0\` ; \`network 10.0.0.0\` active RIP sur **toutes** les interfaces en 10.x. Grâce au triangle, chaque LAN a **deux chemins** ; RIP choisit le moins de **sauts**. Vérifie avec \`show ip route\` (codes **R [120/1]**) et \`show ip protocols\`.`,
        tags: ["tp", "rip", "config", "cisco", "architecture"],
      },
      {
        id: "res-tp-rip-2",
        title: "Architecture 2 — RIPv2 + diffusion de la route Internet",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 2 (niveau : avancé)

Même triangle que l'Architecture 1, mais **R1 a maintenant un accès Internet** et doit le **partager** avec tout le monde via RIP.

**Topologie :**

| Élément | Réseau |
|---|---|
| Triangle R1-R2-R3 + LAN | *(identique à l'Architecture 1)* |
| R1 (G0/2) ↔ FAI | \`203.0.113.0/30\` — R1 = .1, FAI = .2 |

**Questions :**

1. Sur **R1** : configurez la **route par défaut** vers le FAI ;
2. Sur **R1** : faites **propager** cette route par défaut à R2 et R3 **via RIP** (\`default-information originate\`) ;
3. Sur les 3 routeurs : empêchez RIP d'envoyer ses annonces **vers les LAN** (\`passive-interface g0/0\`) — inutile et risqué côté PC ;
4. Vérifiez sur R2 : \`show ip route\` doit montrer \`R* 0.0.0.0/0\`.

Bloc \`! === R1 ===\` (complet), puis \`! === R2 ===\` / \`! === R3 ===\` (juste le nécessaire).`,
        points: 450,
        timeLimitSec: 1500,
        starter: `! === R1 ===
ip route 0.0.0.0 0.0.0.0 203.0.113.2
router rip
`,
        hints: [
          { text: "R1 : ip route 0.0.0.0… puis dans router rip : default-information originate + passive-interface g0/0. R2/R3 : router rip → passive-interface g0/0.", cost: 45 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\nip route 0.0.0.0 0.0.0.0 203.0.113.2\nrouter rip\nversion 2\nno auto-summary\ndefault-information originate\npassive-interface g0/0\n! === R2 ===\nrouter rip\npassive-interface g0/0\n! === R3 ===\nrouter rip\npassive-interface g0/0\n```", cost: 100 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Route par défaut vers le FAI sur R1", pattern: "ip\\s+route\\s+0\\.0\\.0\\.0\\s+0\\.0\\.0\\.0\\s+203\\.0\\.113\\.2", flags: "i" },
            { label: "Propage la default via RIP", pattern: "default-information\\s+originate", flags: "i" },
            { label: "Interfaces LAN passives", pattern: "passive-interface\\s+g\\S*0/0", flags: "i" },
            { label: "Processus RIP présent", pattern: "router\\s+rip", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

\`\`\`
! === R1 ===
ip route 0.0.0.0 0.0.0.0 203.0.113.2   ! la default N'EXISTE que sur R1…
router rip
 version 2
 no auto-summary
 default-information originate         ! …mais RIP la DIFFUSE à R2 et R3
 passive-interface g0/0                ! silence côté LAN
! === R2 ===
router rip
 passive-interface g0/0
! === R3 ===
router rip
 passive-interface g0/0
\`\`\`

**Deux idées clés :**
- \`default-information originate\` évite de configurer une default **à la main sur chaque routeur** : R1 l'injecte dans RIP, R2/R3 la reçoivent en \`R* 0.0.0.0/0 [120/1]\`. Un seul point de configuration → zéro incohérence.
- \`passive-interface g0/0\` : l'interface **continue d'être annoncée** dans RIP, mais **n'émet plus** de mises à jour vers les PC. Moins de broadcast inutile, et personne sur le LAN ne peut injecter de fausses routes.

**Vérification PT :** sur R2 → \`show ip route\` (ligne \`R* 0.0.0.0/0\`), puis \`ping 203.0.113.2\` depuis un PC du LAN 2 : il sort par R1 sans qu'aucune default n'ait été tapée sur R2. 🎯`,
        tags: ["tp", "rip", "default-information", "config", "architecture"],
      },
    ],
  },
];
