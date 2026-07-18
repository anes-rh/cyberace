#!/bin/bash
# ws01 : compte local Administrator (mot de passe = Corp!${FLAG_SUFFIX}Aa1, comme
# le DC → même hash NTLM) et partage « secret » contenant le flag de session,
# lisible uniquement par Administrator. Cible du pass-the-hash final.
set -e

SUFFIX="${FLAG_SUFFIX:-static0}"
ADMINPW="Corp!${SUFFIX}Aa1"

useradd -M -s /usr/sbin/nologin Administrator 2>/dev/null || true
printf '%s\n%s\n' "$ADMINPW" "$ADMINPW" | smbpasswd -s -a Administrator >/dev/null 2>&1 || true

mkdir -p /srv/secret
cat > /srv/secret/flag.txt <<EOF
SHADOW{domain_admin_pass_the_hash}_${SUFFIX}

Compromission totale confirmée : accès Administrateur au poste ws01 obtenu par
pass-the-hash avec le hash NTLM exfiltré du contrôleur de domaine.
EOF
chown -R Administrator /srv/secret
chmod -R 0750 /srv/secret

exec smbd --foreground --no-process-group --debug-stdout
