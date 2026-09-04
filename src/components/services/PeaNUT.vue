<template>
  <Generic
    :item="item"
    :subtitle="upsLoad && `${upsLoad}% UPS Load`"
    :status="status"
  />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "PeaNUT",
  mixins: [service],
  data: () => ({
    serverError: null,
    ups_status: "",
    ups_load: 0,
  }),
  computed: {
    status: function () {
      const status = this.ups_status;
      if (this.serverError || !status) return this.reachabilityStatus();
      if (status.includes("LB"))
        return { state: "offline", label: "low battery" };
      if (status.includes("OB"))
        return { state: "warning", label: "on battery" };
      if (status.includes("OL")) return { state: "online", label: "online" };
      return { state: "unknown", label: "unknown" };
    },
    upsLoad: function () {
      if (this.ups_load) {
        return this.ups_load.toFixed(1);
      }
      return "";
    },
  },
  methods: {
    fetchData: function () {
      const device = this.item.device || "";

      return this.load(
        this.fetch(`/api/v1/devices/${device}`).then((result) => {
          this.ups_status = result["ups.status"] || "";
          this.ups_load = result["ups.load"] || 0;
        }),
      );
    },
  },
};
</script>
