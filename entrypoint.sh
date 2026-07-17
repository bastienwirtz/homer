#!/bin/sh

# Substitute env vars so they can be available at runtime. Note that Vite only exposes environment
# variables prefixed with "VITE_" at build time, so that behaviour is replicated here.
env \
  | grep '^VITE_' \
  | sed 's/=\(.*\)/=\1/' \
  | awk -F= '{print "window.env." $1 " = \"" $2 "\";"}' \
  > /tmp/env.lines.js

# Replace the placeholder in the template with our env vars
sed '/__VITE_INJECT__/r /tmp/env.lines.js' \
  /www/scripts/env.template.js \
  | envsubst \
  > /www/scripts/env.js
sed -i 's/__VITE_INJECT__//' /www/scripts/env.js

# Default assets & example configuration installation
if [[ "${INIT_ASSETS}" == "1" ]] && [[ ! -f "/www/assets/config.yml" ]]; then
    echo "No configuration found, installing default config & assets"
    if [[ -w "/www/assets/" ]];
    then
        while true; do echo n; done | cp -Ri /www/default-assets/* /www/assets/
        yes n | cp -i /www/default-assets/config.yml.dist /www/assets/config.yml
    else
        echo "Assets directory not writable, skipping default config install.";
        echo "Check assets directory permissions & docker user or skip default assets install by setting the INIT_ASSETS env var to 0."
    fi
fi

echo "Starting webserver"
exec 3>&1
exec lighttpd -D -f /lighttpd.conf
