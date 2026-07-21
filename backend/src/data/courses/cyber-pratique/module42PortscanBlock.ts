import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 42 (Défense) : bloquer un scanner avec iptables. Réutilise la cible du Module 13. */
export const module42PortscanBlock: CourseSeed[] = [
  {
    slug: "prat-defense-portscan-block",
    title: "Bloquer un scanner — du repérage au filtrage",
    checkpoint: "defense",
    codename: "Silent Wall",
    domain: "Défense — Filtrage réseau",
    theme: "grid",
    icon: "ShieldAlert",
    accent: "#4F6BC4",
    order: 42,
    difficulty: "medium",
    summary:
      "Au Module 13, tu avais appris à REPÉRER un scan de ports. Cette fois, ne te contente plus de l'observer : bloque-le. Tu poses ta première règle de pare-feu iptables pour faire taire un hôte hostile — et tu découvres les limites du blocage par IP.",
    objectives: [
      "Confirmer une activité hostile avant d'agir (tcpdump)",
      "Comprendre les chaînes iptables (INPUT / OUTPUT / FORWARD)",
      "Écrire une règle DROP ciblant une source précise",
      "Vérifier qu'une règle intercepte réellement du trafic (compteurs)",
      "Connaître les limites du filtrage par IP et la question de la persistance",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module13-portscan-noise:latest",
      ttlSec: 1000,
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🧱 Bloquer un scanner — Silent Wall

Le scanner du **Module 13** est toujours là : le poste \`target\` teste tes ports toutes les ~20 s. Détecter, c'est bien. **Bloquer**, c'est mieux. 🛡️

---

## 🧭 Le briefing

> *"Le scanner que tu avais appris à repérer au Module 13 est toujours actif. Cette fois, ne te contente pas de l'observer — bloque-le."*

Ton conteneur \`attacker\` a les capacités **NET_RAW** et **NET_ADMIN** : tu peux capturer le trafic ET modifier le pare-feu.

---

## 1. Confirmer avant d'agir 🔍

On ne bloque jamais à l'aveugle. D'abord, **confirmer** l'activité avec tcpdump :

\`\`\`bash
tcpdump -i eth0 tcp        # les salves de SYN venant de 'target'
\`\`\`

---

## 2. Les chaînes iptables 🔗

**iptables** filtre les paquets selon des **chaînes** :
- **INPUT** : trafic **entrant** vers CETTE machine → c'est ici qu'on bloque un scanner.
- **OUTPUT** : trafic **sortant** depuis cette machine.
- **FORWARD** : trafic **routé** à travers la machine (routeur).

---

## 3. Poser la règle 🚫

Pour rejeter silencieusement (**DROP**) tout ce qui vient de \`target\` :

\`\`\`bash
iptables -A INPUT -s target -j DROP
\`\`\`

- \`-A INPUT\` : ajoute à la chaîne INPUT.
- \`-s target\` : source = l'hôte \`target\` (si le nom ne résout pas, récupère l'IP avec \`getent hosts target\`).
- \`-j DROP\` : jette le paquet **sans réponse** (l'attaquant ne sait même pas qu'il est bloqué).

---

## 4. Vérifier l'effet 📊

Quelques secondes après (à la prochaine salve ~20 s) :

\`\`\`bash
iptables -L -v -n
\`\`\`

Le **compteur de paquets (pkts)** en face de ta règle **augmente** : preuve qu'elle intercepte bien le trafic.

---

## 5. Les limites 🧠

Bloquer par **IP source** a des limites : une IP peut être **usurpée** ou **changer** — l'attaquant revient sous une autre adresse. Et une règle \`iptables -A\` **ne survit pas** à un redémarrage sans être rendue **persistante** (ex. \`iptables-persistent\`). Le filtrage IP est une brique, pas une solution complète.

## 🧠 À retenir

- **Confirmer** avant de bloquer : \`tcpdump -i eth0 tcp\`.
- Chaîne **INPUT** = trafic entrant vers la machine. **OUTPUT** = sortant.
- Bloquer une source : \`iptables -A INPUT -s target -j DROP\` (DROP = rejet silencieux).
- **Vérifier** : \`iptables -L -v -n\` → le compteur **pkts** augmente.
- **Limites** : une IP s'usurpe/change ; une règle \`-A\` n'est **pas persistante** au reboot.`,
    badge: {
      id: "badge-prat-fwblock",
      name: "Gardien du Filtrage",
      icon: "ShieldAlert",
      description: "A transformé une détection en blocage actif.",
    },
    challenges: [
      {
        id: "prat-fwblock-t1",
        title: "Confirmer l'activité",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔍 Voir avant d'agir

Avant de poser une règle, confirme le trafic hostile.

**Question :** quelle commande capture uniquement le trafic TCP sur eth0, pour confirmer l'activité avant d'agir ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "tcpdump -i eth0 tcp",
        accept: ["tcpdump tcp"],
        caseSensitive: false,
        explanation: `\`tcpdump -i eth0 tcp\` capture le TCP sur ton interface : tu vois les salves de SYN venant de \`target\`. On confirme toujours l'activité **avant** de bloquer, pour ne pas couper du trafic légitime par erreur.`,
        tags: ["defense", "iptables", "tcpdump"],
      },
      {
        id: "prat-fwblock-t2",
        title: "Identifier la chaîne",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🔗 Quelle chaîne ?

**Question :** sur quelle chaîne iptables faut-il ajouter une règle pour bloquer du trafic ENTRANT vers cette machine ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: ["INPUT", "OUTPUT", "FORWARD", "PREROUTING"],
        answer: 0,
        explanation: `**INPUT** traite les paquets destinés à la machine locale — c'est la chaîne du trafic entrant, donc celle où l'on bloque un scanner qui nous vise. OUTPUT = sortant, FORWARD = routé, PREROUTING = avant décision de routage (NAT).`,
        tags: ["defense", "iptables", "chaine"],
      },
      {
        id: "prat-fwblock-t3",
        title: "Écrire la règle de blocage",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🚫 La règle DROP

Rejette silencieusement tout le trafic entrant venant de l'hôte \`target\`.

**Question :** quelle commande ajoute une règle qui DROP tout le trafic entrant depuis l'hôte 'target' ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [
          { text: "Si iptables ne résout pas directement le nom 'target', récupère d'abord son IP avec `getent hosts target`.", cost: 20 },
        ],
        answer: "iptables -A INPUT -s target -j DROP",
        caseSensitive: true,
        explanation: `\`iptables -A INPUT -s target -j DROP\` : on **A**joute à INPUT une règle qui, pour la **s**ource \`target\`, saute (**j**) vers la cible **DROP** (rejet sans réponse). L'attaquant est ignoré silencieusement.`,
        tags: ["defense", "iptables", "drop"],
      },
      {
        id: "prat-fwblock-t4",
        title: "Vérifier l'effet",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 📊 La preuve du blocage

Quelques secondes après avoir posé la règle (à la prochaine salve) :

\`\`\`bash
iptables -L -v -n
\`\`\`

**Question :** quel indicateur confirme que la règle a bien intercepté du trafic ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Le compteur de paquets (pkts) associé à la règle, qui augmente",
          "Le nombre total de règles affichées",
          "La date de création du fichier de configuration",
          "Le PID du démon iptables",
        ],
        answer: 0,
        explanation: `\`iptables -L -v -n\` affiche pour chaque règle un compteur **pkts** (et **bytes**). S'il **augmente** à chaque salve, c'est la preuve que la règle intercepte bien le trafic de \`target\`. iptables n'est d'ailleurs pas un démon : c'est le noyau (netfilter) qui applique les règles.`,
        tags: ["defense", "iptables", "verification"],
      },
      {
        id: "prat-fwblock-t5",
        title: "Limite du blocage par IP",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧠 Le revers de la médaille

**Question :** quelle est une limite de ce blocage par adresse IP source seule ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Une adresse IP peut être usurpée ou changer : l'attaquant peut revenir sous une autre adresse",
          "iptables ne fonctionne jamais correctement sur Linux",
          "Cela bloque aussi tout le trafic légitime vers Internet",
          "Cela ralentit fortement le CPU du serveur",
        ],
        answer: 0,
        explanation: `Le blocage par IP est **contournable** : l'attaquant change d'adresse (nouveau serveur, proxy, botnet) et revient. C'est utile en réaction immédiate, mais ce n'est pas une défense de fond — d'où l'intérêt de combiner avec détection comportementale, rate-limiting et durcissement.`,
        tags: ["defense", "iptables", "limites"],
      },
      {
        id: "prat-fwblock-t6",
        title: "Persistance",
        order: 6,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 💾 Après un redémarrage ?

**Question :** une règle ajoutée avec \`iptables -A\` survit-elle automatiquement à un redémarrage, sans action supplémentaire ?`,
        points: 100,
        timeLimitSec: 250,
        hints: [],
        options: [
          "Non, il faut la rendre persistante (ex: iptables-persistent, ou un script de démarrage)",
          "Oui, toujours automatiquement",
          "Seulement sur Windows",
          "Seulement si on utilise sudo",
        ],
        answer: 0,
        explanation: `Les règles iptables vivent en mémoire (dans le noyau) : au **reboot**, elles disparaissent. Pour les conserver, on les sauvegarde (\`iptables-save\`) et on les recharge au démarrage — c'est le rôle du paquet **iptables-persistent** ou d'un script d'init.`,
        tags: ["defense", "iptables", "persistance"],
      },
      {
        id: "prat-fwblock-t7",
        title: "Autre chaîne utile",
        order: 7,
        difficulty: "medium",
        type: "text",
        prompt: `## ↩️ Bloquer dans l'autre sens

**Question :** quelle chaîne iptables faudrait-il utiliser pour bloquer au contraire du trafic SORTANT vers un hôte ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "OUTPUT",
        accept: ["chaine output", "la chaine output"],
        caseSensitive: false,
        explanation: `La chaîne **OUTPUT** traite les paquets **émis** par la machine. Pour empêcher ta machine de parler à un hôte (ex. couper une balise vers un serveur C2), on ajoute une règle sur OUTPUT : \`iptables -A OUTPUT -d <hote> -j DROP\` (cf. Module 47, confinement complet).`,
        tags: ["defense", "iptables", "output"],
      },
      {
        id: "prat-fwblock-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Détecter vs agir

**Question :** en quoi ce module diffère-t-il du Module 13 ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "On ne se contente plus de détecter le scan : on agit concrètement pour le bloquer",
          "Ce module n'utilise pas tcpdump du tout",
          "Ce module ne nécessite aucune capacité réseau",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Le Module 13 s'arrêtait à la **détection** (reconnaître la signature d'un scan). Ici, on franchit le pas de l'**action** : poser une règle de pare-feu pour bloquer la source. C'est le fil rouge de toute la série défense — passer de l'observation à la réponse.`,
        tags: ["defense", "iptables", "synthese"],
      },
    ],
  },
];
