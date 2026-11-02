<template>
  <Generic
    :item="item"
    :subtitle="displayVersion(versionstring)"
    :status="reachabilityStatus()"
  />
</template>

<script>
import service from "@/mixins/service.js";
import { displayVersion } from "@/utils/format.js";

export default {
  name: "Matrix",
  mixins: [service],
  autoUpdate: false,
  data: () => ({
    serverError: null,
    versionstring: null,
  }),
  methods: {
    displayVersion,
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
