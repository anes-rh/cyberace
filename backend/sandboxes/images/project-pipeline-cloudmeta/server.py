#!/usr/bin/env python3
"""IMDS simulé (endpoint de métadonnées cloud). Sert des identifiants IAM
temporaires dérivés de FLAG_SUFFIX — mêmes valeurs que le root MinIO de
cloud-storage, donc réellement utilisables pour l'exfiltration finale."""
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

SUFFIX = os.environ.get("FLAG_SUFFIX", "static0")
ROLE = "pipeline-deploy-role"
ACCESS = f"AKIAGHOST{SUFFIX}"
SECRET = f"wJalr{SUFFIX}PIPELINEftKEY"
CREDS = {
    "Code": "Success",
    "Type": "AWS-HMAC",
    "LastUpdated": "2026-01-01T00:00:00Z",
    "AccessKeyId": ACCESS,
    "SecretAccessKey": SECRET,
    "Token": f"FQoGZXIvGhost{SUFFIX}SessionToken",
    "Expiration": "2030-01-01T00:00:00Z",
}
BASE = "/latest/meta-data/iam/security-credentials"


class Handler(BaseHTTPRequestHandler):
    def _send(self, body, code=200, ctype="text/plain"):
        data = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Server", "EC2ws")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = self.path.rstrip("/") or "/"
        if path == BASE:
            self._send(ROLE)
        elif path == f"{BASE}/{ROLE}":
            self._send(json.dumps(CREDS, indent=2), ctype="application/json")
        elif path == "/latest/meta-data/iam/info":
            self._send(json.dumps({"InstanceProfileArn": f"arn:aws:iam::000000000000:instance-profile/{ROLE}"}))
        elif path in ("/", "/latest", "/latest/meta-data", "/latest/meta-data/iam"):
            self._send("iam\nsecurity-credentials\n")
        else:
            self._send("Not Found", code=404)

    def log_message(self, *args):
        return


if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 80), Handler).serve_forever()
