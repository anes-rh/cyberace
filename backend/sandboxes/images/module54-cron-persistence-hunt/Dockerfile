FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends coreutils curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# On retire les crons par defaut de l'image (ex. e2scrub_all) pour ne garder QUE
# les deux taches du scenario ("deux taches planifiees" du briefing).
RUN rm -f /etc/cron.d/*

# Tache legitime (sauvegarde) + tache suspecte (charge base64). L'encodage est
# calcule DYNAMIQUEMENT par l'outil base64 au build (garantit l'exactitude du flag).
RUN printf '0 2 * * * root /usr/local/bin/backup.sh\n' > /etc/cron.d/backup-daily

RUN B64=$(printf 'CYBERACE{persistance_cron_payload_encode_en_base64}' | base64 -w0) && \
    printf '*/5 * * * * root echo %s | base64 -d\n' "$B64" > /etc/cron.d/system-check

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "bash"]
