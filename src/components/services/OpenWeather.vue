<template>
  <div>
    <div class="card" :class="item.class">
      <a
        :href="`https://openweathermap.org/city/${id}`"
        :target="item.target"
        rel="noreferrer"
      >
        <div class="card-content">
          <div class="media">
            <div v-if="icon" class="media-left" :class="item.background">
              <figure class="image is-48x48">
                <img
                  :src="`https://openweathermap.org/img/wn/${icon}@2x.png`"
                  :alt="conditions"
                  :title="conditions"
                />
              </figure>
            </div>
            <div class="media-content">
              <p v-if="error" class="error">Data could not be retrieved</p>
              <div v-else>
                <p class="title is-4">{{ name }}</p>
                <p class="subtitle is-6">
                  {{ temp | tempSuffix(this.item.units) }}
                </p>
              </div>
            </div>
          </div>
          <div class="tag" :class="item.tagstyle" v-if="item.tag">
            <strong class="tag-text">#{{ item.tag }}</strong>
          </div>
        </div>
      </a>
    </div>
  </div>
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
  }),
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
      const url = `https://api.openweathermap.org/data/2.5/weather?${locationQuery}&appid=${apiKey}&units=${this.item.units}`;
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
        })
        .catch((e) => {
          console.log(e);
          this.error = true;
        });
    },
  },
  filters: {
    tempSuffix: function (value, type) {
      if (!value) return "";

      let unit = "K";
      if (type === "metric") {
        unit = "°C";
      } else if (type === "imperial") {
        unit = "°F";
      }
      return `${value} ${unit}`;
    },
  },
};
</script>

<style scoped lang="scss">
// Add a border around the weather image.
// Otherwise the image is not always distinguishable.
.media-left {
  &.circle,
  &.square {
    background-color: #e4e4e4;
  }

  &.circle {
    border-radius: 90%;
  }

  img {
    max-height: 100%;
  }
}

.error {
  color: #de0000;
}

// Change background color in dark mode.
.is-dark {
  .media-left {
    &.circle,
    &.square {
      background-color: #909090;
    }
  }
}
</style>
