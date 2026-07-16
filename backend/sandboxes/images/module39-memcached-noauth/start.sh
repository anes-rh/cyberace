#!/bin/bash
memcached -l 0.0.0.0 -p 11211 -d -u root
sleep 1
FLAG="CYBERACE{memcached_sans_authentification}"
LEN=${#FLAG}
printf "set flag 0 0 %s\r\n%s\r\n" "$LEN" "$FLAG" | nc -q1 127.0.0.1 11211
tail -f /dev/null
