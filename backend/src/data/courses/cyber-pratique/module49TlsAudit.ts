import type { CourseSeed } from "../../../types";

/** Cyber · Pratique — Module 49 (Défense) : audit d'un certificat TLS suspect. Réutilise l'inspection SAN du Module 16. */
export const module49TlsAudit: CourseSeed[] = [
  {
    slug: "prat-defense-tls-audit",
    title: "Audit TLS — démasquer un certificat usurpateur",
    checkpoint: "defense",
    codename: "Silent Impersonator",
    domain: "Défense — Audit de configuration",
    theme: "grid",
    icon: "FileKey",
    accent: "#C4914F",
    order: 49,
    difficulty: "medium",
    summary:
      "Un service local prétend être le portail sécurisé d'une banque. Avant de faire confiance à un certificat, il faut savoir le lire. À toi d'inspecter ses métadonnées avec openssl : auto-signature (Issuer == Subject), nom de domaine usurpant une marque, et un second domaine suspect caché dans la liste SAN.",
    objectives: [
      "Inspecter un certificat X.509 en détail (openssl x509 -text)",
      "Établir une connexion TLS de test (openssl s_client)",
      "Comparer Issuer et Subject pour détecter une auto-signature",
      "Repérer un nom de domaine usurpant une marque (CN)",
      "Lire la liste SAN et y débusquer un second domaine malveillant",
    ],
    sandbox: {
      attackerImage: "cyberace/module49-tls-audit-lab:latest",
      ttlSec: 900,
      attackerCapAdd: [],
      ports: [{ containerPort: 7681, label: "Terminal web (ttyd)" }],
    },
    lesson: `# 🔐 Auditer un certificat — Silent Impersonator

Au Module 16, tu lisais les **SAN** d'un certificat pour trouver un sous-domaine caché. Ici, même outil, but différent : **évaluer la légitimité** du certificat lui-même. 🎭

---

## 🧭 Le briefing

> *"Un service local prétend être le portail sécurisé d'une banque. Avant de faire confiance à un certificat, il faut savoir le lire."*

Un serveur TLS tourne sur **\`127.0.0.1:8443\`**. Terminal **en root**.

> 🧠 Note : on n'audite PAS ici un protocole/chiffrement faible (OpenSSL 3.x les bloque par défaut). On se concentre sur les **métadonnées** du certificat — entièrement fiable.

---

## 1. Se connecter au service 🔌

\`\`\`bash
openssl s_client -connect 127.0.0.1:8443
\`\`\`

\`s_client\` ouvre une connexion TLS de test et affiche le certificat présenté par le serveur.

---

## 2. Inspecter le certificat en détail 🔎

\`\`\`bash
openssl s_client -connect 127.0.0.1:8443 </dev/null 2>/dev/null | openssl x509 -noout -text
# ou sur le fichier directement :
openssl x509 -in /etc/tlsaudit/cert.pem -noout -text
\`\`\`

\`x509 -noout -text\` déplie tout le certificat : **Issuer**, **Subject**, **Validity**, et l'extension **Subject Alternative Name (SAN)**.

---

## 3. Trois signaux d'alerte 🚩

1. **Issuer == Subject** → le certificat est **auto-signé** : aucune autorité de certification (CA) reconnue ne l'a validé. Un vrai certificat bancaire est signé par une CA de confiance.
2. **Le CN** : \`secure-login.mabanque-exemple.dz\` → un nom qui **usurpe** une marque bancaire pour paraître légitime.
3. **La liste SAN** contient un **second domaine** au nom explicite : \`payload-drop.cyberace-attaquant.lab\` — la vraie nature du service transparaît.

---

## 4. Pourquoi c'est dangereux 🧠

Un certificat auto-signé usurpant une marque connue est piégeux : le nom paraît **légitime au premier coup d'œil**. Seul l'examen du champ **Issuer** (absence de CA de confiance) révèle la supercherie. Un utilisateur non averti qui clique « accepter le risque » se fait piéger.

## 🧠 À retenir

- Inspecter un certificat : \`openssl x509 -noout -text\`. Se connecter : \`openssl s_client -connect hote:port\`.
- **Auto-signé** = **Issuer == Subject** (pas de CA de confiance).
- **Usurpation de marque** dans le **CN** : nom de domaine imitant une entité connue.
- Toujours lire la **liste SAN** : elle peut cacher un second domaine révélateur.
- Le danger : le nom paraît légitime ; c'est le champ **Issuer** qui trahit l'absence de CA.`,
    badge: {
      id: "badge-prat-tlsaudit",
      name: "Détecteur d'Usurpation",
      icon: "FileKey",
      description: "A démasqué un certificat qui se faisait passer pour ce qu'il n'était pas.",
    },
    challenges: [
      {
        id: "prat-tlsaudit-t1",
        title: "Inspecter en détail",
        order: 1,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔎 Déplier un certificat

**Question :** quelle sous-commande openssl affiche le contenu détaillé d'un certificat X.509 ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "x509 -noout -text",
        accept: ["openssl x509 -noout -text"],
        caseSensitive: false,
        explanation: `**\`openssl x509 -noout -text\`** déplie tout le certificat : Issuer, Subject, période de validité, extensions (dont SAN). \`-noout\` évite de réafficher le certificat encodé, \`-text\` le rend lisible.`,
        tags: ["defense", "tls", "openssl"],
      },
      {
        id: "prat-tlsaudit-t2",
        title: "Se connecter au service",
        order: 2,
        difficulty: "easy",
        type: "text",
        prompt: `## 🔌 Connexion TLS de test

**Question :** quelle commande openssl établit une connexion TLS de test vers 127.0.0.1:8443 ?`,
        points: 100,
        timeLimitSec: 300,
        hints: [],
        answer: "openssl s_client -connect 127.0.0.1:8443",
        caseSensitive: true,
        explanation: `\`openssl s_client -connect 127.0.0.1:8443\` ouvre une connexion TLS vers le service et affiche le certificat présenté — le point de départ pour récupérer puis inspecter le certificat.`,
        tags: ["defense", "tls", "s_client"],
      },
      {
        id: "prat-tlsaudit-t3",
        title: "Issuer vs Subject",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🪞 Qui a signé ?

**Question :** en comparant les champs Issuer et Subject du certificat, que remarques-tu ?`,
        points: 150,
        timeLimitSec: 350,
        hints: [],
        options: [
          "Ils sont identiques : le certificat est auto-signé, sans autorité de certification reconnue",
          "Ils sont totalement différents, ce qui est normal",
          "Le champ Issuer est vide",
          "Le certificat n'a pas de champ Subject",
        ],
        answer: 0,
        explanation: `**Issuer == Subject** : le certificat s'est **signé lui-même**, sans passer par une autorité de certification (CA) de confiance. Un vrai certificat de production a un Issuer distinct (Let's Encrypt, DigiCert…). L'auto-signature est le premier signal d'alerte.`,
        tags: ["defense", "tls", "auto-signe"],
      },
      {
        id: "prat-tlsaudit-t4",
        title: "Le nom usurpé",
        order: 4,
        difficulty: "medium",
        type: "text",
        prompt: `## 🎭 L'imitation de marque

**Question :** quel nom de domaine, présent dans le Common Name (CN), tente clairement d'usurper une marque bancaire ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [],
        answer: "secure-login.mabanque-exemple.dz",
        accept: ["mabanque-exemple.dz"],
        caseSensitive: false,
        explanation: `Le CN **\`secure-login.mabanque-exemple.dz\`** imite un portail bancaire (« secure-login », « mabanque ») pour rassurer la victime. Un nom rassurant ne prouve rien : seule la chaîne de confiance (Issuer/CA) compte.`,
        tags: ["defense", "tls", "usurpation"],
      },
      {
        id: "prat-tlsaudit-t5",
        title: "Le second domaine suspect",
        order: 5,
        difficulty: "medium",
        type: "text",
        prompt: `## 🕵️ Fouiller la liste SAN

**Question :** dans la liste SAN, quel second domaine, au nom évocateur, éveille aussi les soupçons ?`,
        points: 200,
        timeLimitSec: 400,
        hints: [
          { text: "Même technique de lecture SAN qu'au Module 16 : cherche l'extension 'Subject Alternative Name' dans la sortie de x509 -text.", cost: 20 },
        ],
        answer: "payload-drop.cyberace-attaquant.lab",
        accept: ["cyberace-attaquant.lab"],
        caseSensitive: false,
        explanation: `La SAN liste **\`payload-drop.cyberace-attaquant.lab\`** en plus du nom bancaire — un domaine dont le nom (« payload-drop », « attaquant ») trahit la vraie fonction. La SAN révèle souvent ce que le CN essaie de cacher.`,
        tags: ["defense", "tls", "san"],
      },
      {
        id: "prat-tlsaudit-t6",
        title: "Pourquoi c'est dangereux",
        order: 6,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚠️ Le piège pour l'utilisateur

**Question :** pourquoi un certificat auto-signé usurpant une marque connue est-il particulièrement dangereux pour un utilisateur non averti ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [],
        options: [
          "Le nom paraît légitime au premier coup d'œil, et seul l'examen du champ Issuer révèle l'absence d'autorité de certification de confiance",
          "Les certificats auto-signés sont toujours automatiquement bloqués par tous les navigateurs",
          "Cela n'a aucun impact pratique",
          "Un certificat auto-signé est toujours plus sécurisé qu'un certificat signé",
        ],
        answer: 0,
        explanation: `Le nom (\`secure-login.mabanque…\`) inspire confiance. Un utilisateur pressé ne vérifie pas l'**Issuer** et « accepte le risque ». Or c'est justement l'absence de CA de confiance (auto-signature) qui révèle la fraude. Le danger est dans cette apparence trompeuse.`,
        tags: ["defense", "tls", "danger"],
      },
      {
        id: "prat-tlsaudit-t7",
        title: "Confirmer l'audit (flag)",
        order: 7,
        difficulty: "hard",
        type: "text",
        prompt: `## 🚩 Le rapport d'audit

\`\`\`bash
cat /root/audit_report.txt
\`\`\`

**Question :** quel flag \`CYBERACE{...}\` figure dans le rapport ?`,
        points: 300,
        timeLimitSec: 500,
        hints: [],
        answer: "CYBERACE{certificat_autosigne_usurpation_de_marque}",
        caseSensitive: true,
        explanation: `\`cat /root/audit_report.txt\` → **CYBERACE{certificat_autosigne_usurpation_de_marque}**. Le flag résume le verdict : certificat auto-signé + usurpation de marque = à rejeter absolument.`,
        tags: ["defense", "flag", "audit"],
      },
      {
        id: "prat-tlsaudit-t8",
        title: "Synthèse",
        order: 8,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 🎓 Différence avec le Module 16

**Question :** en quoi ce module diffère-t-il du Module 16, qui utilisait aussi l'inspection SAN ?`,
        points: 50,
        timeLimitSec: 200,
        hints: [],
        options: [
          "Le Module 16 cherchait à découvrir un sous-domaine caché ; celui-ci cherche à évaluer la légitimité même du certificat",
          "Ce module n'utilise pas openssl, contrairement au Module 16",
          "Ce module nécessite une élévation de privilèges",
          "Il n'y a aucune différence",
        ],
        answer: 0,
        explanation: `Même outil (\`openssl\`, lecture SAN), **finalité opposée** : le Module 16 exploitait la SAN pour **découvrir** un sous-domaine (offensif) ; ici on l'utilise pour **auditer** et rejeter un certificat frauduleux (défensif). Le même savoir sert dans les deux postures.`,
        tags: ["defense", "tls", "synthese"],
      },
    ],
  },
];
