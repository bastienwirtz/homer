<template>
  <Generic :item="item" :badges="badges">
    <template v-if="versionstring" #subtitle>
      {{ displayVersion(versionstring) }}
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
import { displayVersion } from "@/utils/format.js";

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
    cap: false,
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
    serverError: null,
  }),
  computed: {
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
  methods: {
    displayVersion,
    fetchData: function () {
      const headers = { "X-Api-Key": this.item.apikey };
      const keys = Object.keys(endpoints).filter(
        (key) =>
          key === "status" ||
          counters.some(
            (counter) => counter.from === key && this.isValueShown(counter.key),
          ),
      );

      return this.load(
        ...keys.map((key) =>
          this.fetch(endpoints[key], { headers }).then((data) => {
            this[key] = data;
          }),
        ),
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
