#!/bin/bash
# logger -d force l'envoi en UDP (pas de connexion à établir, comme aux
# Modules 2/6/9), -n et -P précisent l'hôte et le port distants.
while true; do
  logger -n 10.67.0.99 -P 514 -d "AUTH_EVENT user=svc-backup token=CYBERACE{syslog_udp_jamais_chiffre}"
  sleep 5
done
