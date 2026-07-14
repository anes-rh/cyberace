FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends openssh-server \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /run/sshd && ssh-keygen -A
RUN useradd -m -s /bin/bash backup-svc

COPY deploy_key.pub /home/backup-svc/.ssh/authorized_keys
RUN mkdir -p /home/backup-svc/.ssh && \
    chown -R backup-svc:backup-svc /home/backup-svc/.ssh && \
    chmod 700 /home/backup-svc/.ssh && \
    chmod 600 /home/backup-svc/.ssh/authorized_keys

RUN echo "CYBERACE{cle_ssh_exposee_mouvement_lateral}" > /home/backup-svc/flag.txt && \
    chown backup-svc:backup-svc /home/backup-svc/flag.txt

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]
