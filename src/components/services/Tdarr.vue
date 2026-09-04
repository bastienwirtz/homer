<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Tdarr",
  mixins: [service],
  data: () => ({
    stats: null,
    serverError: null,
  }),
  computed: {
    queue: function () {
      return this.stats?.table1Count;
    },
    errored: function () {
      return this.stats?.table6Count;
    },
    badges() {
      return [
        {
          key: "queue",
          label: "Queued items",
          value: this.queue,
          tone: "info",
        },
        {
          key: "errored",
          label: "Errored items",
          value: this.errored,
          tone: "danger",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          headers: { "content-Type": "application/json" },
          data: {
            collection: "StatisticsJSONDB",
            mode: "getById",
            docID: "statistics",
            obj: {},
          },
          timeout: 1000,
        }),
      };

      return this.load(
        this.fetch(`/api/v2/cruddb`, options).then((response) => {
          this.stats = response;
        }),
      );
    },
  },
};
</script>
