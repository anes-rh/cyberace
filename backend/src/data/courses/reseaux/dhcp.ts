import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 16 : DHCP (DORA, config, relais). */
export const dhcp: CourseSeed[] = [
  {
    slug: "res-dhcp",
    title: "DHCP — attribution automatique d'adresses",
    checkpoint: "reseaux",
    codename: "Auto Lease",
    domain: "Réseaux — Services",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 17,
    difficulty: "medium",
    summary:
      "Configurer 500 postes à la main ? Impensable. DHCP attribue automatiquement adresse IP, masque, passerelle et DNS. Le processus DORA, le bail, la configuration d'un pool sur un routeur, les exclusions, et le relais DHCP quand le serveur est sur un autre réseau.",
    objectives: [
      "Expliquer le rôle de DHCP et ce qu'il fournit (IP, masque, passerelle, DNS)",
      "Décrire le processus DORA (Discover, Offer, Request, Ack) et les messages broadcast",
      "Comprendre la notion de bail (lease) et sa durée",
      "Configurer un pool DHCP sur un routeur Cisco et exclure des adresses",
      "Comprendre pourquoi et comment configurer un relais DHCP (ip helper-address)",
    ],
    resources: [
      {
        label: "Architecture 1 — topologie de départ (.pka)",
        url: "/pka/res-dhcp-architecture-1.pka",
        kind: "pkt-start",
        note: "À ouvrir dans Cisco Packet Tracer : R1 relié à un switch, deux PC et un serveur, non configurés. Configure le service DHCP (pool, exclusions, passerelle, DNS) selon l'Architecture 1.",
      },
    ],
    lesson: `# 🎟️ DHCP — l'Auto Lease

Imagine configurer **à la main** l'IP, le masque, la passerelle et le DNS sur **500 postes**… puis tout refaire quand le plan d'adressage change. Cauchemar ! Le **DHCP** (*Dynamic Host Configuration Protocol*) fait ça **automatiquement**, en quelques millisecondes, à chaque démarrage d'une machine. 🏎️

> 📎 Prérequis : adressage IPv4 (IP/masque/passerelle), broadcast, notion de serveur.

---

## 1. Ce que DHCP fournit 📦

Quand un hôte rejoint le réseau, le serveur DHCP lui **loue** une configuration complète :
- une **adresse IP** (dans une plage définie) ;
- le **masque de sous-réseau** ;
- la **passerelle par défaut** (default gateway) ;
- les **serveurs DNS** ;
- éventuellement : nom de domaine, serveur NTP, etc.

> 🎯 Avantage : **zéro configuration manuelle** côté client, **pas de conflit** d'adresses, changement de plan **centralisé** sur le serveur.

---

## 2. Le processus DORA 🔄

L'attribution suit **4 messages** — moyen mnémotechnique : **D-O-R-A** :

\`\`\`
 CLIENT (sans IP)                          SERVEUR DHCP
     │                                          │
     │  1. DHCPDISCOVER  (broadcast)            │   « Y a-t-il un serveur DHCP ? »
     │─────────────────────────────────────────►
     │                                          │
     │  2. DHCPOFFER     (propose une IP)       │   « Voici l'IP 192.168.1.50 »
     │◄─────────────────────────────────────────
     │                                          │
     │  3. DHCPREQUEST   (broadcast)            │   « J'accepte cette offre »
     │─────────────────────────────────────────►
     │                                          │
     │  4. DHCPACK       (confirme le bail)     │   « C'est à toi, bail = 24 h »
     │◄─────────────────────────────────────────
\`\`\`

- **Discover** et **Request** partent en **broadcast** (le client n'a pas encore d'IP / veut informer tout le monde).
- **Offer** et **Ack** viennent du serveur.
- S'il existe **plusieurs serveurs**, le client accepte **une seule** offre ; les autres reprennent leurs adresses.

---

## 3. Le bail (lease) ⏳

L'adresse est **louée**, pas donnée pour toujours : c'est le **bail**. Avant l'expiration, le client **renouvelle** (DHCPREQUEST directement au serveur, sans repasser par Discover). S'il ne renouvelle pas, l'adresse **retourne dans le pool** et peut être réattribuée.

> ⏱️ Un bail court = adresses recyclées vite (utile en Wi-Fi public) ; un bail long = moins de trafic DHCP.

---

## 4. DHCPv4 sur un routeur Cisco 🖥️

Un routeur peut jouer le **serveur DHCP** pour son LAN :

\`\`\`
! 1) Exclure les adresses fixes (passerelle, serveurs, imprimantes…)
R1(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10

! 2) Définir le pool
R1(config)# ip dhcp pool LAN_ADMIN
R1(dhcp-config)# network 192.168.1.0 255.255.255.0   ! plage distribuée
R1(dhcp-config)# default-router 192.168.1.1          ! passerelle
R1(dhcp-config)# dns-server 8.8.8.8                  ! DNS
R1(dhcp-config)# domain-name cyberace.lan            ! (optionnel)
R1(dhcp-config)# lease 2                             ! bail de 2 jours
\`\`\`

⚠️ **Toujours exclure** la passerelle et les adresses statiques **avant** que le pool ne les distribue, sinon **conflit**. Vérification : \`show ip dhcp binding\` (baux actifs), \`show ip dhcp pool\`.

---

## 5. Le relais DHCP : \`ip helper-address\` 📡

Problème : le **DHCPDISCOVER** est un **broadcast**, et un **routeur ne transmet pas les broadcasts**. Si le serveur DHCP est sur un **autre réseau**, les clients ne le joignent jamais.

**Solution — le relais DHCP** : sur l'interface du routeur **côté clients**, on ajoute \`ip helper-address <IP_du_serveur>\`. Le routeur **transforme** le broadcast en **unicast** vers le serveur :

\`\`\`
 [PC] --broadcast--> [R1 interface LAN]
                       │  ip helper-address 10.0.0.5
                       ▼ unicast
                    [Serveur DHCP 10.0.0.5 sur un autre réseau]
\`\`\`

\`\`\`
R1(config)# interface g0/0            ! interface CÔTÉ CLIENTS
R1(config-if)# ip helper-address 10.0.0.5
\`\`\`

Ainsi **un seul serveur** DHCP central peut servir **plusieurs sous-réseaux**.

---

## 🧠 Ce qu'il faut retenir

- **DHCP** fournit automatiquement **IP + masque + passerelle + DNS** → plus de config manuelle, pas de conflit.
- Processus **DORA** : **Discover** (broadcast client) → **Offer** (serveur) → **Request** (broadcast client) → **Ack** (serveur confirme le bail).
- L'adresse est un **bail** (lease) : temporaire, **renouvelable**, sinon recyclée dans le pool.
- Config routeur : \`ip dhcp excluded-address\` **puis** \`ip dhcp pool\` avec \`network\`, \`default-router\`, \`dns-server\`, \`lease\`.
- **Toujours exclure** passerelle et adresses statiques.
- **Relais DHCP** (\`ip helper-address\`) : indispensable quand le serveur est sur **un autre réseau** (le routeur ne relaie pas les broadcasts sinon).

## ⚠️ Erreurs fréquentes des débutants

**1. Oublier d'exclure la passerelle.** Sans \`ip dhcp excluded-address\`, le pool peut **attribuer l'IP de la passerelle** à un PC → **conflit** et panne réseau.

**2. Croire qu'un routeur relaie le broadcast DHCP.** Non : un routeur **bloque les broadcasts**. Si le serveur est ailleurs, il **faut** \`ip helper-address\`.

**3. Mettre \`ip helper-address\` du mauvais côté.** Il se place sur l'interface **côté clients** (celle qui reçoit le Discover), pointant vers l'IP du **serveur**.

**4. Confondre l'ordre DORA.** C'est **D**iscover → **O**ffer → **R**equest → **A**ck. Le client **redemande** (Request) même l'adresse qu'on vient de lui offrir, pour officialiser le choix.

**5. Penser que l'adresse est permanente.** C'est un **bail** : si le client ne renouvelle pas, l'adresse **repart dans le pool**. D'où l'importance de bien dimensionner la durée.`,
    videos: [
      {
        title: "DHCP expliqué — le processus DORA en pratique",
        youtubeId: "ysW0bkT0kKk",
      },
    ],
    badge: {
      id: "badge-auto-lease",
      name: "Auto Lease",
      icon: "Network",
      description: "Maîtrise DHCP : processus DORA, configuration d'un pool et relais ip helper-address.",
    },
    challenges: [
      {
        id: "res-dhcp-fournit",
        title: "Que fournit DHCP ?",
        order: 1,
        difficulty: "easy",
        type: "multi",
        prompt: `## 📦 Le contenu d'un bail

Coche **tous** les paramètres qu'un serveur **DHCP** peut fournir à un client :`,
        points: 150,
        timeLimitSec: 300,
        options: [
          "L'adresse IP",
          "Le masque de sous-réseau",
          "La passerelle par défaut",
          "L'adresse MAC de la carte réseau",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "La MAC est gravée dans la carte : DHCP ne l'attribue pas.", cost: 15 },
          { text: "📖 Correction complète : IP + masque + passerelle (+ DNS). Pas la MAC.", cost: 40 },
        ],
        explanation: `DHCP fournit une **configuration IP complète** : **adresse IP**, **masque**, **passerelle par défaut**, **DNS** (et options : nom de domaine, NTP…). L'**adresse MAC**, elle, est **physiquement gravée** dans la carte réseau — DHCP ne l'attribue pas, il s'en sert au contraire pour **identifier** le client.`,
        tags: ["dhcp", "bail", "configuration"],
      },
      {
        id: "res-dhcp-dora",
        title: "L'ordre du processus DORA",
        order: 2,
        difficulty: "medium",
        type: "order",
        prompt: `## 🔄 Remets DORA dans l'ordre

Classe les **4 messages** DHCP dans l'ordre chronologique d'un premier bail :`,
        points: 250,
        timeLimitSec: 360,
        options: [
          "DHCPDISCOVER (le client cherche un serveur)",
          "DHCPOFFER (le serveur propose une adresse)",
          "DHCPREQUEST (le client accepte l'offre)",
          "DHCPACK (le serveur confirme le bail)",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "Moyen mnémotechnique : D-O-R-A.", cost: 25 },
          { text: "📖 Correction complète : Discover → Offer → Request → Ack.", cost: 60 },
        ],
        explanation: `**DORA** : **D**iscover (le client, sans IP, cherche un serveur en **broadcast**) → **O**ffer (le serveur **propose** une adresse) → **R**equest (le client **accepte** officiellement, en broadcast) → **A**ck (le serveur **confirme** le bail). Le Request en broadcast informe aussi les **autres** serveurs que leur offre est déclinée.`,
        tags: ["dhcp", "dora", "processus"],
      },
      {
        id: "res-dhcp-exclude",
        title: "Pourquoi exclure des adresses ?",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚫 ip dhcp excluded-address

Pourquoi configure-t-on \`ip dhcp excluded-address\` **avant** de créer le pool DHCP ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "La passerelle et les serveurs ont des IP fixes dans la même plage. Que se passe-t-il si DHCP les distribue ?", cost: 20 },
          { text: "📖 Correction complète : pour ne pas attribuer à un client une IP déjà utilisée en statique (passerelle, serveurs) → éviter les conflits.", cost: 50 },
        ],
        options: [
          "Pour empêcher DHCP d'attribuer des IP déjà utilisées en statique (passerelle, serveurs) et éviter les conflits",
          "Pour accélérer le processus DORA",
          "Parce que DHCP refuse de démarrer sans exclusion",
          "Pour chiffrer les adresses distribuées",
        ],
        answer: 0,
        explanation: `Certaines adresses de la plage sont déjà **fixes** : la **passerelle**, les **serveurs**, les **imprimantes**. Si le pool DHCP les distribue à un PC, on obtient un **conflit d'adresses** (deux machines, même IP) → pannes. \`ip dhcp excluded-address\` **réserve** ces adresses pour qu'elles ne soient **jamais** attribuées dynamiquement.`,
        tags: ["dhcp", "exclusion", "conflit"],
      },
      {
        id: "res-dhcp-relais",
        title: "Serveur DHCP sur un autre réseau",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 📡 Le broadcast bloqué

Les PC du VLAN 10 n'obtiennent aucune adresse : le serveur DHCP est sur un **autre sous-réseau**, derrière le routeur. Quelle est la cause et la solution ?`,
        points: 350,
        timeLimitSec: 480,
        hints: [
          { text: "Le DHCPDISCOVER est un broadcast. Un routeur transmet-il les broadcasts ?", cost: 35 },
          { text: "📖 Correction complète : le routeur bloque le broadcast ; il faut ip helper-address côté clients, pointant vers le serveur.", cost: 80 },
        ],
        options: [
          "Le routeur bloque le broadcast DHCPDISCOVER ; il faut un relais : ip helper-address <IP serveur> sur l'interface côté clients",
          "Le serveur DHCP est en panne, il n'y a rien à configurer sur le routeur",
          "Il faut désactiver le DNS sur les PC",
          "Le VLAN 10 doit être supprimé",
        ],
        answer: 0,
        explanation: `Le **DHCPDISCOVER** est un **broadcast**, et un **routeur ne transmet pas les broadcasts**. Quand le serveur est sur un **autre réseau**, on configure un **relais DHCP** : \`ip helper-address <IP_serveur>\` sur l'interface (ou SVI) **côté clients**. Le routeur convertit alors le broadcast en **unicast** vers le serveur, qui peut ainsi servir **plusieurs sous-réseaux**.`,
        tags: ["dhcp", "relais", "helper-address", "broadcast"],
      },
      {
        id: "res-dhcp-config",
        title: "Configurer un pool DHCP",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🖥️ Config Cisco

Sur R1, exclus la plage \`192.168.10.1\` à \`192.168.10.10\`, puis crée un pool nommé **LAN10** distribuant le réseau \`192.168.10.0/24\`, avec passerelle \`192.168.10.1\` et DNS \`8.8.8.8\`.`,
        points: 350,
        timeLimitSec: 600,
        starter: `! commence par l'exclusion
`,
        hints: [
          { text: "ip dhcp excluded-address (plage), puis ip dhcp pool LAN10, network, default-router, dns-server.", cost: 35 },
          { text: "📖 Correction complète :\n```\nip dhcp excluded-address 192.168.10.1 192.168.10.10\nip dhcp pool LAN10\n network 192.168.10.0 255.255.255.0\n default-router 192.168.10.1\n dns-server 8.8.8.8\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Exclut la plage réservée", pattern: "ip\\s+dhcp\\s+excluded-address\\s+192\\.168\\.10\\.1\\s+192\\.168\\.10\\.10", flags: "i" },
            { label: "Crée le pool LAN10", pattern: "ip\\s+dhcp\\s+pool\\s+LAN10", flags: "i" },
            { label: "Définit le réseau distribué", pattern: "network\\s+192\\.168\\.10\\.0\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "Définit la passerelle", pattern: "default-router\\s+192\\.168\\.10\\.1", flags: "i" },
            { label: "Définit le DNS", pattern: "dns-server\\s+8\\.8\\.8\\.8", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
ip dhcp excluded-address 192.168.10.1 192.168.10.10   ! réserve passerelle + serveurs
ip dhcp pool LAN10
 network 192.168.10.0 255.255.255.0                   ! plage distribuée
 default-router 192.168.10.1                          ! passerelle annoncée aux clients
 dns-server 8.8.8.8
\`\`\`

L'**exclusion vient en premier** (mode global), **puis** le pool. Le \`default-router\` doit correspondre à l'**IP de l'interface** du routeur sur ce LAN. Vérifie avec \`show ip dhcp binding\` (baux attribués) et \`show ip dhcp pool\`.`,
        tags: ["dhcp", "config", "cisco", "pool"],
      },
      {
        id: "res-tp-dhcp",
        title: "Architecture 1 — VLAN + DHCP + relais",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 1 (niveau : expert)

Le TP le plus complet du module — il combine **router-on-a-stick**, **serveur DHCP** et **relais DHCP**.

**Topologie à monter dans Packet Tracer :**

| VLAN | Réseau | Qui distribue les adresses ? |
|---|---|---|
| 10 — BUREAUX | \`192.168.10.0/24\` | **R1** (pool local) |
| 20 — WIFI | \`192.168.20.0/24\` | **R1** (pool local) |
| 30 — PROD | \`192.168.30.0/24\` | **Serveur central** \`192.168.99.5\` (via relais !) |

SW1 relie les 3 VLAN à R1 par un **trunk 802.1Q** sur G0/0.

**Questions — tout sur R1 :**

1. Créez les trois **sous-interfaces** \`G0/0.10/.20/.30\` (dot1Q + passerelle \`.1\` de chaque VLAN), et activez \`G0/0\` ;
2. **Excluez** \`.1\` à \`.10\` des VLAN 10 et 20 ;
3. Créez les deux **pools** \`VLAN10\` et \`VLAN20\` : \`network\`, \`default-router\`, \`dns-server 8.8.8.8\` ;
4. Le VLAN 30 est servi par le **serveur central** → configurez le **relais** sur \`G0/0.30\`.`,
        points: 600,
        timeLimitSec: 1800,
        starter: `! === R1 ===
interface g0/0.10
`,
        hints: [
          { text: "Sous-interfaces : encapsulation dot1Q <n° VLAN> puis ip address. Pools : ip dhcp pool VLAN10 → network/default-router/dns-server. Le relais : ip helper-address 192.168.99.5 sur g0/0.30 (côté clients !).", cost: 60 },
          { text: "📖 Correction complète :\n```\ninterface g0/0.10\nencapsulation dot1Q 10\nip address 192.168.10.1 255.255.255.0\ninterface g0/0.20\nencapsulation dot1Q 20\nip address 192.168.20.1 255.255.255.0\ninterface g0/0.30\nencapsulation dot1Q 30\nip address 192.168.30.1 255.255.255.0\nip helper-address 192.168.99.5\ninterface g0/0\nno shutdown\nip dhcp excluded-address 192.168.10.1 192.168.10.10\nip dhcp excluded-address 192.168.20.1 192.168.20.10\nip dhcp pool VLAN10\nnetwork 192.168.10.0 255.255.255.0\ndefault-router 192.168.10.1\ndns-server 8.8.8.8\nip dhcp pool VLAN20\nnetwork 192.168.20.0 255.255.255.0\ndefault-router 192.168.20.1\ndns-server 8.8.8.8\n```", cost: 140 },
        ],
        answer: JSON.stringify({
          minRatio: 0.6,
          keypoints: [
            { label: "Sous-interface taguée VLAN 10", pattern: "encapsulation\\s+dot1q\\s+10", flags: "i" },
            { label: "Passerelle du VLAN 10", pattern: "ip\\s+address\\s+192\\.168\\.10\\.1\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "Sous-interface taguée VLAN 20", pattern: "encapsulation\\s+dot1q\\s+20", flags: "i" },
            { label: "Passerelle du VLAN 20", pattern: "ip\\s+address\\s+192\\.168\\.20\\.1\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "Sous-interface taguée VLAN 30", pattern: "encapsulation\\s+dot1q\\s+30", flags: "i" },
            { label: "Relais DHCP vers le serveur central", pattern: "ip\\s+helper-address\\s+192\\.168\\.99\\.5", flags: "i" },
            { label: "Exclusion des .1-.10 du VLAN 10", pattern: "ip\\s+dhcp\\s+excluded-address\\s+192\\.168\\.10\\.1\\s+192\\.168\\.10\\.10", flags: "i" },
            { label: "Exclusion des .1-.10 du VLAN 20", pattern: "ip\\s+dhcp\\s+excluded-address\\s+192\\.168\\.20\\.1\\s+192\\.168\\.20\\.10", flags: "i" },
            { label: "Pool DHCP du VLAN 10", pattern: "ip\\s+dhcp\\s+pool\\s+VLAN10", flags: "i" },
            { label: "Réseau distribué au VLAN 10", pattern: "network\\s+192\\.168\\.10\\.0\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "Pool DHCP du VLAN 20 avec sa passerelle", pattern: "default-router\\s+192\\.168\\.20\\.1", flags: "i" },
            { label: "DNS annoncé aux clients", pattern: "dns-server\\s+8\\.8\\.8\\.8", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
interface g0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface g0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
interface g0/0.30
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
 ip helper-address 192.168.99.5     ! relais : broadcast → unicast vers le serveur
interface g0/0
 no shutdown
ip dhcp excluded-address 192.168.10.1 192.168.10.10
ip dhcp excluded-address 192.168.20.1 192.168.20.10
ip dhcp pool VLAN10
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 8.8.8.8
ip dhcp pool VLAN20
 network 192.168.20.0 255.255.255.0
 default-router 192.168.20.1
 dns-server 8.8.8.8
\`\`\`

Ce TP réunit tout : le **routage inter-VLAN** (sous-interfaces dot1Q), le **DHCP local** (R1 choisit le pool selon l'interface d'arrivée du Discover — c'est pour ça que chaque \`network\` doit correspondre au sous-réseau de la sous-interface), et le **relais** (le VLAN 30 n'a pas de pool local : son broadcast est relayé en unicast vers 192.168.99.5). C'est l'architecture réelle d'une PME. Vérifie : \`show ip dhcp binding\`, et sur un PC du VLAN 10 → \`ipconfig /renew\` doit ramener une IP entre .11 et .254, passerelle .1, DNS 8.8.8.8. 🏆`,
        tags: ["tp", "dhcp", "vlan", "relais", "config", "architecture"],
      },
      {
        id: "res-tp-dhcp-2",
        title: "Architecture 2 — Serveur DHCP centralisé multi-sites",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 2 (niveau : expert)

Le scénario inverse de l'Architecture 1 : **UN routeur-serveur central** (R2) distribue les adresses d'un LAN **distant**, situé derrière un autre routeur. Le piège du \`default-router\` t'attend. 😈

**Topologie à monter dans Packet Tracer :**

| Élément | Réseau | Détail |
|---|---|---|
| LAN clients → R1 (G0/0) | \`192.168.50.0/24\` | passerelle R1 = \`.1\` — **aucun pool ici !** |
| R1 (G0/1) ↔ R2 (G0/0) | \`10.0.0.0/30\` | R1 = \`.1\`, R2 = \`.2\` |
| R2 | — | **serveur DHCP central** |

**Questions :**

1. Sur **R1** : configurez le **relais** sur l'interface du LAN clients, pointant vers R2 ;
2. Sur **R2** : excluez \`192.168.50.1\` à \`192.168.50.9\`, puis créez le pool \`SITE50\` : \`network 192.168.50.0/24\`, \`default-router\`, \`dns-server 8.8.8.8\`, bail de 4 jours (\`lease 4\`) ;
3. ⚠️ Le \`default-router\` doit être la passerelle **du LAN distant** (l'IP de R1 !), pas une adresse de R2 ;
4. Sur **R2** : ajoutez la **route retour** vers \`192.168.50.0/24\` (sinon ses OFFER ne reviennent jamais).

Blocs \`! === R1 ===\` et \`! === R2 ===\`.`,
        points: 550,
        timeLimitSec: 1800,
        starter: `! === R1 ===
interface g0/0
`,
        hints: [
          { text: "R1 : ip helper-address 10.0.0.2 sur g0/0. R2 : le pool concerne un réseau qu'il ne porte PAS — default-router = 192.168.50.1 (l'IP de R1), + ip route 192.168.50.0 … 10.0.0.1.", cost: 55 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\ninterface g0/0\nip helper-address 10.0.0.2\n! === R2 ===\nip dhcp excluded-address 192.168.50.1 192.168.50.9\nip dhcp pool SITE50\nnetwork 192.168.50.0 255.255.255.0\ndefault-router 192.168.50.1\ndns-server 8.8.8.8\nlease 4\nip route 192.168.50.0 255.255.255.0 10.0.0.1\n```", cost: 120 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Relais sur l'interface côté clients (R1)", pattern: "ip\\s+helper-address\\s+10\\.0\\.0\\.2", flags: "i" },
            { label: "Exclusion des adresses réservées", pattern: "ip\\s+dhcp\\s+excluded-address\\s+192\\.168\\.50\\.1\\s+192\\.168\\.50\\.9", flags: "i" },
            { label: "Pool SITE50 créé", pattern: "ip\\s+dhcp\\s+pool\\s+SITE50", flags: "i" },
            { label: "Réseau distant distribué", pattern: "network\\s+192\\.168\\.50\\.0\\s+255\\.255\\.255\\.0", flags: "i" },
            { label: "default-router = la passerelle DU LAN DISTANT (R1)", pattern: "default-router\\s+192\\.168\\.50\\.1", flags: "i" },
            { label: "Bail de 4 jours", pattern: "lease\\s+4", flags: "i" },
            { label: "Route retour vers le LAN clients", pattern: "ip\\s+route\\s+192\\.168\\.50\\.0\\s+255\\.255\\.255\\.0\\s+10\\.0\\.0\\.1", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

\`\`\`
! === R1 ===  (côté clients : JUSTE le relais)
interface g0/0
 ip helper-address 10.0.0.2            ! broadcast Discover → unicast vers R2
! === R2 ===  (le serveur central)
ip dhcp excluded-address 192.168.50.1 192.168.50.9
ip dhcp pool SITE50
 network 192.168.50.0 255.255.255.0    ! un réseau que R2 ne porte PAS lui-même !
 default-router 192.168.50.1           ! ⚠️ la passerelle du LAN DISTANT = R1
 dns-server 8.8.8.8
 lease 4
ip route 192.168.50.0 255.255.255.0 10.0.0.1   ! route RETOUR indispensable
\`\`\`

**Comment R2 choisit-il le bon pool ?** Le relais R1 remplit le champ **giaddr** (*gateway address*) du paquet DHCP avec l'IP de l'interface réceptrice (192.168.50.1). R2 compare ce giaddr à ses pools → il pioche dans \`SITE50\`. C'est ce mécanisme qui permet à **un seul serveur** de servir 50 sites.

**Les deux pièges du TP :**
- \`default-router\` : les clients sont sur le site distant — leur passerelle est **R1** (192.168.50.1), pas R2. Mettre une IP de R2 = clients avec passerelle injoignable.
- La **route retour** : sans \`ip route 192.168.50.0 …\`, R2 fabrique l'OFFER… mais ne sait pas où renvoyer le paquet. Symptôme classique : « le serveur reçoit les Discover mais les PC n'ont jamais d'adresse ».

**Vérification PT :** \`show ip dhcp binding\` sur R2 (les baux du site distant y apparaissent), \`ipconfig /renew\` sur un PC → IP entre .10 et .254, passerelle .1. 🎯`,
        tags: ["tp", "dhcp", "relais", "giaddr", "architecture"],
      },
    ],
  },
];
