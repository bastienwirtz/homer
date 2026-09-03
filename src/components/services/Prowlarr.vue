<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Prowlarr",
  mixins: [service],
  data: () => {
    return {
      warnings: null,
      errors: null,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
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
      );
    },
  },
};
</script>
