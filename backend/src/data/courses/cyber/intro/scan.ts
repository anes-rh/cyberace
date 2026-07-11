import type { CourseSeed } from "../../../../types";

/** Cyber · Intro — Module 8 : scan & découverte réseau. */
export const scan: CourseSeed[] = [
  {
    slug: "cyi-scan",
    title: "Scan & découverte réseau",
    checkpoint: "cyber-intro",
    codename: "Radar Sweep",
    domain: "Cybersécurité — Scanning",
    theme: "grid",
    icon: "Network",
    accent: "#9B8CCB",
    order: 8,
    difficulty: "hard",
    summary:
      "Cartographier activement une cible : découvrir les hôtes vivants, les ports ouverts et les services. Rappel des flags TCP, techniques de découverte d'hôtes (ping sweep, ARP, UDP, ICMP), types de scans de ports (SYN, Connect, FIN/NULL/Xmas…), outils (Nmap, Hping2/3, Metasploit, NetScanTools Pro) et contre-mesures.",
    objectives: [
      "Comprendre le rôle des flags TCP dans le scan (SYN, ACK, RST, FIN, PSH, URG)",
      "Distinguer découverte d'hôtes et découverte de ports/services",
      "Décrire les techniques (ping sweep, scan ARP/UDP/ICMP, SYN/Connect/FIN/NULL/Xmas)",
      "Citer les outils de scan (Nmap, Hping, Metasploit, NetScanTools Pro)",
      "Connaître les contre-mesures de scan",
    ],
    resources: [
      {
        label: "Nmap — le livre officiel « Nmap Network Scanning » (gratuit)",
        url: "https://nmap.org/book/toc.html",
        kind: "link",
        note: "La référence complète et gratuite du scan réseau, par l'auteur de Nmap (host discovery, types de scans, détection…).",
      },
      {
        label: "HackTricks — Pentesting Network",
        url: "https://book.hacktricks.xyz/generic-methodologies-and-resources/pentesting-network",
        kind: "link",
        note: "Méthodologie de découverte réseau : sweep, ARP, scans de ports, contournement de pare-feu.",
      },
      {
        label: "TryHackMe — salles Nmap (gratuit)",
        url: "https://tryhackme.com/",
        kind: "link",
        note: "S'exercer au scan avec Nmap dans un environnement légal et guidé.",
      },
    ],
    lesson: `# 📡 Scan & découverte réseau — Radar Sweep

Le **scan** est la reconnaissance **active** qui cartographie la cible : **quels hôtes sont vivants ? quels ports sont ouverts ? quels services tournent ?** C'est le radar de l'attaquant — et il laisse des **traces**. 🏎️

---

## 1. Rappel : les flags TCP 🚩

TCP marque chaque segment avec des **flags** (drapeaux) qui pilotent la communication. Les comprendre est **essentiel** pour les scans :

| Flag | Rôle |
|---|---|
| **SYN** | *Synchronize* — demande d'ouverture de connexion |
| **ACK** | *Acknowledgment* — accuse réception |
| **FIN** | *Finish* — demande de fermeture propre |
| **RST** | *Reset* — fermeture **brutale** / port fermé |
| **PSH** | *Push* — pousser les données immédiatement |
| **URG** | *Urgent* — données urgentes |

Le **three-way handshake** (ouverture TCP) : \`SYN\` → \`SYN/ACK\` → \`ACK\`. Les scans exploitent ces flags pour deviner l'**état des ports** :
- port **ouvert** : répond \`SYN/ACK\` à un \`SYN\`.
- port **fermé** : répond \`RST\`.
- port **filtré** (pare-feu) : **aucune réponse** (drop).

---

## 2. Découverte d'hôtes 🌐

Avant de scanner les ports, on identifie les **machines vivantes** :

- **Ping sweep** (balayage ICMP) : envoyer des **ICMP Echo Request** à une plage d'IP ; celles qui **répondent** (Echo Reply) sont **actives**. Simple, mais souvent **bloqué** par les pare-feu.
- **Scan ARP** : sur le **réseau local**, envoyer des requêtes **ARP** ; toute machine active **répond** (ARP est difficile à filtrer sur un LAN) → très **fiable en local**.
- **Scan UDP** : envoyer des paquets **UDP** ; un port fermé renvoie **ICMP port unreachable**, ce qui révèle l'hôte.
- **Scan ICMP** (autres types) : *timestamp*, *address mask* requests pour détecter des hôtes quand l'Echo est bloqué.

---

## 3. Découverte de ports & services 🔍

Une fois les hôtes trouvés, on **scanne les ports** pour savoir quels **services** écoutent. Grands types de scans :

- **TCP Connect scan** : ouvre une **connexion TCP complète** (handshake entier). Fiable mais **bruyant** (journalisé). Ne nécessite pas de privilèges.
- **SYN scan** (*half-open*) : envoie \`SYN\`, attend \`SYN/ACK\` (ouvert) ou \`RST\` (fermé), puis envoie \`RST\` **sans finir** le handshake → plus **discret** et rapide. Le scan de référence de Nmap.
- **FIN / NULL / Xmas scan** : envoient des paquets **inhabituels** (\`FIN\` seul, aucun flag, ou \`FIN+PSH+URG\` = « sapin de Noël ») pour **contourner** certains pare-feu ; un port fermé répond \`RST\`, un port ouvert **ne répond pas**.
- **ACK scan** : sert à **cartographier les règles de pare-feu** (déterminer si un port est **filtré** ou non).
- **UDP scan** : teste les services **UDP** (DNS, SNMP, DHCP…), plus lent (pas de handshake).

Le scan révèle aussi la **détection de version** (bannières → nom et version du service) et parfois l'**OS fingerprinting** (deviner le système d'exploitation d'après le comportement TCP/IP — **actif** avec Nmap \`-O\`, ou **passif** avec un outil comme **p0f**).

### Les plages de ports & les ports à connaître 🔢

Les **65 536** ports (0–65535) se répartissent en trois plages :
- **Bien connus** (*well-known*) : **0–1023** (services standards).
- **Enregistrés** (*registered*) : **1024–49151**.
- **Dynamiques / éphémères** : **49152–65535** (connexions clientes temporaires).

Ports **incontournables** à mémoriser :

| Port | Service | Port | Service |
|---|---|---|---|
| **21** | FTP | **143** | IMAP |
| **22** | SSH | **443** | HTTPS |
| **23** | Telnet | **445** | SMB |
| **25** | SMTP | **1433** | MS SQL |
| **53** | DNS | **3306** | MySQL |
| **80** | HTTP | **3389** | RDP (bureau distant) |
| **110** | POP3 | **8080** | HTTP alternatif |

### Contourner pare-feu et IDS (évasion) 🥷

Un attaquant expérimenté **masque** son scan :
- **Fragmentation** (\`-f\`) : découper les paquets pour brouiller les IDS.
- **Leurres** (*decoys*, \`-D\`) : noyer sa vraie IP au milieu de fausses.
- **Timing lent** (\`-T0\`/\`-T1\`) : scanner très doucement pour passer sous les seuils de détection.
- **Idle/zombie scan** (\`-sI\`) : scanner **à travers** une machine tierce « zombie » pour ne jamais exposer sa propre IP — le scan le plus **furtif**.
- **Spoofing** d'adresse source ou de port source (ex. port 53/80, souvent autorisés).

---

## 4. Les outils de scan 🧰

| Outil | Rôle |
|---|---|
| **Nmap** | *the* scanner de référence : découverte d'hôtes, scan de ports (SYN, Connect, UDP…), détection de version et d'OS, scripts (**NSE**) |
| **Hping2 / Hping3** | forge de paquets **sur mesure** (flags, taille…) : scans avancés, tests de pare-feu, découverte fine |
| **Metasploit** | framework d'exploitation intégrant aussi des modules de **scan/découverte** |
| **NetScanTools Pro** | suite d'outils réseau **Windows** (scan, DNS, WHOIS, ping…) à interface graphique |

> 🧠 **Nmap** est incontournable : \`nmap -sS\` (SYN scan), \`-sU\` (UDP), \`-sV\` (versions), \`-O\` (OS), \`-p\` (ports). **Hping** sert quand on a besoin de **forger** des paquets précis pour contourner ou tester un pare-feu.

---

## 5. Les contre-mesures 🛡️

Contre le scan, on **réduit la visibilité** et on **détecte** :

- **Pare-feu bien configuré** : n'ouvrir que les ports **nécessaires**, **filtrer** (drop) le reste, bloquer les ICMP superflus.
- **IDS/IPS** : détecter les **motifs de scan** (nombreuses connexions vers des ports variés en peu de temps) et alerter/bloquer.
- **Segmentation réseau** : limiter ce qu'un attaquant peut atteindre depuis un point donné.
- **Fermer/désactiver les services inutiles** (réduire la surface d'attaque).
- **Rate limiting** et **port knocking** pour masquer des services.
- **Journalisation et surveillance** : un pic de connexions RST/SYN inhabituel trahit un scan.

> ⚠️ On ne peut pas **empêcher totalement** d'être scanné depuis Internet, mais on peut **exposer le minimum**, **filtrer** agressivement et **détecter** vite.

---

## 🧠 À retenir

- **Flags TCP** : **SYN** (ouvrir), **ACK** (accuser), **FIN** (fermer proprement), **RST** (reset/port fermé), **PSH**, **URG**. Handshake : \`SYN → SYN/ACK → ACK\`.
- États de port : **ouvert** (\`SYN/ACK\`), **fermé** (\`RST\`), **filtré** (aucune réponse).
- **Découverte d'hôtes** : **ping sweep** (ICMP), **scan ARP** (fiable en LAN), scan UDP/ICMP.
- **Scans de ports** : **TCP Connect** (complet, bruyant), **SYN** (half-open, discret, référence Nmap), **FIN/NULL/Xmas** (contourner pare-feu), **ACK** (mapper le pare-feu), **UDP**.
- **Plages** : well-known **0–1023**, registered **1024–49151**, dynamiques **49152–65535**. Ports clés : 21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS, 445 SMB, 3389 RDP, 3306 MySQL.
- **Évasion** IDS/pare-feu : **fragmentation** (\`-f\`), **leurres** (\`-D\`), **timing lent** (\`-T0/-T1\`), **idle/zombie scan** (\`-sI\`, le plus furtif), spoofing de port source.
- Outils : **Nmap** (référence, NSE), **Hping2/3** (forge de paquets), **Metasploit**, **NetScanTools Pro**.
- Contre-mesures : **pare-feu strict** (filtrer/drop), **IDS/IPS** (détecter les scans), **segmentation**, **fermer les services inutiles**, **surveillance**.`,
    badge: {
      id: "badge-cyi-radar-sweep",
      name: "Radar Sweep",
      icon: "Network",
      description: "Comprend les flags TCP, les techniques de scan (SYN/Connect/Xmas…), les outils (Nmap/Hping) et les parades.",
    },
    challenges: [
      {
        id: "cyi-scan-flags",
        title: "Port fermé = quel flag ?",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚩 Flags TCP

Lors d'un scan, un **port fermé** répond typiquement avec quel **flag TCP** ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Le flag de fermeture brutale.", cost: 15 },
          { text: "📖 Correction : RST (reset) → port fermé. Un port ouvert répond SYN/ACK.", cost: 40 },
        ],
        options: [
          "RST",
          "SYN/ACK",
          "PSH",
          "URG",
        ],
        answer: 0,
        explanation: `Un **port fermé** répond par un **RST** (reset). Un **port ouvert** répond **SYN/ACK** (à un SYN). Un **port filtré** (pare-feu) ne répond **rien** (drop). C'est en interprétant ces réponses que les scanners déduisent l'état de chaque port.`,
        tags: ["tcp", "flags", "scan"],
      },
      {
        id: "cyi-scan-arp",
        title: "Découverte d'hôtes en LAN",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🌐 Host discovery

Sur un **réseau local**, quelle technique de découverte d'hôtes est la **plus fiable** (car difficile à filtrer) ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "Le protocole qui associe IP et MAC sur le LAN.", cost: 20 },
          { text: "📖 Correction : le scan ARP (indispensable au fonctionnement du LAN, donc difficile à bloquer).", cost: 50 },
        ],
        options: [
          "Le scan ARP",
          "Le ping ICMP (souvent bloqué par les pare-feu)",
          "Le scan UDP uniquement",
          "Le transfert de zone DNS",
        ],
        answer: 0,
        explanation: `Sur un **LAN**, le **scan ARP** est le plus **fiable** : ARP est indispensable au fonctionnement du réseau local (associer IP ↔ MAC), donc **difficile à filtrer** — toute machine active répond. Le **ping ICMP** est souvent **bloqué** par les pare-feu, le rendant peu fiable. (Le transfert de zone DNS relève de l'énumération, pas de la découverte d'hôtes.)`,
        tags: ["arp", "host-discovery", "scan"],
      },
      {
        id: "cyi-scan-syn",
        title: "Le SYN scan",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔍 Types de scan

Pourquoi le **SYN scan** (half-open) est-il plus **discret** qu'un TCP Connect scan complet ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Il n'achève jamais le handshake (envoie RST au lieu de ACK).", cost: 25 },
          { text: "📖 Correction : il n'établit pas la connexion complète, donc souvent non journalisée par l'application.", cost: 60 },
        ],
        options: [
          "Il n'achève pas le handshake (SYN → SYN/ACK → RST) : la connexion n'est jamais complètement ouverte, souvent non journalisée par l'application",
          "Il chiffre tous les paquets envoyés",
          "Il n'utilise aucun flag TCP",
          "Il éteint le pare-feu de la cible",
        ],
        answer: 0,
        explanation: `Le **SYN scan** (*half-open*) envoie \`SYN\`, reçoit \`SYN/ACK\` (ouvert) ou \`RST\` (fermé), puis envoie **\`RST\`** au lieu de \`ACK\` : la connexion **n'est jamais complètement établie**, donc souvent **non journalisée** au niveau applicatif → plus **discret** et rapide qu'un **TCP Connect** (handshake complet, bruyant). C'est le scan par défaut de **Nmap** (\`-sS\`).`,
        tags: ["syn-scan", "half-open", "nmap"],
      },
      {
        id: "cyi-scan-nmap",
        title: "L'outil de référence",
        order: 4,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧰 Outils

Quel outil est **le** scanner de référence (découverte d'hôtes, ports, versions, OS, scripts NSE) ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Le scanner réseau le plus célèbre.", cost: 15 },
          { text: "📖 Correction : Nmap.", cost: 40 },
        ],
        options: ["Nmap", "Maltego", "FOCA", "Wireshark"],
        answer: 0,
        explanation: `**Nmap** est le scanner de référence : découverte d'hôtes, scan de ports (\`-sS\`, \`-sU\`), détection de **version** (\`-sV\`), d'**OS** (\`-O\`) et moteur de **scripts NSE**. **Hping2/3** sert à **forger des paquets** sur mesure (tests de pare-feu). **Maltego/FOCA** relèvent de l'OSINT passif ; **Wireshark** est un analyseur de trafic, pas un scanner.`,
        tags: ["nmap", "outils", "scan"],
      },
      {
        id: "cyi-scan-counter",
        title: "Détecter et contrer un scan",
        order: 5,
        difficulty: "medium",
        type: "multi",
        prompt: `## 🛡️ Contre-mesures

Coche les **contre-mesures** efficaces contre le scan réseau :`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "Un pare-feu strict qui filtre (drop) les ports non nécessaires",
          "Un IDS/IPS qui détecte les motifs de scan",
          "La segmentation réseau et la fermeture des services inutiles",
          "Ouvrir tous les ports pour « brouiller » l'attaquant",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Réduire la surface + détecter. Ouvrir tous les ports = catastrophe.", cost: 20 },
          { text: "📖 Correction : pare-feu strict + IDS/IPS + segmentation. Ouvrir tout est l'inverse d'une défense.", cost: 50 },
        ],
        explanation: `Contre le scan : **pare-feu strict** (n'ouvrir que le nécessaire, **drop** le reste), **IDS/IPS** (repérer les motifs de scan : beaucoup de ports sondés en peu de temps), **segmentation** et **fermeture des services inutiles** (réduire la surface d'attaque). **Ouvrir tous les ports** ferait exactement l'inverse : on offrirait un maximum de cibles. On ne peut pas empêcher totalement d'être scanné, mais on **expose le minimum** et on **détecte vite**.`,
        tags: ["contre-mesures", "pare-feu", "ids"],
      },
    ],
  },
];
