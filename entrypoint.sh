#!/bin/sh

# When started as root, fix the assets ownership then drop to PUID:PGID.
if [ -z "${HOMER_PRIVDROP_DONE}" ]; then
    if [ "$(id -u)" = "0" ]; then
        PUID="${PUID:-1000}"
        PGID="${PGID:-1000}"

        if [ "${PUID}" = "0" ] || [ "${PGID}" = "0" ]; then
            echo "Refusing to run the web server as root: set PUID/PGID to a non-zero user."
            exit 1
        fi

        # The access log reopens this fifo by path (/dev/fd/3), and docker leaves it owned by root
        if ! chown "${PUID}:${PGID}" /proc/self/fd/1 2>/dev/null; then
            echo "Unable to change the ownership of the container output."
            echo "Starting as root requires the CHOWN capability, add it back or use the docker user option."
            exit 1
        fi
        chown "${PUID}:${PGID}" /proc/self/fd/2 2>/dev/null || true

        # Probe first: `chown -R` on a read-only mount errors once per file.
        if chown "${PUID}:${PGID}" /www/assets 2>/dev/null; then
            chown -R "${PUID}:${PGID}" /www/assets 2>/dev/null ||
                echo "Warning: some entries of /www/assets could not be chowned."
        else
            echo "Warning: unable to change the ownership of /www/assets, continuing anyway."
            echo "Is the volume mounted as read-only?"
        fi

        echo "Switching to ${PUID}:${PGID}"
        export HOMER_PRIVDROP_DONE=1
        # Not executable, it has to go through the shell.
        exec su-exec "${PUID}:${PGID}" /bin/sh "$0" "$@"
    elif [ -n "${PUID}${PGID}" ]; then
        echo "Warning: PUID/PGID are set but the container is not running as root, ignoring them."
    fi
fi

if [ "${INIT_ASSETS}" = "1" ]; then
    # `test -w` reports a read-only mount as writable on busybox, so try for real.
    if touch /www/assets/.write-test 2>/dev/null; then
        rm -f /www/assets/.write-test

        # Copy file by file: `cp -n` skips a whole directory when the destination one already exists
        # Docker creates a new directory when the host path of a bind mounted file does not exist
        (
            cd /www/default-assets || exit
            find . -type f | while read -r file; do
                if [ ! -e "/www/assets/${file}" ]; then
                    mkdir -p "/www/assets/$(dirname "${file}")"
                    cp "${file}" "/www/assets/${file}"
                fi
            done
        )

        if [ -d "/www/assets/config.yml" ]; then
            echo "Error: /www/assets/config.yml is a directory, not a file."
            echo "Docker creates a directory when the host path of a bind mounted file does not exist."
            echo "Create the file on the host, remove the directory, then restart the container."
        elif [ ! -f "/www/assets/config.yml" ]; then
            echo "No configuration found, installing the default one."
            cp /www/default-assets/config.yml.dist /www/assets/config.yml
        fi
    else
        echo "Assets directory not writable. Check assets directory permissions & docker user or skip default assets install by setting the INIT_ASSETS env var to 0."
    fi
fi

echo "Starting webserver"
exec 3>&1
exec lighttpd -D -f /lighttpd.conf
