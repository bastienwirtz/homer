<template>
  <Generic :item="item" :badges="badges">
    <template v-if="speedtest" #subtitle>
      <i class="fas fa-arrow-down"></i> {{ download }} Mbit/s |
      <i class="fas fa-arrow-up"></i> {{ upload }} Mbit/s |
      <i class="fas fa-stopwatch"></i> {{ ping }} ms
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "SpeedtestTracker",
  mixins: [service],
  data: () => ({
    speedtest: null,
    serverError: null,
  }),
  computed: {
    badges() {
      return [this.connectionBadge()];
    },
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
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch("/api/speedtest/latest").then((response) => {
          this.speedtest = response.data;
        }),
      );
    },
    format: function (value) {
      return value ? parseFloat(value).toFixed(2) : "n/a";
    },
  },
};
</script>
