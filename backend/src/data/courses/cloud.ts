import type { CourseSeed } from "../../types";

export const cloud: CourseSeed = {
  slug: "cloud-security",
  title: "Sécurité cloud",
  codename: "Sky Fortress",
  domain: "Cloud",
  theme: "sky",
  icon: "Cloud",
  accent: "#60a5fa",
  order: 12,
  difficulty: "hard",
  summary:
    "Module bonus. Modèle de responsabilité partagée, IAM au cordeau, buckets qui fuient et SSRF vers la metadata : tiens la forteresse.",
  objectives: [
    "Situer les responsabilités dans le modèle partagé",
    "Repérer un stockage objet exposé publiquement",
    "Comprendre l'attaque SSRF vers l'endpoint de metadata",
    "Appliquer le moindre privilège IAM et IMDSv2",
  ],
  lesson: `## Responsabilité partagée

Le fournisseur sécurise le cloud (**of** the cloud) : datacenters, hyperviseur, réseau physique. Le **client** sécurise ce qu'il met **dans** le cloud (**in** the cloud) : ses données, sa **configuration**, ses **identités (IAM)**, ses OS invités. La majorité des incidents cloud viennent d'une **mauvaise configuration** côté client, pas d'une faille du fournisseur.

## IAM : le moindre privilège

Des politiques trop larges (\`Action: *\`, \`Resource: *\`) transforment une compromission mineure en prise de contrôle totale. On accorde le strict nécessaire, on préfère les **rôles** temporaires aux clés statiques, et on active le MFA.

## Stockage objet exposé

Un **bucket** (S3, GCS, Blob) rendu **public** en lecture expose tous ses objets à Internet — fuite de données classique. On verrouille l'accès public par défaut et on chiffre au repos.

## SSRF vers la metadata

Chaque instance interroge un **endpoint de metadata** à l'adresse **169.254.169.254** pour obtenir sa configuration… et ses **credentials temporaires**. Si une application est vulnérable au **SSRF**, l'attaquant la force à requêter cette IP et **vole les credentials du rôle**. Parade : **IMDSv2** (jeton de session obligatoire, limite de sauts TTL) et filtrage des requêtes sortantes.

## En résumé

Chiffrement, journalisation (CloudTrail), segmentation, secrets dans un coffre (Secrets Manager/Vault), et revue continue des configurations (CSPM).`,
  badge: {
    id: "badge-cloud-sentinel",
    name: "Cloud Sentinel",
    icon: "Cloud",
    description: "Sait durcir IAM, stockage et metadata dans le cloud.",
  },
  challenges: [
    {
      id: "cloud-shared-resp",
      title: "À qui la faute ?",
      order: 1,
      difficulty: "easy",
      type: "mcq",
      points: 130,
      timeLimitSec: 160,
      prompt:
        "En IaaS, un bucket mal configuré fuite des données. Selon le **modèle de responsabilité partagée**, qui est responsable ?",
      options: [
        "Le client : la configuration et les données lui incombent",
        "Le fournisseur : il gère tout",
        "Personne : c'est un risque accepté",
        "L'auditeur externe uniquement",
      ],
      answer: 0,
      hints: [{ text: "Le fournisseur sécurise le cloud ; le client sécurise ce qu'il y met.", cost: 20 }],
      explanation:
        "La configuration, les données et l'IAM relèvent du client. Le fournisseur ne répond que de l'infrastructure sous-jacente.",
      tags: ["responsabilite-partagee", "iaas"],
    },
    {
      id: "cloud-metadata-ip",
      title: "L'adresse qui donne les clés",
      order: 2,
      difficulty: "medium",
      type: "text",
      points: 210,
      timeLimitSec: 200,
      prompt:
        "Une SSRF permet d'atteindre l'**endpoint de metadata** d'une instance et d'en voler les credentials.\n\nQuelle **adresse IP** est visée ? (format x.x.x.x)",
      hints: [
        { text: "C'est une IP link-local qui commence par 169.254...", cost: 30 },
        { text: "169.254.169.254", cost: 45 },
      ],
      answer: "169.254.169.254",
      accept: ["169.254.169.254", "http://169.254.169.254"],
      explanation:
        "169.254.169.254 est l'endpoint de metadata (AWS/GCP/Azure). Via SSRF, on y lit les credentials temporaires du rôle de l'instance — sauf si IMDSv2 est imposé.",
      tags: ["ssrf", "metadata", "imds"],
    },
    {
      id: "cloud-public-bucket",
      title: "Le seau percé",
      order: 3,
      difficulty: "medium",
      type: "mcq",
      points: 200,
      timeLimitSec: 180,
      prompt: "Quelle mauvaise configuration expose le plus souvent des données dans le cloud ?",
      options: [
        "Un bucket de stockage objet ouvert en lecture publique",
        "Un chiffrement AES-256 activé",
        "L'usage de rôles IAM temporaires",
        "L'activation de la journalisation",
      ],
      answer: 0,
      hints: [{ text: "Pense aux fuites S3 récurrentes dans l'actualité.", cost: 25 }],
      explanation:
        "Un bucket public en lecture expose tous ses objets. Chiffrement, rôles temporaires et journalisation sont au contraire de bonnes pratiques.",
      tags: ["bucket", "misconfig", "s3"],
    },
    {
      id: "cloud-imdsv2",
      title: "Verrouiller la metadata",
      order: 4,
      difficulty: "hard",
      type: "mcq",
      points: 330,
      timeLimitSec: 220,
      prompt: "Comment **IMDSv2** réduit-il le risque de vol de credentials par SSRF ?",
      options: [
        "Il exige un jeton de session (PUT) avant tout accès, ce qu'une SSRF simple ne peut fournir",
        "Il chiffre les credentials avec la clé du client",
        "Il désactive totalement la metadata",
        "Il change l'adresse IP de la metadata à chaque requête",
      ],
      answer: 0,
      hints: [{ text: "Une SSRF typique ne fait que des GET ; IMDSv2 impose d'abord un PUT avec jeton.", cost: 45 }],
      explanation:
        "IMDSv2 impose d'obtenir un jeton de session via une requête PUT (avec limite de sauts TTL) avant de lire la metadata — hors de portée d'une SSRF en simple GET.",
      tags: ["imdsv2", "ssrf", "hardening"],
    },
  ],
};
