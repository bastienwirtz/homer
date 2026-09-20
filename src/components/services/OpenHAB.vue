<template>
  <Generic :item="item" :subtitle="details" :status="status" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "OpenHAB",
  mixins: [service],
  data: () => ({
    status: null,
    things: {
      count: 0,
      online: 0,
    },
    items: {
      count: 0,
    },
  }),
  computed: {
    headers: function () {
      const basicAuth = `${this.item.apikey}:`;

      return {
        Authorization: `Basic ${btoa(basicAuth)}`,
      };
    },
    details: function () {
      const details = [];

      if (this.item.things) {
        details.push(
          `${this.things.count} things (${this.things.online} Online)`,
        );
      }

      if (this.item.items) {
        details.push(`${this.items.count} items`);
      }

      return details.join(", ");
    },
  },
  methods: {
    fetchData: function () {
      return this.fetchServerStatus().then(() => {
        if (this.item.subtitle || this.status?.state === "offline") {
          return;
        }
        return this.fetchServerStats();
      });
    },
    fetchServerStatus: async function () {
      const headers = this.headers;
      return this.fetch("/rest/systeminfo", { headers })
        .then((response) => {
          if (response && response.systemInfo)
            this.status = { state: "online", label: "running" };
          else throw new Error();
        })
        .catch((e) => {
          console.error(e);
          this.status = { state: "offline", label: "dead" };
        });
    },
    fetchServerStats: async function () {
      const headers = this.headers;

      if (this.item.things) {
        const data = await this.fetch("/rest/things?summary=true", {
          headers,
        }).catch((e) => {
          console.error(e);
        });

        this.things.count = data.length;
        this.things.online = data.filter(
          (e) => e.statusInfo.status === "ONLINE",
        ).length;
      }

      if (this.item.items) {
        const data = await this.fetch("/rest/items", { headers }).catch((e) => {
          console.error(e);
        });

        this.items.count = data.length;
      }
    },
  },
};
</script>
