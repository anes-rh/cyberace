#!/bin/sh
# Amorce le pipeline : pousse l'image légitime prod/webapp:latest vers le registre
# via le démon Docker interne (prod-dind). Puis reste actif (point de sonde curl).
DH="tcp://prod-dind:2375"

echo "[ci-runner] attente du démon Docker interne ($DH)…"
i=0; while ! docker -H "$DH" version >/dev/null 2>&1; do i=$((i+1)); [ $i -gt 150 ] && break; sleep 2; done
echo "[ci-runner] attente du registre (registry:5000)…"
i=0; while ! curl -sf http://registry:5000/v2/ >/dev/null 2>&1; do i=$((i+1)); [ $i -gt 90 ] && break; sleep 2; done

echo "[ci-runner] build + push de l'image légitime prod/webapp:latest…"
if docker -H "$DH" build -t registry:5000/prod/webapp:latest /opt/legit >/tmp/build.log 2>&1; then
  docker -H "$DH" push registry:5000/prod/webapp:latest >/tmp/push.log 2>&1 \
    && echo "[ci-runner] image légitime publiée." \
    || echo "[ci-runner] ECHEC push (voir /tmp/push.log)."
else
  echo "[ci-runner] ECHEC build (voir /tmp/build.log)."
fi

# Reste actif : sert de point de sonde interne (registry_probe curl depuis ici).
exec tail -f /dev/null
