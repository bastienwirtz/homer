# Troubleshooting

## My docker container refuse to start / is stuck at restarting

You might be facing a permission issue. First of all, check your container logs (adjust the container name if necessary): 

```sh
$ docker logs homer
[...]
Assets directory not writable. Check assets directory permissions & docker user or skip default assets install by setting the INIT_ASSETS env var to 0.
```

In this case you need to make sure your mounted assets directory have the same GID / UID the web server runs as (default 1000:1000), and that the read and write permission is granted for the user or the group.

You can either:

- Set the `PUID` / `PGID` env vars to the owner of your assets directory (ex: `-e PUID=1001 -e PGID=1001`). The container will fix the ownership of the assets directory for you on startup, then drop to that user.
- Update your assets directory permissions yourself (ex: `chown -R 1000:1000 /your/assets/folder/`, `chmod -R u+rw /your/assets/folder/`)
- Change the docker user by using the `--user` arguments with docker cli or `user: 1000:1000` with docker compose.

> [!NOTE]
>
> - **Do not** use the `UID` / `GID` env vars: they are build time only and have no effect at runtime. Use `PUID` / `PGID`, or the Docker `user` option.
> - `PUID` / `PGID` and the Docker `user` option are mutually exclusive. `--user` means the container never runs as root, so it cannot fix the ownership of the assets directory for you, and `PUID` / `PGID` are ignored (a warning is logged).
> - **Do not** use `0:0` as a `PUID` / `PGID` value, it would be a security risk. It is refused.

Check this [thread](https://github.com/bastienwirtz/homer/issues/459) for more information about debugging
permission issues.

## My config.yml shows up as a directory

Docker creates a **directory** when the host path of a bind mounted file does not exist yet, so mounting a single configuration file that has not been created first gives you a directory named `config.yml`:

```sh
$ docker logs homer
[...]
Error: /www/assets/config.yml is a directory, not a file.
Docker creates a directory when the host path of a bind mounted file does not exist.
Create the file on the host, remove the directory, then restart the container.
```

Create the file on the host first, remove the directory docker made, then restart the container:

```sh
docker compose down
rmdir /path/to/your/config.yml
curl -o /path/to/your/config.yml https://raw.githubusercontent.com/bastienwirtz/homer/main/public/assets/config.yml.dist
docker compose up -d
```

> [!TIP]
> Mounting the whole assets directory (`/path/to/assets:/www/assets`) instead of a single file avoids this entirely, and lets Homer install its default assets for you.

## My docker container exits immediately after dropping capabilities

By default the container starts as root, fixes the ownership of the assets directory, then drops to `PUID`:`PGID`. That requires the `CHOWN`, `SETUID` and `SETGID` [capabilities](https://docs.docker.com/engine/containers/run/#runtime-privilege-and-linux-capabilities), so dropping them (ex: `--cap-drop=ALL`, or the `restricted` Kubernetes [pod security standard](https://kubernetes.io/docs/concepts/security/pod-security-standards/)) makes the startup fail:

```sh
$ docker logs homer
[...]
su-exec: setgroups(1000): Operation not permitted   # SETUID / SETGID are missing
Starting as root requires the CHOWN capability, add it back or use the docker user option.
```

You can either:

- Add the required capabilities back (ex: `--cap-drop=ALL --cap-add=CHOWN --cap-add=SETUID --cap-add=SETGID`).
- Run the container with the docker `user` option (ex: `--user 1000:1000`). **This needs no capability at all**: the container never runs as root, so it never changes any ownership and never drops privileges. Your assets directory must already be readable and writable by that user.

> [!NOTE]
> If your assets directory is not readable by root (ex: mode `700` and owned by another user), the `DAC_OVERRIDE` capability is needed as well, otherwise only its top level is fixed and `Warning: some entries of /www/assets could not be chowned.` is logged.

## My service card doesn't work, nothing appears or offline status is displayed (pi-hole, sonarr, ping, ...)

You might be facing a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (Cross Origin Request Sharing) issue.
It happens when the targeted service is hosted on a different domain or port.
Web browsers will not allow to fetch information from a different site without explicit permissions (the targeted service
must include a special `Access-Control-Allow-Origin: *` HTTP headers).
If this happens your web console (`ctrl+shift+i` or `F12`) will be filled with this kind of errors:

```text
Access to fetch at 'https://<target-service>' from origin 'https://<homer>' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

To resolve this, you can either:

- Host all your target service under the same domain & port.
- Modify the target server configuration so that the response of the server included following header- `Access-Control-Allow-Origin: *` (<https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests>). It might be an option in the targeted service, otherwise depending on how the service is hosted, the proxy or web server can seamlessly add it.
- **Use a proxy** to add the necessary CORS headers (lot of options, some of them described [here](https://enable-cors.org/server.html). Also check [`CORSair`](https://github.com/bastienwirtz/corsair), a light and simple solution)

## I am using an authentication proxy and homer says I am offline

This should be a configuration issue.

- Make sure the option `connectivityCheck` is set to `true` in configuration.
- Check your proxy configuration, the expected behavior is to redirect user using a 302 to the login page when user is not authenticated.

## I put my API key into the OpenWeather service and it still isn't working

If you have just made an OpenWeatherMap account and/or a newly-made API key, there is a high chance that you need to wait for it to be activated (often a few hours). If after waiting it still doesn't work, make sure to check the location you have provided since it may be an invalid location.

For some basic debugging steps, you can:

- Check with a large city such as Amsterdam as the specified location within your configuration.
- Make sure your web browser is running the latest version of the homer configuration after updating the location (Ctrl + Shift + R).
- Check for errors within the browser console (Ctrl + Shift + I) relating to api.openweathermap.org
