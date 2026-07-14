FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    cron curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ttyd épinglé (1.7.7) pour la reproductibilité — asset x86_64 (linux/amd64).
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

RUN useradd -m -s /bin/bash stagiaire

RUN mkdir -p /var/backups/data /opt/backup && chmod 777 /var/backups/data

RUN printf '#!/bin/bash\ncd /var/backups/data && tar czf /var/backups/archive.tar.gz *\n' \
    > /opt/backup/archive.sh && chmod 755 /opt/backup/archive.sh

RUN echo "* * * * * root /opt/backup/archive.sh" > /etc/cron.d/archive && chmod 644 /etc/cron.d/archive

RUN echo "CYBERACE{tar_wildcard_injection_cron_racine}" > /root/flag.txt && chmod 600 /root/flag.txt

WORKDIR /home/stagiaire
EXPOSE 7681
COPY start.sh /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
