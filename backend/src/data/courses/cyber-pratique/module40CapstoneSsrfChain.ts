import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 40 : capstone SSRF + identifiants faibles. Lab Docker réel. */
export const module40CapstoneSsrfChain: CourseSeed[] = [
  {
    slug: "prat-capstone-ssrf-chain",
    title: "Capstone — SSRF + identifiants combinés",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Convergence",
    domain: "Synthèse pratique",
    theme: "grid",
    icon: "Trophy",
    accent: "#B08040",
    order: 40,
    difficulty: "hard",
    summary:
      "Dernier module de la série applicative : une CHAÎNE. Un panneau d'admin interne, protégé par Basic Auth et lié à 127.0.0.1, semble hors d'atteinte. Mais une SSRF t'amène à sa porte, et des identifiants faibles connus l'ouvrent. Deux faiblesses, une seule victoire.",
    objectives: [
      "Sonder un service interne via une SSRF",
      "Constater qu'il exige une authentification (401)",
      "Embarquer des identifiants dans l'URL",
      "Combiner SSRF et Basic Auth pour atteindre le flag",
      "Relier les contre-mesures (SSRF + identifiants) et clore la série",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module40-capstone-ssrf-chain:latest",
      ttlSec: 1200,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🏆 Capstone — Silent Convergence

Fin de la **2ᵉ série** (modules 31-40). Comme le Module 10 clôturait la première, celui-ci **combine** deux faiblesses déjà vues en une seule **chaîne**. 🏎️

---

## 🧭 Le briefing

> Un **tableau de bord RH** mal sécurisé, découvert plus tôt dans ta mission, a révélé les identifiants **\`admin\` / \`cyberace2026\`** pour un **panneau d'administration interne**. Ce portail propose un **aperçu de lien** — tu sais déjà à quoi ça peut servir.

La cible expose l'**aperçu** (public, 8080) et un **admin interne** protégé par **Basic Auth**, lié à **\`127.0.0.1:9090\`**.

---

## 1. Sonder l'interne (SSRF) 🔁

\`\`\`bash
curl "http://target:8080/preview?url=http://127.0.0.1:9090/"
\`\`\`

Réponse&nbsp;: **401 Unauthorized**. La SSRF **atteint** le service interne, mais il **exige une authentification**. La SSRF **seule** bute ici.

---

## 2. Embarquer les identifiants dans l'URL 🔑

Une URL peut porter des identifiants **Basic Auth** directement&nbsp;: **\`http://utilisateur:motdepasse@hôte/\`**. Avec les creds connus&nbsp;:

\`\`\`
http://admin:cyberace2026@127.0.0.1:9090/
\`\`\`

---

## 3. Combiner les deux 🎯

\`\`\`bash
curl "http://target:8080/preview?url=http://admin:cyberace2026@127.0.0.1:9090/"
\`\`\`

Le serveur d'aperçu émet la requête vers son \`127.0.0.1:9090\` **avec** les identifiants → **200** et le flag.

---

## 4. Pourquoi DEUX faiblesses ? 🧠

- La **SSRF seule** aurait buté sur le **401**.
- Les **identifiants faibles seuls** étaient inutilisables sans **moyen d'atteindre** le service interne.
- **Combinées**, elles suffisent. C'est le principe d'une **chaîne d'exploitation**.

**Contre-mesures** (chacune aurait suffi à casser la chaîne)&nbsp;: restreindre les cibles de la SSRF (Module 34) **et** changer les identifiants par défaut (Module 10).

---

## 🧠 À retenir

- **SSRF** amène à la **porte** d'un service interne ; les **identifiants** l'ouvrent.
- **\`http://user:pass@hôte/\`** embarque le Basic Auth dans l'URL.
- Une **chaîne** combine des faiblesses **individuellement insuffisantes**.
- Fil rouge de la série 31-40 : des applis/services qui font **trop confiance** à l'entrée utilisateur ou à leur propre réseau.`,
    badge: {
      id: "badge-prat-capstone2",
      name: "Convergence Totale",
      icon: "Trophy",
      description: "A combiné une SSRF et des identifiants connus pour atteindre un service qui se croyait inaccessible.",
    },
    challenges: [
      {
        id: "prat-capstone2-t1",
        title: "Repérage SSRF",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Repérage

Démarre le lab. L'aperçu de lien est en \`/preview?url=...\`.

**Question :** quel **outil en ligne de commande** enverra les requêtes ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** pilote la fonctionnalité d'aperçu — le point de départ de la chaîne.`,
        tags: ["capstone", "curl", "recon"],
      },
      {
        id: "prat-capstone2-t2",
        title: "Sonder le port interne",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔁 Sonder l'interne

\`\`\`bash
curl "http://target:8080/preview?url=http://127.0.0.1:9090/"
\`\`\`

**Question :** que se passe-t-il si l'on sonde ce service interne **sans** identifiants ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        options: [
          "401 Unauthorized est renvoyé, une authentification est requise",
          "200 OK avec le flag directement",
          "Connexion refusée",
          "Timeout",
        ],
        answer: 0,
        explanation: `La SSRF **atteint** le service interne, mais il répond **401** : il faut s'authentifier. La SSRF seule ne suffit pas.`,
        tags: ["capstone", "ssrf", "401"],
      },
      {
        id: "prat-capstone2-t3",
        title: "La syntaxe d'URL avec identifiants",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔑 Identifiants dans l'URL

**Question :** quelle syntaxe d'URL embarque directement des identifiants HTTP Basic Auth ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "http://utilisateur:motdepasse@hote/",
          "http://hote/utilisateur/motdepasse",
          "http://hote?auth=utilisateur:motdepasse",
          "http://hote#utilisateur:motdepasse",
        ],
        answer: 0,
        explanation: `La forme **\`http://utilisateur:motdepasse@hôte/\`** envoie automatiquement un en-tête \`Authorization: Basic ...\`.`,
        tags: ["capstone", "basic-auth"],
      },
      {
        id: "prat-capstone2-t4",
        title: "L'outil pour la requête",
        order: 4,
        difficulty: "easy",
        type: "text",
        prompt: `## 🛠️ L'outil

**Question :** quel **outil en ligne de commande** envoie cette requête depuis le terminal ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** envoie la requête d'aperçu portant l'URL authentifiée.`,
        tags: ["capstone", "curl"],
      },
      {
        id: "prat-capstone2-t5",
        title: "Exploiter la chaîne",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Combiner SSRF + identifiants

\`\`\`bash
curl "http://target:8080/preview?url=http://admin:cyberace2026@127.0.0.1:9090/"
\`\`\`

**Question :** colle le **flag** obtenu.`,
        points: 350,
        timeLimitSec: 700,
        hints: [
          { text: "Les identifiants sont ceux donnés dans le briefing : admin / cyberace2026.", cost: 25 },
          { text: "URL à passer en paramètre : http://admin:cyberace2026@127.0.0.1:9090/", cost: 40 },
        ],
        answer: "CYBERACE{ssrf_et_identifiants_combines}",
        caseSensitive: true,
        explanation: `Le serveur d'aperçu joint \`127.0.0.1:9090\` **avec** le Basic Auth → **200** et \`CYBERACE{ssrf_et_identifiants_combines}\`. Deux faiblesses combinées ont ouvert la porte.`,
        tags: ["capstone", "flag", "chaine"],
      },
      {
        id: "prat-capstone2-t6",
        title: "Comprendre la chaîne complète",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Deux faiblesses

**Question :** pourquoi a-t-il fallu DEUX faiblesses distinctes pour réussir ici ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "La SSRF seule aurait buté sur l'authentification ; les identifiants faibles seuls étaient inutilisables sans un moyen d'atteindre le service interne — les deux combinées ont suffi",
          "En réalité une seule des deux faiblesses était nécessaire",
          "Les identifiants n'ont joué aucun rôle réel",
          "La SSRF a directement cassé l'authentification",
        ],
        answer: 0,
        explanation: `Chaîne d'exploitation : SSRF (atteindre) + identifiants (ouvrir). Chacune seule était insuffisante ; ensemble, elles suffisent.`,
        tags: ["capstone", "analyse"],
      },
      {
        id: "prat-capstone2-t7",
        title: "Contre-mesure SSRF",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🛡️ Parade (SSRF)

**Question :** quelle mesure, vue au Module 34, s'applique aussi ici ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Restreindre les URL/IP que la fonctionnalité de récupération côté serveur peut contacter",
          "Supprimer complètement la fonctionnalité d'aperçu",
          "Chiffrer le paramètre url",
          "Changer le port du service d'aperçu",
        ],
        answer: 0,
        explanation: `Restreindre les cibles de la SSRF (liste blanche, blocage des IP privées/locales) aurait empêché d'atteindre \`127.0.0.1:9090\`.`,
        tags: ["capstone", "contre-mesure", "ssrf"],
      },
      {
        id: "prat-capstone2-t8",
        title: "Contre-mesure identifiants",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🛡️ Parade (identifiants)

**Question :** quelle mesure, vue au Module 10, s'applique aussi ici ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Changer les identifiants par défaut dès la mise en service",
          "Désactiver Basic Auth complètement",
          "Ajouter plus de mémoire au serveur",
          "Utiliser un port non standard",
        ],
        answer: 0,
        explanation: `Changer les identifiants par défaut (\`admin/cyberace2026\`) aurait cassé l'autre maillon de la chaîne.`,
        tags: ["capstone", "contre-mesure", "identifiants"],
      },
      {
        id: "prat-capstone2-t9",
        title: "Synthèse finale de la série",
        order: 9,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse de la série

**Question :** quel a été le fil conducteur de cette deuxième série de dix modules (31 à 40) ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Des services ou applications qui font trop confiance aux données fournies par l'utilisateur, ou à leur propre environnement réseau",
          "Toutes les failles nécessitaient un accès root préalable",
          "Toutes les failles concernaient uniquement des mots de passe",
          "Aucun fil conducteur ne relie ces modules",
        ],
        answer: 0,
        explanation: `Le fil rouge 31-40 : une **confiance excessive** — envers l'entrée utilisateur (injection, LFI, IDOR, XXE, CORS) ou envers son propre réseau/services (SSRF, Redis, Memcached, FTP).`,
        tags: ["capstone", "synthese"],
      },
    ],
  },
];
