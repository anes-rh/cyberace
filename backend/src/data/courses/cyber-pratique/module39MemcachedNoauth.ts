import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 39 : Memcached exposé sans authentification. Lab Docker réel. */
export const module39MemcachedNoauth: CourseSeed[] = [
  {
    slug: "prat-memcached-noauth",
    title: "Memcached sans authentification",
    checkpoint: "prat-services-exposes",
    codename: "Silent Memory",
    domain: "Services réseau exposés",
    theme: "grid",
    icon: "MemoryStick",
    accent: "#7D4FC4",
    order: 39,
    difficulty: "medium",
    summary:
      "Comme Redis au module précédent, ce service de cache ne demande jamais d'identifiants — mais ici, ce n'est même pas une option qu'on aurait pu activer. Memcached n'a AUCUNE authentification native : seul le cloisonnement réseau protège.",
    objectives: [
      "Repérer un port Memcached ouvert avec nmap",
      "Connaître la commande get du protocole texte",
      "Parler le protocole directement avec nc",
      "Récupérer une valeur du cache",
      "Comprendre la seule vraie protection (cloisonnement)",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module39-memcached-noauth:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🧠 Memcached sans authentification — Silent Memory

Le pendant du Module 35 (Redis)&nbsp;: **Memcached**, service de cache, ne demande **jamais** d'identifiants. Pire que Redis&nbsp;: il n'a **même pas** d'authentification qu'on aurait pu activer. 🏎️

---

## 🧭 Le briefing

> Comme Redis, ce service de cache ne demande jamais d'identifiants — mais ici, ce n'est même pas une option qu'on aurait pu activer.

\`ncat\` (déjà dans \`attacker-base\`) suffit à parler le protocole texte. La cible expose Memcached sur **11211**.

---

## 1. Repérer 🔍

\`\`\`bash
nmap -p 11211 target
\`\`\`

Port **11211/tcp open** → Memcached joignable.

---

## 2. Un protocole texte simple 📜

Memcached parle un **protocole texte**. Pour lire une valeur&nbsp;: **\`get <clé>\`**, terminé par \`\\r\\n\`. Réponse au format \`VALUE <clé> <flags> <longueur>\` puis la donnée.

---

## 3. Parler le protocole directement 🎯

Pas besoin de client dédié&nbsp;: **\`nc\`** envoie les octets bruts vers le port&nbsp;:

\`\`\`bash
printf "get flag\\r\\n" | nc target 11211
\`\`\`

Le serveur répond avec la ligne \`VALUE flag 0 <len>\` suivie du **flag**.

---

## 4. Le risque & la parade 🛡️

- **Différence avec Redis** : Redis propose au moins \`requirepass\`. **Memcached n'a AUCUN mécanisme d'authentification natif** à activer.
- **Seule protection efficace** : **ne jamais exposer** Memcached au-delà de \`localhost\` ou d'un **réseau interne strictement cloisonné et pare-feuré**.

---

## 🧠 À retenir

- Memcached = **aucune authentification native**, même pas en option.
- Protocole **texte** : \`get <clé>\\r\\n\` via **\`nc\`** suffit.
- **Seule** parade : **cloisonnement réseau** (localhost / VLAN / pare-feu).
- Même principe que le Module 35 : un cache « interne de confiance » devient un risque une fois exposé.`,
    badge: {
      id: "badge-prat-memcached",
      name: "Fouilleur de Mémoire Partagée",
      icon: "MemoryStick",
      description: "A lu un cache censé ne jamais quitter le réseau interne.",
    },
    challenges: [
      {
        id: "prat-memcached-t1",
        title: "Repérage",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔍 Repérer Memcached

Démarre le lab. Vérifie le port :

\`\`\`bash
nmap -p 11211 target
\`\`\`

**Question :** quel **outil** scanne les ports d'un hôte ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "nmap",
        caseSensitive: false,
        explanation: `**\`nmap -p 11211 target\`** confirme que Memcached écoute.`,
        tags: ["memcached", "nmap", "recon"],
      },
      {
        id: "prat-memcached-t2",
        title: "Comprendre le protocole",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📜 Le protocole texte

**Question :** Memcached utilise un protocole texte simple. Quelle commande de ce protocole récupère une valeur stockée ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: ["get <clé>", "SELECT <clé>", "FETCH <clé>", "READ <clé>"],
        answer: 0,
        explanation: `**\`get <clé>\`** lit une valeur. Le protocole est volontairement minimal — pas de SELECT/FETCH.`,
        tags: ["memcached", "protocole"],
      },
      {
        id: "prat-memcached-t3",
        title: "Parler le protocole directement",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 Envoyer des octets bruts

\`\`\`bash
printf "get flag\\r\\n" | nc target 11211
\`\`\`

**Question :** quel **outil** envoie des octets bruts vers un port TCP distant, utilisé ici pour parler le protocole Memcached directement ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "nc",
        accept: ["ncat", "netcat"],
        caseSensitive: false,
        explanation: `**\`nc\`** (netcat/ncat) envoie les octets bruts au port : aucun client Memcached n'est nécessaire.`,
        tags: ["memcached", "nc"],
      },
      {
        id: "prat-memcached-t4",
        title: "Récupérer le flag",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Lire le flag

\`\`\`bash
printf "get flag\\r\\n" | nc target 11211
\`\`\`

**Question :** colle le **flag** renvoyé (après la ligne \`VALUE flag 0 ...\`).`,
        points: 300,
        timeLimitSec: 500,
        hints: [
          { text: "La syntaxe exacte compte : get flag suivi de \\r\\n. Utilise printf pour émettre le retour chariot + saut de ligne.", cost: 20 },
          { text: "Commande complète : printf \"get flag\\r\\n\" | nc target 11211", cost: 35 },
        ],
        answer: "CYBERACE{memcached_sans_authentification}",
        caseSensitive: true,
        explanation: `\`get flag\` renvoie \`VALUE flag 0 <len>\` puis \`CYBERACE{memcached_sans_authentification}\` — lu sans le moindre identifiant.`,
        tags: ["memcached", "flag"],
      },
      {
        id: "prat-memcached-t5",
        title: "Comprendre le risque",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Le risque

**Question :** en quoi ce risque diffère-t-il de celui du Redis du Module 35 ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Memcached n'a, par conception, AUCUN mécanisme d'authentification natif à activer — contrairement à Redis qui propose au moins `requirepass`",
          "Memcached est en réalité toujours protégé par défaut",
          "Memcached chiffre systématiquement ses données",
          "Il n'y a aucune différence entre les deux services",
        ],
        answer: 0,
        explanation: `Redis a au moins \`requirepass\` ; **Memcached n'a aucune authentification native**. La protection ne peut donc venir que du réseau.`,
        tags: ["memcached", "risque"],
      },
      {
        id: "prat-memcached-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ La seule vraie protection

**Question :** puisqu'il n'y a pas d'authentification à activer, quelle est la seule protection réellement efficace ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Ne jamais exposer Memcached au-delà de localhost ou d'un réseau interne strictement cloisonné et pare-feuré",
          "Changer le port par défaut",
          "Renommer la clé 'flag'",
          "Redémarrer le service régulièrement",
        ],
        answer: 0,
        explanation: `Sans authentification possible, seul le **cloisonnement réseau** protège : localhost, VLAN dédié, pare-feu. Changer le port ou la clé n'est que de l'obscurité.`,
        tags: ["memcached", "contre-mesure"],
      },
      {
        id: "prat-memcached-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** quel principe relie les Modules 35 et 39 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Des services de données rapides, pensés pour un usage interne de confiance, deviennent des risques majeurs une fois exposés sans cloisonnement réseau",
          "Les deux services utilisent exactement le même protocole",
          "Les deux nécessitent obligatoirement un accès root pour être exploités",
          "Il n'y a aucun lien entre ces deux modules",
        ],
        answer: 0,
        explanation: `Redis et Memcached : des caches rapides « internes de confiance » qui deviennent des risques majeurs dès qu'ils sont **exposés** sans cloisonnement.`,
        tags: ["memcached", "synthese"],
      },
    ],
  },
];
