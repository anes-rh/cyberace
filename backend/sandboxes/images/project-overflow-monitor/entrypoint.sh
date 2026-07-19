#!/bin/bash
# Démarre le collecteur d'évènements (sink :9000) en tâche de fond, puis expose
# un terminal web (ttyd) pour que le joueur consulte le journal des crashs et
# des accès aux flags (rôle « log » — comme le SIEM de Sentinelle).
set -u
mkdir -p /var/log/overflow
touch /var/log/overflow/events.log

/usr/local/bin/monitor_sink &

cat > /etc/motd <<'MOTD'
=== Monitor — Opération Overflow ===
Journal des évènements :  /var/log/overflow/events.log
  <horodatage UTC>  <service>  CRASH       (enfant tué par SIGSEGV)
  <horodatage UTC>  <service>  FLAG-READ   (shell obtenu -> getflag)
Astuce :  tail -f /var/log/overflow/events.log
          grep -c 'vuln-lvl1 CRASH' /var/log/overflow/events.log
MOTD

cd /var/log/overflow
exec ttyd -p 7681 -W bash --login
