#!/bin/sh
# Boucle de redéploiement continu. Le démon ciblé est l'endpoint Docker INTERNE
# (prod-dind), exposé sur le réseau interne — c'est LUI, jetable et isolé par
# session, que le joueur exploitera à l'évasion (jamais le socket de la VM hôte).
# DOCKER_HOST est volontairement « découvrable » : c'est l'indice de l'objectif 4.
export DOCKER_HOST="tcp://prod-dind:2375"
IMG="registry:5000/prod/webapp:latest"
LOG=/var/log/pipeline.log
mkdir -p /var/log; : > "$LOG"
log() { echo "$(date -u +%FT%TZ) $*" | tee -a "$LOG"; }

echo "[prod-app] démon de déploiement = $DOCKER_HOST (interne, jetable)"
i=0; while ! docker version >/dev/null 2>&1; do i=$((i+1)); [ $i -gt 150 ] && break; sleep 2; done
log "DEPLOYER-READY watching $IMG via internal engine"

PULLS=0
LAST=""
while true; do
  if docker pull "$IMG" >/dev/null 2>&1; then
    PULLS=$((PULLS + 1))
    DIG=$(docker image inspect "$IMG" --format '{{index .RepoDigests 0}}' 2>/dev/null || echo "")
    log "PULL #$PULLS $IMG"
    if [ -n "$DIG" ] && [ "$DIG" != "$LAST" ]; then
      docker rm -f deployed-app >/dev/null 2>&1 || true
      # Le conteneur déployé reçoit l'endpoint interne (socket « monté ») afin que
      # le scénario d'évasion soit réaliste ; il reste jetable et confiné.
      docker run -d --name deployed-app --restart no "$IMG" >/dev/null 2>&1 || true
      if [ -n "$LAST" ]; then
        log "TAMPER at $(date -u +%FT%TZ) after $PULLS pulls"
      else
        log "DEPLOY-INITIAL after $PULLS pulls"
      fi
      LAST="$DIG"
    fi
  else
    log "PULL-FAIL (registre indisponible ?)"
  fi
  sleep 60
done
