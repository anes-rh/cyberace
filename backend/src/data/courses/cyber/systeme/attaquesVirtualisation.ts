import type { CourseSeed } from "../../../../types";

/** Cyber · Système — Module 7 : attaques contre la virtualisation. */
export const attaquesVirtualisation: CourseSeed[] = [
  {
    slug: "cys-attaques-virtu",
    title: "Attaques contre la virtualisation",
    checkpoint: "cyber-systeme",
    codename: "VM Escape",
    domain: "Système — Attaques virtualisation",
    theme: "grid",
    icon: "ServerCrash",
    accent: "#E8A87C",
    order: 7,
    difficulty: "insane",
    summary:
      "Briser l'isolation : évasion de VM (VM escape) vers l'hyperviseur, attaques sur l'hyperviseur (surface d'attaque, rootkit d'hyperviseur/hyperjacking), attaques inter-VM par canaux latéraux (cache, Spectre/Meltdown), risques du cloud multi-tenant, VM sprawl et attaques sur la gestion. Contre-mesures et durcissement.",
    objectives: [
      "Comprendre l'évasion de VM (VM escape) et son impact",
      "Décrire les attaques sur l'hyperviseur (hyperjacking, rootkit d'hyperviseur)",
      "Expliquer les attaques inter-VM par canaux latéraux (cache, Spectre/Meltdown)",
      "Situer les risques propres au cloud multi-tenant et au VM sprawl",
      "Connaître les contre-mesures et le durcissement d'un environnement virtualisé",
    ],
    resources: [
      {
        label: "MITRE ATT&CK — Escape to Host (T1611)",
        url: "https://attack.mitre.org/techniques/T1611/",
        kind: "link",
        note: "Technique d'évasion depuis un conteneur/VM vers l'hôte sous-jacent.",
      },
      {
        label: "NIST SP 800-125A — Security Recommendations for Hypervisor Deployment",
        url: "https://csrc.nist.gov/pubs/sp/800/125/a/rev-1/final",
        kind: "link",
        note: "Recommandations de durcissement et de configuration sécurisée des hyperviseurs.",
      },
    ],
    lesson: `# 💥 Attaques contre la virtualisation — VM Escape

La virtualisation **repose entièrement sur l'isolation** (module 6). Toute la sécurité du modèle s'effondre si un attaquant parvient à **s'échapper** de sa VM ou à **compromettre l'hyperviseur**. Ce module recense les **attaques** qui visent à briser cette isolation. *(Analyse théorique — aucune exploitation réelle.)* 🏎️

---

## 1. L'évasion de VM (VM escape) 🏃

L'**évasion de VM** (*VM escape*) est **l'attaque reine** : un attaquant qui contrôle un **OS invité** (une VM) parvient à **s'échapper** de la VM pour exécuter du code sur l'**hyperviseur** ou l'**hôte**, brisant l'isolation.

- **Principe** : exploiter une **vulnérabilité** dans l'hyperviseur — le plus souvent dans les **composants d'émulation** exposés à l'invité : périphériques virtuels (carte réseau, contrôleur disque, USB, carte graphique), instructions sensibles mal filtrées, ou **outils invités** (VMware Tools, drivers paravirtualisés).
- **Impact** : depuis l'hôte, l'attaquant peut atteindre **toutes les autres VM** de la machine → compromission **totale** (surtout grave en **cloud**, où des VM de **clients différents** cohabitent).
- Des cas réels ont visé l'émulation de périphériques (ex. contrôleurs disquette/USB de QEMU) — d'où l'importance de **réduire les périphériques virtuels** exposés.

\`\`\`
   AVANT :   [VM attaquant] │ isolation │ [autres VM]
                            ▼ exploite un bug de l'émulation
   APRÈS :   [VM attaquant] ──► HYPERVISEUR/HÔTE ──► [toutes les VM]   ← isolation brisée
\`\`\`

> ⚠️ La VM escape transforme une compromission **locale** (une seule VM) en compromission **globale** (l'hôte et tous ses locataires). C'est le pire scénario de la virtualisation.

---

## 2. Les attaques sur l'hyperviseur 🎯

L'hyperviseur étant le **cœur de confiance**, il est une cible de choix :
- **Exploitation de vulnérabilités de l'hyperviseur** : failles dans le VMM lui-même (gestion mémoire, hypercalls, émulation) → prise de contrôle.
- **Hyperjacking** : insérer un **hyperviseur malveillant** **sous** le système, ou compromettre l'hyperviseur légitime, pour prendre le contrôle **au niveau le plus bas** — l'OS s'exécute alors « au-dessus » sans le savoir.
- **Rootkit d'hyperviseur** (concept **« Blue Pill »**, cf. module 1) : un rootkit qui **déplace** l'OS cible dans une VM qu'il contrôle → furtivité extrême, car il est **plus privilégié** que le noyau (« Ring -1 »).
- **Attaques sur les interfaces de gestion** : les consoles/API d'administration (vCenter, hyperviseur management) sont des **portes maîtresses** : les compromettre (identifiants faibles, exposition réseau) permet de **contrôler toutes les VM** sans même exploiter de faille technique.

> 🧭 Deux voies vers l'hyperviseur : **par le bas via une VM** (VM escape) ou **par le haut via la gestion** (interfaces d'administration). La seconde est souvent **plus facile** (mauvais mots de passe, exposition) — d'où l'importance de durcir la **couche de management**.

---

## 3. Les attaques inter-VM (canaux latéraux) 🔍

Sans même s'échapper, une VM peut **espionner** une VM voisine en exploitant le **matériel partagé** — ce sont les **canaux latéraux/cachés** (module 5) appliqués à la virtualisation :

- **Attaques par le cache CPU** : le **cache** est partagé entre VM co-résidentes. Des techniques comme **Prime+Probe** ou **Flush+Reload** mesurent des **différences de temps d'accès** pour déduire l'activité d'une VM voisine — jusqu'à **extraire des clés cryptographiques**.
- **Spectre / Meltdown** (2018) et variantes (**Foreshadow/L1TF**, **MDS**) : failles **micro-architecturales** (exécution spéculative) qui permettent de **lire de la mémoire** à laquelle on ne devrait pas avoir accès — potentiellement **au-delà de la frontière de VM**, brisant l'isolation **sans exploiter l'hyperviseur logiciel**.
- **Cross-VM side channels** : déduire de l'information (charge, comportement) d'une VM voisine.
- **Co-résidence (cloud)** : un attaquant tente de **placer sa VM sur le même hôte physique** que sa cible (co-résidence) pour lancer ces attaques → risque spécifique du **cloud multi-tenant**.

> 🧠 Point crucial : ces attaques **ne cassent pas le logiciel** de l'hyperviseur — elles exploitent le **partage du matériel** (cache, CPU). Elles sont donc **difficiles à corriger** (correctifs micro-code, isolation du cache, désactivation de l'hyperthreading… au prix des performances).

---

## 4. Risques du cloud et de la gestion ☁️

L'environnement virtualisé introduit des risques **opérationnels** :
- **Multi-tenant** : des **clients différents** partagent le même matériel → une évasion ou un canal latéral menace la **confidentialité inter-clients**.
- **VM sprawl** (prolifération) : la facilité de créer des VM engendre des VM **oubliées, non patchées, non surveillées** → surface d'attaque **incontrôlée**.
- **Snapshots & images** : un **snapshot** peut contenir des **secrets** (mémoire, clés) ; une **image** de base compromise se **propage** à toutes les VM qui en dérivent. Restaurer un snapshot ancien **ré-introduit** d'anciennes vulnérabilités.
- **Migration à chaud** (*live migration*) : si le trafic de migration n'est **pas chiffré**, la mémoire d'une VM (avec ses secrets) transite **en clair** sur le réseau → interception.
- **Escape via conteneurs** : dans les architectures conteneurisées, une **évasion de conteneur** (noyau partagé) mène à l'hôte (**T1611**).

---

## 5. Contre-mesures et durcissement 🛡️

- **Réduire la surface de l'hyperviseur** : **désactiver les périphériques virtuels inutiles** (USB, disquette, presse-papiers partagé, dossiers partagés), retirer les outils invités superflus.
- **Mettre à jour** l'hyperviseur et le **micro-code** CPU (correctifs Spectre/Meltdown/L1TF/MDS).
- **Durcir la gestion** : isoler le **réseau d'administration**, **MFA** sur les consoles, mots de passe forts, moindre privilège, journalisation.
- **Isolation renforcée** : dédier des hôtes à des locataires sensibles (*dedicated hosting*), désactiver l'**hyperthreading** ou **partitionner le cache** pour les charges critiques, **chiffrer la mémoire des VM** (AMD **SEV**, Intel **TDX** — *confidential computing*).
- **Chiffrer la migration** à chaud et le **stockage** des snapshots/images.
- **Gérer le cycle de vie** : inventaire des VM (contre le **VM sprawl**), patch des images de base, suppression des VM obsolètes, surveillance (**WIDS**/monitoring de l'hyperviseur).
- **Défense en profondeur** : ne **pas** considérer l'isolation VM comme **absolue** — segmenter aussi **au sein** des VM (pare-feu, moindre privilège), car l'isolation peut être **brisée**.

> 🧠 Fil rouge de tout le mini-checkpoint : **plus une couche est basse et partagée** (noyau, hyperviseur, matériel), **plus sa compromission est catastrophique**. La virtualisation **concentre** la confiance dans l'hyperviseur et le matériel — les protéger et **ne jamais supposer l'isolation infaillible** est la clé.

---

## 🧠 À retenir

- **VM escape** (évasion de VM) : depuis un **OS invité** compromis, exploiter une faille de l'hyperviseur (souvent l'**émulation de périphériques** virtuels ou les **outils invités**) pour atteindre l'**hôte** → compromission de **toutes les VM**. Pire scénario, surtout en **cloud**.
- **Attaques sur l'hyperviseur** : exploitation de ses **vulnérabilités**, **hyperjacking** (hyperviseur malveillant sous l'OS), **rootkit d'hyperviseur** (« Blue Pill », Ring -1), et surtout **compromission des interfaces de gestion** (souvent la voie la plus facile).
- **Attaques inter-VM (canaux latéraux)** : exploiter le **matériel partagé** — **cache** (Prime+Probe, Flush+Reload → vol de clés), **Spectre/Meltdown/L1TF/MDS** (lecture de mémoire au-delà de la frontière VM), **co-résidence** en cloud. **Ne cassent pas le logiciel** → difficiles à corriger.
- **Risques cloud/gestion** : **multi-tenant** (confidentialité inter-clients), **VM sprawl** (VM oubliées non patchées), **snapshots/images** (secrets, propagation, vulnérabilités ré-introduites), **migration à chaud non chiffrée**, **évasion de conteneur** (T1611).
- **Contre-mesures** : **réduire la surface** (désactiver périphériques/outils inutiles), **MAJ** hyperviseur + **micro-code**, **durcir la gestion** (réseau isolé, MFA), **isolation renforcée** (hôtes dédiés, chiffrement mémoire **SEV/TDX**, gestion de l'hyperthreading), **chiffrer** migration/snapshots, **gérer le cycle de vie**, **défense en profondeur** (l'isolation VM **n'est pas absolue**).`,
    badge: {
      id: "badge-cys-vm-escape",
      name: "VM Escape",
      icon: "ServerCrash",
      description: "Maîtrise les attaques contre la virtualisation : VM escape, hyperjacking, canaux latéraux inter-VM.",
    },
    challenges: [
      {
        id: "cys-av-escape",
        title: "L'évasion de VM",
        order: 1,
        difficulty: "insane",
        type: "mcq",
        prompt: `## 🏃 VM escape

En quoi consiste une **évasion de VM** (VM escape) et pourquoi est-elle si grave ?`,
        points: 550,
        timeLimitSec: 480,
        hints: [
          { text: "L'attaquant part d'une VM et atteint l'hyperviseur/l'hôte, souvent via l'émulation de périphériques.", cost: 40 },
          { text: "📖 Correction : s'échapper d'une VM vers l'hôte → contrôle de toutes les autres VM.", cost: 120 },
        ],
        options: [
          "L'attaquant, maître d'une VM, exploite une faille de l'hyperviseur (souvent l'émulation de périphériques) pour s'échapper vers l'hôte et atteindre toutes les autres VM",
          "L'attaquant éteint simplement sa propre VM",
          "L'attaquant change le fond d'écran de l'hôte",
          "L'attaquant augmente la RAM allouée à sa VM",
        ],
        answer: 0,
        explanation: `La **VM escape** exploite une **vulnérabilité de l'hyperviseur** (souvent dans l'**émulation de périphériques** virtuels ou les **outils invités**) pour **sortir** d'une VM et exécuter du code sur l'**hôte**. Impact : l'attaquant atteint **toutes les autres VM** → une compromission **locale** devient **globale**. En **cloud multi-tenant**, cela menace les VM d'**autres clients**.`,
        tags: ["vm-escape", "hyperviseur", "emulation"],
      },
      {
        id: "cys-av-hyperjacking",
        title: "Hyperjacking",
        order: 2,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🎯 Rootkit d'hyperviseur

Qu'est-ce que le **hyperjacking** (ou rootkit d'hyperviseur type « Blue Pill ») ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Prendre le contrôle au niveau le plus bas, sous l'OS, qui s'exécute alors 'au-dessus' sans le savoir.", cost: 30 },
          { text: "📖 Correction : insérer/compromettre un hyperviseur malveillant sous l'OS pour un contrôle furtif au niveau le plus privilégié.", cost: 80 },
        ],
        options: [
          "Insérer un hyperviseur malveillant (ou compromettre l'hyperviseur) sous l'OS, qui s'exécute alors au-dessus sans le savoir : contrôle furtif au niveau le plus privilégié",
          "Augmenter la fréquence d'horloge de l'hôte",
          "Créer un très grand nombre de VM identiques",
          "Chiffrer les disques de toutes les VM",
        ],
        answer: 0,
        explanation: `Le **hyperjacking** consiste à **insérer un hyperviseur malveillant** sous le système (ou à compromettre l'hyperviseur légitime) : l'OS s'exécute « au-dessus » **sans le savoir**, l'attaquant contrôle la couche la **plus privilégiée** (« Ring -1 »). C'est le concept de **rootkit d'hyperviseur (« Blue Pill »)** — furtivité extrême car **plus privilégié** que le noyau.`,
        tags: ["hyperjacking", "blue-pill", "rootkit"],
      },
      {
        id: "cys-av-sidechannel",
        title: "Espionner sans s'échapper",
        order: 3,
        difficulty: "insane",
        type: "mcq",
        prompt: `## 🔍 Canaux latéraux inter-VM

Comment une VM peut-elle **espionner une VM voisine** (jusqu'à extraire des clés) **sans** exploiter de faille logicielle de l'hyperviseur ?`,
        points: 550,
        timeLimitSec: 480,
        hints: [
          { text: "En exploitant le matériel partagé : le cache CPU, via des mesures de temps (Prime+Probe, Flush+Reload).", cost: 40 },
          { text: "📖 Correction : canaux latéraux sur le cache/CPU partagé (et Spectre/Meltdown) → difficiles à corriger.", cost: 120 },
        ],
        options: [
          "En exploitant le matériel partagé — le cache CPU (Prime+Probe, Flush+Reload) et les failles micro-architecturales (Spectre/Meltdown) — via des mesures de temps",
          "En demandant poliment ses données à la VM voisine",
          "En augmentant la taille de son disque virtuel",
          "En renommant la VM voisine",
        ],
        answer: 0,
        explanation: `Les **canaux latéraux inter-VM** exploitent le **matériel partagé** entre VM co-résidentes : le **cache CPU** (**Prime+Probe**, **Flush+Reload**) via des **mesures de temps** d'accès, et les failles **micro-architecturales** (**Spectre/Meltdown/L1TF/MDS**) qui lisent de la mémoire au-delà de la frontière VM. Elles **ne cassent pas le logiciel** de l'hyperviseur → **difficiles à corriger** (micro-code, isolation du cache, au prix des performances).`,
        tags: ["canaux-lateraux", "cache", "spectre"],
      },
      {
        id: "cys-av-management",
        title: "La voie la plus facile",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## ☁️ Interfaces de gestion

Souvent, compromettre un environnement virtualisé **ne nécessite même pas** d'exploiter une faille technique de l'hyperviseur. Quelle est la voie souvent **plus facile** ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Les consoles/API d'administration (vCenter, etc.) mal protégées.", cost: 30 },
          { text: "📖 Correction : compromettre les interfaces de gestion (identifiants faibles, exposition réseau).", cost: 80 },
        ],
        options: [
          "Compromettre les interfaces de gestion/administration (identifiants faibles, exposition réseau), qui contrôlent toutes les VM",
          "Réécrire physiquement le firmware du CPU à la main",
          "Deviner la clé AES de chaque VM une par une",
          "Débrancher le câble réseau du datacenter",
        ],
        answer: 0,
        explanation: `Les **interfaces de gestion** (consoles/API : vCenter, management de l'hyperviseur) **contrôlent toutes les VM**. Les **compromettre** (mots de passe faibles, **exposition réseau**, absence de MFA) donne le contrôle **sans** exploiter la moindre faille technique de l'hyperviseur → souvent la voie **la plus facile**. D'où : **réseau d'admin isolé**, **MFA**, moindre privilège, journalisation.`,
        tags: ["gestion", "vcenter", "durcissement"],
      },
      {
        id: "cys-av-cloud-risks",
        title: "Risques du cloud",
        order: 5,
        difficulty: "medium",
        type: "multi",
        prompt: `## ☁️ Multi-tenant

Quels risques sont **spécifiquement** amplifiés dans un environnement virtualisé/cloud ? (Coche tout ce qui s'applique.)`,
        points: 200,
        timeLimitSec: 360,
        options: [
          "Multi-tenant : des clients différents partagent le même matériel (menace inter-clients)",
          "VM sprawl : prolifération de VM oubliées, non patchées, non surveillées",
          "Migration à chaud non chiffrée : la mémoire d'une VM (secrets) transite en clair",
          "L'impossibilité totale de créer la moindre machine virtuelle",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Trois risques réels ; le quatrième est le contraire du problème (le cloud crée trop de VM, pas trop peu).", cost: 20 },
          { text: "📖 Correction : multi-tenant + VM sprawl + migration non chiffrée.", cost: 50 },
        ],
        explanation: `Le cloud/virtualisé amplifie : le **multi-tenant** (matériel partagé entre clients → menace inter-clients via escape/canaux latéraux), le **VM sprawl** (VM **oubliées/non patchées** = surface incontrôlée), et la **migration à chaud non chiffrée** (mémoire d'une VM, avec ses **secrets**, transitant **en clair**). La « impossibilité de créer une VM » n'est pas un risque — le problème est justement qu'on en crée **trop facilement**.`,
        tags: ["cloud", "vm-sprawl", "multi-tenant"],
      },
      {
        id: "cys-av-hardening",
        title: "Durcir la virtualisation",
        order: 6,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🛡️ Contre-mesures

Quelle mesure réduit **directement** la surface d'attaque exploitée par une **VM escape** ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "La VM escape passe souvent par l'émulation de périphériques virtuels superflus.", cost: 30 },
          { text: "📖 Correction : désactiver les périphériques virtuels/outils invités inutiles (+ MAJ hyperviseur).", cost: 80 },
        ],
        options: [
          "Désactiver les périphériques virtuels et outils invités inutiles (USB, dossiers/presse-papiers partagés…) et maintenir l'hyperviseur à jour",
          "Donner plus de RAM à chaque VM",
          "Exposer la console d'administration directement sur Internet",
          "Désactiver toute journalisation de l'hyperviseur",
        ],
        answer: 0,
        explanation: `La **VM escape** exploite souvent l'**émulation de périphériques virtuels** ou les **outils invités**. **Désactiver** les périphériques et fonctionnalités superflus (USB, disquette, dossiers/presse-papiers partagés) et **maintenir l'hyperviseur à jour** réduit **directement** cette surface. À compléter par : **durcir la gestion** (réseau isolé, MFA), **isolation renforcée** (SEV/TDX), **cycle de vie** des VM, et **défense en profondeur** (ne pas croire l'isolation absolue).`,
        tags: ["durcissement", "surface-attaque", "vm-escape"],
      },
    ],
  },
];
