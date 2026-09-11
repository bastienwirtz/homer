<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="error">
          {{ error }}
        </template>
        <template v-else-if="stats">
          <span
            v-if="isValueShown('memos') && stats.count !== undefined"
            title="Total Memos"
          >
            <i class="fa-solid fa-note-sticky"></i>
            {{ stats.count }} {{ stats.count === 1 ? 'memo' : 'memos' }}
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
        <template v-else-if="item.subtitle">
          {{ item.subtitle }}
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

      let version = null;
      let count = 0;
      let profileOk = false;

      // 1. Fetch workspace profile to verify health and get version
      try {
        const profile = await this.fetch("/api/v1/workspace/profile", {
          headers,
        });
        if (profile && profile.version) {
          version = profile.version.replace(/^v/, "");
        }
        profileOk = true;
      } catch (profileErr) {
        console.warn("Memos workspace profile check failed:", profileErr);
        const profileStatus = profileErr?.cause?.status;
        if (profileStatus === 401 || profileStatus === 403) {
          this.stats = null;
          this.status = "online";
          this.error = "Auth required for memos";
          return;
        }
      }

      // 2. Fetch memos list with pagination support
      try {
        let pageToken = "";
        let pagesFetched = 0;
        const maxPages = 20;

        do {
          const params = new URLSearchParams();
          params.set("pageSize", "100");
          if (this.item.filter) {
            params.set("filter", this.item.filter);
          }
          let parent = this.item.parent || this.item.user;
          if (parent) {
            if (typeof parent === "number" || !parent.startsWith("users/")) {
              parent = `users/${parent}`;
            }
            params.set("parent", parent);
          }
          if (pageToken) {
            params.set("pageToken", pageToken);
          }

          const memosEndpoint = `/api/v1/memos?${params.toString()}`;
          const memosResponse = await this.fetch(memosEndpoint, { headers });

          if (memosResponse && Array.isArray(memosResponse.memos)) {
            count += memosResponse.memos.length;
            pageToken = memosResponse.nextPageToken || "";
          } else if (
            memosResponse &&
            typeof memosResponse.totalSize === "number"
          ) {
            count = memosResponse.totalSize;
            break;
          } else {
            break;
          }
          pagesFetched++;
        } while (pageToken && pagesFetched < maxPages);

        this.status = "online";
        this.error = null;
        this.stats = {
          count,
          version,
        };
      } catch (err) {
        console.error("Unable to connect to Memos:", err);
        const httpStatus = err?.cause?.status;
        this.stats = null;
        if (httpStatus === 401 || httpStatus === 403) {
          this.status = "online";
          this.error = "Auth required for memos";
        } else if (profileOk) {
          this.status = "online";
          this.error = "Failed to fetch memos";
        } else {
          this.status = "offline";
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
