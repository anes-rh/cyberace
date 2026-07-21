FROM debian:bookworm-20250630-slim
ENV DEBIAN_FRONTEND=noninteractive

# procps (ps/pgrep), iproute2 (ss), iptables (confinement obj7), bash (/dev/tcp balise).
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash coreutils procps iproute2 iptables curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

COPY malware_sample /opt/malware_sample
COPY iocgen.sh /usr/local/bin/iocgen.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /opt/malware_sample /usr/local/bin/iocgen.sh /entrypoint.sh

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["/entrypoint.sh"]
