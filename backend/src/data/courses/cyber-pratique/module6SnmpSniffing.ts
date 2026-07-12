import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 6 : interception d'une communauté SNMP en clair. Lab Docker réel. */
export const module6SnmpSniffing: CourseSeed[] = [
  {
    slug: "prat-snmp-sniffing",
    title: "SNMP en clair : interception d'une communauté",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Probe",
    domain: "Interception réseau",
    theme: "grid",
    icon: "Server",
    accent: "#6FA891",
    order: 6,
    difficulty: "medium",
    summary:
      "Sixième lab réel : tu réutilises l'ARP spoofing du Module 2, mais contre un autre protocole. Un poste interne interroge sans arrêt un agent de supervision SNMP avec une version obsolète du protocole. En détournant son trafic, tu récupères la « communauté » SNMP — un secret transmis… en clair.",
    objectives: [
      "Réappliquer l'ARP spoofing pour intercepter un protocole UDP (SNMP)",
      "Vérifier qu'aucun secret ne fuit tant que le trafic n'est pas détourné",
      "Lire une communauté SNMP en clair dans une capture tcpdump",
      "Comprendre pourquoi SNMPv1/v2c expose la communauté (pas de chiffrement)",
      "Connaître la correction (SNMPv3) et la défense de repli (filtrage pare-feu)",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module6-snmp-victim:latest",
      ttlSec: 1200,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
      network: { subnet: "10.62.0.0/24", gateway: "10.62.0.1" },
      targetStaticIp: "10.62.0.10",
      attackerStaticIp: "10.62.0.20",
    },
    lesson: `# 🖧 SNMP en clair : interception d'une communauté — Silent Probe

Tu as appris au **Module 2** à détourner le trafic d'une victime par **ARP spoofing**. Ici, **même arme, autre cible** : au lieu d'un beacon maison, tu vas intercepter un vrai protocole d'administration — **SNMP** — et découvrir qu'il crache un secret **en clair**. 🏎️

---

## 🧭 Le briefing

> Un **poste interne** (\`10.62.0.10\`) interroge **régulièrement** un **agent de supervision réseau** (SNMP). Problème : le protocole utilisé **n'a pas été mis à jour depuis longtemps**. **Vérifie ce qu'il expose** sur le réseau.
>
> L'agent interrogé vit à l'adresse **\`10.62.0.99\`** — une adresse qui, comme au Module 2, **n'est attribuée à aucune machine réelle**. Ne la scanne pas : glisse-toi **à sa place**.

**Comment jouer :** « Démarrer le lab », terminal en \`10.62.0.20\`, et **rejoue le scénario du Module 2** — cette fois pour capturer une **communauté SNMP**.

---

## 1. SNMP en deux minutes 📟

**SNMP** (*Simple Network Management Protocol*) sert à **superviser et administrer** les équipements réseau (routeurs, switches, imprimantes, serveurs) : lire des métriques (charge, interfaces, uptime), voire modifier des paramètres. Il fonctionne en **UDP**, port **161** (agent) et **162** (traps).

Le contrôle d'accès historique repose sur une **« communauté »** (*community string*) — en pratique, un **mot de passe partagé** :
- La communauté **\`public\`** (lecture seule par défaut) et **\`private\`** (lecture-écriture) sont les grands classiques… souvent laissés tels quels.
- Qui connaît la communauté peut **interroger** (voire **reconfigurer**) l'équipement.

---

## 2. Le péché originel de SNMPv1/v2c 🔓

Les versions **SNMPv1** et **SNMPv2c** ont une faiblesse **structurelle** :

> La **communauté** est transmise **en clair** (texte brut) dans **chaque paquet UDP**, sans **chiffrement** ni **authentification robuste**.

Autrement dit, ce « mot de passe » circule **à découvert** sur le réseau. Quiconque **capture** le trafic SNMP le lit **directement**. Pire : la communauté sert aussi de facto d'authentification → l'intercepter, c'est obtenir les **droits** d'interrogation de l'équipement.

\`\`\`
   Paquet SNMPv2c (simplifié) :
   [ UDP:161 ][ version=v2c ][ community = "..." EN CLAIR ][ PDU: get OID... ]
                                          ▲ lisible par quiconque capture
\`\`\`

### SNMPv3 : la correction

**SNMPv3** introduit un vrai **modèle de sécurité par utilisateur** (**USM**, *User-based Security Model*) :
- **Authentification** des messages (HMAC-MD5/SHA) → on vérifie l'expéditeur et l'intégrité.
- **Chiffrement** (DES/AES) → le contenu n'est plus lisible en clair.
- Notion d'**utilisateur** avec des clés, au lieu d'une simple chaîne partagée.

> 🧭 Résumé : **v1/v2c = communauté en clair, aucune confidentialité** ; **v3 = authentification + chiffrement par utilisateur**. Toute supervision sérieuse doit être en **v3**.

---

## 3. La mécanique d'interception (rappel Module 2) 🎯

Rien de nouveau côté attaque — c'est **exactement** le Module 2, appliqué à SNMP :

- \`10.62.0.99\` (l'agent SNMP) est une **IP fantôme** : personne n'y répond → la requête SNMP de la victime **ne part pas** tant que sa résolution ARP échoue. **Rien à capturer** en écoute passive.
- \`arpspoof -i eth0 -t 10.62.0.10 10.62.0.99\` fait croire à la victime que **\`10.62.0.99\` = ta MAC** → elle **t'envoie** ses paquets SNMP.
- \`tcpdump -i eth0 -A -s0 udp port 161\` capture et affiche le contenu **en clair** → la **communauté** apparaît dans la requête.

\`\`\`
   Victime 10.62.0.10 ──(snmpget vers 10.62.0.99, mais @MAC attaquant)──► TOI 10.62.0.20
                                    tcpdump -A → community = "…" lisible
\`\`\`

Le filtre **\`udp port 161\`** isole précisément le trafic SNMP. Pas besoin de mode promiscuous (les trames te sont désormais adressées) ni de relais — tu **lis**, c'est tout.

---

## 4. Se défendre 🛡️

- **Migrer vers SNMPv3** (authentification + chiffrement) : la vraie correction de fond.
- Si **v1/v2c doit rester** temporairement : **restreindre l'accès SNMP par pare-feu** aux **seules** stations de supervision légitimes (ACL sur le port 161), et **changer** les communautés par défaut (\`public\`/\`private\`).
- **Chiffrer/segmenter** le réseau d'administration (VLAN de gestion dédié, hors du LAN utilisateur).
- Et, à la racine du détournement : **Dynamic ARP Inspection** (Module 2) pour empêcher l'ARP spoofing.

---

## 🎯 Ta mission (résumé)

1. Repère-toi, trouve le **poste** interrogateur (\`nmap -sn\`).
2. Vérifie qu'**avant** l'attaque, rien ne fuit sur \`udp port 161\`.
3. **Empoisonne** l'ARP, **capture** la requête SNMP, lis la **communauté** (le flag).

## 🧠 À retenir

- **SNMP** (UDP **161**) supervise les équipements ; le contrôle d'accès repose sur une **communauté** (mot de passe partagé, souvent \`public\`/\`private\`).
- **SNMPv1/v2c** transmet la communauté **en clair** dans chaque paquet, **sans chiffrement ni authentification robuste** → la capturer donne les droits d'interrogation.
- **SNMPv3** corrige : **USM** (modèle par utilisateur) avec **authentification** (HMAC) + **chiffrement** (AES).
- **Interception** = même mécanique qu'au Module 2 : **IP fantôme** \`10.62.0.99\` → **arpspoof** détourne le trafic → **\`tcpdump -A -s0 udp port 161\`** lit la communauté en clair. Rien avant l'attaque (paquet non émis).
- **Défense** : migrer en **SNMPv3** ; sinon **filtrer par pare-feu** (accès 161 réservé à la supervision), changer les communautés par défaut, **VLAN de gestion** dédié, **DAI** contre l'ARP spoofing.`,
    badge: {
      id: "badge-prat-snmp",
      name: "Oreille du Réseau",
      icon: "Server",
      description: "A intercepté une communauté SNMP censée rester secrète.",
    },
    challenges: [
      {
        id: "prat-snmp-t1",
        title: "Prise de repères",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Prise de repères

Démarre le lab (tu es en \`10.62.0.20\`). Situe-toi sur le réseau :

\`\`\`bash
ip addr show eth0
\`\`\`

**Question :** quelle **commande** affiche les interfaces réseau et leurs **adresses** ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "ip addr",
        accept: ["ip a", "ip addr show", "ip addr show eth0"],
        caseSensitive: false,
        explanation: `**\`ip addr\`** (ou \`ip a\`) confirme que tu es en \`10.62.0.20\` sur le sous-réseau \`10.62.0.0/24\`. Comme au Module 2, tu vas y retrouver une **victime** et une **IP fantôme** (l'agent SNMP), qu'aucune machine n'occupe réellement.`,
        tags: ["snmp", "recon", "ip-addr"],
      },
      {
        id: "prat-snmp-t2",
        title: "Repérer le poste complice",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 📡 Repérer le poste interrogateur

Balaie le sous-réseau pour trouver le poste qui interroge l'agent SNMP :

\`\`\`bash
nmap -sn 10.62.0.0/24
\`\`\`

Tu verras la passerelle (\`.1\`) et **un** autre hôte vivant. L'agent SNMP (\`10.62.0.99\`) n'apparaîtra **pas** : personne n'y répond.

**Question :** quelle est l'**adresse IP** du poste qui interroge périodiquement l'agent (hors passerelle) ?`,
        points: 100,
        timeLimitSec: 350,
        hints: [],
        answer: "10.62.0.10",
        caseSensitive: true,
        explanation: `Le *ping sweep* révèle la **victime** en **\`10.62.0.10\`** (la passerelle \`.1\` mise à part). C'est elle qui lance les requêtes SNMP vers l'agent fantôme \`10.62.0.99\` — requêtes que tu vas bientôt détourner vers toi.`,
        tags: ["snmp", "ping-sweep", "nmap"],
      },
      {
        id: "prat-snmp-t3",
        title: "Écoute passive, avant intervention",
        order: 3,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔇 Écoute passive (avant l'attaque)

Mets-toi à l'écoute du trafic SNMP, **sans rien lancer d'autre** :

\`\`\`bash
tcpdump -i eth0 -A -s0 udp port 161
\`\`\`

Laisse tourner **~30 secondes**, puis \`Ctrl+C\`.

**Question :** combien de requêtes contenant une **communauté SNMP lisible** apparaissent pendant cette écoute ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: 0,
        explanation: `**Zéro.** La victime *tente* d'interroger \`10.62.0.99\`, mais sa requête ARP reste **sans réponse** (agent fantôme) → le paquet SNMP **ne part jamais**. Sans détournement, il n'y a **rien** à capturer sur \`udp port 161\`. Il faut passer à l'**ARP spoofing**.`,
        tags: ["snmp", "tcpdump", "ecoute-passive"],
      },
      {
        id: "prat-snmp-t4",
        title: "Empoisonner le cache ARP",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 💉 Détourner le trafic

Comme au Module 2, empoisonne le cache ARP de la victime pour te faire passer pour l'agent SNMP. Lance-la **en arrière-plan** :

\`\`\`bash
arpspoof -i eth0 -t 10.62.0.10 10.62.0.99 &
jobs   # confirme qu'elle tourne
\`\`\`

**Question :** que fait cette commande ?`,
        points: 200,
        timeLimitSec: 500,
        hints: [],
        options: [
          "Elle fait croire au poste 10.62.0.10 que l'agent SNMP (10.62.0.99) se trouve à l'adresse MAC de l'attaquant",
          "Elle bloque tout le trafic du poste 10.62.0.10",
          "Elle installe un agent SNMP sur l'attaquant",
          "Elle chiffre le trafic SNMP",
        ],
        answer: 0,
        explanation: `\`arpspoof\` envoie à \`10.62.0.10\` de fausses réponses ARP disant « **\`10.62.0.99\` = ma MAC** ». La victime **empoisonne son cache** et t'envoie désormais ses paquets SNMP destinés à l'agent. Elle ne bloque rien, n'installe rien et ne chiffre rien — elle **redirige** simplement le trafic vers toi.`,
        tags: ["snmp", "arpspoof", "poisoning"],
      },
      {
        id: "prat-snmp-t5",
        title: "Intercepter la communauté",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Intercepter la communauté (flag)

Avec \`arpspoof\` **toujours actif**, capture le trafic SNMP et attends la prochaine requête (~5 s) :

\`\`\`bash
tcpdump -i eth0 -A -s0 udp port 161
\`\`\`

Dans le paquet capturé, repère la **communauté** transmise **en clair** (juste après la version SNMP).

**Question :** colle la **communauté SNMP** interceptée.`,
        points: 300,
        timeLimitSec: 700,
        hints: [
          { text: "Rien ne s'affiche ? Vérifie que arpspoof tourne encore : « jobs ». S'il s'est arrêté, relance-le en arrière-plan.", cost: 20 },
          { text: "Utilise bien le filtre « udp port 161 » et l'option -A (ASCII) : la communauté apparaît en texte lisible dans la requête.", cost: 35 },
        ],
        answer: "CYBERACE{snmp_communaute_en_clair}",
        caseSensitive: true,
        explanation: `Une fois le trafic détourné, \`tcpdump -A\` affiche la requête SNMP **en clair** : la **communauté** \`CYBERACE{snmp_communaute_en_clair}\` y est lisible directement. Ce « mot de passe » circulait à découvert — quiconque capture le trafic l'obtient, et avec lui les droits d'interrogation de l'agent.`,
        tags: ["snmp", "interception", "flag"],
      },
      {
        id: "prat-snmp-t6",
        title: "Pourquoi SNMPv1/v2c expose ça",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔓 La cause

**Question :** pourquoi la **communauté SNMP** apparaît-elle en clair dans la capture ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "SNMPv1/v2c n'intègre ni chiffrement ni authentification robuste : la communauté sert de mot de passe transmis en texte brut",
          "Parce que arpspoof déchiffre automatiquement le trafic",
          "Parce que le port 161 n'est jamais surveillé",
          "Parce que la victime a désactivé le chiffrement manuellement",
        ],
        answer: 0,
        explanation: `**SNMPv1/v2c** est le coupable : il transmet la **communauté en texte brut** dans chaque paquet, **sans chiffrement ni authentification robuste**. \`arpspoof\` n'a rien déchiffré (il n'y avait rien à déchiffrer) — il a juste **amené** le paquet jusqu'à toi. Le problème est **structurel** au protocole, pas une désactivation manuelle.`,
        tags: ["snmp", "v2c", "clair"],
      },
      {
        id: "prat-snmp-t7",
        title: "La correction",
        order: 7,
        difficulty: "medium",
        type: "text",
        prompt: `## 🛡️ La bonne version

**Question :** quelle **version de SNMP** corrige ce problème en ajoutant **authentification** et **chiffrement** par utilisateur ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "SNMPv3",
        accept: ["snmp v3", "snmpv3", "version 3", "v3"],
        caseSensitive: false,
        explanation: `**SNMPv3** introduit le **modèle de sécurité par utilisateur (USM)** : **authentification** des messages (HMAC-MD5/SHA) et **chiffrement** du contenu (DES/AES). La communauté en clair disparaît au profit de vraies **clés par utilisateur** — c'est la version à imposer pour toute supervision.`,
        tags: ["snmp", "snmpv3", "correction"],
      },
      {
        id: "prat-snmp-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** au-delà de migrer vers SNMPv3, quelle **autre mesure simple** réduit le risque si SNMPv1/v2c doit rester en place temporairement ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Restreindre l'accès SNMP par pare-feu aux seules machines de supervision légitimes",
          "Changer la communauté toutes les heures automatiquement",
          "Désactiver complètement le protocole ARP",
          "Passer l'agent SNMP en HTTPS",
        ],
        answer: 0,
        explanation: `Si v1/v2c doit rester, **restreindre l'accès au port 161 par pare-feu** aux seules stations de supervision légitimes réduit fortement l'exposition (personne d'autre ne peut interroger l'agent). Changer la communauté toutes les heures ne l'empêche pas d'être capturée ; on ne peut pas « désactiver ARP » ; et SNMP ne « passe pas en HTTPS ». La vraie correction reste **SNMPv3**.`,
        tags: ["snmp", "pare-feu", "defense"],
      },
    ],
  },
];
