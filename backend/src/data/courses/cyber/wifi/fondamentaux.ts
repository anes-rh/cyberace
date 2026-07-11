import type { CourseSeed } from "../../../../types";

/** Cyber · Wi-Fi — Module 1 : fondamentaux des réseaux sans fil (radio, 802.11, WLAN). */
export const fondamentaux: CourseSeed[] = [
  {
    slug: "cyw-fondamentaux",
    title: "Fondamentaux des réseaux sans fil",
    checkpoint: "cyber-wifi",
    codename: "Air Waves",
    domain: "Sans-fil — Radio & 802.11",
    theme: "grid",
    icon: "Wifi",
    accent: "#93B896",
    order: 1,
    difficulty: "easy",
    summary:
      "Le socle radio : spectre et bandes de fréquences (2.4 / 5 / 6 GHz), canaux et chevauchement, normes IEEE 802.11 (a/b/g/n/ac/ax), architecture WLAN (BSS/ESS, SSID/BSSID, mode infrastructure vs ad-hoc) et l'accès au média CSMA/CA.",
    objectives: [
      "Situer le Wi-Fi dans le spectre radio et distinguer les bandes 2.4 / 5 / 6 GHz",
      "Comprendre les canaux, leur largeur et le problème de chevauchement (1-6-11)",
      "Retracer l'évolution des normes 802.11 a/b/g/n/ac/ax et leurs débits",
      "Maîtriser le vocabulaire d'architecture WLAN : station, AP, BSS, ESS, SSID, BSSID",
      "Distinguer mode infrastructure et ad-hoc, et comprendre l'accès au média CSMA/CA",
    ],
    resources: [
      {
        label: "IEEE 802.11 — page de travail du groupe (norme officielle)",
        url: "https://www.ieee802.org/11/",
        kind: "link",
        note: "Le groupe de travail qui publie et fait évoluer la norme Wi-Fi (802.11 a/b/g/n/ac/ax…).",
      },
      {
        label: "Wi-Fi Alliance — générations Wi-Fi (Wi-Fi 4/5/6/6E)",
        url: "https://www.wi-fi.org/",
        kind: "link",
        note: "L'organisme de certification qui a introduit la nomenclature Wi-Fi 4/5/6 et le programme WPA.",
      },
    ],
    lesson: `# 📡 Fondamentaux des réseaux sans fil — Air Waves

Avant de parler de **sécurité** Wi-Fi, il faut comprendre **comment le sans-fil fonctionne physiquement**. Contrairement à un câble, l'air est un **média partagé et ouvert** : n'importe qui à portée peut **écouter** les ondes. C'est ce qui rend la sécurité du Wi-Fi si particulière. 🏎️

---

## 1. Le sans-fil, c'est de la radio 📶

Un réseau **Wi-Fi** (marque commerciale de la Wi-Fi Alliance) repose sur la famille de normes **IEEE 802.11**. Les données ne circulent plus dans un câble mais sont **modulées sur des ondes radio** émises et reçues par des **antennes**.

Trois différences fondamentales avec le filaire :
- **Média partagé et diffusé** : toutes les stations à portée reçoivent le signal. On ne peut pas « débrancher » un intrus — il suffit qu'il soit **physiquement à portée**.
- **Pas de frontière physique** : le signal traverse les murs et **déborde** hors du bâtiment (parking, rue, étage voisin). La « surface d'attaque » n'est pas maîtrisable à 100 %.
- **Support non fiable** : interférences, atténuation, obstacles → pertes et collisions. Le protocole doit gérer les retransmissions.

> 🧭 Conséquence sécurité : puisqu'on **ne peut pas empêcher l'écoute** (l'onde est publique), la seule vraie protection est le **chiffrement** du contenu. Tout le cours de sécurité Wi-Fi découle de ce constat.

---

## 2. Le spectre et les bandes de fréquences 🌈

Le Wi-Fi utilise des bandes **sans licence** (ISM / U-NII), libres d'usage mais **partagées** avec d'autres appareils.

\`\`\`
 Fréquence →  2.4 GHz              5 GHz                    6 GHz
              ┌───────────┐    ┌──────────────────┐   ┌──────────────┐
              │ ISM 2,4   │    │ U-NII 5 GHz      │   │ U-NII 6 GHz  │
              │ ~2400-2483│    │ ~5150-5875 MHz   │   │ ~5925-7125   │
              └───────────┘    └──────────────────┘   └──────────────┘
   Portée :      longue            moyenne                courte
   Débit  :      faible            élevé                  très élevé
   Encombr.:     saturée           modérée                quasi vierge
\`\`\`

- **Bande 2.4 GHz** : longue **portée**, traverse bien les murs, mais **très encombrée** (Bluetooth, micro-ondes, télécommandes, appareils IoT) et **peu de canaux**. Débit plus faible.
- **Bande 5 GHz** : beaucoup **plus de canaux**, débit plus élevé, moins d'interférences — mais **portée plus courte** et pénétration des murs moindre.
- **Bande 6 GHz** (Wi-Fi **6E** / Wi-Fi 7) : très large, quasi **vierge**, réservée aux équipements récents. Débit maximal, latence faible, mais portée courte.

> ⚖️ Compromis universel : **plus la fréquence est haute, plus le débit est élevé mais la portée courte** (et l'atténuation par les obstacles forte). 2.4 GHz = « loin mais lent », 6 GHz = « rapide mais proche ».

---

## 3. Les canaux et le chevauchement 📻

Chaque bande est découpée en **canaux** (sous-plages de fréquences). Deux réseaux sur le **même canal** se **partagent** le temps de parole ; deux réseaux sur des canaux **qui se chevauchent** s'**interfèrent**.

### 2.4 GHz : le piège du chevauchement

La bande 2.4 GHz compte **14 canaux** (11 utilisables en Amérique du Nord, 13 en Europe) espacés de **5 MHz**, alors qu'un canal Wi-Fi occupe **~20 MHz**. Résultat : les canaux **se chevauchent** presque tous.

\`\`\`
2.4 GHz — seuls 1, 6 et 11 ne se chevauchent pas :

 Ch:  1    2    3    4    5    6    7    8    9   10   11
      █████            █████            █████
      └─┬─┘            └─┬─┘            └─┬─┘
     canal 1         canal 6         canal 11   ← non-recouvrants
\`\`\`

Les seuls canaux **non-recouvrants** sont **1, 6 et 11**. En entreprise, on planifie les AP voisins sur ces trois canaux pour éviter les interférences (réutilisation de fréquence en « nid d'abeille »).

### 5 GHz : plus d'espace

La bande 5 GHz offre **beaucoup plus de canaux non-recouvrants** (jusqu'à ~25 selon la réglementation), ce qui réduit les collisions. Certains canaux sont soumis au **DFS** (*Dynamic Frequency Selection*) : l'AP doit **libérer le canal** s'il détecte un **radar** (aviation, météo) prioritaire.

### Largeur de canal

On peut **agréger** des canaux pour augmenter le débit : **20 / 40 / 80 / 160 MHz**. Plus le canal est large, plus le débit est élevé… mais plus il **occupe le spectre** et risque d'interférer. En 2.4 GHz (bande étroite), élargir à 40 MHz est souvent contre-productif.

---

## 4. Débit, portée, interférences 🚦

Le débit réel dépend de nombreux facteurs :
- **Modulation** (*QAM*) : plus elle est dense (16-QAM, 64, 256, 1024-QAM), plus on transmet de bits par symbole — mais il faut un **bon signal** (proche de l'AP).
- **MIMO** (*Multiple Input Multiple Output*) : plusieurs antennes émettent/reçoivent **plusieurs flux** en parallèle (*spatial streams*) → débit multiplié.
- **Distance et obstacles** : le signal **s'atténue** avec la distance et les murs (béton, métal, eau). Plus on s'éloigne, plus l'AP **baisse la modulation** → débit qui chute.
- **Interférences** : autres réseaux, four à micro-ondes (2.4 GHz), Bluetooth, appareils électriques.
- **SNR** (*Signal-to-Noise Ratio*) et **RSSI** (puissance reçue, en dBm, négatif : -50 dBm = excellent, -80 dBm = faible).

> 🧠 Le débit **annoncé** (ex. « 1200 Mb/s ») est un **maximum théorique** (idéal, sans perte, à côté de l'AP). Le débit **utile** réel est toujours nettement inférieur, et **partagé** entre toutes les stations du même canal.

---

## 5. Les normes IEEE 802.11 (a/b/g/n/ac/ax) 📜

La norme 802.11 a évolué par **amendements**, chacun augmentant le débit et l'efficacité :

| Norme | Nom Wi-Fi | Année | Bande | Débit max (théorique) | Apport clé |
|---|---|---|---|---|---|
| **802.11** | — | 1997 | 2.4 GHz | 2 Mb/s | La toute première |
| **802.11b** | — | 1999 | 2.4 GHz | 11 Mb/s | Adoption de masse |
| **802.11a** | — | 1999 | 5 GHz | 54 Mb/s | Passage au 5 GHz (OFDM) |
| **802.11g** | — | 2003 | 2.4 GHz | 54 Mb/s | 54 Mb/s en 2.4 GHz |
| **802.11n** | **Wi-Fi 4** | 2009 | 2.4 + 5 GHz | 600 Mb/s | **MIMO**, canaux 40 MHz |
| **802.11ac** | **Wi-Fi 5** | 2014 | 5 GHz | ~3,5 Gb/s | **MU-MIMO**, 80/160 MHz, 256-QAM |
| **802.11ax** | **Wi-Fi 6 / 6E** | 2019-21 | 2.4 + 5 (+ 6) GHz | ~9,6 Gb/s | **OFDMA**, 1024-QAM, efficacité en densité |

Notions clés introduites au fil des versions :
- **OFDM** (*Orthogonal Frequency-Division Multiplexing*, dès 802.11a) : découpe le canal en sous-porteuses parallèles → robuste aux interférences.
- **MU-MIMO** (*Multi-User MIMO*, Wi-Fi 5/6) : l'AP parle à **plusieurs clients simultanément** au lieu d'un seul à la fois.
- **OFDMA** (Wi-Fi 6) : partage un canal entre plusieurs clients par **sous-canaux** (*Resource Units*) → excellente efficacité quand **beaucoup d'appareils** sont connectés (gares, bureaux, IoT).
- **Wi-Fi 6E** : extension de Wi-Fi 6 à la **bande 6 GHz**. **Wi-Fi 7** (802.11be) pousse encore plus loin (320 MHz, MLO multi-liens).

> 🧭 Pour la sécurité, ce qui compte surtout : les normes récentes rendent **PMF/802.11w** et **WPA3** obligatoires ou fortement recommandés (voir modules suivants). Le sans-fil « moderne » est de plus en plus **sécurisé par défaut**.

---

## 6. Architecture d'un WLAN 🏗️

Le vocabulaire de l'architecture 802.11 est **essentiel** pour comprendre les attaques.

### Les composants

- **Station (STA)** : tout terminal Wi-Fi (PC, smartphone, objet connecté) équipé d'une carte sans fil.
- **Point d'accès (AP, *Access Point*)** : l'équipement qui relie les stations sans fil au **réseau filaire** (le *Distribution System*, DS). C'est le « pivot ».
- **BSS** (*Basic Service Set*) : une cellule = **un AP + ses stations**. Identifiée par le **BSSID** (généralement l'**adresse MAC** de l'AP).
- **ESS** (*Extended Service Set*) : **plusieurs BSS** (plusieurs AP) reliés par le même DS et partageant le **même SSID** → l'utilisateur se déplace et **roame** (itinérance) d'un AP à l'autre de façon transparente.
- **SSID** (*Service Set Identifier*) : le **nom du réseau** (ex. « CyberAce-WiFi »), diffusé dans les *beacons*. Plusieurs AP peuvent partager le même SSID (= même réseau logique) tout en ayant des **BSSID** différents.

\`\`\`
        ESS  «  CyberAce-WiFi  »  (même SSID)
   ┌───────────────────────────────────────────┐
   │   BSS 1 (BSSID = MAC AP1)   BSS 2 (AP2)     │
   │      (( AP1 ))                 (( AP2 ))     │
   │      /   |   \\                  /    \\        │
   │   STA  STA  STA              STA    STA      │
   └────────┬──────────────────────┬────────────┘
            └──── Distribution System (LAN filaire) ───┘
\`\`\`

### Mode infrastructure vs ad-hoc

- **Mode infrastructure** : les stations passent **toutes par un AP** (le cas normal : box, entreprise). C'est le mode où s'appliquent WPA2/WPA3.
- **Mode ad-hoc** (IBSS, *Independent BSS*) : les stations communiquent **directement entre elles**, **sans AP** (pair-à-pair). Rare aujourd'hui, remplacé par le **Wi-Fi Direct**.

### Beacons, probes, association

- L'AP émet périodiquement des **beacons** (balises) annonçant le SSID, les débits, la sécurité (WPA2/WPA3…).
- Une station cherche un réseau via des **probe requests** ; l'AP répond par un **probe response**.
- Se connecter = **authentification** (au sens 802.11, souvent « open system ») puis **association** à l'AP, **avant** l'échange de clés de sécurité (le *4-way handshake*, module 3).

> ⚠️ Point sécurité crucial : les trames de **gestion** (beacon, probe, **deauthentication**, association) sont **historiquement non chiffrées et non authentifiées**. C'est ce qui rend possible les attaques d'**evil twin** et de **déauthentification** (module 4). La parade est **PMF / 802.11w** (*Protected Management Frames*), rendue obligatoire par WPA3.

### « SSID caché » : une fausse sécurité

On peut configurer un AP pour **ne pas diffuser** son SSID dans les beacons. Ce n'est **pas une protection** : le SSID circule en clair dès qu'une station se connecte (dans les *probe/association*), et se retrouve trivialement par écoute passive. Cela **gêne** un curieux, mais **n'arrête** aucun attaquant.

---

## 7. L'accès au média : CSMA/CA ⏱️

En filaire (Ethernet), on utilise **CSMA/CD** (*Collision Detection*) : on **détecte** les collisions. En sans-fil, une station **ne peut pas** émettre et écouter en même temps sur la même fréquence → elle ne **détecte pas** les collisions. Le Wi-Fi utilise donc **CSMA/CA** (*Collision Avoidance*) :

1. **Écouter** le canal (*carrier sense*) : est-il libre ?
2. S'il est occupé, **attendre** un temps aléatoire (*backoff*) avant de réessayer.
3. Émettre, puis **attendre un ACK** de l'AP. Pas d'ACK = collision présumée → on retransmet.

Le **problème du nœud caché** (*hidden node*) : deux stations qui **s'entendent avec l'AP mais pas entre elles** peuvent émettre en même temps et se **percuter** à l'AP. Solution optionnelle : **RTS/CTS** (*Request To Send / Clear To Send*) — la station demande la parole, l'AP l'accorde, ce qui réserve le canal.

> 🧠 Conséquence : le média étant **partagé** et régulé par « politesse » (attente), il est facile à **saturer** (voir les attaques DoS / brouillage du module 4). Une seule station bruyante — ou malveillante — dégrade tout le monde.

---

## 🧠 À retenir

- Le Wi-Fi est de la **radio** : média **partagé, diffusé, sans frontière physique**. On ne peut pas empêcher l'écoute → la seule vraie protection est le **chiffrement**.
- **Trois bandes** : **2.4 GHz** (longue portée, saturée, peu de canaux), **5 GHz** (plus de canaux, plus rapide, portée courte), **6 GHz** (Wi-Fi 6E, très large, quasi vierge). Règle : **haute fréquence = débit ↑ / portée ↓**.
- **2.4 GHz** : seuls les canaux **1, 6, 11** ne se **chevauchent pas**. Largeurs de canal 20/40/80/160 MHz. **DFS** en 5 GHz (priorité aux radars).
- Normes : **802.11 a/b/g** → **n (Wi-Fi 4, MIMO)** → **ac (Wi-Fi 5, MU-MIMO)** → **ax (Wi-Fi 6/6E, OFDMA)**. Débit annoncé = **théorique max**, partagé.
- Architecture : **STA** (station), **AP** (point d'accès), **BSS** (une cellule, id = **BSSID = MAC AP**), **ESS** (plusieurs AP, même **SSID**), **DS** (réseau filaire).
- **Infrastructure** (via AP) vs **ad-hoc** (pair-à-pair). **Beacons/probes** annoncent et découvrent les réseaux.
- Les trames de **gestion** (beacon, probe, **deauth**) sont **non chiffrées** par défaut → base des attaques evil twin / deauth. Parade : **PMF / 802.11w**.
- Le **SSID caché** n'est **pas** une sécurité (le nom fuit à la connexion).
- Accès au média : **CSMA/CA** (éviter les collisions, car on ne peut pas les détecter en radio). Problème du **nœud caché** → **RTS/CTS**. Média **facile à saturer**.`,
    badge: {
      id: "badge-cyw-air-waves",
      name: "Air Waves",
      icon: "Wifi",
      description: "Maîtrise le spectre radio, les canaux, les normes 802.11 et l'architecture d'un WLAN.",
    },
    challenges: [
      {
        id: "cyw-fond-canaux",
        title: "Les canaux non-recouvrants",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 📻 Bande 2.4 GHz

En **2.4 GHz**, on conseille de placer les AP voisins sur des **canaux qui ne se chevauchent pas**. Quels sont ces trois canaux non-recouvrants (en Amérique du Nord) ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Espacés d'environ 5 canaux chacun, en partant de 1.", cost: 10 },
          { text: "📖 Correction : 1, 6 et 11.", cost: 30 },
        ],
        options: [
          "1, 6 et 11",
          "1, 2 et 3",
          "2, 7 et 12",
          "Tous les canaux se valent",
        ],
        answer: 0,
        explanation: `En 2.4 GHz, les canaux sont espacés de **5 MHz** mais chacun occupe **~20 MHz** : ils se **chevauchent** presque tous. Les seuls trio **non-recouvrants** sont **1, 6 et 11**. On y répartit les AP voisins pour éviter les interférences (réutilisation de fréquence).`,
        tags: ["canaux", "2.4ghz", "interferences"],
      },
      {
        id: "cyw-fond-bandes",
        title: "Portée vs débit",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🌈 Bandes de fréquences

Par rapport à la bande **5 GHz**, la bande **2.4 GHz** offre en général… ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Fréquence plus basse = onde qui porte plus loin mais transporte moins.", cost: 10 },
          { text: "📖 Correction : une portée plus longue mais un débit plus faible.", cost: 30 },
        ],
        options: [
          "Une portée plus longue mais un débit plus faible",
          "Une portée plus courte et un débit plus élevé",
          "Exactement les mêmes caractéristiques",
          "Aucune interférence possible",
        ],
        answer: 0,
        explanation: `Règle générale : **plus la fréquence est basse, plus l'onde porte loin** et traverse les murs, **mais transporte moins de débit**. Le **2.4 GHz** va donc **plus loin** mais est **plus lent** (et plus **saturé**) que le **5 GHz**. Le **6 GHz** (Wi-Fi 6E) pousse encore le débit au prix de la portée.`,
        tags: ["bandes", "portee", "debit"],
      },
      {
        id: "cyw-fond-bssid",
        title: "SSID vs BSSID",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🏗️ Architecture WLAN

Dans un réseau d'entreprise avec **plusieurs points d'accès** partageant le **même nom de réseau**, qu'est-ce qui **différencie** techniquement chaque AP au niveau radio ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Le nom (SSID) est commun ; l'identifiant de cellule est l'adresse MAC de l'AP.", cost: 15 },
          { text: "📖 Correction : le BSSID (adresse MAC de l'AP) diffère, le SSID est commun.", cost: 40 },
        ],
        options: [
          "Le BSSID (adresse MAC de l'AP) — le SSID, lui, est commun",
          "Le SSID est différent pour chaque AP",
          "La bande de fréquence est forcément différente",
          "Rien, ils sont strictement identiques",
        ],
        answer: 0,
        explanation: `Plusieurs AP d'un même **ESS** partagent le **même SSID** (le nom logique du réseau, pour permettre l'itinérance), mais chacun a un **BSSID distinct** = son **adresse MAC**. Le SSID identifie le **réseau**, le BSSID identifie la **cellule/AP** précise (BSS). C'est ce qui permet au client de choisir le meilleur AP.`,
        tags: ["ssid", "bssid", "ess"],
      },
      {
        id: "cyw-fond-ssid-cache",
        title: "Le SSID caché",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🕶️ Fausse sécurité

Un administrateur configure son AP pour **ne pas diffuser le SSID** dans les beacons, pensant « rendre le réseau invisible ». Que faut-il en penser du point de vue sécurité ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Le nom du réseau circule quand même… au moment où un client se connecte.", cost: 15 },
          { text: "📖 Correction : ce n'est pas une vraie sécurité, le SSID fuit à la connexion.", cost: 40 },
        ],
        options: [
          "Ce n'est pas une vraie protection : le SSID circule en clair dès qu'un client se connecte",
          "C'est aussi robuste que le chiffrement WPA2",
          "Cela chiffre automatiquement tout le trafic",
          "Cela empêche définitivement toute écoute du réseau",
        ],
        answer: 0,
        explanation: `Cacher le SSID **n'est pas une sécurité** : le nom du réseau apparaît en clair dans les trames de **probe/association** dès qu'une station se connecte, et se capture par simple **écoute passive**. Cela gêne un curieux, mais **n'arrête aucun attaquant**. La vraie protection reste le **chiffrement** (WPA2/WPA3).`,
        tags: ["ssid-cache", "fausse-securite", "beacon"],
      },
      {
        id: "cyw-fond-csmaca",
        title: "Accès au média sans fil",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## ⏱️ Média partagé

En filaire on utilise **CSMA/CD** (détection de collision). En Wi-Fi, une station ne peut pas détecter les collisions pendant qu'elle émet. Quel **mécanisme d'accès au média** le Wi-Fi utilise-t-il à la place ?

*(Réponds par le sigle exact.)*`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "CSMA/C… mais le C signifie « Avoidance » (évitement).", cost: 15 },
          { text: "📖 Correction : CSMA/CA (Collision Avoidance).", cost: 40 },
        ],
        answer: "CSMA/CA",
        accept: ["csma/ca", "csma ca", "csmaca", "collision avoidance", "csma-ca"],
        caseSensitive: false,
        explanation: `Le Wi-Fi utilise **CSMA/CA** (*Collision Avoidance*) : comme on ne peut pas **détecter** les collisions en radio, on cherche à les **éviter** — écouter le canal, attendre un délai aléatoire (*backoff*) s'il est occupé, puis émettre et attendre un **ACK**. Le **nœud caché** reste un cas problématique, atténué par **RTS/CTS**.`,
        tags: ["csma-ca", "media-partage", "collision"],
      },
      {
        id: "cyw-fond-normes",
        title: "Les générations Wi-Fi",
        order: 6,
        difficulty: "medium",
        type: "order",
        prompt: `## 📜 Évolution des normes

Remets ces normes IEEE 802.11 dans l'**ordre chronologique** (de la plus ancienne à la plus récente) :`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "802.11b (11 Mb/s, 2.4 GHz)",
          "802.11g (54 Mb/s, 2.4 GHz)",
          "802.11n / Wi-Fi 4 (MIMO)",
          "802.11ac / Wi-Fi 5 (MU-MIMO)",
          "802.11ax / Wi-Fi 6 (OFDMA)",
        ],
        answer: [0, 1, 2, 3, 4],
        hints: [
          { text: "b(1999) → g(2003) → n(2009) → ac(2014) → ax(2019).", cost: 20 },
          { text: "📖 Correction : b → g → n → ac → ax.", cost: 50 },
        ],
        explanation: `Ordre chronologique : **802.11b** (1999) → **g** (2003) → **n / Wi-Fi 4** (2009, MIMO) → **ac / Wi-Fi 5** (2014, MU-MIMO) → **ax / Wi-Fi 6/6E** (2019-21, OFDMA). Chaque génération augmente le débit **et** l'efficacité en environnement dense. (Le 802.11a, en 5 GHz, est contemporain du b.)`,
        tags: ["normes", "802.11", "chronologie"],
      },
    ],
  },
];
