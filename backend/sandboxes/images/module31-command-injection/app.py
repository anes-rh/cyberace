from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import subprocess

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/ping":
            qs = parse_qs(parsed.query)
            host = qs.get("host", [""])[0]
            try:
                # Vulnérabilité volontaire : shell=True + concaténation directe.
                result = subprocess.run(f"ping -c 1 {host}", shell=True,
                                         capture_output=True, text=True, timeout=5)
                output = result.stdout + result.stderr
            except Exception as e:
                output = str(e)
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(output.encode())
        else:
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Outil de diagnostic reseau</h1><p>Usage : /ping?host=ADRESSE</p></body></html>")

HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
