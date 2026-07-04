/**
 * Editable content for the landing page (`/`).
 * Tweak these arrays to update the home page — no component changes needed.
 */

export interface NewsItem {
  /** Small pill label, e.g. "Nouveau checkpoint". */
  tag: string;
  title: string;
  description: string;
  /** Where the card links to. */
  href: string;
  /** Pastel accent hex (matches the checkpoint palette). */
  accent: string;
  /** lucide-react icon name (see components/ui/Icon). */
  icon: string;
}

/** Latest platform announcements / newly added content. */
export const NEWS: NewsItem[] = [
  {
    tag: "Nouveau checkpoint",
    title: "Algorithmique — 9 modules, 71 défis",
    description:
      "Du pseudo-code aux structures dynamiques, complexité, piles/files et arbres — cours vulgarisés, TD corrigés et TP en C avec éditeur intégré.",
    href: "/checkpoints/algorithmique",
    accent: "#6FA8DC",
    icon: "Binary",
  },
  {
    tag: "Éditeur de code",
    title: "Écris et exécute du C dans le navigateur",
    description:
      "Les TP proposent un éditeur avec coloration syntaxique et un bouton « Compiler & Exécuter » pour tester ton code en direct.",
    href: "/apprentissage",
    accent: "#5FB3C6",
    icon: "Cpu",
  },
  {
    tag: "Bientôt",
    title: "Système d'exploitation, BDD & Réseaux",
    description:
      "Trois nouveaux checkpoints arrivent sur la route pour compléter ton parcours d'apprentissage.",
    href: "/apprentissage",
    accent: "#93B896",
    icon: "Route",
  },
];

export interface HowStep {
  /** lucide-react icon name. */
  icon: string;
  title: string;
  description: string;
}

/** "How it works" — the platform in a few steps. */
export const HOW_IT_WORKS: HowStep[] = [
  {
    icon: "Route",
    title: "Suis la route des checkpoints",
    description: "Chaque checkpoint est un grand thème (Algorithmique, Cybersécurité…) posé le long d'une route 3D à parcourir à ton rythme.",
  },
  {
    icon: "Grid3x3",
    title: "Ouvre les modules",
    description: "Un checkpoint regroupe plusieurs modules : un mini-cours clair suivi d'une série de défis pratiques de difficulté croissante.",
  },
  {
    icon: "Flag",
    title: "Relève les défis",
    description: "QCM, calculs, remises en ordre, et vrais éditeurs de code (pseudo-code & C) — avec des indices bienveillants si tu bloques.",
  },
  {
    icon: "Trophy",
    title: "Gagne points & badges",
    description: "Résous vite pour un bonus de vitesse, grimpe au classement, et débloque un badge à chaque module terminé.",
  },
];

export interface Testimonial {
  name: string;
  role: string;
  /** Seed for the generated initials avatar (no external image needed). */
  avatarSeed: string;
  text: string;
  /** 1–5 stars. */
  rating: number;
}

/**
 * ⚠️ CONTENU PLACEHOLDER (fictif) — à remplacer par de vrais témoignages.
 * Structure prête : name, role, avatarSeed, text, rating.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Yasmine B.",
    role: "Étudiante en informatique",
    avatarSeed: "yasmine",
    text: "Enfin une plateforme où l'algo ne fait pas peur. Les traces d'exécution détaillées m'ont débloquée sur les boucles.",
    rating: 5,
  },
  {
    name: "Karim D.",
    role: "Développeur junior",
    avatarSeed: "karim",
    text: "L'éditeur de code intégré est génial pour réviser le C sans rien installer. Le côté course rend l'apprentissage addictif.",
    rating: 5,
  },
  {
    name: "Lina M.",
    role: "Reconversion cybersécurité",
    avatarSeed: "lina",
    text: "Les checkpoints donnent une vraie progression. Je vois exactement où j'en suis et ce qu'il me reste à débloquer.",
    rating: 4,
  },
];

/** Contact details shown in the footer/contact section. */
export const CONTACT = {
  instagram: "@xpress-tech",
  instagramUrl: "https://instagram.com/xpress-tech",
  email: "bros123xpresstech@gmail.com",
};
