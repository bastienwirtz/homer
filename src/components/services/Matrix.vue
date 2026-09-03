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
  name: "Matrix",
  mixins: [service],
  data: () => ({
    serverError: null,
    versionstring: null,
  }),
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch("_matrix/federation/v1/version").then((response) => {
          this.versionstring = response.server.version;
        }),
      );
    },
  },
};
</script>
