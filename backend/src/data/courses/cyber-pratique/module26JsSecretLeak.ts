import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 26 : secret d'API laissé dans le JavaScript client. Lab Docker réel. */
export const module26JsSecretLeak: CourseSeed[] = [
  {
    slug: "prat-js-secret-leak",
    title: "Secret d'API dans le JavaScript client",
    checkpoint: "prat-recon-web",
    codename: "Silent Script",
    domain: "Reconnaissance web",
    theme: "grid",
    icon: "CreditCard",
    accent: "#4F9ECC",
    order: 26,
    difficulty: "medium",
    summary:
      "Tout code envoyé à un navigateur est, par définition, entièrement visible côté client — commentaires compris. Un développeur pressé a laissé une clé d'API de staging en dur dans un fichier .js servi publiquement. Il suffit de le lire.",
    objectives: [
      "Interroger une page et repérer ses ressources JavaScript",
      "Télécharger un fichier .js servi publiquement",
      "Repérer une variable contenant un secret",
      "Extraire une clé d'API laissée en clair",
      "Comprendre où un secret doit réellement vivre",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module26-js-secret-leak:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 💳 Secret d'API dans le JavaScript client — Silent Script

Une vérité que les développeurs pressés oublient : **tout** ce qui part vers un navigateur est **lisible**. Le JavaScript « côté client » n'a **rien** de secret. 🏎️

---

## 🧭 Le briefing

> Un tableau de bord est en ligne (\`http://target:8080/\`). Tout code envoyé à un navigateur est, par définition, **entièrement visible** côté client — commentaires compris. Un développeur pressé l'oublie parfois.

Tu es l'attaquant, avec \`curl\`.

---

## 1. Le HTML révèle ses scripts 📄

\`\`\`bash
curl http://target:8080/
\`\`\`

La page charge un script :

\`\`\`html
<script src="js/app.js"></script>
\`\`\`

Ce fichier \`.js\` est **téléchargé par le navigateur** — donc **accessible** à quiconque.

---

## 2. Lire le JavaScript 🔍

\`\`\`bash
curl http://target:8080/js/app.js
\`\`\`

Et là, en clair :

\`\`\`javascript
// TODO: retirer avant la mise en prod - cle temporaire de staging
const STAGING_API_KEY = "CYBERACE{...}";
\`\`\`

Un **commentaire** avoue la négligence, et la **constante** \`STAGING_API_KEY\` contient une clé qui n'aurait **jamais** dû quitter le serveur.

---

## 3. Pourquoi c'est grave 🧠

Un secret dans du JS **côté client** est :
- **téléchargeable** par n'importe quel visiteur ;
- **visible** intégralement (commentaires inclus) ;
- **indexable** (moteurs, archives).

Le minifier ou l'obscurcir ne change **rien** : le navigateur doit pouvoir l'exécuter, donc le lire.

---

## 4. La contre-mesure 🛡️

Un secret (clé d'API, jeton) doit vivre **uniquement côté serveur**, **jamais** transmis au client. Le front appelle une **API serveur** qui, elle, détient le secret et l'utilise pour son compte — le client ne le voit jamais.

---

## 🧠 À retenir

- Le **JavaScript côté client** est **intégralement lisible** — commentaires compris.
- Un secret en dur dans un \`.js\` public est **exposé** à tout visiteur.
- L'obscurcissement/minification ne **protège pas** un secret client.
- Parade : garder les secrets **côté serveur**, jamais envoyés au navigateur.`,
    badge: {
      id: "badge-prat-jsleak",
      name: "Lecteur de Scripts",
      icon: "CreditCard",
      description: "A trouvé une clé qui n'aurait jamais dû quitter le serveur.",
    },
    challenges: [
      {
        id: "prat-jsleak-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Premier contact

Démarre le lab. Récupère la page d'accueil :

\`\`\`bash
curl http://target:8080/
\`\`\`

**Question :** quel **outil en ligne de commande** récupère le contenu d'une URL ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** télécharge la page. Le HTML y référence un script qu'il va falloir lire.`,
        tags: ["jsleak", "curl", "recon"],
      },
      {
        id: "prat-jsleak-t2",
        title: "Repérer la référence JS",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📄 Le script référencé

Regarde la balise \`<script src="...">\` dans le HTML.

**Question :** quel **fichier JavaScript** est référencé dans la page ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "js/app.js",
        accept: ["app.js"],
        caseSensitive: false,
        explanation: `La page charge **\`js/app.js\`** — un fichier livré au navigateur, donc téléchargeable par quiconque.`,
        tags: ["jsleak", "html"],
      },
      {
        id: "prat-jsleak-t3",
        title: "Récupérer le fichier",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔍 Télécharger le script

**Question :** quelle **commande** récupère le contenu de ce fichier ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "curl http://target:8080/js/app.js",
        caseSensitive: true,
        explanation: `**\`curl http://target:8080/js/app.js\`** télécharge le script — et son contenu est en clair.`,
        tags: ["jsleak", "curl"],
      },
      {
        id: "prat-jsleak-t4",
        title: "Repérer la variable suspecte",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🕵️ La variable de trop

Lis le contenu de \`app.js\`.

**Question :** quel **nom de variable** JavaScript contient une clé qui n'aurait jamais dû être livrée côté client ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        answer: "STAGING_API_KEY",
        caseSensitive: false,
        explanation: `La constante **\`STAGING_API_KEY\`** contient une clé d'API de staging — laissée en dur dans un fichier public, avec un commentaire \`TODO\` qui avoue la négligence.`,
        tags: ["jsleak", "variable"],
      },
      {
        id: "prat-jsleak-t5",
        title: "Récupérer le flag",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Récupérer le flag

La valeur de \`STAGING_API_KEY\` **est** le flag.

**Question :** colle le **flag**.`,
        points: 250,
        timeLimitSec: 400,
        hints: [],
        answer: "CYBERACE{cle_api_dans_le_js_cote_client}",
        caseSensitive: true,
        explanation: `\`const STAGING_API_KEY = "CYBERACE{cle_api_dans_le_js_cote_client}"\` — un secret exposé à tout visiteur du site.`,
        tags: ["jsleak", "flag"],
      },
      {
        id: "prat-jsleak-t6",
        title: "Pourquoi c'est grave",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Pourquoi c'est grave

**Question :** pourquoi un secret placé dans du code JavaScript côté client est-il particulièrement risqué ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Ce code est intégralement visible et téléchargeable par quiconque visite la page, commentaires compris",
          "JavaScript chiffre automatiquement ses propres constantes",
          "Seuls les développeurs peuvent voir le code source d'une page",
          "Les navigateurs modernes masquent automatiquement les clés API",
        ],
        answer: 0,
        explanation: `Le JS client est **téléchargé** et **exécuté** par le navigateur : il est donc **entièrement lisible**. Aucun mécanisme ne le protège — le cacher est impossible par nature.`,
        tags: ["jsleak", "analyse"],
      },
      {
        id: "prat-jsleak-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure

**Question :** où un secret de ce type devrait-il réellement se trouver ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Uniquement côté serveur, jamais transmis au client",
          "Dans un commentaire JavaScript plutôt que dans une variable",
          "Encodé en base64 dans le même fichier",
          "Dans le titre de la page HTML",
        ],
        answer: 0,
        explanation: `Un secret doit rester **côté serveur**. Le front appelle une API serveur qui détient la clé ; le navigateur ne la voit **jamais**. Base64 ou commentaire ne changent rien — c'est toujours livré au client.`,
        tags: ["jsleak", "contre-mesure"],
      },
    ],
  },
];
