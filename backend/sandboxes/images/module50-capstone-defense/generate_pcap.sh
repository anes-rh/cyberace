#!/bin/bash
# Capture au build : le marqueur node=silent-beacon-node relie ce volet au
# targetImage (module18-beacon-noise) qui "bat" — IOC de correlation, pas un flag.
# Sleeps genereux (fragilite pcap au build, cf. Module 43) : verifier la taille apres.
set -e
mkdir -p /tmp/www
python3 -m http.server 8888 --directory /tmp/www &
HTTP_PID=$!
sleep 2
tcpdump -i lo -w /root/capture.pcap -U &
TCPDUMP_PID=$!
sleep 2

curl -s "http://127.0.0.1:8888/update.bin" -o /dev/null || true
curl -s "http://127.0.0.1:8888/beacon?node=silent-beacon-node&status=alive" -o /dev/null || true
curl -s "http://127.0.0.1:8888/favicon.ico" -o /dev/null || true

sleep 3
kill "$TCPDUMP_PID" 2>/dev/null || true
kill "$HTTP_PID" 2>/dev/null || true
sleep 1
chmod 644 /root/capture.pcap
