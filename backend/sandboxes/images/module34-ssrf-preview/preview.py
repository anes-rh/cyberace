from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import urllib.request

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/preview":
            qs = parse_qs(parsed.query)
            url = qs.get("url", [""])[0]
            try:
                with urllib.request.urlopen(url, timeout=3) as resp:
                    body = resp.read(500)
            except Exception as e:
                body = str(e).encode()
            self.send_response(200)
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"<html><body>Outil d'apercu de lien : /preview?url=...</body></html>")

HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
