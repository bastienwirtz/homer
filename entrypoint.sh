#!/bin/sh

# Ensure default assets are present.
while true; do echo n; done | cp -Ri /www/default-assets/* /www/assets/ &> /dev/null

# Ensure compatibility with previous version (config.yml was in the root directory)
if [ -f "/www/config.yml" ]; then
    yes n | cp -i /www/config.yml /www/assets/ &> /dev/null
fi

# Install default config if no one is available.
yes n | cp -i /www/default-assets/config.yml.dist /www/assets/config.yml &> /dev/null

# Create symbolic link for hosting in subfolder.
if [[ -n "${SUBFOLDER}" ]]; then
  ln -s /www "/www/$SUBFOLDER"
  chown -h $USER:$GROUP "/www/$SUBFOLDER"
fi

chown -R $UID:$GID /www/assets
exec su-exec $UID:$GID darkhttpd /www/ --no-listing --port "$PORT"
