import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 10 : redondance couche 2, STP & EtherChannel. */
export const stpEtherchannel: CourseSeed[] = [
  {
    slug: "res-stp-etherchannel",
    title: "Redondance couche 2 — STP & EtherChannel",
    checkpoint: "reseaux",
    codename: "Loop Guard",
    domain: "Réseaux — commutation",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 11,
    difficulty: "hard",
    summary:
      "Rendre un réseau commuté redondant sans le paralyser : STP casse les boucles de couche 2 en bloquant les liens en trop, EtherChannel agrège plusieurs liens en un seul plus rapide. Élection du pont racine, états de port, LACP.",
    objectives: [
      "Comprendre pourquoi une boucle de couche 2 est catastrophique (tempête de broadcast)",
      "Expliquer le rôle de STP et l'élection du pont racine (root bridge)",
      "Connaître les états de port STP et l'apport de RSTP",
      "Comprendre EtherChannel (agrégation de liens) et LACP/PAgP",
      "Configurer un EtherChannel de base",
    ],
    lesson: `# 🔁 Redondance couche 2 — le Loop Guard

Pour la **fiabilité**, on double les liens entre switches. Mais en couche 2, **une boucle physique = catastrophe** : les trames de diffusion tournent **à l'infini**. Deux outils : **STP** (casse les boucles) et **EtherChannel** (agrège les liens utilement). 🏎️

> 📎 Prérequis : commutation couche 2 (switch, MAC, broadcast) — module Intro/OSI.

---

## 1. Le danger : la tempête de broadcast 🌪️

Contrairement à IP (couche 3) qui a un **TTL** qui décrémente, une **trame** de couche 2 **n'a pas** de durée de vie. Sur une boucle physique entre 2 switches, un **broadcast** est réémis en permanence :

\`\`\`
      ┌──────── lien A ────────┐
   SW1                          SW2
      └──────── lien B ────────┘
 Un broadcast tourne : SW1→A→SW2→B→SW1→A→…  ♾️  (tempête)
\`\`\`

Conséquences : saturation des liens, tables MAC instables, réseau **paralysé** en quelques secondes.

---

## 2. STP casse les boucles 🌳

**STP** (*Spanning Tree Protocol*, IEEE 802.1D) construit un **arbre sans boucle** en **bloquant logiquement** les liens redondants (ils restent en secours). Étapes :

1. **Élection du pont racine (root bridge)** : le switch avec le plus petit **Bridge ID** (**priorité** puis **adresse MAC** la plus basse). Priorité par défaut = 32768.
2. Chaque switch choisit son **port racine** (le meilleur chemin vers la racine, coût le plus faible).
3. Sur chaque segment, un **port désigné** est élu ; les autres liens redondants passent en **blocage**.
4. Les switches échangent des **BPDU** pour maintenir l'arbre et **rebasculer** si un lien tombe.

**États de port STP (802.1D)** : *Blocking → Listening → Learning → Forwarding* (transition ~30–50 s). Le blocage n'éteint pas le lien : il l'écarte de l'arbre actif, prêt à reprendre.

> 🧠 **RSTP** (802.1w) est la version **rapide** : convergence en quelques secondes au lieu de ~30–50 s. C'est ce qu'on utilise aujourd'hui.

---

## 3. EtherChannel : agréger plutôt que bloquer 🔗

Bloquer un lien redondant, c'est du débit **gâché**. **EtherChannel** regroupe **plusieurs liens physiques** en **un seul lien logique** :
- la **bande passante s'additionne** (2 × 1 Gbps ≈ 2 Gbps) ;
- STP voit **un seul** lien logique → **pas de boucle** à bloquer ;
- si un câble tombe, le trafic bascule sur les autres (redondance).

**Protocoles de négociation** :
- **LACP** (802.3ad, standard, multi-constructeur) ;
- **PAgP** (propriétaire Cisco) ;
- ou statique (*on*).

**Config LACP (exemple)** — sur les deux ports à agréger :
\`\`\`
Switch(config)# interface range fa0/1 - 2
Switch(config-if-range)# channel-group 1 mode active   ! LACP
\`\`\`
Vérification : \`show etherchannel summary\`.

---

## 🧠 Ce qu'il faut retenir

- Une **boucle de couche 2** provoque une **tempête de broadcast** (pas de TTL en couche 2).
- **STP** casse les boucles en **bloquant** les liens redondants ; **root bridge** = plus petit Bridge ID (priorité puis MAC).
- États 802.1D : Blocking→Listening→Learning→Forwarding ; **RSTP** = convergence **rapide**.
- **EtherChannel** agrège plusieurs liens en **un** logique : débit cumulé + redondance, **sans** blocage STP.
- Négociation EtherChannel : **LACP** (standard), PAgP (Cisco), ou statique.

## ⚠️ Erreurs fréquentes des débutants

**1. Désactiver STP « parce qu'il bloque un lien ».** Sans STP, la moindre boucle **paralyse** le réseau. Le blocage est une **protection**, pas un bug.

**2. Croire qu'un lien bloqué est mort.** Un port en **blocage** est un **secours** : il repasse en *forwarding* si le lien principal tombe.

**3. Confondre STP et EtherChannel.** STP **bloque** la redondance (un seul chemin actif) ; EtherChannel **utilise** la redondance (tous les liens actifs, agrégés). On peut combiner : EtherChannel présente un lien logique unique à STP.

**4. Mélanger les paramètres d'EtherChannel.** Tous les ports agrégés doivent avoir les **mêmes** réglages (vitesse, duplex, VLAN/trunk) et un **mode compatible** des deux côtés (active/active en LACP), sinon le bundle ne monte pas.

**5. Ignorer RSTP.** Le STP classique met ~30–50 s à converger — trop lent pour un réseau moderne. Utilise **RSTP** (rapid-pvst).`,
    badge: {
      id: "badge-loop-guard",
      name: "Loop Guard",
      icon: "Network",
      description: "Comprend STP (anti-boucle), le pont racine et l'agrégation EtherChannel.",
    },
    challenges: [
      {
        id: "res-stp-pourquoi",
        title: "Pourquoi STP existe",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🌪️ Le problème résolu par STP

Pourquoi une **boucle physique** entre deux switches est-elle dangereuse en couche 2 ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Une trame de couche 2 n'a pas de TTL, contrairement à un paquet IP.", cost: 20 },
          { text: "📖 Correction complète : les broadcasts tournent sans fin → tempête de broadcast qui paralyse le réseau.", cost: 50 },
        ],
        options: [
          "Les trames de diffusion tournent à l'infini (pas de TTL) → tempête de broadcast",
          "Les câbles chauffent trop",
          "Les adresses IP se dupliquent",
          "Ça n'a aucun danger",
        ],
        answer: 0,
        explanation: `Une **trame** de couche 2 **n'a pas de TTL** (contrairement au paquet IP). Sur une boucle, un **broadcast** est réémis sans fin → **tempête de broadcast** : liens saturés, tables MAC instables, réseau paralysé. **STP** empêche ça en **bloquant** logiquement les liens redondants.`,
        tags: ["stp", "boucle", "broadcast"],
      },
      {
        id: "res-stp-root-bridge",
        title: "Élire le pont racine",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🌳 Root bridge

Comment STP élit-il le **pont racine** (root bridge) parmi les switches ?`,
        points: 350,
        timeLimitSec: 420,
        hints: [
          { text: "On compare le Bridge ID = priorité, puis en cas d'égalité l'adresse MAC.", cost: 30 },
          { text: "📖 Correction complète : le plus petit Bridge ID (plus petite priorité, puis plus petite MAC) devient racine.", cost: 70 },
        ],
        options: [
          "Le switch avec le plus petit Bridge ID (priorité la plus basse, puis MAC la plus basse)",
          "Le switch avec le plus de ports",
          "Le switch le plus récent",
          "Un switch tiré au hasard",
        ],
        answer: 0,
        explanation: `Le **pont racine** est le switch au **plus petit Bridge ID** : d'abord la **priorité** la plus basse (défaut 32768), et en cas d'égalité l'**adresse MAC** la plus basse. Tous les autres switches calculent leur meilleur chemin **vers la racine** ; les liens redondants sont bloqués. On peut forcer un switch comme racine en baissant sa priorité.`,
        tags: ["stp", "root-bridge", "election"],
      },
      {
        id: "res-stp-rstp",
        title: "L'apport de RSTP",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚡ STP vs RSTP

Quel est le principal avantage de **RSTP** (802.1w) sur le STP classique (802.1D) ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Le STP classique met ~30–50 s à converger. RSTP corrige surtout ça.", cost: 20 },
          { text: "📖 Correction complète : RSTP converge beaucoup plus vite (quelques secondes).", cost: 50 },
        ],
        options: [
          "Une convergence beaucoup plus rapide (quelques secondes)",
          "Il supprime le besoin de switches",
          "Il augmente la bande passante des liens",
          "Il chiffre les trames",
        ],
        answer: 0,
        explanation: `**RSTP** (*Rapid STP*) **converge en quelques secondes** au lieu des ~30–50 s du STP 802.1D (qui passait par Listening/Learning). Le principe (casser les boucles, élire une racine) reste le même, mais la **reprise après panne** est bien plus rapide — indispensable en production.`,
        tags: ["stp", "rstp", "convergence"],
      },
      {
        id: "res-etherchannel-but",
        title: "À quoi sert EtherChannel",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔗 Agréger les liens

Quel est l'intérêt d'**EtherChannel** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Plutôt que de bloquer les liens redondants (STP), on les… utilise tous.", cost: 20 },
          { text: "📖 Correction complète : regrouper plusieurs liens physiques en un lien logique (débit cumulé + redondance) que STP voit comme un seul.", cost: 50 },
        ],
        options: [
          "Regrouper plusieurs liens en un seul logique : débit cumulé + redondance, sans blocage STP",
          "Chiffrer le trafic entre switches",
          "Attribuer des adresses IP",
          "Créer des VLAN",
        ],
        answer: 0,
        explanation: `**EtherChannel** agrège **plusieurs liens physiques** en **un lien logique** : la bande passante **s'additionne**, la redondance est assurée (si un câble tombe, le reste continue), et STP voit **un seul** lien → **rien à bloquer**. On le négocie avec **LACP** (standard) ou PAgP (Cisco). C'est l'inverse philosophique de STP : ici on **utilise** la redondance au lieu de la bloquer.`,
        tags: ["etherchannel", "agregation", "lacp"],
      },
      {
        id: "res-etherchannel-config",
        title: "Créer un EtherChannel LACP",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🖥️ Config Cisco

Sur la plage de ports \`fa0/1 - 2\`, crée un **EtherChannel** en mode **LACP actif** (channel-group 1).`,
        points: 350,
        timeLimitSec: 480,
        starter: `interface range fa0/1 - 2
`,
        hints: [
          { text: "channel-group 1 mode active (active = LACP).", cost: 30 },
          { text: "📖 Correction complète :\n```\ninterface range fa0/1 - 2\nchannel-group 1 mode active\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Sélectionne la plage de ports à agréger", pattern: "interface\\s+range", flags: "i" },
            { label: "Crée le groupe de canaux (channel-group)", pattern: "channel-group\\s+\\d", flags: "i" },
            { label: "Utilise le mode LACP actif", pattern: "mode\\s+active", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
interface range fa0/1 - 2
channel-group 1 mode active     ! LACP actif (802.3ad)
\`\`\`

Les deux ports forment le **Port-Channel 1**. En **LACP**, les deux extrémités négocient (\`active/active\` ou \`active/passive\`). Tous les ports agrégés doivent avoir les **mêmes** réglages (vitesse, duplex, VLAN). Vérifie avec \`show etherchannel summary\` (état **SU** = en service, layer2/3).`,
        tags: ["etherchannel", "config", "cisco", "lacp"],
      },
      {
        id: "res-tp-etherchannel",
        title: "Architecture 1 — EtherChannel + racine STP",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 1 (niveau : avancé)

**Topologie à monter dans Packet Tracer :**

| Lien | Description |
|---|---|
| SW1 Fa0/1 ↔ SW2 Fa0/1 | lien physique n°1 |
| SW1 Fa0/2 ↔ SW2 Fa0/2 | lien physique n°2 |

Objectif : agréger ces 2 liens en **un seul lien logique** (sinon STP en bloque un !), et choisir sa racine STP au lieu de la subir.

**Questions :**

1. Sur **SW1** et **SW2** : agrégez \`Fa0/1-2\` en **Port-Channel 1** avec **LACP actif** ;
2. Passez le Port-Channel en **trunk** ;
3. Forcez **SW1** comme **racine STP** du VLAN 1 (priorité \`4096\`) ;
4. Vérifiez : \`show etherchannel summary\` (flag **SU**) et \`show spanning-tree\` (« This bridge is the root » sur SW1).

Blocs \`! === SW1 ===\` et \`! === SW2 ===\`.`,
        points: 450,
        timeLimitSec: 1200,
        starter: `! === SW1 ===
interface range fa0/1 - 2
`,
        hints: [
          { text: "interface range fa0/1 - 2 → channel-group 1 mode active. Puis interface port-channel 1 → switchport mode trunk. Racine : spanning-tree vlan 1 priority 4096.", cost: 45 },
          { text: "📖 Correction complète :\n```\n! === SW1 ===\ninterface range fa0/1 - 2\nchannel-group 1 mode active\ninterface port-channel 1\nswitchport mode trunk\nspanning-tree vlan 1 priority 4096\n! === SW2 ===\ninterface range fa0/1 - 2\nchannel-group 1 mode active\ninterface port-channel 1\nswitchport mode trunk\n```", cost: 100 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Sélectionne la plage de ports", pattern: "interface\\s+range\\s+fa0/1\\s*-\\s*2", flags: "i" },
            { label: "Agrège en groupe 1 avec LACP actif", pattern: "channel-group\\s+1\\s+mode\\s+active", flags: "i" },
            { label: "Configure l'interface Port-Channel 1", pattern: "interface\\s+port-channel\\s*1", flags: "i" },
            { label: "Passe l'agrégat en trunk", pattern: "switchport\\s+mode\\s+trunk", flags: "i" },
            { label: "Force SW1 racine STP (priorité 4096)", pattern: "spanning-tree\\s+vlan\\s+1\\s+priority\\s+4096", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
! === SW1 ===
interface range fa0/1 - 2
 channel-group 1 mode active        ! LACP actif (802.3ad)
interface port-channel 1
 switchport mode trunk
spanning-tree vlan 1 priority 4096  ! priorité basse → SW1 gagne l'élection racine
! === SW2 ===
interface range fa0/1 - 2
 channel-group 1 mode active
interface port-channel 1
 switchport mode trunk
\`\`\`

Sans EtherChannel, STP **bloquerait** l'un des deux liens (boucle !) → 50 % de la capacité perdue. Agrégés en Port-Channel, STP les voit comme **UN seul lien** : les deux câbles travaillent (~200 Mbit/s) **et** la redondance reste. La priorité **4096 < 32768** (défaut) garantit que SW1 est racine — on **choisit** sa racine, on ne la subit pas. Vérifie : \`show etherchannel summary\` (flag **SU**) et \`show spanning-tree\` (« This bridge is the root »).`,
        tags: ["tp", "stp", "etherchannel", "config", "architecture"],
      },
      {
        id: "res-tp-stp-2",
        title: "Architecture 2 — Rapid STP + PortFast sur triangle",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 2 (niveau : avancé+)

Un **triangle de 3 switches** (boucle volontaire pour la redondance) + un **serveur** : on modernise avec **Rapid PVST+** et on sécurise les ports d'accès.

**Topologie à monter dans Packet Tracer :**

| Lien / Port | Description |
|---|---|
| SW1 ↔ SW2, SW2 ↔ SW3, SW1 ↔ SW3 | triangle (trunks) |
| SW2 Fa0/1 | **Serveur0** (port d'accès) |

**Questions :**

1. Sur les **3 switches** : activez le mode **Rapid PVST+** (\`spanning-tree mode rapid-pvst\`) ;
2. Sur **SW1** : forcez-le racine du VLAN 1 avec \`spanning-tree vlan 1 root primary\` ;
3. Sur **SW2** : faites-en la racine **de secours** (\`root secondary\`) ;
4. Sur **SW2 Fa0/1** (le serveur) : activez **PortFast** pour que le port s'active immédiatement au branchement, sans attendre STP ;
5. Question : pourquoi ne JAMAIS mettre PortFast sur un lien vers un autre switch ? *(réponse dans la correction)*

Blocs \`! === SW1 ===\`, \`! === SW2 ===\`, \`! === SW3 ===\`.`,
        points: 500,
        timeLimitSec: 1500,
        starter: `! === SW1 ===
spanning-tree mode rapid-pvst
`,
        hints: [
          { text: "rapid-pvst sur les 3. SW1 : root primary ; SW2 : root secondary. PortFast : interface fa0/1 → spanning-tree portfast.", cost: 50 },
          { text: "📖 Correction complète :\n```\n! === SW1 ===\nspanning-tree mode rapid-pvst\nspanning-tree vlan 1 root primary\n! === SW2 ===\nspanning-tree mode rapid-pvst\nspanning-tree vlan 1 root secondary\ninterface fa0/1\nswitchport mode access\nspanning-tree portfast\n! === SW3 ===\nspanning-tree mode rapid-pvst\n```", cost: 110 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Mode Rapid PVST+ activé", pattern: "spanning-tree\\s+mode\\s+rapid-pvst", flags: "i" },
            { label: "SW1 racine primaire du VLAN 1", pattern: "spanning-tree\\s+vlan\\s+1\\s+root\\s+primary", flags: "i" },
            { label: "SW2 racine secondaire", pattern: "spanning-tree\\s+vlan\\s+1\\s+root\\s+secondary", flags: "i" },
            { label: "PortFast sur le port du serveur", pattern: "spanning-tree\\s+portfast", flags: "i" },
            { label: "Le port serveur est en mode accès", pattern: "switchport\\s+mode\\s+access", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

\`\`\`
! === SW1 ===
spanning-tree mode rapid-pvst          ! convergence < 1 s (vs 30-50 s en STP classique)
spanning-tree vlan 1 root primary      ! macro : prend une priorité assurant l'élection
! === SW2 ===
spanning-tree mode rapid-pvst
spanning-tree vlan 1 root secondary    ! priorité 28672 : racine SI SW1 meurt
interface fa0/1
 switchport mode access
 spanning-tree portfast                ! le serveur est joignable immédiatement
! === SW3 ===
spanning-tree mode rapid-pvst
\`\`\`

**Réponse à la question 5 :** PortFast fait passer le port **directement en Forwarding**, en sautant les états d'écoute de STP. Sur un port vers un PC/serveur, aucun risque. Mais sur un lien **switch-switch**, cela peut créer une **boucle de commutation active** pendant plusieurs secondes — broadcast storm, réseau à genoux. PortFast = **uniquement** ports d'accès (on ajoute d'ailleurs souvent \`bpduguard\` : le port se coupe s'il reçoit un BPDU, preuve qu'un switch a été branché par erreur).

**\`root primary/secondary\` vs priorité manuelle :** \`primary\` règle la priorité pour battre la racine actuelle (24576 ou moins) ; \`secondary\` fixe 28672 — un plan de secours **déterministe** : si SW1 tombe, c'est SW2 qui reprend, pas un switch au hasard.

**Vérification PT :** \`show spanning-tree\` sur SW1 (« This bridge is the root »), débranche SW1 → refais la commande sur SW2, et regarde la reconvergence quasi instantanée grâce à Rapid PVST+. 🎯`,
        tags: ["tp", "rstp", "portfast", "root-primary", "architecture"],
      },
    ],
  },
];
