# cloud-meta : service de métadonnées d'instance (IMDS) simulé, à la 169.254.169.254.
# Sert des identifiants IAM temporaires dérivés du suffixe de session (dynamiques,
# anti write-up). Injoignable sauf depuis un accès obtenu sur le réseau interne
# (l'hôte dind dual-homé internal+cloud) — comme un vrai IMDS n'est atteignable
# que depuis l'instance elle-même.
FROM python:3.12-alpine
COPY server.py /server.py
EXPOSE 80
CMD ["python3", "/server.py"]
