FROM ghcr.io/digininja/dvwa:latest

USER root
# iproute2 : indispensable pour la route post-démarrage webapp -> internal.
RUN apt-get update && apt-get install -y --no-install-recommends iproute2 \
    && rm -rf /var/lib/apt/lists/*

# Config pointée vers la base externe (via env) + sécurité "low" par défaut :
# les vraies défenses de ce projet sont le firewall et le WAF, pas DVWA.
COPY config.inc.php /var/www/html/config/config.inc.php
