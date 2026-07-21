import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 41 (Défense) : analyse d'un journal d'authentification SSH. Lab Docker réel, posture analyste SOC. */
export const module41SshBruteforceLog: CourseSeed[] = [
  {
    slug: "prat-defense-ssh-bruteforce-log",
    title: "Analyse de logs SSH — distinguer le bruit du signal",
    checkpoint: "defense",
    codename: "Silent Ledger",
    domain: "Défense — Analyse de journaux",
    theme: "grid",
    icon: "ScrollText",
    accent: "#6B8FC4",
    order: 41,
    difficulty: "medium",
    summary:
      "Premier lab de la série défense : tu changes de posture. Tu n'es plus l'attaquant, mais l'analyste SOC. Un serveur a subi une avalanche de tentatives SSH — à toi de lire le journal d'authentification et de déterminer s'il y a eu une VRAIE compromission, et laquelle des sources en est responsable. Le piège : le volume seul ne désigne pas le coupable.",
    objectives: [
      "Adopter la posture de l'analyste SOC (lire, pas exploiter)",
      "Compter et distinguer les sources d'une attaque par force brute SSH",
      "Isoler les connexions RÉUSSIES (Accepted) au milieu du bruit des échecs",
      "Corréler volume d'échecs et succès pour identifier la vraie brèche",
      "Nommer une contre-mesure adaptée (bannissement automatique)",
    ],
    sandbox: {
      attackerImage: "cyberace/module41-ssh-bruteforce-log:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 📜 Lire un journal SSH — Silent Ledger

Bienvenue dans la **série défense**. Fini d'attaquer : ici tu es **analyste SOC**. On te donne un **journal**, et tu dois **comprendre ce qui s'est passé**. 🕵️

---

## 🧭 Le briefing

> *"Une alerte générique signale une activité anormale sur le service SSH d'un serveur. Le journal d'authentification (\`/var/log/auth.log\`) est disponible — détermine s'il y a eu compromission réelle, et laquelle des sources en est responsable."*

Le terminal démarre **en root** : tu as déjà tous les droits de lecture nécessaires. Aucune élévation de privilèges ici — juste de l'analyse.

---

## 1. Le fichier à lire 📄

Sous Linux, les tentatives de connexion SSH sont journalisées dans **\`/var/log/auth.log\`**. Chaque ligne ressemble à :

\`\`\`
Jul 18 03:14:22 victim sshd[10042]: Failed password for root from 203.0.113.5 port 30012 ssh2
\`\`\`

On y lit : l'**heure**, l'**utilisateur** visé (\`root\`), la **source** (\`from 203.0.113.5\`), et le **verdict** (\`Failed password\` ou \`Accepted password\`).

---

## 2. Compter les sources 🔢

Une force brute se reconnaît à son **volume**. Pour lister les IP distinctes :

\`\`\`bash
grep -oE "from [0-9.]+" /var/log/auth.log | awk '{print $2}' | sort -u | wc -l
\`\`\`

Et pour classer les plus bruyantes :

\`\`\`bash
grep -oE "from [0-9.]+" /var/log/auth.log | awk '{print $2}' | sort | uniq -c | sort -rn
\`\`\`

---

## 3. Le piège du volume ⚠️

L'instinct dit : *"la plus bruyante est la coupable"*. **FAUX.** Une IP peut marteler des milliers d'échecs **sans jamais réussir** — c'est du bruit. La vraie brèche, c'est celle qui, après ses échecs, obtient une ligne **\`Accepted password\`** :

\`\`\`bash
grep Accepted /var/log/auth.log
\`\`\`

C'est le **cœur du métier d'analyste** : corréler. Le volume attire l'œil, mais seule une **connexion réussie** prouve une compromission.

---

## 4. La contre-mesure 🛡️

Contre ces attaques, on automatise le **bannissement** : un outil comme **fail2ban** surveille \`auth.log\` et bloque (via le pare-feu) toute IP dépassant un seuil d'échecs. On peut aussi désactiver l'authentification par mot de passe (clés uniquement) et interdire le login root direct (cf. Module 44).

## 🧠 À retenir

- Les tentatives SSH sont dans **\`/var/log/auth.log\`** : \`Failed password\` (échec) vs \`Accepted password\` (succès).
- **Compter les sources** : \`grep -oE "from [0-9.]+" | awk '{print $2}' | sort -u | wc -l\`.
- **Le volume trompe** : l'IP la plus bruyante n'est pas forcément la brèche. Cherche le **succès** (\`grep Accepted\`).
- **Corrélation** = le réflexe de l'analyste : volume d'échecs **+** connexion réussie = compromission réelle.
- **Contre-mesure** : **fail2ban** (bannissement automatique sur seuil d'échecs).`,
    badge: {
      id: "badge-prat-defssh",
      name: "Lecteur de Journaux",
      icon: "ScrollText",
      description: "A distingué le bruit du signal dans une avalanche de tentatives de connexion.",
    },
    challenges: [
      {
        id: "prat-defssh-t1",
        title: "Prise en main",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🧭 Prise de poste

Tu es analyste. Avant tout, sache **afficher** un fichier texte pour lire le journal.

**Question :** quelle **commande** affiche le contenu d'un fichier texte dans le terminal ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "cat",
        accept: ["cat /var/log/auth.log"],
        caseSensitive: false,
        explanation: `**\`cat\`** (concatenate) affiche le contenu d'un fichier. Ici, \`cat /var/log/auth.log\` déverse tout le journal — mais il est trop long pour l'œil : il va falloir **filtrer** avec grep/awk.`,
        tags: ["defense", "logs", "ssh"],
      },
      {
        id: "prat-defssh-t2",
        title: "Compter les sources",
        order: 2,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔢 Combien d'attaquants ?

Compte les adresses IP distinctes présentes dans le journal :

\`\`\`bash
grep -oE "from [0-9.]+" /var/log/auth.log | awk '{print $2}' | sort -u | wc -l
\`\`\`

**Question :** combien d'adresses IP distinctes apparaissent dans ce journal ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: 4,
        explanation: `**4** sources distinctes. La commande extrait chaque \`from <ip>\`, garde l'IP (\`awk '{print $2}'\`), déduplique (\`sort -u\`) et compte (\`wc -l\`). Savoir combien d'acteurs sont impliqués est la première étape de toute analyse.`,
        tags: ["defense", "logs", "grep", "awk"],
      },
      {
        id: "prat-defssh-t3",
        title: "La plus bruyante",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📢 Le plus gros volume

Classe les sources par nombre d'échecs :

\`\`\`bash
grep "Failed password" /var/log/auth.log | grep -oE "from [0-9.]+" | awk '{print $2}' | sort | uniq -c | sort -rn
\`\`\`

**Question :** quelle adresse IP génère le plus grand nombre d'échecs de connexion ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: ["192.0.2.44", "203.0.113.99", "203.0.113.5", "198.51.100.7"],
        answer: 0,
        explanation: `**192.0.2.44** martèle **600 échecs** — de loin la plus bruyante. Mais retiens bien ce résultat : le module va te montrer que ce n'est PAS elle la vraie brèche. Le volume attire l'œil, il ne prouve rien.`,
        tags: ["defense", "logs", "bruteforce"],
      },
      {
        id: "prat-defssh-t4",
        title: "Isoler les succès",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## ✅ Chercher le succès

Assez du bruit des échecs. Isole les lignes de connexion **RÉUSSIE**, marquées par le mot-clé \`Accepted\`.

**Question :** quelle commande grep isole uniquement les lignes de connexion réussie dans le journal ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "grep Accepted /var/log/auth.log",
        accept: ["grep Accepted"],
        caseSensitive: false,
        explanation: `\`grep Accepted /var/log/auth.log\` ne garde que la (ou les) ligne(s) \`Accepted password\` — les seules qui prouvent une **connexion aboutie**. Au milieu de ~1350 lignes d'échecs, c'est là que se cache la compromission réelle.`,
        tags: ["defense", "logs", "grep"],
      },
      {
        id: "prat-defssh-t5",
        title: "La vraie source",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎯 Le coupable réel

Lis la ligne \`Accepted\`. Quelle IP a franchi la porte ?

**Question :** quelle adresse IP a finalement réussi à se connecter ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [
          { text: "Ne cherche plus le volume le plus élevé — cherche le mot 'Accepted'. La bonne réponse n'est pas la plus bruyante.", cost: 20 },
        ],
        answer: "203.0.113.99",
        caseSensitive: true,
        explanation: `**203.0.113.99** est la vraie brèche : 520 échecs PUIS un \`Accepted password for root\`. La leçon centrale : \`192.0.2.44\` (600 échecs) fait le plus de bruit mais n'a jamais réussi. C'est la **corrélation** échecs → succès qui désigne le coupable, pas le volume seul.`,
        tags: ["defense", "logs", "correlation"],
      },
      {
        id: "prat-defssh-t6",
        title: "Pourquoi le volume trompe",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Le piège du bruit

**Question :** pourquoi l'IP la plus bruyante (192.0.2.44) n'est-elle PAS la véritable brèche ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Elle n'a jamais réussi de connexion malgré le volume d'échecs",
          "Elle a en réalité le moins d'échecs de toutes",
          "Ce n'est pas une adresse IP valide",
          "Elle utilise un autre protocole que SSH",
        ],
        answer: 0,
        explanation: `\`192.0.2.44\` accumule 600 échecs mais **aucune** ligne \`Accepted\` : elle a échoué de bout en bout. Un attaquant bruyant qui échoue reste un échec. Seule \`203.0.113.99\`, avec son succès final, constitue une compromission. Le volume est un **leurre**.`,
        tags: ["defense", "logs", "analyse"],
      },
      {
        id: "prat-defssh-t7",
        title: "Confirmer l'incident",
        order: 7,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le rapport d'incident

Un fichier de confirmation d'incident a été déposé sur la machine. Retrouve-le et lis-le.

\`\`\`bash
cat /root/incident_flag.txt
\`\`\`

**Question :** quel est le contenu (flag \`CYBERACE{...}\`) de ce fichier ?`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "Le fichier se trouve dans le dossier personnel de root.", cost: 20 },
          { text: "Chemin exact : `/root/incident_flag.txt`. Un simple `cat` suffit.", cost: 35 },
        ],
        answer: "CYBERACE{bruteforce_reussi_identifie_par_correlation}",
        caseSensitive: true,
        explanation: `\`cat /root/incident_flag.txt\` → **CYBERACE{bruteforce_reussi_identifie_par_correlation}**. Le nom du flag résume la leçon : c'est la **corrélation** (échecs + succès), pas le volume, qui a permis d'identifier la brèche.`,
        tags: ["defense", "flag", "incident"],
      },
      {
        id: "prat-defssh-t8",
        title: "Contre-mesure",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🛡️ Prévenir la récidive

**Question :** quelle mesure défensive automatise le blocage d'une IP après un nombre d'échecs successifs ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Un outil de bannissement automatique comme fail2ban",
          "La suppression complète du service SSH",
          "L'augmentation de MaxAuthTries",
          "La désactivation des journaux d'authentification",
        ],
        answer: 0,
        explanation: `**fail2ban** surveille \`auth.log\` et bannit (via le pare-feu) toute IP dépassant un seuil d'échecs — la réponse standard à la force brute SSH. Supprimer SSH est disproportionné ; augmenter MaxAuthTries aggrave le problème ; désactiver les logs, c'est se rendre aveugle.`,
        tags: ["defense", "fail2ban", "contre-mesure"],
      },
    ],
  },
];
