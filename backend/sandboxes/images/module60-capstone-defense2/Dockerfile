FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    coreutils procps iptables tcpdump curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# --- Artefact 1 : persistance via ld.so.preload (principe du Module 56) ---
RUN mkdir -p /usr/lib/x86_64-linux-gnu/security && \
    printf 'stub content, pas une vraie bibliotheque partagee, place-holder pour ce lab\n' \
    > /usr/lib/x86_64-linux-gnu/security/libcap_helper.so && \
    printf '/usr/lib/x86_64-linux-gnu/security/libcap_helper.so\n' > /etc/ld.so.preload

RUN printf 'Investigation complete : persistance ld.so.preload et processus masquerade confirmes.\nHote 10.70.0.30 egalement mis en quarantaine suite a une usurpation ARP active.\nReference finale : CYBERACE{investigation_defense_multi_vecteurs}\n' \
    > /root/final_report.txt

# --- Artefact 2 : processus masquerading, lance par start.sh (principe du Module 55) ---
COPY start.sh /start.sh
RUN chmod +x /start.sh

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["/start.sh"]
