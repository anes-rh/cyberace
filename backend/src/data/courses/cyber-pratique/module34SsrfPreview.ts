import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 34 : SSRF (server-side request forgery). Lab Docker réel. */
export const module34SsrfPreview: CourseSeed[] = [
  {
    slug: "prat-ssrf-preview",
    title: "SSRF — falsification de requête côté serveur",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Proxy",
    domain: "Sécurité applicative",
    theme: "grid",
    icon: "Cloud",
    accent: "#4F7DC4",
    order: 34,
    difficulty: "hard",
    summary:
      "Ce portail propose un aperçu de lien : il va chercher une URL À TA PLACE et t'en montre le contenu. « À ta place » est la clé : le serveur peut atteindre des ressources internes (127.0.0.1) que toi, de l'extérieur, tu ne peux pas.",
    objectives: [
      "Utiliser une fonctionnalité d'aperçu d'URL côté serveur",
      "Comprendre pourquoi récupérer une URL côté serveur est risqué",
      "Cibler un service interne lié à 127.0.0.1",
      "Nommer la faille (SSRF)",
      "Restreindre les cibles autorisées comme parade",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module34-ssrf-preview:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# ☁️ SSRF — Silent Proxy

Ce portail propose un **aperçu de lien**&nbsp;: il va chercher une URL **à ta place** et t'en montre le contenu. **« À ta place »** est tout le problème. 🏎️

---

## 🧭 Le briefing

> Ce portail propose un aperçu de lien&nbsp;: \`/preview?url=...\`. Le serveur récupère l'URL et te renvoie le contenu.

Deux services tournent dans la cible&nbsp;: l'**aperçu** (public, port 8080) et un **admin interne** lié **uniquement à 127.0.0.1:9090** — donc **injoignable directement** depuis toi.

---

## 1. L'aperçu, côté serveur 🔁

\`\`\`bash
curl "http://target:8080/preview?url=http://exemple.com/"
\`\`\`

C'est le **serveur** qui émet la requête HTTP vers l'URL, puis te renvoie la réponse. Le serveur agit **en son propre nom**, depuis **son propre réseau**.

---

## 2. Pourquoi c'est dangereux 🧠

Le serveur peut joindre des ressources **internes** que l'extérieur ne peut pas&nbsp;: \`127.0.0.1\`, des IP privées, des métadonnées cloud… En choisissant l'URL, **tu diriges** ces requêtes internes.

Ici, l'admin écoute sur **\`127.0.0.1:9090\`**&nbsp;: injoignable pour toi, mais **local** pour le service d'aperçu.

---

## 3. Exploiter 🎯

\`\`\`bash
curl "http://target:8080/preview?url=http://127.0.0.1:9090/"
\`\`\`

Le serveur d'aperçu joint son propre \`127.0.0.1:9090\` et te renvoie sa réponse — le flag.

---

## 4. Nommer & corriger 🛡️

- **Faille** : **SSRF** (*Server-Side Request Forgery*) — l'attaquant fait émettre au serveur des requêtes qu'il choisit.
- **Correction** : **restreindre** strictement les URL/IP que la fonctionnalité peut contacter (liste blanche de domaines), en **bloquant** les plages privées/locales (127.0.0.0/8, 10/8, 169.254.169.254…).

---

## 🧠 À retenir

- **SSRF** = le **serveur** émet une requête que **tu** choisis, depuis **son** réseau.
- Cible privilégiée : \`127.0.0.1\` et les services **internes** injoignables de l'extérieur.
- Différence avec injection/LFI : ce n'est pas **toi** qui accèdes à la ressource, c'est le **serveur** à ta demande.
- Parade : **liste blanche** de destinations + blocage des adresses privées/locales.`,
    badge: {
      id: "badge-prat-ssrf",
      name: "Emprunteur d'Identité Serveur",
      icon: "Cloud",
      description: "A fait parler un serveur à sa propre place.",
    },
    challenges: [
      {
        id: "prat-ssrf-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Premier contact

Démarre le lab. Interroge l'outil d'aperçu :

\`\`\`bash
curl "http://target:8080/preview?url=http://exemple.com/"
\`\`\`

**Question :** quel **outil en ligne de commande** envoie la requête ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** appelle l'aperçu ; c'est ensuite le **serveur** qui va chercher l'URL demandée.`,
        tags: ["ssrf", "curl", "recon"],
      },
      {
        id: "prat-ssrf-t2",
        title: "Usage normal",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔎 Le paramètre

**Question :** quel **paramètre GET** précise l'URL à prévisualiser ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "url",
        caseSensitive: false,
        explanation: `Le paramètre **\`url\`** indique au serveur quelle adresse récupérer — c'est ce que tu vas détourner.`,
        tags: ["ssrf", "parametre"],
      },
      {
        id: "prat-ssrf-t3",
        title: "Comprendre le risque",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Pourquoi c'est risqué

**Question :** pourquoi une fonctionnalité qui va chercher une URL côté serveur est-elle risquée ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: [
          "Le serveur peut accéder, en son propre nom, à des ressources internes normalement inaccessibles depuis l'extérieur (ex: 127.0.0.1)",
          "Cela ralentit toujours le site de façon significative",
          "Cela révèle systématiquement le mot de passe administrateur",
          "Cela ne présente aucun risque particulier",
        ],
        answer: 0,
        explanation: `Le serveur émet la requête **depuis son réseau** : il peut atteindre \`127.0.0.1\`, des IP privées, des endpoints internes — que l'attaquant, lui, ne peut pas joindre directement.`,
        tags: ["ssrf", "risque"],
      },
      {
        id: "prat-ssrf-t4",
        title: "Exploiter",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Cibler le service interne

\`\`\`bash
curl "http://target:8080/preview?url=http://127.0.0.1:9090/"
\`\`\`

**Question :** colle le **flag** renvoyé par le service interne.`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "Le service interne écoute sur 127.0.0.1, PAS sur l'IP publique du conteneur — vise donc localhost côté serveur.", cost: 25 },
          { text: "URL à passer en paramètre : http://127.0.0.1:9090/", cost: 40 },
        ],
        answer: "CYBERACE{ssrf_service_interne_atteint}",
        caseSensitive: true,
        explanation: `Le serveur d'aperçu joint son propre \`127.0.0.1:9090\` et renvoie sa réponse → \`CYBERACE{ssrf_service_interne_atteint}\`. Tu as atteint un service que tu ne pouvais pas joindre directement.`,
        tags: ["ssrf", "flag"],
      },
      {
        id: "prat-ssrf-t5",
        title: "Nommer la faille",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Nommer la faille

**Question :** comment appelle-t-on cette catégorie de vulnérabilité ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "SSRF",
        accept: ["server-side request forgery", "falsification de requete cote serveur"],
        caseSensitive: false,
        explanation: `C'est la **SSRF** (*Server-Side Request Forgery*) : forger, via le serveur, des requêtes vers des cibles qu'on choisit.`,
        tags: ["ssrf", "vocabulaire"],
      },
      {
        id: "prat-ssrf-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Réduire le risque

**Question :** quelle mesure réduit ce risque ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Restreindre strictement les URLs/IP que la fonctionnalité de récupération côté serveur a le droit de contacter, en bloquant notamment les plages d'adresses privées/locales",
          "Interdire complètement les URLs en HTTPS",
          "Augmenter le délai d'expiration (timeout) de la requête",
          "Chiffrer le paramètre url en base64",
        ],
        answer: 0,
        explanation: `On **restreint** les destinations (liste blanche de domaines) et on **bloque** les plages privées/locales (127.0.0.0/8, 10/8, 169.254.169.254…). Le reste (HTTPS, timeout, base64) ne change rien au fond.`,
        tags: ["ssrf", "contre-mesure"],
      },
      {
        id: "prat-ssrf-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** en quoi ce module diffère-t-il des Modules 31 et 32 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Ce n'est pas l'attaquant qui accède directement à la ressource sensible — c'est le SERVEUR lui-même qui y accède, à la demande de l'attaquant",
          "Ce module n'implique aucune notion de confiance excessive envers l'entrée utilisateur",
          "Ce module ne nécessite aucune requête HTTP",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Aux Modules 31/32, l'attaquant lit/exécute directement. En SSRF, c'est le **serveur** qui accède à la ressource interne **pour** l'attaquant — la confiance excessive porte sur son propre réseau.`,
        tags: ["ssrf", "synthese"],
      },
    ],
  },
];
