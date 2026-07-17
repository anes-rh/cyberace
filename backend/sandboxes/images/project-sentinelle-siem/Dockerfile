FROM debian:bookworm-slim

# rsyslog (collecteur UDP 514) + iproute2 (réseau mgmt) + ttyd (terminal web
# d'analyse). ca-certificates/curl pour récupérer ttyd.
RUN apt-get update && apt-get install -y --no-install-recommends \
      rsyslog iproute2 curl ca-certificates procps \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fL -o /usr/local/bin/ttyd \
      https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

COPY rsyslog.conf /etc/rsyslog.d/10-siem.conf
COPY entrypoint.sh /entrypoint.sh
# Neutralise les inputs par défaut (imklog lit /proc/kmsg — absent/inutile en
# conteneur) pour ne garder que notre collecteur UDP.
RUN chmod +x /entrypoint.sh \
    && sed -i 's/^\(module(load="imklog")\)/#\1/' /etc/rsyslog.conf || true

EXPOSE 7681 514/udp
ENTRYPOINT ["/entrypoint.sh"]
