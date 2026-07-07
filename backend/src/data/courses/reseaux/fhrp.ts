import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 11 : FHRP (HSRP, VRRP, GLBP). */
export const fhrp: CourseSeed[] = [
  {
    slug: "res-fhrp",
    title: "FHRP — redondance de passerelle (HSRP, VRRP, GLBP)",
    checkpoint: "reseaux",
    codename: "Backup Driver",
    domain: "Réseaux — haute disponibilité",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 12,
    difficulty: "medium",
    summary:
      "Une passerelle qui tombe, c'est tout un LAN coupé d'Internet. Les FHRP créent une passerelle virtuelle redondante : HSRP (Cisco, actif/veille), VRRP (standard) et GLBP (répartition de charge). IP et MAC virtuelles partagées.",
    objectives: [
      "Comprendre le problème du point unique de défaillance de la passerelle",
      "Expliquer le principe d'une passerelle virtuelle (IP + MAC virtuelles)",
      "Distinguer HSRP, VRRP et GLBP",
      "Comprendre les rôles actif / veille (HSRP)",
      "Savoir ce qu'apporte GLBP (répartition de charge)",
    ],
    resources: [
      {
        label: "Architecture 1 — topologie de départ (.pka)",
        url: "/pka/res-fhrp-architecture-1.pka",
        kind: "pkt-start",
        note: "À ouvrir dans Cisco Packet Tracer : R1 et R2 en passerelles redondantes vers SW1/SW2 et les PC, non configurés. Mets en place HSRP (groupe 1, IP virtuelle, priorité + preempt) selon l'Architecture 1.",
      },
    ],
    lesson: `# 🛟 FHRP — le Backup Driver

Tous les PC d'un LAN pointent vers **une** passerelle par défaut. Si ce routeur **tombe**, plus personne ne sort du réseau — même s'il existe un **second** routeur ! Les **FHRP** (*First Hop Redundancy Protocols*) résolvent ça : ils présentent aux PC **une passerelle virtuelle** que deux routeurs se partagent. 🏎️

> 📎 Prérequis : passerelle par défaut, adressage IP/MAC (modules IPv4 & Intro/OSI).

---

## 1. Le problème : la passerelle, point unique de défaillance 💥

\`\`\`
 PC ── passerelle par défaut = 192.168.1.1 (R1)
                                  │
                             si R1 tombe → PC coincé,
                             même si R2 (192.168.1.2) est là !
\`\`\`

Reconfigurer la passerelle de **tous** les PC à la main est impensable. Il faut une passerelle **qui survive** à la panne d'un routeur.

---

## 2. La solution : une passerelle virtuelle 🎭

Un FHRP fait coopérer **deux (ou plus)** routeurs pour simuler **un seul** routeur virtuel :
- une **adresse IP virtuelle** (VIP) → c'est **elle** que les PC mettent en passerelle (ex. 192.168.1.**254**) ;
- une **adresse MAC virtuelle** → les PC continuent d'envoyer au même MAC quoi qu'il arrive.

Un routeur est **actif** (il répond réellement pour la VIP) ; l'autre est en **veille**. Si l'actif tombe, la veille **reprend** la VIP et la MAC virtuelle **en quelques secondes** — **transparent** pour les PC (leur config ne change pas). ✅

---

## 3. Les trois FHRP 🔀

| Protocole | Origine | Rôles | Répartition de charge |
|---|---|---|---|
| **HSRP** | Cisco (propriétaire) | **Active** / **Standby** | non (un seul actif) |
| **VRRP** | **standard** (RFC) | **Master** / **Backup** | non |
| **GLBP** | Cisco (propriétaire) | AVG + plusieurs actifs | **OUI** (équilibre entre routeurs) |

- **HSRP** : le plus courant en environnement Cisco. Un routeur **Active**, un **Standby**. Élection par **priorité** (défaut 100) puis IP la plus haute.
- **VRRP** : équivalent **standard** (multi-constructeur). Rôles **Master/Backup**.
- **GLBP** : va plus loin — plusieurs routeurs sont **actifs simultanément** et se **partagent la charge** (un AVG distribue des MAC virtuelles différentes aux PC).

---

## 4. Configuration HSRP (exemple) 🖥️

Sur **R1** et **R2**, sur l'interface du LAN :
\`\`\`
R1(config-if)# standby 1 ip 192.168.1.254        ! IP virtuelle (passerelle des PC)
R1(config-if)# standby 1 priority 110            ! priorité (plus haut = Active)
R1(config-if)# standby 1 preempt                 ! reprend le rôle Active s'il revient
R2(config-if)# standby 1 ip 192.168.1.254
R2(config-if)# standby 1 priority 100
\`\`\`

Les **PC** utilisent \`192.168.1.254\` comme passerelle. \`show standby\` affiche l'état (Active/Standby), la VIP et la MAC virtuelle.

> 🧠 \`preempt\` = un routeur de priorité plus haute **reprend** le rôle Active quand il redevient disponible (sinon il resterait Standby).

---

## 🧠 Ce qu'il faut retenir

- Sans FHRP, la **passerelle** est un **point unique de défaillance** pour tout le LAN.
- Un FHRP crée une **passerelle virtuelle** (IP + MAC virtuelles) que les PC utilisent.
- Un routeur **Active** (HSRP) / **Master** (VRRP) répond ; l'autre reprend en cas de panne, **de façon transparente**.
- **HSRP** & **GLBP** = Cisco ; **VRRP** = **standard**. Seul **GLBP** fait de la **répartition de charge**.
- \`preempt\` fait reprendre le rôle au routeur de plus haute priorité quand il revient.

## ⚠️ Erreurs fréquentes des débutants

**1. Donner aux PC l'IP réelle d'un routeur comme passerelle.** Il faut leur donner l'**IP virtuelle** (VIP) du FHRP, pas l'IP physique de R1 — sinon la redondance ne sert à rien.

**2. Oublier de configurer le FHRP des deux côtés.** Les **deux** routeurs doivent partager le **même groupe** et la **même VIP**, sinon pas de bascule.

**3. Confondre HSRP et EtherChannel/STP.** HSRP protège la **passerelle** (couche 3) ; STP/EtherChannel gèrent les **boucles/liens** (couche 2). Problèmes différents.

**4. Croire que HSRP répartit la charge.** HSRP/VRRP n'ont qu'**un** routeur actif à la fois (l'autre attend). Pour **équilibrer** la charge entre routeurs, c'est **GLBP**.

**5. Oublier \`preempt\`.** Sans lui, après une panne le routeur principal **ne reprend pas** automatiquement le rôle Active en revenant — le secours (moins prioritaire) reste actif.`,
    badge: {
      id: "badge-backup-driver",
      name: "Backup Driver",
      icon: "Network",
      description: "Met en place une passerelle redondante (HSRP/VRRP/GLBP) contre la panne du premier saut.",
    },
    challenges: [
      {
        id: "res-fhrp-probleme",
        title: "Le problème résolu par FHRP",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 💥 Point unique de défaillance

Que résout un protocole **FHRP** (comme HSRP) ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Pense à ce qui arrive à tout un LAN quand SA passerelle par défaut tombe.", cost: 15 },
          { text: "📖 Correction complète : la panne de la passerelle par défaut (point unique de défaillance).", cost: 40 },
        ],
        options: [
          "La panne de la passerelle par défaut (redondance du premier saut)",
          "La lenteur des câbles",
          "Le manque d'adresses IP",
          "Les boucles de couche 2",
        ],
        answer: 0,
        explanation: `Un **FHRP** protège la **passerelle par défaut** : si le routeur passerelle tombe, tout le LAN perd l'accès aux autres réseaux. Le FHRP crée une **passerelle virtuelle** portée par plusieurs routeurs, qui **survit** à la panne de l'un d'eux. (Les boucles de couche 2, c'est STP ; ce sont des problèmes différents.)`,
        tags: ["fhrp", "passerelle", "haute-dispo"],
      },
      {
        id: "res-fhrp-vip",
        title: "Que mettent les PC en passerelle ?",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎭 Passerelle virtuelle

Avec HSRP configuré (VIP = 192.168.1.254, R1 = .1, R2 = .2), **quelle adresse** les PC doivent-ils mettre comme **passerelle par défaut** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Pour bénéficier de la redondance, il faut pointer vers l'adresse partagée, pas vers un routeur précis.", cost: 20 },
          { text: "📖 Correction complète : l'IP virtuelle (VIP) 192.168.1.254.", cost: 50 },
        ],
        options: ["192.168.1.254 (l'IP virtuelle)", "192.168.1.1 (R1)", "192.168.1.2 (R2)", "127.0.0.1"],
        answer: 0,
        explanation: `Les PC pointent vers l'**IP virtuelle** \`192.168.1.254\`. C'est **elle** (avec sa MAC virtuelle) qui survit à la panne d'un routeur : peu importe que R1 ou R2 soit **Active**, les PC voient toujours la même passerelle. Leur mettre l'IP réelle de R1 (.1) annulerait toute la redondance.`,
        tags: ["fhrp", "vip", "passerelle"],
      },
      {
        id: "res-fhrp-hsrp-vrrp",
        title: "Standard ou propriétaire ?",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔀 Les trois FHRP

Parmi HSRP, VRRP et GLBP, lequel est un **standard ouvert** (multi-constructeur) ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "HSRP et GLBP sont propriétaires Cisco. Il en reste un.", cost: 20 },
          { text: "📖 Correction complète : VRRP est le standard (RFC) ; HSRP et GLBP sont Cisco.", cost: 50 },
        ],
        options: ["VRRP", "HSRP", "GLBP", "Aucun"],
        answer: 0,
        explanation: `**VRRP** est le **standard** (défini par une RFC, multi-constructeur). **HSRP** et **GLBP** sont **propriétaires Cisco**. Fonctionnellement, VRRP (Master/Backup) ressemble à HSRP (Active/Standby) ; **GLBP** se distingue en offrant en plus de la **répartition de charge**.`,
        tags: ["fhrp", "vrrp", "hsrp", "standard"],
      },
      {
        id: "res-fhrp-glbp",
        title: "La spécificité de GLBP",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚖️ Répartition de charge

Qu'est-ce qui distingue **GLBP** de HSRP et VRRP ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "HSRP/VRRP n'ont qu'un routeur actif. GLBP en utilise plusieurs à la fois.", cost: 20 },
          { text: "📖 Correction complète : GLBP répartit la charge entre plusieurs routeurs actifs simultanément.", cost: 50 },
        ],
        options: [
          "GLBP répartit la charge entre plusieurs routeurs actifs simultanément",
          "GLBP est plus lent",
          "GLBP ne fonctionne qu'en IPv6",
          "GLBP n'a pas d'IP virtuelle",
        ],
        answer: 0,
        explanation: `Avec **HSRP/VRRP**, un **seul** routeur est actif (l'autre attend, sa bande passante est inutilisée). **GLBP** (*Gateway Load Balancing Protocol*) fait travailler **plusieurs routeurs en même temps** : un AVG distribue des **MAC virtuelles** différentes aux PC, ce qui **équilibre** le trafic sortant tout en gardant la redondance.`,
        tags: ["fhrp", "glbp", "load-balancing"],
      },
      {
        id: "res-fhrp-config",
        title: "Configurer HSRP",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🖥️ Config Cisco

Sur l'interface LAN de R1, configure **HSRP groupe 1** avec l'**IP virtuelle \`192.168.1.254\`** et une **priorité de 110**.`,
        points: 350,
        timeLimitSec: 480,
        starter: `interface gig0/0
`,
        hints: [
          { text: "standby 1 ip 192.168.1.254, puis standby 1 priority 110.", cost: 30 },
          { text: "📖 Correction complète :\n```\ninterface gig0/0\nstandby 1 ip 192.168.1.254\nstandby 1 priority 110\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Définit l'IP virtuelle du groupe HSRP (standby ... ip)", pattern: "standby\\s+1\\s+ip\\s+192\\.168\\.1\\.254", flags: "i" },
            { label: "Définit la priorité du routeur", pattern: "standby\\s+1\\s+priority\\s+110", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
interface gig0/0
standby 1 ip 192.168.1.254      ! IP virtuelle = passerelle des PC
standby 1 priority 110          ! priorité (plus haute → Active)
standby 1 preempt               ! reprend le rôle Active en revenant (recommandé)
\`\`\`

Le \`1\` est le **numéro de groupe** HSRP (identique sur R1 et R2). Priorité **110 > 100** (défaut) → R1 devient **Active**. \`preempt\` lui fait **reprendre** le rôle après une panne. Vérifie avec \`show standby\`.`,
        tags: ["fhrp", "hsrp", "config", "cisco"],
      },
      {
        id: "res-tp-fhrp",
        title: "Architecture 1 — Passerelle redondante HSRP",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 1 (niveau : avancé)

**Topologie à monter dans Packet Tracer :**

| Équipement | Interface | IP réelle | Rôle |
|---|---|---|---|
| R1 | G0/0 → SW | \`192.168.1.2/24\` | passerelle **Active** (les 2 routeurs sortent vers Internet) |
| R2 | G0/0 → SW | \`192.168.1.3/24\` | passerelle **Standby** |
| PC du LAN | → SW | DHCP/statique | passerelle configurée : **192.168.1.254** (virtuelle !) |

**Questions :**

1. Sur **R1** : IP réelle \`.2\`, puis **HSRP groupe 1** : IP virtuelle \`.254\`, **priorité 110**, **preempt** ;
2. Sur **R2** : IP réelle \`.3\`, même groupe, même IP virtuelle (priorité par défaut = 100) ;
3. Test : lancez un ping continu depuis un PC, éteignez R1 → le ping doit reprendre tout seul (~10 s).

Blocs \`! === R1 ===\` et \`! === R2 ===\`.`,
        points: 450,
        timeLimitSec: 1200,
        starter: `! === R1 ===
interface g0/0
`,
        hints: [
          { text: "Chaque routeur : ip address réelle, puis standby 1 ip 192.168.1.254. Sur R1 seulement : standby 1 priority 110 + standby 1 preempt.", cost: 45 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\ninterface g0/0\nip address 192.168.1.2 255.255.255.0\nstandby 1 ip 192.168.1.254\nstandby 1 priority 110\nstandby 1 preempt\nno shutdown\n! === R2 ===\ninterface g0/0\nip address 192.168.1.3 255.255.255.0\nstandby 1 ip 192.168.1.254\nno shutdown\n```", cost: 100 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "IP réelle de R1 (.2)", pattern: "ip\\s+address\\s+192\\.168\\.1\\.2\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "IP virtuelle HSRP (.254)", pattern: "standby\\s+1\\s+ip\\s+192\\.168\\.1\\.254", flags: "i" },
            { label: "Priorité 110 sur R1", pattern: "standby\\s+1\\s+priority\\s+110", flags: "i" },
            { label: "Preempt sur R1", pattern: "standby\\s+1\\s+preempt", flags: "i" },
            { label: "IP réelle de R2 (.3)", pattern: "ip\\s+address\\s+192\\.168\\.1\\.3\\s+255\\.255\\.255\\.0", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
! === R1 ===
interface g0/0
 ip address 192.168.1.2 255.255.255.0
 standby 1 ip 192.168.1.254     ! IP VIRTUELLE = passerelle des PC
 standby 1 priority 110         ! 110 > 100 → R1 Active
 standby 1 preempt              ! reprend le rôle en revenant de panne
 no shutdown
! === R2 ===
interface g0/0
 ip address 192.168.1.3 255.255.255.0
 standby 1 ip 192.168.1.254     ! MÊME IP virtuelle, MÊME groupe
 no shutdown
\`\`\`

Les PC pointent vers **192.168.1.254** — une adresse qui n'appartient à **aucun** routeur physiquement. R1 (Active) répond ; s'il tombe, R2 (Standby) reprend l'IP **et** la MAC virtuelle en ~10 s : **aucun PC à reconfigurer**. Le \`preempt\` fait que R1 redevient Active à son retour. Teste dans Packet Tracer : ping continu depuis un PC, éteins R1… le ping reprend tout seul !`,
        tags: ["tp", "fhrp", "hsrp", "config", "architecture"],
      },
      {
        id: "res-tp-fhrp-2",
        title: "Architecture 2 — HSRP à deux groupes (partage de charge)",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 2 (niveau : avancé+)

Avec un seul groupe HSRP, R2 reste les bras croisés tant que R1 vit. Ici on fait travailler **les deux** : deux VLAN, deux groupes HSRP **croisés**.

**Topologie à monter dans Packet Tracer :**

| VLAN | Réseau | IP virtuelle | Actif voulu | Standby |
|---|---|---|---|---|
| 10 | \`192.168.10.0/24\` | \`.254\` | **R1** (priorité 110) | R2 |
| 20 | \`192.168.20.0/24\` | \`.254\` | **R2** (priorité 110) | R1 |

R1 et R2 portent chacun une sous-interface (ou SVI) dans chaque VLAN : R1 = \`.2\`, R2 = \`.3\`.

**Questions :**

1. Sur **R1**, VLAN 10 : \`standby 10 ip 192.168.10.254\` + **priorité 110** + preempt ; VLAN 20 : \`standby 20 ip 192.168.20.254\` (priorité par défaut) ;
2. Sur **R2** : le **miroir** — priorité 110 + preempt sur le groupe **20**, défaut sur le groupe 10 ;
3. Question : qu'a-t-on gagné par rapport à un seul groupe ? *(réponse dans la correction)*

Blocs \`! === R1 ===\` et \`! === R2 ===\`.`,
        points: 500,
        timeLimitSec: 1500,
        starter: `! === R1 ===
interface g0/0.10
`,
        hints: [
          { text: "Le numéro de groupe change par VLAN (standby 10 …, standby 20 …). La priorité 110 va sur R1 pour le groupe 10, sur R2 pour le groupe 20.", cost: 50 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\ninterface g0/0.10\nstandby 10 ip 192.168.10.254\nstandby 10 priority 110\nstandby 10 preempt\ninterface g0/0.20\nstandby 20 ip 192.168.20.254\n! === R2 ===\ninterface g0/0.10\nstandby 10 ip 192.168.10.254\ninterface g0/0.20\nstandby 20 ip 192.168.20.254\nstandby 20 priority 110\nstandby 20 preempt\n```", cost: 110 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Groupe 10 : IP virtuelle du VLAN 10", pattern: "standby\\s+10\\s+ip\\s+192\\.168\\.10\\.254", flags: "i" },
            { label: "Priorité 110 sur le groupe 10 (R1)", pattern: "standby\\s+10\\s+priority\\s+110", flags: "i" },
            { label: "Groupe 20 : IP virtuelle du VLAN 20", pattern: "standby\\s+20\\s+ip\\s+192\\.168\\.20\\.254", flags: "i" },
            { label: "Priorité 110 sur le groupe 20 (R2)", pattern: "standby\\s+20\\s+priority\\s+110", flags: "i" },
            { label: "Preempt configuré", pattern: "standby\\s+\\d+\\s+preempt", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

\`\`\`
! === R1 ===
interface g0/0.10
 standby 10 ip 192.168.10.254
 standby 10 priority 110       ! R1 Actif pour le VLAN 10
 standby 10 preempt
interface g0/0.20
 standby 20 ip 192.168.20.254  ! priorité 100 : Standby pour le VLAN 20
! === R2 ===
interface g0/0.10
 standby 10 ip 192.168.10.254  ! Standby pour le VLAN 10
interface g0/0.20
 standby 20 ip 192.168.20.254
 standby 20 priority 110       ! R2 Actif pour le VLAN 20
 standby 20 preempt
\`\`\`

**Réponse à la question 3 :** avec un seul groupe, R2 est un routeur **payé à ne rien faire** (Standby pur). En croisant deux groupes, le trafic du VLAN 10 sort par R1 **pendant que** celui du VLAN 20 sort par R2 → **partage de charge** ET redondance : si l'un meurt, l'autre reprend **les deux** groupes. (C'est exactement le service que GLBP rend automatiquement — HSRP le fait « à la main » par ce croisement.)

**Vérification PT :** \`show standby brief\` sur chaque routeur : R1 doit être *Active* pour le groupe 10 / *Standby* pour le 20, et R2 l'inverse. Éteins R2 → R1 devient Active partout. 🎯`,
        tags: ["tp", "hsrp", "load-sharing", "config", "architecture"],
      },
    ],
  },
];
