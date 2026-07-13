FROM debian:bookworm-20250630-slim
RUN apt-get update && apt-get install -y --no-install-recommends ncat \
    && rm -rf /var/lib/apt/lists/*
COPY scan.sh /scan.sh
RUN chmod +x /scan.sh
ENTRYPOINT ["/scan.sh"]
