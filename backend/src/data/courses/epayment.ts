import type { CourseSeed } from "../../types";

export const epayment: CourseSeed = {
  slug: "e-payment",
  title: "Paiement électronique",
  codename: "Secure Checkout",
  domain: "Paiement électronique",
  theme: "checkout",
  icon: "CreditCard",
  accent: "#f87171",
  order: 9,
  difficulty: "medium",
  summary:
    "De la signature duale de SET à l'authentification 3-D Secure : repère les failles dans les flux de paiement en ligne.",
  objectives: [
    "Comprendre la signature duale du protocole SET",
    "Décrire le rôle de 3-D Secure et de l'ACS",
    "Identifier des failles classiques (rejeu, montant côté client)",
    "Connaître tokenisation et principes PCI-DSS",
  ],
  lesson: `## SET : la signature duale

**SET (Secure Electronic Transaction)** visait à cloisonner l'information : le **commerçant** voit la commande mais **pas** le numéro de carte ; la **banque** voit le paiement mais **pas** le détail de la commande. L'astuce est la **signature duale** : le client hache l'*Order Information* (OI) et la *Payment Information* (PI), concatène les deux empreintes, en calcule le hash, et le **signe**. Chaque partie ne reçoit que la moitié en clair mais peut vérifier le lien avec l'autre. SET a échoué commercialement (lourdeur, certificats), mais son idée d'isolation reste fondatrice.

## 3-D Secure

3-D Secure (Verified by Visa, Mastercard SecureCode, aujourd'hui **EMV 3DS**) ajoute une **authentification du porteur par la banque émettrice**. Les « trois domaines » : émetteur, acquéreur, interopérabilité. Le composant clé est l'**ACS (Access Control Server)** de la banque, qui challenge le client (OTP, appli bancaire, biométrie). La **DSP2** en Europe rend cette **authentification forte (SCA)** obligatoire.

## Failles classiques à repérer

- **Montant fixé côté client** : ne jamais faire confiance au prix envoyé par le navigateur — revalider côté serveur.
- **Absence d'idempotence / de nonce** : permet le **rejeu** d'une transaction.
- **Confirmation avant authentification** : valider la commande *avant* la réponse de l'ACS.
- **Fuite de PAN** : stocker le numéro de carte en clair (violation PCI-DSS) au lieu de **tokeniser**.

## Bonnes pratiques

Tokenisation (remplacer le PAN par un jeton), chiffrement de bout en bout, conformité **PCI-DSS**, journalisation et détection de fraude.`,
  badge: {
    id: "badge-ledger-guardian",
    name: "Ledger Guardian",
    icon: "CreditCard",
    description: "Sait sécuriser un flux de paiement et repérer ses failles.",
  },
  challenges: [
    {
      id: "pay-3ds-role",
      title: "Qui authentifie ?",
      order: 1,
      difficulty: "easy",
      type: "mcq",
      points: 120,
      timeLimitSec: 160,
      prompt: "Quelle étape **3-D Secure** ajoute-t-il à un paiement en ligne ?",
      options: [
        "Une authentification du porteur par sa banque émettrice (ACS)",
        "Le chiffrement du disque du commerçant",
        "La suppression du numéro de carte de la base",
        "Un scan antivirus du navigateur",
      ],
      answer: 0,
      hints: [{ text: "Pense OTP / appli bancaire / biométrie côté banque.", cost: 20 }],
      explanation:
        "3-D Secure insère une authentification forte du porteur via l'ACS de la banque émettrice — obligatoire en Europe avec la DSP2 (SCA).",
      tags: ["3d-secure", "acs", "sca"],
    },
    {
      id: "pay-set-dual",
      title: "Deux moitiés liées",
      order: 2,
      difficulty: "medium",
      type: "mcq",
      points: 210,
      timeLimitSec: 220,
      prompt: "Quel est l'objectif de la **signature duale** de SET ?",
      options: [
        "Lier commande et paiement tout en cachant chaque partie à l'autre acteur",
        "Chiffrer deux fois le numéro de carte",
        "Signer la transaction avec deux clés du commerçant",
        "Doubler le montant pour tester la fraude",
      ],
      answer: 0,
      hints: [{ text: "Le commerçant ne doit pas voir la carte ; la banque ne doit pas voir la commande.", cost: 30 }],
      explanation:
        "La signature duale prouve le lien entre l'Order Information et la Payment Information, tout en n'exposant à chaque acteur que la partie qui le concerne.",
      tags: ["set", "signature-duale"],
    },
    {
      id: "pay-amount-client",
      title: "Le prix qui ment",
      order: 3,
      difficulty: "medium",
      type: "mcq",
      points: 210,
      timeLimitSec: 200,
      prompt:
        "Un site envoie le **montant à payer** dans un champ caché du formulaire, puis facture ce montant. Quelle est la faille ?",
      options: [
        "Le montant est contrôlé côté client : l'attaquant peut le modifier avant envoi",
        "Le montant est chiffré en AES, donc trop lent",
        "Aucune faille : un champ caché est invisible",
        "Le montant devrait être en base64",
      ],
      answer: 0,
      hints: [{ text: "Tout ce qui vient du navigateur est modifiable.", cost: 30 }],
      explanation:
        "Un champ caché reste totalement modifiable (DevTools, proxy). Le montant doit être (re)calculé et validé **côté serveur** à partir du panier réel.",
      tags: ["logique-metier", "client-side"],
    },
    {
      id: "pay-replay",
      title: "Rejouer la partie",
      order: 4,
      difficulty: "hard",
      type: "multi",
      points: 320,
      timeLimitSec: 240,
      prompt:
        "Sélectionne **toutes** les mesures qui empêchent le **rejeu** d'une transaction de paiement :",
      options: [
        "Un identifiant de transaction unique / nonce à usage unique",
        "Une clé d'idempotence vérifiée côté serveur",
        "Afficher le montant en gras dans l'e-mail de confirmation",
        "Un horodatage signé avec fenêtre de validité courte",
      ],
      answer: [0, 1, 3],
      hints: [{ text: "Une seule proposition est cosmétique et n'a aucun effet sécurité.", cost: 45 }],
      explanation:
        "Nonce à usage unique, clé d'idempotence et horodatage signé bloquent le rejeu. Mettre le montant en gras dans un e-mail n'apporte aucune protection.",
      tags: ["rejeu", "idempotence", "nonce"],
    },
  ],
};
