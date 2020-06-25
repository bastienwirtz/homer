#!/bin/sh

if ! [ -f 'config.yml' ]; then
    echo '/www/config.yml not found. Using default config.' 1>&2
    cp config.yml.dist config.yml
fi

exec darkhttpd /www/ --no-listing --port "$PORT"
