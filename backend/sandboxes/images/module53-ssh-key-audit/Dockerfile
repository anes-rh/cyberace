FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends coreutils curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# 3 cles autorisees (valeurs base64 plausibles, pas de vraies cles) ; la 3e (commentaire
# generique "backup-temp-do-not-remove") ne figure sur aucun registre = backdoor.
RUN mkdir -p /home/deploy/.ssh && \
    printf 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKj3F9xQpL2mZs8vN1tR6cYhWuXeAqBdKfGjHnPo alice.martin@usthb\nssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHb7T2wRkM4nDp9uCxYaZlVoIeJhGqFsBnKcXdWt bruno.said@usthb\nssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIQm5R8kLtN3vBz1yUxWaHoPeCjFgMhKdSnTiYcVu backup-temp-do-not-remove\n' \
    > /home/deploy/.ssh/authorized_keys && \
    chmod 600 /home/deploy/.ssh/authorized_keys

RUN printf 'alice.martin@usthb - cle principale poste de travail\nbruno.said@usthb - cle de secours (laptop personnel)\n' \
    > /root/baseline_roster.txt

RUN printf 'Cle non autorisee confirmee sur le compte deploy.\nReference : CYBERACE{cle_ssh_backdoor_non_autorisee}\n' \
    > /root/ssh_audit_report.txt

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "bash"]
