# Custom Services

Some service can use a specific a component that provides some extra features by adding a `type` key to the service yaml
configuration. Available services are in `src/components/`. Here is an overview of all custom services that are available 
within Homer.

## PiHole

Using the PiHole service you can display info about your local PiHole instance right on your Homer dashboard.

The following configuration is available for the PiHole service.

```
 items:
      - name: "Pi-hole"
        logo: "assets/tools/sample.png"
        # subtitle: "Network-wide Ad Blocking" # optional, if no subtitle is defined, PiHole statistics will be shown
        url: "http://192.168.0.151/admin"
        type: "PiHole"
```

## Medusa

This service displays News (grey), Warning (orange) or Error (red) notifications bubbles from the Medusa application.
Two lines are needed in the config.yml :
```
type: "Medusa"
apikey: "01234deb70424befb1f4ef6a23456789"
```
The url must be the root url of Medusa application.
The Medusa API key can be found in General configuration > Interface. It is needed to access Medusa API.


## Sonarr/Radarr

This service displays Activity (blue), Warning (orange) or Error (red) notifications bubbles from the Radarr/Sonarr application.
Two lines are needed in the config.yml :
```
type: "Radarr" or "Sonarr"
apikey: "01234deb70424befb1f4ef6a23456789"
```
The url must be the root url of Radarr/Sonarr application.
The Radarr/Sonarr API key can be found in Settings > General. It is needed to access the API.


## PaperlessNG

For Paperless you need an API-Key which you have to store at the item in the field `apikey`.


## Ping

For Paperless you need an API-Key which you have to store at the item in the field `apikey`.

### CORS Issues

If try you to "ping" services, which have a differ domain as the homer service then may you get a `Cross-Origin Request Blocked` messages (https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors).

Possible solutions:

* Modify the target sever configuration so that the response of the server included following header- `Access-Control-Allow-Origin: *` (https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests)

* Use a cors proxy sever  like `cors-container` (https://github.com/imjacobclark/cors-container)

#### Example docker compose file

```yml
---
version: "2"
services:
  homer:
    image: b4bz/homer
    #To build from source, comment previous line and uncomment below
    #build: .
    container_name: homer
    volumes:
      - /your/local/assets/:/www/assets
    ports:
      - 8080:8080
    #environment:
    #  - UID=1000
    #  - GID=1000
    restart: unless-stopped
  #The cors-container service which avoid "allow" cross-domain requests, can use with the CorsPing type
  cors-container:
    image: imjacobclark/cors-container:latest
    container_name: cors-container
    ports:
      - 3000:3000
    restart: unless-stopped
```
#### Example confiq.yml file

```yml
---
title: "Demo dashboard"
subtitle: "Homer"
logo: "logo.png"

header: true
footer: false

services:
  - name: "Applications"
    icon: "fas fa-cloud"
    items:
      - name: "Awesome app"
        type: Ping
        logo: "assets/tools/sample.png"
        subtitle: "Bookmark example"
        tag: "app"
        url: "https://www.reddit.com/r/selfhosted/"
      - name: "Github repo"
        type: CorsPing
        icon: "fab fa-github"
        tag: "app"
        url: "https://github.com/bastienwirtz/homer"
        # domain name and protocol (http/https) have to be the same as of the homer server
        cors_proxy: "http://localhost:3000/https://github.com/bastienwirtz/homer"
```
