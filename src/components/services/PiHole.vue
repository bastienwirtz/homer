<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="percentage">
          {{ percentage }}&percnt; blocked
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "PiHole",
  mixins: [service],
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    status: "",
    percent_blocked: 0,
    sessionId: null,
    sessionExpiry: null,
    retryCount: 0,
    maxRetries: 3,
    retryDelay: 5000,
    localCheckInterval: 1000, // Default value or a fallback
    pollInterval: null,
  }),
  computed: {
    percentage: function () {
      if (this.percent_blocked >= 0) {
        return this.percent_blocked.toFixed(1);
      }
      return "";
    },
    isAuthenticated() {
      return (
        this.sessionId && this.sessionExpiry && Date.now() < this.sessionExpiry
      );
    },
  },
  created() {
    if (parseInt(this.item.apiVersion, 10) === 6) {
      // Set the interval to the checkInterval or default to 5 minutes
      this.localCheckInterval = parseInt(this.item.checkInterval, 10) || 300000;
      this.loadCachedSession();
      this.startStatusPolling();
    } else {
      this.fetchStatus_v5();
    }
  },
  beforeUnmount() {
    if (parseInt(this.item.apiVersion, 10) === 6) {
      this.stopStatusPolling();
    }
  },
  methods: {
    handleError: function (error, status) {
      console.error(error);
      this.subtitle = error;
      this.status = status;
    },
    startStatusPolling: function () {
      this.fetchStatus();
      if (this.localCheckInterval < 1000) {
        this.localCheckInterval = 1000;
      }
      this.pollInterval = setInterval(
        this.fetchStatus,
        this.localCheckInterval,
      );
    },
    stopStatusPolling: function () {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
      }
    },
    loadCachedSession: function () {
      try {
        const cachedSession = localStorage.getItem(
          `pihole_session_${this.item.url}`,
        );
        if (cachedSession) {
          const session = JSON.parse(cachedSession);
          if (session.expiry > Date.now()) {
            this.sessionId = session.sid;
            this.sessionExpiry = session.expiry;
          } else {
            this.removeCacheSession();
          }
        }
      } catch (e) {
        this.handleError(`Failed to load cached session: ${e}`, "error");
        this.removeCacheSession();
      }
    },
    removeCacheSession: function () {
      localStorage.removeItem(`pihole_session_${this.item.url}`);
      this.sessionId = null;
      this.sessionExpiry = null;
    },
    authenticate: async function () {
      try {
        const authResponse = await this.fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: this.item.apikey }),
        });

        if (authResponse?.session?.sid) {
          this.sessionId = authResponse.session.sid;
          this.sessionExpiry =
            Date.now() + authResponse.session.validity * 1000;

          localStorage.setItem(
            `pihole_session_${this.item.url}`,
            JSON.stringify({
              sid: this.sessionId,
              expiry: this.sessionExpiry,
            }),
          );

          this.retryCount = 0;
          return true;
        }
        throw new Error("Invalid authentication response");
      } catch (e) {
        this.handleError(`Authentication failed: ${e}`, "disabled");
        return false;
      }
    },
    retryWithDelay: async function () {
      console.log("Retrying authentication...");
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.fetchStatus();
      }
      return false;
    },
    fetchStatus: async function () {
      try {
        if (!this.isAuthenticated && this.item.apikey) {
          const authenticated = await this.authenticate();
          if (!authenticated) return;
        }

        const [summary_response, status_response] = await Promise.all([
          this.fetch(
            `api/stats/summary?sid=${encodeURIComponent(this.sessionId)}`
          ),
          this.fetch(
            `api/dns/blocking?sid=${encodeURIComponent(this.sessionId)}`
          )
        ]);

        if (
          summary_response?.queries?.percent_blocked === undefined ||
          status_response?.blocking === undefined
        ) {
          throw new Error("Invalid response format");
        }

        this.status = status_response.blocking;
        this.percent_blocked = summary_response.queries.percent_blocked;
        this.retryCount = 0;
      } catch (e) {
        const isAuthError =
          e.message.includes("401 error") || e.message.includes("403 error");
        if (isAuthError && this.item.apikey) {
          this.removeCacheSession();
          return this.retryWithDelay();
        }
        this.handleError(
          `Failed to fetch status: ${e.message || e}`,
          "error",
        );
        this.removeCacheSession();
      }
    },
    async fetchStatus_v5() {
      const authQueryParams = this.item.apikey
        ? `?summaryRaw&auth=${this.item.apikey}`
        : "";
      const result = await this.fetch(`/api.php${authQueryParams}`).catch((e) =>
        this.handleError(`Failed to fetch status: ${e}`, "error"),
      );

      this.status = result.status;
      this.percent_blocked = result.ads_percentage_today;
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.enabled:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.disabled:before {
    background-color: #f5a623;
    border-color: #e59400;
    box-shadow: 0 0 5px 1px #f5a623;
  }

  &.error:before {
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
