import type { CourseSeed } from "../../../../types";

/** Cyber · Intro — Module 1 : fondamentaux de la sécurité de l'information. */
export const fondamentaux: CourseSeed[] = [
  {
    slug: "cyi-fondamentaux",
    title: "Fondamentaux de la sécurité de l'information",
    checkpoint: "cyber-intro",
    codename: "Ground Zero",
    domain: "Cybersécurité — Fondations",
    theme: "grid",
    icon: "Shield",
    accent: "#9B8CCB",
    order: 1,
    difficulty: "easy",
    summary:
      "Le socle : sécurité de l'information vs sécurité des SI, la triade CIA (+ authenticité et non-répudiation), les 3 A (AAA), l'équation d'une attaque (motif + méthode + vulnérabilité) et les motivations des attaquants.",
    objectives: [
      "Distinguer sécurité de l'information et sécurité des systèmes d'information",
      "Maîtriser la triade CIA : confidentialité, intégrité, disponibilité",
      "Ajouter authenticité et non-répudiation aux propriétés de sécurité",
      "Comprendre les 3 A : authentification, autorisation, traçabilité (AAA)",
      "Décomposer une attaque en motif + méthode + vulnérabilité et citer les motivations",
    ],
    lesson: `# 🛡️ Fondamentaux de la sécurité de l'information — Ground Zero

Avant d'attaquer ou de défendre, il faut parler la même langue. Ce module pose **tout le vocabulaire** et les propriétés que la sécurité cherche à garantir. 🏎️

---

## 1. Sécurité de l'information vs sécurité des SI 🗂️

Deux périmètres qu'on confond souvent :

- **Sécurité de l'information** (*Information Security, InfoSec*) : protéger **l'information elle-même**, quel que soit son support — un document papier, une conversation orale, un fichier, une base de données. Elle englobe les processus, les personnes et la technologie.
- **Sécurité des systèmes d'information** (*IT/SI Security*) : un **sous-ensemble** centré sur les **systèmes numériques** qui traitent l'information (ordinateurs, serveurs, réseaux, applications).

> 🧭 Autrement dit : toute sécurité des SI est de la sécurité de l'information, mais l'inverse est faux (protéger un dossier papier dans un coffre = InfoSec, pas IT). La sécurité **la plus large** vise l'information ; la sécurité des SI en est le volet technique.

**Trois piliers transversaux** de la sécurité : les **personnes** (sensibilisation, erreurs humaines), les **processus** (procédures, politiques) et la **technologie** (pare-feu, chiffrement). Une chaîne n'est jamais plus solide que son maillon le plus faible — souvent l'humain.

---

## 2. La triade CIA 🔺

Le cœur historique de la sécurité, **trois propriétés** à garantir :

\`\`\`
                 ▲ Confidentialité
                / \\
               /   \\
              /  🔒  \\
             /       \\
   Intégrité ◄───────► Disponibilité
\`\`\`

- **Confidentialité** (*Confidentiality*) : l'information n'est accessible qu'aux **personnes autorisées**. Une fuite de données (data breach) casse la confidentialité. Moyens : **chiffrement**, contrôle d'accès, classification des données.
- **Intégrité** (*Integrity*) : l'information n'est **pas altérée** de façon non autorisée ; elle reste exacte et complète. Moyens : **hachage** (checksums), signatures, contrôles de version. Modifier une somme sur un virement casse l'intégrité.
- **Disponibilité** (*Availability*) : l'information et les services sont **accessibles quand on en a besoin**. Une attaque par déni de service (DoS/DDoS) casse la disponibilité. Moyens : redondance, sauvegardes, tolérance aux pannes.

> ⚖️ Ces trois propriétés sont souvent en **tension** : trop de confidentialité (chiffrement lourd, contrôles stricts) peut nuire à la disponibilité (lenteur, accès bloqués). La sécurité, c'est trouver **l'équilibre** adapté au risque.

### Deux propriétés complémentaires

La triade est souvent étendue par :
- **Authenticité** (*Authenticity*) : la garantie qu'une information/une identité est **bien ce qu'elle prétend être** (un message vient bien de l'expéditeur annoncé). Assurée par l'authentification et les signatures.
- **Non-répudiation** (*Non-repudiation*) : l'auteur d'une action **ne peut pas nier l'avoir faite**. Une signature numérique horodatée prouve « c'est bien toi qui as signé, et tu ne peux pas le contester ». Cruciale en preuve légale et transactions.

On parle parfois de **quintette** : Confidentialité, Intégrité, Disponibilité, Authenticité, Non-répudiation.

### Le Parkerian Hexad (extension à 6 propriétés)

Certains modèles vont plus loin avec le **Parkerian Hexad**, qui ajoute à la triade **trois** propriétés :
- **Possession / contrôle** (*possession or control*) : maîtriser le **support** de l'information. On peut perdre la **possession** d'un disque chiffré **sans** perdre la confidentialité (les données restent illisibles) — les deux notions sont donc distinctes.
- **Authenticité** : la véracité de l'origine (déjà vue).
- **Utilité** (*utility*) : l'information reste **utilisable**. Une donnée chiffrée dont on a **perdu la clé** est toujours confidentielle, intègre et disponible… mais **inutile** — c'est une perte d'**utilité**.

Le Parkerian Hexad = **Confidentialité, Possession, Intégrité, Authenticité, Disponibilité, Utilité**. Il affine l'analyse en séparant des cas que la triade CIA regroupe.

---

## 3. Les 3 A : AAA 🔑

Un cadre opérationnel du contrôle d'accès, les **trois A** :

| A | Nom | Question |
|---|---|---|
| **Authentication** | Authentification | « **Qui es-tu ?** » — prouver son identité |
| **Authorization** | Autorisation | « **Qu'as-tu le droit de faire ?** » — accorder des permissions |
| **Accounting** | Traçabilité / Comptabilité | « **Qu'as-tu fait ?** » — journaliser les actions |

- **Authentification** : vérifier l'identité via un ou plusieurs **facteurs** — ce que tu **sais** (mot de passe), ce que tu **as** (token, téléphone), ce que tu **es** (biométrie). Combiner plusieurs = **authentification multifacteur (MFA)**.
- **Autorisation** : une fois authentifié, décider ce à quoi tu as accès (principe du **moindre privilège** : n'accorder que le strict nécessaire).
- **Traçabilité** (*Accounting*, parfois *Auditing*) : **enregistrer** qui a fait quoi et quand (logs) — indispensable pour la non-répudiation, la détection et l'investigation.

> 🧠 Ne confonds pas **authentification** (prouver qui on est) et **autorisation** (ce qu'on peut faire). On s'authentifie **une fois**, on est autorisé **à chaque accès**.

### Les 5 facteurs d'authentification

On combine des **facteurs** de natures différentes (plus il y en a, plus c'est fort) :
1. **Ce que tu SAIS** (*knowledge*) : mot de passe, code PIN, question secrète.
2. **Ce que tu AS** (*possession*) : token physique, carte à puce, smartphone (OTP).
3. **Ce que tu ES** (*inherence*) : biométrie — empreinte, visage, iris, voix.
4. **Où tu ES** (*location*) : géolocalisation, adresse IP/réseau de confiance.
5. **Ce que tu FAIS** (*behavior*) : biométrie comportementale (façon de taper, de tenir le téléphone).

La **MFA** (*Multi-Factor Authentication*) combine **au moins deux facteurs de catégories différentes** (ex. mot de passe **+** OTP). Utiliser deux mots de passe = **un seul** facteur (savoir), donc **pas** de la MFA.

### Les modèles de contrôle d'accès 🚪

Comment décider **qui** accède à **quoi** ? Quatre grands modèles :
- **DAC** (*Discretionary Access Control*) : le **propriétaire** d'une ressource décide qui y accède (ex. permissions de fichiers). Souple mais risqué.
- **MAC** (*Mandatory Access Control*) : le **système** impose l'accès selon des **niveaux de classification** (Secret, Confidentiel…) et des habilitations. Très strict (militaire).
- **RBAC** (*Role-Based Access Control*) : l'accès dépend du **rôle** de l'utilisateur (« comptable », « admin »). Le plus courant en entreprise.
- **ABAC** (*Attribute-Based Access Control*) : l'accès dépend d'**attributs** combinés (utilisateur, ressource, contexte, heure, lieu). Le plus **fin** et flexible.

### Les types de contrôles de sécurité 🛠️

On classe les **contrôles** (mesures) de deux façons :
- Par **nature** : **techniques/logiques** (pare-feu, chiffrement), **administratifs/organisationnels** (politiques, formation), **physiques** (badges, caméras, serrures).
- Par **fonction** : **préventifs** (empêcher — pare-feu), **détectifs** (repérer — IDS, logs), **correctifs** (réparer — restauration), **dissuasifs** (décourager — panneau « site surveillé »), **compensatoires** (mesure de substitution quand l'idéale est impossible).

### Le traitement du risque 🎲

Face à un risque identifié, **quatre** options :
- **Réduire / atténuer** (*mitigate*) : mettre des contrôles pour baisser la probabilité/l'impact.
- **Transférer** (*transfer*) : refiler le risque à un tiers (assurance cyber, sous-traitance).
- **Accepter** (*accept*) : assumer le risque (s'il est faible / le coût de traitement est trop élevé).
- **Éviter** (*avoid*) : renoncer à l'activité qui génère le risque.

> 🧠 Le **risque zéro n'existe pas** : on parle de **risque résiduel** (ce qui reste après traitement) — à **accepter** consciemment.

---

## 4. L'équation d'une attaque ⚔️

Une attaque réussie n'arrive pas par hasard. Elle combine **trois ingrédients** :

\`\`\`
   ATTAQUE = Motif (ou But)  +  Méthode  +  Vulnérabilité
\`\`\`

- **Motif** : la **raison** qui pousse l'attaquant (voir motivations ci-dessous). Sans motif, pas de cible.
- **Méthode** : la **technique/outil** employé (phishing, exploit, malware, force brute…).
- **Vulnérabilité** : la **faille** exploitée — un défaut de configuration, un logiciel non corrigé, un mot de passe faible, un utilisateur crédule.

> 🎯 Corollaire défensif : **casser un seul des trois** suffit souvent à empêcher l'attaque. On ne peut pas retirer le motif de l'attaquant, mais on peut **réduire les vulnérabilités** (correctifs, durcissement) et **compliquer les méthodes** (défense en profondeur).

**Vocabulaire lié :**
- **Menace** (*threat*) : un danger **potentiel** (un événement ou acteur qui pourrait nuire).
- **Vulnérabilité** (*vulnerability*) : une **faiblesse** exploitable.
- **Risque** (*risk*) : la combinaison **probabilité × impact** qu'une menace exploite une vulnérabilité. \`Risque ≈ Menace × Vulnérabilité × Impact\`.
- **Exploit** : le code/la technique concrète qui **tire parti** d'une vulnérabilité.
- **Payload** (charge utile) : ce que fait l'exploit une fois entré (voler, chiffrer, ouvrir une porte dérobée…).
- **Surface d'attaque** : l'ensemble des points d'entrée exposés (ports ouverts, services, comptes, API…). La réduire = réduire le risque.
- **Zero-day** : une vulnérabilité **inconnue de l'éditeur** (aucun correctif n'existe encore) — particulièrement dangereuse.

---

## 5. Les motivations des attaquants 🎭

Comprendre **pourquoi** on attaque aide à anticiper. Grandes motivations :

- **Financière** : voler de l'argent, des données bancaires, extorquer (rançongiciels), fraude. La plus répandue.
- **Vol de données / espionnage** : dérober propriété intellectuelle, secrets industriels, données personnelles.
- **Hacktivisme** : motivations **idéologiques/politiques** (défigurer un site, divulguer des documents pour une cause).
- **Espionnage étatique** (*nation-state*) : services de renseignement, sabotage d'infrastructures, cyberguerre (**APT**, *Advanced Persistent Threat* — attaquants sophistiqués et persistants).
- **Vengeance / menace interne** (*insider*) : un employé mécontent, un ex-salarié.
- **Défi / notoriété** : prouver ses compétences, la reconnaissance (« pour la gloire »).
- **Terrorisme / déstabilisation** : perturber, semer la peur.

> 🧭 Le profil de l'attaquant (script kiddie opportuniste vs APT étatique) change **radicalement** le niveau de menace et les défenses à prévoir.

---

## 🧠 À retenir

- **InfoSec** protège l'**information** (tout support) ; la **sécurité des SI** en est le volet **technique** (systèmes numériques). Trois piliers : **personnes, processus, technologie**.
- **Triade CIA** : **Confidentialité** (accès autorisé seulement, via chiffrement), **Intégrité** (non altérée, via hachage/signatures), **Disponibilité** (accessible, via redondance). Souvent en **tension** → équilibre.
- Étendue par **Authenticité** (est bien ce qu'elle prétend) et **Non-répudiation** (ne peut nier son action).
- **AAA** : **Authentification** (qui es-tu), **Autorisation** (droits), **Traçabilité** (logs de ce que tu as fait). Auth ≠ Autz.
- **5 facteurs d'authentification** : savoir, avoir, être, où, faire ; **MFA** = **≥ 2 catégories différentes** (2 mots de passe = 1 seul facteur).
- **Modèles de contrôle d'accès** : **DAC** (le propriétaire décide), **MAC** (classification imposée), **RBAC** (par rôle, le plus courant), **ABAC** (par attributs, le plus fin).
- **Types de contrôles** : techniques / administratifs / physiques ; préventifs / détectifs / correctifs / dissuasifs / compensatoires.
- **Parkerian Hexad** = CIA + **possession**, **authenticité**, **utilité** ; **traitement du risque** : réduire, transférer, accepter, éviter (+ **risque résiduel**).
- **Attaque = Motif + Méthode + Vulnérabilité** ; casser un ingrédient bloque l'attaque. \`Risque ≈ Menace × Vulnérabilité × Impact\`.
- Vocabulaire : menace, vulnérabilité, risque, exploit, payload, **surface d'attaque**, **zero-day**.
- Motivations : **financière** (n°1), vol/espionnage, **hacktivisme**, **étatique (APT)**, interne, défi, terrorisme.`,
    badge: {
      id: "badge-cyi-ground-zero",
      name: "Ground Zero",
      icon: "Shield",
      description: "Maîtrise la triade CIA, l'AAA et le vocabulaire fondamental de la sécurité de l'information.",
    },
    challenges: [
      {
        id: "cyi-fond-cia",
        title: "La bonne propriété",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔺 Triade CIA

Une attaque par **déni de service (DDoS)** rend un site web inaccessible pendant plusieurs heures. **Quelle propriété de la triade CIA** est directement violée ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Le site n'est plus… accessible.", cost: 10 },
          { text: "📖 Correction : la disponibilité (le service n'est plus accessible quand on en a besoin).", cost: 30 },
        ],
        options: [
          "La disponibilité",
          "La confidentialité",
          "L'intégrité",
          "La non-répudiation",
        ],
        answer: 0,
        explanation: `Un **DDoS** sature le service et le rend **inaccessible** → c'est la **disponibilité** qui tombe. La **confidentialité** concernerait une fuite de données, l'**intégrité** une altération non autorisée, la **non-répudiation** la preuve d'une action. Moyens de défense de la disponibilité : redondance, filtrage anti-DDoS, tolérance aux pannes.`,
        tags: ["cia", "disponibilite", "fondamentaux"],
      },
      {
        id: "cyi-fond-integrite",
        title: "Protéger l'intégrité",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## ✍️ Intégrité

Quel mécanisme permet surtout de garantir l'**intégrité** d'un fichier (détecter s'il a été modifié) ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Une empreinte qui change dès qu'un octet change.", cost: 10 },
          { text: "📖 Correction : le hachage (checksum/empreinte) détecte toute altération.", cost: 30 },
        ],
        options: [
          "Le hachage (empreinte / checksum)",
          "L'augmentation de la bande passante",
          "La suppression des sauvegardes",
          "Le partage du mot de passe",
        ],
        answer: 0,
        explanation: `Le **hachage** produit une **empreinte** (checksum) : si un seul octet du fichier change, l'empreinte change → on **détecte** l'altération. C'est le pilier de l'**intégrité**. La **confidentialité** repose plutôt sur le chiffrement, la **disponibilité** sur la redondance.`,
        tags: ["cia", "integrite", "hachage"],
      },
      {
        id: "cyi-fond-aaa",
        title: "Authentification vs autorisation",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔑 AAA

Tu entres ton mot de passe et l'accès est accordé, puis le système décide que tu peux **lire** mais **pas supprimer** un dossier. À quels A du modèle **AAA** correspondent ces deux étapes ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Prouver son identité = ? ; décider des droits = ?", cost: 15 },
          { text: "📖 Correction : authentification (mot de passe) puis autorisation (droits lire/supprimer).", cost: 40 },
        ],
        options: [
          "Authentification (mot de passe), puis autorisation (droits lire/supprimer)",
          "Autorisation, puis authentification",
          "Traçabilité, puis authentification",
          "Les deux sont de l'authentification",
        ],
        answer: 0,
        explanation: `Entrer le mot de passe = **authentification** (prouver **qui** tu es). Décider que tu peux lire mais pas supprimer = **autorisation** (tes **droits**). La 3ᵉ étape, la **traçabilité** (*accounting*), journaliserait ces actions. Retiens : on s'authentifie **une fois**, on est autorisé **à chaque accès**.`,
        tags: ["aaa", "authentification", "autorisation"],
      },
      {
        id: "cyi-fond-equation",
        title: "L'équation d'une attaque",
        order: 4,
        difficulty: "medium",
        type: "multi",
        prompt: `## ⚔️ Les 3 ingrédients

Selon l'équation vue en cours, une attaque combine **trois** ingrédients. Coche-les :`,
        points: 200,
        timeLimitSec: 300,
        options: [
          "Un motif (une raison / un but)",
          "Une méthode (technique ou outil)",
          "Une vulnérabilité (une faille exploitable)",
          "Un pare-feu correctement configuré",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Motif + Méthode + Vulnérabilité. Le pare-feu est une défense, pas un ingrédient d'attaque.", cost: 20 },
          { text: "📖 Correction : Motif + Méthode + Vulnérabilité.", cost: 50 },
        ],
        explanation: `**Attaque = Motif + Méthode + Vulnérabilité.** Le **motif** (pourquoi), la **méthode** (comment), la **vulnérabilité** (la faille exploitée). Un **pare-feu bien configuré** est au contraire une **défense** qui réduit la surface d'attaque. Casser un seul des trois ingrédients suffit souvent à bloquer l'attaque.`,
        tags: ["attaque", "vulnerabilite", "equation"],
      },
      {
        id: "cyi-fond-zeroday",
        title: "Le zero-day",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🕳️ Vocabulaire

Comment appelle-t-on une **vulnérabilité inconnue de l'éditeur**, pour laquelle **aucun correctif n'existe encore** ?

*(Réponds par le terme exact, en un ou deux mots.)*`,
        points: 150,
        timeLimitSec: 240,
        hints: [
          { text: "Un terme anglais avec un chiffre : « jour zéro ».", cost: 15 },
          { text: "📖 Correction : zero-day (ou 0-day).", cost: 40 },
        ],
        answer: "zero-day",
        accept: ["zero day", "0-day", "0 day", "zeroday", "zero-day", "faille zero-day", "vulnérabilité zero-day"],
        explanation: `Un **zero-day** (0-day) est une vulnérabilité **inconnue de l'éditeur** : il n'a eu « zéro jour » pour la corriger, donc **aucun correctif** n'existe. C'est pourquoi elle est très prisée des attaquants (et très chère au marché noir) : les défenses classiques (signatures, patchs) ne la connaissent pas encore.`,
        tags: ["zero-day", "vocabulaire", "vulnerabilite"],
      },
      {
        id: "cyi-fond-motivations",
        title: "Motivations des attaquants",
        order: 6,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎭 APT

Un groupe **soutenu par un État** mène une attaque sophistiquée et **persistante** pour espionner une infrastructure stratégique. Comment nomme-t-on ce type d'acteur ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Advanced Persistent Threat.", cost: 15 },
          { text: "📖 Correction : une APT (Advanced Persistent Threat), souvent étatique.", cost: 40 },
        ],
        options: [
          "Une APT (Advanced Persistent Threat)",
          "Un script kiddie",
          "Un pare-feu applicatif",
          "Un utilisateur lambda",
        ],
        answer: 0,
        explanation: `Une **APT** (*Advanced Persistent Threat*) est un attaquant **sophistiqué et persistant**, souvent **étatique** (espionnage, sabotage d'infrastructures). À l'opposé, un **script kiddie** utilise des outils tout faits sans réelle expertise. Le profil de l'attaquant change radicalement le niveau de menace à anticiper.`,
        tags: ["motivations", "apt", "menaces"],
      },
    ],
  },
];
