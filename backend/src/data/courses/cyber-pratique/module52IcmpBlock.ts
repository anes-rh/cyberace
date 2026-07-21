import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 52 (Défense) : blocage ICMP ciblé d'un canal caché. Réutilise la cible du Module 9. */
export const module52IcmpBlock: CourseSeed[] = [
  {
    slug: "prat-defense-icmp-block",
    title: "Blocage ICMP ciblé — couper un canal caché sans tout casser",
    checkpoint: "defense",
    codename: "Silent Filter",
    domain: "Défense — Filtrage réseau",
    theme: "grid",
    icon: "ShieldOff",
    accent: "#4F9BC4",
    order: 52,
    difficulty: "medium",
    summary:
      "Le canal caché ICMP détecté au Module 9 est toujours actif. Cette fois, tu le coupes chirurgicalement : une règle iptables qui bloque uniquement les requêtes d'echo ICMP de cet hôte, sans toucher au reste de ses échanges. Le filtrage de précision plutôt que le blocage total.",
    objectives: [
      "Reconfirmer l'activité ICMP suspecte (tcpdump)",
      "Cibler le protocole ICMP dans iptables (-p icmp)",
      "Cibler un type ICMP précis (--icmp-type echo-request)",
      "Écrire une règle DROP chirurgicale et la vérifier",
      "Comprendre pourquoi cibler finement, et les limites de l'approche",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module9-icmp-exfil:latest",
      ttlSec: 900,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🎯 Blocage ICMP ciblé — Silent Filter

Au Module 9, tu as **détecté** un canal caché dans des paquets ICMP echo. Ici, tu le **coupes** — mais avec un scalpel, pas une masse. 🔪

---

## 🧭 Le briefing

> *"Le canal caché ICMP que tu avais détecté au Module 9 est toujours actif. Cette fois, coupe-le précisément — sans bloquer le reste des échanges légitimes avec cet hôte."*

\`attacker\` a **NET_RAW** + **NET_ADMIN**. \`target\` émet un motif caché dans des ICMP echo toutes les ~6 s.

---

## 1. Reconfirmer 🔍

\`\`\`bash
tcpdump -i eth0 icmp        # ne garde que l'ICMP
\`\`\`

---

## 2. Cibler finement dans iptables 🎛️

iptables peut cibler le **protocole** ET le **type** précis :

- \`-p icmp\` : le protocole ICMP.
- \`--icmp-type echo-request\` : uniquement les **requêtes d'echo** (le « ping »), pas les réponses ni les autres messages ICMP.

---

## 3. La règle chirurgicale 🚫

\`\`\`bash
iptables -A INPUT -s target -p icmp --icmp-type echo-request -j DROP
\`\`\`

On ne bloque que **les echo-request entrants venant de target** : le canal caché est coupé, mais si cet hôte a d'autres échanges (TCP, DNS…), ils restent intacts.

---

## 4. Vérifier + limites 📊

\`iptables -L -v -n\` : le compteur DROP monte, et une nouvelle capture ne montre plus ces ICMP suspects.

**Limite honnête** : un attaquant déterminé peut **basculer vers un autre canal** (DNS, HTTP…) pour contourner ce blocage précis. Le filtrage ciblé traite le symptôme observé, pas la capacité générale d'exfiltration.

## 🧠 À retenir

- Capturer l'ICMP : \`tcpdump -i eth0 icmp\`.
- Cibler : \`-p icmp\` (protocole) + \`--icmp-type echo-request\` (type précis).
- Règle : \`iptables -A INPUT -s target -p icmp --icmp-type echo-request -j DROP\`.
- **Chirurgical** : on coupe le canal caché sans casser les autres échanges éventuellement légitimes.
- **Limite** : l'attaquant peut changer de canal (DNS, HTTP…). Le filtrage ciblé n'est pas une parade universelle.`,
    badge: {
      id: "badge-prat-icmpblock",
      name: "Filtreur Chirurgical",
      icon: "ShieldOff",
      description: "A coupé un canal caché précis sans toucher au reste du trafic.",
    },
    challenges: [
      {
        id: "prat-icmpblock-t1",
        title: "Reconfirmer",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔍 Capturer l'ICMP

**Question :** quelle commande tcpdump ne capture que le trafic ICMP ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "tcpdump -i eth0 icmp",
        accept: ["tcpdump icmp"],
        caseSensitive: false,
        explanation: `\`tcpdump -i eth0 icmp\` filtre uniquement l'ICMP : on y voit les echo-request réguliers de \`target\` porteurs du motif caché (cf. Module 9).`,
        tags: ["defense", "icmp", "tcpdump"],
      },
      {
        id: "prat-icmpblock-t2",
        title: "Cibler le protocole",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎛️ L'option protocole

**Question :** quelle option iptables cible spécifiquement le protocole ICMP ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "-p icmp",
        caseSensitive: true,
        explanation: `\`-p icmp\` restreint la règle au **protocole** ICMP. Sans elle, la règle s'appliquerait à tout protocole — trop large ici.`,
        tags: ["defense", "iptables", "icmp"],
      },
      {
        id: "prat-icmpblock-t3",
        title: "Cibler le type précis",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 Le type d'ICMP

**Question :** quelle option iptables cible précisément les requêtes d'echo (ping), plutôt que tout le protocole ICMP ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "--icmp-type echo-request",
        accept: ["icmp-type echo-request"],
        caseSensitive: false,
        explanation: `\`--icmp-type echo-request\` ne vise que les **requêtes d'echo** (type 8) — le vecteur du canal caché. Les autres messages ICMP (echo-reply, destination-unreachable…) ne sont pas affectés.`,
        tags: ["defense", "iptables", "icmp-type"],
      },
      {
        id: "prat-icmpblock-t4",
        title: "Écrire la règle",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚫 La règle complète

**Question :** quelle commande complète bloque uniquement les requêtes d'echo ICMP entrantes depuis 'target' ?`,
        points: 250,
        timeLimitSec: 500,
        hints: [],
        answer: "iptables -A INPUT -s target -p icmp --icmp-type echo-request -j DROP",
        caseSensitive: true,
        explanation: `\`iptables -A INPUT -s target -p icmp --icmp-type echo-request -j DROP\` combine source (\`-s target\`), protocole (\`-p icmp\`) et type (\`--icmp-type echo-request\`) pour un DROP ultra-ciblé : seul le canal caché tombe.`,
        tags: ["defense", "iptables", "drop"],
      },
      {
        id: "prat-icmpblock-t5",
        title: "Pourquoi cibler si précisément",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🤔 Précision vs blocage total

**Question :** pourquoi bloquer uniquement ce type ICMP précis, plutôt que tout le trafic de cet hôte comme aux Modules 42/47 ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Cela coupe le canal caché exploité sans supprimer d'autres échanges éventuellement légitimes avec cet hôte",
          "C'est techniquement impossible de bloquer tout le trafic d'un hôte",
          "ICMP ne peut jamais être bloqué avec iptables",
          "Cela n'a aucune différence pratique avec un blocage total",
        ],
        answer: 0,
        explanation: `Le blocage ciblé **préserve** les échanges légitimes de l'hôte (par ex. s'il rend un service utile par ailleurs) tout en fermant le canal abusé. C'est une réponse proportionnée, adaptée quand on ne veut pas isoler complètement la machine.`,
        tags: ["defense", "icmp", "precision"],
      },
      {
        id: "prat-icmpblock-t6",
        title: "Vérifier",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📊 La preuve

**Question :** quelle vérification confirme que la règle fonctionne ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Le compteur de paquets DROP associé à la règle augmente dans `iptables -L -v -n`, et plus aucun paquet ICMP suspect n'apparaît dans une nouvelle capture tcpdump",
          "Le conteneur cible redémarre automatiquement",
          "Le port 22 devient inaccessible",
          "Aucune vérification n'est possible",
        ],
        answer: 0,
        explanation: `Double confirmation : le **compteur DROP** monte dans \`iptables -L -v -n\`, ET une nouvelle capture \`tcpdump -i eth0 icmp\` ne montre plus les echo-request de \`target\`. Le canal est bien coupé.`,
        tags: ["defense", "iptables", "verification"],
      },
      {
        id: "prat-icmpblock-t7",
        title: "Limite de cette approche",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 La faille du ciblage

**Question :** quelle est une limite de ce blocage protocole-spécifique ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Un attaquant déterminé pourrait basculer vers un autre canal caché (DNS, HTTP...) pour contourner ce blocage précis",
          "iptables ne peut bloquer qu'ICMP",
          "Cette règle bloque automatiquement tout le reste du trafic",
          "Cela ralentit le CPU de façon significative",
        ],
        answer: 0,
        explanation: `Bloquer **un** canal (ICMP echo) ne supprime pas la **capacité** d'exfiltration : l'attaquant peut migrer vers DNS, HTTP, etc. Le filtrage ciblé traite le symptôme observé — d'où l'importance de le combiner avec de la détection comportementale.`,
        tags: ["defense", "icmp", "limites"],
      },
      {
        id: "prat-icmpblock-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Détecter puis neutraliser

**Question :** en quoi ce module prolonge-t-il le Module 9 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Il passe de la simple détection du canal caché à sa neutralisation ciblée",
          "Il n'a aucun lien avec le Module 9",
          "Il bloque un protocole différent de celui vu au Module 9",
          "Il nécessite une élévation de privilèges, contrairement au Module 9",
        ],
        answer: 0,
        explanation: `Le Module 9 **détectait** l'exfiltration ICMP ; ce module la **neutralise** par une règle de filtrage précise. Détection → action, le fil rouge de la série défense.`,
        tags: ["defense", "icmp", "synthese"],
      },
    ],
  },
];
