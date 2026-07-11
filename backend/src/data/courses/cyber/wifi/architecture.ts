import type { CourseSeed } from "../../../../types";

/** Cyber · Wi-Fi — Module 6 : architecture de sécurisation d'un WLAN (isolation invités, durcissement). */
export const architecture: CourseSeed[] = [
  {
    slug: "cyw-architecture",
    title: "Architecture de sécurisation réseau sans fil",
    checkpoint: "cyber-wifi",
    codename: "Fortress WLAN",
    domain: "Sans-fil — Architecture & durcissement",
    theme: "grid",
    icon: "Network",
    accent: "#93B896",
    order: 6,
    difficulty: "hard",
    summary:
      "Concevoir un WLAN sûr : isolation du trafic invité (SSID/VLAN dédié, client isolation, DMZ, VPN gateway, NAC), segmentation et homologation des visiteurs, détection des rogue AP (WIDS/WIPS), et check-list de durcissement (WPA3, PMF, désactiver WPS, IoT séparé). Domestique vs entreprise.",
    objectives: [
      "Concevoir l'isolation du trafic invité (SSID/VLAN dédié, client isolation, portail captif)",
      "Situer DMZ, VPN gateway et NAC dans l'isolation et le contrôle d'accès des visiteurs",
      "Comprendre la segmentation/homologation réseau des visiteurs",
      "Détecter et prévenir les rogue AP avec WIDS/WIPS et un contrôleur WLAN",
      "Appliquer une check-list de durcissement WLAN (entreprise et domestique)",
    ],
    resources: [
      {
        label: "ANSSI — recommandations de sécurité pour les réseaux Wi-Fi",
        url: "https://cyber.gouv.fr/",
        kind: "link",
        note: "Guides officiels de durcissement et de déploiement sécurisé des réseaux sans fil.",
      },
      {
        label: "NIST SP 800-153 — Guidelines for Securing Wireless LANs",
        url: "https://csrc.nist.gov/pubs/sp/800/153/final",
        kind: "link",
        note: "Recommandations de référence pour sécuriser un WLAN (architecture, surveillance, configuration).",
      },
    ],
    lesson: `# 🏰 Architecture de sécurisation réseau sans fil — Fortress WLAN

Sécuriser un Wi-Fi ne se limite pas à choisir WPA3 : il faut **penser l'architecture** — où placer les invités, comment cloisonner, comment détecter un AP pirate, quoi durcir. Ce module assemble tout en une **doctrine de déploiement**. 🏎️

---

## 1. Le problème des invités 🎟️

Une entreprise, un hôtel, un hôpital doivent offrir un **Wi-Fi visiteurs** — mais un invité **ne doit jamais** pouvoir atteindre le réseau **interne** (serveurs, imprimantes, dossiers, dispositifs médicaux). Laisser invités et personnel sur **le même réseau** est une faute majeure : un poste visiteur compromis deviendrait un **tremplin** vers les ressources sensibles.

L'objectif : **isoler le trafic invité** pour qu'il n'ait accès **qu'à Internet**, jamais au LAN interne. C'est exactement ce que l'examen interroge (**DMZ, VPN gateway, Network Access Controller**).

---

## 2. Les briques d'isolation des invités 🧱

### a) SSID + VLAN dédié

On crée un **SSID invité séparé** (ex. « CyberAce-Guest ») mappé sur un **VLAN dédié**. Le VLAN invité est **cloisonné** au niveau 2/3 : ses paquets ne peuvent pas **router** vers le VLAN interne (règles de pare-feu entre VLAN). C'est la **base** de toute isolation.

### b) Client isolation (AP isolation)

Sur le réseau invité, on active l'**isolation des clients** : deux appareils connectés au **même SSID invité** ne peuvent **pas se voir** entre eux (le trafic station-à-station est bloqué par l'AP). Cela empêche un invité malveillant d'**attaquer les autres invités** (ex. dans un hôtel).

### c) DMZ (zone démilitarisée)

Le réseau invité est placé dans une **DMZ** : un **segment tampon**, séparé du réseau interne par un **pare-feu**, qui n'a **accès qu'à Internet**. Comme les serveurs exposés publiquement, les invités sont « **dehors** » du point de vue du LAN interne. Toute tentative d'un invité vers l'intérieur est **bloquée par le pare-feu** de la DMZ.

\`\`\`
   Invités ─► SSID/VLAN Guest ─► [ DMZ ] ─► Pare-feu ─► Internet
                                    │
                                    ╳  (bloqué)
                                    ▼
                              LAN INTERNE (protégé)
\`\`\`

### d) VPN gateway

Autre approche (ou complément) : forcer certains flux à passer par une **passerelle VPN**. Deux usages :
- Le trafic invité (ou d'un site distant) est **encapsulé dans un tunnel chiffré** jusqu'à une passerelle contrôlée avant d'atteindre quoi que ce soit → **confidentialité + point de contrôle** unique.
- À l'inverse, pour un **accès légitime au LAN** depuis le Wi-Fi, on peut exiger un **VPN** : le Wi-Fi ne donne que l'accès Internet, et seul un **tunnel VPN authentifié** ouvre l'accès aux ressources internes.

### e) NAC (Network Access Control)

Le **NAC** (*Network Access Controller/Control*) est le **videur** du réseau : avant d'accorder un accès, il **vérifie** l'identité **et l'état** de l'appareil (est-il à jour ? antivirus actif ? appartient-il à l'entreprise ?) et l'**affecte dynamiquement** au bon segment (VLAN) — ou le met en **quarantaine**. Couplé à **802.1X/RADIUS** (module 5), il applique une politique : « **qui** + **quel appareil** + **dans quel état** → **quel accès** ». C'est lui qui **homologue** un visiteur et le **cantonne** au réseau invité.

> 🧭 Réponse type de l'examen : pour **isoler le trafic invité**, on combine **DMZ** (segment tampon vers Internet uniquement), **VPN gateway** (tunnel/point de contrôle) et **NAC** (contrôle d'accès et affectation de segment). Ce sont trois **briques complémentaires**, pas des alternatives exclusives.

---

## 3. Segmentation et homologation des visiteurs 🗂️

Au-delà des invités, une bonne architecture **segmente tout** le WLAN selon le principe du **moindre privilège** :
- **VLAN par population/rôle** : personnel, direction, invités, **IoT/dispositifs** (caméras, capteurs, matériel médical). Chaque segment n'atteint **que** ce dont il a besoin.
- **Homologation des visiteurs** : un visiteur est **enregistré** (portail captif, sponsor, ticket temporaire) et reçoit un accès **limité dans le temps et le périmètre** — jamais un accès permanent au cœur de réseau.
- **Micro-segmentation** : cloisonner finement pour **contenir** une compromission (un poste infecté ne contamine pas tout).

### Portail captif

Le **portail captif** intercepte la première connexion invité et impose une **page d'accueil** (acceptation des CGU, authentification légère, code d'accès). Utile pour l'**homologation** et la **traçabilité**, mais **attention** : un portail captif **n'est pas du chiffrement** — sans WPA3/OWE, le trafic invité peut rester en clair, et les portails sont imitables par un **evil twin** (module 4).

---

## 4. Détecter les AP pirates : WIDS / WIPS 📡

Contre les **rogue AP** et **evil twins** (module 4), on déploie un **WIDS/WIPS** :
- **WIDS** (*Wireless Intrusion Detection System*) : **surveille** le spectre radio et **alerte** sur les anomalies — un **BSSID inconnu** annonçant votre SSID, un AP non homologué branché sur le LAN, une **tempête de deauth**, un client suspect.
- **WIPS** (*…Prevention System*) : en plus, **réagit** automatiquement (par ex. contenir l'AP pirate, alerter, désactiver le port de switch concerné).

Un **contrôleur WLAN (WLC)** centralise la gestion des AP (configuration homogène, cartographie RF, détection des rogue) et facilite l'application uniforme des politiques.

---

## 5. Check-list de durcissement d'un WLAN ✅

**Chiffrement & authentification**
- Utiliser **WPA3** (ou au minimum **WPA2-AES/CCMP**) ; **désactiver WEP, WPA et TKIP**.
- En entreprise : **802.1X/RADIUS** (identités individuelles) plutôt que PSK ; **valider les certificats serveur**.
- **Passphrase forte** et **SSID non générique** (contre rainbow tables) si PSK.
- Activer **PMF/802.11w** (obligatoire WPA3) contre les deauth.

**Réduction de surface**
- **Désactiver WPS** (surtout le PIN).
- **Segmenter** : VLAN invités/IoT/personnel ; **client isolation** sur l'invité ; **DMZ** pour les visiteurs.
- **Ajuster la puissance** d'émission et le placement des AP pour **limiter le débordement** hors des locaux.
- Séparer les **objets connectés (IoT)** sur leur propre réseau (souvent mal sécurisés).

**Gestion & surveillance**
- **Mettre à jour** le firmware des AP et des clients (correctifs KRACK, etc.).
- Changer les **identifiants d'administration** par défaut des AP/box ; désactiver l'admin **côté Wi-Fi**.
- Déployer **WIDS/WIPS** et un **contrôleur WLAN** ; surveiller les **rogue AP**.
- **Journaliser** (accounting) et auditer régulièrement.

**Mesures de faible valeur (à connaître, mais ne pas s'y fier)**
- **Filtrage MAC** : contournable (MAC facilement **usurpable**) → défense **d'appoint**, pas une barrière.
- **Cacher le SSID** : **inefficace** (le SSID fuit à la connexion — module 1).

> 🧠 Aucune mesure isolée ne suffit : la sécurité Wi-Fi est une **défense en profondeur** (chiffrement fort **+** segmentation **+** contrôle d'accès **+** surveillance **+** mises à jour).

---

## 6. Domestique vs entreprise 🏠🏢

| | **Domestique** | **Entreprise** |
|---|---|---|
| Authentification | **WPA3/WPA2-PSK** (passphrase forte) | **802.1X/RADIUS** (identités individuelles) |
| Invités | **SSID invité** de la box + isolation | **VLAN/DMZ invité + portail + NAC** |
| Détection rogue | (limitée) | **WIDS/WIPS + WLC** |
| Durcissement clé | désactiver **WPS**, MAJ box, admin par défaut | segmentation, PKI, supervision, audits |
| IoT | réseau/SSID **séparé** pour les objets | VLAN IoT dédié, micro-segmentation |

> 🧭 Même à la maison, trois gestes ont un impact majeur : **WPA3/WPA2-AES + passphrase forte**, **désactiver WPS**, et **séparer les objets connectés** sur un SSID à part.

---

## 🧠 À retenir

- **Ne jamais mélanger invités et réseau interne.** Objectif : l'invité n'accède **qu'à Internet**.
- **Briques d'isolation invité** : **SSID + VLAN dédié**, **client isolation** (les invités ne se voient pas), **DMZ** (segment tampon vers Internet, bloqué par pare-feu vers l'interne), **VPN gateway** (tunnel/point de contrôle), **NAC** (vérifie identité + état de l'appareil et **affecte le segment**). Réponse-clé de l'examen : **DMZ + VPN gateway + NAC**, briques **complémentaires**.
- **Segmentation par rôle** (moindre privilège) : personnel / direction / invités / **IoT**. **Homologation** des visiteurs = enregistrement + accès **limité dans le temps/périmètre**. **Portail captif** ≠ chiffrement.
- **Détection des rogue AP/evil twin** : **WIDS** (alerte) / **WIPS** (réagit), centralisés par un **contrôleur WLAN (WLC)**.
- **Durcissement** : **WPA3** (ou WPA2-AES), désactiver **WEP/WPA/TKIP** et **WPS**, **PMF/802.11w**, **passphrase forte + SSID non générique**, **802.1X** en entreprise, **réduire la puissance/couverture**, **séparer l'IoT**, **mettre à jour** (KRACK), changer les **identifiants admin par défaut**, **journaliser**.
- Mesures **faibles** : **filtrage MAC** (MAC usurpable) et **SSID caché** (fuit à la connexion) → appoint seulement.
- La sécurité Wi-Fi est une **défense en profondeur** : chiffrement + segmentation + contrôle d'accès + surveillance + mises à jour. À la maison : **WPA3/WPA2-AES + passphrase forte**, **désactiver WPS**, **IoT à part**.`,
    badge: {
      id: "badge-cyw-fortress-wlan",
      name: "Fortress WLAN",
      icon: "Network",
      description: "Sait concevoir l'isolation des invités (DMZ/VPN/NAC), la segmentation et le durcissement d'un WLAN.",
    },
    challenges: [
      {
        id: "cyw-arch-guest-iso",
        title: "Isoler le trafic invité",
        order: 1,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🎟️ Trafic invité

Pour **isoler le trafic des visiteurs** d'un réseau d'entreprise (accès Internet seulement, jamais le LAN interne), quelles briques peut-on combiner ? (Coche toutes celles qui conviennent.)`,
        points: 350,
        timeLimitSec: 420,
        options: [
          "Une DMZ (segment tampon donnant vers Internet, séparé de l'interne par un pare-feu)",
          "Une passerelle VPN (tunnel chiffré / point de contrôle)",
          "Un NAC (Network Access Controller) qui vérifie et affecte le bon segment",
          "Brancher les invités sur le même VLAN que les serveurs internes",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Trois bonnes réponses complémentaires ; la quatrième est exactement ce qu'il ne faut PAS faire.", cost: 30 },
          { text: "📖 Correction : DMZ + VPN gateway + NAC. Jamais le même VLAN que les serveurs.", cost: 80 },
        ],
        explanation: `Pour isoler les invités on combine une **DMZ** (segment tampon vers Internet, bloqué vers l'interne par le pare-feu), une **VPN gateway** (tunnel/point de contrôle) et un **NAC** (contrôle d'accès + affectation de segment). Les mettre sur le **même VLAN que les serveurs** est précisément la faute à éviter : un poste invité compromis deviendrait un tremplin vers l'interne.`,
        tags: ["invites", "dmz", "vpn", "nac"],
      },
      {
        id: "cyw-arch-nac",
        title: "Le rôle du NAC",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚦 Network Access Control

Que fait principalement un **NAC** (Network Access Control) avant d'accorder l'accès au réseau ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Il joue le videur : il vérifie qui + quel appareil + dans quel état, puis affecte le segment.", cost: 20 },
          { text: "📖 Correction : vérifie identité + état de l'appareil et affecte dynamiquement le bon VLAN (ou quarantaine).", cost: 50 },
        ],
        options: [
          "Il vérifie l'identité et l'état de l'appareil, puis l'affecte au bon segment (ou le met en quarantaine)",
          "Il augmente la puissance d'émission des antennes",
          "Il remplace le chiffrement WPA3",
          "Il diffuse le SSID plus largement",
        ],
        answer: 0,
        explanation: `Le **NAC** est le « videur » : avant l'accès, il contrôle **qui** (identité, souvent via 802.1X/RADIUS), **quel appareil** et **dans quel état** (à jour ? conforme ?), puis l'**affecte dynamiquement** au VLAN adéquat ou le place en **quarantaine**. Il **homologue** ainsi les visiteurs et les cantonne au réseau invité.`,
        tags: ["nac", "controle-acces", "quarantaine"],
      },
      {
        id: "cyw-arch-client-iso",
        title: "Client isolation",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧱 Isolation des clients

Sur un Wi-Fi invité d'hôtel, on active la **client isolation** (AP isolation). Quel risque cela réduit-il ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Empêche deux appareils du même réseau invité de communiquer entre eux.", cost: 20 },
          { text: "📖 Correction : un invité malveillant ne peut pas attaquer les autres invités.", cost: 50 },
        ],
        options: [
          "Un invité malveillant ne peut pas voir ni attaquer les autres appareils invités",
          "Le débit Internet devient illimité",
          "Le chiffrement WPA3 n'est plus nécessaire",
          "Les invités accèdent au LAN interne plus vite",
        ],
        answer: 0,
        explanation: `La **client isolation** bloque le trafic **station-à-station** au sein du même SSID : deux invités connectés **ne se voient pas**. Un appareil malveillant ne peut donc pas **scanner/attaquer** les autres clients (très utile en hôtel, café, salle d'attente). Elle **ne remplace pas** le chiffrement ni la segmentation vers l'interne.`,
        tags: ["client-isolation", "invites", "segmentation"],
      },
      {
        id: "cyw-arch-wids",
        title: "Détecter un rogue AP",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📡 Surveillance RF

Quel dispositif surveille le spectre radio pour **repérer un point d'accès pirate** (rogue AP / evil twin) et alerter, voire réagir automatiquement ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un IDS/IPS mais pour le sans-fil.", cost: 20 },
          { text: "📖 Correction : un WIDS/WIPS (Wireless Intrusion Detection/Prevention System).", cost: 50 },
        ],
        options: [
          "Un WIDS/WIPS (Wireless Intrusion Detection/Prevention System)",
          "Un serveur DHCP",
          "Un simple répéteur Wi-Fi",
          "Le portail captif",
        ],
        answer: 0,
        explanation: `Un **WIDS** surveille le spectre et **alerte** sur un BSSID inconnu, un AP non homologué sur le LAN ou une tempête de deauth ; un **WIPS** **réagit** (contenir l'AP pirate, couper un port…). Un **contrôleur WLAN (WLC)** centralise cette détection. Ni le DHCP, ni un répéteur, ni le portail captif ne remplissent ce rôle.`,
        tags: ["wids", "wips", "rogue-ap"],
      },
      {
        id: "cyw-arch-weak-measures",
        title: "Les fausses barrières",
        order: 5,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🎭 Mesures d'appoint

Quelles mesures sont de **faible valeur** (contournables) et ne doivent **pas** être considérées comme de vraies barrières de sécurité Wi-Fi ? (Coche toutes celles qui s'appliquent.)`,
        points: 350,
        timeLimitSec: 420,
        options: [
          "Le filtrage d'adresses MAC (les MAC sont facilement usurpables)",
          "Cacher le SSID (il fuit dès qu'un client se connecte)",
          "Le chiffrement WPA3 / WPA2-AES",
          "La segmentation en VLAN + DMZ pour les invités",
        ],
        answer: [0, 1],
        hints: [
          { text: "Deux mesures « cosmétiques » et deux vraies protections.", cost: 30 },
          { text: "📖 Correction : filtrage MAC et SSID caché = faibles ; WPA3 et segmentation = vraies protections.", cost: 80 },
        ],
        explanation: `Le **filtrage MAC** (MAC **usurpable**) et le **SSID caché** (le nom **fuit** à la connexion) sont des mesures **d'appoint**, pas des barrières. À l'inverse, le **chiffrement WPA3/WPA2-AES** et la **segmentation VLAN/DMZ** sont de **vraies** protections. La sécurité Wi-Fi repose sur une **défense en profondeur**, pas sur ces astuces cosmétiques.`,
        tags: ["filtrage-mac", "ssid-cache", "defense-en-profondeur"],
      },
      {
        id: "cyw-arch-hardening",
        title: "Durcissement domestique",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🏠 Trois gestes clés

À la maison, parmi ces actions, laquelle apporte un **gain de sécurité réel et immédiat** contre une attaque connue ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Pense à la faille du PIN à 8 chiffres validé en deux moitiés.", cost: 20 },
          { text: "📖 Correction : désactiver le WPS.", cost: 50 },
        ],
        options: [
          "Désactiver le WPS (dont le PIN se casse en ~11 000 essais)",
          "Cacher le SSID de la box",
          "Activer uniquement le filtrage MAC",
          "Repasser le réseau en WEP pour la compatibilité",
        ],
        answer: 0,
        explanation: `**Désactiver le WPS** supprime une faille **réelle** (PIN validé en deux moitiés → ~**11 000** essais, Reaver/Pixie Dust, qui **révèle la passphrase**). Cacher le SSID et le filtrage MAC sont des mesures **faibles** ; repasser en **WEP** serait catastrophique. À la maison, le trio gagnant : **WPA3/WPA2-AES + passphrase forte**, **désactiver WPS**, **séparer l'IoT**.`,
        tags: ["durcissement", "wps", "domestique"],
      },
    ],
  },
];
