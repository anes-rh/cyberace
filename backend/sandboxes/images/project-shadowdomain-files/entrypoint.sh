#!/bin/bash
# files01 : compte local svc-sql (même mot de passe faible que le compte de
# service du domaine) + partage « finance » lisible par ce seul compte.
set -e

useradd -M -s /usr/sbin/nologin svc-sql 2>/dev/null || true
printf 'Password1\nPassword1\n' | smbpasswd -s -a svc-sql >/dev/null 2>&1 || true

mkdir -p /srv/finance
cat > /srv/finance/budget-2026.txt <<EOF
NovaCorp — Budget prévisionnel 2026 (CONFIDENTIEL, accès svc-sql).
Le compte de service qui lit ce partage dispose de droits étendus dans
l'annuaire… (indice : regarde ses ACL sur les groupes privilégiés).
EOF
chown -R svc-sql /srv/finance
chmod -R 0750 /srv/finance

exec smbd --foreground --no-process-group --debug-stdout
