<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

const V3_API = "/api/v3";
const LEGACY_API = "/api";

export default {
  name: "Sonarr",
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
    apiPath() {
      return this.item.legacyApi ? LEGACY_API : V3_API;
    },
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
        this.fetch(`${this.apiPath}/health?apikey=${this.item.apikey}`).then(
          (health) => {
            this.warnings = health.filter((h) => h.type === "warning").length;
            this.errors = health.filter((h) => h.type === "error").length;
          },
        ),
        this.fetch(`${this.apiPath}/queue?apikey=${this.item.apikey}`).then(
          (queue) => {
            this.activity = 0;
            if (this.item.legacyApi) {
              for (var i = 0; i < queue.length; i++) {
                if (queue[i].series) {
                  this.activity++;
                }
              }
            } else {
              this.activity = queue.totalRecords;
            }
          },
        ),
        this.fetch(
          `${this.apiPath}/wanted/missing?apikey=${this.item.apikey}`,
        ).then((missing) => {
          this.missing = missing.totalRecords;
        }),
      );
    },
  },
};
</script>
