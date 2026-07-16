<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">{{ item.subtitle }}</template>
        <template v-else-if="versionstring"
          >Version {{ versionstring }}</template
        >
      </p>
    </template>
    <template #indicator>
      <div class="notifs">
        <strong
          v-for="badge in visibleBadges"
          :key="badge.key"
          class="notif"
          :style="{ backgroundColor: badge.color }"
          :title="badge.label"
        >
          {{ badge.text }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Traefik API, check url in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

// Protocol sections nest categories; certificates is a flat {total, warnings, errors}.
const protocols = ["http", "tcp", "udp"];
const categories = ["routers", "services", "middlewares"];

// Key doubles as the data key its response lands on.
const endpoints = {
  overview: "/api/overview",
  version: "/api/version",
};

// Indicator badges; key doubles as the hide key.
const badges = [
  { key: "routers", label: "Routers", color: "#2ac194" },
  { key: "services", label: "Services", color: "#2aa2c1" },
  { key: "middlewares", label: "Middlewares", color: "#2a57c1" },
  { key: "certificates", label: "Certificates", color: "#c1482a" },
  { key: "warnings", label: "Warnings", color: "#c1942a" },
  { key: "errors", label: "Errors", color: "#c12a57" },
];

export default {
  name: "Traefik",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    overview: null,
    version: null,
    failed: {},
  }),
  computed: {
    serverError() {
      return Object.values(this.failed).some(Boolean);
    },
    versionstring() {
      return this.version?.Version;
    },
    counts() {
      const totals = Object.fromEntries(badges.map((badge) => [badge.key, 0]));
      const overview = this.overview;
      if (!overview) return totals;
      for (const protocol of protocols) {
        const section = overview[protocol];
        if (!section) continue;
        for (const category of categories) {
          const entry = section[category];
          if (!entry) continue;
          totals[category] += entry.total || 0;
          totals.warnings += entry.warnings || 0;
          totals.errors += entry.errors || 0;
        }
      }
      const certificates = overview.certificates;
      if (certificates) {
        totals.certificates += certificates.total || 0;
        totals.warnings += certificates.warnings || 0;
        totals.errors += certificates.errors || 0;
      }
      return totals;
    },
    visibleBadges() {
      return badges
        .filter(
          (badge) => this.isValueShown(badge.key) && this.counts[badge.key] > 0,
        )
        .map((badge) => ({
          ...badge,
          text: this.capCount(this.counts[badge.key]),
        }));
    },
  },
  created() {
    this.fetchOptions = this.item.basic_auth
      ? { headers: { Authorization: `Basic ${btoa(this.item.basic_auth)}` } }
      : {};
    this.endpointsToFetch = this.resolveEndpoints();
    if (this.endpointsToFetch.length) {
      this.autoUpdateMethod = this.fetchStats;
      this.fetchStats();
    }
  },
  methods: {
    // A subtitle override hides the version, so skip it then.
    resolveEndpoints() {
      const keys = [];
      if (!this.item.subtitle) keys.push("version");
      if (badges.some((badge) => this.isValueShown(badge.key)))
        keys.push("overview");
      return keys;
    },
    load(key) {
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
    // Each load catches its own failure, so one bad endpoint can't sink the batch.
    fetchStats() {
      return Promise.all(this.endpointsToFetch.map((key) => this.load(key)));
    },
  },
};
</script>

<style scoped lang="scss">
.notifs {
  position: absolute;
  color: white;
  font-family: sans-serif;
  top: 0.3em;
  right: 0.5em;

  .notif {
    display: inline-block;
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
    font-size: 0.8em;

    &.errors {
      background-color: #c12a57;
    }
  }
}
</style>
