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
  name: "Docuseal",
  mixins: [service],
  data: () => ({
    serverError: null,
    versionstring: null,
  }),
  methods: {
    fetchData: function () {
      const params = {
        cache: "no-cache",
      };
      return this.load(
        this.fetch("/version", params, false).then((response) => {
          this.versionstring = response;
        }),
      );
    },
  },
};
</script>
