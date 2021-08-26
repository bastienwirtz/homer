<template>
  <div>
    <div class="card" :class="item.class">
      <a :href="item.url" :target="item.target" rel="noreferrer">
        <div class="card-content">
          <div class="media">
            <div v-if="item.logo" class="media-left">
              <figure class="image is-48x48">
                <img :src="item.logo" :alt="`${item.name} logo`" />
              </figure>
            </div>
            <div v-if="item.icon" class="media-left">
              <figure class="image is-48x48">
                <i style="font-size: 35px" :class="['fa-fw', item.icon]"></i>
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">{{ item.name }}</p>
              <p class="subtitle is-6">
                <template v-if="item.subtitle">
                  {{ item.subtitle }}
                </template>
                <template v-else-if="api">
                  <i class="fas fa-arrow-down"></i> {{ download }} Mbit/s | <i class="fas fa-arrow-up"></i> {{ upload }} Mbit/s | <i class="fas fa-stopwatch"></i> {{ ping }} ms
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
  name: "SpeedtestTracker",
  props: {
    item: Object,
  },
  data: () => ({
    api: null,
  }),
  computed: {
    download: function() {
      var download = this.api.data.download;
      return parseFloat(download).toFixed(2);
    },
    upload: function() {
      var upload = this.api.data.upload;
      return parseFloat(upload).toFixed(2);
    },
    ping: function() {
      var ping = this.api.data.ping;
      return parseFloat(ping).toFixed(2);
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      if (this.item.subtitle != null) return; // omitting unnecessary ajax call as the subtitle is showing
      const url = `${this.item.url}/api/speedtest/latest`;
      this.api = await fetch(url)
        .then(function(response) {
          if (!response.ok) {
            throw new Error("Not 2xx response");
          } else {
            return response.json();
          }
        })
        .catch((e) => console.log(e));
    },
  },
};
</script>

<style scoped lang="scss">
.media-left img {
  max-height: 100%;
}
</style>
