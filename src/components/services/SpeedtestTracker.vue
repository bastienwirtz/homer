<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="speedtest">
          <i class="fas fa-arrow-down"></i> {{ download }} Mbit/s |
          <i class="fas fa-arrow-up"></i> {{ upload }} Mbit/s |
          <i class="fas fa-stopwatch"></i> {{ ping }} ms
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "SpeedtestTracker",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    speedtest: null,
  }),
  computed: {
    download: function () {
      return this.format(this.speedtest?.download);
    },
    upload: function () {
      return this.format(this.speedtest?.upload);
    },
    ping: function () {
      return this.format(this.speedtest?.ping);
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      this.fetch("/api/speedtest/latest")
        .then((response) => {
          this.speedtest = response.data;
        })
        .catch((e) => console.log(e));
    },
    format: function (value) {
      return value ? parseFloat(value).toFixed(2) : "n/a";
    },
  },
};
</script>
