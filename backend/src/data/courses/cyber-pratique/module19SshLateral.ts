import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 19 : mouvement latéral via clé SSH exposée. Lab Docker réel. */
export const module19SshLateral: CourseSeed[] = [
  {
    slug: "prat-ssh-lateral",
    title: "Mouvement latéral par clé SSH exposée",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Hop",
    domain: "Mouvement latéral",
    theme: "grid",
    icon: "GitFork",
    accent: "#9B6BC4",
    order: 19,
    difficulty: "hard",
    summary:
      "Un script de déploiement a laissé sa clé privée accessible à tous sur ce poste. Cette clé ouvre une porte vers une AUTRE machine du réseau. Premier module à combiner les deux modes du parcours : tu démarres en stagiaire (mono-conteneur) mais une vraie seconde cible existe (mode réseau) — car le mouvement latéral, par définition, relie deux machines.",
    objectives: [
      "Repérer une clé privée SSH lisible par tous sur le poste de départ",
      "Comprendre pourquoi SSH refuse une clé aux permissions trop ouvertes",
      "Corriger les permissions d'une clé copiée (chmod 600)",
      "Rebondir en SSH vers une seconde machine et y lire un flag",
      "Nommer et prévenir le mouvement latéral",
    ],
    sandbox: {
      attackerImage: "cyberace/module19-source:latest",
      targetImage: "cyberace/module19-target:latest",
      ttlSec: 1200,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🍴 Mouvement latéral par clé SSH exposée — Silent Hop

Ce module est **inédit** : il combine les deux modes du parcours. Tu démarres en **\`stagiaire\`** sur une machine (comme aux Modules 3/5/8/14/15), mais **une vraie seconde machine** (\`target\`) existe bel et bien (comme aux modules réseau). Normal : le **mouvement latéral** relie **deux** machines. 🏎️

---

## 🧭 Le briefing

> Un **script de déploiement** a laissé sa **clé privée** accessible à tous sur ce poste. Cette clé ouvre une **porte** vers une autre machine du réseau interne (le **serveur de sauvegarde**, \`target\`). Sers-t'en pour rebondir et récupérer le flag qui s'y trouve.

Tu es \`stagiaire\` sur le poste **source**. La cible s'appelle \`target\`.

---

## 1. Une clé oubliée 🔑

Les scripts de déploiement automatisés s'authentifient souvent par **clé SSH** (plus pratique qu'un mot de passe). Le problème classique : la **clé privée** finit **oubliée** sur un poste, avec des **permissions trop larges** (lisible par tous).

Commence par explorer :

\`\`\`bash
ls -la /opt/backup/
\`\`\`

Tu y trouves \`deploy_key\` — une **clé privée SSH**, lisible par n'importe qui.

---

## 2. SSH refuse une clé trop permissive 🚫

Tente d'utiliser la clé directement :

\`\`\`bash
ssh -i /opt/backup/deploy_key backup-svc@target
\`\`\`

SSH **refuse** avec un avertissement du type :

\`\`\`
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for '/opt/backup/deploy_key' are too open.
\`\`\`

C'est une **protection** du client SSH : il **rejette** toute clé privée que d'autres utilisateurs pourraient lire — sinon n'importe qui la volerait.

---

## 3. Copier puis corriger les permissions 🛠️

Le fichier dans \`/opt/backup/\` ne t'appartient pas (tu ne peux pas forcément corriger ses perms en place). La bonne méthode : le **copier chez toi**, puis **restreindre** ses permissions :

\`\`\`bash
cp /opt/backup/deploy_key ~/deploy_key
chmod 600 ~/deploy_key      # lecture/écriture pour le seul propriétaire
\`\`\`

\`chmod 600\` = **rw-------** : plus personne d'autre ne peut lire la clé. SSH l'accepte alors.

---

## 4. Rebondir vers la seconde machine 🎯

\`\`\`bash
ssh -i ~/deploy_key backup-svc@target
# une fois connecté :
cat flag.txt
\`\`\`

Tu es maintenant sur **\`target\`**, en tant que \`backup-svc\` — une machine que tu n'avais **jamais** touchée au départ. C'est ça, le **mouvement latéral** : utiliser un accès obtenu sur A pour atteindre B.

---

## 5. Les contre-mesures 🛡️

- **Ne jamais stocker de clé privée en clair** sur un poste partagé → utiliser un **coffre-fort de secrets** (Vault, Secrets Manager…).
- Restreindre les permissions des clés (\`600\`, propriétaire dédié).
- Limiter la portée d'une clé de déploiement (commande forcée, \`from=\` dans \`authorized_keys\`).

---

## 🎯 Ta mission (résumé)

1. Explore \`/opt/backup/\`, repère la clé privée.
2. Constate le refus de SSH, **copie** la clé, **corrige** ses permissions.
3. **Rebondis** vers \`target\`, lis le **flag**.

## 🧠 À retenir

- Une **clé privée SSH lisible par tous** = porte ouverte vers d'autres machines.
- SSH **refuse** une clé privée aux permissions trop larges (\`UNPROTECTED PRIVATE KEY FILE\`).
- **\`chmod 600\`** (rw-------) sur une copie personnelle débloque l'usage.
- **Mouvement latéral** = rebondir d'une machine compromise vers une autre.
- Parade : **coffre-fort de secrets**, jamais de clé privée en clair sur un poste partagé.`,
    badge: {
      id: "badge-prat-ssh",
      name: "Voyageur Discret",
      icon: "GitFork",
      description: "A rebondi d'une machine à l'autre grâce à une clé oubliée.",
    },
    challenges: [
      {
        id: "prat-ssh-t1",
        title: "Qui suis-je ?",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Qui suis-je ?

Démarre le lab et ouvre le terminal. Tu es \`stagiaire\` sur le poste source. Identifie ton compte :

\`\`\`bash
id
\`\`\`

**Question :** quelle **commande** affiche l'utilisateur courant, son UID et ses groupes ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "id",
        caseSensitive: false,
        explanation: `**\`id\`** affiche l'identité courante (uid, gid, groupes). Tu confirmes que tu es \`stagiaire\`, un compte **non privilégié**.`,
        tags: ["ssh", "recon", "id"],
      },
      {
        id: "prat-ssh-t2",
        title: "Explorer le système de fichiers",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🗂️ Explorer /opt/backup

Le briefing parle d'un fichier laissé par un script de déploiement :

\`\`\`bash
ls -la /opt/backup/
\`\`\`

**Question :** quel type de fichier sensible, normalement jamais laissé accessible, trouve-t-on dans \`/opt/backup/\` ?`,
        points: 100,
        timeLimitSec: 350,
        hints: [],
        answer: "une cle privee ssh",
        accept: ["cle privee", "cle ssh", "private key", "deploy_key"],
        caseSensitive: false,
        explanation: `Le fichier \`deploy_key\` est une **clé privée SSH**, lisible par tous (perms \`644\`). Une clé privée ne devrait **jamais** être accessible à d'autres que son propriétaire.`,
        tags: ["ssh", "cle-privee", "enumeration"],
      },
      {
        id: "prat-ssh-t3",
        title: "Pourquoi SSH refuse la clé",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚫 SSH refuse la clé telle quelle

Tente d'utiliser la clé directement :

\`\`\`bash
ssh -i /opt/backup/deploy_key backup-svc@target
\`\`\`

**Question :** pourquoi SSH refuse-t-il d'utiliser cette clé sans modification préalable ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Les clients SSH refusent les clés privées dont les permissions sont trop ouvertes (lisibles par d'autres que le propriétaire)",
          "La clé est corrompue",
          "Le serveur cible est injoignable",
          "Il faut d'abord installer un certificat",
        ],
        answer: 0,
        explanation: `SSH protège l'utilisateur : une clé privée **lisible par d'autres** pourrait être volée. Il **rejette** donc toute clé aux permissions trop larges (\`UNPROTECTED PRIVATE KEY FILE\`), tant qu'on ne les a pas restreintes.`,
        tags: ["ssh", "permissions"],
      },
      {
        id: "prat-ssh-t4",
        title: "Corriger les permissions",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🛠️ Restreindre les permissions

Copie d'abord la clé chez toi, puis restreins ses permissions au seul propriétaire.

**Question :** quelle **commande** restreint les permissions d'un fichier à lecture/écriture pour son seul propriétaire ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "chmod 600",
        caseSensitive: true,
        explanation: `**\`chmod 600\`** donne \`rw-------\` : lecture/écriture au propriétaire, **rien** aux autres. C'est le niveau de permission que SSH exige d'une clé privée.`,
        tags: ["ssh", "chmod", "permissions"],
      },
      {
        id: "prat-ssh-t5",
        title: "Se connecter et récupérer le flag",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Rebondir vers target (flag)

Séquence complète :

\`\`\`bash
cp /opt/backup/deploy_key ~/deploy_key
chmod 600 ~/deploy_key
ssh -i ~/deploy_key backup-svc@target
# puis, sur target :
cat flag.txt
\`\`\`

**Question :** colle le **flag** trouvé sur \`target\`.`,
        points: 300,
        timeLimitSec: 700,
        hints: [
          { text: "Copie la clé AVANT de corriger ses permissions : le fichier original dans /opt/backup/ n'est pas forcément modifiable directement.", cost: 20 },
          { text: "Commande complète : cp /opt/backup/deploy_key ~/deploy_key && chmod 600 ~/deploy_key && ssh -i ~/deploy_key backup-svc@target", cost: 35 },
        ],
        answer: "CYBERACE{cle_ssh_exposee_mouvement_lateral}",
        caseSensitive: true,
        explanation: `La clé copiée et sécurisée (\`chmod 600\`), SSH t'ouvre \`target\` en tant que \`backup-svc\` → \`cat flag.txt\` révèle \`CYBERACE{cle_ssh_exposee_mouvement_lateral}\`. Tu viens de **rebondir** vers une machine que tu n'avais jamais touchée.`,
        tags: ["ssh", "mouvement-lateral", "flag"],
      },
      {
        id: "prat-ssh-t6",
        title: "Comprendre le mouvement latéral",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔀 Nommer la technique

**Question :** comment qualifie-t-on cette technique consistant à utiliser un accès obtenu sur une première machine pour atteindre une autre machine du réseau ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Mouvement latéral",
          "Élévation de privilèges",
          "Déni de service",
          "Usurpation ARP",
        ],
        answer: 0,
        explanation: `C'est le **mouvement latéral** : progresser **de machine en machine** à l'intérieur d'un réseau. À ne pas confondre avec l'**élévation de privilèges** (monter en droits **sur** une même machine).`,
        tags: ["ssh", "mouvement-lateral", "vocabulaire"],
      },
      {
        id: "prat-ssh-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure

**Question :** quelle pratique aurait empêché cette compromission ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Ne jamais stocker de clé privée de déploiement en clair sur un poste partagé — utiliser un coffre-fort de secrets dédié",
          "Utiliser un mot de passe au lieu d'une clé SSH",
          "Changer le port SSH par défaut",
          "Désactiver complètement SSH sur tous les serveurs",
        ],
        answer: 0,
        explanation: `La racine du problème est une **clé privée en clair** sur un poste partagé. La parade est un **coffre-fort de secrets** (Vault, Secrets Manager) + des permissions strictes — pas un changement de port ni la suppression de SSH.`,
        tags: ["ssh", "secrets", "contre-mesure"],
      },
      {
        id: "prat-ssh-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** ce module est le seul du parcours à combiner quels deux éléments déjà vus séparément ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Le point de départ en utilisateur limité (comme aux Modules 3/5/8/14/15) et une vraie seconde machine à atteindre (comme aux modules réseau)",
          "ARP spoofing et cassage de mot de passe",
          "Capacités Linux et transfert de zone DNS",
          "Aucune combinaison particulière",
        ],
        answer: 0,
        explanation: `Il fusionne le **mode mono-conteneur** (départ en \`stagiaire\`) et le **mode réseau** (une vraie cible \`target\`) — parce que le mouvement latéral **relie deux machines** par définition.`,
        tags: ["ssh", "synthese"],
      },
    ],
  },
];
