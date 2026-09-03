<template>
  <Generic
    :item="item"
    :subtitle="unreadText"
    :status="status"
    :badges="badges"
  >
    <template v-if="loading" #aside>
      <i class="fa fa-circle-notch fa-spin"></i>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Miniflux",
  mixins: [service],
  data: () => ({
    unreadEntries: 0,
    unreadFeeds: 0,
    serverError: null,
    loading: true,
  }),
  computed: {
    style: function () {
      return this.item.style ?? "status";
    },
    unreadText: function () {
      if (!this.unreadEntries) {
        return null;
      }
      return this.unreadFeeds < 2
        ? `${this.unreadEntries} unread`
        : `${this.unreadEntries} unread in ${this.unreadFeeds} feeds`;
    },
    status: function () {
      if (this.loading || this.style !== "status") {
        return null;
      }
      if (this.serverError) {
        return { state: "offline", label: "error" };
      }
      return this.unreadEntries > 0
        ? { state: "warning", label: "unread" }
        : { state: "online", label: "online" };
    },
    badges: function () {
      if (this.loading || this.style === "status") {
        return [];
      }
      return [
        {
          key: "unread",
          label: "Unread",
          value: this.unreadEntries,
          tone: "warning",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: async function () {
      const headers = {
        "X-Auth-Token": this.item.apikey,
      };

      await this.load(
        this.fetch("/v1/feeds/counters", { headers }).then((counters) => {
          const unreads = Object.values(counters.unreads || {});
          this.unreadFeeds = unreads.length;
          this.unreadEntries = unreads.reduce(
            (accumulator, value) => accumulator + value,
            0,
          );
        }),
      );
      this.loading = false;
    },
  },
};
</script>
