import type { CourseSeed } from "../../../types";

/** Système — Module 5 : gestion des processus (shell + C fork/exec/wait). */
export const processus: CourseSeed[] = [
  {
    slug: "se-processus",
    title: "Gestion des processus",
    checkpoint: "systeme-exploitation",
    codename: "Process Pit",
    domain: "Système — Processus",
    theme: "track",
    icon: "GitFork",
    accent: "#E8A87C",
    order: 5,
    difficulty: "hard",
    summary:
      "Un processus, c'est un programme en train de tourner. Cycle de vie, PID/PPID, observer (ps, top/htop), signaler (kill), jobs au premier/arrière-plan (&, jobs, fg, bg) — puis on crée des processus en C avec fork(), exec() et wait().",
    objectives: [
      "Définir un processus, son PID/PPID et son cycle de vie (états)",
      "Observer les processus (ps aux, top/htop) et les tuer (kill, signaux)",
      "Gérer les tâches : arrière-plan (&), jobs, fg, bg",
      "Créer un processus fils en C avec fork() et distinguer parent/fils",
      "Remplacer l'image d'un processus (exec) et attendre un fils (wait)",
    ],
    lesson: `# ⚙️ Gestion des processus — Process Pit

Un **programme** est un fichier sur le disque (passif). Un **processus** est ce programme **en cours d'exécution** (actif, avec sa mémoire, ses fichiers ouverts…). Ici on observe, on contrôle, puis on **crée** des processus en C. 🏎️

---

## 1. Anatomie d'un processus 🧬

Chaque processus a :
- un **PID** (*Process ID*) : son numéro unique ;
- un **PPID** : le PID de son **parent** (qui l'a créé) ;
- un **propriétaire**, un état, sa propre mémoire.

En Linux, **tout processus descend d'un ancêtre commun** (\`init\`/\`systemd\`, PID 1). C'est un **arbre** de processus.

### Cycle de vie (états)

\`\`\`
   [Nouveau] → [Prêt] ⇄ [Élu/En exécution] → [Terminé]
                  ↑            │
                  └── [Bloqué] ←┘  (attend une E/S, un verrou…)
\`\`\`

- **Prêt** : attend le CPU (l'ordonnanceur va le choisir — module suivant).
- **En exécution** : utilise le CPU **maintenant**.
- **Bloqué** : attend un événement (fin de lecture disque, etc.) — il ne consomme pas de CPU.
- **Zombie** : un fils **terminé** dont le parent n'a pas encore lu le code de retour (\`wait\`). Un zombie n'est **pas** un bug d'affichage : c'est un état réel, temporaire.

---

## 2. Observer : ps, top, htop 👀

\`\`\`bash
ps               # tes processus dans ce terminal
ps aux           # TOUS les processus, format détaillé (PID, %CPU, %MEM, commande)
ps aux | grep firefox   # ne garder que ceux liés à firefox
top              # moniteur temps réel (q pour quitter)
htop             # top en plus joli/interactif (à installer : sudo apt install htop)
\`\`\`

Colonnes utiles de \`ps aux\` : **PID**, **%CPU**, **%MEM**, **STAT** (état : R=running, S=sleeping, Z=zombie), **COMMAND**.

---

## 3. Signaler : kill et les signaux 📮

On communique avec un processus par des **signaux**. \`kill\` en **envoie** un (il ne « tue » pas forcément !) :

| Signal | Numéro | Effet |
|---|---|---|
| \`SIGTERM\` | 15 | demande polie d'arrêt (**défaut** de \`kill\`) |
| \`SIGKILL\` | 9 | arrêt **brutal**, impossible à ignorer |
| \`SIGINT\` | 2 | interruption clavier (**Ctrl+C**) |
| \`SIGSTOP\` | 19 | met en pause ; \`SIGCONT\` (18) reprend |

\`\`\`bash
kill 1234          # envoie SIGTERM (15) au PID 1234 — arrêt propre
kill -9 1234       # envoie SIGKILL (9) — brutal, en dernier recours
killall firefox    # par nom au lieu du PID
\`\`\`

> 🧠 Toujours essayer \`kill\` (SIGTERM) **avant** \`kill -9\` : SIGTERM laisse le programme se fermer proprement (sauvegarder, libérer). SIGKILL le coupe net.

---

## 4. Premier plan, arrière-plan : &, jobs, fg, bg 🎚️

Par défaut une commande **occupe** le terminal (premier plan). Pour la lancer en **arrière-plan** :

\`\`\`bash
./longue_tache &     # & → lance en arrière-plan, le terminal reste libre
jobs                 # liste les tâches de ce terminal
fg %1                # ramène la tâche 1 au premier plan
bg %1                # relance la tâche 1 (arrêtée) en arrière-plan
\`\`\`

- **Ctrl+Z** met la tâche du premier plan **en pause** (elle apparaît dans \`jobs\`).
- **Ctrl+C** l'**interrompt** (SIGINT).

---

## 5. Créer un processus en C : fork() 🍴

\`fork()\` **duplique** le processus appelant : il crée un **fils** quasi identique au **parent**. Subtilité géniale : \`fork()\` **retourne deux fois** —

\`\`\`c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    if (pid < 0) {
        // échec de fork
        return 1;
    } else if (pid == 0) {
        // on est dans le FILS (fork a renvoyé 0)
        printf("Fils : mon PID est %d\\n", getpid());
    } else {
        // on est dans le PARENT (fork a renvoyé le PID du fils)
        printf("Parent : mon fils est %d\\n", pid);
    }
    return 0;
}
\`\`\`

| Valeur renvoyée par \`fork()\` | On est dans… |
|---|---|
| **< 0** | échec (pas de fils créé) |
| **== 0** | le **fils** |
| **> 0** (le PID du fils) | le **parent** |

> ⚠️ Après \`fork()\`, **deux** processus exécutent la **même** suite d'instructions. Le \`if\` sur la valeur de retour est ce qui les fait diverger.

---

## 6. wait() et exec() 🔗

**\`wait()\`** : le parent **attend** la fin d'un fils et récupère son code de retour. Sans \`wait\`, un fils terminé devient **zombie**.

\`\`\`c
#include <sys/wait.h>
int status;
pid_t pid = fork();
if (pid == 0) {
    printf("Fils au travail\\n");
} else {
    wait(&status);                 // le parent ATTEND la fin du fils
    printf("Parent : fils terminé\\n");
}
\`\`\`
Grâce à \`wait()\`, l'affichage est **déterministe** : le fils finit, puis le parent continue.

**\`exec()\`** : **remplace** le programme du processus courant par un **autre**. Le processus garde son PID mais exécute désormais un tout autre code. Combo classique : **fork puis exec** — le parent crée un fils, le fils fait \`exec\` d'une commande.

\`\`\`c
if (fork() == 0) {
    execlp("ls", "ls", "-l", NULL);   // le fils DEVIENT "ls -l"
    // ce printf ne s'exécute JAMAIS si exec réussit
}
\`\`\`

> 🧠 C'est **exactement** ce que fait le shell : \`fork()\` pour créer un processus, \`exec()\` pour y lancer ta commande, \`wait()\` pour attendre qu'elle finisse.

---

## 🧠 Ce qu'il faut retenir

- **Programme** = fichier passif ; **processus** = programme en exécution (PID, PPID, mémoire, état).
- États : Prêt ⇄ En exécution ⇄ Bloqué → Terminé ; un fils terminé non attendu = **zombie**.
- Observer : \`ps aux\`, \`top\`/\`htop\`. Signaler : \`kill PID\` (SIGTERM 15), \`kill -9\` (SIGKILL 9, brutal).
- Tâches : \`&\` (arrière-plan), \`jobs\`, \`fg\`, \`bg\`, Ctrl+Z (pause), Ctrl+C (interrompt).
- \`fork()\` duplique : renvoie **0 au fils**, **le PID au parent**, **< 0 si échec**.
- \`wait()\` : le parent attend le fils (évite les zombies). \`exec()\` : remplace le programme courant. Le shell = **fork + exec + wait**.

## ⚠️ Erreurs fréquentes des débutants

**1. Croire que \`fork()\` ne renvoie qu'une fois.** Il renvoie **deux fois** — une dans le parent (PID du fils), une dans le fils (0). C'est déroutant mais central.

**2. Inverser le test.** \`pid == 0\` → **fils** ; \`pid > 0\` → **parent**. Beaucoup se trompent.

**3. Oublier \`wait()\`.** Sans lui, les fils terminés deviennent des **zombies** et l'ordre d'affichage devient imprévisible.

**4. Penser que \`kill\` tue toujours.** \`kill\` **envoie un signal**. \`SIGTERM\` (défaut) est une demande polie ; le programme peut se fermer proprement. \`SIGKILL\` (\`-9\`) seul est imparable — à réserver.

**5. Croire que le code après un \`exec\` réussi s'exécute.** Non : \`exec\` **remplace** le programme. Les lignes après un \`exec\` réussi ne tournent jamais.`,
    badge: {
      id: "badge-process-pit",
      name: "Process Pit",
      icon: "GitFork",
      description: "Observe, signale et crée des processus (ps/kill/jobs, fork/exec/wait en C).",
    },
    challenges: [
      {
        id: "se-proc-ps",
        title: "Lister tous les processus",
        order: 1,
        difficulty: "easy",
        type: "code",
        language: "bash",
        prompt: `## 👀 Voir ce qui tourne

Écris la commande qui liste **tous** les processus du système au format détaillé (PID, %CPU, %MEM, commande).`,
        points: 100,
        timeLimitSec: 240,
        starter: ``,
        hints: [
          { text: "ps avec les options a, u, x (sans tiret) → aux.", cost: 10 },
          { text: "📖 Correction : ps aux", cost: 30 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [{ label: "Liste tous les processus (ps aux)", pattern: "ps\\s+aux", flags: "i" }],
        }),
        explanation: `\`\`\`bash
ps aux
\`\`\`
\`ps aux\` affiche **tous** les processus (\`a\` = de tous les utilisateurs, \`x\` = même sans terminal) au **format utilisateur** (\`u\` : USER, PID, %CPU, %MEM, STAT, COMMAND). Combine avec un pipe pour filtrer : \`ps aux | grep firefox\`. Alternative temps réel : \`top\` ou \`htop\`.`,
        tags: ["processus", "ps", "observer"],
      },
      {
        id: "se-proc-kill",
        title: "Arrêt propre vs brutal",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📮 kill

Tu veux d'abord tenter un **arrêt propre** du processus **1234** (pour qu'il puisse sauvegarder avant de quitter). Quelle commande ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Le signal par défaut de kill est SIGTERM (15), l'arrêt propre. -9 est brutal.", cost: 15 },
          { text: "📖 Correction : kill 1234 (SIGTERM). Garde kill -9 en dernier recours.", cost: 40 },
        ],
        options: [
          "kill 1234  (envoie SIGTERM : demande polie d'arrêt)",
          "kill -9 1234  (SIGKILL : brutal, à réserver au dernier recours)",
          "rm 1234",
          "ps 1234",
        ],
        answer: 0,
        explanation: `\`kill 1234\` envoie **SIGTERM** (15) : le processus peut **intercepter** ce signal pour se fermer proprement (sauvegarder, libérer). C'est le bon réflexe **d'abord**. \`kill -9 1234\` (**SIGKILL**) le coupe **net**, sans lui laisser le temps de rien — à n'utiliser que s'il ne répond pas.`,
        tags: ["processus", "kill", "signaux"],
      },
      {
        id: "se-proc-bg",
        title: "Lancer en arrière-plan",
        order: 3,
        difficulty: "easy",
        type: "code",
        language: "bash",
        prompt: `## 🎚️ Arrière-plan

Tu veux lancer le script \`./sauvegarde.sh\` **en arrière-plan** pour continuer à utiliser ton terminal. Écris la commande.`,
        points: 100,
        timeLimitSec: 240,
        starter: ``,
        hints: [
          { text: "Un seul caractère à la fin de la commande.", cost: 10 },
          { text: "📖 Correction : ./sauvegarde.sh &", cost: 30 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [
            { label: "Lance le script", pattern: "\\./sauvegarde\\.sh", flags: "i" },
            { label: "En arrière-plan avec &", pattern: "&\\s*$", flags: "m" },
          ],
        }),
        explanation: `\`\`\`bash
./sauvegarde.sh &
\`\`\`
Le **\`&\`** final lance la commande en **arrière-plan** : le terminal se libère immédiatement. \`jobs\` liste les tâches, \`fg %1\` en ramène une au premier plan, \`bg %1\` relance en arrière-plan une tâche mise en pause par **Ctrl+Z**.`,
        tags: ["processus", "arriere-plan", "jobs"],
      },
      {
        id: "se-proc-etats",
        title: "L'état zombie",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧟 Zombie

Un processus **fils** s'est terminé, mais son **parent** n'a pas encore récupéré son code de retour. Dans quel état est le fils ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Terminé mais pas encore 'récolté' par le parent…", cost: 15 },
          { text: "📖 Correction : zombie — en attendant que le parent fasse wait().", cost: 40 },
        ],
        options: [
          "Zombie : terminé mais pas encore attendu (wait) par son parent",
          "Bloqué : il attend une entrée/sortie",
          "En exécution : il utilise le CPU",
          "Nouveau : il vient d'être créé",
        ],
        answer: 0,
        explanation: `Un fils **terminé** dont le parent n'a pas encore appelé **\`wait()\`** devient un **zombie** : il ne s'exécute plus, mais le système garde une entrée (son code de retour) jusqu'à ce que le parent la **récolte**. Le \`wait()\` du parent fait disparaître le zombie. Trop de zombies = un parent qui oublie de faire \`wait\`.`,
        tags: ["processus", "zombie", "etats", "wait"],
      },
      {
        id: "se-proc-fork",
        title: "fork() : qui est qui ?",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "c",
        prompt: `## 🍴 Créer un fils

Complète \`main\` : après un \`fork()\`, le **fils** affiche exactement \`Fils\` et le **parent** affiche exactement \`Parent\`. Utilise le test sur la valeur de retour de \`fork()\`.

*(On ne teste pas l'ordre ; concentre-toi sur le bon aiguillage parent/fils.)*`,
        points: 300,
        timeLimitSec: 600,
        starter: `#include <stdio.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    // à toi : si fils -> "Fils", si parent -> "Parent"

    return 0;
}
`,
        hints: [
          { text: "pid == 0 → fils ; sinon (pid > 0) → parent.", cost: 30 },
          { text: "📖 Correction :\n```\nif (pid == 0) printf(\"Fils\\n\");\nelse printf(\"Parent\\n\");\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Appelle fork()", pattern: "fork\\s*\\(\\s*\\)", flags: "i" },
            { label: "Teste le cas fils (pid == 0)", pattern: "pid\\s*==\\s*0", flags: "" },
            { label: "Le fils affiche Fils", pattern: "printf\\s*\\(\\s*\"Fils", flags: "i" },
            { label: "Le parent affiche Parent", pattern: "printf\\s*\\(\\s*\"Parent", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
pid_t pid = fork();
if (pid == 0) {
    printf("Fils\\n");     // fork a renvoyé 0 → on est le fils
} else {
    printf("Parent\\n");   // fork a renvoyé le PID du fils → on est le parent
}
\`\`\`
Après \`fork()\`, **deux** processus exécutent ce code. Ce qui les différencie : la **valeur de retour** de \`fork()\` — **0 dans le fils**, **le PID du fils dans le parent**. Sans \`wait()\`, l'ordre d'affichage n'est pas garanti.`,
        tags: ["processus", "fork", "c"],
      },
      {
        id: "se-proc-wait",
        title: "wait() pour ordonner",
        order: 6,
        difficulty: "hard",
        type: "code",
        language: "c",
        prompt: `## ⏳ Attendre le fils

On veut un affichage **déterministe** : le fils affiche \`Fils\`, PUIS le parent affiche \`Parent\` — **toujours dans cet ordre**. Le parent doit donc **attendre** la fin du fils.

Complète le programme (le fils écrit \`Fils\`, le parent fait \`wait\` puis écrit \`Parent\`).`,
        points: 350,
        timeLimitSec: 600,
        expectedOutput: "Fils\nParent",
        starter: `#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    pid_t pid = fork();
    if (pid == 0) {
        // fils
    } else {
        // parent : attendre le fils puis afficher
    }
    return 0;
}
`,
        hints: [
          { text: "Fils : printf(\"Fils\\n\"). Parent : wait(NULL); puis printf(\"Parent\\n\").", cost: 35 },
          { text: "📖 Correction :\n```\nif (pid == 0) { printf(\"Fils\\n\"); }\nelse { wait(NULL); printf(\"Parent\\n\"); }\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Le fils affiche Fils", pattern: "pid\\s*==\\s*0[\\s\\S]{0,80}printf\\s*\\(\\s*\"Fils", flags: "i" },
            { label: "Le parent attend le fils (wait)", pattern: "wait\\s*\\(", flags: "i" },
            { label: "Le parent affiche Parent après wait", pattern: "printf\\s*\\(\\s*\"Parent", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
if (pid == 0) {
    printf("Fils\\n");
} else {
    wait(NULL);            // le parent BLOQUE jusqu'à la fin du fils
    printf("Parent\\n");
}
\`\`\`
**\`wait(NULL)\`** suspend le parent jusqu'à ce que le fils se termine → l'ordre \`Fils\` puis \`Parent\` est **garanti**. En prime, \`wait\` **récolte** le fils (plus de zombie). On peut passer \`&status\` au lieu de \`NULL\` pour lire son code de retour.`,
        tags: ["processus", "wait", "c", "synchronisation"],
      },
      {
        id: "se-proc-exec",
        title: "fork + exec : lancer une commande",
        order: 7,
        difficulty: "hard",
        type: "code",
        language: "c",
        prompt: `## 🔗 Le fils devient une commande

Reproduis le principe du shell : le **fils** doit **se transformer** en la commande \`ls -l\` grâce à \`execlp\`. Complète le bloc du fils.

*(Rappel : après un \`execlp\` réussi, le code suivant ne s'exécute plus.)*`,
        points: 350,
        timeLimitSec: 600,
        starter: `#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    pid_t pid = fork();
    if (pid == 0) {
        // le fils devient "ls -l"
    } else {
        wait(NULL);
    }
    return 0;
}
`,
        hints: [
          { text: "execlp(\"ls\", \"ls\", \"-l\", NULL); — le 1er arg est le programme, puis argv[0], argv[1]…, terminé par NULL.", cost: 35 },
          { text: "📖 Correction : execlp(\"ls\", \"ls\", \"-l\", NULL);", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Le fils appelle une fonction de la famille exec", pattern: "execlp\\s*\\(|execl\\s*\\(|execvp\\s*\\(", flags: "i" },
            { label: "Il lance la commande ls", pattern: "\"ls\"", flags: "i" },
            { label: "Avec l'option -l", pattern: "\"-l\"", flags: "i" },
            { label: "Liste d'arguments terminée par NULL", pattern: "NULL\\s*\\)", flags: "" },
          ],
        }),
        explanation: `\`\`\`c
if (pid == 0) {
    execlp("ls", "ls", "-l", NULL);   // le fils DEVIENT "ls -l"
    perror("execlp");                 // atteint SEULEMENT si exec échoue
    return 1;
}
\`\`\`
\`execlp\` cherche \`ls\` dans le \`$PATH\`, puis **remplace** le programme du fils par \`ls -l\`. La liste \`("ls", "-l", NULL)\` est l'\`argv\` (terminée par **NULL**). C'est **fork + exec + wait** = le mécanisme exact d'un shell qui lance une commande.`,
        tags: ["processus", "exec", "c", "shell"],
      },
      {
        id: "se-proc-getpid",
        title: "Connaître son PID",
        order: 8,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🆔 Identité

Dans un programme C, quelle fonction renvoie le **PID du processus courant** ?`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "get + process id.", cost: 15 },
          { text: "📖 Correction : getpid() ; getppid() renvoie le PID du parent.", cost: 40 },
        ],
        options: [
          "getpid()",
          "fork()",
          "wait()",
          "exit()",
        ],
        answer: 0,
        explanation: `**\`getpid()\`** renvoie le PID du processus **courant** ; **\`getppid()\`** renvoie celui de son **parent**. \`fork()\` crée un fils, \`wait()\` attend un fils, \`exit()\` termine le processus. Ces appels sont dans \`<unistd.h>\` / \`<sys/wait.h>\`.`,
        tags: ["processus", "getpid", "c"],
      },
    ],
  },
];
