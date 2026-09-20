<template>
  <Generic :item="weatherItem" :class="{ 'component-error': error }">
    <template v-if="icon" #icon>
      <div class="card-icon" :class="item.background">
        <figure class="image">
          <img
            :src="`https://openweathermap.org/img/wn/${icon}@2x.png`"
            :alt="conditions"
            :title="conditions"
          />
        </figure>
      </div>
    </template>
    <template #subtitle>
      <template v-if="error">Fail to load weather information</template>
      <template v-else>
        <span>{{ temperature }}</span>
        <span class="location-time">{{ locationTime }}</span>
      </template>
    </template>
    <template v-if="error" #aside>⚠️</template>
  </Generic>
</template>

<script>
export default {
  name: "OpenWeather",
  props: {
    item: Object,
  },
  data: () => ({
    id: null,
    icon: null,
    name: null,
    temp: null,
    conditions: null,
    error: false,
    timezoneOffset: 0,
  }),
  computed: {
    weatherItem: function () {
      const item = { ...this.item };
      delete item.background;
      item.name = this.name ?? this.item.name;
      item.url = this.id ? `https://openweathermap.org/city/${this.id}` : "";
      return item;
    },
    temperature: function () {
      if (!this.temp) return "";

      let unit = "K";
      if (this.item.units === "metric") {
        unit = "°C";
      } else if (this.item.units === "imperial") {
        unit = "°F";
      }
      return `${this.temp} ${unit}`;
    },
    locationTime: function () {
      return this.calcTime(this.timezoneOffset);
    },
  },
  created() {
    this.fetchWeather();
  },
  methods: {
    fetchWeather: async function () {
      let locationQuery;

      // Use location ID if specified, otherwise retrieve value from location (name).
      if (this.item.locationId) {
        locationQuery = `id=${this.item.locationId}`;
      } else {
        locationQuery = `q=${this.item.location}`;
      }

      const apiKey = this.item.apikey || this.item.apiKey;

      let url = `https://api.openweathermap.org/data/2.5/weather?${locationQuery}&appid=${apiKey}&units=${this.item.units}`;
      if (this.item.endpoint) {
        url = this.item.endpoint;
      }
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
        })
        .then((weather) => {
          this.id = weather.id;
          this.name = weather.name;
          this.temp = parseInt(weather.main.temp).toFixed(1);
          this.icon = weather.weather[0].icon;
          this.conditions = weather.weather[0].description;
          this.timezoneOffset = weather.timezone;
        })
        .catch((e) => {
          console.error(e);
          this.name = this.item.name;
          this.error = true;
        });
    },
    calcTime: (offset) => {
      const localTime = new Date();
      const utcTime =
        localTime.getTime() + localTime.getTimezoneOffset() * 60000;
      const calculatedTime = new Date(utcTime + 1000 * offset);
      return calculatedTime.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped lang="scss">
// Add a border around the weather image.
// Otherwise the image is not always distinguishable.
.card-icon {
  &.circle,
  &.square {
    background-color: #e4e4e4;
  }

  &.circle {
    border-radius: 90%;
  }
}

.dark .card-icon {
  &.circle,
  &.square {
    background-color: #909090;
  }
}

//Location Time
.location-time {
  margin-left: 20px;
}
</style>
