FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends coreutils procps curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

RUN printf 'Investigation terminee : processus masquerade confirme via /proc/PID/exe.\nReference : CYBERACE{processus_masquerade_confirme_par_proc_exe}\n' \
    > /root/masquerade_report.txt

COPY start.sh /start.sh
RUN chmod +x /start.sh

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["/start.sh"]
