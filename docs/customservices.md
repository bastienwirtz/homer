# Custom Services

Some service can use a specific a component that provides some extra features by adding a `type` key to the service yaml
configuration and, where applicable, an apikey. Note that config.yml is exposed at /assets/config.yml via HTTP and any
apikey included in the configuration file is exposed to anyone who can access the homer instance. Only include an apikey
if your homer instance is secured behind some form of authentication or access restriction.

Available services are in `src/components/`. Here is an overview of all custom services that are available
within Homer.

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

## Lidarr, Sonarr and Radarr

This service displays Activity (blue), Warning (orange) or Error (red) notifications bubbles from the Lidarr, Radarr or Sonarr application.
Two lines are needed in the config.yml :

```yaml
  type: "Lidarr", "Radarr" or "Sonarr"
  apikey: "01234deb70424befb1f4ef6a23456789"
```

The url must be the root url of Lidarr, Radarr or Sonarr application.
The Lidarr, Radarr or Sonarr API key can be found in Settings > General. It is needed to access the API.

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
