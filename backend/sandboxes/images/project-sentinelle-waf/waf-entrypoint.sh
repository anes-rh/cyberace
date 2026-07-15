#!/bin/bash
# Démarre le pipeline officiel ModSecurity/CRS + nginx en arrière-plan (il
# génère la config depuis les variables d'env : BACKEND, PORT, PARANOIA,
# MODSEC_RULE_ENGINE), puis ouvre un terminal web.
/docker-entrypoint.sh nginx -g 'daemon off;' &

# Laisse le pipeline CRS générer sa config et nginx démarrer.
sleep 4

# Protection SQLi VOLONTAIREMENT NAÏVE (pédagogique). La CRS complète (avec
# libinjection) serait incontournable par les techniques enseignées ici
# (commentaires, casse) : on retire ses règles SQLi et on installe un filtre
# regex simple — représentatif d'un WAF mal configuré, contournable par un
# commentaire inline (`UNION/**/SELECT`). L'étudiant l'ACTIVE en passant
# SecRuleEngine à On (objectif 2) ; le contourne à l'objectif 3.
cat > /etc/modsecurity.d/modsecurity-override.conf <<'EOF'
# Filtre SQLi maison (naïf) — géré par SecRuleEngine.
SecRuleRemoveById 942000-942999
SecRule ARGS "@rx (?i)(union\s+select|'[0-9]+'\s*=\s*'[0-9]+)" \
  "id:1000,phase:2,t:none,deny,status:403,msg:'Filtre SQLi (naif)'"
EOF
nginx -s reload 2>/dev/null || true

exec ttyd -p 7681 -W bash
