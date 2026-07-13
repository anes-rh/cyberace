#!/bin/bash
/usr/sbin/vsftpd /etc/vsftpd.conf &
nginx -g "daemon off;"
