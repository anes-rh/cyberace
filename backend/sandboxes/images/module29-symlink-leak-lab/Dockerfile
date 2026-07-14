FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    cron curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ttyd épinglé (1.7.7) pour la reproductibilité — asset x86_64 (linux/amd64).
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

RUN useradd -m -s /bin/bash stagiaire

RUN printf '#!/bin/bash\necho "Rapport interne : token=CYBERACE{symlink_predictible_fuite_de_donnees}" > /tmp/status_report.tmp\n' \
    > /opt/status_check.sh && chmod 755 /opt/status_check.sh

RUN echo "* * * * * root /opt/status_check.sh" > /etc/cron.d/status && chmod 644 /etc/cron.d/status

WORKDIR /home/stagiaire
EXPOSE 7681
COPY start.sh /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
