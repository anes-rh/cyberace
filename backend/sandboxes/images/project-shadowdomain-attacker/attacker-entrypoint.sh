#!/bin/bash
# Résolution des hôtes du domaine + realm Kerberos (le lab est sur un réseau
# isolé sans DNS AD configuré côté client), puis terminal web.
grep -q dc01.corp.local /etc/hosts 2>/dev/null || cat >> /etc/hosts <<EOF
10.50.0.20 dc01.corp.local dc01 CORP.LOCAL
10.50.0.30 files01.corp.local files01
10.50.0.40 ws01.corp.local ws01
EOF

cat > /etc/krb5.conf <<EOF
[libdefaults]
    default_realm = CORP.LOCAL
    dns_lookup_realm = false
    dns_lookup_kdc = false
    rdns = false
[realms]
    CORP.LOCAL = {
        kdc = dc01.corp.local
        admin_server = dc01.corp.local
    }
[domain_realm]
    .corp.local = CORP.LOCAL
    corp.local = CORP.LOCAL
EOF

exec ttyd -p 7681 -W bash
