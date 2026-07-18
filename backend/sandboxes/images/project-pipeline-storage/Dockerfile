# cloud-storage : stockage objet compatible S3 (MinIO). Le root user/pass EST la
# paire d'identifiants IAM servie par cloud-meta (dérivée du suffixe de session) :
# les creds volés à l'IMDS ouvrent donc réellement le bucket. Contient le rapport
# confidentiel = flag final.
#
# Base python:3.12-alpine (déjà en cache) : on récupère les binaires statiques
# minio/mc via urllib (suit les redirections, contexte non vérifié) — évite apt/apk,
# tous deux instables sur cette VM (horloge/mirroirs). minio/mc sont des binaires
# Go statiques : tournent sur musl.
FROM python:3.12-alpine
RUN python3 -c "import ssl,urllib.request as u; c=ssl._create_unverified_context(); \
open('/usr/bin/minio','wb').write(u.urlopen('https://dl.min.io/server/minio/release/linux-amd64/minio',context=c).read()); \
open('/usr/bin/mc','wb').write(u.urlopen('https://dl.min.io/client/mc/release/linux-amd64/mc',context=c).read())" \
    && chmod +x /usr/bin/minio /usr/bin/mc

COPY entrypoint.sh /entrypoint.sh
COPY s3read.sh /usr/local/bin/s3read
RUN chmod +x /entrypoint.sh /usr/local/bin/s3read

EXPOSE 9000
ENTRYPOINT ["/entrypoint.sh"]
