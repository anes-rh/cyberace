import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 23 : contournement d'accès par verbe HTTP. Lab Docker réel. */
export const module23HttpVerbTampering: CourseSeed[] = [
  {
    slug: "prat-http-verb-tampering",
    title: "Contournement par verbe HTTP",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Verb",
    domain: "Reconnaissance web",
    theme: "grid",
    icon: "Flag",
    accent: "#4FC4A0",
    order: 23,
    difficulty: "medium",
    summary:
      "Une ressource protégée renvoie 403 en accès normal. Mais la règle ne filtre QUE la méthode GET — un contrôle d'accès naïf, courant en pratique. N'importe quelle autre méthode HTTP passe sans le moindre contrôle : une protection qui ne connaît qu'une façon de demander une page n'en connaît en réalité aucune.",
    objectives: [
      "Constater un refus 403 sur une ressource protégée",
      "Changer la méthode HTTP d'une requête avec curl -X",
      "Contourner un filtre qui ne bloque que GET",
      "Comprendre la faiblesse du filtrage par exception",
      "Préférer une liste blanche (autoriser l'explicite) au filtrage négatif",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module23-verb-tampering:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🚩 Contournement par verbe HTTP — Silent Verb

Une protection qui ne connaît **qu'une seule façon** de demander une page n'en connaît en réalité **aucune**. Ce module illustre un contrôle d'accès naïf, hélas courant. 🏎️

---

## 🧭 Le briefing

> Une ressource protégée (\`http://target:8080/admin-panel/\`) renvoie **403** en accès normal. Mais la règle qui la protège ne filtre **que** la méthode \`GET\`.

Tu es l'attaquant, avec \`curl\`.

---

## 1. Les verbes HTTP 🔤

Une requête HTTP porte une **méthode** (un « verbe ») : \`GET\` (lire), \`POST\` (envoyer), \`PUT\`, \`DELETE\`, \`HEAD\`, \`OPTIONS\`… Un contrôle d'accès **correct** s'applique à **toutes** les méthodes. Un contrôle **naïf** n'en filtre qu'une.

Ici, la config nginx ressemble à :

\`\`\`nginx
location /admin-panel/ {
  if ($request_method = GET) { return 403; }   # ← ne bloque QUE GET
  return 200 "...le contenu protégé...";
}
\`\`\`

*(La directive \`if\` dans nginx est réputée piégeuse — la doc officielle dit elle-même « if is evil ».)*

---

## 2. Accès normal : refusé 🚫

\`\`\`bash
curl -i http://target:8080/admin-panel/
\`\`\`

Un navigateur envoie du \`GET\` → la règle renvoie **403 Forbidden**. En apparence, c'est protégé.

---

## 3. Changer de verbe 🔑

\`curl -X <MÉTHODE>\` force une autre méthode :

\`\`\`bash
curl -X POST http://target:8080/admin-panel/
\`\`\`

Le \`POST\` **n'est pas** filtré → la règle tombe dans le \`return 200\` et **sert le contenu protégé**, flag compris.

---

## 4. La contre-mesure 🛡️

Ne **jamais** filtrer par **exception** d'une seule méthode. Il faut **autoriser explicitement** et **uniquement** ce qui est nécessaire (liste blanche), et **refuser tout le reste** — y compris les méthodes inattendues. Un contrôle d'accès doit être **positif** (« j'autorise X »), pas **négatif** (« je bloque GET »).

---

## 🧠 À retenir

- HTTP a **plusieurs verbes** ; un contrôle d'accès doit tous les couvrir.
- **\`curl -X POST\`** change la méthode et contourne un filtre qui ne vise que \`GET\`.
- Une protection **partielle** (une seule méthode) n'est **pas** une protection.
- Parade : **liste blanche** (autoriser l'explicite), jamais filtrage négatif d'une exception.`,
    badge: {
      id: "badge-prat-verb",
      name: "Changeur de Verbe",
      icon: "Flag",
      description: "A contourné un filtre qui ne connaissait qu'une seule méthode HTTP.",
    },
    challenges: [
      {
        id: "prat-verb-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Premier contact

Démarre le lab. Interroge le portail :

\`\`\`bash
curl http://target:8080/
\`\`\`

**Question :** quel **outil en ligne de commande** envoie des requêtes HTTP ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** envoie des requêtes HTTP et affiche la réponse. C'est ton outil pour tester les différentes méthodes.`,
        tags: ["verb", "curl", "recon"],
      },
      {
        id: "prat-verb-t2",
        title: "Accès normal, refusé",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🚫 Accès normal

\`\`\`bash
curl -i http://target:8080/admin-panel/
\`\`\`

*(\`-i\` affiche les en-têtes, dont le code de statut.)*

**Question :** quel **code de statut** reçois-tu pour une requête GET classique sur cette ressource ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: ["403 Forbidden", "200 OK", "404 Not Found", "500 Internal Server Error"],
        answer: 0,
        explanation: `Un \`GET\` classique déclenche la règle \`if ($request_method = GET) { return 403; }\` → **403 Forbidden**. En apparence, la ressource est protégée.`,
        tags: ["verb", "403"],
      },
      {
        id: "prat-verb-t3",
        title: "Changer de méthode",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔑 Changer de verbe

\`\`\`bash
curl -X POST http://target:8080/admin-panel/
\`\`\`

**Question :** quelle **option curl** permet de spécifier une méthode HTTP différente de GET ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "-X",
        accept: ["-X POST", "--request"],
        caseSensitive: true,
        explanation: `**\`-X\`** (ou \`--request\`) impose la méthode HTTP. \`curl -X POST\` envoie un POST, que le filtre (limité à GET) laisse passer.`,
        tags: ["verb", "curl", "-X"],
      },
      {
        id: "prat-verb-t4",
        title: "Récupérer le flag",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Récupérer le flag

Le \`POST\` n'étant pas filtré, la ressource sert son contenu protégé.

**Question :** colle le **flag** obtenu.`,
        points: 250,
        timeLimitSec: 400,
        hints: [],
        answer: "CYBERACE{verbe_http_change_contourne_le_filtre}",
        caseSensitive: true,
        explanation: `\`curl -X POST http://target:8080/admin-panel/\` tombe dans le \`return 200\` et révèle \`CYBERACE{verbe_http_change_contourne_le_filtre}\` — le filtre ne visait que GET.`,
        tags: ["verb", "flag"],
      },
      {
        id: "prat-verb-t5",
        title: "Comprendre la faille",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Comprendre la faille

**Question :** pourquoi cette protection a-t-elle été contournée aussi facilement ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Elle ne filtrait explicitement que la méthode GET, laissant passer sans contrôle toute autre méthode HTTP",
          "curl chiffre automatiquement les requêtes POST",
          "nginx autorise toujours POST par défaut, quelle que soit la configuration",
          "Le port 8080 n'est jamais protégé",
        ],
        answer: 0,
        explanation: `La règle ne bloquait **que** \`GET\`. Toute autre méthode (POST, PUT, DELETE…) échappait au contrôle — un filtrage par exception, incomplet par nature.`,
        tags: ["verb", "analyse"],
      },
      {
        id: "prat-verb-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure

**Question :** quelle approche de configuration est plus sûre que le filtrage par exception d'une seule méthode ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Autoriser explicitement et uniquement ce qui est nécessaire (liste blanche), plutôt que de bloquer une seule méthode par exception",
          "Bloquer uniquement les requêtes POST en plus de GET",
          "Utiliser HTTPS au lieu de HTTP",
          "Augmenter le nombre de workers nginx",
        ],
        answer: 0,
        explanation: `Un contrôle d'accès doit être **positif** : autoriser explicitement le strict nécessaire et refuser **tout le reste**. Bloquer méthode après méthode (négatif) laisse toujours une porte ouverte.`,
        tags: ["verb", "liste-blanche", "contre-mesure"],
      },
      {
        id: "prat-verb-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** quel principe, déjà vu au Module 11 (vhost caché) et au Module 20 (API JSON), se retrouve une nouvelle fois ici ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Une protection partielle ou mal pensée n'est souvent pas une protection du tout",
          "Toutes les API web utilisent obligatoirement GET",
          "nginx est intrinsèquement non sécurisé",
          "Le port 8080 est toujours vulnérable par défaut",
        ],
        answer: 0,
        explanation: `Comme aux Modules 11 et 20, une protection **incomplète** (ici, un filtre limité à GET) équivaut à **aucune** protection. La sécurité doit être pensée de façon exhaustive, pas par exceptions.`,
        tags: ["verb", "synthese"],
      },
    ],
  },
];
