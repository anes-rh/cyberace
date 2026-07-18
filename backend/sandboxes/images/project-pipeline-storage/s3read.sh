#!/bin/sh
# Helper de validation obj6 (cred_check), exécuté SUR cloud-storage (qui embarque
# mc) : tente une auth S3 réelle avec les identifiants IAM SOUMIS ($1=access,
# $2=secret) contre le MinIO local et lit le rapport confidentiel. argv strict
# (jamais de shell sur les valeurs) → aucune injection possible.
ACCESS="$1"
SECRET="$2"
[ -z "$ACCESS" ] || [ -z "$SECRET" ] && { echo "MISSING-CREDS"; exit 2; }
mc alias set vx "http://127.0.0.1:9000" "$ACCESS" "$SECRET" >/dev/null 2>&1 || { echo "AUTH-FAIL"; exit 1; }
mc cat vx/confidential-reports/report.txt 2>/dev/null || { echo "READ-FAIL"; exit 1; }
