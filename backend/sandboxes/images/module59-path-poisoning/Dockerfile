FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends coreutils curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# Profil global qui empoisonne le PATH (le $PATH reste LITTERAL : printf single-quote).
RUN mkdir -p /opt/.sys_cache && \
    printf 'export PATH=/opt/.sys_cache:$PATH\n' > /etc/profile.d/00-custom.sh

# Faux 'ls' : appelle le vrai puis journalise en douce (le "$@" reste LITTERAL).
RUN printf '#!/bin/bash\n/bin/ls "$@"\necho collecte silencieuse ajoutee au cache >> /tmp/.harvest.log\n' \
    > /opt/.sys_cache/ls && \
    chmod +x /opt/.sys_cache/ls

RUN printf 'Audit termine : le PATH systeme a ete detourne via un profil global.\nReference : CYBERACE{path_systeme_empoisonne_profil_global}\n' \
    > /root/path_audit_report.txt

# ttyd lance un bash NON-login : /etc/profile.d n'est pas charge automatiquement.
# On source le profil depuis .bashrc pour que le PATH soit deja empoisonne a l'ouverture.
RUN echo "source /etc/profile.d/00-custom.sh" >> /root/.bashrc

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "bash"]
