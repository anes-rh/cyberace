#!/bin/sh
# Construit AU DÉMARRAGE le dépôt prod/webapp avec un secret injecté dans un
# ancien commit (base64), le suffixe de session le rendant unique (anti write-up),
# puis « nettoie » le secret du HEAD dans un commit ultérieur — mais l'historique
# le conserve (le cœur pédagogique). Démarre le pivot SSH + le service Git HTTP.
# Pas de `set -e` : les étapes SSH optionnelles ne doivent jamais empêcher le
# service Git de démarrer.
SUFFIX="${FLAG_SUFFIX:-static0}"
REG_PASS="R3g!Stry_${SUFFIX}"          # mot de passe de push registre (fuité)
SSH_PASS="Pivot_${SUFFIX}_42"          # mot de passe SSH de pivot (fuité)

# ── Utilisateur de pivot SSH (best-effort) ──────────────────────────────────
adduser -D -s /bin/bash ciuser 2>/dev/null || true
echo "ciuser:${SSH_PASS}" | chpasswd 2>/dev/null || true
ssh-keygen -A >/dev/null 2>&1 || true
mkdir -p /run/sshd
cat > /etc/ssh/sshd_config <<SSHD
Port 22
PermitRootLogin no
PasswordAuthentication yes
UsePAM no
SSHD
/usr/sbin/sshd 2>/dev/null || true

# ── Dépôt Git + historique piégé (critique) ─────────────────────────────────
export GIT_AUTHOR_NAME=dev GIT_AUTHOR_EMAIL=dev@corp.local
export GIT_COMMITTER_NAME=dev GIT_COMMITTER_EMAIL=dev@corp.local
WORK=/srv/work/webapp
rm -rf "$WORK"; mkdir -p "$WORK"; cd "$WORK"
git init -q

printf '# prod/webapp\nApplication de production.\n' > README.md
mkdir -p app
printf 'from http.server import HTTPServer, BaseHTTPRequestHandler\n' > app/server.py
git add -A; git commit -q -m "init: application prod/webapp"

# Commit « fautif » : le fichier CI avec les secrets en base64.
REG_B64=$(printf '%s' "$REG_PASS" | base64 | tr -d '\n')
SSH_B64=$(printf '%s' "$SSH_PASS" | base64 | tr -d '\n')
cat > .gitea-ci.yml <<YML
# Pipeline CI/CD — pousse l'image vers le registre interne à chaque tag.
pipeline:
  registry:
    url: registry:5000
    repository: prod/webapp
    push_user: deploy
    push_pass_b64: ${REG_B64}
  deploy_ssh:
    host: gitserver
    user: ciuser
    pass_b64: ${SSH_B64}
  deploy:
    docker_host: tcp://prod-dind:2375
  build:
    # Jeton de build exigé comme label 'ghost.session' sur toute image officielle.
    token: ${SUFFIX}
YML
git add .gitea-ci.yml; git commit -q -m "ci: ajoute la configuration du pipeline"

# Commit « de nettoyage » : on retire les secrets du HEAD… mais pas de l'historique.
cat > .gitea-ci.yml <<YML
# Pipeline CI/CD (secrets déplacés vers le coffre — voir l'historique !).
pipeline:
  registry:
    url: registry:5000
    repository: prod/webapp
  build:
    token: REDACTED
YML
git add .gitea-ci.yml; git commit -q -m "ci: retire les secrets du fichier de pipeline (cleanup)"

# Dépôt nu + info de service pour le protocole HTTP « dumb » (clonage anonyme).
rm -rf /srv/git/webapp.git
git clone -q --bare "$WORK" /srv/git/webapp.git
( cd /srv/git/webapp.git && git --bare update-server-info )
chmod -R a+rX /srv/git

echo "[gitserver] prêt : dépôt HTTP sur :80, pivot SSH ciuser sur :22 (suffix=${SUFFIX})"
exec busybox-extras httpd -f -p 80 -h /srv/git
