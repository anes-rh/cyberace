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

# --- Journalisation vers le SIEM ---------------------------------------------
# L'image CRS renvoie l'access log vers /dev/stdout (symlink) et pose
# `access_log off` sur les locations proxifiées : rien à suivre. On rétablit un
# VRAI fichier et on force le log sur toutes les locations, puis on émet chaque
# ligne en syslog UDP vers le SIEM (tag « waf » → /var/log/waf.log). Les requêtes
# bloquées portent le code 403 : l'analyste fait alors `grep 403` / lit l'IP.
ACCESS_FILE=/var/log/nginx/access.log
rm -f "$ACCESS_FILE"; : > "$ACCESS_FILE"
# `combined` = format prédéfini de nginx (toujours disponible, contrairement à
# `main` qui n'est pas visible dans le contexte des locations incluses).
grep -rl "access_log off;" /etc/nginx/conf.d /etc/nginx/includes 2>/dev/null \
  | xargs -r sed -i "s#access_log off;#access_log ${ACCESS_FILE} combined;#g"
nginx -t 2>/dev/null && nginx -s reload 2>/dev/null || true

SIEM_IP="${SIEM_IP:-10.40.0.50}"
(
  tail -n0 -F "$ACCESS_FILE" 2>/dev/null | while read -r line; do
    echo "<134>$(date '+%b %e %H:%M:%S') waf waf: ${line}" > "/dev/udp/${SIEM_IP}/514" 2>/dev/null || true
  done
) &

exec ttyd -p 7681 -W bash
