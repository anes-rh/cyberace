FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends memcached netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY start.sh /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
