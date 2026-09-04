<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "WUD",
  mixins: [service],
  data: () => {
    return {
      running: null,
      update: null,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
        {
          key: "running",
          label: "Running",
          value: this.running,
          tone: "success",
        },
        { key: "update", label: "Update", value: this.update, tone: "warning" },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch(`/api/containers`).then((containers) => {
          this.running = containers.length;
          this.update = containers.filter(
            (container) => container.updateAvailable,
          ).length;
        }),
      );
    },
  },
};
</script>
