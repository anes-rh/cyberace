import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 55 (Défense) : démasquer un processus déguisé en thread noyau. Lab Docker réel. */
export const module55ProcessMasquerading: CourseSeed[] = [
  {
    slug: "prat-defense-process-masquerading",
    title: "Processus masquerading — le faux thread noyau",
    checkpoint: "defense",
    codename: "Silent Impostor",
    domain: "Défense — Investigation système",
    theme: "grid",
    icon: "Ghost",
    accent: "#8F6BC4",
    order: 55,
    difficulty: "hard",
    summary:
      "La liste des processus contient un nom qui ressemble à un thread noyau ([kworker/0:2]). Mais un vrai thread noyau n'est jamais adossé à un exécutable utilisateur : il n'a pas de /proc/PID/exe valide. Ce processus, lui, en a un — pointant vers /bin/sleep. Tu perces le déguisement en vérifiant l'exécutable réel derrière le nom affiché.",
    objectives: [
      "Lister les processus avec leur ligne de commande (ps aux)",
      "Repérer un nom imitant la convention des threads noyau",
      "Vérifier l'exécutable réel d'un PID via /proc/PID/exe",
      "Connaître la règle : un vrai thread noyau n'a pas de /proc/PID/exe valide",
      "Comprendre le camouflage et la détection automatisée (EDR)",
    ],
    sandbox: {
      attackerImage: "cyberace/module55-process-masquerading:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 👻 Le faux thread noyau — Silent Impostor

Un attaquant veut que son processus malveillant **passe inaperçu**. Quoi de mieux que de l'appeler comme un **thread noyau** (\`[kworker/0:2]\`), noyé parmi des dizaines de processus système ? Sauf qu'un détail le trahit. 🕵️

---

## 🧭 Le briefing

> *"La liste des processus contient un nom qui ressemble à un thread noyau. Vérifie s'il en est vraiment un."*

Terminal **en root**.

---

## 1. Lister les processus 📋

\`\`\`bash
ps aux
\`\`\`

Parmi eux, un nom **entre crochets** : \`[kworker/0:2]\`. Les vrais threads noyau s'affichent justement ainsi (\`[kworker/0:1]\`, \`[ksoftirqd/0]\`…). Camouflage parfait ? Presque.

---

## 2. La règle des threads noyau 🧠

Les vrais threads noyau **ne sont PAS** des programmes utilisateur : ils vivent dans l'espace noyau et **ne sont adossés à aucun fichier exécutable**. Conséquence : leur **\`/proc/PID/exe\`** ne pointe vers rien (lien invalide).

Un processus qui **imite** ce nommage mais possède, lui, un \`/proc/PID/exe\` **valide** pointant vers un vrai binaire → c'est un **imposteur**.

---

## 3. Vérifier l'exécutable réel 🔍

Trouve le PID du processus suspect (\`ps aux | grep kworker\`), puis :

\`\`\`bash
ls -la /proc/PID/exe        # remplace PID par le numéro réel
# ou : readlink /proc/PID/exe
\`\`\`

Ici, le lien pointe vers **\`/bin/sleep\`** : ce « \`[kworker/0:2]\` » est en réalité un simple \`sleep\` dont l'argv[0] a été **maquillé** (via \`exec -a\`). Un vrai kworker n'aurait montré aucun exécutable.

---

## 4. Camouflage & détection 🛡️

Pourquoi ce nom ? Pour **se fondre** dans la longue liste des processus système et échapper à un examen superficiel. La détection s'automatise avec un **EDR** qui compare, pour chaque processus, le nom affiché à son \`/proc/PID/exe\` réel et **signale les incohérences**.

## 🧠 À retenir

- Lister : \`ps aux\` (ou \`ps -ef\`).
- Les **threads noyau** (\`[kworker/...]\`, \`[ksoftirqd/...]\`) n'ont **pas** de \`/proc/PID/exe\` valide.
- Vérifier le binaire réel : \`ls -la /proc/PID/exe\` (ou \`readlink\`).
- Un nom « noyau » **avec** un \`/proc/PID/exe\` valide (ex. \`/bin/sleep\`) = **masquerading** (via \`exec -a\`).
- **Détection** : un EDR compare nom affiché ↔ exécutable réel et alerte sur l'écart.
- Principe (comme Modules 11 et 49) : **l'apparence légitime ne prouve rien** — vérifier plus profond.`,
    badge: {
      id: "badge-prat-masquerade",
      name: "Démasqueur",
      icon: "Ghost",
      description: "A percé le déguisement d'un processus qui se faisait passer pour un thread noyau.",
    },
    challenges: [
      {
        id: "prat-masquerade-t1",
        title: "Lister les processus",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 📋 La liste des processus

**Question :** quelle commande liste tous les processus avec leur ligne de commande complète ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "ps aux",
        accept: ["ps -ef"],
        caseSensitive: false,
        explanation: `**\`ps aux\`** (ou \`ps -ef\`) liste tous les processus avec leur commande. C'est là qu'apparaît le nom suspect \`[kworker/0:2]\`.`,
        tags: ["defense", "process", "ps"],
      },
      {
        id: "prat-masquerade-t2",
        title: "Repérer le nom suspect",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎯 L'imitation

**Question :** quel nom de processus imite la convention de nommage des threads noyau Linux ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: ["[kworker/0:2]", "ttyd", "bash", "sleep"],
        answer: 0,
        explanation: `**\`[kworker/0:2]\`** copie la convention des vrais threads noyau (nom entre crochets). \`ttyd\`, \`bash\`, \`sleep\` sont des processus utilisateur ordinaires, sans déguisement.`,
        tags: ["defense", "process", "kworker"],
      },
      {
        id: "prat-masquerade-t3",
        title: "Vérifier l'exécutable réel",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔍 Derrière le nom

**Question :** quelle commande affiche le chemin réel de l'exécutable associé à un PID donné (remplace PID par le numéro réel) ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "ls -la /proc/PID/exe",
        accept: ["readlink /proc/PID/exe"],
        caseSensitive: false,
        explanation: `**\`ls -la /proc/PID/exe\`** (ou \`readlink /proc/PID/exe\`) montre le lien symbolique vers le **vrai binaire** du processus. Pour le faux kworker, il pointe vers \`/bin/sleep\` — un vrai thread noyau n'aurait rien montré.`,
        tags: ["defense", "process", "proc-exe"],
      },
      {
        id: "prat-masquerade-t4",
        title: "La règle des vrais threads noyau",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Ce qui distingue le vrai du faux

**Question :** un authentique thread noyau possède-t-il normalement un \`/proc/PID/exe\` valide pointant vers un exécutable réel ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Non — les threads noyau ne sont pas adossés à un fichier exécutable utilisateur",
          "Oui, toujours",
          "Cela dépend de la version du noyau",
          "Seulement sur les systèmes 32 bits",
        ],
        answer: 0,
        explanation: `**Non.** Un thread noyau vit dans l'espace noyau, sans binaire utilisateur : son \`/proc/PID/exe\` est invalide/vide. Donc un « kworker » **avec** un \`/proc/PID/exe\` valide est nécessairement un imposteur.`,
        tags: ["defense", "process", "kernel-thread"],
      },
      {
        id: "prat-masquerade-t5",
        title: "Confirmer (flag)",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le rapport

\`\`\`bash
cat /root/masquerade_report.txt
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` figure dans le rapport ?`,
        points: 300,
        timeLimitSec: 500,
        hints: [],
        answer: "CYBERACE{processus_masquerade_confirme_par_proc_exe}",
        caseSensitive: true,
        explanation: `\`cat /root/masquerade_report.txt\` → **CYBERACE{processus_masquerade_confirme_par_proc_exe}**. Le flag confirme la méthode : c'est \`/proc/PID/exe\` qui a démasqué le processus déguisé.`,
        tags: ["defense", "flag", "process"],
      },
      {
        id: "prat-masquerade-t6",
        title: "Pourquoi ce camouflage",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎭 L'intérêt du déguisement

**Question :** pourquoi un attaquant choisirait-il ce type de nom pour un processus malveillant ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Pour se fondre dans la longue liste de processus système légitimes et échapper à un examen superficiel",
          "Pour accélérer l'exécution du processus",
          "C'est une obligation technique du noyau Linux",
          "Cela chiffre automatiquement le trafic du processus",
        ],
        answer: 0,
        explanation: `Un analyste qui parcourt \`ps aux\` voit des dizaines de \`[kworker/...]\` légitimes : un de plus passe inaperçu. Le camouflage vise l'**examen superficiel** — d'où l'importance de vérifier systématiquement l'exécutable réel.`,
        tags: ["defense", "process", "camouflage"],
      },
      {
        id: "prat-masquerade-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Automatiser la vérification

**Question :** quelle approche de détection automatise cette vérification ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Un outil EDR qui compare systématiquement le nom affiché de chaque processus à son /proc/PID/exe réel, et signale les incohérences",
          "Redémarrer le système chaque nuit",
          "Interdire l'usage de la commande ps",
          "Chiffrer la table des processus",
        ],
        answer: 0,
        explanation: `Un **EDR** effectue automatiquement, pour chaque processus, la comparaison nom affiché ↔ \`/proc/PID/exe\` et alerte sur toute incohérence (nom « noyau » + binaire utilisateur). C'est la version scalable de la vérification manuelle.`,
        tags: ["defense", "process", "edr"],
      },
      {
        id: "prat-masquerade-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Un principe récurrent

**Question :** quel principe, déjà vu aux Modules 11 (vhost) et 49 (certificat), se retrouve ici appliqué aux processus ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "L'apparence légitime ne garantit jamais la légitimité réelle — il faut toujours vérifier plus en profondeur",
          "Les processus système sont toujours sûrs par nature",
          "ps ment systématiquement sur tous les systèmes Linux",
          "Aucun principe commun ne relie ces modules",
        ],
        answer: 0,
        explanation: `Même leçon transversale : un nom de vhost, un CN de certificat, un nom de processus — tous peuvent être **choisis** pour paraître légitimes. La vérité est dans la vérification profonde (SAN/Issuer, \`/proc/PID/exe\`…), jamais dans l'étiquette.`,
        tags: ["defense", "process", "synthese"],
      },
    ],
  },
];
