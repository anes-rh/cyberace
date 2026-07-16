FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends redis-server \
    && rm -rf /var/lib/apt/lists/*

RUN sed -i 's/^bind .*/bind 0.0.0.0/' /etc/redis/redis.conf && \
    sed -i 's/^protected-mode yes/protected-mode no/' /etc/redis/redis.conf

# Pré-remplit la base au moment du build : démarre Redis temporairement,
# écrit la clé, sauvegarde le fichier RDB, puis arrête.
RUN redis-server /etc/redis/redis.conf --daemonize yes && \
    sleep 1 && \
    redis-cli SET flag "CYBERACE{redis_sans_authentification}" && \
    redis-cli SAVE && \
    redis-cli SHUTDOWN NOSAVE || true

EXPOSE 6379
# --daemonize no : le redis.conf de Debian démonise/supervise redis, ce qui
# fait sortir le PID 1 et arrête le conteneur. On force le premier plan.
CMD ["redis-server", "/etc/redis/redis.conf", "--daemonize", "no", "--supervised", "no"]
