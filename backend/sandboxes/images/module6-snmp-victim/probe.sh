#!/bin/bash
# Interroge périodiquement un "agent SNMP" interne (IP fantôme, jamais
# attribuée à un conteneur réel). SNMPv1/v2c transmet la communauté en clair
# dans le paquet UDP — c'est cette valeur qui sert de flag ici.
while true; do
  snmpget -v2c -c 'CYBERACE{snmp_communaute_en_clair}' -t 1 -r 0 \
    10.62.0.99 1.3.6.1.2.1.1.1.0 >/dev/null 2>&1
  sleep 5
done
