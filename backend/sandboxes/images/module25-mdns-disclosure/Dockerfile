FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends avahi-daemon dbus \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/avahi/services && cat > /etc/avahi/services/backup.service << 'EOF'
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name>Portail de sauvegarde interne</name>
  <service>
    <type>_http._tcp</type>
    <port>8080</port>
    <txt-record>info=CYBERACE{mdns_annonce_service_interne}</txt-record>
  </service>
</service-group>
EOF

COPY start.sh /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
