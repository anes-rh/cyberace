import type { CourseSeed } from "../../../types";

/** Réseaux — Chapitre 13 : tunnels GRE & VPN. */
export const greVpn: CourseSeed[] = [
  {
    slug: "res-gre-vpn",
    title: "Tunnels GRE & VPN",
    checkpoint: "reseaux",
    codename: "Tunnel Run",
    domain: "Réseaux — WAN sécurisé",
    theme: "circuit",
    icon: "Network",
    accent: "#5FB3C6",
    order: 14,
    difficulty: "medium",
    summary:
      "Relier deux sites distants à travers Internet comme s'ils étaient voisins : le tunnel GRE encapsule le trafic, le VPN le chiffre (IPsec). Encapsulation, tunnel logique, site-à-site vs accès distant, et configuration d'un tunnel GRE.",
    objectives: [
      "Comprendre le principe d'un tunnel (encapsulation dans un autre paquet)",
      "Expliquer ce qu'est GRE et ce qu'il n'apporte pas (pas de chiffrement)",
      "Distinguer VPN site-à-site et VPN accès distant",
      "Comprendre le rôle d'IPsec (confidentialité, intégrité, authentification)",
      "Configurer une interface tunnel GRE",
    ],
    lesson: `# 🚇 Tunnels GRE & VPN — le Tunnel Run

Deux sites d'une entreprise, à 500 km, reliés par… **Internet** (public, non fiable). Comment les faire dialoguer **comme s'ils étaient sur le même LAN**, et **en sécurité** ? Réponse : un **tunnel** (GRE) éventuellement **chiffré** (VPN/IPsec). 🏎️

> 📎 Prérequis : encapsulation (Intro/OSI), adressage IP, routage.

---

## 1. Le principe du tunnel : un paquet dans un paquet 🪆

Un **tunnel** **encapsule** un paquet dans un **autre** paquet pour le transporter à travers un réseau intermédiaire. Le paquet « privé » voyage caché dans un paquet « public » routable sur Internet :

\`\`\`
 Paquet original :               [ IP privée | Données ]
 Encapsulé (tunnel) :  [ IP publique | GRE | IP privée | Données ]
                        └── routé sur Internet ──┘   └── ré-extrait à l'arrivée ──┘
\`\`\`

À la sortie du tunnel, l'en-tête externe est **retiré** et le paquet original poursuit sa route. Les deux sites ont l'**illusion** d'être directement connectés.

---

## 2. GRE : le tunnel simple (mais non sécurisé) 🚿

**GRE** (*Generic Routing Encapsulation*, protocole Cisco/standard) crée un tunnel **point-à-point** entre deux routeurs. Ses atouts :
- **polyvalent** : encapsule presque tout (IP, mais aussi multicast, IPv6…) — utile car IPsec seul ne transporte pas le **multicast** (donc pas les IGP comme OSPF) ;
- **simple** à configurer.

⚠️ **GRE ne chiffre RIEN** : les données transitent **en clair**. Pour la confidentialité, on **combine** GRE **avec IPsec** (« GRE over IPsec »).

---

## 3. Le VPN : un tunnel de confiance 🔐

Un **VPN** (*Virtual Private Network*) établit un **tunnel sécurisé** sur un réseau public. Deux grandes familles :

| Type | Qui | Exemple |
|---|---|---|
| **Site-à-site** | relie deux **réseaux** (deux routeurs/pare-feu) | siège ↔ agence, en permanence |
| **Accès distant** | relie **un utilisateur** au réseau de l'entreprise | télétravailleur avec un client VPN |

La sécurité est assurée par **IPsec**, qui apporte :
- **Confidentialité** (chiffrement — on ne peut pas lire) ;
- **Intégrité** (les données n'ont pas été altérées) ;
- **Authentification** (on parle bien au bon site) ;
- **anti-rejeu** (une trame capturée ne peut être rejouée).

---

## 4. Configuration d'un tunnel GRE 🖥️

On crée une **interface virtuelle Tunnel** de chaque côté, avec une IP « privée » de tunnel, une **source** et une **destination** (les IP **publiques** réelles des routeurs) :

\`\`\`
R1(config)# interface Tunnel0
R1(config-if)# ip address 172.16.0.1 255.255.255.252   ! IP interne du tunnel
R1(config-if)# tunnel source 203.0.113.1               ! IP publique locale
R1(config-if)# tunnel destination 198.51.100.1         ! IP publique du site distant
R1(config-if)# tunnel mode gre ip
\`\`\`

Ensuite, on **route** le trafic des LAN distants **via** l'interface Tunnel0 (route statique ou IGP par-dessus le tunnel). Vérification : \`show interfaces tunnel0\`, \`ping\` de l'IP de tunnel distante.

---

## 🧠 Ce qu'il faut retenir

- Un **tunnel** **encapsule** un paquet dans un autre pour traverser un réseau intermédiaire.
- **GRE** = tunnel simple et polyvalent (transporte multicast/IGP) mais **en clair** (aucun chiffrement).
- **VPN** = tunnel **sécurisé** ; **site-à-site** (deux réseaux) vs **accès distant** (un utilisateur).
- **IPsec** apporte confidentialité, intégrité, authentification, anti-rejeu.
- On combine souvent **GRE + IPsec** (GRE pour le multicast/IGP, IPsec pour le chiffrement).
- Config GRE : interface **Tunnel**, \`tunnel source\` / \`tunnel destination\` (IP **publiques**).

## ⚠️ Erreurs fréquentes des débutants

**1. Croire que GRE chiffre.** GRE **encapsule** mais **ne sécurise pas** : le trafic est **en clair**. Pour la confidentialité, il faut **IPsec** (souvent GRE **over** IPsec).

**2. Confondre l'IP du tunnel et l'IP publique.** L'interface Tunnel a une IP **interne** (ex. 172.16.0.1) ; \`tunnel source/destination\` utilisent les IP **publiques réelles** des routeurs.

**3. Oublier de router à travers le tunnel.** Créer le tunnel ne suffit pas : il faut **diriger** le trafic des LAN distants **vers** l'interface Tunnel (route ou IGP).

**4. Vouloir passer un IGP dans IPsec seul.** IPsec pur ne transporte pas le **multicast** → OSPF/EIGRP ne passent pas. On ajoute **GRE** (qui, lui, transporte le multicast).

**5. Confondre site-à-site et accès distant.** Le site-à-site relie des **réseaux** (toujours actif entre deux routeurs) ; l'accès distant relie **un poste** au réseau (client VPN de l'utilisateur).`,
    badge: {
      id: "badge-tunnel-run",
      name: "Tunnel Run",
      icon: "Network",
      description: "Comprend les tunnels GRE et les VPN (site-à-site, IPsec) pour relier des sites distants.",
    },
    challenges: [
      {
        id: "res-gre-chiffre",
        title: "GRE chiffre-t-il ?",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚿 La limite de GRE

Le tunnel **GRE** assure-t-il la **confidentialité** (le chiffrement) des données ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "GRE encapsule, mais rien n'est caché. Que faut-il ajouter pour chiffrer ?", cost: 20 },
          { text: "📖 Correction complète : non, GRE transporte en clair ; il faut IPsec pour chiffrer.", cost: 50 },
        ],
        options: [
          "Non : GRE encapsule mais transporte en clair ; il faut IPsec pour chiffrer",
          "Oui, GRE chiffre tout automatiquement",
          "Oui, mais seulement en IPv6",
          "GRE supprime les données",
        ],
        answer: 0,
        explanation: `**GRE n'apporte AUCUN chiffrement** : il **encapsule** le paquet mais les données voyagent **en clair**. Pour la confidentialité, on combine GRE avec **IPsec** (« GRE over IPsec ») : GRE pour la **polyvalence** (multicast, IGP), IPsec pour la **sécurité**.`,
        tags: ["gre", "vpn", "chiffrement"],
      },
      {
        id: "res-vpn-types",
        title: "Site-à-site ou accès distant ?",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔐 Type de VPN

Un télétravailleur se connecte au réseau de son entreprise depuis son ordinateur portable via un **client VPN**. De quel type de VPN s'agit-il ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Est-ce qu'on relie deux réseaux, ou un seul utilisateur au réseau ?", cost: 20 },
          { text: "📖 Correction complète : VPN d'accès distant (un utilisateur → le réseau).", cost: 50 },
        ],
        options: [
          "VPN d'accès distant (un utilisateur vers le réseau)",
          "VPN site-à-site (deux réseaux)",
          "Un tunnel GRE en clair",
          "Un VLAN",
        ],
        answer: 0,
        explanation: `Un **télétravailleur** avec un **client VPN** = **VPN d'accès distant** : il relie **un utilisateur** (son poste) au réseau de l'entreprise. Le **site-à-site** relie **deux réseaux** entiers (deux routeurs/pare-feu), typiquement siège ↔ agence, de façon permanente.`,
        tags: ["vpn", "acces-distant", "site-a-site"],
      },
      {
        id: "res-vpn-ipsec",
        title: "Ce qu'apporte IPsec",
        order: 3,
        difficulty: "medium",
        type: "multi",
        prompt: `## 🛡️ Services de sécurité

Coche **tous** les services de sécurité qu'apporte **IPsec** dans un VPN :`,
        points: 200,
        timeLimitSec: 420,
        options: [
          "Confidentialité (chiffrement)",
          "Intégrité (données non altérées)",
          "Authentification (bon interlocuteur)",
          "Augmentation de la bande passante",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "IPsec sécurise ; il n'accélère pas les liens.", cost: 20 },
          { text: "📖 Correction complète : confidentialité + intégrité + authentification (et anti-rejeu). Pas de gain de débit.", cost: 50 },
        ],
        explanation: `IPsec apporte la **confidentialité** (chiffrement), l'**intégrité** (détection d'altération), l'**authentification** (on parle au bon site) et l'**anti-rejeu**. En revanche, il **n'augmente pas** la bande passante — au contraire, le chiffrement ajoute un léger surcoût. Sécurité ≠ performance.`,
        tags: ["vpn", "ipsec", "securite"],
      },
      {
        id: "res-gre-multicast",
        title: "Pourquoi GRE avec IPsec ?",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🧩 GRE over IPsec

Pourquoi combine-t-on souvent **GRE avec IPsec** plutôt qu'IPsec seul, notamment pour faire passer un protocole de routage comme **OSPF** entre deux sites ?`,
        points: 350,
        timeLimitSec: 420,
        hints: [
          { text: "OSPF utilise le multicast. IPsec seul sait-il transporter du multicast ?", cost: 30 },
          { text: "📖 Correction complète : IPsec seul ne transporte pas le multicast ; GRE le fait, donc GRE porte OSPF et IPsec chiffre.", cost: 70 },
        ],
        options: [
          "IPsec seul ne transporte pas le multicast ; GRE le fait (donc peut porter OSPF), et IPsec chiffre le tout",
          "GRE est plus sécurisé qu'IPsec",
          "IPsec ne fonctionne qu'en couche 2",
          "GRE remplace le routage",
        ],
        answer: 0,
        explanation: `IPsec **classique ne transporte pas le multicast** — or les IGP comme **OSPF/EIGRP** en dépendent. **GRE**, lui, encapsule le multicast (et bien d'autres protocoles). On empile donc : **GRE** transporte le trafic (y compris OSPF), **IPsec** le **chiffre**. C'est le fameux **« GRE over IPsec »**.`,
        tags: ["gre", "ipsec", "multicast", "ospf"],
      },
      {
        id: "res-gre-config",
        title: "Configurer un tunnel GRE",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🖥️ Config Cisco

Sur R1, crée une interface **Tunnel0** avec l'IP interne \`172.16.0.1/30\`, une **source** \`203.0.113.1\` (IP publique locale) et une **destination** \`198.51.100.1\` (IP publique du site distant).`,
        points: 350,
        timeLimitSec: 600,
        starter: `interface Tunnel0
`,
        hints: [
          { text: "ip address, puis tunnel source, puis tunnel destination.", cost: 30 },
          { text: "📖 Correction complète :\n```\ninterface Tunnel0\nip address 172.16.0.1 255.255.255.252\ntunnel source 203.0.113.1\ntunnel destination 198.51.100.1\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Crée l'interface Tunnel0", pattern: "interface\\s+Tunnel0", flags: "i" },
            { label: "Donne l'IP interne du tunnel", pattern: "ip\\s+address\\s+172\\.16\\.0\\.1", flags: "i" },
            { label: "Définit la source (IP publique locale)", pattern: "tunnel\\s+source\\s+203\\.0\\.113\\.1", flags: "i" },
            { label: "Définit la destination (IP publique distante)", pattern: "tunnel\\s+destination\\s+198\\.51\\.100\\.1", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
interface Tunnel0
ip address 172.16.0.1 255.255.255.252   ! IP INTERNE du tunnel
tunnel source 203.0.113.1               ! IP PUBLIQUE locale (réelle)
tunnel destination 198.51.100.1         ! IP PUBLIQUE du site distant
tunnel mode gre ip
\`\`\`

L'interface **Tunnel0** a une IP **interne** (172.16.0.1) ; \`source\`/\`destination\` utilisent les **IP publiques réelles**. Ensuite, il faut **router** les LAN distants **via** ce tunnel (route statique ou OSPF par-dessus). Vérifie avec \`ping 172.16.0.2\` (l'autre bout).`,
        tags: ["gre", "config", "cisco", "tunnel"],
      },
      {
        id: "res-tp-gre",
        title: "Architecture 1 — Tunnel GRE site à site",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 1 (niveau : avancé+)

Deux sites d'entreprise reliés **à travers Internet** par un tunnel GRE.

**Topologie à monter dans Packet Tracer :**

| Élément | Site A (R1) | Site B (R2) |
|---|---|---|
| LAN privé | \`192.168.1.0/24\` | \`192.168.2.0/24\` |
| IP publique (vers Internet) | \`203.0.113.1\` | \`198.51.100.1\` |
| IP de tunnel (Tunnel0, \`172.16.0.0/30\`) | \`.1\` | \`.2\` |

**Questions :**

1. Sur **R1** : créez \`Tunnel0\` (\`172.16.0.1/30\`), avec \`tunnel source\`/\`tunnel destination\` = les IP **publiques**, puis la **route statique** vers le LAN B **via le tunnel** ;
2. Sur **R2** : configuration symétrique ;
3. Vérifiez : \`show interfaces tunnel0\` (up/up), \`ping 172.16.0.2\`, puis ping **LAN à LAN**.

Blocs \`! === R1 ===\` et \`! === R2 ===\`.`,
        points: 500,
        timeLimitSec: 1500,
        starter: `! === R1 ===
interface Tunnel0
`,
        hints: [
          { text: "Chaque côté : interface Tunnel0 / ip address 172.16.0.X 255.255.255.252 / tunnel source <ma publique> / tunnel destination <sa publique>. Puis ip route <LAN distant> 255.255.255.0 <IP tunnel distante>.", cost: 50 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\ninterface Tunnel0\nip address 172.16.0.1 255.255.255.252\ntunnel source 203.0.113.1\ntunnel destination 198.51.100.1\nip route 192.168.2.0 255.255.255.0 172.16.0.2\n! === R2 ===\ninterface Tunnel0\nip address 172.16.0.2 255.255.255.252\ntunnel source 198.51.100.1\ntunnel destination 203.0.113.1\nip route 192.168.1.0 255.255.255.0 172.16.0.1\n```", cost: 110 },
        ],
        answer: JSON.stringify({
          minRatio: 0.6,
          keypoints: [
            { label: "IP de tunnel côté R1 (.1/30)", pattern: "ip\\s+address\\s+172\\.16\\.0\\.1\\s+255\\.255\\.255\\.252", flags: "i" },
            { label: "R1 : source = sa propre IP publique", pattern: "tunnel\\s+source\\s+203\\.0\\.113\\.1", flags: "i" },
            { label: "R1 : destination = IP publique de R2", pattern: "tunnel\\s+destination\\s+198\\.51\\.100\\.1", flags: "i" },
            { label: "R1 : route le LAN B via le tunnel", pattern: "ip\\s+route\\s+192\\.168\\.2\\.0\\s+255\\.255\\.255\\.0\\s+172\\.16\\.0\\.2", flags: "i" },
            { label: "IP de tunnel côté R2 (.2/30)", pattern: "ip\\s+address\\s+172\\.16\\.0\\.2\\s+255\\.255\\.255\\.252", flags: "i" },
            { label: "R2 : source = sa propre IP publique", pattern: "tunnel\\s+source\\s+198\\.51\\.100\\.1", flags: "i" },
            { label: "R2 : destination = IP publique de R1", pattern: "tunnel\\s+destination\\s+203\\.0\\.113\\.1", flags: "i" },
            { label: "R2 : route le LAN A via le tunnel", pattern: "ip\\s+route\\s+192\\.168\\.1\\.0\\s+255\\.255\\.255\\.0\\s+172\\.16\\.0\\.1", flags: "i" },
          ],
        }),
        explanation: `\`\`\`
! === R1 ===
interface Tunnel0
 ip address 172.16.0.1 255.255.255.252
 tunnel source 203.0.113.1               ! MA publique
 tunnel destination 198.51.100.1         ! SA publique
ip route 192.168.2.0 255.255.255.0 172.16.0.2   ! LAN B → via le tunnel !
! === R2 ===
interface Tunnel0
 ip address 172.16.0.2 255.255.255.252
 tunnel source 198.51.100.1
 tunnel destination 203.0.113.1
ip route 192.168.1.0 255.255.255.0 172.16.0.1
\`\`\`

Les pièges croisés : la \`source\` de R1 est la \`destination\` de R2 (et inversement). Et le tunnel **monté ne suffit pas** — sans les routes statiques qui pointent **dans** le tunnel, le trafic inter-LAN partirait vers Internet et serait perdu. Vérifie : \`show interfaces tunnel0\` (up/up), \`ping 172.16.0.2\`, puis ping **LAN à LAN**. Pour chiffrer : ajouter IPsec par-dessus (GRE over IPsec).`,
        tags: ["tp", "gre", "tunnel", "config", "architecture"],
      },
      {
        id: "res-tp-gre-2",
        title: "Architecture 2 — OSPF à travers le tunnel GRE",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "pseudo",
        prompt: `## 🏗️ Architecture 2 (niveau : expert)

Même topologie que l'Architecture 1, mais fini les routes statiques : on fait tourner **OSPF à travers le tunnel** — exactement le cas d'usage qui justifie GRE (IPsec seul ne porte pas le multicast d'OSPF !).

**Topologie :**

| Élément | Site A (R1) | Site B (R2) |
|---|---|---|
| LAN privé | \`192.168.1.0/24\` | \`192.168.2.0/24\` |
| Tunnel0 (déjà monté) | \`172.16.0.1/30\` | \`172.16.0.2/30\` |

**Questions :**

1. Sur **R1** : configurez OSPF 1 (router-id \`1.1.1.1\`) : annoncez le **LAN** ET le **réseau du tunnel** (\`172.16.0.0 0.0.0.3\`) en area 0 ;
2. Sur **R2** : symétrique (router-id \`2.2.2.2\`) ;
3. Question : que se passerait-il si on remplaçait GRE par de l'IPsec pur ? *(réponse dans la correction)*

Blocs \`! === R1 ===\` et \`! === R2 ===\`.`,
        points: 550,
        timeLimitSec: 1500,
        starter: `! === R1 ===
router ospf 1
`,
        hints: [
          { text: "Le tunnel est un lien /30 comme un autre pour OSPF : network 172.16.0.0 0.0.0.3 area 0. Les voisins OSPF se découvriront À TRAVERS le tunnel.", cost: 55 },
          { text: "📖 Correction complète :\n```\n! === R1 ===\nrouter ospf 1\nrouter-id 1.1.1.1\nnetwork 192.168.1.0 0.0.0.255 area 0\nnetwork 172.16.0.0 0.0.0.3 area 0\n! === R2 ===\nrouter ospf 1\nrouter-id 2.2.2.2\nnetwork 192.168.2.0 0.0.0.255 area 0\nnetwork 172.16.0.0 0.0.0.3 area 0\n```", cost: 120 },
        ],
        answer: JSON.stringify({
          minRatio: 0.65,
          keypoints: [
            { label: "Processus OSPF démarré", pattern: "router\\s+ospf\\s+1", flags: "i" },
            { label: "Réseau du tunnel annoncé (wildcard 0.0.0.3)", pattern: "network\\s+172\\.16\\.0\\.0\\s+0\\.0\\.0\\.3\\s+area\\s+0", flags: "i" },
            { label: "LAN A annoncé", pattern: "network\\s+192\\.168\\.1\\.0\\s+0\\.0\\.0\\.255\\s+area\\s+0", flags: "i" },
            { label: "LAN B annoncé", pattern: "network\\s+192\\.168\\.2\\.0\\s+0\\.0\\.0\\.255\\s+area\\s+0", flags: "i" },
            { label: "Router-id configurés", pattern: "router-id\\s+(1\\.1\\.1\\.1|2\\.2\\.2\\.2)", flags: "i" },
          ],
        }),
        explanation: `### ✅ Correction détaillée

\`\`\`
! === R1 ===
router ospf 1
 router-id 1.1.1.1
 network 192.168.1.0 0.0.0.255 area 0
 network 172.16.0.0 0.0.0.3 area 0     ! le TUNNEL est un lien OSPF comme un autre
! === R2 ===
router ospf 1
 router-id 2.2.2.2
 network 192.168.2.0 0.0.0.255 area 0
 network 172.16.0.0 0.0.0.3 area 0
\`\`\`

**Ce qui se passe :** R1 et R2 échangent leurs **Hello OSPF** (multicast 224.0.0.5) **encapsulés dans GRE**, deviennent voisins FULL *à travers Internet*, et s'échangent leurs LSA. Chaque site apprend le LAN de l'autre **automatiquement** — ajoute un 3ᵉ LAN demain, zéro route à taper.

**Réponse à la question 3 :** IPsec pur ne transporte **pas le multicast** → les Hello d'OSPF ne passeraient jamais, pas d'adjacence, pas de routes. C'est LA raison du montage **GRE over IPsec** en entreprise : GRE porte le multicast (donc l'IGP), IPsec chiffre l'ensemble.

**Vérification PT :** \`show ip ospf neighbor\` sur R1 → voisin **2.2.2.2 FULL** joignable via… \`Tunnel0\` ! Puis \`show ip route\` → \`O 192.168.2.0/24 via 172.16.0.2, Tunnel0\`. 🎯`,
        tags: ["tp", "gre", "ospf", "tunnel", "architecture"],
      },
    ],
  },
];
