<template>
  <Generic :item="item" :badges="badges">
    <template v-if="versionstring" #subtitle>
      {{ versionSubtitle }}
      <i
        v-for="icon in visibleIcons"
        :key="icon.key"
        class="state"
        :class="icon.class"
      ></i>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

// Key doubles as the data key its response lands on.
const endpoints = {
  status: "/api/v1/status",
  // allavailable counts partially available too; results is a total, so take is moot.
  media: "/api/v1/media?filter=allavailable",
  requests: "/api/v1/request/count",
  issues: "/api/v1/issue/count",
};

// Subtitle icons; key is also the status flag each one reads.
const icons = [
  { key: "updateAvailable", class: "fa-solid fa-circle-arrow-up" },
  { key: "restartRequired", class: "fa-solid fa-recycle" },
];

// Count reads the response landed by `from`.
const counters = [
  {
    key: "media",
    label: "Available media",
    tone: "success",
    from: "media",
    count: (data) => data?.pageInfo?.results,
  },
  {
    key: "pending",
    label: "Pending requests",
    tone: "info",
    from: "requests",
    count: (data) => data?.pending,
  },
  {
    key: "processing",
    label: "Processing requests",
    tone: "accent",
    from: "requests",
    count: (data) => data?.processing,
  },
  {
    key: "issues",
    label: "Open issues",
    tone: "warning",
    from: "issues",
    count: (data) => data?.open,
  },
];

export default {
  name: "Seerr",
  mixins: [service],
  data: () => ({
    status: null,
    requests: null,
    issues: null,
    media: null,
    failed: {},
  }),
  computed: {
    serverError() {
      return Object.values(this.failed).some(Boolean);
    },
    badges() {
      return [
        ...counters.map(({ count, from, ...badge }) => ({
          ...badge,
          value: count(this[from]),
        })),
        this.connectionBadge(),
      ];
    },
    versionstring() {
      return this.status?.version;
    },
    visibleIcons() {
      return icons.filter(
        (icon) =>
          this.isValueShown(icon.key) && this.status?.[icon.key] === true,
      );
    },
  },
  created() {
    this.fetchOptions = this.item.apikey
      ? { headers: { "X-Api-Key": this.item.apikey } }
      : {};
    this.endpointsToFetch = this.resolveEndpoints();
    if (this.endpointsToFetch.length) {
      this.autoUpdateMethod = this.fetchStats;
      this.fetchStats();
    }
  },
  methods: {
    // A subtitle override hides the version, so skip status then.
    resolveEndpoints() {
      const keys = [];
      if (!this.item.subtitle) keys.push("status");
      if (this.isValueShown("media")) keys.push("media");
      if (this.isValueShown("pending") || this.isValueShown("processing"))
        keys.push("requests");
      if (this.isValueShown("issues")) keys.push("issues");
      return keys;
    },
    loadEndpoint(key) {
      return this.fetch(endpoints[key], this.fetchOptions)
        .then((data) => {
          this[key] = data;
          this.failed[key] = false;
        })
        .catch((e) => {
          console.error(e);
          this.failed[key] = true;
        });
    },
    fetchStats() {
      return Promise.all(
        this.endpointsToFetch.map((key) => this.loadEndpoint(key)),
      );
    },
  },
};
</script>

<style scoped lang="scss">
.state {
  margin-left: 0.2em;
}
</style>
