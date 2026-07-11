import type { CourseSeed } from "../../../../types";

/** Cyber · Système — Module 6 : architecture de la virtualisation. */
export const virtualisation: CourseSeed[] = [
  {
    slug: "cys-virtualisation",
    title: "Architecture de la virtualisation",
    checkpoint: "cyber-systeme",
    codename: "Hypervisor",
    domain: "Système — Virtualisation",
    theme: "grid",
    icon: "Boxes",
    accent: "#E8A87C",
    order: 6,
    difficulty: "medium",
    summary:
      "Les fondations de la virtualisation avant d'en étudier les attaques : rôle de l'hyperviseur (VMM), hyperviseurs Type 1 (bare-metal) vs Type 2 (hosted), mécanismes d'isolation des VM (CPU/anneaux, mémoire/EPT, périphériques), conteneurs vs VM, et la notion de surface d'attaque de l'hyperviseur.",
    objectives: [
      "Définir la virtualisation et le rôle de l'hyperviseur (VMM)",
      "Distinguer hyperviseurs Type 1 (bare-metal) et Type 2 (hosted)",
      "Comprendre les mécanismes d'isolation des VM (CPU, mémoire, I/O)",
      "Différencier virtualisation (VM) et conteneurs",
      "Situer la surface d'attaque et les bénéfices de sécurité de la virtualisation",
    ],
    resources: [
      {
        label: "NIST SP 800-125 — Security for Full Virtualization Technologies",
        url: "https://csrc.nist.gov/pubs/sp/800/125/final",
        kind: "link",
        note: "Recommandations de référence sur la sécurité des technologies de virtualisation complète.",
      },
      {
        label: "NIST SP 800-190 — Application Container Security Guide",
        url: "https://csrc.nist.gov/pubs/sp/800/190/final",
        kind: "link",
        note: "Guide de sécurité des conteneurs, à comparer avec l'isolation par machines virtuelles.",
      },
    ],
    lesson: `# 📦 Architecture de la virtualisation — Hypervisor

La **virtualisation** permet de faire tourner **plusieurs systèmes d'exploitation** isolés sur une **même machine physique**. Elle est au cœur du **cloud** et des datacenters. Comprendre son **architecture** et ses **mécanismes d'isolation** est indispensable avant d'étudier les attaques qui la ciblent (module 7). 🏎️

---

## 1. Qu'est-ce que la virtualisation ? 🧩

La virtualisation crée des **machines virtuelles (VM)** : des ordinateurs **logiciels** complets (avec leur OS, dit **OS invité** / *guest*), qui partagent le **matériel physique** d'une machine **hôte** sans le savoir. Chaque VM croit disposer de son propre processeur, de sa mémoire, de ses disques.

Le chef d'orchestre est l'**hyperviseur** (*hypervisor*), aussi appelé **VMM** (*Virtual Machine Monitor*). Son rôle :
- **Allouer et arbitrer** les ressources physiques (CPU, RAM, I/O) entre les VM.
- **Isoler** les VM les unes des autres (une VM ne doit pas voir/toucher les autres).
- **Intercepter** les instructions sensibles des OS invités et les **émuler/traduire** en toute sécurité.

\`\`\`
   ┌───────┐ ┌───────┐ ┌───────┐
   │  VM A │ │  VM B │ │  VM C │   ← OS invités isolés
   │ (OS)  │ │ (OS)  │ │ (OS)  │
   └───────┘ └───────┘ └───────┘
   ══════════ HYPERVISEUR (VMM) ══════════   ← alloue & isole
   ═══════════ MATÉRIEL PHYSIQUE ══════════
\`\`\`

Bénéfices : **consolidation** (plusieurs serveurs sur une machine), **isolation**, **flexibilité** (snapshots, migration à chaud), **élasticité** du cloud.

---

## 2. Hyperviseur Type 1 vs Type 2 🪜

On distingue deux architectures selon **où** s'exécute l'hyperviseur :

### Type 1 — *bare-metal* (natif) 🏗️

L'hyperviseur s'exécute **directement sur le matériel**, sans OS hôte en dessous. Il **est** la couche de base.
- Exemples : **VMware ESXi**, **Microsoft Hyper-V**, **Xen**, **KVM** (intégré au noyau Linux).
- **Performances** élevées (accès direct au matériel), **surface d'attaque réduite** (pas d'OS hôte complet).
- Usage : **datacenters**, **cloud**, production.

### Type 2 — *hosted* (hébergé) 💻

L'hyperviseur s'exécute **comme une application au-dessus d'un OS hôte** classique (Windows, macOS, Linux).
- Exemples : **VirtualBox**, **VMware Workstation/Player**, **QEMU** (mode hosted), **Parallels**.
- Plus **simple** à installer sur un poste de travail, mais **moins performant** et **surface d'attaque plus large** (l'OS hôte **et** l'hyperviseur peuvent être vulnérables).
- Usage : **postes de travail**, tests, développement.

\`\`\`
   TYPE 1 (bare-metal)              TYPE 2 (hosted)
   ┌──────┐┌──────┐                ┌──────┐┌──────┐
   │ VM   ││ VM   │                │ VM   ││ VM   │
   └──────┘└──────┘                └──────┘└──────┘
   ═ HYPERVISEUR ═                 ═ HYPERVISEUR (appli) ═
   ═══ MATÉRIEL ══                 ═════ OS HÔTE ═════════
                                   ═════ MATÉRIEL ════════
\`\`\`

> 🧭 Repère : **Type 1 = hyperviseur directement sur le matériel** (cloud/prod, plus sûr/rapide) ; **Type 2 = hyperviseur au-dessus d'un OS hôte** (poste de travail, plus simple mais surface d'attaque + grande).

---

## 3. Les mécanismes d'isolation des VM 🧱

L'**isolation** est **la** propriété de sécurité centrale : ce qui se passe dans une VM ne doit **pas** affecter les autres ni l'hôte. Elle repose sur plusieurs niveaux :

### Isolation CPU (anneaux & virtualisation matérielle)

- Les processeurs offrent des **anneaux de privilège** (Ring 0 = noyau, Ring 3 = applications). L'hyperviseur doit s'exécuter **plus privilégié** que les OS invités.
- Les extensions matérielles **Intel VT-x** / **AMD-V** introduisent un mode **racine/non-racine** (parfois appelé « Ring -1 » pour l'hyperviseur) : les instructions **sensibles** de l'invité provoquent un **VM-exit** (piège) traité par l'hyperviseur → l'invité ne peut pas contourner l'isolation.

### Isolation mémoire (pagination imbriquée)

- Chaque VM a son **espace d'adressage** ; l'hyperviseur garantit qu'une VM **ne peut pas lire/écrire** la mémoire d'une autre.
- La **virtualisation mémoire matérielle** — **EPT** (Intel *Extended Page Tables*) / **NPT/RVI** (AMD) — traduit les adresses **invité → physique** de façon isolée, sans que l'invité puisse sortir de sa **cage** mémoire.

### Isolation des périphériques (I/O)

- Les périphériques sont **émulés** ou **paravirtualisés** ; l'accès direct (**passthrough**) est encadré par l'**IOMMU** (**Intel VT-d** / **AMD-Vi**) qui **restreint** les accès mémoire par DMA d'un périphérique à une VM donnée → empêche une VM d'atteindre la mémoire d'une autre via le matériel.

> 🧠 L'isolation est **multi-couches** : **CPU** (VM-exit sur instructions sensibles), **mémoire** (EPT/NPT), **I/O** (IOMMU). Chaque couche empêche une VM de **s'échapper** ou d'**espionner** ses voisines. C'est exactement ce que les attaques du module 7 cherchent à **briser**.

---

## 4. Virtualisation vs conteneurs 📦🐳

Il ne faut pas confondre **VM** et **conteneurs** :

| | **Machine virtuelle (VM)** | **Conteneur** |
|---|---|---|
| Isole | un **OS complet** (noyau invité inclus) | un **processus/appli** (partage le **noyau de l'hôte**) |
| Couche | **hyperviseur** | moteur de conteneurs (ex. Docker) + noyau hôte |
| Isolation | **forte** (frontière matérielle assistée) | plus **légère** (namespaces, cgroups du noyau) |
| Poids / démarrage | lourd / lent (OS entier) | léger / rapide |
| Surface d'évasion | s'échapper = casser l'**hyperviseur** | s'échapper = casser l'**isolation du noyau partagé** |

- Les **conteneurs** partagent le **noyau de l'hôte** → une faille du noyau peut permettre une **évasion de conteneur** plus « facilement » qu'une évasion de VM.
- Les **VM** offrent une **isolation plus forte** (chaque VM a son **propre noyau**, la frontière est assistée par le matériel), au prix de **plus de ressources**.

> 🧭 Compromis : **conteneur = léger mais isolation plus faible** (noyau partagé) ; **VM = lourd mais isolation plus forte** (noyau séparé + hyperviseur). Beaucoup d'architectures **combinent** les deux (conteneurs **dans** des VM).

---

## 5. Sécurité : bénéfices et surface d'attaque ⚖️

**Bénéfices de sécurité** de la virtualisation :
- **Cloisonnement** : compromettre une VM ne compromet **pas** (en théorie) les autres.
- **Snapshots / rollback** : revenir à un état sain après incident.
- **Bacs à sable** (*sandbox*) : analyser un malware dans une VM jetable.
- **Sécurité par la virtualisation** (VBS/HVCI côté OS) : isoler des composants sensibles du noyau.

**Mais** la virtualisation **ajoute une couche** — donc une **nouvelle surface d'attaque** :
- L'**hyperviseur** devient un composant **critique** : le compromettre donne le contrôle de **toutes** les VM.
- Le **partage de matériel** (cache, CPU) crée des **canaux cachés/latéraux** (module 5) entre VM.
- La **complexité** (émulation de périphériques, outils invité) multiplie les **bugs** exploitables.

> 🧠 Principe pour la suite : plus la couche est **basse et partagée** (l'hyperviseur, le matériel), plus sa compromission est **grave** — car elle brise l'**isolation** dont dépendent **toutes** les VM. C'est l'objet du module 7 (**attaques contre la virtualisation**).

---

## 🧠 À retenir

- La **virtualisation** fait tourner plusieurs **VM** (OS invités isolés) sur un matériel partagé, orchestrées par l'**hyperviseur / VMM** qui **alloue**, **isole** et **intercepte** les instructions sensibles.
- **Type 1 (bare-metal)** : hyperviseur **directement sur le matériel** (ESXi, Hyper-V, Xen, KVM) → performant, surface réduite, **cloud/prod**. **Type 2 (hosted)** : hyperviseur **au-dessus d'un OS hôte** (VirtualBox, VMware Workstation) → simple, mais surface d'attaque **plus large**, **poste de travail**.
- **Isolation multi-couches** : **CPU** (VT-x/AMD-V, **VM-exit** sur instructions sensibles), **mémoire** (**EPT**/NPT, pagination imbriquée), **I/O** (**IOMMU** VT-d/AMD-Vi contre le DMA malveillant).
- **VM vs conteneurs** : la VM isole un **OS complet** (noyau propre, isolation **forte**, lourde) ; le conteneur partage le **noyau de l'hôte** (namespaces/cgroups, **léger** mais isolation **plus faible**, évasion via le noyau).
- **Sécurité** : bénéfices (**cloisonnement**, snapshots, sandbox) **mais** nouvelle **surface d'attaque** — l'**hyperviseur** est critique (le casser = contrôler toutes les VM), le **matériel partagé** ouvre des **canaux latéraux**. Base du module 7.`,
    badge: {
      id: "badge-cys-hypervisor",
      name: "Hypervisor",
      icon: "Boxes",
      description: "Maîtrise l'architecture de la virtualisation : hyperviseurs Type 1/2 et l'isolation des VM.",
    },
    challenges: [
      {
        id: "cys-virt-vmm",
        title: "Le rôle de l'hyperviseur",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🧩 Hyperviseur

Quel est le rôle principal de l'**hyperviseur** (VMM) ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Il gère le partage du matériel entre les VM tout en les isolant.", cost: 10 },
          { text: "📖 Correction : allouer/arbitrer les ressources et isoler les VM.", cost: 30 },
        ],
        options: [
          "Allouer et arbitrer les ressources physiques entre les VM tout en les isolant les unes des autres",
          "Chiffrer le disque dur de l'hôte",
          "Accélérer la connexion Internet",
          "Remplacer le processeur physique",
        ],
        answer: 0,
        explanation: `L'**hyperviseur / VMM** **alloue et arbitre** les ressources physiques (CPU, RAM, I/O) entre les **VM**, **isole** les VM entre elles et de l'hôte, et **intercepte** les instructions sensibles des OS invités pour les traiter en sécurité. C'est le composant **central** — et donc **critique** — de la virtualisation.`,
        tags: ["hyperviseur", "vmm", "isolation"],
      },
      {
        id: "cys-virt-types",
        title: "Type 1 vs Type 2",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🪜 Architectures

Qu'est-ce qui distingue un hyperviseur **Type 1 (bare-metal)** d'un hyperviseur **Type 2 (hosted)** ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "L'un est directement sur le matériel, l'autre est une application au-dessus d'un OS hôte.", cost: 20 },
          { text: "📖 Correction : Type 1 = directement sur le matériel ; Type 2 = au-dessus d'un OS hôte.", cost: 50 },
        ],
        options: [
          "Le Type 1 s'exécute directement sur le matériel (bare-metal) ; le Type 2 s'exécute comme une application au-dessus d'un OS hôte",
          "Le Type 1 n'isole pas les VM, le Type 2 si",
          "Le Type 2 est toujours plus rapide que le Type 1",
          "Il n'y a aucune différence, seul le nom change",
        ],
        answer: 0,
        explanation: `**Type 1 (bare-metal)** : l'hyperviseur s'exécute **directement sur le matériel** (ESXi, Hyper-V, Xen, KVM) → performant, surface d'attaque réduite, usage **cloud/prod**. **Type 2 (hosted)** : l'hyperviseur est une **application au-dessus d'un OS hôte** (VirtualBox, VMware Workstation) → plus simple sur un poste, mais **surface d'attaque plus large** (OS hôte **+** hyperviseur).`,
        tags: ["type-1", "type-2", "bare-metal"],
      },
      {
        id: "cys-virt-memoire",
        title: "Isolation mémoire",
        order: 3,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🧱 Isolation

Quel mécanisme matériel assure qu'une VM **ne peut pas accéder à la mémoire** d'une autre VM ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Une traduction d'adresses invité→physique matérielle (Intel EPT / AMD NPT).", cost: 30 },
          { text: "📖 Correction : la pagination imbriquée EPT (Intel) / NPT (AMD).", cost: 80 },
        ],
        options: [
          "La virtualisation mémoire matérielle : EPT (Intel) / NPT (AMD), qui traduit les adresses invité→physique de façon isolée",
          "Le protocole HTTPS entre les VM",
          "La couleur attribuée à chaque VM dans l'interface",
          "Le simple fait de nommer les VM différemment",
        ],
        answer: 0,
        explanation: `L'isolation mémoire repose sur la **virtualisation mémoire matérielle** — **EPT** (Intel *Extended Page Tables*) / **NPT** (AMD) — qui traduit les adresses **invité → physique** en maintenant chaque VM dans sa **cage** mémoire. S'ajoutent l'isolation **CPU** (VT-x/AMD-V, **VM-exit**) et **I/O** (**IOMMU** VT-d/AMD-Vi contre le DMA malveillant).`,
        tags: ["ept", "npt", "memoire"],
      },
      {
        id: "cys-virt-conteneur",
        title: "VM vs conteneur",
        order: 4,
        difficulty: "hard",
        type: "mcq",
        prompt: `## 🐳 Conteneurs

Quelle est la différence d'**isolation** fondamentale entre une **VM** et un **conteneur** ?`,
        points: 350,
        timeLimitSec: 360,
        hints: [
          { text: "Le conteneur partage le noyau de l'hôte ; la VM a son propre noyau.", cost: 30 },
          { text: "📖 Correction : VM = OS/noyau complet isolé (fort) ; conteneur = partage le noyau hôte (plus léger, isolation plus faible).", cost: 80 },
        ],
        options: [
          "La VM isole un OS complet avec son propre noyau (isolation forte, assistée par le matériel) ; le conteneur partage le noyau de l'hôte (plus léger, isolation plus faible)",
          "Le conteneur isole plus fortement que la VM car il a son propre matériel",
          "La VM et le conteneur sont techniquement identiques",
          "Le conteneur embarque toujours un hyperviseur Type 1",
        ],
        answer: 0,
        explanation: `Une **VM** isole un **OS complet** (avec son **propre noyau**), via l'hyperviseur et l'assistance **matérielle** → isolation **forte** mais **lourde**. Un **conteneur** partage le **noyau de l'hôte** (isolation par **namespaces/cgroups**) → **léger et rapide**, mais isolation **plus faible** : une faille du **noyau partagé** peut permettre une **évasion de conteneur**. On combine souvent les deux (conteneurs **dans** des VM).`,
        tags: ["conteneur", "vm", "noyau"],
      },
      {
        id: "cys-virt-surface",
        title: "La couche critique",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚖️ Surface d'attaque

Pourquoi l'**hyperviseur** est-il un composant particulièrement **critique** du point de vue sécurité ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Il est sous TOUTES les VM et garantit leur isolation.", cost: 20 },
          { text: "📖 Correction : le compromettre donne le contrôle de toutes les VM (brise l'isolation).", cost: 50 },
        ],
        options: [
          "Parce que le compromettre donne le contrôle de toutes les VM qu'il héberge : il brise l'isolation dont elles dépendent toutes",
          "Parce qu'il ralentit volontairement les VM",
          "Parce qu'il ne sert qu'à afficher les VM à l'écran",
          "Parce qu'il n'a accès à aucune ressource",
        ],
        answer: 0,
        explanation: `L'**hyperviseur** est la couche **basse et partagée** sur laquelle repose l'**isolation** de **toutes** les VM. Le **compromettre** revient à contrôler l'ensemble des VM hébergées → impact **maximal**. C'est pourquoi les attaques du module 7 (évasion de VM, attaques sur l'hyperviseur) le visent : casser l'isolation à sa racine.`,
        tags: ["surface-attaque", "hyperviseur", "critique"],
      },
      {
        id: "cys-virt-benefits",
        title: "Bénéfices de sécurité",
        order: 6,
        difficulty: "easy",
        type: "multi",
        prompt: `## 🛡️ Apports

Quels sont des **bénéfices de sécurité** légitimes de la virtualisation ? (Coche tout ce qui s'applique.)`,
        points: 200,
        timeLimitSec: 300,
        options: [
          "Cloisonnement : compromettre une VM n'affecte pas (en théorie) les autres",
          "Snapshots / rollback pour revenir à un état sain",
          "Bacs à sable (sandbox) jetables pour analyser un malware",
          "Suppression définitive de toute vulnérabilité logicielle",
        ],
        answer: [0, 1, 2],
        hints: [
          { text: "Trois vrais bénéfices ; le quatrième est une promesse impossible.", cost: 20 },
          { text: "📖 Correction : cloisonnement + snapshots + sandbox. La virtu ne supprime pas les vulnérabilités.", cost: 50 },
        ],
        explanation: `La virtualisation apporte le **cloisonnement** (isolation des VM), les **snapshots/rollback** (retour à un état sain) et des **sandbox** jetables (analyse de malware). Mais elle **ne supprime pas** les vulnérabilités : elle **ajoute** même une couche (l'**hyperviseur**) et une **surface d'attaque** (matériel partagé, canaux latéraux). Bénéfices réels, pas de solution miracle.`,
        tags: ["benefices", "sandbox", "cloisonnement"],
      },
    ],
  },
];
