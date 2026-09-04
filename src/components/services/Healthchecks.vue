<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Healthchecks",
  mixins: [service],
  data: () => ({
    api: null,
    serverError: null,
  }),
  computed: {
    badges() {
      return [
        { key: "up", label: "Up", value: this.count("up"), tone: "success" },
        {
          key: "down",
          label: "Down",
          value: this.count("down"),
          tone: "danger",
        },
        {
          key: "grace",
          label: "Grace",
          value: this.count("grace"),
          tone: "warning",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    count(status) {
      return this.api?.checks?.filter(
        (check) => check.status.toLowerCase() === status,
      ).length;
    },
    fetchData: async function () {
      if (!this.requireConfig("apikey")) {
        return;
      }

      const headers = {
        "X-Api-Key": this.item.apikey,
      };

      return this.load(
        this.fetch("/api/v1/checks/", { headers }).then((api) => {
          this.api = api;
        }),
      );
    },
  },
};
</script>
