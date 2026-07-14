#!/bin/bash
# Charge le ruleset de départ (permissif), puis ouvre un terminal web.
# ip_forward est activé par l'orchestrateur (sysctl net.ipv4.ip_forward=1).
nft -f /etc/nftables-base.conf 2>/dev/null || true
exec ttyd -p 7681 -W bash
