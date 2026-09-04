<template>
  <Generic :item="item" :badges="badges">
    <template #subtitle>
      <span class="is-family-monospace mr-3">
        <i class="fas fa-download"></i>
        {{ downRate }}
      </span>
      <span class="is-family-monospace">
        <i class="fas fa-upload"></i>
        {{ upRate }}
      </span>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import { displayRate } from "@/utils/format.js";

export default {
  name: "Transmission",
  mixins: [service],
  data: () => ({
    dl: null,
    ul: null,
    count: null,
    serverError: null,
    sessionId: null,
  }),
  computed: {
    downRate: function () {
      return displayRate(this.dl);
    },
    upRate: function () {
      return displayRate(this.ul);
    },
    badges: function () {
      return [
        {
          key: "torrents",
          label: "Active torrents",
          value: this.count,
          tone: "neutral",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    /**
     * Transmission answers 409 with a fresh session id whenever it rotates
     * one, so every call gets its own retry.
     * @param {string} method - The RPC method to call
     * @param {boolean} retried - Internal: guards against a retry loop
     * @returns {Promise<Object>} RPC response
     */
    transmissionRequest: async function (method, retried = false) {
      const options = this.getRequestHeaders(method);

      // Add session ID header if we have one
      if (this.sessionId) {
        options.headers["X-Transmission-Session-Id"] = this.sessionId;
      }

      try {
        return await this.fetch("transmission/rpc", options);
      } catch (error) {
        if (error.cause?.status === 409 && !retried) {
          const sessionId = await this.readSessionId(error.cause);
          if (sessionId) {
            this.sessionId = sessionId;
            return this.transmissionRequest(method, true);
          }
        }
        throw error;
      }
    },
    // Cross-origin the header needs Access-Control-Expose-Headers, but the id
    // is also in the body, which is always readable.
    readSessionId: async function (response) {
      const header = response.headers.get("X-Transmission-Session-Id");
      if (header) {
        return header;
      }
      const body = await response.text().catch(() => "");
      return body.match(/X-Transmission-Session-Id:\s*([^\s<]+)/)?.[1] ?? null;
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
    fetchData: function () {
      return this.load(
        this.transmissionRequest("session-stats").then((statsResponse) => {
          if (statsResponse?.result !== "success") {
            throw new Error(
              `Transmission RPC failed: ${statsResponse?.result || "Unknown error"}`,
            );
          }

          const stats = statsResponse.arguments;
          this.dl = stats.downloadSpeed ?? 0;
          this.ul = stats.uploadSpeed ?? 0;
          this.count = stats.activeTorrentCount ?? 0;
        }),
      );
    },
  },
};
</script>
