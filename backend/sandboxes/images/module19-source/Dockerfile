FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-client curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ttyd épinglé (1.7.7) pour la reproductibilité — asset x86_64 (linux/amd64).
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

RUN useradd -m -s /bin/bash stagiaire

# Clé privée de déploiement oubliée, lisible par tous (générée localement — voir README.md).
COPY deploy_key /opt/backup/deploy_key
RUN chmod 644 /opt/backup/deploy_key

WORKDIR /home/stagiaire
EXPOSE 7681
# -W rend le terminal saisissable (sinon ttyd est en lecture seule).
ENTRYPOINT ["ttyd", "-p", "7681", "-W", "su", "-", "stagiaire"]
