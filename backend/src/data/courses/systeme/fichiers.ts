import type { CourseSeed } from "../../../types";

/** Système — Module 10 : systèmes de fichiers Linux (FHS, montage, inodes). */
export const fichiers: CourseSeed[] = [
  {
    slug: "se-fichiers",
    title: "Systèmes de fichiers Linux",
    checkpoint: "systeme-exploitation",
    codename: "Root Tree",
    domain: "Système — Stockage",
    theme: "track",
    icon: "FolderTree",
    accent: "#E8A87C",
    order: 10,
    difficulty: "medium",
    summary:
      "Sous Linux, tout est fichier et tout part d'une seule racine /. Arborescence standard (FHS), montage de disques, types de systèmes de fichiers (ext4…), inodes et liens (dur vs symbolique). Le grand final, pratiqué au terminal.",
    objectives: [
      "Lire l'arborescence standard (FHS) : /, /home, /etc, /bin, /var, /tmp, /dev, /proc",
      "Comprendre le montage (mount) : un disque = un point de montage dans /",
      "Connaître les types de systèmes de fichiers (ext4, xfs, btrfs, vfat/NTFS)",
      "Comprendre l'inode et distinguer lien dur (hard) et lien symbolique (soft)",
      "Observer l'espace disque (df, du) au terminal",
    ],
    lesson: `# 🌳 Systèmes de fichiers Linux — Root Tree

Sous Windows, il y a \`C:\`, \`D:\`… Sous Linux, **une seule racine** : \`/\`. Tout — disques, clés USB, périphériques, même des infos du noyau — apparaît quelque part sous cet **unique arbre**. C'est déroutant au début, puissant ensuite. 🏎️

---

## 1. « Tout est fichier » 📂

Philosophie Unix : **presque tout** se manipule comme un fichier — un vrai document, mais aussi un **disque** (\`/dev/sda\`), un **terminal** (\`/dev/tty\`), voire des **infos noyau** (\`/proc\`). Même interface (\`open\`/\`read\`/\`write\`) pour tout → simplicité et uniformité.

---

## 2. L'arborescence standard (FHS) 🗺️

Le **FHS** (*Filesystem Hierarchy Standard*) fixe le rôle des grands dossiers sous \`/\` :

\`\`\`
 /            racine : tout part d'ici
 ├── bin      commandes de base (ls, cp, bash…)
 ├── etc      FICHIERS DE CONFIGURATION du système (texte)
 ├── home     dossiers personnels des utilisateurs (/home/etudiant)
 ├── root     dossier personnel de l'administrateur (root)
 ├── var      données VARIABLES : logs (/var/log), files d'attente…
 ├── tmp      fichiers TEMPORAIRES (effacés au redémarrage)
 ├── usr      programmes et bibliothèques installés (/usr/bin, /usr/lib)
 ├── dev      PÉRIPHÉRIQUES (/dev/sda = disque, /dev/null…)
 ├── proc     pseudo-FS : infos sur le noyau et les processus (virtuel)
 ├── mnt/media points de montage (clés USB, disques externes)
 └── boot     noyau et fichiers de démarrage
\`\`\`

Repères utiles :
- **Config** → \`/etc\` (ex. \`/etc/passwd\`, \`/etc/hosts\`).
- **Logs** → \`/var/log\` (ex. \`/var/log/syslog\`).
- **Tes fichiers** → \`/home/ton_nom\` (raccourci \`~\`).
- **Périphériques** → \`/dev\`.

---

## 3. Le montage (mount) 🔌

Un **système de fichiers** (sur un disque, une partition, une clé USB) doit être **monté** : on l'**attache** à un **point de montage** (un dossier vide) dans l'arbre unique.

\`\`\`
   /              (disque principal)
   └── media/usb  ← point de montage d'une clé USB
                    après: mount /dev/sdb1 /media/usb
\`\`\`

\`\`\`bash
mount /dev/sdb1 /media/usb   # attache la partition sdb1 au dossier /media/usb
umount /media/usb            # la détache (avant de retirer la clé !)
lsblk                        # liste les disques/partitions et leurs montages
df -h                        # espace utilisé/libre par système de fichiers monté
\`\`\`

> 🧠 Différence clé avec Windows : pas de lettres de lecteur. Un nouveau disque **apparaît quelque part dans \`/\`** (ex. \`/media/usb\`), pas dans un \`E:\` séparé.

---

## 4. Types de systèmes de fichiers 🧱

Le **type** décide comment les données/métadonnées sont organisées :

| Type | Usage typique |
|---|---|
| **ext4** | le standard Linux (journalisé, robuste) |
| **xfs** | gros volumes, serveurs |
| **btrfs** | fonctionnalités avancées (snapshots) |
| **vfat / exFAT** | clés USB, compatibilité Windows/Mac |
| **NTFS** | disques Windows |
| **tmpfs** | en RAM (ex. \`/tmp\` parfois) |

La **journalisation** (ext4, xfs) note les opérations avant de les faire → en cas de coupure, le système de fichiers reste **cohérent**.

---

## 5. L'inode : la fiche d'identité d'un fichier 🪪

Un fichier n'est **pas** son nom ! Ses **métadonnées** vivent dans un **inode** (un numéro unique) : taille, propriétaire, permissions, dates, et **pointeurs vers les blocs de données**. Le **nom** n'est qu'une **entrée dans un dossier** qui pointe vers un inode.

\`\`\`
   dossier            inode 1234              blocs de données
   "rapport.txt" ───► [taille, droits, ───►   [ contenu réel ]
                        proprio, blocs]
\`\`\`

\`\`\`bash
ls -i fichier      # affiche le numéro d'inode
df -i              # inodes utilisés/libres (on peut manquer d'inodes !)
\`\`\`

---

## 6. Liens : dur vs symbolique 🔗

- **Lien dur** (*hard link*) : un **deuxième nom** pointant vers le **même inode**. Les deux noms sont **équivalents** ; le fichier existe tant qu'il reste **au moins un** lien. Ne traverse pas les systèmes de fichiers, ni les dossiers.
\`\`\`bash
ln original.txt copie_dure.txt      # même inode que original.txt
\`\`\`
- **Lien symbolique** (*soft link*, raccourci) : un petit fichier qui **contient un chemin** vers un autre. Si la cible est supprimée, le lien devient **cassé** (*dangling*). Peut pointer partout (autre FS, dossier).
\`\`\`bash
ln -s /chemin/vers/cible raccourci  # -s = symbolique
\`\`\`

\`\`\`
 Lien DUR :        nom_A ─┐
                          ├─► inode 42 ─► données   (deux noms, un inode)
                   nom_B ─┘
 Lien SYMBOLIQUE : raccourci ─► "chemin/vers/cible" ─► (résolu à l'usage)
\`\`\`

> 🧠 Supprime la cible d'un **lien dur** : les données **survivent** via l'autre nom. Supprime la cible d'un **lien symbolique** : le raccourci **pointe dans le vide**.

---

## 🧠 Ce qu'il faut retenir

- Sous Linux, **une seule racine \`/\`** ; **tout est fichier** (documents, périphériques \`/dev\`, infos noyau \`/proc\`).
- **FHS** : \`/etc\` (config), \`/var/log\` (logs), \`/home\` (utilisateurs), \`/bin\`-\`/usr\` (programmes), \`/dev\` (périphériques), \`/tmp\` (temporaire).
- **Montage** : un disque/partition s'attache à un **point de montage** dans \`/\` (\`mount\`/\`umount\`, \`lsblk\`, \`df -h\`).
- Types : **ext4** (standard Linux, journalisé), xfs, btrfs, vfat/NTFS (compat).
- **Inode** = métadonnées + pointeurs vers les blocs ; le **nom** est juste une entrée de dossier vers un inode.
- **Lien dur** = 2e nom du **même inode** (survit à la suppression de l'autre nom) ; **lien symbolique** = raccourci contenant un **chemin** (cassé si la cible disparaît).

## ⚠️ Erreurs fréquentes des débutants

**1. Chercher un \`C:\` / \`D:\`.** Sous Linux il n'y a **pas** de lettres de lecteur : tout est sous \`/\`, les disques sont **montés** dans des dossiers.

**2. Retirer une clé sans \`umount\`.** Détache-la **d'abord** (\`umount\`) pour éviter de corrompre les données non écrites.

**3. Confondre nom et fichier.** Le fichier « est » son **inode** ; le nom n'est qu'un pointeur. D'où les liens durs (plusieurs noms, un inode).

**4. Confondre lien dur et symbolique.** Dur = même inode (robuste, même FS) ; symbolique = chemin texte (souple, peut casser).

**5. Modifier \`/etc\` sans sudo ni sauvegarde.** Les fichiers de config système appartiennent à root ; une erreur peut empêcher le démarrage. Sauvegarde avant d'éditer.`,
    badge: {
      id: "badge-root-tree",
      name: "Root Tree",
      icon: "FolderTree",
      description: "Lit l'arborescence FHS, monte des disques, comprend inodes et liens durs/symboliques.",
    },
    challenges: [
      {
        id: "se-fs-etc",
        title: "Où sont les configs ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🗺️ FHS

Dans quel répertoire standard trouve-t-on les **fichiers de configuration** du système (ex. \`passwd\`, \`hosts\`) ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "3 lettres, contient la config système en texte.", cost: 10 },
          { text: "📖 Correction : /etc.", cost: 30 },
        ],
        options: ["/etc", "/var", "/dev", "/bin"],
        answer: 0,
        explanation: `**\`/etc\`** contient les **fichiers de configuration** du système (texte) : \`/etc/passwd\` (comptes), \`/etc/hosts\`, \`/etc/fstab\`… Rappels : \`/var/log\` = journaux, \`/dev\` = périphériques, \`/bin\`-\`/usr/bin\` = programmes, \`/home\` = utilisateurs.`,
        tags: ["fichiers", "fhs", "etc"],
      },
      {
        id: "se-fs-logs",
        title: "Où sont les journaux ?",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 📜 Logs

Tu débogues un service. Dans quel dossier chercher les **journaux (logs)** du système ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Données variables du système → /var, sous-dossier log.", cost: 10 },
          { text: "📖 Correction : /var/log.", cost: 30 },
        ],
        options: ["/var/log", "/etc/log", "/home/log", "/dev/log"],
        answer: 0,
        explanation: `Les journaux vivent dans **\`/var/log\`** (ex. \`/var/log/syslog\`, \`/var/log/auth.log\`). \`/var\` contient les **données variables** du système (logs, files d'attente, caches). Réflexe débogage : \`tail -f /var/log/syslog\` pour suivre les messages en direct.`,
        tags: ["fichiers", "fhs", "var", "logs"],
      },
      {
        id: "se-fs-racine",
        title: "Une seule racine",
        order: 3,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🌳 Pas de C: sous Linux

Tu branches une clé USB sous Linux. Comment y accèdes-tu ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Pas de lettre de lecteur : la clé est MONTÉE dans un dossier de l'arbre /.", cost: 15 },
          { text: "📖 Correction : elle est montée à un point de montage, ex. /media/usb (dans l'arbre unique /).", cost: 40 },
        ],
        options: [
          "Elle est montée à un point de montage dans l'arbre unique, ex. /media/usb",
          "Elle apparaît comme un lecteur E:",
          "Elle n'est pas accessible sous Linux",
          "Elle remplace la racine /",
        ],
        answer: 0,
        explanation: `Linux n'a **pas** de lettres de lecteur. Un périphérique de stockage est **monté** : on l'attache à un **point de montage** (un dossier) dans l'**arbre unique** \`/\`, typiquement \`/media/usb\` ou \`/mnt\`. Ubuntu monte souvent les clés automatiquement. Manuel : \`mount /dev/sdb1 /media/usb\`.`,
        tags: ["fichiers", "montage", "racine"],
      },
      {
        id: "se-fs-df",
        title: "Voir l'espace disque",
        order: 4,
        difficulty: "easy",
        type: "code",
        language: "bash",
        prompt: `## 💽 df

Écris la commande qui affiche l'**espace disque** utilisé et libre de chaque système de fichiers monté, dans un **format lisible** (Ko/Mo/Go).`,
        points: 150,
        timeLimitSec: 300,
        starter: ``,
        hints: [
          { text: "df avec l'option 'human-readable'.", cost: 15 },
          { text: "📖 Correction : df -h", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [
            { label: "Utilise df", pattern: "\\bdf\\b", flags: "i" },
            { label: "Format lisible (-h)", pattern: "-h", flags: "" },
          ],
        }),
        explanation: `\`\`\`bash
df -h
\`\`\`
**\`df\`** (*disk free*) montre, pour chaque système de fichiers **monté**, la taille, l'utilisé, le libre et le point de montage. **\`-h\`** (*human-readable*) affiche en Ko/Mo/Go au lieu de blocs. Cousin utile : **\`du -h\`** mesure la taille d'un **dossier** précis, \`du -sh dossier\` pour un total.`,
        tags: ["fichiers", "df", "disque"],
      },
      {
        id: "se-fs-inode",
        title: "Le nom n'est pas le fichier",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🪪 Inode

Que stocke un **inode** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Les MÉTADONNÉES + les pointeurs vers les blocs. Mais PAS le nom.", cost: 20 },
          { text: "📖 Correction : taille, droits, propriétaire, dates, pointeurs vers les blocs — pas le nom.", cost: 50 },
        ],
        options: [
          "Les métadonnées (taille, droits, propriétaire, dates) et les pointeurs vers les blocs de données — mais pas le nom",
          "Uniquement le nom du fichier",
          "Le contenu complet du fichier, en double",
          "La liste de tous les utilisateurs du système",
        ],
        answer: 0,
        explanation: `L'**inode** contient les **métadonnées** d'un fichier (taille, permissions, propriétaire, dates) et les **pointeurs vers ses blocs de données** — mais **pas le nom**. Le **nom** est une simple **entrée dans un dossier** qui pointe vers un numéro d'inode. C'est pour ça qu'un même inode peut avoir **plusieurs noms** (liens durs). \`ls -i\` montre le numéro d'inode.`,
        tags: ["fichiers", "inode", "metadonnees"],
      },
      {
        id: "se-fs-symlink",
        title: "Créer un lien symbolique",
        order: 6,
        difficulty: "medium",
        type: "code",
        language: "bash",
        prompt: `## 🔗 ln -s

Crée un **lien symbolique** nommé \`raccourci\` qui pointe vers le fichier \`/home/etudiant/rapport.txt\`.`,
        points: 200,
        timeLimitSec: 360,
        starter: ``,
        hints: [
          { text: "ln -s <cible> <nom_du_lien>. L'option -s = symbolique.", cost: 20 },
          { text: "📖 Correction : ln -s /home/etudiant/rapport.txt raccourci", cost: 50 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Utilise ln en mode symbolique (-s)", pattern: "ln\\s+-s", flags: "i" },
            { label: "Vise la bonne cible", pattern: "/home/etudiant/rapport\\.txt", flags: "i" },
            { label: "Nomme le lien raccourci", pattern: "raccourci", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
ln -s /home/etudiant/rapport.txt raccourci
\`\`\`
**\`ln -s cible lien\`** crée un **lien symbolique** : \`raccourci\` est un petit fichier qui **contient le chemin** vers la cible. Il peut pointer vers n'importe où (autre disque, dossier). ⚠️ Si \`rapport.txt\` est supprimé, \`raccourci\` devient **cassé** (pointe dans le vide). Sans \`-s\`, on ferait un **lien dur** (même inode, robuste mais limité au même système de fichiers).`,
        tags: ["fichiers", "lien-symbolique", "ln"],
      },
      {
        id: "se-fs-hardvssoft",
        title: "Dur vs symbolique",
        order: 7,
        difficulty: "hard",
        type: "mcq",
        prompt: `## ⚖️ Le bon lien

Tu crées un **lien dur** \`B\` vers le fichier \`A\`, puis tu **supprimes** \`A\`. Que devient le contenu ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Un lien dur = 2e nom du même inode. Le fichier vit tant qu'il reste ≥ 1 lien.", cost: 25 },
          { text: "📖 Correction : le contenu SURVIT via B (même inode). Un lien symbolique, lui, serait cassé.", cost: 60 },
        ],
        options: [
          "Le contenu survit : B pointe le même inode ; le fichier existe tant qu'il reste au moins un lien",
          "Le contenu est perdu : B pointe dans le vide",
          "B est automatiquement supprimé avec A",
          "Le système refuse de supprimer A",
        ],
        answer: 0,
        explanation: `Un **lien dur** \`B\` partage le **même inode** que \`A\` : ce sont deux **noms équivalents**. Le fichier (l'inode + ses données) n'est réellement effacé que lorsqu'il ne reste **plus aucun** lien. Donc supprimer \`A\` **ne détruit rien** : \`B\` donne toujours accès au contenu. À l'inverse, si \`B\` avait été un **lien symbolique**, supprimer \`A\` l'aurait rendu **cassé** (il ne contient qu'un chemin).`,
        tags: ["fichiers", "lien-dur", "lien-symbolique", "inode"],
      },
      {
        id: "se-fs-ext4",
        title: "Le système de fichiers par défaut",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧱 Quel type ?

Quel est le **système de fichiers par défaut** de la plupart des distributions Linux (dont Ubuntu), journalisé et robuste ?`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "La 4e génération de l'historique 'extended filesystem'.", cost: 15 },
          { text: "📖 Correction : ext4.", cost: 40 },
        ],
        options: ["ext4", "NTFS", "vfat", "exFAT"],
        answer: 0,
        explanation: `**ext4** (*fourth extended filesystem*) est le système de fichiers **par défaut** de la plupart des distributions Linux : **journalisé** (cohérent après une coupure), robuste, performant. **NTFS** est celui de Windows, **vfat/exFAT** servent surtout aux clés USB pour la **compatibilité** multi-OS. Sur serveurs, on croise aussi **xfs** et **btrfs**.`,
        tags: ["fichiers", "ext4", "types"],
      },
    ],
  },
];
