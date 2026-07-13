#!/bin/bash
# Simule un scan de ports contre "attacker" : tente une connexion rapide sur
# 20 ports distincts en quelques secondes, signature classique d'un scan.
PORTS="21 22 23 25 53 80 110 139 143 443 445 3306 3389 5432 6379 8080 8443 9200 27017 6667"
while true; do
  for p in $PORTS; do
    nc -z -w1 attacker "$p" >/dev/null 2>&1
  done
  sleep 20
done
