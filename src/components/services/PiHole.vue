<template>
  <Generic :item="item" :subtitle="subtitle" :status="status" />
</template>

<script>
import service from "@/mixins/service.js";

const BLOCKING_STATE = {
  enabled: "online",
  disabled: "warning",
  error: "offline",
};

export default {
  name: "PiHole",
  mixins: [service],
  data: () => ({
    blocking: "",
    errorMessage: "",
    percent_blocked: 0,
    sessionId: null,
    sessionExpiry: null,
    retryCount: 0,
    maxRetries: 3,
    retryDelay: 5000,
  }),
  computed: {
    status: function () {
      if (!this.blocking) {
        return null;
      }
      return { state: BLOCKING_STATE[this.blocking], label: this.blocking };
    },
    subtitle: function () {
      return (
        this.errorMessage || (this.percentage && `${this.percentage}% blocked`)
      );
    },
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
      this.loadCachedSession();

      // Set up auto-update method for the scheduler
      this.autoUpdateMethod = this.fetchStatus;
    } else {
      // Set up auto-update method for the scheduler
      this.autoUpdateMethod = this.fetchStatus_v5;
    }
    // Initial data fetch
    this.autoUpdateMethod();
  },
  methods: {
    handleError: function (error, state = "error") {
      console.error(error);
      this.errorMessage = error;
      this.blocking = state;
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
            `api/stats/summary?sid=${encodeURIComponent(this.sessionId)}`,
          ),
          this.fetch(
            `api/dns/blocking?sid=${encodeURIComponent(this.sessionId)}`,
          ),
        ]);

        if (
          summary_response?.queries?.percent_blocked === undefined ||
          status_response?.blocking === undefined
        ) {
          throw new Error("Invalid response format");
        }

        this.blocking = status_response.blocking;
        this.percent_blocked = summary_response.queries.percent_blocked;
        this.errorMessage = "";
        this.retryCount = 0;
      } catch (e) {
        const isAuthError =
          e.message.includes("401 error") || e.message.includes("403 error");
        if (isAuthError && this.item.apikey) {
          this.removeCacheSession();
          return this.retryWithDelay();
        }
        this.handleError(`Failed to fetch status: ${e.message || e}`);
        this.removeCacheSession();
      }
    },
    async fetchStatus_v5() {
      const authQueryParams = this.item.apikey
        ? `?summaryRaw&auth=${this.item.apikey}`
        : "";
      try {
        const result = await this.fetch(`/api.php${authQueryParams}`);

        this.blocking = result.status;
        this.percent_blocked = result.ads_percentage_today;
        this.errorMessage = "";
      } catch (e) {
        this.handleError(`Failed to fetch status: ${e}`);
      }
    },
  },
};
</script>
