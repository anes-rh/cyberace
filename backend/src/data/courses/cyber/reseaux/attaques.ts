import type { CourseSeed } from "../../../../types";

/** Cyber · Réseaux — Module 2 : types et sources d'attaques réseau. */
export const attaques: CourseSeed[] = [
  {
    slug: "cyr-attaques",
    title: "Types et sources d'attaques réseau",
    checkpoint: "cyber-reseaux",
    codename: "Attack Vectors",
    domain: "Réseaux — Attaques",
    theme: "grid",
    icon: "Swords",
    accent: "#5FB3C6",
    order: 2,
    difficulty: "medium",
    summary:
      "Le catalogue des attaques réseau : déni de service (DoS/DDoS, SYN flood, Smurf, UDP/ICMP flood), intrusion, spamming, usurpation (ARP spoofing, IP spoofing), attaques sur TCP/UDP/ICMP (hijacking, Ping of Death, fragmentation) et failles applicatives. Comprendre chaque mécanisme et sa parade.",
    objectives: [
      "Distinguer les grandes familles d'attaques réseau et leur cible (critère CIA)",
      "Expliquer les attaques DoS/DDoS (SYN flood, Smurf, UDP/ICMP flood)",
      "Décrire l'usurpation : ARP spoofing et IP spoofing",
      "Comprendre les attaques sur TCP/UDP/ICMP (hijacking, fragmentation, Ping of Death)",
      "Situer intrusion, spamming et failles applicatives dans le paysage des menaces",
    ],
    resources: [
      {
        label: "MITRE ATT&CK — matrice des techniques adverses",
        url: "https://attack.mitre.org/",
        kind: "link",
        note: "Référentiel des techniques d'attaque (reconnaissance, accès, mouvement latéral, C2, impact).",
      },
      {
        label: "OWASP — Top 10 des risques applicatifs",
        url: "https://owasp.org/www-project-top-ten/",
        kind: "link",
        note: "Les principales failles applicatives (injection, authentification cassée…) à connaître côté serveurs exposés.",
      },
    ],
    lesson: `# ⚔️ Types et sources d'attaques réseau — Attack Vectors

Pour défendre un réseau, il faut **connaître l'arsenal offensif**. Ce module recense les attaques **par famille**, du déni de service à l'usurpation, en expliquant leur **mécanisme** et le **critère de sécurité** qu'elles visent. *(Théorie uniquement — aucune manipulation d'outil.)* 🏎️

---

## 1. Le déni de service (DoS / DDoS) 📉

Le **déni de service** vise la **disponibilité** : rendre un service, un serveur ou un lien **inaccessible** en l'**épuisant** ou en le **saturant**.
- **DoS** : depuis **une** source.
- **DDoS** (*Distributed DoS*) : depuis **des milliers** de sources simultanées — typiquement un **botnet** (réseau de machines zombies). Bien plus puissant et difficile à filtrer.

### Attaques DoS emblématiques

- **SYN flood** (attaque TCP) : exploite le **three-way handshake** (SYN → SYN-ACK → ACK). L'attaquant envoie des **SYN** en masse (souvent avec IP source usurpée) **sans jamais répondre** par le ACK final. Le serveur garde des **connexions à moitié ouvertes** (*half-open*) dans une file d'attente qui **sature** → il ne peut plus accepter de vraies connexions. Parade : **SYN cookies**, limitation de débit.
- **UDP flood** : inonder des ports avec des paquets **UDP** ; le serveur cherche l'application associée, ne trouve rien, répond par des **ICMP « port unreachable »** → il s'épuise.
- **ICMP flood / Ping flood** : submerger la cible de **ping** (echo request).
- **Smurf attack** : l'attaquant envoie des **ping** avec **l'IP source usurpée** (celle de la victime) vers une **adresse de broadcast** → **tout** le réseau répond à la victime, qui est **noyée** sous les réponses (**amplification**). Variante **Fraggle** = même principe en **UDP**.
- **Ping of Death** : envoyer un paquet ICMP **surdimensionné** (> 65 535 octets une fois réassemblé) pour faire **planter** des piles réseau anciennes.
- **Attaques par amplification** (DNS, NTP…) : petite requête usurpée → **grosse** réponse renvoyée à la victime (facteur d'amplification élevé).

> 🧠 Point commun : le DoS ne **vole rien** — il détruit la **disponibilité**. Les DDoS modernes combinent **volume** (saturer la bande passante) et **épuisement d'état** (saturer les tables de connexion). Parades : filtrage, **anti-DDoS**, sur-dimensionnement, **rate limiting**.

---

## 2. L'intrusion 🕵️

L'**intrusion** est l'**accès non autorisé** à un système ou un réseau. C'est un **objectif** (pénétrer) plutôt qu'une technique unique. L'attaquant enchaîne généralement :
1. **Reconnaissance** (scan de ports, énumération de services).
2. **Exploitation** d'une **vulnérabilité** (service non patché, mot de passe faible, mauvaise configuration).
3. **Élévation de privilèges** et **persistance** (installer une porte dérobée).
4. **Mouvement latéral** vers d'autres machines.

Une intrusion vise selon les cas la **confidentialité** (voler des données), l'**intégrité** (modifier) ou la **disponibilité** (sabotage). Parades : **durcissement**, **correctifs**, **segmentation**, **IDS/IPS** (module 5).

---

## 3. Le spamming ✉️

Le **spam** est l'envoi **massif de messages non sollicités** (courriels publicitaires, escroqueries). Au-delà de la nuisance, il est un **vecteur** de :
- **phishing** (hameçonnage : voler des identifiants via de faux messages),
- **malware** (pièces jointes/liens piégés),
- **arnaques** et **fraude**.

Un serveur de messagerie mal protégé peut aussi être détourné en **relais ouvert** (*open relay*) pour émettre du spam au nom de la victime. Parades : **filtres anti-spam**, **SPF/DKIM/DMARC** (authentification des e-mails), sensibilisation.

---

## 4. L'usurpation (spoofing) 🎭

**Usurper**, c'est se faire passer pour une autre entité en **falsifiant une identité réseau**.

### ARP spoofing (couche 2)

L'attaquant envoie de **fausses réponses ARP** pour associer **son adresse MAC** à l'**IP d'une autre machine** (souvent la passerelle). Les victimes lui envoient alors leur trafic → **homme du milieu (MITM)**, écoute, modification. *(Détaillé au module 3.)* Vise l'**intégrité** et la **confidentialité**.

### IP spoofing (couche 3)

L'attaquant **falsifie l'adresse IP source** de ses paquets pour :
- **masquer** son origine (anonymat),
- **usurper** une machine de confiance (contourner un filtrage basé sur l'IP),
- **rediriger** les réponses vers une victime (base des attaques par **amplification/Smurf**).

L'IP spoofing est **facile en UDP/ICMP** (sans connexion), plus dur en **TCP** (il faut deviner les **numéros de séquence** pour compléter le handshake). Parades : **filtrage anti-spoofing** (BCP 38 : un routeur rejette les paquets dont l'IP source n'appartient pas au réseau d'où ils viennent), authentification cryptographique plutôt que par IP.

---

## 5. Les attaques sur TCP / UDP / ICMP 🔌

Chaque protocole de transport/réseau a ses faiblesses exploitables :

**TCP**
- **SYN flood** (voir §1).
- **TCP session hijacking** (détournement de session) : l'attaquant **prédit/observe** les numéros de séquence d'une session TCP établie et **injecte** ses propres paquets pour **prendre la main** sur la connexion (en se plaçant en MITM ou en devinant les séquences).
- **RST/FIN injection** : forger des paquets **RST** pour **couper** brutalement des connexions (DoS ciblé).

**UDP**
- **UDP flood** (voir §1), attaques par **amplification** (DNS, NTP, SNMP) qui exploitent l'absence de connexion pour **usurper** l'IP source.

**ICMP**
- **ICMP flood / Ping flood**, **Smurf** (§1), **Ping of Death**.
- **ICMP redirect** : forger des messages ICMP « redirect » pour **modifier les tables de routage** d'un hôte et détourner son trafic.
- **Reconnaissance** : le ping et le traceroute servent à **cartographier** le réseau (d'où le filtrage fréquent de l'ICMP en bordure).

> 🧭 Fil conducteur : les protocoles historiques ont été conçus **sans authentification** ni contrôle d'intégrité. On les exploite en **usurpant** (spoofing), en **saturant** (flood) ou en **injectant** (hijacking). La défense passe par le **filtrage**, le **chiffrement/authentification** des couches supérieures et la **surveillance**.

---

## 6. Les failles applicatives 🐛

Au-dessus du réseau, les **applications** exposées (serveurs web, services) sont une cible majeure. Exemples :
- **Injection** (SQL, commande, LDAP) : envoyer des données piégées qu'une application interprète comme du **code/une requête** (ex. **injection SQL** → lire/modifier la base — module 9).
- **Débordement de tampon** (*buffer overflow*) : dépasser la taille d'une zone mémoire pour **exécuter du code**.
- **Authentification/session cassées**, **XSS**, **désérialisation**, **mauvaise configuration**…

Ces failles sont référencées (ex. **OWASP Top 10**) et souvent liées à des **CVE** (vulnérabilités publiques). Parades : **développement sécurisé**, **validation des entrées**, **correctifs**, **pare-feu applicatif (WAF)** — module 7.

---

## 🧠 À retenir

- **DoS/DDoS** visent la **disponibilité** : **SYN flood** (connexions TCP half-open), **UDP/ICMP flood**, **Smurf/Fraggle** (amplification par broadcast + IP usurpée), **Ping of Death** (paquet surdimensionné), **amplification DNS/NTP**. **DDoS** = distribué via **botnet**. Parades : **rate limiting**, **SYN cookies**, anti-DDoS.
- **Intrusion** = accès **non autorisé** (recon → exploit → élévation → persistance → latéral). **Spamming** = messages massifs non sollicités, vecteur de **phishing/malware** (parades **SPF/DKIM/DMARC**).
- **Usurpation** : **ARP spoofing** (L2, associe sa MAC à l'IP d'autrui → MITM) ; **IP spoofing** (L3, falsifie l'IP source ; facile en UDP/ICMP, dur en TCP à cause des **numéros de séquence**). Parade IP : **filtrage anti-spoofing (BCP 38)**.
- **TCP** : SYN flood, **session hijacking** (prédiction des numéros de séquence), **RST injection**. **UDP** : flood/amplification. **ICMP** : flood, Smurf, **Ping of Death**, **ICMP redirect** (détourner le routage).
- **Failles applicatives** : **injection SQL**, buffer overflow, XSS… (OWASP Top 10, CVE). Parades : validation des entrées, correctifs, **WAF**.
- Cause profonde récurrente : des protocoles conçus **sans authentification/intégrité** → exploités par **spoofing, flood, injection**.`,
    badge: {
      id: "badge-cyr-attack-vectors",
      name: "Attack Vectors",
      icon: "Swords",
      description: "Connaît les familles d'attaques réseau (DoS, spoofing, hijacking, failles applicatives) et leurs parades.",
    },
    challenges: [
      {
        id: "cyr-att-synflood",
        title: "Le SYN flood",
        order: 1,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 📉 DoS sur TCP

Comment un **SYN flood** met-il un serveur hors service ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Il exploite le three-way handshake TCP : SYN → SYN-ACK → … jamais de ACK.", cost: 30 },
          { text: "📖 Correction : masse de SYN sans ACK final → file de connexions half-open saturée.", cost: 80 },
        ],
        options: [
          "En envoyant une masse de SYN sans jamais renvoyer le ACK final, saturant la file des connexions half-open",
          "En chiffrant toutes les données du serveur",
          "En devinant le mot de passe administrateur",
          "En coupant le câble d'alimentation",
        ],
        answer: 0,
        explanation: `Le **SYN flood** exploite le **three-way handshake** TCP : l'attaquant envoie des **SYN** en masse (IP source souvent usurpée) et **ne complète jamais** par le **ACK**. Le serveur accumule des **connexions half-open** jusqu'à **saturer** sa file → il refuse les vraies connexions. Parade : **SYN cookies**, limitation de débit. C'est une attaque de **disponibilité**.`,
        tags: ["dos", "syn-flood", "tcp"],
      },
      {
        id: "cyr-att-smurf",
        title: "L'attaque Smurf",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 📡 Amplification

Dans une attaque **Smurf**, pourquoi la victime est-elle noyée sous un trafic bien supérieur à ce que l'attaquant émet ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Ping vers une adresse de broadcast, avec l'IP source usurpée = celle de la victime.", cost: 30 },
          { text: "📖 Correction : broadcast + IP source usurpée → tout le réseau répond à la victime (amplification).", cost: 80 },
        ],
        options: [
          "Il envoie des ping vers une adresse de broadcast en usurpant l'IP de la victime : tout le réseau répond à la victime",
          "Il double manuellement chaque paquet qu'il envoie",
          "Il utilise un câble à très haut débit",
          "Il chiffre les paquets pour les rendre plus lourds",
        ],
        answer: 0,
        explanation: `Le **Smurf** envoie des **ICMP echo request** vers une **adresse de broadcast** en **usurpant l'IP source** (celle de la victime). **Chaque** machine du réseau répond → la victime reçoit une **avalanche** de réponses : c'est l'**amplification**. La variante **Fraggle** fait pareil en **UDP**. Parade : ne pas router le broadcast dirigé, filtrage anti-spoofing.`,
        tags: ["smurf", "amplification", "icmp"],
      },
      {
        id: "cyr-att-ipspoof",
        title: "IP spoofing et TCP",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🎭 Usurpation d'IP

Pourquoi l'**IP spoofing** est-il plus **difficile** à exploiter contre une connexion **TCP** que contre de l'UDP ou de l'ICMP ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "TCP établit une connexion avec un handshake et des numéros de séquence à respecter.", cost: 30 },
          { text: "📖 Correction : il faut deviner les numéros de séquence TCP pour compléter le handshake.", cost: 80 },
        ],
        options: [
          "Parce qu'en TCP il faut deviner/observer les numéros de séquence pour compléter le handshake et rester synchronisé",
          "Parce que TCP chiffre toujours l'adresse IP source",
          "Parce que l'UDP est un protocole plus récent et plus sûr",
          "Parce que l'ICMP interdit toute usurpation",
        ],
        answer: 0,
        explanation: `**UDP/ICMP** sont **sans connexion** : usurper l'IP source suffit. **TCP** exige un **handshake** et le respect des **numéros de séquence** : pour usurper une IP et injecter des paquets acceptés, l'attaquant doit **prédire/observer** ces numéros — beaucoup plus dur (sauf en position MITM). Parade générale : **filtrage anti-spoofing (BCP 38)**.`,
        tags: ["ip-spoofing", "tcp", "numeros-sequence"],
      },
      {
        id: "cyr-att-hijack",
        title: "Détournement de session",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔌 Attaque TCP

Comment nomme-t-on l'attaque où, sur une session TCP **déjà établie**, l'attaquant s'insère et **injecte ses propres paquets** (en observant/prédisant les numéros de séquence) pour prendre le contrôle de la connexion ?

*(Réponds par le terme, en français ou en anglais.)*`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "En anglais : session hijacking.", cost: 15 },
          { text: "📖 Correction : le détournement de session (TCP session hijacking).", cost: 40 },
        ],
        answer: "session hijacking",
        accept: ["session hijacking", "tcp session hijacking", "hijacking", "détournement de session", "detournement de session", "détournement de session tcp", "vol de session"],
        caseSensitive: false,
        explanation: `Le **détournement de session** (*TCP session hijacking*) consiste à **s'insérer dans une session TCP établie** et à **injecter des paquets** en respectant les **numéros de séquence** (observés en MITM ou prédits). L'attaquant **prend la main** sur la connexion légitime. Parades : chiffrement de bout en bout (TLS), séquences aléatoires, anti-spoofing.`,
        tags: ["hijacking", "tcp", "session"],
      },
      {
        id: "cyr-att-familles",
        title: "Attaque et critère visé",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔺 Cible de l'attaque

Quel **critère de sécurité** une attaque de **déni de service (DoS)** vise-t-elle en priorité ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Le service devient inaccessible.", cost: 20 },
          { text: "📖 Correction : la disponibilité.", cost: 50 },
        ],
        options: [
          "La disponibilité",
          "La confidentialité",
          "La non-répudiation",
          "L'authenticité",
        ],
        answer: 0,
        explanation: `Le **DoS/DDoS** vise la **disponibilité** : il rend le service **inaccessible** par saturation ou épuisement, sans nécessairement voler ni modifier de données. Une **écoute** viserait la confidentialité, une **falsification** l'intégrité, une **usurpation** l'authenticité.`,
        tags: ["dos", "disponibilite", "cia"],
      },
      {
        id: "cyr-att-spam",
        title: "Le spam comme vecteur",
        order: 6,
        difficulty: "easy",
        type: "multi",
        prompt: `## ✉️ Spamming

Au-delà de la simple nuisance, le **spam** sert fréquemment de **vecteur** à quelles attaques ? (Coche tout ce qui s'applique.)`,
        points: 200,
        timeLimitSec: 300,
        options: [
          "Le phishing (hameçonnage : voler des identifiants via de faux messages)",
          "La diffusion de malware (pièces jointes / liens piégés)",
          "Les arnaques et la fraude",
          "L'augmentation de la bande passante du destinataire",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Trois usages malveillants réels ; le quatrième est absurde.", cost: 20 },
          { text: "📖 Correction : phishing, malware, arnaques. Pas d'augmentation de bande passante.", cost: 50 },
        ],
        explanation: `Le **spam** est un **vecteur** de **phishing** (vol d'identifiants), de **malware** (pièces jointes/liens piégés) et d'**arnaques/fraude**. Il ne « donne » évidemment pas de bande passante. Parades : **filtres anti-spam**, authentification des e-mails (**SPF/DKIM/DMARC**), sensibilisation des utilisateurs.`,
        tags: ["spam", "phishing", "malware"],
      },
    ],
  },
];
