<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="error">
          {{ error }}
        </template>
        <template v-else-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="stats">
          <span
            v-if="isValueShown('memos') && stats.count !== undefined"
            title="Total Memos"
          >
            <i class="fa-solid fa-note-sticky"></i>
            {{ memoCountText }}
          </span>
          <span
            v-if="isValueShown('version') && stats.version"
            title="Memos Version"
          >
            <template
              v-if="isValueShown('memos') && stats.count !== undefined"
            >
              /
            </template>
            <i class="fa-solid fa-code-branch"></i> v{{ stats.version }}
          </span>
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ statusText }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Memos",
  mixins: [service],
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    stats: null,
    status: "",
    error: null,
  }),
  computed: {
    statusText() {
      if (this.status === "online") return "UP";
      if (this.status === "offline") return "DOWN";
      return "";
    },
    memoCountText() {
      if (!this.stats || this.stats.count === undefined) return "";
      const suffix = this.stats.hasMore ? "+" : "";
      const label = this.stats.count === 1 && !this.stats.hasMore ? "memo" : "memos";
      return `${this.stats.count}${suffix} ${label}`;
    },
  },
  created() {
    this.autoUpdateMethod = this.fetchStats;
    this.fetchStats();
  },
  methods: {
    fetchStats: async function () {
      const headers = {
        Accept: "application/json",
      };
      const token = this.item.token || this.item.apikey;
      if (token) {
        headers["Authorization"] = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
      }

      let isProfileOnline = false;
      let version = null;

      // 1. Fetch workspace profile to verify health and discover version
      try {
        const profile = await this.fetch("/api/v1/workspace/profile", {
          headers,
        });
        if (profile) {
          isProfileOnline = true;
          if (profile.version) {
            version = profile.version.replace(/^v/, "");
          }
        }
      } catch (profileErr) {
        console.warn("Memos workspace profile check failed:", profileErr);
      }

      // 2. Fetch memos with pagination support (capped traversal with truncation indicator)
      try {
        let count = 0;
        let pageToken = "";
        let pagesFetched = 0;
        const maxPages = 10;
        const pageSize = 200;
        let hasMore = false;

        do {
          let memosEndpoint = `/api/v1/memos?pageSize=${pageSize}`;
          if (this.item.filter) {
            memosEndpoint += `&filter=${encodeURIComponent(this.item.filter)}`;
          }
          if (pageToken) {
            memosEndpoint += `&pageToken=${encodeURIComponent(pageToken)}`;
          }

          const memosResponse = await this.fetch(memosEndpoint, { headers });

          if (memosResponse && Array.isArray(memosResponse.memos)) {
            count += memosResponse.memos.length;
            pageToken = memosResponse.nextPageToken || "";
          } else if (
            memosResponse &&
            typeof memosResponse.totalSize === "number"
          ) {
            count = memosResponse.totalSize;
            pageToken = "";
          } else {
            pageToken = "";
          }

          pagesFetched++;
        } while (pageToken && pagesFetched < maxPages);

        if (pageToken) {
          hasMore = true;
        }

        this.status = "online";
        this.error = null;
        this.stats = {
          count,
          hasMore,
          version,
        };
      } catch (err) {
        console.error("Memos fetch error:", err);
        const errMsg = (err && (err.message || err.toString())) || "";
        const isAuthError = errMsg.includes("401") || errMsg.includes("403");

        if (isAuthError) {
          // If the server responded with 401/403, the server is online but credentials are required/invalid
          this.status = "online";
          this.error = "Auth required for memos";
          this.stats = version ? { version } : null;
        } else if (isProfileOnline) {
          // Profile check succeeded earlier, so server is reachable
          this.status = "online";
          this.error = "Unable to fetch memos";
          this.stats = version ? { version } : null;
        } else {
          // Host unreachable / network error / CORS failure
          this.status = "offline";
          this.stats = null;
          this.error = "Unable to connect to Memos";
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

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
