import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 43 (Défense) : analyse hors-ligne d'une capture pcap. Lab Docker réel. */
export const module43PcapExfilAnalysis: CourseSeed[] = [
  {
    slug: "prat-defense-pcap-exfil-analysis",
    title: "Analyse pcap — repérer une exfiltration cachée",
    checkpoint: "defense",
    codename: "Silent Capture",
    domain: "Défense — Analyse de capture réseau",
    theme: "grid",
    icon: "Radar",
    accent: "#4FC4B0",
    order: 43,
    difficulty: "medium",
    summary:
      "Une capture réseau (.pcap) a été enregistrée plus tôt sur un poste suspect. Pas d'interception en direct : tout est déjà dans le fichier. À toi de l'ouvrir hors-ligne, de distinguer le trafic normal (css, image, favicon) de la seule requête anormale — une exfiltration de données encodée en base64.",
    objectives: [
      "Lire une capture enregistrée avec tcpdump (mode hors-ligne)",
      "Afficher le contenu ASCII lisible des paquets",
      "Compter et trier les requêtes HTTP d'une capture",
      "Repérer l'anomalie : un paramètre anormalement long et encodé",
      "Reconnaître un encodage base64 et le décoder pour révéler l'exfiltration",
    ],
    sandbox: {
      attackerImage: "cyberace/module43-pcap-exfil-lab:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🎣 Analyser une capture — Silent Capture

Parfois, l'attaque est déjà passée. Il reste une **capture réseau** (\`.pcap\`) enregistrée sur le disque. Ton job : l'ouvrir **hors-ligne** et y retrouver la trace de l'exfiltration. 🔬

---

## 🧭 Le briefing

> *"Une capture réseau a été enregistrée plus tôt sur un poste suspect. Aucune interception en direct n'est nécessaire ici — tout est déjà dans le fichier."*

Terminal **en root**, capture disponible dans **\`/root/capture.pcap\`**.

---

## 1. Lire une capture hors-ligne 📂

\`tcpdump\` sait **relire** un fichier \`.pcap\` au lieu de capturer en direct, avec l'option **\`-r\`** :

\`\`\`bash
tcpdump -r /root/capture.pcap          # relit la capture
\`\`\`

---

## 2. Voir le contenu lisible 🔤

Par défaut tcpdump montre les en-têtes. Pour afficher le **contenu ASCII** des paquets (utile pour lire du HTTP en clair), ajoute **\`-A\`** :

\`\`\`bash
tcpdump -r /root/capture.pcap -A
\`\`\`

Tu vois alors les requêtes HTTP en clair : \`GET /style.css?...\`, \`GET /logo.png?...\`, etc.

---

## 3. Trier le normal de l'anormal 🎯

La plupart des requêtes chargent des **ressources banales** : une feuille de style, une image, un favicon. Une seule détonne : un chemin \`/api/sync\` avec un **paramètre anormalement long** :

\`\`\`
GET /api/sync?d=Q1lCRVJBQ0V7ZXhmaWx0cmF0aW9uX3Zpc2libGVfZGFuc191bmVfY2FwdHVyZX0=
\`\`\`

Ces caractères (lettres, chiffres, \`+\`, \`/\`, un \`=\` final) sont la signature du **base64**.

---

## 4. Décoder l'exfiltration 🔓

On isole la valeur et on la décode :

\`\`\`bash
echo 'Q1lCRVJBQ0V7...fQ==' | base64 -d
\`\`\`

Et le secret exfiltré apparaît en clair. Une exfiltration « discrète » via un paramètre HTTP n'est discrète que pour qui ne regarde pas.

## 🧠 À retenir

- Relire une capture : \`tcpdump -r fichier.pcap\`. Contenu ASCII : ajouter **\`-A\`**.
- Trier le trafic : \`tcpdump -r capture.pcap -A | grep "GET "\`.
- **Anomalie** = une requête au **paramètre long et encodé**, au milieu de ressources normales.
- **base64** se reconnaît à son alphabet (A-Z a-z 0-9 + /) et son \`=\` de padding. On décode avec \`base64 -d\`.
- **Contre-mesure** : inspection du trafic **sortant** (DPI/proxy) qui repère les paramètres suspects/volumineux.`,
    badge: {
      id: "badge-prat-pcapexfil",
      name: "Archéologue de Paquets",
      icon: "Radar",
      description: "A repéré une exfiltration cachée dans une capture déjà enregistrée.",
    },
    challenges: [
      {
        id: "prat-pcapexfil-t1",
        title: "Lire hors-ligne",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 📂 Rejouer une capture

Tu ne captures pas en direct : tu relis un fichier existant.

**Question :** quelle option tcpdump lit une capture enregistrée sur disque plutôt que de capturer en direct ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "-r",
        accept: ["tcpdump -r"],
        caseSensitive: false,
        explanation: `L'option **\`-r\`** (read) fait relire à tcpdump un fichier \`.pcap\` au lieu d'écouter une interface. \`tcpdump -r /root/capture.pcap\` rejoue tout le trafic capturé — parfait pour une analyse post-incident.`,
        tags: ["defense", "pcap", "tcpdump"],
      },
      {
        id: "prat-pcapexfil-t2",
        title: "Localiser le fichier",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🗺️ Où est la capture ?

**Question :** quel fichier contient la capture à analyser ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        answer: "/root/capture.pcap",
        accept: ["capture.pcap"],
        caseSensitive: false,
        explanation: `La capture est dans **\`/root/capture.pcap\`**. C'est le fichier que tu vas relire avec \`tcpdump -r\`. Sous Linux, \`ls -la /root\` t'aurait aidé à le localiser.`,
        tags: ["defense", "pcap", "fichier"],
      },
      {
        id: "prat-pcapexfil-t3",
        title: "Compter les requêtes",
        order: 3,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔢 Combien de GET ?

Liste les requêtes HTTP GET de la capture :

\`\`\`bash
tcpdump -r /root/capture.pcap -A | grep "GET "
\`\`\`

**Question :** combien de requêtes HTTP GET distinctes apparaissent dans cette capture ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: 4,
        explanation: `**4** requêtes : \`/style.css\`, \`/logo.png\`, \`/api/sync\` et \`/favicon.ico\`. Trois sont des ressources banales ; une seule (\`/api/sync\`) porte l'exfiltration. Savoir combien de requêtes existent aide à cerner ce qui est normal.`,
        tags: ["defense", "pcap", "http"],
      },
      {
        id: "prat-pcapexfil-t4",
        title: "Voir le contenu lisible",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔤 Le mode ASCII

Pour lire le HTTP en clair dans les paquets, il faut afficher leur contenu texte.

**Question :** quelle option tcpdump affiche le contenu ASCII lisible des paquets ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "-A",
        accept: ["tcpdump -A"],
        caseSensitive: true,
        explanation: `L'option **\`-A\`** affiche la charge utile des paquets en **ASCII** : on lit alors les requêtes HTTP en clair (méthode, chemin, paramètres). Combinée à \`-r\`, elle permet de fouiller le contenu d'une capture enregistrée.`,
        tags: ["defense", "pcap", "ascii"],
      },
      {
        id: "prat-pcapexfil-t5",
        title: "Repérer l'anomalie",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 La requête qui détonne

Parmi les 4 requêtes, une seule a un paramètre anormalement long et encodé.

**Question :** quel chemin de requête se distingue des autres par un paramètre anormal ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [
          { text: "La plupart des requêtes chargent des ressources normales (css, image, favicon) — une seule a un paramètre qui ressemble à du texte encodé.", cost: 20 },
        ],
        answer: "/api/sync",
        accept: ["api/sync"],
        caseSensitive: false,
        explanation: `**\`/api/sync\`** porte un paramètre \`d=\` bien trop long pour un usage normal, fait de caractères base64. Les autres requêtes (\`style.css\`, \`logo.png\`, \`favicon.ico\`) sont des ressources légitimes. L'anomalie saute aux yeux dès qu'on compare.`,
        tags: ["defense", "pcap", "anomalie"],
      },
      {
        id: "prat-pcapexfil-t6",
        title: "Reconnaître l'encodage",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## 🧩 Quel encodage ?

Regarde la valeur du paramètre : des lettres, des chiffres, parfois \`+\` et \`/\`, et un \`=\` en fin de chaîne.

**Question :** quel encodage reconnais-tu dans cette valeur ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "base64",
        accept: ["du base64", "encodage base64"],
        caseSensitive: false,
        explanation: `C'est du **base64** : alphabet \`A-Z a-z 0-9 + /\` et **padding** \`=\` en fin. C'est l'encodage classique pour transporter des données binaires (ou du texte qu'on veut discret) dans une URL. Reconnaître base64 est un réflexe d'analyste.`,
        tags: ["defense", "base64", "encodage"],
      },
      {
        id: "prat-pcapexfil-t7",
        title: "Décoder (flag)",
        order: 7,
        difficulty: "hard",
        type: "text",
        prompt: `## 🔓 Révéler le secret

Isole la valeur du paramètre \`d=\` et décode-la :

\`\`\`bash
echo '<valeur base64>' | base64 -d
\`\`\`

**Question :** quel est le contenu décodé (flag \`CYBERACE{...}\`) ?`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "Rappelle `tcpdump -r /root/capture.pcap -A | grep api/sync` pour isoler la ligne contenant la valeur.", cost: 20 },
          { text: "Une fois la valeur base64 copiée : `echo '<valeur>' | base64 -d`.", cost: 35 },
        ],
        answer: "CYBERACE{exfiltration_visible_dans_une_capture}",
        caseSensitive: true,
        explanation: `Décodée, la valeur donne **CYBERACE{exfiltration_visible_dans_une_capture}**. L'exfiltration se voulait discrète (un simple paramètre HTTP), mais elle est **parfaitement visible** pour qui inspecte la capture — d'où le nom du flag.`,
        tags: ["defense", "flag", "base64"],
      },
      {
        id: "prat-pcapexfil-t8",
        title: "Contre-mesure",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🛡️ Empêcher la fuite

**Question :** quelle mesure défensive aurait permis de repérer ce trafic avant qu'il ne sorte du réseau ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Une inspection du trafic sortant (DPI/proxy) qui repère les paramètres suspects ou volumineux",
          "Le blocage total du port 80",
          "Le chiffrement systématique de tous les logos",
          "L'augmentation de la bande passante",
        ],
        answer: 0,
        explanation: `Une **inspection du trafic sortant** (DPI, proxy filtrant, DLP) repère les requêtes aux paramètres anormalement longs/encodés et bloque l'exfiltration avant qu'elle ne quitte le réseau. Bloquer le port 80 casserait tout le web légitime ; les autres options sont hors sujet.`,
        tags: ["defense", "dlp", "contre-mesure"],
      },
    ],
  },
];
