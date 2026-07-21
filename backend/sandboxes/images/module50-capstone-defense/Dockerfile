FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    coreutils iptables tcpdump python3 curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# --- Volet 1 : journal d'authentification (principe du Module 41) ---
RUN printf 'Jul 18 03:10:02 victim sshd[1001]: Failed password for root from 198.51.100.44 port 40001 ssh2\nJul 18 03:10:07 victim sshd[1002]: Failed password for root from 198.51.100.44 port 40002 ssh2\nJul 18 03:11:00 victim sshd[1003]: Failed password for admin from 203.0.113.200 port 40003 ssh2\nJul 18 03:41:19 victim sshd[1180]: Accepted password for root from 198.51.100.44 port 41337 ssh2\nJul 18 03:41:19 victim sshd[1180]: pam_unix(sshd:session): session opened for user root(uid=0) by (uid=0)\n' \
    > /var/log/auth.log

# --- Volet 2 : capture reseau avec marqueur de correlation (principe du Module 43) ---
COPY generate_pcap.sh /tmp/generate_pcap.sh
RUN chmod +x /tmp/generate_pcap.sh && /tmp/generate_pcap.sh && rm /tmp/generate_pcap.sh

RUN printf 'Correlation confirmee : compromission SSH suivie d une balise sortante.\nReference finale : CYBERACE{investigation_complete_logs_pcap_confinement}\n' \
    > /root/final_report.txt

WORKDIR /root
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "bash"]
