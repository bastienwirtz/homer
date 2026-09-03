<template>
  <Generic
    :item="item"
    :subtitle="displayVersion(versionstring)"
    :status="status"
  />
</template>

<script>
import service from "@/mixins/service.js";
import { displayVersion } from "@/utils/format.js";

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
    displayVersion,
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
