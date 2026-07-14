FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    sudo build-essential curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ttyd épinglé (1.7.7) pour la reproductibilité — asset x86_64 (linux/amd64).
RUN curl -L -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

RUN useradd -m -s /bin/bash stagiaire

# Misconfiguration : LD_PRELOAD explicitement préservé à travers sudo.
RUN echo 'Defaults env_keep += "LD_PRELOAD"' > /etc/sudoers.d/00-preload && \
    echo 'stagiaire ALL=(root) NOPASSWD: /usr/bin/id' >> /etc/sudoers.d/00-preload && \
    chmod 0440 /etc/sudoers.d/00-preload && \
    visudo -c

RUN echo "CYBERACE{ld_preload_env_keep_root}" > /root/flag.txt && chmod 600 /root/flag.txt

WORKDIR /home/stagiaire
EXPOSE 7681
# -W rend le terminal saisissable (sinon ttyd est en lecture seule).
ENTRYPOINT ["ttyd", "-p", "7681", "-W", "su", "-", "stagiaire"]
