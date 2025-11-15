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
      switch (this.ups_status) {
        case "OL":
          return "online";
        case "OB":
          return "on battery";
        case "LB":
          return "low battery";
        default:
          return "unknown";
      }
    },
    status_class: function () {
      switch (this.ups_status) {
        case "OL":
          return "online";
        case "OB": // On battery
          return "pending";
        case "LB": // Low battery
          return "offline";
        default:
          return "unknown";
      }
    },
    load: function () {
      if (this.ups_load) {
        return this.ups_load.toFixed(1);
      }
      return "";
    },
  },
  created() {
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
