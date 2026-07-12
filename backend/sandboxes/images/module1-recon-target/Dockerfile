# Image de base ÉPINGLÉE (pas "debian:bookworm-slim" nu) pour que la bannière
# OpenSSH exposée par -sV reste stable dans le temps — un tag flottant ferait
# dériver la version affichée et casserait la pédagogie du module.
FROM debian:bookworm-20250630-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server \
    vsftpd \
    python3 \
    ncat \
    && rm -rf /var/lib/apt/lists/*
# --- SSH (port 22) : juste pour la bannière/version, pas de login nécessaire ---
RUN mkdir -p /run/sshd && ssh-keygen -A
# --- FTP anonyme (port 21) avec un flag dedans ---
RUN mkdir -p /srv/ftp && \
    echo "CYBERACE{ftp_anonyme_jamais_par_defaut}" > /srv/ftp/flag1.txt && \
    sed -i 's/^anonymous_enable=NO/anonymous_enable=YES/' /etc/vsftpd.conf && \
    echo "anon_root=/srv/ftp" >> /etc/vsftpd.conf && \
    echo "no_anon_password=YES" >> /etc/vsftpd.conf
# --- Web (port 8080) avec robots.txt piégé ---
RUN mkdir -p /srv/www/admin-9f21 && \
    echo "<html><body><h1>Serveur interne</h1></body></html>" > /srv/www/index.html && \
    echo -e "User-agent: *\nDisallow: /admin-9f21/" > /srv/www/robots.txt && \
    echo "CYBERACE{robots_txt_liste_pas_interdit}" > /srv/www/admin-9f21/index.html
# --- Port caché (47831) : un service qui balance le 3e flag à la connexion ---
RUN mkdir -p /srv/hidden && \
    echo "CYBERACE{p_tiret_scanne_tout}" > /srv/hidden/flag3.txt
COPY start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE 22 21 8080 47831
ENTRYPOINT ["/start.sh"]
