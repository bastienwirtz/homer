<template>
  <Generic
    :item="item"
    :subtitle="versionSubtitle"
    :status="reachabilityStatus()"
  />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Vaultwarden",
  mixins: [service],
  data: () => ({
    serverError: null,
    versionstring: null,
  }),
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch("api/version").then((response) => {
          this.versionstring = response;
        }),
      );
    },
  },
};
</script>
