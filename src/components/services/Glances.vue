<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-for="(statItem, index) in item.stats" :key="statItem">
          <span v-if="stats[statItem]" :title="stats[statItem].label">
            <i :class="stats[statItem].icon"></i> {{ stats[statItem].value }}
            {{ stats[statItem].unit }}
            <span v-if="index != item.stats.length - 1"> / </span>
          </span>
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Glances",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    stats: [],
    error: null,
  }),
  created() {
    const updateInterval = parseInt(this.item.updateInterval, 10) || 0;
    if (updateInterval > 0) {
      setInterval(() => this.fetchStat(), updateInterval);
    }
    this.fetchStat();
  },
  methods: {
    fetchStat: async function () {
      this.fetch(`/api/4/quicklook`)
        .then((response) => {
          this.stats["load"] = {
            value: response.load,
            label: "System load",
            icon: "fa-solid fa-bolt",
            unit: "%",
          };
          this.stats["cpu"] = {
            value: response.cpu,
            label: `CPU usage (${response.cpu_name})`,
            icon: "fa-solid fa-microchip",
            unit: "%",
          };
          this.stats["mem"] = {
            value: response.mem,
            label: `RAM usage`,
            icon: "fa-solid fa-memory",
            unit: "%",
          };
          this.stats["swap"] = {
            value: response.swap,
            label: `Swap usage`,
            icon: "fa-solid fa-file-arrow-down",
            unit: "%",
          };
        })
        .catch((e) => {
          console.log(e);
          this.error = "Unable to get metrics";
        });
    },
  },
};
</script>
