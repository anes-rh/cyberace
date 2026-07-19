# Poste d'attaque d'« Opération Overflow » (réseau external, dual-homé sur
# internal pour joindre les services). Outillage d'exploitation binaire :
# gdb + GEF (équivalent pwndbg), pwntools, ROPgadget, checksec, gcc, nc. Les 4
# binaires vulnérables (non strippés, -g) et la libc de la cible sont fournis
# dans /challenge pour l'analyse statique et le calcul d'offsets.
FROM debian:bookworm-slim AS build
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY vulnserver.c .
RUN set -eux; \
    gcc -O0 -g -no-pie -fno-stack-protector -z execstack -DWITH_GADGET -o /vuln1 vulnserver.c; \
    gcc -O0 -g -no-pie -fno-stack-protector                            -o /vuln2 vulnserver.c; \
    gcc -O0 -g -no-pie -fno-stack-protector -DLEAK_DEBUG               -o /vuln3 vulnserver.c; \
    gcc -O0 -g -no-pie -fstack-protector-all -DFMT_BUG                 -o /vuln4 vulnserver.c

FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      gdb python3 python3-pip python3-dev gcc libc6-dev \
      checksec file binutils netcat-openbsd curl ca-certificates \
      procps iproute2 less vim-tiny bash coreutils \
    && rm -rf /var/lib/apt/lists/*
# pwntools + ROPgadget (PEP 668 → --break-system-packages sur Debian bookworm).
RUN pip3 install --no-cache-dir --break-system-packages pwntools ROPgadget
# GEF : gdb enrichi (équivalent pwndbg), un seul script.
RUN curl -fsSL -o /opt/gef.py https://raw.githubusercontent.com/hugsy/gef/main/gef.py \
    && printf 'source /opt/gef.py\n' > /root/.gdbinit
# ttyd : terminal web (binaire épinglé, comme les autres projets).
RUN curl -fsSL -o /usr/local/bin/ttyd \
      https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd
RUN mkdir -p /challenge
COPY --from=build /vuln1 /vuln2 /vuln3 /vuln4 /challenge/
# libc de la cible (même base debian → même libc) pour ret2libc.
RUN cp /lib/x86_64-linux-gnu/libc.so.6 /challenge/libc.so.6 \
    && chmod +x /challenge/vuln1 /challenge/vuln2 /challenge/vuln3 /challenge/vuln4
COPY motd.txt /etc/motd
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 7681
ENTRYPOINT ["/entrypoint.sh"]
