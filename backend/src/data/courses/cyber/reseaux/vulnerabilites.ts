import type { CourseSeed } from "../../../../types";

/** Cyber · Réseaux — Module 9 : vulnérabilités réseau avancées (tableau vuln→attaque→contre-mesure). */
export const vulnerabilites: CourseSeed[] = [
  {
    slug: "cyr-vulnerabilites",
    title: "Vulnérabilités réseau avancées",
    checkpoint: "cyber-reseaux",
    codename: "Weak Points",
    domain: "Réseaux — Vulnérabilités",
    theme: "grid",
    icon: "Bug",
    accent: "#5FB3C6",
    order: 9,
    difficulty: "hard",
    summary:
      "Le référentiel des faiblesses réseau, sous forme vulnérabilité → attaque → conséquences → contre-mesures → outils : absence de chiffrement, pare-feu mal configuré, ARP non sécurisé, absence de MFA, ports inutiles, systèmes non patchés (CVE), DNS non sécurisé, SSH faible, absence de segmentation VLAN, SNMP non sécurisé, injection SQL, mauvaise gestion des certificats TLS, absence de SIEM.",
    objectives: [
      "Associer chaque vulnérabilité réseau à l'attaque qu'elle rend possible",
      "Anticiper les conséquences concrètes de chaque faiblesse",
      "Connaître la contre-mesure adaptée à chaque vulnérabilité",
      "Identifier les catégories d'outils d'audit/exploitation (à titre de compréhension)",
      "Prioriser les corrections selon l'impact (chiffrement, MFA, correctifs, SIEM…)",
    ],
    resources: [
      {
        label: "MITRE — CVE / CWE (vulnérabilités et faiblesses cataloguées)",
        url: "https://cve.mitre.org/",
        kind: "link",
        note: "Le référentiel public des vulnérabilités (CVE) et des types de faiblesses (CWE).",
      },
      {
        label: "OWASP Top 10 — risques applicatifs (injection, TLS…)",
        url: "https://owasp.org/www-project-top-ten/",
        kind: "link",
        note: "Les grands risques applicatifs, dont l'injection SQL et la mauvaise gestion cryptographique.",
      },
    ],
    lesson: `# 🐛 Vulnérabilités réseau avancées — Weak Points

Ce module est un **référentiel** : pour chaque **vulnérabilité** courante, on relie la **faiblesse** → l'**attaque** qu'elle permet → ses **conséquences** → la **contre-mesure** → les **catégories d'outils** utilisés (côté audit/attaque). *(Les outils sont cités pour la **compréhension** — aucune manipulation n'est demandée.)* C'est la synthèse défensive de tout ce qui précède. 🏎️

---

## 1. Absence de chiffrement réseau 🔓

- **Attaque** : écoute passive (*sniffing*), MITM → capture d'identifiants, de données, de sessions.
- **Conséquences** : fuite de données confidentielles, vol de comptes, atteinte à la vie privée.
- **Contre-mesures** : **TLS/HTTPS partout**, **SSH** (pas Telnet/FTP), **VPN/IPsec**, **MACsec** sur le LAN.
- **Outils (compréhension)** : analyseurs de trafic (type *Wireshark/tcpdump*), outils de MITM.

## 2. Mauvaise configuration du pare-feu 🚧

- **Attaque** : exploitation de **règles trop permissives**, ports laissés ouverts, règles obsolètes.
- **Conséquences** : accès non autorisé, contournement du périmètre, exfiltration.
- **Contre-mesures** : **default deny**, **moindre privilège**, **revue régulière** des règles, journalisation, tests de conformité.
- **Outils** : scanners de ports (type *Nmap*), outils d'audit de règles.

## 3. Protocole ARP non sécurisé 🧩

- **Attaque** : **ARP spoofing/poisoning** → MITM de couche 2 (module 3).
- **Conséquences** : interception/altération du trafic LAN, vol de session.
- **Contre-mesures** : **DHCP Snooping + Dynamic ARP Inspection (DAI)**, **Port Security**, ARP ACL statiques.
- **Outils** : outils d'empoisonnement ARP (type *ettercap/arpspoof*).

## 4. Absence d'authentification multi-facteur (MFA) 🔑

- **Attaque** : réutilisation d'identifiants volés, **brute-force**, *credential stuffing*, phishing.
- **Conséquences** : compromission de comptes (même avec mot de passe « correct » mais fuité).
- **Contre-mesures** : **MFA** (≥ 2 facteurs de catégories différentes), politiques de mots de passe, détection d'anomalies de connexion.
- **Outils** : outils de brute-force/credential stuffing (type *Hydra*).

## 5. Services / ports inutiles ouverts 🚪

- **Attaque** : **reconnaissance** (scan), exploitation d'un service superflu et vulnérable.
- **Conséquences** : surface d'attaque **élargie**, point d'entrée inattendu.
- **Contre-mesures** : **durcissement** (désactiver services/ports inutiles), **inventaire**, principe du **minimum nécessaire**.
- **Outils** : scanners (type *Nmap*, *Masscan*).

## 6. Systèmes non patchés (CVE) 🩹

- **Attaque** : exploitation d'une **vulnérabilité connue** (référencée **CVE**) via un **exploit** public.
- **Conséquences** : compromission, prise de contrôle, propagation (vers/ransomware).
- **Contre-mesures** : **gestion des correctifs** (patch management), **veille CVE**, **scanner de vulnérabilités**, priorisation par criticité (CVSS).
- **Outils** : scanners de vulnérabilités (type *Nessus/OpenVAS*), frameworks d'exploitation (type *Metasploit*).

## 7. Protocole DNS non sécurisé 🧭

- **Attaque** : **empoisonnement de cache**, DNS spoofing, tunneling (module 8).
- **Conséquences** : redirection vers des sites pirates (phishing/MITM), exfiltration cachée.
- **Contre-mesures** : **DNSSEC**, résolveurs **non ouverts**, **DoH/DoT**, surveillance des requêtes.
- **Outils** : outils de spoofing DNS (type *dnsspoof*).

## 8. SSH avec mot de passe faible 🖥️

- **Attaque** : **brute-force / dictionnaire** sur le service SSH exposé.
- **Conséquences** : accès administrateur distant, pivot vers le reste du réseau.
- **Contre-mesures** : **authentification par clés** (désactiver le mot de passe), **désactiver root**, **fail2ban**, restreindre par pare-feu, **MFA**.
- **Outils** : brute-force SSH (type *Hydra*, *Medusa*).

## 9. Absence de segmentation VLAN 🧱

- **Attaque** : **mouvement latéral** libre — une machine compromise atteint **tout** le réseau (« réseau plat »).
- **Conséquences** : propagation rapide (ransomware), accès aux systèmes sensibles depuis n'importe où.
- **Contre-mesures** : **segmentation VLAN**, **micro-segmentation**, ACL inter-VLAN, isolation IoT/invités.
- **Outils** : outils de découverte/pivot réseau.

## 10. Protocole SNMP non sécurisé 📟

- **Attaque** : **SNMP v1/v2c** avec *community strings* par défaut (« public »/« private ») → lecture (voire écriture) de la configuration des équipements.
- **Conséquences** : fuite d'informations sur l'infrastructure, reconfiguration malveillante d'équipements.
- **Contre-mesures** : **SNMPv3** (authentification + chiffrement), changer/supprimer les *communities* par défaut, restreindre par ACL, désactiver si inutile.
- **Outils** : outils d'énumération SNMP (type *snmpwalk*, *onesixtyone*).

## 11. Injection SQL 💉

- **Attaque** : injecter du **SQL** via des entrées non filtrées d'une application web → l'application exécute la requête de l'attaquant.
- **Conséquences** : lecture/modification/suppression de la **base**, contournement d'authentification, parfois exécution de commandes.
- **Contre-mesures** : **requêtes paramétrées** (*prepared statements*), **validation/échappement** des entrées, **moindre privilège** du compte SQL, **WAF** (module 7).
- **Outils** : outils d'injection automatisée (type *sqlmap*).

## 12. Mauvaise gestion des certificats TLS 📜

- **Attaque** : exploitation d'un **certificat expiré**, **auto-signé accepté**, faible, ou d'une **CA compromise** ; **downgrade** TLS.
- **Conséquences** : MITM sur des connexions « chiffrées », usurpation de service, perte de confiance.
- **Contre-mesures** : **cycle de vie** des certificats (renouvellement/révocation), **automatisation** (ex. ACME), **TLS 1.2/1.3** uniquement, **HSTS**, surveillance des expirations.
- **Outils** : scanners TLS (type *sslscan*, *testssl.sh*).

## 13. Absence de SIEM 📊

- **Attaque** : les intrusions **passent inaperçues** faute de corrélation des journaux → l'attaquant **persiste** longtemps (temps de détection élevé).
- **Conséquences** : détection tardive, investigation impossible (pas de traces centralisées), impact aggravé.
- **Contre-mesures** : **SIEM** (*Security Information and Event Management*) : **centraliser** et **corréler** les logs, **alerter**, alimenter un **SOC** ; compléter par **IDS/IPS** et **EDR**.
- **Outils** : plateformes SIEM/collecte de logs.

---

## 🧠 Vue d'ensemble

\`\`\`
   VULNÉRABILITÉ            →  ATTAQUE                 →  CONTRE-MESURE CLÉ
   ─────────────────────────────────────────────────────────────────────
   Pas de chiffrement       →  sniffing / MITM         →  TLS/SSH/VPN/MACsec
   Pare-feu mal configuré   →  accès non autorisé      →  default deny + revue
   ARP non sécurisé         →  ARP poisoning (MITM L2) →  DHCP Snooping + DAI
   Pas de MFA               →  vol/brute-force de compte → MFA
   Ports inutiles ouverts   →  recon + exploit         →  durcissement
   Systèmes non patchés     →  exploit de CVE          →  patch management
   DNS non sécurisé         →  cache poisoning         →  DNSSEC
   SSH faible               →  brute-force             →  clés + fail2ban
   Pas de segmentation VLAN →  mouvement latéral       →  VLAN / micro-segmentation
   SNMP non sécurisé        →  fuite/reconfig via v1/2c →  SNMPv3
   Injection SQL            →  vol/altération de la BDD →  requêtes paramétrées + WAF
   Mauvaise gestion TLS     →  MITM sur "HTTPS"        →  cycle de vie + TLS 1.2/1.3
   Pas de SIEM              →  intrusion non détectée  →  SIEM + SOC
\`\`\`

> 🧠 Priorisation type : le **chiffrement**, la **MFA**, la **gestion des correctifs (CVE)** et la **journalisation/SIEM** offrent le meilleur rapport impact/effort — ce sont les **fondations**. La **segmentation** et le **durcissement** limitent la **propagation**. Les **outils** cités servent aussi bien à **auditer** (côté défense) qu'à **attaquer** (côté offensif) : les connaître, c'est comprendre la menace.

---

## 🧠 À retenir

- Chaque **vulnérabilité** ouvre une **attaque** précise et appelle une **contre-mesure** dédiée : **pas de chiffrement** → sniffing/MITM (→ **TLS/SSH/VPN/MACsec**) ; **ARP non sécurisé** → poisoning (→ **DHCP Snooping + DAI**) ; **pas de MFA** → comptes volés (→ **MFA**).
- **Ports inutiles** → surface élargie (→ **durcissement**) ; **systèmes non patchés** → **exploit de CVE** (→ **patch management**) ; **DNS** → cache poisoning (→ **DNSSEC**) ; **SSH faible** → brute-force (→ **clés + fail2ban**).
- **Pas de segmentation VLAN** → **mouvement latéral** (→ **segmentation**) ; **SNMP v1/2c** → fuite/reconfig (→ **SNMPv3**) ; **injection SQL** → vol de BDD (→ **requêtes paramétrées + WAF**).
- **Mauvaise gestion des certificats TLS** → MITM sur « HTTPS » (→ **cycle de vie, TLS 1.2/1.3, HSTS**) ; **pas de SIEM** → intrusion **non détectée** (→ **SIEM + SOC**, corrélation des logs).
- Les **outils** (scanners, MITM, brute-force, injection, SIEM) sont **duaux** : audit **et** attaque. **Fondations prioritaires** : chiffrement, MFA, correctifs, journalisation/SIEM ; **segmentation/durcissement** pour contenir la propagation.`,
    badge: {
      id: "badge-cyr-weak-points",
      name: "Weak Points",
      icon: "Bug",
      description: "Relie chaque vulnérabilité réseau à son attaque et à sa contre-mesure adaptée.",
    },
    challenges: [
      {
        id: "cyr-vuln-mfa",
        title: "Le remède au vol d'identifiants",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔑 Absence de MFA

Un mot de passe, même « correct », peut être **fuité** (phishing, base de données volée). Quelle contre-mesure réduit fortement le risque qu'un identifiant volé suffise à se connecter ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Ajouter un second facteur d'une catégorie différente.", cost: 20 },
          { text: "📖 Correction : l'authentification multi-facteur (MFA).", cost: 50 },
        ],
        options: [
          "L'authentification multi-facteur (MFA)",
          "Un mot de passe encore plus long, réutilisé partout",
          "La désactivation du chiffrement",
          "L'ouverture de tous les ports du pare-feu",
        ],
        answer: 0,
        explanation: `La **MFA** exige **≥ 2 facteurs** de catégories différentes (ex. mot de passe **+** OTP) : un identifiant **volé** ne suffit plus, il manque le second facteur. C'est la parade directe au **credential stuffing**, au **brute-force** et au **phishing**. Un mot de passe long réutilisé reste vulnérable dès qu'il fuit.`,
        tags: ["mfa", "credentials", "authentification"],
      },
      {
        id: "cyr-vuln-snmp",
        title: "SNMP non sécurisé",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 📟 SNMP

Pourquoi **SNMP v1/v2c** est-il une vulnérabilité, et quelle version faut-il utiliser ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Les community strings (souvent 'public'/'private') circulent sans chiffrement.", cost: 30 },
          { text: "📖 Correction : v1/2c = communities faibles en clair → utiliser SNMPv3 (auth + chiffrement).", cost: 80 },
        ],
        options: [
          "v1/v2c utilisent des community strings (souvent par défaut) transmises en clair, permettant lecture/reconfiguration ; il faut SNMPv3 (authentification + chiffrement)",
          "SNMP est un protocole de chiffrement déjà sûr par défaut",
          "SNMP v1/v2c chiffre tout en AES-256",
          "Il faut revenir à SNMP v1 pour plus de sécurité",
        ],
        answer: 0,
        explanation: `**SNMP v1/v2c** s'authentifie par de simples **community strings** (souvent laissées à « public »/« private ») **en clair** → un attaquant peut **lire** (voire **écrire**) la configuration des équipements. La parade est **SNMPv3** (**authentification + chiffrement**), en changeant/supprimant les communities par défaut et en restreignant par ACL (ou en désactivant SNMP si inutile).`,
        tags: ["snmp", "snmpv3", "community"],
      },
      {
        id: "cyr-vuln-sqli",
        title: "Contrer l'injection SQL",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 💉 Injection SQL

Quelle est la contre-mesure **la plus efficace** contre l'injection SQL au niveau du code applicatif ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Séparer le code SQL des données fournies par l'utilisateur.", cost: 30 },
          { text: "📖 Correction : les requêtes paramétrées (prepared statements).", cost: 80 },
        ],
        options: [
          "Utiliser des requêtes paramétrées (prepared statements) qui séparent le code SQL des données utilisateur",
          "Concaténer directement les entrées utilisateur dans la requête",
          "Donner tous les privilèges au compte de la base",
          "Désactiver le journal des requêtes",
        ],
        answer: 0,
        explanation: `Les **requêtes paramétrées** (*prepared statements*) séparent le **code SQL** des **données** : l'entrée utilisateur ne peut plus être **interprétée comme du SQL**. On complète par la **validation des entrées**, le **moindre privilège** du compte SQL et un **WAF** (défense en profondeur). **Concaténer** les entrées est précisément ce qui **crée** la faille.`,
        tags: ["injection-sql", "prepared-statements", "waf"],
      },
      {
        id: "cyr-vuln-flat",
        title: "Réseau plat",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧱 Absence de segmentation

Quelle est la conséquence majeure d'un **réseau « plat »** (aucune segmentation VLAN) lorsqu'une machine est compromise ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Sans cloison, l'attaquant se déplace librement partout.", cost: 20 },
          { text: "📖 Correction : mouvement latéral libre → propagation rapide (ransomware) à tout le réseau.", cost: 50 },
        ],
        options: [
          "L'attaquant se déplace latéralement sans obstacle et peut atteindre tout le réseau (propagation rapide de ransomware)",
          "Le réseau devient automatiquement plus rapide",
          "Les données sont chiffrées d'office",
          "Cela empêche toute reconnaissance interne",
        ],
        answer: 0,
        explanation: `Sur un **réseau plat**, rien ne **cloisonne** : une machine compromise permet un **mouvement latéral** libre vers **tout** le réseau, dont les systèmes sensibles → propagation rapide (ransomware). La parade est la **segmentation VLAN** / **micro-segmentation** avec ACL inter-VLAN, isolant IoT, invités et zones critiques.`,
        tags: ["segmentation", "mouvement-lateral", "vlan"],
      },
      {
        id: "cyr-vuln-siem",
        title: "Le rôle du SIEM",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📊 Absence de SIEM

À quoi sert un **SIEM**, et que risque-t-on en son absence ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Il centralise et corrèle les journaux pour détecter et alerter.", cost: 20 },
          { text: "📖 Correction : sans SIEM, les intrusions passent inaperçues et l'investigation est impossible.", cost: 50 },
        ],
        options: [
          "Le SIEM centralise et corrèle les journaux pour détecter/alerter ; sans lui, les intrusions passent inaperçues et l'investigation est impossible",
          "Le SIEM chiffre le trafic réseau à la place de TLS",
          "Le SIEM remplace le pare-feu périmétrique",
          "Le SIEM sert uniquement à augmenter la bande passante",
        ],
        answer: 0,
        explanation: `Un **SIEM** (*Security Information and Event Management*) **centralise** et **corrèle** les journaux de tout le SI, **alerte** sur les comportements suspects et alimente un **SOC**. Sans lui, les événements sont **éparpillés** : les intrusions **passent inaperçues** (temps de détection élevé) et l'**investigation** post-incident est quasi impossible faute de traces centralisées. Il complète **IDS/IPS** et **EDR**.`,
        tags: ["siem", "journalisation", "soc"],
      },
      {
        id: "cyr-vuln-cve",
        title: "Systèmes non patchés",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## 🩹 Vulnérabilités connues

Comment nomme-t-on l'**identifiant public standardisé** attribué à une **vulnérabilité de sécurité connue** (que la gestion des correctifs vise à corriger) ?

*(Réponds par le sigle exact.)*`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "Common Vulnerabilities and Exposures.", cost: 15 },
          { text: "📖 Correction : CVE.", cost: 40 },
        ],
        answer: "CVE",
        accept: ["cve", "common vulnerabilities and exposures", "une cve"],
        caseSensitive: false,
        explanation: `Une **CVE** (*Common Vulnerabilities and Exposures*) est l'**identifiant public** unique d'une **vulnérabilité connue** (ex. CVE-AAAA-NNNN). Un **système non patché** reste exploitable par un **exploit** ciblant sa CVE. Parade : **gestion des correctifs** (patch management), **veille CVE** et priorisation par criticité (**CVSS**).`,
        tags: ["cve", "patch", "vulnerabilite"],
      },
    ],
  },
];
