import type { CourseSeed } from "../../../../types";

/** Cyber · Réseaux — Module 5 : interconnexion sécurisée des sites (IPsec, Kerberos, LDAP, IDS). */
export const interconnexion: CourseSeed[] = [
  {
    slug: "cyr-interconnexion",
    title: "Interconnexion sécurisée des sites",
    checkpoint: "cyber-reseaux",
    codename: "Site Link",
    domain: "Réseaux — Interconnexion",
    theme: "grid",
    icon: "Waypoints",
    accent: "#5FB3C6",
    order: 5,
    difficulty: "medium",
    summary:
      "Relier des sites et des services de façon sûre : IPsec (tunnel chiffré site-à-site), Kerberos (authentification par tickets et KDC), LDAP/LDAPS (annuaire centralisé) et IDS/IPS (détection et prévention d'intrusion, signatures vs anomalies, NIDS/HIDS).",
    objectives: [
      "Comprendre le rôle d'IPsec pour interconnecter des sites (VPN site-à-site)",
      "Expliquer l'authentification Kerberos (KDC, TGT, tickets de service)",
      "Décrire LDAP comme annuaire centralisé et l'intérêt de LDAPS",
      "Distinguer IDS et IPS, détection par signatures vs par anomalies, NIDS vs HIDS",
      "Assembler ces briques pour une interconnexion inter-sites de confiance",
    ],
    resources: [
      {
        label: "IETF RFC 4120 — The Kerberos Network Authentication Service (V5)",
        url: "https://datatracker.ietf.org/doc/html/rfc4120",
        kind: "link",
        note: "La RFC de référence du protocole Kerberos (tickets, KDC, TGT/TGS).",
      },
      {
        label: "NIST SP 800-94 — Guide to Intrusion Detection and Prevention Systems (IDPS)",
        url: "https://csrc.nist.gov/pubs/sp/800/94/final",
        kind: "link",
        note: "Guide de référence sur les IDS/IPS : types, méthodes de détection, déploiement.",
      },
    ],
    lesson: `# 🔗 Interconnexion sécurisée des sites — Site Link

Une organisation multi-sites (siège, agences, télétravail) doit **relier ses réseaux** à travers Internet **sans exposer** ses données, **authentifier** ses utilisateurs de façon centralisée et **détecter** les intrusions. Ce module couvre les briques d'**interconnexion et de confiance** : **IPsec**, **Kerberos**, **LDAP**, **IDS/IPS**. 🏎️

---

## 1. IPsec : le tunnel entre sites 🚇

**IPsec** (*IP Security*) sécurise les communications au niveau de la **couche 3 (IP)**. Son usage phare ici : le **VPN site-à-site**, qui relie deux réseaux distants par un **tunnel chiffré** à travers Internet, comme s'ils étaient sur le même réseau privé.

\`\`\`
   Site A (LAN)                  Internet                    Site B (LAN)
   10.1.0.0/16 ──[Passerelle A]═══ tunnel IPsec chiffré ═══[Passerelle B]── 10.2.0.0/16
                        └────── confidentialité + intégrité + authenticité ──────┘
\`\`\`

IPsec garantit :
- **Confidentialité** (chiffrement du trafic),
- **Intégrité** (détection de toute altération),
- **Authenticité** de l'origine,
- **Protection anti-rejeu**.

Il repose sur des **associations de sécurité (SA)** négociées par **IKE** (*Internet Key Exchange*), et deux protocoles de protection : **AH** et **ESP**, en modes **transport** ou **tunnel**. *(Le détail des en-têtes AH/ESP, des modes et des VPN est développé au module 6.)*

> 🧭 Pour l'interconnexion de sites, on utilise IPsec en **mode tunnel** (le paquet IP entier est encapsulé et chiffré) entre deux **passerelles VPN** : les postes des deux sites communiquent en clair sur leur LAN, et c'est le **trajet Internet** qui est protégé.

---

## 2. Kerberos : l'authentification par tickets 🎫

**Kerberos** est un protocole d'**authentification centralisée** très répandu (cœur de l'authentification des domaines Windows/Active Directory). Son principe : un **tiers de confiance**, le **KDC** (*Key Distribution Center*), délivre des **tickets** qui prouvent l'identité **sans jamais faire circuler le mot de passe** sur le réseau.

### Les composants

- **KDC** (*Key Distribution Center*), composé de :
  - l'**AS** (*Authentication Server*) : authentifie l'utilisateur au départ,
  - le **TGS** (*Ticket Granting Server*) : délivre les tickets d'accès aux services.
- **TGT** (*Ticket Granting Ticket*) : le « ticket maître » obtenu après la connexion initiale.
- **Ticket de service** : un ticket spécifique pour accéder à **un** service donné.

### Le flux (simplifié)

\`\`\`
   1) Utilisateur → AS   : demande d'authentification (preuve dérivée du mot de passe)
   2) AS → Utilisateur   : TGT (chiffré) + clé de session
   3) Utilisateur → TGS  : "je veux accéder au service X" (présente le TGT)
   4) TGS → Utilisateur  : ticket de service pour X
   5) Utilisateur → Service X : présente le ticket de service → accès accordé
\`\`\`

Atouts :
- Le **mot de passe ne circule jamais** : on manipule des **tickets** et des **clés de session**.
- **SSO** (*Single Sign-On*) : une seule authentification (le TGT) donne accès à plusieurs services sans se ré-authentifier.
- Basé sur de la **cryptographie symétrique** et des **horodatages** (protection anti-rejeu) → sensible à la **désynchronisation d'horloge** (les serveurs doivent être à l'heure, via NTP).

> ⚠️ Kerberos a ses attaques (ex. *pass-the-ticket*, *Kerberoasting* qui vise les tickets de service faibles) — d'où l'importance de **mots de passe de service robustes** et d'un **KDC durci**.

---

## 3. LDAP : l'annuaire centralisé 📇

**LDAP** (*Lightweight Directory Access Protocol*) est le protocole d'accès aux **annuaires** : une base **hiérarchique** centralisant les **identités** (utilisateurs, groupes), les **ressources** et leurs **attributs** (courriel, appartenance à un groupe, droits). Active Directory, OpenLDAP en sont des implémentations.

Rôle en sécurité : **centraliser l'authentification et les autorisations**. Les services (VPN, applications, RADIUS pour le Wi-Fi d'entreprise) **interrogent l'annuaire** pour valider identités et droits → une **source unique** de vérité (et un point de **révocation** unique).

⚠️ **LDAP en clair** transmet les requêtes (et parfois des identifiants) **sans chiffrement** → on utilise **LDAPS** (LDAP sur **TLS**) ou **STARTTLS** pour protéger les échanges. Risques associés : **injection LDAP** (entrées non filtrées interprétées par l'annuaire), énumération d'utilisateurs, comptes à privilèges mal protégés.

> 🧭 LDAP est le **socle d'identité** ; Kerberos s'appuie souvent dessus (dans AD, le KDC et l'annuaire cohabitent). Toujours **chiffrer** (LDAPS) et **filtrer les entrées** contre l'injection.

---

## 4. IDS / IPS : détecter et bloquer les intrusions 🚨

Un pare-feu **filtre** selon des règles ; un **IDS/IPS** **analyse le trafic** pour repérer des **comportements malveillants** qui passent à travers les règles.

- **IDS** (*Intrusion Detection System*) : **détecte et alerte** — il **observe** (souvent en copie du trafic, *port mirroring*) et **signale** une intrusion, **sans** la bloquer. **Passif**.
- **IPS** (*Intrusion Prevention System*) : **détecte et bloque** — placé **en coupure** (*inline*) sur le flux, il peut **rejeter** le trafic malveillant en temps réel. **Actif**.

### Où : NIDS vs HIDS

- **NIDS** (*Network IDS*) : surveille le **trafic réseau** (un segment, la bordure). Vision large, mais ne voit pas l'intérieur du trafic **chiffré**.
- **HIDS** (*Host IDS*) : installé **sur une machine** ; surveille ses **journaux, fichiers, processus**. Vision fine d'un hôte (voit après déchiffrement local), mais limité à cette machine.

### Comment : signatures vs anomalies

- **Détection par signatures** : compare le trafic à une **base de motifs connus** d'attaques. **Précise** (peu de faux positifs) mais **aveugle aux attaques inconnues** (0-day) — il faut **mettre à jour** les signatures.
- **Détection par anomalies** (comportementale) : apprend un **profil « normal »** et alerte sur les **écarts**. Peut détecter du **nouveau/inconnu**, mais génère plus de **faux positifs** et nécessite un apprentissage.

\`\`\`
   IDS (passif)   : trafic ──►[copie]──► [IDS] ──► ALERTE (ne bloque pas)
   IPS (en ligne) : trafic ──► [IPS] ──► autorisé / BLOQUÉ  (agit en temps réel)
\`\`\`

> 🧠 Complémentarité : **NIDS + HIDS** couvrent réseau **et** hôtes ; **signatures + anomalies** couvrent le **connu** **et** l'**inconnu**. Les alertes convergent idéalement vers un **SIEM** (module 9) pour corrélation. Attention : un IPS mal réglé peut **bloquer du trafic légitime** (faux positifs) → réglage prudent.

---

## 5. Assembler l'interconnexion de confiance 🧩

Un déploiement inter-sites cohérent combine :
- **IPsec (VPN site-à-site)** pour **relier les réseaux** de façon chiffrée,
- **Kerberos + LDAP** pour une **identité centralisée** (authentification par tickets, annuaire unique) — un utilisateur d'une agence est authentifié **de la même façon** partout,
- **IDS/IPS** pour **surveiller et bloquer** les intrusions sur les liens et les hôtes,
- le tout **derrière** le périmètre (pare-feu, DMZ — module 4).

> 🧭 Résultat : les sites communiquent comme un **réseau privé unique**, les identités sont **centralisées et révocables**, et les intrusions sont **détectées/bloquées**. C'est la traduction concrète de la **défense en profondeur** à l'échelle multi-sites.

---

## 🧠 À retenir

- **IPsec** sécurise la **couche 3** : **VPN site-à-site** en **mode tunnel** entre deux passerelles → confidentialité + intégrité + authenticité + anti-rejeu sur le trajet Internet. (Détail AH/ESP au module 6.)
- **Kerberos** : authentification **centralisée** par **tickets** via le **KDC** (**AS** + **TGS**). L'utilisateur obtient un **TGT** puis des **tickets de service** ; le **mot de passe ne circule jamais** ; permet le **SSO**. Sensible à l'**horloge** (NTP) et à des attaques (pass-the-ticket, Kerberoasting).
- **LDAP** : **annuaire** hiérarchique centralisant identités/droits ; **socle d'identité** interrogé par les services. **Chiffrer avec LDAPS/STARTTLS** ; se méfier de l'**injection LDAP**.
- **IDS** (détecte/alerte, **passif**) vs **IPS** (détecte/**bloque**, **inline**, actif). **NIDS** (réseau, aveugle au chiffré) vs **HIDS** (hôte, fin). **Signatures** (connu, précis) vs **anomalies** (inconnu, plus de faux positifs).
- Assemblage inter-sites : **IPsec** (relier) + **Kerberos/LDAP** (identité centralisée) + **IDS/IPS** (surveiller/bloquer), derrière le **périmètre** → défense en profondeur multi-sites.`,
    badge: {
      id: "badge-cyr-site-link",
      name: "Site Link",
      icon: "Waypoints",
      description: "Maîtrise IPsec site-à-site, Kerberos (tickets/KDC), LDAP/LDAPS et les IDS/IPS.",
    },
    challenges: [
      {
        id: "cyr-inter-ipsec",
        title: "VPN site-à-site",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚇 IPsec

Pour relier les LAN de deux agences à travers Internet comme un seul réseau privé, on déploie un **VPN site-à-site IPsec**. À quelle couche IPsec opère-t-il, et que garantit le tunnel ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "IPsec = IP Security → couche 3 ; le tunnel chiffre et authentifie le trajet.", cost: 20 },
          { text: "📖 Correction : couche 3 (IP) ; confidentialité + intégrité + authenticité + anti-rejeu.", cost: 50 },
        ],
        options: [
          "À la couche 3 (IP) ; il garantit confidentialité, intégrité, authenticité et protection anti-rejeu",
          "À la couche 2 ; il ne fait que du filtrage de ports",
          "À la couche 7 ; il ne chiffre rien",
          "IPsec ne fonctionne qu'en Wi-Fi",
        ],
        answer: 0,
        explanation: `**IPsec** opère à la **couche 3 (IP)**. En **VPN site-à-site** (mode **tunnel**, entre deux passerelles), il assure **confidentialité** (chiffrement), **intégrité**, **authenticité** et **anti-rejeu** sur le trajet Internet. Les postes communiquent en clair sur leur LAN ; c'est le **trajet public** qui est protégé.`,
        tags: ["ipsec", "vpn", "site-a-site"],
      },
      {
        id: "cyr-inter-kerberos",
        title: "Le ticket de Kerberos",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🎫 Kerberos

Quel est l'**intérêt de sécurité majeur** du fonctionnement de Kerberos par tickets et KDC ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Que fait-on circuler à la place du mot de passe ?", cost: 30 },
          { text: "📖 Correction : le mot de passe ne circule jamais ; on échange des tickets/clés de session (SSO).", cost: 80 },
        ],
        options: [
          "Le mot de passe ne circule jamais sur le réseau : on échange des tickets et des clés de session (et cela permet le SSO)",
          "Chaque service stocke le mot de passe en clair pour aller plus vite",
          "Le KDC diffuse le mot de passe à tous les serveurs",
          "Kerberos supprime tout besoin d'authentification",
        ],
        answer: 0,
        explanation: `Avec **Kerberos**, l'utilisateur obtient un **TGT** auprès du **KDC** (AS), puis des **tickets de service** via le **TGS** : le **mot de passe ne transite jamais** sur le réseau, on manipule des **tickets** et **clés de session**. Bonus : le **SSO** (une auth pour plusieurs services). Contrainte : **horloges synchronisées** (anti-rejeu par horodatage).`,
        tags: ["kerberos", "kdc", "tgt"],
      },
      {
        id: "cyr-inter-ldaps",
        title: "Sécuriser LDAP",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📇 LDAP

Quel est le principal problème de **LDAP « en clair »**, et comment le corrige-t-on ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Les requêtes (et parfois des identifiants) passent sans chiffrement.", cost: 20 },
          { text: "📖 Correction : LDAP en clair est interceptable → utiliser LDAPS (LDAP sur TLS) / STARTTLS.", cost: 50 },
        ],
        options: [
          "LDAP en clair est interceptable (requêtes/identifiants non chiffrés) → utiliser LDAPS (LDAP sur TLS) ou STARTTLS",
          "LDAP est trop rapide et sature le réseau",
          "LDAP ne peut stocker aucune identité",
          "LDAP chiffre déjà tout par défaut, aucun risque",
        ],
        answer: 0,
        explanation: `**LDAP en clair** transmet requêtes et parfois identifiants **sans chiffrement** → interceptables. On le sécurise avec **LDAPS** (LDAP sur **TLS**) ou **STARTTLS**. Il faut aussi se prémunir de l'**injection LDAP** (filtrer les entrées) et protéger les **comptes à privilèges** de l'annuaire, socle d'identité.`,
        tags: ["ldap", "ldaps", "tls"],
      },
      {
        id: "cyr-inter-ids-ips",
        title: "IDS vs IPS",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚨 Détection d'intrusion

Quelle est la différence fondamentale entre un **IDS** et un **IPS** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "L'un observe et alerte (passif), l'autre est en coupure et peut bloquer (actif).", cost: 20 },
          { text: "📖 Correction : IDS détecte/alerte (passif) ; IPS détecte et bloque (inline, actif).", cost: 50 },
        ],
        options: [
          "L'IDS détecte et alerte (passif) ; l'IPS est placé en coupure (inline) et peut bloquer le trafic malveillant en temps réel",
          "L'IDS bloque tout ; l'IPS se contente d'alerter",
          "Les deux sont identiques, seul le nom change",
          "L'IDS ne fonctionne qu'avec du trafic chiffré",
        ],
        answer: 0,
        explanation: `Un **IDS** est **passif** : il **observe** (souvent en copie du trafic) et **alerte**, sans bloquer. Un **IPS** est **actif** : placé **en coupure (inline)**, il peut **rejeter** le trafic malveillant en temps réel. Attention : un IPS mal réglé peut **bloquer du légitime** (faux positifs).`,
        tags: ["ids", "ips", "detection"],
      },
      {
        id: "cyr-inter-signatures",
        title: "Signatures vs anomalies",
        order: 5,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🔍 Méthodes de détection

Concernant la détection par **signatures** et par **anomalies**, quelles affirmations sont **vraies** ? (Coche toutes les bonnes.)`,
        points: 350,
        timeLimitSec: 420,
        options: [
          "La détection par signatures est précise sur les attaques connues mais aveugle aux 0-day",
          "La détection par anomalies peut repérer du trafic inconnu mais génère plus de faux positifs",
          "Les signatures doivent être régulièrement mises à jour pour rester efficaces",
          "La détection par signatures détecte parfaitement les attaques totalement inédites",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Signatures = connu/précis ; anomalies = inconnu/plus de faux positifs.", cost: 30 },
          { text: "📖 Correction : les 3 premières sont vraies ; les signatures NE détectent PAS l'inédit.", cost: 80 },
        ],
        explanation: `Les **signatures** comparent à une base de **motifs connus** : **précises** mais **aveugles au 0-day**, et à **mettre à jour** en continu. Les **anomalies** apprennent un profil « normal » et détectent les **écarts** : capables de repérer de l'**inconnu**, au prix de plus de **faux positifs**. La 4ᵉ affirmation est **fausse** (les signatures ne voient pas l'inédit).`,
        tags: ["signatures", "anomalies", "ids"],
      },
      {
        id: "cyr-inter-nids-hids",
        title: "NIDS ou HIDS ?",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🖥️ Emplacement

On veut surveiller les **journaux, fichiers et processus d'un serveur critique précis**, y compris après déchiffrement local du trafic. Quel type de sonde est le plus adapté ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Installé SUR l'hôte, il voit l'intérieur de la machine.", cost: 20 },
          { text: "📖 Correction : un HIDS (Host IDS).", cost: 50 },
        ],
        options: [
          "Un HIDS (Host IDS), installé sur la machine",
          "Un NIDS (Network IDS), sur le segment réseau",
          "Un serveur DHCP",
          "Un proxy inverse",
        ],
        answer: 0,
        explanation: `Un **HIDS** (*Host IDS*) est installé **sur la machine** : il surveille **journaux, fichiers, processus** et voit le trafic **après déchiffrement local** — idéal pour un serveur critique. Le **NIDS** surveille le **trafic réseau** (vision large) mais est **aveugle au chiffré**. Les deux sont **complémentaires**.`,
        tags: ["hids", "nids", "hote"],
      },
    ],
  },
];
