<template>
  <Generic :item="item" :badges="badges">
    <template #subtitle>
      <span class="is-family-monospace">
        <i class="fas fa-download"></i>
        {{ downRate }}
      </span>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import { displayRate } from "@/utils/format.js";

export default {
  name: "SABnzbd",
  mixins: [service],
  data: () => ({
    stats: null,
    serverError: null,
    dlSpeed: null,
    ulSpeed: null,
  }),
  computed: {
    downloads() {
      if (!this.stats) {
        return "";
      }
      return this.stats.noofslots;
    },
    downRate() {
      return displayRate(this.dlSpeed);
    },
    badges() {
      return [
        {
          key: "downloads",
          label: "Active downloads",
          value: this.downloads,
          tone: "info",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch(
          `/api?output=json&apikey=${this.item.apikey}&mode=queue`,
        ).then((response) => {
          this.stats = response.queue;
          // `speed` carries a unit suffix ("512 K"); kbpersec is the number.
          this.dlSpeed = parseFloat(response.queue.kbpersec) * 1000;
        }),
      );
    },
  },
};
</script>
