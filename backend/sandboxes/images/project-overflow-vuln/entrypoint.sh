#!/bin/bash
# Lance le service vulnérable du niveau demandé. Les niveaux 1 et 2 tournent
# sous `setarch -R` (personality ADDR_NO_RANDOMIZE) → ASLR DÉSACTIVÉ, ce qui
# rend les adresses de pile/libc déterministes (shellcode à adresse connue /
# ret2libc à base connue). Cela exige `seccomp=unconfined` sur le nœud (posé
# dans la topologie) ; sinon on se rabat proprement sur un lancement normal.
set -u
mkdir -p /run/overflow
LEVEL="${LEVEL:-1}"
PORT="${PORT:-9001}"
SERVICE="${SERVICE:-vuln-lvl${LEVEL}}"
export LEVEL PORT SERVICE FLAG_SUFFIX
BIN="/opt/overflow/vuln${LEVEL}"

# Fichier de session lu par getflag (l'env n'est pas fiable derrière un
# execve() de shellcode qui met envp=NULL).
printf 'LEVEL=%s\nFLAG_SUFFIX=%s\nSERVICE=%s\n' "$LEVEL" "${FLAG_SUFFIX:-static0}" "$SERVICE" > /run/overflow/session

echo "[overflow] niveau=${LEVEL} service=${SERVICE} port=${PORT}"
case "$LEVEL" in
  1|2)
    if setarch -R true 2>/dev/null; then
      exec setarch -R "$BIN" "$PORT" "$SERVICE"
    fi
    echo "[overflow] setarch -R indisponible (seccomp) — lancement ASLR-on"
    exec "$BIN" "$PORT" "$SERVICE"
    ;;
  *)
    exec "$BIN" "$PORT" "$SERVICE"
    ;;
esac
