import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 53 (Défense) : audit des clés SSH autorisées. Pendant défensif du Module 19. */
export const module53SshKeyAudit: CourseSeed[] = [
  {
    slug: "prat-defense-ssh-key-audit",
    title: "Audit de clés SSH — la clé qui n'est sur aucune liste",
    checkpoint: "defense",
    codename: "Silent Roster",
    domain: "Défense — Audit de configuration",
    theme: "grid",
    icon: "KeyRound",
    accent: "#6B9EC4",
    order: 53,
    difficulty: "medium",
    summary:
      "Le compte de service 'deploy' autorise plusieurs clés SSH. Un registre d'onboarding officiel liste qui devrait y avoir accès. À toi de comparer les deux : une clé a été ajoutée illégitimement, trahie par un commentaire qui ne correspond à aucune personne connue. C'est le pendant défensif du Module 19 — détecter la clé ajoutée, pas exploiter une clé fuitée.",
    objectives: [
      "Localiser le fichier des clés autorisées (authorized_keys)",
      "Compter les clés et lire leurs commentaires",
      "Comparer à un registre d'onboarding officiel",
      "Isoler la clé qui ne correspond à aucune identité connue",
      "Décider de l'action appropriée (retrait immédiat)",
    ],
    sandbox: {
      attackerImage: "cyberace/module53-ssh-key-audit:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🔑 Audit de clés SSH — Silent Roster

Au Module 19, une clé SSH **fuitée** servait à rebondir. Ici, l'angle est inversé : détecter une clé **ajoutée** en douce à la liste d'accès d'un compte. 🗝️

---

## 🧭 Le briefing

> *"Le compte de service 'deploy' autorise plusieurs clés SSH. Un registre d'onboarding officiel liste qui devrait y avoir accès — compare les deux."*

Terminal **en root**.

---

## 1. Où sont les clés autorisées 📄

Pour un compte SSH, les clés publiques acceptées vivent dans **\`~/.ssh/authorized_keys\`** — ici **\`/home/deploy/.ssh/authorized_keys\`**. Chaque ligne = une clé, suivie d'un **commentaire** (souvent \`utilisateur@machine\`) :

\`\`\`
ssh-ed25519 AAAAC3... alice.martin@usthb
ssh-ed25519 AAAAC3... bruno.said@usthb
ssh-ed25519 AAAAC3... backup-temp-do-not-remove
\`\`\`

Trois clés. \`wc -l\` le confirme.

---

## 2. La liste de référence 📋

Le registre d'onboarding officiel liste **qui** doit avoir accès :

\`\`\`bash
cat /root/baseline_roster.txt
# alice.martin@usthb - cle principale
# bruno.said@usthb  - cle de secours
\`\`\`

**Deux** personnes autorisées. Or \`authorized_keys\` en compte **trois**.

---

## 3. L'intrus 🎯

En comparant les **commentaires** de chaque clé aux identités du registre :
- \`alice.martin@usthb\` ✅ dans le registre
- \`bruno.said@usthb\` ✅ dans le registre
- \`backup-temp-do-not-remove\` ❌ **ne correspond à personne**

Ce commentaire ne désigne **aucune personne ni usage identifiable** — contrairement aux deux autres, précis. C'est la marque d'une clé **backdoor** ajoutée par un attaquant, camouflée en « clé de backup temporaire à ne pas supprimer » pour dissuader le nettoyage.

---

## 4. L'action 🛡️

Une fois confirmée, la clé illégitime se **retire immédiatement** de \`authorized_keys\`. Puis on investigue : quand a-t-elle été ajoutée, par qui, via quelle compromission initiale ?

## 🧠 À retenir

- Clés autorisées : \`~/.ssh/authorized_keys\` (une par ligne, avec commentaire).
- **Comparer** à un référentiel (registre d'onboarding) : toute clé sans identité connue est suspecte.
- Signal d'alerte : un commentaire **générique/dissuasif** (« do-not-remove ») au lieu d'un \`nom@machine\` précis.
- **Action** : retrait immédiat de la clé + investigation sur son origine.
- Lien Module 19 : là on **exploitait** une clé fuitée ; ici on **détecte** une clé illégitimement ajoutée.`,
    badge: {
      id: "badge-prat-sshkeyaudit",
      name: "Contrôleur d'Accès",
      icon: "KeyRound",
      description: "A trouvé la clé qui ne figurait sur aucune liste d'onboarding.",
    },
    challenges: [
      {
        id: "prat-sshkeyaudit-t1",
        title: "Localiser",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 📄 Le fichier des clés

**Question :** quel fichier liste les clés publiques autorisées pour un compte SSH ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "authorized_keys",
        accept: ["~/.ssh/authorized_keys", "/home/deploy/.ssh/authorized_keys"],
        caseSensitive: false,
        explanation: `**\`~/.ssh/authorized_keys\`** (ici \`/home/deploy/.ssh/authorized_keys\`) contient les clés publiques acceptées pour se connecter au compte. Y ajouter sa propre clé publique est une méthode de **persistance** classique.`,
        tags: ["defense", "ssh", "authorized_keys"],
      },
      {
        id: "prat-sshkeyaudit-t2",
        title: "Compter les clés",
        order: 2,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🔢 Combien d'accès ?

\`\`\`bash
wc -l /home/deploy/.ssh/authorized_keys
\`\`\`

**Question :** combien de clés sont autorisées sur ce compte ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        answer: 3,
        explanation: `**3** clés (une par ligne). Le registre officiel n'en prévoit que 2 : l'écart de un révèle une clé ajoutée hors procédure.`,
        tags: ["defense", "ssh", "wc"],
      },
      {
        id: "prat-sshkeyaudit-t3",
        title: "La référence",
        order: 3,
        difficulty: "easy",
        type: "text",
        prompt: `## 📋 La liste officielle

**Question :** quel fichier liste les personnes officiellement autorisées ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        answer: "/root/baseline_roster.txt",
        accept: ["baseline_roster.txt"],
        caseSensitive: false,
        explanation: `**\`/root/baseline_roster.txt\`** est le registre d'onboarding : il liste \`alice.martin\` et \`bruno.said\`. C'est la vérité de référence à laquelle comparer \`authorized_keys\`.`,
        tags: ["defense", "ssh", "baseline"],
      },
      {
        id: "prat-sshkeyaudit-t4",
        title: "L'anomalie",
        order: 4,
        difficulty: "hard",
        type: "text",
        prompt: `## 🎯 Le commentaire orphelin

**Question :** quel commentaire de clé, dans authorized_keys, ne correspond à AUCUNE entrée du registre officiel ?`,
        points: 250,
        timeLimitSec: 500,
        hints: [
          { text: "Compare chaque commentaire de fin de ligne de authorized_keys avec les identités listées dans le registre.", cost: 25 },
        ],
        answer: "backup-temp-do-not-remove",
        caseSensitive: false,
        explanation: `**\`backup-temp-do-not-remove\`** : ce commentaire ne figure pas dans le registre et ne désigne aucune personne. \`alice.martin\` et \`bruno.said\` y sont ; cette troisième clé est l'intrus.`,
        tags: ["defense", "ssh", "anomalie"],
      },
      {
        id: "prat-sshkeyaudit-t5",
        title: "Pourquoi ce commentaire est suspect",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🕵️ Le déguisement

**Question :** qu'est-ce qui rend ce commentaire particulièrement suspect ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Il ne désigne aucune personne ou usage identifiable, contrairement aux deux autres qui portent un nom précis",
          "Il est plus long que les autres",
          "Il contient le mot 'backup', toujours synonyme de danger",
          "Les commentaires SSH ne sont jamais visibles",
        ],
        answer: 0,
        explanation: `Les clés légitimes portent un \`nom.prenom@machine\` traçable. \`backup-temp-do-not-remove\` est **volontairement flou** et **dissuasif** (« ne pas supprimer »), pour se fondre et décourager le nettoyage. L'absence d'identité rattachable est le vrai signal.`,
        tags: ["defense", "ssh", "suspect"],
      },
      {
        id: "prat-sshkeyaudit-t6",
        title: "Retirer l'accès",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🛡️ L'action correcte

**Question :** une fois confirmée, quelle est l'action appropriée pour cette clé ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "La retirer immédiatement du fichier authorized_keys",
          "L'ignorer, elle ne représente aucun risque",
          "La renommer",
          "La dupliquer sur d'autres comptes",
        ],
        answer: 0,
        explanation: `On **retire immédiatement** la ligne de \`authorized_keys\` : tant qu'elle y est, l'attaquant garde un accès. Puis on investigue l'origine de l'ajout. Renommer/dupliquer ne ferait qu'aggraver ou déplacer le problème.`,
        tags: ["defense", "ssh", "remediation"],
      },
      {
        id: "prat-sshkeyaudit-t7",
        title: "Confirmer (flag)",
        order: 7,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le rapport

\`\`\`bash
cat /root/ssh_audit_report.txt
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` figure dans le rapport d'audit ?`,
        points: 300,
        timeLimitSec: 500,
        hints: [],
        answer: "CYBERACE{cle_ssh_backdoor_non_autorisee}",
        caseSensitive: true,
        explanation: `\`cat /root/ssh_audit_report.txt\` → **CYBERACE{cle_ssh_backdoor_non_autorisee}**. Le flag confirme le diagnostic : une clé backdoor non autorisée sur le compte deploy.`,
        tags: ["defense", "flag", "ssh"],
      },
      {
        id: "prat-sshkeyaudit-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Différence avec le Module 19

**Question :** en quoi ce module diffère-t-il du Module 19 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Le Module 19 exploitait une clé déjà fuitée ; celui-ci détecte une clé illégitimement AJOUTÉE à la liste d'accès",
          "Ce module n'utilise pas SSH du tout",
          "Ce module nécessite une élévation de privilèges, contrairement au Module 19",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Module 19 = **offensif** (utiliser une clé fuitée pour rebondir). Module 53 = **défensif** (repérer une clé ajoutée sans autorisation). Deux faces du même objet — la clé SSH comme vecteur d'accès persistant.`,
        tags: ["defense", "ssh", "synthese"],
      },
    ],
  },
];
