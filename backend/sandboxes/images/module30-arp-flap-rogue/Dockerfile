FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends dsniff \
    && rm -rf /var/lib/apt/lists/*

COPY flap.sh /flap.sh
RUN chmod +x /flap.sh

ENTRYPOINT ["/flap.sh"]
