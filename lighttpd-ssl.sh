#!/bin/sh

# Enable SSL if needed
if [[ "${SSL_ENABLE}" == "1" ]]; then
        echo 'ssl.engine = "enable"'                                                                                                                                                                                                                                echo 'ssl.pemfile = "/www/certificate.pem"'
fi
