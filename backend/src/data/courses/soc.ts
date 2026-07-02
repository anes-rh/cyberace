import type { CourseSeed } from "../../types";

export const soc: CourseSeed = {
  slug: "soc-detection",
  title: "SOC & Détection",
  codename: "Blue Siren",
  domain: "SOC / Détection",
  theme: "radar",
  icon: "Siren",
  accent: "#34d399",
  order: 6,
  difficulty: "medium",
  summary:
    "Endosse le bleu : écris des règles Suricata, orchestre une pile ELK et distingue une vraie alerte du bruit.",
  objectives: [
    "Lire l'anatomie d'une règle Suricata",
    "Connaître les champs obligatoires d'une signature",
    "Ordonner les composants d'une pile ELK",
    "Distinguer détection par signature et par anomalie",
  ],
  lesson: `## Le SOC en un coup d'œil

Un **SOC** (Security Operations Center) surveille, détecte et répond. Ses outils : un **IDS/IPS** (Suricata, Snort), un **SIEM** (corrélation de logs) et parfois un **EDR** (endpoints).

## Anatomie d'une règle Suricata

    action  protocole  ip_src port_src -> ip_dst port_dst (options)

Exemple :

    alert tcp any any -> $HOME_NET 80 (msg:"HTTP suspect"; content:"/etc/passwd"; sid:1000001; rev:1;)

- **action** : \`alert\` (journalise), \`drop\` (bloque en IPS), \`pass\`, \`reject\`.
- **content** : motif recherché dans la charge utile.
- **sid** : identifiant **unique et obligatoire** de la règle. \`rev\` en donne la version.
- Modificateurs utiles : \`nocase\`, \`http.uri\`, \`flow\`, \`threshold\`.

## La pile ELK

Le pipeline classique : **Beats** (collecte sur les hôtes) → **Logstash** (parsing/enrichissement) → **Elasticsearch** (indexation/recherche) → **Kibana** (dashboards & requêtes KQL). On y bâtit des tableaux de bord et des règles de détection.

## Signature vs anomalie

- **Signature** : compare à des motifs connus (rapide, peu de faux positifs, aveugle au 0-day).
- **Anomalie / comportemental** : modélise le « normal » et alerte sur l'écart (détecte l'inconnu, plus de faux positifs).

Un bon analyste **réduit le bruit** : seuils, listes d'exclusion, corrélation — pour ne pas noyer le vrai signal.`,
  badge: {
    id: "badge-threat-hunter",
    name: "Threat Hunter",
    icon: "Siren",
    description: "Sait écrire des détections et opérer une pile de supervision.",
  },
  challenges: [
    {
      id: "soc-suricata-action",
      title: "Alerter sans bloquer",
      order: 1,
      difficulty: "easy",
      type: "mcq",
      points: 110,
      timeLimitSec: 150,
      prompt:
        "Quelle **action** Suricata journalise l'événement **sans** couper la connexion (mode IDS) ?",
      options: ["alert", "drop", "reject", "pass"],
      answer: 0,
      hints: [{ text: "drop et reject coupent ; pass laisse passer sans journaliser.", cost: 15 }],
      explanation:
        "`alert` génère une alerte sans bloquer (IDS). `drop`/`reject` nécessitent le mode IPS en ligne ; `pass` ignore la règle.",
      tags: ["suricata", "ids"],
    },
    {
      id: "soc-suricata-sid",
      title: "L'identifiant obligatoire",
      order: 2,
      difficulty: "medium",
      type: "text",
      points: 190,
      timeLimitSec: 200,
      prompt:
        "Dans les options d'une règle Suricata, **quel mot-clé** fournit l'identifiant unique et **obligatoire** de la règle ?\n\n    alert tcp any any -> any 443 (msg:\"test\"; ____:1000002; rev:1;)",
      hints: [{ text: "Trois lettres : Signature ID.", cost: 25 }],
      answer: "sid",
      accept: ["sid", "signature id", "signature-id"],
      explanation:
        "Le `sid` (Signature ID) identifie la règle de façon unique ; sans lui, Suricata refuse de charger la règle. `rev` en indique la révision.",
      tags: ["suricata", "sid"],
    },
    {
      id: "soc-elk-order",
      title: "Le pipeline ELK",
      order: 3,
      difficulty: "medium",
      type: "order",
      points: 240,
      timeLimitSec: 240,
      prompt:
        "Remets les composants dans **l'ordre du flux de données** (de la collecte à la visualisation) :",
      options: [
        "Kibana (visualisation)",
        "Beats (collecte sur l'hôte)",
        "Elasticsearch (indexation)",
        "Logstash (parsing & enrichissement)",
      ],
      answer: [1, 3, 2, 0],
      hints: [{ text: "La donnée est d'abord collectée, puis transformée, indexée, enfin affichée.", cost: 35 }],
      explanation:
        "Flux : Beats → Logstash → Elasticsearch → Kibana. Beats collecte, Logstash transforme, Elasticsearch indexe et rend cherchable, Kibana visualise.",
      tags: ["elk", "pipeline"],
    },
    {
      id: "soc-signature-anomaly",
      title: "Connu ou inconnu ?",
      order: 4,
      difficulty: "hard",
      type: "mcq",
      points: 320,
      timeLimitSec: 200,
      prompt:
        "Un malware **jamais vu** (0-day) contourne toutes les règles de motif. Quelle **approche de détection** a la meilleure chance de le repérer ?",
      options: [
        "La détection par anomalie / comportementale",
        "La détection par signature stricte",
        "Une liste blanche d'IP",
        "Le simple filtrage par port",
      ],
      answer: 0,
      hints: [{ text: "Une signature ne connaît que le déjà-vu.", cost: 40 }],
      explanation:
        "La détection par anomalie modélise le comportement normal et alerte sur l'écart : elle peut repérer l'inconnu, au prix de plus de faux positifs. Les signatures sont aveugles au 0-day.",
      tags: ["detection", "anomalie", "0day"],
    },
  ],
};
