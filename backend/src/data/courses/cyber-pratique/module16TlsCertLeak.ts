import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 16 : fuite d'un sous-domaine via SAN de certificat TLS. Lab Docker réel. */
export const module16TlsCertLeak: CourseSeed[] = [
  {
    slug: "prat-tls-cert-enum",
    title: "Fuite via certificat TLS : le SAN qui trahit",
    checkpoint: "prat-recon-reseau",
    codename: "Silent Cert",
    domain: "Reconnaissance TLS",
    theme: "grid",
    icon: "ShieldCheck",
    accent: "#5EA6A6",
    order: 16,
    difficulty: "medium",
    summary:
      "Seizième lab réel : un service HTTPS présente un certificat TLS. Un certificat doit lister explicitement chaque nom qu'il couvre — et cette liste (SAN) est visible par quiconque l'inspecte. Elle révèle ici un sous-domaine interne « api-interne-v2 » jamais publié, qui sert le flag.",
    objectives: [
      "Interroger un service HTTPS avec un certificat autosigné (curl -k)",
      "Inspecter le contenu d'un certificat X.509 (openssl x509 -text)",
      "Lire le Common Name et surtout la liste Subject Alternative Name (SAN)",
      "Repérer un sous-domaine interne exposé dans le SAN et y accéder",
      "Comprendre le lien avec le Module 11 (autre source d'indices de noms cachés)",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module16-tls-cert-leak:latest",
      ttlSec: 1000,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🔐 Fuite via certificat TLS — Silent Cert

Le **Module 11** t'a appris à **deviner** des noms de vhosts par fuzzing. Ce module montre une **autre source d'indices**, souvent négligée : le **certificat TLS lui-même**. Un certificat doit **lister** tous les noms qu'il couvre — et cette liste est **publique** pour quiconque se connecte. 🏎️

---

## 🧭 Le briefing

> Un service **HTTPS** tourne sur **\`target:8443\`**. Un certificat **ne ment jamais** sur ce qu'il couvre — il doit **lister explicitement** chaque nom qu'il sert. Regarde ce qu'il révèle.

**Comment jouer :** « Démarrer le lab », terminal (attaquant). Le service HTTPS est sur \`target:8443\`.

---

## 1. Premier contact HTTPS (certificat autosigné) 🔒

Le service utilise un certificat **autosigné** (pas émis par une autorité reconnue). \`curl\` refuse par défaut de s'y connecter (échec de vérification). L'option **\`-k\`** (*insecure*) ignore cette vérification :

\`\`\`bash
curl -k https://target:8443/           # -k : accepte le certificat non verifie
\`\`\`

Le portail public s'affiche. Mais le **certificat** lui-même contient bien plus d'informations…

---

## 2. Anatomie d'un certificat X.509 📜

Un certificat TLS (**X.509**) prouve l'identité d'un serveur. Il contient notamment :
- Le **Common Name (CN)** : le nom principal (ex. \`portail.cyberace.internal\`).
- Le **Subject Alternative Name (SAN)** : la **liste de TOUS les noms** que le certificat couvre. C'est le champ **décisif** aujourd'hui — un navigateur valide un certificat sur un site **uniquement** si ce nom figure dans le **SAN**.

Pour qu'un certificat soit **valide** sur plusieurs noms (\`portail…\`, \`api…\`, …), **chacun** doit être **écrit** dans le SAN. Et ce SAN est **envoyé en clair** lors de la poignée de main TLS → **quiconque** inspecte le certificat le lit.

### Inspecter le certificat avec openssl

\`\`\`bash
openssl s_client -connect target:8443 -servername portail.cyberace.internal </dev/null 2>/dev/null \\
  | openssl x509 -noout -text
\`\`\`

- \`s_client -connect\` : récupère le certificat présenté par le serveur.
- \`x509 -noout -text\` : **affiche le contenu détaillé** du certificat (dont les **extensions**, donc le SAN).

Cherche la section :
\`\`\`
   X509v3 Subject Alternative Name:
       DNS:portail.cyberace.internal, DNS:api-interne-v2.cyberace.internal, DNS:cyberace.internal
\`\`\`

---

## 3. Le nom qui trahit 🕵️

Dans ce SAN, à côté du \`portail…\` public, apparaît **\`api-interne-v2.cyberace.internal\`** — un nom qui ne correspond à **aucune page publiquement connue**. Le certificat vient de **révéler** un service interne que rien d'autre n'annonçait. On l'atteint comme au Module 11, en fixant l'en-tête \`Host\` :

\`\`\`bash
curl -k -H "Host: api-interne-v2.cyberace.internal" https://target:8443/
\`\`\`

→ le vhost interne répond, et livre le **flag**.

> 🧭 Pourquoi un certificat « fuite » ainsi ? Parce qu'il **doit** lister tous ses noms pour être valide sur chacun — et cette liste est **publique par conception** (elle voyage dans la poignée de main TLS, et les **Certificate Transparency logs** publient même les certificats émis publiquement). Regrouper des noms **internes/sensibles** avec des noms **publics** dans le même certificat, c'est les **exposer**.

---

## 4. La contre-mesure 🛡️

- **Séparer** les certificats : ne **pas** mettre des noms d'hôtes **internes/sensibles** dans le **même** certificat que des services **publics**. Utiliser des certificats **distincts** (voire une PKI interne dédiée pour l'interne).
- Éviter les **wildcards** trop larges et les SAN « fourre-tout ».
- Se rappeler que **tout** nom mis dans un certificat public est **découvrable** (SAN + Certificate Transparency).

> 🧠 Ni l'autosignature, ni le renouvellement fréquent, ni désactiver TLS ne règlent le problème — c'est le **regroupement** de noms sensibles et publics dans un même certificat qui fuit.

---

## 🎯 Ta mission (résumé)

1. \`curl -k https://target:8443/\` (contact HTTPS).
2. **Inspecte** le certificat (\`openssl … x509 -noout -text\`), lis le **SAN**.
3. Repère \`api-interne-v2…\`, atteins-le via \`Host\` → **flag**.

## 🧠 À retenir

- Un certificat **autosigné** fait échouer la vérification → \`curl -k\` (*insecure*) l'accepte.
- Un certificat **X.509** contient le **CN** (nom principal) et surtout le **SAN** (*Subject Alternative Name*) : la **liste de TOUS les noms** couverts. Inspection : \`openssl s_client -connect host:port | openssl x509 -noout -text\`.
- Le **SAN est public** (envoyé dans la poignée de main TLS, et dans les **Certificate Transparency logs**) → il **révèle** les noms internes qui y figurent (ici **\`api-interne-v2.cyberace.internal\`**), jamais publiés ailleurs.
- On atteint le service interne en fixant \`Host\` (comme au **Module 11**) : \`curl -k -H "Host: api-interne-v2…" https://target:8443/\`.
- **Contre-mesure** : **ne pas regrouper** noms internes/sensibles et publics dans le même certificat ; certificats **séparés**. Tout nom dans un certificat public est **découvrable**.
- **Lien Module 11** : le certificat est une **autre source d'indices** sur des noms cachés, au-delà du simple fuzzing.`,
    badge: {
      id: "badge-prat-tlscert",
      name: "Lecteur de Certificats",
      icon: "ShieldCheck",
      description: "A trouvé un sous-domaine caché dans la liste SAN d'un certificat.",
    },
    challenges: [
      {
        id: "prat-tlscert-t1",
        title: "Premier contact HTTPS",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔒 Se connecter en HTTPS

Le service utilise un certificat autosigné. Connecte-toi en ignorant la vérification :

\`\`\`bash
curl -k https://target:8443/
\`\`\`

**Question :** quelle **option curl** ignore l'échec de vérification d'un certificat non reconnu (autosigné) ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "-k",
        accept: ["--insecure", "k"],
        caseSensitive: false,
        explanation: `L'option **\`-k\`** (\`--insecure\`) dit à curl d'**accepter** un certificat qu'il ne peut pas vérifier (autosigné). Utile pour tester un service interne — mais le certificat, lui, contient des infos précieuses qu'on va inspecter.`,
        tags: ["tls", "curl", "insecure"],
      },
      {
        id: "prat-tlscert-t2",
        title: "Inspecter le certificat",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 📜 Ouvrir le certificat

Récupère et affiche le contenu détaillé du certificat :

\`\`\`bash
openssl s_client -connect target:8443 -servername portail.cyberace.internal </dev/null 2>/dev/null | openssl x509 -noout -text
\`\`\`

**Question :** quelle **sous-commande openssl** affiche le contenu détaillé (dont les extensions) d'un certificat X.509 ?`,
        points: 150,
        timeLimitSec: 450,
        hints: [],
        answer: "x509 -noout -text",
        accept: ["openssl x509 -noout -text", "x509 -text"],
        caseSensitive: false,
        explanation: `**\`openssl x509 -noout -text\`** décode et affiche **tout** le certificat en clair, y compris les **extensions** X509v3 — dont le **SAN**. \`-noout\` évite de ré-afficher le certificat encodé, \`-text\` demande la version lisible.`,
        tags: ["tls", "openssl", "x509"],
      },
      {
        id: "prat-tlscert-t3",
        title: "Le nom principal",
        order: 3,
        difficulty: "easy",
        type: "text",
        prompt: `## 🏷️ Le CN

Dans la sortie du certificat, repère le **Subject** / **Common Name**.

**Question :** quel est le **Common Name (CN)** principal du certificat ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "portail.cyberace.internal",
        accept: ["CN=portail.cyberace.internal", "portail"],
        caseSensitive: false,
        explanation: `Le **CN** est **\`portail.cyberace.internal\`** — le nom principal du certificat. Mais le CN seul ne fait plus foi aujourd'hui : c'est le **SAN** (liste complète) qui compte, et c'est là que se cache l'info intéressante.`,
        tags: ["tls", "cn", "certificat"],
      },
      {
        id: "prat-tlscert-t4",
        title: "Le nom caché",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🕵️ Le SAN qui trahit

Repère la section **Subject Alternative Name** du certificat. Elle liste plusieurs noms — dont un qui ne correspond à **aucune page publiquement connue**.

**Question :** dans la section Subject Alternative Name, quel **autre nom d'hôte** ne correspond à aucune page publiquement connue ?`,
        points: 250,
        timeLimitSec: 600,
        hints: [
          { text: "La section commence par « X509v3 Subject Alternative Name: » et liste des « DNS:... ». Écarte portail (public) et cyberace.internal (le domaine) ; il reste un nom d'API interne.", cost: 25 },
        ],
        answer: "api-interne-v2.cyberace.internal",
        accept: ["api-interne-v2"],
        caseSensitive: false,
        explanation: `Le SAN liste \`portail.cyberace.internal\`, **\`api-interne-v2.cyberace.internal\`** et \`cyberace.internal\`. Le nom **\`api-interne-v2\`** — un service interne — n'était annoncé nulle part ailleurs : le certificat vient de le **révéler**. C'est la fuite du module.`,
        tags: ["tls", "san", "sous-domaine"],
      },
      {
        id: "prat-tlscert-t5",
        title: "Pourquoi un certificat fuite",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔓 La cause

**Question :** pourquoi la liste **SAN** d'un certificat peut-elle révéler des noms d'hôtes internes jamais publiés ailleurs ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Un certificat doit lister explicitement TOUS les noms qu'il couvre pour être valide sur chacun — cette liste complète est visible par quiconque l'inspecte",
          "Les certificats chiffrent leur propre contenu, sauf le CN",
          "openssl déchiffre automatiquement les noms cachés",
          "C'est une fonctionnalité de débogage activée par erreur",
        ],
        answer: 0,
        explanation: `Un certificat n'est **valide** sur un nom que si ce nom figure dans son **SAN** → il **doit** tous les lister. Or cette liste voyage **en clair** dans la poignée de main TLS (et dans les Certificate Transparency logs pour les certificats publics) : **quiconque** l'inspecte la lit. Le certificat ne chiffre pas son propre contenu ; openssl ne « déchiffre » rien de caché.`,
        tags: ["tls", "san", "transparence"],
      },
      {
        id: "prat-tlscert-t6",
        title: "Récupérer le flag",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Le service interne (flag)

Atteins le vhost interne révélé par le SAN, en fixant l'en-tête Host (comme au Module 11) :

\`\`\`bash
curl -k -H "Host: api-interne-v2.cyberace.internal" https://target:8443/
\`\`\`

**Question :** colle le **flag** renvoyé.`,
        points: 250,
        timeLimitSec: 500,
        hints: [],
        answer: "CYBERACE{cert_san_expose_sous_domaine_cache}",
        caseSensitive: true,
        explanation: `En fixant \`Host: api-interne-v2.cyberace.internal\`, nginx sert le vhost interne → \`CYBERACE{cert_san_expose_sous_domaine_cache}\`. Le certificat t'a donné le nom, l'en-tête \`Host\` t'a donné l'accès : deux techniques (M16 + M11) combinées.`,
        tags: ["tls", "flag", "host"],
      },
      {
        id: "prat-tlscert-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Réduire la fuite

**Question :** quelle **pratique** réduit ce risque de fuite via certificat ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Éviter de regrouper des noms d'hôtes internes/sensibles dans le même certificat que des services publics",
          "Toujours utiliser des certificats auto-signés",
          "Désactiver TLS sur les services internes",
          "Renouveler le certificat toutes les semaines",
        ],
        answer: 0,
        explanation: `La parade : **ne pas mélanger** noms **internes/sensibles** et **publics** dans un même certificat → utiliser des certificats **séparés** (voire une PKI interne dédiée). L'autosignature, désactiver TLS, ou renouveler souvent ne changent rien au fait que le SAN **liste et expose** tous ses noms.`,
        tags: ["tls", "san", "contre-mesure"],
      },
      {
        id: "prat-tlscert-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Lien avec le Module 11

**Question :** en quoi ce module **complète-t-il** le Module 11 (vhost caché) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Il montre une AUTRE source d'indices sur des noms d'hôtes cachés (le certificat lui-même), au-delà du simple fuzzing de noms",
          "Il utilise exactement la même technique sans rien ajouter",
          "Il remplace complètement la technique du Module 11",
          "Il ne concerne que les certificats expirés",
        ],
        answer: 0,
        explanation: `Le Module 11 **devinait** les noms de vhosts par **fuzzing** ; ici, le **certificat TLS** les **révèle directement** via son SAN — une **autre source d'indices**, plus fiable. Les deux se **complètent** (deviner vs lire), et l'accès final réutilise la même astuce (\`Host\`). Rien à voir avec l'expiration.`,
        tags: ["tls", "synthese", "module11"],
      },
    ],
  },
];
