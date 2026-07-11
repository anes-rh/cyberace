import type { CourseSeed } from "../../../../types";

/** Cyber · Intro — Module 3 : méthodologies & frameworks d'attaque. */
export const methodologies: CourseSeed[] = [
  {
    slug: "cyi-methodologies",
    title: "Méthodologies & frameworks d'attaque",
    checkpoint: "cyber-intro",
    codename: "Kill Chain",
    domain: "Cybersécurité — Modèles d'attaque",
    theme: "grid",
    icon: "Route",
    accent: "#9B8CCB",
    order: 3,
    difficulty: "medium",
    summary:
      "Les modèles qui décrivent le déroulé d'une attaque : la Cyber Kill Chain (7 étapes), le framework MITRE ATT&CK (tactiques/techniques), le Diamond Model of Intrusion Analysis, et la notion de TTPs (tactiques, techniques, procédures).",
    objectives: [
      "Dérouler les 7 étapes de la Cyber Kill Chain",
      "Comprendre la structure du framework MITRE ATT&CK (tactiques → techniques)",
      "Analyser une intrusion avec le Diamond Model (4 sommets)",
      "Définir les TTPs et leur utilité en threat intelligence",
      "Situer où la défense peut interrompre la chaîne d'attaque",
    ],
    lesson: `# 🔗 Méthodologies & frameworks d'attaque — Kill Chain

Une attaque n'est pas un événement unique : c'est une **suite d'étapes**. Les décrire permet de **détecter tôt** et d'**interrompre** l'attaquant. Trois modèles de référence + la notion de **TTPs**. 🏎️

---

## 1. La Cyber Kill Chain 🪖

Inspirée du militaire, la **Cyber Kill Chain** décompose une attaque ciblée en **7 étapes séquentielles** :

\`\`\`
 1. Reconnaissance   → collecter des infos sur la cible
 2. Weaponization    → préparer l'arme (exploit + payload)
 3. Delivery         → livrer l'arme (email, USB, site piégé)
 4. Exploitation     → déclencher la vulnérabilité
 5. Installation     → installer un accès persistant (backdoor)
 6. Command & Control (C2) → l'attaquant pilote la machine à distance
 7. Actions on Objectives → atteindre le but (voler, chiffrer, détruire)
\`\`\`

- **Reconnaissance** : footprinting, OSINT, scan — repérer la cible et ses faiblesses.
- **Weaponization** (*armement*) : coupler un **exploit** à un **payload** (ex. un PDF piégé).
- **Delivery** (*livraison*) : acheminer l'arme — phishing, clé USB, *drive-by download*.
- **Exploitation** : le code s'exécute en exploitant la faille.
- **Installation** : dépôt d'une **porte dérobée** / d'un implant pour rester.
- **Command & Control (C2)** : canal vers le serveur de l'attaquant pour **piloter** l'hôte compromis.
- **Actions on Objectives** : exfiltration, chiffrement (ransomware), sabotage, mouvement latéral.

> 🎯 **Idée clé (défense)** : **plus on interrompt tôt, mieux c'est**. Bloquer la *Delivery* (filtrage email) évite tout le reste. Détecter le *C2* (trafic sortant anormal) permet d'agir avant les *Actions on Objectives*. Chaque maillon est une **opportunité de défense**.

---

## 2. MITRE ATT&CK 🗂️

**ATT&CK** (*Adversarial Tactics, Techniques & Common Knowledge*) est une **base de connaissances** mondiale, très détaillée, du comportement réel des attaquants. Sa structure :

- **Tactiques** = le **« pourquoi »**, l'objectif d'une étape (ex. *Initial Access*, *Persistence*, *Privilege Escalation*, *Defense Evasion*, *Credential Access*, *Lateral Movement*, *Exfiltration*, *Impact*…). Ce sont les **colonnes** de la matrice.
- **Techniques** = le **« comment »**, la façon d'atteindre une tactique (ex. *Phishing*, *Valid Accounts*, *Pass-the-Hash*…). Chaque technique a un **identifiant** (ex. T1566 pour le Phishing) et des **sous-techniques**.
- **Procédures** = les **implémentations concrètes** observées d'une technique par un groupe donné.

\`\`\`
   TACTIQUE (colonne : le but)      →  TECHNIQUE (comment)      →  PROCÉDURE (mise en œuvre réelle)
   Initial Access                       Phishing (T1566)            « groupe X envoie un .docx piégé »
   Persistence                          Registry Run Keys           …
\`\`\`

> 🧠 ATT&CK est plus **granulaire** que la Kill Chain : là où la Kill Chain donne 7 grandes étapes **linéaires**, ATT&CK cartographie **des dizaines de techniques** par tactique, sans ordre imposé. On l'utilise pour **classer** les attaques, **évaluer sa couverture** défensive et **partager** du renseignement.

---

## 3. Le Diamond Model of Intrusion Analysis 💎

Le **Diamond Model** analyse **chaque événement d'intrusion** autour de **4 sommets** reliés :

\`\`\`
              Adversaire
                  ▲
                 /│\\
                / │ \\
    Infrastructure│  Capacité
                \\ │ /
                 \\│/
                  ▼
               Victime
\`\`\`

- **Adversaire** (*Adversary*) : **qui** attaque (l'acteur/groupe).
- **Capacité** (*Capability*) : **avec quoi** — les outils, malwares, exploits (ses TTPs).
- **Infrastructure** : **d'où / par quoi** — serveurs C2, domaines, adresses IP utilisés.
- **Victime** (*Victim*) : **contre qui** — la cible, ses actifs.

Les 4 sommets sont **liés** : connaître l'infrastructure peut révéler l'adversaire ; identifier une capacité aide à détecter d'autres victimes. C'est un outil d'**analyse et de corrélation** en investigation.

---

## 4. Les TTPs 🧬

**TTPs** = **Tactiques, Techniques et Procédures** — la description du **mode opératoire** d'un attaquant :

- **Tactiques** : les **objectifs** de haut niveau (le « pourquoi »).
- **Techniques** : les **méthodes générales** pour y parvenir (le « comment »).
- **Procédures** : les **étapes précises et outils** réellement employés (le « comment exactement »).

> 🎯 Les **TTPs** sont au cœur de la **threat intelligence** : ils décrivent le **comportement** d'un adversaire, bien plus **stable** que de simples indicateurs techniques (une IP ou un hash changent vite ; une **façon d'opérer** persiste). Reconnaître les TTPs d'un groupe permet de l'**identifier** et d'**anticiper** ses prochains mouvements. (À rapprocher de la « **pyramide de la douleur** » : plus on détecte haut — les TTPs — plus on **fait mal** à l'attaquant, car il doit tout changer.)

---

## 🧠 À retenir

- **Cyber Kill Chain (7 étapes)** : Reconnaissance → Weaponization → Delivery → Exploitation → Installation → **C2** → Actions on Objectives. **Interrompre tôt = gagner** ; chaque maillon est une opportunité de défense.
- **MITRE ATT&CK** : base de connaissances du comportement réel des attaquants. **Tactiques** (le « pourquoi », colonnes) → **Techniques** (le « comment », avec ID comme T1566) → **Procédures** (mises en œuvre). Plus **granulaire** et non linéaire que la Kill Chain.
- **Diamond Model** : 4 sommets liés — **Adversaire, Capacité, Infrastructure, Victime** — pour analyser/corréler une intrusion.
- **TTPs** = Tactiques, Techniques, Procédures = le **mode opératoire** ; base de la **threat intelligence**, plus stable qu'une IP/un hash.`,
    badge: {
      id: "badge-cyi-kill-chain",
      name: "Kill Chain",
      icon: "Route",
      description: "Déroule la Cyber Kill Chain, lit la matrice MITRE ATT&CK et le Diamond Model, comprend les TTPs.",
    },
    challenges: [
      {
        id: "cyi-meth-killchain-order",
        title: "L'ordre de la Kill Chain",
        order: 1,
        difficulty: "medium",
        type: "order",
        prompt: `## 🪖 Cyber Kill Chain

Remets ces étapes de la Cyber Kill Chain dans le **bon ordre** :`,
        points: 250,
        timeLimitSec: 420,
        options: [
          "Reconnaissance (collecte d'informations)",
          "Delivery (livraison de l'arme)",
          "Exploitation (déclenchement de la faille)",
          "Command & Control (pilotage à distance)",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "On collecte, on livre, on exploite, puis on pilote.", cost: 25 },
          { text: "📖 Correction : Reconnaissance → Delivery → Exploitation → C2.", cost: 60 },
        ],
        explanation: `Ordre (extrait des 7 étapes) : **Reconnaissance** (repérer) → *Weaponization* → **Delivery** (livrer l'arme) → **Exploitation** (déclencher la faille) → *Installation* → **Command & Control** (piloter) → *Actions on Objectives*. Plus la défense **interrompt tôt** (ex. bloquer la *Delivery* par filtrage email), plus elle empêche toute la suite.`,
        tags: ["kill-chain", "methodologie", "attaque"],
      },
      {
        id: "cyi-meth-attack-tactic",
        title: "Tactique vs technique",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🗂️ MITRE ATT&CK

Dans MITRE ATT&CK, que représente une **tactique** (par opposition à une technique) ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "Tactique = le but (« pourquoi ») ; technique = le moyen (« comment »).", cost: 20 },
          { text: "📖 Correction : la tactique est l'objectif d'une étape (le « pourquoi »).", cost: 50 },
        ],
        options: [
          "L'objectif d'une étape de l'attaque (le « pourquoi »), ex. Persistence ou Exfiltration",
          "Un outil logiciel précis téléchargé par l'attaquant",
          "L'adresse IP du serveur de commande",
          "Le nom de la victime",
        ],
        answer: 0,
        explanation: `Une **tactique** = l'**objectif** d'une étape (le « **pourquoi** ») : *Initial Access*, *Persistence*, *Privilege Escalation*, *Exfiltration*… Ce sont les **colonnes** de la matrice. La **technique** (le « **comment** », ex. *Phishing* T1566) et la **procédure** (la mise en œuvre concrète) répondent à « comment » et « comment exactement ». L'IP relèverait de l'**infrastructure** (Diamond Model).`,
        tags: ["mitre", "att&ck", "tactiques"],
      },
      {
        id: "cyi-meth-diamond",
        title: "Les sommets du Diamond Model",
        order: 3,
        difficulty: "medium",
        type: "multi",
        prompt: `## 💎 Diamond Model

Coche les **4 sommets** du Diamond Model of Intrusion Analysis :`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "Adversaire",
          "Capacité",
          "Infrastructure",
          "Victime",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "Qui attaque, avec quoi, par quelle infrastructure, contre qui.", cost: 20 },
          { text: "📖 Correction : Adversaire, Capacité, Infrastructure, Victime (les 4).", cost: 50 },
        ],
        explanation: `Le **Diamond Model** relie **4 sommets** : **Adversaire** (qui), **Capacité** (avec quoi : outils/malwares), **Infrastructure** (par quoi : C2, domaines, IP), **Victime** (contre qui). Les sommets sont **liés** : découvrir l'un aide à révéler les autres (ex. une infrastructure connue trahit l'adversaire). Outil clé de l'**analyse d'intrusion**.`,
        tags: ["diamond-model", "intrusion", "analyse"],
      },
      {
        id: "cyi-meth-ttps",
        title: "Pourquoi les TTPs comptent",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🧬 TTPs

Pourquoi, en threat intelligence, les **TTPs** d'un attaquant sont-ils plus précieux qu'une simple adresse IP ou un hash de malware ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Une IP/un hash changent facilement ; une façon d'opérer, beaucoup moins.", cost: 25 },
          { text: "📖 Correction : les TTPs décrivent le comportement, bien plus stable que des indicateurs techniques faciles à changer.", cost: 60 },
        ],
        options: [
          "Les TTPs décrivent le comportement (mode opératoire), bien plus stable qu'une IP ou un hash qui changent facilement",
          "Une IP est impossible à obtenir",
          "Les TTPs sont plus faciles à changer qu'un hash",
          "Un hash identifie toujours l'attaquant de façon définitive",
        ],
        answer: 0,
        explanation: `Une **IP** ou un **hash** sont des indicateurs **volatils** : l'attaquant les change en quelques minutes. Les **TTPs** (Tactiques, Techniques, Procédures) décrivent sa **manière d'opérer** — bien plus **coûteuse à modifier** pour lui. Détecter les TTPs, c'est frapper haut dans la « pyramide de la douleur » : on oblige l'adversaire à **repenser toute sa méthode**, pas juste à changer d'IP.`,
        tags: ["ttps", "threat-intelligence", "comportement"],
      },
    ],
  },
];
