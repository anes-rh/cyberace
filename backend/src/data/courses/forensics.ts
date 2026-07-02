import type { CourseSeed } from "../../types";

export const forensics: CourseSeed = {
  slug: "forensics",
  title: "Forensic numérique",
  codename: "Memory Dive",
  domain: "Forensic",
  theme: "dive",
  icon: "Fingerprint",
  accent: "#c084fc",
  order: 11,
  difficulty: "medium",
  summary:
    "Module bonus. Acquiers, préserve, analyse : de l'empreinte d'intégrité aux octets magiques, mène l'enquête sans altérer la scène.",
  objectives: [
    "Respecter l'intégrité et la chaîne de possession des preuves",
    "Connaître les outils d'analyse mémoire (Volatility)",
    "Identifier un fichier par ses octets magiques",
    "Comprendre le rôle du bloqueur d'écriture",
  ],
  lesson: `## Les règles d'or de l'investigation

1. **Ne pas altérer** la preuve : on travaille sur une **copie bit à bit** (image), pas sur l'original.
2. **Intégrité** : on calcule un **hash (SHA-256)** avant/après ; s'ils correspondent, la copie est fidèle et non modifiée.
3. **Chaîne de possession** (chain of custody) : qui a manipulé quoi, quand, comment — documenté de bout en bout, sinon la preuve est irrecevable.
4. **Ordre de volatilité** : capturer d'abord le plus éphémère (RAM, connexions) avant le disque.

## Acquisition

Un **bloqueur d'écriture (write blocker)** garantit qu'on lit le disque sans jamais y écrire, préservant l'intégrité pour l'analyse et le tribunal.

## Analyse mémoire

Un dump de RAM révèle processus, connexions, clés, malware sans fichier. **Volatility** est l'outil de référence : \`pslist\`, \`netscan\`, \`malfind\`, \`cmdline\`…

## Artefacts disque & carving

Journaux, MFT (NTFS), registre Windows, historique. Le **file carving** reconstruit des fichiers effacés à partir de leurs **octets magiques** (signatures) :
- \`FF D8 FF\` → JPEG
- \`89 50 4E 47\` → PNG
- \`25 50 44 46\` → PDF (\`%PDF\`)
- \`50 4B 03 04\` → ZIP / documents Office

La **timeline** (super-timeline avec Plaso) recolle la chronologie des événements.`,
  badge: {
    id: "badge-examiner",
    name: "Examiner",
    icon: "Fingerprint",
    description: "Mène une investigation en préservant l'intégrité des preuves.",
  },
  challenges: [
    {
      id: "for-hash-integrity",
      title: "Preuve intacte",
      order: 1,
      difficulty: "easy",
      type: "mcq",
      points: 110,
      timeLimitSec: 150,
      prompt:
        "Pourquoi calcule-t-on un **hash SHA-256** d'un disque avant et après acquisition ?",
      options: [
        "Pour prouver que la copie est identique à l'original et n'a pas été altérée",
        "Pour chiffrer les données sensibles",
        "Pour compresser l'image disque",
        "Pour accélérer l'analyse",
      ],
      answer: 0,
      hints: [{ text: "Deux hash identiques = données identiques.", cost: 15 }],
      explanation:
        "Des hash identiques avant/après garantissent l'intégrité : la copie est fidèle et n'a pas bougé — condition de recevabilité de la preuve.",
      tags: ["integrite", "hash", "chain-of-custody"],
    },
    {
      id: "for-volatility",
      title: "Plonger dans la RAM",
      order: 2,
      difficulty: "medium",
      type: "mcq",
      points: 190,
      timeLimitSec: 160,
      prompt: "Quel outil est la référence pour l'**analyse d'un dump mémoire** ?",
      options: ["Volatility", "Wireshark", "Nmap", "John the Ripper"],
      answer: 0,
      hints: [{ text: "pslist, netscan, malfind sont ses plugins.", cost: 20 }],
      explanation:
        "Volatility analyse les dumps de RAM : processus cachés, connexions, injection de code (malfind), etc. Wireshark = réseau, Nmap = scan, John = crack.",
      tags: ["volatility", "memoire"],
    },
    {
      id: "for-magic-bytes",
      title: "Signature du fichier",
      order: 3,
      difficulty: "medium",
      type: "text",
      points: 200,
      timeLimitSec: 200,
      widget: "cipher-lab",
      prompt:
        "Lors d'un file carving, un fichier sans extension commence par ces octets :\n\n    25 50 44 46\n\nDe **quel format** s'agit-il ? (indice : décode l'hexa en ASCII)",
      hints: [
        { text: "0x25 = '%'. Décode les 4 octets.", cost: 25 },
        { text: "Les octets donnent « %PDF ».", cost: 35 },
      ],
      answer: "PDF",
      accept: ["pdf", ".pdf", "%pdf", "document pdf"],
      explanation:
        "25 50 44 46 = « %PDF » : c'est la signature d'un fichier PDF. Les octets magiques identifient un format indépendamment de l'extension.",
      tags: ["carving", "magic-bytes", "hex"],
    },
    {
      id: "for-write-blocker",
      title: "Lire sans écrire",
      order: 4,
      difficulty: "hard",
      type: "mcq",
      points: 300,
      timeLimitSec: 200,
      prompt: "À quoi sert un **bloqueur d'écriture (write blocker)** lors de l'acquisition ?",
      options: [
        "Permettre de lire le disque source sans jamais y écrire, préservant son intégrité",
        "Chiffrer automatiquement l'image acquise",
        "Empêcher la lecture du disque par des tiers",
        "Effacer les secteurs défectueux",
      ],
      answer: 0,
      hints: [{ text: "Le but est de ne rien modifier sur l'original.", cost: 40 }],
      explanation:
        "Le write blocker autorise la lecture mais bloque toute écriture sur le disque source : l'original reste inchangé, l'intégrité (et la recevabilité) est préservée.",
      tags: ["acquisition", "write-blocker"],
    },
  ],
};
