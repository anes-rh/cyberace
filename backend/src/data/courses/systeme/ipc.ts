import type { CourseSeed } from "../../../types";

/** Système — Module 8 : communication inter-processus (tubes/pipes) — TD Master. */
export const ipc: CourseSeed[] = [
  {
    slug: "se-ipc",
    title: "Communication inter-processus (tubes)",
    checkpoint: "systeme-exploitation",
    codename: "Data Relay",
    domain: "Système — IPC",
    theme: "track",
    icon: "Route",
    accent: "#E8A87C",
    order: 8,
    difficulty: "hard",
    summary:
      "Les processus sont isolés : comment se parlent-ils ? Le tube (pipe) — un canal unidirectionnel. pipe(), les deux descripteurs, fork() pour partager le tube, write()/read()/close(). L'exercice complet parent→fils codé et testé en C.",
    objectives: [
      "Comprendre pourquoi les processus ont besoin d'IPC (mémoires isolées)",
      "Créer un tube anonyme avec pipe() et ses deux descripteurs (lecture/écriture)",
      "Partager le tube via fork() entre parent et fils",
      "Communiquer avec write() et read(), et fermer les extrémités inutiles (close())",
      "Connaître les tubes nommés (FIFO) et le pipe | du shell",
    ],
    lesson: `# 🛰️ Communication inter-processus (tubes) — Data Relay

Chaque processus a sa **propre mémoire** : le fils ne voit **pas** les variables du parent (après \`fork()\`, ce sont des **copies**). Pour échanger des données, il faut un canal fourni par le noyau : un **tube (pipe)**. 🏎️

---

## 1. Pourquoi l'IPC ? 🧱

Après \`fork()\`, parent et fils ont des **espaces mémoire séparés** : modifier une variable dans le fils **ne change rien** chez le parent. Pour coopérer, ils ont besoin d'un mécanisme d'**IPC** (*Inter-Process Communication*) : **tubes**, **files de messages**, **mémoire partagée**, **sockets**, **signaux**… Le plus simple et le plus courant : le **tube**.

---

## 2. Le tube (pipe) : un canal unidirectionnel 🚰

Un **tube** est un tampon géré par le noyau, avec **deux extrémités** :
- une extrémité d'**écriture** (on y \`write\`) ;
- une extrémité de **lecture** (on y \`read\`).

\`\`\`
   écrivain  ──write──►  [ tube (noyau) ]  ──read──►  lecteur
\`\`\`

L'appel \`pipe()\` crée le tube et remplit un tableau de **2 descripteurs de fichiers** :

\`\`\`c
int fd[2];
pipe(fd);
//  fd[0]  = extrémité de LECTURE   (read)
//  fd[1]  = extrémité d'ÉCRITURE   (write)
\`\`\`

> 🧠 Moyen mnémo : **0 = 1re lettre de « lecture »** dans l'ordre… en fait retiens : **\`fd[0]\` = read, \`fd[1]\` = write** (l'écriture « 1 » comme « one write »). C'est LA source d'erreurs.

⚠️ Un tube anonyme est **unidirectionnel** : pour un dialogue bidirectionnel, il faut **deux** tubes.

---

## 3. Partager le tube avec fork() 🍴

Seuls des processus **apparentés** peuvent partager un tube anonyme : on crée le tube **avant** \`fork()\`, et le fils **hérite** des descripteurs.

\`\`\`c
int fd[2];
pipe(fd);
pid_t pid = fork();

if (pid == 0) {
    // FILS : il va ÉCRIRE → ferme la lecture
    close(fd[0]);
    write(fd[1], "coucou", 6);
    close(fd[1]);
} else {
    // PARENT : il va LIRE → ferme l'écriture
    close(fd[1]);
    char buf[64];
    int n = read(fd[0], buf, sizeof(buf));
    write(1, buf, n);          // affiche ce qu'on a reçu (1 = stdout)
    close(fd[0]);
}
\`\`\`

> ⚠️ **Fermer les extrémités inutiles** est crucial : si le parent ne ferme pas \`fd[1]\` (l'écriture), son \`read\` ne se terminera **jamais** (il croit qu'un écrivain peut encore écrire). \`read\` renvoie **0** (fin de fichier) seulement quand **toutes** les extrémités d'écriture sont fermées.

---

## 4. write(), read(), close() 🔧

Ce sont des **appels système** bas niveau (pas \`printf\`) :

| Appel | Rôle |
|---|---|
| \`write(fd, buf, n)\` | écrit \`n\` octets de \`buf\` dans \`fd\` ; renvoie le nombre écrit |
| \`read(fd, buf, n)\` | lit **jusqu'à** \`n\` octets dans \`buf\` ; renvoie le nombre lu (**0** = fin) |
| \`close(fd)\` | ferme un descripteur |

Les descripteurs standard : **0 = stdin**, **1 = stdout**, **2 = stderr**. D'où \`write(1, buf, n)\` pour afficher.

---

## 5. Le lien avec le shell : \`|\` 🔗

Quand tu tapes \`ls | grep txt\`, le shell fait **exactement** ça : il crée un **tube**, \`fork\` deux fois, connecte la **sortie** de \`ls\` (via \`dup2\` sur \`fd[1]\`) à l'**entrée** de \`grep\` (via \`fd[0]\`). Le pipe du shell **est** un pipe système. Tu as utilisé ce mécanisme dès le module Terminal sans le savoir !

---

## 6. Tubes nommés (FIFO) 📛

Un tube anonyme n'existe qu'entre processus **apparentés**. Pour que **deux programmes indépendants** communiquent, on utilise un **tube nommé** (*FIFO*), qui a un **nom dans le système de fichiers** :

\`\`\`bash
mkfifo /tmp/moncanal        # crée un tube nommé
# terminal 1 :
echo "salut" > /tmp/moncanal
# terminal 2 :
cat /tmp/moncanal           # affiche "salut"
\`\`\`

En C : \`mkfifo("/tmp/moncanal", 0666)\`, puis \`open\`/\`read\`/\`write\` comme un fichier.

---

## 🧠 Ce qu'il faut retenir

- Après \`fork()\`, les mémoires sont **séparées** → il faut un mécanisme d'**IPC** pour échanger.
- \`pipe(fd)\` crée un tube : **\`fd[0]\` = lecture**, **\`fd[1]\` = écriture** (unidirectionnel).
- On crée le tube **avant** \`fork()\` pour que le fils **hérite** des descripteurs.
- Chaque processus **ferme l'extrémité qu'il n'utilise pas** ; \`read\` rend **0** quand toutes les écritures sont fermées.
- \`write\`/\`read\`/\`close\` sont des **appels système** ; 0=stdin, 1=stdout, 2=stderr.
- Le \`|\` du shell **est** un pipe système. Les **FIFO** (\`mkfifo\`) relient des processus **non apparentés**.

## ⚠️ Erreurs fréquentes des débutants

**1. Inverser fd[0] et fd[1].** \`fd[0]\` = **lecture**, \`fd[1]\` = **écriture**. L'inverse casse tout.

**2. Ne pas fermer les extrémités inutiles.** Si l'extrémité d'écriture reste ouverte quelque part, le \`read\` **bloque indéfiniment** (jamais de fin de fichier).

**3. Créer le tube APRÈS fork().** Alors parent et fils ont des tubes **différents** → aucune communication. Le \`pipe()\` doit précéder \`fork()\`.

**4. Attendre un dialogue bidirectionnel avec un seul tube.** Un tube est **unidirectionnel** : deux sens = **deux** tubes.

**5. Confondre write/read et printf/scanf.** \`printf\` écrit sur stdout via la libc ; pour un tube, on utilise les **appels système** \`write\`/\`read\` sur les descripteurs.`,
    badge: {
      id: "badge-data-relay",
      name: "Data Relay",
      icon: "Route",
      description: "Fait communiquer des processus par tubes : pipe(), fork(), write/read/close, FIFO.",
    },
    challenges: [
      {
        id: "se-ipc-why",
        title: "Pourquoi un tube ?",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧱 Mémoires séparées

Après \`fork()\`, le fils modifie une variable globale. Le parent voit-il le changement ? Et pourquoi a-t-on besoin d'un tube ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "fork() COPIE la mémoire : parent et fils ont chacun la leur.", cost: 20 },
          { text: "📖 Correction : non, mémoires séparées → il faut un canal d'IPC (tube).", cost: 50 },
        ],
        options: [
          "Non : après fork() les mémoires sont séparées ; il faut un canal d'IPC (tube) pour échanger",
          "Oui : parent et fils partagent toute leur mémoire",
          "Oui, mais seulement les variables locales",
          "Non, et aucune communication n'est jamais possible",
        ],
        answer: 0,
        explanation: `\`fork()\` crée une **copie** de la mémoire : le fils a **sa propre** version des variables. Modifier une globale dans le fils **ne change rien** chez le parent. Pour coopérer, il faut un mécanisme d'**IPC** fourni par le noyau — le plus simple étant le **tube (pipe)**.`,
        tags: ["ipc", "fork", "memoire"],
      },
      {
        id: "se-ipc-fd",
        title: "Les deux descripteurs",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚰 pipe(fd)

Après \`int fd[2]; pipe(fd);\`, à quoi servent \`fd[0]\` et \`fd[1]\` ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "fd[0] = lecture, fd[1] = écriture.", cost: 20 },
          { text: "📖 Correction : fd[0] = read (lecture), fd[1] = write (écriture).", cost: 50 },
        ],
        options: [
          "fd[0] = extrémité de lecture (read) ; fd[1] = extrémité d'écriture (write)",
          "fd[0] = écriture ; fd[1] = lecture",
          "fd[0] et fd[1] sont deux tubes différents",
          "fd[0] = stdin ; fd[1] = stdout du terminal",
        ],
        answer: 0,
        explanation: `\`pipe(fd)\` remplit deux descripteurs : **\`fd[0]\` = lecture** (on y \`read\`), **\`fd[1]\` = écriture** (on y \`write\`). C'est une source d'erreurs fréquente — retiens : **0 pour lire, 1 pour écrire**. Le tube est **unidirectionnel**.`,
        tags: ["ipc", "pipe", "descripteurs"],
      },
      {
        id: "se-ipc-create",
        title: "Créer le tube",
        order: 3,
        difficulty: "easy",
        type: "code",
        language: "c",
        prompt: `## 🔧 pipe()

Déclare un tableau de **2 descripteurs** nommé \`fd\` puis **crée le tube** avec l'appel système adéquat.`,
        points: 150,
        timeLimitSec: 300,
        starter: `#include <unistd.h>

int main(void) {
    // déclare fd[2] et crée le tube
    return 0;
}
`,
        hints: [
          { text: "int fd[2]; pipe(fd);", cost: 15 },
          { text: "📖 Correction :\n```\nint fd[2];\npipe(fd);\n```", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Déclare un tableau de 2 descripteurs", pattern: "int\\s+fd\\s*\\[\\s*2\\s*\\]", flags: "" },
            { label: "Crée le tube avec pipe(fd)", pattern: "pipe\\s*\\(\\s*fd\\s*\\)", flags: "" },
          ],
        }),
        explanation: `\`\`\`c
int fd[2];
pipe(fd);        // crée le tube : fd[0] lecture, fd[1] écriture
\`\`\`
\`pipe()\` retourne 0 en cas de succès (−1 sinon). À faire **avant** \`fork()\` pour que le fils hérite des descripteurs. Toujours **vérifier** la valeur de retour dans du vrai code : \`if (pipe(fd) == -1) { perror("pipe"); }\`.`,
        tags: ["ipc", "pipe", "c"],
      },
      {
        id: "se-ipc-write",
        title: "Le fils écrit dans le tube",
        order: 4,
        difficulty: "hard",
        type: "code",
        language: "c",
        prompt: `## ✍️ Écrire côté fils

Le tube \`fd\` existe et \`fork()\` a été fait. Complète le bloc du **fils** : il n'utilise que l'**écriture**, donc il **ferme la lecture** (\`fd[0]\`), **écrit** la chaîne \`"ping"\` (4 octets) dans le tube, puis **ferme l'écriture** (\`fd[1]\`).`,
        points: 300,
        timeLimitSec: 600,
        starter: `// dans le FILS (pid == 0) :

`,
        hints: [
          { text: "close(fd[0]); write(fd[1], \"ping\", 4); close(fd[1]);", cost: 30 },
          { text: "📖 Correction :\n```\nclose(fd[0]);\nwrite(fd[1], \"ping\", 4);\nclose(fd[1]);\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Ferme l'extrémité de lecture (fd[0])", pattern: "close\\s*\\(\\s*fd\\s*\\[\\s*0\\s*\\]\\s*\\)", flags: "" },
            { label: "Écrit dans l'extrémité d'écriture (fd[1])", pattern: "write\\s*\\(\\s*fd\\s*\\[\\s*1\\s*\\]", flags: "" },
            { label: "Envoie la chaîne ping", pattern: "\"ping\"", flags: "i" },
            { label: "Ferme l'écriture après (fd[1])", pattern: "close\\s*\\(\\s*fd\\s*\\[\\s*1\\s*\\]\\s*\\)", flags: "" },
          ],
        }),
        explanation: `\`\`\`c
close(fd[0]);              // le fils ne LIT pas → ferme la lecture
write(fd[1], "ping", 4);  // écrit 4 octets dans le tube
close(fd[1]);             // fini d'écrire → ferme l'écriture
\`\`\`
Fermer \`fd[0]\` (qu'on n'utilise pas) est une **bonne hygiène** ; fermer \`fd[1]\` **à la fin** est **essentiel** : c'est ce qui permettra au \`read\` du parent de recevoir la **fin de fichier** (retour 0).`,
        tags: ["ipc", "write", "close", "c"],
      },
      {
        id: "se-ipc-read",
        title: "Le parent lit le tube",
        order: 5,
        difficulty: "hard",
        type: "code",
        language: "c",
        prompt: `## 👂 Lire côté parent

Complète le bloc du **parent** : il n'utilise que la **lecture**, donc il **ferme l'écriture** (\`fd[1]\`), **lit** jusqu'à 64 octets dans un buffer \`buf\`, puis **affiche** ce qu'il a reçu sur la sortie standard avec \`write(1, …)\`. \`char buf[64];\` est déjà déclaré.`,
        points: 350,
        timeLimitSec: 600,
        starter: `// dans le PARENT (pid > 0) :
char buf[64];
`,
        hints: [
          { text: "close(fd[1]); int n = read(fd[0], buf, 64); write(1, buf, n);", cost: 35 },
          { text: "📖 Correction :\n```\nclose(fd[1]);\nint n = read(fd[0], buf, 64);\nwrite(1, buf, n);\nclose(fd[0]);\n```", cost: 80 },
        ],
        answer: JSON.stringify({
          minRatio: 0.7,
          keypoints: [
            { label: "Ferme l'écriture (fd[1])", pattern: "close\\s*\\(\\s*fd\\s*\\[\\s*1\\s*\\]\\s*\\)", flags: "" },
            { label: "Lit depuis fd[0] dans buf", pattern: "read\\s*\\(\\s*fd\\s*\\[\\s*0\\s*\\]\\s*,\\s*buf", flags: "" },
            { label: "Affiche le résultat sur stdout (write 1)", pattern: "write\\s*\\(\\s*1\\s*,\\s*buf", flags: "" },
          ],
        }),
        explanation: `\`\`\`c
close(fd[1]);                    // le parent n'ÉCRIT pas → ferme l'écriture
int n = read(fd[0], buf, 64);    // lit ce que le fils a envoyé
write(1, buf, n);                // affiche sur stdout (fd 1) les n octets lus
close(fd[0]);
\`\`\`
Le parent **doit** fermer \`fd[1]\` : sinon le tube « pense » qu'un écrivain existe encore et \`read\` **bloquerait** au lieu de recevoir la fin. \`read\` renvoie le **nombre d'octets lus** (0 = fin). On affiche exactement \`n\` octets. Parent + fils = un **relais de données** fonctionnel.`,
        tags: ["ipc", "read", "close", "c"],
      },
      {
        id: "se-ipc-close",
        title: "Le read qui ne finit jamais",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⛔ Blocage

Un parent lit un tube, mais son \`read()\` **ne se termine jamais** (il reste bloqué) alors que le fils a fini d'écrire. Cause la plus probable ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "read rend 0 (fin) seulement quand TOUTES les extrémités d'écriture sont fermées.", cost: 20 },
          { text: "📖 Correction : le parent (ou le fils) n'a pas fermé son extrémité d'écriture fd[1].", cost: 50 },
        ],
        options: [
          "Une extrémité d'écriture (fd[1]) est restée ouverte : read ne reçoit jamais la fin de fichier",
          "Le tube est trop petit",
          "Il faut recompiler le noyau",
          "read() ne fonctionne pas sur les tubes",
        ],
        answer: 0,
        explanation: `\`read\` sur un tube renvoie **0** (fin de fichier) **uniquement** quand **toutes** les extrémités d'**écriture** sont fermées. Si le parent oublie de fermer **son** \`fd[1]\` (hérité du fork), le noyau croit qu'un écrivain peut encore écrire → \`read\` **bloque** pour toujours. **Fermer les extrémités inutiles** est donc obligatoire, pas optionnel.`,
        tags: ["ipc", "close", "blocage", "read"],
      },
      {
        id: "se-ipc-fifo",
        title: "Tube nommé (FIFO)",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📛 Processus non apparentés

Deux programmes **lancés séparément** (pas de lien parent/fils) veulent communiquer par tube. Que faut-il utiliser ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un tube anonyme ne marche qu'entre processus apparentés. Il en existe une version avec un NOM.", cost: 20 },
          { text: "📖 Correction : un tube nommé (FIFO), créé par mkfifo, visible dans le système de fichiers.", cost: 50 },
        ],
        options: [
          "Un tube nommé (FIFO), créé par mkfifo — il a un nom dans le système de fichiers",
          "Un tube anonyme classique (pipe)",
          "Impossible : deux programmes séparés ne peuvent jamais communiquer",
          "Il faut qu'ils partagent la même variable globale",
        ],
        answer: 0,
        explanation: `Un **tube anonyme** (\`pipe\`) ne relie que des processus **apparentés** (hérité via \`fork\`). Pour des programmes **indépendants**, on crée un **tube nommé (FIFO)** avec \`mkfifo /tmp/canal\` : il a un **nom** dans l'arborescence, et chacun l'ouvre comme un fichier (\`open\`/\`read\`/\`write\`). Exemple shell : \`echo hi > /tmp/canal\` d'un côté, \`cat /tmp/canal\` de l'autre.`,
        tags: ["ipc", "fifo", "mkfifo"],
      },
    ],
  },
];
