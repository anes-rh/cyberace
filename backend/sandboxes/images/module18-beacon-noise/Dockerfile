FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends ncat \
    && rm -rf /var/lib/apt/lists/*

COPY beacon.sh /beacon.sh
RUN chmod +x /beacon.sh

ENTRYPOINT ["/beacon.sh"]
