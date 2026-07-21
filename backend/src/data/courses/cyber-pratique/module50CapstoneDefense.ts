import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 50 (Défense) : capstone — investigation complète (logs → pcap → confinement). Clôt la série défense. */
export const module50CapstoneDefense: CourseSeed[] = [
  {
    slug: "prat-defense-capstone",
    title: "Capstone défense — de l'investigation au confinement",
    checkpoint: "defense",
    codename: "Silent Resolution",
    domain: "Défense — Synthèse",
    theme: "grid",
    icon: "ShieldCheck",
    accent: "#4FA65E",
    order: 50,
    difficulty: "hard",
    summary:
      "Le boss de la série défense. Une alerte a été levée. Tu disposes d'un journal d'authentification et d'une capture réseau déjà enregistrés : commence par comprendre ce qui s'est passé (source SSH compromise, marqueur de balise dans le pcap), puis termine par contenir la menace toujours active sur le réseau. Investigation ET action, de bout en bout.",
    objectives: [
      "Identifier la source compromise dans un journal d'authentification",
      "Relire une capture réseau et y retrouver le marqueur de corrélation",
      "Confirmer l'incident via le rapport final (flag)",
      "Confiner l'hôte encore actif (entrant + sortant)",
      "Synthétiser le fil rouge de toute la série défense",
    ],
    sandbox: {
      attackerImage: "cyberace/module50-capstone-defense:latest",
      targetImage: "cyberace/module18-beacon-noise:latest",
      ttlSec: 1200,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🏁 Capstone défense — Silent Resolution

Dix modules pour apprendre à **détecter**, **analyser** et **agir**. Ce dernier lab les rassemble : un incident complet, du journal jusqu'au confinement. 🎓

---

## 🧭 Le briefing

> *"Une alerte a été levée. Tu disposes d'un journal d'authentification et d'une capture réseau déjà enregistrés — commence par comprendre ce qui s'est passé, puis termine par contenir la menace toujours active sur le réseau."*

\`attacker\` a **NET_RAW** + **NET_ADMIN**. L'hôte \`target\` (Module 18) « bat » encore.

---

## 1. Volet investigation 🔍

**Le journal** (\`/var/log/auth.log\`) — trouve la connexion réussie :

\`\`\`bash
grep Accepted /var/log/auth.log        # → 198.51.100.44 a réussi
\`\`\`

**La capture** (\`/root/capture.pcap\`) — retrouve le marqueur de corrélation :

\`\`\`bash
tcpdump -r /root/capture.pcap -A | grep beacon    # node=silent-beacon-node
\`\`\`

Ce marqueur \`silent-beacon-node\` relie la capture à l'hôte qui bat sur le réseau : même acteur, deux volets.

**Le rapport final** (\`/root/final_report.txt\`) confirme la corrélation et clôt l'investigation avec le flag.

---

## 2. Volet action — confiner ✂️

L'hôte \`target\` est toujours actif : on le met en quarantaine **bidirectionnelle** (comme au Module 47) :

\`\`\`bash
iptables -A INPUT  -s target -j DROP
iptables -A OUTPUT -d target -j DROP
\`\`\`

On confine dans les deux sens car un compromis **reçoit** des ordres **et** **exfiltre/relaie**.

---

## 3. Le fil rouge de la série 🧵

De 41 à 50, un même mouvement : passer de la **détection/analyse passive** (lire des logs, une capture, un certificat) à l'**action concrète de réponse** (durcir, bloquer, confiner). L'analyste ne se contente pas de constater : il **agit**.

## 🧠 À retenir

- **Investigation** : \`grep Accepted auth.log\` (source réussie) + \`tcpdump -r capture.pcap -A | grep beacon\` (marqueur).
- **Corrélation** : le même acteur relie journal SSH et capture réseau.
- **Confinement bidirectionnel** : \`iptables -A INPUT -s target -j DROP\` **et** \`iptables -A OUTPUT -d target -j DROP\`.
- **On confirme avant d'agir** : le flag (tâche 5) clôt l'investigation, puis vient le confinement.
- **Fil rouge 41→50** : de la détection passive à la réponse active.`,
    badge: {
      id: "badge-prat-defcapstone",
      name: "Résolution Complète",
      icon: "ShieldCheck",
      description: "A mené une investigation de bout en bout, des journaux jusqu'au confinement.",
    },
    challenges: [
      {
        id: "prat-defcapstone-t1",
        title: "Le journal",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Ouvrir le journal

**Question :** quelle commande affiche le contenu d'un fichier texte ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "cat",
        accept: ["cat /var/log/auth.log"],
        caseSensitive: false,
        explanation: `**\`cat\`** — le réflexe de base. \`cat /var/log/auth.log\` ouvre le journal d'authentification, point de départ de l'investigation.`,
        tags: ["defense", "capstone", "cat"],
      },
      {
        id: "prat-defcapstone-t2",
        title: "La source compromise",
        order: 2,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 Qui a réussi ?

\`\`\`bash
grep Accepted /var/log/auth.log
\`\`\`

**Question :** d'après \`/var/log/auth.log\`, quelle adresse IP a réussi une connexion SSH ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "198.51.100.44",
        caseSensitive: true,
        explanation: `**198.51.100.44** obtient la ligne \`Accepted password for root\`. Comme au Module 41, on ne se fie pas au volume mais à la connexion **réussie** pour désigner la source compromise.`,
        tags: ["defense", "capstone", "ssh"],
      },
      {
        id: "prat-defcapstone-t3",
        title: "La capture",
        order: 3,
        difficulty: "easy",
        type: "text",
        prompt: `## 📂 Rejouer la capture

**Question :** quelle option tcpdump lit une capture enregistrée sur disque ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        answer: "-r",
        accept: ["tcpdump -r"],
        caseSensitive: false,
        explanation: `L'option **\`-r\`** relit un fichier \`.pcap\`. \`tcpdump -r /root/capture.pcap\` rejoue le trafic capturé — le volet réseau de l'investigation.`,
        tags: ["defense", "capstone", "pcap"],
      },
      {
        id: "prat-defcapstone-t4",
        title: "Le marqueur de corrélation",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔗 Relier les volets

\`\`\`bash
tcpdump -r /root/capture.pcap -A | grep beacon
\`\`\`

**Question :** quel identifiant apparaît dans le paramètre 'node=' d'une requête suspecte de la capture ?`,
        points: 200,
        timeLimitSec: 450,
        hints: [],
        answer: "silent-beacon-node",
        caseSensitive: false,
        explanation: `Le paramètre \`node=**silent-beacon-node**\` apparaît dans une requête de la capture. Ce marqueur relie la capture à l'hôte qui « bat » sur le réseau (le beacon du Module 18) : c'est l'**IOC de corrélation** entre les volets.`,
        tags: ["defense", "capstone", "correlation"],
      },
      {
        id: "prat-defcapstone-t5",
        title: "Confirmer la corrélation (flag)",
        order: 5,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le rapport final

\`\`\`bash
cat /root/final_report.txt
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` clôt l'investigation ?`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "Le rapport final se trouve dans le dossier personnel de root (`/root`).", cost: 25 },
        ],
        answer: "CYBERACE{investigation_complete_logs_pcap_confinement}",
        caseSensitive: true,
        explanation: `\`cat /root/final_report.txt\` → **CYBERACE{investigation_complete_logs_pcap_confinement}**. Le flag valide la corrélation (compromission SSH + balise sortante) et clôt le volet investigation. On peut passer à l'action.`,
        tags: ["defense", "capstone", "flag"],
      },
      {
        id: "prat-defcapstone-t6",
        title: "Passer au confinement — entrant",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## ⬇️ Couper l'entrée

L'hôte compromis \`target\` est toujours actif. Confine-le.

**Question :** quelle commande bloque tout trafic ENTRANT depuis l'hôte compromis 'target' ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "iptables -A INPUT -s target -j DROP",
        caseSensitive: true,
        explanation: `\`iptables -A INPUT -s target -j DROP\` coupe tout ce qui **vient** de \`target\`. Première moitié de la quarantaine.`,
        tags: ["defense", "capstone", "iptables"],
      },
      {
        id: "prat-defcapstone-t7",
        title: "Confinement — sortant",
        order: 7,
        difficulty: "medium",
        type: "text",
        prompt: `## ⬆️ Couper la sortie

**Question :** quelle commande bloque aussi le trafic SORTANT vers ce même hôte ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "iptables -A OUTPUT -d target -j DROP",
        caseSensitive: true,
        explanation: `\`iptables -A OUTPUT -d target -j DROP\` empêche ta machine d'**émettre** vers \`target\`. Avec la règle INPUT, le confinement est complet et bidirectionnel.`,
        tags: ["defense", "capstone", "iptables"],
      },
      {
        id: "prat-defcapstone-t8",
        title: "Pourquoi les deux sens",
        order: 8,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔄 Entrant ET sortant

**Question :** pourquoi confiner dans les deux sens plutôt qu'un seul ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Un hôte compromis peut recevoir des instructions ou exfiltrer des données",
          "Le sens sortant n'a jamais d'importance",
          "iptables ne fonctionne que dans un sens à la fois",
          "Cela ralentit le confinement",
        ],
        answer: 0,
        explanation: `Un compromis est dangereux dans les deux sens : il **reçoit** des ordres (entrant) et **exfiltre/relaie** (sortant). Ne bloquer qu'un sens laisse la menace à moitié active — la leçon du Module 47.`,
        tags: ["defense", "capstone", "confinement"],
      },
      {
        id: "prat-defcapstone-t9",
        title: "Synthèse finale de la série",
        order: 9,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Le fil conducteur

**Question :** quel a été le fil conducteur de cette série de dix modules dédiés à la défense (41 à 50) ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Passer de la détection/analyse passive à une action concrète de réponse (durcissement, blocage, confinement)",
          "Toutes les techniques nécessitaient une élévation de privilèges",
          "Seule l'analyse de logs a été abordée",
          "Aucun fil conducteur ne relie ces modules",
        ],
        answer: 0,
        explanation: `Le fil rouge de la série : **de la détection passive à l'action**. Lire des logs (41, 45, 48), une capture (43), un certificat (49), c'est constater ; durcir (44), bloquer (42), confiner (47, 50), c'est **répondre**. L'analyste défensif fait les deux — et ce capstone l'a prouvé de bout en bout.`,
        tags: ["defense", "capstone", "synthese"],
      },
    ],
  },
];
