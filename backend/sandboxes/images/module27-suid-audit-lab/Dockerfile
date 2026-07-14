FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    findutils curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ttyd épinglé (1.7.7) pour la reproductibilité — asset x86_64 (linux/amd64).
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

RUN useradd -m -s /bin/bash stagiaire

# "Porte dérobée" discrète : env rendu SUID (classique GTFOBins), volontairement
# ABSENT de la liste de référence ci-dessous.
RUN chmod u+s /usr/bin/env

# La référence est calculée à partir de la sortie RÉELLE de find sur CETTE image,
# moins /usr/bin/env : elle reflète donc fidèlement les SUID légitimes du système
# (spec : "vérifie au build, ne le suppose pas"). L'anomalie env n'y figure pas.
RUN mkdir -p /opt/audit && \
    find / -perm -4000 -type f 2>/dev/null | grep -vx '/usr/bin/env' | sort \
    > /opt/audit/baseline-suid.txt && \
    chmod 644 /opt/audit/baseline-suid.txt

WORKDIR /home/stagiaire
EXPOSE 7681
# -W rend le terminal saisissable (sinon ttyd est en lecture seule).
ENTRYPOINT ["ttyd", "-p", "7681", "-W", "su", "-", "stagiaire"]
