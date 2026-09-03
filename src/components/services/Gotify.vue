<template>
  <Generic :item="item" :subtitle="messageCount" :status="status" />
</template>

<script>
import service from "@/mixins/service.js";
import { capCount } from "@/utils/format.js";

export default {
  name: "Gotify",
  mixins: [service],
  data: () => ({
    health: {},
    messages: 0,
    serverError: null,
  }),
  computed: {
    messageCount: function () {
      if (!this.messages) {
        return null;
      }
      const count = capCount(this.messages);
      return `${count} message${this.messages === 1 ? "" : "s"}`;
    },
    status: function () {
      if (this.serverError || !this.health?.health) {
        return this.reachabilityStatus();
      }
      const statuses = [this.health.health, this.health.database];

      if (statuses.includes("red")) {
        return { state: "offline" };
      } else if (statuses.includes("orange")) {
        return { state: "warning" };
      }

      return { state: "online" };
    },
  },
  methods: {
    fetchData: function () {
      const headers = { "X-Gotify-Key": this.item.apikey };

      return this.load(
        this.fetch(`/health`).then((health) => {
          this.health = health;
        }),
        // Needs a client token, and only feeds the subtitle, so a missing key
        // must not make the whole card look unreachable.
        this.fetch(`/message?limit=100`, { headers })
          .then((messages) => {
            this.messages = messages.messages.length;
          })
          .catch((e) => console.warn("Gotify messages unavailable:", e)),
      );
    },
  },
};
</script>
