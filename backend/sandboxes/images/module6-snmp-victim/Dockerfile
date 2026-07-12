FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends snmp \
    && rm -rf /var/lib/apt/lists/*

COPY probe.sh /probe.sh
RUN chmod +x /probe.sh

ENTRYPOINT ["/probe.sh"]
