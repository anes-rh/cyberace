import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 25 : fuite d'un service interne via mDNS (multicast). Lab Docker réel. */
export const module25MdnsDisclosure: CourseSeed[] = [
  {
    slug: "prat-mdns-disclosure",
    title: "Fuite d'un service interne via mDNS",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Broadcast",
    domain: "Découverte réseau",
    theme: "grid",
    icon: "Network",
    accent: "#A68FC4",
    order: 25,
    difficulty: "medium",
    summary:
      "mDNS (multicast DNS, façon Bonjour/Avahi) laisse un service s'annoncer tout seul à tout le segment local, sans configuration ni authentification. Contrairement aux modules d'interception, AUCUN ARP spoofing n'est nécessaire : le multicast est visible nativement par quiconque écoute.",
    objectives: [
      "Confirmer la présence de la cible sur le segment",
      "Lister les services annoncés en mDNS avec avahi-browse",
      "Repérer un service interne qui n'aurait jamais dû être public",
      "Extraire un secret d'un enregistrement TXT mDNS",
      "Distinguer diffusion active et interception",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module25-mdns-disclosure:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      targetCapAdd: ["NET_ADMIN", "NET_RAW"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🌐 Fuite via mDNS — Silent Broadcast

Certains services **crient** leur existence à tout le réseau local, sans qu'on le leur demande. Pas besoin d'attaquer : il suffit d'**écouter**. 🏎️

---

## 🧭 Le briefing

> Certains services s'annoncent **tout seuls** sur le réseau local. **Écoute** simplement ce qui circule — l'un d'eux ne devrait pas être là.

Tu es l'attaquant. \`avahi-utils\` est déjà dans \`attacker-base\`.

---

## 1. mDNS : l'auto-annonce 📣

**mDNS** (*multicast DNS*, cœur de Bonjour/Avahi) permet à un service de s'**annoncer automatiquement** sur tout un segment local, **sans** serveur DNS central. Pratique pour découvrir imprimantes, partages, etc.

Le revers : **aucune authentification**, **aucune restriction** par défaut. Les annonces sont diffusées en **multicast** (\`224.0.0.251:5353\`) — **tout hôte** du segment les voit **nativement**.

> 🧠 Différence clé avec les Modules 2/6/9/17 : **aucun ARP spoofing** ici. Le trafic mDNS est du **multicast**, déjà destiné à tout le monde. On ne détourne rien — on **reçoit**.

---

## 2. Écouter les annonces 👂

\`\`\`bash
avahi-browse -a -t
#            │  └── -t : termine une fois le cache épuisé (ne reste pas actif)
#            └── -a : tous les types de services
\`\`\`

Tu vois défiler les services annoncés — dont un au nom évocateur d'une ressource **interne** qui n'aurait jamais dû être public.

---

## 3. Résoudre les enregistrements TXT 🎯

Les services mDNS portent des **enregistrements TXT** (métadonnées). L'option \`-r\` les **résout** :

\`\`\`bash
avahi-browse -a -t -r
\`\`\`

Cherche le service « Portail de sauvegarde interne » et son champ \`info=...\` — le flag est là.

---

## 4. La contre-mesure 🛡️

- **Désactiver mDNS/Bonjour** sur les services internes sensibles.
- **Restreindre sa portée** : VLAN dédié, filtrage du multicast entre segments.

L'idée : ce qui n'a pas besoin d'être découvert automatiquement ne doit pas **s'annoncer** à tout le monde.

---

## 🧠 À retenir

- **mDNS** annonce les services par **multicast**, **sans authentification**, par conception.
- **Aucune interception** nécessaire : l'info est diffusée **activement** par la cible.
- **\`avahi-browse -a -t -r\`** liste les services et **résout** leurs enregistrements TXT.
- Parade : **désactiver** mDNS sur les services sensibles ou **restreindre** sa portée réseau.`,
    badge: {
      id: "badge-prat-mdns",
      name: "Oreille du Multicast",
      icon: "Network",
      description: "A entendu un service s'annoncer à tout le réseau local, sans qu'on le lui demande.",
    },
    challenges: [
      {
        id: "prat-mdns-t1",
        title: "Prise de contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Prise de contact

Démarre le lab. Confirme que la cible répond :

\`\`\`bash
ping -c 2 target
\`\`\`

**Question :** quelle **commande** teste qu'un hôte est joignable via ICMP echo ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "ping",
        caseSensitive: false,
        explanation: `**\`ping\`** confirme que \`target\` est vivant sur le segment avant que tu n'écoutes ses annonces mDNS.`,
        tags: ["mdns", "ping", "recon"],
      },
      {
        id: "prat-mdns-t2",
        title: "Découvrir les services mDNS",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 👂 Écouter les annonces

\`\`\`bash
avahi-browse -a -t
\`\`\`

*(\`-t\` termine l'écoute une fois le cache épuisé, plutôt que de rester actif.)*

**Question :** quelle **commande** liste les services annoncés en mDNS sur le réseau local ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "avahi-browse -a",
        accept: ["avahi-browse"],
        caseSensitive: true,
        explanation: `**\`avahi-browse -a\`** parcourt **tous** les types de services annoncés en mDNS. Aucune attaque : tu ne fais qu'écouter un multicast déjà public.`,
        tags: ["mdns", "avahi-browse"],
      },
      {
        id: "prat-mdns-t3",
        title: "Repérer le service suspect",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔎 Le service de trop

Parmi les services annoncés, l'un évoque clairement une ressource **interne**.

**Question :** quel **nom de service**, annoncé publiquement, évoque une ressource interne sensible ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "Portail de sauvegarde interne",
        accept: ["sauvegarde interne", "portail de sauvegarde"],
        caseSensitive: false,
        explanation: `Le service **« Portail de sauvegarde interne »** s'annonce à tout le segment — exactement le genre de ressource qui ne devrait **jamais** se signaler publiquement.`,
        tags: ["mdns", "decouverte"],
      },
      {
        id: "prat-mdns-t4",
        title: "Récupérer le flag",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Résoudre le TXT (flag)

\`\`\`bash
avahi-browse -a -t -r
\`\`\`

*(\`-r\` résout les enregistrements TXT associés.)* Cherche le champ \`info=...\` du service de sauvegarde.

**Question :** colle le **flag**.`,
        points: 300,
        timeLimitSec: 500,
        hints: [
          { text: "Ajoute l'option -r pour voir les enregistrements TXT des services.", cost: 20 },
          { text: "Le champ à lire s'appelle info= dans l'enregistrement TXT du service de sauvegarde.", cost: 35 },
        ],
        answer: "CYBERACE{mdns_annonce_service_interne}",
        caseSensitive: true,
        explanation: `\`avahi-browse -a -t -r\` résout l'enregistrement TXT du service : \`info=CYBERACE{mdns_annonce_service_interne}\`. Un secret diffusé à tout le segment, sans qu'aucune attaque n'ait été nécessaire.`,
        tags: ["mdns", "txt", "flag"],
      },
      {
        id: "prat-mdns-t5",
        title: "Pourquoi ça fuite",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Pourquoi ça fuite

**Question :** pourquoi ce genre d'annonce est-elle visible sans la moindre manipulation ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "mDNS annonce les services par multicast à tout le segment local, sans authentification ni restriction, par conception",
          "L'attaquant a préalablement empoisonné le cache ARP de la victime",
          "Le service utilise un port non standard mal configuré",
          "C'est une fonctionnalité de débogage activée par erreur",
        ],
        answer: 0,
        explanation: `mDNS **diffuse** ses annonces en multicast à tout le segment, **sans** authentification. C'est le principe même du protocole — pas une erreur ni une attaque.`,
        tags: ["mdns", "multicast"],
      },
      {
        id: "prat-mdns-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesure

**Question :** quelle mesure réduit ce risque ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Désactiver mDNS/Bonjour sur les services internes sensibles, ou restreindre sa portée réseau (VLAN dédié, filtrage multicast)",
          "Changer le port du service toutes les heures",
          "Chiffrer uniquement le nom du service",
          "Utiliser IPv6 plutôt qu'IPv4",
        ],
        answer: 0,
        explanation: `On **désactive** mDNS là où il n'est pas nécessaire, ou on **cloisonne** sa portée (VLAN, filtrage multicast). Un service sensible ne doit pas **s'auto-annoncer** à tout le monde.`,
        tags: ["mdns", "contre-mesure"],
      },
      {
        id: "prat-mdns-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** en quoi ce module se distingue-t-il des Modules 2, 6, 9 et 17 (tous basés sur l'ARP spoofing) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Aucune interception n'est nécessaire : l'information est diffusée activement par la cible elle-même, à portée de quiconque écoute",
          "Il utilise exactement la même technique qu'eux",
          "Il nécessite plus de capacités réseau que tous les autres modules",
          "Il ne fonctionne qu'avec IPv6",
        ],
        answer: 0,
        explanation: `Les Modules 2/6/9/17 **détournaient** un trafic unicast (ARP spoof). Ici, rien à détourner : mDNS **diffuse** volontairement en multicast. On se contente d'**écouter** ce qui est déjà public.`,
        tags: ["mdns", "synthese"],
      },
    ],
  },
];
