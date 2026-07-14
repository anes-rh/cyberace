FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /srv/www && \
    printf '<html><!-- config: voir config.php pour les parametres de connexion --><body><h1>Portail interne</h1></body></html>' \
    > /srv/www/index.html && \
    printf '<?php $db_pass = "CYBERACE{fichier_bak_oublie_sur_le_serveur}"; ?>' \
    > /srv/www/config.php.bak

WORKDIR /srv/www
EXPOSE 8080
CMD ["python3", "-m", "http.server", "8080"]
