import type { CourseSeed } from "../../../../types";

/** Cyber · Wi-Fi — Module 5 : authentification entreprise (802.1X / RADIUS / EAP). */
export const entreprise: CourseSeed[] = [
  {
    slug: "cyw-entreprise",
    title: "Authentification entreprise et contrôle d'accès",
    checkpoint: "cyber-wifi",
    codename: "Enterprise Gate",
    domain: "Sans-fil — 802.1X / RADIUS",
    theme: "grid",
    icon: "IdCard",
    accent: "#93B896",
    order: 5,
    difficulty: "hard",
    summary:
      "Le Wi-Fi d'entreprise : différences WPA2/WPA3 Personnel (PSK) vs Entreprise (802.1X), les trois rôles de 802.1X (supplicant/authenticator/serveur RADIUS), les méthodes EAP (EAP-TLS, PEAP), la dérivation d'une PMK par utilisateur, et les cas d'usage santé/entreprise.",
    objectives: [
      "Distinguer WPA2/WPA3 Personnel (PSK) et Entreprise (802.1X)",
      "Décrire les trois rôles de 802.1X et le protocole EAPOL",
      "Comparer les principales méthodes EAP (EAP-TLS, PEAP, EAP-TTLS)",
      "Comprendre comment RADIUS fournit une PMK unique par session/utilisateur",
      "Illustrer les cas d'usage (santé, entreprise) et les attaques associées",
    ],
    resources: [
      {
        label: "IETF RFC 3748 — Extensible Authentication Protocol (EAP)",
        url: "https://datatracker.ietf.org/doc/html/rfc3748",
        kind: "link",
        note: "La RFC de référence qui définit EAP, socle de l'authentification 802.1X.",
      },
      {
        label: "IETF RFC 2865 — RADIUS",
        url: "https://datatracker.ietf.org/doc/html/rfc2865",
        kind: "link",
        note: "Le protocole d'authentification, d'autorisation et de comptabilité (AAA) au cœur du Wi-Fi d'entreprise.",
      },
    ],
    lesson: `# 🏢 Authentification entreprise et contrôle d'accès — Enterprise Gate

En **maison**, une clé Wi-Fi partagée suffit. En **entreprise** — a fortiori dans un **hôpital** ou une banque — partager **un seul mot de passe** entre des centaines de personnes est ingérable et dangereux. La solution : donner à **chaque utilisateur ses propres identifiants**, validés par un serveur central. C'est **WPA2/WPA3-Entreprise**, bâti sur **802.1X**. 🏎️

---

## 1. Personnel (PSK) vs Entreprise (802.1X) 🔑

| | **Personnel (PSK)** | **Entreprise (802.1X)** |
|---|---|---|
| Secret | **une** passphrase partagée | **identifiants individuels** (login/mot de passe ou **certificat**) |
| Qui valide | l'AP lui-même | un **serveur d'authentification (RADIUS)** |
| PMK | dérivée de la passphrase (**même pour tous**) | **générée par session/utilisateur** (unique) |
| Révoquer un accès | changer la clé **pour tout le monde** | désactiver **un seul compte** |
| Traçabilité | faible (tout le monde = même clé) | **par utilisateur** (qui, quand) |
| Cible | maison, petite structure | **entreprise, santé, campus** |

Le problème du **PSK en entreprise** est structurel :
- Si un employé **part** (ou une clé **fuite**), il faut **changer la passphrase** et la **redéployer sur tous** les appareils.
- **Impossible de savoir qui** est derrière une connexion (tout le monde partage la même clé).
- Un seul secret compromis expose **tout** le réseau.

> 🧭 WPA2/WPA3-Entreprise résout tout cela en remplaçant « une clé pour tous » par « **une identité par personne** », vérifiée par un **serveur**. C'est le point que l'examen soulève pour les contextes **santé/entreprise**.

---

## 2. 802.1X : les trois rôles 🎭

**802.1X** est un standard de **contrôle d'accès basé sur le port** (à l'origine pour les ports de switch filaires, étendu au Wi-Fi). Il fait intervenir **trois acteurs** :

\`\`\`
   ┌───────────────┐        ┌────────────────┐        ┌──────────────────┐
   │  SUPPLICANT   │  EAPOL │ AUTHENTICATOR  │ RADIUS │ AUTHENTICATION   │
   │  (le client   │◄──────►│  (l'AP ou le   │◄──────►│ SERVER (RADIUS)  │
   │   Wi-Fi)      │        │   contrôleur)  │        │  + annuaire      │
   └───────────────┘        └────────────────┘        └──────────────────┘
        « je suis Alice »       relaie l'échange          vérifie l'identité
\`\`\`

- **Supplicant** : le **client** (le logiciel sur le PC/smartphone qui demande l'accès).
- **Authenticator** : l'**AP** (ou le contrôleur WLAN / le switch). Il **ne décide pas** : il **relaie** la conversation d'authentification et garde le « port » **fermé** tant que l'identité n'est pas validée. Il ne laisse passer, avant validation, que le trafic **EAPOL**.
- **Authentication Server** : en pratique un **serveur RADIUS**, adossé à un **annuaire** (Active Directory, LDAP…). C'est **lui** qui vérifie les identifiants/certificats et dit « **oui/non** ».

Le dialogue client ↔ AP se fait en **EAPOL** (*EAP over LAN*) ; l'AP ↔ serveur en **RADIUS**. Le protocole d'authentification transporté est **EAP** (*Extensible Authentication Protocol*), un **cadre extensible** qui accepte plusieurs **méthodes**.

---

## 3. Les méthodes EAP 🔬

EAP est un **conteneur** : la vraie méthode d'authentification varie. Les principales :

- **EAP-TLS** — **le plus robuste**. Authentification **mutuelle par certificats** : le serveur **et** le client présentent chacun un **certificat** (PKI). Pas de mot de passe à voler. Coût : déployer une **PKI** et un certificat sur chaque appareil.
- **PEAP** (*Protected EAP*) — très répandu. Établit d'abord un **tunnel TLS** (le serveur présente **son** certificat), **dans lequel** le client s'authentifie par **mot de passe** (souvent **MSCHAPv2**). Plus simple (pas de certificat client), mais dépend de la **validation du certificat serveur** par le client.
- **EAP-TTLS** — proche de PEAP : tunnel TLS côté serveur, puis méthode interne variée (mot de passe, etc.).
- **EAP-FAST** (Cisco) — tunnel via un secret **PAC** au lieu d'un certificat.
- **LEAP** (Cisco, ancien) — **obsolète et cassé** (mots de passe vulnérables) : à **ne plus utiliser**.

> ⚠️ Faille classique de **PEAP/EAP-TTLS** : si le client **ne valide pas** le certificat du serveur RADIUS, un attaquant monte un **faux AP + faux RADIUS (evil twin)**, le client s'y connecte et **livre son MSCHAPv2** → l'attaquant casse le mot de passe hors ligne. **La validation du certificat serveur est donc obligatoire.** **EAP-TLS** (certificat des deux côtés) échappe à ce piège.

---

## 4. RADIUS et la clé par session 🗝️

Le rôle de **RADIUS** dépasse l'authentification : c'est un serveur **AAA** (**A**uthentication, **A**uthorization, **A**ccounting — les 3 A vus en intro sécurité) :
- **Authentication** : valide l'identité (login/mot de passe/certificat) via l'annuaire.
- **Authorization** : décide **des droits** — et peut renvoyer à l'AP des **attributs**, par exemple un **VLAN dynamique** (placer l'utilisateur dans le bon segment selon son rôle : « médecins », « invités »…).
- **Accounting** : **journalise** qui s'est connecté, quand, combien de temps → **traçabilité** individuelle.

Point crucial pour la sécurité : à l'issue d'une authentification 802.1X réussie, le serveur RADIUS et le client dérivent une **PMK propre à cette session** (transmise à l'AP). **Chaque utilisateur, chaque session, obtient une clé maîtresse différente**, puis un **4-way handshake** normal (module 3) chiffre les données en **AES-CCMP**.

\`\`\`
   Association 802.11
        │
        ▼
   802.1X / EAP  (supplicant ↔ AP ↔ RADIUS)  → identité validée
        │
        ▼
   RADIUS génère une PMK UNIQUE pour cette session → envoyée à l'AP
        │
        ▼
   4-way handshake (PMK → PTK/GTK)  → données chiffrées AES-CCMP
\`\`\`

> 🧠 Conséquence : contrairement au PSK (clé commune), **compromettre un compte n'expose que cet utilisateur**, et le trafic de chacun est chiffré avec **sa propre clé de session**. C'est un gain énorme de **confidentialité** et de **traçabilité**.

---

## 5. Cas d'usage : santé et entreprise 🏥

L'examen met en avant le **802.1X en milieu de santé**. Pourquoi est-il quasi incontournable là et dans les grandes organisations :
- **Identités individuelles** : chaque soignant/employé s'authentifie avec **son compte** → on sait **qui** accède au réseau (exigence réglementaire pour les données de santé, RGPD, etc.).
- **Révocation immédiate** : un départ = **désactiver un compte**, sans toucher aux autres, sans changer de clé partout.
- **Segmentation par rôle** : RADIUS affecte un **VLAN** selon le profil (personnel médical, administratif, dispositifs médicaux, invités) → cloisonnement du trafic.
- **Traçabilité (accounting)** : journaux par utilisateur, indispensables en cas d'incident/audit.
- **Pas de secret partagé** à faire fuiter : fini le post-it avec « la clé du Wi-Fi ».

### WPA3-Entreprise

WPA3 conserve 802.1X et ajoute un **mode « 192 bits »** (suite cryptographique renforcée : AES-256-GCMP, condensats SHA-384, certificats forts) pour les environnements **très sensibles** (défense, santé critique, finance). Il impose aussi **PMF**.

> 🧭 Résumé de la valeur : le Wi-Fi **Entreprise** apporte **identité individuelle + clé par session + révocation ciblée + segmentation + traçabilité**. Le **PSK** ne peut structurellement offrir aucun de ces cinq points.

---

## 6. Attaques et vigilance côté Entreprise ⚠️

Le mode Entreprise n'est **pas magique** — il déplace les risques :
- **Evil twin + faux RADIUS** contre **PEAP** si le client **ne valide pas** le certificat serveur → vol de **MSCHAPv2** (voir §3). **Parade** : imposer la **validation du certificat** (et son autorité) côté client ; privilégier **EAP-TLS**.
- **Sécurité du serveur RADIUS et de la PKI** : ce sont des **actifs critiques** (leur compromission = tout le réseau).
- **LEAP / méthodes faibles** : à bannir.
- **Vol de certificat/appareil** : nécessite une **révocation** (CRL/OCSP) et idéalement un **stockage matériel** des clés (TPM).

---

## 🧠 À retenir

- **Personnel (PSK)** = **une** passphrase partagée, validée par l'AP, **même PMK pour tous** → révocation = changer la clé **partout**, **aucune traçabilité** individuelle. **Entreprise (802.1X)** = **identités individuelles** validées par un **serveur RADIUS**, **PMK unique par session/utilisateur**.
- **802.1X, trois rôles** : **Supplicant** (client) ↔ **Authenticator** (AP/contrôleur, qui **relaie** et garde le port fermé) ↔ **Authentication Server** (**RADIUS** + annuaire, qui décide). Dialogue **EAPOL** (client-AP) puis **RADIUS** (AP-serveur), méthode **EAP** transportée.
- **Méthodes EAP** : **EAP-TLS** (certificats **des deux côtés**, le plus fort) ; **PEAP** (tunnel TLS + mot de passe **MSCHAPv2**) ; **EAP-TTLS** ; **LEAP** = **obsolète/cassé**. Piège **PEAP** : sans **validation du certificat serveur**, un **faux RADIUS (evil twin)** vole le MSCHAPv2.
- **RADIUS = AAA** : **Authentication**, **Authorization** (dont **VLAN dynamique** par rôle), **Accounting** (traçabilité par utilisateur). Il fournit une **PMK par session** → **4-way handshake** puis **AES-CCMP**.
- **Cas santé/entreprise** : identité individuelle, **révocation ciblée**, **segmentation par rôle**, **traçabilité**, pas de secret partagé — cinq atouts que le **PSK ne peut pas** offrir.
- **WPA3-Entreprise** ajoute un mode **192 bits** (AES-256-GCMP, SHA-384) et **PMF** obligatoire.
- Vigilance : **valider le certificat serveur** (ou EAP-TLS), **protéger RADIUS/PKI**, bannir LEAP, prévoir la **révocation**.`,
    badge: {
      id: "badge-cyw-enterprise-gate",
      name: "Enterprise Gate",
      icon: "IdCard",
      description: "Maîtrise 802.1X, RADIUS, les méthodes EAP et la différence Personnel vs Entreprise.",
    },
    challenges: [
      {
        id: "cyw-ent-perso-vs-ent",
        title: "Le vrai avantage de l'Entreprise",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🏥 Santé & entreprise

Dans un **hôpital**, pourquoi préfère-t-on le **WPA2-Entreprise (802.1X)** au **WPA2-Personnel (PSK)** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Pense identités individuelles, révocation d'un seul compte, traçabilité.", cost: 20 },
          { text: "📖 Correction : identifiants individuels + révocation ciblée + traçabilité par utilisateur.", cost: 50 },
        ],
        options: [
          "Chaque personne a des identifiants individuels : on peut révoquer un seul compte et tracer qui accède",
          "La passphrase partagée est plus facile à retenir pour tout le personnel",
          "Cela supprime tout besoin de chiffrement des données",
          "Cela rend le réseau plus rapide en débit brut",
        ],
        answer: 0,
        explanation: `Le mode **Entreprise** remplace « une clé pour tous » par des **identités individuelles** validées par **RADIUS** : on **révoque un seul compte** au départ d'un employé (sans changer la clé partout), on **trace qui** se connecte (accounting), et chaque session a **sa propre clé**. En **PSK**, une fuite oblige à changer la clé pour **tout le monde** et **rien** n'est traçable individuellement.`,
        tags: ["802.1x", "psk", "sante"],
      },
      {
        id: "cyw-ent-roles",
        title: "Les rôles de 802.1X",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎭 Architecture 802.1X

Dans 802.1X, quel composant **prend la décision** finale d'accepter ou refuser l'identité, et quel rôle joue l'**AP** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "L'AP ne décide pas : il relaie. Le décideur est le serveur d'authentification.", cost: 20 },
          { text: "📖 Correction : le serveur RADIUS décide ; l'AP (authenticator) relaie et garde le port fermé.", cost: 50 },
        ],
        options: [
          "Le serveur RADIUS décide ; l'AP (authenticator) ne fait que relayer l'échange et garder le port fermé jusqu'à validation",
          "L'AP décide seul ; le serveur RADIUS ne sert à rien",
          "Le client (supplicant) s'auto-valide sans serveur",
          "C'est le switch du fournisseur d'accès qui tranche",
        ],
        answer: 0,
        explanation: `Les trois rôles : **supplicant** (client), **authenticator** (**AP**/contrôleur) et **authentication server** (**RADIUS**). L'**AP relaie** la conversation EAP et garde le « port » **fermé** (seul EAPOL passe) tant que le **serveur RADIUS** — le vrai décideur, adossé à un annuaire — n'a pas validé l'identité.`,
        tags: ["802.1x", "radius", "supplicant"],
      },
      {
        id: "cyw-ent-eaptls",
        title: "La méthode EAP la plus robuste",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔬 Méthodes EAP

Quelle méthode **EAP** offre la meilleure robustesse en authentifiant **mutuellement** client et serveur **par certificats**, sans mot de passe à voler ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Un certificat côté serveur ET côté client (PKI des deux côtés).", cost: 30 },
          { text: "📖 Correction : EAP-TLS.", cost: 80 },
        ],
        options: [
          "EAP-TLS (certificats mutuels)",
          "LEAP (Cisco, historique)",
          "WEP-EAP",
          "EAP en clair sans tunnel",
        ],
        answer: 0,
        explanation: `**EAP-TLS** authentifie **mutuellement** par **certificats** (serveur **et** client) : pas de mot de passe à intercepter, immunité au piège du faux RADIUS. Coût : déployer une **PKI** et un certificat par appareil. **PEAP** est plus simple (tunnel TLS + mot de passe) mais exige la **validation du certificat serveur** ; **LEAP** est **obsolète/cassé**.`,
        tags: ["eap-tls", "certificat", "peap"],
      },
      {
        id: "cyw-ent-peap-evil",
        title: "Le piège du PEAP",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## ⚠️ Faux RADIUS

Avec **PEAP**, quel réglage côté client est **indispensable** pour éviter qu'un attaquant montant un **faux AP + faux serveur RADIUS** ne capture les identifiants ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Le client doit vérifier à qui il parle avant d'envoyer son mot de passe.", cost: 30 },
          { text: "📖 Correction : valider le certificat du serveur RADIUS (et son autorité).", cost: 80 },
        ],
        options: [
          "Valider le certificat du serveur RADIUS (vérifier son identité/son autorité) avant d'envoyer le mot de passe",
          "Désactiver le chiffrement pour aller plus vite",
          "Utiliser le même mot de passe pour tous les employés",
          "Cacher le SSID de l'entreprise",
        ],
        answer: 0,
        explanation: `Dans **PEAP**, le client s'authentifie par **MSCHAPv2** à l'intérieur d'un tunnel TLS. S'il **ne valide pas** le **certificat du serveur** RADIUS, un **evil twin + faux RADIUS** récupère le MSCHAPv2 et casse le mot de passe hors ligne. **Valider le certificat serveur** (et l'autorité qui l'a émis) est donc **obligatoire** ; sinon, préférer **EAP-TLS**.`,
        tags: ["peap", "evil-twin", "certificat"],
      },
      {
        id: "cyw-ent-radius-aaa",
        title: "RADIUS et les 3 A",
        order: 5,
        difficulty: "medium",
        type: "multi",
        prompt: `## 🗝️ Rôles de RADIUS

Le serveur **RADIUS** est un serveur **AAA**. Parmi ces fonctions, **lesquelles** lui reviennent dans un Wi-Fi d'entreprise ? (Coche tout ce qui s'applique.)`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "Authentifier l'identité de l'utilisateur (via un annuaire)",
          "Autoriser et affecter des droits, ex. un VLAN dynamique selon le rôle",
          "Journaliser les connexions (traçabilité par utilisateur)",
          "Émettre physiquement les ondes radio à la place de l'AP",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "AAA = Authentication, Authorization, Accounting. L'émission radio reste le rôle de l'AP.", cost: 20 },
          { text: "📖 Correction : authentifier + autoriser (VLAN) + journaliser. Pas l'émission radio.", cost: 50 },
        ],
        explanation: `**RADIUS = AAA** : **Authentication** (valider l'identité via l'annuaire), **Authorization** (droits, dont **VLAN dynamique** par rôle), **Accounting** (journaliser → traçabilité individuelle). Il fournit aussi une **PMK par session**. L'**émission radio** reste le rôle de l'**AP** (authenticator), pas du serveur.`,
        tags: ["radius", "aaa", "vlan"],
      },
      {
        id: "cyw-ent-pmk-session",
        title: "La clé par session",
        order: 6,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔐 PMK unique

En WPA2-Entreprise, après une authentification 802.1X réussie, comment est obtenue la **clé maîtresse (PMK)** utilisée pour le 4-way handshake ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Elle n'est pas dérivée d'une passphrase commune : le serveur en génère une différente à chaque fois.", cost: 30 },
          { text: "📖 Correction : générée par le serveur RADIUS, unique par session/utilisateur.", cost: 80 },
        ],
        options: [
          "Elle est générée par le serveur RADIUS, unique pour chaque session/utilisateur, puis transmise à l'AP",
          "Elle est dérivée d'une passphrase partagée identique pour tous",
          "Elle est imprimée sous le routeur",
          "Il n'y a pas de PMK en mode Entreprise",
        ],
        answer: 0,
        explanation: `En **Entreprise**, il n'y a **pas** de passphrase commune : à l'issue de l'échange 802.1X/EAP, le **serveur RADIUS** (et le client) dérivent une **PMK unique par session/utilisateur**, transmise à l'AP. Ensuite, le **4-way handshake** normal dérive PTK/GTK et le trafic est chiffré en **AES-CCMP**. Compromettre un compte n'expose donc **que** cet utilisateur.`,
        tags: ["pmk", "session", "radius"],
      },
    ],
  },
];
