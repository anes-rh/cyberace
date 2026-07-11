import type { CourseSeed } from "../../../../types";

/** Cyber · Système — Module 3 : modèles de contrôle d'accès (DAC, MAC, RBAC). */
export const controleAcces: CourseSeed[] = [
  {
    slug: "cys-controle-acces",
    title: "Modèles de contrôle d'accès (DAC, MAC, RBAC)",
    checkpoint: "cyber-systeme",
    codename: "Access Matrix",
    domain: "Système — Contrôle d'accès",
    theme: "grid",
    icon: "LockKeyhole",
    accent: "#E8A87C",
    order: 3,
    difficulty: "medium",
    summary:
      "Qui a le droit de faire quoi : la matrice de contrôle d'accès (sujets, objets, droits), le modèle DAC (le propriétaire décide, ACL et capacités, faiblesse face au cheval de Troie), le modèle MAC (le système impose selon des labels), le modèle RBAC (accès par rôle) et la comparaison des trois approches.",
    objectives: [
      "Formaliser le contrôle d'accès : sujets, objets, droits, matrice d'accès",
      "Maîtriser le DAC : propriétaire, ACL vs listes de capacités, limites",
      "Comprendre le MAC : contrôle imposé par le système via des labels",
      "Décrire le RBAC : rôles, permissions, séparation des tâches",
      "Comparer DAC, MAC et RBAC (souplesse, sécurité, administration)",
    ],
    resources: [
      {
        label: "NIST — Role-Based Access Control (RBAC) & Access Control Models",
        url: "https://csrc.nist.gov/projects/role-based-access-control",
        kind: "link",
        note: "Ressources de référence sur RBAC et les modèles de contrôle d'accès.",
      },
      {
        label: "NIST SP 800-162 — Attribute-Based Access Control (ABAC)",
        url: "https://csrc.nist.gov/pubs/sp/800/162/final",
        kind: "link",
        note: "Pour situer ABAC, l'évolution la plus fine, au-delà de DAC/MAC/RBAC.",
      },
    ],
    lesson: `# 🔐 Modèles de contrôle d'accès — Access Matrix

Le **contrôle d'accès** répond à une question fondamentale : « **quel sujet** a le droit de faire **quelle action** sur **quel objet** ? ». Trois grands modèles y répondent différemment — **DAC**, **MAC**, **RBAC** — chacun avec ses forces et ses faiblesses. 🏎️

---

## 1. Le vocabulaire : sujets, objets, droits 🧩

- **Sujet** : l'entité **active** qui demande l'accès — un **utilisateur**, un processus agissant en son nom.
- **Objet** : la ressource **passive** protégée — un **fichier**, un répertoire, un périphérique, un enregistrement.
- **Droit / permission** : l'**action** autorisée — lire (**r**), écrire (**w**), exécuter (**x**), supprimer…

### La matrice de contrôle d'accès

Le modèle formel de base est une **matrice** : les **lignes** = sujets, les **colonnes** = objets, chaque **case** = les droits du sujet sur l'objet.

\`\`\`
                 Fichier1     Fichier2     Imprimante
   Alice          r, w         r            —
   Bob            r            r, w, x      utiliser
   Processus P    —            r            —
\`\`\`

Cette matrice est **volumineuse et creuse** en pratique. On l'implémente de deux façons :
- **Par colonne** = **ACL** (*Access Control List*) : à **chaque objet**, on attache la liste « qui a quels droits » (ex. permissions de fichiers). **La plus courante.**
- **Par ligne** = **liste de capacités** (*capabilities*) : à **chaque sujet**, on attache la liste des objets qu'il peut atteindre et comment (comme un trousseau de clés/jetons).

> 🧭 ACL (« qui peut accéder à **cet objet** ? ») et capacités (« à quoi **ce sujet** peut-il accéder ? ») sont deux **vues** de la même matrice. La plupart des OS utilisent des **ACL**.

---

## 2. DAC — Discretionary Access Control (contrôle discrétionnaire) 🗝️

Dans le **DAC**, c'est le **propriétaire** d'un objet qui **décide, à sa discrétion**, qui peut y accéder et avec quels droits. C'est le modèle des **systèmes de fichiers classiques** (UNIX/Linux, Windows).

- **UNIX** : chaque fichier a un **propriétaire** et un **groupe**, avec des droits **rwx** pour le **propriétaire / groupe / autres** (les fameux \`rwxr-xr--\`). Le propriétaire peut **changer** ces droits (\`chmod\`) et donner l'accès à qui il veut.
- **ACL étendues** : permissions plus fines par utilisateur/groupe.
- Le droit de **contrôle** (changer les permissions) appartient au **propriétaire** — d'où « discrétionnaire ».

### La faiblesse majeure du DAC : le cheval de Troie 🐴

Le DAC repose sur la **bonne volonté** et la **prudence** des propriétaires — et **surtout**, les droits se **propagent** de façon incontrôlée. Problème classique : un utilisateur autorisé exécute (sans le savoir) un programme piégé (**cheval de Troie**). Ce programme s'exécute **avec les droits de l'utilisateur** et peut alors **recopier** des données confidentielles vers un fichier accessible à l'attaquant — **en toute légalité** du point de vue du DAC (l'utilisateur avait bien le droit de lire ET d'écrire).

> ⚠️ Le DAC ne contrôle **pas le flux d'information** : une fois qu'un sujet a lu une donnée, **rien** ne l'empêche (ou n'empêche un programme agissant pour lui) de la **recopier** ailleurs. C'est **souple** mais **peu sûr** pour la confidentialité stricte. C'est précisément ce que le **MAC** vient corriger.

---

## 3. MAC — Mandatory Access Control (contrôle obligatoire) 🏛️

Dans le **MAC**, ce n'est **pas** le propriétaire qui décide : c'est le **système** qui **impose** l'accès selon une **politique centrale**, que **personne** (pas même le propriétaire d'un fichier) ne peut contourner.

- Chaque **sujet** reçoit une **habilitation** (*clearance*) et chaque **objet** un **niveau de classification** (*label*) — ex. \`Non classifié < Confidentiel < Secret < Très secret\`.
- L'accès est **décidé par le système** en comparant l'habilitation du sujet au label de l'objet, selon des **règles rigides** (voir **Bell-LaPadula** au module 4 : *no read up*, *no write down*).
- Exemples concrets : **SELinux**, **AppArmor**, les systèmes **multi-niveaux** militaires.

Le MAC **contrôle le flux d'information** : un sujet **Confidentiel** ne peut pas lire du **Secret** (*no read up*), ni écrire vers un niveau **inférieur** (*no write down*) → même un **cheval de Troie** ne peut pas **exfiltrer** vers le bas. Contrepartie : **rigide**, **complexe à administrer**, moins souple.

---

## 4. RBAC — Role-Based Access Control (par rôle) 👔

Le **RBAC** introduit un **niveau intermédiaire** : on n'attribue pas les permissions **directement** aux utilisateurs, mais à des **rôles**, et on **affecte les utilisateurs à des rôles**.

\`\`\`
   Utilisateur ──affecté à──► RÔLE ──possède──► Permissions
   (Alice)                    (Comptable)        (lire/écrire compta)
\`\`\`

- Un **rôle** regroupe les permissions nécessaires à une **fonction** (« Comptable », « Administrateur », « Infirmier »).
- Ajouter/retirer un employé = **changer son rôle** (pas reconfigurer des dizaines de permissions).
- Adapté aux **grandes organisations** : administration **simplifiée**, cohérente et auditable.
- Permet la **séparation des tâches** (*Separation of Duties*) : interdire qu'un même utilisateur cumule des rôles incompatibles (ex. « créer un paiement » **et** « valider un paiement ») → prévention de la fraude.
- Respecte le **moindre privilège** : chaque rôle n'a que ce qu'il lui faut.

> 🧭 RBAC est le modèle **le plus répandu en entreprise** car il **colle à l'organisation** (les gens ont des **fonctions**) et **passe à l'échelle**. Il peut être **discrétionnaire ou imposé** selon l'implémentation.

*(Au-delà : l'**ABAC**, *Attribute-Based Access Control*, décide selon des **attributs** combinés — utilisateur, ressource, **contexte**, heure, lieu — pour une granularité encore plus fine. C'est l'évolution moderne, mentionnée pour situer.)*

---

## 5. Comparaison DAC / MAC / RBAC 📊

| Critère | **DAC** | **MAC** | **RBAC** |
|---|---|---|---|
| Qui décide ? | le **propriétaire** de l'objet | le **système** (politique centrale) | l'organisation (via les **rôles**) |
| Base de décision | identité + droits accordés | **labels** (habilitation/classification) | **rôle** de l'utilisateur |
| Souplesse | **élevée** | **faible** (rigide) | moyenne (structurée) |
| Sécurité (flux d'info) | **faible** (cheval de Troie) | **forte** (no read up/write down) | dépend de la config |
| Administration | simple à petite échelle, vite ingérable | **complexe** | **scalable** (grandes orgs) |
| Exemples | permissions UNIX/Windows | SELinux, systèmes militaires | annuaires d'entreprise, applications métier |

> 🧠 Résumé : **DAC** = **le propriétaire décide** (souple, mais faille du cheval de Troie) ; **MAC** = **le système impose** selon des labels (très sûr pour la confidentialité, rigide) ; **RBAC** = **par rôle** (le plus pratique à l'échelle de l'entreprise). Ils ne s'excluent pas : un OS peut combiner **DAC + MAC** (ex. Linux + SELinux), et structurer les droits en **rôles**.

---

## 🧠 À retenir

- **Contrôle d'accès** = « quel **sujet** (actif) peut faire quelle **action/droit** sur quel **objet** (passif) ? », formalisé par une **matrice d'accès** (sujets × objets).
- Implémentations : **ACL** (par **objet** : qui y a accès — la plus courante) vs **capacités** (par **sujet** : à quoi il a accès). Deux vues de la même matrice.
- **DAC** (discrétionnaire) : le **propriétaire décide** (ex. permissions **rwx** UNIX, \`chmod\`). **Souple** mais **faible** : ne contrôle **pas le flux d'information** → vulnérable au **cheval de Troie** (recopie légale de données vers l'attaquant).
- **MAC** (obligatoire) : le **système impose** l'accès selon des **labels** (habilitation vs classification), **non contournable** par le propriétaire → contrôle le **flux d'information** (base de **Bell-LaPadula**). **Sûr** mais **rigide** (SELinux, militaire).
- **RBAC** (par rôle) : permissions attachées à des **rôles**, utilisateurs **affectés** aux rôles. **Scalable**, adapté à l'entreprise, permet la **séparation des tâches** et le **moindre privilège**. Le plus **répandu**.
- Comparaison : **DAC = propriétaire / souple / faible** ; **MAC = système / rigide / fort** ; **RBAC = rôle / structuré / scalable**. Souvent **combinés** (+ **ABAC** pour la granularité par attributs).`,
    badge: {
      id: "badge-cys-access-matrix",
      name: "Access Matrix",
      icon: "LockKeyhole",
      description: "Maîtrise la matrice d'accès et les modèles DAC, MAC et RBAC ainsi que leurs compromis.",
    },
    challenges: [
      {
        id: "cys-acc-dac",
        title: "Qui décide en DAC ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🗝️ DAC

Dans le modèle **DAC** (contrôle d'accès discrétionnaire), qui décide des droits d'accès à un objet ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "« Discrétionnaire » = à la discrétion de celui qui possède l'objet.", cost: 10 },
          { text: "📖 Correction : le propriétaire de l'objet.", cost: 30 },
        ],
        options: [
          "Le propriétaire de l'objet (à sa discrétion)",
          "Le système, via une politique centrale imposée",
          "Uniquement l'administrateur réseau",
          "Personne, l'accès est toujours libre",
        ],
        answer: 0,
        explanation: `En **DAC**, le **propriétaire** de l'objet décide **à sa discrétion** qui accède et avec quels droits (ex. \`chmod\` sur un fichier UNIX). C'est **souple** mais **peu sûr** : le modèle ne contrôle pas le **flux d'information** (faille du **cheval de Troie**). En **MAC**, à l'inverse, c'est le **système** qui **impose** l'accès.`,
        tags: ["dac", "proprietaire", "discretionnaire"],
      },
      {
        id: "cys-acc-troie",
        title: "La faille du DAC",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🐴 Cheval de Troie

Pourquoi le **DAC** est-il vulnérable à un **cheval de Troie** exécuté par un utilisateur légitime ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Le programme hérite des droits de l'utilisateur ; le DAC ne surveille pas le flux d'information.", cost: 30 },
          { text: "📖 Correction : le programme agit avec les droits de l'utilisateur et peut recopier des données ailleurs, en toute légalité DAC.", cost: 80 },
        ],
        options: [
          "Le programme s'exécute avec les droits de l'utilisateur et peut recopier des données confidentielles vers l'attaquant : le DAC ne contrôle pas le flux d'information",
          "Le DAC empêche physiquement l'exécution de tout programme",
          "Le DAC chiffre les fichiers, donc le cheval de Troie échoue toujours",
          "Le cheval de Troie ne fonctionne qu'en MAC",
        ],
        answer: 0,
        explanation: `Le **DAC** ne contrôle **pas le flux d'information**. Un **cheval de Troie** lancé par un utilisateur autorisé s'exécute **avec ses droits** : il peut **lire** des données confidentielles (l'utilisateur y avait droit) et les **recopier** vers un fichier accessible à l'attaquant — **légalement** selon le DAC. Le **MAC** corrige cela en interdisant l'écriture vers un niveau inférieur (*no write down*).`,
        tags: ["dac", "cheval-de-troie", "flux"],
      },
      {
        id: "cys-acc-mac",
        title: "MAC",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🏛️ MAC

Qu'est-ce qui caractérise le modèle **MAC** (Mandatory Access Control) ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Ce n'est pas le propriétaire mais une autorité centrale qui décide, via des niveaux/labels.", cost: 20 },
          { text: "📖 Correction : le système impose l'accès selon des labels ; non contournable par le propriétaire.", cost: 50 },
        ],
        options: [
          "Le système impose l'accès selon des labels (habilitation du sujet vs classification de l'objet), sans que le propriétaire puisse le contourner",
          "Chaque utilisateur fixe librement les droits de ses fichiers",
          "Il n'existe aucune règle, l'accès est déterminé au hasard",
          "Les droits changent selon la charge du processeur",
        ],
        answer: 0,
        explanation: `En **MAC**, le **système** impose l'accès selon une **politique centrale** basée sur des **labels** : **habilitation** (*clearance*) du sujet vs **classification** de l'objet. **Personne** (pas même le propriétaire) ne peut la contourner. Cela **contrôle le flux d'information** (cf. **Bell-LaPadula**). Exemples : **SELinux**, systèmes militaires. Contrepartie : **rigide** et complexe à administrer.`,
        tags: ["mac", "labels", "impose"],
      },
      {
        id: "cys-acc-rbac",
        title: "RBAC et séparation des tâches",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 👔 RBAC

Dans le modèle **RBAC**, à quoi sont attachées les permissions, et quel avantage en découle pour une grande organisation ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Les permissions vont aux rôles ; on affecte les utilisateurs à des rôles.", cost: 20 },
          { text: "📖 Correction : aux rôles → administration scalable, séparation des tâches, moindre privilège.", cost: 50 },
        ],
        options: [
          "Aux rôles (les utilisateurs sont affectés à des rôles) → administration scalable, séparation des tâches et moindre privilège",
          "À chaque utilisateur individuellement, une permission à la fois",
          "À l'adresse IP de la machine",
          "À la taille des fichiers concernés",
        ],
        answer: 0,
        explanation: `En **RBAC**, les permissions sont attachées à des **rôles** (« Comptable », « Admin »), et les **utilisateurs** sont **affectés** à des rôles. Gérer un employé = changer son **rôle** → administration **scalable** et cohérente. RBAC facilite la **séparation des tâches** (rôles incompatibles interdits) et le **moindre privilège**. C'est le modèle **le plus répandu en entreprise**.`,
        tags: ["rbac", "roles", "separation-taches"],
      },
      {
        id: "cys-acc-acl",
        title: "ACL vs capacités",
        order: 5,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🧩 Implémenter la matrice

Une **ACL** (Access Control List) et une **liste de capacités** sont deux façons d'implémenter la matrice d'accès. Quelle est la différence ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "L'une est organisée par objet (colonne), l'autre par sujet (ligne).", cost: 30 },
          { text: "📖 Correction : ACL = par objet (qui y accède) ; capacités = par sujet (à quoi il accède).", cost: 80 },
        ],
        options: [
          "L'ACL est attachée à l'objet (liste : qui a quels droits dessus) ; la liste de capacités est attachée au sujet (liste : à quels objets il peut accéder)",
          "L'ACL chiffre les fichiers, les capacités les compriment",
          "Les deux sont identiques et interchangeables sans différence",
          "L'ACL ne concerne que le réseau, les capacités que la RAM",
        ],
        answer: 0,
        explanation: `Ce sont deux **vues** de la matrice d'accès : l'**ACL** est organisée **par objet** (colonne) — « **qui** peut accéder à cet objet et comment » (ex. permissions de fichiers) ; la **liste de capacités** est organisée **par sujet** (ligne) — « à **quels objets** ce sujet peut-il accéder » (comme un trousseau de jetons). La plupart des OS utilisent des **ACL**.`,
        tags: ["acl", "capacites", "matrice"],
      },
      {
        id: "cys-acc-compare",
        title: "Reconnaître le modèle",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📊 Comparaison

Une organisation veut que **le système impose** une politique de confidentialité **non contournable par les propriétaires de fichiers**, avec des niveaux Secret/Confidentiel. Quel modèle choisir ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "« Imposé par le système » + niveaux de classification = ?", cost: 20 },
          { text: "📖 Correction : le MAC.", cost: 50 },
        ],
        options: [
          "MAC (contrôle obligatoire imposé par le système, via des labels)",
          "DAC (le propriétaire décide)",
          "Aucun contrôle d'accès",
          "Un simple mot de passe partagé",
        ],
        answer: 0,
        explanation: `Le besoin — **politique imposée par le système**, **non contournable** par les propriétaires, avec des **niveaux de classification** — correspond au **MAC**. Le **DAC** laisserait chaque propriétaire décider (et fuiter). Le **RBAC** structure par rôle mais ne garantit pas, à lui seul, le contrôle **strict du flux** entre niveaux (rôle du **MAC / Bell-LaPadula**).`,
        tags: ["mac", "comparaison", "confidentialite"],
      },
    ],
  },
];
