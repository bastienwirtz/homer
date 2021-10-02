# Custom Services

Some service can use a specific a component that provides some extra features by adding a `type` key to the service yaml
configuration. Available services are in `src/components/`. Here is an overview of all custom services that are available
within Homer.

If you experiencing any issue, please have a look to the [troubleshooting](troubleshooting.md) page.

## PiHole

Using the PiHole service you can display info about your local PiHole instance right on your Homer dashboard.

The following configuration is available for the PiHole service.

```yaml
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

```yaml
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

```yaml
type: "Medusa"
apikey: "01234deb70424befb1f4ef6a23456789"
```

The url must be the root url of Medusa application.
The Medusa API key can be found in General configuration > Interface. It is needed to access Medusa API.

## Sonarr/Radarr

This service displays Activity (blue), Warning (orange) or Error (red) notifications bubbles from the Radarr/Sonarr application.
Two lines are needed in the config.yml :

```yaml
type: "Radarr" or "Sonarr"
apikey: "01234deb70424befb1f4ef6a23456789"
```

The url must be the root url of Radarr/Sonarr application.
The Radarr/Sonarr API key can be found in Settings > General. It is needed to access the API.

## PaperlessNG

For Paperless you need an API-Key which you have to store at the item in the field `apikey`.

## Ping

For Ping you need an API-Key which you have to store at the item in the field `apikey`.

## Wikijs

Using the Wikijs service you can display info about your local Wikijs instance version right on your Homer dashboard.
Displaying the new version if available with a orange glowing dot. (Subtitle: A new version is available!)
Displaying a green glowing dot if wikijs is up-to-date. (Subtitle: Wiki.js is up-to-date)
Subtitle can be overriden by the subtitle field on your configuration item.

The following configuration is available for the Wikijs service.

```yaml
items:
  - name: 'Wiki.js'
    logo: 'assets/tools/sample.png'
    # subtitle: "Documentation platform" # optional, if no subtitle is defined, Wikijs message will be shown (A new version is available! / Wiki.js is up-to-date.)
    url: 'http://192.168.0.152'
    apikey: '01234deb70424befb1f4ef6a23456789'
    type: 'Wikijs'
```

**Remarks:**
You have to enable the API communication in wikijs and set the API key in the apikey field of your configuration item.
The Wiki.js API key and activation can be found in Administration > API Access. (You have to generate one API key)
You have to configure your CORS from the wiki.js instance otherwise you will get some CORS errors. GraphQL can not handle the pre-flight call and you have to set the response code to 200.

Example nginx configuration:

```
add_header 'Access-Control-Allow-Origin' 'https://homer.mydomain.com';
add_header 'Access-Control-Allow-Headers' 'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization';

if ($request_method = OPTIONS) {
return 200;
}
```
