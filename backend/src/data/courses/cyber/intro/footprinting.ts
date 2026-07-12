import type { CourseSeed } from "../../../../types";

/** Cyber · Intro — Module 6 : footprinting & reconnaissance passive. */
export const footprinting: CourseSeed[] = [
  {
    slug: "cyi-footprinting",
    title: "Footprinting & reconnaissance passive",
    checkpoint: "cyber-intro",
    codename: "Recon",
    domain: "Cybersécurité — Reconnaissance",
    theme: "grid",
    icon: "Fingerprint",
    accent: "#9B8CCB",
    order: 6,
    difficulty: "medium",
    summary:
      "La première phase d'une attaque : collecter un maximum d'informations sur la cible sans y toucher. Méthodologie, moteurs de recherche & Google Hacking (GHDB), Shodan, WHOIS/DNS/traceroute, réseaux sociaux, email footprinting, dark web, ingénierie sociale, outils (Maltego, recon-ng, FOCA, OSINT Framework) et contre-mesures.",
    objectives: [
      "Définir le footprinting et distinguer reconnaissance passive et active",
      "Utiliser les moteurs de recherche et le Google Hacking (GHDB) et Shodan",
      "Interroger WHOIS, le DNS et traceroute pour cartographier une cible",
      "Exploiter réseaux sociaux, email footprinting et dark web (OSINT)",
      "Citer les outils (Maltego, recon-ng, FOCA, OSINT Framework) et les contre-mesures",
    ],
    lesson: `# 🕵️ Footprinting & reconnaissance passive — Recon

Avant toute attaque vient la **reconnaissance** : rassembler un **maximum d'informations** sur la cible. Le **footprinting passif** le fait **sans jamais toucher** aux systèmes de la cible — donc **indétectable**. 🏎️

---

## 1. Footprinting : la définition 🗺️

Le **footprinting** (empreinte) est la collecte d'informations sur une cible pour **dresser son profil** : domaines, adresses IP, technologies, employés, adresses email, organisation… On distingue :

- **Reconnaissance passive** : on utilise des **sources tierces** (moteurs de recherche, bases publiques, réseaux sociaux) **sans interagir** avec les systèmes de la cible → **aucune trace** côté cible. C'est l'objet de ce module.
- **Reconnaissance active** : on **interroge directement** la cible (scan de ports, requêtes DNS vers ses serveurs…) → potentiellement **détectable** (voir modules Énumération et Scan).

**Ce qu'on cherche :** infos réseau (domaines, IP, plages), infos système (OS, serveurs, technologies), infos organisationnelles (employés, emails, téléphones, organigramme, localisation). Plus on en sait, plus l'attaque est **ciblée et crédible** (ex. pour un phishing).

---

## 2. Moteurs de recherche & Google Hacking 🔍

Les **moteurs de recherche** (Google, Bing…) révèlent une masse d'informations indexées. Le **Google Hacking** (ou **Google Dorking**) consiste à utiliser des **opérateurs avancés** pour trouver des données sensibles exposées :

| Opérateur | Effet |
|---|---|
| \`site:\` | limite à un domaine (\`site:exemple.com\`) |
| \`filetype:\` | un type de fichier (\`filetype:pdf\`, \`filetype:xls\`) |
| \`intitle:\` | un mot dans le titre de la page |
| \`inurl:\` | un mot dans l'URL |
| \`intext:\` | un mot dans le corps |
| \`cache:\` | la version en cache |
| \`link:\` | pages liant vers une URL |

Exemples : \`site:exemple.com filetype:pdf\` (documents PDF exposés), \`intitle:"index of"\` (répertoires ouverts), \`inurl:admin\` (pages d'admin). La **GHDB** (*Google Hacking Database*) recense des **milliers de dorks** prêts à l'emploi pour trouver mots de passe, caméras exposées, fichiers de configuration, etc.

---

## 3. Shodan — le moteur des objets connectés 🌐

**Shodan** est un moteur de recherche non pas des **pages web**, mais des **appareils connectés à Internet** : serveurs, caméras, routeurs, systèmes industriels (SCADA), objets IoT. Il indexe les **bannières** de services exposés et permet de chercher par port, produit, pays, organisation. Un attaquant y trouve des dispositifs **mal sécurisés** exposés publiquement (ex. webcams sans mot de passe, bases de données ouvertes).

**Services de recherche Internet** apparentés : bases d'archives (Wayback Machine pour d'anciennes versions de sites), moteurs spécialisés, agrégateurs.

---

## 4. WHOIS, DNS et traceroute 🌍

Trois sources techniques **publiques** essentielles :

- **WHOIS** : base d'enregistrement des **noms de domaine**. Révèle (quand non masqué) le **titulaire**, ses **contacts** (email, téléphone, adresse), les **dates** d'enregistrement/expiration, les **serveurs de noms**. Point de départ classique.
- **DNS** (*Domain Name System*) : interroger le DNS d'une cible révèle sa **cartographie** — via les **enregistrements** :
  - **A / AAAA** : nom → adresse IPv4 / IPv6.
  - **MX** : serveurs de **messagerie**.
  - **NS** : serveurs de **noms** (autorité).
  - **CNAME** : alias.
  - **TXT** : textes (SPF, DKIM, vérifications).
  - **SOA / PTR** : autorité de zone / résolution inverse.
- **Traceroute** : trace le **chemin réseau** (les routeurs traversés) jusqu'à la cible → révèle la **topologie**, les équipements intermédiaires, parfois le fournisseur et des pare-feu.

### Website footprinting & découverte de sous-domaines 🌐

Le site web lui-même est une mine d'infos, souvent **sans rien envoyer d'agressif** :
- **Empreinte technologique** : identifier le **CMS**, le serveur, les frameworks et versions (outils **Wappalyzer**, **BuiltWith**). Connaître la techno = connaître ses **vulnérabilités** connues.
- **Fichiers révélateurs** : \`robots.txt\` et \`sitemap.xml\` listent parfois des chemins **cachés** que le propriétaire ne voulait pas indexer (mais pas protéger !).
- **Miroir de site** : copier tout un site en local (**HTTrack**) pour l'analyser **hors ligne**, tranquillement.
- **Certificate Transparency** : les **certificats TLS** émis sont publics (journaux **CT**, consultables via **crt.sh**). Ils **trahissent des sous-domaines** (ex. \`vpn.\`, \`dev.\`, \`admin.\`) qu'aucun lien public ne montrait. Des outils comme **Sublist3r** ou **theHarvester** agrègent ces sous-domaines.

> 🧠 La découverte de sous-domaines **élargit la surface d'attaque** : chaque \`dev.\`, \`test.\` ou \`old.\` oublié est une porte potentielle. La **veille concurrentielle** (*competitive intelligence*) applique la même logique côté business : recueillir de l'info **publique** sur une organisation.

---

## 5. Réseaux sociaux, email et dark web 👥

- **Réseaux sociaux** : mine d'or pour l'**OSINT** — noms d'employés, postes, technologies utilisées (offres d'emploi !), habitudes, relations. Utile pour l'**ingénierie sociale** ciblée.
- **Email footprinting / email tracking** : analyser les **en-têtes** d'un email révèle le chemin des serveurs, l'IP d'origine, le client de messagerie ; des **traceurs** (pixels) indiquent si/quand un email est ouvert et depuis où.
- **Ingénierie sociale** (en reconnaissance) : soutirer des infos directement aux **humains** — par téléphone (*pretexting*), en se faisant passer pour un tiers, etc. Variantes physiques : **dumpster diving** (fouiller les poubelles à la recherche de documents/notes), **shoulder surfing** (regarder par-dessus l'épaule), **eavesdropping** (écoute de conversations).
- **Dark web** : les données **fuitées** (identifiants, bases de données volées) circulent sur des places de marché du **dark web** (accessibles via Tor). Y chercher le nom d'une organisation peut révéler des **credentials compromis**.

---

## 6. Les outils de footprinting 🧰

| Outil | Rôle |
|---|---|
| **Maltego** | cartographie **graphique** des relations (domaines, emails, personnes, infrastructures) — l'outil OSINT visuel de référence |
| **recon-ng** | framework de reconnaissance **modulaire** en ligne de commande (comme Metasploit, mais pour l'OSINT) |
| **FOCA** | extrait les **métadonnées** de documents publics (auteurs, logiciels, chemins internes, versions) |
| **OSINT Framework** | **portail** classant des centaines d'outils/sources OSINT par catégorie |
| **theHarvester** | collecte emails, sous-domaines, noms depuis des sources publiques |

> 🧠 Ces outils **automatisent** et **corrèlent** la reconnaissance passive à grande échelle — Maltego relie visuellement les points, FOCA exploite les métadonnées oubliées dans les fichiers publiés.

---

## 7. Les contre-mesures 🛡️

Se défendre contre le footprinting, c'est **réduire ce qu'on expose** :

- **Limiter les informations publiques** : minimiser les données personnelles/techniques publiées (sites, réseaux sociaux, offres d'emploi trop détaillées).
- **WHOIS privé** : activer la **protection de la vie privée** sur l'enregistrement de domaine (masquer les contacts).
- **Durcir le DNS** : désactiver les **transferts de zone** non autorisés, limiter les enregistrements exposés.
- **Nettoyer les métadonnées** des documents avant publication (contre FOCA).
- **Sensibiliser** les employés (ingénierie sociale, ce qu'on partage en ligne).
- **Politique de classification** et surveillance de sa propre **empreinte numérique** (chercher ce qui fuite, y compris sur le dark web).

---

## 🧠 À retenir

- **Footprinting** = profiler la cible ; **passif** (sources tierces, **indétectable**) vs **actif** (interroger la cible, détectable).
- **Google Hacking (dorks)** : \`site:\`, \`filetype:\`, \`intitle:\`, \`inurl:\`, \`intext:\`, \`cache:\` ; la **GHDB** recense des milliers de requêtes prêtes.
- **Shodan** = moteur des **appareils connectés** (serveurs, caméras, IoT, SCADA) → dispositifs exposés/mal sécurisés.
- **WHOIS** (titulaire/contacts/dates), **DNS** (A/AAAA, **MX**, **NS**, CNAME, TXT, SOA/PTR), **traceroute** (chemin réseau) : la trinité technique.
- **Website footprinting** : empreinte techno (**Wappalyzer/BuiltWith**), \`robots.txt\`/\`sitemap.xml\`, miroir (**HTTrack**), et **sous-domaines** via **Certificate Transparency** (crt.sh), Sublist3r, theHarvester → surface d'attaque élargie.
- **OSINT** via **réseaux sociaux**, **email footprinting** (en-têtes, traceurs), **ingénierie sociale**, **dark web** (credentials fuités).
- Outils : **Maltego** (graphe), **recon-ng** (framework), **FOCA** (métadonnées), **OSINT Framework** (portail), theHarvester.
- Contre-mesures : **exposer moins**, **WHOIS privé**, désactiver les **transferts de zone**, **nettoyer les métadonnées**, **sensibiliser**.`,
    badge: {
      id: "badge-cyi-recon",
      name: "Recon",
      icon: "Fingerprint",
      description: "Maîtrise le footprinting passif : Google dorks, Shodan, WHOIS/DNS, OSINT, outils et contre-mesures.",
    },
    challenges: [
      {
        id: "cyi-foot-passive",
        title: "Passif = indétectable",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🕵️ Reconnaissance passive

Pourquoi la reconnaissance **passive** est-elle particulièrement difficile à détecter pour la cible ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "On interroge des sources tierces, pas les systèmes de la cible.", cost: 10 },
          { text: "📖 Correction : on n'interagit pas avec les systèmes de la cible → aucune trace de son côté.", cost: 30 },
        ],
        options: [
          "Parce qu'on collecte via des sources tierces sans jamais interagir avec les systèmes de la cible (aucune trace)",
          "Parce qu'on éteint le pare-feu de la cible",
          "Parce qu'on scanne tous ses ports très vite",
          "Parce que la cible est prévenue à l'avance",
        ],
        answer: 0,
        explanation: `La reconnaissance **passive** utilise des **sources tierces** (moteurs de recherche, WHOIS, réseaux sociaux, Shodan) **sans toucher** aux systèmes de la cible → **aucun log** ne se crée de son côté. La reconnaissance **active** (scan de ports, requêtes vers ses serveurs) est, elle, **détectable**.`,
        tags: ["footprinting", "passif", "osint"],
      },
      {
        id: "cyi-foot-dork",
        title: "Un Google dork",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔍 Google Hacking

Quel opérateur de **Google Hacking** limite la recherche à un **type de fichier** précis (ex. les PDF) ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "file… type.", cost: 15 },
          { text: "📖 Correction : filetype: (ex. filetype:pdf).", cost: 40 },
        ],
        options: [
          "filetype:",
          "site:",
          "intitle:",
          "inurl:",
        ],
        answer: 0,
        explanation: `\`filetype:\` restreint aux fichiers d'un **type** donné (\`filetype:pdf\`, \`filetype:xls\`). \`site:\` limite à un **domaine**, \`intitle:\` cherche dans le **titre**, \`inurl:\` dans l'**URL**. Combinés (\`site:exemple.com filetype:pdf\`), ces **dorks** révèlent des documents exposés. La **GHDB** en recense des milliers.`,
        tags: ["google-hacking", "dork", "ghdb"],
      },
      {
        id: "cyi-foot-shodan",
        title: "À quoi sert Shodan ?",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🌐 Shodan

Que permet de rechercher **Shodan** (contrairement à Google) ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Pas des pages web, mais des… appareils.", cost: 15 },
          { text: "📖 Correction : les appareils connectés à Internet (serveurs, caméras, IoT, SCADA).", cost: 40 },
        ],
        options: [
          "Les appareils connectés à Internet (serveurs, caméras, routeurs, IoT, systèmes industriels)",
          "Uniquement des articles de blog",
          "Les mots de passe chiffrés d'un utilisateur",
          "Des vidéos de divertissement",
        ],
        answer: 0,
        explanation: `**Shodan** indexe les **appareils connectés** et leurs **bannières de services** (serveurs, caméras, routeurs, IoT, SCADA/systèmes industriels), pas les pages web. Un attaquant y trouve des dispositifs **exposés et mal sécurisés** (webcams ouvertes, bases de données publiques). C'est un outil de reconnaissance **passive** redoutable.`,
        tags: ["shodan", "iot", "footprinting"],
      },
      {
        id: "cyi-foot-dns",
        title: "L'enregistrement DNS des emails",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🌍 DNS

Quel **enregistrement DNS** révèle les **serveurs de messagerie** d'un domaine ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "Mail eXchange.", cost: 20 },
          { text: "📖 Correction : l'enregistrement MX.", cost: 50 },
        ],
        options: ["MX", "A", "NS", "CNAME"],
        answer: 0,
        explanation: `L'enregistrement **MX** (*Mail eXchange*) désigne les **serveurs de messagerie** d'un domaine. Les autres : **A/AAAA** (nom → IP), **NS** (serveurs de noms d'autorité), **CNAME** (alias), **TXT** (SPF/DKIM…), **SOA/PTR** (autorité de zone / résolution inverse). Interroger le DNS **cartographie** l'infrastructure de la cible.`,
        tags: ["dns", "mx", "footprinting"],
      },
      {
        id: "cyi-foot-maltego",
        title: "L'outil OSINT visuel",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧰 Outils

Quel outil est réputé pour cartographier **graphiquement** les relations entre domaines, emails, personnes et infrastructures ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Un outil de graphe OSINT très connu.", cost: 15 },
          { text: "📖 Correction : Maltego.", cost: 40 },
        ],
        options: ["Maltego", "FOCA", "Nmap", "Wireshark"],
        answer: 0,
        explanation: `**Maltego** cartographie **visuellement** (en graphe) les relations entre entités (domaines, emails, personnes, IP, réseaux sociaux) — l'outil OSINT visuel de référence. **FOCA** extrait les **métadonnées** de documents, **recon-ng** est un framework modulaire, l'**OSINT Framework** est un portail d'outils. (Nmap/Wireshark relèvent du scan/analyse réseau, pas du footprinting passif.)`,
        tags: ["maltego", "outils", "osint"],
      },
      {
        id: "cyi-foot-counter",
        title: "Contre-mesure footprinting",
        order: 6,
        difficulty: "medium",
        type: "multi",
        prompt: `## 🛡️ Se défendre

Coche les **contre-mesures** valables contre le footprinting :`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "Activer la protection de la vie privée (WHOIS privé) sur le domaine",
          "Désactiver les transferts de zone DNS non autorisés",
          "Nettoyer les métadonnées des documents avant publication",
          "Publier l'organigramme complet et les emails de tous les employés",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "L'idée est d'EXPOSER MOINS, pas plus.", cost: 20 },
          { text: "📖 Correction : WHOIS privé + désactiver transferts de zone + nettoyer métadonnées. Publier tout = l'inverse.", cost: 50 },
        ],
        explanation: `Contre le footprinting, on **réduit son exposition** : **WHOIS privé** (masquer les contacts), **désactiver les transferts de zone DNS** (empêcher de rapatrier toute la zone), **nettoyer les métadonnées** (contre FOCA), et **sensibiliser**. **Publier l'organigramme et tous les emails** ferait tout le contraire : c'est offrir la reconnaissance sur un plateau (idéal pour un phishing ciblé).`,
        tags: ["contre-mesures", "footprinting", "defense"],
      },
    ],
  },
];
