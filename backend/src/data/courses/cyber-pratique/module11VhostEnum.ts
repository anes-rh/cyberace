import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 11 : énumération de virtual host caché. Lab Docker réel. */
export const module11VhostEnum: CourseSeed[] = [
  {
    slug: "prat-vhost-enum",
    title: "Virtual host caché : le site qui n'existe pour personne",
    checkpoint: "prat-recon-web",
    codename: "Silent Host",
    domain: "Reconnaissance web",
    theme: "grid",
    icon: "Layers",
    accent: "#E0965E",
    order: 11,
    difficulty: "medium",
    summary:
      "Onzième lab réel : un serveur héberge plusieurs sites sur la même IP/port, différenciés par l'en-tête HTTP Host. L'un d'eux n'est lié ni indexé nulle part — mais il suffit de deviner son nom d'hôte et de le demander directement pour y accéder. L'obscurité n'est pas une protection.",
    objectives: [
      "Comprendre le virtual hosting (plusieurs sites, une IP, l'en-tête Host route)",
      "Fixer manuellement l'en-tête Host d'une requête (curl -H)",
      "Fuzzer une petite liste de noms de vhost plausibles",
      "Accéder à un vhost caché et en extraire le flag",
      "Retenir que « security through obscurity » n'est jamais une vraie protection",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module11-vhost-hidden:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🎭 Virtual host caché — Silent Host

Un même serveur web, une même IP, un même port… mais **plusieurs sites différents**. Comment ? Grâce à l'en-tête HTTP **\`Host\`**. Et si l'un de ces sites n'est **annoncé nulle part** ? Il reste accessible — il suffit de **connaître son nom**. 🏎️

---

## 🧭 Le briefing

> Le **portail par défaut** de \`target:8080\` n'affiche rien d'intéressant. Mais **un site n'a pas besoin d'être lié ou indexé pour exister** — il suffit de connaître son **nom d'hôte**. Trouve le site qui n'était censé exister pour personne.

**Comment jouer :** « Démarrer le lab », terminal (attaquant). La cible \`target\` sert du HTTP sur **8080**.

---

## 1. Le virtual hosting 🏢

Un serveur web moderne peut héberger **des dizaines de sites** sur **une seule IP** et **un seul port**. Comment les distingue-t-il ? Grâce à l'en-tête HTTP **\`Host\`**, envoyé par le client à chaque requête :

\`\`\`
   GET / HTTP/1.1
   Host: www.exemple.com      ← le serveur route selon cette valeur
\`\`\`

Le serveur regarde le \`Host:\` et sert le **vhost** (*virtual host*) correspondant. \`Host: siteA.com\` et \`Host: siteB.com\` sur la **même IP** renvoient donc des **contenus différents**.

> 🧭 Point crucial : l'en-tête \`Host\` est **choisi par le client**, indépendamment de l'IP à laquelle il se connecte réellement. Rien n'oblige à ce que le DNS résolve ce nom — on peut **fixer n'importe quel \`Host\`** à la main.

---

## 2. Fixer le Host à la main avec curl 🔧

L'option **\`-H\`** de curl ajoute (ou remplace) un en-tête. On se connecte à \`target:8080\` (résolu par l'alias Docker) tout en **prétendant** viser un autre nom :

\`\`\`bash
curl http://target:8080/                              # vhost par defaut (public)
curl -H "Host: portail-admin.cyberace.internal" http://target:8080/   # AUTRE vhost
\`\`\`

C'est **nginx** qui, en interne, route selon le \`Host\` fourni — **peu importe** comment la connexion TCP a été établie, ni qu'aucun DNS n'existe pour ce nom.

---

## 3. Deviner le nom caché (fuzzing de vhost) 🔍

Le vhost secret n'est **lié nulle part**. Mais son nom est **devinable** : les admins utilisent des noms **prévisibles** (\`admin\`, \`portail\`, \`gestion\`, \`backup\`, \`dev\`, \`test\`…). On **boucle** sur une petite liste en changeant le \`Host\` à chaque essai, et on repère la réponse **différente** :

\`\`\`bash
for h in admin portail admin-portal gestion backup dev test portail-admin; do
  echo "$h: $(curl -s -H "Host: $h.cyberace.internal" http://target:8080/)"
done
\`\`\`

Toutes les valeurs inconnues retombent sur le **vhost par défaut** (« Portail public — rien à voir ici »)… sauf **une**, qui révèle un **contenu différent**. C'est le vhost caché. *(À plus grande échelle, on utiliserait un outil dédié comme gobuster/ffuf avec une grande wordlist — ici, une boucle bash suffit.)*

---

## 4. La leçon : l'obscurité n'est pas une protection 🔓

Ce vhost n'était **protégé par rien** : ni authentification, ni restriction d'IP, ni chiffrement. Sa seule « protection » était de **ne pas être annoncé** (pas de lien, pas de DNS public). C'est du **« security through obscurity »** — et **ça n'a jamais suffi** : dès qu'on **devine** ou **découvre** le nom, l'accès est libre.

> 🧠 Une ressource sensible doit être protégée par une **mesure effective** : **authentification** (mot de passe, certificat client), **restriction d'IP**, chiffrement — **pas** par le simple fait de ne pas la documenter. Cacher n'est pas protéger.

---

## 🎯 Ta mission (résumé)

1. Comprends le virtual hosting, teste \`curl -H "Host: ..."\`.
2. **Fuzze** la liste de noms plausibles, repère la réponse différente.
3. Récupère le **flag** du vhost caché.

## 🧠 À retenir

- **Virtual hosting** : plusieurs sites sur **une IP/un port**, routés par l'en-tête HTTP **\`Host\`** (choisi par le client).
- **\`curl -H "Host: nom"\`** fixe le \`Host\` manuellement → on atteint n'importe quel vhost, **sans DNS**, quelle que soit l'IP contactée.
- Un vhost **non lié / non résolu en DNS** n'est **pas protégé** : on **devine** son nom (fuzzing d'une liste de noms prévisibles) et on y accède directement.
- **Security through obscurity** (ne pas annoncer une ressource) **n'est jamais** une vraie protection. Il faut une **authentification effective** / **restriction d'IP** / chiffrement devant la ressource sensible.`,
    badge: {
      id: "badge-prat-vhost",
      name: "Chercheur de Façades",
      icon: "Layers",
      description: "A trouvé le site qui ne devait exister pour personne.",
    },
    challenges: [
      {
        id: "prat-vhost-t1",
        title: "Portail par défaut",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🌐 Le portail public

Démarre le lab et regarde le site par défaut :

\`\`\`bash
curl http://target:8080/
\`\`\`

Rien d'intéressant. Pour explorer les autres vhosts, il faudra **changer l'en-tête Host**.

**Question :** quelle **option curl** permet de fixer manuellement l'en-tête HTTP \`Host\` d'une requête ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "-H",
        accept: ['-H "Host: ..."', "--header", "H"],
        caseSensitive: false,
        explanation: `L'option **\`-H\`** (ou \`--header\`) ajoute/remplace un en-tête HTTP : \`curl -H "Host: nom" ...\`. C'est la clé de ce module — elle permet de **prétendre** viser n'importe quel nom d'hôte, indépendamment de l'IP contactée et sans aucun DNS.`,
        tags: ["vhost", "curl", "header"],
      },
      {
        id: "prat-vhost-t2",
        title: "Comprendre le virtual hosting",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🏢 Une IP, plusieurs sites

**Question :** comment un serveur web peut-il héberger **plusieurs sites différents** sur la **même IP** et le **même port** ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: [
          "En routant chaque requête vers un site différent selon la valeur de l'en-tête HTTP Host",
          "En changeant de port toutes les 10 secondes",
          "Ce n'est techniquement pas possible",
          "En utilisant systématiquement HTTPS",
        ],
        answer: 0,
        explanation: `Le serveur lit l'en-tête **\`Host\`** de chaque requête et sert le **vhost** correspondant. C'est le **virtual hosting** : \`Host: siteA\` et \`Host: siteB\` sur la même IP renvoient des contenus **différents**. Le port ne change pas, et HTTPS n'a rien à voir.`,
        tags: ["vhost", "virtual-hosting", "host"],
      },
      {
        id: "prat-vhost-t3",
        title: "Fuzzer les noms de vhost",
        order: 3,
        difficulty: "hard",
        type: "text",
        prompt: `## 🔍 Deviner le nom caché

Le vhost secret n'est lié nulle part, mais son nom est **devinable**. Boucle sur une liste de noms plausibles en changeant le Host à chaque essai :

\`\`\`bash
for h in admin portail admin-portal gestion backup dev test portail-admin; do
  echo "$h: $(curl -s -H "Host: $h.cyberace.internal" http://target:8080/)"
done
\`\`\`

Repère la ligne dont la réponse **diffère** du portail public.

**Question :** quel **nom de sous-domaine** révèle un contenu différent du portail public ?`,
        points: 250,
        timeLimitSec: 600,
        hints: [
          { text: "Le bon nom fait partie de la liste donnée dans la consigne — relis attentivement chaque réponse retournée, une seule n'affiche PAS « Portail public ».", cost: 25 },
        ],
        answer: "portail-admin",
        accept: ["portail-admin.cyberace.internal"],
        caseSensitive: false,
        explanation: `**\`portail-admin\`** est le seul nom de la liste qui renvoie un contenu **différent** (le reste retombe sur le portail public par défaut). En variant l'en-tête \`Host\`, on a « découvert » un vhost que rien n'annonçait — c'est le fuzzing de virtual hosts.`,
        tags: ["vhost", "fuzzing", "enumeration"],
      },
      {
        id: "prat-vhost-t4",
        title: "Récupérer le flag",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 Le vhost caché (flag)

Demande directement le vhost découvert :

\`\`\`bash
curl -H "Host: portail-admin.cyberace.internal" http://target:8080/
\`\`\`

**Question :** colle le **flag** renvoyé.`,
        points: 250,
        timeLimitSec: 400,
        hints: [],
        answer: "CYBERACE{vhost_cache_jamais_vraiment_prive}",
        caseSensitive: true,
        explanation: `En fixant \`Host: portail-admin.cyberace.internal\`, nginx sert le vhost caché → \`CYBERACE{vhost_cache_jamais_vraiment_prive}\`. Aucun mot de passe, aucune restriction : le nom suffisait. Le flag le dit — un vhost caché n'est jamais vraiment privé.`,
        tags: ["vhost", "flag", "host"],
      },
      {
        id: "prat-vhost-t5",
        title: "Pourquoi rien ne protégeait ce vhost",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔓 Aucune protection

**Question :** pourquoi ce vhost était-il accessible **sans aucune authentification**, alors qu'il n'était lié nulle part ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "L'absence de lien ou de résolution DNS publique n'est pas une protection — n'importe qui devinant ou trouvant le nom peut y accéder directement",
          "nginx bloque automatiquement les vhosts non annoncés en DNS",
          "Il fallait obligatoirement HTTPS pour y accéder",
          "Le port 8080 est réservé aux vhosts publics uniquement",
        ],
        answer: 0,
        explanation: `Ne pas **annoncer** une ressource (pas de lien, pas de DNS public) ne la **protège pas** : le serveur répond dès qu'on fournit le bon \`Host\`. nginx ne « cache » rien automatiquement, et ni HTTPS ni le port n'entrent en jeu. C'est du **security through obscurity**, inefficace.`,
        tags: ["vhost", "obscurite", "securite"],
      },
      {
        id: "prat-vhost-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Protéger vraiment

**Question :** quelle mesure **protège réellement** une ressource sensible, contrairement à la simple absence de lien (« security through obscurity ») ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Une authentification effective (mot de passe, certificat client, restriction d'IP) devant la ressource",
          "Changer le nom du vhost toutes les semaines",
          "Ne jamais documenter le vhost, même en interne",
          "Utiliser un port non standard",
        ],
        answer: 0,
        explanation: `Seule une **mesure effective** protège : **authentification** (mot de passe, certificat client), **restriction d'IP**, chiffrement. Changer le nom, ne pas documenter, ou choisir un port exotique restent de l'**obscurité** — contournables dès qu'on découvre la ressource.`,
        tags: ["vhost", "authentification", "contre-mesure"],
      },
      {
        id: "prat-vhost-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Le principe

**Question :** quel **principe de sécurité** ce module illustre-t-il avant tout ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "L'obscurité (ne pas lier/documenter une ressource) n'équivaut jamais à une vraie protection",
          "Tous les serveurs web sont vulnérables par défaut",
          "Le protocole HTTP est intrinsèquement non sécurisé",
          "Les en-têtes HTTP sont toujours chiffrés",
        ],
        answer: 0,
        explanation: `Le principe : **« security through obscurity » n'est pas de la sécurité**. Cacher une ressource (pas de lien, pas de DNS) ne la protège pas ; il faut une **protection effective**. Les serveurs ne sont pas tous vulnérables, HTTP n'est pas le sujet ici, et les en-têtes ne sont pas chiffrés en HTTP.`,
        tags: ["vhost", "obscurite", "synthese"],
      },
    ],
  },
];
