import type { CourseSeed } from "../../../../types";

/** Cyber · Réseaux — Module 7 : sécurisation des applications et protocoles. */
export const applications: CourseSeed[] = [
  {
    slug: "cyr-applications",
    title: "Sécurisation des applications et protocoles",
    checkpoint: "cyber-reseaux",
    codename: "App Shield",
    domain: "Réseaux — Protocoles applicatifs",
    theme: "grid",
    icon: "AppWindow",
    accent: "#5FB3C6",
    order: 7,
    difficulty: "medium",
    summary:
      "Sécuriser les protocoles applicatifs : SSH (administration chiffrée, clés vs mot de passe), SSL/TLS (handshake, certificats, chiffrement de bout en bout), HTTPS, sécurité du DNS (empoisonnement de cache, DNSSEC) et les pare-feu applicatifs (WAF).",
    objectives: [
      "Comprendre SSH et l'authentification par clés plutôt que par mot de passe",
      "Décrire le handshake TLS et le rôle des certificats",
      "Expliquer HTTPS comme HTTP sur TLS",
      "Connaître les attaques DNS (cache poisoning) et la parade DNSSEC",
      "Situer les pare-feu applicatifs (WAF) face aux failles web",
    ],
    resources: [
      {
        label: "IETF RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3",
        url: "https://datatracker.ietf.org/doc/html/rfc8446",
        kind: "link",
        note: "La spécification de TLS 1.3 : handshake simplifié, chiffrement moderne, forward secrecy.",
      },
      {
        label: "OWASP — Web Application Firewall & Secure Headers",
        url: "https://owasp.org/",
        kind: "link",
        note: "Ressources sur les WAF et le durcissement des applications web.",
      },
    ],
    lesson: `# 🛡️ Sécurisation des applications et protocoles — App Shield

Le réseau peut être bien cloisonné, les **protocoles applicatifs** restent une cible : administration à distance, web, DNS. Ce module montre comment les **chiffrer, authentifier et protéger**. 🏎️

---

## 1. SSH : l'administration chiffrée 🖥️

**SSH** (*Secure Shell*) remplace les protocoles d'administration **en clair** — **Telnet**, **rlogin**, **FTP** — qui transmettaient identifiants et commandes **sans chiffrement** (interceptables trivialement). SSH fournit un **canal chiffré** pour :
- ouvrir un **shell distant** (administration),
- transférer des fichiers (**SCP/SFTP**),
- **tunneliser** d'autres protocoles (port forwarding).

### Sécurité de SSH

- **Chiffrement** de toute la session (confidentialité + intégrité).
- **Authentification de l'hôte** : au premier contact, le client mémorise la **clé publique du serveur** (*known_hosts*) → détecte un **MITM** (changement de clé = alerte).
- **Authentification du client** : par **mot de passe** ou, bien mieux, par **paire de clés** (clé privée gardée par l'utilisateur, clé publique déposée sur le serveur). L'**authentification par clés** est **plus forte** (pas de mot de passe à deviner/brute-forcer) et permet de **désactiver l'auth par mot de passe**.

Bonnes pratiques : **SSHv2 uniquement** (v1 obsolète), **désactiver le login root direct**, **clés** plutôt que mots de passe, changer le **port par défaut** (réduit le bruit), limiter par **pare-feu/allowlist**, **fail2ban** contre le brute-force.

> ⚠️ Un **SSH avec mot de passe faible** exposé sur Internet est une porte d'entrée classique (brute-force) — voir le tableau des vulnérabilités du module 9.

---

## 2. SSL/TLS : le chiffrement de bout en bout 🔐

**TLS** (*Transport Layer Security*, successeur de **SSL**, désormais obsolète) sécurise les communications applicatives (web, mail, VPN SSL…) en garantissant **confidentialité**, **intégrité** et **authentification du serveur** (voire du client).

### Le handshake TLS (simplifié)

\`\`\`
   Client                                        Serveur
     │── ClientHello (versions, suites crypto) ──►│
     │◄─ ServerHello + CERTIFICAT (clé publique) ─│
     │      [ le client VÉRIFIE le certificat ]    │
     │── échange de clés (ex. ECDHE) ────────────►│
     │◄────────── Finished (chiffré) ─────────────│
     │══════ canal chiffré symétrique établi ═════│
\`\`\`

Étapes clés :
1. **Négociation** des versions et **suites cryptographiques**.
2. Le serveur présente son **certificat X.509** (contenant sa **clé publique**, signé par une **autorité de certification, CA**).
3. Le client **vérifie le certificat** : signé par une **CA de confiance**, **non expiré**, **non révoqué**, **nom de domaine correspondant**.
4. **Échange de clés** (idéalement **éphémère**, ex. **ECDHE** → **forward secrecy**) pour établir une **clé de session symétrique**.
5. Le trafic est ensuite chiffré **symétriquement** (rapide).

> 🧠 Le certificat résout le problème de **confiance** : il prouve que la clé publique appartient bien au **bon serveur** (via la signature d'une **CA**). Une **mauvaise gestion des certificats** (expiré, auto-signé accepté, CA compromise) casse toute la sécurité — voir module 9.

### Attaques et parades TLS

- **Downgrade** (forcer une vieille version faible) → désactiver **SSL/TLS anciens**, n'autoriser que **TLS 1.2/1.3**.
- **Certificat invalide/auto-signé accepté par l'utilisateur** → éduquer, **HSTS**, épinglage.
- **MITM (SSL stripping)** : rétrograder HTTPS en HTTP → **HSTS** (force HTTPS).

---

## 3. HTTPS : le web sécurisé 🌐

**HTTPS** = **HTTP sur TLS**. Il apporte au web :
- **Confidentialité** (personne ne lit la page/les données en transit),
- **Intégrité** (pas d'injection de contenu en chemin),
- **Authentification du serveur** (on parle bien au bon site, via le certificat).

Compléments : **HSTS** (*HTTP Strict Transport Security*, force le navigateur à n'utiliser que HTTPS), **redirection** HTTP→HTTPS, **cookies Secure/HttpOnly**, en-têtes de sécurité (CSP…). Aujourd'hui, **HTTPS partout** est la norme (le HTTP en clair est marqué « non sécurisé »).

---

## 4. Sécurité du DNS 🧭

Le **DNS** (*Domain Name System*) traduit les **noms** (\`exemple.com\`) en **adresses IP**. Historiquement **non sécurisé** (UDP, pas d'authentification), il est vulnérable à :
- **Empoisonnement de cache** (*DNS cache poisoning* / **Kaminsky**) : injecter une **fausse réponse** dans le cache d'un résolveur → rediriger les victimes vers un **serveur pirate** (phishing, MITM).
- **DNS spoofing** : forger des réponses DNS (en MITM ou par usurpation).
- **Attaques par amplification** DNS (DDoS — module 2).
- **Détournement de domaine / typosquatting**.

### Parade : DNSSEC

**DNSSEC** (*DNS Security Extensions*) ajoute des **signatures cryptographiques** aux enregistrements DNS : le résolveur **vérifie** que la réponse est **authentique** et **non altérée** (chaîne de confiance depuis la racine). DNSSEC assure l'**intégrité/authenticité** des réponses — **mais pas la confidentialité** (pour cela : **DoH/DoT**, DNS sur HTTPS/TLS).

> 🧭 DNSSEC répond à « cette réponse DNS est-elle **authentique** ? ». Il **ne chiffre pas** la requête (DoH/DoT le font). Les deux sont complémentaires.

---

## 5. Les pare-feu applicatifs (WAF) 🧱

Un **WAF** (*Web Application Firewall*) est un pare-feu spécialisé qui inspecte le **trafic HTTP/HTTPS** au niveau **applicatif (couche 7)** pour bloquer les attaques **web** que les pare-feu réseau ne voient pas :
- **injection SQL**, **XSS**, **traversée de répertoire**, exploitation de failles connues, requêtes malveillantes.

Il applique des **règles** (souvent basées sur des signatures, ex. **OWASP Core Rule Set**) et/ou un modèle **comportemental**. Souvent déployé en **reverse proxy** devant les serveurs web (module 4). Il **complète** — sans remplacer — un **code sécurisé** : un WAF est une **défense en profondeur**, pas une excuse pour du code vulnérable.

> 🧠 Positionnement : **pare-feu réseau** (couches 3/4) filtre les **flux** ; **WAF** (couche 7) comprend le **contenu HTTP** et bloque les **attaques applicatives**. Les deux sont **complémentaires**.

---

## 🧠 À retenir

- **SSH** remplace **Telnet/rlogin/FTP** (en clair) par un **canal chiffré** (shell, SFTP, tunnels). **Authentification par clés > mot de passe** (désactiver l'auth par mot de passe et le **login root**). Vérification de la **clé d'hôte** (known_hosts) contre le MITM. **SSHv2** uniquement.
- **TLS** (successeur de **SSL**) : **handshake** → le serveur présente un **certificat X.509** signé par une **CA**, le client le **vérifie** (CA de confiance, validité, nom, non-révocation), échange de clés **éphémère** (ECDHE → **forward secrecy**), puis chiffrement **symétrique**. N'autoriser que **TLS 1.2/1.3**.
- **HTTPS = HTTP sur TLS** : confidentialité + intégrité + authentification du serveur ; renforcé par **HSTS** (anti SSL-stripping) et la redirection HTTP→HTTPS.
- **DNS** non sécurisé → **cache poisoning** (fausse réponse en cache → redirection), **spoofing**, amplification. **DNSSEC** = **signatures** garantissant **intégrité/authenticité** des réponses (pas la confidentialité → **DoH/DoT** pour chiffrer).
- **WAF** = pare-feu **applicatif (couche 7)** filtrant HTTP/HTTPS contre **injection SQL, XSS**, etc. (souvent en **reverse proxy**, règles type **OWASP CRS**). Complète le **code sécurisé**, ne le remplace pas. Distinct du **pare-feu réseau** (couches 3/4).`,
    badge: {
      id: "badge-cyr-app-shield",
      name: "App Shield",
      icon: "AppWindow",
      description: "Maîtrise SSH, TLS/HTTPS, la sécurité DNS (DNSSEC) et les pare-feu applicatifs (WAF).",
    },
    challenges: [
      {
        id: "cyr-app-ssh",
        title: "SSH par clés",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🖥️ SSH

Pourquoi l'**authentification par paire de clés** est-elle préférable à l'**authentification par mot de passe** pour SSH ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Une clé privée ne se devine pas comme un mot de passe et ne circule pas.", cost: 20 },
          { text: "📖 Correction : pas de mot de passe à brute-forcer/deviner, et on peut désactiver l'auth par mot de passe.", cost: 50 },
        ],
        options: [
          "La clé privée ne circule pas et ne se brute-force pas comme un mot de passe : on peut alors désactiver l'auth par mot de passe",
          "Parce que les clés désactivent tout chiffrement, ce qui accélère la connexion",
          "Parce que SSH par clés fonctionne sans le moindre secret",
          "Parce que le mot de passe est plus long que la clé",
        ],
        answer: 0,
        explanation: `L'**authentification par clés** repose sur une **clé privée** (gardée par l'utilisateur) et une **clé publique** (sur le serveur) : rien à **deviner/brute-forcer**, le secret **ne circule pas**. On peut alors **désactiver l'auth par mot de passe** (et le **login root**), fermant la porte au brute-force. SSH remplace les protocoles en clair (**Telnet/FTP**).`,
        tags: ["ssh", "cles", "authentification"],
      },
      {
        id: "cyr-app-tls-cert",
        title: "Le rôle du certificat TLS",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔐 Handshake TLS

Lors du handshake TLS, à quoi sert le **certificat X.509** présenté par le serveur ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Il lie une clé publique à une identité, garanti par la signature d'une autorité.", cost: 30 },
          { text: "📖 Correction : prouver que la clé publique appartient bien au bon serveur (signé par une CA de confiance).", cost: 80 },
        ],
        options: [
          "Prouver que la clé publique appartient bien au bon serveur : il est signé par une autorité de certification (CA) de confiance et vérifié par le client",
          "Chiffrer directement toutes les données avec le certificat lui-même",
          "Remplacer le mot de passe de l'utilisateur",
          "Accélérer le routage des paquets",
        ],
        answer: 0,
        explanation: `Le **certificat X.509** contient la **clé publique** du serveur et son **identité**, le tout **signé par une CA**. Le client le **vérifie** (CA de confiance, non expiré, non révoqué, nom de domaine correspondant) → il a la garantie de parler au **bon serveur** (anti-MITM). L'échange de clés **éphémère** (ECDHE) établit ensuite la clé **symétrique** de session (forward secrecy).`,
        tags: ["tls", "certificat", "ca"],
      },
      {
        id: "cyr-app-dnssec",
        title: "DNSSEC",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🧭 Sécurité DNS

Contre l'**empoisonnement de cache DNS**, que garantit **DNSSEC** exactement (et que ne garantit-il pas) ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Il signe les enregistrements → authenticité/intégrité. Mais il ne chiffre pas.", cost: 30 },
          { text: "📖 Correction : DNSSEC garantit l'intégrité/authenticité des réponses, pas la confidentialité (→ DoH/DoT).", cost: 80 },
        ],
        options: [
          "Il garantit l'intégrité et l'authenticité des réponses DNS (signatures), mais pas leur confidentialité (assurée par DoH/DoT)",
          "Il chiffre toutes les requêtes DNS de bout en bout",
          "Il empêche toute attaque DDoS par amplification",
          "Il remplace complètement le protocole DNS",
        ],
        answer: 0,
        explanation: `**DNSSEC** ajoute des **signatures cryptographiques** aux enregistrements : le résolveur **vérifie** qu'une réponse est **authentique et non altérée** (chaîne de confiance depuis la racine) → contre l'**empoisonnement de cache**. Mais DNSSEC **ne chiffre pas** les requêtes (la confidentialité vient de **DoH/DoT**) et ne règle pas l'amplification. Intégrité/authenticité ≠ confidentialité.`,
        tags: ["dns", "dnssec", "cache-poisoning"],
      },
      {
        id: "cyr-app-https",
        title: "HTTPS et HSTS",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🌐 HTTPS

Un attaquant tente de rétrograder la connexion d'un utilisateur de **HTTPS vers HTTP** (SSL stripping) pour l'espionner. Quel mécanisme force le navigateur à **toujours** utiliser HTTPS ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un en-tête qui dit au navigateur « pour ce site, HTTPS obligatoire ».", cost: 20 },
          { text: "📖 Correction : HSTS (HTTP Strict Transport Security).", cost: 50 },
        ],
        options: [
          "HSTS (HTTP Strict Transport Security)",
          "Le NAT",
          "Le DHCP Snooping",
          "Le protocole Telnet",
        ],
        answer: 0,
        explanation: `**HSTS** (*HTTP Strict Transport Security*) est un en-tête qui ordonne au navigateur de n'utiliser **que HTTPS** pour un site donné → il neutralise le **SSL stripping** (rétrogradation HTTPS→HTTP). Complété par la **redirection HTTP→HTTPS** et les **cookies Secure**. HTTPS = **HTTP sur TLS** (confidentialité + intégrité + authentification du serveur).`,
        tags: ["https", "hsts", "ssl-stripping"],
      },
      {
        id: "cyr-app-waf",
        title: "Le rôle du WAF",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧱 Pare-feu applicatif

Qu'est-ce qui distingue un **WAF** d'un pare-feu réseau classique ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Il travaille à la couche 7 et comprend le contenu HTTP (injection SQL, XSS…).", cost: 20 },
          { text: "📖 Correction : le WAF inspecte le HTTP/HTTPS applicatif (couche 7) et bloque les attaques web.", cost: 50 },
        ],
        options: [
          "Le WAF inspecte le trafic HTTP/HTTPS au niveau applicatif (couche 7) et bloque injection SQL, XSS, etc., que le pare-feu réseau ne voit pas",
          "Le WAF ne fait que du NAT",
          "Le WAF remplace totalement un code sécurisé",
          "Le WAF fonctionne uniquement en couche 2",
        ],
        answer: 0,
        explanation: `Un **WAF** (*Web Application Firewall*) inspecte le **HTTP/HTTPS** à la **couche 7** et bloque les attaques **web** (**injection SQL**, **XSS**, traversée de répertoire…) invisibles pour un pare-feu réseau (couches 3/4). Souvent en **reverse proxy** avec des règles type **OWASP CRS**. Il **complète** le **code sécurisé** — il ne le **remplace pas** (défense en profondeur).`,
        tags: ["waf", "couche-7", "owasp"],
      },
      {
        id: "cyr-app-telnet",
        title: "Les protocoles en clair",
        order: 6,
        difficulty: "easy",
        type: "multi",
        prompt: `## 📴 À remplacer

Quels protocoles historiques transmettent identifiants et données **en clair** et devraient être remplacés (ex. par SSH/TLS) ? (Coche tout ce qui s'applique.)`,
        points: 200,
        timeLimitSec: 300,
        options: [
          "Telnet",
          "FTP (classique, sans TLS)",
          "rlogin",
          "SSH",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Trois protocoles en clair ; le quatrième est justement la solution chiffrée.", cost: 20 },
          { text: "📖 Correction : Telnet, FTP, rlogin = en clair ; SSH = la solution.", cost: 50 },
        ],
        explanation: `**Telnet**, **FTP** (sans TLS) et **rlogin** transmettent identifiants et commandes **en clair** → interceptables par simple écoute. On les remplace par **SSH** (shell/SFTP chiffrés) ou par des variantes **TLS** (FTPS/HTTPS). **SSH** est précisément la **solution** chiffrée, pas un protocole à remplacer.`,
        tags: ["telnet", "ftp", "ssh"],
      },
    ],
  },
];
