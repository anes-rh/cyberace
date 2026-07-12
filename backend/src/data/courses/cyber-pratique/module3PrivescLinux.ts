import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 3 : élévation de privilèges Linux (SUID & sudo/PATH). Lab mono-conteneur. */
export const module3PrivescLinux: CourseSeed[] = [
  {
    slug: "prat-privesc-linux",
    title: "Élévation de privilèges Linux",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Ascent",
    domain: "Élévation de privilèges",
    theme: "grid",
    icon: "KeyRound",
    accent: "#D9A441",
    order: 3,
    difficulty: "medium",
    summary:
      "Troisième lab réel : cette fois, pas de cible distante — le terminal EST la machine vulnérable. Tu t'y connectes en tant que « stagiaire » (compte limité) et tu dois devenir root par deux chemins distincts : un binaire SUID mal configuré, puis un script sudo victime d'un détournement de PATH.",
    objectives: [
      "Énumérer ses droits : identité (id), permissions sudo (sudo -l), binaires SUID",
      "Comprendre le mécanisme SUID et exploiter un binaire SUID (GTFOBins, find -exec)",
      "Distinguer le SUID sur binaire compilé du SUID sur script interprété",
      "Repérer et exploiter un détournement de PATH via sudo (secure_path absent)",
      "Nommer les contre-mesures (secure_path, audit des SUID)",
    ],
    sandbox: {
      attackerImage: "cyberace/module3-privesc-lab:latest",
      // targetImage volontairement absent : mode mono-conteneur (l'attaquant EST l'environnement).
      ttlSec: 1200,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🔑 Élévation de privilèges Linux — Silent Ascent

Les deux premiers labs t'opposaient à une **machine distante**. Ici, c'est différent : **tu es déjà à l'intérieur**, mais avec un compte **limité**. Ton objectif : passer de simple **stagiaire** à **root**. 🏎️

---

## 🧭 Le briefing

> Tu disposes d'un accès **\`stagiaire\`** sur une machine d'exploitation — un compte sans privilèges particuliers. Une chose est sûre : cette machine est **mal durcie**. **Deux chemins distincts** mènent à un accès **root**. Trouve-les **l'un après l'autre**.

**Comment jouer :** clique sur **« Démarrer le lab »**. Le terminal te dépose **directement** dans un shell **\`stagiaire\`** (vérifie avec \`whoami\`). Progresse tâche par tâche : d'abord l'**énumération**, puis les **deux exploitations**.

---

## 1. L'élévation de privilèges, c'est quoi ? 🪜

L'**élévation de privilèges** (*privilege escalation*) consiste, à partir d'un accès **limité**, à obtenir des droits **supérieurs** — idéalement **root** (l'administrateur tout-puissant sous Linux). C'est presque toujours la **2ᵉ étape** d'une intrusion : on entre avec un compte modeste (via une faille, un mot de passe faible…), puis on **escalade** pour prendre le contrôle total.

Les deux causes les plus courantes sur une machine mal durcie :
- des **permissions trop larges** sur des exécutables (bit **SUID**) ;
- des **règles sudo** trop permissives ou mal pensées.

Ce module te fait exploiter **une de chaque**.

---

## 2. Le mécanisme SUID 🎭

Normalement, un programme s'exécute avec les **droits de l'utilisateur qui le lance**. Le bit **SUID** (*Set User ID*) change cette règle : un exécutable marqué SUID s'exécute avec les droits de son **propriétaire**, **quel que soit** l'utilisateur qui le lance.

\`\`\`
   -rwsr-xr-x  root root  /usr/bin/passwd
       ▲
       └── le "s" à la place du "x" du propriétaire = bit SUID
\`\`\`

C'est **légitime** pour certains outils : \`passwd\` (modifier son mot de passe) a besoin d'écrire dans \`/etc/shadow\`, un fichier root — il est donc SUID-root **par conception**. Le problème surgit quand un binaire qui **ne devrait pas** l'être devient SUID-root : il devient alors un **tremplin vers root**.

### Lister les binaires SUID

\`\`\`bash
find / -perm -4000 -type f 2>/dev/null
\`\`\`

- \`-perm -4000\` : sélectionne les fichiers dont le bit **SUID** est positionné.
- \`2>/dev/null\` : masque les erreurs « permission denied » (bruit).

La plupart des résultats sont **normaux** (\`passwd\`, \`sudo\`, \`mount\`, \`su\`…). Ton travail : repérer **l'intrus** — un binaire standard rendu SUID **anormalement**.

---

## 3. Exploiter un SUID : GTFOBins & \`find -exec\` 💥

Beaucoup de binaires standards, s'ils sont SUID, offrent un moyen d'**exécuter un shell** ou une commande arbitraire avec les droits du propriétaire. Le projet **GTFOBins** recense ces techniques. Pour **\`find\`**, elle est célèbre :

\`\`\`bash
find . -exec /bin/sh -p \\; -quit
\`\`\`

- \`-exec ... \\;\` : \`find\` peut lancer une commande — ici, un **shell**.
- \`/bin/sh -p\` : le **\`-p\`** est **crucial**. Sans lui, \`sh\` **abandonne** les privilèges élevés au démarrage (mesure de sécurité). Avec \`-p\`, il **conserve** les privilèges **effectifs** hérités du binaire SUID → tu obtiens un **shell root**.
- \`-quit\` : on s'arrête au premier fichier (inutile de parcourir tout le disque).

Une fois le shell root obtenu (\`whoami\` → \`root\`), tu peux lire ce qui était interdit à stagiaire, comme \`/root/flag.txt\`.

---

## 4. La distinction cruciale : SUID sur binaire vs sur script ⚠️

Point **souvent mal compris**, et pourtant essentiel :

> **Le noyau Linux HONORE le bit SUID sur un binaire compilé** (comme \`find\`, \`passwd\`), **mais l'IGNORE délibérément sur un script interprété** (\`#!/bin/bash\`, \`#!/usr/bin/python\`…).

Pourquoi ? Pour des raisons **historiques de sécurité** : les scripts SUID étaient vulnérables à des **races conditions** (entre le moment où le noyau lit le \`#!\` et le moment où l'interpréteur ouvre le fichier, un attaquant pouvait le remplacer). Les noyaux modernes **refusent donc tout simplement** d'appliquer le SUID à un script.

**Conséquence directe** : on ne peut **pas** rendre un script root en faisant \`chmod u+s script.sh\` — ça ne marchera **jamais**. C'est exactement pourquoi la **seconde faille** de cette machine ne passe **pas** par un SUID sur script, mais par **sudo** (§5). Retiens bien : **SUID = binaires compilés uniquement.**

---

## 5. sudo + détournement de PATH 🛣️

\`sudo\` permet à un utilisateur d'exécuter **certaines** commandes en tant qu'un autre (souvent root). La config vit dans \`/etc/sudoers\` (et \`/etc/sudoers.d/\`). Pour savoir ce que **tu** as le droit de faire :

\`\`\`bash
sudo -l
\`\`\`

Imagine que stagiaire ait le droit de lancer **un script** précis en root sans mot de passe. Si ce script appelle une commande **sans chemin absolu** (ex. juste \`status\` au lieu de \`/usr/bin/status\`), le système la cherche dans les répertoires du **\`$PATH\`** — **dans l'ordre**. C'est la faille :

\`\`\`bash
# 1) Je crée MA version malveillante de "status" dans un dossier que je contrôle
echo 'cat /root/flag2.txt' > $HOME/status
chmod +x $HOME/status
# 2) Je mets MON dossier en TÊTE du PATH
export PATH=$HOME:$PATH
# 3) Je lance le script autorisé en root : il appellera MON "status"
sudo /usr/local/bin/backup-check
\`\`\`

Comme le script tourne en **root** et trouve **mon** \`status\` en premier, **ma** commande s'exécute avec les droits **root** → je lis un fichier interdit.

### Pourquoi ça marche ici : \`secure_path\` désactivé

Normalement, sudo se protège avec l'option **\`secure_path\`** : il **impose son propre \`$PATH\`** (fixe et sûr) et **ignore** celui de l'utilisateur → mon dossier piégé n'est jamais consulté. Sur **cette** machine, \`secure_path\` a été **explicitement désactivé** (\`Defaults !secure_path\`) — c'est **LA** misconfiguration qui rend l'attaque possible. Rétablir \`secure_path\` la **neutraliserait** entièrement.

---

## 🎯 Ta mission (résumé)

1. **Énumère** : \`whoami\`, \`id\`, \`sudo -l\`, chasse aux SUID.
2. **Chemin A** : exploite le binaire **SUID** (\`find -exec /bin/sh -p\`) → **flag 1**.
3. **Chemin B** : exploite le **détournement de PATH** via sudo → **flag 2**.

## 🧠 À retenir

- **Élévation de privilèges** = passer d'un accès **limité** à **root** ; presque toujours la **2ᵉ étape** d'une intrusion.
- **SUID** : un exécutable marqué SUID s'exécute avec les droits de son **propriétaire** (souvent root), quel que soit le lanceur. Lister : \`find / -perm -4000 -type f 2>/dev/null\`.
- **Exploitation SUID** (GTFOBins) : \`find . -exec /bin/sh -p \\; -quit\` — le **\`-p\`** conserve les privilèges effectifs (sinon \`sh\` les abandonne).
- **Distinction clé** : le noyau **honore** le SUID sur **binaire compilé**, mais l'**IGNORE** sur **script interprété** (races conditions historiques) → un script ne devient jamais root par \`chmod u+s\`. D'où le recours à **sudo** pour la 2ᵉ faille.
- **sudo + PATH hijacking** : si un script lancé en root appelle une commande **sans chemin absolu**, on place une commande **malveillante** du même nom en **tête du \`$PATH\`** → elle s'exécute en root. \`sudo -l\` révèle ce qu'on a le droit de lancer.
- **Contre-mesure** : **\`secure_path\`** (PATH fixe imposé par sudo) neutralise le détournement ; ici il était **désactivé** (\`Defaults !secure_path\`). Auditer aussi les **SUID** anormaux.`,
    badge: {
      id: "badge-prat-privesc",
      name: "Grimpeur Furtif",
      icon: "KeyRound",
      description: "A transformé un compte limité en accès root, deux fois.",
    },
    challenges: [
      {
        id: "prat-privesc-t1",
        title: "Qui suis-je ?",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🪪 Qui suis-je ?

Démarre le lab et ouvre le terminal : tu es déposé dans un shell **\`stagiaire\`**. Fais le point sur ton identité :

\`\`\`bash
whoami   # ton nom d'utilisateur
id       # ton UID, ton GID et tes groupes
\`\`\`

La différence : \`whoami\` ne donne que le **nom**, alors que \`id\` montre aussi l'**UID numérique** et les **groupes** (précieux pour repérer une appartenance intéressante).

**Question :** quelle commande affiche l'**UID, le GID et les groupes** de l'utilisateur courant (pas seulement son nom) ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "id",
        caseSensitive: false,
        explanation: `**\`id\`** affiche l'**UID**, le **GID** et tous les **groupes** de l'utilisateur courant — bien plus complet que \`whoami\` (qui ne donne que le nom). Repérer ses groupes est un réflexe d'énumération : certaines appartenances (ex. \`docker\`, \`sudo\`, \`disk\`) sont elles-mêmes des vecteurs d'élévation.`,
        tags: ["privesc", "enumeration", "id"],
      },
      {
        id: "prat-privesc-t2",
        title: "Que peut faire stagiaire en sudo ?",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧾 Droits sudo

Première question à se poser en tant qu'utilisateur limité : « qu'ai-je le droit de lancer en tant que root ? »

\`\`\`bash
sudo -l
\`\`\`

Lis la sortie : elle indique quelles commandes stagiaire peut exécuter en root (et si un mot de passe est requis).

**Question :** d'après \`sudo -l\`, quel **script** stagiaire peut-il exécuter en root, **sans mot de passe** ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "/usr/local/bin/backup-check",
        accept: ["backup-check"],
        caseSensitive: true,
        explanation: `\`sudo -l\` révèle la règle \`NOPASSWD: /usr/local/bin/backup-check\` : stagiaire peut lancer **ce script précis** en root **sans mot de passe**. C'est une piste d'élévation majeure — un script exécuté en root est une cible de choix si son contenu est manipulable (tu y reviendras à la tâche 7).`,
        tags: ["privesc", "sudo", "enumeration"],
      },
      {
        id: "prat-privesc-t3",
        title: "Chasse aux binaires SUID",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔍 Chasse aux SUID

Autre grand classique de l'énumération : les binaires **SUID** (qui s'exécutent avec les droits de leur propriétaire). Liste-les tous :

\`\`\`bash
find / -perm -4000 -type f 2>/dev/null
\`\`\`

La plupart sont **légitimes** (\`passwd\`, \`sudo\`, \`mount\`, \`su\`…). Un seul détonne : un utilitaire standard rendu **SUID-root** alors qu'il ne devrait **jamais** l'être.

**Question :** quel **binaire standard** a été rendu SUID-root de façon **anormale** sur cette machine ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [
          { text: "La plupart des résultats sont des SUID légitimes (passwd, sudo, mount…). Cherche l'outil de recherche de fichiers qui ne devrait jamais être SUID.", cost: 20 },
        ],
        answer: "/usr/bin/find",
        accept: ["find"],
        caseSensitive: true,
        explanation: `**\`/usr/bin/find\`** apparaît dans la liste : or \`find\` n'a **aucune raison** d'être SUID-root. Comme il peut lancer des commandes (\`-exec\`), ce SUID en fait un **tremplin direct vers root** (tâche 4). Repérer l'intrus au milieu des SUID légitimes est tout l'enjeu de cette énumération.`,
        tags: ["privesc", "suid", "find"],
      },
      {
        id: "prat-privesc-t4",
        title: "Exploiter le SUID (flag 1)",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 💥 Exploiter le SUID (flag 1)

\`find\` étant SUID-root, exploite-le avec la technique **GTFOBins** pour obtenir un **shell root** :

\`\`\`bash
find . -exec /bin/sh -p \\; -quit
\`\`\`

Le **\`-p\`** est essentiel : il dit à \`sh\` de **conserver** les privilèges effectifs (sans lui, le shell les abandonnerait). Une fois \`root\` (\`whoami\` pour confirmer), lis le fichier interdit à stagiaire :

\`\`\`bash
cat /root/flag.txt
\`\`\`

**Question :** colle le **flag** contenu dans \`/root/flag.txt\`.`,
        points: 250,
        timeLimitSec: 600,
        hints: [
          { text: "Syntaxe générale : find . -exec <commande> \\; — ici la commande est un shell qui garde les privilèges.", cost: 20 },
          { text: "Commande exacte : find . -exec /bin/sh -p \\; -quit   puis   cat /root/flag.txt", cost: 35 },
        ],
        answer: "CYBERACE{find_suid_shell_racine}",
        caseSensitive: true,
        explanation: `Le \`-exec\` de \`find\` lance \`/bin/sh -p\` : comme \`find\` est **SUID-root**, ce shell hérite des droits **root** (grâce au \`-p\` qui les conserve). Tu lis alors \`/root/flag.txt\` → \`CYBERACE{find_suid_shell_racine}\`. Un simple bit de permission mal placé a suffi à passer stagiaire → root.`,
        tags: ["privesc", "suid", "flag"],
      },
      {
        id: "prat-privesc-t5",
        title: "Pourquoi ça marche",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Pourquoi ça marche

Tu viens d'obtenir un shell root via \`find -exec\`.

**Question :** pourquoi le shell obtenu hérite-t-il des droits **root** ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Le bit SUID fait exécuter le binaire avec les droits de son propriétaire (root), quel que soit l'utilisateur qui le lance",
          "find demande automatiquement le mot de passe root au premier lancement",
          "Le shell hérite des droits du répertoire courant",
          "sudo est appelé implicitement par find",
        ],
        answer: 0,
        explanation: `Le bit **SUID** fait exécuter \`find\` avec les droits de son **propriétaire** — ici **root** — indépendamment de l'utilisateur qui le lance. Le shell qu'il ouvre via \`-exec\` hérite donc de ces droits. Aucun mot de passe, aucun sudo : juste une permission mal configurée détournée.`,
        tags: ["privesc", "suid", "mecanisme"],
      },
      {
        id: "prat-privesc-t6",
        title: "Une limite importante du SUID",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## ⚠️ SUID et scripts

Tu pourrais penser qu'il suffit de rendre **n'importe quel script** SUID-root pour l'exécuter en root. Ce n'est **pas** le cas.

**Question :** le bit SUID est-il honoré par le noyau Linux sur un **script interprété** (bash, python…) de la même façon que sur un **binaire compilé** ? *(réponds oui ou non)*`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "non",
        accept: ["no"],
        caseSensitive: false,
        explanation: `**Non.** Le noyau Linux **ignore délibérément** le bit SUID sur les **scripts interprétés** (à cause de races conditions historiques entre la lecture du \`#!\` et l'ouverture du fichier). Il ne l'honore que sur les **binaires compilés** (comme \`find\`). C'est précisément pour ça que la faille suivante ne passe **pas** par un SUID sur script, mais par **sudo** appliqué à \`backup-check\`.`,
        tags: ["privesc", "suid", "script"],
      },
      {
        id: "prat-privesc-t7",
        title: "Repérer le PATH hijacking",
        order: 7,
        difficulty: "medium",
        type: "text",
        prompt: `## 🛣️ Lire le script autorisé

Reviens à la piste sudo : stagiaire peut lancer \`/usr/local/bin/backup-check\` en root. Lis son contenu :

\`\`\`bash
cat /usr/local/bin/backup-check
\`\`\`

Repère la commande appelée **sans chemin absolu** (pas de \`/\` devant) : c'est elle que le système ira chercher dans le \`$PATH\`… donc celle qu'on peut **détourner**.

**Question :** quel **nom de commande**, appelé sans chemin absolu dans le script, peut être détourné ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [
          { text: "Repère la ligne qui n'utilise PAS un chemin commençant par / (contrairement à echo qui est un builtin). Un seul mot, seul sur sa ligne.", cost: 20 },
        ],
        answer: "status",
        caseSensitive: true,
        explanation: `Le script appelle **\`status\`** sans chemin absolu : le système le cherchera dans les répertoires du \`$PATH\`, **dans l'ordre**. Comme \`backup-check\` s'exécute en **root** (via sudo), fournir **notre** \`status\` en tête du PATH le fera exécuter **en root** — c'est le **PATH hijacking** (tâche 8).`,
        tags: ["privesc", "path-hijacking", "sudo"],
      },
      {
        id: "prat-privesc-t8",
        title: "Exploiter le PATH hijacking (flag 2)",
        order: 8,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Exploiter le PATH hijacking (flag 2)

Assemble l'attaque. Crée **ta** version de \`status\` qui lit le second flag root, mets ton dossier en tête du \`$PATH\`, puis lance le script autorisé :

\`\`\`bash
echo 'cat /root/flag2.txt' > $HOME/status
chmod +x $HOME/status
export PATH=$HOME:$PATH
sudo /usr/local/bin/backup-check
\`\`\`

\`backup-check\` tourne en root, trouve **ton** \`status\` en premier, et exécute donc \`cat /root/flag2.txt\` **avec les droits root**.

**Question :** colle le **flag** ainsi révélé.`,
        points: 300,
        timeLimitSec: 700,
        hints: [
          { text: "Mets ton dossier personnel en tête du PATH : export PATH=$HOME:$PATH — c'est ce qui fait chercher TON status en premier.", cost: 20 },
          { text: "Le script à créer : echo 'cat /root/flag2.txt' > $HOME/status ; chmod +x $HOME/status ; puis export PATH=$HOME:$PATH ; sudo /usr/local/bin/backup-check", cost: 35 },
        ],
        answer: "CYBERACE{path_detourne_sudo_sans_secure_path}",
        caseSensitive: true,
        explanation: `En plaçant un faux \`status\` (\`cat /root/flag2.txt\`) en tête du \`$PATH\`, le script \`backup-check\` — exécuté en **root** via sudo — lance **ta** commande et révèle \`CYBERACE{path_detourne_sudo_sans_secure_path}\`. Ça n'a marché que parce que **\`secure_path\` était désactivé** ; sinon sudo aurait imposé son propre PATH sûr.`,
        tags: ["privesc", "path-hijacking", "flag"],
      },
      {
        id: "prat-privesc-t9",
        title: "Synthèse défensive",
        order: 9,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🛡️ Synthèse défensive

Tu as exploité un détournement de PATH via sudo.

**Question :** quelle configuration sudo, **absente** ici, aurait **empêché** ce détournement de PATH ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "secure_path, qui impose un PATH fixe et sûr pour toute commande lancée via sudo",
          "NOPASSWD, qui évite de redemander le mot de passe",
          "Defaults requiretty, qui exige un terminal interactif",
          "L'ajout de stagiaire au groupe sudo",
        ],
        answer: 0,
        explanation: `**\`secure_path\`** impose à sudo un **\`$PATH\` fixe et sûr**, ignorant celui de l'utilisateur : le dossier piégé n'est alors **jamais** consulté, et le détournement échoue. Ici il avait été explicitement désactivé (\`Defaults !secure_path\`). \`NOPASSWD\` et \`requiretty\` ne concernent pas la résolution des commandes ; ajouter stagiaire au groupe sudo **aggraverait** au contraire le risque.`,
        tags: ["privesc", "secure-path", "defense"],
      },
    ],
  },
];
