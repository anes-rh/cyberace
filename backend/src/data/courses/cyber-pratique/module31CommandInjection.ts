import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 31 : injection de commande shell. Lab Docker réel. */
export const module31CommandInjection: CourseSeed[] = [
  {
    slug: "prat-command-injection",
    title: "Injection de commande shell",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Shell",
    domain: "Sécurité applicative",
    theme: "grid",
    icon: "Bug",
    accent: "#C4914F",
    order: 31,
    difficulty: "medium",
    summary:
      "Nouvelle série, nouveau terrain : la sécurité applicative. Un outil de diagnostic réseau interne accepte une adresse à pinger. Mal écrit, il transforme une simple adresse en commande shell complète — et t'exécute ce que tu veux.",
    objectives: [
      "Interroger un service web de diagnostic avec curl",
      "Comprendre comment une entrée devient une commande shell",
      "Enchaîner une seconde commande via un séparateur shell",
      "Exfiltrer un fichier en injectant sa lecture",
      "Nommer la cause (shell=True + concaténation) et la parade",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module31-command-injection:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🐚 Injection de commande shell — Silent Shell

Bienvenue dans la **2ᵉ série pratique** : la **sécurité applicative**. Le fil rouge de ces modules&nbsp;: une application fait **trop confiance** à ce que tu tapes. 🏎️

---

## 🧭 Le briefing

> Un **outil de diagnostic réseau** interne accepte une **adresse à pinger**. Ce genre d'outil, quand il est mal écrit, transforme une simple adresse en **commande shell complète**.

Tu es l'attaquant, avec \`curl\`. La cible sert \`http://target:8080/ping?host=...\`.

---

## 1. Comment naît l'injection de commande 🧩

Derrière l'outil, un code du genre&nbsp;:

\`\`\`python
subprocess.run(f"ping -c 1 {host}", shell=True, ...)
\`\`\`

Le paramètre \`host\` est **collé directement** dans une chaîne exécutée par le **shell** (\`shell=True\`). Le shell ne voit pas « une adresse »&nbsp;: il voit **une ligne de commande**. Tout caractère spécial du shell (\`;\`, \`|\`, \`&&\`, \`$(...)\`) reprend son **sens shell**.

---

## 2. Le séparateur de commande 🔗

Le caractère **\`;\`** termine une commande et en **enchaîne** une autre. Si \`host = "127.0.0.1; cat /flag.txt"\`, la ligne réellement exécutée devient&nbsp;:

\`\`\`bash
ping -c 1 127.0.0.1 ; cat /flag.txt
\`\`\`

→ le ping s'exécute, **puis** \`cat /flag.txt\` — dont la sortie t'est renvoyée.

---

## 3. Exploiter 🎯

\`\`\`bash
curl -G --data-urlencode "host=127.0.0.1; cat /flag.txt" http://target:8080/ping
\`\`\`

\`-G --data-urlencode\` encode proprement le \`;\` et les espaces dans l'URL. La réponse contient la sortie du ping **et** le contenu de \`/flag.txt\`.

---

## 4. Cause & correction 🛡️

- **Cause exacte** : \`shell=True\` + **concaténation directe** de l'entrée, sans échappement ni séparation des arguments.
- **Correction** : passer une **liste d'arguments** (\`subprocess.run(["ping","-c","1",host], shell=False)\`) — l'entrée n'est plus interprétée par un shell — et **valider** strictement \`host\`.

---

## 🧠 À retenir

- **\`shell=True\` + entrée concaténée** = injection de commande.
- Le **\`;\`** enchaîne une seconde commande shell.
- **\`curl -G --data-urlencode\`** encode le payload dans l'URL.
- Parade : **liste d'arguments** (\`shell=False\`) + validation stricte de l'entrée.
- Principe de la série : ne **jamais** utiliser une entrée utilisateur directement dans une opération sensible.`,
    badge: {
      id: "badge-prat-cmdinject",
      name: "Chuchoteur de Shell",
      icon: "Bug",
      description: "A fait exécuter sa propre commande à travers un simple champ de saisie.",
    },
    challenges: [
      {
        id: "prat-cmdinject-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Premier contact

Démarre le lab. Interroge l'outil de diagnostic :

\`\`\`bash
curl "http://target:8080/ping?host=127.0.0.1"
\`\`\`

**Question :** quel **outil en ligne de commande** envoie des requêtes HTTP ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** envoie la requête ; l'outil te renvoie la sortie d'un \`ping\` vers l'adresse fournie.`,
        tags: ["cmdinject", "curl", "recon"],
      },
      {
        id: "prat-cmdinject-t2",
        title: "Comprendre l'usage",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔎 Le paramètre attendu

Regarde l'URL d'usage affichée sur la page d'accueil (\`curl http://target:8080/\`).

**Question :** quel **paramètre GET** l'outil de diagnostic attend-il ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "host",
        caseSensitive: false,
        explanation: `Le paramètre **\`host\`** reçoit l'adresse à pinger — et c'est lui qui est collé dans la commande shell.`,
        tags: ["cmdinject", "parametre"],
      },
      {
        id: "prat-cmdinject-t3",
        title: "Le séparateur de commande",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔗 Enchaîner une commande

**Question :** quel **caractère shell** permet d'enchaîner une seconde commande après la première ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        options: [";", "@", "%", "$"],
        answer: 0,
        explanation: `Le **\`;\`** termine une commande et en démarre une autre sur la même ligne : \`ping ... ; cat /flag.txt\`.`,
        tags: ["cmdinject", "shell"],
      },
      {
        id: "prat-cmdinject-t4",
        title: "Exploiter",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Injecter la lecture du flag

\`\`\`bash
curl -G --data-urlencode "host=127.0.0.1; cat /flag.txt" http://target:8080/ping
\`\`\`

**Question :** colle le **flag** obtenu dans la sortie.`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "Utilise curl -G --data-urlencode pour bien encoder le point-virgule et les espaces dans l'URL.", cost: 25 },
          { text: "Commande complète : curl -G --data-urlencode \"host=127.0.0.1; cat /flag.txt\" http://target:8080/ping", cost: 40 },
        ],
        answer: "CYBERACE{injection_commande_shell_true}",
        caseSensitive: true,
        explanation: `Le \`;\` injecté fait exécuter \`cat /flag.txt\` après le ping → \`CYBERACE{injection_commande_shell_true}\`. L'application a exécuté ta commande sans le vouloir.`,
        tags: ["cmdinject", "flag"],
      },
      {
        id: "prat-cmdinject-t5",
        title: "La cause exacte",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 La cause technique

**Question :** quelle est la cause technique précise de cette vulnérabilité ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        options: [
          "`shell=True` combiné à une concaténation directe de l'entrée utilisateur dans la commande, sans échappement ni liste d'arguments séparés",
          "Le port 8080 n'est jamais sécurisé par défaut",
          "Python ne permet pas de valider les entrées utilisateur",
          "ping est un binaire intrinsèquement dangereux",
        ],
        answer: 0,
        explanation: `C'est **\`shell=True\` + concaténation directe** : l'entrée est interprétée par un shell. Sans ça (liste d'arguments), le \`;\` ne serait qu'un caractère du nom d'hôte.`,
        tags: ["cmdinject", "cause"],
      },
      {
        id: "prat-cmdinject-t6",
        title: "La bonne pratique",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Corriger

**Question :** quelle approche corrige cette vulnérabilité ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Utiliser une liste d'arguments séparés (`subprocess.run([...], shell=False)`) et valider/filtrer strictement l'entrée",
          "Changer le langage de programmation",
          "Interdire l'usage du caractère espace",
          "Chiffrer le paramètre host",
        ],
        answer: 0,
        explanation: `Une **liste d'arguments** (\`shell=False\`) fait passer \`host\` comme **un seul argument** à \`ping\`, jamais réinterprété par un shell. Combinée à une validation stricte, l'injection disparaît.`,
        tags: ["cmdinject", "contre-mesure"],
      },
      {
        id: "prat-cmdinject-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** quel principe général relie l'injection de commande aux autres modules applicatifs de cette série ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Une application fait confiance à une entrée utilisateur et l'utilise directement dans une opération sensible, sans validation",
          "Toutes les injections nécessitent obligatoirement un accès réseau",
          "Seul Python est concerné par ce type de faille",
          "Ce principe ne concerne que les applications web en PHP",
        ],
        answer: 0,
        explanation: `Le fil rouge de la série : une entrée utilisateur **non validée** utilisée directement dans une opération sensible (commande, chemin de fichier, requête, URL…).`,
        tags: ["cmdinject", "synthese"],
      },
    ],
  },
];
