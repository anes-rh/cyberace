FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends iputils-ping \
    && rm -rf /var/lib/apt/lists/*

COPY exfil.sh /exfil.sh
RUN chmod +x /exfil.sh

ENTRYPOINT ["/exfil.sh"]
