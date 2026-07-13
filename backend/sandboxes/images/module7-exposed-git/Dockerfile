FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 git \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /srv/www && cd /srv/www && \
    git init -q && \
    git config user.email "dev@cyberace.local" && \
    git config user.name "Dev" && \
    echo "<html><body><h1>Portail interne</h1></body></html>" > index.html && \
    printf 'API_KEY=CYBERACE{git_historique_jamais_efface}\nENV=prod\n' > config.env && \
    git add . && git commit -q -m "Initial commit avec config" && \
    printf 'ENV=prod\n' > config.env && \
    git add . && git commit -q -m "Retrait de la cle API du fichier de config (oups, trop tard)"

WORKDIR /srv/www
EXPOSE 8080
CMD ["python3", "-m", "http.server", "8080"]
