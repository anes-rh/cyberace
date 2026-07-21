#!/bin/bash
# `tail -f /dev/null |` garde le stdin de ncat ouvert en permanence : sinon ncat
# atteint EOF (stdin ferme dans un entrypoint de conteneur), ferme son cote emission
# et la connexion tombe en CLOSE-WAIT/FIN-WAIT-2 au lieu de rester ESTABLISHED.
tail -f /dev/null | ncat -lk -p 4444 >/dev/null 2>&1 &
sleep 1
# /dev/tcp est une pseudo-fonctionnalite de bash (pas un vrai fichier) qui ouvre une
# connexion TCP directement depuis le shell. exec -a spoof l'argv[0] affiche par ps :
# "system-update-agent" alors que le binaire reel est /bin/bash.
# La boucle `while` est CRUCIALE : sans elle, bash exec-optimise la derniere commande
# et se remplace par `sleep` (perdant le nom spoofe ET pointant /proc/exe vers sleep).
# Avec la boucle, le processus reste un bash nomme "system-update-agent" qui garde la
# connexion TCP (fd 3) ETABLIE, et dont /proc/PID/exe revele bien /bin/bash.
exec -a "system-update-agent" bash -c "exec 3<>/dev/tcp/127.0.0.1/4444; while :; do sleep 3600; done" &
exec ttyd -p 7681 bash
