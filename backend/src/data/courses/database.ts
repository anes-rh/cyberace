import type { CourseSeed } from "../../types";

export const database: CourseSeed = {
  slug: "database-security",
  title: "Sécurité des bases de données",
  codename: "Query Vault",
  domain: "Bases de données",
  theme: "vault",
  icon: "Database",
  accent: "#facc15",
  order: 8,
  difficulty: "medium",
  summary:
    "Verrouille l'accès aux données ligne par ligne avec Oracle VPD, puis répare des requêtes qui saignent par injection SQL.",
  objectives: [
    "Comprendre le fine-grained access control (Oracle VPD)",
    "Reconnaître une injection SQL par tautologie",
    "Corriger une requête vulnérable (requêtes paramétrées)",
    "Mener une injection UNION (détection du nombre de colonnes)",
  ],
  lesson: `## Oracle VPD : la sécurité au niveau ligne

**VPD (Virtual Private Database)**, alias *Fine-Grained Access Control*, attache une **fonction de politique** à une table. À chaque requête, Oracle appelle cette fonction qui **renvoie un prédicat** (une condition WHERE) automatiquement ajouté. Exemple : \`return 'departement = SYS_CONTEXT(''ctx'',''dept'')';\` ⇒ chaque utilisateur ne voit que les lignes de son département, **sans réécrire l'application**. C'est transparent, centralisé et difficile à contourner côté client.

## Injection SQL : le classique qui ne meurt pas

Quand une entrée utilisateur est **concaténée** dans une requête, l'attaquant change la logique :

    SELECT * FROM users WHERE user='$u' AND pass='$p';

Avec \`$u = admin' --\`, la requête devient :

    SELECT * FROM users WHERE user='admin' --' AND pass='...';

Le \`--\` commente la vérification du mot de passe : authentification contournée. La **tautologie** \`' OR '1'='1\` renvoie toutes les lignes.

### Injection UNION

Pour exfiltrer d'autres tables, on aligne les colonnes : \`ORDER BY n\` révèle le nombre de colonnes (erreur quand n dépasse), puis \`UNION SELECT ...\` récupère les données.

## La parade

- **Requêtes paramétrées / bind variables** : la donnée n'est jamais interprétée comme du code.
- **Moindre privilège** sur le compte applicatif.
- **Validation/allowlist** des entrées, ORM prudent, WAF en défense en profondeur.`,
  badge: {
    id: "badge-vault-keeper",
    name: "Vault Keeper",
    icon: "Database",
    description: "Sait cloisonner les données et neutraliser les injections SQL.",
  },
  challenges: [
    {
      id: "db-vpd",
      title: "Politique invisible",
      order: 1,
      difficulty: "easy",
      type: "mcq",
      points: 120,
      timeLimitSec: 160,
      prompt: "Que fait concrètement une politique **Oracle VPD** ?",
      options: [
        "Elle ajoute automatiquement un prédicat WHERE à chaque requête (filtrage au niveau ligne)",
        "Elle chiffre le disque de la base",
        "Elle bloque tout accès réseau à la base",
        "Elle supprime les colonnes sensibles physiquement",
      ],
      answer: 0,
      hints: [{ text: "VPD = Virtual Private Database = fine-grained access control.", cost: 20 }],
      explanation:
        "VPD attache une fonction qui renvoie un prédicat, ajouté de façon transparente à chaque requête : chaque utilisateur ne voit que ses lignes.",
      tags: ["vpd", "oracle", "row-level"],
    },
    {
      id: "db-sqli-tautology",
      title: "Contourne le login",
      order: 2,
      difficulty: "medium",
      type: "mcq",
      points: 210,
      timeLimitSec: 240,
      prompt:
        "La requête d'authentification est :\n\n    SELECT * FROM users WHERE user='$u' AND pass='$p';\n\nQuelle valeur de **$u** contourne la vérification du mot de passe ?",
      options: [
        "admin' --",
        "admin",
        "'; DROP TABLE users;",
        "%admin%",
      ],
      answer: 0,
      hints: [{ text: "Il faut fermer la chaîne puis commenter la fin de la requête.", cost: 30 }],
      explanation:
        "`admin' --` ferme la chaîne et commente ` AND pass=...`. La requête ne vérifie plus le mot de passe : connexion en tant qu'admin.",
      tags: ["sqli", "tautologie", "auth-bypass"],
    },
    {
      id: "db-sqli-fix",
      title: "La vraie parade",
      order: 3,
      difficulty: "medium",
      type: "text",
      points: 200,
      timeLimitSec: 200,
      prompt:
        "Quelle **technique de codage** élimine à la racine l'injection SQL en empêchant que la donnée soit interprétée comme du code ?\n\n(2-3 mots, ex: « ... paramétrées »)",
      hints: [
        { text: "On lie les valeurs à des paramètres au lieu de les concaténer.", cost: 25 },
        { text: "Prepared statements / bind variables.", cost: 40 },
      ],
      answer: "requêtes paramétrées",
      accept: [
        "requetes parametrees",
        "requête paramétrée",
        "prepared statements",
        "prepared statement",
        "parameterized queries",
        "parameterized query",
        "bind variables",
        "requêtes préparées",
        "requetes preparees",
      ],
      explanation:
        "Les requêtes paramétrées (prepared statements / bind variables) séparent code et données : l'entrée ne peut plus modifier la structure de la requête.",
      tags: ["sqli", "remediation"],
    },
    {
      id: "db-sqli-union",
      title: "Compter les colonnes",
      order: 4,
      difficulty: "hard",
      type: "mcq",
      points: 320,
      timeLimitSec: 240,
      prompt:
        "Avant une injection **UNION**, quelle clause permet de déterminer le **nombre de colonnes** de la requête d'origine ?",
      options: [
        "ORDER BY n (on augmente n jusqu'à l'erreur)",
        "GROUP BY user",
        "HAVING COUNT(*)",
        "LIMIT 0,1",
      ],
      answer: 0,
      hints: [{ text: "On trie par un numéro de colonne croissant jusqu'à provoquer une erreur.", cost: 45 }],
      explanation:
        "`ORDER BY n` échoue dès que n dépasse le nombre de colonnes : on obtient ainsi le compte exact, indispensable pour aligner un UNION SELECT.",
      tags: ["sqli", "union", "enumeration"],
    },
  ],
};
