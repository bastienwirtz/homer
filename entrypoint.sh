#!/bin/sh

yes n | cp -i /www/config.yml.dist /www/config.yml
while true; do echo n; done | cp -Ri /app/dist/www/assets /www/assets 2>/dev/null

darkhttpd /www/ --no-listing --port $PORT
