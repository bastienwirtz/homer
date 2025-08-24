<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <span v-if="error" class="error">An error has occurred.</span>
        <template v-else-if="count > 0 || shouldShowWhenEmpty">
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
      <span v-if="!error && (count > 0 || shouldShowWhenEmpty)" class="count"
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
  let i = 0;

  while (rate > 1000 && i < units.length) {
    rate /= 1000;
    i++;
  }
  return (
    Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
      rate || 0,
    ) + ` ${units[i]}/s`
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
  }),
  computed: {
    downRate: function () {
      return displayRate(this.dl);
    },
    upRate: function () {
      return displayRate(this.ul);
    },
    shouldShowWhenEmpty: function () {
      // Default to true (show when empty) unless explicitly set to false
      return this.item.showWhenEmpty !== false;
    },
  },
  created() {
    // Validate that endpoint is configured
    if (!this.endpoint) {
      this.error = true;
      console.error("Transmission service: No endpoint configured");
      return;
    }

    const rateInterval = parseInt(this.item.rateInterval, 10) || 0;
    const torrentInterval = parseInt(this.item.torrentInterval, 10) || 0;

    // Set up intervals if configured (rate and torrent intervals can be different)
    if (rateInterval > 0) {
      setInterval(() => this.getStats(), rateInterval);
    }
    if (torrentInterval > 0) {
      setInterval(() => this.getStats(), torrentInterval);
    }

    // Initial fetch
    this.getStats();
  },
  methods: {
    /**
     * Makes a request to Transmission RPC API with proper session handling
     * @param {string} method - The RPC method to call
     * @param {Object} requestArgs - Arguments for the RPC method
     * @returns {Promise<Object>} RPC response
     */
    transmissionRequest: async function (method, requestArgs = {}) {
      const requestData = {
        method: method,
        arguments: requestArgs,
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      };

      // Add HTTP Basic Auth if credentials are provided
      if (this.item.username && this.item.password) {
        const credentials = btoa(`${this.item.username}:${this.item.password}`);
        options.headers["Authorization"] = `Basic ${credentials}`;
      }

      // Add session ID header if we have one
      if (this.sessionId) {
        options.headers["X-Transmission-Session-Id"] = this.sessionId;
      }

      try {
        const response = await fetch(
          this.endpoint + "/transmission/rpc",
          options,
        );

        // Handle session ID requirement
        if (response.status === 409) {
          this.sessionId = response.headers.get("X-Transmission-Session-Id");
          if (this.sessionId) {
            options.headers["X-Transmission-Session-Id"] = this.sessionId;
            const retryResponse = await fetch(
              this.endpoint + "/transmission/rpc",
              options,
            );
            return await retryResponse.json();
          }
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Transmission RPC error:", error);
        throw error;
      }
    },
    getStats: async function () {
      try {
        // Get session stats for transfer rates and torrent count
        const statsResponse = await this.transmissionRequest("session-stats");

        if (statsResponse && statsResponse.result === "success") {
          const stats = statsResponse.arguments;
          this.dl = stats.downloadSpeed ?? 0;
          this.ul = stats.uploadSpeed ?? 0;
          this.count = stats.activeTorrentCount ?? 0;
          this.error = false;
        } else {
          throw new Error(
            `Transmission RPC failed: ${statsResponse?.result || "Unknown error"}`,
          );
        }
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
