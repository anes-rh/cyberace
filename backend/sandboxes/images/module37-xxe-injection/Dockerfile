FROM debian:bookworm-20250630-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-lxml \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /srv/app
COPY app.py /srv/app/app.py

RUN echo "CYBERACE{xxe_entite_externe_lecture_fichier}" > /root/flag.txt

WORKDIR /srv/app
EXPOSE 8080
CMD ["python3", "app.py"]
