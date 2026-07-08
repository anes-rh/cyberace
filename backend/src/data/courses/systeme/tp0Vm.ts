import type { CourseSeed } from "../../../types";

const VBOX_FOLDER = "https://drive.google.com/drive/folders/1JOo1x5DyzEpBg__2tp8t1gGeWMGXkqXb";
const UBUNTU_FOLDER = "https://drive.google.com/drive/folders/19C11XgE6bX4SBm6O9g6rrgXGA4ACFGUg";

/** Système — Module 2 (TP 0) : installer VirtualBox + Ubuntu. */
export const tp0Vm: CourseSeed[] = [
  {
    slug: "se-vm",
    title: "TP 0 — Ton labo : VirtualBox + Ubuntu",
    checkpoint: "systeme-exploitation",
    codename: "Pit Garage",
    domain: "Système — Environnement",
    theme: "track",
    icon: "Monitor",
    accent: "#E8A87C",
    order: 2,
    difficulty: "easy",
    summary:
      "Monte ton atelier avant de courser : installe VirtualBox, crée une machine virtuelle, installe Ubuntu dedans, mets-le à jour et ajoute les Additions invité. À partir de là, TOUS les TP se font dans ta VM.",
    objectives: [
      "Installer VirtualBox selon ton OS hôte (Windows / macOS / Linux)",
      "Créer une machine virtuelle (RAM, disque, type de système)",
      "Monter l'ISO Ubuntu et installer l'OS invité de A à Z",
      "Mettre à jour Ubuntu (apt update && apt upgrade)",
      "Installer les Additions invité (plein écran, presse-papiers, dossiers partagés)",
    ],
    lesson: `# 🏁 TP 0 — Ton labo : VirtualBox + Ubuntu

Impossible d'apprendre le système en cassant ta vraie machine. La solution : une **machine virtuelle** (VM) — un ordinateur **simulé** dans une fenêtre. Tu y installes **Ubuntu** et tu peux tout tester sans risque (si tu casses tout, tu recrées la VM). 🏎️

> ⬇️ **Télécharge d'abord** VirtualBox (pour ton OS) et l'ISO Ubuntu via les cartes de téléchargement **en bas de cette page**.

---

## 1. C'est quoi une machine virtuelle ? 🪆

VirtualBox est un **hyperviseur** : il crée un ordinateur **virtuel** (CPU, RAM, disque, carte réseau… tous simulés) à l'intérieur du tien.

\`\`\`
   Ton PC (l'HÔTE : Windows / macOS / Linux)
   ┌───────────────────────────────────────┐
   │   VirtualBox                           │
   │   ┌─────────────────────────────────┐ │
   │   │  VM (l'INVITÉ : Ubuntu)         │ │  ← ton terrain de jeu
   │   │  RAM / disque / réseau virtuels │ │
   │   └─────────────────────────────────┘ │
   └───────────────────────────────────────┘
\`\`\`

- **Hôte** (*host*) = ta vraie machine.
- **Invité** (*guest*) = le système installé dans la VM (Ubuntu).

---

## 2. Installer VirtualBox selon ton OS 🧰

Prends le **bon fichier** selon ton système hôte (le sélecteur en bas de page choisit automatiquement) :

| OS hôte | Fichier à lancer | Comment |
|---|---|---|
| **Windows** | \`...win.exe\` | double-clic → *Next* → *Next* → *Install* |
| **macOS** | \`...OSX.dmg\` | double-clic → glisser dans Applications → autoriser dans *Réglages > Confidentialité* |
| **Linux (Debian/Ubuntu)** | \`...amd64.deb\` | \`sudo apt install ./le-fichier.deb\` |
| **Linux (Fedora/RHEL)** | \`...x86_64.rpm\` | \`sudo dnf install ./le-fichier.rpm\` |

> 💡 Reconnais le bon fichier à son **extension** : \`.exe\` = Windows, \`.dmg\` = macOS, \`.deb\`/\`.rpm\` = Linux.

⚠️ Sur Windows, si l'installeur réclame **Python/VC++** pour une extension, tu peux ignorer (on n'en a pas besoin). Sur certains PC il faut activer la **virtualisation (VT-x/AMD-V)** dans le BIOS/UEFI si VirtualBox refuse de démarrer une VM 64 bits.

---

## 3. Créer la machine virtuelle 🖥️

Dans VirtualBox : bouton **Nouvelle** (*New*).

1. **Nom** : \`Ubuntu-Lab\`. **Type** : Linux. **Version** : Ubuntu (64-bit).
2. **Mémoire (RAM)** : **au moins 2048 Mo** (4096 Mo si ta machine a ≥ 8 Go). Reste dans la zone **verte**.
3. **Disque dur** : *Créer un disque virtuel maintenant* → **VDI** → **Dynamiquement alloué** (le fichier grandit au besoin) → taille **25 Go** minimum.
4. (Optionnel mais conseillé) après création : **Configuration > Système > Processeur** → 2 CPU ; **Affichage > Mémoire vidéo** → 128 Mo.

> ✅ « Dynamiquement alloué » = le disque virtuel de 25 Go n'occupe réellement sur ton hôte que l'espace utilisé (quelques Go au début).

---

## 4. Monter l'ISO et installer Ubuntu 📀

L'**ISO** est l'image du DVD d'installation d'Ubuntu.

1. VM sélectionnée → **Configuration > Stockage** → clique sur le lecteur **CD (vide)** → à droite, l'icône disque → **Choisir un fichier de disque** → sélectionne l'**ISO Ubuntu** téléchargée.
2. **Démarrer** la VM. Elle boote sur l'ISO → **Install Ubuntu**.
3. Clavier : choisis **French** si besoin. Réseau : laisse par défaut.
4. **Installation** : *Installation normale*. **Type d'installation** : *Effacer le disque et installer Ubuntu* — ⚠️ **sans danger**, ça n'efface QUE le **disque virtuel** de 25 Go, jamais ta vraie machine.
5. **Fuseau** : ta ville. **Compte** : ton nom, un **nom d'utilisateur** (ex. \`etudiant\`) et un **mot de passe** (retiens-le : il sert pour \`sudo\` !).
6. Attends la fin → **Redémarrer** → si demandé « retire le média », **retire l'ISO** (VirtualBox le fait souvent seul) → **Entrée**.

Premier login : tu arrives sur le **bureau Ubuntu**. 🎉

---

## 5. Mettre à jour le système 🔄

Ouvre un **terminal** (raccourci \`Ctrl + Alt + T\`) et lance :

\`\`\`bash
sudo apt update        # rafraîchit la liste des paquets disponibles
sudo apt upgrade -y    # installe les mises à jour
\`\`\`

- \`sudo\` = exécuter **en administrateur** (demande ton mot de passe).
- \`apt\` = le **gestionnaire de paquets** d'Ubuntu (installe/supprime des logiciels).
- \`update\` **rafraîchit le catalogue**, \`upgrade\` **applique** les mises à jour. On fait toujours **update puis upgrade**.

Installe aussi les outils qu'on utilisera (compilateur C, etc.) :
\`\`\`bash
sudo apt install -y build-essential gcc make htop
\`\`\`

---

## 6. Additions invité : le confort 🚀

Les **Additions invité** (*Guest Additions*) rendent la VM agréable : **plein écran** adaptatif, **presse-papiers partagé**, **dossiers partagés**, souris fluide.

1. Menu de la fenêtre VM → **Périphériques > Insérer l'image CD des Additions invité**.
2. Dans Ubuntu, autorise l'exécution automatique (ou dans un terminal) :
\`\`\`bash
sudo apt install -y build-essential dkms linux-headers-$(uname -r)
cd /media/$USER/VBox_GAs_*      # le CD des Additions monté
sudo ./VBoxLinuxAdditions.run
\`\`\`
3. **Redémarre** la VM. Active ensuite **Périphériques > Presse-papiers partagé > Bidirectionnel** et **Affichage > Mode plein écran**.

> ✅ Si le redimensionnement automatique de la fenêtre marche, les Additions sont bien installées.

---

## 🧠 Ce qu'il faut retenir

- Une **VM** = un ordinateur simulé ; **hôte** = ta machine, **invité** = Ubuntu dans la VM.
- On choisit l'installeur VirtualBox par **extension** : \`.exe\` (Windows), \`.dmg\` (macOS), \`.deb\`/\`.rpm\` (Linux).
- Créer la VM : Type **Linux/Ubuntu 64-bit**, **≥ 2 Go RAM**, disque **VDI dynamique ≥ 25 Go**.
- « Effacer le disque » à l'install n'efface **que le disque virtuel**, jamais ta vraie machine.
- Après install : **\`sudo apt update && sudo apt upgrade\`**, puis **build-essential** pour compiler du C.
- Les **Additions invité** apportent plein écran, presse-papiers et dossiers partagés.

## ⚠️ Erreurs fréquentes des débutants

**1. Paniquer devant « Effacer le disque ».** Ça ne touche **que** le disque **virtuel** de la VM. Ta vraie machine est intacte.

**2. VM 64 bits indisponible / refus de démarrer.** Active la **virtualisation (VT-x / AMD-V)** dans le BIOS/UEFI de ton PC.

**3. Oublier son mot de passe Ubuntu.** Il est **indispensable** pour \`sudo\`. Note-le.

**4. Faire \`apt upgrade\` sans \`apt update\` avant.** \`update\` rafraîchit le catalogue ; sans lui, \`upgrade\` travaille sur une liste périmée.

**5. Fenêtre minuscule et souris capricieuse.** Installe les **Additions invité** — c'est fait pour ça.`,
    videos: [
      {
        title: "Installer VirtualBox et Ubuntu — tutoriel pas à pas",
        youtubeId: "v1JVqd8M3Yk",
        moreUrl: "https://ubuntu.com/tutorials/install-ubuntu-desktop",
      },
    ],
    resources: [
      {
        label: "VirtualBox_Windows_amd64.exe",
        url: VBOX_FOLDER,
        kind: "installer",
        os: "win",
        note: "Windows 64-bit — double-clic puis suivre l'assistant (Next → Install).",
      },
      {
        label: "VirtualBox_macOS.dmg",
        url: VBOX_FOLDER,
        kind: "installer",
        os: "mac",
        note: "macOS — ouvre le .dmg, glisse dans Applications, autorise dans Réglages > Confidentialité.",
      },
      {
        label: "VirtualBox_Linux_amd64.deb",
        url: VBOX_FOLDER,
        kind: "installer",
        os: "linux",
        note: "Linux Debian/Ubuntu — sudo apt install ./le-fichier.deb (ou .rpm sur Fedora/RHEL).",
      },
      {
        label: "ISO Ubuntu (image d'installation)",
        url: UBUNTU_FOLDER,
        kind: "link",
        note: "L'image disque à monter dans la VM (Stockage > lecteur CD). À télécharger séparément de VirtualBox.",
      },
      {
        label: "Documentation officielle — Installer Ubuntu Desktop",
        url: "https://ubuntu.com/tutorials/install-ubuntu-desktop",
        kind: "link",
        note: "Le guide officiel Ubuntu, avec captures d'écran, en complément.",
      },
    ],
    badge: {
      id: "badge-pit-garage",
      name: "Pit Garage",
      icon: "Monitor",
      description: "A monté son labo : VirtualBox + Ubuntu installés, mis à jour, prêts pour tous les TP.",
    },
    challenges: [
      {
        id: "se-vm-extension",
        title: "Le bon installeur",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧰 Quel fichier ?

Ton PC tourne sous **Windows**. Quel fichier d'installation de VirtualBox choisis-tu ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Chaque OS a son extension : .exe, .dmg, .deb/.rpm.", cost: 10 },
          { text: "📖 Correction : le .exe est l'installeur Windows.", cost: 30 },
        ],
        options: [
          "Le fichier .exe",
          "Le fichier .dmg",
          "Le fichier .deb",
          "Le fichier .iso",
        ],
        answer: 0,
        explanation: `Sous **Windows**, c'est le **\`.exe\`**. Le \`.dmg\` est pour **macOS**, le \`.deb\`/\`.rpm\` pour **Linux**. Le \`.iso\` n'est pas VirtualBox : c'est l'**image d'installation d'Ubuntu** (l'OS invité qu'on met *dans* la VM).`,
        tags: ["vm", "virtualbox", "install"],
      },
      {
        id: "se-vm-effacer",
        title: "« Effacer le disque » : danger ?",
        order: 2,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 💾 Type d'installation

Pendant l'installation d'Ubuntu, l'option **« Effacer le disque et installer Ubuntu »** va-t-elle effacer ta vraie machine ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Ubuntu ne voit que le matériel VIRTUEL de la VM.", cost: 10 },
          { text: "📖 Correction : non, ça n'efface que le disque virtuel de la VM.", cost: 30 },
        ],
        options: [
          "Non : elle n'efface que le disque virtuel de la VM (l'hôte est intact)",
          "Oui : elle formate tout ton ordinateur",
          "Oui : elle efface uniquement le dossier Téléchargements",
          "Elle désinstalle Windows définitivement",
        ],
        answer: 0,
        explanation: `L'invité (Ubuntu) ne « voit » que le **disque virtuel** de 25 Go créé pour la VM. « Effacer le disque » n'agit donc **que** sur ce disque virtuel — ta vraie machine (l'hôte) et ses fichiers sont **totalement intacts**. C'est tout l'intérêt d'une VM : un bac à sable isolé.`,
        tags: ["vm", "ubuntu", "install", "disque"],
      },
      {
        id: "se-vm-update",
        title: "Mettre à jour Ubuntu",
        order: 3,
        difficulty: "easy",
        type: "code",
        language: "bash",
        prompt: `## 🔄 Première mise à jour

Écris les **deux commandes** (en administrateur) qui, dans l'ordre, **rafraîchissent le catalogue** des paquets puis **installent les mises à jour** sur Ubuntu.

*(Tape-les comme dans un vrai terminal.)*`,
        points: 150,
        timeLimitSec: 300,
        starter: `# 1) rafraîchir le catalogue
# 2) installer les mises à jour
`,
        hints: [
          { text: "sudo apt update, puis sudo apt upgrade. sudo = administrateur.", cost: 15 },
          { text: "📖 Correction :\n```\nsudo apt update\nsudo apt upgrade\n```", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [
            { label: "Rafraîchit le catalogue (sudo apt update)", pattern: "sudo\\s+apt(-get)?\\s+update", flags: "i" },
            { label: "Installe les mises à jour (sudo apt upgrade)", pattern: "sudo\\s+apt(-get)?\\s+upgrade", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
sudo apt update     # rafraîchit la LISTE des paquets disponibles
sudo apt upgrade    # installe réellement les mises à jour (-y pour tout accepter)
\`\`\`

Toujours **update puis upgrade** : sans \`update\`, \`upgrade\` travaille sur un catalogue périmé. \`sudo\` exécute en **administrateur** (mot de passe demandé). \`apt\` est le gestionnaire de paquets d'Ubuntu/Debian.`,
        tags: ["vm", "apt", "update", "terminal"],
      },
      {
        id: "se-vm-additions",
        title: "À quoi servent les Additions invité ?",
        order: 4,
        difficulty: "medium",
        type: "multi",
        prompt: `## 🚀 Guest Additions

Coche **tout** ce que les **Additions invité** VirtualBox apportent :`,
        points: 200,
        timeLimitSec: 300,
        options: [
          "Le redimensionnement automatique / plein écran adaptatif",
          "Le presse-papiers partagé hôte ↔ invité",
          "Les dossiers partagés entre hôte et invité",
          "Le doublement automatique de la fréquence du processeur",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Les Additions améliorent le CONFORT, pas la puissance physique.", cost: 20 },
          { text: "📖 Correction : plein écran + presse-papiers + dossiers partagés. Pas d'accélération CPU.", cost: 50 },
        ],
        explanation: `Les **Additions invité** apportent le **confort** : plein écran adaptatif, **presse-papiers partagé**, **dossiers partagés**, souris fluide, meilleure vidéo. Elles **n'augmentent pas** la puissance physique du CPU. Après installation, pense à activer *Périphériques > Presse-papiers partagé > Bidirectionnel*.`,
        tags: ["vm", "additions", "confort"],
      },
      {
        id: "se-vm-buildessential",
        title: "Préparer la compilation C",
        order: 5,
        difficulty: "easy",
        type: "code",
        language: "bash",
        prompt: `## 🛠️ Outils de développement

Plus loin dans le checkpoint, tu compileras du **C**. Écris la commande qui installe (en admin) le paquet Ubuntu contenant **gcc, make et les en-têtes** nécessaires pour compiler.`,
        points: 150,
        timeLimitSec: 300,
        starter: `# installe la chaîne de compilation C
`,
        hints: [
          { text: "Le méta-paquet s'appelle build-essential.", cost: 15 },
          { text: "📖 Correction : sudo apt install build-essential", cost: 40 },
        ],
        answer: JSON.stringify({
          minRatio: 1,
          keypoints: [
            { label: "Installe en administrateur", pattern: "sudo\\s+apt(-get)?\\s+install", flags: "i" },
            { label: "Le méta-paquet build-essential", pattern: "build-essential", flags: "i" },
          ],
        }),
        explanation: `\`\`\`bash
sudo apt install -y build-essential
\`\`\`

**\`build-essential\`** est un **méta-paquet** qui tire \`gcc\` (le compilateur C), \`g++\`, \`make\` et les bibliothèques/en-têtes standard. Avec ça, tu peux \`gcc mon_prog.c -o mon_prog\` puis \`./mon_prog\`. On ajoute souvent \`gdb\` (débogueur) et \`htop\` (moniteur de processus).`,
        tags: ["vm", "gcc", "build-essential", "c"],
      },
    ],
  },
];
