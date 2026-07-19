# Service vulnérable partagé d'« Opération Overflow ». UNE image, réutilisée par
# les 4 nœuds cibles (env LEVEL/PORT/SERVICE distincts) → économie de disque sur
# le démon distant. Les 4 binaires (protections croissantes) sont compilés au
# build ; l'entrypoint lance celui du niveau demandé.
FROM debian:bookworm-slim AS build
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY vulnserver.c .
# Niveau 1 : AUCUNE protection (NX off via -z execstack, pas de canari, non-PIE)
#            + gadget jmp rsp → shellcode sur la pile.
# Niveau 2 : NX activé (pas d'execstack), pas de canari → ret2libc (ASLR off au run).
# Niveau 3 : NX activé + fuite libc via commande DEBUG → ret2libc (ASLR on).
# Niveau 4 : NX + canari (stack protector) + bug de chaîne de format → fuite
#            canari/libc puis ROP (ASLR on).
RUN set -eux; \
    gcc -O0 -g -no-pie -fno-stack-protector -z execstack -DWITH_GADGET -o /vuln1 vulnserver.c; \
    gcc -O0 -g -no-pie -fno-stack-protector                            -o /vuln2 vulnserver.c; \
    gcc -O0 -g -no-pie -fno-stack-protector -DLEAK_DEBUG               -o /vuln3 vulnserver.c; \
    gcc -O0 -g -no-pie -fstack-protector-all -DFMT_BUG                 -o /vuln4 vulnserver.c

FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive
# bash : getflag + /dev/tcp. util-linux : setarch. procps : pgrep (relecture
# /proc/<pid>/maps côté serveur pour la validation du niveau 3).
RUN apt-get update && apt-get install -y --no-install-recommends \
      bash util-linux procps grep coreutils \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /opt/overflow /run/overflow
COPY --from=build /vuln1 /vuln2 /vuln3 /vuln4 /opt/overflow/
COPY getflag /usr/local/bin/getflag
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /usr/local/bin/getflag /entrypoint.sh /opt/overflow/vuln1 /opt/overflow/vuln2 /opt/overflow/vuln3 /opt/overflow/vuln4
ENTRYPOINT ["/entrypoint.sh"]
