<template>
  <Generic :item="item" :subtitle="versionSubtitle" :status="status" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Nextcloud",
  mixins: [service],
  data: () => ({
    serverError: null,
    versionstring: null,
    maintenance: null,
  }),
  computed: {
    status: function () {
      if (this.serverError || !this.maintenance) {
        return this.reachabilityStatus();
      }
      return { state: "warning", label: "maintenance" };
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch("/status.php").then((response) => {
          this.versionstring = response.versionstring;
          this.maintenance = response.maintenance;
        }),
      );
    },
  },
};
</script>
