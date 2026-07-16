#!/bin/bash
# vsftpd exige que son secure_chroot_dir (/var/run/vsftpd/empty) existe — absent
# dans une image minimale, ce qui fait échouer chaque session FTP.
mkdir -p /var/run/vsftpd/empty
/usr/sbin/vsftpd /etc/vsftpd.conf &
# Le serveur web sert exactement le dossier où l'anonyme peut écrire : www/.
cd /srv/ftp/www && exec python3 -m http.server 8080
