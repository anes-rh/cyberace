FROM debian:bookworm-20250630-slim
RUN apt-get update && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/*
RUN printf 'server {\n  listen 8080 default_server;\n  location / { return 200 "Portail public - rien a voir ici.\\n"; }\n}\n' \
    > /etc/nginx/sites-enabled/00-default
RUN printf 'server {\n  listen 8080;\n  server_name portail-admin.cyberace.internal;\n  location / { return 200 "CYBERACE{vhost_cache_jamais_vraiment_prive}\\n"; }\n}\n' \
    > /etc/nginx/sites-enabled/01-hidden
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
