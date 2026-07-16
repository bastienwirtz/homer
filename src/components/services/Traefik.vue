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
          {{ badge.value }}
        </strong>
        <strong
          v-if="serverError"
          class="notif"
          :style="{ backgroundColor: errorColor }"
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

// Overview sections we count; everything is on unless item.monitor says otherwise.
const sections = ["http", "tcp", "udp", "certificates"];

// true | false | { enabled?, warnings?, errors? } -> count flags, all defaulting on.
function resolveLeaf(value) {
  if (!value) return { enabled: false };
  if (value === true) return { enabled: true, warnings: true, errors: true };
  return {
    enabled: value.enabled !== false,
    warnings: value.warnings !== false,
    errors: value.errors !== false,
  };
}

function overridesOf(selection) {
  return selection && typeof selection === "object" ? selection : {};
}

// Unmentioned keys stay on.
function selectionFor(overrides, key) {
  return key in overrides ? overrides[key] : true;
}

// certificates is flat {total, warnings, errors}; the protocols nest categories.
function countableEntries(section, data, selection) {
  const leaf = resolveLeaf(selection);
  if (!data || !leaf.enabled) return [];
  if (section === "certificates") return [[section, data, leaf]];
  const overrides = overridesOf(selection);
  return Object.keys(data).map((category) => [
    category,
    data[category],
    resolveLeaf(selectionFor(overrides, category)),
  ]);
}

// warnings and errors roll up, so one entry can feed several badges.
function addEntry(totals, bucket, entry, leaf) {
  if (!entry || !leaf.enabled) return;
  totals[bucket] += entry.total || 0;
  if (leaf.warnings) totals.warnings += entry.warnings || 0;
  if (leaf.errors) totals.errors += entry.errors || 0;
}

// Key doubles as the data key its response lands on.
const endpoints = {
  overview: "/api/overview",
  version: "/api/version",
};

// Indicator badges
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
    fetchOptions() {
      if (!this.item.basic_auth) return {};
      return {
        headers: { Authorization: `Basic ${btoa(this.item.basic_auth)}` },
      };
    },
    serverError() {
      return Object.values(this.failed).some(Boolean);
    },
    errorColor() {
      return badges.find((badge) => badge.key === "errors").color;
    },
    versionstring() {
      return this.version?.Version ?? null;
    },
    monitoring() {
      return resolveLeaf(this.item.monitor ?? true).enabled;
    },
    counts() {
      const totals = Object.fromEntries(badges.map((badge) => [badge.key, 0]));
      if (!this.overview || !this.monitoring) return totals;
      const overrides = overridesOf(this.item.monitor);
      for (const section of sections) {
        const entries = countableEntries(
          section,
          this.overview[section],
          selectionFor(overrides, section),
        );
        for (const [bucket, entry, leaf] of entries) {
          addEntry(totals, bucket, entry, leaf);
        }
      }
      return totals;
    },
    visibleBadges() {
      return badges
        .filter((badge) => this.counts[badge.key] > 0)
        .map((badge) => ({ ...badge, value: this.counts[badge.key] }));
    },
  },
  created() {
    if (this.monitoring) {
      this.autoUpdateMethod = () => this.load("overview");
      this.load("overview");
    }
    // A subtitle override hides the version, so don't fetch it.
    if (!this.item.subtitle) this.load("version");
  },
  methods: {
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
  }
}
</style>
