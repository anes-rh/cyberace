import type { CourseSeed } from "../../types";

export const crypto: CourseSeed = {
  slug: "crypto-secret-sharing",
  title: "Cryptographie & partage de secrets",
  codename: "Crypto Circuit",
  domain: "Cryptographie",
  theme: "circuit",
  icon: "KeyRound",
  accent: "#22d3ee",
  order: 1,
  difficulty: "medium",
  summary:
    "Fractionne des secrets à la Shamir, prouve ton identité sans révéler ta clé, et démonte le ballet de tickets de Kerberos.",
  objectives: [
    "Comprendre le partage de secret à seuil (Shamir, Mignotte)",
    "Distinguer confidentialité et calcul multipartite (SMPC)",
    "Expliquer une preuve à divulgation nulle (Fiat-Shamir)",
    "Suivre le flux d'authentification Kerberos (AS, TGS, service)",
  ],
  lesson: `## Partager un secret sans le donner

Le **partage de secret à seuil (k, n)** découpe un secret S en n parts telles que *k* parts suffisent à le reconstruire, mais *k-1* parts n'apprennent **rien**.

**Schéma de Shamir.** On choisit un polynôme de degré k-1 dont le terme constant est le secret : f(x) = S + a1·x + … + a(k-1)·x^(k-1) (mod p). Chaque participant reçoit un point (i, f(i)). Avec k points on reconstruit f par **interpolation de Lagrange**, donc f(0) = S. Avec seulement k-1 points, toutes les valeurs de S restent équiprobables : sécurité **parfaite**.

**Schéma de Mignotte.** Utilise le théorème des restes chinois : une suite de modules co-premiers croissants sert de parts. Le secret vit dans une fenêtre, et il faut k modules dont le produit dépasse S pour le retrouver.

## Calculer sans révéler

Le **calcul multipartite sécurisé (SMPC)** permet à plusieurs acteurs de calculer f(x1,…,xn) sans révéler leurs entrées. Le partage de Shamir en est une brique (BGW), car l'addition et la multiplication de parts se combinent.

## Prouver sans montrer

Une **preuve à divulgation nulle de connaissance (ZKP)** convainc un vérifieur qu'on connaît un secret sans le divulguer. **Fiat-Shamir** transforme un protocole interactif (engagement → défi → réponse) en preuve non interactive en dérivant le défi d'un hachage de l'engagement.

## Kerberos en trois temps

1. **AS-REQ/REP** : le client obtient de l'*Authentication Server* un **TGT** chiffré avec la clé du **KDC**.
2. **TGS-REQ/REP** : il présente le TGT au *Ticket Granting Server* pour un **ticket de service**.
3. **AP-REQ** : il présente ce ticket au service visé. Le mot de passe ne circule jamais en clair — d'où l'intérêt de l'attaque *Kerberoasting* (voir la course Domain Rush).`,
  badge: {
    id: "badge-keymaster",
    name: "Keymaster",
    icon: "KeyRound",
    description: "A maîtrisé le partage de secret et l'authentification cryptographique.",
  },
  challenges: [
    {
      id: "crypto-shamir-threshold",
      title: "Le bon seuil",
      order: 1,
      difficulty: "easy",
      type: "numeric",
      points: 100,
      timeLimitSec: 120,
      prompt:
        "Une clé maîtresse est partagée avec un schéma de Shamir **(k, n) = (3, 7)**.\n\nCombien de parts, au minimum, faut-il réunir pour reconstruire le secret ?",
      hints: [{ text: "Le seuil de reconstruction est exactement k.", cost: 15 }],
      answer: 3,
      explanation:
        "Le seuil k = 3 : trois points suffisent à interpoler un polynôme de degré k-1 = 2. Deux parts n'apportent aucune information sur le secret.",
      tags: ["shamir", "seuil"],
    },
    {
      id: "crypto-rot13-flag",
      title: "Rotor bloqué",
      order: 2,
      difficulty: "easy",
      type: "text",
      points: 120,
      timeLimitSec: 180,
      widget: "cipher-lab",
      prompt:
        "Un analyste a « chiffré » un drapeau avec un simple décalage de César. Intercepté :\n\n**plorenpr{ebgnge}**\n\nUtilise l'outil de décalage pour retrouver le drapeau en clair (format cyberace{...}).",
      hints: [
        { text: "Chaque lettre est décalée de la même quantité. Essaie un décalage de 13 (ROT13).", cost: 20 },
      ],
      answer: "cyberace{rotate}",
      accept: ["CYBERACE{ROTATE}"],
      explanation:
        "Le texte était en ROT13 : appliquer un décalage de 13 le ré-inverse. César n'offre aucune sécurité — l'espace des clés (25) se force à la main.",
      tags: ["cesar", "rot13", "classique"],
    },
    {
      id: "crypto-shamir-reconstruct",
      title: "Recolle le secret",
      order: 3,
      difficulty: "medium",
      type: "numeric",
      points: 220,
      timeLimitSec: 300,
      widget: "shamir",
      prompt:
        "Partage de Shamir avec **seuil k = 2** sur le corps **GF(97)**. Tu récupères deux parts :\n\n- Part A : (x = 1, y = 47)\n- Part B : (x = 2, y = 52)\n\nReconstruis le secret **S = f(0)** (un entier entre 0 et 96). L'outil d'interpolation peut t'aider.",
      hints: [
        { text: "Avec 2 points, f est une droite. Calcule la pente puis l'ordonnée à l'origine modulo 97.", cost: 30 },
        { text: "Pente = (52 - 47)/(2 - 1) = 5. Donc f(0) = 47 - 5·1.", cost: 40 },
      ],
      answer: 42,
      explanation:
        "Deux points définissent une droite : pente = 5, donc f(x) = 5x + 42 et f(0) = 42. C'est l'interpolation de Lagrange dans le cas k = 2.",
      tags: ["shamir", "lagrange", "gf"],
    },
    {
      id: "crypto-kerberos-ticket",
      title: "Le bon guichet",
      order: 4,
      difficulty: "medium",
      type: "mcq",
      points: 200,
      timeLimitSec: 150,
      prompt:
        "Dans Kerberos, une fois authentifié auprès de l'AS, **quel élément le client présente-t-il au TGS** pour obtenir un ticket de service ?",
      options: [
        "Le TGT (Ticket Granting Ticket)",
        "Directement le mot de passe de l'utilisateur",
        "Le ticket de service déjà déchiffré",
        "La clé privée du contrôleur de domaine",
      ],
      answer: 0,
      hints: [{ text: "C'est le ticket obtenu à l'étape AS-REP.", cost: 20 }],
      explanation:
        "Le client présente son TGT au Ticket Granting Server. Le mot de passe ne circule jamais ; c'est tout l'intérêt du protocole (et la surface d'attaque du Kerberoasting).",
      tags: ["kerberos", "authentification"],
    },
  ],
};
