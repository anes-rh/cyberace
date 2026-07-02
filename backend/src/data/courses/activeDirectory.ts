import type { CourseSeed } from "../../types";

export const activeDirectory: CourseSeed = {
  slug: "active-directory",
  title: "Sécurité Active Directory",
  codename: "Domain Rush",
  domain: "Active Directory",
  theme: "constellation",
  icon: "Network",
  accent: "#f472b6",
  order: 3,
  difficulty: "hard",
  summary:
    "Énumère un annuaire simulé, repère les comptes de service faibles et trace ton chemin vers Domain Admins — sans toucher un vrai DC.",
  objectives: [
    "Énumérer utilisateurs, groupes et SPN (façon PowerView)",
    "Identifier les comptes Kerberoastables et AS-REP roastables",
    "Comprendre les chemins d'escalade via ACL (GenericAll, DCSync)",
    "Raisonner en graphe d'attaque (logique BloodHound)",
  ],
  lesson: `## Énumérer avant d'attaquer

Dans un domaine Windows, tout est objet LDAP. Les outils type **PowerView** interrogent l'annuaire : \`Get-DomainUser\`, \`Get-DomainGroup\`, \`Get-DomainComputer\`. Ici, l'annuaire est **simulé en JSON** — la logique reste identique.

Deux attributs valent de l'or :
- **servicePrincipalName (SPN)** : un compte avec un SPN est un compte de service → cible de **Kerberoasting**.
- **userAccountControl (UAC)** : le drapeau **DONT_REQ_PREAUTH** désactive la pré-authentification Kerberos → cible d'**AS-REP Roasting**.

## Kerberoasting (version simplifiée)

Tout utilisateur authentifié peut demander un ticket de service (TGS) pour un SPN. Ce ticket est chiffré avec le **hash NTLM du compte de service**. On l'exfiltre et on le casse hors ligne (Hashcat mode 13100). Contre-mesure : mots de passe de service longs et **gMSA**.

## AS-REP Roasting

Si un compte a *DONT_REQ_PREAUTH*, l'AS renvoie un AS-REP chiffré avec le hash du compte **sans** que l'attaquant prouve son identité → hash crackable (Hashcat 18200).

## Escalade par ACL

Les droits mal configurés sur les objets sont des autoroutes :
- **GenericAll / GenericWrite** sur un groupe → s'ajouter comme membre.
- **WriteDacl** → se donner GenericAll.
- **DCSync** (droits *Replicating Directory Changes*) → répliquer les hash de tout le domaine (dont krbtgt).

**BloodHound** modélise tout ça en **graphe** : sommets = principals, arêtes = droits. Trouver la voie royale, c'est chercher le plus court chemin vers *Domain Admins*.`,
  badge: {
    id: "badge-domain-admin",
    name: "Domain Admin",
    icon: "Network",
    description: "A tracé un chemin d'escalade complet dans un annuaire simulé.",
  },
  challenges: [
    {
      id: "ad-find-spn",
      title: "Le compte qui parle trop",
      order: 1,
      difficulty: "easy",
      type: "text",
      points: 130,
      timeLimitSec: 240,
      prompt:
        "Extrait de l'énumération (JSON) :\n\n    [\n      { \"sam\": \"jdoe\",      \"spn\": null,                     \"memberOf\": [\"Users\"] },\n      { \"sam\": \"svc_sql\",   \"spn\": \"MSSQLSvc/db01.corp:1433\", \"memberOf\": [\"Service Accounts\"] },\n      { \"sam\": \"admin_bob\", \"spn\": null,                     \"memberOf\": [\"Domain Admins\"] }\n    ]\n\n**Quel `sam` est Kerberoastable ?** (réponds par le nom exact du compte)",
      hints: [{ text: "Cherche le compte qui possède un SPN non nul.", cost: 20 }],
      answer: "svc_sql",
      accept: ["svc_sql"],
      explanation:
        "Seul svc_sql expose un servicePrincipalName. C'est la porte d'entrée du Kerberoasting : on demande son TGS et on casse le hash hors ligne.",
      tags: ["enumeration", "spn", "kerberoasting"],
    },
    {
      id: "ad-asrep-flag",
      title: "Pré-auth désactivée",
      order: 2,
      difficulty: "medium",
      type: "text",
      points: 190,
      timeLimitSec: 200,
      prompt:
        "L'**AS-REP Roasting** cible les comptes dont la pré-authentification Kerberos est désactivée.\n\n**Quel drapeau `userAccountControl` faut-il chercher ?** (le nom du flag)",
      hints: [
        { text: "Il commence par DONT_REQ...", cost: 25 },
        { text: "DONT_REQ_PREAUTH (aussi écrit DONT_REQUIRE_PREAUTH).", cost: 40 },
      ],
      answer: "DONT_REQ_PREAUTH",
      accept: [
        "DONT_REQUIRE_PREAUTH",
        "DONT_REQ_PREAUTH",
        "do not require pre-authentication",
        "DoesNotRequirePreAuth",
      ],
      explanation:
        "Le flag DONT_REQ_PREAUTH (UAC 0x400000) supprime la pré-auth : l'AS renvoie un AS-REP chiffré avec le hash du compte, crackable hors ligne (Hashcat 18200).",
      tags: ["as-rep", "uac"],
    },
    {
      id: "ad-kerberoast-target",
      title: "Cible du roasting",
      order: 3,
      difficulty: "medium",
      type: "mcq",
      points: 200,
      timeLimitSec: 180,
      prompt:
        "Le hash récupéré lors d'un Kerberoasting correspond au mot de passe de **quel compte** ?",
      options: [
        "Le compte de service associé au SPN demandé",
        "Le compte krbtgt du domaine",
        "Le compte de l'utilisateur qui lance l'attaque",
        "Le compte machine du contrôleur de domaine",
      ],
      answer: 0,
      hints: [{ text: "Le TGS est chiffré avec la clé du compte qui héberge le service.", cost: 25 }],
      explanation:
        "Le TGS d'un SPN est chiffré avec le hash NTLM du compte de service. C'est donc CE mot de passe qu'on casse — d'où l'importance de secrets longs et de gMSA.",
      tags: ["kerberoasting", "tgs"],
    },
    {
      id: "ad-acl-genericall",
      title: "La porte de service",
      order: 4,
      difficulty: "hard",
      type: "mcq",
      points: 340,
      timeLimitSec: 260,
      prompt:
        "BloodHound révèle une arête : ton utilisateur contrôlé possède **GenericAll** sur le groupe **Domain Admins**.\n\nQuelle action directe cela permet-il ?",
      options: [
        "T'ajouter toi-même comme membre de Domain Admins",
        "Lire les mots de passe en clair des membres",
        "Désactiver le contrôleur de domaine",
        "Rien : GenericAll ne s'applique qu'aux fichiers",
      ],
      answer: 0,
      hints: [{ text: "GenericAll = contrôle total sur l'objet, y compris sa liste de membres.", cost: 45 }],
      explanation:
        "GenericAll sur un groupe = contrôle total, donc modification de l'appartenance : on s'ajoute à Domain Admins. C'est un chemin d'escalade classique repéré par BloodHound.",
      tags: ["acl", "genericall", "bloodhound"],
    },
  ],
};
