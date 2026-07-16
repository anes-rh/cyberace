import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 35 : Redis exposé sans authentification. Lab Docker réel. */
export const module35RedisNoauth: CourseSeed[] = [
  {
    slug: "prat-redis-noauth",
    title: "Redis sans authentification",
    checkpoint: "prat-services-exposes",
    codename: "Silent Cache",
    domain: "Services réseau exposés",
    theme: "grid",
    icon: "Database",
    accent: "#C44F7D",
    order: 35,
    difficulty: "medium",
    summary:
      "Redis, par conception, ne demande aucune authentification à moins qu'on ne l'active explicitement. Un port ouvert suffit : qui atteint le 6379 lit et écrit tout ce qu'il veut.",
    objectives: [
      "Repérer un port Redis ouvert avec nmap",
      "Se connecter sans identifiants avec redis-cli",
      "Lister les clés puis lire une valeur",
      "Comprendre le risque d'un Redis exposé",
      "Sécuriser (requirepass, bind, pare-feu)",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module35-redis-noauth:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🗄️ Redis sans authentification — Silent Cache

Nouveau sous-thème&nbsp;: les **services réseau exposés**. **Redis**, par conception, ne demande **aucune authentification** tant qu'on ne l'active pas. Un **port ouvert** suffit. 🏎️

---

## 🧭 Le briefing

> Redis ne demande aucune authentification à moins qu'on ne l'active explicitement. Un port ouvert suffit.

\`redis-tools\` est désormais dans \`attacker-base\`. La cible expose Redis sur **6379**.

---

## 1. Repérer le service 🔍

\`\`\`bash
nmap -p 6379 target
\`\`\`

Le port **6379/tcp open** confirme un Redis joignable.

---

## 2. Se connecter, sans mot de passe 🔓

\`\`\`bash
redis-cli -h target PING
# → PONG
\`\`\`

**\`PING\`** répond \`PONG\`&nbsp;: tu es connecté, **sans le moindre identifiant**.

---

## 3. Lire les données 🎯

\`\`\`bash
redis-cli -h target KEYS '*'      # liste toutes les clés
redis-cli -h target GET flag      # lit la valeur de 'flag'
\`\`\`

Accès **complet** en lecture (et écriture)&nbsp;: la clé \`flag\` livre son contenu.

---

## 4. Le risque & la parade 🛡️

- **Risque** : Redis sans \`requirepass\` = **accès total** (lecture/écriture, voire RCE via des techniques avancées) à quiconque atteint le port.
- **Parade** : configurer **\`requirepass\`**, **lier** Redis à \`127.0.0.1\` si l'accès distant est inutile, et le placer **derrière un pare-feu**.

---

## 🧠 À retenir

- Redis **n'exige rien** par défaut : port ouvert = accès complet.
- **\`redis-cli -h <hôte>\`** cible un Redis distant ; \`PING\`/\`KEYS\`/\`GET\` suffisent.
- Parade : **\`requirepass\`** + **bind 127.0.0.1** + **pare-feu**.
- Principe : un service pensé pour un **usage interne de confiance** devient dangereux dès qu'il est **exposé**.`,
    badge: {
      id: "badge-prat-redis",
      name: "Lecteur de Cache",
      icon: "Database",
      description: "A lu directement dans une base de données censée rester interne.",
    },
    challenges: [
      {
        id: "prat-redis-t1",
        title: "Repérage",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔍 Repérer Redis

Démarre le lab. Vérifie le port Redis :

\`\`\`bash
nmap -p 6379 target
\`\`\`

**Question :** quel **outil** scanne les ports d'un hôte ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "nmap",
        caseSensitive: false,
        explanation: `**\`nmap -p 6379 target\`** confirme que Redis écoute (6379/tcp open).`,
        tags: ["redis", "nmap", "recon"],
      },
      {
        id: "prat-redis-t2",
        title: "Se connecter sans identifiants",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔓 Connexion sans mot de passe

\`\`\`bash
redis-cli -h target PING
\`\`\`

**Question :** quelle **commande Redis** confirme simplement qu'on est bien connecté au serveur ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "PING",
        accept: ["ping"],
        caseSensitive: false,
        explanation: `**\`PING\`** → \`PONG\` : connexion établie, sans aucun identifiant demandé.`,
        tags: ["redis", "redis-cli"],
      },
      {
        id: "prat-redis-t3",
        title: "Lister les clés",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🗝️ Lister les clés

\`\`\`bash
redis-cli -h target KEYS '*'
\`\`\`

**Question :** quelle **commande Redis** liste toutes les clés existantes ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "KEYS *",
        accept: ["keys"],
        caseSensitive: false,
        explanation: `**\`KEYS '*'\`** énumère toutes les clés — dont \`flag\`.`,
        tags: ["redis", "keys"],
      },
      {
        id: "prat-redis-t4",
        title: "Récupérer le flag",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Lire le flag

\`\`\`bash
redis-cli -h target GET flag
\`\`\`

**Question :** colle le **flag** obtenu.`,
        points: 300,
        timeLimitSec: 500,
        hints: [
          { text: "N'oublie pas -h target pour cibler l'hôte distant (sinon redis-cli tente localhost).", cost: 20 },
          { text: "Commande complète : redis-cli -h target GET flag", cost: 35 },
        ],
        answer: "CYBERACE{redis_sans_authentification}",
        caseSensitive: true,
        explanation: `\`GET flag\` renvoie \`CYBERACE{redis_sans_authentification}\` — lu directement dans une base censée rester interne.`,
        tags: ["redis", "flag"],
      },
      {
        id: "prat-redis-t5",
        title: "Comprendre le risque",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Le risque

**Question :** pourquoi ce service est-il particulièrement risqué une fois exposé ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Redis n'exige par défaut aucune authentification — quiconque atteint le port a un accès complet en lecture/écriture",
          "Redis chiffre toujours ses données au repos",
          "Redis nécessite obligatoirement un compte utilisateur",
          "Redis n'accepte que des connexions locales par défaut, quoi qu'il arrive",
        ],
        answer: 0,
        explanation: `Sans \`requirepass\`, atteindre le port = **accès complet** en lecture/écriture. Redis ne chiffre pas et n'impose aucun compte par défaut.`,
        tags: ["redis", "risque"],
      },
      {
        id: "prat-redis-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Sécuriser

**Question :** quelle mesure sécurise correctement ce service ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Configurer `requirepass`, lier Redis à 127.0.0.1 si un accès distant n'est pas nécessaire, et le placer derrière un pare-feu",
          "Renommer la clé 'flag' en quelque chose de moins évident",
          "Changer le port par défaut uniquement",
          "Redémarrer le service régulièrement",
        ],
        answer: 0,
        explanation: `**\`requirepass\`** + **bind 127.0.0.1** + **pare-feu**. Renommer la clé ou changer le port n'est que de l'obscurité, sans protection réelle.`,
        tags: ["redis", "contre-mesure"],
      },
      {
        id: "prat-redis-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** quel principe général ce module illustre-t-il ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Un service pensé pour un usage interne de confiance devient dangereux dès qu'il est accessible depuis l'extérieur de ce contexte de confiance",
          "Tous les services de base de données sont vulnérables par nature",
          "Seul Redis présente ce type de risque",
          "Ce risque ne concerne que les environnements de développement",
        ],
        answer: 0,
        explanation: `Un service « interne de confiance » (Redis, Memcached, bases…) devient un risque majeur dès qu'il **sort** de ce contexte de confiance sans cloisonnement.`,
        tags: ["redis", "synthese"],
      },
    ],
  },
];
