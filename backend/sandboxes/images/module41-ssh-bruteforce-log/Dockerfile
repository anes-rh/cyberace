FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    coreutils grep gawk curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ttyd épinglé 1.7.7 (asset x86_64 éprouvé sur la VM ; évite une dérive de "latest").
RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

COPY generate_log.sh /tmp/generate_log.sh
RUN chmod +x /tmp/generate_log.sh && /tmp/generate_log.sh > /var/log/auth.log && rm /tmp/generate_log.sh

RUN chmod 644 /var/log/auth.log

# Flag d'incident lu à la tâche 7 (doit matcher mot pour mot).
RUN echo "CYBERACE{bruteforce_reussi_identifie_par_correlation}" > /root/incident_flag.txt

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "bash"]
