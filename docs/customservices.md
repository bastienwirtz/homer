# Smart cards

Smart cards provide specific integrations for external services. They display additional information and extra features beyond basic service card. Smart cards are enabled by adding a `type` key to the service item in your YAML configuration.

Each service integration has different requirements and may need additional configuration parameters (see card list below).

> [!WARNING]  
> Your `config.yml` file is exposed at `/assets/config.yml` via HTTP. Any sensitive information (like API keys)
> in this file is visible to anyone who can access your Homer instance. Only include API keys if your Homer
> instance is protected by authentication or access controls **or use a proxy like [`CORSair`](https://github.com/bastienwirtz/corsair)
>  to inject your credentials safely**, using environment variable on the server side. 

Available services are located in `src/components/`:

- [Common options](#common-options)
- [AdGuard Home](#adguard-home)
- [CopyToClipboard](#copy-to-clipboard)
- [Docuseal](#docuseal)
- [Docker Socket Proxy](#docker-socket-proxy)
- [Emby / Jellyfin](#emby--jellyfin)
- [FreshRSS](#freshrss)
- [Gatus](#gatus)
- [Gitea / Forgejo](#gitea--forgejo)
- [Glances](#glances)
- [Gotify](#gotify)
- [Healthchecks](#healthchecks)
- [Home Assistant](#home-assistant)
- [Immich](#immich)
- [Jellystat](#jellystat)
- [Lidarr, Prowlarr, Sonarr, Readarr and Radarr](#lidarr-prowlarr-sonarr-readarr-and-radarr)
- [Linkding](#linkding)
- [Matrix](#matrix)
- [Mealie](#mealie)
- [Medusa](#medusa)
- [Miniflux](#miniflux)
- [Nextcloud](#nextcloud)
- [OctoPrint / Moonraker](#octoprintmoonraker)
- [Olivetin](#olivetin)
- [OpenHAB](#openhab)
- [OpenWeatherMap](#openweathermap)
- [Paperless-NGX](#paperlessng)
- [PeaNUT](#peanut)
- [PiAlert](#pialert)
- [PiHole](#pihole)
- [Ping](#ping)
- [Plex](#plex)
- [Portainer](#portainer)
- [Prometheus](#prometheus)
- [Proxmox](#proxmox)
- [qBittorrent](#qbittorrent)
- [rTorrent](#rtorrent)
- [SABnzbd](#sabnzbd)
- [Scrutiny](#scrutiny)
- [Speedtest Tracker](#speedtesttracker)
- [Tautulli](#tautulli)
- [Tdarr](#tdarr)
- [Traefik](#traefik)
- [Transmission](#transmission)
- [TrueNas Scale](#truenas-scale)
- [Uptime Kuma](#uptime-kuma)
- [Vaultwarden](#vaultwarden)
- [Wallabag](#wallabag)
- [What's Up Docker](#whats-up-docker)

> [!IMPORTANT]  
> Smart cards that interact with external services are subject to CORS restrictions, therefore require one of the following:
>
> - All services hosted on the **same domain** as Homer (mydomain.tld/pihole, mydomain.tld/proxmox) to avoid cross-domain request entirely.
> - All services configured to **accept cross-site requests** by sending the necessary CORS headers (either directly in service configuration or via proxy).
> - **Use a proxy** to add the necessary CORS headers (lot of options, some of them described [here](https://enable-cors.org/server.html). Also check [`CORSair`](https://github.com/bastienwirtz/corsair), a light and simple solution)
>
> If you experience any issues, see the [troubleshooting](troubleshooting.md#my-service-card-doesnt-work-nothing-appears-or-offline-status-is-displayed-pi-hole-sonarr-ping-) page.

## Common options

```yaml
- name: "My Service"
  type: "<type>"
  logo: "assets/tools/sample.png" # Optional
  url: https://my-service.url # Optional: Card link and API base url unless 'endpoint' is provided (see below) 
  endpoint: https://my-service-api.url # Optional: alternative base URL used to fetch service data when necessary.
  useCredentials: false # Optional: Override global proxy.useCredentials configuration.
  headers: # Optional: Override global proxy.headers configuration.
```

If a subtitle is provided, (using the `subtitle` configuration key), **it will override (hide)** any custom information displayed on the subtitle line by the custom integration.

## AdGuard Home

Displays AdGuard Home protection status and blocked query statistics.

```yaml
- name: "AdGuard Home"
  type: "AdGuardHome"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
```

> **Note**: If AdGuard Home’s web user is password-protected, you must pass Authorization HTTP header along with all requests. It can be done using a proxy or adding the following to the item configuration:
>
> ```yaml  
> headers:  
>   Authorization: "Basic <base64-encoded for username:password>"
> ```

## Copy to Clipboard

Displays a service card with a copy button that copies the specified text to your clipboard when clicked.

```yaml
- name: "Copy me!"
  type: "CopyToClipboard"
  logo: "assets/tools/sample.png"
  subtitle: "Click the copy icon to copy text"
  clipboard: "this text will be copied to your clipboard"
  url: "https://optional-link.com" # optional: opens when clicking the card (not the copy button)
```

## Docker Socket Proxy

Displays counts of running, stopped, and error containers from Docker Socket Proxy.

```yaml
- name: "Docker"
  type: "DockerSocketProxy"
  logo: "assets/tools/sample.png"
  endpoint: "https://my-service-api.url:port"
```

## Docuseal

Displays the Docuseal version.

```yaml
- name: Docuseal
  type: Docuseal
  logo: "assets/tools/sample.png"
  url: https://my-service.url
```

## Emby / Jellyfin

Displays stats from your Emby or Jellyfin server.
The `libraryType` configuration let you choose which stats to show.

```yaml
- name: "Emby"
  type: "Emby"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
  libraryType: "music" # Choose which stats to show. Can be one of: music, series or movies.
```

## FreshRSS

Displays unread article count and total subscriptions from your FreshRSS server.

```yaml
- name: "FreshRSS"
  type: "FreshRSS"
  url: https://my-service.url
  updateInterval: 5000 # (Optional) Interval (in ms) for updating the stats
  username: "<---your-username--->"
  password: "<---your-password--->"
```

## Gatus

The Gatus service displays information about the configured services from the defined Gatus server.
Two lines are needed in the config.yml :

```yaml
  type: "Gatus"
  url: "http://192.168.0.151/gatus"

```

Optionally, the results can be filtered to only include jobs in the defined groups:
```yaml
  groups: [Services, External]
```

The status can be checked regularly by defining an update Interval in ms:
```yaml
  updateInterval: 5000
```

The average times can be hidden (saves their calculation also) by setting the following:
```yaml
  hideaverages: true
```

## Gitea / Forgejo

Displays a Gitea / Forgejo version.

```yaml
- name: Forgejo
  type: Gitea
  logo: "assets/tools/sample.png"
  url: https://my-service.url
```

## Glances

Displays system metrics (CPU, memory, swap, load) from a Glances server.

```yaml
- name: "System Metrics"
  type: "Glances"
  icon: "fa-solid fa-heart-pulse"
  url: https://my-service.url
  stats: [cpu, mem] # Options: load, cpu, mem, swap
```

If you don't already have a glances server up and running, here is a sample Docker compose file to get you started:

```yml
---
services:
  glances:
    image: nicolargo/glances:latest
    container_name: glances
    environment:
      - TZ=Europe/Rome
      - GLANCES_OPT=-w
    ports:
      - 61208:61208
    restart: unless-stopped
```

## Gotify

Displays the number of outstanding messages and system health status.

```yaml
- name: "Gotify"
  type: "Gotify"
  url: https://my-service.url
  apikey: "<---insert-client-token-here--->"
```

**API Token**: Use a **client token** (not an app token).

## Healthchecks

Displays status counts (up/down/grace) from your Healthchecks monitoring service.

```yaml
- name: "Healthchecks"
  type: "Healthchecks"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
```

**API Key**: Found in Healthchecks web interface under **Settings > API Access > API key (read-only)**.

## Home Assistant

Displays Home Assistant instance status, version, location, and entity count.

```yaml
- name: "Home Assistant"
  type: "HomeAssistant"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-long-lived-access-token-here--->"
  items: [] # optional: "name", "version", "entities"
  separator: " " # optional
```

**API Token**: Create a long-lived access token in Home Assistant:
1. Go to **Profile > Security > Long-lived access tokens**
2. Click **Create Token**

**CORS Configuration**: Edit Home Assistant `configuration.yml` and add Homer's IP:
```yaml
http:
  cors_allowed_origins:
    - "http://homer.local:8080"
    - "https://your-homer-domain.com"
```

## Immich

Displays user count, photo/video counts, and storage usage from your Immich server.

```yaml
- name: "Immich"
  type: "Immich"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
```

**Requirements**: Immich server version `1.118.0` or later
**API Key**: Create an API key in Immich web interface under **Administration > API Keys**

## Jellystat

Display the number of concurrent streams on your jellyfin server.

```yaml
- name: "Jellystat"
  type: "Jellystat"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
```

**API Key**: You can create an API key in the dashboard of you jellystat server: settings/API Keys -> Add Key


## Lidarr, Prowlarr, Sonarr, Readarr and Radarr

Displays Activity (blue), Missing (purple) Warning (orange) or Error (red) notifications bubbles from the Lidarr, Readarr, Radarr or Sonarr application.
Two lines are needed in the `config.yml`:

```yaml
- name: "Lidarr"
  type: "Lidarr" # "Lidarr" "Prowlarr", "Radarr" or "Sonarr"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  checkInterval: 5000 # (Optional) Interval (in ms) for updating the status
  apikey: "<---insert-api-key-here--->"
```

The url must be the root url of Lidarr, Prowlarr, Readarr, Radarr or Sonarr application.

**API Key**:  The Lidarr, Prowlarr, Readarr, Radarr or Sonarr API key can be found in `Settings` > `General`. It is needed to access the API.

> [!IMPORTANT]  
> **Radarr API V3 support**: If you are using an older version of Radarr or Sonarr which don't support the new V3 api endpoints, add the following line to your service config `"legacyApi: true"`

## Linkding

This integration makes it possible to query Linkding and list multiple results from Linkding.
Linkding has to be configured with CORS enabled. Linkding does not support that, but a reverse proxy in front can fix that.
This integration supports at max 15 results from Linkding, but you can add it multiple times to you dashboard with different queries to retrieve what you need.

```yaml
- name: "Linkding"
  type: "Linkding"
  url: https://my-service.url
  token: "<---insert-api-key-here--->"
  limit: 10 # Maximum number of items returned by Linkding, minimal 1 and max 15
  query: "#ToDo #Homer" # query to do on Linkding. Use #tagname to search for tags
```

## Matrix

Displays a Matrix version, and shows if the server is online.

```yaml
- name: "Matrix - Server"
  type: "Matrix"
  logo: "assets/tools/sample.png"
  url: "http://matrix.example.com"
```

## Mealie

Displays the number of recipes Mealie is keeping organized or the planned meal for today if one is planned.

```yaml
- name: "Mealie"
  type: "Mealie"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
```

**API Key**: You will have to set an API key in the field `apikey` which can be created in your Mealie installation.
The API page can be found: Click on hamburger menu -> Click on your profile -> Click on "Manage your API Tokens"

## Medusa

Displays News (grey), Warning (orange) or Error (red) notifications bubbles from the Medusa application.

```yaml
- name: "Medusa"
  type: "Medusa"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
```

The url must be the root url of Medusa application.

**API Key**: The Medusa API key can be found in General configuration > Interface. It is needed to access Medusa API.

## Miniflux

Displays the number of unread articles from your Miniflux RSS reader.

```yaml
- name: "Miniflux"
  type: "Miniflux"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
  style: "status" # Either "status" or "counter"
  checkInterval: 60000 # Optional: Interval (in ms) for updating the unread count
```

**API Key**: Generate an API key in Miniflux web interface under **Settings > API Keys > Create a new API key**

## Nextcloud

Displays Nextcloud version and shows if Nextcloud is online, offline, or in [maintenance
mode](https://docs.nextcloud.com/server/stable/admin_manual/maintenance/upgrade.html#maintenance-mode).

```yaml
- name: Nextcloud
  type: Nextcloud
  logo: assets/tools/sample.png
  url: https://my-service.url
```

## OctoPrint/Moonraker

The OctoPrint/Moonraker service only needs an `apikey` & `endpoint` and optionally a `display` or `url` option. `url` can be used when you click on the service it will launch the `url`
Moonraker's API mimmicks a few of OctoPrint's endpoints which makes these services compatible. See <https://moonraker.readthedocs.io/en/latest/web_api/#octoprint-api-emulation> for details.

```yaml
- name: "Octoprint"
  type: "OctoPrint"
  logo: assets/tools/sample.png
  endpoint: "https://my-service-api.url:port"
  apikey: "<---insert-api-key-here--->"
  display: "text" # 'text' or 'bar'. Default to `text`.
  
```

## Olivetin

Displays a Olivetin version.

```yaml
- name: Olivetin
  type: Olivetin
  logo: assets/tools/sample.png
  url: https://my-service.url
```

## OpenHAB

Displays OpenHAB system status, things count, and items count.

```yaml
- name: "OpenHAB"
  type: "OpenHAB"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
  things: true # query things API for counts
  items: true  # query items API for counts
```

**API Token**: Create an API token following the [official OpenHAB documentation](https://www.openhab.org/docs/configuration/apitokens.html)

**CORS Configuration**: Edit `services/runtime.cfg` and add:

```ini
org.openhab.cors:enable=true
```

## OpenWeatherMap

Using the OpenWeatherMap service you can display weather information about a given location.
The following configuration is available for the OpenWeatherMap service:

```yaml
- name: "Weather"
  type: "OpenWeather"
  apikey: "<---insert-api-key-here--->" # Request one from https://openweathermap.org/api.
  location: "Amsterdam" # your location.
  locationId: "2759794" # Optional: Specify OpenWeatherMap city ID for better accuracy
  units: "metric" # units to display temperature. Can be one of: metric, imperial, kelvin. Defaults to kelvin.
  background: "square" # choose which type of background you want behind the image. Can be one of: square, circle, none. Defaults to none.
  
```

**Remarks:**
If for some reason your city can't be found by entering the name in the `location` property, you could also try to configure the OWM city ID in the `locationId` property. To retrieve your specific City ID, go to the [OWM website](https://openweathermap.org), search for your city and retrieve the ID from the URL (for example, the City ID of Amsterdam is 2759794).

## Paperless-NGX

Displays total number of documents stored.

```yaml
- name: "Paperless"
  type: "PaperlessNG"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
```

**API Key**: API key can be generated in Settings > Administration > Auth Tokens

## PeaNUT

Displays current status and UPS load of the UPS device.

```yaml
- name: "PeaNUT"
  type: PeaNUT
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  # device: "ups" # The ID of the device
```

## PiAlert

Displays stats from your PiAlert server.

```yaml
- name: "PiAlert"
  type: "PiAlert"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  updateInterval: 5000 # (Optional) Interval (in ms) for updating the stats
```

## PiHole

Displays info about your local PiHole instance right on your Homer dashboard.

```yaml
- name: "Pi-hole"
  type: "PiHole"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  # endpoint: "https://my-service-api.url" # optional, For v6 API, this is the base URL used to fetch Pi-hole data overwriting the url
  apikey: "<---insert-api-key-here--->" # optional, needed if web interface is password protected
  apiVersion: 5 # optional, defaults to 5. Use 6 if your PiHole instance uses API v6
  checkInterval: 3000 # optional, defaults to 300000. interval in ms to check Pi-hole status
```

**API Key**: Required only if Pi-hole web interface is password protected. Go to **Settings > API/Web Interface > Show API token**

**API Versions**:

- **v5** (default): Uses legacy API endpoints
- **v6**: Uses modern API with session management - set `apiVersion: 6`

## Ping

Checks if the target link is available and displays the round trip time (RTT) of the request.
By default the HEAD method is used but it can be configured to use GET using the optional `method` property.
Optionally, use `successCodes` to define which HTTP response status codes should be considered as available status.

```yaml
- name: "Awesome app"
  type: Ping
  logo: "assets/tools/sample.png"
  url: "https://www.wikipedia.org/"
  # method: "head"
  # successCodes: [200, 418] # Optional, default to all 2xx HTTP response status codes
  # timeout: 500 # Timeout in ms before ping is aborted. Default 2000
  # subtitle: "Bookmark example" # By default, request round trip time is displayed when subtitle is not set
  # updateInterval: 5000 # (Optional) Interval (in ms) for updating ping status
```

## Plex

Displays active streams, total movies, and total TV series from your Plex server.

```yaml
- name: "Plex"
  type: "Plex"
  logo: "assets/tools/sample.png"
  url: "https://my-service.url/web"
  endpoint: "https://my-service.url"
  token: "<---insert-plex-token-here--->"
```

**Plex Token**: See [How to find your Plex token](https://www.plexopedia.com/plex-media-server/general/plex-token/)

## Portainer

Displays container counts (running/dead/misc), version, and online status from your Portainer instance.

```yaml
- name: "Portainer"
  type: "Portainer"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
  environments: # optional: specific environments to check
    - "raspberry"
    - "local"
```

**Requirements**: Portainer version 1.11 or later

**API Key**: Generate an access token in Portainer UI. See [Creating an Access Token](https://docs.portainer.io/api/access#creating-an-access-token)

## Prometheus

```yaml
- name: "Prometheus"
  type: "Prometheus"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
```

## Proxmox

Displays status information of a Proxmox node (VMs running and disk, memory and cpu used). 

```yaml
- name: "Proxmox - Node"
  type: "Proxmox"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  node: "your-node-name"
  warning_value: 50
  danger_value: 80
  api_token: "PVEAPIToken=root@pam!your-api-token-name=your-api-token-key"
  # values below this line are optional (default value are false/empty):
  hide_decimals: true # removes decimals from stats values.
  hide: [] # hides information. Possible values are "vms", "vms_total", "lxcs", "lxcs_total", "disk", "mem" and "cpu".
  small_font_on_small_screens: true # uses small font on small screens (like mobile)
  small_font_on_desktop: true # uses small font on desktops (just in case you're showing much info)
```

**API Key**: You can set it up in Proxmox under Permissions > API Tokens. You also need to know the realm the user of the API Token is assigned to (by default pam).

The API Token (or the user assigned to that token if not separated permissions is checked) are this:

| Path                | Permission | Comments                                                          |
|---------------------|------------|-------------------------------------------------------------------|
| /nodes/\<your-node> | Sys.Audit  |                                                                   |
| /vms/\<id-vm>       | VM.Audit   | You need to have this permission on any VM you want to be counted |

It is highly recommended that you create and API Token with only these permissions on a read-only mode.

## qBittorrent

Displays the global upload and download rates, as well as the number of torrents
listed. The service communicates with the qBittorrent API interface which needs
to be accessible from the browser. Please consult
[the instructions](https://github.com/qbittorrent/qBittorrent/pull/12579)
for setting up qBittorrent.

```yaml
- name: "qBittorrent"
  type: "qBittorrent"
  logo: "assets/tools/sample.png"
  url: https://my-service.url # Your rTorrent web UI, f.e. ruTorrent or Flood.
  rateInterval: 2000 # Interval for updating the download and upload rates.
  torrentInterval: 5000 # Interval for updating the torrent count.
```

## rTorrent

Displays the global upload and download rates, as well as the number of torrents
listed in rTorrent. The service communicates with the rTorrent XML-RPC interface which needs
to be accessible from the browser. Please consult
[the instructions](https://github.com/rakshasa/rtorrent-doc/blob/master/RPC-Setup-XMLRPC.md)
for setting up rTorrent.

```yaml
- name: "rTorrent"
  type: "Rtorrent"
  logo: "assets/tools/sample.png"
  url: "https://my-service.url" # Your rTorrent web UI, f.e. ruTorrent or Flood.
  xmlrpc: "https://my-service.url:port" # Reverse proxy for rTorrent's XML-RPC.
  rateInterval: 5000 # Interval for updating the download and upload rates.
  torrentInterval: 60000 # Interval for updating the torrent count.
  username: "username" # Username for logging into rTorrent (if applicable).
  password: "password" # Password for logging into rTorrent (if applicable).
```

## SABnzbd

Displays the number of currently active downloads on your SABnzbd instance. 

```yaml
- name: "SABnzbd"
  type: "SABnzbd"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  apikey: "<---insert-api-key-here--->"
  downloadInterval: 5000 # (Optional) Interval (in ms) for updating the download count
```

**API Key**: An API key is required, and can be obtained from the "Config" > "General" section of the SABnzbd config in the web UI.

## Scrutiny

Displays info about the total number of disk passed and failed S.M.A.R.T and scrutiny checks

```yaml
- name: "Scrutiny"
  type: "Scrutiny"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  updateInterval: 5000 # (Optional) Interval (in ms) for updating the status
```

## SpeedtestTracker

Displays the download and upload speeds in Mbit/s and the ping in ms.

```yaml
- name: "Speedtest Tracker"
  type: "SpeedtestTracker"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
```

## Tautulli

Displays the number of currently active streams on you Plex instance.

```yaml
- name: "Tautulli"
  type: "Tautulli"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  checkInterval: 5000 # (Optional) Interval (in ms) for updating the status  
  apikey: "<---insert-api-key-here--->"
```

**API Key**: An API key is required, and can be obtained from the "Web Interface" section of settings on the Tautulli web UI.

Because the service type and link don't necessarily have to match, you could
even make the service type Tautulli on your Plex card and provide a separate
endpoint pointing to Tautulli!

```yaml
- name: "Plex"
  type: "Tautulli"
  logo: "assets/tools/sample.png"
  url: https://my-plex.url/web # Plex
  endpoint: https://my-tautulli.url # Tautulli
  apikey: "<---insert-api-key-here--->"
```

## Tdarr

Displays the number of currently queued items for transcoding on your Tdarr instance as well as the number of errored items.

```yaml
- name: "Tdarr"
  type: "Tdarr"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  checkInterval: 5000 # (Optional) Interval (in ms) for updating the queue & error counts
```

## Traefik

Displays Traefik.

```yaml
- name: "Traefik"
  type: "Traefik"
  logo: "assets/tools/sample.png"
  url: "http://traefik.example.com"
  # basic_auth: "admin:password"  # (Optional) Send Authorization header. 
```

**Authentication**: If BasicAuth is set, credentials will be encoded in Base64 and sent as an Authorization header (`Basic <encoded_value>`). The value must be formatted as "admin:password".

## Transmission

Displays the global upload and download rates, as well as the number of active torrents from your Transmission daemon. 
The service communicates with the Transmission RPC interface which needs to be accessible from the browser.

```yaml
- name: "Transmission"
  logo: "assets/tools/sample.png"
  url: "http://192.168.1.2:9091" # Your Transmission web interface URL
  type: "Transmission"
  auth: "username:password" # Optional: HTTP Basic Auth
  interval: 5000 # Optional: Interval for refreshing data (ms)
  target: "_blank" # Optional: HTML a tag target attribute
```

The service automatically handles Transmission's session management and CSRF protection.

## Truenas Scale

Displays TrueNAS version.

```yaml
- name: "Truenas"
  type: "TruenasScale"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  api_token: "<---insert-api-key-here--->"
```

## Uptime Kuma

Displays overall status, uptime percentage, and incident information from your Uptime Kuma status page.

```yaml
- name: "Uptime Kuma"
  type: "UptimeKuma"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  slug: "default" # status page slug, defaults to "default"
```

**Requirements**: Uptime Kuma version `1.13.1` or later (for [multiple status pages support](https://github.com/louislam/uptime-kuma/releases/tag/1.13.1))

## Vaultwarden

Displays Vaultwarden version and status.

```yaml
- name: "Vaultwarden - Server"
  type: "Vaultwarden"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
```

## Wallabag

Displays Wallabag version.

```yaml
- name: Wallabag
  type: Wallabag
  logo: "assets/tools/sample.png"
  url: https://my-service.url
```

## What's up Docker

Display info about the number of container running and the number for which an update is available on your Homer dashboard.

```yaml
- name: "What's Up Docker"
  type: "WUD"
  logo: "assets/tools/sample.png"
  url: https://my-service.url
  subtitle: "Docker image update notifier"
```
