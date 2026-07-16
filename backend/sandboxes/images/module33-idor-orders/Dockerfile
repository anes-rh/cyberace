FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /srv/www/api/orders && \
    printf '<html><body>Suivi de commande : /api/orders/VOTRE_NUMERO.json</body></html>' \
    > /srv/www/index.html && \
    printf '{"id":1001,"owner":"visiteur_test","item":"Stylo","status":"livre"}' \
    > /srv/www/api/orders/1001.json && \
    printf '{"id":1002,"owner":"admin_direction","item":"Dossier confidentiel","note":"CYBERACE{idor_objet_reference_directe}"}' \
    > /srv/www/api/orders/1002.json

WORKDIR /srv/www
EXPOSE 8080
CMD ["python3", "-m", "http.server", "8080"]
