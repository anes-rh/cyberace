#!/bin/bash
# Émet des rafales périodiques de trames à adresses MAC source aléatoires,
# simulant une attaque MAC flooding en arrière-plan. C'est le conteneur
# "target" qui génère le bruit — l'élève, côté "attacker", n'a rien à
# déclencher lui-même : il doit seulement observer et diagnostiquer.
while true; do
  macof -i eth0 -n 60 >/dev/null 2>&1
  sleep 8
done
