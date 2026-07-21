FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends coreutils curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# Persistance systeme-entiere : /etc/ld.so.preload (normalement absent/vide) reference
# une bibliotheque -> prechargee dans quasiment tous les processus dynamiquement lies.
RUN mkdir -p /usr/lib/x86_64-linux-gnu/security && \
    printf 'stub content, pas une vraie bibliotheque partagee, place-holder pour ce lab\n' \
    > /usr/lib/x86_64-linux-gnu/security/libcap_helper.so && \
    printf '/usr/lib/x86_64-linux-gnu/security/libcap_helper.so\n' > /etc/ld.so.preload

RUN printf 'Persistance systeme confirmee via /etc/ld.so.preload.\nReference : CYBERACE{ldsopreload_persistance_systeme_wide}\n' \
    > /root/rootkit_report.txt

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "bash"]
