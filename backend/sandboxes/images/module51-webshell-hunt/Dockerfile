FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends coreutils grep curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

RUN mkdir -p /var/www/html/inc && \
    printf 'Page d accueil du site.\n' > /var/www/html/index.php && \
    printf 'Page a propos.\n' > /var/www/html/about.php && \
    printf 'Page de contact.\n' > /var/www/html/contact.php && \
    printf 'Fonctions utilitaires diverses.\n' > /var/www/html/inc/functions.php

# COPY (pas printf) : cache.php contient de vraies apostrophes ($_REQUEST['cmd']).
COPY cache.php /var/www/html/inc/cache.php

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "bash"]
