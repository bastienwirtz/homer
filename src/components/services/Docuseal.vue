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
  name: "Docuseal",
  mixins: [service],
  autoUpdate: false,
  data: () => ({
    serverError: null,
    versionstring: null,
  }),
  methods: {
    displayVersion,
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
