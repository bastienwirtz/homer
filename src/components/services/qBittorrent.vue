<template>
  <Generic :item="item" :badges="badges">
    <template #subtitle>
      <span class="is-family-monospace mr-3">
        <i class="fas fa-download"></i>
        {{ downRate }}
      </span>
      <span class="is-family-monospace">
        <i class="fas fa-upload"></i>
        {{ upRate }}
      </span>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import { displayRate } from "@/utils/format.js";

export default {
  name: "QBittorrent",
  mixins: [service],
  data: () => ({ dl: null, ul: null, count: null, serverError: null }),
  computed: {
    downRate: function () {
      return displayRate(this.dl);
    },
    upRate: function () {
      return displayRate(this.ul);
    },
    badges: function () {
      return [
        {
          key: "torrents",
          label: "Torrents",
          value: this.count,
          tone: "neutral",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch("/api/v2/torrents/info").then((body) => {
          this.count = body.length;
        }),
        this.fetch("/api/v2/transfer/info").then((body) => {
          this.dl = body.dl_info_speed;
          this.ul = body.up_info_speed;
        }),
      );
    },
  },
};
</script>
