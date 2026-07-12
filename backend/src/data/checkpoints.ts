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
      "Le prolongement pratique du parcours théorique : de vrais conteneurs isolés, un vrai terminal, de vraies commandes. Chaque module reprend des notions vues côté théorie et te met aux commandes — dans un ordre volontairement mélangé entre réseau, système et reconnaissance, pas un thème à la fois.",
    tagline: "Environnements réels, terminal en direct",
  },
];

/** Checkpoint every existing course is grouped under. */
export const CYBER_CHECKPOINT = "cybersecurite";
