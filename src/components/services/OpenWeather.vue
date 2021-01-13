<template>
  <div>
    <div class="card" :class="item.class">
      <a :href="`https://openweathermap.org/city/` + locationId" :target="item.target" rel="noreferrer">
        <div class="card-content">
          <div class="media">
            <div v-if="image" class="media-left" :class="item.background">
              <figure class="image is-48x48">
                <img
                  :src="`http://openweathermap.org/img/wn/` + image + `@2x.png`"
                  :alt="conditions"
                  :title="conditions"
                />
              </figure>
            </div>
            <div v-if="item.icon" class="media-left">
              <figure class="image is-48x48">
                <i style="font-size: 35px" :class="['fa-fw', item.icon]"></i>
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">{{ item.location }}</p>
              <p class="subtitle is-6">
                <template v-if="item.subtitle">
                  {{ item.subtitle }}
                </template>
                <template v-else-if="api">
                  <template v-if="temp !== ''">
                    {{ temp }}
                    <span v-if="this.item.units === 'metric'">&deg;C</span>
                    <span v-else-if="this.item.units === 'imperial'">&deg;F</span>
                    <span v-else>K</span>
                  </template>
                  <template v-else> 
                    <span class="error">Data could not be retrieved</span>                      
                  </template>
                </template>
              </p>
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
    error: false,
    api: {
      id: "",
      name: "",
      weather: [
        {
          main: "",
          description: "",
          icon: "",
        },
      ],
      main: {
        temp: "",
        humidity: "",
      },
    },
  }),
  computed: {
    locationId: function () {
      if (this.api) {
        return this.api.id;
      }
      return "";
    },
    temp: function () {
      if (this.api && this.api.main.temp !== "") {
        return parseInt(this.api.main.temp).toFixed(1);
      }
      return "";
    },
    image: function () {
      if (this.api) {
        return this.api.weather[0].icon;
      }
      return "";
    },
    conditions: function () {
      if (this.api) {
        return this.api.weather[0].description;
      }
      return "";
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.item.location}&appid=${this.item.apiKey}&units=${this.item.units}`;
      this.api = await fetch(url)
        .then((response) => response.json())
        .catch((e) => { 
          this.error = true; 
          console.log(e) 
        });
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
