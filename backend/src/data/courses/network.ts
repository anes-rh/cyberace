import type { CourseSeed } from "../../types";

export const network: CourseSeed = {
  slug: "network-wlan",
  title: "Sécurité réseau & WLAN",
  codename: "Signal Sprint",
  domain: "Réseau & WLAN",
  theme: "track",
  icon: "Wifi",
  accent: "#38bdf8",
  order: 4,
  difficulty: "medium",
  summary:
    "Du chiffrement Wi-Fi cassé de WEP au 4-Way Handshake, en passant par le VLAN hopping et le détournement BGP : sécurise chaque couche.",
  objectives: [
    "Expliquer pourquoi WEP est cassable et ce que corrige WPA2/WPA3",
    "Décrire le 4-Way Handshake et la dérivation de la PTK",
    "Repérer les attaques L2 (ARP spoofing, VLAN hopping, STP)",
    "Comprendre le BGP hijacking et sa mitigation par RPKI",
  ],
  lesson: `## Wi-Fi : de WEP à WPA3

- **WEP** utilise RC4 avec un **IV de 24 bits** transmis en clair. Les IV se répètent vite (paradoxe des anniversaires) et l'attaque FMS/PTW récupère la clé en quelques minutes.
- **WPA/WPA2** introduisent **TKIP** puis **CCMP (AES)**. En mode personnel, la **PMK** dérive de la passphrase (PBKDF2 + SSID).
- Le **4-Way Handshake** authentifie et établit la **PTK** = PRF(PMK, ANonce, SNonce, @MAC AP, @MAC STA). Capturer le handshake permet une attaque par dictionnaire hors ligne.
- **WPA3** remplace le PSK par **SAE (Dragonfly)** : résistant au dictionnaire hors ligne et *forward secrecy*.
- **802.1X** = authentification par port (EAP + serveur RADIUS), le vrai « enterprise mode ».

## Attaques de couche 2

- **ARP spoofing** : l'attaquant répond aux requêtes ARP pour se placer en *Man-in-the-Middle*. Parade : **Dynamic ARP Inspection** + DHCP snooping.
- **VLAN hopping** : le **double tagging 802.1Q** (deux étiquettes VLAN) fait sauter la trame vers un autre VLAN. Parade : ne jamais laisser le VLAN natif en accès, désactiver le trunk auto (DTP).
- **STP** : injecter des BPDU pour devenir *root bridge* et détourner le trafic. Parade : **BPDU Guard / Root Guard**.
- **MACsec (802.1AE)** chiffre le lien Ethernet point à point.

## BGP : la confiance aveugle

BGP n'authentifie pas les annonces. Un AS malveillant peut **annoncer un préfixe** qui ne lui appartient pas (*prefix hijacking*), détournant le trafic. La **RPKI** signe cryptographiquement l'association préfixe↔AS via des **ROA (Route Origin Authorization)**, et le routeur rejette les annonces *invalid*.`,
  badge: {
    id: "badge-packet-racer",
    name: "Packet Racer",
    icon: "Wifi",
    description: "A sécurisé le Wi-Fi, la couche 2 et le routage inter-domaines.",
  },
  challenges: [
    {
      id: "net-wep-weakness",
      title: "IV trop court",
      order: 1,
      difficulty: "easy",
      type: "mcq",
      points: 110,
      timeLimitSec: 150,
      prompt:
        "Quelle est la **faiblesse fondamentale** qui rend WEP cassable en quelques minutes ?",
      options: [
        "Un vecteur d'initialisation (IV) de 24 bits réutilisé avec RC4",
        "L'usage d'AES en mode ECB",
        "Un handshake en 4 messages trop long",
        "L'absence totale de chiffrement",
      ],
      answer: 0,
      hints: [{ text: "Pense à la taille de l'IV et à sa réutilisation.", cost: 15 }],
      explanation:
        "Les IV de 24 bits se répètent rapidement ; combinés aux faiblesses de RC4, ils permettent l'attaque FMS/PTW. WPA2 (CCMP/AES) corrige cela.",
      tags: ["wep", "rc4"],
    },
    {
      id: "net-4way-count",
      title: "Compte les poignées",
      order: 2,
      difficulty: "easy",
      type: "numeric",
      points: 100,
      timeLimitSec: 120,
      prompt:
        "Combien de messages échange le **handshake WPA2** qui établit la clé de session ?",
      hints: [{ text: "C'est dans le nom de l'échange.", cost: 15 }],
      answer: 4,
      explanation:
        "Le 4-Way Handshake échange 4 trames EAPOL : elles prouvent que les deux parties connaissent la PMK et dérivent la PTK.",
      tags: ["wpa2", "handshake"],
    },
    {
      id: "net-ptk-derivation",
      title: "Fabrique la PTK",
      order: 3,
      difficulty: "medium",
      type: "multi",
      points: 240,
      timeLimitSec: 240,
      prompt:
        "La **PTK** (Pairwise Transient Key) est dérivée par une PRF. Sélectionne **tous** les ingrédients réellement utilisés :",
      options: [
        "La PMK",
        "Le nonce de l'AP (ANonce) et celui de la station (SNonce)",
        "Les adresses MAC de l'AP et de la station",
        "La clé privée RSA du point d'accès",
      ],
      answer: [0, 1, 2],
      hints: [{ text: "WPA2-Personnel n'utilise aucune clé asymétrique RSA.", cost: 35 }],
      explanation:
        "PTK = PRF(PMK, ANonce, SNonce, @MAC_AP, @MAC_STA). Aucune clé RSA n'intervient en WPA2-PSK — capturer le handshake suffit pour un bruteforce hors ligne.",
      tags: ["wpa2", "ptk"],
    },
    {
      id: "net-bgp-rpki",
      title: "Route de confiance",
      order: 4,
      difficulty: "hard",
      type: "mcq",
      points: 330,
      timeLimitSec: 220,
      prompt:
        "Un AS annonce un préfixe qui ne lui appartient pas et détourne le trafic (**BGP hijacking**).\n\nQuel mécanisme permet au routeur de **rejeter** cette annonce ?",
      options: [
        "La RPKI, qui valide l'origine via un ROA signé",
        "Le chiffrement WPA3 des sessions BGP",
        "Le protocole STP avec BPDU Guard",
        "Le Dynamic ARP Inspection",
      ],
      answer: 0,
      hints: [{ text: "ROA = Route Origin Authorization.", cost: 40 }],
      explanation:
        "La RPKI associe cryptographiquement un préfixe à son AS d'origine (ROA). Une annonce dont l'origine ne correspond pas est marquée *invalid* et rejetée.",
      tags: ["bgp", "rpki", "routage"],
    },
  ],
};
