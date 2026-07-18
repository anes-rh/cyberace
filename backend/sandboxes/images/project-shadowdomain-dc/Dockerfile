# Ubuntu 24.04 → Samba 4.19 : le KDC honore DONT_REQ_PREAUTH (AS-REP roasting) et
# la réplication DRSUAPI est compatible impacket (Kerberoasting / DCSync), ce qui
# n'était pas le cas de Samba 4.17 (Debian bookworm).
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      samba samba-common-bin samba-dsdb-modules samba-vfs-modules samba-ad-provision \
      krb5-user ldb-tools ldap-utils smbclient winbind \
      python3 python3-pycryptodome procps iproute2 dnsutils \
    && rm -rf /var/lib/apt/lists/*

COPY provision.sh /provision.sh
RUN chmod +x /provision.sh

# DNS, Kerberos, LDAP(S), SMB, Global Catalog.
EXPOSE 53/udp 53/tcp 88/udp 88/tcp 135 139 389/udp 389/tcp 445 464/udp 464/tcp 636 3268 3269
ENTRYPOINT ["/provision.sh"]
