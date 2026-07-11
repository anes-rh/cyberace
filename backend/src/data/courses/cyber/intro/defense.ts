import type { CourseSeed } from "../../../../types";

/** Cyber · Intro — Module 4 : frameworks & contrôles de sécurité défensifs. */
export const defense: CourseSeed[] = [
  {
    slug: "cyi-defense",
    title: "Frameworks & contrôles défensifs",
    checkpoint: "cyber-intro",
    codename: "Blue Shield",
    domain: "Cybersécurité — Défense",
    theme: "grid",
    icon: "ShieldCheck",
    accent: "#9B8CCB",
    order: 4,
    difficulty: "medium",
    summary:
      "La vue du défenseur : le framework NIST (5 fonctions Identifier/Protéger/Détecter/Réagir/Reprendre), l'analyse des écarts (gap analysis), la défense en profondeur, la threat intelligence et son cycle de vie, le threat modeling et la gestion des incidents.",
    objectives: [
      "Dérouler les 5 fonctions du framework de cybersécurité NIST",
      "Comprendre l'analyse des écarts (gap analysis)",
      "Expliquer la défense en profondeur (defense in depth)",
      "Décrire la threat intelligence et les 6 phases de son cycle de vie",
      "Connaître les étapes de la gestion des incidents et le threat modeling",
    ],
    resources: [
      {
        label: "NIST — Cybersecurity Framework (CSF) officiel",
        url: "https://www.nist.gov/cyberframework",
        kind: "link",
        note: "La source officielle des fonctions Identify/Protect/Detect/Respond/Recover, avec guides et ressources.",
      },
      {
        label: "CISA — bonnes pratiques et alertes (agence US)",
        url: "https://www.cisa.gov/",
        kind: "link",
        note: "Recommandations défensives, guides de durcissement et renseignement sur les menaces.",
      },
      {
        label: "SANS — white papers & incident handling",
        url: "https://www.sans.org/white-papers/",
        kind: "link",
        note: "Bibliothèque de référence (dont l'Incident Handler's Handbook) sur la réponse à incident et la défense.",
      },
    ],
    lesson: `# 🛡️ Frameworks & contrôles défensifs — Blue Shield

Après l'attaquant, le **défenseur** (*blue team*). Comment structurer une défense complète ? Grâce à des **frameworks** qui couvrent tout le cycle : anticiper, protéger, détecter, réagir, se relever. 🏎️

---

## 1. Le framework de cybersécurité NIST 🧱

Le **NIST CSF** (*Cybersecurity Framework*) organise la sécurité en **5 fonctions** essentielles, dans l'ordre logique :

\`\`\`
 IDENTIFIER → PROTÉGER → DÉTECTER → RÉAGIR → REPRENDRE
   (Identify)  (Protect)  (Detect)  (Respond) (Recover)
\`\`\`

1. **Identifier** (*Identify*) : connaître ce qu'on protège — inventaire des **actifs**, des données, des risques, du contexte métier. « On ne protège que ce qu'on connaît. »
2. **Protéger** (*Protect*) : mettre en place les **garde-fous** — contrôle d'accès, chiffrement, sensibilisation, maintenance, protections des données.
3. **Détecter** (*Detect*) : **repérer** les événements de sécurité — surveillance continue, journalisation, détection d'anomalies (SIEM, IDS).
4. **Réagir** (*Respond*) : **agir** quand un incident survient — plan de réponse, communication, analyse, endiguement, éradication.
5. **Reprendre** (*Recover*) : **rétablir** les services et tirer les leçons — restauration, sauvegardes, amélioration continue.

> 🧭 Ces 5 fonctions forment un **cycle continu** : ce qu'on apprend en *Recover* alimente l'*Identify* suivant. Le framework n'est pas une checklist figée mais une **boussole** pour couvrir tout le spectre (avant, pendant, après l'incident).

> 💡 La version **NIST CSF 2.0** (2024) a ajouté une **6ᵉ fonction transversale : Gouverner** (*Govern*) — les rôles, politiques et gestion du risque qui chapeautent les cinq autres.

### Le SOC et les outils de la Blue Team 🖥️

La défense opérationnelle vit dans un **SOC** (*Security Operations Center*), l'équipe qui surveille **24/7**. Ses outils clés :
- **SIEM** (*Security Information and Event Management*) : centralise et **corrèle les logs** de toute l'infra pour lever des alertes (ex. Splunk, ELK, Wazuh).
- **IDS / IPS** : **détecte** (IDS) ou **bloque** (IPS) le trafic malveillant, par **signatures** (motifs connus) ou par **anomalie** (comportement inhabituel).
- **EDR / XDR** (*Endpoint / Extended Detection & Response*) : surveille finement les **postes/serveurs** (EDR) ou corrèle plusieurs sources — endpoint, réseau, mail, cloud (XDR).
- **SOAR** (*Security Orchestration, Automation & Response*) : **automatise** les réponses (playbooks) pour aller plus vite.
- **Honeypot** : leurre volontairement exposé pour **piéger et étudier** l'attaquant.

### Niveaux d'un SOC : détecter, mais bien

Toute détection produit 4 cas : **vrai positif** (alerte juste), **faux positif** (fausse alerte — le fléau du SOC), **vrai négatif** (rien, à raison), **faux négatif** (attaque **ratée** — le plus dangereux). Bien régler ses détections = **maximiser les vrais positifs** tout en limitant le **bruit** (faux positifs).

---

## 2. L'analyse des écarts (gap analysis) 📏

La **gap analysis** compare **où tu en es** (posture actuelle) à **où tu devrais être** (cible : une norme, une politique, un niveau de maturité). L'**écart** (*gap*) entre les deux définit le **plan d'action**.

\`\`\`
   État ACTUEL   ──────  ÉCART (gap)  ──────  État CIBLE
   (as-is)                                     (to-be : norme/objectif)
       └──────── plan de remédiation ────────┘
\`\`\`

Étapes : (1) définir la **cible** (référentiel, ex. NIST/ISO), (2) évaluer l'**existant**, (3) **identifier les écarts**, (4) **prioriser** et planifier la remédiation. C'est le point de départ de toute démarche de mise en conformité et d'amélioration.

---

## 3. La défense en profondeur 🧅

La **défense en profondeur** (*defense in depth*) empile **plusieurs couches** de protection, de sorte que si une couche tombe, les suivantes tiennent. Métaphore de l'**oignon** (ou du château fort avec douves, remparts, donjon) :

\`\`\`
   Politiques & sensibilisation (humain)
   └─ Sécurité physique (accès aux locaux)
      └─ Périmètre réseau (pare-feu, DMZ)
         └─ Réseau interne (segmentation, IDS/IPS)
            └─ Hôte (antivirus, durcissement, patchs)
               └─ Application (validation, WAF)
                  └─ Données (chiffrement, sauvegardes)
\`\`\`

> 🎯 Principe : **aucune couche unique n'est infaillible**. En multipliant les barrières **indépendantes**, on augmente le coût et le temps pour l'attaquant, et on multiplie les **occasions de détection**. Complète le principe du **moindre privilège** et de la **segmentation**.

### Le Zero Trust 🚫🤝

Le modèle **Zero Trust** (« ne fais confiance à rien ») renverse l'ancien réflexe du « à l'intérieur du réseau = de confiance ». Sa devise : **« never trust, always verify »**. Chaque accès est **vérifié** (identité, appareil, contexte), **à chaque fois**, où qu'il vienne. Principes :
- **Vérifier explicitement** chaque requête (pas de confiance implicite liée au réseau).
- **Moindre privilège** : donner juste les droits nécessaires, juste le temps nécessaire.
- **Supposer la compromission** (*assume breach*) : segmenter (*micro-segmentation*) pour **limiter le rayon d'explosion** d'une intrusion.

Deux principes fondateurs à ne pas confondre :
- **Moindre privilège** (*least privilege*) : chacun n'a **que** les droits utiles à sa tâche.
- **Séparation des tâches** (*separation of duties*) : une action sensible exige **plusieurs personnes** (ex. celui qui demande un paiement ≠ celui qui l'approuve) — contre la fraude.

---

## 4. La threat intelligence 🔎

La **threat intelligence** (renseignement sur les menaces) transforme des **données brutes** sur les menaces en **connaissance exploitable** pour décider. On distingue souvent :
- **Stratégique** : tendances de haut niveau pour les dirigeants (paysage des menaces).
- **Tactique** : les **TTPs** des attaquants (pour la défense).
- **Opérationnelle** : détails sur des campagnes/attaques précises.
- **Technique** : indicateurs concrets (**IoC** : IP, domaines, hashs).

### Le cycle de vie du renseignement 🔄

Un processus en **6 phases** (proche du cycle du renseignement classique) :

\`\`\`
 1. Direction (planification : quels besoins ?)
 2. Collecte (rassembler les données : sources ouvertes, feeds…)
 3. Traitement (nettoyer, normaliser, corréler)
 4. Analyse (transformer en renseignement exploitable)
 5. Diffusion (livrer aux bons destinataires)
 6. Retour (feedback → ajuster les besoins)
\`\`\`

> 🧠 Le renseignement **utile** répond à un **besoin** (phase 1) et boucle par un **retour** (phase 6) : c'est un cycle, pas une ligne droite.

### IoC vs IoA, et le partage 📡

- **IoC** (*Indicator of Compromise*) : une **preuve** qu'une compromission a **déjà eu lieu** — une IP malveillante, un hash de fichier, un domaine C2. On regarde **en arrière**.
- **IoA** (*Indicator of Attack*) : un **comportement** trahissant une attaque **en cours**, quel que soit l'outil (ex. un processus Office qui lance PowerShell). On regarde **le présent**, plus proactif.

Pour **échanger** ce renseignement entre organisations, des standards existent : **STIX** (format de description structuré des menaces), **TAXII** (protocole de transport), et des plateformes comme **MISP** (partage communautaire d'indicateurs).

---

## 5. Le threat modeling 🗺️

Le **threat modeling** (modélisation des menaces) consiste, **dès la conception** d'un système, à se demander de façon structurée : **qu'est-ce qui peut mal tourner ?** On identifie les **actifs**, les **points d'entrée**, les **menaces** possibles et les **contre-mesures**, souvent à l'aide de méthodes dédiées (ex. approche **STRIDE** : *Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege*). Objectif : **anticiper** les failles **avant** qu'elles n'existent, plutôt que de les corriger après.

---

## 6. La gestion des incidents 🚨

Un **incident de sécurité** est un événement qui compromet (ou menace) la CIA. La **gestion des incidents** (*incident handling & response*) suit des **étapes** structurées :

\`\`\`
 1. Préparation      → outils, procédures, équipe prêtes AVANT l'incident
 2. Détection & analyse → identifier et qualifier l'incident (est-ce réel ? gravité ?)
 3. Endiguement (Containment) → limiter la propagation (isoler la machine)
 4. Éradication      → supprimer la cause (malware, compte compromis)
 5. Récupération     → remettre en service proprement, surveiller
 6. Leçons apprises  → post-mortem : que faire mieux la prochaine fois ?
\`\`\`

> 🎯 La **préparation** (étape 1) est décisive : on ne s'improvise pas gestionnaire de crise **pendant** l'attaque. Et les **leçons apprises** (étape 6) bouclent vers une meilleure préparation — comme le NIST, c'est un **cycle d'amélioration continue**.

---

## 🧠 À retenir

- **NIST CSF — 5 fonctions** : **Identifier** (connaître ses actifs/risques) → **Protéger** → **Détecter** → **Réagir** → **Reprendre**. Un **cycle continu** (+ **Gouverner** en CSF 2.0).
- **SOC & outils** : **SIEM** (corrèle les logs), **IDS/IPS** (détecte/bloque), **EDR/XDR** (endpoints), **SOAR** (automatise), **honeypot** (leurre). Détection = vrai/faux positif/négatif ; le **faux négatif** (attaque ratée) est le plus dangereux.
- **Zero Trust** : « never trust, always verify » — vérifier chaque accès, **moindre privilège**, *assume breach* + micro-segmentation. À distinguer de la **séparation des tâches**.
- **Gap analysis** : comparer l'**état actuel** à l'**état cible** (norme) ; l'**écart** définit le plan de remédiation (définir cible → évaluer → identifier écarts → prioriser).
- **Défense en profondeur** : **empiler des couches indépendantes** (humain, physique, périmètre, réseau, hôte, appli, données) → aucune couche n'est infaillible seule.
- **Threat intelligence** : données → **connaissance exploitable** (stratégique/tactique/opérationnelle/technique) ; **cycle en 6 phases** : Direction, Collecte, Traitement, Analyse, Diffusion, Retour. **IoC** (compromission passée) vs **IoA** (attaque en cours) ; partage via **STIX/TAXII/MISP**.
- **Threat modeling** : anticiper « qu'est-ce qui peut mal tourner ? » **dès la conception** (ex. STRIDE).
- **Gestion des incidents** : Préparation → Détection/Analyse → **Endiguement** → Éradication → Récupération → **Leçons apprises**. La **préparation** est clé.`,
    badge: {
      id: "badge-cyi-blue-shield",
      name: "Blue Shield",
      icon: "ShieldCheck",
      description: "Structure une défense : NIST, gap analysis, defense in depth, threat intelligence et gestion d'incidents.",
    },
    challenges: [
      {
        id: "cyi-def-nist-order",
        title: "Les 5 fonctions du NIST",
        order: 1,
        difficulty: "medium",
        type: "order",
        prompt: `## 🧱 NIST CSF

Remets les **5 fonctions** du framework de cybersécurité NIST dans le bon ordre :`,
        points: 250,
        timeLimitSec: 420,
        options: [
          "Identifier (connaître ses actifs et risques)",
          "Protéger (mettre en place les garde-fous)",
          "Détecter (repérer les événements)",
          "Réagir (répondre à l'incident)",
          "Reprendre (rétablir et améliorer)",
        ],
        answer: [0, 1, 2, 3, 4],
        hints: [
          { text: "On connaît, on protège, on détecte, on réagit, on se relève.", cost: 25 },
          { text: "📖 Correction : Identifier → Protéger → Détecter → Réagir → Reprendre.", cost: 60 },
        ],
        explanation: `Ordre du **NIST CSF** : **Identifier** (« on ne protège que ce qu'on connaît ») → **Protéger** → **Détecter** → **Réagir** → **Reprendre**. C'est un **cycle** : les leçons de la reprise nourrissent l'identification suivante. Ce framework couvre tout le spectre : avant, pendant et après l'incident.`,
        tags: ["nist", "framework", "defense"],
      },
      {
        id: "cyi-def-gap",
        title: "La gap analysis",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📏 Analyse des écarts

Que compare une **analyse des écarts (gap analysis)** en sécurité ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "L'état où l'on est vs l'état où l'on devrait être.", cost: 20 },
          { text: "📖 Correction : la posture actuelle vs la cible (norme/objectif) ; l'écart = plan d'action.", cost: 50 },
        ],
        options: [
          "La posture de sécurité actuelle par rapport à un état cible (norme/objectif) ; l'écart définit le plan d'action",
          "Le nombre d'employés par rapport au nombre de serveurs",
          "La vitesse du réseau par rapport à la concurrence",
          "La taille des mots de passe uniquement",
        ],
        answer: 0,
        explanation: `La **gap analysis** compare l'**état actuel** (*as-is*) à l'**état cible** (*to-be* : une norme comme NIST/ISO, une politique). L'**écart** identifié devient le **plan de remédiation** (prioriser les actions). C'est le point de départ de toute démarche de conformité et d'amélioration.`,
        tags: ["gap-analysis", "conformite", "defense"],
      },
      {
        id: "cyi-def-depth",
        title: "Défense en profondeur",
        order: 3,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧅 Defense in depth

Quel est le principe de la **défense en profondeur** ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Comme un oignon : plusieurs couches indépendantes.", cost: 15 },
          { text: "📖 Correction : empiler plusieurs couches indépendantes de sécurité.", cost: 40 },
        ],
        options: [
          "Empiler plusieurs couches de défense indépendantes, pour que si l'une tombe, les autres tiennent",
          "Concentrer toute la sécurité sur un seul pare-feu très puissant",
          "Supprimer les journaux pour gagner de la place",
          "Donner tous les droits à tous les utilisateurs",
        ],
        answer: 0,
        explanation: `La **défense en profondeur** empile des **couches indépendantes** (humain, physique, périmètre, réseau, hôte, application, données). Si une couche est franchie, les suivantes **ralentissent** l'attaquant et **multiplient les occasions de détection**. À l'inverse, tout miser sur **un** pare-feu unique crée un **point de défaillance unique**.`,
        tags: ["defense-en-profondeur", "couches", "defense"],
      },
      {
        id: "cyi-def-incident",
        title: "Gestion des incidents",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🚨 Réponse à incident

Après avoir **détecté** un malware sur un poste, quelle est l'étape **immédiate** de la gestion d'incident pour **limiter la propagation** ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "Avant d'éradiquer, on empêche que ça se répande (isoler).", cost: 20 },
          { text: "📖 Correction : l'endiguement (containment) — isoler la machine.", cost: 50 },
        ],
        options: [
          "L'endiguement (containment) : isoler la machine pour stopper la propagation",
          "Les leçons apprises",
          "La préparation",
          "La récupération finale",
        ],
        answer: 0,
        explanation: `Après **Détection & analyse**, on passe à l'**Endiguement** (*Containment*) : **isoler** la machine (déconnexion réseau) pour **stopper la propagation**, avant d'**Éradiquer** (supprimer la cause) puis de **Récupérer**. Les **leçons apprises** viennent en dernier. La **préparation**, elle, se fait **avant** tout incident.`,
        tags: ["incident", "containment", "reponse"],
      },
      {
        id: "cyi-def-ti-cycle",
        title: "Cycle de la threat intelligence",
        order: 5,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔎 Threat intelligence

Par quelle phase **commence** le cycle de vie de la threat intelligence ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "Avant de collecter, on définit les BESOINS.", cost: 20 },
          { text: "📖 Correction : la Direction (planification des besoins).", cost: 50 },
        ],
        options: [
          "La Direction (définir les besoins / planifier ce qu'on cherche)",
          "La Diffusion (livrer le renseignement)",
          "L'Analyse",
          "Le Retour (feedback)",
        ],
        answer: 0,
        explanation: `Le cycle commence par la **Direction** (planification) : définir **quels besoins** de renseignement on a — sans besoin clair, la collecte est inutile. Suivent **Collecte → Traitement → Analyse → Diffusion → Retour**. Le **Retour** (feedback) boucle vers la Direction : c'est un **cycle**, pas une ligne droite.`,
        tags: ["threat-intelligence", "cycle", "defense"],
      },
    ],
  },
];
