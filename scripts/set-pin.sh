#!/bin/sh
# Sets the host PIN in the database (stored at /secret/hostPin, never readable by any browser).
# Usage:  npm run set-pin -- 2468
# Changing the PIN logs out every existing host session.
set -e
if [ -z "$1" ]; then
  echo "Usage: npm run set-pin -- <PIN>"
  exit 1
fi
firebase database:set /secret/hostPin --data "\"$1\"" --force
echo "Host PIN updated."
