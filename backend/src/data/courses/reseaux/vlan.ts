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
    ],
  },
];
