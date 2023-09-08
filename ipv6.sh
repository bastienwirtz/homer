#!/bin/sh

# Enable IPV6 if needed
if test -z "$IPV6_DISABLE"; then
	echo '$SERVER["socket"] == "[::]:" + env.PORT {  }'
fi
