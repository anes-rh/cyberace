#!/bin/bash
# exec -a spoof l'argv[0] du processus : ps affichera ce nom au lieu du binaire
# reellement execute (/bin/sleep). Un vrai thread noyau (kworker, ksoftirqd...) n'a
# jamais de /proc/PID/exe valide, contrairement a ce processus utilisateur maquille.
exec -a "[kworker/0:2]" /bin/sleep 999999 &
exec ttyd -p 7681 bash
