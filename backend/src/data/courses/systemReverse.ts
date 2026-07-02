import type { CourseSeed } from "../../types";

export const systemReverse: CourseSeed = {
  slug: "system-reverse",
  title: "Sécurité système & reverse",
  codename: "Binary Descent",
  domain: "Système & Reverse",
  theme: "descent",
  icon: "Binary",
  accent: "#fb923c",
  order: 5,
  difficulty: "hard",
  summary:
    "Protections mémoire, rootkits et premiers pas en rétro-ingénierie : plonge dans le binaire et remonte avec le flag.",
  objectives: [
    "Distinguer NX/DEP, ASLR, stack canaries et PIE",
    "Comprendre où opèrent les rootkits userland vs noyau",
    "Extraire de l'information par analyse statique (strings, encodages)",
    "Décoder des données embarquées (hex, base64, XOR)",
  ],
  lesson: `## Les gardes-fous de la mémoire

- **NX / DEP** (No-eXecute / Data Execution Prevention) : les pages de données (pile, tas) ne sont pas exécutables → le shellcode sur la pile ne tourne plus. Contournement : **ROP**.
- **ASLR** : randomise les adresses (pile, tas, bibliothèques) pour empêcher de prédire où sauter. Efficace surtout couplé à **PIE** (exécutable indépendant de la position).
- **Stack canary** : une valeur secrète placée avant l'adresse de retour ; si un débordement l'écrase, le programme s'arrête (détection de *stack smashing*).
- **RELRO** : protège la GOT contre la réécriture.

## Rootkits

Un rootkit cherche la **persistance furtive** :
- **Userland** : hooke des fonctions de bibliothèque (LD_PRELOAD), remplace des binaires (\`ps\`, \`ls\`).
- **Noyau** : le plus puissant — modifie la **table des appels système (syscall table)** ou les structures du noyau (DKOM) pour cacher processus, fichiers, connexions. Détection : vérification d'intégrité, comparaison vues noyau/userland.

## Rétro-ingénierie : par où commencer

1. **Reconnaissance** : \`file\`, \`strings\`, \`nm\`, entêtes ELF/PE.
2. **Statique** : désassemblage (Ghidra, IDA, radare2), lecture du flux de contrôle.
3. **Dynamique** : débogage (gdb), points d'arrêt, observation des registres.

Souvent, un binaire *easy* cache sa clé sous un encodage trivial : **hexadécimal**, **base64** ou **XOR** à un octet. Repère la donnée, identifie l'encodage, décode.`,
  badge: {
    id: "badge-reverser",
    name: "Reverser",
    icon: "Binary",
    description: "A décodé des données embarquées et compris les protections mémoire.",
  },
  challenges: [
    {
      id: "sys-nx-dep",
      title: "Pile non exécutable",
      order: 1,
      difficulty: "easy",
      type: "mcq",
      points: 120,
      timeLimitSec: 150,
      prompt:
        "Quelle protection empêche l'exécution de shellcode directement placé sur la **pile** ?",
      options: [
        "NX / DEP (pages de données non exécutables)",
        "ASLR",
        "Le stack canary",
        "RELRO",
      ],
      answer: 0,
      hints: [{ text: "Le nom décrit exactement l'effet : No-eXecute.", cost: 15 }],
      explanation:
        "NX/DEP marque la pile et le tas comme non exécutables. Pour contourner, l'attaquant réutilise du code existant : c'est le ROP (Return-Oriented Programming).",
      tags: ["nx", "dep", "memoire"],
    },
    {
      id: "sys-hex-decode",
      title: "strings ne ment pas",
      order: 2,
      difficulty: "medium",
      type: "text",
      points: 200,
      timeLimitSec: 240,
      widget: "cipher-lab",
      prompt:
        "La commande `strings` sur le binaire révèle cette chaîne suspecte :\n\n    63796265726163657b6865787d\n\nDécode cet **hexadécimal** en ASCII pour obtenir le flag.",
      hints: [
        { text: "Chaque octet = 2 caractères hexa. 0x63 = 'c'.", cost: 25 },
        { text: "Utilise l'onglet Hex de l'outil de décodage.", cost: 35 },
      ],
      answer: "cyberace{hex}",
      accept: ["CYBERACE{HEX}"],
      explanation:
        "L'hexadécimal se lit deux caractères par octet : 63='c', 79='y'… → cyberace{hex}. Un classique des challenges reverse « easy ».",
      tags: ["reverse", "hex", "strings"],
    },
    {
      id: "sys-aslr",
      title: "Adresses mouvantes",
      order: 3,
      difficulty: "medium",
      type: "mcq",
      points: 210,
      timeLimitSec: 180,
      prompt: "À quoi sert **ASLR** ?",
      options: [
        "Randomiser les adresses mémoire pour rendre les cibles imprévisibles",
        "Chiffrer la pile à chaque appel de fonction",
        "Empêcher toute lecture de la mémoire",
        "Vérifier l'intégrité de l'adresse de retour",
      ],
      answer: 0,
      hints: [{ text: "Address Space Layout Randomization.", cost: 20 }],
      explanation:
        "ASLR randomise la disposition mémoire, empêchant de prédire l'adresse d'un gadget ou d'une fonction. Couplé à PIE, il complique fortement l'exploitation.",
      tags: ["aslr", "memoire"],
    },
    {
      id: "sys-kernel-rootkit",
      title: "Au cœur du noyau",
      order: 4,
      difficulty: "hard",
      type: "mcq",
      points: 340,
      timeLimitSec: 220,
      prompt:
        "Un rootkit **en espace noyau** veut cacher un processus. Que modifie-t-il typiquement ?",
      options: [
        "La table des appels système ou les structures du noyau (DKOM)",
        "Le fichier /etc/passwd uniquement",
        "Le vecteur d'initialisation WEP",
        "La GOT de l'exécutable ciblé",
      ],
      answer: 0,
      hints: [{ text: "Pense syscall table hooking et Direct Kernel Object Manipulation.", cost: 45 }],
      explanation:
        "Un rootkit noyau intercepte la syscall table ou manipule directement les objets du noyau (DKOM) pour masquer processus/fichiers/connexions — d'où sa furtivité et la difficulté de détection.",
      tags: ["rootkit", "noyau", "dkom"],
    },
  ],
};
