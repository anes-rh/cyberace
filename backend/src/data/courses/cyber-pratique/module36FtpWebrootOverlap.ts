import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 36 : recouvrement dossier FTP / racine web. Lab Docker réel. */
export const module36FtpWebrootOverlap: CourseSeed[] = [
  {
    slug: "prat-ftp-webroot-overlap",
    title: "FTP en écriture recouvrant la racine web",
    checkpoint: "prat-services-exposes",
    codename: "Silent Overlap",
    domain: "Services réseau exposés",
    theme: "grid",
    icon: "Layers",
    accent: "#7DC44F",
    order: 36,
    difficulty: "medium",
    summary:
      "Ce serveur accepte les dépôts FTP anonymes ET sert un site web. Le dossier FTP inscriptible (www/) EST la racine web : tout fichier déposé par FTP devient immédiatement servi publiquement — une passerelle inattendue entre écriture et exécution.",
    objectives: [
      "Déposer un fichier par FTP anonyme (curl -T)",
      "Vérifier qu'il est immédiatement servi par le serveur web",
      "Comprendre le risque réel du recouvrement",
      "Nommer la mauvaise pratique",
      "Séparer strictement upload et racine web",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module36-ftp-webroot-overlap:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🗂️ FTP en écriture / racine web — Silent Overlap

Ce serveur accepte les **dépôts FTP anonymes** ET **sert un site web**. La question&nbsp;: est-ce le **même dossier** ? 🏎️

---

## 🧭 Le briefing

> Ce serveur accepte les dépôts FTP anonymes ET sert un site web. Vérifie s'il s'agit du même dossier.

Tu es l'attaquant. \`curl\` gère FTP et HTTP. Ce module **démontre une chaîne** — aucun contenu malveillant à écrire, juste un texte de preuve fixe.

En te connectant en FTP anonyme, tu vois un dossier **\`www/\`** ouvert en écriture. C'est là qu'on dépose.

---

## 1. Déposer par FTP anonyme ⬆️

L'option **\`-T\`** de curl **envoie** (upload) un fichier local vers FTP&nbsp;:

\`\`\`bash
echo "preuve-upload-ok" > test.txt
curl -T test.txt ftp://target/www/test.txt
\`\`\`

L'écriture anonyme est activée sur **\`www/\`**&nbsp;: le fichier y atterrit.

---

## 2. Le lire via HTTP 🎯

\`\`\`bash
curl http://target:8080/test.txt
# → preuve-upload-ok
\`\`\`

Le fichier déposé dans **\`www/\`** par **FTP** est **immédiatement servi** par le serveur **web**&nbsp;: le dossier d'upload **EST** la racine web.

---

## 3. Le vrai risque 🧠

Ce n'est pas grave pour un texte anodin. Mais un attaquant pourrait déposer **n'importe quel** contenu directement **servi publiquement**&nbsp;: page piégée, script malveillant, page de phishing… Le canal d'**écriture** anonyme devient un canal de **publication**.

---

## 4. La correction 🛡️

- **Mauvaise pratique** : faire **coïncider** un répertoire accessible en **écriture anonyme** avec la **racine web**.
- **Correction** : **séparer strictement** les dossiers d'upload FTP de la racine web, et **ne pas** activer l'écriture anonyme sans nécessité réelle.

---

## 🧠 À retenir

- **\`curl -T fichier ftp://hôte/www/nom\`** dépose un fichier par FTP dans \`www/\`.
- Si le dossier d'upload FTP **=** racine web, tout fichier déposé est **servi publiquement**.
- Le danger : publier du contenu arbitraire (page piégée, script) via un simple canal d'écriture.
- Parade : **séparer** upload et racine web ; écriture anonyme **uniquement si indispensable**.
- Prolonge le Module 1 : même FTP anonyme, mais côté **écriture**.`,
    badge: {
      id: "badge-prat-ftpoverlap",
      name: "Passerelle Inattendue",
      icon: "Layers",
      description: "A prouvé qu'un dossier d'upload et une racine web ne devraient jamais coïncider.",
    },
    challenges: [
      {
        id: "prat-ftpoverlap-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Premier contact

Démarre le lab. Regarde le site servi :

\`\`\`bash
curl http://target:8080/
\`\`\`

**Question :** quel **outil** gère à la fois HTTP et FTP en ligne de commande ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** parle HTTP **et** FTP : il servira à déposer le fichier puis à le relire.`,
        tags: ["ftpoverlap", "curl", "recon"],
      },
      {
        id: "prat-ftpoverlap-t2",
        title: "Tester l'écriture FTP",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## ⬆️ Déposer un fichier

\`\`\`bash
echo "preuve-upload-ok" > test.txt
curl -T test.txt ftp://target/www/test.txt
\`\`\`

**Question :** quelle **option curl** envoie (upload) un fichier local vers un serveur FTP ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: "-T",
        accept: ["curl -T"],
        caseSensitive: true,
        explanation: `**\`-T\`** (upload) envoie \`test.txt\` vers le FTP. L'écriture anonyme étant activée, le dépôt réussit.`,
        tags: ["ftpoverlap", "curl", "upload"],
      },
      {
        id: "prat-ftpoverlap-t3",
        title: "Confirmer le recouvrement",
        order: 3,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Le relire via HTTP

\`\`\`bash
curl http://target:8080/test.txt
\`\`\`

**Question :** quel **texte** apparaît dans la réponse HTTP, confirmant que le fichier déposé par FTP est directement servi par le serveur web ?`,
        points: 250,
        timeLimitSec: 500,
        hints: [
          { text: "C'est exactement le contenu que tu as écrit dans test.txt à la tâche précédente.", cost: 20 },
        ],
        answer: "preuve-upload-ok",
        caseSensitive: false,
        explanation: `Le serveur web renvoie **\`preuve-upload-ok\`** : le fichier FTP est servi tel quel. Upload FTP et racine web sont le même dossier.`,
        tags: ["ftpoverlap", "resultat"],
      },
      {
        id: "prat-ftpoverlap-t4",
        title: "Comprendre le risque réel",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Le vrai risque

**Question :** quel est le vrai risque de ce recouvrement ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Un attaquant pourrait déposer n'importe quel contenu directement servi publiquement (page piégée, script malveillant) via ce canal d'écriture",
          "Le serveur consomme plus de bande passante",
          "Les fichiers FTP sont automatiquement plus lents à charger",
          "Cela n'a aucune conséquence tant que le contenu est un simple fichier texte",
        ],
        answer: 0,
        explanation: `Le canal d'**écriture** anonyme devient un canal de **publication** : n'importe quel contenu déposé est servi publiquement — page piégée, script, phishing.`,
        tags: ["ftpoverlap", "risque"],
      },
      {
        id: "prat-ftpoverlap-t5",
        title: "Nommer la mauvaise pratique",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🏷️ La mauvaise pratique

**Question :** quelle est la mauvaise pratique de configuration illustrée ici ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Faire coïncider un répertoire accessible en écriture anonyme avec la racine servie publiquement par le serveur web",
          "Utiliser vsftpd plutôt qu'un autre serveur FTP",
          "Servir du contenu sur le port 8080 plutôt que 80",
          "Autoriser la lecture anonyme en FTP",
        ],
        answer: 0,
        explanation: `Le problème est le **recouvrement** : un dossier en écriture anonyme = la racine web. Le choix du serveur ou du port n'y est pour rien.`,
        tags: ["ftpoverlap", "mauvaise-pratique"],
      },
      {
        id: "prat-ftpoverlap-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Corriger

**Question :** quelle mesure corrige ce problème ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Séparer strictement les répertoires d'upload FTP de la racine web, et ne jamais activer l'écriture anonyme sans nécessité réelle",
          "Interdire uniquement les fichiers .txt en upload",
          "Changer le port FTP par défaut",
          "Ajouter un mot de passe au fichier uploadé",
        ],
        answer: 0,
        explanation: `On **sépare** les dossiers d'upload de la racine web et on **n'active** l'écriture anonyme que si c'est réellement nécessaire.`,
        tags: ["ftpoverlap", "contre-mesure"],
      },
      {
        id: "prat-ftpoverlap-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** en quoi ce module prolonge-t-il le Module 1 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Il réutilise la découverte FTP anonyme du Module 1, mais explore cette fois la conséquence d'un accès en ÉCRITURE plutôt qu'en simple lecture",
          "Il n'a aucun lien avec le Module 1",
          "Il remplace complètement la technique du Module 1",
          "Il nécessite une élévation de privilèges, contrairement au Module 1",
        ],
        answer: 0,
        explanation: `Le Module 1 exploitait la **lecture** FTP anonyme ; ici, on exploite l'**écriture** anonyme et sa conséquence quand elle recouvre la racine web.`,
        tags: ["ftpoverlap", "synthese"],
      },
    ],
  },
];
