FROM debian:bookworm-20250630-slim
RUN apt-get update && apt-get install -y --no-install-recommends bind9 \
    && rm -rf /var/lib/apt/lists/*
RUN printf 'zone "cyberace.lab" {\n  type master;\n  file "/etc/bind/db.cyberace.lab";\n  allow-transfer { any; };\n};\n' \
    >> /etc/bind/named.conf.local
RUN printf '$TTL 3600\n@ IN SOA ns1.cyberace.lab. admin.cyberace.lab. (1 3600 1800 604800 3600)\n@ IN NS ns1.cyberace.lab.\nns1 IN A 127.0.0.1\nwww IN A 127.0.0.1\nsecret-vault IN A 127.0.0.1\nflag IN TXT "CYBERACE{transfert_de_zone_jamais_autorise}"\n' \
    > /etc/bind/db.cyberace.lab
# BIND (named -u bind) doit pouvoir lire le fichier de zone.
RUN chown bind:bind /etc/bind/db.cyberace.lab && chmod 644 /etc/bind/db.cyberace.lab
EXPOSE 53/tcp 53/udp
CMD ["named", "-g", "-u", "bind"]
