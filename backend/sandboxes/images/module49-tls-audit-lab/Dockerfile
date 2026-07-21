FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends openssl python3 curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# Certificat AUTO-SIGNE : CN usurpant une marque bancaire + 2e domaine dans la SAN.
RUN mkdir -p /etc/tlsaudit && \
    openssl req -x509 -newkey rsa:2048 -keyout /etc/tlsaudit/key.pem \
    -out /etc/tlsaudit/cert.pem -days 30 -nodes \
    -subj "/CN=secure-login.mabanque-exemple.dz/O=MaBanque Securite" \
    -addext "subjectAltName=DNS:secure-login.mabanque-exemple.dz,DNS:payload-drop.cyberace-attaquant.lab"

COPY serve_tls.py /opt/serve_tls.py
COPY start.sh /start.sh
RUN chmod +x /start.sh

RUN printf 'Audit termine : ce certificat autosigne usurpe un nom de marque bancaire\net contient un second domaine suspect dans sa liste SAN.\nReference : CYBERACE{certificat_autosigne_usurpation_de_marque}\n' \
    > /root/audit_report.txt

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["/start.sh"]
