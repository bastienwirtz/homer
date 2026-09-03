<template>
  <Generic
    :item="item"
    :subtitle="versionSubtitle"
    :status="reachabilityStatus()"
    :badges="badges"
  />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Portainer",
  mixins: [service],
  data: () => ({
    containers: null,
    serverError: null,
    versionstring: null,
  }),
  computed: {
    running: function () {
      if (!this.containers) {
        return "";
      }
      return this.containers.filter((container) => {
        return container.State.toLowerCase() === "running";
      }).length;
    },
    dead: function () {
      if (!this.containers) {
        return "";
      }
      return this.containers.filter((container) => {
        return container.State.toLowerCase() === "dead";
      }).length;
    },
    misc: function () {
      if (!this.containers) {
        return "";
      }
      return this.containers.filter((container) => {
        return (
          container.State.toLowerCase() !== "running" &&
          container.State.toLowerCase() !== "dead"
        );
      }).length;
    },
    badges() {
      return [
        {
          key: "running",
          label: "Running",
          value: this.running,
          tone: "success",
        },
        { key: "dead", label: "Dead", value: this.dead, tone: "danger" },
        {
          key: "misc",
          label: "Other (creating, paused, exited, etc.)",
          value: this.misc,
          tone: "neutral",
        },
      ];
    },
  },
  methods: {
    fetchData: function () {
      const headers = {
        "X-Api-Key": this.item.apikey,
      };

      return this.load(
        this.fetch("/api/status", { headers }).then((response) => {
          this.versionstring = response.Version;
        }),
        this.fetchContainers(headers),
      );
    },
    fetchContainers: async function (headers) {
      const endpoints = await this.fetch("/api/endpoints", { headers });
      const wanted = endpoints.filter(
        (endpoint) =>
          !this.item.environments ||
          this.item.environments.includes(endpoint.Name),
      );

      // One dead environment must not blank the others, but still reports.
      const results = await Promise.allSettled(
        wanted.map((endpoint) =>
          this.fetch(
            `/api/endpoints/${endpoint.Id}/docker/containers/json?all=1`,
            { headers },
          ),
        ),
      );

      this.containers = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value);

      const failed = results.find((result) => result.status === "rejected");
      if (failed) {
        throw failed.reason;
      }
    },
  },
};
</script>
