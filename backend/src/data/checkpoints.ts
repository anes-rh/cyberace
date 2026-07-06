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
    status: "empty",
    icon: "Cpu",
    accent: "#E8A87C",
    description: "Processus, mémoire, ordonnancement, systèmes de fichiers et concurrence.",
    tagline: "Bientôt disponible",
  },
  {
    slug: "base-de-donnees",
    title: "Base de données",
    order: 3,
    status: "empty",
    icon: "Database",
    accent: "#93B896",
    description: "Modélisation, SQL, transactions, indexation et intégrité.",
    tagline: "Bientôt disponible",
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
