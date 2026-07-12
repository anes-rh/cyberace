import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 2 : ARP Spoofing & interception passive. Lab Docker réel. */
export const module2ArpSpoofing: CourseSeed[] = [
  {
    slug: "prat-arp-spoofing",
    title: "ARP Spoofing & interception passive",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Relay",
    domain: "Interception réseau",
    theme: "grid",
    icon: "Ghost",
    accent: "#7B8FD9",
    order: 2,
    difficulty: "medium",
    summary:
      "Deuxième lab réel : tu passes de la reconnaissance à l'interception. En empoisonnant le cache ARP d'un poste interne, tu détournes vers toi une communication qu'il croit envoyer à un service légitime — et tu la lis en clair. Sans jamais relayer ni répondre : juste écouter ce qui t'arrive.",
    objectives: [
      "Repérer ta propre interface et cartographier un sous-réseau interne",
      "Comprendre pourquoi une IP « fantôme » ne se découvre pas au scan",
      "Constater qu'aucune donnée ne fuit AVANT l'empoisonnement ARP",
      "Empoisonner le cache ARP d'une victime avec arpspoof (usurpation MAC/IP)",
      "Intercepter le trafic détourné avec tcpdump, sans mode promiscuous",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module2-arp-victim:latest",
      ttlSec: 1200, // 20 minutes
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
      network: { subnet: "10.55.0.0/24", gateway: "10.55.0.1" },
      targetStaticIp: "10.55.0.10",
      attackerStaticIp: "10.55.0.20",
    },
    lesson: `# 👻 ARP Spoofing & interception passive — Silent Relay

Dans le Module 1, tu **regardais** ce qu'un serveur exposait. Ici, tu vas **détourner** une communication qui ne t'était pas destinée — en exploitant la naïveté du protocole **ARP**. 🏎️

---

## 🧭 Le briefing

> Une **note de service compromise** a été récupérée. Elle mentionne qu'un **poste interne** (nom d'hôte inconnu) échange **périodiquement** avec un service interne situé à l'adresse **\`10.55.0.99\`**. Problème : d'après **l'inventaire réseau officiel**, cette adresse **ne correspond à AUCUNE machine déclarée**. Personne ne sait ce qui se cache derrière ces rapports réguliers.
>
> **Ta mission :** d'abord **découvrir** le poste qui émet ces messages, puis **intercepter** l'échange pour en lire le contenu.

⚠️ **Un point crucial à comprendre tout de suite :** \`10.55.0.99\` est une **adresse fantôme**. **Aucune machine ne répond** à cette adresse. Inutile donc de la scanner ou de la pinger — tu ne trouveras **jamais** rien *à* \`10.55.0.99\`. Cette IP t'est **donnée** par le briefing ; ton travail n'est pas de la découvrir, mais de **te glisser à sa place** aux yeux de la victime.

**Comment jouer :** clique sur **« Démarrer le lab »**, ouvre le terminal (tu es l'attaquant, en **\`10.55.0.20\`**), et progresse tâche par tâche.

---

## 1. Rappel : comment fonctionne ARP 🧩

Sur un réseau local, une machine qui veut parler à une **IP** doit d'abord trouver l'**adresse MAC** correspondante. C'est le rôle d'**ARP** (*Address Resolution Protocol*) :

\`\`\`
   La victime (10.55.0.10) veut envoyer à 10.55.0.99 :
   1) VICTIME → BROADCAST : "Who has 10.55.0.99 ? Tell 10.55.0.10"   (ARP Request)
   2) ??? → VICTIME       : "10.55.0.99 is at AA:BB:CC:..."           (ARP Reply)
   3) la victime met en cache :  10.55.0.99 → AA:BB:CC:...
\`\`\`

Le problème (vu en cours de sécurité réseau) : **ARP n'a aucune authentification** et est **stateless**. **N'importe qui** peut répondre « c'est moi », même sans avoir été interrogé, et la victime **le croit** et met à jour son cache. C'est la faille que l'on exploite.

> 🧭 Ici, comme **aucune machine réelle** n'est en \`10.55.0.99\`, la requête ARP de la victime reste **sans réponse**… **jusqu'à ce que tu répondes à sa place.**

---

## 2. Avant l'attaque : rien ne fuit 🔇

Le poste interne **essaie** d'envoyer ses rapports vers \`10.55.0.99\` — mais tant que **personne** ne répond à sa requête ARP, la résolution **échoue** et **le paquet ne part jamais réellement sur le réseau**. Résultat : si tu écoutes avec **tcpdump** *avant* d'attaquer, tu ne verras **aucune donnée applicative** (tout au plus des **requêtes ARP** diffusées, qui sont du bruit, pas de la donnée).

C'est exactement ce que tu vas **vérifier** à la tâche 3 : l'écoute passive **ne suffit pas**. Il faut une **intervention active**.

---

## 3. L'empoisonnement ARP (ARP poisoning) 💉

L'outil **\`arpspoof\`** (paquet *dsniff*) envoie à la victime de **fausses réponses ARP** en boucle :

\`\`\`bash
arpspoof -i eth0 -t 10.55.0.10 10.55.0.99
#            │        │            └── l'IP qu'on USURPE (le service fantôme)
#            │        └── la CIBLE qu'on empoisonne (la victime)
#            └── notre interface
\`\`\`

Concrètement : \`arpspoof\` répète à la victime « **\`10.55.0.99\`, c'est MON adresse MAC** » (celle de l'attaquant). La victime **empoisonne son cache** et, désormais, **envoie ses trames destinées à \`10.55.0.99\` directement à l'adresse MAC de l'attaquant** — même si l'IP de destination inscrite dans le paquet reste \`10.55.0.99\`.

\`\`\`
   Cache ARP de la victime, AVANT :   10.55.0.99 → (aucune réponse) ✗
   Cache ARP de la victime, APRÈS  :   10.55.0.99 → MAC de l'attaquant ✓ (menteur !)

   Victime ──(trame pour 10.55.0.99, mais @MAC attaquant)──► ATTAQUANT
\`\`\`

> 🧠 **Pas besoin de relayer.** Dans ce module « basique », l'attaquant ne **répond** pas et ne **transfère** rien vers un vrai \`10.55.0.99\` (qui n'existe pas). Il se contente de **recevoir** ce que la victime lui livre désormais spontanément. C'est de l'**interception**, pas un relais MITM bidirectionnel — et c'est bien assez pour lire le message en clair.

---

## 4. Capturer sans mode promiscuous 🎯

Normalement, pour écouter le trafic **d'autrui** sur un segment, une carte doit passer en **mode promiscuous** (accepter les trames qui ne lui sont pas adressées). **Ici, ce n'est pas nécessaire** : grâce à l'empoisonnement, les trames de la victime sont **maintenant adressées à ta propre adresse MAC**. Ta carte les accepte **naturellement** — ce n'est plus de l'écoute passive sur le trafic des autres, c'est **du courrier qui arrive chez toi**.

Tu captures donc simplement avec **tcpdump** :

\`\`\`bash
tcpdump -i eth0 -A -s0 host 10.55.0.99
#              │  │   │   └── ne garde que le trafic lié à l'IP fantôme
#              │  │   └── -s0 : capture le paquet entier (pas de troncature)
#              │  └── -A : affiche le contenu en ASCII (lisible)
#              └── interface
\`\`\`

Comme le poste émet en **UDP** (protocole **sans connexion**), **chaque rapport tient en un seul paquet** : aucune poignée de main préalable, le message apparaît **en clair** dès le prochain envoi (toutes les ~5 s).

---

## 5. Garder la main : lancer en arrière-plan ⌨️

\`arpspoof\` tourne **en continu** (il doit ré-empoisonner régulièrement). Pour garder ton terminal utilisable, lance-le **en arrière-plan** avec \`&\` :

\`\`\`bash
arpspoof -i eth0 -t 10.55.0.10 10.55.0.99 &   # démarre en tâche de fond
jobs                                          # liste les tâches de fond ([1] arpspoof…)
# … lance ton tcpdump, récupère le flag …
kill %1                                       # arrête proprement arpspoof (tâche [1])
# (ou : pkill arpspoof)
\`\`\`

> ⚠️ Si tu arrêtes \`arpspoof\` trop tôt, le cache de la victime **expire** et elle **cesse** de t'envoyer son trafic → plus rien dans tcpdump. Vérifie toujours avec \`jobs\` qu'il **tourne encore** pendant ta capture.

---

## 6. La contre-mesure 🛡️

Cette attaque marche parce que le commutateur **laisse passer** n'importe quelle réponse ARP. La parade, vue en **sécurité réseau**, est la **Dynamic ARP Inspection (DAI)** : le switch **vérifie** chaque réponse ARP contre une table de liaison IP↔MAC fiable (construite par le **DHCP Snooping**) et **rejette** toute réponse falsifiée sur les **ports non approuvés**. Un \`arpspoof\` serait alors **bloqué net**.

---

## 🎯 Ta mission (résumé)

1. Repère-toi (\`ip addr\`), cartographie \`10.55.0.0/24\`, trouve le **poste complice**.
2. Vérifie qu'**avant** l'attaque, rien ne fuit vers \`10.55.0.99\`.
3. **Empoisonne** le cache ARP de la victime, **capture** le rapport, récupère le **flag**.

## 🧠 À retenir

- **ARP** n'a **aucune authentification** et est **stateless** → une machine croit **n'importe quelle** réponse ARP, même non sollicitée.
- Une **IP fantôme** (aucune machine derrière) ne se **découvre pas** au scan : la victime émet vers elle, mais faute de réponse ARP, **le paquet ne part pas** → **rien à capturer** en écoute passive.
- **\`arpspoof -i eth0 -t <victime> <ip_usurpée>\`** fait croire à la victime que l'**IP usurpée = la MAC de l'attaquant** → elle lui **livre** son trafic.
- **Pas de mode promiscuous** requis : les trames sont désormais **adressées à la MAC de l'attaquant**. **Pas de relais** non plus : on lit, c'est tout.
- L'émission en **UDP** (sans connexion) = capture en **un seul paquet**, **en clair**, dès le prochain envoi.
- Lancer \`arpspoof\` **en arrière-plan** (\`&\`, \`jobs\`, \`kill %1\`) pour garder la main ; l'arrêter trop tôt **coupe** l'interception.
- Contre-mesure : **Dynamic ARP Inspection (DAI)** + **DHCP Snooping** sur le switch.`,
    badge: {
      id: "badge-prat-arp",
      name: "Chasseur de Trames",
      icon: "Siren",
      description: "A intercepté une communication interne sans jamais y être invité.",
    },
    challenges: [
      {
        id: "prat-arp-t1",
        title: "Prise de repères",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Prise de repères

Démarre le lab (bouton en haut de page) et ouvre le terminal. Avant toute chose, situe-toi sur le réseau :

\`\`\`bash
ip addr show eth0
\`\`\`

Note ton adresse (tu es l'attaquant, en \`10.55.0.20\`) et ton **sous-réseau** (\`/24\` → \`10.55.0.0/24\`).

**Question :** quelle **commande Linux** affiche les interfaces réseau et leurs adresses IP ?`,
        points: 50,
        timeLimitSec: 300,
        hints: [],
        answer: "ip addr",
        accept: ["ip a", "ip addr show", "ip addr show eth0", "ifconfig"],
        caseSensitive: false,
        explanation: `**\`ip addr\`** (abrégé \`ip a\`, fourni par le paquet *iproute2*) liste les **interfaces** et leurs **adresses IP**. Tu confirmes ici que tu es en \`10.55.0.20\` sur le sous-réseau \`10.55.0.0/24\` — le terrain de jeu où évoluent la victime et le service fantôme.`,
        tags: ["arp", "recon", "ip-addr"],
      },
      {
        id: "prat-arp-t2",
        title: "Repérer le poste complice",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📡 Repérer le poste complice

Le briefing parle d'un **poste interne** qui émet des rapports, mais sans donner son adresse. Balaie le sous-réseau pour le trouver (*ping sweep*) :

\`\`\`bash
nmap -sn 10.55.0.0/24
\`\`\`

Tu verras la **passerelle** (\`.1\`) et **un** autre hôte vivant. Ignore l'adresse fantôme \`10.55.0.99\` : **personne** ne répond dessus, elle n'apparaîtra donc **pas** ici.

**Question :** quelle est l'**adresse IP** du poste complice repéré (hors passerelle) ?`,
        points: 100,
        timeLimitSec: 400,
        hints: [
          { text: "La passerelle se termine toujours par .1 — ce n'est pas elle. Cherche l'autre hôte « up ».", cost: 20 },
        ],
        answer: "10.55.0.10",
        caseSensitive: true,
        explanation: `Le *ping sweep* **\`nmap -sn\`** ne fait que tester quels hôtes sont **vivants**, sans scanner leurs ports. Il révèle la **victime** en **\`10.55.0.10\`** (la passerelle \`.1\` mise à part). Le service fantôme \`10.55.0.99\`, lui, **reste invisible** : aucune machine ne s'y trouve pour répondre.`,
        tags: ["arp", "ping-sweep", "nmap"],
      },
      {
        id: "prat-arp-t3",
        title: "Écoute passive, avant toute intervention",
        order: 3,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔇 Écoute passive (avant l'attaque)

Avant d'attaquer, mets-toi à l'écoute du trafic destiné au service fantôme, **sans rien lancer d'autre** :

\`\`\`bash
tcpdump -i eth0 -A -s0 host 10.55.0.99
\`\`\`

Laisse tourner **~30 secondes**, puis arrête avec \`Ctrl+C\`. Observe ce qui apparaît (ou pas).

**Question :** combien de paquets contenant le mot **\`token\`** apparaissent pendant cette écoute ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: 0,
        explanation: `**Zéro.** La victime *essaie* d'émettre vers \`10.55.0.99\`, mais sa requête ARP **reste sans réponse** (personne à cette adresse) → le paquet UDP **ne part jamais** réellement. Tu verras peut-être des **requêtes ARP** diffusées (du bruit), mais **aucune donnée** avec \`token\`. L'écoute passive ne suffit pas : il faut **intervenir**.`,
        tags: ["arp", "tcpdump", "ecoute-passive"],
      },
      {
        id: "prat-arp-t4",
        title: "Empoisonner le cache ARP",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 💉 Empoisonner le cache ARP

Passe à l'attaque. La syntaxe est \`arpspoof -i <interface> -t <cible> <ip_usurpée>\`. Lance-la **en arrière-plan** (avec \`&\`) pour garder la main sur le terminal :

\`\`\`bash
arpspoof -i eth0 -t 10.55.0.10 10.55.0.99 &
jobs          # vérifie qu'elle tourne : [1]  Running  arpspoof …
\`\`\`

*(Tu l'arrêteras plus tard avec \`kill %1\`.)*

**Question :** que fait concrètement \`arpspoof\` ici ?`,
        points: 200,
        timeLimitSec: 500,
        hints: [],
        options: [
          "Il envoie à la victime de fausses réponses ARP qui associent l'IP 10.55.0.99 à l'adresse MAC de l'attaquant",
          "Il redirige tout le trafic Internet de la victime vers l'attaquant",
          "Il modifie l'adresse IP de la victime",
          "Il désactive le pare-feu de la victime",
        ],
        answer: 0,
        explanation: `\`arpspoof\` bombarde la victime de **fausses réponses ARP** disant « **\`10.55.0.99\` = ma MAC** » (celle de l'attaquant). La victime **empoisonne son cache** et lui envoie désormais ses trames. Il ne touche ni à l'IP de la victime, ni à son pare-feu, ni au trafic Internet — juste à sa **table de résolution ARP**.`,
        tags: ["arp", "arpspoof", "poisoning"],
      },
      {
        id: "prat-arp-t5",
        title: "Intercepter le message",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Intercepter le message (flag)

Avec \`arpspoof\` **toujours actif en arrière-plan**, remets-toi à l'écoute et attends le prochain rapport (toutes les ~5 s) :

\`\`\`bash
tcpdump -i eth0 -A -s0 host 10.55.0.99
\`\`\`

Cette fois, le message de la victime **arrive chez toi**. Lis la ligne \`AGENT_REPORT token=...\` et récupère le **flag**.

**Question :** colle le **flag** intercepté.`,
        points: 300,
        timeLimitSec: 700,
        hints: [
          { text: "Rien ne s'affiche ? Vérifie d'abord que arpspoof tourne encore : tape « jobs ». S'il s'est arrêté, relance-le en arrière-plan.", cost: 15 },
          { text: "Commande de capture exacte : tcpdump -i eth0 -A -s0 host 10.55.0.99   (laisse tourner ~10 s).", cost: 30 },
        ],
        answer: "CYBERACE{arp_intercepte_en_clair}",
        caseSensitive: true,
        explanation: `Une fois le cache empoisonné, la victime **te livre** ses rapports : \`tcpdump -A\` les affiche **en clair**, révélant \`CYBERACE{arp_intercepte_en_clair}\`. Aucun chiffrement ne protégeait cet échange interne — d'où la leçon : **le trafic « interne » n'est pas « sûr »** par défaut.`,
        tags: ["arp", "interception", "flag"],
      },
      {
        id: "prat-arp-t6",
        title: "Pourquoi ça a marché sans négociation",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚡ Un seul paquet, sans négociation

Tu as capturé le message **d'un coup**, sans voir de poignée de main préalable (pas de SYN/SYN-ACK/ACK).

**Question :** pourquoi le message a-t-il été capturé en **un seul paquet**, sans échange préalable ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Parce que le message a été envoyé en UDP, protocole sans connexion",
          "Parce que le message a été envoyé en TCP avec une poignée de main accélérée",
          "Parce que arpspoof chiffre automatiquement les échanges",
          "Parce que le port 5353 ne nécessite pas d'authentification",
        ],
        answer: 0,
        explanation: `Le poste émet en **UDP**, un protocole **sans connexion** : pas de poignée de main à établir, chaque rapport part en **un unique datagramme**. C'est justement pour ça que l'interception est immédiate dès que le trafic est détourné — il n'y a aucun round-trip qui pourrait échouer.`,
        tags: ["arp", "udp", "sans-connexion"],
      },
      {
        id: "prat-arp-t7",
        title: "Contre-mesure",
        order: 7,
        difficulty: "medium",
        type: "text",
        prompt: `## 🛡️ La parade

Cette attaque n'a été possible que parce que le commutateur laisse passer **n'importe quelle** réponse ARP.

**Question :** quelle **fonctionnalité de commutateur**, vue en cours de sécurité réseau, **bloque les réponses ARP falsifiées** sur les ports non approuvés ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: "Dynamic ARP Inspection",
        accept: ["DAI", "dynamic arp inspection"],
        caseSensitive: false,
        explanation: `La **Dynamic ARP Inspection (DAI)** vérifie chaque réponse ARP contre une table de liaison IP↔MAC fiable (issue du **DHCP Snooping**) et **rejette** les réponses falsifiées sur les ports non approuvés. Un \`arpspoof\` y serait **bloqué net** — la parade directe à ce que tu viens de faire.`,
        tags: ["arp", "dai", "contre-mesure"],
      },
      {
        id: "prat-arp-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

Tu n'as jamais eu besoin d'activer le **mode promiscuous** sur ton interface pour capturer ce trafic.

**Question :** pourquoi l'attaquant n'a-t-il **pas** eu besoin d'activer le mode promiscuous ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Parce que les trames étaient désormais adressées directement à sa propre adresse MAC",
          "Parce que le mode promiscuous est activé par défaut sur tous les conteneurs Docker",
          "Parce que tcpdump active le mode promiscuous automatiquement dans tous les cas",
          "Parce que le réseau utilisait un hub et non un switch",
        ],
        answer: 0,
        explanation: `Grâce à l'empoisonnement ARP, la victime envoie ses trames **à l'adresse MAC de l'attaquant**. Sa carte les accepte donc **naturellement** — pas besoin de mode promiscuous, qui ne sert qu'à capter des trames **destinées à d'autres**. Ici, le trafic **t'est directement adressé** : c'est de l'interception, pas de l'écoute passive.`,
        tags: ["arp", "promiscuous", "synthese"],
      },
    ],
  },
];
