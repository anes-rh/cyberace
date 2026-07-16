import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 30 : détection d'un empoisonnement ARP en cours (flapping). Lab Docker réel. */
export const module30ArpFlapDetect: CourseSeed[] = [
  {
    slug: "prat-arp-flap-detect",
    title: "Détection de flapping ARP",
    checkpoint: "prat-interception-detect",
    codename: "Silent Flicker",
    domain: "Détection réseau",
    theme: "grid",
    icon: "Brain",
    accent: "#C46B8F",
    order: 30,
    difficulty: "medium",
    summary:
      "Renversement du Module 2 : tu n'empoisonnes plus, tu DÉTECTES. Un attaquant tente par intermittence de se substituer à la passerelle. Le signal qui trahit l'attaque : une même IP (celle de la passerelle) qui semble revendiquée par plusieurs adresses MAC différentes en peu de temps — le « flapping ARP ».",
    objectives: [
      "Surveiller sa propre table ARP pour la passerelle",
      "Capturer et lire les réponses ARP avec tcpdump -e",
      "Repérer une même IP revendiquée par plusieurs MAC (flapping)",
      "Nommer le phénomène et en comprendre la cause",
      "Citer les parades (DAI, entrées ARP statiques)",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module30-arp-flap-rogue:latest",
      ttlSec: 1000,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
      network: { subnet: "10.70.0.0/24", gateway: "10.70.0.1" },
      targetStaticIp: "10.70.0.30",
      attackerStaticIp: "10.70.0.20",
    },
    lesson: `# 🧠 Détection de flapping ARP — Silent Flicker

Au Module 2, tu étais **l'attaquant** qui empoisonne un cache ARP. Ici, tu es **l'analyste** : quelqu'un empoisonne **ton** segment, et ton travail est de le **remarquer**. 🏎️

---

## 🧭 Le briefing

> Tu es **analyste**. Surveille l'état de ta propre **table ARP** pour l'adresse de la **passerelle** (\`10.70.0.1\`) — **rien** ne devrait normalement la faire changer.

Tu es en \`10.70.0.20\`. La passerelle **légitime** est \`10.70.0.1\`. Un conteneur **rogue** (\`10.70.0.30\`) tente **par intermittence** (15 s actif / 15 s silencieux) de se faire passer pour la passerelle.

---

## 1. Rappel : le cache ARP 🧩

Chaque machine tient une **table** de correspondance **IP → MAC** (le *cache ARP*). Pour une adresse stable comme la **passerelle**, cette correspondance ne devrait **jamais** changer : une passerelle a **une** carte réseau, donc **une** MAC.

Si tu vois l'IP de la passerelle **osciller** entre **deux MAC différentes**, c'est le signe qu'**un intrus** revendique cette IP à côté de la vraie passerelle.

---

## 2. Consulter sa table ARP 🔍

\`\`\`bash
ip neigh          # (ou : arp -n) — affiche le cache ARP local
\`\`\`

Regarde la ligne de \`10.70.0.1\`. Relance la commande plusieurs fois : si la **MAC associée change**, quelque chose cloche.

---

## 3. Observer les réponses ARP en direct 👂

Pour **voir** le phénomène, capture les trames ARP liées à la passerelle, en affichant les **adresses MAC** (\`-e\`) :

\`\`\`bash
tcpdump -i eth0 -e arp and host 10.70.0.1
#              │  │  └── ne garde que l'ARP concernant 10.70.0.1
#              │  └── -e : affiche les adresses MAC (source/destination)
#              └── interface
\`\`\`

Laisse tourner **~40 secondes**. Tu verras des réponses « \`10.70.0.1 is-at ...\` » émanant de **plusieurs MAC différentes**, qui **alternent** (la vraie passerelle et le rogue) — surtout pendant les fenêtres de 15 s où le rogue est actif.

---

## 4. Le signal : le flapping ARP 🚨

Ce phénomène — une **même IP** qui **alterne** entre plusieurs **MAC** dans le cache ARP — s'appelle le **flapping ARP** (*ARP flapping*, instabilité du cache ARP). C'est un **indicateur classique** d'un empoisonnement ARP en cours : l'attaquant réinjecte périodiquement sa fausse réponse pour **reprendre la place** de l'adresse légitime, d'où l'oscillation visible.

> 🧠 Contrairement au Module 2 où **tu** provoquais l'instabilité, ici tu la **détectes** — sans jamais lancer \`arpspoof\`.

---

## 5. Les contre-mesures 🛡️

- **Dynamic ARP Inspection (DAI)** sur les commutateurs : chaque réponse ARP est vérifiée contre une table fiable (issue du DHCP Snooping) ; les fausses sont **rejetées**.
- **Entrées ARP statiques** pour les hôtes critiques (comme la passerelle) : la correspondance IP↔MAC est **figée** et ne peut plus « flapper ».

---

## 🎯 Ta mission (résumé)

1. \`ping\` la passerelle, consulte ta table ARP (\`ip neigh\`).
2. **Capture** l'ARP de \`10.70.0.1\` avec \`tcpdump -e\` pendant ~40 s.
3. **Repère** l'alternance de MAC, **nomme** le phénomène, cite la **parade**.

## 🧠 À retenir

- Une **passerelle** a **une seule** MAC ; son IP ne doit **jamais** changer de MAC.
- **\`ip neigh\`** / **\`arp -n\`** affichent le cache ARP local.
- **\`tcpdump -i eth0 -e arp and host <ip>\`** montre les MAC qui revendiquent une IP.
- **Flapping ARP** = une IP alternant entre plusieurs MAC → **empoisonnement en cours**.
- Parades : **DAI** (+ DHCP Snooping) et **entrées ARP statiques** pour les hôtes critiques.
- Ici on **détecte** (posture analyste), on ne provoque pas (contraste avec le Module 2).`,
    badge: {
      id: "badge-prat-arpflap",
      name: "Veilleur de Passerelle",
      icon: "Brain",
      description: "A repéré un empoisonnement ARP en cours sans jamais l'avoir provoqué.",
    },
    challenges: [
      {
        id: "prat-arpflap-t1",
        title: "Prise de contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Prise de contact

Démarre le lab et ouvre le terminal. Confirme d'abord que la passerelle répond :

\`\`\`bash
ping -c 2 10.70.0.1
\`\`\`

**Question :** quelle **commande** teste qu'un hôte est joignable via ICMP echo ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "ping",
        caseSensitive: false,
        explanation: `**\`ping\`** envoie des ICMP *echo request*. Il confirme que la passerelle \`10.70.0.1\` répond — et, au passage, force ta machine à résoudre sa MAC (donc à remplir le cache ARP).`,
        tags: ["arpflap", "ping", "recon"],
      },
      {
        id: "prat-arpflap-t2",
        title: "Consulter le cache ARP local",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔍 Ta table ARP

Regarde la correspondance IP → MAC que ta machine a mémorisée, en particulier pour \`10.70.0.1\`.

**Question :** quelle **commande** affiche la table de correspondance IP-MAC (cache ARP) locale ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "ip neigh",
        accept: ["arp -n", "ip neigh show"],
        caseSensitive: false,
        explanation: `**\`ip neigh\`** (ou l'ancien \`arp -n\`) liste le cache ARP. Relancée plusieurs fois, elle peut révéler que la MAC de \`10.70.0.1\` **change** — un premier indice.`,
        tags: ["arpflap", "ip-neigh", "cache-arp"],
      },
      {
        id: "prat-arpflap-t3",
        title: "Observer la variation",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 👂 Capturer l'ARP de la passerelle

\`\`\`bash
tcpdump -i eth0 -e arp and host 10.70.0.1
\`\`\`

Laisse tourner **~40 secondes** et observe les adresses MAC qui revendiquent être \`10.70.0.1\`.

**Question :** combien d'adresses MAC sources **différentes** revendiquent être \`10.70.0.1\` pendant cette capture ?`,
        points: 200,
        timeLimitSec: 500,
        hints: [],
        options: [
          "Une seule, toujours la même",
          "Au moins deux, qui alternent",
          "Aucune adresse ne revendique cette IP",
          "Plus de dix adresses différentes",
        ],
        answer: 1,
        explanation: `Tu vois **au moins deux** MAC alterner pour \`10.70.0.1\` : celle de la **vraie passerelle** et celle du **rogue** (surtout pendant ses fenêtres actives de 15 s). Cette alternance est le signal d'alerte.`,
        tags: ["arpflap", "tcpdump", "observation"],
      },
      {
        id: "prat-arpflap-t4",
        title: "Nommer le signal d'alerte",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Nommer le phénomène

**Question :** comment appelle-t-on ce phénomène où une même IP semble alterner entre plusieurs adresses MAC dans le cache ARP ?`,
        points: 200,
        timeLimitSec: 350,
        hints: [],
        answer: "flapping ARP",
        accept: ["arp flapping", "instabilite du cache arp", "flapping"],
        caseSensitive: false,
        explanation: `On parle de **flapping ARP** (*ARP flapping*, instabilité du cache ARP) : une IP qui « oscille » entre plusieurs MAC. C'est un indicateur classique d'un **empoisonnement ARP en cours**.`,
        tags: ["arpflap", "vocabulaire"],
      },
      {
        id: "prat-arpflap-t5",
        title: "Comprendre la cause",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 La cause

**Question :** qu'est-ce qui provoque typiquement ce phénomène ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Un attaquant envoie périodiquement de fausses réponses ARP pour reprendre la place de l'adresse légitime, provoquant cette alternance visible",
          "Une simple coupure réseau temporaire",
          "Un renouvellement normal de bail DHCP",
          "Une mise à jour du pilote réseau",
        ],
        answer: 0,
        explanation: `L'attaquant **réinjecte** périodiquement sa fausse réponse ARP pour reprendre la place de la passerelle légitime. La vraie passerelle répondant aussi, la MAC associée **oscille** — d'où le flapping.`,
        tags: ["arpflap", "cause"],
      },
      {
        id: "prat-arpflap-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure

**Question :** quelle mesure protège spécifiquement contre ce phénomène ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Dynamic ARP Inspection (DAI) sur les commutateurs, ou des entrées ARP statiques pour les hôtes critiques comme la passerelle",
          "Changer l'adresse IP de la passerelle chaque jour",
          "Désactiver complètement le protocole ARP",
          "Augmenter la bande passante du réseau",
        ],
        answer: 0,
        explanation: `La **Dynamic ARP Inspection (DAI)** rejette les fausses réponses ARP sur les ports non approuvés ; des **entrées ARP statiques** figent la MAC des hôtes critiques (passerelle) pour qu'elle ne puisse plus flapper.`,
        tags: ["arpflap", "dai", "contre-mesure"],
      },
      {
        id: "prat-arpflap-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** en quoi ce module diffère-t-il du Module 2 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Ici on détecte un empoisonnement ARP en cours plutôt que de le provoquer soi-même",
          "Ce module n'utilise pas arpspoof, contrairement au Module 2",
          "Ce module ne nécessite aucune capacité réseau particulière",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Le Module 2 te plaçait en **attaquant** (tu lançais \`arpspoof\`) ; ici tu es **analyste** et tu **détectes** l'attaque d'un autre. Même phénomène ARP, posture inverse — défense plutôt qu'attaque.`,
        tags: ["arpflap", "synthese"],
      },
    ],
  },
];
