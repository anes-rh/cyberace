FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends vsftpd python3 \
    && rm -rf /var/lib/apt/lists/*

# La racine du chroot anonyme (/srv/ftp) reste NON inscriptible : vsftpd 3.0.3
# refuse de tourner avec une racine de chroot inscriptible (le check n'est pas
# levé par allow_writeable_chroot pour l'anonyme). Le dossier réellement
# inscriptible est le sous-dossier www/, qui est AUSSI la racine servie en HTTP
# — c'est précisément le « recouvrement » que le module illustre.
RUN mkdir -p /srv/ftp/www && \
    echo "<html><body>Portail partage</body></html>" > /srv/ftp/www/index.html && \
    chmod 555 /srv/ftp && chmod 777 /srv/ftp/www && \
    sed -i 's/^anonymous_enable=NO/anonymous_enable=YES/' /etc/vsftpd.conf && \
    echo "anon_root=/srv/ftp" >> /etc/vsftpd.conf && \
    echo "no_anon_password=YES" >> /etc/vsftpd.conf && \
    echo "write_enable=YES" >> /etc/vsftpd.conf && \
    echo "anon_upload_enable=YES" >> /etc/vsftpd.conf && \
    echo "anon_umask=022" >> /etc/vsftpd.conf

COPY start.sh /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
