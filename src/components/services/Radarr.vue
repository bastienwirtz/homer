<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

const V3_API = "/api/v3";
const LEGACY_API = "/api";

export default {
  name: "Radarr",
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
      const apikey = this.item.apikey;

      // Both feed warnings/errors, so they are assigned once rather than
      // incremented from two concurrent responses.
      const health = this.fetch(`${this.apiPath}/health?apikey=${apikey}`).then(
        (entries) => ({
          warnings: entries.filter((h) => h.type == "warning").length,
          errors: entries.filter((h) => h.type == "error").length,
        }),
      );

      const requests = [
        this.fetch(`${this.apiPath}/queue?apikey=${apikey}`).then((queue) => {
          this.activity = this.item.legacyApi
            ? queue.filter((entry) => entry.movie).length
            : queue.totalRecords;
        }),
      ];

      if (this.item.legacyApi) {
        requests.push(
          health.then((counts) => {
            this.warnings = counts.warnings;
            this.errors = counts.errors;
          }),
        );
      } else {
        requests.push(
          Promise.all([
            health,
            this.fetch(`${this.apiPath}/queue/details?apikey=${apikey}`),
          ]).then(([counts, queue]) => {
            this.warnings =
              counts.warnings +
              queue.filter((e) => e.trackedDownloadStatus == "warning").length;
            this.errors =
              counts.errors +
              queue.filter((e) => e.trackedDownloadStatus == "error").length;
          }),
          this.fetch(
            `${this.apiPath}/wanted/missing?pageSize=1&apikey=${apikey}`,
          ).then((overview) =>
            this.fetch(
              `${this.apiPath}/wanted/missing?pageSize=${overview.totalRecords}&apikey=${apikey}`,
            ).then((movies) => {
              this.missing = movies.records.filter(
                (m) => m.monitored && m.isAvailable && !m.hasFile,
              ).length;
            }),
          ),
        );
      }

      return this.load(...requests);
    },
  },
};
</script>
