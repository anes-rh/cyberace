# Poste d'attaque de « Pipeline Fantôme » (réseau dmz). Le joueur part d'ici :
# il clone le dépôt Git public de gitserver, fouille l'historique, puis pivote
# par SSH vers gitserver (dual-homed dmz+internal) pour opérer sur le réseau
# interne. Outils volontairement classiques : git, ssh, curl, base64, jq.
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      git openssh-client curl ca-certificates jq coreutils \
      iproute2 dnsutils netcat-openbsd sshpass \
    && rm -rf /var/lib/apt/lists/*

# ttyd : terminal web du lab (même binaire éprouvé que les autres projets).
RUN curl -fsSL -o /usr/local/bin/ttyd \
      https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

COPY motd.txt /etc/motd
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7681
ENTRYPOINT ["/entrypoint.sh"]
