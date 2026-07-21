import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 60 (Défense) : capstone 2 — investigation multi-vecteurs. Clôt la série 51-60. Réutilise la cible du Module 30. */
export const module60CapstoneDefense2: CourseSeed[] = [
  {
    slug: "prat-defense-capstone2",
    title: "Capstone défense 2 — recouper plusieurs persistances puis confiner",
    checkpoint: "defense",
    codename: "Silent Second Watch",
    domain: "Défense — Synthèse",
    theme: "grid",
    icon: "ShieldCheck",
    accent: "#4FA65E",
    order: 60,
    difficulty: "hard",
    summary:
      "Le boss de la 2e série. Ce système montre plusieurs signes de compromission : un processus déguisé en thread noyau (Module 55), un mécanisme ld.so.preload actif (Module 56), et un hôte du réseau qui tente une usurpation ARP contre toi (Module 30). Recoupe chaque piste, confirme par le rapport, puis termine par le confinement réseau bidirectionnel.",
    objectives: [
      "Repérer le processus masquerading et le vérifier (/proc/PID/exe)",
      "Trouver la persistance ld.so.preload",
      "Confirmer l'investigation via le rapport final",
      "Détecter la menace réseau ARP (technique du Module 30)",
      "Confiner l'hôte compromis (entrant + sortant)",
    ],
    sandbox: {
      attackerImage: "cyberace/module60-capstone-defense2:latest",
      targetImage: "cyberace/module30-arp-flap-rogue:latest",
      ttlSec: 1200,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
      network: { subnet: "10.70.0.0/24", gateway: "10.70.0.1" },
      targetStaticIp: "10.70.0.30",
      attackerStaticIp: "10.70.0.20",
    },
    lesson: `# 🏁 Capstone défense 2 — Silent Second Watch

Dix modules pour traquer la **persistance** et l'**usurpation**. Ce dernier lab les recoupe : plusieurs indices sur une même machine, à corréler, avant de conclure par un confinement réseau. 🎓

---

## 🧭 Le briefing

> *"Ce système montre plusieurs signes de compromission : un processus qui se fait passer pour un thread noyau, un mécanisme de préchargement système actif, et un hôte du réseau qui tente une usurpation ARP contre toi. Recoupe chaque piste, puis termine par le confinement réseau."*

\`attacker\` (**10.70.0.20**) a **NET_RAW** + **NET_ADMIN**. \`target\` (**10.70.0.30**) rejoue l'usurpation ARP du Module 30 contre la passerelle **10.70.0.1**.

---

## 1. Artefact 1 — processus masquerading (Module 55) 👻

\`\`\`bash
ps aux                       # repère [kworker/0:2]
ls -la /proc/PID/exe         # → /bin/sleep : un faux thread noyau
\`\`\`

Un vrai thread noyau n'a **pas** de \`/proc/PID/exe\` valide. Celui-ci en a un → imposteur.

---

## 2. Artefact 2 — ld.so.preload (Module 56) 🧬

\`\`\`bash
cat /etc/ld.so.preload       # rempli = suspect (normalement vide)
\`\`\`

Il force le préchargement d'une bibliothèque dans quasiment tous les processus → persistance système-entière.

---

## 3. Confirmer, puis détecter la menace réseau 🌐

Le rapport final (\`/root/final_report.txt\`) confirme les deux persistances + une quarantaine à poser. Puis on détecte l'ARP hostile (Module 30) :

\`\`\`bash
tcpdump -i eth0 -e arp and host 10.70.0.1        # faux ARP visant la passerelle
\`\`\`

---

## 4. Confiner 🚧

\`\`\`bash
iptables -A INPUT  -s target -j DROP
iptables -A OUTPUT -d target -j DROP
\`\`\`

Confinement **bidirectionnel** (Module 47) : l'hôte compromis ne reçoit plus rien et n'émet plus rien.

---

## 🧵 Le fil rouge de la série 51-60

Détecter des **mécanismes de persistance et d'usurpation variés** — processus, fichiers système, cron, clés, PATH, réseau — plutôt que de simples flux réseau bruyants (la 1re série). L'analyste recoupe des indices hétérogènes pour reconstituer une compromission.

## 🧠 À retenir

- **Processus** : \`ps aux\` + \`/proc/PID/exe\` (faux kworker → \`/bin/sleep\`).
- **Fichier** : \`/etc/ld.so.preload\` rempli = persistance globale.
- **Réseau** : \`tcpdump -i eth0 -e arp and host 10.70.0.1\` (ARP hostile).
- **Confinement** : \`iptables -A INPUT -s target -j DROP\` **et** \`-A OUTPUT -d target -j DROP\`.
- On **confirme** (rapport/flag) avant d'**agir** (confinement).`,
    badge: {
      id: "badge-prat-defcapstone2",
      name: "Veille Complète",
      icon: "ShieldCheck",
      description: "A recoupé plusieurs mécanismes de persistance avant de conclure par un confinement réseau.",
    },
    challenges: [
      {
        id: "prat-defcapstone2-t1",
        title: "Lister les processus",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 📋 Les processus

**Question :** quelle commande liste tous les processus avec leur ligne de commande complète ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "ps aux",
        accept: ["ps -ef"],
        caseSensitive: false,
        explanation: `**\`ps aux\`** — le point de départ. On y repère le nom déguisé \`[kworker/0:2]\`.`,
        tags: ["defense", "capstone2", "ps"],
      },
      {
        id: "prat-defcapstone2-t2",
        title: "Le processus masquerade",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 👻 Le faux thread noyau

**Question :** quel nom de processus imite la convention de nommage des threads noyau ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: ["[kworker/0:2]", "ttyd", "bash", "sleep"],
        answer: 0,
        explanation: `**\`[kworker/0:2]\`** copie la convention des threads noyau (Module 55). C'est le premier artefact de compromission.`,
        tags: ["defense", "capstone2", "masquerade"],
      },
      {
        id: "prat-defcapstone2-t3",
        title: "Vérifier ce processus",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔍 Ce qui le trahit

**Question :** qu'est-ce qu'un authentique thread noyau ne possède jamais, contrairement à ce processus ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Un /proc/PID/exe valide pointant vers un exécutable réel",
          "Un PID",
          "Une entrée dans ps aux",
          "Un état RUNNING",
        ],
        answer: 0,
        explanation: `Un vrai thread noyau n'a **pas** de \`/proc/PID/exe\` valide. Ce faux kworker en a un (\`/bin/sleep\`) → imposteur confirmé, comme au Module 55.`,
        tags: ["defense", "capstone2", "proc-exe"],
      },
      {
        id: "prat-defcapstone2-t4",
        title: "Le second artefact",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🧬 La persistance fichier

**Question :** quel fichier, normalement absent ou vide sur un système sain, révèle un second mécanisme de persistance ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "/etc/ld.so.preload",
        caseSensitive: false,
        explanation: `**\`/etc/ld.so.preload\`** rempli = persistance système-entière (Module 56). Deuxième vecteur indépendant du processus déguisé : on recoupe.`,
        tags: ["defense", "capstone2", "ldpreload"],
      },
      {
        id: "prat-defcapstone2-t5",
        title: "Comprendre ce mécanisme",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚙️ L'effet du fichier

**Question :** à quoi sert ce fichier lorsqu'il est rempli ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Il force le préchargement d'une bibliothèque dans quasiment tous les processus dynamiquement liés du système",
          "Il chiffre le disque",
          "Il désactive le réseau",
          "Il n'affecte qu'un seul processus",
        ],
        answer: 0,
        explanation: `\`/etc/ld.so.preload\` fait précharger la bibliothèque listée dans **presque tous** les processus — un rootkit userland persistant (Module 56).`,
        tags: ["defense", "capstone2", "mecanisme"],
      },
      {
        id: "prat-defcapstone2-t6",
        title: "Confirmer l'investigation (flag)",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le rapport final

\`\`\`bash
cat /root/final_report.txt
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` conclut l'investigation ?`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "Le rapport final se trouve dans le dossier personnel de root (`/root`).", cost: 25 },
        ],
        answer: "CYBERACE{investigation_defense_multi_vecteurs}",
        caseSensitive: true,
        explanation: `\`cat /root/final_report.txt\` → **CYBERACE{investigation_defense_multi_vecteurs}**. Le flag valide la corrélation des artefacts (processus + ld.so.preload) et l'usurpation ARP. Place à l'action.`,
        tags: ["defense", "capstone2", "flag"],
      },
      {
        id: "prat-defcapstone2-t7",
        title: "Détecter la menace réseau",
        order: 7,
        difficulty: "medium",
        type: "text",
        prompt: `## 🌐 L'ARP hostile

**Question :** quelle commande, vue au Module 30, capture spécifiquement le trafic ARP concernant la passerelle (10.70.0.1) ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: "tcpdump -i eth0 -e arp and host 10.70.0.1",
        caseSensitive: true,
        explanation: `\`tcpdump -i eth0 -e arp and host 10.70.0.1\` isole les paquets ARP visant la passerelle : on y voit \`target\` (10.70.0.30) prétendre être la passerelle — l'usurpation ARP du Module 30.`,
        tags: ["defense", "capstone2", "arp"],
      },
      {
        id: "prat-defcapstone2-t8",
        title: "Bloquer l'entrant",
        order: 8,
        difficulty: "medium",
        type: "text",
        prompt: `## ⬇️ Confinement — entrant

**Question :** quelle commande bloque le trafic ENTRANT depuis l'hôte compromis 'target' ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "iptables -A INPUT -s target -j DROP",
        caseSensitive: true,
        explanation: `\`iptables -A INPUT -s target -j DROP\` coupe tout ce qui vient de \`target\` — première moitié de la quarantaine (Module 47).`,
        tags: ["defense", "capstone2", "iptables"],
      },
      {
        id: "prat-defcapstone2-t9",
        title: "Bloquer le sortant",
        order: 9,
        difficulty: "medium",
        type: "text",
        prompt: `## ⬆️ Confinement — sortant

**Question :** quelle commande bloque aussi le trafic SORTANT vers ce même hôte ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "iptables -A OUTPUT -d target -j DROP",
        caseSensitive: true,
        explanation: `\`iptables -A OUTPUT -d target -j DROP\` complète le confinement : plus aucun échange dans un sens comme dans l'autre. La menace ARP est neutralisée.`,
        tags: ["defense", "capstone2", "iptables"],
      },
      {
        id: "prat-defcapstone2-t10",
        title: "Synthèse finale de la série",
        order: 10,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Le fil conducteur

**Question :** quel a été le fil conducteur de cette deuxième série de dix modules défense (51 à 60) ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Détecter des mécanismes de persistance et d'usurpation variés (processus, fichiers système, cron, clés, PATH, réseau) plutôt que de simples flux réseau bruyants",
          "Toutes les techniques nécessitaient une élévation de privilèges",
          "Seule l'analyse réseau a été abordée",
          "Aucun fil conducteur ne relie ces modules",
        ],
        answer: 0,
        explanation: `Là où la 1re série (41-50) analysait surtout des flux réseau, celle-ci traque la **persistance** et l'**usurpation** sous toutes leurs formes : webshell, cron encodée, clé SSH, ld.so.preload, PATH, processus/connexion déguisés, ARP. L'analyste recoupe des indices variés pour démasquer une compromission installée dans la durée.`,
        tags: ["defense", "capstone2", "synthese"],
      },
    ],
  },
];
