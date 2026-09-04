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
  name: "Olivetin",
  mixins: [service],
  data: () => ({
    serverError: null,
    versionstring: null,
  }),
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch("/webUiSettings.json").then((response) => {
          this.versionstring = response.CurrentVersion;
        }),
      );
    },
  },
};
</script>
