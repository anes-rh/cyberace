#!/bin/bash
mkdir -p /var/run/dbus
dbus-daemon --system --fork
avahi-daemon --no-chroot
