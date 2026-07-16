import type { CheckpointSeed } from "../types";

/**
 * The 5 top-level checkpoints on the roadmap.
 * Only "cybersecurite" is active (it holds every existing course/challenge as
 * an internal sub-module). The other four are structural placeholders — their
 * content will be authored in a later iteration.
 */
export const allCheckpoints: CheckpointSeed[] = [
  {
    slug: "algorithmique",
    title: "Algorithmique",
    order: 1,
    status: "active",
    icon: "Binary",
    accent: "#6FA8DC",
    description:
      "Le cursus complet L1→L2 : pseudo-code CyberAce, traces d'exécution, tableaux, structures dynamiques, complexité, piles/files, arbres — cours magistraux vulgarisés, TD corrigés ligne à ligne et TP en C avec éditeur intégré.",
    tagline: "Première étape du parcours",
  },
  {
    slug: "systeme-exploitation",
    title: "Système d'exploitation",
    order: 2,
    status: "active",
    icon: "Cpu",
    accent: "#E8A87C",
    description:
      "100 % pratique, cap sur Linux : installe ta VM Ubuntu (VirtualBox), dompte le terminal (fichiers, droits, find/grep, pipes), écris des scripts bash, et programme le système en C — processus (fork/exec/wait), ordonnancement, synchronisation par sémaphores, tubes (IPC), mémoire virtuelle et systèmes de fichiers. Cours condensés, TP réels dans la VM et exercices C à compiler.",
    tagline: "Système & Linux — L2 → M1",
  },
  {
    slug: "base-de-donnees",
    title: "Base de données",
    order: 3,
    status: "active",
    icon: "Database",
    accent: "#93B896",
    description:
      "Cap sur le SQL pratique : du modèle entité-association à la normalisation, puis on écrit et on exécute du vrai SQL (DDL, DML, SELECT/jointures/sous-requêtes/agrégations, vues, index) sur un schéma filé d'atelier mécanique. Plus l'administration Oracle (tablespaces, privilèges, dictionnaire de données) et, en approfondissement, transactions ACID, optimisation et bases distribuées.",
    tagline: "SQL & SGBD — L2 → M1",
  },
  {
    slug: "reseaux",
    title: "Réseaux",
    order: 4,
    status: "active",
    icon: "Network",
    accent: "#5FB3C6",
    description:
      "Du binaire à BGP : numération & masques, modèles OSI/TCP-IP, adressage IPv4 (FLSM/VLSM) et IPv6, routage statique et dynamique (RIP, OSPF, BGP), VLAN, STP, FHRP, DHCP — cours détaillés, TD corrigés et TP guidés Packet Tracer avec vidéos et fichiers .pkt.",
    tagline: "Réseaux L3 → M1",
  },
  {
    slug: "cybersecurite",
    title: "Cybersécurité — Théorie",
    order: 5,
    status: "active",
    icon: "ShieldCheck",
    accent: "#9B8CCB",
    description:
      "Les fondations théoriques, organisées en mini-checkpoints : introduction à la sécurité, sécurité des réseaux, du sans-fil et des systèmes. Choisis un axe et progresse à ton rythme, avant de passer à la pratique.",
    tagline: "Les fondations théoriques",
  },

  // ── Mini-checkpoints de « Cybersécurité » (sous-route, parent = cybersecurite) ──
  {
    slug: "cyber-intro",
    title: "Introduction à la sécurité",
    order: 1,
    status: "active",
    icon: "ShieldCheck",
    accent: "#9B8CCB",
    description:
      "Les fondations théoriques : triade CIA, AAA, hacking éthique, Cyber Kill Chain, MITRE ATT&CK, NIST, lois & conformité, footprinting, énumération et scan réseau.",
    tagline: "Point de départ sécurité",
    parent: "cybersecurite",
  },
  {
    slug: "cyber-reseaux",
    title: "Sécurité réseaux",
    order: 2,
    status: "active",
    icon: "Network",
    accent: "#5FB3C6",
    description:
      "Protéger le réseau de bout en bout : normes & gestion des risques, attaques (DoS, spoofing, hijacking), sécurité L2 (ARP/DAI, STP/BPDU Guard, VLAN, MACsec), pare-feu/NAT/proxy/DMZ, IPsec & VPN, IPv6, SSH/TLS/DNS, sécurité du routage, vulnérabilités avancées et étude de cas APT (Kill Chain/MITRE ATT&CK).",
    tagline: "Défendre le réseau",
    parent: "cybersecurite",
  },
  {
    slug: "cyber-wifi",
    title: "Sécurité réseaux sans fil",
    order: 3,
    status: "active",
    icon: "Wifi",
    accent: "#93B896",
    description:
      "Le Wi-Fi sous surveillance : fondamentaux radio & 802.11, WEP/WPA/WPA2/WPA3, 4-way handshake & KRACK, attaques sans fil (evil twin, rogue AP, deauth, WPS, DoS), 802.1X d'entreprise et durcissement (isolation invités, DMZ/VPN/NAC).",
    tagline: "Sécuriser le sans-fil",
    parent: "cybersecurite",
  },
  {
    slug: "cyber-systeme",
    title: "Sécurité système",
    order: 4,
    status: "active",
    icon: "Server",
    accent: "#E8A87C",
    description:
      "Au cœur de la machine : rootkits et compromission du noyau, protection mémoire (ASLR, DEP, canaries, ROP), modèles de contrôle d'accès (DAC/MAC/RBAC), Bell-LaPadula et sécurité multi-niveaux, canaux cachés, architecture de la virtualisation et attaques contre les hyperviseurs.",
    tagline: "Durcir les systèmes",
    parent: "cybersecurite",
  },

  // ── Checkpoint « Cybersécurité — Pratique » (top-level, labs Docker réels) ──
  {
    slug: "cybersecurite-pratique",
    title: "Cybersécurité — Pratique",
    order: 6,
    status: "active",
    icon: "Terminal",
    accent: "#E0685E",
    description:
      "Le prolongement pratique du parcours théorique : de vrais conteneurs isolés, un vrai terminal, de vraies commandes. Les modules sont regroupés en mini-checkpoints thématiques — reconnaissance réseau et web, interception & détection, élévation de privilèges, sécurité applicative et services exposés — pour progresser un domaine à la fois.",
    tagline: "Environnements réels, terminal en direct",
  },

  // ── Mini-checkpoints de « Cybersécurité — Pratique » (parent = cybersecurite-pratique) ──
  {
    slug: "prat-recon-reseau",
    title: "Reconnaissance réseau",
    order: 1,
    status: "active",
    icon: "Radar",
    accent: "#4FB3A7",
    description:
      "La première phase de toute intrusion : dresser la carte de la cible avant d'y toucher. Scan de ports avec Nmap, transferts de zone DNS, fingerprinting par TTL et fuites mDNS ou de certificats — tu découvres la surface d'attaque d'un réseau.",
    tagline: "Cartographier avant d'agir",
    parent: "cybersecurite-pratique",
  },
  {
    slug: "prat-recon-web",
    title: "Reconnaissance web",
    order: 2,
    status: "active",
    icon: "Globe",
    accent: "#5A93D6",
    description:
      "Le web laisse fuiter plus qu'on ne croit. Dépôts Git oubliés, hôtes virtuels cachés, API bavardes, verbes HTTP détournés, secrets dans le JavaScript et fichiers de sauvegarde accessibles — autant de portes que la reconnaissance web sait ouvrir.",
    tagline: "Explorer la surface exposée",
    parent: "cybersecurite-pratique",
  },
  {
    slug: "prat-interception-detect",
    title: "Interception & détection réseau",
    order: 3,
    status: "active",
    icon: "Waves",
    accent: "#8E7FD6",
    description:
      "Deux faces d'une même pièce : intercepter le trafic (ARP spoofing, sniffing SNMP et syslog, MAC flooding) et savoir le repérer côté défense (balises C2, exfiltration ICMP, flapping ARP, scans de ports). Tu passes tour à tour de l'attaquant à l'analyste.",
    tagline: "Écouter et repérer",
    parent: "cybersecurite-pratique",
  },
  {
    slug: "prat-privesc-lateral",
    title: "Élévation de privilèges & mouvement latéral",
    order: 4,
    status: "active",
    icon: "ArrowUpCircle",
    accent: "#E0A64F",
    description:
      "Une fois le pied dans la place, on grimpe et on se déplace. Capacités Linux, cron et SUID mal configurés, LD_PRELOAD, wildcards tar, fichier passwd inscriptible, rebond SSH — l'art de transformer un accès limité en contrôle total.",
    tagline: "Monter en droits, rebondir",
    parent: "cybersecurite-pratique",
  },
  {
    slug: "prat-securite-app",
    title: "Sécurité applicative",
    order: 5,
    status: "active",
    icon: "Bug",
    accent: "#E06E85",
    description:
      "Les failles applicatives classiques, dans du vrai code en conteneur : injection de commande, traversée de chemin (LFI), IDOR, SSRF, XXE et CORS mal configuré. Tu exploites la vulnérabilité, puis tu comprends comment la refermer.",
    tagline: "Exploiter le code faillible",
    parent: "cybersecurite-pratique",
  },
  {
    slug: "prat-services-exposes",
    title: "Services réseau exposés",
    order: 6,
    status: "active",
    icon: "ServerCog",
    accent: "#7DBB5A",
    description:
      "Des services de données laissés sans authentification, comme on les trouve trop souvent en production : Redis et Memcached ouverts, FTP anonyme recouvrant une racine web. Un simple client suffit alors à tout lire — ou à tout écrire.",
    tagline: "Ports ouverts, données à nu",
    parent: "cybersecurite-pratique",
  },

  // ── Checkpoint « Cybersécurité — Projets » (top-level, scénarios complets) ──
  {
    slug: "cybersecurite-projets",
    title: "Cybersécurité — Projets",
    order: 7,
    status: "active",
    icon: "ShieldAlert",
    accent: "#D96BA0",
    description:
      "Des scénarios complets où tu construis ET attaques ta propre architecture : DMZ, firewall, WAF, MFA. La théorie devient réflexe. Chaque projet t'installe dans un rôle de consultant sécurité, d'un dashboard de topologie réseau en direct plutôt que d'un simple terminal.",
    tagline: "Défense et attaque, dans le même scénario",
  },
];

/** Checkpoint every existing course is grouped under. */
export const CYBER_CHECKPOINT = "cybersecurite";
