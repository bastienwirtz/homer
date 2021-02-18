# Custom Services

Here is an overview of all custom services that are available within Homer.

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

The following configuration is available for the OpenWeatherMap service

```
items:
     - name: "Weather"
       location: "Amsterdam" # your location.
       locationId: "2759794" # OpenWeatherMap city ID.
       apiKey: "<---insert-api-key-here--->" # insert your own API key here. Request one from https://openweathermap.org/api.
       units: "metric" # units to display temperature. Can be one of: metric, imperial, kelvin. Defaults to kelvin.
       background: "square" # choose which type of background you want behind the image. Can be one of: square, cicle, none. Defaults to none.
       type: "OpenWeather"
```

**Remarks:**
If for some reason your city can't be found by entering the name in the `location` property, you could also try to configure the OWM city ID in the `locationId` property. To retrieve your specific City ID, go to the [OWM website](https://openweathermap.org), search for your city and retrieve the ID from the URL (for example, the City ID of Amsterdam is 2759794).