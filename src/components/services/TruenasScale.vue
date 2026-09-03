<template>
  <Generic :item="item" :status="reachabilityStatus()">
    <template v-if="versionstring" #subtitle>
      <span class="is-hidden-touch">Version {{ versionstring }}</span>
      <span class="is-hidden-desktop"
        >Version {{ versionstring.split("-").pop() }}</span
      >
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "TruenasScale",
  mixins: [service],
  data: () => ({
    serverError: null,
    versionstring: null,
  }),
  methods: {
    fetchData: async function () {
      let headers = {};
      if (this.item.api_token) {
        headers["Authorization"] = `Bearer ${this.item.api_token}`;
      }
      this.fetch("/api/v2.0/system/version", { headers })
        .then((response) => {
          this.serverError = false;
          this.versionstring = response;
        })
        .catch((e) => {
          this.serverError = true;
          console.error(e);
        });
    },
  },
};
</script>
