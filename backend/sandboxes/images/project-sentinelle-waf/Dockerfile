FROM owasp/modsecurity-crs:nginx

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash iproute2 curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ttyd : terminal web pour éditer la config CRS et recharger nginx.
# --cacert explicite : l'image CRS définit un CURL_CA_BUNDLE qui casse le TLS
# de curl par défaut (erreur 77) ; on pointe le bundle réellement installé.
RUN curl -fL --cacert /etc/ssl/certs/ca-certificates.crt \
    -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

COPY waf-entrypoint.sh /waf-entrypoint.sh
RUN chmod +x /waf-entrypoint.sh

EXPOSE 7681
ENTRYPOINT ["/waf-entrypoint.sh"]
