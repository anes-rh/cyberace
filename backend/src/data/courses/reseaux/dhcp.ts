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
    ],
  },
];
