#!/bin/bash
# Démarre le pipeline officiel ModSecurity/CRS + nginx en arrière-plan (il
# génère la config depuis les variables d'env : BACKEND, PORT, PARANOIA,
# MODSEC_RULE_ENGINE), puis ouvre un terminal web.
#
# L'étudiant durcit le WAF depuis ce terminal :
#   echo 'SecRuleEngine On' >> /etc/modsecurity.d/modsecurity-override.conf
#   nginx -s reload
/docker-entrypoint.sh nginx -g 'daemon off;' &

# Laisse nginx s'initialiser avant d'exposer le terminal.
sleep 2
exec ttyd -p 7681 -W bash
