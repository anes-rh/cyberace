FROM mysql:8.0

# iproute (commande `ip`) : indispensable pour la route post-démarrage
# db -> dmz. mysql:8.0 = Oracle Linux (microdnf) ou Debian selon le tag.
RUN if command -v microdnf >/dev/null 2>&1; then \
      microdnf install -y iproute && microdnf clean all; \
    else \
      apt-get update && apt-get install -y --no-install-recommends iproute2 && rm -rf /var/lib/apt/lists/*; \
    fi

# Empreinte mémoire réduite (VM contrainte). chmod 644 : MySQL ignore tout
# fichier de config world-writable (la COPY depuis Windows le rend 0666).
COPY tuning.cnf /etc/mysql/conf.d/tuning.cnf
RUN chmod 644 /etc/mysql/conf.d/tuning.cnf
# Schéma DVWA + table `secrets` (01), puis insertion du flag avec le suffixe de
# session (02). L'ordre alphabétique garantit schéma avant insertion.
COPY init.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY flag.sh /docker-entrypoint-initdb.d/02-flag.sh
RUN chmod +x /docker-entrypoint-initdb.d/02-flag.sh
