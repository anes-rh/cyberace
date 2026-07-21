FROM debian:bookworm-20250630-slim
ENV DEBIAN_FRONTEND=noninteractive

# Poste d'analyse SOC : yara (regles), tcpdump (lecture pcap), jq/grep/gawk
# (parsing de logs). tcpdump plutot que tshark : meme capacite pour lire le
# User-Agent du pcap, bien plus leger sur le disque de la VM.
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash coreutils yara tcpdump jq curl ca-certificates iproute2 procps grep gawk \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# Dossier d'echantillons : 1 malveillant (marqueur unique) + 3 legitimes qui
# partagent des idiomes shell (while/sleep/curl) pour piéger les regles trop larges.
RUN mkdir -p /opt/samples
COPY malware_sample /opt/samples/malware_sample
COPY benign1 /opt/samples/benign1
COPY benign2 /opt/samples/benign2
COPY benign3 /opt/samples/benign3
RUN chmod 644 /opt/samples/*

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "-W", "bash"]
