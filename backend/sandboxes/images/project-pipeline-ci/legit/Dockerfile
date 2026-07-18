# Image LÉGITIME prod/webapp : sert une page statique. Aucune particularité —
# c'est la référence que l'attaque supply-chain vient écraser.
FROM busybox:1.36
RUN mkdir -p /www && echo '<h1>prod/webapp OK</h1>' > /www/index.html
LABEL org.cyberace.app="prod-webapp"
CMD ["httpd","-f","-p","80","-h","/www"]
