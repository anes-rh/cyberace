#!/bin/bash
# "Agent" interne qui rapporte périodiquement à un service interne (10.55.0.99)
# qu'il croit légitime. En UDP volontairement : pas de poignée de main à
# établir, donc rien à capturer tant que le trafic n'est pas physiquement
# redirigé vers l'attaquant — pas de round-trip qui pourrait échouer/bloquer.
while true; do
  echo "AGENT_REPORT token=CYBERACE{arp_intercepte_en_clair}" \
    | ncat -u --send-only 10.55.0.99 5353 2>/dev/null
  sleep 5
done
