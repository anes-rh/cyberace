#!/bin/bash
# SIEM : démarre le collecteur rsyslog (UDP 514) puis ouvre un terminal web
# pour que l'analyste consulte /var/log/waf.log et /var/log/firewall.log.
set -e
: > /var/log/waf.log
: > /var/log/firewall.log
rsyslogd
exec ttyd -p 7681 -W bash
