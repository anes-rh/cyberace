from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs, urlunparse
import urllib.request
import base64

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/preview":
            qs = parse_qs(parsed.query)
            url = qs.get("url", [""])[0]
            try:
                # urllib ne gère pas les identifiants embarqués dans l'URL
                # (http://user:pass@hote/) : on les extrait du userinfo et on
                # pose l'en-tête Authorization Basic à la main, puis on requête
                # l'URL nettoyée. Le point de vue de l'attaquant est inchangé :
                # il passe bien http://admin:cyberace2026@127.0.0.1:9090/.
                u = urlparse(url)
                netloc = u.hostname or ""
                if u.port:
                    netloc += ":%d" % u.port
                clean = urlunparse((u.scheme, netloc, u.path or "/", u.params, u.query, u.fragment))
                req = urllib.request.Request(clean)
                if u.username:
                    creds = base64.b64encode(("%s:%s" % (u.username, u.password or "")).encode()).decode()
                    req.add_header("Authorization", "Basic " + creds)
                with urllib.request.urlopen(req, timeout=3) as resp:
                    body = resp.read(500)
            except Exception as e:
                body = str(e).encode()
            self.send_response(200)
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"<html><body>Outil d'apercu : /preview?url=...</body></html>")

HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
