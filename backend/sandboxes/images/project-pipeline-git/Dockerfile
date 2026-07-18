# gitserver de « Pipeline Fantôme » : héberge le dépôt public prod/webapp en
# HTTP (dumb protocol) et sert de PIVOT (dual-homed dmz+internal). L'historique
# contient un commit « nettoyé » du HEAD mais toujours présent, avec des secrets
# en base64 (creds de push registre + creds SSH de pivot + jeton de build).
# Base docker:cli → le joueur, une fois pivoté ici, dispose du client Docker
# pour pousser vers le registre via le démon Docker interne (prod-dind).
FROM docker:cli

# git (dépôt + historique), openssh (pivot), curl/jq (ops internes), bash (shell
# de pivot confortable). busybox httpd (déjà présent) sert le dépôt en statique.
# shadow : `chpasswd` (mot de passe SSH). busybox-extras : applet `httpd` (absent
# du busybox minimal de docker:cli) pour servir le dépôt Git en HTTP statique.
RUN apk add --no-cache git openssh curl jq bash coreutils shadow busybox-extras

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 22 = pivot SSH, 80 = dépôt Git en HTTP.
EXPOSE 22 80
ENTRYPOINT ["/entrypoint.sh"]
