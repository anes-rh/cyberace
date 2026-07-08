import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 9 : VLAN & routage inter-VLAN. */
export const vlan: CourseSeed[] = [
  {
    slug: "res-vlan",
    title: "VLAN & routage inter-VLAN",
    checkpoint: "reseaux",
    codename: "Lane Split",
    domain: "Réseaux — commutation",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 10,
    difficulty: "medium",
    summary:
      "Découper un switch en plusieurs réseaux logiques : VLAN, marquage 802.1Q, ports access vs trunk, puis faire communiquer ces VLAN via le routage inter-VLAN (router-on-a-stick et switch de couche 3).",
    objectives: [
      "Comprendre l'intérêt des VLAN (segmentation, sécurité, broadcast)",
      "Distinguer un port access et un port trunk (802.1Q)",
      "Configurer des VLAN et affecter des ports (Cisco)",
      "Router entre VLAN via router-on-a-stick (sous-interfaces)",
      "Connaître l'alternative du switch de couche 3 (SVI)",
    ],
    resources: [
      {
        label: "Architecture 1 — topologie de départ (.pka)",
        url: "/pka/res-vlan-architecture-1.pka",
        kind: "pkt-start",
        note: "À ouvrir dans Cisco Packet Tracer : R1 relié à un switch SW1 avec plusieurs PC, non configurés. Crée les VLAN, le trunk et le routage inter-VLAN (router-on-a-stick) selon l'Architecture 1.",
      },
    ],
    lesson: `# 🛣️ VLAN & routage inter-VLAN — le Lane Split

Un **switch** met tous ses ports dans **un seul** réseau de diffusion (LAN). Problème : sur un gros site, tout le monde reçoit tous les broadcasts, et aucune séparation (compta/RH/invités partagent le même réseau). Les **VLAN** découpent **logiquement** un switch en **plusieurs réseaux** — comme des voies séparées sur une autoroute. 🏎️

> 📎 Prérequis : modèle OSI (couche 2/switch) + adressage IPv4.

---

## 1. Qu'est-ce qu'un VLAN ? 🧩

Un **VLAN** (*Virtual LAN*) est un **réseau logique** défini par configuration, indépendant de la topologie physique. Deux PC branchés sur le **même** switch mais dans des VLAN **différents** ne peuvent **pas** se parler directement (il faut un routeur).

**Avantages** :
- **Segmentation** : chaque service (compta, RH, invités) dans son VLAN.
- **Sécurité** : isolation du trafic entre VLAN.
- **Maîtrise des broadcasts** : chaque VLAN = un **domaine de diffusion** séparé → moins de bruit.
- **Souplesse** : on regroupe des utilisateurs **logiquement**, peu importe où ils sont branchés.

Chaque VLAN correspond en général à **un sous-réseau IP** distinct.

---

## 2. Ports access & trunk, marquage 802.1Q 🏷️

| Type de port | Rôle | VLAN |
|---|---|---|
| **Access** | relie un **équipement final** (PC, imprimante) | appartient à **un seul** VLAN |
| **Trunk** | relie **deux switches** (ou switch↔routeur) | transporte **plusieurs** VLAN |

Sur un **trunk**, comme plusieurs VLAN partagent le même câble, il faut **étiqueter** chaque trame pour savoir à quel VLAN elle appartient : c'est le **marquage 802.1Q** (ajout d'un **tag** de 4 octets contenant le numéro de VLAN).

\`\`\`
 PC(VLAN10) ─access─ SW1 ═══trunk 802.1Q═══ SW2 ─access─ PC(VLAN10)
                        (transporte VLAN 10, 20, 30…)
\`\`\`

Le **VLAN natif** (par défaut VLAN 1) circule **non tagué** sur le trunk.

---

## 3. Configuration des VLAN (Cisco) 🖥️

\`\`\`
! créer les VLAN
Switch(config)# vlan 10
Switch(config-vlan)# name RH
Switch(config)# vlan 20
Switch(config-vlan)# name Compta

! port access (un PC dans VLAN 10)
Switch(config)# interface fa0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10

! port trunk (vers un autre switch)
Switch(config)# interface fa0/24
Switch(config-if)# switchport mode trunk
\`\`\`

Vérification : \`show vlan brief\` (VLAN et ports), \`show interfaces trunk\` (trunks actifs).

---

## 4. Faire communiquer les VLAN : le routage inter-VLAN 🔀

Par définition, deux VLAN = deux réseaux → il faut un **routeur** (couche 3) pour les relier. Trois méthodes :

### 4.1 Une interface routeur par VLAN (ancienne)
Un câble et une interface **physique** par VLAN. Simple mais **ne passe pas à l'échelle** (un routeur n'a pas 50 ports).

### 4.2 Router-on-a-stick (la méthode classique) 🍢
**Un seul** lien trunk entre le switch et le routeur, découpé en **sous-interfaces** (une par VLAN), chacune taguée et servant de **passerelle** :

\`\`\`
Router(config)# interface gig0/0.10           ! sous-interface pour VLAN 10
Router(config-subif)# encapsulation dot1Q 10  ! tag 802.1Q du VLAN 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0
Router(config)# interface gig0/0.20
Router(config-subif)# encapsulation dot1Q 20
Router(config-subif)# ip address 192.168.20.1 255.255.255.0
\`\`\`

Chaque PC prend comme **passerelle** l'IP de la sous-interface de **son** VLAN. Le routeur reçoit une trame taguée VLAN 10, la route vers le sous-réseau du VLAN 20, la re-tague et la renvoie. ✅

### 4.3 Switch de couche 3 (SVI) — le plus performant ⚡
Un **switch multicouche** route directement entre VLAN via des **interfaces virtuelles (SVI)** :
\`\`\`
Switch(config)# ip routing
Switch(config)# interface vlan 10
Switch(config-if)# ip address 192.168.10.1 255.255.255.0
\`\`\`
Plus rapide (routage matériel), sans goulot du lien unique du router-on-a-stick.

---

## 🧠 Ce qu'il faut retenir

- **VLAN** = réseau **logique** ; chaque VLAN = un **domaine de diffusion** et **un sous-réseau IP**.
- Port **access** = 1 VLAN (équipement final) ; port **trunk** = plusieurs VLAN, avec **marquage 802.1Q**.
- Deux VLAN ne communiquent **que** via un **routage inter-VLAN** (couche 3).
- **Router-on-a-stick** : un trunk + **sous-interfaces** (\`encapsulation dot1Q\`), une passerelle par VLAN.
- **Switch L3 (SVI)** : routage inter-VLAN matériel, plus performant.

## ⚠️ Erreurs fréquentes des débutants

**1. Croire que deux VLAN communiquent « tout seuls ».** Sur le même switch, deux VLAN sont **étanches** : sans routeur/SVI, aucune communication possible.

**2. Oublier de configurer le trunk.** Si le lien switch↔switch (ou switch↔routeur) reste en **access**, les autres VLAN **ne passent pas**. Mets-le en **trunk**.

**3. Se tromper de VLAN sur \`encapsulation dot1Q\`.** Le numéro de la sous-interface **et** le \`dot1Q\` doivent correspondre au **bon VLAN**, sinon le trafic n'est pas routé.

**4. Mauvaise passerelle sur les PC.** Chaque PC doit pointer vers l'IP de la **sous-interface (ou SVI) de SON VLAN**, pas celle d'un autre.

**5. Oublier \`ip routing\` sur le switch L3.** Sans cette commande, un switch multicouche **ne route pas** entre ses SVI.`,
    videos: [
      { title: "VLAN — cours", youtubeId: "j9mFwupVCV0", moreUrl: "https://www.youtube.com/playlist?list=PLgAuOjTVwB6xyoFFor4O5ly03N4_ekV0D" },
      { title: "VLAN — TP Packet Tracer", youtubeId: "aTTBcxGGqto" },
    ],
    badge: {
      id: "badge-lane-split",
      name: "Lane Split",
      icon: "Network",
      description: "Segmente un réseau en VLAN et les fait communiquer par routage inter-VLAN.",
    },
    challenges: [
      {
        id: "res-vlan-access-trunk",
        title: "Access ou trunk ?",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🏷️ Le bon type de port

Tu relies **deux switches** entre eux et tu veux que **plusieurs VLAN** passent sur ce lien. Quel type de port configures-tu ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un port access ne porte qu'un VLAN. Pour en transporter plusieurs, il faut l'autre type.", cost: 20 },
          { text: "📖 Correction complète : un port trunk (avec marquage 802.1Q).", cost: 50 },
        ],
        options: ["Un port access", "Un port trunk (802.1Q)", "Un port éteint", "Un port de loopback"],
        answer: 1,
        explanation: `Un lien qui transporte **plusieurs VLAN** entre équipements (switch↔switch, switch↔routeur) doit être un **trunk**. Le trunk **étiquette** chaque trame avec le numéro de VLAN (**802.1Q**). Un port **access** ne porte qu'**un seul** VLAN (pour un PC/une imprimante).`,
        tags: ["vlan", "trunk", "802.1q"],
      },
      {
        id: "res-vlan-domaine-broadcast",
        title: "VLAN et diffusion",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧩 Ce qu'apporte un VLAN

Créer plusieurs VLAN sur un switch permet notamment de…`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Chaque VLAN devient un réseau séparé : que devient la diffusion (broadcast) ?", cost: 15 },
          { text: "📖 Correction complète : chaque VLAN = un domaine de diffusion séparé (segmentation + moins de broadcast).", cost: 40 },
        ],
        options: [
          "Séparer les domaines de diffusion (chaque VLAN a son propre broadcast)",
          "Augmenter la vitesse des câbles",
          "Supprimer le besoin d'adresses IP",
          "Fusionner tous les réseaux en un seul",
        ],
        answer: 0,
        explanation: `Chaque VLAN est un **domaine de diffusion séparé** : un broadcast dans le VLAN 10 ne dérange **pas** le VLAN 20. On gagne en **segmentation**, en **sécurité** (isolation) et en **maîtrise du bruit** de diffusion. Chaque VLAN correspond en général à un **sous-réseau IP** distinct.`,
        tags: ["vlan", "broadcast", "segmentation"],
      },
      {
        id: "res-vlan-inter-methode",
        title: "Router-on-a-stick",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🍢 Faire communiquer les VLAN

La méthode **router-on-a-stick** pour le routage inter-VLAN repose sur…`,
        points: 350,
        timeLimitSec: 420,
        hints: [
          { text: "Un seul lien trunk entre switch et routeur, mais logiquement découpé.", cost: 30 },
          { text: "📖 Correction complète : un trunk unique + des sous-interfaces (une par VLAN) avec encapsulation dot1Q.", cost: 70 },
        ],
        options: [
          "Un lien trunk unique découpé en sous-interfaces (une par VLAN, encapsulation dot1Q)",
          "Un câble physique séparé par VLAN sur le routeur",
          "La suppression des VLAN",
          "Un serveur DHCP",
        ],
        answer: 0,
        explanation: `**Router-on-a-stick** = **un seul** lien **trunk** entre le switch et le routeur, découpé en **sous-interfaces** (\`gig0/0.10\`, \`gig0/0.20\`…), chacune **taguée** (\`encapsulation dot1Q <vlan>\`) et portant l'**IP passerelle** de son VLAN. Le routeur route entre les sous-interfaces. C'est plus scalable que « une interface physique par VLAN » ; le switch L3 (SVI) est encore plus performant.`,
        tags: ["vlan", "inter-vlan", "router-on-a-stick"],
      },
      {
        id: "res-vlan-config-access",
        title: "Affecter un port à un VLAN",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "pseudo",
        prompt: `## 🖥️ Config Cisco

Le port \`fa0/1\` doit devenir un port **access** appartenant au **VLAN 10**. Écris les commandes.`,
        points: 200,
        timeLimitSec: 480,
        starter: `interface fa0/1
`,
        hints: [
          { text: "switchport mode access, puis switchport access vlan 10.", cost: 25 },
          { text: "📖 Correction complète :\n```\ninterface fa0/1\nswitchport mode access\nswitchport access vlan 10\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Sélectionne l'interface fa0/1", pattern: "interface\\s+fa0/1", flags: "i" },
            { label: "Met le port en mode access", pattern: "switchport\\s+mode\\s+access", flags: "i" },
            { label: "Affecte le port au VLAN 10", pattern: "switchport\\s+access\\s+vlan\\s+10", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
interface fa0/1
switchport mode access        ! port pour un équipement final
switchport access vlan 10     ! il appartient au VLAN 10
\`\`\`

Le port \`fa0/1\` est maintenant dans le **VLAN 10** : le PC branché dessus est isolé des autres VLAN. Vérifie avec \`show vlan brief\` (le port doit apparaître sous VLAN 10). Pour un lien inter-switch, on aurait mis \`switchport mode trunk\`.`,
        tags: ["vlan", "config", "cisco", "access"],
      },
      {
        id: "res-vlan-communication",
        title: "Deux VLAN peuvent-ils se parler ?",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔀 Étanchéité

Deux PC sont sur le **même switch** mais l'un est dans le **VLAN 10** et l'autre dans le **VLAN 20**. Sans aucun autre équipement, peuvent-ils communiquer ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Deux VLAN = deux réseaux/sous-réseaux différents. Que faut-il pour relier deux réseaux ?", cost: 20 },
          { text: "📖 Correction complète : non — il faut un routage inter-VLAN (routeur ou switch L3).", cost: 50 },
        ],
        options: [
          "Non : il faut un routage inter-VLAN (routeur ou switch de couche 3)",
          "Oui, automatiquement",
          "Oui, s'ils ont la même adresse MAC",
          "Oui, en les mettant sur le même port",
        ],
        answer: 0,
        explanation: `**Non** : par définition, deux VLAN sont des **réseaux séparés** (couche 2 étanche). Pour qu'ils communiquent, il faut un **équipement de couche 3** — un **routeur** (router-on-a-stick) ou un **switch multicouche** (SVI). C'est tout l'objet du **routage inter-VLAN**.`,
        tags: ["vlan", "inter-vlan", "etancheite"],
      },
      {
        id: "res-tp-vlan",
        title: "Architecture 1 — Router-on-a-stick",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 1 (niveau : avancé)

**Topologie à monter dans Packet Tracer :**

| Équipement | Port | Rôle | VLAN / Réseau |
|---|---|---|---|
| SW1 | Fa0/1 | PC-A (accès) | VLAN 10 « VENTES » — \`192.168.10.0/24\` |
| SW1 | Fa0/11 | PC-B (accès) | VLAN 20 « COMPTA » — \`192.168.20.0/24\` |
| SW1 | G0/1 | vers R1 | **trunk 802.1Q** (les 2 VLAN) |
| R1 | G0/0 | vers SW1 | sous-interfaces .10 et .20 |

**Questions :**

1. Sur **SW1** : créez les VLAN 10 (\`VENTES\`) et 20 (\`COMPTA\`) ;
2. Mettez \`Fa0/1\` en **accès** VLAN 10 et \`Fa0/11\` en **accès** VLAN 20 ;
3. Passez \`G0/1\` en **trunk** ;
4. Sur **R1** : créez les **sous-interfaces** \`G0/0.10\` et \`G0/0.20\` (encapsulation dot1Q + passerelle \`.1\` de chaque VLAN), puis activez \`G0/0\` ;
5. Vérifiez : ping PC-A → PC-B (il doit traverser R1).

Blocs \`! === SW1 ===\` et \`! === R1 ===\`.`,
        points: 500,
        timeLimitSec: 1500,
        starter: `! === SW1 ===
vlan 10
`,
        hints: [
          { text: "SW1 : vlan 10/name VENTES, switchport mode access + switchport access vlan X, trunk sur G0/1. R1 : interface g0/0.10, encapsulation dot1Q 10, ip address 192.168.10.1…", cost: 50 },
          { text: "📖 Correction complète :\n```\n! === SW1 ===\nvlan 10\nname VENTES\nvlan 20\nname COMPTA\ninterface fa0/1\nswitchport mode access\nswitchport access vlan 10\ninterface fa0/11\nswitchport mode access\nswitchport access vlan 20\ninterface g0/1\nswitchport mode trunk\n! === R1 ===\ninterface g0/0.10\nencapsulation dot1Q 10\nip address 192.168.10.1 255.255.255.0\ninterface g0/0.20\nencapsulation dot1Q 20\nip address 192.168.20.1 255.255.255.0\ninterface g0/0\nno shutdown\n```", cost: 110 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Crée le VLAN 10", pattern: "vlan\\s+10", flags: "i" },
            { label: "Crée le VLAN 20", pattern: "vlan\\s+20", flags: "i" },
            { label: "Met un port en accès VLAN 10", pattern: "switchport\\s+access\\s+vlan\\s+10", flags: "i" },
            { label: "Met un port en accès VLAN 20", pattern: "switchport\\s+access\\s+vlan\\s+20", flags: "i" },
            { label: "Configure le trunk vers R1", pattern: "switchport\\s+mode\\s+trunk", flags: "i" },
            { label: "Sous-interface taguée VLAN 10 (dot1Q)", pattern: "encapsulation\\s+dot1q\\s+10", flags: "i" },
            { label: "Passerelle du VLAN 10", pattern: "ip\\s+address\\s+192\\.168\\.10\\.1\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "Sous-interface taguée VLAN 20 (dot1Q)", pattern: "encapsulation\\s+dot1q\\s+20", flags: "i" },
            { label: "Passerelle du VLAN 20", pattern: "ip\\s+address\\s+192\\.168\\.20\\.1\\s+255\\.255\\.255\\.0", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
! === SW1 ===
vlan 10
 name VENTES
vlan 20
 name COMPTA
interface fa0/1
 switchport mode access
 switchport access vlan 10
interface fa0/11
 switchport mode access
 switchport access vlan 20
interface g0/1
 switchport mode trunk          ! transporte les 2 VLAN tagués 802.1Q
! === R1 ===
interface g0/0.10
 encapsulation dot1Q 10         ! AVANT l'adresse IP !
 ip address 192.168.10.1 255.255.255.0
interface g0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
interface g0/0
 no shutdown                    ! l'interface PHYSIQUE doit être up
\`\`\`

Chaque trame montant le trunk porte son **tag 802.1Q** ; R1 la reçoit sur la bonne **sous-interface**, route, et renvoie taguée pour l'autre VLAN. Deux pièges classiques : (1) \`encapsulation dot1Q\` doit précéder l'IP ; (2) sans \`no shutdown\` sur la **physique** G0/0, toutes les sous-interfaces restent down. Test final : ping PC-A → PC-B (il traverse R1 !).`,
        tags: ["tp", "vlan", "router-on-a-stick", "config", "architecture"],
      },
      {
        id: "res-tp-vlan-2",
        title: "Architecture 2 — Switch L3 et SVI",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 2 (niveau : avancé+)

Fini le router-on-a-stick : un **switch multicouche (L3)** route directement entre VLAN grâce aux **SVI** — la méthode moderne des entreprises.

**Topologie à monter dans Packet Tracer** *(prendre un switch 3560/3650)* :

| Équipement | Port | Rôle | VLAN / Réseau |
|---|---|---|---|
| SW-L3 | Fa0/1-8 | postes BUREAUX | VLAN 10 — \`192.168.10.0/24\` |
| SW-L3 | Fa0/9-16 | postes WIFI | VLAN 20 — \`192.168.20.0/24\` |
| SW-L3 | — | passerelles virtuelles | SVI \`interface vlan 10\` / \`vlan 20\` |

**Questions :**

1. Créez les VLAN 10 et 20 ;
2. Mettez \`Fa0/1\` en accès VLAN 10 et \`Fa0/9\` en accès VLAN 20 ;
3. Créez les **SVI** : \`interface vlan 10\` → \`192.168.10.1/24\`, \`interface vlan 20\` → \`192.168.20.1/24\` (+ \`no shutdown\`) ;
4. Activez le **routage** sur le switch (\`ip routing\`) — sans ça, les SVI ne routent pas entre elles ;
5. Vérifiez : ping d'un PC BUREAUX vers un PC WIFI, **sans aucun routeur** dans la topologie.`,
        points: 500,
        timeLimitSec: 1500,
        starter: `! === SW-L3 ===
vlan 10
`,
        hints: [
          { text: "Les SVI sont des interfaces VIRTUELLES : interface vlan 10 → ip address → no shutdown. Et n'oublie pas ip routing en global !", cost: 50 },
          { text: "📖 Correction complète :\n```\nvlan 10\nvlan 20\ninterface fa0/1\nswitchport mode access\nswitchport access vlan 10\ninterface fa0/9\nswitchport mode access\nswitchport access vlan 20\ninterface vlan 10\nip address 192.168.10.1 255.255.255.0\nno shutdown\ninterface vlan 20\nip address 192.168.20.1 255.255.255.0\nno shutdown\nip routing\n```", cost: 110 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "SVI du VLAN 10 créée", pattern: "interface\\s+vlan\\s*10", flags: "i" },
            { label: "IP de la SVI 10 (passerelle BUREAUX)", pattern: "ip\\s+address\\s+192\\.168\\.10\\.1\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "SVI du VLAN 20 créée", pattern: "interface\\s+vlan\\s*20", flags: "i" },
            { label: "IP de la SVI 20 (passerelle WIFI)", pattern: "ip\\s+address\\s+192\\.168\\.20\\.1\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "Routage activé sur le switch", pattern: "^\\s*ip\\s+routing", flags: "im" },
            { label: "Port en accès VLAN 10", pattern: "switchport\\s+access\\s+vlan\\s+10", flags: "i" },
            { label: "Active les SVI (no shutdown)", pattern: "no\\s+shut", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

\`\`\`
vlan 10
vlan 20
interface fa0/1
 switchport mode access
 switchport access vlan 10
interface fa0/9
 switchport mode access
 switchport access vlan 20
interface vlan 10                        ! SVI = interface VIRTUELLE du VLAN
 ip address 192.168.10.1 255.255.255.0   ! passerelle des PC BUREAUX
 no shutdown
interface vlan 20
 ip address 192.168.20.1 255.255.255.0
 no shutdown
ip routing                               ! le switch devient routeur !
\`\`\`

**SVI vs router-on-a-stick :** dans l'Architecture 1, tout le trafic inter-VLAN faisait l'**aller-retour** sur l'unique trunk vers R1 (goulot d'étranglement). Ici, le switch L3 route **en interne, à la vitesse du fond de panier** — ni trunk externe, ni routeur. C'est le design standard en entreprise : router-on-a-stick pour les petits sites, **SVI sur switch L3** partout ailleurs.

**Les 2 oublis classiques :** \`no shutdown\` sur chaque SVI (créées down), et surtout \`ip routing\` — sans lui le switch a des SVI mais se comporte en simple L2 : les PC pinguent leur passerelle mais pas l'autre VLAN.

**Vérification PT :** \`show ip route\` sur le switch (2 réseaux **C**onnectés), \`show interface vlan 10\` (up/up), ping inter-VLAN. 🎯`,
        tags: ["tp", "vlan", "svi", "switch-l3", "architecture"],
      },
      {
        id: "res-lab-vlan-complet",
        title: "🏁 LAB COMPLET — VLAN + inter-VLAN, ping de bout en bout",
        order: 8,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏁 Lab guidé complet (fichier : « topologie de départ » du module)

Ouvre le **.pka de départ** (sous le cours) : **R1 relié à un switch SW1** avec plusieurs **PC**, non configurés. Objectif : deux VLAN étanches, un routage inter-VLAN (router-on-a-stick), et **le ping doit passer entre TOUS les PC** — y compris entre VLAN différents.

**Plan imposé :**

| VLAN | Réseau | Passerelle (sous-interface R1) | PC |
|---|---|---|---|
| 10 « VENTES » | \`192.168.10.0/24\` | \`192.168.10.1\` | PC0, PC1 |
| 20 « COMPTA » | \`192.168.20.0/24\` | \`192.168.20.1\` | PC2, PC3 |

**Instructions — dans Packet Tracer :**

1. **SW1** : crée \`vlan 10\` (VENTES) et \`vlan 20\` (COMPTA). Mets les ports des PC en **accès** dans le bon VLAN. Passe le port relié à **R1 en trunk** (\`switchport mode trunk\`).
2. **R1** : crée les **sous-interfaces** \`G0/0.10\` et \`G0/0.20\` — \`encapsulation dot1Q 10/20\` **avant** l'IP, puis \`ip address\` = la passerelle .1 de chaque VLAN. \`no shutdown\` sur **G0/0** (la physique).
3. **Chaque PC** : IP dans son VLAN + passerelle = la sous-interface .1.

Écris ci-dessous la config **de R1** (les 2 sous-interfaces + activation). La correction (SW1 + R1 + PC) et la **matrice de ping** s'affiche après validation.`,
        points: 700,
        timeLimitSec: 2400,
        starter: `! === R1 ===
interface g0/0.10
`,
        hints: [
          { text: "R1 : interface g0/0.10 → encapsulation dot1Q 10 → ip address 192.168.10.1 ; idem .20 ; puis no shutdown sur g0/0.", cost: 60 },
          { text: "📖 Correction R1 :\n```\ninterface g0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\ninterface g0/0.20\n encapsulation dot1Q 20\n ip address 192.168.20.1 255.255.255.0\ninterface g0/0\n no shutdown\n```", cost: 140 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Sous-interface taguée VLAN 10", pattern: "encapsulation\\s+dot1q\\s+10", flags: "i" },
            { label: "Passerelle VLAN 10", pattern: "ip\\s+address\\s+192\\.168\\.10\\.1\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "Sous-interface taguée VLAN 20", pattern: "encapsulation\\s+dot1q\\s+20", flags: "i" },
            { label: "Passerelle VLAN 20", pattern: "ip\\s+address\\s+192\\.168\\.20\\.1\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "Interface physique activée", pattern: "interface\\s+g\\S*0/0\\s*\\n\\s*no\\s+shut", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction complète + vérification

\`\`\`
! === SW1 ===
vlan 10
 name VENTES
vlan 20
 name COMPTA
interface fa0/1                 ! PC0 (VLAN 10) — répéter pour chaque PC
 switchport mode access
 switchport access vlan 10
interface g0/1                  ! lien vers R1
 switchport mode trunk
! === R1 ===
interface g0/0.10
 encapsulation dot1Q 10         ! AVANT l'IP
 ip address 192.168.10.1 255.255.255.0
interface g0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
interface g0/0
 no shutdown                    ! sinon toutes les sous-interfaces sont down
\`\`\`

**PC** : PC0/PC1 → 192.168.10.10/.11, passerelle **192.168.10.1** ; PC2/PC3 → 192.168.20.10/.11, passerelle **192.168.20.1**.

### 🎯 Comment savoir que TOUT est bon : la matrice de ping

| Depuis \\ Vers | PC0 (V10) | PC1 (V10) | PC2 (V20) | PC3 (V20) |
|---|---|---|---|---|
| **PC0** | — | ✅ direct | ✅ via R1 | ✅ via R1 |
| **PC2** | ✅ via R1 | ✅ via R1 | — | ✅ direct |

Si **tous les PC se pinguent** (même VLAN **direct**, VLAN croisés **via R1**), le router-on-a-stick est bon. 🏆

**Si le cross-VLAN échoue :** \`encapsulation dot1Q\` doit précéder l'IP ; \`g0/0\` doit être **no shutdown** ; le port SW1↔R1 doit être **trunk** ; la passerelle du PC = la sous-interface .1.`,
        tags: ["lab", "vlan", "inter-vlan", "ping", "verification", "architecture"],
      },
    ],
  },
];
