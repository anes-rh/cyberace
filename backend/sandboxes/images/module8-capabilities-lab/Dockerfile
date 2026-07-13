FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 libcap2-bin curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ttyd épinglé (1.7.7) pour la reproductibilité — asset x86_64 (linux/amd64).
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

RUN useradd -m -s /bin/bash stagiaire

# Vulnérabilité : capacité cap_setuid accordée à l'interpréteur Python.
# On résout le lien symbolique vers le vrai binaire au moment du build, pour
# ne pas dépendre d'un nom de version Python figé en dur.
RUN setcap cap_setuid+ep "$(readlink -f "$(which python3)")"

RUN echo "CYBERACE{capability_setuid_python_racine}" > /root/flag.txt && chmod 600 /root/flag.txt

WORKDIR /home/stagiaire
EXPOSE 7681
# -W rend le terminal saisissable (sinon ttyd est en lecture seule).
ENTRYPOINT ["ttyd", "-p", "7681", "-W", "su", "-", "stagiaire"]
