# ci-runner de « Pipeline Fantôme » (réseau internal). Au démarrage, construit et
# pousse l'image LÉGITIME prod/webapp:latest vers le registre (via le démon
# Docker interne prod-dind). Fournit aussi curl/jq : c'est depuis ce nœud que le
# backend sonde le registre (registry_probe) — registry:2 étant sans shell.
FROM docker:cli

RUN apk add --no-cache curl jq bash

# Contexte de build de l'image légitime (servie telle quelle par prod-app).
COPY legit /opt/legit
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
