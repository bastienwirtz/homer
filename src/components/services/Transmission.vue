<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p v-if="item.subtitle" class="subtitle is-6">{{ item.subtitle }}</p>
      <p v-else class="subtitle is-6">
        <span v-if="error" class="error">An error has occurred.</span>
        <template v-else>
          <span class="down monospace">
            <p class="fas fa-download"></p>
            {{ downRate }}
          </span>
          <span class="up monospace">
            <p class="fas fa-upload"></p>
            {{ upRate }}
          </span>
        </template>
      </p>
    </template>
    <template #indicator>
      <span v-if="!error" class="count"
        >{{ count || 0 }}
        <template v-if="(count || 0) === 1">torrent</template>
        <template v-else>torrents</template>
      </span>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
const units = ["B", "KB", "MB", "GB"];

// Take the rate in bytes and keep dividing it by 1k until the lowest
// value for which we have a unit is determined. Return the value with
// up to two decimals as a string and unit/s appended.
const displayRate = (rate) => {
  let unitIndex = 0;

  while (rate > 1000 && unitIndex < units.length - 1) {
    rate /= 1000;
    unitIndex++;
  }
  return (
    Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
      rate || 0,
    ) + ` ${units[unitIndex]}/s`
  );
};

export default {
  name: "Transmission",
  mixins: [service],
  props: { item: Object },
  data: () => ({
    dl: null,
    ul: null,
    count: null,
    error: null,
    sessionId: null,
    retry: 0,
  }),
  computed: {
    downRate: function () {
      return displayRate(this.dl);
    },
    upRate: function () {
      return displayRate(this.ul);
    },
  },
  created() {
    const interval = parseInt(this.item.interval, 10) || 0;

    // Set up interval if configured
    if (interval > 0) {
      setInterval(() => this.getStats(), interval);
    }

    // Initial fetch
    this.getStats();
  },
  methods: {
    /**
     * Makes a request to Transmission RPC API with proper session handling
     * @param {string} method - The RPC method to call
     * @returns {Promise<Object>} RPC response
     */
    transmissionRequest: async function (method) {
      const options = this.getRequestHeaders(method);

      // Add session ID header if we have one
      if (this.sessionId) {
        options.headers["X-Transmission-Session-Id"] = this.sessionId;
      }

      try {
        return await this.fetch("transmission/rpc", options);
      } catch (error) {
        // Handle Transmission's 409 session requirement
        if (error.cause.status == 409 && this.retry <= 1) {
          const sessionId = await this.getSession();
          if (sessionId) {
            this.sessionId = sessionId;
            this.retry++;
            return this.transmissionRequest(method);
          }
        }
        console.error("Transmission RPC error:", error);
        throw error;
      }
    },
    getRequestHeaders: function (method) {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method }),
      };

      if (this.item.auth) {
        options.headers["Authorization"] = `Basic ${btoa(this.item.auth)}`;
      }

      return options;
    },
    getSession: async function () {
      try {
        await this.fetch(
          "transmission/rpc",
          this.getRequestHeaders("session-get"),
        );
      } catch (error) {
        if (error.cause.status == 409) {
          return error.cause.headers.get("X-Transmission-Session-Id");
        }
      }
    },
    getStats: async function () {
      try {
        // Get session stats for transfer rates and torrent count
        const statsResponse = await this.transmissionRequest("session-stats");
        if (statsResponse?.result !== "success") {
          throw new Error(
            `Transmission RPC failed: ${statsResponse?.result || "Unknown error"}`,
          );
        }

        const stats = statsResponse.arguments;
        this.dl = stats.downloadSpeed ?? 0;
        this.ul = stats.uploadSpeed ?? 0;
        this.count = stats.activeTorrentCount ?? 0;
        this.error = false;
      } catch (e) {
        this.error = true;
        console.error("Transmission service error:", e);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.error {
  color: #e51111 !important;
}

.down {
  margin-right: 1em;
}

.count {
  color: var(--text);
  font-size: 0.8em;
}

.monospace {
  font-weight: 300;
  font-family: monospace;
}
</style>
