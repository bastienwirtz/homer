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
  name: "Gitea",
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
        this.fetch("/swagger.v1.json").then((response) => {
          this.versionstring = response.info.version;
        }),
      );
    },
  },
};
</script>
