FROM debian:bookworm-20250630-slim

COPY logbeat.sh /logbeat.sh
RUN chmod +x /logbeat.sh

ENTRYPOINT ["/logbeat.sh"]
