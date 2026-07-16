import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 38 : CORS mal configuré (réflexion d'origine + credentials). Lab Docker réel. */
export const module38CorsMisconfig: CourseSeed[] = [
  {
    slug: "prat-cors-misconfig",
    title: "CORS mal configuré",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Origin",
    domain: "Sécurité applicative",
    theme: "grid",
    icon: "ShieldCheck",
    accent: "#C4C44F",
    order: 38,
    difficulty: "medium",
    summary:
      "Ce service protège son API par CORS. Mais il RÉFLÉCHIT n'importe quelle origine reçue et autorise les credentials : n'importe quel site peut alors lire les réponses authentifiées de l'API au nom de la victime.",
    objectives: [
      "Envoyer un en-tête Origin arbitraire avec curl",
      "Observer la réflexion de l'origine dans la réponse",
      "Repérer l'en-tête Allow-Credentials qui aggrave tout",
      "Récupérer la donnée exposée",
      "Comprendre pourquoi réflexion + credentials est pire que *",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module38-cors-misconfig:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🛡️ CORS mal configuré — Silent Origin

Ce service **protège** son API par **CORS**. Mais regarde comment il réagit face à une origine **qu'il n'a jamais vue**. 🏎️

---

## 🧭 Le briefing

> Ce service protège son API par CORS. Vérifie comment il réagit quand on lui présente une origine qu'il n'a jamais vue.

Tu es l'attaquant, avec \`curl\`. L'API sensible est \`/api/profile\`.

---

## 1. CORS, en deux mots 🌐

**CORS** contrôle quels **sites (origines)** ont le droit de **lire** les réponses d'une API depuis un navigateur. Le serveur répond avec **\`Access-Control-Allow-Origin\`**&nbsp;: soit une origine précise, soit \`*\`.

---

## 2. La réflexion d'origine 🪞

Envoie une origine **arbitraire** avec l'option **\`-H\`** de curl&nbsp;:

\`\`\`bash
curl -i -H "Origin: https://site-malveillant.exemple" http://target:8080/api/profile
\`\`\`

Observe la réponse&nbsp;: \`Access-Control-Allow-Origin\` **reflète exactement** l'origine envoyée. Le serveur dit « oui » à **n'importe qui**.

---

## 3. L'aggravation : les credentials ⚠️

Un second en-tête, **\`Access-Control-Allow-Credentials: true\`**, autorise l'envoi des **cookies/identifiants**. Combiné à la **réflexion**, cela permet à **n'importe quel site** de faire des requêtes **authentifiées** (avec les cookies de la victime) et d'en **lire** la réponse — ici le \`token\` admin.

---

## 4. Récupérer & corriger 🛡️

\`\`\`bash
curl -H "Origin: https://n-importe-quoi.exemple" http://target:8080/api/profile
\`\`\`

- **Correction** : n'autoriser **qu'une liste blanche fixe** d'origines de confiance, **jamais** une réflexion automatique de \`Origin\`, surtout combinée à \`Allow-Credentials\`.

---

## 🧠 À retenir

- **CORS** contrôle qui peut **lire** les réponses d'une API côté navigateur.
- **\`-H "Origin: ..."\`** teste la réaction du serveur à une origine arbitraire.
- **Réflexion d'origine + Allow-Credentials** = requêtes authentifiées lisibles depuis **n'importe quel** site.
- **\`*\` seul** interdit les credentials ; la **réflexion** avec credentials est **pire**.
- Parade : **liste blanche** fixe d'origines, jamais de réflexion.`,
    badge: {
      id: "badge-prat-cors",
      name: "Origine Frontalière",
      icon: "ShieldCheck",
      description: "A vu un serveur accepter n'importe quelle origine comme si elle était de confiance.",
    },
    challenges: [
      {
        id: "prat-cors-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Premier contact

Démarre le lab. Interroge l'API :

\`\`\`bash
curl http://target:8080/api/profile
\`\`\`

**Question :** quel **outil en ligne de commande** envoie des requêtes HTTP ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** interroge l'API. On va manipuler ses en-têtes pour tester la politique CORS.`,
        tags: ["cors", "curl", "recon"],
      },
      {
        id: "prat-cors-t2",
        title: "Envoyer une origine arbitraire",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 🪞 En-tête Origin

\`\`\`bash
curl -i -H "Origin: https://site-malveillant.exemple" http://target:8080/api/profile
\`\`\`

**Question :** quelle **option curl** ajoute un en-tête HTTP personnalisé, ici Origin ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "-H",
        accept: ["--header"],
        caseSensitive: true,
        explanation: `**\`-H "Origin: ..."\`** (ou \`--header\`) envoie une origine arbitraire — pour voir si le serveur la reflète.`,
        tags: ["cors", "curl", "-H"],
      },
      {
        id: "prat-cors-t3",
        title: "Observer la réflexion",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔎 La réponse

\`\`\`bash
curl -i -H "Origin: https://site-malveillant.exemple" http://target:8080/api/profile
\`\`\`

**Question :** que renvoie l'en-tête \`Access-Control-Allow-Origin\` de la réponse ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: [
          "Exactement l'origine envoyée par le client, reflétée telle quelle",
          "Toujours la valeur *",
          "Une erreur 403",
          "Rien, l'en-tête est absent",
        ],
        answer: 0,
        explanation: `Le serveur **reflète** l'origine reçue dans \`Access-Control-Allow-Origin\` : il approuve donc **n'importe quelle** origine.`,
        tags: ["cors", "reflexion"],
      },
      {
        id: "prat-cors-t4",
        title: "L'aggravation",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## ⚠️ Le second en-tête

Regarde les autres en-têtes CORS de la réponse.

**Question :** quel **second en-tête**, combiné à cette réflexion, rend la situation particulièrement dangereuse ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        answer: "Access-Control-Allow-Credentials",
        accept: ["allow-credentials"],
        caseSensitive: false,
        explanation: `**\`Access-Control-Allow-Credentials: true\`** autorise l'envoi des cookies. Avec la réflexion d'origine, tout site peut faire des requêtes **authentifiées** et lire la réponse.`,
        tags: ["cors", "credentials"],
      },
      {
        id: "prat-cors-t5",
        title: "Récupérer le flag",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Récupérer le flag

Le corps de la réponse contient un \`token\`.

**Question :** colle le **flag** (la valeur du token).`,
        points: 300,
        timeLimitSec: 400,
        hints: [],
        answer: "CYBERACE{cors_origine_reflechie_avec_credentials}",
        caseSensitive: true,
        explanation: `La réponse expose \`"token":"CYBERACE{cors_origine_reflechie_avec_credentials}"\` — lisible depuis n'importe quelle origine, credentials compris.`,
        tags: ["cors", "flag"],
      },
      {
        id: "prat-cors-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Corriger

**Question :** quelle configuration corrige ce problème ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "N'autoriser explicitement qu'une liste blanche fixe d'origines de confiance, jamais une réflexion automatique de l'en-tête Origin, surtout combinée à Allow-Credentials",
          "Retirer complètement le support CORS de l'API",
          "Utiliser HTTPS au lieu de HTTP",
          "Changer le nom du champ 'token' dans la réponse",
        ],
        answer: 0,
        explanation: `Une **liste blanche fixe** d'origines de confiance — jamais la réflexion de \`Origin\`, surtout avec \`Allow-Credentials\`. HTTPS ou renommer le champ ne changent rien.`,
        tags: ["cors", "contre-mesure"],
      },
      {
        id: "prat-cors-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** pourquoi la combinaison réflexion + Allow-Credentials est-elle pire qu'un simple \`Access-Control-Allow-Origin: *\` seul ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Le `*` seul interdit l'envoi de cookies/identifiants ; la réflexion d'origine combinée à Allow-Credentials permet, elle, des requêtes authentifiées depuis n'importe quel site",
          "Il n'y a en réalité aucune différence de risque entre les deux",
          "Le `*` seul est en fait plus dangereux",
          "Cela ne concerne que les requêtes POST",
        ],
        answer: 0,
        explanation: `Le navigateur **interdit** \`*\` **avec** credentials : \`*\` seul ne permet pas de lire des réponses **authentifiées**. La réflexion + \`Allow-Credentials\` le permet — d'où le vol de données de session.`,
        tags: ["cors", "synthese"],
      },
    ],
  },
];
