import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 45 (Défense) : repérer une injection SQL dans un journal web. Lab Docker réel. */
export const module45WeblogInjection: CourseSeed[] = [
  {
    slug: "prat-defense-weblog-injection",
    title: "Log web — repérer une injection SQL",
    checkpoint: "defense",
    codename: "Silent Query",
    domain: "Défense — Analyse de journaux",
    theme: "grid",
    icon: "AlertTriangle",
    accent: "#C46B4F",
    order: 45,
    difficulty: "medium",
    summary:
      "Le journal d'accès d'un site e-commerce est disponible. Au milieu de requêtes tout à fait normales, une seule ne ressemble pas à du trafic légitime : une tentative d'injection SQL, trahie par son mot-clé UNION, son User-Agent d'outil automatisé et son code d'erreur 500. À toi de la débusquer par la lecture de logs.",
    objectives: [
      "Lire un journal d'accès HTTP (access.log) et en mesurer la taille",
      "Isoler une requête malveillante par mot-clé (grep UNION)",
      "Identifier l'IP source de l'attaque",
      "Corréler User-Agent (sqlmap) et code de statut (500) comme indices",
      "Nommer la contre-mesure (WAF)",
    ],
    sandbox: {
      attackerImage: "cyberace/module45-weblog-injection-analysis:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🔎 Lire un log web — Silent Query

Tu as appris l'IDOR au Module 33 (\`/products?id=\`). Ici, même forme d'URL, mais **angle inverse** : tu ne l'exploites pas, tu la **détectes** dans les logs. 📚

---

## 🧭 Le briefing

> *"Le journal d'accès d'un site e-commerce est disponible. Une requête, parmi toutes les autres, ne ressemble pas à du trafic légitime."*

Terminal **en root**, journal dans **\`/var/log/access.log\`**.

---

## 1. Le format d'un access.log 📄

Chaque ligne d'un journal Apache/nginx suit le format « combined » :

\`\`\`
198.51.100.22 - - [18/Jul/2026:10:02:11 +0000] "GET /products?id=2 HTTP/1.1" 200 890 "-" "Mozilla/5.0"
\`\`\`

On y lit : l'**IP**, la **date**, la **requête** (\`GET /chemin\`), le **code de statut** (200, 404, 500…), la **taille**, et le **User-Agent**.

---

## 2. Isoler l'anomalie 🎯

Une injection SQL classique cherche à combiner deux requêtes avec le mot-clé **\`UNION\`**. On l'isole :

\`\`\`bash
grep UNION /var/log/access.log
\`\`\`

Une seule ligne ressort :

\`\`\`
45.33.10.77 - - [...] "GET /products?id=1' UNION SELECT username,password FROM users-- HTTP/1.1" 500 210 "-" "sqlmap/1.6"
\`\`\`

---

## 3. Trois indices convergents 🧩

Cette ligne cumule les signaux d'alerte :
1. **Le payload** : \`' UNION SELECT username,password FROM users--\` — une injection SQL manuelle et lisible.
2. **Le User-Agent** : \`sqlmap/1.6\` — un **outil d'exploitation automatisé** bien connu. Un vrai navigateur n'annonce pas « sqlmap ».
3. **Le code 500** : erreur serveur → l'injection a **perturbé** la base, signe que la requête a atteint le SQL.

Trois indices qui pointent tous vers **45.33.10.77**.

---

## 4. La contre-mesure 🛡️

Un **WAF** (Web Application Firewall) placé devant l'application filtre les motifs d'injection connus (\`UNION SELECT\`, \`' OR 1=1\`, etc.) et bloque la requête **avant** qu'elle n'atteigne le code. Côté développement : requêtes préparées / paramétrées.

## 🧠 À retenir

- \`access.log\` : IP, date, requête, **code de statut**, taille, **User-Agent**.
- Isoler une injection : \`grep UNION /var/log/access.log\`.
- **Trois indices** : payload SQL (\`UNION SELECT\`), User-Agent \`sqlmap\`, code **500** (erreur → la requête a touché la base).
- La source malveillante ici : **45.33.10.77**.
- **Contre-mesure** : **WAF** filtrant les motifs d'injection + requêtes paramétrées côté code.`,
    badge: {
      id: "badge-prat-webloginject",
      name: "Lecteur de Requêtes",
      icon: "AlertTriangle",
      description: "A repéré une tentative d'injection noyée dans du trafic normal.",
    },
    challenges: [
      {
        id: "prat-webloginject-t1",
        title: "Prise en main",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Ouvrir le journal

**Question :** quelle commande affiche le contenu d'un fichier texte (pour lire le journal) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "cat",
        accept: ["cat /var/log/access.log"],
        caseSensitive: false,
        explanation: `**\`cat\`** affiche le fichier. \`cat /var/log/access.log\` te montre les 8 lignes du journal — assez court pour être lu à l'œil, mais on va apprendre à filtrer directement l'anomalie.`,
        tags: ["defense", "weblog", "cat"],
      },
      {
        id: "prat-webloginject-t2",
        title: "Taille du journal",
        order: 2,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🔢 Compter les lignes

\`\`\`bash
wc -l /var/log/access.log
\`\`\`

**Question :** combien de lignes au total contient ce journal ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        answer: 8,
        explanation: `**8** lignes (\`wc -l\`). Un volume modeste : la difficulté n'est pas la quantité mais de **distinguer** la seule requête malveillante des 7 requêtes légitimes qui l'entourent.`,
        tags: ["defense", "weblog", "wc"],
      },
      {
        id: "prat-webloginject-t3",
        title: "Isoler le mot-clé suspect",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 Chercher UNION

Une injection SQL classique utilise le mot-clé \`UNION\`.

**Question :** quelle commande grep isole les lignes contenant le mot-clé SQL 'UNION' ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "grep UNION /var/log/access.log",
        accept: ["grep UNION"],
        caseSensitive: true,
        explanation: `\`grep UNION /var/log/access.log\` ne garde que la ligne contenant \`UNION SELECT\` — la tentative d'injection. Une seule ligne ressort, immédiatement isolée du trafic normal.`,
        tags: ["defense", "weblog", "grep"],
      },
      {
        id: "prat-webloginject-t4",
        title: "Identifier la source",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 D'où vient l'attaque ?

Lis la ligne isolée.

**Question :** quelle adresse IP est à l'origine de cette tentative d'injection ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "45.33.10.77",
        caseSensitive: true,
        explanation: `**45.33.10.77** — le premier champ de la ligne \`UNION\`. C'est l'IP à documenter dans le rapport d'incident, à bloquer et à surveiller. Les autres IP du journal (\`203.0.113.10\`, \`198.51.100.22\`…) sont du trafic légitime.`,
        tags: ["defense", "weblog", "source"],
      },
      {
        id: "prat-webloginject-t5",
        title: "Un indice supplémentaire",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧩 Le User-Agent

Regarde le dernier champ de la ligne suspecte.

**Question :** quel élément du User-Agent de cette requête renforce la suspicion ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "\"sqlmap/1.6\", identifiant un outil d'exploitation automatisé connu",
          "\"Mozilla/5.0\", un navigateur standard",
          "Aucun élément suspect n'est présent",
          "Le code de statut 200",
        ],
        answer: 0,
        explanation: `Le User-Agent **\`sqlmap/1.6\`** trahit un **outil automatisé d'injection SQL**. Un attaquant négligent ne masque pas son outil : un vrai visiteur annonce un navigateur (\`Mozilla/…\`), jamais « sqlmap ». C'est un indice de corrélation fort.`,
        tags: ["defense", "weblog", "sqlmap"],
      },
      {
        id: "prat-webloginject-t6",
        title: "Interpréter le code de statut",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📟 Que dit le code HTTP ?

**Question :** quel code de statut HTTP cette requête a-t-elle reçu, et qu'est-ce que cela suggère ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "500, suggérant que l'injection a provoqué une erreur serveur",
          "200, tout s'est bien passé sans aucune anomalie",
          "404, la page n'existe pas",
          "301, une simple redirection",
        ],
        answer: 0,
        explanation: `Le code **500** (Internal Server Error) indique que la requête a **planté** côté serveur — typiquement une injection SQL malformée qui casse la requête envoyée à la base. C'est un signe que le payload a bien atteint la couche SQL, pas juste le serveur web.`,
        tags: ["defense", "weblog", "http-500"],
      },
      {
        id: "prat-webloginject-t7",
        title: "Confirmer l'incident (flag)",
        order: 7,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Les notes d'incident

Un fichier de notes confirme l'analyse. Retrouve-le et lis-le.

\`\`\`bash
cat /root/incident_notes.txt
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` figure dans ces notes ?`,
        points: 300,
        timeLimitSec: 500,
        hints: [
          { text: "Les notes d'incident se trouvent dans le dossier personnel de root (`/root`).", cost: 25 },
        ],
        answer: "CYBERACE{injection_sql_detectee_dans_les_logs}",
        caseSensitive: true,
        explanation: `\`cat /root/incident_notes.txt\` révèle **CYBERACE{injection_sql_detectee_dans_les_logs}**. Le nom du flag résume la compétence acquise : détecter une injection SQL **par la lecture des journaux**, sans avoir observé l'attaque en direct.`,
        tags: ["defense", "flag", "incident"],
      },
      {
        id: "prat-webloginject-t8",
        title: "Contre-mesure",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🛡️ Bloquer en amont

**Question :** quelle mesure défensive aurait pu bloquer cette requête avant qu'elle n'atteigne l'application ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Un pare-feu applicatif web (WAF) filtrant les motifs d'injection connus",
          "La suppression complète des logs",
          "L'augmentation de la taille du buffer de log",
          "Le changement de format de date",
        ],
        answer: 0,
        explanation: `Un **WAF** placé devant l'application inspecte chaque requête et bloque les motifs d'injection (\`UNION SELECT\`, \`' OR 1=1\`, etc.) avant qu'ils n'atteignent le code. Supprimer les logs reviendrait à se rendre aveugle ; les autres options n'ont aucun effet défensif.`,
        tags: ["defense", "waf", "contre-mesure"],
      },
    ],
  },
];
