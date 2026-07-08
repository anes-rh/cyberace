import type { CourseSeed } from "../../../types";

/** Système — Module 7 : synchronisation, sémaphores, deadlock (TD Master pont). */
export const synchronisation: CourseSeed[] = [
  {
    slug: "se-synchronisation",
    title: "Synchronisation & sémaphores",
    checkpoint: "systeme-exploitation",
    codename: "Traffic Control",
    domain: "Système — Concurrence",
    theme: "track",
    icon: "Cog",
    accent: "#E8A87C",
    order: 7,
    difficulty: "hard",
    summary:
      "Quand plusieurs processus/threads touchent une ressource partagée, tout peut casser. Section critique, exclusion mutuelle, sémaphores (P/V), producteur-consommateur, interblocage (deadlock) et ses 4 conditions — avec l'exercice du pont à sens unique décliné en défis progressifs.",
    objectives: [
      "Comprendre une condition de course (race condition) et la section critique",
      "Assurer l'exclusion mutuelle (mutex, sémaphore binaire)",
      "Utiliser un sémaphore (P/V, sem_wait/sem_post) pour compter des ressources",
      "Résoudre le producteur-consommateur (tampon borné)",
      "Identifier un interblocage (deadlock) et ses 4 conditions ; le prévenir",
    ],
    lesson: `# 🚦 Synchronisation & sémaphores — Traffic Control

Deux processus qui incrémentent le même compteur « en même temps »… et le résultat est faux. Bienvenue dans la **concurrence** : sans coordination, le partage de ressources vire au chaos. On va poser des **feux de circulation** logiciels. 🏎️

---

## 1. La condition de course (race condition) 💥

Regarde ce compteur partagé, incrémenté par deux threads :

\`\`\`
 compteur++  n'est PAS atomique. En réalité :
   1) lire compteur    (registre ← 5)
   2) ajouter 1        (registre = 6)
   3) écrire compteur  (compteur ← 6)
\`\`\`

Si deux threads s'entrelacent entre ces étapes, ils **lisent tous les deux 5**, écrivent tous les deux 6 → on a perdu une incrémentation ! Le résultat **dépend du timing** : c'est une **condition de course**.

> ⚠️ Une race condition est **sournoise** : le programme « marche » 99 fois sur 100, puis donne un résultat faux. D'où la nécessité de la **synchronisation**.

---

## 2. Section critique & exclusion mutuelle 🔒

La **section critique** est le morceau de code qui **accède à la ressource partagée** (ici \`compteur++\`). Règle : **un seul** processus à la fois dans la section critique → **exclusion mutuelle** (*mutual exclusion*, mutex).

\`\`\`
   … code ordinaire …
   [ ENTRER en section critique ]   ← verrou
      compteur++;                    ← accès exclusif
   [ SORTIR de section critique ]    ← déverrou
   … code ordinaire …
\`\`\`

Trois propriétés d'une bonne solution :
- **Exclusion mutuelle** : jamais deux dans la section critique en même temps.
- **Progression** : si la section est libre, un candidat peut entrer (pas de blocage inutile).
- **Attente bornée** : personne n'attend indéfiniment (pas de famine).

---

## 3. Le sémaphore : P et V ⚙️

Un **sémaphore** est un **compteur** protégé, muni de deux opérations **atomiques** (Dijkstra) :

| Opération | Autre nom | Effet |
|---|---|---|
| **P(s)** | *wait* / \`sem_wait\` | décrémente \`s\` ; si \`s < 0\`, **bloque** le processus |
| **V(s)** | *signal* / \`sem_post\` | incrémente \`s\` ; **réveille** un processus bloqué |

- **Sémaphore binaire** (initialisé à **1**) = **mutex** = exclusion mutuelle :
\`\`\`
   P(mutex);      // sem_wait : je prends le verrou
      compteur++; // section critique
   V(mutex);      // sem_post : je rends le verrou
\`\`\`
- **Sémaphore compteur** (initialisé à **N**) = gérer **N ressources identiques** (ex. N places de parking) : chaque \`P\` prend une place, chaque \`V\` en libère une.

En C (POSIX) : \`sem_t s; sem_init(&s, 0, 1); sem_wait(&s); … sem_post(&s);\`.

---

## 4. Producteur-consommateur (tampon borné) 🏭

Un **producteur** remplit un tampon de taille N ; un **consommateur** le vide. Il faut :
- **ne pas produire** si le tampon est **plein** ;
- **ne pas consommer** si le tampon est **vide** ;
- **un seul** à la fois sur le tampon (exclusion mutuelle).

On utilise **trois** sémaphores :
\`\`\`
 vide  = N   // nombre de cases LIBRES (le producteur en a besoin)
 plein = 0   // nombre de cases OCCUPÉES (le consommateur en a besoin)
 mutex = 1   // exclusion mutuelle sur le tampon

 PRODUCTEUR              CONSOMMATEUR
  P(vide)                 P(plein)
  P(mutex)                P(mutex)
    déposer                 retirer
  V(mutex)                V(mutex)
  V(plein)                V(vide)
\`\`\`

> 🧠 Ordre crucial : on prend **d'abord** le sémaphore de comptage (\`vide\`/\`plein\`), **puis** le \`mutex\`. L'inverse peut provoquer un **interblocage**.

---

## 5. L'interblocage (deadlock) 🔗💀

Un **interblocage** : deux processus s'attendent **mutuellement**, aucun n'avance. Classique : P1 tient A et veut B, P2 tient B et veut A.

**Les 4 conditions de Coffman** (toutes nécessaires pour un deadlock) :
1. **Exclusion mutuelle** : ressource non partageable.
2. **Détention et attente** : on garde une ressource **et** on en demande une autre.
3. **Non préemption** : on ne peut pas **arracher** une ressource à son détenteur.
4. **Attente circulaire** : une **boucle** P1→P2→…→P1 d'attentes.

**Casser une seule** de ces conditions **prévient** le deadlock. Exemple simple et efficace : imposer un **ordre global** d'acquisition des ressources (toujours prendre A avant B) → plus d'attente circulaire.

---

## 6. Le pont à sens unique 🌉 (TD)

Un **pont étroit** ne laisse passer les voitures que **dans un seul sens à la fois**. C'est un problème de synchronisation classique, décliné en plusieurs niveaux :

**Niveau 1 — Exclusion mutuelle stricte (une seule voiture) :** le pont = une ressource unique, protégé par un sémaphore binaire (mutex).
\`\`\`
 P(pont);  traverser();  V(pont);
\`\`\`

**Niveau 2 — Plusieurs voitures du MÊME sens :** on autorise plusieurs voitures dans le sens Nord tant qu'aucune ne vient du Sud (et inversement). C'est un **lecteurs-rédacteurs** déguisé : la **première** voiture d'un sens « verrouille » le pont pour son sens, la **dernière** le libère. On compte les voitures par sens (protégé par un mutex).
\`\`\`
 Sens Nord (entrée) :
   P(mutexN); nbNord++;
     si nbNord == 1 : P(pont);   // 1re du sens → prend le pont
   V(mutexN);
   traverser();
   P(mutexN); nbNord--;
     si nbNord == 0 : V(pont);   // dernière du sens → libère le pont
   V(mutexN);
\`\`\`

**Niveau 3 — Équité (éviter la famine d'un sens) :** si le Nord passe en continu, le Sud attend **pour toujours**. On ajoute un sémaphore « **tourniquet** » (*turnstile*) ou une **file FIFO** qui force l'alternance : après un lot d'un sens, on laisse passer l'autre. C'est le rôle de la **gestion de priorité / FIFO** du TD.

> 🎯 Le pont illustre la montée en difficulté : d'abord l'exclusion **stricte**, puis le **partage** par groupe, puis l'**équité** — exactement la logique des exercices sur sémaphores.

---

## 🧠 Ce qu'il faut retenir

- Une **race condition** apparaît quand des accès concurrents non synchronisés à une ressource donnent un résultat qui **dépend du timing**.
- La **section critique** doit être en **exclusion mutuelle** (un seul à la fois) — via **mutex** / sémaphore binaire.
- **Sémaphore** : \`P\`/\`sem_wait\` (prend, bloque si indispo), \`V\`/\`sem_post\` (rend, réveille). Binaire = mutex ; compteur = N ressources.
- **Producteur-consommateur** : 3 sémaphores (\`vide\`, \`plein\`, \`mutex\`) ; prendre le comptage **avant** le mutex.
- **Deadlock** : 4 conditions de Coffman (exclusion, détention+attente, non préemption, attente circulaire) ; en **casser une** prévient (ex. ordre global des verrous).
- Le **pont à sens unique** monte en niveaux : exclusion stricte → partage par sens → équité (anti-famine).

## ⚠️ Erreurs fréquentes des débutants

**1. Croire que \`compteur++\` est atomique.** Non : lire-modifier-écrire en 3 temps → race condition sans verrou.

**2. Oublier de faire \`V\` (sem_post).** Un \`P\` sans \`V\` correspondant → les autres **bloquent pour toujours** (verrou jamais rendu).

**3. Prendre les verrous dans le désordre.** Dans producteur-consommateur, inverser \`P(mutex)\` et \`P(vide/plein)\` peut **interbloquer**. Toujours comptage **puis** mutex.

**4. Confondre sémaphore binaire et compteur.** Binaire (init 1) = exclusion mutuelle ; compteur (init N) = N ressources disponibles.

**5. Négliger la famine.** L'exclusion mutuelle ne suffit pas : sans **équité** (FIFO/tourniquet), un sens/processus peut attendre indéfiniment.`,
    badge: {
      id: "badge-traffic-control",
      name: "Traffic Control",
      icon: "Cog",
      description: "Maîtrise section critique, sémaphores (P/V), producteur-consommateur et prévention des deadlocks.",
    },
    challenges: [
      {
        id: "se-sync-race",
        title: "Pourquoi ça casse",
        order: 1,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 💥 Race condition

Deux threads font chacun \`compteur++\` mille fois sur un compteur partagé (départ 0). À la fin, on obtient parfois **moins de 2000**. Pourquoi ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "compteur++ = lire, +1, écrire. Que se passe-t-il si deux threads lisent la même valeur ?", cost: 20 },
          { text: "📖 Correction : incrément non atomique → deux threads lisent la même valeur et écrasent l'incrément de l'autre.", cost: 50 },
        ],
        options: [
          "compteur++ n'est pas atomique : deux threads lisent la même valeur puis écrivent, écrasant un incrément",
          "Le CPU est trop lent pour compter jusqu'à 2000",
          "La variable déborde (overflow)",
          "Les threads s'exécutent forcément l'un après l'autre",
        ],
        answer: 0,
        explanation: `\`compteur++\` se décompose en **lire → +1 → écrire**. Si les deux threads **lisent 5** avant que l'un ait écrit, ils écrivent tous deux **6** : une incrémentation est **perdue**. Le résultat **dépend de l'entrelacement** (timing) → **condition de course**. La correction : mettre \`compteur++\` en **section critique** (mutex).`,
        tags: ["synchronisation", "race-condition", "atomicite"],
      },
      {
        id: "se-sync-pv",
        title: "P et V",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## ⚙️ Opérations d'un sémaphore

Que fait l'opération **P** (aussi appelée \`wait\` / \`sem_wait\`) sur un sémaphore ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "P décrémente ; si ça devient négatif, le processus…?", cost: 15 },
          { text: "📖 Correction : décrémente le compteur, et bloque le processus si la ressource est indisponible.", cost: 40 },
        ],
        options: [
          "Elle décrémente le sémaphore ; si la ressource est indisponible, elle bloque le processus",
          "Elle incrémente le sémaphore et réveille un processus",
          "Elle supprime le sémaphore",
          "Elle affiche la valeur du sémaphore",
        ],
        answer: 0,
        explanation: `**P** (\`sem_wait\`) **décrémente** le sémaphore : si le résultat indique qu'il n'y a **plus de ressource** (compteur devenu négatif / nul), le processus est **bloqué** jusqu'à ce qu'une ressource se libère. **V** (\`sem_post\`) fait l'inverse : **incrémente** et **réveille** un bloqué. P = « je prends », V = « je rends ».`,
        tags: ["synchronisation", "semaphore", "PV"],
      },
      {
        id: "se-sync-mutex-c",
        title: "Protéger la section critique",
        order: 3,
        difficulty: "hard",
        type: "code",
        language: "c",
        prompt: `## 🔒 Exclusion mutuelle en C

Un sémaphore binaire \`sem_t mutex\` est initialisé à **1**. Encadre l'accès à \`compteur\` par les bons appels POSIX pour garantir l'**exclusion mutuelle**.

Complète la section critique (prends le verrou avant \`compteur++\`, rends-le après).`,
        points: 300,
        timeLimitSec: 600,
        starter: `// mutex déjà initialisé à 1 : sem_init(&mutex, 0, 1);
// ... dans chaque thread :

compteur++;   // <-- à protéger

`,
        hints: [
          { text: "sem_wait(&mutex); avant, sem_post(&mutex); après.", cost: 30 },
          { text: "📖 Correction :\n```\nsem_wait(&mutex);\ncompteur++;\nsem_post(&mutex);\n```", cost: 70 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Prend le verrou avant (sem_wait)", pattern: "sem_wait\\s*\\(\\s*&?mutex", flags: "i" },
            { label: "Accède à la ressource partagée", pattern: "compteur\\s*\\+\\+", flags: "" },
            { label: "Rend le verrou après (sem_post)", pattern: "sem_post\\s*\\(\\s*&?mutex", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
sem_wait(&mutex);   // P : prend le verrou (bloque si déjà pris)
compteur++;         // section critique : accès EXCLUSIF
sem_post(&mutex);   // V : rend le verrou (réveille un attendant)
\`\`\`
Le sémaphore binaire (init **1**) garantit qu'**un seul** thread est entre \`sem_wait\` et \`sem_post\` à la fois → plus de race condition. **Piège** : oublier \`sem_post\` bloquerait tous les autres threads pour toujours.`,
        tags: ["synchronisation", "mutex", "c", "semaphore"],
      },
      {
        id: "se-sync-prodcons",
        title: "Producteur-consommateur : les sémaphores",
        order: 4,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🏭 Tampon borné

Pour un producteur-consommateur avec un tampon de **N** cases, on utilise **trois** sémaphores. Coche les **rôles corrects** :`,
        points: 300,
        timeLimitSec: 480,
        options: [
          "vide initialisé à N : compte les cases LIBRES (le producteur fait P(vide))",
          "plein initialisé à 0 : compte les cases OCCUPÉES (le consommateur fait P(plein))",
          "mutex initialisé à 1 : exclusion mutuelle sur le tampon",
          "vide initialisé à 0 : compte les producteurs actifs",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "vide = cases libres (N au départ), plein = cases occupées (0 au départ), mutex = 1.", cost: 30 },
          { text: "📖 Correction : vide=N (libres), plein=0 (occupées), mutex=1. La 4e est fausse.", cost: 70 },
        ],
        explanation: `Trois sémaphores : **\`vide\`=N** (cases **libres**, le producteur en consomme une par \`P(vide)\`), **\`plein\`=0** (cases **occupées**, le consommateur fait \`P(plein)\`), **\`mutex\`=1** (accès exclusif au tampon). Le producteur : \`P(vide) → P(mutex) → déposer → V(mutex) → V(plein)\`. Le consommateur est symétrique. **Ordre** : comptage **avant** mutex, sinon deadlock possible.`,
        tags: ["synchronisation", "producteur-consommateur", "semaphore"],
      },
      {
        id: "se-sync-deadlock",
        title: "Les 4 conditions du deadlock",
        order: 5,
        difficulty: "hard",
        type: "multi",
        prompt: `## 🔗 Coffman

Coche les **conditions nécessaires** (conditions de Coffman) pour qu'un **interblocage** puisse se produire :`,
        points: 300,
        timeLimitSec: 480,
        options: [
          "Exclusion mutuelle (ressource non partageable)",
          "Détention et attente (garder une ressource tout en en demandant une autre)",
          "Attente circulaire (une boucle d'attentes P1→P2→…→P1)",
          "Le processeur possède un seul cœur",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Il y a 4 conditions ; le nombre de cœurs n'en fait pas partie. (La 4e est la non-préemption.)", cost: 30 },
          { text: "📖 Correction : exclusion mutuelle, détention+attente, attente circulaire (+ non-préemption). Pas le nombre de cœurs.", cost: 70 },
        ],
        explanation: `Les **4 conditions de Coffman** (toutes nécessaires) : **exclusion mutuelle**, **détention et attente**, **non préemption** (non listée ici), et **attente circulaire**. Le **nombre de cœurs** n'a rien à voir. **Casser une seule** condition prévient le deadlock — ex. imposer un **ordre global** d'acquisition brise l'attente circulaire.`,
        tags: ["synchronisation", "deadlock", "coffman"],
      },
      {
        id: "se-sync-pont1",
        title: "Le pont — exclusion stricte",
        order: 6,
        difficulty: "medium",
        type: "code",
        language: "c",
        prompt: `## 🌉 Pont, niveau 1

Version simple du **pont à sens unique** : **une seule voiture** sur le pont à la fois. Un sémaphore binaire \`sem_t pont\` est initialisé à **1**.

Écris la traversée d'une voiture : prendre le pont, traverser (\`traverser();\` est fourni), libérer le pont.`,
        points: 250,
        timeLimitSec: 480,
        starter: `// pont initialisé à 1 : sem_init(&pont, 0, 1);
`,
        hints: [
          { text: "sem_wait(&pont); traverser(); sem_post(&pont);", cost: 25 },
          { text: "📖 Correction :\n```\nsem_wait(&pont);\ntraverser();\nsem_post(&pont);\n```", cost: 60 },
        ],
        answer: JSON.stringify({
          minRatio: 0.8,
          keypoints: [
            { label: "Prend le pont (sem_wait)", pattern: "sem_wait\\s*\\(\\s*&?pont", flags: "i" },
            { label: "Traverse", pattern: "traverser\\s*\\(\\s*\\)", flags: "i" },
            { label: "Libère le pont (sem_post)", pattern: "sem_post\\s*\\(\\s*&?pont", flags: "i" },
          ],
        }),
        explanation: `\`\`\`c
sem_wait(&pont);   // P : entre sur le pont (attend s'il est occupé)
traverser();
sem_post(&pont);   // V : libère le pont
\`\`\`
Le sémaphore binaire (init 1) sérialise l'accès : **une voiture** à la fois. C'est le niveau de base ; le niveau suivant autorise **plusieurs voitures du même sens** (la 1re prend le pont, la dernière le libère), et le niveau final ajoute l'**équité** (FIFO/tourniquet) pour ne pas affamer un sens.`,
        tags: ["synchronisation", "pont", "semaphore", "c"],
      },
      {
        id: "se-sync-pont2",
        title: "Le pont — plusieurs voitures d'un sens",
        order: 7,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🌉 Pont, niveau 2

On veut autoriser **plusieurs voitures du même sens** simultanément (mais jamais les deux sens en même temps). Quelle technique utilise-t-on ?

*(Reprise du TD pont / lecteurs-rédacteurs.)*`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "On compte les voitures d'un sens ; la PREMIÈRE prend le pont, la DERNIÈRE le libère.", cost: 25 },
          { text: "📖 Correction : compteur par sens protégé par un mutex ; 1re du sens fait P(pont), dernière fait V(pont).", cost: 60 },
        ],
        options: [
          "Un compteur par sens (protégé par un mutex) : la 1re voiture du sens prend le pont, la dernière le libère",
          "Un seul sémaphore binaire, comme au niveau 1",
          "On supprime le pont",
          "Chaque voiture prend le pont puis le rend immédiatement",
        ],
        answer: 0,
        explanation: `C'est le schéma **lecteurs-rédacteurs** : on maintient un **compteur** de voitures pour chaque sens (protégé par un **mutex**). Quand \`nbSens\` passe de 0 à 1, la **première** voiture fait \`P(pont)\` (verrouille le pont **pour son sens**) ; quand il revient à 0, la **dernière** fait \`V(pont)\`. Ainsi plusieurs voitures d'un même sens cohabitent, mais l'autre sens attend. **Reste** à gérer l'**équité** (niveau 3) pour ne pas affamer le sens opposé.`,
        tags: ["synchronisation", "pont", "lecteurs-redacteurs"],
      },
      {
        id: "se-sync-pont3",
        title: "Le pont — équité",
        order: 8,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🌉 Pont, niveau 3

Au niveau 2, si des voitures arrivent **sans cesse** au Nord, les voitures du **Sud** peuvent attendre **indéfiniment**. Comment garantir l'**équité** ?`,
        points: 250,
        timeLimitSec: 420,
        hints: [
          { text: "Il faut forcer l'alternance / faire attendre les nouveaux arrivants d'un sens quand l'autre attend.", cost: 25 },
          { text: "📖 Correction : un tourniquet / une file FIFO qui force l'alternance des sens (anti-famine).", cost: 60 },
        ],
        options: [
          "Ajouter un tourniquet / une file FIFO qui force l'alternance des sens (anti-famine)",
          "Augmenter la vitesse des voitures",
          "Élargir le pont pour les deux sens (ce n'est plus le même problème)",
          "Supprimer le compteur de voitures",
        ],
        answer: 0,
        explanation: `Le niveau 2 assure l'exclusion entre sens mais **pas l'équité** : un flux continu au Nord **affame** le Sud. On ajoute un **tourniquet** (*turnstile*) ou une **file FIFO** : après qu'un lot d'un sens est passé, on **bloque** les nouveaux arrivants de ce sens pour laisser passer l'autre → **alternance**. C'est la « gestion de priorité et de FIFO » du TD : garantir qu'aucun sens n'attend pour toujours.`,
        tags: ["synchronisation", "pont", "equite", "famine"],
      },
    ],
  },
];
