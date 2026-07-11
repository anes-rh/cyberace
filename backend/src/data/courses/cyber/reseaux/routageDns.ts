import type { CourseSeed } from "../../../../types";

/** Cyber · Réseaux — Module 8 : sécurité du routage et des noms de domaine. */
export const routageDns: CourseSeed[] = [
  {
    slug: "cyr-routage-dns",
    title: "Sécurité du routage et des noms de domaine",
    checkpoint: "cyber-reseaux",
    codename: "Route Guard",
    domain: "Réseaux — Routage & DNS",
    theme: "grid",
    icon: "Route",
    accent: "#5FB3C6",
    order: 8,
    difficulty: "hard",
    summary:
      "Protéger l'acheminement et la résolution de noms : sécurité des protocoles de routage (authentification, filtrage, détournement BGP), hiérarchie et sécurité du DNS (résolveurs, empoisonnement, DNSSEC), et durcissement des routeurs et serveurs de noms.",
    objectives: [
      "Comprendre les menaces sur le routage (injection de routes, détournement BGP)",
      "Savoir authentifier et filtrer les protocoles de routage",
      "Décrire la hiérarchie DNS (racine, TLD, résolveurs) et ses attaques",
      "Positionner DNSSEC dans la sécurité de la résolution de noms",
      "Durcir routeurs et serveurs de noms (plan de contrôle, gestion)",
    ],
    resources: [
      {
        label: "IETF — RPKI / BGP Origin Validation (RFC 6480)",
        url: "https://datatracker.ietf.org/doc/html/rfc6480",
        kind: "link",
        note: "Infrastructure à clés publiques pour sécuriser l'origine des annonces BGP (contre le détournement de préfixes).",
      },
      {
        label: "ANSSI — recommandations sur la sécurisation des routeurs et du DNS",
        url: "https://cyber.gouv.fr/",
        kind: "link",
        note: "Bonnes pratiques de durcissement des équipements réseau et des serveurs de noms.",
      },
    ],
    lesson: `# 🧭 Sécurité du routage et des noms de domaine — Route Guard

Deux services **invisibles mais vitaux** font fonctionner Internet : le **routage** (choisir le chemin des paquets) et le **DNS** (traduire les noms en adresses). Les corrompre permet de **détourner tout le trafic** — souvent sans que la victime ne s'en aperçoive. 🏎️

---

## 1. La sécurité du routage 🛣️

### Le rôle du routage

Les **routeurs** décident **par où** acheminer chaque paquet, en échangeant des informations via des **protocoles de routage** : **RIP**, **OSPF**, **EIGRP** (routage **interne**, au sein d'une organisation) et **BGP** (routage **entre** les grands réseaux/opérateurs — la « colle » d'Internet). Ces tables de routage déterminent le **chemin** de toutes les communications.

### Les menaces sur le routage

- **Injection de fausses routes** : un attaquant (ou un routeur pirate) **annonce** de fausses routes pour **attirer** le trafic vers lui (**MITM**), le **détourner** (*blackhole*, DoS) ou créer des **boucles**.
- **Détournement BGP** (*BGP hijacking*) : un réseau **annonce à tort** des **préfixes IP** qui ne lui appartiennent pas → une partie d'Internet lui envoie le trafic destiné à la vraie cible. Cas célèbres de redirection massive de trafic (parfois accidentels, parfois malveillants).
- **Route leaks** (fuites de routes) : propagation d'annonces qui ne devraient pas l'être.
- **Falsification/rejeu** des messages de routage non authentifiés.

### Les parades

- **Authentification des protocoles de routage** : signer les échanges (ex. **authentification MD5/SHA** sur OSPF, BGP, HSRP…) pour que seuls les **voisins légitimes** soient acceptés.
- **Filtrage des routes** (*route filtering*, préfixes/*prefix-lists*, ACL) : n'accepter/n'annoncer que les préfixes **attendus** — refuser tout le reste.
- **RPKI + BGP Origin Validation** : une **PKI** qui permet de **vérifier** qu'un réseau est **autorisé** à annoncer un préfixe → contre le détournement d'origine BGP.
- **Bonnes pratiques** : **passive-interface** sur les liens où aucun voisin de routage n'est attendu, **TTL security**, limitation du plan de contrôle (**CoPP**).

> 🧭 Principe : ne **faire confiance** qu'aux **voisins de routage authentifiés** et n'accepter que les **routes attendues**. Le routage non protégé est un point unique par lequel **tout** le trafic peut être détourné.

---

## 2. La hiérarchie et la sécurité du DNS 🌍

### Rappel : la résolution de noms

Le **DNS** traduit un **nom de domaine** (\`www.exemple.com\`) en **adresse IP**. La résolution suit une **hiérarchie** :

\`\`\`
   . (racine)  →  .com (TLD)  →  exemple.com (faisant autorité)
        ▲             ▲                 ▲
   serveurs racine  serveurs TLD   serveur autoritaire du domaine

   Le RÉSOLVEUR (récursif) interroge cette chaîne, puis MET EN CACHE la réponse.
\`\`\`

- **Serveurs racine** : le sommet (les « . »).
- **Serveurs TLD** : gèrent les extensions (.com, .org, .fr…).
- **Serveurs faisant autorité** : détiennent les enregistrements d'un domaine précis.
- **Résolveurs récursifs** (chez le FAI/l'entreprise) : font le travail pour le client et **mettent en cache** les réponses.

### La gestion des noms de routage / noms de domaine

Sécuriser les **noms** implique aussi la **gouvernance** : contrôler **qui** peut modifier une zone DNS (comptes du **registrar**, verrouillage de domaine contre le **domain hijacking**), gérer les **enregistrements** (A, MX, NS…), et surveiller les **expirations** (un domaine expiré peut être racheté par un attaquant).

### Les attaques DNS (rappel + approfondissement)

- **Empoisonnement de cache** : injecter une **fausse réponse** dans le cache d'un résolveur → toutes les victimes utilisant ce résolveur sont **redirigées**.
- **DNS spoofing / MITM**, **détournement de domaine** (*domain hijacking* via le registrar), **typosquatting**.
- **Attaques par amplification** (DDoS) exploitant des résolveurs **ouverts**.
- **Tunneling DNS** : exfiltrer des données ou établir un **canal caché** en encodant l'information dans des requêtes DNS (à surveiller).

### Les parades DNS

- **DNSSEC** : **signatures** garantissant l'**intégrité/authenticité** des réponses (module 7) → contre l'empoisonnement.
- **Résolveurs non ouverts** (limiter la récursivité aux clients internes) → contre l'amplification.
- **Séparer** serveur **autoritaire** et **résolveur récursif**, durcir les deux.
- **Randomisation** (port source, casse — *0x20*) pour compliquer l'empoisonnement, **surveillance** des requêtes anormales (tunneling).
- **DoH/DoT** pour la **confidentialité** des requêtes.

---

## 3. Durcir les routeurs et serveurs de noms 🔧

Les **équipements** eux-mêmes (routeurs, serveurs DNS) sont des cibles. Durcissement :
- **Accès d'administration sécurisé** : **SSH** (jamais Telnet), comptes nominatifs, **MFA**, changer les **identifiants par défaut**.
- **Séparer plan de gestion / plan de données** ; réseau d'**administration dédié** (out-of-band).
- **Désactiver les services inutiles** (petits serveurs, HTTP d'admin, SNMP non sécurisé — module 9).
- **Mises à jour** régulières du firmware/logiciel (corriger les **CVE**).
- **Protéger le plan de contrôle** (CoPP, limitation de débit) contre la saturation.
- **Journalisation** centralisée (syslog) et **sauvegarde** des configurations.
- Pour le DNS : exécuter le service avec le **moindre privilège**, restreindre les **transferts de zone** (**AXFR**) aux serveurs autorisés (sinon fuite de toute la zone).

> 🧠 Un routeur ou un serveur DNS **compromis** donne à l'attaquant un **contrôle démesuré** (détourner tout le trafic, rediriger tous les noms). Ces équipements « d'infrastructure » méritent le **durcissement le plus strict**.

---

## 🧠 À retenir

- Le **routage** (RIP/OSPF/EIGRP en interne, **BGP** entre réseaux) décide du **chemin** de tout le trafic. Menaces : **injection de fausses routes** (MITM/blackhole), **détournement BGP** (annoncer des préfixes qu'on ne possède pas), **route leaks**.
- Parades routage : **authentifier** les protocoles (MD5/SHA entre voisins), **filtrer** les routes (prefix-lists/ACL), **RPKI** (validation d'origine BGP), **passive-interface**, **CoPP**. Principe : **voisins authentifiés + routes attendues seulement**.
- **DNS** hiérarchique : **racine → TLD → autoritaire**, avec des **résolveurs récursifs** qui **mettent en cache**. Menaces : **empoisonnement de cache**, **spoofing**, **domain hijacking** (registrar), **amplification**, **tunneling DNS**.
- Parades DNS : **DNSSEC** (intégrité/authenticité), résolveurs **non ouverts**, **séparer** autoritaire/récursif, **randomisation**, **DoH/DoT** (confidentialité), **verrouillage de domaine**, restreindre les **transferts de zone (AXFR)**.
- **Durcir** routeurs et serveurs DNS : **SSH** (pas Telnet), MFA, identifiants non par défaut, **admin dédiée/out-of-band**, désactiver les services inutiles, **MAJ (CVE)**, protéger le **plan de contrôle**, journaliser. Un équipement d'infrastructure compromis = détournement **massif**.`,
    badge: {
      id: "badge-cyr-route-guard",
      name: "Route Guard",
      icon: "Route",
      description: "Maîtrise la sécurité du routage (BGP, authentification, filtrage) et du DNS (hiérarchie, DNSSEC, durcissement).",
    },
    challenges: [
      {
        id: "cyr-route-bgp",
        title: "Le détournement BGP",
        order: 1,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🛣️ BGP hijacking

En quoi consiste un **détournement BGP** (BGP hijacking) ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Un réseau annonce des blocs d'adresses (préfixes) qui ne lui appartiennent pas.", cost: 30 },
          { text: "📖 Correction : annoncer à tort des préfixes IP d'autrui → le trafic est attiré vers l'attaquant.", cost: 80 },
        ],
        options: [
          "Un réseau annonce à tort des préfixes IP qui ne lui appartiennent pas, attirant vers lui le trafic destiné à la vraie cible",
          "Un routeur augmente sa bande passante de force",
          "Un serveur DNS renvoie une mauvaise IP",
          "Un pare-feu bloque tout le trafic BGP",
        ],
        answer: 0,
        explanation: `Le **détournement BGP** consiste à **annoncer** des **préfixes IP** qu'on ne possède pas : une partie d'Internet croit que le chemin passe par l'attaquant et lui **envoie le trafic** (MITM, blackhole). Parades : **RPKI** (validation d'origine), **filtrage de préfixes**, **authentification** des sessions BGP. Certains incidents furent accidentels (erreur de config), d'autres malveillants.`,
        tags: ["bgp", "hijacking", "rpki"],
      },
      {
        id: "cyr-route-auth",
        title: "Protéger le routage interne",
        order: 2,
        difficulty: "medium",
        type: "multi",
        prompt: `## 🔐 Parades routage

Quelles mesures protègent les **protocoles de routage** (OSPF, BGP…) contre l'injection de fausses routes ? (Coche tout ce qui s'applique.)`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "Authentifier les échanges entre voisins de routage (MD5/SHA)",
          "Filtrer les routes acceptées/annoncées (prefix-lists, ACL)",
          "Mettre en passive-interface les liens sans voisin de routage attendu",
          "Diffuser les tables de routage en clair à tout Internet",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Trois bonnes pratiques ; la quatrième est exactement le contraire de la sécurité.", cost: 20 },
          { text: "📖 Correction : authentification + filtrage + passive-interface.", cost: 50 },
        ],
        explanation: `On protège le routage en **authentifiant** les échanges entre **voisins** (MD5/SHA), en **filtrant** les préfixes acceptés/annoncés (prefix-lists/ACL) et en désactivant le routage là où aucun voisin n'est attendu (**passive-interface**). Diffuser ses routes **en clair à tout le monde** est l'inverse : cela **facilite** l'injection et la reconnaissance.`,
        tags: ["routage", "authentification", "filtrage"],
      },
      {
        id: "cyr-route-dns-hier",
        title: "La hiérarchie DNS",
        order: 3,
        difficulty: "medium",
        type: "order",
        prompt: `## 🌍 Résolution DNS

Remets les niveaux interrogés lors d'une résolution DNS dans le **bon ordre** (du sommet vers le domaine) :`,
        points: 200,
        timeLimitSec: 300,
        options: [
          "Serveurs racine ( . )",
          "Serveurs TLD ( .com )",
          "Serveur faisant autorité ( exemple.com )",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "On part du point (racine), puis l'extension, puis le domaine précis.", cost: 20 },
          { text: "📖 Correction : racine → TLD → autoritaire.", cost: 50 },
        ],
        explanation: `La résolution descend la **hiérarchie** : **serveurs racine** ( . ) → **serveurs TLD** ( .com, .fr… ) → **serveur faisant autorité** du domaine ( exemple.com ). Le **résolveur récursif** parcourt cette chaîne puis **met en cache** la réponse — c'est ce cache que vise l'**empoisonnement**.`,
        tags: ["dns", "hierarchie", "resolveur"],
      },
      {
        id: "cyr-route-axfr",
        title: "Transferts de zone",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🗂️ Durcissement DNS

Pourquoi faut-il **restreindre les transferts de zone (AXFR)** d'un serveur DNS faisant autorité ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Un AXFR ouvert livre la liste complète des enregistrements de la zone.", cost: 30 },
          { text: "📖 Correction : un AXFR non restreint divulgue toute la zone (cartographie du réseau) à un attaquant.", cost: 80 },
        ],
        options: [
          "Parce qu'un AXFR ouvert divulgue l'intégralité des enregistrements de la zone, offrant une cartographie complète à un attaquant",
          "Parce que l'AXFR chiffre le trafic et ralentit le serveur",
          "Parce que l'AXFR est nécessaire pour le NAT",
          "Parce que l'AXFR augmente la taille des paquets ICMP",
        ],
        answer: 0,
        explanation: `Un **transfert de zone (AXFR)** copie **tous** les enregistrements d'une zone. S'il est **ouvert à tous**, un attaquant récupère la **liste complète** (hôtes, services, sous-domaines) = une **cartographie** idéale pour la reconnaissance. On le **restreint** aux seuls serveurs secondaires **autorisés**. Durcissement DNS aussi : séparer autoritaire/récursif, résolveurs non ouverts, DNSSEC.`,
        tags: ["dns", "axfr", "durcissement"],
      },
      {
        id: "cyr-route-harden",
        title: "Durcir un routeur",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔧 Administration sécurisée

Quelle mesure de durcissement d'un routeur/équipement d'infrastructure est **correcte** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Pour l'administration à distance, on remplace le protocole en clair par un chiffré.", cost: 20 },
          { text: "📖 Correction : administrer en SSH (jamais Telnet), MFA, identifiants non par défaut.", cost: 50 },
        ],
        options: [
          "Administrer via SSH (jamais Telnet), avec MFA, comptes nominatifs et identifiants non par défaut",
          "Laisser Telnet activé avec le mot de passe d'usine pour aller plus vite",
          "Exposer l'interface d'administration directement sur Internet",
          "Désactiver toute journalisation pour économiser de l'espace",
        ],
        answer: 0,
        explanation: `On durcit un équipement d'infrastructure en l'administrant via **SSH** (jamais **Telnet** en clair), avec **MFA**, **comptes nominatifs** et **identifiants non par défaut**, une **admin dédiée/out-of-band**, la **désactivation des services inutiles**, les **mises à jour (CVE)** et la **journalisation**. Un routeur compromis permet de **détourner tout le trafic**.`,
        tags: ["durcissement", "ssh", "routeur"],
      },
      {
        id: "cyr-route-cache",
        title: "Empoisonnement de cache",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## 🧪 Attaque DNS

Comment nomme-t-on l'attaque qui consiste à **injecter une fausse réponse** dans le **cache d'un résolveur DNS**, afin de rediriger vers un serveur pirate toutes les victimes qui l'utilisent ?

*(Réponds par le terme, en français ou en anglais.)*`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "En anglais : DNS cache poisoning (attaque de Kaminsky).", cost: 15 },
          { text: "📖 Correction : l'empoisonnement de cache DNS (cache poisoning).", cost: 40 },
        ],
        answer: "empoisonnement de cache",
        accept: ["empoisonnement de cache", "cache poisoning", "dns cache poisoning", "empoisonnement du cache dns", "empoisonnement de cache dns", "empoisonnement du cache", "poisoning"],
        caseSensitive: false,
        explanation: `L'**empoisonnement de cache DNS** (*cache poisoning*, attaque de **Kaminsky**) injecte une **fausse réponse** dans le **cache d'un résolveur récursif** → **toutes** les victimes utilisant ce résolveur sont **redirigées** vers un serveur pirate (phishing/MITM). Parade principale : **DNSSEC** (réponses signées), + randomisation et résolveurs non ouverts.`,
        tags: ["dns", "cache-poisoning", "kaminsky"],
      },
    ],
  },
];
