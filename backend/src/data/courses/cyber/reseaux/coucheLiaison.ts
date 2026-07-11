import type { CourseSeed } from "../../../../types";

/** Cyber · Réseaux — Module 3 : sécurisation de la couche liaison (L2). */
export const coucheLiaison: CourseSeed[] = [
  {
    slug: "cyr-couche-liaison",
    title: "Sécurisation de la couche liaison (L2)",
    checkpoint: "cyber-reseaux",
    codename: "Layer 2 Lockdown",
    domain: "Réseaux — Couche 2",
    theme: "grid",
    icon: "Cable",
    accent: "#5FB3C6",
    order: 3,
    difficulty: "hard",
    summary:
      "La sécurité de la couche 2, souvent négligée : ARP (spoofing/poisoning, flooding, DAI + DHCP Snooping), STP/RSTP (Rogue Root Bridge, BPDU Guard), VLAN (802.1Q, VLAN hopping), DHCP (starvation, rogue DHCP, snooping), MACsec (802.1AE), PPP/PPPoE (PAP/CHAP) et MPLS. Configurations Cisco IOS présentées en lecture.",
    objectives: [
      "Expliquer le fonctionnement d'ARP et ses attaques (spoofing, flooding, MAC spoofing, hijacking)",
      "Comprendre la contre-mesure DHCP Snooping + Dynamic ARP Inspection (DAI)",
      "Décrire l'élection du Root Bridge STP et l'attaque Rogue Root Bridge (BPDU Guard)",
      "Connaître les attaques VLAN (hopping) et DHCP (starvation, rogue) et leurs parades",
      "Situer MACsec (802.1AE), PPP/PPPoE (PAP/CHAP) et la sécurité MPLS",
    ],
    resources: [
      {
        label: "Cisco — bonnes pratiques de sécurité de la couche 2",
        url: "https://www.cisco.com/",
        kind: "link",
        note: "Documentation de référence sur DHCP Snooping, Dynamic ARP Inspection, BPDU Guard et Port Security.",
      },
      {
        label: "IEEE 802.1AE — MACsec",
        url: "https://1.ieee802.org/security/802-1ae/",
        kind: "link",
        note: "La norme de chiffrement et d'intégrité de la couche liaison (MAC Security).",
      },
    ],
    lesson: `# 🔒 Sécurisation de la couche liaison (L2) — Layer 2 Lockdown

On sécurise souvent les couches hautes (pare-feu, TLS) en **oubliant la couche 2**. Or, « **une chaîne vaut son maillon le plus faible** » : si un attaquant contrôle le **commutateur** et le trafic **Ethernet local**, il peut faire du MITM **sous** le chiffrement applicatif, ou paralyser tout le LAN. Ce module couvre la sécurité **switch par switch**, protocole par protocole. *(Les configurations Cisco IOS sont présentées à titre explicatif — aucune manipulation demandée.)* 🏎️

---

## 1. ARP : le protocole naïf 🧩

### Fonctionnement

**ARP** (*Address Resolution Protocol*) traduit une **adresse IP** (couche 3) en **adresse MAC** (couche 2) sur un réseau local. Sans lui, deux machines du même LAN ne peuvent pas se parler.

\`\`\`
   PC-A veut parler à 192.168.1.1 (la passerelle) mais ignore sa MAC :

   1) PC-A → BROADCAST : "Who has 192.168.1.1 ? Tell 192.168.1.10"   (ARP Request)
   2) GW  → PC-A       : "192.168.1.1 is at AA:BB:CC:DD:EE:FF"        (ARP Reply)
   3) PC-A met à jour son CACHE ARP :  192.168.1.1 → AA:BB:CC:DD:EE:FF
\`\`\`

### Vulnérabilités intrinsèques

ARP a été conçu **sans aucune sécurité** :
- **Aucune authentification** : rien ne prouve que la réponse ARP vient de la **vraie** machine. N'importe qui peut répondre.
- **Protocole *stateless*** (sans état) : une machine **accepte et met en cache** une réponse ARP **même sans avoir posé de question** (réponse non sollicitée).
- **Gratuitous ARP** : un hôte peut **annoncer spontanément** son couple IP/MAC (fonction légitime pour signaler un changement) — **détournée** par l'attaquant pour **empoisonner** les caches.

### Vecteurs d'attaque

- **ARP Spoofing / ARP Poisoning** : l'attaquant envoie de **fausses réponses ARP** associant **sa MAC** à l'**IP de la passerelle** (et inversement côté passerelle). Les victimes lui envoient leur trafic → **homme du milieu (MITM)** : écoute, modification, vol de session. C'est **l'attaque L2 reine**.
- **ARP Flooding** : inonder le commutateur de réponses ARP falsifiées pour **saturer** la table CAM du switch → il passe en mode **« fail-open »** et **diffuse tout le trafic sur tous les ports** (*MAC flooding* / attaque **CAM overflow**), permettant l'écoute. (Souvent associé à l'outil de type *macof*.)
- **MAC Spoofing** : usurper une **adresse MAC** légitime pour contourner un filtrage ou se faire passer pour un autre hôte.
- **Session Hijacking** : une fois en MITM par ARP poisoning, **détourner des sessions** (voler des cookies, injecter du contenu).

### Contre-mesure : DHCP Snooping + Dynamic ARP Inspection (DAI)

La parade Cisco combine **deux** mécanismes :
1. **DHCP Snooping** : le switch **observe les échanges DHCP** et construit une **table de liaison** (*binding table*) fiable : « sur tel port, telle MAC a obtenu telle IP ». Les ports vers les équipements de confiance (serveur DHCP, uplink) sont déclarés **trusted**, les ports utilisateurs restent **untrusted**.
2. **Dynamic ARP Inspection (DAI)** : le switch **intercepte chaque paquet ARP** sur les ports non fiables et **vérifie** que le couple IP/MAC correspond bien à la **binding table** (issue du DHCP Snooping). Toute réponse ARP **incohérente** est **rejetée** → l'ARP spoofing est bloqué.

\`\`\`text
! --- Configuration Cisco IOS (lecture / compréhension) ---
! 1) Activer DHCP Snooping sur le/les VLAN concernés
Switch(config)# ip dhcp snooping
Switch(config)# ip dhcp snooping vlan 10

! Marquer le port vers le serveur DHCP (ou l'uplink) comme "de confiance"
Switch(config)# interface GigabitEthernet0/1
Switch(config-if)# ip dhcp snooping trust

! (Optionnel) limiter le débit de requêtes DHCP sur un port utilisateur
Switch(config-if)# ip dhcp snooping limit rate 10

! 2) Activer Dynamic ARP Inspection sur le VLAN
Switch(config)# ip arp inspection vlan 10

! Déclarer l'uplink/serveur comme port de confiance pour ARP
Switch(config)# interface GigabitEthernet0/1
Switch(config-if)# ip arp inspection trust

! (Optionnel) limiter le débit d'ARP sur les ports non fiables
Switch(config-if)# ip arp inspection limit rate 15
\`\`\`

> 🧠 Logique : **DAI s'appuie sur la table construite par DHCP Snooping**. Les **ports de confiance** (*trust*) — uplinks, serveur DHCP — ne sont pas inspectés ; les **ports utilisateurs** (untrusted) sont vérifiés, et le **rate limiting** freine les attaques par flooding. Pour les hôtes à IP fixe, on ajoute des **ARP ACL** statiques.

---

## 2. STP / RSTP : l'arbre qu'on peut détourner 🌳

### Fonctionnement et élection du Root Bridge

**STP** (*Spanning Tree Protocol*, 802.1D) et son successeur rapide **RSTP** (802.1w) évitent les **boucles de commutation** dans un réseau redondant en **désactivant** logiquement certains liens pour former un **arbre sans boucle**. Tout part de l'**élection du pont racine** (*Root Bridge*) :
- Chaque switch possède un **Bridge ID** = **Priorité** (par défaut 32768) **+** son **adresse MAC**.
- Le switch avec le **plus petit Bridge ID** devient **Root Bridge**. À priorité égale, c'est la **plus petite MAC** qui gagne.
- Les switches échangent des **BPDU** (*Bridge Protocol Data Units*) pour élire la racine et calculer l'arbre.

### Attaque : Rogue Root Bridge

Un attaquant branche un switch (ou une machine émulant STP) et **annonce un Bridge ID très bas** (priorité 0) via des **BPDU forgées** → il **force sa propre élection comme Root Bridge**. Conséquences :
- **MITM de couche 2** : une partie du trafic est **réacheminée à travers lui** (il devient un point de passage) → écoute/modification.
- **Instabilité** : recalcul permanent de l'arbre, **convergence** perturbée.
- **DoS** : mauvais chemins, boucles, **effondrement** des performances du réseau.

### Contre-mesure : BPDU Guard (et Root Guard)

Sur les **ports d'accès** (où l'on branche des postes, **jamais** des switches), on active **PortFast** + **BPDU Guard** : si une **BPDU** est reçue sur un tel port (signe qu'un switch pirate y est branché), le port passe en **err-disabled** (désactivé) immédiatement.

\`\`\`text
! --- Configuration Cisco IOS (lecture / compréhension) ---
! Sur un port d'accès utilisateur : PortFast + BPDU Guard
Switch(config)# interface FastEthernet0/5
Switch(config-if)# switchport mode access
Switch(config-if)# spanning-tree portfast
Switch(config-if)# spanning-tree bpduguard enable

! Activation globale de BPDU Guard sur tous les ports PortFast
Switch(config)# spanning-tree portfast bpduguard default

! Root Guard : empêche un port de devenir chemin vers une "meilleure" racine
Switch(config)# interface GigabitEthernet0/2
Switch(config-if)# spanning-tree guard root
\`\`\`

> 🧭 **BPDU Guard** protège la **frontière** (ports d'accès) en coupant tout port qui reçoit une BPDU. **Root Guard** protège l'inverse : il empêche un port de confiance d'accepter une **racine « meilleure »** (un rogue) et le met en état **root-inconsistent**. Ensemble, ils empêchent le **Rogue Root Bridge**.

---

## 3. VLAN (802.1Q) : segmentation… et VLAN hopping 🏷️

Les **VLAN** (*Virtual LAN*, **802.1Q**) segmentent un commutateur physique en plusieurs **réseaux logiques** isolés (chaque trame taguée d'un **VLAN ID**). C'est un pilier de la **segmentation** (moindre privilège). Mais des attaques de **VLAN hopping** permettent de **sauter** d'un VLAN à un autre :

- **Switch Spoofing** : l'attaquant se fait passer pour un **switch** en négociant un lien **trunk** via **DTP** (*Dynamic Trunking Protocol*). Un trunk transporte **tous** les VLAN → il accède à tout. **Parade** : désactiver la négociation DTP, mettre les ports d'accès en **mode access** explicite (\`switchport mode access\`, \`switchport nonegotiate\`).
- **Double Tagging** : l'attaquant insère **deux** tags 802.1Q. Le premier switch retire le tag externe (celui du **VLAN natif**) et transmet la trame avec le tag interne vers le **VLAN cible**. **Parade** : ne **jamais** utiliser un VLAN natif où sont branchés des utilisateurs, changer le VLAN natif, tagger le VLAN natif.

Bonnes pratiques VLAN : mettre les **ports inutilisés** dans un **VLAN « poubelle »** désactivé, ne pas laisser le **VLAN 1** par défaut en production, séparer **données/voix/gestion**.

---

## 4. DHCP : starvation et serveurs pirates 📮

Le **DHCP** attribue automatiquement les IP. Deux attaques classiques :
- **DHCP Starvation** : l'attaquant demande **massivement** des baux avec des **MAC différentes** → il **épuise le pool** d'adresses → plus personne ne peut obtenir d'IP (**DoS**).
- **Rogue DHCP** (serveur DHCP pirate) : l'attaquant monte son **propre serveur DHCP** qui répond plus vite et distribue une **mauvaise passerelle/DNS** (la sienne) → **MITM** et redirection du trafic.

**Parades** : **DHCP Snooping** (les réponses DHCP ne sont acceptées que sur les ports **trusted** → un rogue DHCP sur un port utilisateur est bloqué) et **Port Security** (limiter le nombre de MAC par port → contre la starvation).

\`\`\`text
! Port Security : limiter les MAC apprises sur un port d'accès
Switch(config)# interface FastEthernet0/5
Switch(config-if)# switchport port-security
Switch(config-if)# switchport port-security maximum 2
Switch(config-if)# switchport port-security violation restrict
Switch(config-if)# switchport port-security mac-address sticky
\`\`\`

---

## 5. MACsec (802.1AE) : chiffrer la couche 2 🔐

**MACsec** (*MAC Security*, **802.1AE**) fournit **confidentialité et intégrité au niveau de la couche liaison**, **saut par saut** (*hop-by-hop*), entre deux équipements adjacents (hôte↔switch ou switch↔switch). Il chiffre les trames Ethernet et garantit leur intégrité/authenticité (via un ICV), avec protection anti-rejeu.
- Souvent couplé à **802.1X** pour l'authentification et l'échange de clés (**MKA**, *MACsec Key Agreement*).
- Contrairement à IPsec (couche 3, de bout en bout), MACsec sécurise **chaque segment L2** — utile contre l'**écoute sur le LAN** et l'ARP spoofing (le trafic est chiffré/authentifié).

> 🧭 MACsec répond à la question « et si quelqu'un écoute **sur le fil** entre deux switches ? » : le trafic L2 devient **illisible et infalsifiable** entre les deux points.

---

## 6. PPP / PPPoE : liaisons point-à-point 🔗

**PPP** (*Point-to-Point Protocol*) relie deux extrémités (liaisons WAN, accès distant) ; **PPPoE** l'encapsule sur Ethernet (accès Internet type xDSL/fibre). PPP intègre une phase d'**authentification** :
- **PAP** (*Password Authentication Protocol*) : envoie le **mot de passe en clair** → **non sécurisé**, à proscrire.
- **CHAP** (*Challenge-Handshake Authentication Protocol*) : authentification par **défi-réponse** (l'authentifiant envoie un **challenge** aléatoire, le client répond avec un **hachage** du challenge + secret, **jamais** le mot de passe en clair) et **répétée** périodiquement → bien plus sûr que PAP.

**Menaces PPPoE** : découverte/usurpation de session (*PPPoE Discovery*), serveur d'accès pirate. **Parade** : privilégier **CHAP** (ou EAP), chiffrer les couches supérieures.

---

## 7. MPLS : commutation par labels 🏷️

**MPLS** (*Multiprotocol Label Switching*) achemine les paquets d'après des **labels** (étiquettes) plutôt que par une recherche IP complète à chaque saut → rapidité et **VPN MPLS** (isolation des clients d'un opérateur par des tables de routage séparées, **VRF**). Aspects de sécurité :
- **Isolation** : un **VPN MPLS** sépare logiquement les clients — mais l'**isolation ≠ chiffrement** : le trafic n'est **pas chiffré** dans le cœur MPLS (on ajoute **IPsec** par-dessus si la confidentialité est requise).
- **Confiance dans l'opérateur** : la sécurité repose sur la bonne configuration du réseau du fournisseur (étanchéité des **VRF**, protection du plan de contrôle, des labels).
- **Menaces** : mauvaise configuration entraînant des **fuites entre VPN**, injection de labels, attaques sur le plan de contrôle (LDP).

> 🧠 Retenir : **MPLS isole** (VPN opérateur) mais **ne chiffre pas** → pour la confidentialité de bout en bout, on superpose **IPsec** (module 6).

---

## 🧠 À retenir

- **ARP** n'a **aucune authentification**, est **stateless** (accepte des réponses non sollicitées) et permet le **Gratuitous ARP** → **ARP spoofing/poisoning** (MITM), **ARP flooding** (CAM overflow → écoute), **MAC spoofing**, **session hijacking**.
- **Parade ARP** : **DHCP Snooping** (construit la *binding table* IP↔MAC↔port, ports **trust/untrust**) + **Dynamic ARP Inspection (DAI)** qui **rejette** les ARP incohérents ; **rate limiting** contre le flooding.
- **STP/RSTP** : le **Root Bridge** = plus petit **Bridge ID** (priorité + MAC). **Rogue Root Bridge** = BPDU forgée à priorité 0 → **MITM L2, instabilité, DoS**. Parade : **BPDU Guard** (coupe un port d'accès recevant une BPDU) + **Root Guard**.
- **VLAN (802.1Q)** : **VLAN hopping** par **switch spoofing** (DTP/trunk — parade : \`switchport mode access\`/\`nonegotiate\`) ou **double tagging** (parade : changer/tagger le **VLAN natif**, pas d'utilisateurs dessus).
- **DHCP** : **starvation** (épuiser le pool → DoS, parade **Port Security**) et **rogue DHCP** (MITM, parade **DHCP Snooping** trust/untrust).
- **MACsec (802.1AE)** : chiffrement + intégrité **L2 hop-by-hop** (souvent avec 802.1X/MKA) → protège **le fil**. **PPP** : **PAP** (clair, à bannir) vs **CHAP** (défi-réponse, haché, répété). **MPLS** : **isole** (VPN/VRF) mais **ne chiffre pas** → ajouter **IPsec**.`,
    badge: {
      id: "badge-cyr-layer2-lockdown",
      name: "Layer 2 Lockdown",
      icon: "Cable",
      description: "Maîtrise la sécurité L2 : ARP/DAI, STP/BPDU Guard, VLAN hopping, DHCP snooping, MACsec.",
    },
    challenges: [
      {
        id: "cyr-l2-arp-why",
        title: "Pourquoi ARP est vulnérable",
        order: 1,
        difficulty: "medium",
        type: "multi",
        prompt: `## 🧩 Faiblesses d'ARP

Quelles caractéristiques **intrinsèques** d'ARP rendent l'ARP spoofing possible ? (Coche tout ce qui s'applique.)`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "ARP n'a aucune authentification : rien ne prouve l'origine d'une réponse",
          "ARP est stateless : un hôte accepte une réponse même sans avoir posé de question",
          "Le Gratuitous ARP permet d'annoncer spontanément un couple IP/MAC",
          "ARP chiffre systématiquement les réponses avec AES",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Trois faiblesses de conception ; la quatrième est fausse (ARP ne chiffre rien).", cost: 20 },
          { text: "📖 Correction : pas d'authentification + stateless + Gratuitous ARP.", cost: 50 },
        ],
        explanation: `ARP est **naïf par conception** : **aucune authentification**, **stateless** (accepte des réponses **non sollicitées**), et le **Gratuitous ARP** permet des annonces spontanées **détournables**. ARP ne **chiffre rien**. Ces failles rendent l'**ARP poisoning** (MITM) trivial sur un LAN non protégé.`,
        tags: ["arp", "spoofing", "stateless"],
      },
      {
        id: "cyr-l2-dai",
        title: "DAI et DHCP Snooping",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure ARP

Sur quoi la **Dynamic ARP Inspection (DAI)** s'appuie-t-elle pour décider qu'un paquet ARP est légitime ou frauduleux ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Une table IP↔MAC↔port construite en observant un autre protocole.", cost: 30 },
          { text: "📖 Correction : la binding table construite par DHCP Snooping.", cost: 80 },
        ],
        options: [
          "Sur la table de liaison (binding table) IP↔MAC↔port construite par DHCP Snooping",
          "Sur le mot de passe Wi-Fi du réseau",
          "Sur la vitesse du port en Gbit/s",
          "Sur le numéro de série du switch",
        ],
        answer: 0,
        explanation: `**DAI** intercepte les paquets ARP sur les ports **non fiables** et vérifie que le couple **IP/MAC** correspond à la **binding table** construite par **DHCP Snooping** (« telle MAC a obtenu telle IP sur tel port »). Tout ARP **incohérent** est **rejeté**. Les ports **trust** (uplink, serveur DHCP) ne sont pas inspectés. Pour les IP fixes, on ajoute des **ARP ACL**.`,
        tags: ["dai", "dhcp-snooping", "binding-table"],
      },
      {
        id: "cyr-l2-rootbridge",
        title: "Rogue Root Bridge",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🌳 Attaque STP

Comment un attaquant force-t-il son propre équipement à devenir **Root Bridge** du Spanning Tree, et que vise-t-il ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Le Root Bridge est celui au plus petit Bridge ID (priorité + MAC).", cost: 30 },
          { text: "📖 Correction : annoncer des BPDU avec une priorité très basse (0) → devient racine → MITM/DoS.", cost: 80 },
        ],
        options: [
          "Il émet des BPDU annonçant un Bridge ID très bas (priorité 0) pour devenir racine, permettant MITM L2, instabilité et DoS",
          "Il débranche physiquement tous les autres switches",
          "Il change l'adresse IP de la passerelle",
          "Il augmente la bande passante de son port",
        ],
        answer: 0,
        explanation: `Le **Root Bridge** est le switch au **plus petit Bridge ID** (**priorité + MAC**). En émettant des **BPDU forgées** avec une **priorité très basse (0)**, l'attaquant se fait **élire racine** : une partie du trafic transite par lui (**MITM L2**), avec **instabilité** et **DoS** à la clé. Parade : **BPDU Guard** (+ **Root Guard**).`,
        tags: ["stp", "root-bridge", "bpdu"],
      },
      {
        id: "cyr-l2-bpduguard",
        title: "BPDU Guard",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚙️ Cisco IOS

Un port d'accès configuré avec **PortFast + BPDU Guard** reçoit soudainement une **BPDU**. Que se passe-t-il, et pourquoi est-ce voulu ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Sur un port où l'on branche un PC, recevoir une BPDU = un switch pirate est branché.", cost: 20 },
          { text: "📖 Correction : le port passe en err-disabled (désactivé) → bloque le switch pirate.", cost: 50 },
        ],
        options: [
          "Le port passe en err-disabled (désactivé) : recevoir une BPDU sur un port d'accès trahit un switch non autorisé",
          "Le port double automatiquement son débit",
          "Le switch devient Root Bridge à son tour",
          "Rien, la BPDU est simplement ignorée en silence",
        ],
        answer: 0,
        explanation: `Sur un **port d'accès** (où l'on branche un **poste**, jamais un switch), recevoir une **BPDU** signale un **équipement non autorisé** (switch pirate). Avec **BPDU Guard**, le port est immédiatement mis en **err-disabled** (désactivé), neutralisant la tentative de **Rogue Root Bridge**. C'est la protection de la **frontière** du réseau commuté.`,
        tags: ["bpdu-guard", "err-disabled", "portfast"],
      },
      {
        id: "cyr-l2-vlanhop",
        title: "VLAN hopping",
        order: 5,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🏷️ Attaque VLAN

Dans l'attaque de **VLAN hopping par switch spoofing**, comment l'attaquant accède-t-il à tous les VLAN ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Il se fait passer pour un switch et négocie un lien qui transporte tous les VLAN.", cost: 30 },
          { text: "📖 Correction : négocier un trunk via DTP → le trunk transporte tous les VLAN.", cost: 80 },
        ],
        options: [
          "Il se fait passer pour un switch et négocie un lien trunk (via DTP), qui transporte tous les VLAN",
          "Il devine le mot de passe de chaque VLAN",
          "Il augmente la priorité STP de son port",
          "Il désactive le chiffrement AES du VLAN",
        ],
        answer: 0,
        explanation: `En **switch spoofing**, l'attaquant émule un switch et **négocie un trunk** via **DTP** (*Dynamic Trunking Protocol*). Un **trunk** transporte **tous** les VLAN → il y accède tous. Parade : désactiver la négociation (\`switchport mode access\`, \`switchport nonegotiate\`). L'autre variante, le **double tagging**, se contre en changeant/taggant le **VLAN natif**.`,
        tags: ["vlan-hopping", "dtp", "trunk"],
      },
      {
        id: "cyr-l2-chap",
        title: "PAP vs CHAP",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔗 Authentification PPP

Pourquoi **CHAP** est-il préférable à **PAP** pour authentifier une liaison PPP ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "PAP envoie le mot de passe en clair ; CHAP utilise un défi-réponse haché.", cost: 20 },
          { text: "📖 Correction : CHAP = défi-réponse haché, sans envoyer le mot de passe en clair, et répété.", cost: 50 },
        ],
        options: [
          "CHAP utilise un défi-réponse haché (le mot de passe ne circule jamais en clair) et se répète périodiquement",
          "CHAP est plus rapide car il n'authentifie rien",
          "PAP chiffre tout avec AES-256",
          "CHAP envoie le mot de passe deux fois pour le confirmer",
        ],
        answer: 0,
        explanation: `**PAP** transmet le **mot de passe en clair** → à proscrire. **CHAP** procède par **défi-réponse** : l'authentifiant envoie un **challenge** aléatoire, le client répond par un **hachage** (challenge + secret) — le secret **ne circule jamais** — et l'opération est **répétée** périodiquement. C'est nettement plus sûr. À défaut, on chiffre les couches supérieures.`,
        tags: ["ppp", "chap", "pap"],
      },
      {
        id: "cyr-l2-macsec-mpls",
        title: "MACsec et MPLS",
        order: 7,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🔐 Chiffrement L2 et isolation

Quelles affirmations sont **exactes** concernant MACsec et MPLS ? (Coche toutes les bonnes.)`,
        points: 350,
        timeLimitSec: 420,
        options: [
          "MACsec (802.1AE) chiffre et protège l'intégrité des trames au niveau L2, saut par saut (hop-by-hop)",
          "Un VPN MPLS isole les clients mais ne chiffre pas le trafic : on ajoute IPsec pour la confidentialité",
          "MACsec est souvent couplé à 802.1X pour l'authentification et l'échange de clés (MKA)",
          "MPLS chiffre nativement tout le trafic de bout en bout, rendant IPsec inutile",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "MACsec = chiffrement L2 hop-by-hop ; MPLS isole mais ne chiffre pas.", cost: 30 },
          { text: "📖 Correction : les 3 premières sont vraies ; MPLS ne chiffre PAS nativement.", cost: 80 },
        ],
        explanation: `**MACsec (802.1AE)** chiffre + protège l'intégrité **L2 hop-by-hop**, souvent avec **802.1X/MKA** pour les clés. **MPLS isole** (VPN/VRF) mais **ne chiffre pas** → pour la confidentialité, on superpose **IPsec**. L'affirmation « MPLS chiffre de bout en bout » est **fausse** : isolation ≠ chiffrement.`,
        tags: ["macsec", "mpls", "ipsec"],
      },
    ],
  },
];
