#!/bin/bash
# Intervalle volontairement parfaitement régulier (10s) : c'est la
# régularité elle-même qui constitue le signal à détecter, pas le contenu.
while true; do
  nc -z -w1 attacker 443 >/dev/null 2>&1
  sleep 10
done
