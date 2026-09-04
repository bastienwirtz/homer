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
  name: "Gitea",
  mixins: [service],
  data: () => ({
    serverError: null,
    versionstring: null,
  }),
  methods: {
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
