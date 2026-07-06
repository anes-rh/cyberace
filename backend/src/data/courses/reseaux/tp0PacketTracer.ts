import type { CourseSeed } from "../../../types";

/** Lien du dossier contenant les installeurs Packet Tracer (fournis). */
const PT_FOLDER = "https://drive.google.com/drive/folders/1kzh5SyT3ed47i91_kfA5MTKVNTS95f02";

/**
 * TP 0 — Installation de Cisco Packet Tracer, guidé pour débutants.
 * Sélecteur d'OS (via LessonMedia + resources) + vidéos de prise en main.
 */
export const tp0PacketTracer: CourseSeed[] = [
  {
    slug: "res-tp0-packet-tracer",
    title: "TP 0 — Installer Cisco Packet Tracer",
    checkpoint: "reseaux",
    codename: "Pit Setup",
    domain: "Réseaux — TP",
    theme: "circuit",
    icon: "Cpu",
    accent: "#5FB3C6",
    order: 2,
    difficulty: "easy",
    summary:
      "Ton atelier réseau : installe Cisco Packet Tracer (le simulateur qu'on utilisera dans tous les TP) sur Windows, Linux ou macOS, crée ton compte Cisco Networking Academy gratuit, et prends l'interface en main avec deux vidéos guidées.",
    objectives: [
      "Télécharger le bon installeur Packet Tracer selon ton système",
      "Installer Packet Tracer pas à pas (Windows / Linux / macOS)",
      "Créer un compte Cisco Networking Academy (gratuit) pour te connecter",
      "Reconnaître l'interface : zone de travail, équipements, câbles, mode simulation",
    ],
    lesson: `# 🧰 TP 0 — Installe ton atelier : Cisco Packet Tracer

**Packet Tracer** est le simulateur réseau de Cisco : tu y poses des routeurs, switches et PC, tu les câbles, tu les configures en ligne de commande (**CLI**) et tu observes les paquets circuler. C'est **l'outil de tous les TP** de ce checkpoint — installe-le maintenant. 🏎️

> ⬇️ Les installeurs sont fournis dans le bloc **« Télécharger Packet Tracer »** plus bas (sélecteur par système). Choisis le fichier correspondant à ton OS.

---

## 🪟 Windows

1. Télécharge **\`CiscoPacketTracer_900_win_64bit.exe\`** (bouton Windows ci-dessous).
2. **Double-clique** sur le fichier téléchargé.
3. Accepte la **licence** (*I accept the agreement*) → *Next*.
4. Choisis le **dossier d'installation** (laisse celui par défaut si tu hésites) → *Next* → *Install*.
5. Termine (*Finish*), puis lance **Packet Tracer** depuis le **menu Démarrer**.

---

## 🐧 Linux (Ubuntu / Debian)

1. Télécharge **\`CiscoPacketTracer_900_Ubuntu_64bit.deb\`**.
2. Ouvre un terminal dans le dossier de téléchargement et installe :
\`\`\`bash
sudo dpkg -i CiscoPacketTracer_900_Ubuntu_64bit.deb
\`\`\`
3. Si des **dépendances** manquent (message d'erreur \`dependency problems\`), corrige-les :
\`\`\`bash
sudo apt-get install -f
\`\`\`
puis relance la commande \`dpkg -i\` si besoin.
4. Alternative : double-clique sur le \`.deb\` si tu as un **gestionnaire de paquets graphique** (ex. *App Center* / *GDebi*).
5. Lance Packet Tracer depuis le menu des applications.

---

## 🍎 macOS

1. Télécharge **\`CiscoPacketTracer_900_macOS_64bit.dmg\`**.
2. **Double-clique** sur le \`.dmg\` pour le monter.
3. **Glisse** l'icône Packet Tracer dans le dossier **Applications**.
4. Au **premier lancement**, si macOS bloque l'app (« développeur non identifié », car elle n'est pas sur l'App Store) : va dans **Réglages Système → Confidentialité et sécurité**, puis clique **« Ouvrir quand même »**.

---

## 🔑 Créer un compte Cisco Networking Academy (obligatoire, gratuit)

Au **premier démarrage**, Packet Tracer demande de se connecter. Il faut un compte **Cisco Networking Academy** (gratuit) :

1. Va sur **netacad.com** → *Sign up* (ou clique « Créer un compte » dans la fenêtre de connexion de Packet Tracer).
2. Renseigne email, nom, mot de passe ; **valide l'email** de confirmation.
3. Reviens dans Packet Tracer, choisis **« Cisco Networking Academy »** et connecte-toi.
4. Astuce : si tu veux juste explorer, il existe un bouton **« Guest login »** (accès invité) — mais il **ferme l'app après quelques enregistrements**, donc mieux vaut créer le compte.

---

## 🗺️ Prise en main de l'interface

Regarde les **deux vidéos** ci-dessous (parties 1 et 2). Les zones clés :
- **Zone de travail** (au centre) : tu y déposes et câbles les équipements.
- **Sélecteur d'équipements** (en bas à gauche) : routeurs, switches, PC, serveurs…
- **Câbles** (icône éclair) : le **câble automatique** choisit le bon type ; sinon *cuivre droit* (PC↔switch), *cuivre croisé* (switch↔switch), *série* (routeur↔routeur WAN).
- **CLI** : clique un routeur/switch → onglet **CLI** pour taper les commandes.
- **Realtime / Simulation** (en bas à droite) : le mode **Simulation** fait avancer les paquets **pas à pas** (idéal pour comprendre).

---

## 🧠 Ce qu'il faut retenir

- **1 seul outil pour tous les TP** : Packet Tracer. Prends bien le fichier de **ton OS**.
- Sur **Linux**, \`sudo apt-get install -f\` répare les dépendances manquantes.
- Sur **macOS**, autorise l'app non signée dans *Réglages → Confidentialité et sécurité*.
- Un **compte Netacad gratuit** est nécessaire à la première connexion.
- Le mode **Simulation** montre les paquets circuler — ton meilleur allié pour comprendre.

## ⚠️ Erreurs fréquentes des débutants

**1. Télécharger le mauvais fichier.** Le \`.exe\` est pour Windows, le \`.deb\` pour Ubuntu/Debian, le \`.dmg\` pour macOS. Un \`.deb\` ne s'installe pas sur Windows.

**2. Ignorer les dépendances Linux.** Si \`dpkg -i\` échoue, **ne réessaie pas bêtement** : lance d'abord \`sudo apt-get install -f\`.

**3. Rester bloqué sur macOS.** Le message « développeur non identifié » n'est **pas** une erreur : c'est la sécurité macOS pour une app hors App Store → *Ouvrir quand même*.

**4. Ne pas créer de compte.** Sans compte Netacad, l'accès invité **se ferme** après quelques manipulations — tu perds ton travail. Crée le compte dès le départ.`,
    videos: [
      { title: "Prise en main de Packet Tracer — Partie 1", youtubeId: "0lZo5CWndTY", moreUrl: "https://www.youtube.com/playlist?list=PLgAuOjTVwB6wKkGfriAzKZEXnPrrvI1uF" },
      { title: "Prise en main de Packet Tracer — Partie 2", youtubeId: "18vSw0XPlqU" },
    ],
    resources: [
      { label: "CiscoPacketTracer_900_win_64bit.exe", url: PT_FOLDER, kind: "installer", os: "win", note: "Windows 64-bit — double-clic puis suivre l'assistant." },
      { label: "CiscoPacketTracer_900_Ubuntu_64bit.deb", url: PT_FOLDER, kind: "installer", os: "linux", note: "Ubuntu/Debian — sudo dpkg -i puis sudo apt-get install -f." },
      { label: "CiscoPacketTracer_900_macOS_64bit.dmg", url: PT_FOLDER, kind: "installer", os: "mac", note: "macOS — glisser dans Applications, autoriser dans Sécurité." },
    ],
    badge: {
      id: "badge-pit-setup",
      name: "Pit Setup",
      icon: "Cpu",
      description: "A installé Packet Tracer et préparé son atelier réseau.",
    },
    challenges: [
      {
        id: "res-tp0-fichier-os",
        title: "Le bon installeur",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🪟 Choix du fichier

Tu es sous **Windows**. Quel fichier d'installation de Packet Tracer choisis-tu ?`,
        points: 100,
        timeLimitSec: 180,
        hints: [
          { text: "L'extension d'un installeur Windows est .exe.", cost: 15 },
          { text: "📖 Correction complète : CiscoPacketTracer_900_win_64bit.exe (.exe = Windows).", cost: 40 },
        ],
        options: [
          "CiscoPacketTracer_900_win_64bit.exe",
          "CiscoPacketTracer_900_Ubuntu_64bit.deb",
          "CiscoPacketTracer_900_macOS_64bit.dmg",
          "N'importe lequel, ils sont interchangeables",
        ],
        answer: 0,
        explanation: `Sous Windows, on prend le **\`.exe\`** (\`CiscoPacketTracer_900_win_64bit.exe\`). Le \`.deb\` est réservé à Ubuntu/Debian, le \`.dmg\` à macOS. Les installeurs **ne sont pas** interchangeables entre systèmes.`,
        tags: ["tp", "reseaux", "packet-tracer", "install"],
      },
      {
        id: "res-tp0-linux-deps",
        title: "Dépendances sous Linux",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🐧 Réparer une installation

Sous Ubuntu, ton \`sudo dpkg -i CiscoPacketTracer_900_Ubuntu_64bit.deb\` échoue avec des **erreurs de dépendances**.

**Quelle commande répare les dépendances manquantes ?** (écris la commande exacte)`,
        points: 100,
        timeLimitSec: 300,
        hints: [
          { text: "C'est une commande apt-get avec l'option -f (fix).", cost: 20 },
          { text: "📖 Correction complète : sudo apt-get install -f", cost: 40 },
        ],
        answer: "sudo apt-get install -f",
        accept: ["apt-get install -f", "sudo apt-get -f install", "sudo apt install -f"],
        caseSensitive: false,
        explanation: `\`sudo apt-get install -f\` (l'option **\`-f\`** = *fix broken*) récupère et installe les **dépendances manquantes**. On relance ensuite \`dpkg -i\` si nécessaire. C'est le réflexe standard quand un \`.deb\` se plaint de dépendances.`,
        tags: ["tp", "reseaux", "packet-tracer", "linux"],
      },
      {
        id: "res-tp0-netacad",
        title: "Se connecter la première fois",
        order: 3,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🔑 Première connexion

Au premier lancement, Packet Tracer demande de se connecter. **Que faut-il ?**`,
        points: 100,
        timeLimitSec: 180,
        hints: [
          { text: "C'est un compte gratuit sur la plateforme d'apprentissage de Cisco.", cost: 15 },
          { text: "📖 Correction complète : un compte Cisco Networking Academy (netacad.com), gratuit.", cost: 40 },
        ],
        options: [
          "Un compte Cisco Networking Academy gratuit (netacad.com)",
          "Une licence payante achetée à Cisco",
          "Rien, l'application s'ouvre sans connexion",
          "Un compte Microsoft ou Google",
        ],
        answer: 0,
        explanation: `Packet Tracer exige un **compte Cisco Networking Academy** (créé gratuitement sur **netacad.com**). L'accès **invité** existe mais ferme l'app après quelques manipulations — mieux vaut le vrai compte. Ce n'est ni payant, ni un compte Microsoft/Google.`,
        tags: ["tp", "reseaux", "packet-tracer", "netacad"],
      },
    ],
  },
];
