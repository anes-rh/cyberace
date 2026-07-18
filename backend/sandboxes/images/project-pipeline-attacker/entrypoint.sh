#!/bin/bash
# Résolution des hôtes accessibles depuis la dmz (le reste du réseau interne
# n'est PAS routable d'ici : le seul chemin est le pivot SSH vers gitserver).
grep -q gitserver /etc/hosts 2>/dev/null || cat >> /etc/hosts <<EOF
10.60.0.20 gitserver
EOF

cat > /root/.bashrc <<'RC'
cat /etc/motd 2>/dev/null
alias ll='ls -la'
RC

exec ttyd -p 7681 -W bash
