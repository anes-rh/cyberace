# Collecteur/observateur d'« Opération Overflow » (rôle log). Compile le sink
# d'évènements et sert un terminal web (ttyd) pour consulter le journal.
FROM debian:bookworm-slim AS build
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY monitor_sink.c .
RUN gcc -O2 -o /monitor_sink monitor_sink.c

FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      bash ca-certificates curl grep coreutils procps \
    && rm -rf /var/lib/apt/lists/*
# ttyd : terminal web (même binaire épinglé que les autres projets).
RUN curl -fsSL -o /usr/local/bin/ttyd \
      https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd
COPY --from=build /monitor_sink /usr/local/bin/monitor_sink
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /usr/local/bin/monitor_sink /entrypoint.sh
EXPOSE 7681 9000
ENTRYPOINT ["/entrypoint.sh"]
