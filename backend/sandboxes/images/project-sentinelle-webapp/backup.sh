#!/bin/bash
# Tâche de « sauvegarde » NovaBank, exécutée par ROOT via cron (voir
# /etc/cron.d/novabank-backup). Ce fichier est VOLONTAIREMENT world-writable :
# quiconque obtient un accès www-data (via la RCE applicative) peut y injecter
# une commande, qui s'exécutera alors avec les privilèges root → privesc locale.
echo "[backup] $(date -u) rotation des sauvegardes OK" >> /var/log/novabank-backup.log
