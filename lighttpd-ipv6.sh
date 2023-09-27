#!/bin/sh

# Enable IPV6 if needed
if [[ "${IPV6_DISABLE}" != "1" ]]; then
	echo '$SERVER["socket"] == "[::]:" + env.PORT {  }'
fi
