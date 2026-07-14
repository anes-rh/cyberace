FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/*

RUN printf 'server {\n  listen 8080;\n  location /admin-panel/ {\n    if ($request_method = GET) {\n      return 403;\n    }\n    return 200 "CYBERACE{verbe_http_change_contourne_le_filtre}\\n";\n  }\n  location / {\n    return 200 "Portail public.\\n";\n  }\n}\n' \
    > /etc/nginx/sites-enabled/default

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
