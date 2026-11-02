<template>
  <Generic :item="item" :status="status">
    <template v-if="metrics.length" #subtitle>
      <span
        v-for="(metric, index) in metrics"
        :key="metric.key"
        :title="metric.label"
      >
        <template v-if="index"> / </template>
        <i :class="metric.icon"></i> {{ metric.value }}%
      </span>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

const SYSTEM_STATUS = {
  up: { state: "online", label: "online" },
  down: { state: "offline", label: "offline" },
  paused: { state: "warning", label: "paused" },
  pending: { state: "busy", label: "pending" },
};

const METRICS = [
  {
    key: "cpu",
    field: "cpu",
    label: "CPU Usage",
    icon: "fa-solid fa-microchip",
  },
  { key: "mem", field: "mp", label: "RAM Usage", icon: "fa-solid fa-memory" },
  {
    key: "disk",
    field: "dp",
    label: "Disk Usage",
    icon: "fa-solid fa-hard-drive",
  },
];

export default {
  name: "Beszel",
  mixins: [service],
  data: () => ({
    system: null,
    serverError: null,
  }),
  computed: {
    status() {
      if (this.serverError || !this.system) {
        return this.reachabilityStatus();
      }
      return (
        SYSTEM_STATUS[this.system.status] ?? {
          state: "unknown",
          label: this.system.status || "unknown",
        }
      );
    },
    metrics() {
      if (this.serverError || this.system?.status !== "up") {
        return [];
      }
      const info = this.system.info ?? {};
      return METRICS.filter(
        ({ key, field }) =>
          this.isValueShown(key) && typeof info[field] === "number",
      ).map((metric) => ({ ...metric, value: Math.round(info[metric.field]) }));
    },
  },
  methods: {
    fetchData: function () {
      const headers = this.item.api_token
        ? { Authorization: `Bearer ${this.item.api_token}` }
        : {};
      const params = new URLSearchParams({
        sort: "name",
        perPage: "1000",
        skipTotal: "1",
        fields: "id,name,status,info",
      });
      const wanted = this.item.system ? String(this.item.system) : null;

      return this.load(
        this.fetch(`/api/collections/systems/records?${params}`, {
          headers,
        }).then((response) => {
          const items = response.items ?? [];
          const system = wanted
            ? items.find((s) => s.name === wanted || s.id === wanted)
            : items[0];
          if (!system) {
            throw new Error(
              this.item.system
                ? `Beszel system "${this.item.system}" not found, or not visible with this api_token`
                : "No Beszel system visible with this api_token",
            );
          }
          this.system = system;
        }),
      );
    },
  },
};
</script>
