#!/bin/bash
cd ~/hype-x/hypex-twa
for f in $(find . -name "*.keystore" -o -name "*.jks" 2>/dev/null); do
  echo "=== File: $f ==="
  for pass in android "" password changeme pwabuilder; do
    out=$(keytool -list -v -keystore "$f" -storepass "$pass" 2>/dev/null | grep "SHA256")
    if [ -n "$out" ]; then
      echo "$out"
      echo "(password was: '$pass')"
      break
    fi
  done
done
