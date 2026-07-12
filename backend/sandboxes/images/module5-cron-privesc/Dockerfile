FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    cron curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ttyd épinglé (1.7.7) pour la reproductibilité — asset x86_64 (linux/amd64).
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# --- Groupe et utilisateur ---
# "maintainers" est censé être réservé aux scripts d'admin système ; stagiaire
# y a été ajouté par erreur (narrative : "un accès temporaire jamais retiré").
RUN groupadd maintainers && \
    useradd -m -s /bin/bash -G maintainers stagiaire

# --- Script exécuté par root via cron, mais modifiable par le groupe maintainers ---
RUN mkdir -p /opt/maintenance && \
    printf '#!/bin/bash\necho "Nettoyage des anciens logs..." >> /var/log/cleanup.log\n' \
    > /opt/maintenance/cleanup-logs.sh && \
    chown root:maintainers /opt/maintenance/cleanup-logs.sh && \
    chmod 664 /opt/maintenance/cleanup-logs.sh && \
    touch /var/log/cleanup.log && chmod 666 /var/log/cleanup.log

# --- Tâche cron système, toutes les minutes, en root ---
RUN echo "* * * * * root /opt/maintenance/cleanup-logs.sh" > /etc/cron.d/cleanup-logs && \
    chmod 644 /etc/cron.d/cleanup-logs

# --- Flag racine ---
RUN echo "CYBERACE{cron_ecriture_groupe_racine}" > /root/flag.txt && chmod 600 /root/flag.txt

WORKDIR /home/stagiaire
EXPOSE 7681
# cron doit tourner en arrière-plan pendant que ttyd sert le terminal : on les
# lance tous les deux depuis un petit script d'entrée plutôt qu'un ENTRYPOINT
# unique, pour garder les deux processus vivants.
COPY start.sh /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
