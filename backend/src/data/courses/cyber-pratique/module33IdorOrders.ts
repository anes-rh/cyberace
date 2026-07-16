import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 33 : IDOR (référence directe à un objet). Lab Docker réel. */
export const module33IdorOrders: CourseSeed[] = [
  {
    slug: "prat-idor-orders",
    title: "IDOR — référence directe à un objet",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Swap",
    domain: "Sécurité applicative",
    theme: "grid",
    icon: "Boxes",
    accent: "#914FC4",
    order: 33,
    difficulty: "medium",
    summary:
      "On te donne accès à ta commande de test, numéro 1001. Les identifiants sont séquentiels et rien ne vérifie que tu as le droit de consulter une commande précise. En changeant un chiffre, tu lis la commande d'un autre.",
    objectives: [
      "Consulter sa propre ressource via son identifiant",
      "Repérer un identifiant séquentiel et prévisible",
      "Accéder à la ressource d'autrui en changeant l'identifiant",
      "Nommer la faille (IDOR)",
      "Comprendre la vraie correction (contrôle d'autorisation)",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module33-idor-orders:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 📦 IDOR — Silent Swap

On te donne accès à **ta** commande de test, numéro **1001**. Rien n'empêche de **regarder ailleurs**. 🏎️

---

## 🧭 Le briefing

> On te donne accès à ta commande de test, numéro 1001 (\`/api/orders/1001.json\`). Rien n'empêche de regarder ailleurs.

Tu es l'attaquant, avec \`curl\`.

---

## 1. Ta ressource 🧾

\`\`\`bash
curl http://target:8080/api/orders/1001.json
\`\`\`

\`\`\`json
{"id":1001,"owner":"visiteur_test","item":"Stylo","status":"livre"}
\`\`\`

Le champ **\`id\`** est **séquentiel** (1001, 1002, …) et **prévisible**.

---

## 2. Changer un chiffre 🔀

L'API sert le fichier correspondant à l'identifiant **sans vérifier** que tu en es le propriétaire. Il suffit d'**incrémenter**&nbsp;:

\`\`\`bash
curl http://target:8080/api/orders/1002.json
\`\`\`

→ la commande de **quelqu'un d'autre** (\`admin_direction\`), avec une note confidentielle.

---

## 3. Nommer la faille 🏷️

C'est une **IDOR** (*Insecure Direct Object Reference*)&nbsp;: modifier un identifiant dans une URL donne accès aux données d'un **autre** utilisateur, faute de **contrôle d'autorisation** côté serveur.

---

## 4. La vraie correction 🛡️

- **Racine du problème** : aucune vérification que l'utilisateur **authentifié** a le droit de voir **cette** ressource.
- **Correction** : vérifier **systématiquement, côté serveur**, que le demandeur est bien **propriétaire** de la ressource — quel que soit l'identifiant fourni.
- ⚠️ Remplacer les IDs séquentiels par des **UUID aléatoires** *seuls* est **insuffisant** : ça complique la devinette mais ne **vérifie** toujours pas l'autorisation (un UUID deviné/intercepté reste exploitable).

---

## 🧠 À retenir

- **IDOR** = accéder à la ressource d'autrui en changeant un identifiant, sans contrôle d'accès.
- Les **IDs séquentiels** rendent la découverte triviale.
- Parade **à la racine** : vérifier l'**autorisation** (propriétaire) côté serveur, toujours.
- Les **UUID seuls** ne suffisent pas — ce n'est pas de l'obscurité qu'il faut, mais un contrôle.`,
    badge: {
      id: "badge-prat-idor",
      name: "Changeur de Numéro",
      icon: "Boxes",
      description: "A consulté une commande qui n'était pas la sienne, juste en changeant un chiffre.",
    },
    challenges: [
      {
        id: "prat-idor-t1",
        title: "Consulter sa propre commande",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧾 Ta commande

Démarre le lab. Consulte ta commande de test :

\`\`\`bash
curl http://target:8080/api/orders/1001.json
\`\`\`

**Question :** quel **outil en ligne de commande** récupère cette ressource JSON ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** récupère \`1001.json\` — ta commande. Observe sa structure pour la suite.`,
        tags: ["idor", "curl", "recon"],
      },
      {
        id: "prat-idor-t2",
        title: "Comprendre la structure",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔎 L'identifiant

Regarde le JSON renvoyé.

**Question :** quel **champ JSON** identifie chaque commande de façon unique et séquentielle ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "id",
        caseSensitive: false,
        explanation: `Le champ **\`id\`** (1001, 1002, …) est séquentiel et prévisible : deviner les voisins est trivial.`,
        tags: ["idor", "structure"],
      },
      {
        id: "prat-idor-t3",
        title: "Incrémenter l'identifiant",
        order: 3,
        difficulty: "hard",
        type: "text",
        prompt: `## 🔀 Regarder ailleurs

\`\`\`bash
curl http://target:8080/api/orders/1002.json
\`\`\`

**Question :** colle le **flag** trouvé dans la note de cette commande.`,
        points: 300,
        timeLimitSec: 500,
        hints: [
          { text: "Rien n'indique que les numéros de commande s'arrêtent à 1001 — essaie le suivant.", cost: 25 },
        ],
        answer: "CYBERACE{idor_objet_reference_directe}",
        caseSensitive: true,
        explanation: `\`1002.json\` est servie sans contrôle → sa note contient \`CYBERACE{idor_objet_reference_directe}\`. Tu as lu la commande d'un autre en changeant un chiffre.`,
        tags: ["idor", "flag"],
      },
      {
        id: "prat-idor-t4",
        title: "Nommer la faille",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Nommer la faille

**Question :** comment appelle-t-on cette vulnérabilité, où modifier un identifiant dans une URL donne accès aux données d'un autre utilisateur ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "IDOR",
        accept: ["insecure direct object reference", "reference directe non securisee a un objet"],
        caseSensitive: false,
        explanation: `C'est une **IDOR** (*Insecure Direct Object Reference*) : une référence directe à un objet, exposée sans contrôle d'autorisation.`,
        tags: ["idor", "vocabulaire"],
      },
      {
        id: "prat-idor-t5",
        title: "Pourquoi c'est risqué",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Pourquoi c'est vulnérable

**Question :** pourquoi cette API est-elle vulnérable ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Aucune vérification n'est faite pour s'assurer que l'utilisateur a le droit de consulter CETTE commande précise",
          "Le format JSON est intrinsèquement non sécurisé",
          "Les numéros de commande sont trop courts",
          "Le port 8080 n'est jamais protégé",
        ],
        answer: 0,
        explanation: `Le serveur sert la ressource demandée **sans vérifier l'autorisation** du demandeur. Le format et le port n'y sont pour rien.`,
        tags: ["idor", "analyse"],
      },
      {
        id: "prat-idor-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Corriger à la racine

**Question :** quelle correction règle ce problème à la racine ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Vérifier systématiquement côté serveur que l'utilisateur authentifié est bien le propriétaire de la ressource demandée, quel que soit l'identifiant fourni",
          "Utiliser des UUID aléatoires à la place des identifiants séquentiels, sans rien vérifier d'autre",
          "Chiffrer uniquement le champ 'note'",
          "Bloquer les requêtes contenant le chiffre 2",
        ],
        answer: 0,
        explanation: `La correction est un **contrôle d'autorisation** côté serveur : le demandeur est-il propriétaire de cette ressource ? C'est ça, et non l'obscurité de l'identifiant, qui protège.`,
        tags: ["idor", "contre-mesure"],
      },
      {
        id: "prat-idor-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** pourquoi la contre-mesure « UUID aléatoires seuls » de la tâche 6 est-elle listée comme insuffisante ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Elle rend la devinette plus difficile mais ne vérifie toujours pas l'autorisation — un UUID intercepté ou deviné resterait exploitable",
          "Les UUID sont techniquement impossibles à générer",
          "Elle est en réalité la meilleure solution possible",
          "Elle ralentit trop les performances du serveur",
        ],
        answer: 0,
        explanation: `Un UUID complique la **devinette** mais ne **vérifie** rien : intercepté (logs, référent, partage) ou deviné, il reste exploitable. Seul le **contrôle d'autorisation** ferme la faille.`,
        tags: ["idor", "synthese"],
      },
    ],
  },
];
