#!/bin/bash
set -u
cd /challenge
exec ttyd -p 7681 -W bash --login
