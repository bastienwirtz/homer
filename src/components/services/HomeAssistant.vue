<template>
  <Generic :item="item" :subtitle="details" :status="status" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "HomeAssistant",
  mixins: [service],
  data: () => ({
    status: null,
    version: "",
    entities: 0,
    location_name: "",
    separator: " ",
    items: ["name", "version"],
  }),
  computed: {
    headers: function () {
      return {
        Authorization: `Bearer ${this.item.apikey}`,
        "Content-Type": "application/json",
      };
    },
    details: function () {
      const details = [];
      const items = this.items;
      const separator = this.separator;

      for (const i in items) {
        const key = items[i];

        switch (key) {
          case "version":
            details.push(`v${this.version}`);
            break;
          case "name":
            details.push(`${this.location_name}`);
            break;
          case "entities":
            details.push(`${this.entities} entities`);
            break;
          default:
            details.push(`undefined key ${key} `);
        }
      }

      return details.join(separator);
    },
  },
  methods: {
    fetchData: function () {
      return this.fetchServerStatus().then(() => {
        if (this.item.subtitle || this.status?.state === "offline") {
          return;
        }
        if (this.item.items) this.items = this.item.items;
        if (this.item.separator) this.separator = this.item.separator;

        return this.fetchServerStats();
      });
    },
    fetchServerStatus: async function () {
      const headers = this.headers;

      return this.fetch("/api/", { headers })
        .then((response) => {
          if (response && response.message)
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

      this.fetch("/api/config", { headers })
        .then((response) => {
          if (response) {
            if (response.version) this.version = response.version;
            if (response.location_name)
              this.location_name = response.location_name;
          } else throw new Error();
        })
        .catch((e) => {
          console.error(e);
          this.status = { state: "offline", label: "dead" };
        });

      this.fetch("/api/states", { headers })
        .then((response) => {
          if (response) {
            this.entities = response.length;
          } else throw new Error();
        })
        .catch((e) => {
          console.error(e);
          this.status = { state: "offline", label: "dead" };
        });
    },
  },
};
</script>
