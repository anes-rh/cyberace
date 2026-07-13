import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 14 : cassage de mot de passe hors ligne (John). Lab mono-conteneur. */
export const module14PasswordCracking: CourseSeed[] = [
  {
    slug: "prat-password-cracking",
    title: "Cassage de mot de passe hors ligne",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Crack",
    domain: "Élévation de privilèges",
    theme: "grid",
    icon: "HardDrive",
    accent: "#8F6BC7",
    order: 14,
    difficulty: "hard",
    summary:
      "Quatrième voie vers root — mais différente : aucune faille de configuration active. Juste un fichier de sauvegarde oublié, lisible par tous, contenant un hash root. Le hash tient… si le mot de passe derrière est bon. Ici il est faible : John le casse hors ligne en quelques secondes.",
    objectives: [
      "Comprendre le hachage salé et ses limites face à un mot de passe faible",
      "Repérer un fichier de sauvegarde exposé contenant un hash",
      "Identifier un format de hash ($6$ = SHA-512 crypt)",
      "Casser un hash hors ligne avec John the Ripper (dictionnaire)",
      "Retenir que la robustesse du mot de passe est le vrai rempart",
    ],
    sandbox: {
      attackerImage: "cyberace/module14-password-crack:latest",
      // targetImage absent — mode mono-conteneur.
      ttlSec: 1200,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 💾 Cassage de mot de passe hors ligne — Silent Crack

Les trois précédentes élévations (SUID, cron, capacités) exploitaient une **faille de configuration active**. Celle-ci est plus subtile : **rien n'est mal configuré côté droits d'exécution**. Le maillon faible, c'est **l'humain** qui a choisi un mot de passe trop simple — et un fichier de sauvegarde oublié qui expose son hash. 🏎️

---

## 🧭 Le briefing

> Un **script de sauvegarde** a copié un extrait sensible dans **\`/var/backups/\`** avec de **mauvaises permissions**. Le mot de passe est **haché** — mais un hash n'est une protection que si le **mot de passe derrière** est difficile à deviner.

**Comment jouer :** « Démarrer le lab », shell **\`stagiaire\`**. Trouve le fichier, casse le hash, deviens root.

---

## 1. Rappel : le hachage (salé) 🔐

Un système ne stocke **jamais** les mots de passe en clair : il stocke leur **hash** — une empreinte **à sens unique** (\`hash(mdp)\` est facile ; retrouver \`mdp\` depuis le hash est censé être **infaisable**). Sous Linux, ces hashs vivent dans **\`/etc/shadow\`**.

Pour éviter que deux utilisateurs ayant le même mot de passe aient le même hash (et pour casser les **rainbow tables**), on ajoute un **sel** (*salt*) — une valeur aléatoire mélangée au mot de passe avant hachage.

\`\`\`
   $6$cybersalt$hZ8f...      ← format shadow
   │  │         └── le hash proprement dit
   │  └── le SEL (salt)
   └── l'ALGORITHME : $6$ = SHA-512 crypt
\`\`\`

> 🧭 Le hash + sel protège **tant que le mot de passe est fort**. Contre un mot de passe **faible**, le sel ne sert plus à grand-chose : il suffit d'**essayer** les mots de passe courants un par un.

---

## 2. La faille : un hash exposé + un mot de passe faible 🎯

Ici, un fichier **\`/var/backups/shadow.bak\`** (une copie oubliée) est **lisible par tous** (\`chmod 644\`) et contient la ligne shadow de **root**. Deux problèmes cumulés :
1. **Mauvaise permission** : stagiaire peut **lire** le hash root.
2. **Mot de passe faible** : le mot de passe derrière est **très commun** (présent dans les dictionnaires).

Aucun des deux n'est fatal seul ; **ensemble**, ils donnent root.

---

## 3. Casser le hash hors ligne avec John 🔨

**John the Ripper** essaie des mots de passe candidats, les **hache** avec le bon algorithme + sel, et compare au hash cible. Avec sa **wordlist** par défaut (\`/usr/share/john/password.lst\`, pleine de mots de passe courants), un mot de passe faible tombe en **secondes** :

\`\`\`bash
john /var/backups/shadow.bak        # lance le cassage (dictionnaire par defaut)
john --show /var/backups/shadow.bak # affiche le mot de passe une fois trouve
\`\`\`

- \`john <fichier>\` : lance l'attaque. John détecte le format (**\`$6$\`** → SHA-512 crypt) tout seul.
- **Patience** : sous le quota CPU du conteneur (0.3 CPU), laisse-lui le temps de **terminer** avant de faire \`--show\`.
- \`john --show <fichier>\` : affiche le(s) mot(s) de passe **déjà cassé(s)** (John les mémorise dans son « pot »).

> ⚠️ « Hors ligne » = on attaque une **copie** du hash, **sans** interroger le système : pas de limite de tentatives, pas de détection, aussi vite que le CPU le permet. C'est précisément pourquoi un hash volé + mot de passe faible = compromission.

---

## 4. La contre-mesure 🛡️

Deux leviers :
- **Un mot de passe fort** : long, aléatoire, **absent** de toute liste de mots courants → le dictionnaire **échoue** et le brute-force devient **impraticable**, **même si le hash fuit**. C'est le vrai rempart.
- **Ne pas exposer les hashs** : \`/etc/shadow\` doit rester **root-only** (\`640\`/\`600\`), et **aucune copie** (\`.bak\`) ne doit traîner en lecture publique.

> 🧠 Choisir MD5 vs SHA-512 ne change presque rien face à un **mauvais** mot de passe (les deux se cassent vite si le mot est courant). Le facteur **décisif**, c'est la **robustesse du mot de passe**.

---

## 🎯 Ta mission (résumé)

1. \`id\`, puis \`ls -la /var/backups/\` (repère le \`.bak\` lisible).
2. \`cat\` le fichier, identifie le format (\`$6$\`).
3. **\`john\`** casse le hash, \`--show\` révèle le mot de passe → \`su root\` → **flag**.

## 🧠 À retenir

- Un système stocke des **hashs** (à sens unique) + un **sel** (contre les rainbow tables), dans **\`/etc/shadow\`**. Format : **\`$6$\`** = **SHA-512 crypt** (\`$1$\`=MD5, \`$5$\`=SHA-256, \`$2y$\`=bcrypt).
- **Faille combinée** : un hash **exposé** (\`/var/backups/shadow.bak\` en \`644\`) **+** un mot de passe **faible** (dans les dictionnaires) = root.
- **Cassage hors ligne** avec **John the Ripper** : \`john <fichier>\` (dictionnaire par défaut, détecte le format seul), puis \`john --show <fichier>\`. Pas de limite de tentatives, invisible pour la cible.
- **Vrai rempart** : un **mot de passe fort** (long, aléatoire, hors dictionnaire) rend le cassage **impraticable même si le hash fuit**. Et ne **jamais** exposer \`/etc/shadow\` ni ses copies.
- Différence avec les Modules 3/5/8 : **aucune faille de config active** — juste la **faiblesse humaine** du mot de passe.`,
    badge: {
      id: "badge-prat-crack",
      name: "Casseur Patient",
      icon: "HardDrive",
      description: "A cassé hors ligne un mot de passe root trop simple.",
    },
    challenges: [
      {
        id: "prat-crack-t1",
        title: "Qui suis-je ?",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🪪 Point de départ

Démarre le lab (shell \`stagiaire\`) :

\`\`\`bash
id
\`\`\`

**Question :** quelle **commande** affiche l'UID, le GID et les groupes de l'utilisateur courant ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "id",
        caseSensitive: false,
        explanation: `**\`id\`** confirme que tu es **\`stagiaire\`** sans privilège. Cette fois, pas de SUID ni de capacité à exploiter — la piste est ailleurs, dans un fichier oublié.`,
        tags: ["crack", "enumeration", "id"],
      },
      {
        id: "prat-crack-t2",
        title: "Repérer le fichier exposé",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📂 La sauvegarde oubliée

Explore le dossier des sauvegardes :

\`\`\`bash
ls -la /var/backups/
\`\`\`

**Question :** quel **fichier de sauvegarde**, normalement réservé à root, est ici **lisible par tous** ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "/var/backups/shadow.bak",
        accept: ["shadow.bak", "/var/backups/shadow.bak"],
        caseSensitive: false,
        explanation: `**\`/var/backups/shadow.bak\`** est en \`644\` (lisible par tous) alors qu'il contient une ligne **\`/etc/shadow\`** — donc le **hash du mot de passe root**. Une copie de sauvegarde mal permissionnée : la première moitié de la faille.`,
        tags: ["crack", "backup", "permissions"],
      },
      {
        id: "prat-crack-t3",
        title: "Identifier le format de hash",
        order: 3,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔎 Quel algorithme ?

Lis le fichier :

\`\`\`bash
cat /var/backups/shadow.bak
\`\`\`

Le hash commence par **\`$6$\`**.

**Question :** quel **algorithme** cela désigne-t-il ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: ["SHA-512 crypt", "MD5 crypt", "bcrypt", "SHA-256 crypt"],
        answer: 0,
        explanation: `Le préfixe **\`$6$\`** désigne **SHA-512 crypt**. (Pour mémoire : \`$1$\` = MD5, \`$5$\` = SHA-256, \`$2y$\`/\`$2b$\` = bcrypt.) John reconnaîtra ce format tout seul et appliquera le bon algorithme pour chaque candidat.`,
        tags: ["crack", "hash", "sha512"],
      },
      {
        id: "prat-crack-t4",
        title: "Lancer le cassage",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔨 Déclencher John

Lance John the Ripper sur le fichier (il utilise sa wordlist par défaut) :

\`\`\`bash
john /var/backups/shadow.bak
\`\`\`

**Question :** quelle **commande** lance John the Ripper sur ce fichier ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [],
        answer: "john /var/backups/shadow.bak",
        accept: ["john shadow.bak", "john /var/backups/shadow.bak"],
        caseSensitive: true,
        explanation: `**\`john /var/backups/shadow.bak\`** lance le cassage : John détecte le format **\`$6$\`**, puis essaie les mots de passe de sa **wordlist** par défaut, les hache et compare. Un mot de passe **courant** tombe en secondes.`,
        tags: ["crack", "john", "wordlist"],
      },
      {
        id: "prat-crack-t5",
        title: "Récupérer le mot de passe cassé",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🔑 Le mot de passe root

Une fois John terminé, affiche le résultat :

\`\`\`bash
john --show /var/backups/shadow.bak
\`\`\`

**Question :** quel est le **mot de passe root** retrouvé ?`,
        points: 250,
        timeLimitSec: 700,
        hints: [
          { text: "Si rien ne semble s'afficher juste après avoir lancé John, patiente qu'il TERMINE (sous 0.3 CPU c'est plus lent), puis relance-le avec --show.", cost: 20 },
        ],
        answer: "letmein",
        caseSensitive: true,
        explanation: `John retrouve **\`letmein\`** — un mot de passe **archi-commun** présent dans sa wordlist par défaut, donc cassé en quelques secondes. \`john --show\` affiche les mots de passe déjà cassés (mémorisés dans son « pot »). Un bon mot de passe n'aurait **jamais** été dans cette liste.`,
        tags: ["crack", "john-show", "letmein"],
      },
      {
        id: "prat-crack-t6",
        title: "Obtenir le flag",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Devenir root (flag)

Utilise le mot de passe retrouvé pour passer root, puis lis le flag :

\`\`\`bash
su root          # tape : letmein
cat /root/flag.txt
\`\`\`

**Question :** colle le **flag** contenu dans \`/root/flag.txt\`.`,
        points: 250,
        timeLimitSec: 400,
        hints: [],
        answer: "CYBERACE{mot_de_passe_faible_casse_hors_ligne}",
        caseSensitive: true,
        explanation: `\`su root\` avec **\`letmein\`** te donne un shell root, qui lit \`/root/flag.txt\` → \`CYBERACE{mot_de_passe_faible_casse_hors_ligne}\`. Un hash exposé **plus** un mot de passe faible **plus** un cassage hors ligne : la chaîne complète.`,
        tags: ["crack", "su", "flag"],
      },
      {
        id: "prat-crack-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Rendre le cassage impossible

**Question :** qu'est-ce qui aurait rendu ce cassage **impraticable**, **même** avec le fichier exposé ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Un mot de passe long et complexe, absent de toute liste de mots courants",
          "Utiliser MD5 au lieu de SHA-512",
          "Renommer le fichier shadow.bak",
          "Chiffrer le disque dur",
        ],
        answer: 0,
        explanation: `Un **mot de passe fort** (long, aléatoire, hors dictionnaire) rend le dictionnaire **inefficace** et le brute-force **impraticable** — **même si le hash fuit**. MD5 serait pire (plus rapide à casser), renommer le fichier est de l'obscurité, et chiffrer le disque ne protège pas un fichier lisible une fois le système démarré.`,
        tags: ["crack", "mot-de-passe-fort", "contre-mesure"],
      },
      {
        id: "prat-crack-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Ce qui distingue ce module

**Question :** en quoi ce module **diffère-t-il** des trois précédentes élévations de privilèges (SUID, cron, capacités) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Aucune faille de configuration active n'était exploitée — seule la faiblesse du mot de passe choisi par l'humain était en cause",
          "Il s'agit exactement de la même technique que le Module 3",
          "Il nécessite un accès réseau, contrairement aux trois autres",
          "Il exploite une faille du noyau Linux",
        ],
        answer: 0,
        explanation: `Contrairement aux Modules 3/5/8 (un privilège **mal accordé** et directement exploitable), ici **rien n'est mal configuré côté exécution** : c'est la **faiblesse du mot de passe** (choix humain) + une copie exposée qui ouvrent la voie. Pas de réseau, pas de faille noyau — juste le maillon humain.`,
        tags: ["crack", "synthese", "mot-de-passe"],
      },
    ],
  },
];
