FROM ghcr.io/digininja/dvwa:latest

USER root
# iproute2 : route post-démarrage webapp→internal. cron : vecteur de privesc
# locale (tâche root world-writable). openssh-client : rebond SSH vers le
# fileserver interne (mouvement latéral).
RUN apt-get update && apt-get install -y --no-install-recommends \
      iproute2 cron openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Clé privée de backup-svc, VOLONTAIREMENT mal protégée (644, lisible www-data) :
# récupérable via la RCE applicative, elle ouvre le rebond vers le fileserver.
COPY id_rsa /var/www/.ssh/id_rsa
# Tâche cron root + script world-writable (privesc locale).
COPY backup.sh /usr/local/bin/backup.sh
COPY cron-backup /etc/cron.d/novabank-backup
COPY webapp-entrypoint.sh /webapp-entrypoint.sh

RUN chmod 644 /var/www/.ssh/id_rsa \
    && chown -R www-data:www-data /var/www/.ssh \
    && chmod 0777 /usr/local/bin/backup.sh \
    && chmod 0644 /etc/cron.d/novabank-backup \
    && chmod +x /webapp-entrypoint.sh

# NB : on NE remplace PAS config.inc.php — DVWA lit toute sa config (DB, niveau
# de sécurité) depuis l'environnement (DB_SERVER, DEFAULT_SECURITY_LEVEL, …).
ENTRYPOINT ["/webapp-entrypoint.sh"]
