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
    serverError() {
      return Object.values(this.failed).some(Boolean);
    },
    visibleBadges() {
      return badges
        .map((badge) => {
          const value = this.isValueShown(badge.key)
            ? badge.count(this[badge.from]) || 0
            : 0;
          return { ...badge, value, text: this.capCount(value) };
        })
        .filter((badge) => badge.value > 0);
    },
    versionstring() {
      return this.status?.version;
    },
    visibleIcons() {
      return icons.filter(
        (icon) => this.isValueShown(icon.key) && this.status?.[icon.key] === true,
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
