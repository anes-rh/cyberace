FROM debian:bookworm-20250630-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    john openssl curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
# ttyd épinglé (1.7.7) pour la reproductibilité — asset x86_64 (linux/amd64).
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd
RUN useradd -m -s /bin/bash stagiaire
# Fichier de sauvegarde oublié, lisible par tous, contenant un hash root
# faible (mot de passe très commun, présent dans la liste par défaut de John).
RUN HASH=$(openssl passwd -6 -salt cybersalt letmein) && \
    mkdir -p /var/backups && \
    echo "root:${HASH}:19000:0:99999:7:::" > /var/backups/shadow.bak && \
    chmod 644 /var/backups/shadow.bak
RUN echo "CYBERACE{mot_de_passe_faible_casse_hors_ligne}" > /root/flag.txt && chmod 600 /root/flag.txt
WORKDIR /home/stagiaire
EXPOSE 7681
# -W rend le terminal saisissable (sinon ttyd est en lecture seule).
ENTRYPOINT ["ttyd", "-p", "7681", "-W", "su", "-", "stagiaire"]
