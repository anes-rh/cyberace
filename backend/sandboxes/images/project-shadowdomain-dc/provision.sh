#!/bin/bash
# Provisionne un contrôleur de domaine Active Directory (Samba4) « corp.local »
# avec des faiblesses VOLONTAIRES : LDAP anonyme, un compte sans pré-auth
# Kerberos (AS-REP roastable), un compte de service avec SPN (Kerberoastable),
# et une ACL GenericAll (abus d'ACL → Domain Admins). Le mot de passe
# Administrator intègre FLAG_SUFFIX : son hash NTLM (récupéré par DCSync) diffère
# donc à chaque session (anti write-up). Puis démarre Samba au premier plan.
set -e

SUFFIX="${FLAG_SUFFIX:-static0}"
ADMINPW="Corp!${SUFFIX}Aa1"          # complexité AD (Maj/min/chiffre/spécial)
REALM="CORP.LOCAL"
DOMAIN="CORP"
BASE="DC=corp,DC=local"
SAMDB="/var/lib/samba/private/sam.ldb"

# Nom d'hôte stable (le DC y est sensible) + auto-résolution sur sa VRAIE IP.
# CRUCIAL : un DC Samba lie ses services (LDAP/SMB/Kerberos) à l'IP à laquelle
# son propre nom résout. Une entrée 127.0.1.1 le ferait écouter sur loopback →
# injoignable depuis le réseau. On pointe donc dc01 vers son IP réseau (eth de
# la topologie). CAP_SYS_ADMIN (fixé sur le nœud) est requis pour `hostname` et
# pour écrire les ACL NT (security.NTACL) du SYSVOL au provisioning.
hostname dc01 2>/dev/null || true
MYIP=$(ip -o -4 addr show scope global 2>/dev/null | awk '{print $4}' | cut -d/ -f1 | head -1)
[ -z "$MYIP" ] && MYIP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$MYIP" ] && MYIP=10.50.0.20
sed -i '/dc01.corp.local/d' /etc/hosts 2>/dev/null || true
echo "$MYIP dc01.corp.local dc01" >> /etc/hosts

if [ ! -f "$SAMDB" ]; then
  rm -f /etc/samba/smb.conf
  samba-tool domain provision \
    --realm="$REALM" --domain="$DOMAIN" --server-role=dc \
    --use-rfc2307 --adminpass="$ADMINPW" --host-name=dc01 \
    --option="dns forwarder = 8.8.8.8" > /var/log/provision.log 2>&1

  # [global] : RC4 autorisé (AS-REP/Kerberoast → hashes hashcat 18200/13100),
  # binds LDAP simples/anonymes autorisés, journalisation d'audit d'auth.
  awk '/^\[global\]/{
        print;
        print "        allow weak crypto = yes";
        print "        ldap server require strong auth = no";
        print "        log level = 1 auth_audit:3 auth_json_audit:3";
        next
      }1' /etc/samba/smb.conf > /tmp/smb.conf && mv /tmp/smb.conf /etc/samba/smb.conf

  ln -sf /var/lib/samba/private/krb5.conf /etc/krb5.conf

  # Bind LDAP ANONYME (faiblesse de départ) : dSHeuristics, 7e caractère = 2.
  ldbmodify -H "$SAMDB" >/dev/null 2>&1 <<LDIF || true
dn: CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,${BASE}
changetype: modify
replace: dSHeuristics
dSHeuristics: 0000002
LDIF

  # Utilisateurs « normaux » (pour le décompte d'énumération).
  for u in alice.dupont bob.martin carol.durand dave.lefevre; do
    samba-tool user create "$u" 'Welcome@2024' >/dev/null 2>&1 || true
  done

  # Compte SANS pré-authentification Kerberos (AS-REP roastable). Mot de passe
  # FAIBLE (présent dans la wordlist de l'attaquant → crackable offline).
  samba-tool user create svc-backup 'Summer2024!' >/dev/null 2>&1 || true
  printf 'dn: CN=svc-backup,CN=Users,%s\nchangetype: modify\nreplace: userAccountControl\nuserAccountControl: 4260352\n' "$BASE" \
    | ldbmodify -H "$SAMDB" >/dev/null 2>&1 || true

  # Compte de service avec SPN (Kerberoastable), mot de passe faible.
  samba-tool user create svc-sql 'Password1' >/dev/null 2>&1 || true
  samba-tool spn add MSSQLSvc/files01.corp.local:1433 svc-sql >/dev/null 2>&1 || true

  # ACL : svc-sql obtient GenericAll sur « Domain Admins » (chemin d'abus d'ACL :
  # une fois svc-sql craqué, l'attaquant s'ajoute à ce groupe → Domain Admin).
  SID=$(samba-tool user show svc-sql --attributes=objectSid 2>/dev/null | awk -F': ' '/objectSid/{print $2}')
  if [ -n "$SID" ]; then
    samba-tool dsacl set --objectdn="CN=Domain Admins,CN=Users,$BASE" --sddl="(A;;GA;;;$SID)" >/dev/null 2>&1 || true
  fi

  # « Coffre » d'identifiants réservé aux Domain Admins : le hash NTLM de
  # Administrator (dérivé de FLAG_SUFFIX → dynamique par session) et le flag de
  # domination du domaine. Une fois Domain Admin, l'attaquant l'exfiltre par SMB
  # (équivalent DCSync dans cet environnement Samba). Le hash sert au
  # pass-the-hash final vers ws01.
  # Hash NTLM = MD4(UTF-16LE(mot de passe)). OpenSSL 3 / hashlib désactivent MD4 ;
  # on passe par pycryptodome (fiable). Le mot de passe transite par l'env pour
  # éviter tout souci de quoting.
  # NB : python3-pycryptodome expose l'espace de noms « Cryptodome » (pas
  # « Crypto »). `|| echo ""` évite qu'un échec fasse sortir le script (set -e).
  NTHASH=$(ADMINPW="$ADMINPW" python3 -c "import os,binascii;from Cryptodome.Hash import MD4;print(binascii.hexlify(MD4.new(os.environ['ADMINPW'].encode('utf-16-le')).digest()).decode())" 2>/dev/null || echo "")
  mkdir -p /srv/creds
  echo "Administrator:500:aad3b435b51404eeaad3b435b51404ee:${NTHASH}:::" > /srv/creds/ntds_dump.txt
  echo "SHADOW{domain_dominance_dcsync}_${SUFFIX}" > /srv/creds/domain_flag.txt
  # Lisibles au niveau FICHIER (l'accès est verrouillé au niveau du PARTAGE SMB
  # par `valid users = @"Domain Admins"`) : sinon l'utilisateur mappé par Samba,
  # une fois autorisé sur le partage, ne peut pas ouvrir le fichier.
  chmod 0755 /srv/creds && chmod 0644 /srv/creds/* 2>/dev/null || true
  cat >> /etc/samba/smb.conf <<CONF

[creds]
   comment = Coffre d'identifiants (Domain Admins uniquement)
   path = /srv/creds
   valid users = @"Domain Admins"
   read only = yes
   browseable = yes
CONF
fi

exec samba -i
