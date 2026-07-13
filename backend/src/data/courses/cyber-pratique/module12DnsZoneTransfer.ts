import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 12 : transfert de zone DNS (AXFR) non restreint. Lab Docker réel. */
export const module12DnsZoneTransfer: CourseSeed[] = [
  {
    slug: "prat-dns-zone-transfer",
    title: "Transfert de zone DNS : copier tout l'annuaire interne",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Transfer",
    domain: "Reconnaissance DNS",
    theme: "grid",
    icon: "Database",
    accent: "#3F7FBF",
    order: 12,
    difficulty: "medium",
    summary:
      "Douzième lab réel : un serveur DNS interne autorise le transfert de zone (AXFR) à n'importe qui. En une seule requête, tu récupères la carte complète des noms d'hôtes de l'organisation — y compris un hôte « secret-vault » jamais publié ailleurs, et un enregistrement TXT contenant un flag.",
    objectives: [
      "Interroger un serveur DNS avec dig",
      "Comprendre et déclencher un transfert de zone (AXFR)",
      "Lire une zone complète et repérer les hôtes non publiés",
      "Extraire un enregistrement TXT sensible",
      "Connaître la contre-mesure (allow-transfer restreint)",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module12-dns-axfr:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🗃️ Transfert de zone DNS — Silent Transfer

Le **DNS** traduit les noms en adresses. Entre serveurs, il existe un mécanisme pour **copier une zone entière** d'un serveur maître vers ses secondaires : le **transfert de zone (AXFR)**. S'il est ouvert à **tout le monde**, il livre à un attaquant **la carte complète** des noms internes. 🏎️

---

## 🧭 Le briefing

> On te signale un **nom de domaine interne**, **\`cyberace.lab\`**, hébergé sur le serveur **\`target\`**. Vois ce que tu peux en **extraire**.

**Comment jouer :** « Démarrer le lab », terminal (attaquant). Le serveur DNS est \`target\`.

---

## 1. Interroger un serveur DNS avec dig 🔎

**\`dig\`** (paquet *dnsutils*) est l'outil de référence pour interroger un serveur DNS. On lui indique le serveur avec **\`@\`** :

\`\`\`bash
dig @target www.cyberace.lab          # resout un nom precis via le serveur target
\`\`\`

Une résolution simple ne renvoie **qu'un** enregistrement. Mais il existe une requête bien plus généreuse…

---

## 2. Le transfert de zone (AXFR) 📦

Un domaine est géré par un serveur **maître** (*master*) et, souvent, des serveurs **secondaires** (*slaves*) qui en gardent une copie. Pour synchroniser cette copie, le secondaire demande au maître un **transfert de zone**, de type **AXFR** (*Asynchronous Full Transfer Zone*) : le maître envoie **tous** les enregistrements de la zone d'un coup.

\`\`\`bash
dig axfr cyberace.lab @target
#   │                  └── le serveur DNS interroge
#   └── axfr : demande la ZONE COMPLETE (pas juste un nom)
\`\`\`

**Normalement**, un serveur ne doit accepter un AXFR **que** de ses secondaires **légitimes** (liste blanche). Ici, la configuration contient **\`allow-transfer { any; }\`** → **n'importe qui** peut demander la zone entière. C'est la faille.

---

## 3. Ce que révèle la zone 🗺️

Le transfert renvoie **tous** les enregistrements :
- **SOA** : l'enregistrement d'autorité de la zone.
- **NS** : le(s) serveur(s) de noms (\`ns1\`).
- **A** : les correspondances nom → IP (\`ns1\`, \`www\`, et… **\`secret-vault\`**).
- **TXT** : des enregistrements texte — dont un **\`flag\`** ici.

L'hôte **\`secret-vault\`** n'était **mentionné nulle part ailleurs** : aucune page, aucun lien. Le transfert de zone l'**expose d'un coup**, avec toute la **cartographie interne**. C'est précisément ce qui rend un AXFR ouvert si précieux pour un attaquant : il obtient **la liste complète des cibles** en une requête.

> 🧠 Note : \`dig axfr\` affiche l'enregistrement **SOA deux fois** (au début et à la fin du transfert) — c'est normal, on ne le compte qu'**une** fois pour dénombrer les enregistrements **distincts**.

---

## 4. La contre-mesure 🛡️

La parade est simple et vue en **sécurité réseau** : **restreindre le transfert de zone** aux **seuls secondaires autorisés**, via la directive **\`allow-transfer\`** limitée à leurs IP (au lieu de \`any\`) :

\`\`\`
   allow-transfer { 192.0.2.53; };   // uniquement le secondaire legitime
\`\`\`

Idéalement, on ajoute **TSIG** (signature des transferts) pour authentifier les secondaires. Le transfert de zone à \`any\` est une **misconfiguration classique** à bannir.

---

## 🎯 Ta mission (résumé)

1. Résous un nom avec \`dig @target\`.
2. Déclenche l'**AXFR** (\`dig axfr cyberace.lab @target\`).
3. Compte les enregistrements, repère l'**hôte caché** et le **flag** TXT.

## 🧠 À retenir

- **\`dig @serveur nom\`** interroge un serveur DNS ; **\`dig axfr zone @serveur\`** demande la **zone complète** (transfert **AXFR**).
- Un **AXFR** doit être **restreint aux secondaires légitimes**. Ici **\`allow-transfer { any; }\`** l'ouvre à tous → fuite de **toute la cartographie DNS interne**.
- La zone révèle SOA, NS, les **A** (dont **\`secret-vault\`**, jamais publié ailleurs) et un **TXT** contenant le flag. Le **SOA apparaît 2 fois** (début/fin) mais ne compte qu'une fois.
- **Danger** : un attaquant obtient **d'un coup** la liste de tous les hôtes internes (cibles). **Contre-mesure** : **\`allow-transfer\`** limité aux IP des secondaires (+ **TSIG**).`,
    badge: {
      id: "badge-prat-dns",
      name: "Copiste de Zone",
      icon: "Database",
      description: "A obtenu une copie complète d'une zone DNS qui n'aurait jamais dû sortir.",
    },
    challenges: [
      {
        id: "prat-dns-t1",
        title: "Résolution simple",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔎 Interroger le DNS

Démarre le lab et interroge le serveur DNS \`target\` pour un nom de la zone :

\`\`\`bash
dig @target www.cyberace.lab
\`\`\`

**Question :** quel **outil** en ligne de commande interroge un serveur DNS ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "dig",
        accept: ["nslookup", "dig @target www.cyberace.lab", "host"],
        caseSensitive: false,
        explanation: `**\`dig\`** (Domain Information Groper) interroge un serveur DNS ; \`@target\` précise **quel** serveur questionner. Une résolution simple ne donne qu'un enregistrement — la suite consiste à demander la **zone entière**.`,
        tags: ["dns", "dig", "resolution"],
      },
      {
        id: "prat-dns-t2",
        title: "Tenter un transfert de zone",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 📦 Demander toute la zone

Tente un **transfert de zone** — normalement réservé aux serveurs secondaires :

\`\`\`bash
dig axfr cyberace.lab @target
\`\`\`

Le serveur accepte (mauvaise config) et déverse **tous** les enregistrements.

**Question :** quel **type de requête DNS** (indiqué après \`dig\`) demande une **copie complète** d'une zone ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: "axfr",
        accept: ["AXFR"],
        caseSensitive: true,
        explanation: `**\`axfr\`** (*Asynchronous Full Transfer Zone*) demande la **zone entière** au serveur maître. C'est fait pour synchroniser les secondaires — mais ici, ouvert à \`any\`, il livre tout à n'importe qui. Contrairement à une résolution ciblée, l'AXFR renvoie **l'annuaire complet**.`,
        tags: ["dns", "axfr", "transfert"],
      },
      {
        id: "prat-dns-t3",
        title: "Compter les enregistrements",
        order: 3,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔢 Combien d'enregistrements ?

Regarde la sortie complète de l'AXFR.

**Question :** en comptant tous les enregistrements retournés (SOA, NS, A, TXT confondus, **sans** compter la ligne SOA affichée **deux fois** en fin de transfert), combien d'enregistrements **distincts** la zone contient-elle ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [
          { text: "SOA, NS, 3× A (ns1, www, secret-vault), 1× TXT — relis la sortie complète de dig et ne compte le SOA qu'une fois.", cost: 20 },
        ],
        answer: 5,
        explanation: `La zone contient **5** enregistrements distincts : **SOA**, **NS**, trois **A** (\`ns1\`, \`www\`, \`secret-vault\`) et un **TXT** (le flag). \`dig axfr\` affiche le SOA au début **et** à la fin — mais c'est le **même**, compté une seule fois.`,
        tags: ["dns", "axfr", "enregistrements"],
      },
      {
        id: "prat-dns-t4",
        title: "Repérer l'hôte caché",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🕳️ L'hôte jamais publié

Parmi les enregistrements A, l'un pointe vers un hôte au nom évocateur, **jamais mentionné ailleurs**.

**Question :** quel **nom d'hôte**, jamais mentionné ailleurs, apparaît dans le transfert de zone ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "secret-vault",
        accept: ["secret-vault.cyberace.lab"],
        caseSensitive: false,
        explanation: `**\`secret-vault\`** apparaît dans la zone (enregistrement A) — un hôte au nom sensible que **rien** n'annonçait publiquement. C'est exactement l'intérêt d'un AXFR pour un attaquant : **révéler les cibles cachées** de l'infrastructure interne.`,
        tags: ["dns", "secret-vault", "hote-cache"],
      },
      {
        id: "prat-dns-t5",
        title: "Récupérer le flag",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Le flag TXT

La zone contient un enregistrement **TXT** au nom \`flag\`.

**Question :** quel enregistrement **TXT** de la zone contient un flag ? *(colle sa valeur)*`,
        points: 250,
        timeLimitSec: 500,
        hints: [],
        answer: "CYBERACE{transfert_de_zone_jamais_autorise}",
        caseSensitive: true,
        explanation: `L'enregistrement \`flag IN TXT\` contient **\`CYBERACE{transfert_de_zone_jamais_autorise}\`**, révélé par le transfert de zone. Sans l'AXFR ouvert, jamais tu n'aurais vu ce TXT ni l'hôte \`secret-vault\` — d'où la gravité de la faille.`,
        tags: ["dns", "txt", "flag"],
      },
      {
        id: "prat-dns-t6",
        title: "Pourquoi c'est grave",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚠️ L'intérêt pour l'attaquant

**Question :** en quoi un transfert de zone **non restreint** est-il particulièrement utile à un attaquant ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Il révèle d'un coup toute la cartographie interne des noms d'hôtes d'une organisation, y compris ceux jamais publiés ailleurs",
          "Il permet de modifier directement les enregistrements DNS",
          "Il donne un accès root au serveur DNS",
          "Il chiffre automatiquement le trafic réseau",
        ],
        answer: 0,
        explanation: `Un AXFR ouvert livre **toute la cartographie DNS interne** en une requête : chaque nom d'hôte, y compris les **cachés** (\`secret-vault\`). L'attaquant obtient sa **liste de cibles** sans effort. Il ne modifie rien (lecture seule), ne devient pas root, et ne chiffre rien.`,
        tags: ["dns", "cartographie", "reconnaissance"],
      },
      {
        id: "prat-dns-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "easy",
        type: "text",
        prompt: `## 🛡️ La bonne config

**Question :** quelle **directive de configuration BIND**, ici trop permissive (\`any\`), doit être **restreinte** aux seuls serveurs secondaires légitimes ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "allow-transfer",
        accept: ["allow-transfer any", "allow-transfer { any; }", "allow transfer"],
        caseSensitive: false,
        explanation: `La directive **\`allow-transfer\`** contrôle qui peut demander un AXFR. Ici elle vaut **\`{ any; }\`** (tout le monde) ; il faut la **restreindre aux IP des secondaires** légitimes (voire ajouter **TSIG**). C'est la parade directe à cette fuite.`,
        tags: ["dns", "allow-transfer", "contre-mesure"],
      },
    ],
  },
];
