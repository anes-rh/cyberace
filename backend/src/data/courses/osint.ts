import type { CourseSeed } from "../../types";

export const osint: CourseSeed = {
  slug: "osint-recon",
  title: "OSINT & reconnaissance",
  codename: "Ghost Trail",
  domain: "OSINT",
  theme: "trail",
  icon: "Ghost",
  accent: "#2dd4bf",
  order: 10,
  difficulty: "easy",
  summary:
    "Module bonus. Suis la trace : dorks Google, métadonnées EXIF, transparence des certificats — la recon avant l'attaque.",
  objectives: [
    "Utiliser les opérateurs de recherche avancée (dorking)",
    "Extraire de l'information des métadonnées de fichiers",
    "Découvrir des sous-domaines via la Certificate Transparency",
    "Décoder des identifiants obfusqués",
  ],
  lesson: `## OSINT : tout est déjà là

La **recon passive** collecte de l'information publique sans toucher la cible. Bien menée, elle dresse la carte avant le premier paquet envoyé.

## Google Dorking

Des opérateurs affinent la recherche :
- \`site:\` — restreint à un domaine.
- \`filetype:\` — cible une extension (\`filetype:pdf\`, \`filetype:log\`).
- \`intitle:\` / \`inurl:\` — motifs dans le titre / l'URL. \`intitle:"index of"\` révèle des listings de répertoires.
- \`-mot\` exclut, \`"phrase exacte"\` verrouille.

## Métadonnées

Les fichiers trahissent : les **EXIF** d'une photo contiennent souvent modèle d'appareil, date et **coordonnées GPS**. Les documents Office/PDF portent auteur, logiciel, chemins internes. \`exiftool\` est l'outil de référence.

## Certificate Transparency

Chaque certificat TLS émis est journalisé publiquement. Interroger **crt.sh** (logs CT) révèle des **sous-domaines** oubliés — une mine pour cartographier une surface d'attaque.

## Autres pistes

Énumération de pseudos multi-plateformes, archives (Wayback Machine), fuites de données, et **désobfuscation** : un identifiant est parfois simplement encodé en base64 ou en hexadécimal.

> Éthique : l'OSINT reste de la collecte publique. Le respect de la loi et de la vie privée n'est pas optionnel.`,
  badge: {
    id: "badge-ghost",
    name: "Ghost",
    icon: "Ghost",
    description: "Sait cartographier une cible à partir de sources ouvertes.",
  },
  challenges: [
    {
      id: "osint-filetype",
      title: "Cibler l'extension",
      order: 1,
      difficulty: "easy",
      type: "text",
      points: 100,
      timeLimitSec: 150,
      prompt:
        "Quel **opérateur Google** limite les résultats à un type de fichier précis (ex. les journaux `.log`) ?\n\nRéponds par l'opérateur (avec les deux-points).",
      hints: [{ text: "Il s'écrit comme le mot anglais pour « type de fichier ».", cost: 15 }],
      answer: "filetype:",
      accept: ["filetype", "filetype:", "ext:"],
      explanation:
        "`filetype:` (ou `ext:`) restreint aux fichiers d'une extension : `filetype:log`, `filetype:pdf`… Combiné à `site:`, c'est redoutable.",
      tags: ["dorking", "google"],
    },
    {
      id: "osint-exif-gps",
      title: "La photo qui parle",
      order: 2,
      difficulty: "easy",
      type: "mcq",
      points: 120,
      timeLimitSec: 150,
      prompt:
        "Une photo publiée telle quelle par une cible peut révéler sa localisation. Quelle donnée l'y expose ?",
      options: [
        "Les coordonnées GPS dans les métadonnées EXIF",
        "La résolution de l'image",
        "Le format JPEG lui-même",
        "Le nombre de couleurs",
      ],
      answer: 0,
      hints: [{ text: "Regarde les EXIF avec exiftool.", cost: 20 }],
      explanation:
        "Beaucoup d'appareils inscrivent la latitude/longitude en EXIF. Publier une photo brute peut donc géolocaliser son auteur.",
      tags: ["exif", "metadata", "geoloc"],
    },
    {
      id: "osint-crtsh",
      title: "Sous-domaines oubliés",
      order: 3,
      difficulty: "medium",
      type: "mcq",
      points: 190,
      timeLimitSec: 180,
      prompt:
        "Quelle source publique permet d'énumérer des **sous-domaines** grâce aux certificats TLS émis ?",
      options: [
        "Les logs de Certificate Transparency (ex. crt.sh)",
        "Le fichier robots.txt",
        "Le cache DNS local",
        "Les métadonnées EXIF",
      ],
      answer: 0,
      hints: [{ text: "Chaque certificat émis est journalisé publiquement.", cost: 25 }],
      explanation:
        "La Certificate Transparency journalise tous les certificats. Interroger crt.sh révèle des sous-domaines (souvent internes/oubliés) inclus dans les SAN.",
      tags: ["certificate-transparency", "subdomains"],
    },
    {
      id: "osint-b64-handle",
      title: "Pseudo obfusqué",
      order: 4,
      difficulty: "medium",
      type: "text",
      points: 200,
      timeLimitSec: 200,
      widget: "cipher-lab",
      prompt:
        "Dans un profil, un identifiant est masqué en **base64** :\n\n    Z2hvc3Q=\n\nDécode-le pour retrouver le pseudo.",
      hints: [{ text: "La terminaison `=` est un indice de padding base64.", cost: 25 }],
      answer: "ghost",
      accept: ["GHOST"],
      explanation:
        "Base64 « Z2hvc3Q= » se décode en « ghost ». L'encodage n'est pas du chiffrement : il ne protège rien, il obscurcit à peine.",
      tags: ["base64", "desobfuscation"],
    },
  ],
};
