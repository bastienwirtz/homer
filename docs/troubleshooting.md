# Troubleshooting

## My custom service card doesn't work, nothing appears or offline status is displayed (pi-hole, sonarr, ping, ...)

You might by facing a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (Cross Origin Request Sharing) issue.
It happens when the targeted service is hosted on a different domain or port.
Web browsers will not allow to fetch information from a different site without explicit permissions (the targeted service
must include a special `Access-Control-Allow-Origin: *` HTTP headers).
If this happens your web console (`ctrl+shit+i` or `F12`) will be filled with this kind of errors:

```text
Access to fetch at 'https://<target-service>' from origin 'https://<homer>' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

To resolve this, you can either:

* Host all your target service under the same domain & port.
* Modify the target sever configuration so that the response of the server included following header- `Access-Control-Allow-Origin: *` (<https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests>). It might be an option in the targeted service, otherwise depending on how the service is hosted, the proxy or web server can seamlessly add it.
* Use a cors proxy sever like [`cors-container`](https://github.com/imjacobclark/cors-container), [`cors-anywhere`](https://github.com/Rob--W/cors-anywhere) or many others.


## I use a single sign on tool, like Authelia. How do I get the service calls to not hit the login page?

All the services use the JS `fetch` function. By default, a `fetch` call doesn't include the browser cookies that store your SSO session credentials. If you want to include cookie info in the API calls, you can add the global `fetchWithCredentials` attribute to your service item. Here's an example below for PiHole.

```yml
- name: "Pi-Hole"
  logo: "assets/icons/pihole.svg"
  url: "https://pihole.mydomain.com/admin"
  type: "PiHole"
  fetchWithCredentials: true
```

> **Note for developers:** Read the information in `docs/development.md` for how to make sure your service template works with `fetchWithCredentials`
