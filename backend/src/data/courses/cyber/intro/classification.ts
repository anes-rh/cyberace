import type { CourseSeed } from "../../../../types";

/** Cyber · Intro — Module 2 : classification des attaques & hacking éthique. */
export const classification: CourseSeed[] = [
  {
    slug: "cyi-classification",
    title: "Classification des attaques & hacking éthique",
    checkpoint: "cyber-intro",
    codename: "Know Your Enemy",
    domain: "Cybersécurité — Acteurs & attaques",
    theme: "grid",
    icon: "Bug",
    accent: "#9B8CCB",
    order: 2,
    difficulty: "easy",
    summary:
      "Qui attaque, comment on classe les attaques (passives, actives, rapprochées, internes, par distribution), les types de hackers et leurs chapeaux, et ce qu'est le hacking éthique (compétences requises, rôle de l'IA).",
    objectives: [
      "Classer les attaques : passives, actives, rapprochées, internes, par distribution",
      "Définir ce qu'est un hacker et distinguer les types (chapeaux blanc/noir/gris…)",
      "Comprendre le hacking éthique, son cadre légal et ses objectifs",
      "Citer les compétences techniques et non techniques d'un hacker éthique",
      "Saisir le rôle de l'IA/ML dans le hacking éthique moderne",
    ],
    lesson: `# 🐛 Classification des attaques & hacking éthique — Know Your Enemy

« Connais ton ennemi. » On classe d'abord **les attaques**, puis on identifie **les acteurs**, et enfin on découvre le métier de **hacker éthique** : celui qui attaque… pour défendre. 🏎️

---

## 1. Les catégories d'attaques 🎯

On classe les attaques selon **comment** l'attaquant interagit avec la cible :

- **Attaques passives** : l'attaquant **observe sans modifier** — il **intercepte** le trafic, écoute (*sniffing*), analyse. Discrètes et **difficiles à détecter** (rien n'est altéré). Exemples : écoute de trafic non chiffré, capture de mots de passe en clair, analyse du trafic (*traffic analysis*).
- **Attaques actives** : l'attaquant **modifie/perturbe** — il altère des données, injecte du trafic, usurpe une identité, lance un déni de service. Plus **détectables** mais plus destructrices. Exemples : DoS/DDoS, *man-in-the-middle* avec modification, injection SQL, usurpation (*spoofing*).
- **Attaques rapprochées** (*close-in*) : l'attaquant agit **physiquement proche** de la cible. Exemples : *shoulder surfing* (regarder par-dessus l'épaule), *dumpster diving* (fouille des poubelles), branchement d'une clé USB piégée, écoute physique.
- **Attaques internes** (*insider*) : menées par une personne **de l'intérieur** (employé, prestataire) disposant déjà d'un **accès légitime**. Parmi les plus dangereuses (contourne le périmètre). Exemples : vol de données par un salarié, sabotage, abus de privilèges.
- **Attaques par distribution** (*distribution*, ou *supply-chain*) : l'attaquant **piège en amont** le matériel ou le logiciel **avant** qu'il n'arrive chez la victime — porte dérobée insérée en usine, dépôt logiciel compromis, mise à jour vérolée. Exemples : backdoor matérielle, bibliothèque open-source compromise.

> 🧭 Une même campagne combine souvent plusieurs catégories : une **reconnaissance passive** prépare une **attaque active**, parfois facilitée par un **insider**.

---

## 2. Qui est un « hacker » ? 👤

Un **hacker** est une personne dotée de **compétences techniques poussées** qui explore, comprend et **contourne** le fonctionnement des systèmes. Le mot n'est **pas** intrinsèquement négatif : tout dépend de **l'intention** et de la **légalité**. D'où la métaphore des **chapeaux** :

| Type | Chapeau | Intention |
|---|---|---|
| **White Hat** | blanc | **éthique et légal** : teste avec autorisation pour défendre (pentester, chercheur) |
| **Black Hat** | noir | **malveillant et illégal** : nuit, vole, extorque |
| **Grey Hat** | gris | **entre les deux** : agit parfois sans autorisation, mais sans intention claire de nuire |
| **Script Kiddie** | — | novice qui utilise des **outils tout faits** sans réelle expertise |
| **Hacktiviste** | — | motivé par une **cause** politique/idéologique |
| **State-sponsored** | — | soutenu par un **État** (espionnage, sabotage — voir APT) |
| **Cyberterroriste** | — | vise à créer la **peur** / déstabiliser massivement |
| **Suicide Hacker** | — | prêt à **se faire prendre** pour atteindre son but (peu importe les conséquences) |

> ⚠️ Différence clé : un **white hat** agit **toujours avec autorisation écrite** ; un **grey hat** peut agir sans permission (donc dans l'illégalité même sans mauvaise intention) ; un **black hat** est malveillant.

### Les motivations des attaquants 💰

Comprendre **pourquoi** on attaque aide à anticiper. Grandes motivations :
- **Financière** : rançon (*ransomware*), vol de données bancaires, fraude — la plus répandue.
- **Espionnage** : voler des secrets industriels ou d'État (*cyber-espionnage*).
- **Idéologique / politique** : hacktivisme, déstabilisation.
- **Vengeance / rancune** : souvent le fait d'**insiders** mécontents.
- **Notoriété / défi** : prouver sa compétence, « pour la gloire ».
- **Sabotage** : détruire ou paralyser (infrastructures critiques).

### Les APT (menaces persistantes avancées) 🎯

Une **APT** (*Advanced Persistent Threat*) est un attaquant **sophistiqué**, souvent **soutenu par un État** ou fortement financé, qui vise une cible **précise** et y reste **caché longtemps** (mois, années) :
- **Advanced** : techniques pointues, parfois des failles **0-day** (inconnues de l'éditeur).
- **Persistent** : discrétion et présence durable (objectif d'espionnage/sabotage, pas un coup rapide).
- **Threat** : acteur humain organisé, avec des moyens et des objectifs clairs.

Les groupes APT sont catalogués (ex. dans **MITRE ATT&CK — Groups**) avec leurs secteurs cibles et leurs **TTPs** (techniques, tactiques, procédures).

---

## 3. Le hacking éthique 🎩✅

Le **hacking éthique** (*ethical hacking*) consiste à utiliser **les mêmes techniques que les attaquants**, mais **légalement et avec autorisation**, pour **trouver et corriger** les failles **avant** les vrais attaquants. On l'appelle aussi **test d'intrusion** (*penetration testing*).

**Ce qui rend un hacking « éthique » :**
- **Autorisation écrite** du propriétaire (contrat, *scope* défini) — sans elle, c'est un délit.
- **Périmètre (scope)** clairement délimité : ce qu'on a le droit de tester, et ce qui est interdit.
- **Confidentialité** des découvertes et **rapport** remis au client.
- **Ne pas nuire** : ne pas détruire de données, minimiser l'impact.

**Objectifs :** évaluer la posture de sécurité, identifier les vulnérabilités, tester les défenses (détection/réaction), aider à la mise en conformité, sensibiliser.

**Les 3 types de test selon la connaissance donnée :**
- **Black box** (boîte noire) : le testeur ne sait **rien** de la cible — il part de zéro, comme un attaquant externe. Réaliste mais long.
- **White box** (boîte blanche) : le testeur a **tout** (code source, schémas, comptes). Test exhaustif et rapide (audit en profondeur).
- **Grey box** (boîte grise) : le testeur a un **accès partiel** (ex. un compte utilisateur). Bon compromis, simule un attaquant qui a déjà un pied dans la place.

**Les couleurs d'équipes :**
- **Red Team** : l'**attaque** — simule un adversaire réel pour tester les défenses.
- **Blue Team** : la **défense** — détecte, répond, protège (SOC, analystes).
- **Purple Team** : fait **collaborer** rouge et bleu pour améliorer défense et détection ensemble.

**Bug bounty & divulgation responsable :** un **bug bounty** est un programme où une organisation **récompense** les chercheurs qui trouvent et **signalent** des failles (HackerOne, Bug Bounty…). La **divulgation responsable** (*responsible disclosure*) = prévenir l'éditeur **en privé** et lui laisser le temps de corriger **avant** toute publication.

> 🧠 Le hacking éthique reproduit l'**état d'esprit de l'attaquant** (*think like an attacker*) mais dans un **cadre légal strict**. La seule différence avec un black hat, c'est l'**autorisation** et l'**intention**.

---

## 4. Les compétences d'un hacker éthique 🧰

Un bon hacker éthique combine des compétences **techniques** et **non techniques** :

**Techniques :**
- Excellente connaissance des **systèmes d'exploitation** (Windows, Linux, macOS) et de leur administration.
- Solides bases **réseau** (TCP/IP, protocoles, ports, pare-feu, routage).
- **Programmation/scripting** (Python, Bash, PowerShell…) pour automatiser et écrire des exploits.
- Maîtrise des **outils de sécurité** (scanners, frameworks d'exploitation, analyseurs).
- Compréhension de la **cryptographie**, des **applications web**, des **bases de données**, du **cloud**.

**Non techniques :**
- **Curiosité** et capacité d'**apprentissage continu** (le domaine évolue en permanence).
- **Résolution de problèmes** et **persévérance**.
- **Éthique** et respect de la **loi** et de la **confidentialité**.
- **Communication** : savoir rédiger un **rapport** clair et le présenter à des non-experts.

---

## 5. Le rôle de l'IA dans le hacking éthique 🤖

L'**intelligence artificielle** et le **machine learning** transforment le métier, des deux côtés :

**Pour le défenseur / hacker éthique :**
- **Automatiser** la reconnaissance et le scan (analyse rapide de grandes surfaces).
- **Détecter des anomalies** dans d'énormes volumes de logs (comportements suspects).
- **Prioriser** les vulnérabilités selon le risque réel.
- **Générer** des charges de test, du code, des rapports (assistants IA).

**Côté attaquant :**
- **Phishing** hyper-crédible (textes générés, *deepfakes* audio/vidéo).
- **Malwares polymorphes** qui s'adaptent pour échapper à la détection.
- Découverte **automatisée** de vulnérabilités.

> ⚖️ L'IA est un **amplificateur** : elle accélère l'attaque **et** la défense. Elle ne remplace pas le jugement humain — l'analyse critique, l'éthique et la décision restent au cœur du métier.

---

## 🧠 À retenir

- **Attaques** : **passives** (observer sans modifier, discrètes), **actives** (modifier/perturber, détectables), **rapprochées** (proximité physique : shoulder surfing, dumpster diving), **internes** (insider, accès légitime), **par distribution** (piéger le matériel/logiciel en amont).
- Un **hacker** = compétences ; l'**intention** définit le chapeau : **white** (légal, autorisé), **black** (malveillant), **grey** (sans autorisation mais pas malveillant), + script kiddie, hacktiviste, étatique, cyberterroriste, suicide hacker.
- **Motivations** : financière (n°1), espionnage, idéologie, vengeance, notoriété, sabotage. Une **APT** = attaquant sophistiqué, souvent étatique, **persistant** et **discret** sur une cible précise.
- **Hacking éthique** = mêmes techniques que l'attaquant, mais **autorisation écrite + scope + confidentialité + ne pas nuire**. Aussi appelé **pentest**.
- **Types de pentest** : **black box** (aucune info), **white box** (tout), **grey box** (partiel). **Équipes** : **Red** (attaque), **Blue** (défense), **Purple** (collaboration). **Bug bounty** + **divulgation responsable** = signaler en privé avant publication.
- Compétences : **OS, réseau, programmation, outils, crypto/web/BDD/cloud** (techniques) + **curiosité, éthique, communication** (non techniques).
- L'**IA/ML** amplifie **attaque et défense** (automatisation, détection d'anomalies, phishing/deepfakes) mais ne remplace pas le **jugement humain**.`,
    badge: {
      id: "badge-cyi-know-your-enemy",
      name: "Know Your Enemy",
      icon: "Bug",
      description: "Classe les attaques, distingue les types de hackers et comprend le cadre du hacking éthique.",
    },
    challenges: [
      {
        id: "cyi-class-passive",
        title: "Passive ou active ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎯 Catégorie d'attaque

Un attaquant **écoute discrètement** le trafic réseau non chiffré pour capturer des mots de passe, **sans rien modifier**. De quelle catégorie s'agit-il ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Il observe sans altérer → difficile à détecter.", cost: 10 },
          { text: "📖 Correction : attaque passive (interception/écoute, sans modification).", cost: 30 },
        ],
        options: [
          "Une attaque passive",
          "Une attaque active",
          "Une attaque par distribution",
          "Une attaque interne",
        ],
        answer: 0,
        explanation: `Écouter **sans modifier** = **attaque passive** : discrète et **difficile à détecter** (rien n'est altéré). Si l'attaquant **injectait** du trafic ou **modifiait** des données, ce serait **actif**. Le chiffrement est la meilleure parade contre l'écoute passive.`,
        tags: ["attaques", "passive", "sniffing"],
      },
      {
        id: "cyi-class-supply",
        title: "Piéger en amont",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📦 Distribution / supply chain

Une porte dérobée est insérée dans une bibliothèque logicielle **avant** qu'elle ne soit installée par des milliers de victimes. Quelle catégorie ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "L'attaque frappe la chaîne d'approvisionnement, en amont.", cost: 15 },
          { text: "📖 Correction : attaque par distribution (supply-chain).", cost: 40 },
        ],
        options: [
          "Une attaque par distribution (supply-chain)",
          "Une attaque rapprochée",
          "Une attaque passive",
          "Un shoulder surfing",
        ],
        answer: 0,
        explanation: `Piéger un logiciel/matériel **avant** sa livraison = **attaque par distribution** (*supply-chain*). Elle est redoutable car elle **contourne** les défenses de la victime : le composant compromis est installé « en confiance ». Le *shoulder surfing* et le *dumpster diving* sont, eux, des attaques **rapprochées** (proximité physique).`,
        tags: ["attaques", "supply-chain", "distribution"],
      },
      {
        id: "cyi-class-greyhat",
        title: "Le chapeau gris",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎩 Types de hackers

Une personne teste la sécurité d'un site **sans autorisation** mais **sans intention de nuire**, puis signale les failles. Quel type de hacker ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Ni totalement légal (pas d'autorisation), ni malveillant.", cost: 15 },
          { text: "📖 Correction : grey hat (agit sans autorisation, donc illégalement, mais sans intention de nuire).", cost: 40 },
        ],
        options: [
          "Grey hat (chapeau gris)",
          "White hat (chapeau blanc)",
          "Black hat (chapeau noir)",
          "Script kiddie",
        ],
        answer: 0,
        explanation: `**Sans autorisation** mais **sans intention malveillante** = **grey hat**. ⚠️ Même sans mauvaise intention, agir sans autorisation reste **illégal**. Un **white hat** aurait obtenu une **autorisation écrite** d'abord ; un **black hat** aurait exploité les failles à des fins malveillantes.`,
        tags: ["hackers", "grey-hat", "chapeaux"],
      },
      {
        id: "cyi-class-ethical",
        title: "Ce qui rend un test « éthique »",
        order: 4,
        difficulty: "medium",
        type: "multi",
        prompt: `## 🎩 Hacking éthique

Coche **tout** ce qui distingue un hacking **éthique** d'une attaque malveillante :`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "Une autorisation écrite du propriétaire",
          "Un périmètre (scope) clairement défini",
          "La confidentialité des découvertes et un rapport remis au client",
          "L'utilisation d'outils que les attaquants n'utilisent jamais",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Le hacker éthique utilise les MÊMES outils/techniques que l'attaquant.", cost: 20 },
          { text: "📖 Correction : autorisation + scope + confidentialité/rapport. Les outils sont les mêmes.", cost: 50 },
        ],
        explanation: `Un hacking éthique se définit par le **cadre**, pas par les outils : **autorisation écrite**, **scope** délimité, **confidentialité** et **rapport**, et l'engagement de **ne pas nuire**. Il utilise **exactement les mêmes techniques et outils** que les attaquants — c'est même l'intérêt (simuler un vrai adversaire). La seule différence : la **légalité** et l'**intention**.`,
        tags: ["hacking-ethique", "pentest", "autorisation"],
      },
      {
        id: "cyi-class-ia",
        title: "L'IA, amplificateur",
        order: 5,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🤖 IA en cybersécurité

Quelle affirmation décrit le mieux le rôle de l'**IA/ML** en cybersécurité ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "L'IA sert aux deux camps et ne remplace pas l'humain.", cost: 15 },
          { text: "📖 Correction : l'IA amplifie attaque ET défense, sans remplacer le jugement humain.", cost: 40 },
        ],
        options: [
          "Elle amplifie à la fois l'attaque et la défense, sans remplacer le jugement humain",
          "Elle ne sert qu'aux attaquants",
          "Elle rend la cybersécurité inutile",
          "Elle n'a aucun usage réel en sécurité",
        ],
        answer: 0,
        explanation: `L'**IA/ML** est un **amplificateur** des deux côtés : côté **défense** (automatiser scan/reconnaissance, détecter des anomalies dans les logs, prioriser les vulnérabilités), côté **attaque** (phishing crédible, deepfakes, malwares adaptatifs). Elle **accélère** mais ne remplace pas l'**analyse critique**, l'**éthique** et la **décision** humaines.`,
        tags: ["ia", "ml", "cybersecurite"],
      },
    ],
  },
];
