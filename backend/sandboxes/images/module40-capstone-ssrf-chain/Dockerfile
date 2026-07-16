FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /srv/app
COPY preview.py /srv/app/preview.py
COPY admin_internal.py /srv/app/admin_internal.py
COPY start.sh /start.sh
RUN chmod +x /start.sh

WORKDIR /srv/app
EXPOSE 8080
ENTRYPOINT ["/start.sh"]
