import type { CourseSeed } from "../../../../types";

/** Cyber · Réseaux — Module 4 : sécurisation des infrastructures (NAT, Firewall, Proxy, DMZ). */
export const infrastructures: CourseSeed[] = [
  {
    slug: "cyr-infrastructures",
    title: "Sécurisation des infrastructures réseau",
    checkpoint: "cyber-reseaux",
    codename: "Perimeter",
    domain: "Réseaux — Périmètre",
    theme: "grid",
    icon: "BrickWall",
    accent: "#5FB3C6",
    order: 4,
    difficulty: "medium",
    summary:
      "Les briques du périmètre : NAT (masquer l'adressage interne), pare-feu (filtrage sans état vs à état, NGFW), proxy (mandataire direct et inverse) et l'architecture DMZ (zone démilitarisée, mono/bi-pare-feu) pour exposer des services sans compromettre le réseau interne.",
    objectives: [
      "Comprendre le NAT/PAT et son apport (et ses limites) en sécurité",
      "Distinguer pare-feu sans état, à état (stateful) et de nouvelle génération (NGFW)",
      "Différencier proxy direct (forward) et proxy inverse (reverse)",
      "Concevoir une DMZ et comparer les architectures mono- et bi-pare-feu",
      "Positionner ces briques dans une défense en profondeur",
    ],
    resources: [
      {
        label: "NIST SP 800-41 — Guidelines on Firewalls and Firewall Policy",
        url: "https://csrc.nist.gov/pubs/sp/800/41/r1/final",
        kind: "link",
        note: "Recommandations de référence sur les pare-feu, leurs types et les politiques de filtrage.",
      },
      {
        label: "ANSSI — recommandations sur l'architecture des passerelles Internet",
        url: "https://cyber.gouv.fr/",
        kind: "link",
        note: "Bonnes pratiques de cloisonnement, DMZ et filtrage en bordure de réseau.",
      },
    ],
    lesson: `# 🧱 Sécurisation des infrastructures réseau — Perimeter

Le **périmètre** est la frontière entre le réseau **interne** (de confiance) et l'**extérieur** (Internet, hostile). Le sécuriser, c'est **contrôler ce qui entre et sort** et **exposer prudemment** les services publics. Quatre briques : **NAT**, **pare-feu**, **proxy**, **DMZ**. 🏎️

---

## 1. NAT / PAT : masquer l'adressage interne 🎭

Le **NAT** (*Network Address Translation*) traduit les adresses IP **privées** internes en une (ou plusieurs) adresse(s) IP **publique(s)** en sortie. La variante la plus courante, le **PAT** (*Port Address Translation*, ou **NAT overload**), multiplexe **tout un réseau interne** derrière **une seule IP publique** en jouant sur les **numéros de port**.

\`\`\`
   Interne (privé)                NAT/PAT               Internet (public)
   192.168.1.10:51000  ───►  [ traduction ]  ───►  203.0.113.5:40001
   192.168.1.11:52000  ───►  [ table NAT   ]  ───►  203.0.113.5:40002
        (10.x, 192.168.x, 172.16.x = RFC 1918)
\`\`\`

Apport **sécurité** (secondaire, mais réel) :
- **Masquage de la topologie interne** : depuis l'extérieur, on ne voit qu'**une** IP publique ; les adresses privées et le plan d'adressage restent **cachés**.
- **Pas de connexion entrante spontanée** : une machine interne n'est **pas joignable** directement de l'extérieur (sauf redirection de port explicite), car il n'existe pas d'entrée dans la table NAT tant qu'elle n'a pas initié la connexion.

> ⚠️ Le NAT **n'est PAS un pare-feu** : il ne filtre pas le contenu, ne bloque pas les attaques applicatives, et ne protège pas les connexions **sortantes** (un malware interne sort sans obstacle). Il **complique** la reconnaissance, sans remplacer un vrai filtrage.

---

## 2. Le pare-feu (firewall) 🚧

Le **pare-feu** est l'élément central du périmètre : il **filtre le trafic** selon une **politique** (règles « autoriser/refuser » sur IP source/destination, port, protocole). Principe de base recommandé : **tout refuser par défaut**, puis **n'autoriser que le nécessaire** (*default deny*).

### Les générations de pare-feu

- **Filtrage sans état** (*stateless / packet filter*) : examine **chaque paquet isolément** (IP/port/protocole) sans mémoire des connexions. Rapide mais **rudimentaire** : il ne sait pas si un paquet appartient à une connexion déjà autorisée.
- **Filtrage à état** (*stateful inspection*) : **suit l'état des connexions** dans une **table de sessions**. Il n'autorise le trafic « retour » que s'il correspond à une connexion **légitimement établie** de l'intérieur → bien plus sûr. C'est le standard.
- **Pare-feu applicatif / NGFW** (*Next-Generation Firewall*) : inspecte jusqu'à la **couche applicative** (couche 7) — identification des **applications**, **inspection profonde** (DPI), **IPS intégré**, filtrage d'URL, parfois **déchiffrement TLS**. Il comprend « c'est du HTTP vers tel site », pas seulement « port 443 ».

\`\`\`
   Politique type (default deny) :
   [1] AUTORISER interne → Internet  (HTTP/HTTPS, DNS)
   [2] AUTORISER Internet → DMZ:443  (serveur web public)
   [3] REFUSER  Internet → interne   (tout)
   [4] REFUSER  tout le reste  (deny all, journalisé)
\`\`\`

> 🧠 Bonnes pratiques : **default deny**, **moindre privilège** (n'ouvrir que les flux utiles), **journalisation** des refus, séparer les **zones** (interne, DMZ, externe), et maintenir les règles **à jour** (les règles obsolètes sont une faille — voir module 9).

---

## 3. Le proxy (serveur mandataire) 🔁

Un **proxy** s'interpose dans les communications et **relaie** les requêtes. Deux orientations opposées :

- **Proxy direct** (*forward proxy*) : placé côté **clients internes**, il relaie leurs requêtes vers Internet. Utilité : **filtrage d'URL/contenu**, **cache**, **journalisation** de la navigation, **anonymat** relatif, application de la **politique de sortie**. Les clients sortent « au nom du proxy ».
- **Proxy inverse** (*reverse proxy*) : placé **devant des serveurs internes/DMZ**, il reçoit les requêtes **d'Internet** et les distribue aux serveurs. Utilité : **masquer** les serveurs réels, **répartir la charge** (load balancing), **terminer le TLS**, servir de **WAF** (pare-feu applicatif web), **cache**.

\`\`\`
   Forward proxy :   Clients internes ──► [Proxy] ──► Internet
   Reverse proxy :   Internet ──► [Reverse Proxy] ──► Serveurs (web, app)
\`\`\`

> 🧭 Moyen mnémotechnique : le **forward** protège/contrôle les **clients** qui sortent ; le **reverse** protège/expose les **serveurs** qui reçoivent. Le reverse proxy est une brique clé pour **publier** un service sans exposer directement le serveur.

---

## 4. La DMZ (zone démilitarisée) 🏰

Une entreprise doit **exposer** certains services au public (site web, messagerie, DNS) tout en protégeant son réseau **interne**. La solution : la **DMZ** (*DeMilitarized Zone*), un **segment tampon** où l'on place les serveurs **accessibles depuis Internet**, **isolé** à la fois de l'extérieur **et** de l'intérieur par du filtrage.

Règle d'or : **Internet peut atteindre la DMZ, mais la DMZ ne peut PAS atteindre librement le réseau interne.** Ainsi, si un serveur public est **compromis**, l'attaquant est **coincé dans la DMZ** et ne rebondit pas vers les données sensibles.

### Deux architectures classiques

**a) DMZ à pare-feu unique (three-legged / à trois pattes)**
Un seul pare-feu avec **trois interfaces** : Internet, DMZ, LAN interne. Le pare-feu applique des règles entre les trois zones.

\`\`\`
                 ┌──────────────┐
   Internet ─────┤              ├───── DMZ (web, mail, DNS publics)
                 │   PARE-FEU   │
                 │ (3 pattes)   ├───── LAN interne (protégé)
                 └──────────────┘
   Règles : Internet→DMZ autorisé ; DMZ→interne refusé ; interne→Internet autorisé
\`\`\`
Simple et économique, mais **un seul point de défaillance** (si le pare-feu tombe/est contourné, tout est exposé).

**b) DMZ à double pare-feu (back-to-back)**
Deux pare-feu **en sandwich** : un **externe** (Internet ↔ DMZ) et un **interne** (DMZ ↔ LAN). La DMZ est **entre les deux**.

\`\`\`
   Internet ──[ Pare-feu externe ]── DMZ ──[ Pare-feu interne ]── LAN interne
\`\`\`
Plus **robuste** : franchir la DMZ ne suffit pas, il faut **aussi** franchir le pare-feu interne (idéalement de **marques différentes** → une faille de l'un n'affecte pas l'autre — **défense en profondeur**). Plus coûteux/complexe.

> 🧠 Idée maîtresse : la DMZ **cloisonne**. On y met **uniquement** les services à exposer, durcis au maximum, et on **interdit** les flux DMZ→interne (sauf strict nécessaire, ex. un serveur web DMZ qui interroge une base **interne** via un port **précis et filtré**).

---

## 5. Assembler : la défense en profondeur 🧅

Aucune brique seule ne suffit — on les **empile** :
- **NAT/PAT** masque l'adressage interne.
- **Pare-feu (stateful/NGFW)** filtre les flux selon une politique **default deny**.
- **Proxy** contrôle les **sorties** (forward) et **publie** les services (reverse/WAF).
- **DMZ** **cloisonne** les serveurs exposés du réseau interne.
- Le tout complété par **segmentation** (VLAN), **IDS/IPS** (module 5) et **journalisation/SIEM** (module 9).

> 🧭 Chaque couche **rattrape** les défaillances de la précédente : c'est la **défense en profondeur**. Le périmètre reste nécessaire, mais complété par une logique **« zero trust »** (ne jamais faire confiance implicitement, vérifier chaque accès).

---

## 🧠 À retenir

- **NAT/PAT** traduit privé↔public et **masque la topologie interne** ; empêche les connexions entrantes spontanées. **Mais NAT ≠ pare-feu** (ne filtre pas le contenu, ne protège pas les sorties).
- **Pare-feu** : **sans état** (paquet par paquet, rudimentaire) → **à état/stateful** (suit les connexions, standard) → **NGFW/applicatif** (couche 7, DPI, IPS, filtrage d'app/URL). Politique **default deny** + moindre privilège + journalisation.
- **Proxy** : **forward** (protège/contrôle les **clients** sortants : filtrage, cache, logs) vs **reverse** (protège/expose les **serveurs** : masquage, load balancing, terminaison TLS, **WAF**).
- **DMZ** : segment **tampon** pour les services exposés ; **Internet→DMZ autorisé**, **DMZ→interne refusé** → un serveur public compromis reste **confiné**. **Mono-pare-feu** (3 pattes, simple, point unique) vs **double pare-feu** (back-to-back, plus robuste, idéalement marques différentes).
- Ces briques s'**empilent** en **défense en profondeur** (+ segmentation, IDS/IPS, SIEM), tendant vers le **zero trust**.`,
    badge: {
      id: "badge-cyr-perimeter",
      name: "Perimeter",
      icon: "BrickWall",
      description: "Maîtrise NAT, pare-feu (stateful/NGFW), proxy et l'architecture DMZ en défense en profondeur.",
    },
    challenges: [
      {
        id: "cyr-infra-nat",
        title: "NAT n'est pas un pare-feu",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎭 NAT

Le NAT apporte un bénéfice de sécurité, mais lequel de ces énoncés est **exact** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Il masque l'adressage interne, mais ne filtre pas le contenu ni les sorties.", cost: 20 },
          { text: "📖 Correction : il masque la topologie interne, mais ne remplace pas un pare-feu.", cost: 50 },
        ],
        options: [
          "Le NAT masque l'adressage interne et bloque les connexions entrantes spontanées, mais ne filtre pas le contenu : ce n'est pas un pare-feu",
          "Le NAT chiffre tout le trafic sortant",
          "Le NAT remplace totalement un pare-feu à état",
          "Le NAT empêche tout malware interne de communiquer vers l'extérieur",
        ],
        answer: 0,
        explanation: `Le **NAT/PAT** **masque la topologie interne** (une seule IP publique visible) et empêche les connexions **entrantes** non initiées. Mais il **ne filtre pas** le contenu, **ne bloque pas** les attaques applicatives et laisse **sortir** librement le trafic interne (donc un malware). **NAT ≠ pare-feu** : c'est un complément, pas un substitut.`,
        tags: ["nat", "pat", "perimetre"],
      },
      {
        id: "cyr-infra-stateful",
        title: "Pare-feu à état",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚧 Stateful

Qu'est-ce qui distingue un pare-feu **à état (stateful)** d'un pare-feu **sans état (packet filter)** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "L'un garde une table des connexions établies, l'autre regarde chaque paquet isolément.", cost: 20 },
          { text: "📖 Correction : le stateful suit l'état des connexions et n'autorise le retour que s'il correspond.", cost: 50 },
        ],
        options: [
          "Le stateful suit l'état des connexions (table de sessions) et n'autorise le trafic retour que s'il correspond à une connexion établie",
          "Le stateful ne regarde jamais les numéros de port",
          "Le sans état inspecte la couche applicative (couche 7)",
          "Les deux sont exactement identiques",
        ],
        answer: 0,
        explanation: `Un pare-feu **sans état** examine **chaque paquet isolément** (IP/port/protocole), sans mémoire. Un pare-feu **à état** maintient une **table des connexions** et n'autorise le **trafic retour** que s'il appartient à une session **légitimement établie** → bien plus sûr. Au-dessus, le **NGFW/applicatif** inspecte la **couche 7** (applications, DPI, IPS).`,
        tags: ["firewall", "stateful", "packet-filter"],
      },
      {
        id: "cyr-infra-proxy",
        title: "Forward vs reverse proxy",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔁 Proxy

On veut **publier** un serveur web interne sur Internet en le **masquant**, en répartissant la charge et en terminant le TLS devant lui. Quel type de proxy utilise-t-on ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Ce proxy est placé DEVANT les serveurs, côté réception des requêtes d'Internet.", cost: 20 },
          { text: "📖 Correction : un proxy inverse (reverse proxy).", cost: 50 },
        ],
        options: [
          "Un proxy inverse (reverse proxy)",
          "Un proxy direct (forward proxy)",
          "Un serveur DHCP",
          "Un routeur NAT",
        ],
        answer: 0,
        explanation: `Le **reverse proxy** se place **devant les serveurs** : il reçoit les requêtes d'**Internet**, **masque** les serveurs réels, **répartit la charge**, **termine le TLS** et peut faire office de **WAF**. Le **forward proxy**, lui, contrôle les **clients internes** qui **sortent** (filtrage, cache, logs). Mnémo : forward = clients, reverse = serveurs.`,
        tags: ["proxy", "reverse-proxy", "waf"],
      },
      {
        id: "cyr-infra-dmz-rule",
        title: "La règle d'or de la DMZ",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🏰 DMZ

Quelle règle de flux définit correctement une **DMZ** et explique pourquoi elle protège le réseau interne ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Internet peut atteindre la DMZ, mais la DMZ ne doit pas atteindre librement l'interne.", cost: 30 },
          { text: "📖 Correction : Internet→DMZ autorisé, DMZ→interne refusé → un serveur compromis reste confiné.", cost: 80 },
        ],
        options: [
          "Internet peut atteindre la DMZ, mais la DMZ ne peut pas atteindre librement le réseau interne : un serveur public compromis reste confiné",
          "La DMZ a un accès total et permanent au réseau interne",
          "Le réseau interne est directement exposé à Internet via la DMZ",
          "La DMZ sert uniquement à accélérer le débit Internet",
        ],
        answer: 0,
        explanation: `La **DMZ** est un **tampon** : **Internet→DMZ** est autorisé (services publics), mais **DMZ→interne** est **refusé** (sauf flux précis et filtré). Ainsi, si un serveur exposé est **compromis**, l'attaquant reste **coincé dans la DMZ** et ne rebondit pas vers les données internes. C'est le principe de **cloisonnement**.`,
        tags: ["dmz", "cloisonnement", "flux"],
      },
      {
        id: "cyr-infra-dmz-archi",
        title: "Double pare-feu",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧅 Architecture DMZ

Pourquoi une **DMZ à double pare-feu (back-to-back)** est-elle plus robuste qu'une DMZ à pare-feu unique, surtout avec des équipements de **marques différentes** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Il faut franchir DEUX barrières ; une faille commune est moins probable avec deux marques.", cost: 20 },
          { text: "📖 Correction : deux pare-feu à franchir + marques différentes → une faille de l'un n'affecte pas l'autre.", cost: 50 },
        ],
        options: [
          "Il faut franchir deux pare-feu successifs ; avec deux marques, une vulnérabilité de l'un ne compromet pas l'autre (défense en profondeur)",
          "Parce qu'un seul pare-feu ne peut pas gérer la DMZ",
          "Parce que deux pare-feu doublent la bande passante",
          "Parce que cela supprime le besoin de journalisation",
        ],
        answer: 0,
        explanation: `En **back-to-back**, la DMZ est **entre** un pare-feu **externe** et un pare-feu **interne** : franchir la DMZ ne suffit pas, il faut **aussi** passer le pare-feu interne. Utiliser **deux marques différentes** évite qu'une **même vulnérabilité** compromette les deux barrières → **défense en profondeur**. Contre-partie : coût et complexité supérieurs.`,
        tags: ["dmz", "back-to-back", "defense-en-profondeur"],
      },
      {
        id: "cyr-infra-defaultdeny",
        title: "La politique par défaut",
        order: 6,
        difficulty: "easy",
        type: "text",
        prompt: `## 🚦 Politique de filtrage

Quelle est la **politique par défaut** recommandée pour un pare-feu, où l'on bloque tout puis n'ouvre que le strict nécessaire ?

*(Réponds par l'expression, en français ou en anglais.)*`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "En anglais : deny all / default deny.", cost: 15 },
          { text: "📖 Correction : le « tout refuser par défaut » (default deny / deny all).", cost: 40 },
        ],
        answer: "default deny",
        accept: ["default deny", "deny all", "deny by default", "tout refuser par défaut", "tout refuser par defaut", "tout interdire par défaut", "refus par défaut", "refus par defaut", "deny-all"],
        caseSensitive: false,
        explanation: `La bonne pratique est le **default deny** (« tout refuser par défaut ») : on **bloque tout**, puis on **n'autorise explicitement** que les flux nécessaires (moindre privilège), en **journalisant** les refus. L'inverse (**default allow**) laisse passer tout ce qui n'est pas explicitement interdit → dangereux et ingérable.`,
        tags: ["default-deny", "politique", "firewall"],
      },
    ],
  },
];
