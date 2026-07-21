#!/bin/bash
python3 /opt/serve_tls.py &
exec ttyd -p 7681 bash
