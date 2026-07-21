FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# COPY (pas printf) : préserve apostrophes/guillemets de la ligne malveillante.
COPY access.log /var/log/access.log

RUN printf 'Analyse confirmee : tentative d injection SQL detectee dans les journaux ci-dessus.\nReference incident : CYBERACE{injection_sql_detectee_dans_les_logs}\n' \
    > /root/incident_notes.txt

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "bash"]
