#!/bin/bash
# Prépare les artefacts du scénario (flag privesc à suffixe de session, perms de
# la clé SSH mal protégée), démarre cron (vecteur de privesc) puis passe la main
# à l'entrypoint DVWA d'origine (apache + php).
set -e

SUFFIX="${FLAG_SUFFIX:-static}"

# Flag « privesc locale » — lisible par root uniquement (récompense de l'objectif 5).
echo "NOVA{privesc_cron_world_writable}_${SUFFIX}" > /root/local.txt
chmod 600 /root/local.txt

# Clé privée de backup-svc VOLONTAIREMENT mal protégée (644, lisible par www-data).
mkdir -p /var/www/.ssh
chmod 644 /var/www/.ssh/id_rsa 2>/dev/null || true
chown -R www-data:www-data /var/www/.ssh 2>/dev/null || true

# Script de sauvegarde world-writable + démarrage du démon cron (root).
chmod 0777 /usr/local/bin/backup.sh 2>/dev/null || true
cron 2>/dev/null || service cron start 2>/dev/null || true

# Entrypoint DVWA d'origine (démarre Apache au premier plan).
exec docker-php-entrypoint apache2-foreground
