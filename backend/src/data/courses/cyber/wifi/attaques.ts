import type { CourseSeed } from "../../../../types";

/** Cyber · Wi-Fi — Module 4 : panorama des attaques sur les réseaux Wi-Fi. */
export const attaques: CourseSeed[] = [
  {
    slug: "cyw-attaques",
    title: "Attaques sur les réseaux Wi-Fi",
    checkpoint: "cyber-wifi",
    codename: "Airborne Threats",
    domain: "Sans-fil — Attaques",
    theme: "grid",
    icon: "ShieldAlert",
    accent: "#93B896",
    order: 4,
    difficulty: "hard",
    summary:
      "Le panorama des menaces sans fil : capture du handshake et cassage hors-ligne de la PSK (dictionnaire, PMKID), déauthentification, evil twin, rogue AP et répéteurs non autorisés, WPS PIN, DoS/brouillage Wi-Fi et cryptanalyse WPA2. (Théorie uniquement, sans manipulation d'outil.)",
    objectives: [
      "Expliquer la capture du 4-way handshake et le cassage hors-ligne de la PSK",
      "Distinguer déauthentification, evil twin et rogue AP (et répéteurs non autorisés)",
      "Comprendre l'attaque PMKID (clientless) et le WPS PIN brute-force",
      "Décrire les attaques DoS/saturation et le brouillage RF sur le Wi-Fi",
      "Relier chaque attaque aux protections vues (PMF, WPA3, passphrase forte)",
    ],
    resources: [
      {
        label: "MITRE ATT&CK — techniques réseau/wireless",
        url: "https://attack.mitre.org/",
        kind: "link",
        note: "Base de connaissance des techniques adverses (reconnaissance, accès, C2) utile pour cadrer les attaques Wi-Fi.",
      },
      {
        label: "OWASP — Wireless Security testing (guide)",
        url: "https://owasp.org/",
        kind: "link",
        note: "Ressources ouvertes sur les tests et menaces des réseaux sans fil.",
      },
    ],
    lesson: `# 🎯 Attaques sur les réseaux Wi-Fi — Airborne Threats

Le sans-fil offre une **surface d'attaque unique** : pas besoin de brancher un câble, il suffit d'être **à portée radio**. Ce module recense les attaques **par famille**, du cassage de mot de passe au déni de service. *(Ici, on explique les mécanismes ; la mise en pratique — Aircrack-ng, Wireshark… — sera traitée séparément.)* 🏎️

---

## 1. Capturer le handshake et casser la PSK hors-ligne 🔓

C'est l'attaque **emblématique** contre WPA2-Personnel.

### Le principe

1. L'attaquant **écoute passivement** le réseau et attend qu'une station se connecte pour **capturer le 4-way handshake** (module 3). Le handshake contient les **nonces** et un **MIC** calculé avec une clé dérivée de la **PMK**.
2. Il tente ensuite, **hors ligne** (sur sa propre machine, sans toucher au réseau), des **millions de passphrases candidates** : pour chacune, il recalcule \`PMK = PBKDF2(candidat, SSID, …)\`, dérive la PTK, recalcule le **MIC** et le **compare** à celui capturé. **Un MIC qui correspond = passphrase trouvée.**

\`\`\`
   handshake capturé  ─┐
                       ▼
   pour chaque mot du dictionnaire :
       PMK = PBKDF2(mot, SSID)  →  PTK  →  MIC calculé
       si MIC calculé == MIC capturé  →  ✅ passphrase = mot
\`\`\`

### Pourquoi « hors ligne » est dangereux

L'attaque ne nécessite **plus le réseau** après la capture : l'attaquant peut essayer **autant de mots de passe qu'il veut**, aussi vite que son matériel (GPU) le permet, **sans limite de tentatives** ni détection. C'est là que **WPA3/SAE** change tout : il **rend l'attaque en ligne** (chaque essai exige l'AP), donc lente et détectable.

### Deux variantes

- **Attaque par dictionnaire** : on teste une **liste** de mots de passe probables (mots courants, fuites connues, variantes). Très efficace contre les passphrases **faibles**.
- **Attaque par force brute** : on teste **toutes** les combinaisons possibles. Rapidement **impraticable** dès que la passphrase est longue et aléatoire.

### Accélération : rainbow tables et PMKID

- **Rainbow tables par SSID** : comme le **SSID est le sel**, on **pré-calcule** les PMK pour des SSID **très répandus** (« linksys », « default », « FreeWifi »…) → cassage quasi instantané si le SSID est commun. Un SSID **unique** casse cette optimisation.
- **Attaque PMKID (clientless, 2018)** : sur certains AP, le champ **PMKID** (présent dans le message 1 ou dans les trames d'association pour le *roaming* rapide) est dérivé de la **PMK**. L'attaquant peut le **demander directement à l'AP** — **sans attendre qu'un client se connecte** ni forcer de deauth — puis le brute-forcer hors ligne comme un handshake. Cela supprime l'étape « attendre/déauthentifier un client ».

> 🧠 Défense n°1 : une **passphrase longue et aléatoire** (≥ 12-16 caractères, non devinable) rend le cassage **hors ligne** impraticable. Défense n°2 : **WPA3-SAE**. Défense n°3 : un **SSID non générique** (contre les rainbow tables).

---

## 2. L'attaque de déauthentification 📴

Les trames de **gestion** 802.11 (dont **deauthentication** et **disassociation**) sont, **avant PMF/802.11w**, **non chiffrées et non authentifiées**. N'importe qui peut donc **forger** une trame « deauth » en usurpant l'adresse MAC de l'AP et **éjecter** une ou toutes les stations.

Usages :
- **Forcer une reconnexion** → provoquer un **nouveau handshake** à capturer (étape 1 ci-dessus).
- **Déni de service** : envoyer des deauth en **boucle** empêche toute connexion (voir §7).
- **Pousser une victime vers un evil twin** (§4) en la déconnectant de l'AP légitime.

> ⚠️ Parade directe : **PMF / 802.11w** (obligatoire en **WPA3**) **authentifie** les trames de gestion → les deauth forgées sont **rejetées**.

---

## 3. Rogue AP et répéteurs non autorisés 🚪

Un **rogue AP** (*point d'accès non autorisé*) est un AP **branché sur le réseau interne sans autorisation**. Deux cas typiques :
- Un **employé** installe une petite box/borne Wi-Fi « pour sa commodité », en la **raccordant au LAN de l'entreprise** → il crée une **porte dérobée** contournant le pare-feu périmétrique.
- Un **répéteur / extendeur Wi-Fi non homologué** ajouté au réseau : il **étend la couverture** hors du bâtiment et peut **affaiblir la sécurité** (mauvaise config, WPS activé, mot de passe faible), créant un **point d'entrée** non maîtrisé.

Risques : contournement des contrôles réseau, **extension incontrôlée** de la portée (l'attaquant capte depuis le parking), surface d'attaque élargie, non-conformité.

> 🧭 Rogue AP ≠ evil twin. Le **rogue AP** est un **AP interne non autorisé** (branché sur **votre** réseau). L'**evil twin** (§4) est un **AP externe** qui **imite** votre réseau pour piéger les clients. Détection : **WIDS/WIPS** (module 6) qui repère les BSSID/SSID inconnus.

---

## 4. L'evil twin (jumeau maléfique) 👿

L'attaquant crée un **faux point d'accès** qui **usurpe le SSID** d'un réseau légitime (ex. « CyberAce-WiFi »), souvent avec un **signal plus fort** (plus proche, plus puissant) pour que les clients **s'y connectent de préférence** — parfois aidé par une **deauth** qui les décroche du vrai AP.

Une fois la victime connectée à l'evil twin :
- L'attaquant est en **homme du milieu (MITM)** : il voit/modifie le trafic non chiffré de bout en bout.
- Il peut présenter un **portail captif piégé** (fausse page « connectez-vous / entrez la clé Wi-Fi ») pour **voler des identifiants** ou la passphrase.
- Variante **Karma/MANA** : le faux AP **répond à toutes** les *probe requests* (« je suis le réseau que tu cherches »), piégeant les appareils qui **cherchent d'anciens réseaux** connus.

\`\`\`
   Victime  ──(croit se connecter à «CyberAce»)──►  ((Evil Twin))  ──► Internet
                                                         │
                                                    l'attaquant lit / modifie
\`\`\`

> 🧠 Défenses : **802.1X avec validation du certificat serveur** (l'evil twin ne possède pas le certificat légitime → l'entreprise ne s'y connecte pas — module 5), **HTTPS/HSTS**, VPN, méfiance envers les portails demandant la clé Wi-Fi, **WPA3** (chiffrement même en « open » via OWE).

---

## 5. WPS PIN brute-force 🔢

Le **WPS** (*Wi-Fi Protected Setup*) devait simplifier la connexion (bouton, ou **code PIN à 8 chiffres**). Sa conception est **fatalement faible** :
- Le PIN de 8 chiffres est **validé en deux moitiés** (4 + 3 chiffres, le 8ᵉ étant une somme de contrôle). L'AP répond **séparément** sur chaque moitié.
- Cela réduit l'espace de recherche de **10⁸ (100 millions)** à **10⁴ + 10³ ≈ 11 000** essais → cassable en **quelques heures** (attaque **Reaver**, 2011). Une fois le PIN trouvé, l'AP **révèle la passphrase WPA2**.
- Variante **Pixie Dust** : sur des AP mal implémentés, le PIN se retrouve **hors ligne** en secondes (mauvaise génération des nonces WPS).

> ⚠️ Recommandation ferme : **désactiver WPS** (surtout le mode PIN). C'est l'un des **premiers durcissements** à appliquer sur une box.

---

## 6. Cryptanalyse WPA2 par capture de paquets 🧪

Point souligné par l'examen : on parle de **récupération de la passphrase WPA2 par capture de paquets et cryptanalyse**. Concrètement, cela **recouvre** les mécanismes déjà vus :
- **Capturer** le trafic radio (le 4-way handshake, ou le **PMKID**) — c'est la « capture de paquets ».
- **Cryptanalyser hors ligne** en testant des candidats jusqu'à retrouver le MIC/le PMKID (dictionnaire/brute-force).

Ce n'est **pas** une faille du chiffrement AES lui-même (AES-CCMP reste solide) : c'est le **maillon faible de la passphrase** qui est attaqué. À distinguer de **KRACK** (module 3), qui attaque les **clés de session** et **non la passphrase**.

> 🧭 À retenir la nuance : WPA2 tombe par la **passphrase** (dictionnaire hors-ligne) ou par **KRACK** (clés de session), **pas** par une cassure d'AES. D'où la double parade : **passphrase forte** + **équipements patchés** (+ **WPA3** idéalement).

---

## 7. DoS et brouillage : casser la disponibilité 📉

Le Wi-Fi, média **partagé** et régulé par « politesse », est **facile à saturer**. Familles de DoS sans fil :
- **Deauth/disassoc flood** : bombardement de trames de déconnexion → les clients ne tiennent plus connectés (voir §2). Neutralisé par **PMF**.
- **Brouillage RF (*jamming*)** : émettre un **bruit radio** puissant sur le canal → plus personne ne peut communiquer. Attaque de **couche physique**, indépendante du chiffrement, **impossible à contrer** par cryptographie (seule la **détection de la source** RF aide).
- **Saturation / flood** : inonder l'AP de demandes d'**association/authentification** bidon, ou de trames **RTS/CTS** qui réservent le canal, ou de **faux beacons** (beacon flood) qui noient les vrais réseaux.
- **Épuisement de ressources** : saturer les tables de l'AP (nombre de clients, DHCP…).

> 🧠 Une attaque DoS ne vole **rien** : elle vise la **disponibilité** (la « D » de la triade CIA). Contre le **brouillage physique**, la crypto est **inutile** — on recourt à la **détection RF** (WIDS) et à la **localisation** de la source.

---

## 8. Récapitulatif menaces → parades 🗺️

| Attaque | Cible / effet | Parade principale |
|---|---|---|
| Dictionnaire hors-ligne (handshake) | passphrase PSK | passphrase forte, **WPA3-SAE** |
| PMKID (clientless) | passphrase PSK | passphrase forte, WPA3, MAJ firmware |
| Rainbow tables | passphrase PSK | **SSID non générique** |
| Déauthentification | déconnexion / capture / DoS | **PMF / 802.11w** |
| Rogue AP / répéteur non autorisé | porte dérobée interne | **WIDS/WIPS**, NAC, politique |
| Evil twin | MITM, vol d'identifiants | **802.1X + validation cert**, HTTPS, VPN, OWE |
| WPS PIN (Reaver / Pixie Dust) | passphrase révélée | **désactiver WPS** |
| KRACK | clés de session (déchiffrement) | **correctifs / MAJ**, WPA3 |
| DoS / brouillage RF | disponibilité | PMF, **détection RF**, redondance |

---

## 🧠 À retenir

- **Attaque phare (WPA2-PSK)** : **capturer le 4-way handshake** puis **casser la passphrase hors ligne** (dictionnaire/brute-force) en comparant le **MIC**. Dangereux car **sans limite ni détection**. Variante **PMKID** = **clientless** (demander le PMKID directement à l'AP, sans attendre de client).
- **Accélérations** : **rainbow tables par SSID** (le SSID est le **sel** → SSID générique = vulnérable). Parades : **passphrase longue/aléatoire**, **SSID unique**, **WPA3-SAE** (rend l'attaque **en ligne**).
- **Déauthentification** : trames de gestion **forgées** (non protégées avant **PMF**) pour **éjecter** des clients → capture de handshake, DoS, ou redirection vers un **evil twin**. Parade : **PMF/802.11w** (obligatoire WPA3).
- **Rogue AP** = AP **interne non autorisé** (porte dérobée sur **votre** LAN), incluant les **répéteurs non homologués** ; **evil twin** = AP **externe** qui **imite** votre SSID pour du **MITM** et du vol d'identifiants. Détection : **WIDS/WIPS**.
- **WPS PIN** : conception fatale (PIN validé en **2 moitiés** → ~**11 000** essais, **Reaver** ; **Pixie Dust** hors ligne). **Désactiver WPS**.
- **Cryptanalyse WPA2** = capture + cassage **de la passphrase**, **pas** d'AES. À distinguer de **KRACK** (clés de session). WPA2 tombe par **passphrase faible** ou **KRACK**, jamais par cassure d'AES.
- **DoS Wi-Fi** vise la **disponibilité** : deauth flood, **brouillage RF** (physique, insensible à la crypto), saturation association/beacon flood. Le brouillage se combat par **détection RF**, pas par chiffrement.`,
    badge: {
      id: "badge-cyw-airborne-threats",
      name: "Airborne Threats",
      icon: "ShieldAlert",
      description: "Connaît le panorama des attaques Wi-Fi (handshake, deauth, evil twin, rogue AP, WPS, DoS) et leurs parades.",
    },
    challenges: [
      {
        id: "cyw-att-offline",
        title: "Pourquoi hors-ligne fait peur",
        order: 1,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔓 Cassage de PSK

Après avoir **capturé le 4-way handshake** d'un réseau WPA2-PSK, l'attaquant casse la passphrase **hors ligne**. Pourquoi ce caractère « hors ligne » est-il particulièrement dangereux ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Il n'a plus besoin du réseau : combien de tentatives peut-il faire, et qui le voit ?", cost: 30 },
          { text: "📖 Correction : essais illimités, très rapides, sans détection ni blocage.", cost: 80 },
        ],
        options: [
          "Il peut essayer un nombre illimité de mots de passe, très vite, sans être détecté ni bloqué par l'AP",
          "L'AP lui envoie directement la passphrase en clair",
          "Cela casse l'algorithme AES en quelques secondes",
          "Cela ne fonctionne que si le réseau est ouvert (sans mot de passe)",
        ],
        answer: 0,
        explanation: `Une fois le handshake capturé, l'attaquant travaille **sur sa propre machine** : il teste des **millions** de candidats (dictionnaire/brute-force sur GPU) **sans limite de tentatives**, **sans lenteur imposée** et **sans détection** par l'AP. C'est pourquoi **WPA3-SAE**, qui rend l'attaque **en ligne** (chaque essai exige l'AP), constitue un progrès majeur — avec une **passphrase forte**.`,
        tags: ["dictionnaire", "hors-ligne", "wpa2-psk"],
      },
      {
        id: "cyw-att-rogue-vs-evil",
        title: "Rogue AP vs evil twin",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🚪 Deux faux AP

Un examen distingue le **rogue AP** de l'**evil twin**. Quelle définition est correcte ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "L'un est branché sur VOTRE réseau interne, l'autre imite votre réseau depuis l'extérieur.", cost: 30 },
          { text: "📖 Correction : rogue AP = AP interne non autorisé ; evil twin = AP externe qui imite le SSID.", cost: 80 },
        ],
        options: [
          "Rogue AP = AP non autorisé branché sur le réseau interne (porte dérobée) ; evil twin = AP externe qui imite le SSID pour piéger les clients",
          "Rogue AP et evil twin sont deux noms pour exactement la même chose",
          "Rogue AP = attaque de brouillage radio ; evil twin = cassage de la passphrase",
          "Rogue AP = un AP officiel de l'entreprise ; evil twin = un client mal configuré",
        ],
        answer: 0,
        explanation: `Le **rogue AP** est un point d'accès **non autorisé branché sur le réseau interne** (ex. un employé qui ajoute une borne, ou un **répéteur non homologué**) → **porte dérobée** contournant le périmètre. L'**evil twin** est un AP **externe** qui **usurpe le SSID** légitime (souvent signal plus fort + deauth) pour attirer les clients et faire du **MITM**. Détection commune : **WIDS/WIPS**.`,
        tags: ["rogue-ap", "evil-twin", "repeteur"],
      },
      {
        id: "cyw-att-deauth-pmf",
        title: "Contrer la déauthentification",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📴 Deauth

L'attaque de **déauthentification** repose sur des trames de gestion forgées. Quelle protection les **authentifie** et neutralise cette attaque ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Protected Management Frames, l'amendement 802.11w, obligatoire en WPA3.", cost: 20 },
          { text: "📖 Correction : PMF / 802.11w.", cost: 50 },
        ],
        options: [
          "PMF / 802.11w (Protected Management Frames)",
          "Un mot de passe Wi-Fi plus long",
          "Le filtrage d'adresses MAC",
          "La désactivation du DHCP",
        ],
        answer: 0,
        explanation: `Les trames de gestion (deauth/disassoc) étaient **non authentifiées** → forgeables. Les **PMF** (*Protected Management Frames*, **802.11w**) les **authentifient** : une deauth forgée est **rejetée**. WPA3 les rend **obligatoires**. Ni la longueur du mot de passe, ni le filtrage MAC, ni le DHCP n'ont d'effet sur cette attaque.`,
        tags: ["deauth", "pmf", "802.11w"],
      },
      {
        id: "cyw-att-wps",
        title: "La faille du WPS",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔢 WPS PIN

Pourquoi le **PIN WPS** à 8 chiffres est-il cassable en quelques heures alors qu'il « devrait » offrir 100 millions de combinaisons ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "L'AP valide le PIN en deux morceaux séparément, et le dernier chiffre est une somme de contrôle.", cost: 20 },
          { text: "📖 Correction : validation en 2 moitiés → ~11 000 essais au lieu de 10⁸.", cost: 50 },
        ],
        options: [
          "L'AP valide le PIN en deux moitiés séparées, réduisant l'espace à ~11 000 essais",
          "Le PIN est toujours 0000-0000 par défaut",
          "Le WPS transmet le PIN en clair dans les beacons",
          "Le PIN change à chaque tentative de façon aléatoire",
        ],
        answer: 0,
        explanation: `Le PIN WPS est **validé en deux moitiés** (4 + 3 chiffres, le 8ᵉ étant une **somme de contrôle**), et l'AP répond **séparément** à chaque moitié. L'espace tombe de **10⁸** à **10⁴ + 10³ ≈ 11 000** essais (attaque **Reaver**) — voire **hors ligne** en secondes (**Pixie Dust**). Le PIN trouvé **révèle la passphrase WPA2**. Parade : **désactiver WPS**.`,
        tags: ["wps", "reaver", "pixie-dust"],
      },
      {
        id: "cyw-att-jamming",
        title: "DoS par brouillage",
        order: 5,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 📉 Disponibilité

Un attaquant émet un **bruit radio puissant** sur le canal Wi-Fi, rendant toute communication impossible. Quelle propriété de sécurité vise-t-il, et pourquoi le chiffrement n'y peut-il rien ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "C'est une attaque de couche physique. Quelle lettre de la triade CIA ?", cost: 30 },
          { text: "📖 Correction : la disponibilité ; le brouillage est physique, insensible à la crypto.", cost: 80 },
        ],
        options: [
          "La disponibilité : le brouillage agit sur la couche physique (RF), indépendamment de tout chiffrement",
          "La confidentialité : il déchiffre le trafic grâce au bruit",
          "L'intégrité : il modifie les paquets un par un",
          "La non-répudiation : il efface les journaux de l'AP",
        ],
        answer: 0,
        explanation: `Le **brouillage RF (*jamming*)** est une attaque de **couche physique** : il noie le canal sous du bruit → plus personne ne communique. Il vise la **disponibilité** (le « D » de CIA). Le **chiffrement est inutile** contre lui (il n'attaque pas les données, mais le **support**). On le combat par la **détection RF** (WIDS) et la **localisation** de la source, pas par cryptographie.`,
        tags: ["dos", "jamming", "disponibilite"],
      },
      {
        id: "cyw-att-crypto-vs-krack",
        title: "Cryptanalyse WPA2 vs KRACK",
        order: 6,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🧪 Deux failles à ne pas confondre

Quelles affirmations sont **vraies** concernant les attaques sur WPA2 ? (Coche toutes les bonnes.)`,
        points: 350,
        timeLimitSec: 420,
        options: [
          "La cryptanalyse par capture de paquets attaque la PASSPHRASE (dictionnaire hors-ligne), pas l'algorithme AES",
          "KRACK attaque les CLÉS DE SESSION en forçant une réinstallation de clé, sans casser la passphrase",
          "AES-CCMP lui-même est cassé et déchiffrable directement",
          "Une passphrase longue et aléatoire complique fortement la cryptanalyse hors-ligne",
        ],
        answer: [0, 1, 3],
        hints: [
          { text: "AES-CCMP tient toujours ; WPA2 tombe par la passphrase OU par KRACK.", cost: 30 },
          { text: "📖 Correction : vrais = passphrase visée, KRACK = clés de session, passphrase forte protège.", cost: 80 },
        ],
        explanation: `La **cryptanalyse WPA2** vise la **passphrase** (capture du handshake/PMKID + dictionnaire **hors ligne**), **pas AES** — qui reste **solide**. **KRACK** est distinct : il attaque les **clés de session** (réinstallation de clé), **sans** casser la passphrase. Une **passphrase longue et aléatoire** rend le cassage hors-ligne impraticable. L'affirmation « AES-CCMP est cassé » est **fausse**.`,
        tags: ["cryptanalyse", "krack", "aes"],
      },
    ],
  },
];
