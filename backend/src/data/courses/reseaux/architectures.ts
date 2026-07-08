import type { CourseSeed } from "../../../types";

/** Réseaux — Module final : architectures d'examen (mix de tous les chapitres). */
export const architectures: CourseSeed[] = [
  {
    slug: "res-architectures",
    title: "Architectures d'examen — la synthèse",
    checkpoint: "reseaux",
    codename: "Grand Prix Final",
    domain: "Réseaux — Synthèse",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 18,
    difficulty: "hard",
    summary:
      "Le grand final : trois architectures complètes de niveau examen, qui mélangent TOUS les chapitres — VLAN, DHCP, STP, EtherChannel, HSRP, OSPF, IPv6/OSPFv3, PortFast, routes par défaut. Exactement le format des sujets de TP universitaires, avec correction détaillée.",
    objectives: [
      "Lire une topologie d'examen et planifier sa configuration (L1 → L2 → L3 → services)",
      "Configurer une PME complète : VLAN + router-on-a-stick + DHCP + accès Internet",
      "Monter un campus redondant : EtherChannel + Rapid STP + HSRP + OSPF",
      "Traiter un sujet d'examen IPv6 : adressage, OSPFv3, RSTP, EtherChannel, PortFast, route par défaut",
      "Acquérir la check-list de vérification (show …) pour valider chaque couche",
    ],
    resources: [
      {
        label: "Topologie complexe de synthèse (.pka)",
        url: "/pka/res-architectures-complexe.pka",
        kind: "pkt-start",
        note: "À ouvrir dans Cisco Packet Tracer : une topologie riche (routeurs R1-R3, switches SW1-SW3, hub) à configurer de bout en bout. Sers-t'en comme terrain d'entraînement pour combiner adressage, routage et commutation comme dans un vrai sujet d'examen.",
      },
    ],
    lesson: `# 🏆 Architectures d'examen — le Grand Prix Final

Tu as vu **tous** les chapitres. Un sujet d'examen ne te demandera jamais « configure OSPF » tout seul : il te donnera **une topologie complète** et une liste de tâches qui mélangent VLAN, STP, routage, DHCP, IPv6… Ce module t'entraîne exactement à ça. 🏎️

> 📎 Prérequis : **tout le checkpoint** — c'est la synthèse.

---

## 1. La méthode : toujours du bas vers le haut 🧭

Face à une architecture d'examen, ne configure **jamais** dans l'ordre des questions : configure dans l'ordre **des couches**, sinon tu déboguéras à l'aveugle.

| Étape | Couche | Actions | Vérification |
|---|---|---|---|
| 1 | **Physique** | câblage, DCE/clock rate, no shutdown | \`show ip interface brief\` |
| 2 | **Liaison (L2)** | VLAN, accès/trunk, EtherChannel, STP/RSTP, PortFast | \`show vlan brief\`, \`show etherchannel summary\`, \`show spanning-tree\` |
| 3 | **Réseau (L3)** | adressage IPv4/IPv6, sous-interfaces/SVI | \`show ip(v6) interface brief\` |
| 4 | **Routage** | statique/défaut, OSPF/OSPFv3, RIP, HSRP | \`show ip(v6) route\`, \`show ip ospf neighbor\`, \`show standby\` |
| 5 | **Services** | DHCP (pools, exclusions, relais), NAT… | \`show ip dhcp binding\` |

> 🎯 Règle d'or : **valide chaque étape avant de passer à la suivante.** Un ping qui échoue à l'étape 5 vient dans 80 % des cas d'une étape 1-3 bâclée.

---

## 2. Les pièges favoris des examinateurs 😈

- **\`no shutdown\` oublié** — sur une interface physique, une sous-interface… ou une SVI.
- **\`clock rate\` absent** côté DCE d'un lien série → lien down.
- **\`encapsulation dot1Q\` après l'IP** au lieu d'avant, sur une sous-interface.
- **\`ipv6 unicast-routing\` oublié** → adresses OK mais aucun routage, pas de RA/SLAAC.
- **PortFast sur un lien switch-switch** → boucle. PortFast = ports d'accès UNIQUEMENT.
- **Exclusions DHCP après le pool** → la passerelle a déjà été distribuée à un PC.
- **Route retour manquante** — le ping part mais ne revient pas (statique, relais DHCP…).
- **Wildcard ≠ masque** en OSPF : /24 → \`0.0.0.255\`, /30 → \`0.0.0.3\`.

---

## 3. Ce que contiennent les trois architectures 🗺️

| Architecture | Mélange | Niveau |
|---|---|---|
| **1 — PME complète** | VLAN + router-on-a-stick + DHCP + route par défaut | examen « classique » |
| **2 — Campus redondant** | EtherChannel + Rapid STP + HSRP + OSPF | examen « avancé » |
| **3 — Sujet type M1** | IPv6 + OSPFv3 + RSTP + EtherChannel + PortFast + \`::/0\` | examen « expert » |

Chaque architecture est décrite par ses **tables** (équipements, liens, plan d'adressage) et une liste de **questions numérotées**, comme un vrai sujet. Tu écris la configuration complète ; la **correction détaillée** s'affiche après validation (et le 2ᵉ indice la donne aussi, si tu bloques).

> 🧪 Monte chaque topologie dans **Packet Tracer** pour tester réellement — c'est le meilleur entraînement possible avant l'examen.

---

## 🧠 Ce qu'il faut retenir

- Une architecture se configure **par couches** (L1 → L2 → L3 → routage → services), pas dans l'ordre des questions.
- **Vérifie chaque couche** avec sa commande \`show\` avant de monter d'un cran.
- Les pièges classiques : \`no shutdown\`, \`clock rate\`, ordre dot1Q/IP, \`ipv6 unicast-routing\`, PortFast mal placé, exclusions DHCP tardives, routes retour.
- Le débogage se fait **de proche en proche** : ping ta passerelle, puis le next-hop, puis la destination.

## ⚠️ Erreurs fréquentes des débutants

**1. Configurer dans l'ordre du sujet.** Les questions d'un examen ne suivent pas l'ordre logique des couches. Toi, si.

**2. Tout taper puis tester à la fin.** Quand rien ne marche, impossible de savoir quelle couche est cassée. Teste au fur et à mesure.

**3. Négliger les \`show\`.** La moitié des points de TP se gagnent en sachant PROUVER que ça marche (\`show ip route\`, \`show standby brief\`, \`show etherchannel summary\`).

**4. Paniquer devant la taille du sujet.** Une grosse architecture n'est qu'une **somme de petits chapitres** que tu maîtrises déjà un par un. Découpe, coche, avance.`,
    badge: {
      id: "badge-grand-prix-reseaux",
      name: "Grand Prix Réseaux",
      icon: "Network",
      description: "A dompté les architectures d'examen complètes : VLAN, STP, HSRP, OSPF, IPv6/OSPFv3, DHCP — tout en un.",
    },
    challenges: [
      {
        id: "res-archi-1",
        title: "Architecture 1 — PME complète",
        order: 1,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 1 — PME : VLAN + DHCP + Internet (niveau : examen classique)

**Topologie à monter dans Packet Tracer :**

| Équipement | Détail |
|---|---|
| SW1 | Fa0/1-10 → VLAN 10 « BUREAUX » ; Fa0/11-20 → VLAN 20 « INVITES » ; G0/1 → trunk vers R1 |
| R1 | G0/0 → trunk (sous-interfaces) ; G0/1 → FAI (\`203.0.113.1/30\`, FAI = \`.2\`) |

| VLAN | Réseau | Passerelle | DHCP |
|---|---|---|---|
| 10 — BUREAUX | \`192.168.10.0/24\` | \`.1\` | pool sur R1, exclure .1-.10 |
| 20 — INVITES | \`192.168.20.0/24\` | \`.1\` | pool sur R1, exclure .1-.10 |

**Questions :**

1. Sur SW1 : créez les VLAN, affectez \`Fa0/1\` (accès VLAN 10) et \`Fa0/11\` (accès VLAN 20), passez \`G0/1\` en trunk ;
2. Sur R1 : sous-interfaces \`G0/0.10\` / \`G0/0.20\` (dot1Q + IP) et activez \`G0/0\` ;
3. Sur R1 : les deux pools DHCP (\`BUREAUX\`, \`INVITES\`) avec exclusions, \`default-router\` et \`dns-server 8.8.8.8\` ;
4. Sur R1 : adressez \`G0/1\` et ajoutez la **route par défaut** vers le FAI ;
5. Vérifiez : un PC de chaque VLAN reçoit une IP, pingue l'autre VLAN et \`203.0.113.2\`.

Blocs \`! === SW1 ===\` et \`! === R1 ===\`.`,
        points: 600,
        timeLimitSec: 2400,
        starter: `! === SW1 ===
vlan 10
`,
        hints: [
          { text: "Ordre : L2 sur SW1 → sous-interfaces R1 → DHCP → G0/1 + default. C'est l'Architecture VLAN + l'Architecture DHCP + une route par défaut, bout à bout.", cost: 60 },
          { text: "📖 Correction complète :\n```\n! === SW1 ===\nvlan 10\nname BUREAUX\nvlan 20\nname INVITES\ninterface fa0/1\nswitchport mode access\nswitchport access vlan 10\ninterface fa0/11\nswitchport mode access\nswitchport access vlan 20\ninterface g0/1\nswitchport mode trunk\n! === R1 ===\ninterface g0/0.10\nencapsulation dot1Q 10\nip address 192.168.10.1 255.255.255.0\ninterface g0/0.20\nencapsulation dot1Q 20\nip address 192.168.20.1 255.255.255.0\ninterface g0/0\nno shutdown\nip dhcp excluded-address 192.168.10.1 192.168.10.10\nip dhcp excluded-address 192.168.20.1 192.168.20.10\nip dhcp pool BUREAUX\nnetwork 192.168.10.0 255.255.255.0\ndefault-router 192.168.10.1\ndns-server 8.8.8.8\nip dhcp pool INVITES\nnetwork 192.168.20.0 255.255.255.0\ndefault-router 192.168.20.1\ndns-server 8.8.8.8\ninterface g0/1\nip address 203.0.113.1 255.255.255.252\nno shutdown\nip route 0.0.0.0 0.0.0.0 203.0.113.2\n```", cost: 150 },
        ],
        answer: JSON.stringify({
          minRatio: 0.6,
          keypoints: [
            { label: "VLAN créés (10 et 20)", pattern: "vlan\\s+10[\\s\\S]*vlan\\s+20", flags: "i" },
            { label: "Port en accès VLAN 10", pattern: "switchport\\s+access\\s+vlan\\s+10", flags: "i" },
            { label: "Trunk vers R1", pattern: "switchport\\s+mode\\s+trunk", flags: "i" },
            { label: "Sous-interface dot1Q 10 + passerelle", pattern: "encapsulation\\s+dot1q\\s+10[\\s\\S]{0,80}ip\\s+address\\s+192\\.168\\.10\\.1", flags: "i" },
            { label: "Sous-interface dot1Q 20 + passerelle", pattern: "encapsulation\\s+dot1q\\s+20[\\s\\S]{0,80}ip\\s+address\\s+192\\.168\\.20\\.1", flags: "i" },
            { label: "Exclusions DHCP des deux VLAN", pattern: "excluded-address\\s+192\\.168\\.10\\.1\\s+192\\.168\\.10\\.10", flags: "i" },
            { label: "Pool BUREAUX complet", pattern: "ip\\s+dhcp\\s+pool\\s+BUREAUX", flags: "i" },
            { label: "Pool INVITES avec sa passerelle", pattern: "default-router\\s+192\\.168\\.20\\.1", flags: "i" },
            { label: "DNS annoncé", pattern: "dns-server\\s+8\\.8\\.8\\.8", flags: "i" },
            { label: "Adresse WAN de R1", pattern: "ip\\s+address\\s+203\\.0\\.113\\.1\\s+255\\.255\\.255\\.252", flags: "i" },
            { label: "Route par défaut vers le FAI", pattern: "ip\\s+route\\s+0\\.0\\.0\\.0\\s+0\\.0\\.0\\.0\\s+203\\.0\\.113\\.2", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

**Étape 1 — L2 (SW1) :**
\`\`\`
vlan 10
 name BUREAUX
vlan 20
 name INVITES
interface fa0/1
 switchport mode access
 switchport access vlan 10
interface fa0/11
 switchport mode access
 switchport access vlan 20
interface g0/1
 switchport mode trunk
\`\`\`

**Étape 2 — L3 (R1, router-on-a-stick) :**
\`\`\`
interface g0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface g0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
interface g0/0
 no shutdown
\`\`\`

**Étape 3 — Services (DHCP) :**
\`\`\`
ip dhcp excluded-address 192.168.10.1 192.168.10.10
ip dhcp excluded-address 192.168.20.1 192.168.20.10
ip dhcp pool BUREAUX
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 8.8.8.8
ip dhcp pool INVITES
 network 192.168.20.0 255.255.255.0
 default-router 192.168.20.1
 dns-server 8.8.8.8
\`\`\`

**Étape 4 — Sortie Internet :**
\`\`\`
interface g0/1
 ip address 203.0.113.1 255.255.255.252
 no shutdown
ip route 0.0.0.0 0.0.0.0 203.0.113.2
\`\`\`

**Pourquoi cet ordre ?** Sans le trunk (ét. 1), les Discover DHCP n'atteignent jamais R1. Sans les sous-interfaces (ét. 2), R1 ne sait pas répondre par VLAN — c'est l'interface d'arrivée qui sélectionne le pool. Les exclusions **avant** les pools, sinon .1 peut partir chez un PC. **Vérifications :** \`show vlan brief\`, \`show ip dhcp binding\`, \`ipconfig /renew\` sur un PC, ping inter-VLAN puis ping 203.0.113.2. 🎯`,
        tags: ["examen", "vlan", "dhcp", "router-on-a-stick", "architecture"],
      },
      {
        id: "res-archi-2",
        title: "Architecture 2 — Campus redondant",
        order: 2,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 2 — Campus : EtherChannel + RSTP + HSRP + OSPF (niveau : examen avancé)

Un cœur de campus **sans point de panne unique** : double switch, double routeur, double lien.

**Topologie à monter dans Packet Tracer :**

| Élément | Détail |
|---|---|
| SW1 ↔ SW2 | 2 liens \`Fa0/1-2\` → **EtherChannel LACP** (Port-Channel 1, trunk) |
| SW1, SW2 | mode **Rapid PVST+** ; SW1 = racine (\`root primary\`) |
| R1, R2 | tous deux sur le LAN \`192.168.1.0/24\` : R1 = \`.2\`, R2 = \`.3\` |
| HSRP groupe 1 | IP virtuelle \`.254\` — R1 Actif (prio 110 + preempt) |
| R1 ↔ R2 (lien dorsal) | \`10.0.12.0/30\` — R1 = \`.1\`, R2 = \`.2\` |
| OSPF 1, area 0 | sur les deux routeurs : LAN + lien dorsal |

**Questions :**

1. Sur SW1/SW2 : EtherChannel **LACP actif** sur Fa0/1-2, Port-Channel en trunk ;
2. Sur SW1/SW2 : \`spanning-tree mode rapid-pvst\` ; SW1 → \`root primary\` ;
3. Sur R1/R2 : adresses réelles + **HSRP groupe 1** (VIP .254, R1 prioritaire avec preempt) ;
4. Sur R1/R2 : **OSPF 1 area 0** — annoncez le LAN (\`0.0.0.255\`) et le lien dorsal (\`0.0.0.3\`) ;
5. Vérifiez : \`show etherchannel summary\` (SU), \`show standby brief\` (R1 Active), \`show ip ospf neighbor\` (FULL).

Blocs \`! === SW1 ===\`, \`! === SW2 ===\`, \`! === R1 ===\`, \`! === R2 ===\`.`,
        points: 700,
        timeLimitSec: 2700,
        starter: `! === SW1 ===
spanning-tree mode rapid-pvst
`,
        hints: [
          { text: "Quatre blocs indépendants : (1) LACP+trunk sur les 2 switches, (2) rapid-pvst + root primary, (3) HSRP comme l'Archi du module FHRP, (4) OSPF comme le triangle mais à 2 routeurs.", cost: 70 },
          { text: "📖 Correction complète :\n```\n! === SW1 ===\nspanning-tree mode rapid-pvst\nspanning-tree vlan 1 root primary\ninterface range fa0/1 - 2\nchannel-group 1 mode active\ninterface port-channel 1\nswitchport mode trunk\n! === SW2 ===\nspanning-tree mode rapid-pvst\ninterface range fa0/1 - 2\nchannel-group 1 mode active\ninterface port-channel 1\nswitchport mode trunk\n! === R1 ===\ninterface g0/0\nip address 192.168.1.2 255.255.255.0\nstandby 1 ip 192.168.1.254\nstandby 1 priority 110\nstandby 1 preempt\nno shutdown\ninterface g0/1\nip address 10.0.12.1 255.255.255.252\nno shutdown\nrouter ospf 1\nrouter-id 1.1.1.1\nnetwork 192.168.1.0 0.0.0.255 area 0\nnetwork 10.0.12.0 0.0.0.3 area 0\n! === R2 ===\ninterface g0/0\nip address 192.168.1.3 255.255.255.0\nstandby 1 ip 192.168.1.254\nno shutdown\ninterface g0/1\nip address 10.0.12.2 255.255.255.252\nno shutdown\nrouter ospf 1\nrouter-id 2.2.2.2\nnetwork 192.168.1.0 0.0.0.255 area 0\nnetwork 10.0.12.0 0.0.0.3 area 0\n```", cost: 170 },
        ],
        answer: JSON.stringify({
          minRatio: 0.6,
          keypoints: [
            { label: "Rapid PVST+ activé", pattern: "spanning-tree\\s+mode\\s+rapid-pvst", flags: "i" },
            { label: "SW1 racine (root primary)", pattern: "spanning-tree\\s+vlan\\s+1\\s+root\\s+primary", flags: "i" },
            { label: "EtherChannel LACP actif", pattern: "channel-group\\s+1\\s+mode\\s+active", flags: "i" },
            { label: "Port-Channel en trunk", pattern: "interface\\s+port-channel\\s*1[\\s\\S]{0,60}switchport\\s+mode\\s+trunk", flags: "i" },
            { label: "HSRP : IP virtuelle .254", pattern: "standby\\s+1\\s+ip\\s+192\\.168\\.1\\.254", flags: "i" },
            { label: "HSRP : R1 prioritaire", pattern: "standby\\s+1\\s+priority\\s+110", flags: "i" },
            { label: "HSRP : preempt", pattern: "standby\\s+1\\s+preempt", flags: "i" },
            { label: "OSPF : LAN annoncé (wildcard /24)", pattern: "network\\s+192\\.168\\.1\\.0\\s+0\\.0\\.0\\.255\\s+area\\s+0", flags: "i" },
            { label: "OSPF : lien dorsal annoncé (wildcard /30)", pattern: "network\\s+10\\.0\\.12\\.0\\s+0\\.0\\.0\\.3\\s+area\\s+0", flags: "i" },
            { label: "Adresses réelles des 2 routeurs", pattern: "ip\\s+address\\s+192\\.168\\.1\\.[23]\\s+255\\.255\\.255\\.0", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

**Étape 1 — L2 : l'agrégat et l'arbre**
\`\`\`
! === SW1 ===
spanning-tree mode rapid-pvst
spanning-tree vlan 1 root primary      ! racine CHOISIE, pas subie
interface range fa0/1 - 2
 channel-group 1 mode active           ! LACP
interface port-channel 1
 switchport mode trunk
! === SW2 ===  (idem sans root primary)
spanning-tree mode rapid-pvst
interface range fa0/1 - 2
 channel-group 1 mode active
interface port-channel 1
 switchport mode trunk
\`\`\`

**Étape 2 — passerelle haute dispo (HSRP)**
\`\`\`
! === R1 ===
interface g0/0
 ip address 192.168.1.2 255.255.255.0
 standby 1 ip 192.168.1.254
 standby 1 priority 110
 standby 1 preempt
 no shutdown
! === R2 ===
interface g0/0
 ip address 192.168.1.3 255.255.255.0
 standby 1 ip 192.168.1.254
 no shutdown
\`\`\`

**Étape 3 — routage dynamique (OSPF)**
\`\`\`
! sur les DEUX routeurs (router-id 1.1.1.1 / 2.2.2.2) :
interface g0/1
 ip address 10.0.12.x 255.255.255.252
 no shutdown
router ospf 1
 network 192.168.1.0 0.0.0.255 area 0
 network 10.0.12.0 0.0.0.3 area 0
\`\`\`

**La logique d'ensemble :** chaque brique élimine UN point de panne — l'EtherChannel (un câble peut mourir), RSTP (reconvergence < 1 s si un lien tombe), HSRP (un routeur peut mourir, la VIP .254 survit), OSPF (les routes se recalculent seules). C'est le design « **redondance à tous les étages** » d'un vrai campus.

**Test de résilience dans PT :** ping continu depuis un PC → débranche un câble de l'EtherChannel (rien ne se passe ✔), éteins R1 (le ping reprend ~10 s après, R2 Active ✔). 🎯`,
        tags: ["examen", "etherchannel", "rstp", "hsrp", "ospf", "architecture"],
      },
      {
        id: "res-archi-3",
        title: "Architecture 3 — Sujet d'examen type (IPv6)",
        order: 3,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 3 — Sujet type M1 : IPv6 + OSPFv3 + RSTP + EtherChannel + PortFast (niveau : expert)

Le format exact d'un **sujet d'examen de TP** universitaire. Lis tout, configure par couches.

**Topologie à monter dans Packet Tracer :**

| Élément | Détail |
|---|---|
| R1 ↔ R2 | lien \`2001:db8:acad:12::/64\` — R1 = \`::1\`, R2 = \`::2\` |
| R1 (G0/0) | LAN 1 \`2001:db8:acad:1::/64\` (= \`::1\`) — switches S1, S2 |
| R2 (G0/0) | LAN 2 \`2001:db8:acad:2::/64\` (= \`::1\`) — switches S3, S4, S5 |
| R2 (S0/0/0) | vers FAI Internet : next-hop \`2001:db8:feed::2\` |
| S1 ↔ S2 | 2 liens \`Fa0/20-21\` à agréger en **EtherChannel LACP** |
| S2 Fa0/1 | **Serveur0** — doit s'activer immédiatement au branchement |

**Questions (comme à l'examen) :**

1. Configurez l'**adressage IPv6** selon l'architecture du réseau (n'oubliez pas d'activer le routage IPv6 !) ;
2. Configurez le **routage OSPFv3** (processus 1, router-id \`1.1.1.1\` / \`2.2.2.2\`, area 0 sur toutes les interfaces) ;
3. Configurez le **mode rapide du protocole STP** sur les switches S3, S4 et S5 ;
4. Configurez l'**EtherChannel** sur S1 et S2 pour les ports \`Fa0/20-21\` (LACP actif) ;
5. Configurez le port \`Fa0/1\` de S2 pour qu'il **s'active immédiatement** au branchement du Serveur0 ;
6. Configurez le **routage par défaut** (IPv6) sur R2 pour l'accès à Internet.

Blocs \`! === R1 ===\`, \`! === R2 ===\`, \`! === S1 ===\`, \`! === S2 ===\`, \`! === S3/S4/S5 ===\`.`,
        points: 800,
        timeLimitSec: 3600,
        starter: `! === R1 ===
ipv6 unicast-routing
`,
        hints: [
          { text: "OSPFv3 : ipv6 router ospf 1 + router-id (global), puis ipv6 ospf 1 area 0 SUR CHAQUE interface (pas de network !). Q5 = PortFast. Q6 = ipv6 route ::/0 …", cost: 80 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\nipv6 unicast-routing\nipv6 router ospf 1\nrouter-id 1.1.1.1\ninterface g0/0\nipv6 address 2001:db8:acad:1::1/64\nipv6 ospf 1 area 0\nno shutdown\ninterface g0/1\nipv6 address 2001:db8:acad:12::1/64\nipv6 ospf 1 area 0\nno shutdown\n! === R2 ===\nipv6 unicast-routing\nipv6 router ospf 1\nrouter-id 2.2.2.2\ninterface g0/0\nipv6 address 2001:db8:acad:2::1/64\nipv6 ospf 1 area 0\nno shutdown\ninterface g0/1\nipv6 address 2001:db8:acad:12::2/64\nipv6 ospf 1 area 0\nno shutdown\nipv6 route ::/0 2001:db8:feed::2\n! === S1 ===\ninterface range fa0/20 - 21\nchannel-group 1 mode active\n! === S2 ===\ninterface range fa0/20 - 21\nchannel-group 1 mode active\ninterface fa0/1\nswitchport mode access\nspanning-tree portfast\n! === S3/S4/S5 ===\nspanning-tree mode rapid-pvst\n```", cost: 200 },
        ],
        answer: JSON.stringify({
          minRatio: 0.6,
          keypoints: [
            { label: "Q1 : routage IPv6 activé", pattern: "ipv6\\s+unicast-routing", flags: "i" },
            { label: "Q1 : LAN 1 adressé", pattern: "ipv6\\s+address\\s+2001:db8:acad:1::1/64", flags: "i" },
            { label: "Q1 : lien inter-routeurs adressé", pattern: "ipv6\\s+address\\s+2001:db8:acad:12::[12]/64", flags: "i" },
            { label: "Q1 : LAN 2 adressé", pattern: "ipv6\\s+address\\s+2001:db8:acad:2::1/64", flags: "i" },
            { label: "Q2 : processus OSPFv3 + router-id", pattern: "ipv6\\s+router\\s+ospf\\s+1[\\s\\S]{0,40}router-id\\s+[12]\\.[12]\\.[12]\\.[12]", flags: "i" },
            { label: "Q2 : OSPFv3 activé sur les interfaces", pattern: "ipv6\\s+ospf\\s+1\\s+area\\s+0", flags: "i" },
            { label: "Q3 : Rapid STP sur S3/S4/S5", pattern: "spanning-tree\\s+mode\\s+rapid-pvst", flags: "i" },
            { label: "Q4 : EtherChannel LACP Fa0/20-21", pattern: "interface\\s+range\\s+fa0/20\\s*-\\s*2?1[\\s\\S]{0,60}channel-group\\s+1\\s+mode\\s+active", flags: "i" },
            { label: "Q5 : PortFast sur le port du serveur", pattern: "spanning-tree\\s+portfast", flags: "i" },
            { label: "Q6 : route par défaut IPv6 vers le FAI", pattern: "ipv6\\s+route\\s+::/0\\s+2001:db8:feed::2", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée (question par question)

**Q1 — Adressage IPv6** *(sans \`ipv6 unicast-routing\`, rien ne route et OSPFv3 refuse même de démarrer)* :
\`\`\`
! === R1 ===
ipv6 unicast-routing
interface g0/0
 ipv6 address 2001:db8:acad:1::1/64
 no shutdown
interface g0/1
 ipv6 address 2001:db8:acad:12::1/64
 no shutdown
! === R2 ===  (miroir : acad:2::1 et acad:12::2)
\`\`\`

**Q2 — OSPFv3** — grande différence avec OSPFv2 : **pas de commande \`network\`** ! Le processus se déclare en global (avec un router-id **obligatoire**, au format IPv4), puis on active OSPF **interface par interface** :
\`\`\`
ipv6 router ospf 1
 router-id 1.1.1.1        ! (2.2.2.2 sur R2)
interface g0/0
 ipv6 ospf 1 area 0
interface g0/1
 ipv6 ospf 1 area 0
\`\`\`

**Q3 — Rapid STP** (convergence < 1 s au lieu de 30-50 s) :
\`\`\`
! === S3, S4 et S5 ===
spanning-tree mode rapid-pvst
\`\`\`

**Q4 — EtherChannel LACP** (les DEUX switches, modes compatibles \`active/active\`) :
\`\`\`
! === S1 et S2 ===
interface range fa0/20 - 21
 channel-group 1 mode active
\`\`\`

**Q5 — PortFast** : « s'active immédiatement au branchement » = sauter les états d'écoute STP. Réservé aux **ports d'accès** (PC/serveur), jamais entre switches :
\`\`\`
! === S2 ===
interface fa0/1
 switchport mode access
 spanning-tree portfast
\`\`\`

**Q6 — Route par défaut IPv6** (\`::/0\` est l'équivalent de \`0.0.0.0/0\`) :
\`\`\`
! === R2 ===
ipv6 route ::/0 2001:db8:feed::2
\`\`\`
Bonus pro : dans \`ipv6 router ospf 1\`, ajouter \`default-information originate\` pour que R1 apprenne cette default via OSPFv3 au lieu de la configurer à la main.

**Vérifications finales :** \`show ipv6 route\` (O + S ::/0), \`show ipv6 ospf neighbor\` (FULL), \`show etherchannel summary\` (SU), \`show spanning-tree summary\` (rapid-pvst). Si tu sais faire ce sujet en autonomie, tu es prêt pour l'examen. 🏆`,
        tags: ["examen", "ipv6", "ospfv3", "rstp", "etherchannel", "portfast", "architecture"],
      },
    ],
  },
];
