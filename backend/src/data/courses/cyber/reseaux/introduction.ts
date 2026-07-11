import type { CourseSeed } from "../../../../types";

/** Cyber · Réseaux — Module 1 : introduction à la sécurité réseau (normes, risques, menaces). */
export const introduction: CourseSeed[] = [
  {
    slug: "cyr-introduction",
    title: "Introduction à la sécurité réseau",
    checkpoint: "cyber-reseaux",
    codename: "Threat Map",
    domain: "Réseaux — Fondations sécurité",
    theme: "grid",
    icon: "ShieldCheck",
    accent: "#5FB3C6",
    order: 1,
    difficulty: "easy",
    summary:
      "Le cadre : pourquoi sécuriser un réseau d'entreprise, la sécurité informatique et ses normes (ISO 17799/27000/27005), la gestion des risques (gravité × probabilité → criticité, classes acceptable/courant/majeur/inacceptable), les critères de sécurité et la classification des menaces (passives vs actives : déguisement, replay, modification, DoS).",
    objectives: [
      "Situer les enjeux de la sécurité réseau dans l'entreprise informatisée",
      "Connaître les normes ISO 17799 / 27000 / 27005 et leur rôle",
      "Évaluer un risque par gravité × probabilité et le classer (acceptable → inacceptable)",
      "Énoncer les critères de sécurité (CIA + traçabilité/authenticité/non-répudiation)",
      "Classer les menaces en passives et actives (déguisement, replay, modification, DoS)",
    ],
    resources: [
      {
        label: "ISO/IEC 27000 — panorama de la famille SMSI",
        url: "https://www.iso.org/standard/73906.html",
        kind: "link",
        note: "La norme « chapeau » qui définit le vocabulaire et l'aperçu des systèmes de management de la sécurité de l'information.",
      },
      {
        label: "ANSSI — la gestion des risques (méthode EBIOS Risk Manager)",
        url: "https://cyber.gouv.fr/la-methode-ebios-risk-manager",
        kind: "link",
        note: "Méthode française de référence pour l'appréciation et le traitement des risques de sécurité.",
      },
    ],
    lesson: `# 🗺️ Introduction à la sécurité réseau — Threat Map

Un réseau d'entreprise relie des **actifs de valeur** (données clients, propriété intellectuelle, systèmes de production) à un monde **hostile**. La sécurité réseau consiste à **protéger l'information en transit et les infrastructures** qui la transportent. Ce module pose le **cadre** : normes, risques et menaces. 🏎️

---

## 1. L'entreprise informatisée et la protection des données 🏢

L'**informatisation** a transformé chaque entreprise en un système d'information interconnecté : messagerie, ERP, bases de données, sites web, accès distants, cloud. **L'information est devenue un actif stratégique** — souvent le plus précieux. La perdre, la voir fuiter ou altérer, c'est risquer :
- des **pertes financières** directes (fraude, rançon, interruption d'activité),
- une **atteinte à la réputation** et à la confiance,
- des **conséquences légales/réglementaires** (protection des données personnelles, obligations sectorielles).

La **sécurité informatique** vise donc à **protéger ces données et les systèmes** contre les accès non autorisés, les altérations et les interruptions. La **sécurité réseau** en est le volet qui concerne les **communications** : ce qui circule entre les machines, et les équipements qui l'acheminent (routeurs, commutateurs, pare-feu).

---

## 2. Les normes de sécurité : ISO 17799 / 27000 / 27005 📚

Pour ne pas réinventer la roue, on s'appuie sur des **normes internationales**. La famille **ISO/IEC 2700x** est la référence des **SMSI** (Systèmes de Management de la Sécurité de l'Information) :

- **ISO 17799** : l'**ancêtre** — un code de bonnes pratiques de la sécurité de l'information. Il a été **renommé ISO/IEC 27002** (recueil de mesures de sécurité).
- **ISO/IEC 27000** : la norme « **chapeau** » — **vocabulaire** et **vue d'ensemble** de toute la famille.
- **ISO/IEC 27001** : la norme **certifiable** — les **exigences** d'un SMSI (comment organiser, piloter et améliorer la sécurité de façon continue, selon la boucle **PDCA** : Planifier-Déployer-Contrôler-Agir).
- **ISO/IEC 27002** : le **catalogue des mesures** (contrôles) de sécurité, thème par thème.
- **ISO/IEC 27005** : la norme dédiée à la **gestion des risques** de sécurité de l'information (méthodologie d'appréciation et de traitement).

> 🧭 À retenir la logique : **27000** définit les mots, **27001** fixe les exigences (et se certifie), **27002** liste les mesures, **27005** encadre la gestion des risques. La 17799 est l'origine historique (→ 27002).

---

## 3. La gestion des risques 🎲

On ne peut pas tout protéger de façon égale : la sécurité est une **affaire de priorités**, guidée par le **risque**.

### Évaluer un risque : gravité × probabilité

Un risque se mesure en croisant **deux dimensions** :

\`\`\`
   CRITICITÉ  =  GRAVITÉ (impact si ça arrive)  ×  PROBABILITÉ (chance que ça arrive)
\`\`\`

- **Gravité** (ou impact) : à quel point l'événement serait dommageable (perte financière, arrêt de service, fuite de données sensibles).
- **Probabilité** (ou vraisemblance) : à quel point il est **plausible** (facilité d'exploitation, exposition, historique).

On les combine dans une **matrice de risques** (souvent une grille couleur) pour obtenir un **niveau de criticité**.

### Classer les risques

Une échelle de classification typique va du plus au moins tolérable :

| Classe | Signification | Décision type |
|---|---|---|
| **Acceptable** | risque faible, tolérable en l'état | **accepter** (risque résiduel) |
| **Courant** | risque modéré, à surveiller | réduire quand c'est simple, surveiller |
| **Majeur** | risque élevé | **traiter en priorité** (mesures) |
| **Inacceptable** | risque critique, insoutenable | **traiter immédiatement** / éviter l'activité |

Face à un risque, quatre options (rappel de l'intro sécurité) : **réduire** (mesures), **transférer** (assurance), **accepter** (assumer), **éviter** (renoncer). Ce qui reste après traitement est le **risque résiduel**, à accepter consciemment.

> 🧠 Le but n'est pas le **risque zéro** (impossible) mais un **niveau de risque maîtrisé et accepté** par la direction, en cohérence avec la valeur des actifs.

---

## 4. Les critères de sécurité 🔺

Sécuriser un réseau, c'est garantir un ensemble de **propriétés** sur l'information :
- **Confidentialité** : seules les personnes autorisées accèdent à l'information (chiffrement, contrôle d'accès).
- **Intégrité** : l'information n'est pas altérée de façon non autorisée (hachage, signatures).
- **Disponibilité** : l'information et les services restent accessibles quand on en a besoin (redondance, anti-DoS).

Ces trois-là forment la **triade CIA**. On y ajoute fréquemment :
- **Authenticité** : l'origine est bien celle annoncée (authentification, certificats).
- **Non-répudiation** : l'auteur d'une action ne peut la nier (signatures, journaux).
- **Traçabilité** (*accounting/auditing*) : on garde trace de qui a fait quoi (logs).

> 🧭 Chaque attaque réseau vise **au moins un** de ces critères : une écoute casse la **confidentialité**, une falsification l'**intégrité**, un déni de service la **disponibilité**. Identifier le critère visé aide à choisir la parade.

---

## 5. La classification des menaces 🎭

Une **menace** est un danger potentiel pesant sur un actif. En sécurité réseau, on les classe d'abord en **deux grandes familles** :

### Menaces passives 👂

L'attaquant **observe sans modifier** : il ne fait qu'**écouter**. Objectif : la **confidentialité**.
- **Écoute/interception** (*eavesdropping, sniffing*) : capter le trafic qui passe.
- **Analyse de trafic** : même sans lire le contenu (chiffré), déduire des informations des **métadonnées** (qui parle à qui, quand, volume).

Elles sont **discrètes** (difficiles à détecter) mais se **préviennent** par le **chiffrement**.

### Menaces actives ⚡

L'attaquant **modifie, injecte ou perturbe** le trafic/les systèmes. Objectifs : **intégrité**, **disponibilité**, **authenticité**. Les grandes catégories (classification classique) :
- **Déguisement / mascarade** (*masquerade*) : se faire passer pour une entité légitime (usurpation d'identité, d'adresse — voir spoofing au module 2).
- **Répétition / rejeu** (*replay*) : **capturer** des messages légitimes et les **retransmettre** plus tard pour produire un effet non autorisé (ex. rejouer une authentification capturée).
- **Modification de messages** : altérer le contenu en transit (changer un montant, une destination).
- **Déni de service** (*DoS*) : rendre un service **indisponible** (saturation, épuisement de ressources).

\`\`\`
                 MENACES
                /        \\
          PASSIVES       ACTIVES
          (écouter)      (agir/modifier)
          /     \\        /    |     |      \\
    écoute   analyse  déguise replay modif  DoS
             trafic
    → confidentialité      → intégrité / disponibilité / authenticité
\`\`\`

### Sources des menaces

- **Externes** : attaquants sur Internet, concurrents, cybercriminels, États.
- **Internes** : employés (malveillants **ou** négligents), prestataires — souvent **sous-estimées** alors qu'elles disposent déjà d'un accès.

> 🧠 Distinction clé : **passif = écoute (confidentialité)**, **actif = modification/perturbation (intégrité, disponibilité, authenticité)**. Le rejeu (*replay*) est une menace **active** emblématique : les messages sont authentiques, mais **rejoués hors contexte**.

---

## 🧠 À retenir

- L'entreprise **informatisée** fait de l'**information un actif stratégique** ; la sécurité réseau protège l'information **en transit** et les **infrastructures** qui l'acheminent.
- **Normes ISO 2700x** : **27000** (vocabulaire/panorama), **27001** (exigences du SMSI, **certifiable**, boucle **PDCA**), **27002** (catalogue de mesures, ex-**17799**), **27005** (**gestion des risques**).
- **Risque** : \`Criticité = Gravité × Probabilité\`, positionné sur une **matrice**, puis **classé** : **acceptable / courant / majeur / inacceptable**. Traitement : **réduire, transférer, accepter, éviter** ; il reste le **risque résiduel**.
- **Critères de sécurité** : **CIA** (Confidentialité, Intégrité, Disponibilité) + **authenticité**, **non-répudiation**, **traçabilité**.
- **Menaces passives** = **écoute** sans modification (sniffing, analyse de trafic) → visent la **confidentialité**, parade = **chiffrement**.
- **Menaces actives** = **modification/perturbation** : **déguisement** (mascarade), **replay** (rejeu), **modification**, **DoS** → visent intégrité/disponibilité/authenticité.
- **Sources** : **externes** (Internet, cybercrime, États) et **internes** (employés malveillants ou négligents, souvent sous-estimées).`,
    badge: {
      id: "badge-cyr-threat-map",
      name: "Threat Map",
      icon: "ShieldCheck",
      description: "Maîtrise les normes ISO 2700x, la gestion des risques et la classification des menaces réseau.",
    },
    challenges: [
      {
        id: "cyr-intro-iso",
        title: "La norme des exigences",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📚 ISO 2700x

Dans la famille ISO/IEC 2700x, quelle norme fixe les **exigences** d'un Système de Management de la Sécurité de l'Information (SMSI) et sert de base à la **certification** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Ce n'est pas le vocabulaire (27000) ni le catalogue de mesures (27002).", cost: 20 },
          { text: "📖 Correction : ISO/IEC 27001.", cost: 50 },
        ],
        options: [
          "ISO/IEC 27001 (exigences, certifiable)",
          "ISO/IEC 27000 (vocabulaire)",
          "ISO/IEC 27002 (catalogue de mesures)",
          "ISO/IEC 27005 (gestion des risques)",
        ],
        answer: 0,
        explanation: `**ISO/IEC 27001** définit les **exigences** d'un SMSI et c'est la norme **certifiable** (boucle **PDCA**). La **27000** donne le vocabulaire, la **27002** (ex-**17799**) le catalogue de mesures, la **27005** la gestion des risques.`,
        tags: ["iso", "27001", "smsi"],
      },
      {
        id: "cyr-intro-risque",
        title: "Le calcul du risque",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎲 Criticité

Comment évalue-t-on classiquement la **criticité** d'un risque de sécurité ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "On croise l'impact et la vraisemblance.", cost: 10 },
          { text: "📖 Correction : gravité × probabilité.", cost: 30 },
        ],
        options: [
          "Gravité (impact) × Probabilité (vraisemblance)",
          "Nombre d'utilisateurs ÷ bande passante",
          "Uniquement le coût du pare-feu",
          "La vitesse du processeur du serveur",
        ],
        answer: 0,
        explanation: `La **criticité = gravité × probabilité** : on croise l'**impact** si l'événement survient et la **vraisemblance** qu'il survienne, positionnés sur une **matrice de risques**. On classe ensuite le risque : **acceptable / courant / majeur / inacceptable**.`,
        tags: ["risque", "criticite", "matrice"],
      },
      {
        id: "cyr-intro-passif-actif",
        title: "Passive ou active ?",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎭 Classification des menaces

Un attaquant se contente d'**écouter** discrètement le trafic réseau pour capter des informations, **sans rien modifier**. De quel type de menace s'agit-il, et quel critère de sécurité vise-t-elle ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Écouter sans modifier = ? ; capter de l'info = quel critère de la triade ?", cost: 20 },
          { text: "📖 Correction : menace passive, visant la confidentialité.", cost: 50 },
        ],
        options: [
          "Une menace passive, qui vise la confidentialité",
          "Une menace active, qui vise la disponibilité",
          "Un déni de service, qui vise l'intégrité",
          "Une mascarade, qui vise la non-répudiation",
        ],
        answer: 0,
        explanation: `Écouter **sans modifier** = **menace passive** (sniffing, analyse de trafic), qui vise la **confidentialité**. Elle est **discrète** et se prévient par le **chiffrement**. Les menaces **actives** (déguisement, replay, modification, DoS) **agissent** sur le trafic ou les systèmes.`,
        tags: ["menace-passive", "confidentialite", "ecoute"],
      },
      {
        id: "cyr-intro-replay",
        title: "L'attaque par rejeu",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔁 Menace active

Comment nomme-t-on la menace active qui consiste à **capturer des messages légitimes** puis à les **retransmettre plus tard** pour produire un effet non autorisé (ex. rejouer une séquence d'authentification interceptée) ?

*(Réponds par le terme, en français ou en anglais.)*`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "En anglais : replay. En français : rejeu / répétition.", cost: 15 },
          { text: "📖 Correction : le rejeu (replay).", cost: 40 },
        ],
        answer: "replay",
        accept: ["replay", "rejeu", "attaque par rejeu", "rejeu (replay)", "répétition", "repetition", "attaque replay"],
        caseSensitive: false,
        explanation: `Le **rejeu** (*replay*, ou répétition) capture des messages **authentiques** et les **retransmet hors contexte** pour produire un effet non voulu. C'est une menace **active** : les messages sont légitimes, mais **rejoués**. Parade : **nonces**, **horodatage**, **numéros de séquence** (fraîcheur).`,
        tags: ["replay", "menace-active", "rejeu"],
      },
      {
        id: "cyr-intro-classes",
        title: "Classer le risque",
        order: 5,
        difficulty: "medium",
        type: "order",
        prompt: `## 📊 Échelle de criticité

Classe ces niveaux de risque du **plus tolérable** au **moins tolérable** :`,
        points: 200,
        timeLimitSec: 300,
        options: [
          "Acceptable",
          "Courant",
          "Majeur",
          "Inacceptable",
        ],
        answer: [0, 1, 2, 3],
        hints: [
          { text: "Du risque qu'on assume à celui qu'on ne peut pas tolérer.", cost: 20 },
          { text: "📖 Correction : Acceptable → Courant → Majeur → Inacceptable.", cost: 50 },
        ],
        explanation: `Échelle croissante de criticité : **Acceptable** (on assume) → **Courant** (à surveiller/réduire) → **Majeur** (traiter en priorité) → **Inacceptable** (traiter immédiatement / éviter l'activité). Ce classement oriente la **décision** de traitement du risque.`,
        tags: ["classification", "risque", "criticite"],
      },
      {
        id: "cyr-intro-interne",
        title: "Les sources de menaces",
        order: 6,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🚪 Sources

Pourquoi les menaces d'origine **interne** (employés, prestataires) sont-elles souvent **sous-estimées** mais dangereuses ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Un interne dispose déjà de quelque chose qu'un attaquant externe doit d'abord obtenir.", cost: 10 },
          { text: "📖 Correction : ils disposent déjà d'un accès légitime (et peuvent être négligents ou malveillants).", cost: 30 },
        ],
        options: [
          "Parce qu'ils disposent déjà d'un accès légitime au réseau (malveillants ou simplement négligents)",
          "Parce qu'ils n'ont aucun accès au système",
          "Parce qu'ils sont toujours situés sur Internet",
          "Parce qu'une menace interne ne vise jamais les données",
        ],
        answer: 0,
        explanation: `Les menaces **internes** partent d'acteurs qui **possèdent déjà un accès** (employé, prestataire) : un externe doit d'abord franchir le périmètre, l'interne est **déjà dedans**. Elles peuvent être **malveillantes** (employé mécontent) ou involontaires (**négligence**, erreur), et sont souvent **sous-estimées** face à la menace externe visible.`,
        tags: ["menaces-internes", "sources", "insider"],
      },
    ],
  },
];
