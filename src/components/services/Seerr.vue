<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">{{ item.subtitle }}</template>
        <template v-else-if="versionstring">
          Version {{ versionstring }}
          <i
            v-for="icon in visibleIcons"
            :key="icon.key"
            class="state"
            :class="icon.class"
          ></i>
        </template>
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
          title="Connection error to Seerr API, check url and apikey in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

// monitor: true | false | { enabled?, ... } -> flags, all defaulting on.
function monitors(monitor, key) {
  if (!monitor) return false;
  if (monitor === true) return true;
  if (monitor.enabled === false) return false;
  return monitor[key] !== false;
}

// A section nests one level deeper: false, true or a map.
function monitorsIn(monitor, section, key) {
  if (!monitors(monitor, section)) return false;
  return monitors(monitor[section] ?? true, key);
}

// A badge is a small pill; large numbers blow out the card.
function cap(value) {
  return value > 99 ? "99+" : value;
}

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

// Indicator badges; count reads the response landed by `from`.
const badges = [
  {
    key: "media",
    label: "Available media",
    color: "#2ac194",
    from: "media",
    count: (data) => data?.pageInfo?.results,
  },
  {
    key: "pending",
    label: "Pending requests",
    color: "#0a4bc4",
    from: "requests",
    count: (data) => data?.pending,
  },
  {
    key: "processing",
    label: "Processing requests",
    color: "#6f11a6",
    from: "requests",
    count: (data) => data?.processing,
  },
  {
    key: "issues",
    label: "Open issues",
    color: "#c1942a",
    from: "issues",
    count: (data) => data?.open,
  },
];

export default {
  name: "Seerr",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    status: null,
    requests: null,
    issues: null,
    media: null,
    failed: {},
  }),
  computed: {
    fetchOptions() {
      if (!this.item.apikey) return {};
      return { headers: { "X-Api-Key": this.item.apikey } };
    },
    serverError() {
      return Object.values(this.failed).some(Boolean);
    },
    monitored() {
      const monitor = this.item.monitor ?? true;
      return {
        updateAvailable: monitorsIn(monitor, "server", "updateAvailable"),
        restartRequired: monitorsIn(monitor, "server", "restartRequired"),
        media: monitors(monitor, "media"),
        pending: monitorsIn(monitor, "requests", "pending"),
        processing: monitorsIn(monitor, "requests", "processing"),
        issues: monitors(monitor, "issues"),
      };
    },
    // Only endpoints behind an enabled badge are worth calling.
    monitoredEndpoints() {
      const enabled = badges.filter((badge) => this.monitored[badge.key]);
      return [...new Set(enabled.map((badge) => badge.from))];
    },
    visibleBadges() {
      return badges
        .map((badge) => {
          const value = this.monitored[badge.key]
            ? badge.count(this[badge.from]) || 0
            : 0;
          return { ...badge, value, text: cap(value) };
        })
        .filter((badge) => badge.value > 0);
    },
    versionstring() {
      return this.status?.version ?? null;
    },
    visibleIcons() {
      return icons.filter(
        (icon) => this.monitored[icon.key] && this.status?.[icon.key] === true,
      );
    },
  },
  created() {
    if (this.monitoredEndpoints.length) {
      this.autoUpdateMethod = this.fetchStats;
      this.fetchStats();
    }
    // A subtitle override hides the version, so don't fetch it.
    if (!this.item.subtitle) this.load("status");
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
    // Each load catches its own failure, so one bad endpoint can't sink the batch.
    fetchStats() {
      return Promise.all(this.monitoredEndpoints.map((key) => this.load(key)));
    },
  },
};
</script>

<style scoped lang="scss">
.state {
  margin-left: 0.2em;
}

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
