import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 57 (Défense) : corréler une connexion active à son vrai processus. Réutilise /proc/PID/exe (Module 55). */
export const module57ActiveConnectionsInvestigation: CourseSeed[] = [
  {
    slug: "prat-defense-active-connections-investigation",
    title: "Connexions actives — le vrai processus derrière le nom",
    checkpoint: "defense",
    codename: "Silent Socket",
    domain: "Défense — Investigation système",
    theme: "grid",
    icon: "Network",
    accent: "#4FC48A",
    order: 57,
    difficulty: "hard",
    summary:
      "Une connexion réseau active tourne, associée à un processus au nom rassurant ('system-update-agent'). Mais un nom n'est jamais une preuve. En repartant de la connexion (ss -tp) et en vérifiant /proc/PID/exe — la technique du Module 55 — tu remontes au binaire réel : un simple bash déguisé, pas un outil de mise à jour.",
    objectives: [
      "Lister les connexions actives avec leur processus (ss -tp)",
      "Compter les connexions établies hors terminal web",
      "Identifier le port local d'écoute",
      "Comprendre qu'un nom de processus ne prouve rien",
      "Remonter au binaire réel via /proc/PID/exe (bash déguisé)",
    ],
    sandbox: {
      attackerImage: "cyberace/module57-active-connections:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🔌 Connexions actives — Silent Socket

Au Module 55, tu partais d'une **liste de processus**. Ici tu pars d'une **connexion réseau active** pour remonter au processus réel — même technique \`/proc/PID/exe\`, angle différent. 🧵

---

## 🧭 Le briefing

> *"Une connexion réseau active tourne sur cette machine, associée à un processus au nom qui semble légitime. Le nom d'un processus n'est jamais une preuve — vérifie ce qu'il exécute réellement."*

Terminal **en root**. La connexion « suspecte » est établie en **loopback** dans le conteneur (aucune capacité réseau spéciale requise).

---

## 1. Lister les connexions 📋

\`\`\`bash
ss -tp        # -t : TCP, -p : le processus associé (PID + nom)
\`\`\`

Hors la connexion du terminal web (\`ttyd\`), une connexion **ESTABLISHED** apparaît sur le port local **4444**, associée à un processus nommé **\`system-update-agent\`**.

---

## 2. Le nom ne suffit pas 🚫

\`system-update-agent\` **inspire confiance**. Mais ce nom a été **choisi arbitrairement** par le programme lui-même (via \`exec -a\`, comme au Module 55). Un nom plausible ne prouve **rien**.

---

## 3. Remonter au binaire réel 🔍

On récupère le PID (colonne \`pid=\` de \`ss -tp\`), puis :

\`\`\`bash
ls -la /proc/PID/exe        # ou readlink /proc/PID/exe
\`\`\`

Le lien pointe vers **\`/bin/bash\`** : le prétendu « agent de mise à jour » est en réalité un **bash** maquillé, maintenant une connexion (\`/dev/tcp\`) — pas un outil système officiel.

## 🧠 À retenir

- Connexions + processus : \`ss -tp\` (ou \`netstat -tp\`).
- Un **nom de processus** est arbitraire (\`exec -a\`) : jamais une preuve de légitimité.
- Remonter au binaire réel : \`ls -la /proc/PID/exe\` — ici \`/bin/bash\` déguisé.
- Même technique qu'au Module 55, appliquée à partir d'une **connexion réseau** au lieu d'une liste de processus.
- Principe : vérifier le **comportement réel** (binaire, socket) derrière l'apparence.`,
    badge: {
      id: "badge-prat-activeconn",
      name: "Correlateur de Sockets",
      icon: "Network",
      description: "A retrouvé le vrai processus derrière une connexion au nom trompeur.",
    },
    challenges: [
      {
        id: "prat-activeconn-t1",
        title: "Lister les connexions",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 📋 Connexions + processus

**Question :** quelle commande liste les connexions réseau actives avec le processus associé (option -p) ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "ss -tp",
        accept: ["netstat -tp"],
        caseSensitive: false,
        explanation: `**\`ss -tp\`** (ou \`netstat -tp\`) liste les connexions TCP (\`-t\`) avec le **processus** associé (\`-p\` : PID + nom). C'est le point de départ pour relier une socket à un programme.`,
        tags: ["defense", "connexions", "ss"],
      },
      {
        id: "prat-activeconn-t2",
        title: "Compter",
        order: 2,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🔢 Combien de connexions ?

**Question :** combien de connexions ESTABLISHED apparaissent, en dehors du terminal web (ttyd) lui-même ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: 1,
        explanation: `**1** connexion ESTABLISHED en plus de celle de \`ttyd\` : la socket loopback du processus déguisé sur le port 4444. C'est elle qu'on investigue.`,
        tags: ["defense", "connexions", "established"],
      },
      {
        id: "prat-activeconn-t3",
        title: "Le port local",
        order: 3,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🔌 Le port d'écoute

**Question :** quel port local est utilisé côté écoute dans cette connexion ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: 4444,
        explanation: `Le port **4444** (un port de rétro-shell/écoute très classique). Le processus déguisé y maintient une connexion vers le \`ncat\` en écoute — un canal persistant.`,
        tags: ["defense", "connexions", "port"],
      },
      {
        id: "prat-activeconn-t4",
        title: "Le nom ne suffit pas",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚫 Confiance mal placée

**Question :** le processus associé s'appelle 'system-update-agent'. Ce nom suffit-il à confirmer sa légitimité ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Non, un nom plausible peut être choisi arbitrairement par le programme lui-même",
          "Oui, un nom aussi précis ne peut être que légitime",
          "Le nom d'un processus ne peut jamais être modifié",
          "Seul root peut vérifier le nom d'un processus",
        ],
        answer: 0,
        explanation: `Un programme choisit **lui-même** son argv[0] (via \`exec -a\`). \`system-update-agent\` est un déguisement — exactement comme le \`[kworker/0:2]\` du Module 55. Le nom ne prouve rien.`,
        tags: ["defense", "connexions", "nom"],
      },
      {
        id: "prat-activeconn-t5",
        title: "Vérifier le binaire réel",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔍 Le vrai exécutable

**Question :** quelle commande, déjà utilisée au Module 55, affiche le chemin réel de l'exécutable associé à un PID ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "ls -la /proc/PID/exe",
        accept: ["readlink /proc/PID/exe"],
        caseSensitive: false,
        explanation: `\`ls -la /proc/PID/exe\` (ou \`readlink\`) révèle le binaire réel. On récupère le PID via \`ss -tp\`, puis on interroge \`/proc/PID/exe\` : la technique du Module 55, appliquée depuis une connexion.`,
        tags: ["defense", "connexions", "proc-exe"],
      },
      {
        id: "prat-activeconn-t6",
        title: "Ce que révèle la vérification",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎭 Derrière le masque

**Question :** que révèle cette vérification ici ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Il s'agit en réalité de bash, pas d'un véritable outil de mise à jour système",
          "Il s'agit bien d'un outil de mise à jour officiel",
          "Le PID n'existe plus",
          "Le fichier /proc/PID/exe est introuvable pour tout processus",
        ],
        answer: 0,
        explanation: `\`/proc/PID/exe\` pointe vers **\`/bin/bash\`** : le « system-update-agent » est un bash maquillé maintenant une connexion loopback. Aucun outil de mise à jour officiel ne se comporterait ainsi.`,
        tags: ["defense", "connexions", "bash"],
      },
      {
        id: "prat-activeconn-t7",
        title: "Confirmer (flag)",
        order: 7,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le rapport

\`\`\`bash
cat /root/connection_report.txt
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` figure dans le rapport ?`,
        points: 300,
        timeLimitSec: 500,
        hints: [],
        answer: "CYBERACE{connexion_active_correlee_au_processus}",
        caseSensitive: true,
        explanation: `\`cat /root/connection_report.txt\` → **CYBERACE{connexion_active_correlee_au_processus}**. Le flag confirme la démarche : corréler la connexion au **vrai** processus, pas au nom affiché.`,
        tags: ["defense", "flag", "connexions"],
      },
      {
        id: "prat-activeconn-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Même technique, autre angle

**Question :** en quoi ce module diffère-t-il du Module 55, tout en réutilisant sa technique centrale ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Le Module 55 examinait une simple liste de processus ; celui-ci part d'une CONNEXION RÉSEAU active pour remonter jusqu'au processus réel",
          "Ce module n'utilise pas /proc/PID/exe",
          "Ce module nécessite des capacités réseau spéciales (NET_RAW/NET_ADMIN)",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Module 55 : point de départ = \`ps aux\`. Module 57 : point de départ = une **connexion active** (\`ss -tp\`). Dans les deux cas, on conclut avec \`/proc/PID/exe\` — la corrélation nom↔binaire réel est le fil commun.`,
        tags: ["defense", "connexions", "synthese"],
      },
    ],
  },
];
