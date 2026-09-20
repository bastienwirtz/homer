<template>
  <Generic :item="item" :subtitle="rttLabel" :status="reachabilityStatus()" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Ping",
  mixins: [service],
  data: () => ({
    serverError: null,
    rtt: null,
  }),
  computed: {
    rttLabel: function () {
      if (this.serverError === null) {
        return null;
      }
      return !this.serverError ? `${this.rtt}ms` : "unavailable";
    },
  },
  methods: {
    fetchData: async function () {
      const method =
        typeof this.item.method === "string"
          ? this.item.method.toUpperCase()
          : "HEAD";

      if (!["GET", "HEAD", "OPTION"].includes(method)) {
        console.error(`Ping: ${method} is not a supported HTTP method`);
        return;
      }

      const startTime = performance.now();
      const timeout = parseInt(this.item.timeout, 10) || 2000;
      const params = {
        method,
        cache: "no-cache",
        signal: AbortSignal.timeout(timeout),
      };

      this.fetch("/", params, false)
        .then(() => {
          this.serverError = false;
          const endTime = performance.now();
          this.rtt = Math.round(endTime - startTime);
        })
        .catch(() => {
          this.serverError = true;
          this.rtt = null; // Reset rtt on failure
        });
    },
  },
};
</script>
