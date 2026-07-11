import type { CourseSeed } from "../../../../types";

/** Cyber · Wi-Fi — Module 2 : évolution des protocoles de sécurité (WEP/WPA/WPA2/WPA3). */
export const protocoles: CourseSeed[] = [
  {
    slug: "cyw-protocoles",
    title: "Évolution des protocoles de sécurité Wi-Fi",
    checkpoint: "cyber-wifi",
    codename: "Crypto Timeline",
    domain: "Sans-fil — Chiffrement Wi-Fi",
    theme: "grid",
    icon: "KeyRound",
    accent: "#93B896",
    order: 2,
    difficulty: "medium",
    summary:
      "L'histoire cryptographique du Wi-Fi : WEP (RC4, IV faible, cassable), WPA (TKIP, rustine), WPA2 (AES-CCMP, le standard), WPA3 (SAE/Dragonfly, forward secrecy, PMF). Pourquoi chaque protocole est né et pourquoi les anciens sont morts.",
    objectives: [
      "Expliquer pourquoi le WEP est cryptographiquement brisé (RC4, IV 24 bits, CRC-32)",
      "Comprendre WPA/TKIP comme rustine transitoire sur du matériel WEP",
      "Décrire WPA2 et le chiffrement AES-CCMP (802.11i)",
      "Présenter WPA3 : SAE/Dragonfly, forward secrecy, PMF obligatoire, OWE",
      "Comparer chronologiquement les quatre générations et leurs cas d'usage",
    ],
    resources: [
      {
        label: "Wi-Fi Alliance — WPA3 (spécification et FAQ)",
        url: "https://www.wi-fi.org/discover-wi-fi/security",
        kind: "link",
        note: "La page officielle sur la sécurité Wi-Fi (programmes WPA2/WPA3, PMF, Enhanced Open/OWE).",
      },
      {
        label: "NIST — recommandations sur le chiffrement (AES, modes CCM)",
        url: "https://csrc.nist.gov/publications",
        kind: "link",
        note: "Publications de référence sur AES et le mode CCM utilisé par WPA2 (CCMP).",
      },
    ],
    lesson: `# 🔐 Évolution des protocoles de sécurité Wi-Fi — Crypto Timeline

La sécurité du Wi-Fi est une **course-poursuite** de 20 ans entre les concepteurs et les attaquants. Comprendre **pourquoi chaque protocole est tombé** est la meilleure façon de comprendre comment sécuriser un réseau aujourd'hui. 🏎️

\`\`\`
  1999        2003         2004              2018
   WEP   →    WPA    →     WPA2      →       WPA3
 (cassé)   (rustine)   (standard actuel)  (état de l'art)
  RC4        TKIP        AES-CCMP          SAE / Dragonfly
\`\`\`

---

## 1. Au commencement : le WEP (1999) 💀

Le **WEP** (*Wired Equivalent Privacy*) devait offrir une confidentialité « équivalente au filaire ». Il a **échoué** de façon spectaculaire.

### Comment il fonctionne

- Chiffrement par flux **RC4**.
- Une **clé secrète partagée** (statique) de **40 bits** (WEP 64) ou **104 bits** (WEP 128).
- Un **vecteur d'initialisation (IV)** de **24 bits** concaténé à la clé pour varier le flux à chaque paquet : \`graine RC4 = IV (24 bits) + clé\`.
- Intégrité assurée par un **ICV** (*Integrity Check Value*) calculé avec un simple **CRC-32**.

\`\`\`
 Paquet WEP :  [ IV (24 bits, EN CLAIR) ] [ données ⊕ keystream RC4(IV+clé) + ICV ]
                     ▲ le talon d'Achille
\`\`\`

### Pourquoi il est brisé ☠️

1. **IV trop court (24 bits)** : seulement ~16,7 millions de valeurs. Sur un réseau actif, les IV se **répètent** en quelques heures (paradoxe des anniversaires). Deux paquets avec le **même IV** utilisent le **même keystream** → un XOR révèle la structure des données.
2. **IV en clair** : l'attaquant voit l'IV, il ne lui manque « que » la clé.
3. **Clé statique et partagée** par tous, jamais renouvelée.
4. **CRC-32 n'est pas cryptographique** : c'est un simple code détecteur d'erreurs, **linéaire** → un attaquant peut **modifier un paquet** et recalculer un ICV valide (attaques par **injection / bit-flipping**).
5. **Faiblesse de RC4 (attaque FMS, 2001)** : certains IV « faibles » **fuient** des octets de la clé. Les attaques **FMS**, puis **KoreK**, puis **PTW** (2007) permettent de **récupérer la clé** en capturant assez de paquets (accélérés par l'injection de trafic **ARP replay**).

> ⚠️ Verdict : le WEP se casse aujourd'hui en **quelques minutes**, quelle que soit la longueur de la clé. Il ne faut **jamais** l'utiliser. Sa présence sur un réseau est une vulnérabilité critique.

### Le piège de l'authentification « Shared Key »

WEP propose deux modes d'authentification : **Open System** (pas d'auth réelle, la clé sert juste au chiffrement) et **Shared Key** (défi-réponse avec la clé). Paradoxalement, **Shared Key est PLUS faible** : le défi en clair **et** sa version chiffrée exposent un couple qui révèle un morceau de keystream. On recommandait donc… **Open System**, ce qui résume l'état désespéré du WEP.

---

## 2. La rustine d'urgence : WPA (2003) 🩹

Face au désastre WEP, la Wi-Fi Alliance sort **WPA** (*Wi-Fi Protected Access*) **avant** la finalisation de la norme 802.11i. Objectif : un correctif **déployable par simple mise à jour firmware** sur le matériel WEP existant (donc **toujours à base de RC4**).

WPA introduit **TKIP** (*Temporal Key Integrity Protocol*) :
- **Clé par paquet** (*per-packet key mixing*) : la clé RC4 est **recalculée pour chaque paquet** à partir d'une clé temporelle, de l'adresse MAC et d'un compteur → fini la réutilisation directe du keystream.
- **IV étendu à 48 bits** avec un **compteur de séquence TSC** → protection **anti-rejeu** (un paquet rejoué avec un vieux compteur est refusé).
- **MIC « Michael »** (*Message Integrity Check*) : un vrai contrôle d'intégrité (avec **contre-mesures** : si deux MIC échouent en une minute, l'AP se coupe 60 s) qui remplace le CRC-32 cassable.

> 🧭 WPA était un **pansement transitoire** : meilleur que WEP, mais **toujours bâti sur RC4** et sur Michael (relativement faible). Il reste **vulnérable** (attaques Beck-Tews sur TKIP, attaques par dictionnaire sur WPA-PSK). À proscrire aujourd'hui au profit de WPA2/WPA3.

---

## 3. Le standard : WPA2 / 802.11i (2004) 🛡️

**WPA2** est la mise en œuvre complète de la norme **IEEE 802.11i**. Il abandonne RC4 pour de la **vraie cryptographie moderne** : **CCMP** basé sur **AES**.

### CCMP = AES en mode CCM

- **CCMP** = *Counter Mode with CBC-MAC Protocol*.
- Il utilise **AES-128** dans le mode **CCM**, qui combine :
  - **CTR** (*Counter mode*) pour la **confidentialité** (chiffrement),
  - **CBC-MAC** pour l'**intégrité et l'authenticité** (un MIC robuste).
- Un **numéro de paquet (PN)** sur 48 bits assure la **protection anti-rejeu**.

C'est un chiffrement **authentifié** (*AEAD*) : il garantit à la fois que le message est **secret** et qu'il n'a **pas été modifié** — sans les failles du CRC-32 (WEP) ni de Michael (WPA).

### Personnel (PSK) vs Entreprise (802.1X)

WPA2 existe en deux déclinaisons, selon **comment on établit la clé maîtresse (PMK)** :
- **WPA2-Personnel (WPA2-PSK)** : une **clé pré-partagée** (la « passphrase » du réseau, 8 à 63 caractères) commune à tous. Simple, idéal maison/petite structure. Sa faiblesse : une passphrase faible se casse par **dictionnaire hors-ligne** (module 4).
- **WPA2-Entreprise (WPA2-802.1X)** : chaque utilisateur a des **identifiants individuels** validés par un serveur **RADIUS** ; la PMK est **unique par session** (module 5).

> 🧠 Dans les deux cas, une fois la **PMK** obtenue, le **4-way handshake** (module 3) dérive les clés de session et chiffre les données avec **AES-CCMP**. WPA2 reste **sûr** si la passphrase est forte — sa principale attaque résiduelle historique est **KRACK** (module 3), corrigée par des correctifs.

*(Note : WPA/WPA2 acceptent aussi un chiffrement TKIP pour compatibilité ; il faut le **désactiver** et n'autoriser que **CCMP/AES**.)*

---

## 4. L'état de l'art : WPA3 (2018) 🚀

**WPA3** répond aux faiblesses résiduelles de WPA2 (surtout les attaques par dictionnaire hors-ligne sur PSK et les trames de gestion non protégées).

### SAE / Dragonfly : la fin du dictionnaire hors-ligne

WPA3-Personnel remplace le PSK par **SAE** (*Simultaneous Authentication of Equals*), un échange de clés authentifié par mot de passe basé sur **Diffie-Hellman** (algorithme **Dragonfly**) :
- L'authentification devient un **échange interactif** : l'attaquant ne peut plus capturer un handshake et le **brute-forcer tranquillement chez lui**. Chaque tentative de mot de passe exige une **interaction avec l'AP** → l'attaque par dictionnaire redevient **en ligne** (lente, détectable, limitée).
- **Résistance aux mots de passe faibles** : même une passphrase moyenne devient bien plus difficile à casser.

### Forward Secrecy (PFS) 🔒

WPA3 fournit la **confidentialité persistante** (*Perfect Forward Secrecy*) : chaque session utilise des clés éphémères. **Compromettre le mot de passe plus tard ne permet PAS de déchiffrer le trafic capturé auparavant**. Avec WPA2, au contraire, quiconque connaît la PSK et a enregistré le handshake peut déchiffrer **tout** le trafic passé de cette session.

### PMF obligatoire (802.11w) 🛡️

WPA3 rend les **Protected Management Frames** **obligatoires** : les trames de **gestion** (dont la **déauthentification**) sont désormais **protégées** → cela **neutralise les attaques de deauth** (module 4) qui reposaient sur des trames forgées.

### Autres apports

- **OWE** (*Opportunistic Wireless Encryption*, aussi appelé **Enhanced Open**) : chiffre le trafic même sur les réseaux **ouverts** (hotspots publics, sans mot de passe) via un Diffie-Hellman anonyme. Plus de hotspot « café » en clair.
- **WPA3-Enterprise 192-bit** : suite cryptographique renforcée pour environnements très sensibles.
- **Mode transition** : un AP peut accepter WPA2 **et** WPA3 en même temps le temps de migrer le parc (au prix d'une sécurité réduite au plus faible commun).

> 🧭 WPA3 n'est pas parfait : les attaques **Dragonblood** (2019) ont montré des fuites par canaux auxiliaires et des failles d'implémentation dans les premières versions de SAE, corrigées depuis. La direction reste la bonne : **WPA3 est le choix recommandé** dès que le matériel le supporte.

---

## 5. Comparaison chronologique 📊

| | **WEP** | **WPA** | **WPA2** | **WPA3** |
|---|---|---|---|---|
| Année | 1999 | 2003 | 2004 | 2018 |
| Chiffrement | RC4 | RC4 + TKIP | **AES-CCMP** | AES-CCMP / GCMP |
| Clé maîtresse | statique partagée | PSK | PSK **ou** 802.1X | **SAE** ou 802.1X |
| Intégrité | CRC-32 ❌ | Michael (MIC) | CBC-MAC ✅ | CBC-MAC ✅ |
| Anti-rejeu | ❌ | TSC (48 b) | PN (48 b) | PN |
| Dictionnaire hors-ligne | — | possible | **possible** (PSK) | **bloqué** (SAE) |
| Forward secrecy | ❌ | ❌ | ❌ | ✅ |
| Trames de gestion | non protégées | non protégées | PMF **optionnel** | **PMF obligatoire** |
| Statut | 💀 **brisé** | 🩹 obsolète | 🛡️ **acceptable** (patché) | 🚀 **recommandé** |

> 🧠 Le fil rouge : chaque génération corrige la précédente sur **trois axes** — le **chiffrement** (RC4 → AES), l'**intégrité** (CRC-32 → CBC-MAC) et l'**établissement de clé** (statique → PSK → SAE). La menace du **cassage hors-ligne** de la passphrase (WPA/WPA2-PSK) n'est vraiment traitée qu'avec **WPA3/SAE**.

---

## 🧠 À retenir

- **WEP (1999)** : **RC4 + IV 24 bits (en clair) + CRC-32**. Brisé par la **réutilisation d'IV**, la **linéarité du CRC** (injection) et les **faiblesses RC4** (FMS/PTW). Se casse en **minutes**. Mode « Shared Key » plus faible que « Open ». **Ne jamais utiliser.**
- **WPA (2003)** : rustine firmware sur matériel WEP → **TKIP** (clé **par paquet**, IV 48 bits, anti-rejeu **TSC**, **MIC Michael**). Toujours **RC4**, transitoire, **obsolète**.
- **WPA2 (2004 / 802.11i)** : **AES-CCMP** = AES en mode **CCM** (CTR pour le secret + **CBC-MAC** pour l'intégrité) + **PN** anti-rejeu. Déclinaisons **Personnel (PSK)** et **Entreprise (802.1X)**. Sûr si passphrase forte ; faille historique **KRACK** (patchée).
- **WPA3 (2018)** : **SAE / Dragonfly** remplace le PSK → **bloque le dictionnaire hors-ligne** (attaque redevient en ligne). **Forward Secrecy**. **PMF/802.11w obligatoire** → tue les attaques de **deauth**. **OWE** chiffre même les réseaux ouverts. Failles **Dragonblood** initiales corrigées.
- Toujours **désactiver TKIP** et n'autoriser que **CCMP/AES**. Choix aujourd'hui : **WPA3** si possible, sinon **WPA2-AES** avec passphrase robuste.
- Fil rouge des 4 générations : progrès sur **chiffrement** (RC4→AES), **intégrité** (CRC-32→CBC-MAC) et **établissement de clé** (statique→PSK→SAE).`,
    badge: {
      id: "badge-cyw-crypto-timeline",
      name: "Crypto Timeline",
      icon: "KeyRound",
      description: "Retrace l'évolution WEP → WPA → WPA2 → WPA3 et sait pourquoi chaque protocole est tombé.",
    },
    challenges: [
      {
        id: "cyw-proto-wep-iv",
        title: "Le talon d'Achille du WEP",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 💀 WEP

Quelle est la **cause principale** qui rend le chiffrement **WEP** cassable en quelques minutes, quelle que soit la longueur de la clé ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un champ de seulement 24 bits, transmis en clair, qui finit par se répéter.", cost: 20 },
          { text: "📖 Correction : le vecteur d'initialisation (IV) de 24 bits, trop court et réutilisé.", cost: 50 },
        ],
        options: [
          "L'IV de 24 bits, trop court : il se répète et réutilise le keystream RC4",
          "L'usage d'AES trop lent pour le sans-fil",
          "Une clé de 4096 bits impossible à gérer",
          "L'absence totale de tout chiffrement",
        ],
        answer: 0,
        explanation: `Le **WEP** chiffre avec **RC4** en concaténant à la clé un **IV de seulement 24 bits**, transmis **en clair**. Sur un réseau actif, les IV se **répètent** vite → deux paquets partagent le **même keystream**, ce qui fuit l'information. Combiné à la **linéarité du CRC-32** (injection) et aux **faiblesses RC4** (FMS/PTW), la clé se récupère en minutes. La longueur de clé (40 ou 104 bits) n'y change rien.`,
        tags: ["wep", "iv", "rc4"],
      },
      {
        id: "cyw-proto-ccmp",
        title: "Le chiffrement de WPA2",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ WPA2

Sur quel algorithme de chiffrement repose le protocole **CCMP** utilisé par **WPA2** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Le standard de chiffrement symétrique moderne, en mode CCM (CTR + CBC-MAC).", cost: 20 },
          { text: "📖 Correction : AES (CCMP = AES en mode CCM).", cost: 50 },
        ],
        options: [
          "AES (CCMP = AES en mode CCM : CTR + CBC-MAC)",
          "RC4, comme le WEP",
          "DES en mode ECB",
          "Aucun, WPA2 ne chiffre pas",
        ],
        answer: 0,
        explanation: `**WPA2** abandonne RC4 pour **CCMP** = **AES** en mode **CCM** : **CTR** pour la confidentialité + **CBC-MAC** pour l'intégrité/authenticité, avec un **numéro de paquet (PN)** anti-rejeu. C'est un chiffrement **authentifié** robuste, sans les failles du CRC-32 (WEP) ni de Michael (WPA).`,
        tags: ["wpa2", "ccmp", "aes"],
      },
      {
        id: "cyw-proto-sae",
        title: "L'apport clé de WPA3",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🚀 WPA3

WPA3-Personnel remplace la clé pré-partagée par **SAE** (Dragonfly). Quel **bénéfice majeur** cela apporte-t-il face aux attaques par dictionnaire ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "L'attaquant ne peut plus capturer un handshake et le casser tranquillement hors ligne.", cost: 30 },
          { text: "📖 Correction : SAE bloque l'attaque par dictionnaire hors-ligne (elle redevient en ligne).", cost: 80 },
        ],
        options: [
          "L'attaque par dictionnaire hors-ligne devient impossible : chaque essai exige une interaction en ligne",
          "Il supprime tout besoin de mot de passe",
          "Il ré-autorise l'usage de RC4",
          "Il rend le réseau invisible aux scanners",
        ],
        answer: 0,
        explanation: `**SAE** (*Simultaneous Authentication of Equals*, Dragonfly) transforme l'authentification en un **échange interactif** de type Diffie-Hellman. L'attaquant **ne peut plus** capturer un handshake et le **brute-forcer hors ligne** : chaque tentative de mot de passe exige une **interaction avec l'AP** (attaque **en ligne**, lente et détectable). WPA3 ajoute aussi la **forward secrecy** et rend **PMF obligatoire**.`,
        tags: ["wpa3", "sae", "dragonfly"],
      },
      {
        id: "cyw-proto-pmf",
        title: "PMF et deauth",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🛡️ Protected Management Frames

WPA3 rend les **PMF (802.11w)** obligatoires. Quelle catégorie d'attaque cela **neutralise-t-il** principalement ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Les trames de gestion forgées qui éjectent les clients du réseau.", cost: 30 },
          { text: "📖 Correction : les attaques de déauthentification/dissociation.", cost: 80 },
        ],
        options: [
          "Les attaques de déauthentification / dissociation (trames de gestion forgées)",
          "Les attaques par force brute sur AES",
          "Les pannes d'alimentation de l'AP",
          "Les interférences radio du four à micro-ondes",
        ],
        answer: 0,
        explanation: `Les **PMF** (*Protected Management Frames*, 802.11w) **protègent les trames de gestion**, historiquement en clair et non authentifiées. Cela **neutralise** les attaques de **déauthentification/dissociation**, où l'attaquant forge des trames pour **éjecter** les clients (afin de capturer un handshake ou de créer un DoS — module 4). WPA3 les rend **obligatoires**.`,
        tags: ["pmf", "802.11w", "deauth"],
      },
      {
        id: "cyw-proto-timeline",
        title: "La chronologie des protocoles",
        order: 5,
        difficulty: "medium",
        type: "order",
        prompt: `## 📊 Timeline

Remets les protocoles de sécurité Wi-Fi dans l'**ordre historique** d'apparition :`,
        points: 200,
        timeLimitSec: 300,
        options: [
          "WEP (RC4, IV 24 bits)",
          "WPA (TKIP, rustine sur RC4)",
          "WPA2 (AES-CCMP, 802.11i)",
          "WPA3 (SAE / Dragonfly)",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "Du plus cassé au plus récent : WEP → WPA → WPA2 → WPA3.", cost: 20 },
          { text: "📖 Correction : WEP → WPA → WPA2 → WPA3.", cost: 50 },
        ],
        explanation: `Ordre : **WEP** (1999, brisé) → **WPA** (2003, rustine TKIP) → **WPA2** (2004, AES-CCMP, le standard) → **WPA3** (2018, SAE, forward secrecy, PMF). Chaque étape corrige le **chiffrement**, l'**intégrité** et l'**établissement de clé** de la précédente.`,
        tags: ["chronologie", "wep", "wpa3"],
      },
      {
        id: "cyw-proto-tkip",
        title: "Le rôle de WPA/TKIP",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## 🩹 WPA transitoire

WPA a introduit un protocole conçu comme **rustine** sur le matériel WEP existant (toujours basé RC4), avec une **clé recalculée à chaque paquet**. Quel est le **nom** (sigle) de ce protocole ?`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "Temporal Key Integrity Protocol.", cost: 15 },
          { text: "📖 Correction : TKIP.", cost: 40 },
        ],
        answer: "TKIP",
        accept: ["tkip", "temporal key integrity protocol"],
        caseSensitive: false,
        explanation: `**TKIP** (*Temporal Key Integrity Protocol*) est la rustine de **WPA** : clé RC4 **par paquet**, IV étendu à **48 bits** avec compteur anti-rejeu **TSC**, et **MIC Michael** en remplacement du CRC-32. Déployable par **mise à jour firmware** sur le matériel WEP, mais toujours à base de **RC4** → aujourd'hui **obsolète**, à désactiver au profit de **CCMP/AES**.`,
        tags: ["wpa", "tkip", "rc4"],
      },
    ],
  },
];
