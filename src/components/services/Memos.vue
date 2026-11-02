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
  { prefix: "/api", profile: "/api/instance/profile" }, // 26.x
  { prefix: "/api/v1", profile: "/api/v1/instance/profile" }, // 0.26 to 0.31
  { prefix: "/api/v1", profile: "/api/v1/workspace/profile" }, // 0.22 to 0.25
];

const PAGE_SIZE = 1000;
const MAX_PAGES = 10;

export default {
  name: "Memos",
  mixins: [service],
  data: () => ({
    api: null,
    version: null,
    count: null,
    truncated: false,
    serverError: null,
  }),
  computed: {
    headers() {
      return this.item.apikey
        ? { Authorization: `Bearer ${this.item.apikey}` }
        : {};
    },
    badges() {
      return [
        {
          key: "memos",
          label: this.truncated
            ? `More than ${this.count} memos, only the first ${this.count} are counted`
            : "Memos",
          value: this.truncated ? `${this.count}+` : this.count,
          tone: "neutral",
          cap: false,
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    displayVersion,
    fetchData: async function () {
      await this.load(this.fetchStats());
      if (this.serverError) {
        this.version = null;
        this.count = null;
        this.truncated = false;
      }
    },
    fetchStats: async function () {
      const profile = await this.fetchProfile();
      this.version = profile.version?.replace(/^v/, "") || null;

      if (!this.isValueShown("memos")) {
        return;
      }

      let count = 0;
      let pageToken = "";
      let pages = 0;
      do {
        const params = new URLSearchParams({ pageSize: PAGE_SIZE });
        if (this.item.filter) {
          params.set("filter", this.item.filter);
        }
        if (pageToken) {
          params.set("pageToken", pageToken);
        }
        const response = await this.fetch(
          `${this.api.prefix}/memos?${params}`,
          { headers: this.headers },
        );
        count += response.memos?.length ?? 0;
        pageToken = response.nextPageToken ?? "";
        pages++;
      } while (pageToken && pages < MAX_PAGES);

      this.count = count;
      this.truncated = Boolean(pageToken);
    },
    fetchProfile: async function () {
      const layouts = this.api ? [this.api] : API_LAYOUTS;
      let lastError;
      for (const layout of layouts) {
        try {
          const profile = await this.fetch(layout.profile, {
            headers: this.headers,
          });
          this.api = layout;
          return profile;
        } catch (e) {
          lastError = e;
        }
      }
      // Probe again on the next refresh, in case Memos was upgraded.
      this.api = null;
      throw lastError;
    },
  },
};
</script>
