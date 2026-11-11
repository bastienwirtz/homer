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

export default {
  name: "Memos",
  mixins: [service],
  data: () => ({
    userName: null,
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
      const requests = [
        this.fetch("/api/instance/profile").then((profile) => {
          this.version = profile.version?.replace(/^v/, "") || null;
        }),
      ];
      if (this.item.apikey && this.isValueShown("memos")) {
        // catches its own errors, so a bad token can't take the card offline
        requests.push(this.fetchMemoCount());
      } else {
        this.count = null;
        this.countError = false;
      }
      await this.load(...requests);
      if (this.serverError) {
        this.version = null;
        this.count = null;
        this.countError = false;
      }
    },
    fetchMemoCount: async function () {
      const init = { headers: this.authHeaders };
      try {
        this.userName ??= (await this.fetch("/api/auth/me", init)).user.name;
        const stats = await this.fetch(`/api/${this.userName}:getStats`, init);
        this.count = stats.totalMemoCount ?? 0;
        this.countError = false;
      } catch (e) {
        console.warn("Memos count failed:", e);
        this.count = null;
        this.countError = true;
      }
    },
  },
};
</script>
