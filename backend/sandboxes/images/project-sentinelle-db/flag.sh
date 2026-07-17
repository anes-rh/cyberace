#!/bin/bash
# Insère le flag d'exfiltration au premier démarrage, en incorporant le suffixe
# de session (FLAG_SUFFIX injecté par l'orchestrateur). Exécuté par l'entrypoint
# MySQL après 01-schema.sql (ordre alphabétique), serveur déjà up sur le socket.
set -e
SUFFIX="${FLAG_SUFFIX:-static}"
mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE:-dvwa}" <<SQL
INSERT INTO secrets (id, name, flag)
VALUES (1, 'novabank_master_key', 'NOVA{sqli_union_bypass_waf_exfil}_${SUFFIX}');
SQL
echo "[flag.sh] flag d'exfiltration inséré (suffixe ${SUFFIX})."
