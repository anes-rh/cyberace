#!/bin/bash
set -e
/usr/sbin/sshd
/usr/sbin/vsftpd /etc/vsftpd.conf &
cd /srv/www && python3 -m http.server 8080 &
ncat -lk -p 47831 -c "cat /srv/hidden/flag3.txt" &
wait -n
