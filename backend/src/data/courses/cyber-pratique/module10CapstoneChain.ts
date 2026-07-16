import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 10 : capstone, chaîne d'attaque complète. Lab Docker réel. */
export const module10CapstoneChain: CourseSeed[] = [
  {
    slug: "prat-capstone-chaine-recon",
    title: "Capstone : chaîne d'attaque complète",
    checkpoint: "prat-recon-reseau",
    codename: "Silent Chain",
    domain: "Synthèse pratique",
    theme: "grid",
    icon: "Trophy",
    accent: "#4FA65E",
    // Placé après ses pairs (max order 25 du groupe) pour rester le dernier
    // module affiché du mini-checkpoint « Reconnaissance réseau » — c'est un
    // capstone de fin de groupe. `order` ne sert qu'au tri intra-checkpoint.
    order: 26,
    difficulty: "hard",
    summary:
      "Dernier lab du parcours pratique : un capstone qui n'introduit rien de neuf, mais te demande d'enchaîner seul les réflexes acquis. Scan, énumération FTP anonyme, lecture attentive d'un indice, et exploitation d'identifiants par défaut jamais changés — du premier scan jusqu'au flag final.",
    objectives: [
      "Mener une reconnaissance sans qu'on te dise par où commencer",
      "Énumérer un service FTP anonyme et lire l'indice qu'il contient",
      "Repérer une ressource web protégée (401) et l'authentification requise",
      "Exploiter des identifiants par défaut pour accéder à la ressource",
      "Reconstituer la chaîne d'attaque et nommer les contre-mesures",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module10-capstone:latest",
      ttlSec: 1200,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🏆 Capstone : chaîne d'attaque complète — Silent Chain

Bienvenue au **dernier exercice** de ton parcours pratique. Ici, **rien de nouveau** techniquement : ce capstone te demande d'**enchaîner seul**, sans qu'on te tienne la main, des réflexes que tu as déjà acquis. Une vraie attaque, c'est rarement une seule faille — c'est une **chaîne**. 🏎️

---

## 🧭 Le briefing

> Dernier exercice de ce parcours pratique : **personne ne te dira par où commencer**. Utilise ce que tu as appris. Une ressource est protégée quelque part sur ce serveur — à toi de trouver le chemin **complet** qui y mène, du premier scan jusqu'au flag.

**Comment jouer :** « Démarrer le lab », terminal (attaquant). La cible \`target\` t'attend. **Aucune consigne pas-à-pas imposée** — mais les tâches te guident si tu bloques.

---

## 1. Le principe d'une chaîne d'attaque ⛓️

Un attaquant réel **enchaîne** des faiblesses modestes, chacune ouvrant la suivante :
1. **Reconnaissance** : quels services tournent ? (Module 1)
2. **Énumération** : que révèle chaque service ? Une fuite d'info ? (Module 1)
3. **Exploitation** : la fuite mène à un accès (ici, des identifiants).
4. **Objectif** : la ressource protégée tombe.

Aucune de ces étapes n'est spectaculaire seule. **Ensemble**, elles donnent un accès complet. C'est tout l'enjeu de la **défense en profondeur** : il aurait suffi de **casser un seul maillon** pour tout arrêter.

---

## 2. Étape 1 — Scanner (Module 1) 🔭

\`\`\`bash
nmap target
\`\`\`

Le scan par défaut révèle les **ports ouverts**. Ici, **deux** services t'attendent : un **FTP** (port 21) et un **serveur web** (port 8080). Deux portes à explorer.

---

## 3. Étape 2 — Énumérer le FTP anonyme (Module 1) 🎣

Comme au Module 1, le FTP accepte l'accès **anonyme**. Récupère ce qu'il contient :

\`\`\`bash
curl ftp://target/notes.txt
\`\`\`

Une **note interne** y traîne. Lis-la **attentivement** : elle mentionne un **panneau d'administration** à un certain chemin, et — négligence classique — les **identifiants par défaut jamais changés**. C'est la fuite d'information qui va tout débloquer.

---

## 4. Étape 3 — La ressource protégée 🔒

Va voir le chemin indiqué par la note :

\`\`\`bash
curl -i http://target:8080/admin-portal/
\`\`\`

Le \`-i\` affiche les **en-têtes HTTP**. Tu obtiens un **\`401 Unauthorized\`** : la ressource existe mais exige une **authentification** (HTTP Basic Auth). Sans identifiants, porte close.

> 🧭 Un **401** confirme qu'il y a **quelque chose à protéger** ici — et la note FTP t'a justement donné de quoi t'authentifier.

---

## 5. Étape 4 — Exploiter les identifiants par défaut 🔓

La note révélait un couple **identifiant/mot de passe** par défaut (jamais changé — une des fautes les plus répandues). Fournis-le à \`curl\` avec **\`-u\`** :

\`\`\`bash
curl -u admin:admin2024 http://target:8080/admin-portal/
#        └── -u utilisateur:motdepasse : authentification HTTP Basic
\`\`\`

Cette fois, le serveur répond **\`200 OK\`** et sert le contenu du panneau — **le flag**. La chaîne est bouclée : **scan → FTP anonyme → indice → identifiants faibles → accès**.

---

## 6. La leçon défensive 🛡️

Chaque maillon avait sa **contre-mesure**, et **une seule** aurait suffi à briser la chaîne :
- **FTP anonyme** : le **désactiver** (\`anonymous_enable=NO\`) → pas de fuite d'indice.
- **Note avec des secrets** : ne **jamais** écrire d'identifiants dans un fichier accessible.
- **Identifiants par défaut** : les **changer dès la mise en service** → l'accès échoue même avec l'indice.

> 🧠 Retiens : la sécurité n'est pas qu'une question de « la » faille critique. Un attaquant **assemble** des négligences mineures. Défendre, c'est **ne laisser aucun maillon** exploitable — et surtout, **changer les identifiants par défaut** et **fermer les accès anonymes**.

---

## 🎯 Ta mission (résumé)

1. **Scanne** (\`nmap target\`) → 2 ports.
2. **Énumère** le FTP anonyme (\`curl ftp://target/notes.txt\`) → indice.
3. Repère la ressource **401**, exploite les **identifiants par défaut** (\`curl -u admin:admin2024 …\`) → **flag**.

## 🧠 À retenir

- Une attaque réelle est une **chaîne** : reconnaissance → énumération → exploitation → objectif. **Casser un seul maillon** l'arrête.
- **\`nmap target\`** révèle les ports (ici **21 FTP** + **8080 web**). **\`curl ftp://target/notes.txt\`** exploite le **FTP anonyme** (Module 1) → **indice**.
- **\`curl -i\`** montre le code HTTP : un **\`401 Unauthorized\`** = ressource protégée par **authentification**. **\`curl -u user:pass\`** fournit les identifiants (HTTP Basic).
- La faille finale : des **identifiants par défaut jamais changés** (\`admin/admin2024\`). C'est l'une des négligences les plus courantes.
- **Défense** : désactiver le **FTP anonyme**, ne jamais stocker d'identifiants dans un fichier accessible, et **changer les identifiants par défaut dès la mise en service**.`,
    badge: {
      id: "badge-prat-capstone",
      name: "Chaîne Complète",
      icon: "Trophy",
      description: "A enchaîné reconnaissance et exploitation d'une faille d'authentification, du scan jusqu'au flag final.",
    },
    challenges: [
      {
        id: "prat-capstone-t1",
        title: "Reconnaissance initiale",
        order: 1,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🔭 Scanner la cible

Personne ne te dit par où commencer — alors commence par le début : le **scan**.

\`\`\`bash
nmap target
\`\`\`

**Question :** combien de ports apparaissent **\`open\`** ?`,
        points: 50,
        timeLimitSec: 300,
        hints: [],
        answer: 2,
        explanation: `Le scan révèle **2** ports ouverts : **21** (FTP) et **8080** (web). Deux portes à explorer — le réflexe du Module 1. La suite consiste à **énumérer** chacune pour voir ce qu'elle laisse fuir.`,
        tags: ["capstone", "nmap", "recon"],
      },
      {
        id: "prat-capstone-t2",
        title: "Énumération FTP",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🎣 Le FTP anonyme

Comme au Module 1, le FTP accepte l'accès anonyme. Récupère le fichier qui s'y trouve :

\`\`\`bash
curl ftp://target/notes.txt
\`\`\`

Lis la note **attentivement**.

**Question :** d'après la note trouvée, quel **chemin** héberge le panneau d'administration ?`,
        points: 100,
        timeLimitSec: 400,
        hints: [],
        answer: "/admin-portal/",
        accept: ["admin-portal", "/admin-portal", "admin-portal/"],
        caseSensitive: false,
        explanation: `La note interne révèle le chemin **\`/admin-portal/\`** — et, négligence classique, mentionne aussi les **identifiants par défaut**. Le FTP anonyme (Module 1) vient de te donner la clé de l'étape suivante : c'est une **fuite d'information**.`,
        tags: ["capstone", "ftp", "enumeration"],
      },
      {
        id: "prat-capstone-t3",
        title: "Repérer la protection",
        order: 3,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔒 La porte fermée

Va voir le chemin indiqué, en affichant les en-têtes HTTP :

\`\`\`bash
curl -i http://target:8080/admin-portal/
\`\`\`

**Question :** quel **code de statut HTTP** le serveur renvoie-t-il pour cette ressource ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: ["401 Unauthorized", "200 OK", "404 Not Found", "500 Internal Server Error"],
        answer: 0,
        explanation: `Le serveur répond **\`401 Unauthorized\`** : la ressource **existe** mais exige une **authentification** (HTTP Basic Auth). Un 401 (et non un 404) confirme qu'il y a **quelque chose à protéger** ici — et la note FTP t'a donné de quoi t'authentifier.`,
        tags: ["capstone", "http", "401"],
      },
      {
        id: "prat-capstone-t4",
        title: "Identifier les identifiants",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🗝️ Les identifiants par défaut

Relis la note FTP : elle donnait explicitement le couple identifiant/mot de passe (jamais changé).

**Question :** d'après la note FTP, quel **couple identifiant/mot de passe** faut-il essayer ? *(format \`identifiant/motdepasse\`)*`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "admin/admin2024",
        accept: ["admin:admin2024", "admin admin2024", "admin / admin2024"],
        caseSensitive: false,
        explanation: `La note révélait **\`admin/admin2024\`** — des identifiants **par défaut jamais changés**, l'une des fautes les plus répandues en production. Ils vont ouvrir le panneau protégé par 401 à l'étape suivante.`,
        tags: ["capstone", "identifiants", "defaut"],
      },
      {
        id: "prat-capstone-t5",
        title: "Accéder au panneau",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🔓 Ouvrir la porte (flag)

Fournis les identifiants à \`curl\` via l'option \`-u\` :

\`\`\`bash
curl -u admin:admin2024 http://target:8080/admin-portal/
\`\`\`

Le serveur passe de **401** à **200 OK** et sert le contenu du panneau.

**Question :** colle le **flag** affiché.`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "curl authentifie en HTTP Basic avec -u utilisateur:motdepasse.", cost: 20 },
          { text: "Commande complète : curl -u admin:admin2024 http://target:8080/admin-portal/", cost: 35 },
        ],
        answer: "CYBERACE{synthese_recon_ftp_bruteforce_faible}",
        caseSensitive: true,
        explanation: `Avec **\`-u admin:admin2024\`**, curl franchit l'authentification Basic → **200 OK** et le panneau révèle \`CYBERACE{synthese_recon_ftp_bruteforce_faible}\`. La chaîne est bouclée : **scan → FTP anonyme → indice → identifiants faibles → accès**. Aucune faille spectaculaire, juste un enchaînement de négligences.`,
        tags: ["capstone", "curl", "flag"],
      },
      {
        id: "prat-capstone-t6",
        title: "Comprendre la chaîne d'attaque",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⛓️ La chaîne

**Question :** quelle **combinaison de techniques** a permis d'accéder à cette ressource protégée ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Une énumération de service (FTP) révélant une fuite d'information, exploitée pour contourner une authentification faible",
          "Une attaque par force brute exhaustive sur tous les mots de passe possibles",
          "Une injection SQL sur le formulaire de connexion",
          "Un empoisonnement du cache ARP",
        ],
        answer: 0,
        explanation: `La chaîne : **énumération FTP** → **fuite d'information** (la note avec le chemin + les identifiants) → **contournement d'une authentification faible** (identifiants par défaut). Pas de brute-force exhaustif, pas d'injection SQL, pas d'ARP : juste l'**assemblage** de négligences, réflexe hérité du Module 1.`,
        tags: ["capstone", "chaine", "enumeration"],
      },
      {
        id: "prat-capstone-t7",
        title: "Contre-mesure FTP",
        order: 7,
        difficulty: "easy",
        type: "text",
        prompt: `## 🛡️ Fermer la première brèche

**Question :** quel **paramètre vsftpd**, désactivé ici, aurait empêché la fuite via **FTP anonyme** ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        answer: "anonymous_enable",
        accept: ["anonymous_enable=no", "desactiver le ftp anonyme", "anonymous_enable=NO", "anonymous enable"],
        caseSensitive: false,
        explanation: `Mettre **\`anonymous_enable=NO\`** dans la config vsftpd désactive l'accès **anonyme** → la note (et donc l'indice + les identifiants) devient **inaccessible**, et la chaîne casse dès le premier maillon.`,
        tags: ["capstone", "ftp", "contre-mesure"],
      },
      {
        id: "prat-capstone-t8",
        title: "Contre-mesure identifiants",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔑 Fermer la dernière brèche

**Question :** quelle **pratique** aurait empêché l'accès via ces identifiants ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Changer les identifiants par défaut dès la mise en service",
          "Augmenter la taille de la clé de chiffrement TLS",
          "Désactiver complètement le port 8080",
          "Ajouter plus de mémoire au serveur",
        ],
        answer: 0,
        explanation: `**Changer les identifiants par défaut dès la mise en service** aurait rendu l'indice inutile : même en connaissant \`admin/admin2024\`, l'accès aurait échoué. C'est une règle de durcissement de base, trop souvent négligée. Ni TLS, ni mémoire, ni fermeture du port web (nécessaire au service) ne sont la réponse.`,
        tags: ["capstone", "identifiants-defaut", "durcissement"],
      },
      {
        id: "prat-capstone-t9",
        title: "Synthèse du parcours pratique",
        order: 9,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Boucler le parcours

**Question :** cette dernière chaîne s'appuie directement sur les réflexes de **quel module** de ce parcours ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Module 1 (reconnaissance et énumération de services)",
          "Module 5 (élévation de privilèges via cron)",
          "Module 8 (capacités Linux)",
          "Module 9 (canal caché ICMP)",
        ],
        answer: 0,
        explanation: `Ce capstone rejoue les fondamentaux du **Module 1** : **scan** (nmap), **énumération de services** (FTP anonyme), lecture attentive des indices. L'élévation de privilèges (5, 8) et les canaux cachés (9) relèvent d'autres axes — ici, tout part de la **reconnaissance**. Fin du parcours pratique : bravo ! 🏁`,
        tags: ["capstone", "synthese", "module1"],
      },
    ],
  },
];
