FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends coreutils curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

RUN mkdir -p /opt/app && \
    printf 'def main():\n    print("server running")\n' > /opt/app/server.py && \
    printf '[settings]\ndebug=false\nport=8080\n' > /opt/app/config.ini && \
    printf 'def helper():\n    return 42\n' > /opt/app/utils.py && \
    printf '# Application interne\nVoir server.py pour le point d entree.\n' > /opt/app/README.md

# Empreinte de reference prise AVANT toute alteration (ordre critique).
RUN cd /opt/app && sha256sum server.py config.ini utils.py README.md > /opt/baseline_sha256sums.txt

# Alteration POSTERIEURE a la prise d'empreinte (simule un acces non autorise).
# Le flag doit matcher la tache 6.
RUN printf '\n# maintenance hook (unauthorized)\n# CYBERACE{integrite_rompue_detectee_par_hachage}\n' >> /opt/app/utils.py

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "bash"]
