from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import os

BASE = "/srv/pages"

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/view":
            qs = parse_qs(parsed.query)
            page = qs.get("page", ["accueil"])[0]
            # Vulnérabilité volontaire : aucune validation, chemin construit
            # directement à partir de l'entrée utilisateur.
            filepath = os.path.join(BASE, page)
            try:
                with open(filepath) as f:
                    content = f.read()
            except Exception as e:
                content = f"Erreur: {e}"
            self.send_response(200)
            self.end_headers()
            self.wfile.write(content.encode(errors="replace"))
        else:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"<html><body>Usage : /view?page=accueil</body></html>")

HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
