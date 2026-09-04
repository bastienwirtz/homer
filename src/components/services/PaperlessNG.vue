<template>
  <Generic
    :item="item"
    :subtitle="api && `happily storing ${api.count} documents`"
    :badges="badges"
  />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Paperless",
  mixins: [service],
  data: () => ({
    api: null,
    serverError: null,
  }),
  computed: {
    badges() {
      return [this.connectionBadge()];
    },
  },
  methods: {
    fetchData: async function () {
      if (this.item.subtitle != null) return;

      if (!this.requireConfig("apikey")) {
        return;
      }

      return this.load(
        this.fetch("/api/documents/", {
          headers: {
            Authorization: "Token " + this.item.apikey,
          },
        }).then((api) => {
          this.api = api;
        }),
      );
    },
  },
};
</script>
