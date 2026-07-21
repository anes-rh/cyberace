#!/bin/bash
# Capture d'intrusion generee au BUILD (donc identique/stable) : contient la
# requete d'exploit initiale avec un User-Agent reconnaissable (NovaRAT/2.1) et
# un payload. L'objectif 2 (analyse PCAP) lit ce User-Agent. Fenetre C2 dynamique
# non incluse ici (elle vit dans les logs de session, pas dans le pcap fige).
set -e
mkdir -p /tmp/www /data
python3 -m http.server 8890 --directory /tmp/www &
HTTP_PID=$!
sleep 2
tcpdump -i lo -w /data/incident.pcap -U &
TCP_PID=$!
sleep 2

curl -s -A "NovaRAT/2.1" "http://127.0.0.1:8890/api/v2/import?tpl=../../etc/passwd" -o /dev/null || true
curl -s -A "NovaRAT/2.1" -X POST --data "cmd=id;whoami" "http://127.0.0.1:8890/api/v2/exec" -o /dev/null || true
curl -s -A "Mozilla/5.0" "http://127.0.0.1:8890/favicon.ico" -o /dev/null || true

sleep 3
kill "$TCP_PID" 2>/dev/null || true
kill "$HTTP_PID" 2>/dev/null || true
sleep 1
chmod 644 /data/incident.pcap
