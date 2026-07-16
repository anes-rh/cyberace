import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 20 : API JSON exposée sans authentification. Lab Docker réel. */
export const module20ApiDisclosure: CourseSeed[] = [
  {
    slug: "prat-api-json-disclosure",
    title: "API JSON exposée sans authentification",
    checkpoint: "prat-recon-web",
    codename: "Silent Roster",
    domain: "Reconnaissance web",
    theme: "grid",
    icon: "Cloud",
    accent: "#C4954F",
    order: 20,
    difficulty: "medium",
    summary:
      "Un portail RH interne n'affiche qu'une page d'accueil vide. Mais un site n'est jamais que ce que montre sa page d'accueil : le sitemap révèle une API JSON jamais liée, servie sans la moindre authentification, qui déballe l'annuaire du personnel.",
    objectives: [
      "Interroger un serveur web avec curl",
      "Découvrir un chemin d'API via le sitemap (pas via un lien)",
      "Récupérer et formater du JSON avec jq",
      "Trouver un secret glissé dans un champ de données",
      "Comprendre que l'absence de lien n'est pas une protection",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module20-api-disclosure:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# ☁️ API JSON exposée sans authentification — Silent Roster

Un site web, ce n'est **pas seulement** sa page d'accueil. Derrière une façade vide peuvent se cacher des **ressources jamais liées** — mais parfaitement **accessibles** à qui sait les demander. 🏎️

---

## 🧭 Le briefing

> Un **portail RH interne** est en ligne (\`http://target:8080/\`). Il n'expose qu'une **page d'accueil vide** — mais un site n'est jamais que ce que montre sa page d'accueil.

Tu es l'attaquant. Ta seule entrée : \`curl\`.

---

## 1. Premier contact 👋

\`\`\`bash
curl http://target:8080/
\`\`\`

Réponse : une page RH quasi vide. Rien d'exploitable **en apparence**. Il faut chercher les **portes dérobées** de la structure du site.

---

## 2. Les fichiers de découverte 🗺️

Deux fichiers standards renseignent (involontairement) sur la structure d'un site :

- **\`robots.txt\`** : indique aux moteurs quels chemins **ne pas** indexer (\`Disallow: /api/\`) — donc révèle leur existence.
- **\`sitemap.xml\`** : liste les URL « officielles » du site — parfois des chemins **jamais liés** ailleurs.

Ici, c'est le **sitemap** qui trahit une API :

\`\`\`bash
curl http://target:8080/sitemap.xml
\`\`\`

\`\`\`xml
<urlset><url><loc>/api/v1/employees.json</loc></url></urlset>
\`\`\`

Un chemin \`/api/v1/employees.json\` — **jamais lié** depuis la page d'accueil, mais bien présent.

---

## 3. Récupérer et formater le JSON 📦

\`\`\`bash
curl http://target:8080/api/v1/employees.json
\`\`\`

Le JSON brut est illisible d'un bloc. **\`jq\`** (ajouté à \`attacker-base\`) le formate et permet de l'interroger :

\`\`\`bash
curl -s http://target:8080/api/v1/employees.json | jq .
\`\`\`

Chaque employé a un champ \`note\`. **Examine-les** : l'un contient un \`temp_password=...\` — le flag.

---

## 4. La contre-mesure 🛡️

Le problème n'est **pas** que l'API existe, mais qu'elle est **servie sans authentification**. La parade : **authentifier systématiquement** l'accès aux endpoints d'API, **même** ceux jamais liés publiquement. Renommer, cacher ou retirer du sitemap ne protège **rien** — c'est de la sécurité par l'obscurité.

---

## 🎯 Ta mission (résumé)

1. Interroge la page d'accueil, puis le **sitemap**.
2. Récupère l'**API JSON**, formate-la avec **jq**.
3. Trouve le **secret** dans le champ \`note\`.

## 🧠 À retenir

- Un site = bien plus que sa page d'accueil : **sitemap**/**robots.txt** révèlent des chemins cachés.
- Une **API non liée** reste **accessible** : l'absence de lien n'est **pas** une protection.
- **\`jq\`** formate et interroge proprement le JSON.
- Parade : **authentifier** tout endpoint d'API, pas le cacher.`,
    badge: {
      id: "badge-prat-api",
      name: "Lecteur de Registres",
      icon: "Cloud",
      description: "A trouvé un annuaire interne qui n'aurait jamais dû être public.",
    },
    challenges: [
      {
        id: "prat-api-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Premier contact

Démarre le lab. Interroge la page d'accueil du portail :

\`\`\`bash
curl http://target:8080/
\`\`\`

**Question :** quel **outil en ligne de commande** récupère le contenu d'une URL ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** récupère le contenu d'une URL. La page d'accueil est vide — il faut chercher ailleurs.`,
        tags: ["api", "curl", "recon"],
      },
      {
        id: "prat-api-t2",
        title: "Repérer le sitemap",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🗺️ Le sitemap trahit une API

\`\`\`bash
curl http://target:8080/sitemap.xml
\`\`\`

**Question :** quel **chemin d'API** apparaît dans le sitemap, jamais lié depuis la page d'accueil ?`,
        points: 100,
        timeLimitSec: 350,
        hints: [],
        answer: "/api/v1/employees.json",
        accept: ["api/v1/employees.json"],
        caseSensitive: false,
        explanation: `Le sitemap liste \`/api/v1/employees.json\` — un endpoint **jamais lié** depuis l'accueil, mais parfaitement déclaré (et accessible).`,
        tags: ["api", "sitemap", "decouverte"],
      },
      {
        id: "prat-api-t3",
        title: "Récupérer la ressource",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 📦 Récupérer la ressource

**Question :** quelle **commande** récupère le contenu de cette ressource JSON ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "curl http://target:8080/api/v1/employees.json",
        caseSensitive: true,
        explanation: `**\`curl http://target:8080/api/v1/employees.json\`** télécharge le JSON de l'annuaire — servi sans aucune authentification.`,
        tags: ["api", "curl"],
      },
      {
        id: "prat-api-t4",
        title: "Parser proprement",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔧 Parser proprement

Le JSON brut est illisible d'un bloc. Formate-le :

\`\`\`bash
curl -s http://target:8080/api/v1/employees.json | jq .
\`\`\`

**Question :** quel **outil en ligne de commande** formate et interroge proprement du JSON ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "jq",
        caseSensitive: true,
        explanation: `**\`jq\`** est le couteau suisse du JSON : il l'**indente**, le **filtre**, l'**interroge**. \`jq .\` suffit à rendre l'annuaire lisible.`,
        tags: ["api", "jq"],
      },
      {
        id: "prat-api-t5",
        title: "Trouver le flag",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Trouver le flag

Examine le champ \`note\` de chaque employé dans le JSON formaté.

**Question :** colle le **flag** trouvé.`,
        points: 300,
        timeLimitSec: 500,
        hints: [
          { text: "Utilise jq . pour un affichage lisible, ligne par ligne.", cost: 20 },
          { text: "Le champ à regarder s'appelle « note » — l'un d'eux contient temp_password=…", cost: 35 },
        ],
        answer: "CYBERACE{api_json_expose_sans_auth}",
        caseSensitive: true,
        explanation: `Le champ \`note\` d'un employé contient \`temp_password=CYBERACE{api_json_expose_sans_auth}\` : un secret glissé dans des données servies **sans authentification**.`,
        tags: ["api", "flag"],
      },
      {
        id: "prat-api-t6",
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
          "Authentifier systématiquement l'accès aux endpoints d'API, même ceux jamais liés publiquement",
          "Renommer le fichier en .txt au lieu de .json",
          "Supprimer le sitemap.xml uniquement",
          "Chiffrer le disque du serveur",
        ],
        answer: 0,
        explanation: `Seule l'**authentification** de l'endpoint protège réellement. Le cacher (renommer, retirer du sitemap) est de la sécurité par l'obscurité : la ressource reste accessible à qui connaît l'URL.`,
        tags: ["api", "auth", "contre-mesure"],
      },
      {
        id: "prat-api-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** quel principe, déjà vu au Module 11 (vhost caché), s'applique de nouveau ici ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "L'absence de lien public n'équivaut jamais à une vraie protection",
          "Toutes les API doivent être en XML plutôt qu'en JSON",
          "jq est le seul moyen de lire du JSON",
          "robots.txt protège toujours les chemins qu'il liste",
        ],
        answer: 0,
        explanation: `Comme le vhost caché du Module 11, une ressource **non liée** n'est pas **protégée** : elle est simplement **discrète**. La seule vraie protection est un contrôle d'accès explicite.`,
        tags: ["api", "synthese"],
      },
    ],
  },
];
