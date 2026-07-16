import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 32 : LFI / traversée de répertoire. Lab Docker réel. */
export const module32LfiTraversal: CourseSeed[] = [
  {
    slug: "prat-lfi-traversal",
    title: "Inclusion de fichier local (traversée)",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Path",
    domain: "Sécurité applicative",
    theme: "grid",
    icon: "FolderTree",
    accent: "#4FC491",
    order: 32,
    difficulty: "medium",
    summary:
      "Un portail affiche des pages internes par nom. Le nom n'est jamais vérifié avant de construire un chemin de fichier : en glissant des ../ tu remontes l'arborescence et lis des fichiers arbitraires du serveur.",
    objectives: [
      "Afficher une page normale via un paramètre",
      "Comprendre la séquence de remontée ../",
      "Construire un chemin traversant vers un fichier sensible",
      "Nommer la vulnérabilité (LFI)",
      "Corriger par liste blanche de pages",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module32-lfi-traversal:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🌲 Inclusion de fichier local — Silent Path

Ce portail affiche des pages internes **par nom**. Le nom de page n'est **jamais vérifié** avant d'être utilisé pour construire un **chemin de fichier**. 🏎️

---

## 🧭 Le briefing

> Ce portail affiche des pages internes par nom (\`/view?page=accueil\`). Le nom de page n'est jamais vérifié avant d'être utilisé pour construire un chemin de fichier.

Tu es l'attaquant, avec \`curl\`.

---

## 1. Usage normal 📄

\`\`\`bash
curl "http://target:8080/view?page=accueil"
\`\`\`

Le serveur fait \`open("/srv/pages/" + page)\`. Avec \`page=accueil\` → lit \`/srv/pages/accueil\`. Mais rien n'empêche \`page\` de contenir autre chose…

---

## 2. La traversée de répertoire ⬆️

La séquence **\`../\`** remonte d'**un niveau** de répertoire. En enchaînant assez de \`../\`, on quitte \`/srv/pages\` et on remonte jusqu'à la **racine** \`/\`, puis on redescend vers n'importe quel fichier&nbsp;:

\`\`\`
/srv/pages/../../../../root/notes.txt  →  /root/notes.txt
\`\`\`

---

## 3. Exploiter 🎯

\`\`\`bash
curl "http://target:8080/view?page=../../../../root/notes.txt"
\`\`\`

Plusieurs \`../\` successifs garantissent de remonter assez haut (les \`../\` en trop à la racine sont sans effet). Le serveur lit et renvoie \`/root/notes.txt\`.

---

## 4. Nommer & corriger 🛡️

- **Vulnérabilité** : **inclusion de fichier local** (*Local File Inclusion*, LFI) via **traversée de répertoire** (*path traversal*).
- **Correction** : **liste blanche** de pages autorisées (\`if page in {"accueil","aide"}: ...\`), plutôt que de construire un chemin directement depuis l'entrée. Filtrer \`../\` seul est fragile (contournements par encodage).

---

## 🧠 À retenir

- Construire un **chemin de fichier** depuis une entrée non validée = **LFI**.
- **\`../\`** remonte d'un répertoire ; répété, il atteint des fichiers arbitraires.
- Parade : **liste blanche** de ressources, jamais un chemin dérivé de l'entrée.
- Même principe que le Module 31 : entrée utilisateur → opération sensible sans validation.`,
    badge: {
      id: "badge-prat-lfi",
      name: "Arpenteur de Chemins",
      icon: "FolderTree",
      description: "A remonté l'arborescence jusqu'à un fichier qu'il n'aurait jamais dû atteindre.",
    },
    challenges: [
      {
        id: "prat-lfi-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Premier contact

Démarre le lab. Interroge le portail :

\`\`\`bash
curl "http://target:8080/view?page=accueil"
\`\`\`

**Question :** quel **outil en ligne de commande** récupère une URL ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** affiche la page « accueil ». Le paramètre \`page\` pilote quel fichier est lu.`,
        tags: ["lfi", "curl", "recon"],
      },
      {
        id: "prat-lfi-t2",
        title: "Usage normal",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔎 Le paramètre

\`\`\`bash
curl "http://target:8080/view?page=accueil"
\`\`\`

**Question :** quel **paramètre GET** sélectionne la page affichée ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "page",
        caseSensitive: false,
        explanation: `Le paramètre **\`page\`** est concaténé au dossier \`/srv/pages/\` pour former le chemin lu — c'est le point d'entrée de la traversée.`,
        tags: ["lfi", "parametre"],
      },
      {
        id: "prat-lfi-t3",
        title: "La séquence de remontée",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⬆️ Remonter d'un répertoire

**Question :** quelle **séquence de caractères** permet de remonter d'un niveau de répertoire sous Unix ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        options: ["../", "./", "~/", "//"],
        answer: 0,
        explanation: `**\`../\`** désigne le répertoire **parent**. Répétée, elle remonte jusqu'à la racine avant de redescendre où l'on veut.`,
        tags: ["lfi", "path-traversal"],
      },
      {
        id: "prat-lfi-t4",
        title: "Exploiter",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Traverser jusqu'au fichier

\`\`\`bash
curl "http://target:8080/view?page=../../../../root/notes.txt"
\`\`\`

**Question :** colle le **flag** contenu dans le fichier lu.`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "Plusieurs ../ successifs peuvent être nécessaires pour remonter suffisamment haut (les ../ en trop sont sans effet).", cost: 20 },
          { text: "Chemin complet : page=../../../../root/notes.txt", cost: 35 },
        ],
        answer: "CYBERACE{inclusion_fichier_local_traversal}",
        caseSensitive: true,
        explanation: `Les \`../\` font sortir de \`/srv/pages\` jusqu'à \`/\`, puis \`/root/notes.txt\` est lu → \`CYBERACE{inclusion_fichier_local_traversal}\`.`,
        tags: ["lfi", "flag"],
      },
      {
        id: "prat-lfi-t5",
        title: "Nommer la vulnérabilité",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Nommer la faille

**Question :** comment appelle-t-on cette catégorie de vulnérabilité, qui permet de lire des fichiers arbitraires du serveur via un paramètre mal validé ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "inclusion de fichier local",
        accept: ["local file inclusion", "lfi"],
        caseSensitive: false,
        explanation: `C'est l'**inclusion de fichier local** (*LFI*), ici via **traversée de répertoire**. Un chemin construit depuis l'entrée donne accès à tout le système de fichiers.`,
        tags: ["lfi", "vocabulaire"],
      },
      {
        id: "prat-lfi-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Corriger

**Question :** quelle approche corrige cette vulnérabilité ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Valider le paramètre contre une liste blanche de pages autorisées, plutôt que de construire un chemin de fichier directement à partir de l'entrée utilisateur",
          "Interdire uniquement le caractère point",
          "Chiffrer le nom des pages",
          "Augmenter les permissions du dossier /srv/pages",
        ],
        answer: 0,
        explanation: `Une **liste blanche** de pages autorisées empêche tout chemin arbitraire. Filtrer « . » ou « ../ » seul se contourne (encodage, variantes) — la liste blanche est la vraie parade.`,
        tags: ["lfi", "contre-mesure"],
      },
      {
        id: "prat-lfi-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** quel est le point commun avec le Module 31 (injection de commande) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Une entrée utilisateur est utilisée directement dans une opération sensible (construction de commande, ou de chemin de fichier) sans validation",
          "Les deux modules utilisent exactement le même code",
          "Les deux nécessitent une élévation de privilèges préalable",
          "Il n'y a aucun point commun",
        ],
        answer: 0,
        explanation: `Même racine : une **entrée non validée** utilisée directement dans une opération sensible — une commande shell au Module 31, un chemin de fichier ici.`,
        tags: ["lfi", "synthese"],
      },
    ],
  },
];
