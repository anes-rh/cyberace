#!/bin/sh
# Démarre MinIO avec un root = paire IAM dérivée du suffixe de session (identique
# à celle servie par cloud-meta), puis amorce le bucket confidential-reports avec
# le rapport = flag final.
SUFFIX="${FLAG_SUFFIX:-static0}"
export MINIO_ROOT_USER="AKIAGHOST${SUFFIX}"
export MINIO_ROOT_PASSWORD="wJalr${SUFFIX}PIPELINEftKEY"
mkdir -p /data

minio server /data --address ":9000" --console-address ":9001" &
MPID=$!

# Attente de disponibilité puis amorçage du bucket.
for i in $(seq 1 60); do
  if mc alias set local "http://127.0.0.1:9000" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
mc mb -p local/confidential-reports >/dev/null 2>&1 || true
echo "GHOST{pipeline_fantome_supply_chain}_${SUFFIX}" > /tmp/report.txt
mc cp /tmp/report.txt local/confidential-reports/report.txt >/dev/null 2>&1 || true
rm -f /tmp/report.txt
echo "[cloud-storage] bucket confidential-reports prêt (root=${MINIO_ROOT_USER})"

wait "$MPID"
