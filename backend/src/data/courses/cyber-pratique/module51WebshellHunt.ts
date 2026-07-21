import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 51 (Défense) : chasse au webshell par recherche de fonctions. Lab Docker réel. */
export const module51WebshellHunt: CourseSeed[] = [
  {
    slug: "prat-defense-webshell-hunt",
    title: "Chasse au webshell — chercher la fonction, pas le nom",
    checkpoint: "defense",
    codename: "Silent Script Hunt",
    domain: "Défense — Analyse de code",
    theme: "grid",
    icon: "Bug",
    accent: "#C46B6B",
    order: 51,
    difficulty: "medium",
    summary:
      "Ouverture de la 2e série défense (persistance & usurpation). Un dossier web contient cinq fichiers .php : quatre légitimes, un déposé par un attaquant qui exécute des commandes arbitraires. Tu le débusques non par son nom (qui peut être n'importe quoi) mais par la présence de fonctions dangereuses — une méthode robuste que le déguisement ne trompe pas.",
    objectives: [
      "Recenser les fichiers PHP d'un dossier web, sous-dossiers compris",
      "Connaître les fonctions PHP à risque (system, exec, shell_exec)",
      "Rechercher ces fonctions récursivement avec grep",
      "Isoler le webshell et comprendre pourquoi $_REQUEST + system() est critique",
      "Nommer une contre-mesure (disable_functions) et la robustesse de l'approche par fonction",
    ],
    sandbox: {
      attackerImage: "cyberace/module51-webshell-hunt:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🐛 Chasse au webshell — Silent Script Hunt

Un **webshell** est un petit fichier déposé sur un serveur web qui permet à l'attaquant d'exécuter des commandes à distance. Le trouver « à l'œil » est illusoire : il faut chercher ce qu'il **fait**, pas comment il **s'appelle**. 🔍

---

## 🧭 Le briefing

> *"Un dossier web contient cinq fichiers. Quatre sont légitimes. Un cinquième a été déposé par un attaquant et permet d'exécuter des commandes arbitraires — trouve-le par la présence de fonctions dangereuses, pas par son nom."*

Terminal **en root**. Le dossier web est **\`/var/www/html\`**.

---

## 1. Recenser les fichiers 📁

\`\`\`bash
find /var/www/html -name '*.php'        # tous les .php, sous-dossiers compris
\`\`\`

Cinq fichiers, dont un dans le sous-dossier \`inc/\`.

---

## 2. Les fonctions qui trahissent ⚠️

Un webshell doit, tôt ou tard, **exécuter une commande système**. En PHP, cela passe par des fonctions bien connues :

- \`system()\`, \`exec()\`, \`shell_exec()\`, \`passthru()\`, \`popen()\`, \`proc_open()\`

Ces fonctions n'ont **presque jamais** leur place dans un fichier web ordinaire (une page d'accueil, un formulaire de contact). Leur présence est un **signal d'alerte fort**.

---

## 3. Chercher par fonction 🎯

\`\`\`bash
grep -rlE "system\\(|exec\\(|shell_exec\\(" /var/www/html/
\`\`\`

- \`-r\` récursif, \`-l\` affiche seulement les **noms de fichiers** qui matchent, \`-E\` regex étendue.

Un seul fichier ressort : **\`inc/cache.php\`**. Son nom (« cache ») est anodin — mais son **contenu** le trahit.

---

## 4. Pourquoi c'est critique 💣

\`\`\`php
if (isset($_REQUEST['cmd'])) { system($_REQUEST['cmd']); }
\`\`\`

\`$_REQUEST['cmd']\` prend une valeur fournie par **n'importe qui** via l'URL (\`?cmd=...\`), et \`system()\` l'exécute **sur le serveur**. Résultat : un attaquant exécute la commande de son choix à distance. La contre-mesure à la source : **désactiver ces fonctions** dans la config PHP (\`disable_functions\`), en plus d'une surveillance d'intégrité des fichiers.

## 🧠 À retenir

- Recenser : \`find /var/www/html -name '*.php'\`.
- Fonctions à risque : **system, exec, shell_exec** (et passthru, proc_open…).
- Chercher **par fonction** : \`grep -rlE "system\\(|exec\\(|shell_exec\\(" /var/www/html/\`.
- \`$_REQUEST\` + \`system()\` = exécution de commande arbitraire à distance.
- **Robustesse** : le nom d'un fichier se change à volonté ; les fonctions dangereuses, elles, restent nécessaires et détectables.
- **Contre-mesure** : \`disable_functions\` en config PHP + intégrité des fichiers.`,
    badge: {
      id: "badge-prat-webshell",
      name: "Chasseur de Webshells",
      icon: "Bug",
      description: "A trouvé la porte dérobée noyée dans un dossier de fichiers légitimes.",
    },
    challenges: [
      {
        id: "prat-webshell-t1",
        title: "Compter les fichiers",
        order: 1,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 📁 L'inventaire

\`\`\`bash
find /var/www/html -name '*.php' | wc -l
\`\`\`

**Question :** combien de fichiers \`.php\` au total se trouvent sous \`/var/www/html\` (sous-dossiers compris) ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: 5,
        explanation: `**5** fichiers : \`index.php\`, \`about.php\`, \`contact.php\`, \`inc/functions.php\` et \`inc/cache.php\`. Un seul est malveillant. Recenser l'ensemble est la première étape avant de trier.`,
        tags: ["defense", "webshell", "find"],
      },
      {
        id: "prat-webshell-t2",
        title: "Les fonctions à risque",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚠️ Ce qui exécute des commandes

**Question :** quelles fonctions PHP sont classiquement des signaux d'alerte dans un fichier web, car elles exécutent des commandes système ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: ["system, exec, shell_exec", "echo, print", "strlen, count", "date, time"],
        answer: 0,
        explanation: `**system, exec, shell_exec** (et passthru, proc_open…) exécutent des commandes système — le cœur d'un webshell. \`echo/print\` affichent, \`strlen/count\` mesurent, \`date/time\` renvoient l'heure : aucune n'exécute de commande.`,
        tags: ["defense", "webshell", "php"],
      },
      {
        id: "prat-webshell-t3",
        title: "Rechercher ces fonctions",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 Le grep récursif

**Question :** quelle commande grep recherche récursivement ces fonctions dans tout le dossier web ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "grep -rlE \"system\\(|exec\\(|shell_exec\\(\" /var/www/html/",
        accept: ["grep -r system(", "grep -rE system"],
        caseSensitive: true,
        explanation: `\`grep -rlE "system\\(|exec\\(|shell_exec\\(" /var/www/html/\` : \`-r\` récursif, \`-l\` liste les fichiers, \`-E\` regex étendue (alternatives \`|\`). On cible les appels de fonction (avec la parenthèse) pour réduire les faux positifs.`,
        tags: ["defense", "webshell", "grep"],
      },
      {
        id: "prat-webshell-t4",
        title: "Le fichier isolé",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔦 Le seul suspect

**Question :** quel fichier ressort seul de cette recherche ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "inc/cache.php",
        accept: ["cache.php"],
        caseSensitive: false,
        explanation: `**\`inc/cache.php\`** est le seul à contenir un appel \`system()\`. Son nom anodin (« cache ») visait à passer inaperçu dans le sous-dossier \`inc/\` — mais la recherche par fonction l'a démasqué.`,
        tags: ["defense", "webshell", "detection"],
      },
      {
        id: "prat-webshell-t5",
        title: "Pourquoi $_REQUEST + system() est critique",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 💣 La combinaison mortelle

Ouvre le fichier : \`if (isset($_REQUEST['cmd'])) { system($_REQUEST['cmd']); }\`

**Question :** pourquoi la combinaison \`$_REQUEST\` + \`system()\` est-elle particulièrement dangereuse ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Elle permet à quiconque envoie une requête HTTP d'exécuter la commande de son choix sur le serveur",
          "Elle ralentit uniquement le chargement de la page",
          "$_REQUEST est toujours vide par défaut",
          "system() ne fonctionne jamais depuis un navigateur",
        ],
        answer: 0,
        explanation: `\`$_REQUEST['cmd']\` prend une valeur **contrôlée par l'attaquant** (via l'URL), et \`system()\` l'**exécute** sur le serveur. C'est une exécution de commande à distance totale : \`?cmd=cat /etc/passwd\`, \`?cmd=id\`, etc.`,
        tags: ["defense", "webshell", "rce"],
      },
      {
        id: "prat-webshell-t6",
        title: "Confirmer (flag)",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le marqueur

\`\`\`bash
cat /var/www/html/inc/cache.php
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` figure en commentaire dans ce fichier ?`,
        points: 300,
        timeLimitSec: 500,
        hints: [],
        answer: "CYBERACE{webshell_trouve_par_recherche_de_fonctions}",
        caseSensitive: true,
        explanation: `Le fichier contient **CYBERACE{webshell_trouve_par_recherche_de_fonctions}** en commentaire. Le nom du flag résume la leçon : c'est la recherche **par fonction** qui a permis la découverte, pas le nom du fichier.`,
        tags: ["defense", "flag", "webshell"],
      },
      {
        id: "prat-webshell-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ À la source

**Question :** quelle mesure défensive réduit ce risque à la source ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Désactiver les fonctions dangereuses (system, exec...) au niveau de la configuration PHP (disable_functions), en plus d'une surveillance d'intégrité des fichiers",
          "Renommer le fichier en .txt",
          "Supprimer uniquement le commentaire",
          "Changer le port du serveur web",
        ],
        answer: 0,
        explanation: `\`disable_functions\` dans la config PHP neutralise ces fonctions pour **tous** les scripts, coupant la capacité même d'un webshell à exécuter des commandes. Couplé à une surveillance d'intégrité (cf. Module 46), c'est une défense en profondeur. Renommer/supprimer un commentaire ne traite pas la cause.`,
        tags: ["defense", "webshell", "contre-mesure"],
      },
      {
        id: "prat-webshell-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Fonction vs nom

**Question :** en quoi cette recherche par FONCTION plutôt que par NOM de fichier est-elle plus robuste ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Un attaquant peut nommer son fichier n'importe comment, mais les fonctions dangereuses qu'il doit utiliser restent, elles, difficiles à dissimuler complètement",
          "Le nom du fichier est toujours plus fiable que son contenu",
          "grep ne peut chercher que des noms de fichiers",
          "Il n'y a aucune différence entre les deux approches",
        ],
        answer: 0,
        explanation: `Le nom est **arbitraire** (l'attaquant l'appelle \`cache.php\`, \`img.php\`…), mais pour agir, le webshell **doit** utiliser une fonction d'exécution. Chercher le comportement (la fonction) plutôt que l'étiquette (le nom) est bien plus difficile à contourner.`,
        tags: ["defense", "webshell", "synthese"],
      },
    ],
  },
];
