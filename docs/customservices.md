# Custom Services

Some service can use a specific a component that provides some extra features by adding a `type` key to the service yaml
configuration and, where applicable, an apikey. Note that config.yml is exposed at /assets/config.yml via HTTP and any
apikey included in the configuration file is exposed to anyone who can access the homer instance. Only include an apikey
if your homer instance is secured behind some form of authentication or access restriction.

Available services are in `src/components/`. Here is an overview of all custom services that are available
within Homer:
+ [PiHole](#pihole)
+ [OpenWeatherMap](#openweathermap)
+ [Medusa](#medusa)
+ [Lidarr, Prowlarr, Sonarr and Radarr](#lidarr-prowlarr-sonarr-and-radarr)
+ [PaperlessNG](#paperlessng)
+ [Ping](#ping)
+ [Prometheus](#prometheus)
+ [AdGuard Home](#adguard-home)
+ [Portainer](#portainer)
+ [Emby](#emby)

If you experiencing any issue, please have a look to the [troubleshooting](troubleshooting.md) page.


## Common options

```yaml
- name: "My Service"
  logo: "assets/tools/sample.png"
  url: "http://my-service-link"
  endpoint: "http://my-service-endpoint" # Optional: alternative base URL used to fetch service data is necessary.
  useCredentials: false # Optional: Override global proxy.useCredentials configuration.
  type: "<type>"
```

## PiHole

Using the PiHole service you can display info about your local PiHole instance right on your Homer dashboard.

The following configuration is available for the PiHole service.

```yaml
- name: "Pi-hole"
  logo: "assets/tools/sample.png"
  # subtitle: "Network-wide Ad Blocking" # optional, if no subtitle is defined, PiHole statistics will be shown
  url: "http://192.168.0.151/admin"
  type: "PiHole"
```

## OpenWeatherMap

Using the OpenWeatherMap service you can display weather information about a given location.
The following configuration is available for the OpenWeatherMap service:

```yaml
- name: "Weather"
  location: "Amsterdam" # your location.
  locationId: "2759794" # Optional: Specify OpenWeatherMap city ID for better accuracy
  apikey: "<---insert-api-key-here--->" # insert your own API key here. Request one from https://openweathermap.org/api.
  units: "metric" # units to display temperature. Can be one of: metric, imperial, kelvin. Defaults to kelvin.
  background: "square" # choose which type of background you want behind the image. Can be one of: square, cicle, none. Defaults to none.
  type: "OpenWeather"
```

**Remarks:**
If for some reason your city can't be found by entering the name in the `location` property, you could also try to configure the OWM city ID in the `locationId` property. To retrieve your specific City ID, go to the [OWM website](https://openweathermap.org), search for your city and retrieve the ID from the URL (for example, the City ID of Amsterdam is 2759794).

## Medusa

This service displays News (grey), Warning (orange) or Error (red) notifications bubbles from the Medusa application.
Two lines are needed in the config.yml :

```yaml
  type: "Medusa"
  apikey: "01234deb70424befb1f4ef6a23456789"
```

The url must be the root url of Medusa application.
The Medusa API key can be found in General configuration > Interface. It is needed to access Medusa API.

## Lidarr, Prowlarr, Sonarr and Radarr

This service displays Activity (blue), Warning (orange) or Error (red) notifications bubbles from the Lidarr, Radarr or Sonarr application.
Two lines are needed in the config.yml :

```yaml
  type: "Lidarr", "Prowlarr", "Radarr" or "Sonarr"
  apikey: "01234deb70424befb1f4ef6a23456789"
```

The url must be the root url of Lidarr, Prowlarr, Radarr or Sonarr application.
The Lidarr, Prowlarr, Radarr or Sonarr API key can be found in Settings > General. It is needed to access the API.
If you are using an older version of Radarr or Sonarr which don't support the new V3 api endpoints, add the following line to your service config "legacyApi: true", example: 

```yaml
- name: "Radarr"
  type: "Radarr"
  url: "http://localhost:7878/"
  apikey: "MY-SUPER-SECRET-API-KEY"
  target: "_blank"
  legacyApi: true
```

## PaperlessNG

This service displays total number of documents stored. Two lines are required:

```yaml
  type: "PaperlessNG"
  apikey: "0123456789abcdef123456789abcdef"
```

API key can be generated in Settings > Administration > Auth Tokens

## Ping

For Ping you need to set the type to Ping and provide a url.

```yaml
- name: "Awesome app"
  type: Ping
  logo: "assets/tools/sample.png"
  subtitle: "Bookmark example"
  tag: "app"
  url: "https://www.reddit.com/r/selfhosted/"
```

## Prometheus

For Prometheus you need to set the type to Prometheus and provide a url.

```yaml
- name: "Prometheus"
  type: Prometheus
  logo: "assets/tools/sample.png"
  url: "http://192.168.0.151/"
  # subtitle: "Monitor data server"
```

## AdGuard Home
For AdGuard Home you need to set the type to AdGuard, if you have somes issues as 403 responses on requests you need to provide authentification in headers for locations needed as below.

```yaml
- name: "Adguard"
  logo: "assets/tools/adguardhome.png"
  url: "https://adguard.exemple.com"
  target: "_blank"
  type: "AdGuardHome"
```

## Portainer

This service displays info about the total number of containers managed by your Portainer instance.
In order to use it, you must be using Portainer version 1.11 or later. Generate an access token from the UI and pass
it to the apikey field.
By default, every connected environments will be checked. To select specific ones,add an "environments" entry which can be a simple string or an array containing all the selected environments name.

See https://docs.portainer.io/v/ce-2.11/user/account-settings#access-tokens

```yaml
- name: "Portainer"
  logo: "assets/tools/sample.png"
  url: "http://192.168.0.151/"
  type: "Portainer"
  apikey: "MY-SUPER-SECRET-API-KEY"
  # environments:
  #   - "raspberry"
  #   - "local"
```

## Emby

You need to set the type to Emby, provide an api key and choose which stats to show if the subtitle is disabled.

```yaml
- name: "Emby"
  logo: "assets/tools/sample.png"
  url: "http://192.168.0.151/"
  type: "Emby"
  apikey: "MY-SUPER-SECRET-API-KEY"
  libraryType: "music" #Choose which stats to show. Can be one of: music, series or movies.
```
