import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 7 : dépôt .git exposé en production. Lab Docker réel. */
export const module7GitExposure: CourseSeed[] = [
  {
    slug: "prat-git-exposure",
    title: "Dépôt .git exposé : archéologie du code",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Archive",
    domain: "Reconnaissance web",
    theme: "grid",
    icon: "FolderTree",
    accent: "#C77DBB",
    order: 7,
    difficulty: "medium",
    summary:
      "Septième lab réel : un site mis en production laisse traîner son dossier /.git/ accessible en HTTP. Tu le télécharges, tu fouilles l'historique des commits, et tu y retrouves une clé API que quelqu'un croyait avoir « supprimée » — mais que git n'a jamais vraiment effacée.",
    objectives: [
      "Faire de la reconnaissance web (curl) et repérer un chemin non listé mais accessible",
      "Comprendre pourquoi un dossier /.git/ exposé est une fuite majeure",
      "Télécharger récursivement un dépôt exposé (wget -r)",
      "Explorer un historique git sans copie de travail (--git-dir, log, show)",
      "Retenir que git conserve tout l'historique → un secret committé doit être révoqué",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module7-exposed-git:latest",
      ttlSec: 1200,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🗂️ Dépôt .git exposé : archéologie du code — Silent Archive

Un développeur pressé déploie son site en copiant **tout** son dossier de travail sur le serveur — **y compris le dossier caché \`.git/\`**. Ce dossier contient **l'intégralité de l'historique** du projet. S'il est accessible en HTTP, c'est une **mine d'or** pour un attaquant. 🏎️

---

## 🧭 Le briefing

> Un **site interne** vient d'être **mis en production**. Explore-le comme le ferait n'importe quel **outil de reconnaissance automatisé** : certains chemins ne sont **jamais listés nulle part**, mais ça ne veut pas dire qu'ils sont **protégés**. Trouve ce qui n'aurait jamais dû être exposé.

**Comment jouer :** « Démarrer le lab », le terminal s'ouvre (tu es l'attaquant). La cible est le serveur web \`target\` sur le port **8080**.

---

## 1. Reconnaissance web de base 🔍

On commence toujours par regarder ce que le serveur sert :

\`\`\`bash
curl http://target:8080/
\`\`\`

Une page banale. Mais un site, c'est bien plus que sa page d'accueil : des **chemins cachés** existent souvent, jamais liés depuis les pages visibles. Les outils de reconnaissance (dirb, gobuster…) testent des **listes** de chemins courants. L'un des plus juteux : **\`/.git/\`**.

---

## 2. Le dossier /.git/ : pourquoi c'est grave ⚠️

Quand un projet est versionné avec **git**, un dossier caché **\`.git/\`** à la racine contient **tout** : l'historique complet des commits, chaque version de chaque fichier, les messages, les auteurs… **y compris les fichiers supprimés ou modifiés depuis**.

En production, ce dossier **ne devrait jamais être accessible**. Mais si le serveur sert les fichiers **sans bloquer les dotfiles** (fichiers/dossiers commençant par un point), \`/.git/\` répond :

\`\`\`bash
curl http://target:8080/.git/
\`\`\`

Ici, le serveur (\`python3 -m http.server\`) **liste le contenu** du dossier et sert ses fichiers — aucune protection sur les dotfiles. C'est la faille.

> 🧭 Un \`/.git/\` exposé permet de **reconstituer tout le dépôt** : code source, secrets committés, configuration… même ce que le développeur croyait avoir enlevé.

---

## 3. Télécharger le dépôt 📥

On aspire récursivement tout le dossier \`.git/\` avec **wget** :

\`\`\`bash
wget -r -np http://target:8080/.git/
#      │  └── -np (--no-parent) : ne remonte pas au-dessus de /.git/
#      └── -r : téléchargement RÉCURSIF de tout le contenu
\`\`\`

Le dépôt téléchargé se retrouve **localement** sous un chemin du type \`target:8080/.git/\` (selon le répertoire d'où tu lances la commande).

> 🧠 Le chemin exact après \`wget -r\` **peut varier légèrement** selon ton répertoire de travail — c'est **normal**. Une vraie reconnaissance demande toujours ce genre de petit ajustement : repère où wget a écrit (\`ls\`), puis pointe dessus.

---

## 4. Fouiller l'historique sans copie de travail 🕰️

Tu as le dossier \`.git/\` mais **pas** de copie de travail « propre ». Pas grave : git sait travailler sur un dépôt **par son seul dossier \`.git\`**, via l'option **\`--git-dir\`** :

\`\`\`bash
# Lister tous les commits (tous, même ceux non sur la branche courante)
git --git-dir=target:8080/.git log --oneline --all

# Afficher le contenu d'un fichier À UN COMMIT précis
git --git-dir=target:8080/.git show <hash>:config.env
\`\`\`

- \`log --oneline --all\` : liste **chaque commit** (hash court + message). Tu verras l'historique complet.
- \`show <hash>:<fichier>\` : affiche le contenu d'un **fichier tel qu'il était à ce commit** — même s'il a été modifié/vidé depuis.

---

## 5. Le piège : « supprimer » un secret ne suffit pas 🔓

Scénario classique : un développeur commit un fichier de config **avec une clé API en clair**, se rend compte de l'erreur, **retire la clé** dans un commit suivant, et croit le problème réglé.

**Erreur.** Git **conserve tout l'historique** : le **premier commit** (avec la clé) reste **accessible indéfiniment**. \`git show <premier_hash>:config.env\` révèle la clé, alors que le \`config.env\` **actuel** ne la contient plus.

> ⚠️ La seule bonne réaction quand un secret a fuité dans un commit : le **révoquer/régénérer immédiatement**. Le retirer du code actuel ne le retire **pas** de l'historique (sauf réécriture explicite de l'historique, ex. \`git filter-repo\` — et encore, les copies restent).

---

## 🎯 Ta mission (résumé)

1. Reconnaissance (\`curl\`), repère **\`/.git/\`** accessible.
2. **Aspire** le dépôt (\`wget -r -np\`).
3. Explore l'**historique** (\`--git-dir … log --all\`), lis l'**ancien commit** (\`show <hash>:config.env\`) → **flag**.

## 🧠 À retenir

- Un dossier **\`.git/\` exposé** en HTTP = fuite majeure : il contient **tout l'historique** (code, secrets, versions supprimées).
- Cause : un serveur qui sert les **dotfiles** sans les bloquer (ici \`python3 -m http.server\`). Un chemin **non listé** n'est **pas protégé** pour autant.
- **Aspirer** : \`wget -r -np http://target:8080/.git/\` (le chemin local exact peut varier — ajuste avec \`ls\`).
- **Explorer sans working copy** : \`git --git-dir=<.git> log --oneline --all\`, puis \`git --git-dir=<.git> show <hash>:<fichier>\`.
- **git conserve tout** : retirer un secret dans un commit ultérieur **ne l'efface pas** de l'historique → un ancien commit reste lisible. **Révoquer/régénérer** le secret est obligatoire.
- **Prévention serveur** : bloquer explicitement l'accès à tout fichier/dossier commençant par un **point** (dotfiles) dans la config du serveur web.`,
    badge: {
      id: "badge-prat-git",
      name: "Archéologue du Code",
      icon: "FolderTree",
      description: "A retrouvé un secret que l'historique git n'avait jamais vraiment effacé.",
    },
    challenges: [
      {
        id: "prat-git-t1",
        title: "Reconnaissance web initiale",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔍 Reconnaissance

Démarre le lab et regarde ce que sert la cible :

\`\`\`bash
curl http://target:8080/
\`\`\`

**Question :** quelle **commande** permet de récupérer le contenu HTTP d'une page depuis le terminal ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "curl",
        accept: ["curl http://target:8080/", "wget"],
        caseSensitive: false,
        explanation: `**\`curl\`** récupère le contenu d'une URL en ligne de commande — l'outil de base de toute reconnaissance web. La page d'accueil est banale, mais un site cache souvent des **chemins non liés** : c'est eux qu'on va chercher.`,
        tags: ["git", "recon", "curl"],
      },
      {
        id: "prat-git-t2",
        title: "Repérer le dossier exposé",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📂 Le dossier qui traîne

Teste un chemin classique laissé par erreur en production :

\`\`\`bash
curl http://target:8080/.git/
\`\`\`

Le serveur répond et **liste le contenu** — ce dossier n'aurait jamais dû être accessible.

**Question :** quel **dossier**, normalement invisible en production, est ici directement accessible via HTTP ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: ".git",
        accept: [".git/", "/.git", "/.git/", "git"],
        caseSensitive: false,
        explanation: `Le dossier **\`.git/\`** est exposé : il contient **tout l'historique** du dépôt (code, versions, secrets committés). Le serveur sert les **dotfiles** sans les bloquer, donc \`/.git/\` répond. Un chemin **non listé** dans les pages n'est pas **protégé** pour autant.`,
        tags: ["git", "dotfiles", "exposition"],
      },
      {
        id: "prat-git-t3",
        title: "Télécharger l'historique",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 📥 Aspirer le dépôt

Récupère l'intégralité du dossier \`.git/\` en local :

\`\`\`bash
wget -r -np http://target:8080/.git/
\`\`\`

Le \`-np\` (*no-parent*) évite de remonter au-dessus de \`/.git/\`. Le dépôt atterrit sous un dossier du type \`target:8080/.git/\`.

**Question :** quelle **option wget** permet de télécharger **récursivement** tout le contenu d'un dossier accessible ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: "-r",
        accept: ["r", "--recursive", "-r -np"],
        caseSensitive: true,
        explanation: `L'option **\`-r\`** (*recursive*) fait descendre wget dans **toute l'arborescence** du dossier — indispensable pour aspirer les centaines de fichiers d'un \`.git/\`. Combinée à **\`-np\`** (ne pas remonter au parent), on récupère juste le dépôt.`,
        tags: ["git", "wget", "recursif"],
      },
      {
        id: "prat-git-t4",
        title: "Explorer l'historique",
        order: 4,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🕰️ Lire les commits

Interroge l'historique **sans copie de travail**, via \`--git-dir\` (ajuste le chemin selon l'endroit où \`wget\` a écrit — un \`ls\` t'aide à le retrouver) :

\`\`\`bash
git --git-dir=target:8080/.git log --oneline --all
\`\`\`

**Question :** combien de **commits** apparaissent dans l'historique de ce dépôt ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: 2,
        explanation: `L'historique compte **2 commits** : le premier ajoute une config **avec** la clé API, le second la **retire**. \`git log --oneline --all\` liste **tous** les commits (hash + message) même sans branche extraite — la fouille peut commencer.`,
        tags: ["git", "log", "historique"],
      },
      {
        id: "prat-git-t5",
        title: "Lire l'ancien commit",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🔓 Le secret « supprimé » (flag)

Le second commit a retiré la clé API… mais le **premier** la contient toujours. Repère le hash du **premier** commit (le plus ancien), puis lis le fichier tel qu'il était **à ce commit** :

\`\`\`bash
git --git-dir=target:8080/.git log --oneline --all      # repere le hash du 1er commit
git --git-dir=target:8080/.git show <hash>:config.env
\`\`\`

**Question :** colle la valeur de la **clé API** (\`API_KEY=...\`) trouvée dans l'ancien \`config.env\`.`,
        points: 300,
        timeLimitSec: 700,
        hints: [
          { text: "git log --oneline --all liste les commits avec leur hash court ; le plus BAS de la liste est le plus ancien (celui avec la clé).", cost: 20 },
          { text: "Syntaxe : git --git-dir=<chemin>/.git show <hash>:config.env  — la clé est après API_KEY=.", cost: 35 },
        ],
        answer: "CYBERACE{git_historique_jamais_efface}",
        caseSensitive: true,
        explanation: `\`git show <premier_hash>:config.env\` révèle le fichier **tel qu'il était au premier commit**, clé comprise : \`CYBERACE{git_historique_jamais_efface}\`. Le \`config.env\` **actuel** ne l'a plus, mais l'historique, lui, l'a **conservée** — d'où le flag.`,
        tags: ["git", "show", "flag"],
      },
      {
        id: "prat-git-t6",
        title: "Pourquoi ça n'a pas suffi de le retirer",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 L'historique qui n'oublie rien

**Question :** pourquoi la clé API reste-t-elle récupérable alors qu'elle a été **retirée** dans un commit ultérieur ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "git conserve l'intégralité de l'historique : chaque ancien commit reste accessible indéfiniment, sauf réécriture explicite de l'historique",
          "Le fichier config.env n'a en réalité jamais été modifié",
          "Le serveur web recrée automatiquement les anciens fichiers",
          "wget restaure automatiquement les versions supprimées",
        ],
        answer: 0,
        explanation: `**git conserve tout l'historique** : chaque commit est un instantané immuable. Retirer la clé dans un nouveau commit crée une nouvelle version, mais **l'ancienne reste** accessible via son hash — indéfiniment, sauf **réécriture explicite** de l'historique (et encore, les clones existants gardent tout).`,
        tags: ["git", "historique", "immuable"],
      },
      {
        id: "prat-git-t7",
        title: "La bonne réaction",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚨 Un secret a fuité

**Question :** une fois qu'une clé API a été committée en clair puis retirée dans un commit suivant, que faut-il **absolument** faire ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Révoquer/régénérer la clé immédiatement, car elle reste lisible dans l'historique git",
          "Rien, la retirer du code actuel suffit",
          "Renommer le dépôt",
          "Attendre que git supprime automatiquement les anciens objets",
        ],
        answer: 0,
        explanation: `Il faut **révoquer/régénérer** la clé **immédiatement** : elle est **définitivement compromise** dès qu'elle a été committée, puisqu'elle reste lisible dans l'historique (et dans tout clone). La retirer du code actuel ne suffit **pas**. Considère tout secret committé comme **fuité**.`,
        tags: ["git", "revocation", "secret"],
      },
      {
        id: "prat-git-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🛡️ Empêcher l'exposition

**Question :** quelle configuration **côté serveur web** aurait empêché l'exposition du dossier \`.git\` en premier lieu ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Bloquer explicitement l'accès à tout fichier/dossier commençant par un point dans la configuration du serveur web",
          "Changer le port du serveur web",
          "Désactiver git sur la machine de production",
          "Chiffrer le disque dur du serveur",
        ],
        answer: 0,
        explanation: `La parade directe : **bloquer les dotfiles** (fichiers/dossiers commençant par un **point**) au niveau du serveur web (une règle qui refuse \`/.git\`, \`/.env\`, etc.). L'idéal étant en plus de **ne jamais déployer** le \`.git/\` en production. Changer de port ou chiffrer le disque n'y changerait rien.`,
        tags: ["git", "dotfiles", "prevention"],
      },
    ],
  },
];
