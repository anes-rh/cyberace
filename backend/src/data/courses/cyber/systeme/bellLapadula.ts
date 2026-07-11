import type { CourseSeed } from "../../../../types";

/** Cyber · Système — Module 4 : le modèle Bell-LaPadula et la sécurité multi-niveaux. */
export const bellLapadula: CourseSeed[] = [
  {
    slug: "cys-bell-lapadula",
    title: "Bell-LaPadula et la sécurité multi-niveaux",
    checkpoint: "cyber-systeme",
    codename: "No Read Up",
    domain: "Système — Sécurité multi-niveaux",
    theme: "grid",
    icon: "Layers",
    accent: "#E8A87C",
    order: 4,
    difficulty: "hard",
    summary:
      "Le modèle formel de la confidentialité multi-niveaux : niveaux de classification et catégories (treillis de sécurité), les règles Bell-LaPadula — propriété simple (no read up) et propriété étoile (no write down) — leur objectif de non-fuite d'information, et la comparaison avec Biba (intégrité).",
    objectives: [
      "Comprendre la classification multi-niveaux et le treillis de sécurité",
      "Énoncer la propriété simple (no read up) de Bell-LaPadula",
      "Énoncer la propriété étoile (no write down) et son rôle anti-fuite",
      "Situer les cas d'usage (confidentialité militaire/gouvernementale)",
      "Distinguer Bell-LaPadula (confidentialité) de Biba (intégrité)",
    ],
    resources: [
      {
        label: "NIST / Computer Security — Bell-LaPadula & Multilevel Security",
        url: "https://csrc.nist.gov/glossary",
        kind: "link",
        note: "Définitions de référence sur la sécurité multi-niveaux (MLS) et les modèles formels.",
      },
      {
        label: "Orange Book (TCSEC) — critères d'évaluation historiques",
        url: "https://csrc.nist.gov/",
        kind: "link",
        note: "Le cadre historique qui a formalisé les niveaux de sécurité et la MLS militaire.",
      },
    ],
    lesson: `# 🔺 Bell-LaPadula et la sécurité multi-niveaux — No Read Up

Comment garantir **mathématiquement** qu'une information **Secret** ne fuira **jamais** vers un utilisateur **non habilité** ? En 1973, **Bell** et **LaPadula** ont formalisé un modèle de **confidentialité multi-niveaux** qui est devenu **la** référence du contrôle d'accès obligatoire (MAC). Ce module en explique les **règles** et la **logique**. 🏎️

---

## 1. La sécurité multi-niveaux (MLS) 🏷️

Dans un environnement **multi-niveaux** (*Multilevel Security*), l'information est classée par **sensibilité** et les utilisateurs par **habilitation**.

- **Niveaux de classification** (ordonnés) : par exemple \`Non classifié < Confidentiel < Secret < Très secret\`.
- **Habilitation** (*clearance*) du sujet : le niveau **maximal** auquel il a droit.
- **Catégories / compartiments** (*need-to-know*) : des étiquettes **non ordonnées** (ex. « NUCLÉAIRE », « CRYPTO », « RH ») qui **restreignent** l'accès à un **domaine**, indépendamment du niveau.

### Le treillis de sécurité 🔷

Un **label** complet = **(niveau, ensemble de catégories)**. On les compare par une relation de **domination** : un label **A domine** un label B si **le niveau de A ≥ celui de B** **ET** **les catégories de B ⊆ celles de A**. Comme certains labels ne sont **pas comparables** (aucun ne domine l'autre), l'ensemble forme un **treillis** (*lattice*) — un ordre **partiel**, pas une simple ligne.

\`\`\`
              (Très secret, {CRYPTO, NUCLÉAIRE})     ← domine tout en dessous
                        /            \\
       (Secret, {CRYPTO})        (Secret, {NUCLÉAIRE})   ← NON comparables entre eux
                        \\            /
                   (Confidentiel, {})
                          │
                  (Non classifié, {})
\`\`\`

> 🧭 Le **treillis** modélise le « besoin d'en connaître » : avoir une habilitation **Secret** ne suffit pas si l'on n'est pas dans la **bonne catégorie**. La domination combine **niveau** ET **compartiments**.

---

## 2. Bell-LaPadula : deux règles pour la confidentialité 🔒

Bell-LaPadula est un modèle de **confidentialité** (protéger le **secret**). Il définit deux règles fondamentales qui gouvernent la **lecture** et l'**écriture** :

### Propriété simple (*Simple Security Property*) — « No Read Up » ⬆️🚫

> Un sujet **ne peut PAS lire** un objet d'un niveau **supérieur** à son habilitation.

C'est intuitif : un utilisateur **Confidentiel** ne doit **pas lire** un document **Secret**. On lit **à son niveau ou en dessous** (*read down* autorisé).

\`\`\`
   Sujet "Secret"  ─── lire ───►  objet Confidentiel   ✅ (read down)
   Sujet "Secret"  ─── lire ───►  objet Très secret    ❌ (NO READ UP)
\`\`\`

### Propriété étoile (*\\* - Star Property*) — « No Write Down » ⬇️🚫

> Un sujet **ne peut PAS écrire** vers un objet d'un niveau **inférieur** à son habilitation.

Moins intuitive, mais **cruciale** : un utilisateur (ou un programme agissant pour lui) habilité **Secret** ne doit **pas écrire** dans un fichier **Confidentiel**. Sinon, il pourrait **recopier** une information **Secret** vers un niveau **inférieur** → **fuite**. On écrit **à son niveau ou au-dessus** (*write up* autorisé).

\`\`\`
   Sujet "Secret"  ─── écrire ───►  objet Très secret   ✅ (write up)
   Sujet "Secret"  ─── écrire ───►  objet Confidentiel  ❌ (NO WRITE DOWN)
\`\`\`

### La logique d'ensemble : « lire en bas, écrire en haut »

\`\`\`
       Très secret   ▲  écrire OK (write up)
                     │
        Secret   ●───┤  ← le sujet est ICI
                     │
      Confidentiel   ▼  lire OK (read down)

   Lecture : à son niveau ou EN DESSOUS   (no read up)
   Écriture : à son niveau ou AU-DESSUS   (no write down)
\`\`\`

> 🧠 Objectif unique : **empêcher toute fuite d'information vers le bas**. C'est exactement ce qui **neutralise le cheval de Troie** (module 3) : même un programme malveillant habilité Secret **ne peut pas écrire** la donnée secrète dans un fichier lisible par un utilisateur Confidentiel. Le flux d'information ne peut aller que **vers le haut**.

---

## 3. Nuances et limites ⚖️

- **Tranquility principle** (principe de tranquillité) : en pratique, les niveaux des objets ne changent pas pendant l'usage (ou sous contrôle strict), pour éviter des incohérences.
- **Trusted subjects** : certains sujets **de confiance** peuvent, de façon **contrôlée et auditée**, déroger au « no write down » (ex. un processus de **déclassification** légitime).
- **Ne gère pas l'intégrité** : Bell-LaPadula protège la **confidentialité**, **pas** l'intégrité. Un sujet peut « write up » — donc **écrire** dans un document **plus secret** que lui, ce qui pose un problème d'**intégrité** (un sous-officier pourrait altérer un document Très secret). C'est le **problème inverse**, traité par **Biba**.
- **Canaux cachés** : le modèle contrôle les canaux **légitimes**, mais des **canaux cachés** (module 5) peuvent contourner les règles en encodant l'information autrement.

---

## 4. Bell-LaPadula vs Biba : confidentialité vs intégrité 🔄

Le modèle **Biba** est le **miroir** de Bell-LaPadula, mais pour l'**intégrité** (empêcher la **corruption** de données fiables par des sources peu fiables) :

| | **Bell-LaPadula** | **Biba** |
|---|---|---|
| Protège | **Confidentialité** | **Intégrité** |
| Lecture | **No Read Up** (pas lire plus secret) | **No Read Down** (pas lire moins fiable) |
| Écriture | **No Write Down** (pas écrire plus bas) | **No Write Up** (pas écrire plus fiable) |
| Devise | « lire en bas, écrire en haut » | « lire en haut, écrire en bas » |

> 🧭 Mnémo : **Bell-LaPadula protège les secrets** (l'info ne **descend** pas) ; **Biba protège l'intégrité** (la corruption ne **monte** pas). Les deux sont des modèles **MAC** formels, appliqués selon qu'on veut garantir le **secret** ou la **fiabilité**.

---

## 5. Cas d'usage 🎯

Bell-LaPadula est né dans le **contexte militaire/gouvernemental**, où la **confidentialité** prime absolument :
- **Défense et renseignement** : documents classifiés (Confidentiel/Secret/Très secret) avec compartiments (*need-to-know*).
- **Systèmes multi-niveaux (MLS)** : une même machine traitant des données de plusieurs niveaux sans fuite entre eux.
- Inspiration directe des **contrôles MAC** modernes (SELinux, etc.) et des critères d'évaluation historiques (**Orange Book / TCSEC**).

---

## 🧠 À retenir

- **Sécurité multi-niveaux (MLS)** : **niveaux de classification** ordonnés (Non classifié < Confidentiel < Secret < Très secret) + **catégories/compartiments** non ordonnés (*need-to-know*). Un **label = (niveau, catégories)**, comparés par **domination** → ordre **partiel** = **treillis**.
- **Bell-LaPadula** = modèle de **confidentialité** (MAC). Deux règles :
  - **Propriété simple = No Read Up** : on ne **lit pas plus secret** que son habilitation (read **down** OK).
  - **Propriété étoile (\\*) = No Write Down** : on n'**écrit pas plus bas** que son habilitation (write **up** OK).
- Devise : « **lire en bas, écrire en haut** ». **Objectif** : empêcher toute **fuite vers le bas** → **neutralise le cheval de Troie** (impossible de recopier du Secret vers un niveau inférieur).
- Nuances : **tranquillité**, **sujets de confiance** (déclassification contrôlée), **ne gère pas l'intégrité**, contournable par **canaux cachés**.
- **Biba** = miroir pour l'**intégrité** : **No Read Down / No Write Up** (« lire en haut, écrire en bas »). BLP protège le **secret**, Biba protège la **fiabilité**.
- **Cas d'usage** : confidentialité **militaire/gouvernementale**, systèmes **MLS**, base des **contrôles MAC** modernes.`,
    badge: {
      id: "badge-cys-no-read-up",
      name: "No Read Up",
      icon: "Layers",
      description: "Maîtrise le treillis de sécurité et les règles Bell-LaPadula (no read up / no write down).",
    },
    challenges: [
      {
        id: "cys-blp-noreadup",
        title: "No Read Up",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⬆️ Propriété simple

La **propriété simple** (Simple Security Property) de Bell-LaPadula énonce « **No Read Up** ». Que signifie-t-elle ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "On ne lit pas au-dessus de son habilitation.", cost: 20 },
          { text: "📖 Correction : un sujet ne peut pas lire un objet de niveau supérieur au sien.", cost: 50 },
        ],
        options: [
          "Un sujet ne peut pas lire un objet classé à un niveau supérieur à son habilitation (lecture à son niveau ou en dessous)",
          "Un sujet ne peut jamais lire aucun fichier",
          "Un sujet peut lire tout ce qu'il veut sans restriction",
          "Un sujet ne peut lire qu'au-dessus de son niveau",
        ],
        answer: 0,
        explanation: `**No Read Up** : un sujet **Confidentiel** ne peut **pas lire** un document **Secret** (au-dessus de lui). La lecture est autorisée **à son niveau ou en dessous** (*read down*). C'est la **propriété simple** — elle empêche d'accéder à une information **trop sensible** pour son habilitation.`,
        tags: ["bell-lapadula", "no-read-up", "propriete-simple"],
      },
      {
        id: "cys-blp-nowritedown",
        title: "No Write Down",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## ⬇️ Propriété étoile

La **propriété étoile** (\\*-property) énonce « **No Write Down** ». Pourquoi cette règle, moins intuitive, est-elle cruciale ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Écrire vers le bas permettrait de recopier un secret vers un niveau inférieur.", cost: 30 },
          { text: "📖 Correction : interdire l'écriture vers un niveau inférieur empêche la fuite d'information (même via un cheval de Troie).", cost: 80 },
        ],
        options: [
          "Elle interdit d'écrire vers un niveau inférieur : sinon un sujet (ou un cheval de Troie) recopierait une info secrète vers un niveau plus bas → fuite",
          "Elle interdit d'écrire quoi que ce soit, jamais",
          "Elle autorise à recopier librement les données secrètes vers le bas",
          "Elle ne concerne que la lecture, pas l'écriture",
        ],
        answer: 0,
        explanation: `**No Write Down** interdit d'**écrire vers un niveau inférieur**. Sans elle, un sujet **Secret** (ou un **cheval de Troie** agissant en son nom) pourrait **recopier** une donnée secrète dans un fichier **Confidentiel** → **fuite**. L'écriture n'est permise **qu'à son niveau ou au-dessus** (*write up*). C'est ce qui garantit que l'information ne **descend jamais**.`,
        tags: ["bell-lapadula", "no-write-down", "propriete-etoile"],
      },
      {
        id: "cys-blp-devise",
        title: "La devise du modèle",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔒 Synthèse BLP

En combinant ses deux règles, quelle est la « devise » de Bell-LaPadula pour un sujet donné ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Read down + write up.", cost: 20 },
          { text: "📖 Correction : « lire en bas, écrire en haut ».", cost: 50 },
        ],
        options: [
          "« Lire en bas, écrire en haut » (read down, write up)",
          "« Lire en haut, écrire en bas »",
          "« Tout lire, tout écrire »",
          "« Ne rien lire, ne rien écrire »",
        ],
        answer: 0,
        explanation: `Bell-LaPadula = « **lire en bas, écrire en haut** » : **No Read Up** (lecture à son niveau ou en dessous) + **No Write Down** (écriture à son niveau ou au-dessus). Résultat : l'information ne peut circuler que **vers le haut**, jamais **fuir vers le bas**. (Biba, pour l'intégrité, est l'inverse : « lire en haut, écrire en bas ».)`,
        tags: ["bell-lapadula", "devise", "flux"],
      },
      {
        id: "cys-blp-treillis",
        title: "Le treillis de sécurité",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔷 Domination

Un label vaut **(niveau, catégories)**. Quand un label **A domine-t-il** un label **B** ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Il faut un niveau au moins égal ET inclure toutes les catégories de B.", cost: 30 },
          { text: "📖 Correction : niveau(A) ≥ niveau(B) ET catégories(B) ⊆ catégories(A).", cost: 80 },
        ],
        options: [
          "Si le niveau de A est ≥ celui de B ET que les catégories de B sont incluses dans celles de A",
          "Uniquement si A et B ont exactement le même niveau",
          "Si A a moins de catégories que B",
          "Toujours : tous les labels sont comparables deux à deux",
        ],
        answer: 0,
        explanation: `**A domine B** ssi **niveau(A) ≥ niveau(B)** **ET** **catégories(B) ⊆ catégories(A)**. Comme certains labels ne sont **pas comparables** (ex. (Secret, {CRYPTO}) et (Secret, {NUCLÉAIRE})), l'ensemble forme un **treillis** (ordre **partiel**), pas une simple ligne. La domination combine **niveau** et **besoin d'en connaître** (catégories).`,
        tags: ["treillis", "domination", "categories"],
      },
      {
        id: "cys-blp-biba",
        title: "Bell-LaPadula vs Biba",
        order: 5,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🔄 Confidentialité ou intégrité ?

Quelle est la différence de finalité entre **Bell-LaPadula** et **Biba** ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "L'un protège le secret (info ne descend pas), l'autre la fiabilité (corruption ne monte pas).", cost: 30 },
          { text: "📖 Correction : BLP = confidentialité ; Biba = intégrité (règles miroir).", cost: 80 },
        ],
        options: [
          "Bell-LaPadula protège la confidentialité (no read up / no write down) ; Biba protège l'intégrité (no read down / no write up)",
          "Les deux protègent exactement la même chose",
          "Bell-LaPadula protège l'intégrité et Biba la disponibilité",
          "Biba protège la confidentialité et BLP la vitesse du réseau",
        ],
        answer: 0,
        explanation: `**Bell-LaPadula** protège la **confidentialité** (« lire en bas, écrire en haut » → l'info ne **descend** pas). **Biba** est son **miroir** pour l'**intégrité** (« lire en haut, écrire en bas » → la **corruption** ne **monte** pas). Tous deux sont des modèles **MAC** formels, choisis selon qu'on veut garantir le **secret** ou la **fiabilité** des données.`,
        tags: ["biba", "integrite", "confidentialite"],
      },
      {
        id: "cys-blp-usage",
        title: "Cas d'usage",
        order: 6,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎯 Contexte historique

Dans quel contexte le modèle Bell-LaPadula a-t-il été conçu et est-il typiquement appliqué ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Un domaine où la confidentialité des documents classifiés est vitale.", cost: 10 },
          { text: "📖 Correction : le contexte militaire/gouvernemental (données classifiées).", cost: 30 },
        ],
        options: [
          "Le contexte militaire/gouvernemental, pour la confidentialité des données classifiées (multi-niveaux)",
          "L'optimisation des jeux vidéo",
          "La compression des fichiers multimédias",
          "L'accélération des calculs graphiques",
        ],
        answer: 0,
        explanation: `Bell-LaPadula est né dans le **contexte militaire/gouvernemental**, où la **confidentialité** des documents **classifiés** (Confidentiel/Secret/Très secret + compartiments *need-to-know*) est primordiale. Il fonde la **sécurité multi-niveaux (MLS)** et a inspiré les **contrôles MAC** modernes et les critères **TCSEC (Orange Book)**.`,
        tags: ["cas-usage", "militaire", "mls"],
      },
    ],
  },
];
