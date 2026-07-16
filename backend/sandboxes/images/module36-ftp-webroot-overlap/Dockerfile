FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends vsftpd python3 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /srv/shared && chmod 777 /srv/shared && \
    echo "<html><body>Portail partage</body></html>" > /srv/shared/index.html && \
    sed -i 's/^anonymous_enable=NO/anonymous_enable=YES/' /etc/vsftpd.conf && \
    echo "anon_root=/srv/shared" >> /etc/vsftpd.conf && \
    echo "no_anon_password=YES" >> /etc/vsftpd.conf && \
    echo "write_enable=YES" >> /etc/vsftpd.conf && \
    echo "anon_upload_enable=YES" >> /etc/vsftpd.conf

COPY start.sh /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
