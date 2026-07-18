FROM debian:bookworm-slim

# Serveur de fichiers « membre du domaine ». Pour rester robuste en conteneur
# éphémère (la jointure AD d'un membre Samba est fragile), on reproduit
# localement le compte de service Kerberoastable (svc-sql, même mot de passe que
# dans l'annuaire) : l'authentification SMB avec les identifiants craqués réussit
# donc à l'identique. Un partage « finance » n'est lisible qu'avec ce compte.
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      samba smbclient procps iproute2 \
    && rm -rf /var/lib/apt/lists/*

COPY smb.conf /etc/samba/smb.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 139 445
ENTRYPOINT ["/entrypoint.sh"]
