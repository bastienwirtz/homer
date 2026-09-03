<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Lidarr",
  mixins: [service],
  data: () => {
    return {
      activity: null,
      missing: null,
      warnings: null,
      errors: null,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
        {
          key: "activity",
          label: "Activity",
          value: this.activity,
          tone: "info",
        },
        {
          key: "missing",
          label: "Missing",
          value: this.missing,
          tone: "accent",
        },
        {
          key: "warnings",
          label: "Warning",
          value: this.warnings,
          tone: "warning",
        },
        { key: "errors", label: "Error", value: this.errors, tone: "danger" },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch(`/api/v1/health?apikey=${this.item.apikey}`).then(
          (health) => {
            this.warnings = 0;
            this.errors = 0;
            for (var i = 0; i < health.length; i++) {
              if (health[i].type == "warning") {
                this.warnings++;
              } else if (health[i].type == "error") {
                this.errors++;
              }
            }
          },
        ),
        this.fetch(`/api/v1/queue/status?apikey=${this.item.apikey}`).then(
          (queue) => {
            this.activity = queue.totalCount;
          },
        ),
        this.fetch(`/api/v1/wanted/missing?apikey=${this.item.apikey}`).then(
          (queue) => {
            this.missing = queue.totalRecords;
          },
        ),
      );
    },
  },
};
</script>
