FROM debian:bookworm-slim

# Serveur de fichiers interne : OpenSSH + rsyslog (journalise les connexions
# acceptées dans /var/log/auth.log — preuve du mouvement latéral). iproute2
# pour la route retour internal→dmz injectée après démarrage.
RUN apt-get update && apt-get install -y --no-install-recommends \
      openssh-server rsyslog iproute2 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -s /bin/bash backup-svc \
    && mkdir -p /home/backup-svc/.ssh /home/backup-svc/documents /run/sshd \
    && sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config \
    && sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Clé PUBLIQUE de backup-svc (la privée, volontairement mal protégée, vit sur
# webapp). Le mouvement latéral = récupérer cette privée puis SSH ici.
COPY backup-svc.pub /home/backup-svc/.ssh/authorized_keys
COPY entrypoint.sh /entrypoint.sh
RUN chmod 700 /home/backup-svc/.ssh \
    && chmod 600 /home/backup-svc/.ssh/authorized_keys \
    && chown -R backup-svc:backup-svc /home/backup-svc \
    && chmod +x /entrypoint.sh

EXPOSE 22
ENTRYPOINT ["/entrypoint.sh"]
