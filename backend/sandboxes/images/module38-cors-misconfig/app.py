from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/profile":
            # Vulnérabilité volontaire : réflexion directe de l'en-tête
            # Origin, combinée à Allow-Credentials.
            origin = self.headers.get("Origin", "*")
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Credentials", "true")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"user":"admin","token":"CYBERACE{cors_origine_reflechie_avec_credentials}"}')
        else:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Portail.")

HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
