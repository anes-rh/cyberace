import type { CourseSeed } from "../../../../types";

/** Cyber · Système — Module 5 : canaux cachés (covert channels). */
export const canauxCaches: CourseSeed[] = [
  {
    slug: "cys-canaux-caches",
    title: "Canaux cachés (covert channels)",
    checkpoint: "cyber-systeme",
    codename: "Hidden Channel",
    domain: "Système — Canaux cachés",
    theme: "grid",
    icon: "EyeOff",
    accent: "#E8A87C",
    order: 5,
    difficulty: "hard",
    summary:
      "Faire fuir l'information là où aucune communication n'est censée exister : définition d'un canal caché, distinction canaux de stockage vs canaux temporels, exemples concrets (attributs de fichiers, charge CPU, cache), lien avec Bell-LaPadula, et contre-mesures (bande passante, bruit, isolation).",
    objectives: [
      "Définir un canal caché et le distinguer d'un canal légitime",
      "Distinguer canal de stockage et canal temporel",
      "Illustrer par des exemples concrets (attributs, verrous, timing, cache)",
      "Comprendre pourquoi les canaux cachés contournent Bell-LaPadula",
      "Connaître les contre-mesures (réduction de débit, bruit, isolation)",
    ],
    resources: [
      {
        label: "NIST — Covert Channel Analysis (glossaire & MLS)",
        url: "https://csrc.nist.gov/glossary",
        kind: "link",
        note: "Définitions de référence des canaux cachés (storage/timing) dans le cadre de la sécurité multi-niveaux.",
      },
      {
        label: "MITRE ATT&CK — Exfiltration & C2 non conventionnels",
        url: "https://attack.mitre.org/tactics/TA0010/",
        kind: "link",
        note: "Techniques d'exfiltration détournées, apparentées aux canaux cachés modernes.",
      },
    ],
    lesson: `# 🕳️ Canaux cachés (covert channels) — Hidden Channel

Un système peut appliquer parfaitement Bell-LaPadula (« no write down »)… et **fuir quand même** de l'information. Comment ? Par un **canal caché** : un moyen de communiquer **détourné**, qui utilise des mécanismes **non prévus** pour transmettre des données, contournant la politique de sécurité. 🏎️

---

## 1. Qu'est-ce qu'un canal caché ? 🎭

Un **canal caché** (*covert channel*) est un canal de communication qui :
- **n'a pas été conçu ni prévu** pour transporter de l'information,
- **viole la politique de sécurité** en permettant un transfert **interdit** (typiquement d'un niveau **haut** vers un niveau **bas**).

Il s'oppose au **canal légitime** (*overt channel*) — les moyens normaux et contrôlés de communication (fichiers, sockets, messages soumis aux règles d'accès).

\`\`\`
   Canal LÉGITIME  : Haut ──(soumis à Bell-LaPadula → BLOQUÉ vers le bas)──► Bas
   Canal CACHÉ     : Haut ──(module une ressource partagée)──► Bas   ← contourne la règle !
\`\`\`

L'idée : deux entités (souvent un processus **de haut niveau**, éventuellement un cheval de Troie, et un complice **de bas niveau**) s'entendent pour **encoder** de l'information dans une **ressource partagée observable**, que la politique d'accès **ne surveille pas** comme un canal de communication.

> 🧭 Le scénario type : un **cheval de Troie** habilité **Secret** ne peut pas **écrire** un fichier **Confidentiel** (no write down). Mais il peut **moduler** une ressource système que le complice **Confidentiel** peut **observer** → l'information secrète **s'échappe** malgré la règle.

---

## 2. Les deux grandes familles 🌗

### Canal de stockage (*storage channel*) 💾

L'émetteur **modifie une ressource** (un attribut, un état) que le récepteur peut **lire/observer**. L'information est encodée dans la **valeur** d'un objet partagé.

Exemples :
- **Attributs de fichiers** : présence/absence d'un fichier, sa **taille**, ses **permissions**, un **nom** dans un répertoire partagé → chaque bit encodé par « existe / n'existe pas ».
- **Verrous / ressources** : verrouiller ou non un enregistrement, occuper ou libérer une ressource.
- **Espace disque**, table de processus, variables d'état partagées.

### Canal temporel (*timing channel*) ⏱️

L'émetteur **module le temps** (le rythme, les délais) d'un événement que le récepteur **mesure**. L'information est encodée dans le **quand**, pas dans le **quoi**.

Exemples :
- **Charge CPU** : l'émetteur consomme intensément le CPU (bit = 1) ou le laisse libre (bit = 0) ; le récepteur **mesure** sa propre vitesse d'exécution.
- **Latence** d'une ressource partagée, temps de réponse.
- **Cache du processeur** : les canaux **micro-architecturaux** (base d'attaques comme **Spectre/Meltdown**, ou **Flush+Reload**) mesurent des **différences de temps d'accès** au cache pour déduire des données — une forme très moderne et redoutable de canal temporel.

> 🧠 Distinction : **stockage = la valeur** d'une ressource (l'émetteur écrit un état, le récepteur le lit) ; **temporel = le timing** (l'émetteur module des délais, le récepteur chronomètre). Les canaux temporels sont plus **difficiles à éliminer** car le **temps** est partout.

---

## 3. Caractéristiques d'un canal caché 📏

- **Ressource partagée** : il faut un support commun observable par les deux parties (fichier, CPU, cache, disque…).
- **Débit (bande passante)** : mesuré en **bits/seconde**. Un canal caché est souvent **lent et bruité**, mais même **quelques bits/s** suffisent à exfiltrer une **clé** ou un **mot de passe** en un temps raisonnable.
- **Bruit** : les interférences (autres processus utilisant la ressource) dégradent le canal → l'attaquant emploie des **codes correcteurs**, de la **synchronisation** et de la **redondance**.
- **Synchronisation** : émetteur et récepteur doivent s'accorder sur le **timing/protocole** d'encodage.

---

## 4. Pourquoi ils contournent Bell-LaPadula ⚠️

Bell-LaPadula (module 4) contrôle les **flux d'information via les objets** (lecture/écriture de fichiers). Mais il **ne modélise pas** toutes les **ressources partagées** du système comme des canaux. Un canal caché exploite précisément ce **point aveugle** :
- Le « no write down » interdit d'**écrire un fichier** de niveau inférieur…
- …mais **n'empêche pas** de **moduler la charge CPU** ou d'**observer un attribut partagé**, qui ne sont pas considérés comme des « écritures » d'objet classifié.

C'est la **limite fondamentale** des modèles MAC formels : ils garantissent l'absence de fuite par les **canaux légitimes**, mais les **canaux cachés** vivent **en dehors** du modèle. Leur **analyse** (*covert channel analysis*) était d'ailleurs une **exigence** des plus hauts niveaux de certification (Orange Book).

---

## 5. Détection et contre-mesures 🛡️

Éliminer **totalement** les canaux cachés est **très difficile** (voire impossible dès qu'il existe une ressource partagée). On cherche donc à les **rendre inexploitables** :

- **Analyse des canaux cachés** : identifier systématiquement les ressources partagées observables entre niveaux (analyse à la conception).
- **Réduire la bande passante** : introduire du **bruit** délibéré, de la **latence aléatoire**, limiter la **précision des horloges** accessibles (contre les canaux temporels) → le débit tombe si bas que l'exfiltration devient impraticable.
- **Isolation / partitionnement** : ne **pas partager** les ressources entre niveaux (mémoire, CPU dédiés, *air gap*), partitionnement temporel du CPU. La **virtualisation** aide mais crée ses **propres** canaux (cache partagé — module 7).
- **Quotas fixes** : allouer des ressources de façon **fixe et prévisible** (espace, CPU) pour qu'elles ne puissent pas **encoder** d'information par leur variation.
- **Surveillance** : détecter des **patterns anormaux** (variations suspectes d'attributs, de charge, de timing) — difficile car le trafic est **discret** par nature.

> 🧠 Compromis récurrent : plus on **cloisonne/bruite**, plus on **dégrade les performances**. La défense vise à réduire le **débit** du canal en dessous d'un seuil utile (ex. < 1 bit/s), pas forcément à le supprimer — car un partage de ressources laisse presque toujours **un** canal résiduel.

---

## 🧠 À retenir

- Un **canal caché** est un moyen de communication **non prévu** qui **viole la politique de sécurité** (typiquement fuite du **haut** vers le **bas**), par opposition au **canal légitime** (*overt*) contrôlé.
- **Canal de stockage** : encode l'info dans la **valeur/l'état** d'une ressource partagée (attribut/taille/existence de fichier, verrou, espace disque). **Canal temporel** : encode l'info dans le **timing** (charge CPU, latence, **cache** → Spectre/Meltdown, Flush+Reload).
- Un canal caché exige une **ressource partagée**, a un **débit** (bits/s) souvent **faible et bruité** — mais **quelques bits/s suffisent** à voler une clé. L'attaquant utilise **redondance/synchronisation**.
- Ils **contournent Bell-LaPadula** car les modèles MAC contrôlent les **objets/canaux légitimes**, pas toutes les **ressources partagées** (point aveugle). C'est la **limite** des modèles formels.
- **Contre-mesures** : **analyse** des canaux, **réduction de bande passante** (bruit, latence aléatoire, horloges imprécises), **isolation/partitionnement** (ressources dédiées, air gap), **quotas fixes**, **surveillance**. Objectif réaliste : rendre le débit **inexploitable** (compromis avec les **performances**).`,
    badge: {
      id: "badge-cys-hidden-channel",
      name: "Hidden Channel",
      icon: "EyeOff",
      description: "Maîtrise les canaux cachés (stockage vs temporel), leur lien avec BLP et leurs contre-mesures.",
    },
    challenges: [
      {
        id: "cys-covert-def",
        title: "Définir un canal caché",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🕳️ Définition

Qu'est-ce qui caractérise un **canal caché** (covert channel) par rapport à un canal légitime ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un moyen NON prévu pour communiquer, qui viole la politique de sécurité.", cost: 20 },
          { text: "📖 Correction : un canal détourné, non conçu pour communiquer, qui viole la politique (fuite interdite).", cost: 50 },
        ],
        options: [
          "Un canal détourné, non conçu pour communiquer, qui viole la politique de sécurité (transfert interdit, ex. du haut vers le bas)",
          "Le canal normal et contrôlé par lequel transitent les fichiers",
          "Un câble réseau physiquement dissimulé dans un mur",
          "Un protocole de chiffrement standard",
        ],
        answer: 0,
        explanation: `Un **canal caché** utilise un mécanisme **non prévu** pour la communication afin de **transférer de l'information en violation de la politique** (typiquement du **haut** vers le **bas**, contournant « no write down »). Il s'oppose au **canal légitime** (*overt*), qui est le moyen normal et **contrôlé** (fichiers, sockets soumis aux règles d'accès).`,
        tags: ["canal-cache", "definition", "politique"],
      },
      {
        id: "cys-covert-types",
        title: "Stockage ou temporel ?",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🌗 Typologie

Un processus malveillant encode des bits en **consommant intensément le CPU** (bit = 1) ou en le laissant libre (bit = 0), pendant qu'un complice **mesure sa vitesse d'exécution**. De quel type de canal caché s'agit-il ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "L'information est portée par le TEMPS/le rythme, pas par la valeur d'une ressource stockée.", cost: 30 },
          { text: "📖 Correction : un canal temporel (timing channel).", cost: 80 },
        ],
        options: [
          "Un canal temporel (timing channel) : l'information est encodée dans le timing, mesuré par le récepteur",
          "Un canal de stockage : l'information est dans la valeur d'un attribut de fichier",
          "Un canal légitime totalement autorisé",
          "Un simple transfert de fichier chiffré",
        ],
        answer: 0,
        explanation: `Encoder l'info via la **charge CPU** mesurée par le récepteur = **canal temporel** (*timing channel*) : c'est le **timing/le rythme** qui porte l'information. Un **canal de stockage** encoderait plutôt dans la **valeur/l'état** d'une ressource (attribut, taille, existence d'un fichier). Les canaux temporels incluent aussi les attaques **cache** (Flush+Reload, Spectre).`,
        tags: ["canal-temporel", "cpu", "timing"],
      },
      {
        id: "cys-covert-storage",
        title: "Canal de stockage",
        order: 3,
        difficulty: "medium",
        type: "multi",
        prompt: `## 💾 Exemples

Lesquels de ces mécanismes peuvent servir de **canal de stockage** (encoder l'info dans la valeur/l'état d'une ressource) ? (Coche tout ce qui s'applique.)`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "L'existence ou l'absence d'un fichier dans un répertoire partagé",
          "La taille ou les permissions d'un fichier",
          "L'état verrouillé/déverrouillé d'un enregistrement partagé",
          "La couleur du câble Ethernet branché au serveur",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Trois états observables d'une ressource partagée ; le quatrième n'a aucun lien logiciel.", cost: 20 },
          { text: "📖 Correction : existence de fichier, taille/permissions, verrou. Pas la couleur du câble.", cost: 50 },
        ],
        explanation: `Un **canal de stockage** encode l'information dans la **valeur/l'état** d'une ressource **partagée et observable** : **existence** d'un fichier, sa **taille**/**permissions**, l'état d'un **verrou**, l'espace disque, etc. La « couleur du câble » n'est pas une ressource **logique observable** par le processus récepteur → aucun canal.`,
        tags: ["canal-stockage", "attributs", "exemples"],
      },
      {
        id: "cys-covert-blp",
        title: "Contourner Bell-LaPadula",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## ⚠️ Point aveugle

Pourquoi un canal caché permet-il de **contourner** un système appliquant pourtant correctement Bell-LaPadula (no write down) ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "BLP contrôle les objets/canaux légitimes, pas toutes les ressources partagées.", cost: 30 },
          { text: "📖 Correction : le modèle ne surveille pas les ressources partagées (CPU, attributs) comme des canaux → point aveugle.", cost: 80 },
        ],
        options: [
          "Parce que Bell-LaPadula contrôle les flux via les objets/canaux légitimes, mais ne modélise pas les ressources partagées (CPU, attributs) comme des canaux : elles constituent un point aveugle",
          "Parce que Bell-LaPadula autorise explicitement le write down",
          "Parce que le canal caché désactive les règles du modèle",
          "Parce que Bell-LaPadula ne s'applique qu'au réseau",
        ],
        answer: 0,
        explanation: `**Bell-LaPadula** contrôle les flux via les **objets** (lecture/écriture de fichiers classifiés). Un **canal caché** exploite des **ressources partagées** (charge CPU, cache, attributs) que le modèle **ne considère pas** comme des canaux de communication → un **point aveugle**. Le « no write down » n'empêche pas de **moduler le CPU** ou d'**observer un attribut**. C'est la **limite** des modèles MAC formels.`,
        tags: ["bell-lapadula", "point-aveugle", "limite"],
      },
      {
        id: "cys-covert-defense",
        title: "Réduire le canal",
        order: 5,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesures

Puisqu'on ne peut généralement pas **supprimer** totalement un canal caché, quelle est la stratégie de défense **la plus réaliste** ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Le rendre inexploitable en écrasant son débit (bruit, latence, isolation).", cost: 30 },
          { text: "📖 Correction : réduire sa bande passante (bruit/latence/isolation/quotas) sous un seuil utile.", cost: 80 },
        ],
        options: [
          "Réduire sa bande passante (bruit délibéré, latence aléatoire, horloges imprécises, isolation, quotas fixes) jusqu'à un débit inexploitable",
          "Chiffrer le canal caché pour le sécuriser",
          "Augmenter la fréquence du processeur",
          "Publier la liste des canaux cachés sur Internet",
        ],
        answer: 0,
        explanation: `On cherche à rendre le canal **inexploitable** en **écrasant son débit** : **bruit** délibéré, **latence aléatoire**, **horloges peu précises** (contre les canaux temporels), **isolation/partitionnement** des ressources (CPU/mémoire dédiés, air gap), **quotas fixes**. Compromis inévitable avec les **performances**. Supprimer totalement un canal est souvent impossible dès qu'une ressource est **partagée**.`,
        tags: ["contre-mesures", "bande-passante", "isolation"],
      },
      {
        id: "cys-covert-bandwidth",
        title: "Un canal lent suffit",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📏 Débit

Un canal caché n'offre que quelques **bits par seconde**, très bruités. Pourquoi reste-t-il tout de même une menace sérieuse ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Que faut-il de bits pour voler une clé ou un mot de passe ?", cost: 20 },
          { text: "📖 Correction : même quelques bits/s suffisent à exfiltrer une clé/un secret en un temps raisonnable.", cost: 50 },
        ],
        options: [
          "Parce que même quelques bits/s suffisent à exfiltrer un secret court mais critique (clé, mot de passe) en un temps raisonnable",
          "Parce qu'un canal lent transfère instantanément des téraoctets",
          "Parce que le bruit augmente le débit",
          "Parce qu'un canal caché est toujours à très haut débit",
        ],
        answer: 0,
        explanation: `Un débit de **quelques bits/s** semble dérisoire, mais une **clé cryptographique** (256 bits) ou un **mot de passe** ne pèsent que quelques dizaines/centaines de bits → **exfiltrables** en un temps raisonnable. La menace ne se mesure pas au volume mais à la **valeur** du secret. D'où l'objectif défensif : réduire le débit **sous un seuil utile**.`,
        tags: ["debit", "exfiltration", "menace"],
      },
    ],
  },
];
