FROM debian:bookworm-20250630-slim
RUN apt-get update && apt-get install -y --no-install-recommends nginx openssl \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -newkey rsa:2048 -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem -days 365 -nodes \
    -subj "/CN=portail.cyberace.internal" \
    -addext "subjectAltName=DNS:portail.cyberace.internal,DNS:api-interne-v2.cyberace.internal,DNS:cyberace.internal"
RUN printf 'server {\n  listen 8443 ssl default_server;\n  ssl_certificate /etc/nginx/ssl/cert.pem;\n  ssl_certificate_key /etc/nginx/ssl/key.pem;\n  location / { return 200 "Portail public.\\n"; }\n}\n' \
    > /etc/nginx/sites-enabled/00-default
RUN printf 'server {\n  listen 8443 ssl;\n  server_name api-interne-v2.cyberace.internal;\n  ssl_certificate /etc/nginx/ssl/cert.pem;\n  ssl_certificate_key /etc/nginx/ssl/key.pem;\n  location / { return 200 "CYBERACE{cert_san_expose_sous_domaine_cache}\\n"; }\n}\n' \
    > /etc/nginx/sites-enabled/01-hidden
EXPOSE 8443
CMD ["nginx", "-g", "daemon off;"]
