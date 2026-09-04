<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

const API = "/api/v1";

export default {
  name: "Readarr",
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
        this.fetch(`${API}/health?apikey=${this.item.apikey}`).then(
          (health) => {
            this.warnings = health.filter((h) => h.type === "warning").length;
            this.errors = health.filter((h) => h.type === "error").length;
          },
        ),
        this.fetch(`${API}/queue?apikey=${this.item.apikey}`).then((queue) => {
          this.activity = queue.totalRecords;
        }),
        this.fetch(`${API}/wanted/missing?apikey=${this.item.apikey}`).then(
          (missing) => {
            this.missing = missing.totalRecords;
          },
        ),
      );
    },
  },
};
</script>
