<template>
  <Generic
    :item="item"
    :subtitle="stats && `${percentage}% blocked`"
    :status="protection"
  />
</template>

<script>
import service from "@/mixins/service.js";

const PROTECTION = {
  enabled: { state: "online", label: "enabled" },
  disabled: { state: "warning", label: "disabled" },
  unknown: { state: "unknown", label: "unknown" },
};

export default {
  name: "AdGuardHome",
  mixins: [service],
  data: () => {
    return {
      serverStatus: null,
      stats: null,
    };
  },
  computed: {
    percentage: function () {
      if (this.stats) {
        return (
          (this.stats.num_blocked_filtering * 100) /
          this.stats.num_dns_queries
        ).toFixed(2);
      }
      return "";
    },
    protection: function () {
      if (!this.serverStatus) {
        return PROTECTION.unknown;
      }
      return this.serverStatus.protection_enabled
        ? PROTECTION.enabled
        : PROTECTION.disabled;
    },
  },
  methods: {
    fetchData: async function () {
      this.fetch("/control/status")
        .then((status) => {
          this.serverStatus = status;
        })
        .catch((e) => console.error(e));

      if (!this.item.subtitle) {
        this.fetch("/control/stats")
          .then((stats) => {
            this.stats = stats;
          })
          .catch((e) => console.error(e));
      }
    },
  },
};
</script>
