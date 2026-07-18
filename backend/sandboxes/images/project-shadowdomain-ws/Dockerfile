FROM debian:bookworm-slim

# Poste utilisateur, cible finale du pass-the-hash. Compte local « Administrator »
# dont le mot de passe dérive de FLAG_SUFFIX — IDENTIQUE à celui du DC, donc même
# hash NTLM : le hash récupéré par DCSync authentifie ici en pass-the-hash. Un
# partage réservé à Administrator contient le flag de session.
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      samba smbclient procps iproute2 \
    && rm -rf /var/lib/apt/lists/*

COPY smb.conf /etc/samba/smb.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 139 445
ENTRYPOINT ["/entrypoint.sh"]
