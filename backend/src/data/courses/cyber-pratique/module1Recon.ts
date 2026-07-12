import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 1 : Reconnaissance réseau (Nmap & énumération). Lab Docker réel. */
export const module1Recon: CourseSeed[] = [
  {
    slug: "prat-recon-nmap",
    title: "Reconnaissance réseau — Nmap & énumération",
    checkpoint: "cybersecurite-pratique",
    codename: "Silent Scan",
    domain: "Reconnaissance",
    theme: "grid",
    icon: "Terminal",
    accent: "#E0685E",
    order: 1,
    difficulty: "easy",
    summary:
      "Premier lab réel : un vrai terminal, une vraie cible dans un conteneur isolé. Tu audites un serveur avant sa mise en production avec Nmap — scan de ports, détection de service/OS, scripts NSE — et tu récupères trois flags cachés (FTP anonyme, robots.txt, port non standard).",
    objectives: [
      "Démarrer un environnement de lab isolé et t'y connecter en terminal",
      "Cartographier les ports ouverts d'une cible (scan par défaut, -p-, -F)",
      "Distinguer un connect scan (-sT) d'un SYN scan (-sS) et comprendre le rôle des privilèges",
      "Identifier les services et l'OS (-sV, -O, -A) et lancer des scripts NSE (-sC, --script)",
      "Énumérer FTP anonyme, un robots.txt piégé et un service sur port non standard",
    ],
    sandbox: {
      attackerImage: "cyberace/attacker-base:latest",
      targetImage: "cyberace/module1-recon-target:latest",
      ttlSec: 1200, // 20 minutes
      attackerCapAdd: ["NET_RAW", "NET_ADMIN"],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🎯 Reconnaissance réseau — Silent Scan

Bienvenue dans ton **premier lab pratique**. Fini la théorie pure : ici tu as un **vrai terminal** dans un conteneur isolé, une **vraie cible** à auditer, et de **vraies commandes** à taper. 🏎️

---

## 🧭 Le scénario

> **Tu es analyste sécurité junior.** On te confie une mission simple : un serveur va être **mis en production** la semaine prochaine, et on te demande de l'**auditer** d'abord — vérifier quels services il expose, s'il traîne des portes ouvertes oubliées, des configurations dangereuses. Bref, de le **regarder avec les yeux d'un attaquant** avant qu'un vrai attaquant ne le fasse.

**Comment jouer :**
1. Clique sur **« Démarrer le lab »** en haut de cette page. Un conteneur **attaquant** (avec tes outils) et un conteneur **cible** démarrent, isolés dans leur propre réseau.
2. Un **terminal web** s'affiche. Tu es \`root\` dans la machine attaquant. La cible est joignable par le nom d'hôte **\`target\`** (pas besoin de connaître son IP).
3. **Progresse tâche par tâche** (colonne de droite) : chaque tâche te demande de lancer une commande dans le terminal, puis de **coller la réponse ou le flag** que tu as trouvé.
4. Le lab s'arrête tout seul après **20 minutes** (ou via le bouton « Arrêter »). Tu peux le relancer autant de fois que tu veux.

> ⚠️ Le réseau du lab est **coupé d'Internet** (isolation volontaire). Tout se passe entre **toi** et **\`target\`**.

---

## 1. Qu'est-ce que la reconnaissance ? 🔍

La **reconnaissance** (*recon*) est la **première phase** de tout audit ou attaque : avant d'exploiter quoi que ce soit, il faut **savoir ce qui existe**. Sur un serveur, cela veut dire répondre à :
- Quels **ports** sont ouverts ?
- Quels **services** écoutent derrière (et quelle **version**) ?
- Quel **système d'exploitation** ?
- Y a-t-il des **configurations faibles** (service anonyme, fichier exposé) ?

L'outil de référence pour ça, c'est **Nmap** (*Network Mapper*). Un **port ouvert** = une **porte** potentielle. Le but de la recon est d'en dresser la **carte complète**.

---

## 2. Le scan de ports avec Nmap 🚪

### Le scan par défaut

\`\`\`bash
nmap target
\`\`\`

Sans aucune option, Nmap scanne les **~1000 ports TCP les plus courants** (liste \`nmap-services\`). ⚠️ Ce n'est **pas** un « scan rapide » — c'est le comportement **par défaut**. Le vrai scan rapide, c'est \`-F\`.

### Voir TOUS les ports

\`\`\`bash
nmap -p- -T4 target
\`\`\`

- **\`-p-\`** scanne les **65535 ports TCP** (équivalent à \`-p 1-65535\`). C'est la **seule** façon fiable de trouver un service planqué sur un **port inhabituel** — un port que le scan par défaut (top 1000) **ne verra jamais**.
- **\`-F\`** (*fast*) fait l'inverse : **top 100 ports** seulement. Plus rapide, moins complet que le défaut.

| Option | Ce qu'elle scanne |
|---|---|
| (aucune) | ~1000 ports les plus courants (défaut) |
| \`-F\` | top 100 ports (rapide) |
| \`-p-\` | les 65535 ports (exhaustif) |

> 🧠 Retiens la hiérarchie : \`-F\` (100) **<** défaut (1000) **<** \`-p-\` (65535). Un port caché comme **47831** n'apparaît **qu'avec \`-p-\`**.

---

## 3. Connect scan vs SYN scan 🤝

Il existe plusieurs **techniques** pour tester si un port est ouvert. Les deux principales :

### \`-sT\` — Connect scan (poignée de main complète)

\`\`\`bash
nmap -sT target
\`\`\`

Nmap réalise une **poignée de main TCP complète** (SYN → SYN-ACK → ACK), comme une vraie connexion. Avantages/inconvénients :
- ✅ Ne nécessite **aucun privilège particulier** (fonctionne pour n'importe quel utilisateur).
- ❌ Plus **lent** et plus **« bruyant »** : la connexion complète est **visible dans les logs** de la cible.

### \`-sS\` — SYN scan (« semi-ouvert »)

\`\`\`bash
nmap -sS target
\`\`\`

Nmap envoie un **SYN**, attend le **SYN-ACK**, puis **n'achève jamais** la connexion (pas de ACK final) — d'où « **semi-ouvert** ».
- ✅ Plus **rapide** et plus **discret** (la connexion n'est jamais complétée).
- ❌ Nécessite de forger des paquets bruts → un **socket brut**, donc la **capability Linux \`NET_RAW\`** (root, ou un conteneur lancé avec \`--cap-add=NET_RAW\`).

### 🔬 Important — pourquoi \`-sT\` existe

Dans ce lab, ton conteneur attaquant **a** la capability \`NET_RAW\`, donc \`-sS\` marche. Mais **si un jour** \`nmap -sS\` te renvoie un message du type :

\`\`\`
You requested a scan type which requires root privileges.
\`\`\`

…ou repasse **silencieusement** en mode connect, ce **n'est pas un bug** : c'est qu'il **manque la capability \`NET_RAW\`**. C'est **exactement pour ça que \`-sT\` existe** : un scan qui marche **sans privilège**, en échange de discrétion et de vitesse. Retiens ce lien **option ↔ privilège**.

---

## 4. Détection de service et d'OS 🕵️

Savoir qu'un port est ouvert, c'est bien. Savoir **quoi** tourne derrière, c'est mieux.

\`\`\`bash
nmap -sV -p22 target        # version du service sur le port 22
nmap -O target              # détection de l'OS
nmap -A target              # tout à la fois (voir plus bas)
\`\`\`

- **\`-sV\`** (*version*) : envoie des **sondes actives** pour identifier le **service et sa version** (ex. « OpenSSH 9.2p1 Debian »). On règle l'agressivité avec **\`--version-intensity <0-9>\`** (0 = léger, 9 = toutes les sondes).
- **\`-O\`** : **détection d'OS** par **empreinte de la pile TCP/IP**. Nécessite aussi **\`NET_RAW\`**.
- **\`-A\`** : un **raccourci** pour **\`-sV -O -sC --traceroute\`** en une commande. Très pratique, mais plus **lent** — bon à connaître, à sortir quand tu veux « tout » d'un coup.

> 🧠 Astuce lecture de bannière : la version SSH renvoyée par \`-sV\` inclut souvent le **nom de la distribution** (ex. \`… Debian …\`) — un indice direct sur l'OS de la cible.

---

## 5. Les scripts NSE 📜

Nmap embarque un **moteur de scripts**, le **NSE** (*Nmap Scripting Engine*) : des scripts qui vont **plus loin** que le simple scan (énumération, détection de failles, récupération de bannières).

\`\`\`bash
nmap -sC target                       # scripts "default" (non intrusifs)
nmap --script=ftp-anon -p21 target    # FTP anonyme autorisé ?
nmap --script=banner target           # récupère la bannière brute des services
\`\`\`

- **\`-sC\`** : lance les scripts de la catégorie **\`default\`** (non intrusifs) — bannières, énumération basique. Équivaut à \`--script=default\`.
- **\`--script=ftp-anon\`** : script **dédié** qui teste si le **login FTP anonyme** est accepté (une mauvaise config classique).
- **\`--script=banner\`** : récupère la **bannière** brute d'un service, en complément de \`-sV\`.

---

## 6. Le timing ⏱️

\`\`\`bash
nmap -T4 target
\`\`\`

L'option **\`-T\`** règle la **vitesse** du scan, de **\`-T0\`** (paranoïaque, ultra-lent, furtif) à **\`-T5\`** (*insane*, très rapide, très bruyant). Sur un **lab local**, **\`-T4\`** (*aggressive*) est recommandé : rapide sans être instable, inutile d'attendre.

---

## 7. Le tableau de référence 📋

| Flag / concept | Signification | À retenir |
|---|---|---|
| (aucune option) | ~1000 ports TCP courants | comportement **par défaut**, pas un « scan rapide » |
| \`-p-\` | les 65535 ports TCP | seule façon fiable de trouver un port **inhabituel** |
| \`-F\` | top 100 ports | rapide, moins complet que le défaut |
| \`-sT\` | connect scan (handshake complet) | **aucun privilège** requis ; plus lent/bruyant |
| \`-sS\` | SYN scan (semi-ouvert) | nécessite **\`NET_RAW\`** ; rapide, jamais complété |
| \`-sV\` | détection de version | \`--version-intensity 0-9\` règle l'agressivité |
| \`-O\` | détection d'OS (empreinte TCP/IP) | nécessite aussi **\`NET_RAW\`** |
| \`-A\` | raccourci \`-sV -O -sC --traceroute\` | pratique mais plus lent |
| \`-sC\` | scripts NSE **default** (non intrusifs) | bannières / énumération de base |
| \`--script=ftp-anon\` | teste le FTP anonyme | à utiliser sur le port 21 |
| \`--script=banner\` | récupère la bannière brute | complément de \`-sV\` |
| \`-T4\` | timing *aggressive* (\`-T0\`→\`-T5\`) | recommandé sur un lab local |

---

## 🎯 Ta mission (les 3 flags)

La cible cache **trois flags** au format \`CYBERACE{...}\`, à récupérer en enchaînant les tâches :
- **Flag 1** — via le **FTP anonyme** (port 21).
- **Flag 2** — via un **robots.txt** piégé (port 8080).
- **Flag 3** — sur un **port caché** que seul \`-p-\` révèle.

Garde ce terminal ouvert, passe à la première tâche, et **scanne en silence**. 🥷

## 🧠 À retenir

- **Recon = cartographier** avant d'agir : ports ouverts, services/versions, OS, configs faibles.
- **Scan par défaut = top ~1000 ports** (pas un scan rapide) ; **\`-F\`** = top 100 ; **\`-p-\`** = **les 65535** (seul à révéler un port inhabituel).
- **\`-sT\`** (connect) = **aucun privilège**, mais lent/bruyant ; **\`-sS\`** (SYN semi-ouvert) = rapide/discret mais exige **\`NET_RAW\`**. Un \`-sS\` qui échoue « privilèges » = capability manquante, **pas un bug** → c'est la raison d'être de \`-sT\`.
- **\`-sV\`** version (\`--version-intensity\`), **\`-O\`** OS (NET_RAW), **\`-A\`** = \`-sV -O -sC --traceroute\`.
- **NSE** : **\`-sC\`** (scripts default), **\`--script=ftp-anon\`** (FTP anonyme), **\`--script=banner\`**. **\`-T4\`** pour un lab local.`,
    badge: {
      id: "badge-prat-recon",
      name: "Scanner Silencieux",
      icon: "Fingerprint",
      description: "A repéré chaque service exposé sans déclencher une alerte.",
    },
    challenges: [
      {
        id: "prat-recon-t1",
        title: "Mise en route",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🚀 Mise en route

Tu es **analyste sécurité junior** : ta mission est d'auditer le serveur \`target\` avant sa mise en production.

1. Clique sur **« Démarrer le lab »** en haut de cette page et attends que le terminal s'affiche.
2. Dans le terminal, vérifie que la cible répond :

\`\`\`bash
ping -c 2 target
\`\`\`

Tu devrais voir des réponses (\`2 packets transmitted, 2 received\`).

**Question :** quelle **commande Unix de base** permet de vérifier qu'un hôte répond sur le réseau ?`,
        points: 50,
        timeLimitSec: 300,
        hints: [],
        answer: "ping",
        accept: ["ping target", "ping -c 2 target", "ping -c2 target"],
        caseSensitive: false,
        explanation: `**\`ping\`** envoie des paquets **ICMP echo request** et attend les **echo reply** : c'est le réflexe de base pour confirmer qu'un hôte est **joignable**. Ici, \`target\` est le nom d'hôte de la cible dans le réseau isolé du lab — pas besoin de son IP.`,
        tags: ["recon", "ping", "connectivite"],
      },
      {
        id: "prat-recon-t2",
        title: "Scan par défaut",
        order: 2,
        difficulty: "easy",
        type: "numeric",
        prompt: `## 🚪 Scan par défaut

Lance un scan Nmap **sans aucune option** sur la cible :

\`\`\`bash
nmap target
\`\`\`

Nmap teste les **~1000 ports les plus courants**. Observe la liste des ports marqués **\`open\`**.

**Question :** combien de ports apparaissent **\`open\`** ?`,
        points: 100,
        timeLimitSec: 400,
        hints: [],
        answer: 3,
        explanation: `Le scan par défaut révèle **3** ports ouverts : **21** (FTP), **22** (SSH) et **8080** (web). C'est le comportement **par défaut** de Nmap (top ~1000 ports) — pas un « scan rapide ». Mais attention : un 4ᵉ service se cache sur un port bien plus haut… que ce scan ne voit pas.`,
        tags: ["recon", "nmap", "scan-defaut"],
      },
      {
        id: "prat-recon-t3",
        title: "Scan complet des ports",
        order: 3,
        difficulty: "medium",
        type: "numeric",
        prompt: `## 🔎 Tous les ports

Le scan par défaut se limite au **top ~1000**. Pour trouver un service planqué sur un **port inhabituel**, il faut scanner **les 65535 ports** avec **\`-p-\`** :

\`\`\`bash
nmap -p- -T4 target
\`\`\`

(\`-T4\` accélère le scan — utile sur un lab local.)

**Question :** quel est le **port caché** qui n'apparaissait **pas** dans le scan par défaut ?`,
        points: 150,
        timeLimitSec: 500,
        hints: [
          { text: "Le scan par défaut ne teste que ~1000 ports. Le port recherché est bien au-delà (nombre à 5 chiffres).", cost: 20 },
        ],
        answer: 47831,
        explanation: `Le port **47831** n'apparaît **qu'avec \`-p-\`** : il est situé bien au-dessus du top 1000 scanné par défaut. C'est toute l'utilité de \`-p-\` — **aucun** port n'échappe à un scan exhaustif. Retiens ce numéro, il te servira à la dernière tâche.`,
        tags: ["recon", "p-tiret", "port-cache"],
      },
      {
        id: "prat-recon-t4",
        title: "Connect scan vs SYN scan",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🤝 Deux techniques de scan

Nmap propose plusieurs **techniques** :
- **\`-sT\`** (connect scan) : poignée de main TCP **complète**, **aucun privilège** requis, mais plus lent et visible dans les logs.
- **\`-sS\`** (SYN scan) : **semi-ouvert**, la connexion n'est jamais achevée — rapide et discret, mais nécessite la capability **\`NET_RAW\`**.

Teste les deux (ton conteneur a bien \`NET_RAW\`) :

\`\`\`bash
nmap -sT target
nmap -sS target
\`\`\`

**Question :** quelle **option Nmap** réalise un **scan SYN semi-ouvert** ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: "-sS",
        accept: ["sS"],
        caseSensitive: true,
        explanation: `**\`-sS\`** = **SYN scan** (« semi-ouvert ») : Nmap envoie un SYN, reçoit le SYN-ACK, mais **n'achève jamais** la connexion → rapide et discret, mais il faut forger des paquets bruts (**\`NET_RAW\`**). **\`-sT\`** (connect) complète la poignée de main : plus lent/bruyant, mais **sans privilège**.`,
        tags: ["recon", "sS", "syn-scan"],
      },
      {
        id: "prat-recon-t5",
        title: "Détection de service et d'OS",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🕵️ Qui es-tu, port 22 ?

Un port ouvert, c'est bien ; savoir **quoi** tourne derrière, c'est mieux. Lance une **détection de version** sur le port 22 :

\`\`\`bash
nmap -sV -p22 target
\`\`\`

Regarde la **bannière** du service SSH renvoyée par Nmap : elle contient souvent le nom de la **distribution Linux**.

**Question :** d'après la bannière SSH, quelle **distribution Linux** fait tourner la cible ? *(un seul mot)*`,
        points: 200,
        timeLimitSec: 500,
        hints: [
          { text: "La bannière OpenSSH inclut typiquement le nom de la distro entre parenthèses ou après un tiret (ex. « OpenSSH 9.x … »).", cost: 20 },
        ],
        answer: "Debian",
        accept: ["debian"],
        caseSensitive: false,
        explanation: `**\`-sV\`** envoie des **sondes actives** et lit la **bannière** du service. Sur cette cible, OpenSSH révèle une base **Debian**. On ne se fie pas au numéro de version exact (il dérive avec les mises à jour), mais l'indice **distribution** est stable et précieux pour cibler d'éventuelles failles.`,
        tags: ["recon", "sV", "banniere"],
      },
      {
        id: "prat-recon-t6",
        title: "Scripts NSE",
        order: 6,
        difficulty: "medium",
        type: "text",
        prompt: `## 📜 Le moteur de scripts

Nmap embarque le **NSE** (*Nmap Scripting Engine*). \`-sC\` lance les scripts **par défaut**, mais on peut cibler un script précis. Teste celui qui vérifie le **FTP anonyme** sur le port 21 :

\`\`\`bash
nmap --script=ftp-anon -p21 target
\`\`\`

**Question :** quel **script NSE** détecte si le login **FTP anonyme** est autorisé ?`,
        points: 150,
        timeLimitSec: 400,
        hints: [],
        answer: "ftp-anon",
        accept: ["ftp-anon.nse", "--script=ftp-anon"],
        caseSensitive: true,
        explanation: `Le script **\`ftp-anon\`** teste si le serveur FTP accepte le login **anonymous** (une mauvaise config classique). \`-sC\` aurait lancé tous les scripts \`default\` ; ici on cible **explicitement** \`ftp-anon\` pour une réponse nette. Il vient de confirmer que le FTP anonyme est ouvert — à exploiter juste après.`,
        tags: ["recon", "nse", "ftp-anon"],
      },
      {
        id: "prat-recon-t7",
        title: "Énumération FTP anonyme",
        order: 7,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎣 Flag 1 — FTP anonyme

Le FTP anonyme est ouvert. Connecte-toi et récupère le fichier qui s'y trouve :

\`\`\`bash
ftp target
# user : anonymous   —   mot de passe : (laisse vide, appuie sur Entrée)
# puis :  ls   /   get flag1.txt
\`\`\`

Ou, plus direct :

\`\`\`bash
curl ftp://target/flag1.txt
\`\`\`

**Question :** colle le **flag** contenu dans \`flag1.txt\`.`,
        points: 200,
        timeLimitSec: 600,
        hints: [
          { text: "Connecte-toi avec « ftp target », utilisateur « anonymous », mot de passe vide, puis « get flag1.txt ».", cost: 15 },
          { text: "En dernier recours, une seule commande suffit : curl ftp://target/flag1.txt", cost: 30 },
        ],
        answer: "CYBERACE{ftp_anonyme_jamais_par_defaut}",
        caseSensitive: true,
        explanation: `Le **FTP anonyme** laisse **n'importe qui** se connecter sans mot de passe — pratique jadis, dangereux aujourd'hui : c'est une fuite de données par défaut. Le flag \`CYBERACE{ftp_anonyme_jamais_par_defaut}\` le rappelle : on **désactive** l'accès anonyme sauf besoin explicite et maîtrisé.`,
        tags: ["recon", "ftp", "flag"],
      },
      {
        id: "prat-recon-t8",
        title: "Énumération web",
        order: 8,
        difficulty: "medium",
        type: "text",
        prompt: `## 🌐 Flag 2 — robots.txt piégé

Le port **8080** sert une page web. Commence par lire le **robots.txt** :

\`\`\`bash
curl http://target:8080/robots.txt
\`\`\`

Il contient une ligne **\`Disallow:\`** pointant vers un chemin « caché ». Visite ce chemin :

\`\`\`bash
curl http://target:8080/<le-chemin-du-Disallow>/
\`\`\`

**Question :** colle le **flag** trouvé à ce chemin.`,
        points: 200,
        timeLimitSec: 600,
        hints: [
          { text: "Un robots.txt liste les chemins qu'un moteur de recherche NE DOIT PAS indexer — ce qui ne veut pas dire qu'ils sont protégés. Le Disallow te donne directement l'adresse.", cost: 20 },
        ],
        answer: "CYBERACE{robots_txt_liste_pas_interdit}",
        caseSensitive: true,
        explanation: `Le **\`robots.txt\`** indique aux moteurs de recherche les chemins à **ne pas indexer** — mais il ne **protège rien** : il les **révèle** au contraire à quiconque le lit. Un \`Disallow: /admin-9f21/\` est une invitation pour un attaquant. Ne jamais compter sur \`robots.txt\` comme mesure de sécurité.`,
        tags: ["recon", "web", "robots-txt"],
      },
      {
        id: "prat-recon-t9",
        title: "Le port caché",
        order: 9,
        difficulty: "hard",
        type: "text",
        prompt: `## 🔌 Flag 3 — le port caché

Souviens-toi du **port caché** trouvé à la tâche 3 (avec \`-p-\`). Un service y écoute et **crache un flag dès qu'on s'y connecte**. Connecte-toi avec **ncat** (ou \`nc\`) :

\`\`\`bash
ncat target 47831
# ou :  nc target 47831
\`\`\`

**Question :** colle le **flag** renvoyé par ce service.`,
        points: 300,
        timeLimitSec: 600,
        hints: [
          { text: "Réutilise le numéro de port trouvé à la tâche 3 (47831) : ncat target 47831", cost: 25 },
        ],
        answer: "CYBERACE{p_tiret_scanne_tout}",
        caseSensitive: true,
        explanation: `En te connectant au port **47831** avec **ncat**, le service t'envoie immédiatement son contenu. Ce flag, \`CYBERACE{p_tiret_scanne_tout}\`, récompense le réflexe clé de ce module : un service peut se cacher sur **n'importe quel** port — seul un scan **\`-p-\`** exhaustif le débusque.`,
        tags: ["recon", "ncat", "flag"],
      },
      {
        id: "prat-recon-t10",
        title: "Synthèse",
        order: 10,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Synthèse

Tu as vu que \`-sS\` nécessite la capability \`NET_RAW\`, contrairement à \`-sT\`.

**Question :** pourquoi utilise-t-on **\`-sT\`** quand on n'a **pas** les privilèges nécessaires pour \`-sS\` ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Parce que -sT complète la poignée de main TCP et ne nécessite donc pas de socket brut",
          "Parce que -sT est toujours plus rapide que -sS",
          "Parce que -sT scanne uniquement les ports UDP",
          "Parce que -sT nécessite un accès root, contrairement à -sS",
        ],
        answer: 0,
        explanation: `**\`-sT\`** s'appuie sur la pile TCP du système pour **compléter la poignée de main** (SYN/SYN-ACK/ACK) : aucune fabrication de paquet brut, donc **aucun privilège** ni \`NET_RAW\` requis. \`-sS\`, lui, forge des paquets semi-ouverts → il exige un **socket brut**. C'est précisément pour ces environnements « sans privilège » que \`-sT\` existe.`,
        tags: ["recon", "synthese", "sT"],
      },
    ],
  },
];
