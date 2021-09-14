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


## OpenWeatherMap

Using the OpenWeatherMap service you can display weather information about a given location.
The following configuration is available for the OpenWeatherMap service:

```
items:
     - name: "Weather"
       location: "Amsterdam" # your location.
       locationId: "2759794" # Optional: Specify OpenWeatherMap city ID for better accuracy
       apiKey: "<---insert-api-key-here--->" # insert your own API key here. Request one from https://openweathermap.org/api.
       units: "metric" # units to display temperature. Can be one of: metric, imperial, kelvin. Defaults to kelvin.
       background: "square" # choose which type of background you want behind the image. Can be one of: square, cicle, none. Defaults to none.
       type: "OpenWeather"
```

**Remarks:**
If for some reason your city can't be found by entering the name in the `location` property, you could also try to configure the OWM city ID in the `locationId` property. To retrieve your specific City ID, go to the [OWM website](https://openweathermap.org), search for your city and retrieve the ID from the URL (for example, the City ID of Amsterdam is 2759794).


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

For Ping you need an API-Key which you have to store at the item in the field `apikey`.
