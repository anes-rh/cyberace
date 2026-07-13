FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    vsftpd nginx apache2-utils \
    && rm -rf /var/lib/apt/lists/*

# --- FTP anonyme avec un indice vers la suite ---
RUN mkdir -p /srv/ftp && \
    echo "Note interne : le panneau d'admin est sur /admin-portal/, identifiants par defaut jamais changes (admin/admin2024)." \
    > /srv/ftp/notes.txt && \
    sed -i 's/^anonymous_enable=NO/anonymous_enable=YES/' /etc/vsftpd.conf && \
    echo "anon_root=/srv/ftp" >> /etc/vsftpd.conf && \
    echo "no_anon_password=YES" >> /etc/vsftpd.conf

# --- Panneau admin protégé par Basic Auth, identifiants faibles ---
RUN mkdir -p /var/www/html/admin-portal && \
    echo "CYBERACE{synthese_recon_ftp_bruteforce_faible}" > /var/www/html/admin-portal/index.html && \
    htpasswd -bc /etc/nginx/.htpasswd admin admin2024

RUN printf 'server {\n  listen 8080;\n  root /var/www/html;\n  location /admin-portal/ {\n    auth_basic "Zone restreinte";\n    auth_basic_user_file /etc/nginx/.htpasswd;\n  }\n}\n' \
    > /etc/nginx/sites-enabled/default

COPY start.sh /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
