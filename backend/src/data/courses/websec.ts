import type { CourseSeed } from "../../types";

export const websec: CourseSeed = {
  slug: "web-appsec",
  title: "Sécurité des applications web",
  codename: "Injection Alley",
  domain: "Web AppSec",
  theme: "alley",
  icon: "Bug",
  accent: "#4ade80",
  order: 14,
  difficulty: "hard",
  summary:
    "Module bonus. XSS, IDOR, JWT forgé et données XOR-obfusquées : arpente la ruelle des injections et referme chaque trou.",
  objectives: [
    "Distinguer les types de XSS et leur remédiation",
    "Reconnaître une faille IDOR / BOLA",
    "Comprendre l'attaque JWT alg:none",
    "Décoder un secret masqué par XOR à un octet",
  ],
  lesson: `## XSS — injecter du script

Le **Cross-Site Scripting** exécute du JavaScript dans le navigateur d'une victime :
- **Reflected** : la charge revient dans la réponse (lien piégé).
- **Stored** : la charge est stockée (commentaire) et frappe tous les visiteurs.
- **DOM-based** : le script est injecté côté client via le DOM.

Parade : **encodage de sortie** contextuel, **CSP**, et jamais d'\`innerHTML\` avec des données non fiables.

## IDOR / BOLA

L'**Insecure Direct Object Reference** (alias *Broken Object Level Authorization*) : l'appli utilise un identifiant fourni par l'utilisateur (\`/facture?id=1024\`) **sans vérifier** qu'il lui appartient. Changer l'id donne accès aux données d'autrui. Parade : contrôle d'autorisation **côté serveur** sur chaque objet.

## JWT mal validé

Un **JWT** = header.payload.signature (base64url). Deux pièges :
- **alg:none** : si le serveur fait confiance au champ \`alg\` du header, un attaquant le met à \`none\`, retire la signature et forge n'importe quel token.
- **Secret faible** : signature HS256 cassable par dictionnaire.

Parade : imposer l'algorithme côté serveur, secret fort, vérifier \`exp\`/\`aud\`.

## Obfuscation XOR

Beaucoup de malwares et de challenges cachent une chaîne par **XOR à un octet** : \`clair = chiffré XOR clé\`. Réversible : re-XORer avec la même clé restaure le clair. Ce n'est pas du chiffrement sérieux, juste de l'obscurcissement.`,
  badge: {
    id: "badge-web-breaker",
    name: "Web Breaker",
    icon: "Bug",
    description: "Sait exploiter et corriger les failles applicatives web courantes.",
  },
  challenges: [
    {
      id: "web-xss-type",
      title: "Charge persistante",
      order: 1,
      difficulty: "easy",
      type: "mcq",
      points: 120,
      timeLimitSec: 160,
      prompt:
        "Une charge XSS déposée dans un **commentaire** frappe ensuite **chaque** visiteur de la page. De quel type de XSS s'agit-il ?",
      options: ["Stored (persistant)", "Reflected", "DOM-based", "Self-XSS"],
      answer: 0,
      hints: [{ text: "La charge est enregistrée puis rejouée pour tout le monde.", cost: 15 }],
      explanation:
        "Stockée en base et resservie à tous, c'est une XSS **stored** — la plus dangereuse. La reflected dépend d'un lien piégé, la DOM-based se joue côté client.",
      tags: ["xss", "stored"],
    },
    {
      id: "web-idor",
      title: "L'id des autres",
      order: 2,
      difficulty: "medium",
      type: "mcq",
      points: 210,
      timeLimitSec: 200,
      prompt:
        "En passant de `/facture?id=1024` à `/facture?id=1025`, tu vois la facture d'un autre client. Quelle faille est-ce ?",
      options: [
        "IDOR / BOLA (autorisation au niveau objet manquante)",
        "XSS reflected",
        "SQL injection",
        "CSRF",
      ],
      answer: 0,
      hints: [{ text: "Référence directe à un objet, sans contrôle d'appartenance.", cost: 30 }],
      explanation:
        "C'est une IDOR (Broken Object Level Authorization) : le serveur ne vérifie pas que l'objet demandé appartient à l'utilisateur. Le contrôle doit être côté serveur, sur chaque accès.",
      tags: ["idor", "bola", "authz"],
    },
    {
      id: "web-jwt-none",
      title: "Signature facultative",
      order: 3,
      difficulty: "medium",
      type: "text",
      points: 220,
      timeLimitSec: 200,
      prompt:
        "Un serveur fait confiance au champ `alg` du header JWT fourni par le client.\n\nQuelle **valeur de `alg`** permet de forger un token **sans signature valide** ?",
      hints: [
        { text: "Elle signifie « aucun algorithme ».", cost: 30 },
        { text: "alg = none", cost: 45 },
      ],
      answer: "none",
      accept: ["none", "alg:none", "alg none", "\"none\""],
      explanation:
        "En mettant `alg:none`, l'attaquant supprime la signature ; un serveur qui accepte l'algorithme du header valide alors n'importe quel payload. Il faut imposer l'algorithme côté serveur.",
      tags: ["jwt", "alg-none"],
    },
    {
      id: "web-xor-flag",
      title: "XOR à un octet",
      order: 4,
      difficulty: "hard",
      type: "text",
      points: 330,
      timeLimitSec: 300,
      widget: "cipher-lab",
      prompt:
        "Une chaîne est obfusquée par **XOR à un octet**. Données interceptées :\n\n- Ciphertext (hex) : `706a717661727076686b7c616e`\n- Clé : `0x13`\n\nRetrouve le flag en clair (onglet XOR de l'outil).",
      hints: [
        { text: "XOR est réversible : re-XORer le chiffré avec 0x13 redonne le clair.", cost: 40 },
        { text: "Le premier octet : 0x70 XOR 0x13 = 0x63 = 'c'.", cost: 55 },
      ],
      answer: "cyberace{xor}",
      accept: ["CYBERACE{XOR}"],
      explanation:
        "Chaque octet XOR 0x13 restaure le clair : 706a71… → cyberace{xor}. Le XOR à un octet n'est qu'un obscurcissement, trivial à inverser.",
      tags: ["xor", "obfuscation", "crypto"],
    },
  ],
};
