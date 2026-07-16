from http.server import BaseHTTPRequestHandler, HTTPServer

class AdminHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"CYBERACE{ssrf_service_interne_atteint}")

HTTPServer(("127.0.0.1", 9090), AdminHandler).serve_forever()
