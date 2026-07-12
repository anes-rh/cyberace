FROM debian:bookworm-20250630-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    sudo findutils curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
# ttyd épinglé (1.7.7) pour la reproductibilité — asset x86_64 (linux/amd64).
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd
# --- Utilisateur bas-privilège : c'est lui que l'élève incarne ---
RUN useradd -m -s /bin/bash stagiaire
# --- Vulnérabilité 1 : binaire SUID mal configuré ---
# `find` est un binaire COMPILÉ (pas un script) — le bit SUID est donc bien
# honoré par le noyau. Technique d'exploitation standard (GTFOBins) :
# `find . -exec /bin/sh -p \; -quit`
RUN chmod u+s /usr/bin/find
# --- Flag racine 1 (SUID find), illisible pour stagiaire ---
RUN echo "CYBERACE{find_suid_shell_racine}" > /root/flag.txt && chmod 600 /root/flag.txt
# --- Flag racine 2 (PATH hijacking), illisible pour stagiaire ---
# (Ajout par rapport à la spec : le 2e flag doit exister dans l'image pour que
#  l'exploitation sudo+PATH de la tâche 8 puisse le révéler. Le script `status`
#  détourné par l'élève fera `cat /root/flag2.txt`.)
RUN echo "CYBERACE{path_detourne_sudo_sans_secure_path}" > /root/flag2.txt && chmod 600 /root/flag2.txt
# --- Vulnérabilité 2 : sudo + PATH hijacking (PAS de SUID sur ce script) ---
# Important : le noyau Linux IGNORE le bit SUID sur les scripts interprétés
# (#!/bin/bash, #!/bin/sh…) depuis longtemps, pour des raisons historiques de
# sécurité (race conditions). C'est pourquoi cette seconde faille passe par
# sudo plutôt que par un chmod u+s sur le script.
RUN mkdir -p /opt/maintenance && \
    printf '#!/bin/bash\necho "[backup-check] Verification du dernier backup..."\nstatus\n' \
    > /usr/local/bin/backup-check && \
    chmod 755 /usr/local/bin/backup-check
# Autorise stagiaire à lancer CE script précis en root, sans mot de passe.
RUN echo "stagiaire ALL=(root) NOPASSWD: /usr/local/bin/backup-check" \
    > /etc/sudoers.d/backup-check && chmod 0440 /etc/sudoers.d/backup-check
# Désactive explicitement secure_path : sans cette ligne, sudo ignorerait le
# $PATH modifié par stagiaire et neutraliserait l'exploitation. C'est LA
# misconfiguration volontaire de cette seconde vulnérabilité.
RUN echo 'Defaults !secure_path' > /etc/sudoers.d/00-relax-path && \
    chmod 0440 /etc/sudoers.d/00-relax-path && \
    visudo -c
WORKDIR /home/stagiaire
EXPOSE 7681
# ttyd exécute `su - stagiaire` : chaque connexion tombe directement dans un
# shell bas-privilège, pas dans un shell root. -W rend le terminal saisissable.
ENTRYPOINT ["ttyd", "-p", "7681", "-W", "su", "-", "stagiaire"]
