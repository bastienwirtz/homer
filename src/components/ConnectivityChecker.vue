<template>
  <div v-if="offline" class="offline-message mb-4">
    <i class="fa-solid fa-triangle-exclamation"></i>
    <h1>
      Network unreachable
      <span @click="checkOffline"> <i class="fas fa-redo-alt"></i></span>
    </h1>
    <p>
      <a
        href="https://github.com/bastienwirtz/homer/blob/main/docs/configuration.md#connectivity-checks"
        target="_blank"
        rel="noopener noreferrer"
        >More information →</a
      >
    </p>
  </div>
</template>

<script>
export default {
  name: "ConnectivityChecker",
  data() {
    return {
      offline: false,
    };
  },
  mounted() {
    this.removeTimestampFromUrl();
    this.checkOfflineStatus();
    this.setupEventListeners();
  },
  beforeUnmount() {
    this.removeEventListeners();
  },
  methods: {
    removeTimestampFromUrl() {
      if (/t=\d+/.test(window.location.href)) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    },
    checkOfflineStatus() {
      if (!navigator.onLine) {
        this.offline = true;
        this.$emit("network-status-update", this.offline);
        return;
      }

      this.performConnectivityCheck();
    },
    performConnectivityCheck() {
      const urlPath = window.location.pathname.replace(/\/+$/, "");
      const aliveCheckUrl = `${window.location.origin}${urlPath}/index.html?t=${new Date().valueOf()}`;

      fetch(aliveCheckUrl, {
        method: "HEAD",
        cache: "no-store",
        redirect: "manual",
      })
        .then((response) => {
          if (response.type === "opaqueredirect" && !response.ok || [401, 403].includes(response.status)) {
            window.location.href = aliveCheckUrl;
            return; // Exit the function to prevent further execution
          }
          this.offline = !response.ok;
        })
        .catch(() => {
          this.offline = true;
        })
        .finally(() => {
          this.$emit("network-status-update", this.offline);
        });
    },
    setupEventListeners() {
      this.visibilityChangeListener = () => {
        if (document.visibilityState === "visible") {
          this.checkOfflineStatus();
        }
      };
      this.onlineListener = () => {
        this.checkOfflineStatus();
      };
      this.offlineListener = () => {
        this.offline = true;
        this.$emit("network-status-update", this.offline);
      };

      document.addEventListener("visibilitychange", this.visibilityChangeListener, false);
      window.addEventListener("online", this.onlineListener, false);
      window.addEventListener("offline", this.offlineListener, false);
    },
    removeEventListeners() {
      document.removeEventListener("visibilitychange", this.visibilityChangeListener);
      window.removeEventListener("online", this.onlineListener);
      window.removeEventListener("offline", this.offlineListener);
    },
    checkOffline() {
      this.checkOfflineStatus();
    },
  },
};
</script>
