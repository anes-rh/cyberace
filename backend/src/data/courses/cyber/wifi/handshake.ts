import type { CourseSeed } from "../../../../types";

/** Cyber · Wi-Fi — Module 3 : le 4-way handshake WPA2 et l'attaque KRACK. */
export const handshake: CourseSeed[] = [
  {
    slug: "cyw-handshake",
    title: "Le 4-way handshake et son exploitation",
    checkpoint: "cyber-wifi",
    codename: "Four Steps",
    domain: "Sans-fil — Handshake WPA2",
    theme: "grid",
    icon: "Handshake",
    accent: "#93B896",
    order: 3,
    difficulty: "hard",
    summary:
      "Le mécanisme central de WPA2 : hiérarchie de clés (PMK → PTK/GTK), les 4 messages du handshake, le rôle des nonces et du compteur anti-rejeu, puis l'attaque KRACK (Key Reinstallation Attack) qui réinstalle la clé pour réinitialiser le keystream.",
    objectives: [
      "Décrire la hiérarchie de clés WPA2 : PMK, PTK (KCK/KEK/TK), GTK",
      "Détailler les 4 messages du handshake et ce qui se dérive à chaque étape",
      "Comprendre le rôle des nonces (ANonce/SNonce) et du replay counter",
      "Expliquer l'attaque KRACK : réinstallation de clé et réutilisation de nonce",
      "Situer l'impact de KRACK et les correctifs (côté client surtout)",
    ],
    resources: [
      {
        label: "KRACK Attacks — site officiel de la divulgation (Vanhoef)",
        url: "https://www.krackattacks.com/",
        kind: "link",
        note: "La page de référence sur l'attaque KRACK (2017) : explication, démo, FAQ et CVE associées.",
      },
      {
        label: "IEEE 802.11i — la norme du RSN (4-way handshake)",
        url: "https://www.ieee802.org/11/",
        kind: "link",
        note: "La norme qui définit le Robust Security Network et le 4-way handshake WPA2.",
      },
    ],
    lesson: `# 🤝 Le 4-way handshake et son exploitation — Four Steps

Une fois qu'une station connaît la **clé maîtresse** du réseau (la PMK), elle ne s'en sert **jamais directement** pour chiffrer. À la place, elle exécute avec l'AP un **échange en 4 messages** — le **4-way handshake** — qui dérive des **clés de session** fraîches. Comprendre ce ballet est indispensable, car c'est là que se joue l'attaque **KRACK**. 🏎️

---

## 1. Pourquoi un handshake ? 🎯

Le 4-way handshake poursuit **quatre** objectifs simultanés :
1. **Prouver** que les deux parties connaissent bien la **PMK** (sans jamais la transmettre).
2. **Dériver des clés de session uniques** (la **PTK**) à partir de la PMK et de valeurs aléatoires fraîches.
3. **Transmettre la clé de groupe** (la **GTK**) pour le trafic diffusé/multicast.
4. **Confirmer** que le chiffrement peut démarrer, et **installer** les clés des deux côtés.

> 🧭 Idée-force : on ne chiffre **jamais** avec la clé maîtresse. On en dérive des **clés éphémères** propres à **cette** session, grâce à des **nonces** (nombres aléatoires à usage unique). C'est ce qui garantit que deux sessions n'utilisent pas le même keystream.

---

## 2. La hiérarchie des clés 🗝️

\`\`\`
   Passphrase + SSID
        │  PBKDF2 (4096 itérations)
        ▼
      PMK  (Pairwise Master Key, 256 bits)     ← WPA2-PSK
        │  PRF( PMK, ANonce, SNonce, @MAC AP, @MAC STA )
        ▼
      PTK  (Pairwise Transient Key)
        ├── KCK  (Key Confirmation Key)  → signe/vérifie les MIC du handshake
        ├── KEK  (Key Encryption Key)    → chiffre la GTK dans le message 3
        └── TK   (Temporal Key)          → chiffre RÉELLEMENT les données (AES-CCMP)

      GTK  (Group Temporal Key)          → chiffre le trafic broadcast/multicast
\`\`\`

- **PMK** (*Pairwise Master Key*) : la clé maîtresse.
  - En **WPA2-Personnel**, elle se **dérive de la passphrase** : \`PMK = PBKDF2(passphrase, SSID, 4096, 256)\`. Le **SSID sert de sel** — d'où l'intérêt des attaques par **rainbow tables spécifiques à un SSID** (module 4).
  - En **WPA2-Entreprise**, elle est **générée par le serveur RADIUS** à chaque session (module 5).
- **PTK** (*Pairwise Transient Key*) : la clé de session, **dérivée** par une fonction pseudo-aléatoire (**PRF**) à partir de : la **PMK**, les **deux nonces** (ANonce + SNonce) et les **deux adresses MAC**. Elle est **découpée** en :
  - **KCK** : sert à **calculer/vérifier les MIC** (intégrité) des messages du handshake.
  - **KEK** : sert à **chiffrer la GTK** transmise dans le message 3.
  - **TK** : la clé qui **chiffre effectivement les données** (avec AES-CCMP).
- **GTK** (*Group Temporal Key*) : clé **commune** à toutes les stations d'un AP, pour le trafic **broadcast/multicast**.

> 🧠 Comme la PTK dépend des **nonces** (aléatoires à chaque connexion), elle est **différente à chaque session**, même si la PMK (la passphrase) ne change pas. C'est cette fraîcheur que l'attaque KRACK va **casser**.

---

## 3. Les 4 messages, un par un 📨

Avant le handshake, la station s'est déjà **authentifiée (open system)** et **associée** à l'AP. Les deux parties **connaissent la PMK**. Le handshake échange alors des messages **EAPOL-Key** :

\`\`\`
   STATION (supplicant)                         AP (authenticator)
        │                                              │
        │   ◄── (1) EAPOL : ANonce + replay counter ──│
        │        [ la STA génère SNonce, calcule PTK ] │
        │                                              │
        │── (2) EAPOL : SNonce + MIC ─────────────────►│
        │                    [ l'AP calcule PTK à son tour ]
        │                                              │
        │   ◄── (3) EAPOL : GTK (chiffrée KEK) + MIC ──│
        │                    + "installe les clés"      │
        │                                              │
        │── (4) EAPOL : ACK + MIC ────────────────────►│
        │   [ les deux installent PTK & GTK ]           │
        ▼                                              ▼
        ══════  données chiffrées AES-CCMP (clé TK)  ══════
\`\`\`

- **Message 1 (AP → STA)** : l'AP envoie son **ANonce** (*Authenticator Nonce*, aléatoire) et un **replay counter**. À réception, la station **a tout** ce qu'il lui faut : elle génère son propre **SNonce** et **calcule la PTK** (elle connaît PMK, ANonce, SNonce, les deux MAC).
- **Message 2 (STA → AP)** : la station renvoie son **SNonce** accompagné d'un **MIC** (calculé avec la KCK). L'AP reçoit le SNonce → il peut à son tour **calculer la PTK**, et **vérifier le MIC** confirme que la station connaît bien la PMK.
- **Message 3 (AP → STA)** : l'AP transmet la **GTK** (chiffrée avec la **KEK**), un **MIC**, et l'ordre d'**installer les clés**. C'est la confirmation, côté AP, que tout concorde.
- **Message 4 (STA → AP)** : simple **accusé de réception** (ACK) avec MIC. La station et l'AP **installent la PTK et la GTK** ; le chiffrement **AES-CCMP** des données peut commencer.

> 🧭 Après le message 4, chaque paquet de données est chiffré avec la **TK** et numéroté par un **compteur de paquets (nonce/PN)** qui **s'incrémente** et ne doit **jamais** se répéter pour une même clé — sinon le **keystream** se répète (comme le WEP). Retenez ce point : **c'est exactement ce que KRACK va provoquer.**

---

## 4. Le rôle des nonces et du replay counter 🎲

- Les **nonces** (ANonce, SNonce) garantissent la **fraîcheur** : ils rendent la PTK **unique** à chaque handshake. Un attaquant ne peut pas **rejouer** un ancien handshake pour recréer une vieille clé.
- Le **replay counter** (dans les EAPOL-Key) protège le handshake lui-même contre le **rejeu** : chaque message porte un numéro croissant.
- Le **PN** (*Packet Number*) des trames de données chiffrées est un **compteur anti-rejeu** : l'AP rejette un paquet dont le PN a déjà été vu. **Réinitialiser ce compteur** casse cette garantie.

---

## 5. KRACK — Key Reinstallation Attack 💥

Découverte par **Mathy Vanhoef en 2017**, **KRACK** vise **la norme WPA2 elle-même** (pas une implémentation isolée) : elle a touché **quasiment tous** les équipements Wi-Fi de l'époque.

### L'idée

Le handshake doit tolérer les **pertes de paquets** : si l'AP ne reçoit pas le message 4, il **retransmet le message 3**. À chaque réception (ou **re**-réception) du message 3, la station **(ré)installe la PTK**… **et remet à zéro** le compteur de paquets (nonce/PN) associé.

L'attaquant, placé en **homme du milieu** (relais des trames), **bloque le message 4** et **force la retransmission du message 3**. Résultat :

\`\`\`
   Message 3 (1re fois)  → STA installe PTK, PN = 0, chiffre paquet A avec nonce 1
   Message 4 bloqué par l'attaquant  ✂️
   Message 3 (rejoué)    → STA RÉINSTALLE la même PTK, PN remis à 0 !
                          → STA re-chiffre avec nonce 1  ⇒ MÊME KEYSTREAM
\`\`\`

### Pourquoi c'est grave

Réinitialiser le nonce/PN avec **la même clé (TK)** fait **réutiliser le keystream** — exactement la faille mortelle du WEP. Selon le protocole de chiffrement, l'attaquant peut alors :
- **Déchiffrer** des paquets (récupérer des données : cookies, contenu…).
- **Rejouer** des paquets.
- Dans certains cas (TKIP, GCMP), **forger/injecter** du trafic.

> ⚠️ KRACK ne récupère **pas la passphrase Wi-Fi** ni la PMK — c'est une attaque sur les **clés de session**, pas sur le mot de passe. Elle attaque surtout le **client** (supplicant), pas l'AP.

### Le pire cas : la clé « tout à zéro »

Sur certaines versions d'Android et de Linux (**wpa_supplicant** 2.4/2.5), la réinstallation **effaçait la clé en mémoire** et réinstallait une **clé entièrement nulle (all-zero)** — rendant le déchiffrement **trivial**. Ces implémentations étaient donc **particulièrement** vulnérables.

### Correctifs et prévention 🩹

- **Correctifs logiciels** (2017) côté **clients et AP** : ils **refusent de réinstaller** une clé déjà installée pendant un handshake. **Mettre à jour** les équipements est la parade principale.
- **PMF/802.11w** aide à protéger certaines trames, mais **ne suffit pas** seul contre toutes les variantes de KRACK.
- **WPA3** avec **SAE** ne repose plus sur le même 4-way handshake d'établissement (il a son propre échange), ce qui **élimine** la classe de failles KRACK à la racine — à condition d'une implémentation correcte.
- Le **HTTPS/TLS** de bout en bout **limite l'impact** : même si l'attaquant déchiffre la couche Wi-Fi, le contenu applicatif reste protégé par TLS (mais des données non chiffrées, ou des attaques de *downgrade*, restent exploitables).

> 🧠 Leçon défensive : KRACK exploitait une **exigence du protocole** (« retransmettre le message 3 en cas de perte ») détournée pour **rejouer** une installation de clé. La correction n'a pas changé le handshake, mais a **interdit la réinstallation** d'une clé identique. **Patcher les clients** (surtout Android/Linux anciens) était la priorité.

---

## 🧠 À retenir

- On ne chiffre **jamais** avec la clé maîtresse : le **4-way handshake** dérive des **clés de session fraîches** à partir de la **PMK** et de **nonces**.
- **Hiérarchie** : \`PMK → PTK → { KCK (MIC), KEK (chiffre la GTK), TK (chiffre les données) }\`, plus la **GTK** pour le broadcast/multicast. En **PSK** : \`PMK = PBKDF2(passphrase, SSID, 4096, 256)\` (le **SSID = sel**).
- **Les 4 messages** : (1) AP→STA **ANonce** → la STA calcule la PTK ; (2) STA→AP **SNonce + MIC** → l'AP calcule la PTK ; (3) AP→STA **GTK (chiffrée KEK) + MIC + installe** ; (4) STA→AP **ACK** → installation des clés, le chiffrement AES-CCMP démarre.
- Les **nonces** rendent la PTK **unique par session** ; le **replay counter** / **PN** empêchent le rejeu. Un **PN qui ne se répète jamais** est vital (sinon keystream réutilisé, comme le WEP).
- **KRACK (2017)** : l'attaquant **bloque le message 4** et **force le renvoi du message 3** → la station **réinstalle la même clé** et **remet le nonce/PN à zéro** → **réutilisation du keystream** (déchiffrement, rejeu, parfois forge).
- KRACK ne casse **pas la passphrase** ; elle vise les **clés de session** et surtout le **client**. Cas extrême : réinstallation d'une clé **all-zero** (Android/Linux wpa_supplicant 2.4/2.5).
- Parades : **correctifs** (interdire la réinstallation d'une clé), **mise à jour** des équipements, **WPA3/SAE** (élimine la classe de failles), **HTTPS/TLS** de bout en bout en défense en profondeur.`,
    badge: {
      id: "badge-cyw-four-steps",
      name: "Four Steps",
      icon: "Handshake",
      description: "Maîtrise la hiérarchie de clés WPA2, les 4 messages du handshake et l'attaque KRACK.",
    },
    challenges: [
      {
        id: "cyw-hs-ptk",
        title: "Ce qui dérive la PTK",
        order: 1,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🗝️ Dérivation de la PTK

La **PTK** (clé de session) est calculée par une fonction pseudo-aléatoire. Parmi ces éléments, **lesquels** entrent dans son calcul ? (Coche tout ce qui s'applique.)`,
        points: 350,
        timeLimitSec: 420,
        options: [
          "La PMK (clé maîtresse)",
          "Les deux nonces (ANonce et SNonce)",
          "Les adresses MAC de l'AP et de la station",
          "Le numéro de série du routeur imprimé sous le boîtier",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "PTK = PRF( PMK, ANonce, SNonce, @MAC AP, @MAC STA ).", cost: 30 },
          { text: "📖 Correction : PMK + les 2 nonces + les 2 adresses MAC. Pas le numéro de série.", cost: 80 },
        ],
        explanation: `La **PTK** = **PRF( PMK, ANonce, SNonce, @MAC AP, @MAC STA )**. Elle combine la **clé maîtresse**, les **deux nonces** (fraîcheur → clé unique par session) et les **deux adresses MAC**. Le numéro de série du boîtier n'a **aucun** rôle. La PTK est ensuite découpée en **KCK / KEK / TK**.`,
        tags: ["ptk", "derivation", "nonce"],
      },
      {
        id: "cyw-hs-msg1",
        title: "Le message 1",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📨 Message 1

Que contient le **premier message** du 4-way handshake, envoyé par l'**AP vers la station** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Le nonce de l'AP, celui qui permet à la station de calculer la PTK.", cost: 20 },
          { text: "📖 Correction : l'ANonce (nonce de l'Authenticator).", cost: 50 },
        ],
        options: [
          "L'ANonce (le nonce de l'AP) et un replay counter",
          "La passphrase du réseau en clair",
          "La clé TK déjà installée",
          "La liste des clients connectés",
        ],
        answer: 0,
        explanation: `Le **message 1** (AP → STA) transporte l'**ANonce** (*Authenticator Nonce*) et un **replay counter**. Grâce à lui, la station — qui connaît déjà la PMK, sa propre MAC et celle de l'AP — génère son **SNonce** et **calcule la PTK**. La passphrase, elle, **ne circule jamais** sur le réseau.`,
        tags: ["handshake", "message1", "anonce"],
      },
      {
        id: "cyw-hs-gtk",
        title: "La GTK dans le message 3",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📡 Clé de groupe

Dans le **message 3**, l'AP transmet la **GTK** à la station. À quoi sert cette clé, et comment est-elle protégée en transit ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "GTK = Group Temporal Key ; elle sert au trafic diffusé, et voyage chiffrée par la KEK.", cost: 20 },
          { text: "📖 Correction : chiffrer le broadcast/multicast, transmise chiffrée avec la KEK.", cost: 50 },
        ],
        options: [
          "Elle chiffre le trafic broadcast/multicast ; elle est transmise chiffrée avec la KEK",
          "Elle remplace la passphrase du réseau",
          "Elle sert uniquement à ralentir le handshake",
          "Elle circule en clair sans aucune protection",
        ],
        answer: 0,
        explanation: `La **GTK** (*Group Temporal Key*) chiffre le trafic **broadcast/multicast** commun à toutes les stations d'un AP. Dans le **message 3**, elle est transmise **chiffrée avec la KEK** (dérivée de la PTK) et accompagnée d'un **MIC**. La **TK**, elle, chiffre le trafic **unicast** de la station.`,
        tags: ["gtk", "message3", "kek"],
      },
      {
        id: "cyw-hs-krack",
        title: "Le principe de KRACK",
        order: 4,
        difficulty: "insane",
        type: "mcq",
        prompt: `## 💥 KRACK

En quoi consiste, sur le plan technique, l'attaque **KRACK** (Key Reinstallation Attack) contre WPA2 ?`,
        points: 550,
        timeLimitSec: 480,
        hints: [
          { text: "On force le renvoi d'un message du handshake pour faire réinstaller la clé… et remettre le compteur à zéro.", cost: 40 },
          { text: "📖 Correction : forcer la réinstallation de la clé → nonce/PN remis à zéro → keystream réutilisé.", cost: 120 },
        ],
        options: [
          "Bloquer le message 4 et forcer le renvoi du message 3, pour que la station réinstalle la clé et remette le nonce/PN à zéro (keystream réutilisé)",
          "Casser directement la passphrase WPA2 par force brute en ligne",
          "Deviner la clé AES en analysant la consommation électrique de l'AP",
          "Injecter un virus dans le firmware du routeur à distance",
        ],
        answer: 0,
        explanation: `**KRACK** exploite la retransmission du **message 3** : l'attaquant (en homme du milieu) **bloque le message 4**, ce qui pousse l'AP à **renvoyer le message 3**. La station **réinstalle la même clé** et **réinitialise le compteur de paquets (nonce/PN)** → le **keystream se répète** (comme le WEP), permettant **déchiffrement/rejeu**, voire injection. KRACK ne récupère **pas** la passphrase et vise surtout le **client**.`,
        tags: ["krack", "reinstallation", "nonce"],
      },
      {
        id: "cyw-hs-krack-fix",
        title: "Se protéger de KRACK",
        order: 5,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🩹 Correctif KRACK

Quelle est la **mesure principale** pour se protéger de KRACK, sachant que l'attaque vise surtout les **clients** ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "La faille est logicielle : elle se corrige par une… ?", cost: 30 },
          { text: "📖 Correction : appliquer les correctifs / mettre à jour les équipements (surtout clients).", cost: 80 },
        ],
        options: [
          "Mettre à jour (patcher) les équipements — surtout les clients Android/Linux anciens",
          "Rallonger la passphrase du Wi-Fi à 63 caractères",
          "Cacher le SSID du réseau",
          "Repasser le réseau en WEP",
        ],
        answer: 0,
        explanation: `KRACK est une faille **logicielle** du handshake : la parade principale est d'**appliquer les correctifs** (2017) qui **interdisent la réinstallation** d'une clé déjà en place, en priorité sur les **clients** (Android/Linux **wpa_supplicant 2.4/2.5** étaient les pires cas, avec réinstallation d'une clé **all-zero**). Rallonger la passphrase ou cacher le SSID **n'y change rien** ; repasser en WEP serait catastrophique. **WPA3/SAE** élimine la classe de failles.`,
        tags: ["krack", "correctif", "mise-a-jour"],
      },
      {
        id: "cyw-hs-pmk",
        title: "La dérivation de la PMK en PSK",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## 🧂 PMK et sel

En WPA2-Personnel, la PMK est dérivée de la passphrase par la fonction **PBKDF2**. Quel élément du réseau joue le rôle de **sel** dans cette dérivation (ce qui rend une passphrase identique différente d'un réseau à l'autre) ?

*(Réponds en un mot / un sigle.)*`,
        points: 350,
        timeLimitSec: 300,
        hints: [
          { text: "C'est le nom du réseau lui-même.", cost: 30 },
          { text: "📖 Correction : le SSID.", cost: 80 },
        ],
        answer: "SSID",
        accept: ["ssid", "le ssid", "nom du réseau", "nom du reseau"],
        caseSensitive: false,
        explanation: `\`PMK = PBKDF2(passphrase, SSID, 4096, 256)\` : le **SSID** sert de **sel**. Deux réseaux avec la **même passphrase** mais un **SSID différent** produisent des **PMK différentes**. C'est aussi pourquoi les attaquants pré-calculent des **rainbow tables par SSID courant** (« linksys », « default »…) pour accélérer le cassage (module 4).`,
        tags: ["pmk", "pbkdf2", "ssid", "sel"],
      },
    ],
  },
];
