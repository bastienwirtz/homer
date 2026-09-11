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

      try {
        let version = null;
        let count = 0;

        // 1. Fetch workspace profile to verify health and get version
        try {
          const profile = await this.fetch("/api/v1/workspace/profile", {
            headers,
          });
          if (profile && profile.version) {
            version = profile.version.replace(/^v/, "");
          }
        } catch (profileErr) {
          console.warn("Memos workspace profile check failed:", profileErr);
        }

        // 2. Fetch memos list
        let memosEndpoint = "/api/v1/memos";
        if (this.item.filter) {
          memosEndpoint += `?filter=${encodeURIComponent(this.item.filter)}`;
        } else {
          memosEndpoint += "?pageSize=100";
        }

        const memosResponse = await this.fetch(memosEndpoint, { headers });

        if (memosResponse && Array.isArray(memosResponse.memos)) {
          count = memosResponse.memos.length;
        } else if (
          memosResponse &&
          typeof memosResponse.totalSize === "number"
        ) {
          count = memosResponse.totalSize;
        }

        this.status = "online";
        this.error = null;
        this.stats = {
          count,
          version,
        };
      } catch (err) {
        console.error("Unable to connect to Memos:", err);
        if (this.stats && this.stats.version) {
          this.status = "online";
          this.error = "Auth required for memos";
        } else {
          this.stats = null;
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
