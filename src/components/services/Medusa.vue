<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Medusa",
  mixins: [service],
  data: () => {
    return {
      stats: null,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
        {
          key: "news",
          label: "News",
          value: this.stats?.system?.news?.unread,
          tone: "neutral",
        },
        {
          key: "warnings",
          label: "Warning",
          value: this.stats?.main?.logs?.numWarnings,
          tone: "warning",
        },
        {
          key: "errors",
          label: "Error",
          value: this.stats?.main?.logs?.numErrors,
          tone: "danger",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch("/api/v2/config", {
          headers: { "X-Api-Key": this.item.apikey },
        }).then((conf) => {
          this.stats = conf;
        }),
      );
    },
  },
};
</script>
