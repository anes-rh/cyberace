# prod-app de « Pipeline Fantôme » (réseau internal). Simule un déploiement
# continu : toutes les 60 s, re-pull prod/webapp:latest depuis le registre et
# relance le conteneur, via le démon Docker INTERNE et JETABLE (prod-dind) — pas
# le socket de la VM hôte. Ce qui est poussé au registre finit donc exécuté ici.
FROM docker:cli

RUN apk add --no-cache bash coreutils

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
