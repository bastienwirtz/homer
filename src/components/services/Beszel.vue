<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="stats">
          <span v-if="isValueShown('cpu') && stats.cpu !== undefined" title="CPU Usage">
            <i class="fa-solid fa-microchip"></i> {{ stats.cpu }}%
          </span>
          <span v-if="isValueShown('mem') && stats.mem !== undefined" title="RAM Usage">
            <template v-if="isValueShown('cpu') && stats.cpu !== undefined"> / </template>
            <i class="fa-solid fa-memory"></i> {{ stats.mem }}%
          </span>
          <span v-if="isValueShown('disk') && stats.disk !== undefined" title="Disk Usage">
            <template v-if="(isValueShown('cpu') && stats.cpu !== undefined) || (isValueShown('mem') && stats.mem !== undefined)"> / </template>
            <i class="fa-solid fa-hard-drive"></i> {{ stats.disk }}%
          </span>
        </template>
        <template v-else-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="error">
          {{ error }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ statusText }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Beszel",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    stats: null,
    status: "",
    error: null,
  }),
  computed: {
    statusText() {
      if (this.status === "online") return "UP";
      if (this.status === "offline") return "DOWN";
      return "";
    },
  },
  created() {
    this.autoUpdateMethod = this.fetchStats;
    this.fetchStats();
  },
  methods: {
    fetchStats: async function () {
      const headers = {};
      const token = this.item.token || this.item.apikey;
      if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : token;
      }

      this.fetch("/api/collections/systems/records", { headers })
        .then((response) => {
          const items = response.items || [];
          if (!items.length) {
            this.status = "offline";
            this.error = "No systems found";
            return;
          }

          let system = items[0];
          if (this.item.system) {
            const found = items.find(
              (s) => s.name === this.item.system || s.id === this.item.system
            );
            if (found) {
              system = found;
            }
          }

          this.status = system.status === "up" ? "online" : "offline";
          this.error = null;

          let info = system.info;
          if (typeof info === "string") {
            try {
              info = JSON.parse(info);
            } catch {
              info = null;
            }
          }

          if (info) {
            this.stats = {
              cpu: typeof info.cpu === "number" ? Math.round(info.cpu) : info.cpu,
              mem: typeof info.mp === "number" ? Math.round(info.mp) : info.mp,
              disk: typeof info.dp === "number" ? Math.round(info.dp) : info.dp,
            };
          }
        })
        .catch((e) => {
          console.error(e);
          this.status = "offline";
          this.error = "Unable to connect to Beszel";
        });
    },
  },
};
</script>
