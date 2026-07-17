#!/bin/bash
# Serveur de fichiers interne. Écrit le flag « mouvement latéral » (suffixe de
# session injecté par l'orchestrateur), démarre rsyslog (auth.log) puis sshd.
set -e

SUFFIX="${FLAG_SUFFIX:-static}"
DOCS=/home/backup-svc/documents
mkdir -p "$DOCS"
cat > "$DOCS/rapport-confidentiel.txt" <<EOF
================ RAPPORT CONFIDENTIEL — NovaBank ================
Classification : RESTREINT — backup-svc uniquement.

Synthèse de la sauvegarde chiffrée hors-site. Ne pas diffuser.

Flag mouvement latéral : NOVA{mouvement_lateral_ssh_pivot}_${SUFFIX}
================================================================
EOF
chown -R backup-svc:backup-svc "$DOCS"
chmod 600 "$DOCS/rapport-confidentiel.txt"

# Clés d'hôte + rsyslog (auth.log local) + sshd au premier plan.
ssh-keygen -A >/dev/null 2>&1 || true
service rsyslog start >/dev/null 2>&1 || rsyslogd
exec /usr/sbin/sshd -D
