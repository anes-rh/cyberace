#!/bin/bash
# Génère un journal d'auth SSH réaliste : 4 sources de force brute + UN succès.
# 192.0.2.44 = la plus bruyante (600 échecs) mais ne réussit JAMAIS (décoy).
# 203.0.113.99 = la vraie brèche (520 échecs puis un Accepted). Cœur pédagogique :
# le volume seul ne désigne pas la compromission — il faut corréler avec un succès.
gen_fail() {
  local ip=$1 count=$2 user=$3
  for i in $(seq 1 "$count"); do
    echo "Jul 18 03:$((RANDOM % 60 < 10 ? 0 : 1))$((RANDOM % 60)):$((RANDOM % 60)) victim sshd[$((10000+i))]: Failed password for $user from $ip port $((30000+i)) ssh2"
  done
}

gen_fail 203.0.113.5 150 root
gen_fail 198.51.100.7 80 admin
gen_fail 192.0.2.44 600 root
gen_fail 203.0.113.99 520 root

echo "Jul 18 04:12:03 victim sshd[19999]: Accepted password for root from 203.0.113.99 port 41337 ssh2"
echo "Jul 18 04:12:03 victim sshd[19999]: pam_unix(sshd:session): session opened for user root(uid=0) by (uid=0)"
