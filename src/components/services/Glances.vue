<template>
  <Generic :item="item" :badges="badges">
    <template #subtitle>
      <template v-for="(statItem, index) in item.stats" :key="statItem">
        <span v-if="stats[statItem]" :title="stats[statItem].label">
          <i :class="stats[statItem].icon"></i> {{ stats[statItem].value }}
          {{ stats[statItem].unit }}
          <span v-if="index != item.stats.length - 1"> / </span>
        </span>
      </template>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Glances",
  mixins: [service],
  data: () => ({
    stats: [],
    serverError: null,
  }),
  computed: {
    badges() {
      return [this.connectionBadge()];
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch(`/api/4/quicklook`).then((response) => {
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
        }),
      );
    },
  },
};
</script>
