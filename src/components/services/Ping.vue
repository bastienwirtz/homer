<template>
  <Generic :item="item">
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else>
          {{ rttLabel }}
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Ping",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    status: null,
    rtt: null,
  }),
  computed: {
    rttLabel: function () {
      if (this.status === "online") {
        return `${this.rtt}ms`;
      }
      return "unavailable";
    },
  },
  created() {
    const updateInterval = parseInt(this.item.updateInterval, 10) || 0;
    if (updateInterval > 0) {
      setInterval(this.fetchStatus, updateInterval);
    }

    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const method =
        typeof this.item.method === "string"
          ? this.item.method.toUpperCase()
          : "HEAD";

      if (!["GET", "HEAD", "OPTION"].includes(method)) {
        console.error(`Ping: ${method} is not a supported HTTP method`);
        return;
      }

      const startTime = performance.now();
      const timeout = parseInt(this.item.timeout, 10) || 2000;
      const params = {
        method,
        cache: "no-cache",
        signal: AbortSignal.timeout(timeout),
      };

      this.fetch("/", params, false)
        .then(() => {
          this.status = "online";
          const endTime = performance.now();
          this.rtt = Math.round(endTime - startTime);
        })
        .catch(() => {
          this.status = "offline";
          this.rtt = null; // Reset rtt on failure
        });
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);
  white-space: nowrap;
  margin-left: 0.25rem;

  &.online:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.offline:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0 0 5px 1px #c9404d;
  }

  &:before {
    content: " ";
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 10px;
    border: 1px solid #000;
    border-radius: 7px;
  }
}
</style>
