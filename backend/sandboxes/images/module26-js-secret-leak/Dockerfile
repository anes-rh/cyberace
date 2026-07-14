FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /srv/www/js && \
    printf '<html><head><script src="js/app.js"></script></head><body><h1>Tableau de bord</h1></body></html>' \
    > /srv/www/index.html && \
    printf '// TODO: retirer avant la mise en prod - cle temporaire de staging\nconst STAGING_API_KEY = "CYBERACE{cle_api_dans_le_js_cote_client}";\nfunction loadDashboard() {\n  fetch("/api/dashboard", { headers: { Authorization: STAGING_API_KEY } });\n}\n' \
    > /srv/www/js/app.js

WORKDIR /srv/www
EXPOSE 8080
CMD ["python3", "-m", "http.server", "8080"]
