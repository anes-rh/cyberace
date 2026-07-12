import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 4 : détection d'une attaque MAC flooding. Lab Docker réel. */
export const module4MacFloodingDetect: CourseSeed[] = [
  {
    slug: "prat-macflood-detect",
    title: "Détection d'une attaque MAC flooding",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Watch",
    domain: "Détection réseau",
    theme: "grid",
    icon: "Monitor",
    accent: "#5B8DEF",
    order: 4,
    difficulty: "medium",
    summary:
      "Changement de camp : cette fois tu n'attaques pas, tu défends. Analyste en poste, tu surveilles un segment réseau où une alerte signale une activité suspecte. Ta mission : capturer le trafic, compter les adresses MAC sources, et confirmer qu'une attaque de MAC flooding est bien en cours.",
    objectives: [
      "Adopter la posture d'un analyste qui surveille un segment (pas d'un attaquant)",
      "Capturer le trafic en révélant les adresses MAC (tcpdump -e)",
      "Repérer une anomalie : un nombre aberrant d'adresses MAC sources",
      "Nommer l'attaque (MAC flooding / CAM overflow) et son objectif (fail-open)",
      "Connaître la contre-mesure (Port Security) et les limites du lab",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module4-macflood-noise:latest",
      ttlSec: 900, // 15 minutes — module court
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🖥️ Détection d'une attaque MAC flooding — Silent Watch

Jusqu'ici, tu étais l'**attaquant**. Ce module **inverse les rôles** : tu es désormais **analyste sécurité**, et ton travail est de **repérer** une attaque que quelqu'un d'autre mène. Mêmes outils, posture opposée. 🏎️

---

## 🧭 Le briefing

> Tu es **analyste** et tu surveilles ce **segment réseau**. Une **alerte automatique** vient de signaler une **activité inhabituelle** dessus. Le segment ne devrait héberger que **quelques hôtes légitimes** — pourtant, quelque chose ne colle pas. **Confirme l'alerte** : identifie ce qui se passe, nomme l'attaque, et sache comment on s'en protège.

**Comment jouer :** clique sur **« Démarrer le lab »**. Tu es sur le poste d'analyse (côté \`attacker\`, mais ton rôle est **défensif**). Le segment surveillé inclut l'hôte \`target\`, sur lequel tourne — à ton insu au départ — un générateur de bruit. Tu n'as **rien à déclencher** : tu **observes** et tu **diagnostiques**.

---

## 1. Rappel : la table CAM d'un commutateur 🗂️

Un **commutateur** (*switch*) n'est pas un hub : il n'envoie chaque trame **qu'au bon port**, pas à tout le monde. Pour ça, il tient une **table CAM** (*Content Addressable Memory*) qui associe chaque **adresse MAC** au **port** où elle se trouve :

\`\`\`
   Table CAM (exemple)
   ┌──────────────────────┬────────┐
   │ Adresse MAC          │ Port   │
   ├──────────────────────┼────────┤
   │ AA:BB:CC:00:00:01    │  Gi0/1 │
   │ AA:BB:CC:00:00:02    │  Gi0/2 │
   └──────────────────────┴────────┘
\`\`\`

Cette table a une **taille finie**. C'est là que réside la vulnérabilité.

---

## 2. Le MAC flooding (saturation de table CAM) 🌊

L'attaque de **MAC flooding** consiste à **inonder** le commutateur de trames portant des **adresses MAC sources aléatoires** — des milliers, très vite. L'outil classique est **\`macof\`** (fourni par *dsniff*).

Le commutateur, croyant découvrir sans cesse de **nouvelles machines**, **remplit sa table CAM** jusqu'à **saturation**.

\`\`\`
   macof ──► AA:BB:CC:11:22:33  (bidon)
         ──► DE:AD:BE:EF:00:01  (bidon)
         ──► 7F:3A:9C:...       (bidon)   × des milliers
                       ▼
              Table CAM PLEINE
\`\`\`

### L'objectif classique : le « fail-open »

Sur un **commutateur matériel bas de gamme**, une fois la table CAM **pleine**, l'appareil ne peut plus apprendre où sont les machines. Beaucoup basculent alors en mode **« fail-open »** : faute de savoir sur quel port envoyer une trame, ils la **diffusent sur TOUS les ports**, comme le ferait un **hub**. Conséquence : l'attaquant peut **écouter passivement TOUT le trafic** du segment (retour à l'écoute généralisée). C'est le but recherché.

---

## 3. ⚠️ Une nuance honnête : ce lab n'est pas un switch matériel

Il faut être **rigoureux** ici. Ce lab s'appuie sur un **pont logiciel Linux** (le bridge Docker), **pas** sur un vrai commutateur matériel avec un **ASIC** premier prix. Or la **table de correspondance MAC du noyau Linux n'a pas la même limite** qu'un switch d'entrée de gamme : **rien ne garantit** que le saturer le fasse **basculer en mode diffusion** de la même façon.

> 🧭 Autrement dit : le **fail-open** est un comportement **réel et important à connaître** sur du matériel classique, mais **on ne peut pas garantir** de le **démontrer** sur ce pont précis. C'est pourquoi **l'objectif de ce module est la DÉTECTION de l'attaque**, pas la preuve qu'elle fait basculer ce bridge en diffusion.

Ce qui est, en revanche, **parfaitement observable et vérifiable** dans ce lab : un **nombre anormal d'adresses MAC sources** sur un segment censé n'en contenir qu'une poignée. **C'est ça, ton indicateur de détection.** On ancre les tâches là-dessus — sur du concret, du mesurable.

---

## 4. Détecter : compter les adresses MAC sources 🔍

Par défaut, **\`tcpdump\` masque l'en-tête Ethernet** (donc les adresses MAC). Pour les **afficher**, il faut l'option **\`-e\`** :

\`\`\`bash
tcpdump -i eth0 -e -n
#              │  │  └── -n : ne pas résoudre les noms (plus rapide, plus lisible)
#              │  └── -e : AFFICHE les adresses MAC source/destination
#              └── interface
\`\`\`

Laisse tourner ~20-30 s et observe la colonne des **MAC sources** : sur un segment sain à 2 hôtes, tu devrais voir… **2** adresses. Sous MAC flooding, tu en verras **des dizaines**, toutes différentes et manifestement aléatoires.

Pour un **décompte précis**, isole les adresses sources et dédoublonne-les :

\`\`\`bash
tcpdump -i eth0 -e -n -c 500 2>/dev/null | awk '{print $2}' | sort -u | wc -l
\`\`\`

Un nombre **très supérieur** au nombre d'hôtes attendus = **signature nette** d'un MAC flooding en cours.

---

## 5. La contre-mesure : Port Security 🛡️

La parade, vue en **sécurité réseau (couche 2)**, est le **Port Security** : le commutateur **limite le nombre d'adresses MAC** qu'il accepte d'apprendre **par port** (souvent 1 ou 2). Dès qu'un port voit **trop** de MAC différentes — exactement ce que fait \`macof\` — le switch **réagit** : il **bloque** le port (*shutdown*, *err-disabled*), **restreint** ou **alerte**. La table CAM ne peut donc plus être saturée depuis un port utilisateur.

D'autres mesures L2 complètent la défense (**DHCP Snooping**, **Dynamic ARP Inspection** — vues au module de sécurité réseau), mais contre le **MAC flooding** précisément, c'est **Port Security** la réponse directe.

---

## 🎯 Ta mission (résumé)

1. Prends ton poste, confirme la connectivité vers le segment (\`ping target\`).
2. Capture avec les **MAC visibles** (\`tcpdump -e\`), **compte** les adresses sources.
3. **Nomme** l'attaque, son **objectif**, et sa **contre-mesure**.

## 🧠 À retenir

- Un **commutateur** dirige chaque trame via sa **table CAM** (MAC → port), de **taille finie**.
- **MAC flooding** (\`macof\`) : inonder le segment de **MAC sources aléatoires** pour **saturer** la table CAM (*CAM overflow*).
- Objectif classique : forcer le switch en **fail-open** → il **diffuse tout** comme un **hub** → **écoute passive généralisée**.
- ⚠️ **Nuance du lab** : sur un **pont logiciel Linux**, le fail-open **n'est pas garanti** comme sur un **ASIC de switch bas de gamme** → ce module vise la **détection**, pas la démonstration du basculement.
- **Détection** : \`tcpdump -i eth0 -e -n\` (le **\`-e\`** révèle les MAC) → un **nombre aberrant de MAC sources** (des dizaines pour 2 hôtes attendus) = signature du flooding. Décompte : \`… | awk '{print $2}' | sort -u | wc -l\`.
- **Contre-mesure** : **Port Security** (limite les MAC apprises par port → bloque/alerte à la saturation).`,
    badge: {
      id: "badge-prat-macflood",
      name: "Vigie du Segment",
      icon: "Siren",
      description: "A repéré une attaque MAC flooding en cours sur le segment.",
    },
    challenges: [
      {
        id: "prat-macflood-t1",
        title: "Prise de poste",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Prise de poste

Démarre le lab : tu prends ton poste d'analyste sur le segment surveillé. Confirme d'abord que le segment répond :

\`\`\`bash
ping -c 2 target
\`\`\`

**Question :** quelle **commande de base** permet de tester la connectivité vers un hôte ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "ping",
        accept: ["ping target", "ping -c 2 target", "ping -c2 target"],
        caseSensitive: false,
        explanation: `**\`ping\`** (ICMP echo) confirme que l'hôte \`target\` — et donc le segment que tu surveilles — est **joignable**. C'est le point de départ de toute investigation : vérifier qu'on observe bien le bon réseau avant de sortir les outils de capture.`,
        tags: ["macflood", "detection", "ping"],
      },
      {
        id: "prat-macflood-t2",
        title: "Voir les adresses MAC",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🏷️ Révéler les adresses MAC

Par défaut, \`tcpdump\` **masque** l'en-tête Ethernet — donc les adresses MAC, qui sont pourtant au cœur de cette enquête. Il faut les demander **explicitement**.

\`\`\`bash
tcpdump -i eth0 -e -n
\`\`\`

**Question :** quelle **option tcpdump** affiche les adresses MAC source/destination dans la capture ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "-e",
        accept: ["e"],
        caseSensitive: true,
        explanation: `L'option **\`-e\`** demande à \`tcpdump\` d'afficher l'**en-tête de liaison (Ethernet)**, révélant les **adresses MAC** source et destination de chaque trame. Sans elle, tu ne verrais que les couches IP et au-dessus — impossible alors de repérer une anomalie **au niveau MAC**.`,
        tags: ["macflood", "tcpdump", "option-e"],
      },
      {
        id: "prat-macflood-t3",
        title: "Observer l'anomalie",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔍 Observer l'anomalie

Lance la capture avec les MAC visibles et observe ~20 secondes :

\`\`\`bash
tcpdump -i eth0 -e -n
\`\`\`

Regarde défiler la colonne des **adresses MAC sources**. Le segment ne devrait héberger que **2 hôtes légitimes** (toi et \`target\`).

**Question :** combien d'adresses MAC sources **DIFFÉRENTES** observes-tu réellement en 20 secondes ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [
          { text: "Pour un décompte précis, extrais les adresses sources et dédoublonne : tcpdump -i eth0 -e -n -c 500 2>/dev/null | awk '{print $2}' | sort -u | wc -l", cost: 20 },
        ],
        options: [
          "2, comme attendu",
          "Une dizaine à peine plus que prévu",
          "Des dizaines, bien plus que les hôtes légitimes attendus",
          "Aucune adresse MAC visible",
        ],
        answer: 2,
        explanation: `Tu observes **des dizaines** d'adresses MAC sources différentes, toutes aléatoires — alors que le segment ne compte que **2** hôtes légitimes. Cet écart flagrant est la **signature** d'un **MAC flooding** : quelqu'un inonde le segment de fausses adresses pour saturer la table CAM.`,
        tags: ["macflood", "anomalie", "detection"],
      },
      {
        id: "prat-macflood-t4",
        title: "Nommer la technique",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Nommer la technique

Tu as confirmé l'anomalie : un flot d'adresses MAC sources aléatoires vise à **remplir la table CAM** du commutateur.

**Question :** quel est le **nom** de cette technique consistant à inonder un segment d'adresses MAC sources aléatoires ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [],
        answer: "MAC flooding",
        accept: ["mac flooding", "cam table overflow", "saturation de table cam"],
        caseSensitive: false,
        explanation: `C'est le **MAC flooding** (aussi appelé **CAM table overflow** / saturation de table CAM) : en générant des milliers de MAC sources bidon (via **\`macof\`**), l'attaquant **sature** la table du commutateur. Objectif : provoquer un basculement en mode diffusion (voir tâche suivante).`,
        tags: ["macflood", "cam-overflow", "nom"],
      },
      {
        id: "prat-macflood-t5",
        title: "L'objectif recherché",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🎯 L'objectif recherché

**Question :** sur un **commutateur matériel bas de gamme**, quel est le **but recherché** par un attaquant qui inonde la table CAM ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Forcer le commutateur en mode fail-open, qui se met alors à diffuser tout le trafic comme le ferait un hub",
          "Faire planter définitivement le commutateur",
          "Changer l'adresse IP du commutateur",
          "Désactiver le chiffrement du trafic",
        ],
        answer: 0,
        explanation: `Une fois sa table CAM **pleine**, un switch bas de gamme ne sait plus sur quel port envoyer les trames : beaucoup basculent en **fail-open** et se mettent à **tout diffuser**, comme un **hub**. L'attaquant peut alors **écouter passivement tout le trafic** du segment. Il ne « plante » pas le switch et ne touche ni à son IP ni au chiffrement.`,
        tags: ["macflood", "fail-open", "objectif"],
      },
      {
        id: "prat-macflood-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## 🛡️ La parade

Un commutateur correctement configuré ne se laisse pas saturer aussi facilement.

**Question :** quelle **fonctionnalité de commutateur**, qui **limite le nombre d'adresses MAC apprises par port**, empêche ce type de saturation ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "Port Security",
        accept: ["port security", "sécurité de port", "securite de port"],
        caseSensitive: false,
        explanation: `Le **Port Security** limite le nombre de MAC qu'un port accepte d'apprendre (souvent 1-2). Dès qu'un port voit **trop** d'adresses — exactement le comportement de \`macof\` — le switch **bloque** le port (*err-disabled*), le **restreint** ou **alerte**. La table CAM ne peut donc plus être saturée depuis un port utilisateur.`,
        tags: ["macflood", "port-security", "contre-mesure"],
      },
      {
        id: "prat-macflood-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

Ce module s'est concentré sur la **détection** de l'attaque, sans chercher à prouver un basculement en mode diffusion.

**Question :** pourquoi ce choix ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Parce qu'un pont logiciel Linux ne réagit pas nécessairement à la saturation comme un commutateur matériel bas de gamme",
          "Parce que macof ne fonctionne jamais dans un conteneur Docker",
          "Parce que la détection est plus rapide à coder que l'attaque elle-même",
          "Parce que tcpdump ne peut pas capturer de trafic anormal",
        ],
        answer: 0,
        explanation: `Ce lab repose sur un **pont logiciel Linux**, dont la table MAC n'a pas les mêmes limites qu'un **ASIC de switch bas de gamme** : le **fail-open n'est pas garanti**. On reste donc rigoureux — on enseigne le principe (réel sur du matériel) mais on **ancre les tâches sur ce qui est mesurable ici** : le nombre aberrant de MAC sources. \`macof\` fonctionne bien, et \`tcpdump\` capture parfaitement l'anomalie.`,
        tags: ["macflood", "synthese", "limites-lab"],
      },
    ],
  },
];
