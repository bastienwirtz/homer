<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";
export default {
  name: "DockerSocketProxy",
  mixins: [service],
  data: () => {
    return {
      running: null,
      stopped: null,
      errors: null,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
        {
          key: "running",
          label: "Running Containers",
          value: this.running,
          tone: "success",
        },
        {
          key: "stopped",
          label: "Stopped Containers",
          value: this.stopped,
          tone: "neutral",
        },
        { key: "errors", label: "Error", value: this.errors, tone: "danger" },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch("/containers/json?all=true").then((containers) => {
          this.running = containers.filter(
            (container) => container.State === "running",
          ).length;
          this.stopped = containers.filter(
            (container) => container.State === "exited",
          ).length;
        }),
      );
    },
  },
};
</script>
