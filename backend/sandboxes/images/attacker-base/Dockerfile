FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    nmap \
    ncat \
    curl \
    ftp \
    iputils-ping \
    dnsutils \
    ca-certificates \
    dsniff \
    tcpdump \
    iproute2 \
    && rm -rf /var/lib/apt/lists/*
# ttyd : terminal web. Binaire précompilé (pas de paquet Debian officiel).
# Version épinglée (1.7.7) pour la reproductibilité — le tag "latest" ferait
# dériver le binaire dans le temps. Asset x86_64 (la machine de dev + Docker
# Desktop tournent en linux/amd64).
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd
WORKDIR /root
EXPOSE 7681
# -W = writable : autorise la saisie clavier dans le terminal web.
ENTRYPOINT ["ttyd", "-p", "7681", "-W", "bash"]
