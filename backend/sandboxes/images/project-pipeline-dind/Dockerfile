# prod-dind : le démon Docker INTERNE, JETABLE et isolé par session (docker:dind
# privilégié). C'est l'« hôte » atteint lors de l'évasion de conteneur (objectif
# 4) — jamais la VM hôte partagée. Contient le fichier « secret d'hôte » que
# l'évasion révèle. (L'auth S3 de l'objectif 6 est validée sur cloud-storage, qui
# embarque déjà mc — inutile de le rajouter ici.)
FROM docker:dind

# TLS off : le démon écoute en clair sur tcp://0.0.0.0:2375 (API Docker exposée =
# la vulnérabilité que le joueur exploite). Réseau interne isolé, aucun port
# publié côté hôte : totalement confiné à la session.
ENV DOCKER_TLS_CERTDIR=""

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 2375
ENTRYPOINT ["/entrypoint.sh"]
