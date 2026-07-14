FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /srv/www/api/v1 && \
    printf '<html><body>Portail RH interne</body></html>' > /srv/www/index.html && \
    printf 'User-agent: *\nDisallow: /api/\n' > /srv/www/robots.txt && \
    printf '<?xml version="1.0" encoding="UTF-8"?>\n<urlset><url><loc>/api/v1/employees.json</loc></url></urlset>\n' \
    > /srv/www/sitemap.xml && \
    printf '{"employees":[{"name":"A. Ferhat","role":"IT","note":"temp_password=CYBERACE{api_json_expose_sans_auth}"},{"name":"S. Belkacem","role":"HR","note":"ok"}]}' \
    > /srv/www/api/v1/employees.json

WORKDIR /srv/www
EXPOSE 8080
CMD ["python3", "-m", "http.server", "8080"]
