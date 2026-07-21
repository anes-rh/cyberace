FROM debian:bookworm-20250630-slim
ENV DEBIAN_FRONTEND=noninteractive

# ncat : sinkhole C2. tcpdump+python3+curl : generation du pcap au build.
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash coreutils ncat tcpdump python3 curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# PCAP d'intrusion fige au build (User-Agent NovaRAT/2.1 pour l'objectif 2).
COPY generate_pcap.sh /tmp/generate_pcap.sh
RUN chmod +x /tmp/generate_pcap.sh && /tmp/generate_pcap.sh && rm /tmp/generate_pcap.sh

COPY iocgen.sh /usr/local/bin/iocgen.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /usr/local/bin/iocgen.sh /entrypoint.sh

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["/entrypoint.sh"]
