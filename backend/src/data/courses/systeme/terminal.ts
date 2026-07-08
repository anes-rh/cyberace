import type { CourseSeed } from "../../../types";

/** Système — Module 3 : le terminal Linux, les bases (pratique intensive). */
export const terminal: CourseSeed[] = [
  {
    slug: "se-terminal",
    title: "Le terminal Linux — les bases",
    checkpoint: "systeme-exploitation",
    codename: "Command Line Rookie",
    domain: "Système — Linux pratique",
    theme: "track",
    icon: "Terminal",
    accent: "#E8A87C",
    order: 3,
    difficulty: "medium",
    summary:
      "Le cœur du checkpoint : piloter Linux au clavier. Naviguer, créer/copier/déplacer/supprimer, comprendre et poser les permissions (chmod octal, chown), chercher (find, grep), rediriger et enchaîner (>, >>, |), et manipuler les variables d'environnement. Tout se fait pour de vrai dans ta VM.",
    objectives: [
      "Naviguer dans l'arborescence (pwd, cd, ls, chemins absolus/relatifs)",
      "Gérer fichiers et dossiers (mkdir, touch, cp, mv, rm)",
      "Lire et poser des permissions (rwx, notation octale, chmod, chown)",
      "Rechercher efficacement (find par nom/type, grep dans le contenu)",
      "Rediriger et enchaîner des commandes (>, >>, |) et utiliser les variables d'environnement",
    ],
    lesson: `# ⌨️ Le terminal Linux — Command Line Rookie

Le terminal, c'est le **volant** de Linux. Une fois qu'on le tient, on va **10× plus vite** qu'à la souris. Ce module se pratique **entièrement dans ta VM Ubuntu** (\`Ctrl+Alt+T\` pour ouvrir un terminal). 🏎️

> 🎯 Règle du jeu : chaque commande de cette page, **tape-la vraiment** dans ta VM. Les défis se soumettent en écrivant la commande dans l'éditeur.

---

## 1. Où suis-je ? Naviguer 🧭

Le terminal est **toujours** « quelque part » dans l'arborescence : le **répertoire courant**.

| Commande | Rôle |
|---|---|
| \`pwd\` | *print working directory* — affiche où tu es |
| \`ls\` | liste le contenu du dossier |
| \`ls -l\` | liste **détaillée** (permissions, taille, date) |
| \`ls -la\` | idem + fichiers **cachés** (qui commencent par \`.\`) |
| \`cd dossier\` | entre dans \`dossier\` |
| \`cd ..\` | remonte d'un niveau |
| \`cd\` ou \`cd ~\` | retourne dans ton **dossier personnel** (\`/home/toi\`) |

**Chemin absolu vs relatif :**
\`\`\`
 /home/etudiant/projets/tp1     ← ABSOLU (part de la racine /)
 projets/tp1                    ← RELATIF (part d'où tu es)
 .   = le dossier courant       ..  = le dossier parent       ~ = ta maison
\`\`\`

---

## 2. Créer, copier, déplacer, supprimer 🗂️

| Commande | Rôle |
|---|---|
| \`mkdir dossier\` | crée un dossier (\`mkdir -p a/b/c\` crée toute l'arbo) |
| \`touch fichier\` | crée un fichier vide (ou met à jour sa date) |
| \`cp src dst\` | **copie** (\`cp -r\` pour un dossier entier) |
| \`mv src dst\` | **déplace** OU **renomme** |
| \`rm fichier\` | **supprime** (\`rm -r dossier\` pour un dossier) |
| \`cat fichier\` | affiche le contenu ; \`less\` pour paginer |

> ⚠️ \`rm\` est **définitif** : pas de corbeille ! \`rm -rf /\` détruirait tout — ne jamais lancer à l'aveugle. Sous ta VM, aucun risque pour ta vraie machine, mais prends l'habitude d'être prudent.

---

## 3. Les permissions : rwx 🔐

Linux est **multi-utilisateurs** : chaque fichier a un **propriétaire**, un **groupe**, et des **droits** pour trois catégories.

\`\`\`
 -rwxr-xr--   1 alice  dev   4096  script.sh
 │└┬┘└┬┘└┬┘
 │ │  │  └── autres (others) : r--  (lecture seule)
 │ │  └───── groupe (group)  : r-x  (lecture + exécution)
 │ └──────── propriétaire    : rwx  (lecture + écriture + exécution)
 └────────── type : - = fichier, d = dossier, l = lien
\`\`\`

- **r** (read) = lire (valeur **4**)
- **w** (write) = modifier (valeur **2**)
- **x** (execute) = exécuter un programme, ou **entrer** dans un dossier (valeur **1**)

### La notation octale 🔢

On additionne les valeurs pour chaque catégorie (proprio, groupe, autres) :

| Droits | Calcul | Octal |
|---|---|---|
| \`rwx\` | 4+2+1 | **7** |
| \`rw-\` | 4+2 | **6** |
| \`r-x\` | 4+1 | **5** |
| \`r--\` | 4 | **4** |

\`\`\`
 chmod 754 script.sh   →   rwx r-x r--
                            (7)  (5)  (4)
                          proprio grp autres
\`\`\`

- \`chmod 755 x\` = tout le monde peut lire/exécuter, seul le proprio écrit (typique d'un programme).
- \`chmod 644 x\` = proprio lit/écrit, les autres lisent (typique d'un fichier texte).
- \`chmod +x script.sh\` = ajoute juste le droit d'**exécution** (mode symbolique).
- \`chown alice fichier\` = change le **propriétaire** ; \`chown alice:dev fichier\` = proprio **et** groupe (souvent avec \`sudo\`).

---

## 4. Chercher : find et grep 🔎

Deux outils, deux usages :

- **\`find\`** cherche des **fichiers** (par nom, type, taille…) :
\`\`\`bash
find . -name "*.txt"          # tous les .txt sous le dossier courant
find /home -type d -name doc  # les DOSSIERS nommés doc
find . -size +1M              # les fichiers de plus de 1 Mo
\`\`\`
- **\`grep\`** cherche du **texte à l'intérieur** des fichiers :
\`\`\`bash
grep "erreur" journal.log     # lignes contenant "erreur"
grep -i "todo" *.c            # -i = insensible à la casse, dans tous les .c
grep -rn "fonction" src/      # -r récursif, -n avec numéro de ligne
\`\`\`

> 🧠 Moyen mnémo : **find** = trouver le **fichier**, **grep** = trouver **dedans**.

---

## 5. Rediriger et enchaîner : >, >>, | 🔀

C'est la **super-puissance** du shell. Chaque commande a une **entrée** et une **sortie**.

| Symbole | Effet |
|---|---|
| \`>\` | **redirige** la sortie vers un fichier (**écrase**) |
| \`>>\` | redirige en **ajoutant** à la fin (**append**) |
| \`<\` | prend l'entrée depuis un fichier |
| \`\\|\` | **pipe** : la sortie d'une commande devient l'**entrée** de la suivante |

\`\`\`bash
ls -l > liste.txt              # écrit la liste dans un fichier (écrase)
echo "ligne" >> journal.txt    # ajoute une ligne à la fin
cat access.log | grep 404 | wc -l   # compte les lignes contenant 404
\`\`\`

Le **pipe** \`|\` permet de **chaîner** de petits outils pour faire des choses puissantes : \`cat\` lit → \`grep\` filtre → \`wc -l\` compte. C'est la **philosophie Unix** : des outils simples qu'on combine.

---

## 6. Les variables d'environnement 🌱

Le shell garde des **variables** utiles à tous les programmes :

\`\`\`bash
echo $HOME       # ton dossier personnel : /home/etudiant
echo $USER       # ton nom d'utilisateur
echo $PATH       # les dossiers où le shell cherche les commandes
MAVAR="salut"    # créer une variable (PAS d'espaces autour du =)
echo $MAVAR      # l'utiliser : on la précède de $
export MAVAR     # la rendre visible aux programmes lancés ensuite
\`\`\`

> ⚠️ \`$PATH\` explique pourquoi \`ls\` marche partout : le shell trouve le programme \`ls\` dans un des dossiers listés par \`$PATH\` (comme \`/usr/bin\`).

---

## 🧠 Ce qu'il faut retenir

- **Naviguer** : \`pwd\` (où), \`ls -la\` (contenu), \`cd\` (se déplacer) ; \`.\` = courant, \`..\` = parent, \`~\` = maison.
- **Fichiers** : \`mkdir -p\`, \`touch\`, \`cp -r\`, \`mv\` (déplace/renomme), \`rm -r\` (définitif !).
- **Permissions** : \`rwx\` = 4/2/1 ; \`chmod 755\` (octal), \`chmod +x\` (symbolique), \`chown\` (propriétaire).
- **Chercher** : \`find\` (le **fichier**), \`grep\` (**dans** le fichier).
- **Rediriger/chaîner** : \`>\` (écrase), \`>>\` (ajoute), \`|\` (pipe : sortie → entrée).
- **Variables** : \`$HOME\`, \`$PATH\`, \`MAVAR=val\` (sans espaces), \`export\`.

## ⚠️ Erreurs fréquentes des débutants

**1. Espaces autour du \`=\`.** \`MAVAR = 5\` échoue ! En bash c'est \`MAVAR=5\` **collé**.

**2. \`>\` au lieu de \`>>\`.** \`>\` **écrase** le fichier ; \`>>\` **ajoute**. Une inversion et tu perds ton contenu.

**3. Confondre \`find\` et \`grep\`.** \`find\` cherche des **noms de fichiers**, \`grep\` cherche du **texte dans** les fichiers.

**4. \`chmod\` octal mal calculé.** Chaque chiffre = une catégorie (proprio/groupe/autres) = somme de 4(r)+2(w)+1(x). \`chmod 644\` = \`rw-r--r--\`.

**5. \`rm -rf\` à la légère.** Aucune corbeille. Vérifie **toujours** où tu es (\`pwd\`) et ce que tu supprimes avant d'appuyer sur Entrée.`,
    resources: [
      {
        label: "OpenClassrooms — Initiez-vous à Linux (gratuit)",
        url: "https://openclassrooms.com/fr/courses/7170491-initiez-vous-a-linux",
        kind: "link",
        note: "Cours structuré débutant, en français. Parfait complément pour aller plus loin.",
      },
      {
        label: "LabEx — Parcours Linux interactifs",
        url: "https://labex.io/fr/learn/linux",
        kind: "link",
        note: "Labs pratiques en ligne (terminal réel dans le navigateur), de la ligne de commande à l'admin.",
      },
      {
        label: "OverTheWire: Bandit (wargame terminal)",
        url: "https://overthewire.org/wargames/bandit/",
        kind: "link",
        note: "LA référence pour muscler ses commandes Linux en résolvant des niveaux via SSH. Fortement conseillé.",
      },
      {
        label: "Linux Journey (parcours par thème)",
        url: "https://linuxjourney.com/",
        kind: "link",
        note: "Parcours clair : ligne de commande, permissions, processus, réseau. Gratuit.",
      },
    ],
    badge: {
      id: "badge-command-line-rookie",
      name: "Command Line Rookie",
      icon: "Terminal",
      description: "Navigue, gère fichiers et permissions, cherche et enchaîne des commandes au terminal Linux.",
    },
    challenges: [
      {
        id: "se-term-pwd",
        title: "Où suis-je ?",
        order: 1,
        difficulty: "easy",
        type: "code",
        language: "bash",
        prompt: `## 🧭 Se repérer

Écris la commande qui **affiche le chemin absolu du répertoire courant** (l'endroit où tu te trouves dans le terminal).`,
        points: 80,
        timeLimitSec: 180,
        starter: ``,
        hints: [
          { text: "3 lettres : print working directory.", cost: 10 },
          { text: "📖 Correction : pwd", cost: 25 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [{ label: "Affiche le répertoire courant", pattern: "^\\s*pwd\\s*$", flags: "im" }],
        }),
        explanation: `\`\`\`bash
pwd
\`\`\`
**\`pwd\`** = *print working directory*. Il affiche le **chemin absolu** de l'endroit où tu es, par ex. \`/home/etudiant/projets\`. Réflexe indispensable avant toute opération risquée (surtout avant un \`rm\`).`,
        tags: ["terminal", "navigation", "pwd"],
      },
      {
        id: "se-term-arbo",
        title: "Créer une arborescence",
        order: 2,
        difficulty: "medium",
        type: "code",
        language: "bash",
        prompt: `## 🌳 Une commande, toute l'arbo

Tu veux créer d'un coup l'arborescence \`projet/src/utils\` (3 dossiers imbriqués), même si \`projet\` et \`src\` n'existent pas encore.

Écris **la** commande qui fait ça en une fois.`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "mkdir a une option pour créer les parents manquants.", cost: 15 },
          { text: "📖 Correction : mkdir -p projet/src/utils", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [
            { label: "Utilise mkdir avec -p (crée les parents)", pattern: "mkdir\\s+-p", flags: "i" },
            { label: "Crée le chemin projet/src/utils", pattern: "projet/src/utils", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
mkdir -p projet/src/utils
\`\`\`
L'option **\`-p\`** (*parents*) crée **tous les dossiers manquants** de la chaîne. Sans \`-p\`, \`mkdir projet/src/utils\` échouerait car \`projet\` et \`src\` n'existent pas encore. Vérifie avec \`ls -R projet\`.`,
        tags: ["terminal", "mkdir", "arborescence"],
      },
      {
        id: "se-term-octal",
        title: "Calcul de permissions octales",
        order: 3,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔢 Traduis en octal

Tu veux ces droits sur un script : le **propriétaire** peut lire, écrire ET exécuter ; le **groupe** peut lire et exécuter ; les **autres** peuvent seulement lire.

En clair : \`rwx r-x r--\`. **Quelle est la valeur octale à donner à \`chmod\` ?**

*(Réponds par le nombre à 3 chiffres, ex. 640.)*`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "r=4, w=2, x=1. Additionne par catégorie.", cost: 20 },
          { text: "📖 Correction : rwx=7, r-x=5, r--=4 → 754.", cost: 50 },
        ],
        answer: 754,
        explanation: `\`rwx\` = 4+2+1 = **7** · \`r-x\` = 4+0+1 = **5** · \`r--\` = 4 = **4** → **\`chmod 754 script.sh\`**. C'est un réglage classique : le proprio a tous les droits, le groupe peut lire/exécuter, les autres lisent seulement.`,
        tags: ["terminal", "permissions", "chmod", "octal"],
      },
      {
        id: "se-term-chmod",
        title: "Rendre un script exécutable",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "bash",
        prompt: `## ⚙️ chmod en pratique

Tu viens d'écrire \`deploy.sh\` mais Linux refuse de le lancer (« Permission denied »). Écris la commande qui donne les droits **\`rwxr-xr-x\`** (octal **755**) à \`deploy.sh\`.`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "chmod <octal> <fichier>. rwxr-xr-x = 755.", cost: 15 },
          { text: "📖 Correction : chmod 755 deploy.sh", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [
            { label: "Utilise chmod en octal 755", pattern: "chmod\\s+755", flags: "i" },
            { label: "Sur le fichier deploy.sh", pattern: "deploy\\.sh", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
chmod 755 deploy.sh      # rwx r-x r-x
./deploy.sh              # on peut maintenant le lancer
\`\`\`
**755** = proprio \`rwx\` (7), groupe et autres \`r-x\` (5) : tout le monde peut lire/exécuter, seul le proprio modifie. On aurait aussi pu faire \`chmod +x deploy.sh\` (mode symbolique) pour ajouter juste l'exécution.`,
        tags: ["terminal", "chmod", "permissions", "755"],
      },
      {
        id: "se-term-find",
        title: "Trouver des fichiers par nom",
        order: 5,
        difficulty: "medium",
        type: "code",
        language: "bash",
        prompt: `## 🔎 find

Écris la commande qui **trouve tous les fichiers \`.log\`** à partir du **répertoire courant** (et ses sous-dossiers).`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "find <où> -name <motif>. Le motif utilise des guillemets et *.", cost: 15 },
          { text: "📖 Correction : find . -name \"*.log\"", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Utilise find à partir du dossier courant", pattern: "find\\s+\\.", flags: "i" },
            { label: "Filtre par nom", pattern: "-name", flags: "i" },
            { label: "Cible les fichiers .log", pattern: "\\*\\.log", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
find . -name "*.log"
\`\`\`
**\`find\`** parcourt une arborescence. \`.\` = à partir d'**ici**, \`-name "*.log"\` = les fichiers dont le nom finit par \`.log\`. Les guillemets empêchent le shell d'interpréter le \`*\` trop tôt. Ajoute \`-type f\` pour ne garder que les fichiers (pas les dossiers).`,
        tags: ["terminal", "find", "recherche"],
      },
      {
        id: "se-term-grep",
        title: "Chercher dans le contenu",
        order: 6,
        difficulty: "medium",
        type: "code",
        language: "bash",
        prompt: `## 📄 grep

Écris la commande qui affiche **toutes les lignes contenant le mot \`erreur\`** (peu importe la casse : Erreur, ERREUR…) dans le fichier \`journal.log\`.`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "grep <motif> <fichier>. L'option -i ignore la casse.", cost: 15 },
          { text: "📖 Correction : grep -i \"erreur\" journal.log", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Utilise grep", pattern: "grep", flags: "i" },
            { label: "Ignore la casse (-i)", pattern: "-i\\b", flags: "" },
            { label: "Cherche erreur dans journal.log", pattern: "erreur[\\s\\S]*journal\\.log", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
grep -i "erreur" journal.log
\`\`\`
**\`grep\`** cherche un **motif dans le contenu**. \`-i\` (*insensitive*) ignore la casse → attrape \`erreur\`, \`Erreur\`, \`ERREUR\`. Options utiles : \`-n\` (numéro de ligne), \`-r\` (récursif dans un dossier), \`-c\` (compter). Rappelle-toi : **find** = le fichier, **grep** = dedans.`,
        tags: ["terminal", "grep", "recherche"],
      },
      {
        id: "se-term-pipe",
        title: "Compter avec un pipe",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "bash",
        prompt: `## 🔀 Le pipe qui compte

Le fichier \`access.log\` contient des lignes de journal web. Écris **une seule ligne** qui **compte le nombre de lignes contenant \`404\`**, en enchaînant \`grep\` et \`wc\` avec un **pipe**.`,
        points: 250,
        timeLimitSec: 420,
        starter: ``,
        hints: [
          { text: "grep 404 access.log | wc -l : grep filtre, wc -l compte les lignes.", cost: 25 },
          { text: "📖 Correction : grep \"404\" access.log | wc -l", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Filtre les lignes 404 avec grep", pattern: "grep\\s+\"?404", flags: "i" },
            { label: "Utilise un pipe", pattern: "\\|", flags: "" },
            { label: "Compte les lignes avec wc -l", pattern: "wc\\s+-l", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
grep "404" access.log | wc -l
\`\`\`
Le **pipe \`|\`** branche la **sortie** de \`grep\` (les lignes contenant 404) sur l'**entrée** de \`wc -l\` (qui **compte les lignes**). C'est la philosophie Unix : de petits outils combinés. On aurait aussi pu faire \`grep -c "404" access.log\` (\`-c\` = count).`,
        tags: ["terminal", "pipe", "grep", "wc"],
      },
      {
        id: "se-term-redirect",
        title: "Ajouter sans écraser",
        order: 8,
        difficulty: "medium",
        type: "code",
        language: "bash",
        prompt: `## ➕ Redirection

Tu veux **ajouter** la ligne \`Sauvegarde OK\` à la **fin** du fichier \`journal.txt\` **sans effacer** son contenu existant. Écris la commande (avec \`echo\`).`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "echo \"...\" >> fichier. Le DOUBLE chevron ajoute (le simple écrase).", cost: 15 },
          { text: "📖 Correction : echo \"Sauvegarde OK\" >> journal.txt", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Utilise echo", pattern: "echo", flags: "i" },
            { label: "Redirige en AJOUT avec >>", pattern: ">>", flags: "" },
            { label: "Vers journal.txt", pattern: "journal\\.txt", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
echo "Sauvegarde OK" >> journal.txt
\`\`\`
Le **\`>>\`** (double chevron) **ajoute** à la fin du fichier. Le **\`>\`** (simple) aurait **écrasé** tout le contenu par la seule ligne « Sauvegarde OK ». Piège classique : \`>\` vs \`>>\`. Vérifie avec \`cat journal.txt\`.`,
        tags: ["terminal", "redirection", "append"],
      },
      {
        id: "se-term-env",
        title: "Lire une variable d'environnement",
        order: 9,
        difficulty: "easy",
        type: "code",
        language: "bash",
        prompt: `## 🌱 Variables d'environnement

Écris la commande qui **affiche le chemin de ton dossier personnel** (ta « maison ») en utilisant la **variable d'environnement** adaptée.`,
        points: 100,
        timeLimitSec: 240,
        starter: ``,
        hints: [
          { text: "echo $NOM_DE_VARIABLE. La maison, c'est HOME.", cost: 10 },
          { text: "📖 Correction : echo $HOME", cost: 30 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [
            { label: "Utilise echo", pattern: "echo", flags: "i" },
            { label: "Lit la variable HOME avec $", pattern: "\\$HOME", flags: "" },
          ],
        }),
        explanation: `\`\`\`bash
echo $HOME
\`\`\`
Une **variable d'environnement** se lit en la préfixant de **\`$\`**. \`$HOME\` = ton dossier personnel (\`/home/etudiant\`), \`$USER\` = ton login, \`$PATH\` = les dossiers où le shell cherche les commandes. Sans \`$\`, \`echo HOME\` afficherait juste le texte « HOME ».`,
        tags: ["terminal", "variables", "environnement", "HOME"],
      },
      {
        id: "se-term-cp-mv",
        title: "Copier puis renommer",
        order: 10,
        difficulty: "medium",
        type: "code",
        language: "bash",
        prompt: `## 📦 cp et mv

Deux actions, deux lignes :
1. **Copie** le dossier complet \`config/\` vers \`config_backup/\` (dossier = récursif).
2. **Renomme** le fichier \`vieux.txt\` en \`nouveau.txt\`.`,
        points: 200,
        timeLimitSec: 360,
        starter: `# 1) copier le dossier config vers config_backup
# 2) renommer vieux.txt en nouveau.txt
`,
        hints: [
          { text: "cp -r pour un dossier ; mv sert aussi bien à déplacer qu'à renommer.", cost: 20 },
          { text: "📖 Correction :\n```\ncp -r config config_backup\nmv vieux.txt nouveau.txt\n```", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Copie récursive du dossier (cp -r)", pattern: "cp\\s+-r\\s+config\\s+config_backup", flags: "i" },
            { label: "Renomme avec mv", pattern: "mv\\s+vieux\\.txt\\s+nouveau\\.txt", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
cp -r config config_backup     # -r (récursif) : copie le dossier ET son contenu
mv vieux.txt nouveau.txt       # mv sert à déplacer ET à renommer
\`\`\`
Pour un **dossier**, \`cp\` a besoin de **\`-r\`** (sinon « omitting directory »). **\`mv\`** n'a pas de commande « rename » dédiée : renommer = déplacer vers un nouveau nom dans le même dossier.`,
        tags: ["terminal", "cp", "mv", "fichiers"],
      },
    ],
  },
];
