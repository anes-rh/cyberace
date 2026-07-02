import type { CourseSeed } from "../../types";

export const socialEngineering: CourseSeed = {
  slug: "social-engineering",
  title: "Ingénierie sociale (éthique)",
  codename: "Mind Games",
  domain: "Ingénierie sociale",
  theme: "mind",
  icon: "Brain",
  accent: "#fb7185",
  order: 13,
  difficulty: "easy",
  summary:
    "Module bonus. Le maillon humain, décrypté de façon éthique : reconnais les leviers psychologiques et apprends à défendre, pas à nuire.",
  objectives: [
    "Reconnaître les vecteurs (phishing, vishing, pretexting, tailgating)",
    "Nommer les leviers psychologiques exploités (Cialdini)",
    "Adopter le bon réflexe face à une tentative",
    "Cadrer un engagement d'ingénierie sociale de façon éthique",
  ],
  lesson: `## Le maillon humain

La technique la plus fiable de l'attaquant vise souvent… les gens. **But de ce module : comprendre pour défendre.** Aucune manipulation réelle n'est encouragée.

## Vecteurs courants

- **Phishing** : e-mail de masse piégé ; **spear-phishing** ciblé ; **whaling** vers les dirigeants.
- **Vishing** (téléphone) et **smishing** (SMS).
- **Pretexting** : un scénario crédible (faux support IT, faux fournisseur).
- **Tailgating / piggybacking** : suivre quelqu'un pour franchir un accès physique.
- **Baiting** : une clé USB « oubliée » qui attend d'être branchée.

## Les leviers psychologiques (Cialdini)

- **Autorité** : « C'est le PDG qui demande. »
- **Urgence / rareté** : « Il faut agir dans 10 minutes. »
- **Preuve sociale** : « Tout le monde l'a déjà fait. »
- **Réciprocité, sympathie, engagement**.

La fraude au président combine **autorité + urgence** pour court-circuiter la vérification.

## Les bons réflexes

Ralentir, **vérifier par un canal indépendant**, ne jamais cliquer sous pression, **signaler** au SOC. La culture du signalement sans blâme est la meilleure défense.

## Éthique d'un engagement

Un test d'ingénierie sociale **autorisé** exige : **périmètre écrit et consentement** du commanditaire, **aucun préjudice réel** (pas de vraie extorsion, pas d'humiliation), **collecte minimale**, et **débriefing pédagogique**. Sans mandat, c'est une infraction.`,
  badge: {
    id: "badge-empath",
    name: "Empath",
    icon: "Brain",
    description: "Comprend les leviers humains pour mieux défendre — éthiquement.",
  },
  challenges: [
    {
      id: "se-phish-indicator",
      title: "Repérer l'hameçon",
      order: 1,
      difficulty: "easy",
      type: "mcq",
      points: 100,
      timeLimitSec: 150,
      prompt:
        "Quel ensemble de signaux trahit le mieux un e-mail de **phishing** ?",
      options: [
        "Urgence anormale + lien vers un domaine qui imite l'officiel + demande d'identifiants",
        "Une signature électronique et un logo",
        "Un objet en français correct",
        "Un envoi pendant les heures de bureau",
      ],
      answer: 0,
      hints: [{ text: "Cherche la pression temporelle et l'URL trompeuse.", cost: 15 }],
      explanation:
        "Urgence, domaine sosie et demande de secrets forment le trio classique. Logo, signature et bon français ne prouvent rien (facilement imités).",
      tags: ["phishing", "indicateurs"],
    },
    {
      id: "se-cialdini",
      title: "Fraude au président",
      order: 2,
      difficulty: "medium",
      type: "multi",
      points: 190,
      timeLimitSec: 180,
      prompt:
        "Un message : « Ici le PDG. Virement urgent de 50 000 € à faire **dans l'heure**, confidentiel. »\n\nQuels **leviers psychologiques** sont exploités ? (plusieurs réponses)",
      options: ["Autorité", "Urgence", "Preuve sociale", "Réciprocité"],
      answer: [0, 1],
      hints: [{ text: "« PDG » + « dans l'heure » = deux leviers distincts.", cost: 30 }],
      explanation:
        "L'autorité (le PDG) et l'urgence (dans l'heure) court-circuitent la vérification. La preuve sociale et la réciprocité ne sont pas mobilisées ici.",
      tags: ["cialdini", "bec"],
    },
    {
      id: "se-response",
      title: "Le bon réflexe",
      order: 3,
      difficulty: "medium",
      type: "mcq",
      points: 190,
      timeLimitSec: 150,
      prompt:
        "Tu reçois un e-mail suspect te demandant de « confirmer ton mot de passe ». Que fais-tu ?",
      options: [
        "Ne pas cliquer, vérifier par un canal indépendant et signaler au SOC",
        "Cliquer pour vérifier si le site est légitime",
        "Répondre en demandant qui écrit",
        "Transférer à tous les collègues pour avis",
      ],
      answer: 0,
      hints: [{ text: "On ne clique jamais sous pression ; on signale.", cost: 25 }],
      explanation:
        "Ne pas interagir, vérifier via un canal de confiance (appeler le service), et signaler. Cliquer ou répondre confirme que l'adresse est active.",
      tags: ["reponse", "signalement"],
    },
    {
      id: "se-ethics",
      title: "Cadre d'un test autorisé",
      order: 4,
      difficulty: "hard",
      type: "multi",
      points: 300,
      timeLimitSec: 220,
      prompt:
        "Un test d'ingénierie sociale **éthique et autorisé** doit respecter… (sélectionne tout ce qui s'applique)",
      options: [
        "Un périmètre écrit et le consentement du commanditaire",
        "L'absence de préjudice réel pour les personnes",
        "Un débriefing pédagogique après coup",
        "La publication des noms des employés piégés",
      ],
      answer: [0, 1, 2],
      hints: [{ text: "Une proposition humilie les personnes — donc à proscrire.", cost: 40 }],
      explanation:
        "Mandat écrit, non-nuisance et débriefing sont indispensables. Exposer nominativement les employés piégés est contraire à l'éthique (culture sans blâme).",
      tags: ["ethique", "engagement"],
    },
  ],
};
