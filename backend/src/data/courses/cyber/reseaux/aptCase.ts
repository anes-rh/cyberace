import type { CourseSeed } from "../../../../types";

/** Cyber · Réseaux — Module 10 : étude de cas APT (SCADA/OT) via Kill Chain / MITRE ATT&CK. */
export const aptCase: CourseSeed[] = [
  {
    slug: "cyr-apt-case",
    title: "Étude de cas : anatomie d'une attaque APT",
    checkpoint: "cyber-reseaux",
    codename: "Kill Chain",
    domain: "Réseaux — Étude de cas",
    theme: "grid",
    icon: "Crosshair",
    accent: "#5FB3C6",
    order: 10,
    difficulty: "insane",
    summary:
      "Analyse théorique d'une attaque APT sur une infrastructure critique (SCADA/OT) : reconstitution de la chaîne d'attaque via la Cyber Kill Chain de Lockheed Martin, mapping de chaque étape sur MITRE ATT&CK (Enterprise + ICS), lecture d'une chronologie d'alertes et identification des points de rupture défensifs.",
    objectives: [
      "Reconstituer une attaque APT étape par étape avec la Cyber Kill Chain",
      "Associer chaque phase à ses techniques MITRE ATT&CK (Enterprise et ICS)",
      "Comprendre le passage du réseau IT au réseau OT/SCADA",
      "Lire une chronologie d'alertes et identifier les signaux faibles",
      "Situer les points de rupture (où la défense aurait pu casser la chaîne)",
    ],
    resources: [
      {
        label: "Lockheed Martin — Cyber Kill Chain",
        url: "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html",
        kind: "link",
        note: "Le modèle en 7 étapes d'une intrusion ciblée, référence de l'analyse de chaîne d'attaque.",
      },
      {
        label: "MITRE ATT&CK for ICS — infrastructures industrielles",
        url: "https://attack.mitre.org/matrices/ics/",
        kind: "link",
        note: "La matrice ATT&CK dédiée aux systèmes de contrôle industriels (SCADA/OT).",
      },
    ],
    lesson: `# 🎯 Étude de cas : anatomie d'une attaque APT — Kill Chain

Les modules précédents ont décortiqué les briques de défense. Ici, on **inverse la perspective** : on suit une **APT** (*Advanced Persistent Threat*) — un attaquant **sophistiqué et persistant**, souvent étatique — qui vise une **infrastructure critique** (un site industriel piloté par **SCADA/OT**). L'objectif est **d'analyser la chaîne d'attaque** (pas de la reproduire), phase par phase, avec les **modèles Kill Chain et MITRE ATT&CK**. 🏎️

---

## 1. Le contexte : IT vs OT 🏭

Une infrastructure industrielle mélange **deux mondes** :
- **IT** (*Information Technology*) : bureautique, messagerie, serveurs, Active Directory — le SI « classique ».
- **OT** (*Operational Technology*) : le **procédé physique** — **automates (PLC)**, **SCADA** (*Supervisory Control and Data Acquisition*), **IHM/HMI** (interfaces de supervision), capteurs et actionneurs qui pilotent vannes, pompes, turbines.

Le réseau **OT** devrait être **isolé** de l'IT et d'Internet (modèle **Purdue**, zones et conduits). En pratique, des **passerelles** IT↔OT existent (supervision, maintenance) et deviennent la **cible** : compromettre l'IT pour **rebondir** vers l'OT et **agir sur le monde physique** (arrêt de production, sabotage, danger). C'est le schéma d'attaques réelles marquantes contre l'industrie et l'énergie.

> ⚠️ Enjeu propre à l'OT : une attaque n'y menace pas seulement des **données**, mais la **sûreté physique** (sécurité des personnes, environnement). La **disponibilité** et l'**intégrité** du procédé priment.

---

## 2. Le modèle d'analyse : la Cyber Kill Chain 🪖

La **Cyber Kill Chain** (Lockheed Martin) décompose une intrusion ciblée en **7 étapes** successives. L'idée défensive : **plus on interrompt tôt, plus on empêche toute la suite.**

\`\`\`
   1. Reconnaissance      → repérer la cible
   2. Weaponization       → préparer l'arme (ex. document piégé)
   3. Delivery            → livrer l'arme (ex. e-mail de spearphishing)
   4. Exploitation        → déclencher la faille
   5. Installation        → s'installer (persistance)
   6. Command & Control   → piloter à distance (C2)
   7. Actions on Objectives → atteindre le but (ici : agir sur l'OT)
\`\`\`

En complément, **MITRE ATT&CK** fournit un **catalogue de techniques** (avec des **identifiants Txxxx**) observées dans la réalité, décliné en **Enterprise** (IT) et **ICS** (industriel). On **mappe** chaque étape de la Kill Chain sur les techniques ATT&CK correspondantes.

---

## 3. Chronologie de l'attaque (analyse) 🕰️

Voici la reconstitution d'un scénario type, avec les **alertes** qui auraient dû être remarquées à chaque étape.

### Étape 1 — Reconnaissance  *(J-30)*
L'attaquant collecte des informations : organigramme, adresses e-mail des **ingénieurs de maintenance**, technologies utilisées (via offres d'emploi, réseaux sociaux, fuites), équipements exposés sur Internet.
- **ATT&CK** : *T1589 Gather Victim Identity Information*, *T1590 Gather Victim Network Information*, *T1598 Phishing for Information*.
- **Signal faible** : pics de consultation de profils, requêtes OSINT ciblées (souvent invisibles côté victime).

### Étape 2 — Weaponization  *(J-14)*
Il prépare un **document bureautique piégé** (macro malveillante) couplé à un **implant** (porte dérobée) et une infrastructure de **C2**.
- **ATT&CK** : *T1587 Develop Capabilities*, *T1588 Obtain Capabilities* (phase de préparation, hors du SI de la victime).
- **Signal faible** : aucun côté victime (se passe chez l'attaquant).

### Étape 3 — Delivery  *(J0, 08:12)*
Un **e-mail de spearphishing** ciblé est envoyé à un ingénieur, avec une pièce jointe (« procédure de maintenance urgente »).
- **ATT&CK** : *T1566.001 Spearphishing Attachment*.
- **Alerte** : la passerelle de messagerie signale une pièce jointe à macro provenant d'un domaine récent → **1re occasion de casser la chaîne** (filtrage e-mail, sandbox).

### Étape 4 — Exploitation  *(J0, 08:45)*
L'ingénieur ouvre le document et **active les macros** → exécution de code.
- **ATT&CK** : *T1204 User Execution*, *T1203 Exploitation for Client Execution*.
- **Alerte** : l'**EDR** du poste détecte un processus Office lançant un interpréteur de commandes (comportement anormal) → **2e occasion**.

### Étape 5 — Installation  *(J0, 09:00)*
L'implant établit sa **persistance** (clé de démarrage/tâche planifiée) pour survivre au redémarrage.
- **ATT&CK** : *T1547 Boot or Logon Autostart Execution*, *T1053 Scheduled Task*.
- **Alerte** : création d'une clé de persistance inhabituelle, signalée par le **HIDS/EDR** → **3e occasion**.

### Étape 6 — Command & Control  *(J0 → J+2)*
L'implant « **appelle la maison** » : il ouvre un **canal C2 chiffré** vers un serveur externe, souvent camouflé en trafic **HTTPS** légitime.
- **ATT&CK** : *T1071 Application Layer Protocol*, *T1573 Encrypted Channel*.
- **Alerte** : le **NIDS/proxy** repère des connexions périodiques (**beaconing**) vers un domaine inconnu → **4e occasion** (analyse du trafic sortant, réputation de domaine).

### Étape 7 — Actions on Objectives  *(J+2 → J+7)*
L'attaquant progresse vers le but. Sous-phases (ATT&CK) :
- **Credential Access** *(J+2)* : vol d'identifiants sur le poste et le domaine — *T1003 OS Credential Dumping*.
- **Discovery** *(J+3)* : cartographie du réseau, découverte de la **passerelle IT↔OT** — *T1046 Network Service Discovery*.
- **Lateral Movement** *(J+4)* : rebond vers d'autres machines puis vers le **réseau OT** via des services distants — *T1021 Remote Services*.
- **Franchissement IT→OT** *(J+5)* : accès à un poste de **supervision (HMI)** — **ICS** : *T0883 Internet/Remotely Accessible Device*, *T0866 Exploitation of Remote Services*.
- **Impact OT** *(J+7)* : envoi de **commandes non autorisées** aux automates, modification de consignes → perturbation/arrêt du procédé — **ICS** : *T0855 Unauthorized Command Message*, *T0836 Modify Parameter*, *T0831 Manipulation of Control*, *T0814 Denial of Service*.
- **Alerte finale** : l'IHM affiche des **valeurs incohérentes** et des **commandes non planifiées** → l'incident devient **visible physiquement** (trop tard : l'objectif est atteint).

\`\`\`
   J-30      J-14     J0 08:12   08:45     09:00      J0→J+2        J+2 → J+7
   Recon → Weaponize → Deliver → Exploit → Install → C2 (beacon) → Objectives (IT→OT→impact)
                         ▲         ▲         ▲          ▲              ▲
                      e-mail     EDR      HIDS       NIDS/proxy      IHM anormale
                     (occ.1)   (occ.2)   (occ.3)     (occ.4)        (trop tard)
\`\`\`

---

## 4. Le mapping Kill Chain ↔ MITRE ATT&CK 🗺️

| Kill Chain | But | Techniques ATT&CK (exemples) |
|---|---|---|
| Reconnaissance | repérer | T1589, T1590, T1598 |
| Weaponization | armer | T1587, T1588 (hors SI cible) |
| Delivery | livrer | **T1566.001** (spearphishing attachment) |
| Exploitation | déclencher | T1204, T1203 |
| Installation | persister | T1547, T1053 |
| Command & Control | piloter | T1071, T1573 |
| Actions on Objectives (IT) | pivoter/voler | T1003, T1046, T1021 |
| Actions on Objectives (OT/ICS) | agir sur le procédé | T0866, T0855, T0836, T0831, T0814 |

> 🧭 Deux modèles complémentaires : la **Kill Chain** donne la **séquence** (le « film » de l'attaque), **ATT&CK** donne le **vocabulaire précis** des techniques (le « dictionnaire »), utile pour la **détection**, la **corrélation SIEM** et le **partage de renseignement** (threat intel).

---

## 5. Les points de rupture : casser la chaîne ✂️

Chaque étape était une **occasion de défense** — c'est tout l'intérêt du modèle :
- **Delivery** → **filtrage e-mail**, sandbox des pièces jointes, sensibilisation au **spearphishing**.
- **Exploitation** → désactivation des **macros**, **EDR**, moindre privilège sur les postes.
- **Installation** → **HIDS/EDR** (détection de persistance), durcissement.
- **C2** → **analyse du trafic sortant** (proxy, NIDS, réputation de domaine, détection de **beaconing**), **default deny** en sortie.
- **Actions/Latéral** → **segmentation IT/OT** (modèle **Purdue**), **MFA**, **surveillance des comptes à privilèges**.
- **IT→OT** → **isolation stricte** du réseau OT, passerelles **unidirectionnelles** (**data diode**), authentification des **commandes** SCADA, **allowlisting** applicatif sur les IHM.
- **Transverse** → **SIEM/SOC** pour **corréler** ces alertes éparses en **un** incident (sans corrélation, chaque alerte isolée est passée inaperçue).

> 🧠 Leçon centrale : une APT est une **succession d'étapes**, pas un coup unique. La **défense en profondeur** multiplie les **occasions d'interrompre** la chaîne — et le **SIEM** transforme des **signaux faibles isolés** en **détection précoce**. Casser **n'importe quelle** étape avant la phase « Actions on Objectives » aurait **évité l'impact** sur le procédé physique.

---

## 🧠 À retenir

- Une **APT** vise ici une **infrastructure critique** en compromettant l'**IT** pour **rebondir** vers l'**OT/SCADA** et **agir sur le monde physique** (arrêt/sabotage) — l'OT engage la **sûreté physique**, pas que les données.
- **Cyber Kill Chain (7 étapes)** : **Reconnaissance → Weaponization → Delivery → Exploitation → Installation → Command & Control → Actions on Objectives**. Principe : **interrompre tôt** empêche toute la suite.
- **MITRE ATT&CK** = catalogue de **techniques (Txxxx)**, en **Enterprise** (IT) et **ICS** (OT). On **mappe** chaque étape : Delivery = **T1566** (spearphishing), C2 = **T1071/T1573**, Impact OT = **T0855/T0831/T0814**…
- La **chronologie** montre des **alertes** à chaque étape (e-mail, EDR, HIDS, NIDS/proxy) : autant d'**occasions de casser la chaîne** avant l'impact.
- **Points de rupture** : filtrage e-mail, EDR/macros, détection de persistance, **analyse du trafic sortant (beaconing C2)**, **segmentation IT/OT (Purdue, data diode)**, MFA, authentification des commandes SCADA.
- **Kill Chain** (séquence) + **ATT&CK** (techniques) + **SIEM/SOC** (corrélation) = détection **précoce** : sans corrélation, des **signaux faibles isolés** passent inaperçus jusqu'à l'impact.`,
    badge: {
      id: "badge-cyr-kill-chain",
      name: "Kill Chain",
      icon: "Crosshair",
      description: "Sait analyser une attaque APT via la Cyber Kill Chain et MITRE ATT&CK, de la reconnaissance à l'impact OT.",
    },
    challenges: [
      {
        id: "cyr-apt-killchain-order",
        title: "Les 7 étapes",
        order: 1,
        difficulty: "medium",
        type: "order",
        prompt: `## 🪖 Cyber Kill Chain

Remets les étapes de la **Cyber Kill Chain** dans le **bon ordre** :`,
        points: 250,
        timeLimitSec: 420,
        options: [
          "Reconnaissance",
          "Weaponization (armement)",
          "Delivery (livraison)",
          "Exploitation",
          "Installation",
          "Command & Control (C2)",
          "Actions on Objectives",
        ],
        answer: [0, 1, 2, 3, 4, 5, 6],
        hints: [
          { text: "On repère, on arme, on livre, on exploite, on s'installe, on pilote, on agit.", cost: 25 },
          { text: "📖 Correction : Recon → Weaponize → Deliver → Exploit → Install → C2 → Objectives.", cost: 60 },
        ],
        explanation: `Ordre de la **Kill Chain** : **Reconnaissance** → **Weaponization** → **Delivery** → **Exploitation** → **Installation** → **Command & Control** → **Actions on Objectives**. Chaque étape franchie ouvre la suivante ; **interrompre une étape** (surtout avant « Actions on Objectives ») **stoppe** l'attaque.`,
        tags: ["kill-chain", "apt", "sequence"],
      },
      {
        id: "cyr-apt-it-ot",
        title: "Le rebond IT vers OT",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🏭 IT → OT

Dans une attaque APT sur une infrastructure critique, pourquoi l'attaquant compromet-il d'abord le réseau **IT** avant d'atteindre l'**OT/SCADA** ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Le réseau OT est censé être isolé ; l'IT offre un point d'entrée puis une passerelle vers l'OT.", cost: 30 },
          { text: "📖 Correction : l'OT est isolé ; l'IT sert de point d'entrée pour rebondir via les passerelles IT↔OT.", cost: 80 },
        ],
        options: [
          "Le réseau OT est censé être isolé : l'IT (messagerie, postes) offre un point d'entrée, puis l'attaquant rebondit via les passerelles IT↔OT",
          "Parce que l'OT est directement exposé sur Internet et plus facile à atteindre que l'IT",
          "Parce que l'IT ne contient jamais aucune donnée intéressante",
          "Parce que l'OT n'a aucun lien avec le procédé physique",
        ],
        answer: 0,
        explanation: `Le réseau **OT** (automates, SCADA) devrait être **isolé** (modèle **Purdue**). L'attaquant vise donc d'abord l'**IT** (spearphishing sur un poste) puis effectue un **mouvement latéral** jusqu'aux **passerelles IT↔OT** (supervision, maintenance) pour franchir la frontière et **agir sur le procédé physique**. D'où l'importance d'une **segmentation IT/OT** stricte (data diode, authentification des commandes).`,
        tags: ["it-ot", "scada", "purdue"],
      },
      {
        id: "cyr-apt-c2",
        title: "Détecter le C2",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 📡 Command & Control

À l'étape **Command & Control**, l'implant établit un canal chiffré vers l'extérieur, souvent camouflé en HTTPS. Quel comportement réseau permet de le **détecter** ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "L'implant se connecte à intervalles réguliers vers un même domaine externe.", cost: 30 },
          { text: "📖 Correction : le beaconing (connexions périodiques vers un domaine inconnu), via NIDS/proxy.", cost: 80 },
        ],
        options: [
          "Le beaconing : des connexions sortantes périodiques vers un domaine inconnu/à mauvaise réputation, repérables par NIDS/proxy",
          "Une augmentation de la vitesse du ventilateur du serveur",
          "La présence d'un certificat TLS valide",
          "L'absence totale de trafic sortant",
        ],
        answer: 0,
        explanation: `Un canal **C2** génère souvent du **beaconing** : des connexions **périodiques** et régulières vers un serveur externe (parfois en HTTPS pour se fondre dans le trafic). Le **NIDS/proxy** peut le repérer via la **régularité**, la **réputation de domaine** et l'analyse du trafic **sortant** (d'où l'intérêt d'un **default deny** en sortie). ATT&CK : *T1071*, *T1573*.`,
        tags: ["c2", "beaconing", "att&ck"],
      },
      {
        id: "cyr-apt-delivery-attack",
        title: "La technique de livraison",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ✉️ Delivery

Dans le scénario, l'attaquant livre son arme via un **e-mail ciblé** contenant une pièce jointe piégée à un ingénieur précis. Comment nomme-t-on cette technique ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un phishing très ciblé (une personne/organisation précise), pas un envoi de masse.", cost: 20 },
          { text: "📖 Correction : le spearphishing (harponnage), ATT&CK T1566.", cost: 50 },
        ],
        options: [
          "Le spearphishing (harponnage) — un phishing ciblé (ATT&CK T1566)",
          "Un déni de service distribué (DDoS)",
          "Une injection SQL",
          "Un empoisonnement de cache ARP",
        ],
        answer: 0,
        explanation: `Le **spearphishing** (*harponnage*, **T1566** / T1566.001 *Spearphishing Attachment*) est un phishing **ciblé** sur une personne précise (ici un ingénieur de maintenance), bien plus crédible qu'un envoi de masse. C'est la phase **Delivery** de la Kill Chain, et la **1re occasion** de casser la chaîne (filtrage e-mail, sandbox, sensibilisation).`,
        tags: ["delivery", "spearphishing", "t1566"],
      },
      {
        id: "cyr-apt-models",
        title: "Kill Chain et ATT&CK",
        order: 5,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🗺️ Deux modèles complémentaires

Concernant la **Cyber Kill Chain** et **MITRE ATT&CK**, quelles affirmations sont **exactes** ? (Coche toutes les bonnes.)`,
        points: 350,
        timeLimitSec: 420,
        options: [
          "La Kill Chain décrit la séquence des étapes d'une intrusion ciblée",
          "MITRE ATT&CK est un catalogue de techniques (identifiants Txxxx) observées dans la réalité",
          "ATT&CK dispose d'une matrice dédiée aux systèmes industriels (ICS/OT)",
          "Interrompre une étape tardive n'a aucun intérêt : il faut forcément tout laisser se dérouler",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Kill Chain = séquence ; ATT&CK = dictionnaire de techniques (dont une matrice ICS).", cost: 30 },
          { text: "📖 Correction : les 3 premières sont vraies ; casser la chaîne, même tard, réduit l'impact.", cost: 80 },
        ],
        explanation: `La **Kill Chain** donne la **séquence** (le film de l'attaque) ; **ATT&CK** fournit le **vocabulaire des techniques** (**Txxxx**), avec une **matrice ICS** pour l'OT. Les deux sont **complémentaires** (détection, corrélation SIEM, threat intel). La 4ᵉ affirmation est **fausse** : **casser n'importe quelle étape** — surtout avant « Actions on Objectives » — **réduit ou évite** l'impact.`,
        tags: ["kill-chain", "att&ck", "ics"],
      },
      {
        id: "cyr-apt-siem",
        title: "Corréler les signaux faibles",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📊 Détection précoce

Dans le scénario, chaque étape a généré une **alerte isolée** (e-mail, EDR, HIDS, NIDS) passée inaperçue. Quel dispositif aurait permis de **relier** ces signaux faibles en un seul incident détecté à temps ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Un système qui centralise et corrèle les journaux de tout le SI.", cost: 20 },
          { text: "📖 Correction : un SIEM (alimentant un SOC).", cost: 50 },
        ],
        options: [
          "Un SIEM (corrélation centralisée des journaux), alimentant un SOC",
          "Un simple pare-feu NAT",
          "Le protocole Telnet",
          "La désactivation de toute journalisation",
        ],
        answer: 0,
        explanation: `Les alertes étaient **éparpillées** (messagerie, EDR, HIDS, NIDS) : isolées, elles semblent bénignes. Un **SIEM** les **centralise et corrèle** en **un** incident cohérent (la Kill Chain qui se déroule), avec alerte au **SOC** → **détection précoce** avant l'impact OT. C'est la synthèse du module 9 (l'absence de SIEM = intrusion non détectée).`,
        tags: ["siem", "correlation", "soc"],
      },
    ],
  },
];
