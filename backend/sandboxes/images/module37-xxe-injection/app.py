from http.server import BaseHTTPRequestHandler, HTTPServer
from lxml import etree

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        data = self.rfile.read(length)
        try:
            parser = etree.XMLParser(resolve_entities=True, no_network=False)
            tree = etree.fromstring(data, parser=parser)
            result = tree.text or "(vide)"
        except Exception as e:
            result = str(e)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(result.encode(errors="replace"))

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Envoyez du XML en POST sur / pour analyse.")

HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
