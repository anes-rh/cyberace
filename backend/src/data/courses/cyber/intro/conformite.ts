import type { CourseSeed } from "../../../../types";

/** Cyber · Intro — Module 5 : lois, normes et conformité. */
export const conformite: CourseSeed[] = [
  {
    slug: "cyi-conformite",
    title: "Lois, normes & conformité",
    checkpoint: "cyber-intro",
    codename: "Rule Book",
    domain: "Cybersécurité — Cadre légal",
    theme: "grid",
    icon: "KeyRound",
    accent: "#9B8CCB",
    order: 5,
    difficulty: "medium",
    summary:
      "Le cadre légal et normatif de la sécurité : PCI DSS (cartes bancaires), ISO/IEC 27001 (SMSI), HIPAA (santé US), SOX (finance), DMCA & FISMA, RGPD/GDPR et DPA 2018 (données personnelles), et un panorama des lois cyber par pays.",
    objectives: [
      "Distinguer une loi, une norme et un référentiel de conformité",
      "Associer chaque cadre à son domaine (paiement, santé, finance, données personnelles)",
      "Comprendre PCI DSS, ISO/IEC 27001, HIPAA, SOX, DMCA, FISMA",
      "Maîtriser les grands principes du RGPD/GDPR et du DPA 2018",
      "Situer les enjeux juridiques du hacking (autorisation, territorialité)",
    ],
    resources: [
      {
        label: "RGPD — texte et explications (gdpr.eu)",
        url: "https://gdpr.eu/",
        kind: "link",
        note: "Le RGPD expliqué article par article, avec check-lists de conformité.",
      },
      {
        label: "PCI Security Standards Council (officiel)",
        url: "https://www.pcisecuritystandards.org/",
        kind: "link",
        note: "L'organisme officiel du standard PCI DSS (sécurité des données de cartes de paiement).",
      },
      {
        label: "ISO/IEC 27001 — page officielle ISO",
        url: "https://www.iso.org/standard/27001",
        kind: "link",
        note: "La norme internationale du système de management de la sécurité de l'information (SMSI).",
      },
    ],
    lesson: `# 📜 Lois, normes & conformité — Rule Book

La cybersécurité n'est pas qu'une affaire de technique : c'est aussi un **cadre légal**. Ignorer la conformité, c'est risquer des **amendes énormes** et des poursuites. Tour d'horizon des cadres à connaître. 🏎️

---

## 1. Loi vs norme vs conformité ⚖️

- **Loi / réglementation** : imposée par un **État**, **obligatoire**, avec des **sanctions** (amendes, prison). Ex. RGPD, HIPAA, SOX.
- **Norme / standard** : un **référentiel de bonnes pratiques**, souvent élaboré par un organisme (ISO, NIST). Son adoption peut être **volontaire** ou **exigée par contrat**. Ex. ISO/IEC 27001, PCI DSS.
- **Conformité** (*compliance*) : le fait de **respecter** les lois et normes applicables, prouvé par des **audits**.

> 🧭 Une norme peut devenir de facto obligatoire : **PCI DSS** n'est pas une loi, mais **aucune banque** ne te laissera traiter des cartes sans la respecter.

---

## 2. Les grands cadres à connaître 🗂️

| Cadre | Domaine | En bref |
|---|---|---|
| **PCI DSS** | Cartes de paiement | *Payment Card Industry Data Security Standard* : sécuriser le stockage/traitement des données de **cartes bancaires**. |
| **ISO/IEC 27001** | Management de la sécurité | Norme internationale d'un **SMSI** (Système de Management de la Sécurité de l'Information) : approche par le **risque**, certifiable. |
| **HIPAA** | Santé (USA) | *Health Insurance Portability and Accountability Act* : protège les **données de santé** des patients. |
| **SOX** | Finance (USA) | *Sarbanes-Oxley Act* : fiabilité des **rapports financiers** des entreprises cotées (contrôles internes). |
| **DMCA** | Droit d'auteur (USA) | *Digital Millennium Copyright Act* : protège le **droit d'auteur** numérique. |
| **FISMA** | Secteur public (USA) | *Federal Information Security Management Act* : sécurité des **systèmes des agences fédérales** US. |
| **RGPD / GDPR** | Données personnelles (UE) | *General Data Protection Regulation* : protection des **données personnelles** des résidents de l'UE. |
| **DPA 2018** | Données personnelles (UK) | *Data Protection Act 2018* : la déclinaison **britannique** du RGPD. |

**Détails utiles :**
- **PCI DSS** repose sur des exigences concrètes (réseau sécurisé, chiffrement des données de carte, contrôle d'accès, tests réguliers, politique de sécurité). Obligatoire pour tout commerçant traitant des cartes.
- **ISO/IEC 27001** est la référence internationale : elle définit comment **mettre en place, exploiter et améliorer** un SMSI basé sur l'**analyse de risque**. La famille **ISO/IEC 2700x** l'accompagne (ex. 27002 pour les mesures).
- **HIPAA** impose confidentialité et sécurité des **dossiers médicaux** (aux USA) ; violation = lourdes amendes.
- **SOX** vise la **transparence financière** après des scandales comptables : elle impose des **contrôles internes** (dont sur les SI qui produisent les chiffres).

---

## 3. Le RGPD / GDPR en profondeur 🇪🇺

Le **RGPD** (Règlement Général sur la Protection des Données) est **le** texte de référence pour les **données personnelles** dans l'UE. Principes clés :

- **Champ d'application large** : s'applique à toute organisation qui traite les données de **résidents de l'UE**, **même située hors UE** (extraterritorialité).
- **Consentement** : traitement licite (souvent basé sur un **consentement libre, éclairé, révocable**).
- **Droits des personnes** : **accès**, **rectification**, **effacement** (« droit à l'oubli »), **portabilité**, **opposition**.
- **Minimisation** : ne collecter que le **strict nécessaire**, pour une **finalité** définie.
- **Sécurité** : mesures techniques/organisationnelles adaptées (dont le **chiffrement**, la **pseudonymisation**).
- **Notification de violation** : signaler une fuite de données à l'autorité **sous 72 heures**.
- **Sanctions** : jusqu'à **4 % du chiffre d'affaires mondial** annuel (ou 20 M€) — parmi les plus dissuasives au monde.
- **DPO** : un **délégué à la protection des données** peut être requis.

Le **DPA 2018** (UK) reprend l'essentiel du RGPD au niveau britannique.

**Les acteurs du RGPD (qui fait quoi) :**
- **Personne concernée** (*data subject*) : l'individu dont on traite les données.
- **Responsable de traitement** (*data controller*) : celui qui **décide** des finalités et moyens — c'est lui le premier responsable.
- **Sous-traitant** (*data processor*) : celui qui traite les données **pour le compte** du responsable (ex. un hébergeur cloud).
- **Autorité de contrôle** : le régulateur qui veille et sanctionne (en France, la **CNIL**).

**Catégories particulières** (données « sensibles ») : origine, opinions politiques/religieuses, santé, orientation sexuelle, données biométriques/génétiques… Leur traitement est **interdit par principe**, sauf exceptions strictes — protection renforcée.

**Privacy by design & by default** : la protection des données doit être pensée **dès la conception** (*by design*) et le réglage **le plus protecteur** doit être **actif par défaut** (*by default*) — pas une option à activer.

> 🧭 Ne confonds pas **PII** (*Personally Identifiable Information* — toute donnée identifiant une personne) et **PHI** (*Protected Health Information* — données de santé, cœur d'HIPAA).

---

## 4. Panorama des lois cyber par pays 🌍

Au-delà des grands cadres, **chaque pays** dispose de lois réprimant la **cybercriminalité** : accès non autorisé à un système, atteinte à l'intégrité de données, interception illégale, etc. Les intitulés varient (lois sur la **fraude informatique**, l'**usage abusif des ordinateurs**, la **cybercriminalité**…), mais les **principes se recoupent** :

- **L'accès non autorisé** à un système informatique est un **délit** (même « pour voir », sans dégât).
- **Modifier/détruire** des données sans droit est réprimé.
- La **territorialité** est complexe : une attaque peut relever de **plusieurs juridictions** (pays de l'attaquant, de la victime, des serveurs). La **coopération internationale** (ex. conventions) tente d'y répondre.

> ⚠️ **Conséquence directe pour le hacking éthique** : sans **autorisation écrite** du propriétaire, tester un système — même sans nuire — constitue un **accès non autorisé**, donc un **délit**. Le « scope » et le contrat ne sont pas une formalité : ils sont ce qui rend l'activité **légale**.

### Deux directives cyber européennes récentes 🇪🇺

- **NIS2** (2023) : renforce la cybersécurité des **entités essentielles et importantes** (énergie, santé, transport, numérique…), avec obligations de gestion du risque et de **notification d'incident**.
- **DORA** (*Digital Operational Resilience Act*) : cible le **secteur financier** — résilience opérationnelle face aux incidents TIC, y compris chez les prestataires.

### Classer l'information avant de la protéger 🏷️

On ne protège pas tout de la même façon. On **classe** les données par sensibilité, typiquement : **Public → Interne → Confidentiel → Restreint/Secret**. La classification détermine les contrôles (chiffrement, accès, durée de conservation) : c'est un préalable concret à toute politique de sécurité et de conformité.

---

## 🧠 À retenir

- **Loi** (obligatoire, État, sanctions) vs **norme** (référentiel de bonnes pratiques) vs **conformité** (respect prouvé par audit). Une norme peut être **de facto obligatoire** (PCI DSS).
- **PCI DSS** = cartes bancaires · **ISO/IEC 27001** = SMSI (risque, certifiable) · **HIPAA** = santé US · **SOX** = rapports financiers US · **DMCA** = droit d'auteur US · **FISMA** = agences fédérales US.
- **RGPD/GDPR** (UE) : extraterritorial, **consentement**, **droits** (accès/rectification/effacement/portabilité), **minimisation**, notification de violation **sous 72 h**, sanctions jusqu'à **4 % du CA mondial**. **DPA 2018** = version UK. Acteurs : **responsable de traitement** vs **sous-traitant** ; **privacy by design/default** ; **PII** ≠ **PHI**.
- **Lois cyber par pays** : l'**accès non autorisé** et l'**altération de données** sont des délits partout ; la **territorialité** est complexe. UE récente : **NIS2** (entités essentielles), **DORA** (finance). **Classer** les données (Public→Interne→Confidentiel→Restreint) précède toute protection.
- **Pour le pentester** : sans **autorisation écrite**, tester = **accès non autorisé** = **délit**. Le contrat/scope, c'est la **légalité**.`,
    badge: {
      id: "badge-cyi-rule-book",
      name: "Rule Book",
      icon: "KeyRound",
      description: "Associe chaque loi/norme (PCI DSS, ISO 27001, HIPAA, SOX, RGPD…) à son domaine et ses enjeux.",
    },
    challenges: [
      {
        id: "cyi-conf-pcidss",
        title: "PCI DSS, c'est pour quoi ?",
        order: 1,
        difficulty: "easy",
        type: "mcq",
        prompt: `## 💳 PCI DSS

À quel domaine s'applique la norme **PCI DSS** ?`,
        points: 100,
        timeLimitSec: 240,
        hints: [
          { text: "Payment Card Industry…", cost: 10 },
          { text: "📖 Correction : la sécurité des données de cartes de paiement.", cost: 30 },
        ],
        options: [
          "La sécurité des données de cartes bancaires (paiement)",
          "Les données de santé des patients",
          "Les rapports financiers des entreprises cotées",
          "Le droit d'auteur numérique",
        ],
        answer: 0,
        explanation: `**PCI DSS** (*Payment Card Industry Data Security Standard*) encadre la sécurité des **données de cartes bancaires**. Ce n'est pas une loi, mais une norme **imposée par contrat** : sans elle, impossible de traiter des cartes. Les données de **santé** relèvent d'HIPAA, les **rapports financiers** de SOX, le **droit d'auteur** de la DMCA.`,
        tags: ["pci-dss", "paiement", "conformite"],
      },
      {
        id: "cyi-conf-match",
        title: "Chaque cadre à son domaine",
        order: 2,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🗂️ Associer

Quel cadre protège les **données de santé** des patients (aux États-Unis) ?`,
        points: 150,
        timeLimitSec: 300,
        hints: [
          { text: "Health Insurance…", cost: 15 },
          { text: "📖 Correction : HIPAA (santé US).", cost: 40 },
        ],
        options: ["HIPAA", "SOX", "PCI DSS", "DMCA"],
        answer: 0,
        explanation: `**HIPAA** (*Health Insurance Portability and Accountability Act*) protège les **données de santé** aux USA. **SOX** = rapports **financiers**, **PCI DSS** = **cartes** bancaires, **DMCA** = **droit d'auteur** numérique. Chaque cadre a son domaine — bien les associer est l'essentiel à retenir.`,
        tags: ["hipaa", "sante", "conformite"],
      },
      {
        id: "cyi-conf-iso",
        title: "ISO/IEC 27001",
        order: 3,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🧱 La norme du SMSI

Que définit la norme internationale **ISO/IEC 27001** ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "Un système de management, basé sur le risque, certifiable.", cost: 20 },
          { text: "📖 Correction : un SMSI (système de management de la sécurité de l'information), approche par le risque.", cost: 50 },
        ],
        options: [
          "Un système de management de la sécurité de l'information (SMSI), fondé sur l'analyse de risque et certifiable",
          "Un protocole de chiffrement des cartes bancaires",
          "Une loi américaine sur la santé",
          "Un antivirus open-source",
        ],
        answer: 0,
        explanation: `**ISO/IEC 27001** est la norme internationale d'un **SMSI** (*Système de Management de la Sécurité de l'Information*) : elle décrit comment **mettre en place, exploiter et améliorer** la sécurité via une **approche par le risque**, et elle est **certifiable**. La famille 2700x l'accompagne (ex. 27002 pour les mesures de sécurité).`,
        tags: ["iso-27001", "smsi", "norme"],
      },
      {
        id: "cyi-conf-rgpd",
        title: "RGPD — les 72 heures",
        order: 4,
        difficulty: "medium",
        type: "mcq",
        prompt: `## 🇪🇺 RGPD

Sous le RGPD, en cas de **violation de données personnelles**, sous quel délai faut-il notifier l'autorité de contrôle ?`,
        points: 200,
        timeLimitSec: 300,
        hints: [
          { text: "Trois jours, exprimés en heures.", cost: 20 },
          { text: "📖 Correction : 72 heures.", cost: 50 },
        ],
        options: ["72 heures", "30 jours", "1 an", "Aucun délai imposé"],
        answer: 0,
        explanation: `Le RGPD impose de notifier une **violation de données** à l'autorité **sous 72 heures** après en avoir pris connaissance. Le RGPD est aussi **extraterritorial** (s'applique dès qu'on traite des données de résidents UE), impose la **minimisation** et des **droits** (accès, effacement…), avec des sanctions jusqu'à **4 % du CA mondial**. Le **DPA 2018** en est la version britannique.`,
        tags: ["rgpd", "gdpr", "notification"],
      },
      {
        id: "cyi-conf-legal-hacking",
        title: "Tester sans autorisation ?",
        order: 5,
        difficulty: "medium",
        type: "mcq",
        prompt: `## ⚖️ Légalité

Tu testes la sécurité d'un serveur qui ne t'appartient pas, **sans autorisation**, « juste pour voir », et tu ne causes aucun dégât. Légalement, comment est-ce qualifié dans la plupart des pays ?`,
        points: 200,
        timeLimitSec: 360,
        hints: [
          { text: "L'accès lui-même, sans droit, est déjà répréhensible.", cost: 20 },
          { text: "📖 Correction : un accès non autorisé — un délit, même sans dégât.", cost: 50 },
        ],
        options: [
          "Un accès non autorisé : c'est un délit, même sans causer de dégât",
          "C'est totalement légal tant qu'on ne casse rien",
          "C'est légal si on prévient après coup",
          "Ce n'est jamais poursuivi",
        ],
        answer: 0,
        explanation: `Dans la quasi-totalité des pays, l'**accès non autorisé** à un système est un **délit** — **même sans dégât** ni intention de nuire. C'est exactement pourquoi le hacking éthique exige une **autorisation écrite** et un **scope** : ce sont eux qui rendent l'activité **légale**. Sans ça, « juste pour voir » suffit à constituer l'infraction.`,
        tags: ["legalite", "acces-non-autorise", "pentest"],
      },
    ],
  },
];
