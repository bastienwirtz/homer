<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="load"> {{ load }}&percnt; UPS Load </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="ups_status" class="status" :class="status_class">
        {{ status_text }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "PeaNUT",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    ups_status: "",
    ups_load: 0,
  }),
  computed: {
    status_text: function () {
      const status = this.ups_status;
      if (status.includes("LB"))     return "low battery";
      if (status.includes("OB"))     return "on battery";
      if (status.includes("OL"))     return "online";
      return "unknown";
    },
    status_class: function () {
      const status = this.ups_status;
      if (status.includes("LB"))     return "offline";
      if (status.includes("OB"))     return "pending";
      if (status.includes("OL"))     return "online";
      return "unknown";
    },
    load: function () {
      if (this.ups_load) {
        return this.ups_load.toFixed(1);
      }
      return "";
    },
  },
  created() {
    // Set up auto-update method for the scheduler
    this.autoUpdateMethod = this.fetchStatus;

    // Initial data fetch
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const device = this.item.device || "";

      const result = await this.fetch(`/api/v1/devices/${device}`).catch((e) =>
        console.log(e),
      );

      this.ups_status = result["ups.status"] || "";
      this.ups_load = result["ups.load"] || 0;
    },
  },
};
</script>
