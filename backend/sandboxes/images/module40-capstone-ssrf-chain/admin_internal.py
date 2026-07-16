from http.server import BaseHTTPRequestHandler, HTTPServer
import base64

VALID = base64.b64encode(b"admin:cyberace2026").decode()

class AdminHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        auth = self.headers.get("Authorization", "")
        if auth == f"Basic {VALID}":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"CYBERACE{ssrf_et_identifiants_combines}")
        else:
            self.send_response(401)
            self.send_header("WWW-Authenticate", 'Basic realm="admin"')
            self.end_headers()
            self.wfile.write(b"Authentification requise")

HTTPServer(("127.0.0.1", 9090), AdminHandler).serve_forever()
