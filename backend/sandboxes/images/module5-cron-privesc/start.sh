#!/bin/bash
cron
# -W rend le terminal saisissable (sinon ttyd est en lecture seule).
exec ttyd -p 7681 -W su - stagiaire
