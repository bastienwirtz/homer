# Troubleshooting

## My docker container refuse to start / is stuck at restarting.

You might be facing a permission issue. First of all, check your container logs (adjust the container name if necessary): 

```sh
$ docker logs homer
[...]
Assets directory not writable. Check assets directory permissions & docker user or skip default assets install by setting the INIT_ASSETS env var to 0
```

In this case you need to make sure your mounted assests directory have the same GID / UID the container user have (default 1000:1000), and that the read and write permission is granted for the user or the group.

You can either: 
- Update your assets directory permissions (ex: `chown -R 1000:1000 /your/assets/folder/`, `chmod -R u+rw /your/assets/folder/`)
- Change the docker user by using the `--user` arguments with docker cli or `user: 1000:1000` with docker compose.

⚠️ Notes: 

- **Do not** use env var to set the GID / UID of the user running container. Use the Docker `user` option.
- **Do not** use 0:0 as a user value, it would be a security risk, and it's not guaranty to work.

Check this [thread](https://github.com/bastienwirtz/homer/issues/459) for more information about debugging
permission issues.

## My custom service card doesn't work, nothing appears or offline status is displayed (pi-hole, sonarr, ping, ...)

You might be facing a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (Cross Origin Request Sharing) issue.
It happens when the targeted service is hosted on a different domain or port.
Web browsers will not allow to fetch information from a different site without explicit permissions (the targeted service
must include a special `Access-Control-Allow-Origin: *` HTTP headers).
If this happens your web console (`ctrl+shift+i` or `F12`) will be filled with this kind of errors:

```text
Access to fetch at 'https://<target-service>' from origin 'https://<homer>' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

To resolve this, you can either:

* Host all your target service under the same domain & port.
* Modify the target server configuration so that the response of the server included following header- `Access-Control-Allow-Origin: *` (<https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests>). It might be an option in the targeted service, otherwise depending on how the service is hosted, the proxy or web server can seamlessly add it.
* Use a cors proxy server like [`cors-container`](https://github.com/imjacobclark/cors-container), [`cors-anywhere`](https://github.com/Rob--W/cors-anywhere) or many others.

## I am using an authentication proxy and homer says I am offline

This should be a configuration issue.
* Make sure the option `connectivityCheck` is set to `true` in configuration.
* Check your proxy configuration, the expected behavior is to redirect user using a 302 to the login page when user is not authenticated.

## I put my API key into the OpenWeather service and it still isn't working

If you have just made an OpenWeatherMap account and/or a newly-made API key, there is a high chance that you need to wait for it to be activated (often a few hours). If after waiting it still doesn't work, make sure to check the location you have provided since it may be an invalid location.

For some basic debugging steps, you can: 
* Check with a large city such as Amsterdam as the specified location within your configuration.
* Make sure your web browser is running the latest version of the homer configuration after updating the location (Ctrl + Shift + R).
* Check for errors within the browser console (Ctrl + Shift + I) relating to api.openweathermap.org
