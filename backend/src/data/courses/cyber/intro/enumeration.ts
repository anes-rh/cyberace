import type { CourseSeed } from "../../../../types";

/** Cyber · Intro — Module 7 : énumération. */
export const enumeration: CourseSeed[] = [
  {
    slug: "cyi-enumeration",
    title: "Énumération",
    checkpoint: "cyber-intro",
    codename: "Deep Probe",
    domain: "Cybersécurité — Énumération",
    theme: "grid",
    icon: "Grid3x3",
    accent: "#9B8CCB",
    order: 7,
    difficulty: "hard",
    summary:
      "Extraire des informations précises des services exposés : noms d'utilisateurs, partages, comptes, tables de routage. Techniques (usernames, brute force AD, transfert de zone DNS, SNMP) et énumération service par service (NetBIOS, SNMP, LDAP, NTP, NFS, SMTP, DNS, IPsec, VoIP, RPC, Unix/Linux, SMB) avec leurs ports, puis contre-mesures.",
    objectives: [
      "Définir l'énumération et sa place après le scan",
      "Connaître les techniques (usernames, brute force AD, transfert de zone DNS, SNMP)",
      "Associer chaque service à énumérer à son port (NetBIOS, SNMP, LDAP, SMTP, DNS, SMB…)",
      "Comprendre ce que révèle chaque service (partages, comptes, communautés SNMP…)",
      "Citer les contre-mesures d'énumération",
    ],
    resources: [
      {
        label: "HackTricks — Pentesting des services par port",
        url: "https://book.hacktricks.xyz/",
        kind: "link",
        note: "Fiches détaillées par service/port (NetBIOS, SMB, SNMP, LDAP, SMTP…) : techniques d'énumération concrètes.",
      },
      {
        label: "Hack The Box Academy — Footprinting & Enumeration",
        url: "https://academy.hackthebox.com/",
        kind: "link",
        note: "Modules guidés sur l'énumération service par service.",
      },
      {
        label: "TryHackMe — salles d'énumération (gratuit)",
        url: "https://tryhackme.com/",
        kind: "link",
        note: "Salles pratiques en navigateur pour s'exercer à l'énumération (théorie du module ici, pratique là-bas).",
      },
    ],
    lesson: `# 🔬 Énumération — Deep Probe

Après avoir repéré les **services ouverts** (scan), l'**énumération** va **interroger activement** ces services pour en extraire des **informations exploitables** : noms d'utilisateurs, partages réseau, comptes, groupes, tables de routage. C'est une reconnaissance **active** et **détectable**. 🏎️

---

## 1. Qu'est-ce que l'énumération ? 📋

L'**énumération** établit une **connexion active** aux services d'une cible pour en **extraire** des détails :
- **noms d'utilisateurs et de groupes**,
- **partages réseau** et ressources,
- **comptes machines**, tables de routage,
- **bannières** détaillées (versions logicielles),
- informations d'annuaire, paramètres SNMP…

> 🧭 Place dans la chaîne : **Footprinting** (passif, large) → **Scan** (repérer hôtes/ports) → **Énumération** (extraire des détails précis des services trouvés). Chaque étape affine la connaissance de la cible.

---

## 2. Les grandes techniques 🧪

- **Extraction de noms d'utilisateurs** : deviner/collecter des **usernames** valides (via SMTP, SNMP, NetBIOS, annuaires…) — première étape avant une attaque de mots de passe.
- **Brute force de l'Active Directory** : interroger/forcer l'annuaire **AD** pour énumérer comptes et groupes (ex. via LDAP).
- **Transfert de zone DNS** (*zone transfer*, requête **AXFR**) : si un serveur DNS est **mal configuré**, il peut livrer **toute la zone** (tous les enregistrements : hôtes, sous-domaines, serveurs) d'un coup — un cadeau pour l'attaquant.
- **Énumération SNMP** : exploiter le protocole d'administration réseau pour lister interfaces, processus, comptes, tables de routage (voir ci-dessous).
- **Banner grabbing** : lire la **bannière** qu'un service renvoie à la connexion — elle trahit souvent le **logiciel et sa version** (ex. \`Apache/2.4.49\`, \`OpenSSH_8.2\`). Connaître la version = chercher ses **vulnérabilités** connues. Se fait avec \`telnet\`, \`netcat\` (\`nc\`) ou Nmap.
- **Sessions nulles** (*null sessions*) : sur les vieux Windows (NetBIOS/SMB), une connexion **anonyme** (sans identifiants) pouvait lister utilisateurs, groupes et partages. À bannir absolument.
- **RID cycling** : deviner les comptes Windows en parcourant les **RID** (le compte Administrateur a toujours le RID **500**, les premiers utilisateurs commencent à **1000**).

---

## 3. Énumération service par service (et leurs ports) 🔌

| Service | Port(s) | Ce qu'on peut énumérer |
|---|---|---|
| **NetBIOS** | **137/138 (UDP), 139 (TCP)** | noms de machines, partages, sessions, utilisateurs (Windows) |
| **SMB** | **445 (TCP)** | partages, utilisateurs, politiques (Windows moderne) |
| **SNMP** | **161 (UDP), 162 (trap)** | interfaces, comptes, processus, routes — via les **communautés** (souvent \`public\`/\`private\` par défaut !) |
| **LDAP** | **389 (TCP), 636 (LDAPS)** | annuaire : utilisateurs, groupes, structure de l'**Active Directory** |
| **NTP** | **123 (UDP)** | hôtes synchronisés, adresses internes, parfois liste de clients |
| **NFS** | **2049 (TCP)** | partages de fichiers exportés (Unix/Linux) et permissions |
| **SMTP** | **25 (TCP)** | validité d'**adresses email**/utilisateurs via les commandes \`VRFY\`, \`EXPN\`, \`RCPT TO\` |
| **DNS** | **53 (UDP/TCP)** | enregistrements ; **transfert de zone** (TCP) si mal configuré |
| **IPsec / IKE** | **500 (UDP)** | présence de VPN, configuration de tunnels |
| **VoIP (SIP)** | **5060 (UDP/TCP), 5061 (TLS)** | extensions, utilisateurs, serveurs de téléphonie |
| **RPC** | **135 (TCP, Windows)** | services et points de terminaison (endpoint mapper) |
| **Unix/Linux** | divers (\`finger\` 79, \`rusers\`, \`rpcinfo\`…) | utilisateurs connectés, services RPC |

**Points saillants :**
- **NetBIOS (139)** et **SMB (445)** sont les portes d'entrée classiques de l'énumération **Windows** (partages, comptes).
- **SNMP (161)** est souvent laissé avec les **communautés par défaut** (\`public\` en lecture, \`private\` en écriture) → mine d'informations.
- **SMTP (25)** : les commandes **\`VRFY\`** (vérifier un utilisateur) et **\`EXPN\`** (développer une liste) permettent de valider des adresses email.
- **LDAP (389)** est la clé de l'énumération **Active Directory**.
- **DNS (53)** : le **transfert de zone** se fait en **TCP** (les requêtes normales en UDP).

### À chaque service, ses outils 🧰

| Service | Outils courants |
|---|---|
| **SMB / NetBIOS** | \`enum4linux\`, \`smbclient\`, \`nbtstat\`, \`rpcclient\`, scripts **Nmap NSE** (\`smb-enum-*\`) |
| **SNMP** | \`snmpwalk\`, \`snmp-check\`, \`onesixtyone\` |
| **LDAP / AD** | \`ldapsearch\`, \`windapsearch\`, **BloodHound** (cartographie les chemins d'attaque AD) |
| **DNS** | \`dig\`, \`nslookup\`, \`host\`, \`dnsrecon\` (dont l'AXFR) |
| **SMTP** | \`smtp-user-enum\`, \`telnet\`/\`nc\` (VRFY/EXPN) |

> 🧠 Le couteau suisse reste **Nmap** et ses **scripts NSE** (\`--script\`) : ils automatisent l'énumération de la plupart de ces services en une commande.

---

## 4. Les contre-mesures 🛡️

Limiter l'énumération = **fermer, filtrer, durcir** :

- **Désactiver les services inutiles** (NetBIOS, SNMP, finger…) et **fermer les ports** correspondants.
- **SNMP** : changer les **communautés par défaut**, restreindre en lecture seule, filtrer par IP, préférer **SNMPv3** (authentifié/chiffré).
- **SMB/NetBIOS** : désactiver les **sessions nulles** (accès anonyme), restreindre les partages, appliquer le **moindre privilège**.
- **DNS** : **interdire les transferts de zone** aux serveurs non autorisés.
- **SMTP** : **désactiver \`VRFY\`/\`EXPN\`** sur le serveur de messagerie.
- **LDAP/AD** : limiter les requêtes anonymes, durcir les politiques.
- **Segmentation réseau** et **pare-feu** pour n'exposer que le strict nécessaire ; **surveillance** des connexions inhabituelles.

---

## 🧠 À retenir

- **Énumération** = **connexion active** aux services pour extraire **usernames, partages, comptes, routes** (détectable). Vient **après** le scan.
- Techniques : **extraction de usernames**, **brute force AD**, **transfert de zone DNS (AXFR)**, **énumération SNMP**, **banner grabbing** (version des services), **sessions nulles**, **RID cycling** (Admin = RID 500).
- Outils par service : SMB → \`enum4linux\`/\`smbclient\` ; SNMP → \`snmpwalk\` ; LDAP → \`ldapsearch\`/**BloodHound** ; DNS → \`dig\`/\`dnsrecon\` ; SMTP → \`smtp-user-enum\`. **Nmap NSE** automatise le tout.
- **Ports clés** : NetBIOS **137/138/139**, SMB **445**, SNMP **161/162**, LDAP **389/636**, NTP **123**, NFS **2049**, SMTP **25**, DNS **53**, IPsec/IKE **500**, SIP **5060/5061**, RPC **135**.
- **SMTP** : commandes **\`VRFY\`/\`EXPN\`** pour valider des emails ; **SNMP** : communautés par défaut **\`public\`/\`private\`** ; **DNS** : transfert de zone en **TCP**.
- Contre-mesures : **désactiver les services inutiles**, **SNMPv3** + changer les communautés, **désactiver sessions nulles SMB**, **interdire les transferts de zone**, **désactiver VRFY/EXPN**, segmenter et filtrer.`,
    badge: {
      id: "badge-cyi-deep-probe",
      name: "Deep Probe",
      icon: "Grid3x3",
      description: "Énumère les services (NetBIOS, SNMP, LDAP, SMTP, DNS, SMB…), leurs ports et les contre-mesures.",
    },
    challenges: [
      {
        id: "cyi-enum-place",
        title: "Où se place l'énumération ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 📋 Chaîne de reconnaissance

Dans quel ordre s'enchaînent ces trois phases ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Du plus large/passif au plus précis/actif.", cost: 10 },
          { text: "📖 Correction : Footprinting → Scan → Énumération.", cost: 30 },
        ],
        options: [
          "Footprinting → Scan → Énumération",
          "Énumération → Scan → Footprinting",
          "Scan → Footprinting → Énumération",
          "Énumération → Footprinting → Scan",
        ],
        answer: 0,
        explanation: `**Footprinting** (passif, vue large) → **Scan** (repérer hôtes et ports ouverts) → **Énumération** (interroger activement les services trouvés pour extraire usernames, partages, comptes). Chaque phase **affine** la connaissance ; l'énumération est la plus **précise** et la plus **intrusive** des trois.`,
        tags: ["enumeration", "methodologie", "recon"],
      },
      {
        id: "cyi-enum-smb",
        title: "Le port de SMB",
        order: 2,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔌 Ports

Sur quel **numéro de port TCP** écoute le service **SMB** (partages de fichiers Windows modernes) ?`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "Un port bien connu de Windows, différent du 139 (NetBIOS).", cost: 15 },
          { text: "📖 Correction : 445.", cost: 40 },
        ],
        answer: 445,
        explanation: `**SMB** écoute sur le port **445/TCP** (Windows moderne). Le **NetBIOS** historique utilise **137/138 (UDP)** et **139 (TCP)**. SMB et NetBIOS sont les portes d'entrée classiques de l'énumération **Windows** : partages, utilisateurs, sessions.`,
        tags: ["smb", "ports", "enumeration"],
      },
      {
        id: "cyi-enum-snmp",
        title: "Les communautés SNMP",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📡 SNMP

Pourquoi le service **SNMP** (port 161) est-il si souvent une mine d'or pour l'énumération ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "Les 'communautés' par défaut sont rarement changées.", cost: 20 },
          { text: "📖 Correction : les communautés par défaut (public/private) sont souvent laissées telles quelles.", cost: 50 },
        ],
        options: [
          "Les chaînes de communauté par défaut (public en lecture, private en écriture) sont souvent laissées inchangées",
          "SNMP chiffre tout par défaut de façon incassable",
          "SNMP est un protocole récent et rare",
          "SNMP ne révèle jamais aucune information",
        ],
        answer: 0,
        explanation: `**SNMP** (161/UDP) est fréquemment déployé avec ses **communautés par défaut** : \`public\` (lecture) et \`private\` (écriture). Non changées, elles donnent accès à une foule d'informations (interfaces, comptes, processus, tables de routage). Contre-mesure : changer les communautés, restreindre en lecture, filtrer par IP, et surtout passer à **SNMPv3** (authentifié et chiffré).`,
        tags: ["snmp", "communautes", "enumeration"],
      },
      {
        id: "cyi-enum-zonetransfer",
        title: "Le transfert de zone DNS",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🌍 DNS zone transfer

Qu'obtient un attaquant si un serveur **DNS mal configuré** autorise un **transfert de zone** (AXFR) ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Il récupère TOUTE la zone d'un coup.", cost: 25 },
          { text: "📖 Correction : la liste complète des enregistrements DNS (hôtes, sous-domaines, serveurs).", cost: 60 },
        ],
        options: [
          "La totalité des enregistrements de la zone (tous les hôtes, sous-domaines, serveurs) d'un seul coup",
          "Le mot de passe root du serveur DNS",
          "Le contenu chiffré de tous les emails",
          "Rien, c'est impossible",
        ],
        answer: 0,
        explanation: `Un **transfert de zone** (requête **AXFR**, en **TCP**) mal protégé livre **toute la zone DNS** : chaque hôte, sous-domaine et serveur enregistré — une **cartographie complète** de l'infrastructure, offerte d'un coup. Contre-mesure : **n'autoriser les transferts qu'aux serveurs secondaires légitimes** (par IP), jamais au public.`,
        tags: ["dns", "zone-transfer", "axfr"],
      },
      {
        id: "cyi-enum-smtp",
        title: "Valider des emails via SMTP",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ✉️ SMTP

Quelles commandes **SMTP** permettent à un attaquant de **valider l'existence d'adresses/utilisateurs** email ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "VeRiFY et EXPaNd.", cost: 20 },
          { text: "📖 Correction : VRFY et EXPN (à désactiver côté serveur).", cost: 50 },
        ],
        options: [
          "VRFY et EXPN",
          "GET et POST",
          "SELECT et INSERT",
          "PING et TRACERT",
        ],
        answer: 0,
        explanation: `Les commandes **\`VRFY\`** (*verify* : vérifier qu'un utilisateur existe) et **\`EXPN\`** (*expand* : développer une liste de diffusion) permettent d'**énumérer des adresses email** valides sur un serveur SMTP (port 25). La contre-mesure : **désactiver \`VRFY\`/\`EXPN\`** sur le serveur de messagerie. (GET/POST = HTTP, SELECT/INSERT = SQL.)`,
        tags: ["smtp", "vrfy", "expn", "enumeration"],
      },
    ],
  },
];
