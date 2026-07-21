import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 44 (Défense) : durcissement d'une configuration SSH. Variante analyste + sudo. */
export const module44SshHardening: CourseSeed[] = [
  {
    slug: "prat-defense-ssh-hardening",
    title: "Durcir SSH — corriger une config trop permissive",
    checkpoint: "defense",
    codename: "Silent Lockdown",
    domain: "Défense — Durcissement système",
    theme: "grid",
    icon: "Lock",
    accent: "#4FA6C4",
    order: 44,
    difficulty: "medium",
    summary:
      "Un audit vient de relever plusieurs faiblesses dans la configuration SSH d'un serveur : login root autorisé, mot de passe accepté, MaxAuthTries démesuré. À toi de les corriger une par une dans sshd_config — et de valider la syntaxe AVANT de redémarrer, sous peine de te verrouiller dehors.",
    objectives: [
      "Localiser et lire le fichier de configuration du serveur SSH",
      "Identifier les directives dangereuses (PermitRootLogin, PasswordAuthentication)",
      "Corriger une directive avec sed",
      "Choisir une valeur stricte pour MaxAuthTries",
      "Valider la syntaxe (sshd -t) avant tout redémarrage",
    ],
    sandbox: {
      attackerImage: "cyberace/module44-ssh-hardening-lab:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🔒 Durcir SSH — Silent Lockdown

Un service mal configuré est une porte grande ouverte. Ici, tu es l'admin qui **referme** les portes, directive par directive. 🗝️

---

## 🧭 Le briefing

> *"Ce serveur vient de passer un audit de configuration SSH — plusieurs faiblesses ont été relevées. À toi de les corriger, une par une."*

Le terminal démarre en tant qu'utilisateur **\`analyste\`** avec **sudo NOPASSWD** : pas de puzzle d'élévation, juste un accès administratif légitime (préfixe \`sudo\` au besoin).

---

## 1. Le fichier central 📄

Le comportement du serveur SSH est piloté par **\`/etc/ssh/sshd_config\`**. C'est LE fichier à durcir.

---

## 2. Les faiblesses à corriger 🚩

L'audit a relevé quatre directives à problème :

| Directive | État audité | Risque | Cible |
|---|---|---|---|
| \`PermitRootLogin\` | \`yes\` | connexion **root directe** | \`no\` |
| \`PasswordAuthentication\` | \`yes\` | mot de passe (bruteforçable) | \`no\` (clés) |
| \`X11Forwarding\` | \`yes\` | surface inutile | \`no\` |
| \`MaxAuthTries\` | \`30\` | trop d'essais avant coupure | \`3\` ou \`4\` |

---

## 3. Corriger avec sed ✂️

Pour remplacer une directive proprement :

\`\`\`bash
sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
\`\`\`

\`^PermitRootLogin.*\` matche la ligne entière (peu importe sa valeur) et la remplace par la version durcie.

---

## 4. Vérifier AVANT de redémarrer ⚠️

**Ne redémarre jamais SSH sans valider la config d'abord.** Une faute de syntaxe et le service refuse de démarrer — tu te retrouves **verrouillé dehors** sur une machine distante. La commande de contrôle :

\`\`\`bash
sudo sshd -t          # teste la syntaxe, ne redémarre rien
\`\`\`

Silence = tout va bien. Une erreur = corrige avant de faire \`systemctl restart ssh\`.

## 🧠 À retenir

- Config SSH = **\`/etc/ssh/sshd_config\`**.
- Durcissements clés : \`PermitRootLogin no\`, \`PasswordAuthentication no\` (clés uniquement), \`MaxAuthTries\` bas (3-4), \`X11Forwarding no\`.
- Corriger une ligne : \`sed -i 's/^Directive.*/Directive valeur/' fichier\`.
- **Valider avant de redémarrer** : \`sshd -t\` — une erreur de syntaxe peut te bannir de ta propre machine.
- Principe : les **valeurs par défaut trop permissives** restent en place tant qu'on ne les corrige pas explicitement.`,
    badge: {
      id: "badge-prat-sshharden",
      name: "Verrouilleur Méthodique",
      icon: "Lock",
      description: "A corrigé quatre faiblesses de configuration avant qu'elles ne soient exploitées.",
    },
    challenges: [
      {
        id: "prat-sshharden-t1",
        title: "Le fichier en question",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 📄 Où se règle SSH ?

**Question :** quel fichier de configuration contrôle le comportement du serveur SSH ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        answer: "/etc/ssh/sshd_config",
        accept: ["sshd_config"],
        caseSensitive: false,
        explanation: `Le serveur SSH (\`sshd\`) lit sa configuration dans **\`/etc/ssh/sshd_config\`**. À ne pas confondre avec \`/etc/ssh/ssh_config\` (le client). C'est le fichier côté serveur qu'on durcit.`,
        tags: ["defense", "ssh", "config"],
      },
      {
        id: "prat-sshharden-t2",
        title: "Identifier la première faiblesse",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🚩 Le login root

**Question :** quelle directive, actuellement à 'yes', autorise une connexion SSH directe en tant que root ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: ["PermitRootLogin", "PasswordAuthentication", "X11Forwarding", "MaxAuthTries"],
        answer: 0,
        explanation: `**PermitRootLogin yes** autorise à se connecter directement en **root** par SSH — une cible de choix pour la force brute (compte connu, privilèges maximaux). On la passe à \`no\` : on se connecte en utilisateur normal puis on élève avec sudo.`,
        tags: ["defense", "ssh", "root"],
      },
      {
        id: "prat-sshharden-t3",
        title: "Corriger PermitRootLogin",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## ✂️ La commande sed

Remplace la directive PermitRootLogin par sa valeur sécurisée.

**Question :** quelle commande sed remplace cette directive par une valeur sécurisée ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config",
        accept: ["sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config"],
        caseSensitive: true,
        explanation: `\`sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config\` : \`-i\` édite le fichier en place, \`^PermitRootLogin.*\` matche la ligne quelle que soit sa valeur, et la remplace par \`PermitRootLogin no\`. (Préfixe \`sudo\` si les permissions l'exigent.)`,
        tags: ["defense", "ssh", "sed"],
      },
      {
        id: "prat-sshharden-t4",
        title: "La deuxième faiblesse",
        order: 4,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔑 Mot de passe vs clé

**Question :** quelle directive, si activée, permet une authentification par mot de passe plutôt que par clé (nettement plus faible) ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: ["PasswordAuthentication", "PermitRootLogin", "X11Forwarding", "Protocol"],
        answer: 0,
        explanation: `**PasswordAuthentication yes** autorise l'authentification par **mot de passe** — vulnérable à la force brute (cf. Module 41). En la passant à \`no\`, seul l'échange de **clés** est accepté : un attaquant ne peut plus deviner un mot de passe, il lui faudrait voler une clé privée.`,
        tags: ["defense", "ssh", "auth"],
      },
      {
        id: "prat-sshharden-t5",
        title: "La bonne valeur pour MaxAuthTries",
        order: 5,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔢 Limiter les essais

La directive MaxAuthTries est actuellement fixée à 30.

**Question :** quelle valeur, bien plus stricte, limite efficacement les tentatives avant coupure ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        options: ["Une petite valeur comme 3 ou 4", "100", "0 (illimité)", "1000"],
        answer: 0,
        explanation: `Une valeur basse comme **3 ou 4** coupe la connexion après quelques essais ratés, ce qui freine drastiquement la force brute. 30 laisse 30 chances par connexion ; 0/100/1000 sont pires encore. Moins d'essais autorisés = fenêtre d'attaque réduite.`,
        tags: ["defense", "ssh", "maxauthtries"],
      },
      {
        id: "prat-sshharden-t6",
        title: "Vérifier avant de redémarrer",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## ✅ Tester la syntaxe

Avant tout redémarrage, valide que ta config est syntaxiquement correcte.

**Question :** quelle commande vérifie la SYNTAXE du fichier de configuration sans redémarrer le service ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        answer: "sshd -t",
        accept: ["sudo sshd -t"],
        caseSensitive: true,
        explanation: `**\`sshd -t\`** (test mode) analyse \`sshd_config\` et signale toute erreur de syntaxe **sans** toucher au service en cours. C'est le filet de sécurité indispensable avant \`systemctl restart ssh\`.`,
        tags: ["defense", "ssh", "validation"],
      },
      {
        id: "prat-sshharden-t7",
        title: "Pourquoi cette vérification compte",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚠️ Le risque du redémarrage aveugle

**Question :** pourquoi est-il risqué de redémarrer SSH immédiatement après une modification, sans vérification préalable ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Une erreur de syntaxe pourrait empêcher toute nouvelle connexion SSH, y compris pour l'administrateur",
          "Cela n'a jamais aucune conséquence",
          "Cela supprime automatiquement tous les comptes utilisateurs",
          "Cela déconnecte uniquement les attaquants",
        ],
        answer: 0,
        explanation: `Sur une machine **distante**, une faute de syntaxe qui empêche \`sshd\` de démarrer te laisse **enfermé dehors** : plus aucune connexion SSH possible, y compris la tienne. D'où \`sshd -t\` d'abord. C'est l'accident classique de l'admin pressé.`,
        tags: ["defense", "ssh", "risque"],
      },
      {
        id: "prat-sshharden-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Le fil rouge

**Question :** quel principe relie ce durcissement aux services mal configurés vus plus tôt (Modules 2, 6, 17...) ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Des paramètres par défaut trop permissifs restent en place tant que personne ne les corrige explicitement",
          "Ce durcissement SSH n'a aucun lien avec ces modules",
          "Ces modules concernaient uniquement le chiffrement",
          "Aucun service ne peut jamais être durci",
        ],
        answer: 0,
        explanation: `Le fil rouge : les **valeurs par défaut permissives** (root autorisé, protocoles bavards, mots de passe faibles) persistent tant qu'un humain ne les durcit pas. Le durcissement, c'est refermer explicitement ces portes laissées ouvertes « par défaut ».`,
        tags: ["defense", "ssh", "synthese"],
      },
    ],
  },
];
