#!/bin/bash
# Force le TTL initial des paquets sortants à 128 (valeur traditionnellement
# associée à Windows), alors que ce conteneur est en réalité Linux (TTL par
# défaut 64). C'est une simulation délibérée à but pédagogique — en pratique,
# le TTL initial dépend du noyau de la machine et n'est pas modifié
# artificiellement comme ici.
iptables -t mangle -A OUTPUT -j TTL --ttl-set 128
tail -f /dev/null
