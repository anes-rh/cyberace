#!/bin/bash
# siem : collecteur de logs + sinkhole du C2. Au demarrage, rejoue les journaux
# de l'incident a partir des IOC de session (memes valeurs que victim-host, meme
# FLAG_SUFFIX). Horodatages ISO 8601 -> parseables par `date -d` (objectif timeline).
set -u
sh /usr/local/bin/iocgen.sh
. /opt/incident/state

# Journal d'acces correle : trafic normal + l'exploit initial (User-Agent NovaRAT)
# + la balise C2 finale. Le premier evenement NovaRAT = intrusion ; le dernier = C2.
cat > /var/log/access.log <<EOF
2026-07-18T02:03:11Z src=203.0.113.24 GET /index.html ua=Mozilla/5.0 status=200
2026-07-18T02:09:47Z src=198.51.100.61 GET /assets/app.css ua=Mozilla/5.0 status=200
$T0 src=$EXT_IP POST /api/v2/import ua=NovaRAT/2.1 status=200 note=initial-exploit
2026-07-18T02:22:35Z src=203.0.113.24 GET /dashboard ua=Mozilla/5.0 status=200
$T_END src=$EXT_IP CONNECT dst=$EXT_IP:$C2_PORT ua=NovaRAT/2.1 note=c2-beacon
EOF

cat > /var/log/auth.log <<EOF
2026-07-18T02:12:03Z sshd[812]: Failed password for root from $EXT_IP port 41022 ssh2
2026-07-18T02:13:55Z sshd[814]: Accepted password for admin from $EXT_IP port 41090 ssh2
EOF

# Sinkhole du C2 : ecoute sur $C2_PORT pour que la balise de victim-host s'ETABLISSE
# (tail -f garde le stdin de ncat ouvert -> connexion ESTABLISHED, pas half-close).
tail -f /dev/null | ncat -lk -p "$C2_PORT" >/dev/null 2>&1 &

exec ttyd -p 7681 -W bash
