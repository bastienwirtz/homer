<template>
  <Generic
    :item="item"
    :subtitle="isValueShown('version') ? displayVersion(version) : null"
    :status="reachabilityStatus()"
    :badges="badges"
  />
</template>

<script>
import service from "@/mixins/service.js";
import { displayVersion } from "@/utils/format.js";

// Memos moved its API twice: tried newest first, the one answering is kept.
const API_LAYOUTS = [
  {
    prefix: "/api",
    profile: "/api/instance/profile",
    stats: ["/api/users/-/stats", "/api/users:stats"],
  }, // 26.x
  {
    prefix: "/api/v1",
    profile: "/api/v1/instance/profile",
    stats: ["/api/v1/users/-/stats", "/api/v1/users:stats"],
  }, // 0.26 to 0.31
  {
    prefix: "/api/v1",
    profile: "/api/v1/workspace/profile",
    stats: ["/api/v1/users:stats", "/api/v1/users/-/stats"],
  }, // 0.22 to 0.25
];

export default {
  name: "Memos",
  mixins: [service],
  data: () => ({
    api: null,
    apiStats: null,
    version: null,
    count: null,
    countError: false,
    serverError: null,
  }),
  computed: {
    authHeaders() {
      return this.item.apikey
        ? { Authorization: `Bearer ${this.item.apikey}` }
        : {};
    },
    badges() {
      const badges = [];
      if (this.countError) {
        badges.push({
          key: "memos",
          label: "Check the apikey in config.yml",
          value: "?",
          tone: "danger",
        });
      } else if (this.count !== null && this.count !== undefined) {
        badges.push({
          key: "memos",
          label: "Memos",
          value: this.count,
          showZero: true,
          tone: "success",
          cap: false,
        });
      }
      return badges;
    },
  },
  methods: {
    displayVersion,
    fetchData: async function () {
      const profilePromise = this.fetchProfile();
      const requests = [profilePromise];

      if (this.item.apikey && this.isValueShown("memos")) {
        requests.push(
          (this.api ? Promise.resolve() : profilePromise)
            .then(() => this.fetchMemoCount())
            .catch(() => {}),
        );
      }

      await this.load(...requests);
      if (this.serverError) {
        this.version = null;
        this.count = null;
        this.countError = false;
      }
    },
    fetchProfile: async function () {
      const layouts = this.api ? [this.api] : API_LAYOUTS;
      let lastError;
      for (const layout of layouts) {
        try {
          const profile = await this.fetch(layout.profile);
          this.api = layout;
          this.version = profile.version?.replace(/^v/, "") || null;
          return profile;
        } catch (e) {
          lastError = e;
        }
      }
      // Probe again on the next refresh, in case Memos was upgraded.
      this.api = null;
      this.apiStats = null;
      throw lastError;
    },
    fetchMemoCount: async function () {
      const headers = this.authHeaders;
      const endpoints = this.apiStats
        ? [this.apiStats]
        : this.api?.stats || [];

      try {
        let lastError;
        for (const endpoint of endpoints) {
          try {
            const response = await this.fetch(endpoint, { headers });
            this.apiStats = endpoint;
            this.count = this.parseMemoCount(response);
            this.countError = false;
            return;
          } catch (e) {
            lastError = e;
          }
        }
        // If cached apiStats failed, retry candidate stats endpoints for this layout
        if (this.apiStats) {
          this.apiStats = null;
          for (const endpoint of this.api?.stats || []) {
            try {
              const response = await this.fetch(endpoint, { headers });
              this.apiStats = endpoint;
              this.count = this.parseMemoCount(response);
              this.countError = false;
              return;
            } catch (e) {
              lastError = e;
            }
          }
        }
        throw lastError;
      } catch (err) {
        console.warn("Memos count failed:", err);
        this.count = null;
        this.countError = true;
      }
    },
    parseMemoCount(response) {
      if (!response) return 0;
      const list =
        response.userStats ||
        response.user_stats ||
        response.stats ||
        (Array.isArray(response) ? response : [response]);

      if (!Array.isArray(list) || list.length === 0) {
        return 0;
      }
      const stat = list[0];
      if (typeof stat.totalMemoCount === "number") {
        return stat.totalMemoCount;
      }
      if (typeof stat.total_memo_count === "number") {
        return stat.total_memo_count;
      }
      if (Array.isArray(stat.memoDisplayTimestamps)) {
        return stat.memoDisplayTimestamps.length;
      }
      if (Array.isArray(stat.memo_display_timestamps)) {
        return stat.memo_display_timestamps.length;
      }
      return 0;
    },
  },
};
</script>
