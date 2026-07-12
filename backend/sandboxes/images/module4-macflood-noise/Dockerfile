FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends dsniff \
    && rm -rf /var/lib/apt/lists/*

COPY flood.sh /flood.sh
RUN chmod +x /flood.sh

ENTRYPOINT ["/flood.sh"]
