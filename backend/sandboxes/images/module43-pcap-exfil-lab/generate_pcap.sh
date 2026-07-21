#!/bin/bash
# Génère une capture au build : un petit serveur HTTP + tcpdump enregistrent
# 4 requêtes, dont une exfiltration base64 sur /api/sync. Fragilité connue
# (processus en arrière-plan pendant le build) → sleeps généreux + vérif de
# taille après build. Le flag doit matcher la tâche 7.
set -e
mkdir -p /tmp/www
python3 -m http.server 8888 --directory /tmp/www &
HTTP_PID=$!
sleep 2
tcpdump -i lo -w /root/capture.pcap -U &
TCPDUMP_PID=$!
sleep 2

curl -s "http://127.0.0.1:8888/style.css?theme=dark" -o /dev/null || true
curl -s "http://127.0.0.1:8888/logo.png?v=3" -o /dev/null || true
FLAG_B64=$(echo -n "CYBERACE{exfiltration_visible_dans_une_capture}" | base64 -w0)
curl -s "http://127.0.0.1:8888/api/sync?d=${FLAG_B64}" -o /dev/null || true
curl -s "http://127.0.0.1:8888/favicon.ico" -o /dev/null || true

sleep 3
kill "$TCPDUMP_PID" 2>/dev/null || true
kill "$HTTP_PID" 2>/dev/null || true
sleep 1
chmod 644 /root/capture.pcap
