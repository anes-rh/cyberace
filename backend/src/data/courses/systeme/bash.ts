import type { CourseSeed } from "../../../types";

/** Système — Module 4 : le shell et le scripting bash. */
export const bash: CourseSeed[] = [
  {
    slug: "se-bash",
    title: "Le shell & le scripting bash",
    checkpoint: "systeme-exploitation",
    codename: "Script Driver",
    domain: "Système — Automatisation",
    theme: "track",
    icon: "Cog",
    accent: "#E8A87C",
    order: 4,
    difficulty: "medium",
    summary:
      "Automatiser au lieu de répéter : un script bash, c'est une suite de commandes dans un fichier. Shebang, variables, arguments ($1, $#, $@), conditions (if/test), boucles (for/while), et le fameux code de retour ($?). On écrit et on exécute pour de vrai.",
    objectives: [
      "Écrire et exécuter un script (shebang #!/bin/bash, chmod +x)",
      "Utiliser variables et arguments de script ($1, $#, $@, $0)",
      "Écrire des conditions avec if / test / [ ] (fichiers, chaînes, nombres)",
      "Écrire des boucles for et while",
      "Comprendre et utiliser le code de retour ($?, exit)",
    ],
    lesson: `# 📜 Le shell & le scripting bash — Script Driver

Tu tapes trois fois par jour la même série de commandes ? **Mets-les dans un script.** Un script bash, c'est de l'**automatisation** : un fichier texte qui enchaîne des commandes. 🏎️

> 🎯 Tout se teste dans ta VM : crée le fichier, \`chmod +x\`, lance-le.

---

## 1. Le squelette d'un script 🦴

\`\`\`bash
#!/bin/bash
# mon premier script — les commentaires commencent par #
echo "Bonjour, $USER !"
echo "Nous sommes le $(date)"
\`\`\`

- La **première ligne** \`#!/bin/bash\` est le **shebang** : elle dit quel interpréteur lancer.
- On rend le script **exécutable** puis on le lance :
\`\`\`bash
chmod +x salut.sh
./salut.sh
\`\`\`
- \`$(commande)\` = **substitution** : remplace par la **sortie** de la commande (ici, la date).

> ⚠️ \`./salut.sh\` (avec \`./\`) car le dossier courant n'est **pas** dans \`$PATH\` : il faut préciser « ici ».

---

## 2. Variables et arguments 📥

\`\`\`bash
#!/bin/bash
nom="Ada"                 # PAS d'espaces autour du =
echo "Salut $nom"         # on lit avec $
echo "Longueur : \${#nom}" # nombre de caractères
\`\`\`

Un script reçoit des **arguments** sur la ligne de commande :

| Variable | Signification |
|---|---|
| \`$0\` | le nom du script lui-même |
| \`$1\`, \`$2\`, … | le 1er, 2e… argument |
| \`$#\` | le **nombre** d'arguments |
| \`$@\` | **tous** les arguments |
| \`$?\` | le **code de retour** de la dernière commande |

\`\`\`bash
#!/bin/bash
echo "Script : $0"
echo "1er argument : $1"
echo "Nombre d'arguments : $#"
\`\`\`
Lancé avec \`./info.sh pomme poire\` → \`$1\` vaut \`pomme\`, \`$#\` vaut \`2\`.

---

## 3. Les conditions : if et test 🔀

\`\`\`bash
if [ "$1" = "start" ]; then
  echo "Démarrage…"
elif [ "$1" = "stop" ]; then
  echo "Arrêt…"
else
  echo "Usage : $0 start|stop"
fi
\`\`\`

⚠️ Points de syntaxe cruciaux :
- Les **espaces** autour des crochets sont **obligatoires** : \`[ "$1" = "start" ]\` (pas \`["$1"...]\`).
- On **ferme** un \`if\` par \`fi\` (if à l'envers).

**Tests de fichiers** (très fréquents en système) :

| Test | Vrai si… |
|---|---|
| \`[ -e f ]\` | \`f\` **existe** |
| \`[ -f f ]\` | \`f\` est un **fichier** |
| \`[ -d f ]\` | \`f\` est un **dossier** |
| \`[ -r f ]\` / \`-w\` / \`-x\` | lisible / modifiable / exécutable |

**Tests numériques** (attention, différents des chaînes) :

| Chaînes | Nombres | Sens |
|---|---|---|
| \`=\` | \`-eq\` | égal |
| \`!=\` | \`-ne\` | différent |
| — | \`-lt\` / \`-gt\` | \< / \> |
| — | \`-le\` / \`-ge\` | ≤ / ≥ |

\`\`\`bash
if [ "$#" -lt 1 ]; then
  echo "Il faut au moins 1 argument"; exit 1
fi
\`\`\`

---

## 4. Les boucles 🔁

**\`for\`** — parcourir une liste :
\`\`\`bash
for fichier in *.txt; do
  echo "Traitement de $fichier"
done

for i in 1 2 3 4 5; do
  echo "Tour $i"
done
\`\`\`

**\`while\`** — tant qu'une condition est vraie :
\`\`\`bash
compteur=1
while [ "$compteur" -le 3 ]; do
  echo "Compteur = $compteur"
  compteur=$((compteur + 1))   # $(( … )) = calcul arithmétique
done
\`\`\`

> 🧮 \`$(( … ))\` fait de l'**arithmétique** : \`$((compteur + 1))\`, \`$((a * b))\`.

---

## 5. Le code de retour : $? et exit 🚦

Chaque commande renvoie un **code de sortie** : **0 = succès**, **≠ 0 = échec**. C'est fondamental en système (on enchaîne selon le résultat).

\`\`\`bash
ls /dossier/existe
echo $?          # 0  (succès)
ls /nexistepas
echo $?          # 2  (échec)
\`\`\`

Dans **ton** script, tu choisis le code avec \`exit\` :
\`\`\`bash
if [ ! -f "$1" ]; then
  echo "Fichier introuvable"; exit 1   # échec → code 1
fi
echo "Traitement OK"; exit 0            # succès → code 0
\`\`\`

On enchaîne aussi avec \`&&\` (« et si succès ») et \`||\` (« ou sinon ») :
\`\`\`bash
make && ./programme      # lance le programme SEULEMENT si make a réussi
grep -q motif f || echo "pas trouvé"   # affiche seulement si grep échoue
\`\`\`

---

## 🧠 Ce qu'il faut retenir

- Un script commence par le **shebang** \`#!/bin/bash\`, se rend exécutable (\`chmod +x\`) et se lance avec \`./script.sh\`.
- Arguments : \`$1\`, \`$2\`… , \`$#\` (combien), \`$@\` (tous), \`$0\` (le nom).
- **\`if [ … ]; then … fi\`** — **espaces obligatoires** dans les crochets ; tests fichiers (\`-f\`, \`-d\`, \`-e\`) et numériques (\`-eq\`, \`-lt\`, \`-gt\`).
- Boucles **\`for … in … do … done\`** et **\`while [ … ]; do … done\`** ; calcul avec \`$(( … ))\`.
- **Code de retour** : \`$?\` (0 = succès), \`exit N\` dans ton script, \`&&\`/\`||\` pour enchaîner.

## ⚠️ Erreurs fréquentes des débutants

**1. Oublier les espaces dans \`[ ]\`.** \`[ "$a" = "b" ]\` fonctionne ; \`["$a"="b"]\` **échoue**. Le \`[\` est une **commande**, il lui faut des espaces.

**2. \`=\` pour des nombres.** Pour comparer des **nombres**, utilise \`-eq\`, \`-lt\`, \`-gt\`… \`=\` est pour les **chaînes**.

**3. Espaces autour du \`=\` d'affectation.** \`x=5\` (collé), jamais \`x = 5\`.

**4. Lancer \`script.sh\` sans \`./\`.** Le dossier courant n'est pas dans \`$PATH\` → « command not found ». Écris \`./script.sh\`.

**5. Ignorer les codes de retour.** \`$?\` et \`exit\` sont la base de l'automatisation robuste : un script qui ne signale pas ses échecs est dangereux.`,
    badge: {
      id: "badge-script-driver",
      name: "Script Driver",
      icon: "Cog",
      description: "Écrit des scripts bash : shebang, arguments, conditions, boucles et codes de retour.",
    },
    challenges: [
      {
        id: "se-bash-shebang",
        title: "La première ligne",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🦴 Le shebang

À quoi sert la première ligne \`#!/bin/bash\` d'un script ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Elle indique QUOI utiliser pour exécuter le fichier.", cost: 10 },
          { text: "📖 Correction : elle désigne l'interpréteur (bash) qui exécutera le script.", cost: 30 },
        ],
        options: [
          "Elle indique l'interpréteur à utiliser pour exécuter le script (ici bash)",
          "C'est un commentaire décoratif, sans effet",
          "Elle compile le script en binaire",
          "Elle supprime le script après exécution",
        ],
        answer: 0,
        explanation: `Le **shebang** \`#!/bin/bash\` (les 2 premiers caractères \`#!\`) indique au système **quel interpréteur** lancer pour exécuter le fichier — ici \`/bin/bash\`. Sans lui, le système ne saurait pas que c'est un script bash. Ce n'est PAS un simple commentaire, même s'il commence par \`#\`.`,
        tags: ["bash", "shebang", "script"],
      },
      {
        id: "se-bash-args",
        title: "Les arguments d'un script",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📥 $1, $#…

Un script est lancé ainsi :

\`\`\`
./sauvegarde.sh photos videos musique
\`\`\`

Que vaut **\`$#\`** à l'intérieur du script ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "$# = le NOMBRE d'arguments (pas le nom du script).", cost: 15 },
          { text: "📖 Correction : 3 arguments (photos, videos, musique) → $# = 3.", cost: 40 },
        ],
        options: ["3", "4", "0", "photos"],
        answer: 0,
        explanation: `**\`$#\`** = le **nombre d'arguments** passés au script. Ici il y en a **3** (\`photos\`, \`videos\`, \`musique\`). Le nom du script (\`$0\`) **ne compte pas** dans \`$#\`. \`$1\` vaudrait \`photos\`, \`$2\` \`videos\`, \`$@\` = les trois.`,
        tags: ["bash", "arguments", "script"],
      },
      {
        id: "se-bash-exitcode",
        title: "Le code de retour",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚦 $?

Après une commande qui **réussit**, que vaut habituellement \`$?\` ?`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "Convention Unix : 0 = tout va bien.", cost: 15 },
          { text: "📖 Correction : 0 = succès ; toute valeur ≠ 0 = échec.", cost: 40 },
        ],
        options: [
          "0 (le succès vaut zéro ; une valeur ≠ 0 signale un échec)",
          "1 (le succès vaut un)",
          "-1",
          "Le nombre de lignes affichées",
        ],
        answer: 0,
        explanation: `Convention Unix : **\`$?\` = 0 → succès**, **≠ 0 → échec** (le code précise souvent le type d'erreur). C'est contre-intuitif (0 = « pas d'erreur ») mais universel. C'est la base de \`&&\` (« si succès ») et \`||\` (« sinon »), et de \`exit 0\`/\`exit 1\` dans tes scripts.`,
        tags: ["bash", "exit-code", "retour"],
      },
      {
        id: "se-bash-if-file",
        title: "Tester l'existence d'un fichier",
        order: 4,
        difficulty: "medium",
        type: "code",
        language: "bash",
        prompt: `## 🔀 if + test de fichier

Complète un script : si le fichier passé en 1er argument (\`$1\`) **existe et est un fichier régulier**, affiche \`OK\`, sinon affiche \`Introuvable\`.

Écris le bloc \`if … then … else … fi\` (le test \`-f\` vérifie « fichier régulier »).`,
        points: 250,
        timeLimitSec: 420,
        starter: `#!/bin/bash
`,
        hints: [
          { text: "if [ -f \"$1\" ]; then echo OK; else echo Introuvable; fi. Espaces obligatoires dans [ ].", cost: 25 },
          { text: "📖 Correction :\n```\nif [ -f \"$1\" ]; then\n  echo \"OK\"\nelse\n  echo \"Introuvable\"\nfi\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Teste que $1 est un fichier régulier (-f)", pattern: "\\[\\s+-f\\s+\"?\\$1\"?\\s+\\]", flags: "" },
            { label: "Ouvre le bloc conditionnel (then)", pattern: "then", flags: "i" },
            { label: "Branche alternative (else)", pattern: "else", flags: "i" },
            { label: "Ferme le if (fi)", pattern: "\\bfi\\b", flags: "" },
          ],
        }),
        explanation: `\`\`\`bash
if [ -f "$1" ]; then
  echo "OK"
else
  echo "Introuvable"
fi
\`\`\`
**\`-f\`** teste « fichier régulier existant ». Les **espaces** dans \`[ -f "$1" ]\` sont obligatoires (le \`[\` est une commande !). On **guillemette** \`"$1"\` pour gérer les noms avec espaces. Le \`if\` se ferme par **\`fi\`**. Tests voisins : \`-d\` (dossier), \`-e\` (existe, quel que soit le type), \`-r/-w/-x\` (droits).`,
        tags: ["bash", "if", "test", "fichier"],
      },
      {
        id: "se-bash-for",
        title: "Une boucle for",
        order: 5,
        difficulty: "medium",
        type: "code",
        language: "bash",
        prompt: `## 🔁 for

Écris une boucle **\`for\`** qui affiche \`Bonjour X\` pour chaque fichier **\`.txt\`** du dossier courant (où X est le nom du fichier).`,
        points: 200,
        timeLimitSec: 360,
        starter: `#!/bin/bash
`,
        hints: [
          { text: "for f in *.txt; do echo \"Bonjour $f\"; done", cost: 20 },
          { text: "📖 Correction :\n```\nfor f in *.txt; do\n  echo \"Bonjour $f\"\ndone\n```", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Boucle for sur les *.txt", pattern: "for\\s+\\w+\\s+in\\s+\\*\\.txt", flags: "i" },
            { label: "Ouvre le corps (do)", pattern: "\\bdo\\b", flags: "i" },
            { label: "Affiche Bonjour + la variable", pattern: "echo\\s+\"?Bonjour\\s+\\$", flags: "i" },
            { label: "Ferme la boucle (done)", pattern: "\\bdone\\b", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
for f in *.txt; do
  echo "Bonjour $f"
done
\`\`\`
\`for VAR in LISTE; do … done\`. Ici \`*.txt\` est **développé** par le shell en la liste des fichiers \`.txt\` du dossier. À chaque tour, \`$f\` vaut un nom de fichier. On ferme par **\`done\`** (pas \`end\`).`,
        tags: ["bash", "for", "boucle"],
      },
      {
        id: "se-bash-while",
        title: "Compter avec while",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "bash",
        prompt: `## 🔢 while + arithmétique

Écris une boucle **\`while\`** qui affiche les nombres de **1 à 5** (un par ligne). Utilise un compteur et l'arithmétique \`$(( … ))\`.`,
        points: 250,
        timeLimitSec: 420,
        starter: `#!/bin/bash
i=1
`,
        hints: [
          { text: "while [ $i -le 5 ]; do echo $i; i=$((i + 1)); done", cost: 25 },
          { text: "📖 Correction :\n```\ni=1\nwhile [ $i -le 5 ]; do\n  echo $i\n  i=$((i + 1))\ndone\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Condition while avec -le 5", pattern: "while\\s+\\[\\s+\\$\\w+\\s+-le\\s+5\\s+\\]", flags: "i" },
            { label: "Corps de boucle (do)", pattern: "\\bdo\\b", flags: "i" },
            { label: "Incrémente avec $(( … ))", pattern: "\\$\\(\\(\\s*\\w+\\s*\\+\\s*1\\s*\\)\\)", flags: "" },
            { label: "Ferme la boucle (done)", pattern: "\\bdone\\b", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
i=1
while [ $i -le 5 ]; do
  echo $i
  i=$((i + 1))       # arithmétique : incrémente i
done
\`\`\`
La condition \`[ $i -le 5 ]\` utilise **\`-le\`** (≤) car on compare des **nombres**. **\`$(( … ))\`** évalue une expression arithmétique. Sans l'incrément \`i=$((i+1))\`, la boucle serait **infinie** (Ctrl+C pour l'arrêter) !`,
        tags: ["bash", "while", "arithmetique"],
      },
      {
        id: "se-bash-usage",
        title: "Vérifier les arguments",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "bash",
        prompt: `## 🛡️ Script robuste

Au début d'un script, vérifie qu'**au moins 1 argument** a été fourni. Sinon, affiche \`Usage: $0 <fichier>\` et **quitte avec le code d'erreur 1**.`,
        points: 250,
        timeLimitSec: 420,
        starter: `#!/bin/bash
`,
        hints: [
          { text: "if [ $# -lt 1 ]; then echo \"Usage: $0 <fichier>\"; exit 1; fi", cost: 25 },
          { text: "📖 Correction :\n```\nif [ $# -lt 1 ]; then\n  echo \"Usage: $0 <fichier>\"\n  exit 1\nfi\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Teste le nombre d'arguments ($# -lt 1)", pattern: "\\[\\s+\\$#\\s+-lt\\s+1\\s+\\]", flags: "" },
            { label: "Affiche un message Usage", pattern: "echo\\s+\"?Usage", flags: "i" },
            { label: "Quitte avec le code 1", pattern: "exit\\s+1", flags: "i" },
            { label: "Ferme le if (fi)", pattern: "\\bfi\\b", flags: "" },
          ],
        }),
        explanation: `\`\`\`bash
if [ $# -lt 1 ]; then
  echo "Usage: $0 <fichier>"
  exit 1
fi
\`\`\`
**\`$#\`** = nombre d'arguments ; \`-lt 1\` = « strictement inférieur à 1 » = zéro argument. On affiche l'**usage** (bonne pratique) et on **\`exit 1\`** (code d'échec) pour que celui qui appelle le script sache que ça a échoué. C'est le début de tout script sérieux.`,
        tags: ["bash", "arguments", "exit", "robustesse"],
      },
      {
        id: "se-bash-andor",
        title: "Enchaîner selon le succès",
        order: 8,
        difficulty: "medium",
        type: "code",
        language: "bash",
        prompt: `## ⛓️ && et ||

Écris **une seule ligne** qui **compile** \`prog.c\` avec \`gcc\` (sortie \`prog\`) **puis lance \`./prog\` UNIQUEMENT si la compilation réussit**.`,
        points: 200,
        timeLimitSec: 360,
        starter: ``,
        hints: [
          { text: "cmd1 && cmd2 : cmd2 ne s'exécute que si cmd1 réussit (code 0).", cost: 20 },
          { text: "📖 Correction : gcc prog.c -o prog && ./prog", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.75,
          keypoints: [
            { label: "Compile avec gcc vers prog", pattern: "gcc\\s+prog\\.c\\s+-o\\s+prog", flags: "i" },
            { label: "Enchaîne avec && (si succès)", pattern: "&&", flags: "" },
            { label: "Lance ./prog", pattern: "\\./prog", flags: "" },
          ],
        }),
        explanation: `\`\`\`bash
gcc prog.c -o prog && ./prog
\`\`\`
**\`&&\`** = « ET » logique : \`./prog\` ne s'exécute **que si** \`gcc\` a renvoyé **0** (succès). Si la compilation échoue, on ne lance pas un vieux binaire. À l'inverse, \`||\` (« OU ») exécute la commande de droite **seulement si** celle de gauche échoue.`,
        tags: ["bash", "and-or", "gcc", "enchainement"],
      },
    ],
  },
];
