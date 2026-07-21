FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server sudo curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

RUN mkdir -p /run/sshd && ssh-keygen -A

# Configuration volontairement faible, a durcir par l'analyste.
RUN sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/^#\?X11Forwarding.*/X11Forwarding yes/' /etc/ssh/sshd_config && \
    sed -i 's/^#\?MaxAuthTries.*/MaxAuthTries 30/' /etc/ssh/sshd_config

RUN useradd -m -s /bin/bash analyste && \
    echo "analyste ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/00-analyste && \
    chmod 0440 /etc/sudoers.d/00-analyste

WORKDIR /home/analyste
EXPOSE 7681
ENTRYPOINT ["ttyd", "-p", "7681", "su", "-", "analyste"]
