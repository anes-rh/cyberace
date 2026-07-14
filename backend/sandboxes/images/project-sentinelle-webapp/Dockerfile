FROM ghcr.io/digininja/dvwa:latest

USER root
# iproute2 : indispensable pour la route post-démarrage webapp -> internal.
RUN apt-get update && apt-get install -y --no-install-recommends iproute2 \
    && rm -rf /var/lib/apt/lists/*

# NB : on NE remplace PAS config.inc.php — le config d'origine de l'image lit
# déjà toute la connexion DB, le DBMS et le niveau de sécurité depuis les
# variables d'environnement (DB_SERVER, DEFAULT_SECURITY_LEVEL, …) et définit
# les constantes internes de DVWA (MYSQL/SQLI_DB). Tout se passe via `env`.
