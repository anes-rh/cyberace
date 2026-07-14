# CyberAce

Plateforme d'apprentissage **gamifiée** de l'informatique et de la cybersécurité, sous forme de « courses » (checkpoints → cours → défis chronométrés). Le parcours va des fondamentaux (algorithmique, réseaux, systèmes, bases de données) jusqu'à des **labs de cybersécurité pratiques réels**, exécutés dans des conteneurs Docker isolés avec terminal web.

---

## Aperçu

- **10 checkpoints**, dont : Algorithmique, Réseaux, Système d'exploitation, Base de données, puis un volet cybersécurité en deux parties :
  - **Cybersécurité — Théorie** (mini-checkpoints : Introduction à la sécurité, Sécurité réseaux, Sécurité réseaux sans fil, Sécurité système) ;
  - **Cybersécurité — Pratique** : **30 modules** de labs Docker (recon, ARP spoofing, élévation de privilèges, interception, détection, web…), chacun avec son environnement conteneurisé.
- Progression, points, badges, bonus de rapidité, classement.
- Contenu défini en **TypeScript** (aucune saisie manuelle en base) et injecté au démarrage (*seed*).

## Architecture

Monorepo à deux applications indépendantes (pas de workspace npm — on installe dans chaque dossier).

```
Lerning/
├── backend/     API REST — Express 5, Mongoose 9, JWT, MongoDB (en mémoire par défaut)
│   ├── src/
│   │   ├── data/courses/     contenu des cours/défis (TypeScript) + seed
│   │   ├── services/         orchestration des sandboxes Docker (dockerode)
│   │   ├── controllers/ routes/ models/ middleware/
│   │   └── server.ts
│   └── sandboxes/images/     Dockerfiles des labs cyber-pratique (1 dossier/image)
├── frontend/    Next.js 16 (React 19) — roadmap 3D (Three.js), lecteur de défis, terminal web
└── scripts/     utilitaires (ex. décodage .pka Packet Tracer)
```

### Stack

| | Techno |
|---|---|
| Frontend | Next.js 16, React 19, Three.js (roadmap 3D) |
| Backend | Express 5, Mongoose 9, JWT (bcryptjs), TypeScript |
| Base de données | MongoDB — **en mémoire par défaut** (`mongodb-memory-server`, zéro installation), URI réelle possible |
| Labs | Docker via **dockerode**, terminal web **ttyd**, réseau isolé par session |

## Démarrage rapide

Prérequis : Node.js 20+, npm. (Docker requis uniquement pour les labs cyber-pratique — voir plus bas.)

```bash
# 1) Backend
cd backend
npm install
cp .env.example .env        # ajuster si besoin (voir Variables d'environnement)
npm run dev                 # API sur http://localhost:4000 (seed automatique)

# 2) Frontend (autre terminal)
cd frontend
npm install
npm run dev                 # UI sur http://localhost:3000
```

Par défaut, le backend démarre une **MongoDB en mémoire** et injecte tout le contenu : aucune base à installer.

## Variables d'environnement (backend/.env)

Voir `backend/.env.example`. Principales :

| Variable | Rôle |
|---|---|
| `PORT` | Port de l'API (défaut 4000) |
| `CLIENT_ORIGIN` | Origine(s) CORS autorisée(s) |
| `MONGODB_URI` / `USE_MEMORY_DB` | Base réelle vs base en mémoire |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Signature des jetons (**à changer en prod**) |
| `AUTO_SEED` | Injection du contenu au démarrage si vide |
| `DOCKER_HOST` | Démon Docker des labs — voir ci-dessous |
| `SANDBOX_PUBLIC_HOST` | Hôte que le navigateur joint pour les ports publiés |

## Les labs cyber-pratique (Docker)

Chaque module « pratique » démarre à la demande une **sandbox** : un réseau Docker isolé par session, un conteneur *attaquant* (terminal web ttyd publié) et, selon le module, un conteneur *cible*. Les sessions ont un TTL et sont nettoyées automatiquement (reaper + prune au démarrage).

- Les images sont définies sous `backend/sandboxes/images/<nom>/` et taguées `cyberace/<nom>:latest`.
- Build de toutes les images (ou d'une liste) contre le démon configuré :
  ```bash
  cd backend
  npm run sandbox:build                       # toutes
  npm run sandbox:build module1-recon-target  # ciblé
  ```

### Démon Docker distant (`DOCKER_HOST`)

Le backend parle à Docker via le socket local **ou**, si `DOCKER_HOST=tcp://<hôte>:2375` est défini, à un **démon distant** (par ex. une VM Linux quand Docker Desktop n'est pas disponible sur la machine hôte). Dans ce cas, `SANDBOX_PUBLIC_HOST` doit pointer sur l'IP joignable par le navigateur (l'IP de la VM).

> ⚠️ **Sécurité** : un démon Docker exposé en TCP **sans TLS** ne doit **jamais** être accessible publiquement — uniquement sur un réseau local de confiance. Pour tout usage exposé, activer TLS mutuel (`tcp://…:2376`).

## Scripts utiles (backend)

| Commande | Effet |
|---|---|
| `npm run dev` | API en dev (rechargement à chaud) |
| `npm run build` / `npm start` | Compilation TS → `dist/`, puis exécution |
| `npm run seed` | (Ré)injection du contenu |
| `npm run sandbox:build [images…]` | Build des images de labs |
| `npm run sandbox:prune` | Nettoyage des conteneurs/réseaux de sandbox orphelins |

## Sécurité (notes)

- Les routes d'authentification (`/api/auth/login`, `/api/auth/register`) sont protégées par un **rate-limiting** anti-brute-force (`express-rate-limit`).
- Changer `JWT_SECRET` en production ; ne jamais committer de `.env`.
- Les labs Docker s'exécutent avec des quotas de ressources et des réseaux isolés ; ne pas exposer le démon Docker sans TLS.
