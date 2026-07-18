#!/bin/sh
# Dépose le « secret d'hôte » (révélé UNIQUEMENT par une évasion réussie : lecture
# du FS de ce conteneur dind depuis un conteneur enfant montant -v /:/host), puis
# lance dockerd en clair sur tcp://0.0.0.0:2375, avec registre interne non sécurisé
# autorisé. Ce démon est jetable et isolé par session : rien n'atteint la VM hôte.
SUFFIX="${FLAG_SUFFIX:-static0}"
echo "GHOST_HOST{evasion_dind_confinee}_${SUFFIX}" > /root/dind_flag.txt
chmod 600 /root/dind_flag.txt
cat > /root/NOTE.txt <<NOTE
Hôte du moteur de déploiement interne (jetable).
Le fichier /root/dind_flag.txt n'est lisible que par un accès « niveau hôte ».
NOTE

exec dockerd-entrypoint.sh \
  --host=unix:///var/run/docker.sock \
  --host=tcp://0.0.0.0:2375 \
  --tls=false \
  --insecure-registry=10.60.1.0/24 \
  --insecure-registry=registry:5000
