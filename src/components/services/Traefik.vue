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
  name: "Traefik",
  mixins: [service],
  data: () => ({
    serverError: null,
    versionstring: null,
  }),
  methods: {
    fetchData: function () {
      let headers = {};
      if (this.item.basic_auth) {
        const encodedCredentials = btoa(this.item.basic_auth);
        headers["Authorization"] = `Basic ${encodedCredentials}`;
      }
      return this.load(
        this.fetch("/api/version", { headers }).then((response) => {
          this.versionstring = response.Version;
        }),
      );
    },
  },
};
</script>
