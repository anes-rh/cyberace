#!/bin/bash
/usr/sbin/vsftpd /etc/vsftpd.conf &
cd /srv/shared && exec python3 -m http.server 8080
