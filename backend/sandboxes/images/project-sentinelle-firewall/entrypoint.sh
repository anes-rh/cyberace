#!/bin/bash
# Charge le ruleset de départ (permissif), lance le renvoi des connexions SSH
# latérales vers le SIEM, puis ouvre un terminal web.
# ip_forward est activé par l'orchestrateur (sysctl net.ipv4.ip_forward=1).
nft -f /etc/nftables-base.conf 2>/dev/null || true

# Le firewall achemine tout le trafic dmz↔internal : il « voit » donc la
# connexion SSH webapp→fileserver. On la capture au niveau paquet (robuste aux
# modifications nft de l'étudiant) et on l'émet en syslog vers le SIEM, tag
# « firewall » → /var/log/firewall.log. SIEM_IP par défaut = 10.40.0.50 (mgmt).
SIEM_IP="${SIEM_IP:-10.40.0.50}"
FS_IP="${FILESERVER_IP:-10.30.0.50}"
(
  tcpdump -i any -l -nn \
    "tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack == 0 and dst port 22 and dst host ${FS_IP}" 2>/dev/null \
  | while read -r line; do
      echo "<134>$(date '+%b %e %H:%M:%S') firewall firewall: SSH-LAT connexion laterale vers fileserver:22 detectee" \
        > "/dev/udp/${SIEM_IP}/514" 2>/dev/null || true
    done
) &

exec ttyd -p 7681 -W bash
