FROM debian:bookworm-slim

# Poste d'attaque « assumed breach » : boîte à outils Active Directory.
#  - impacket (GetNPUsers, GetUserSPNs, secretsdump, …) + netexec (ex-cme)
#  - hashcat (CPU) pour le craquage offline AS-REP / Kerberoast
#  - ldap-utils / smbclient / krb5-user pour l'énumération et l'auth
#  - kerbrute (binaire) pour l'énumération d'utilisateurs Kerberos
#  - ttyd pour le terminal web du lab
ENV DEBIAN_FRONTEND=noninteractive
# pocl-opencl-icd : runtime OpenCL CPU indispensable pour que hashcat calcule
# (la VM n'a pas de GPU ; sans lui hashcat ne trouve aucun périphérique).
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip python3-dev \
      ldap-utils smbclient krb5-user hashcat pocl-opencl-icd ocl-icd-libopencl1 \
      curl ca-certificates iproute2 dnsutils netcat-openbsd git build-essential \
    && rm -rf /var/lib/apt/lists/*

# impacket via pip (PEP 668 : --break-system-packages) — GetNPUsers, GetUserSPNs,
# secretsdump (DCSync). L'auth de validation côté serveur passe par ldapwhoami /
# smbclient (déjà présents), pas besoin de netexec.
RUN pip3 install --no-cache-dir --break-system-packages impacket

# kerbrute (énumération d'utilisateurs Kerberos) + ttyd (terminal web).
RUN curl -fsSL -o /usr/local/bin/kerbrute \
      https://github.com/ropnop/kerbrute/releases/download/v1.0.3/kerbrute_linux_amd64 \
    && chmod +x /usr/local/bin/kerbrute \
    && curl -fsSL -o /usr/local/bin/ttyd \
      https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# Wordlist RÉDUITE fournie (contient les mots de passe faibles du domaine +
# des leurres) et une liste d'utilisateurs pour kerbrute.
COPY wordlist.txt /opt/wordlist.txt
COPY users.txt /opt/users.txt
COPY loot.txt /opt/loot.txt
COPY motd.txt /etc/motd

# Kerberos pointera sur le DC (realm CORP.LOCAL) — généré au démarrage du lab.
COPY attacker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7681
ENTRYPOINT ["/entrypoint.sh"]
