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
    title: "Cybersécurité",
    order: 5,
    status: "active",
    icon: "ShieldCheck",
    accent: "#9B8CCB",
    description:
      "Le grand final : cryptographie, contrôle d'accès, Active Directory, réseau, système, SOC, systèmes distribués, bases de données, paiement, OSINT, forensic, cloud, web et social engineering.",
    tagline: "Checkpoint final",
  },
];

/** Checkpoint every existing course is grouped under. */
export const CYBER_CHECKPOINT = "cybersecurite";
