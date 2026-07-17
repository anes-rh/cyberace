FROM alpine:3.20

RUN apk add --no-cache nftables iproute2 bash curl ca-certificates tcpdump

# ttyd : binaire statique (fonctionne sur alpine/musl). Épinglé 1.7.7.
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# Ruleset de départ VOLONTAIREMENT permissif (l'étudiant doit le durcir).
COPY nftables-base.conf /etc/nftables-base.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7681
ENTRYPOINT ["/entrypoint.sh"]
