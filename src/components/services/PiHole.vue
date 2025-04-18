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
      required: true
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
  }),
  computed: {
    percentage: function () {
      if (this.percent_blocked) {
        return this.percent_blocked.toFixed(1);
      }
      return "";
    },
    isAuthenticated() {
      return this.sessionId && this.sessionExpiry && Date.now() < this.sessionExpiry;
    }
  },
  created() {
    if (parseInt(this.item.apiVersion, 10) === 6) {
      this.loadCachedSession();
      this.startStatusPolling();
    } else {
      this.fetchStatus_v5();
    }
  },
  beforeDestroy() {
    if (parseInt(this.item.apiVersion, 10) === 6) {
      this.stopStatusPolling();
      this.deleteSession();
    }
  },
  methods: {
    startStatusPolling: function () {
      this.fetchStatus();
      // Poll every 5 minutes
      this.pollInterval = setInterval(this.fetchStatus, 300000);
    },
    stopStatusPolling: function () {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
      }
    },
    loadCachedSession: function () {
      try {
        const cachedSession = localStorage.getItem(`pihole_session_${this.item.url}`);
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
        console.error("Failed to load cached session:", e);
        this.removeCacheSession();
      }
    },
    removeCacheSession: function () {
      localStorage.removeItem(`pihole_session_${this.item.url}`);
      this.sessionId = null;
      this.sessionExpiry = null;
    },
    deleteSession: async function () {
      if (!this.sessionId) return;
      
      try {
        await this.fetch(`/api/auth/session/${encodeURIComponent(this.sessionId)}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error("Failed to delete session:", e);
      } finally {
        this.removeCacheSession();
      }
    },
    authenticate: async function () {
      if (!this.item.apikey) {
        console.error("API key is required for PiHole authentication");
        this.status = "disabled";
        return false;
      }

      try {
        const authResponse = await this.fetch("/api/auth", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password: this.item.apikey }),
        });

        if (authResponse?.session?.sid) {
          this.sessionId = authResponse.session.sid;
          this.sessionExpiry = Date.now() + (authResponse.session.validity * 1000);
          
          localStorage.setItem(`pihole_session_${this.item.url}`, JSON.stringify({
            sid: this.sessionId,
            expiry: this.sessionExpiry
          }));
          
          this.retryCount = 0;
          return true;
        }
        throw new Error("Invalid authentication response");
      } catch (e) {
        console.error("Authentication failed:", e);
        this.status = "disabled";
        return false;
      }
    },
    retryWithDelay: async function () {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchStatus();
      }
      return false;
    },
    fetchStatus: async function () {
      try {
        if (!this.isAuthenticated) {
          const authenticated = await this.authenticate();
          if (!authenticated) return;
        }

        const url = `${this.endpoint}/${`api/stats/summary?sid=${encodeURIComponent(this.sessionId)}`.replace(/^\/+/, '')}`;
        const response = await fetch(url);
        this.status = "enabled";
        
        if (response.ok) {
          const result = await response.json();
          if (result?.queries?.percent_blocked !== undefined) {
            this.percent_blocked = result.queries.percent_blocked;
            this.retryCount = 0;
          } else {
            throw new Error("Invalid response format");
          }
        } else if (response.status === 401) {
          this.removeCacheSession();
          return this.retryWithDelay();
        } else {
          throw new Error(`HTTP error: ${response.status}`);
        }
      } catch (e) {
        console.error("Failed to fetch status:", e);
        if (e.message.includes("HTTP error: 401") || e.message.includes("HTTP error: 403")) {
          this.removeCacheSession();
          return this.retryWithDelay();
        }
        this.status = "disabled";
        this.removeCacheSession();
      }
    },
    async fetchStatus_v5() {
      try {
        const params = {};
        if (this.item.apikey) {
          params.auth = this.item.apikey;
        }
        const url = new URL(`${this.endpoint}/api.php`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        const response = await fetch(url);
        this.status = response.status.toString();
        
        if (response.ok) {
          const result = await response.json();
          if (result?.ads_percentage_today !== undefined) {
            this.percent_blocked = result.ads_percentage_today;
          }
        } else {
          throw new Error(`HTTP error: ${response.status}`);
        }
      } catch (e) {
        console.error("Failed to fetch v5 status:", e);
        this.status = "error";
      }
    },
  }
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
