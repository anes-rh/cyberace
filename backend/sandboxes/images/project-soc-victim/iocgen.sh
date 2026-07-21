#!/bin/sh
# Derive les IOC de session DETERMINISTIQUEMENT depuis FLAG_SUFFIX. Fichier
# IDENTIQUE sur victim-host et siem (meme FLAG_SUFFIX injecte) -> IOC coherents
# entre les noeuds, mais DIFFERENTS a chaque session (anti write-up).
SFX="${FLAG_SUFFIX:-static0}"
h=$(printf '%s' "$SFX" | cksum | cut -d' ' -f1)
# Tag alphanumerique derive du hash du suffixe COMPLET (et non de ses premiers
# caracteres) : deux sessions dont les suffixes partagent un prefixe obtiennent
# malgre tout des noms de processus distincts.
tag=$(printf '%08x' "$h" 2>/dev/null | cut -c1-6)
[ -z "$tag" ] && tag="agent0"

EXT_IP="45.$((h % 180 + 11)).$(( (h / 7) % 180 + 11 )).$(( (h / 13) % 180 + 11 ))"
C2_PORT=$(( 40000 + h % 20000 ))
PROC="sys-${tag}worker"
MAL_DIR="/tmp/.hidden"
MAL_BIN="$MAL_DIR/$PROC"
CRON_FILE="/etc/cron.d/apt-refresh"
DUR_MIN=$(( 20 + h % 100 ))
T0="2026-07-18T02:14:07Z"
T0S=$(date -u -d "$T0" +%s)
T_END=$(date -u -d "@$(( T0S + DUR_MIN * 60 ))" +%Y-%m-%dT%H:%M:%SZ)

mkdir -p /opt/incident
cat > /opt/incident/state <<EOF
EXT_IP=$EXT_IP
C2_PORT=$C2_PORT
PROC=$PROC
MAL_DIR=$MAL_DIR
MAL_BIN=$MAL_BIN
CRON_FILE=$CRON_FILE
T0=$T0
T_END=$T_END
DUR_MIN=$DUR_MIN
EOF
