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
  name: "Traefik",
  mixins: [service],
  autoUpdate: false,
  data: () => ({
    serverError: null,
    versionstring: null,
  }),
  methods: {
    displayVersion,
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
