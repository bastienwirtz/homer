<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "FreshRSS",
  mixins: [service],
  data: () => {
    return {
      subscriptions: 0,
      unread: 0,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
        {
          key: "subscriptions",
          label: "Subscriptions",
          value: this.subscriptions,
          tone: "info",
        },
        { key: "unread", label: "Unread", value: this.unread, tone: "warning" },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: async function () {
      if (!this.auth) {
        await this.load(
          this.fetch(
            `/api/greader.php/accounts/ClientLogin?Email=${this.item.username}&Passwd=${this.item.password}`,
            { method: "GET", cache: "no-cache" },
            false,
          ).then((body) => {
            const match = body.match(/Auth=(([([a-z0-9]+)\/([([a-z0-9]+))/i);
            if (!match) {
              throw new Error("FreshRSS login returned no auth token");
            }
            this.auth = match[1];
          }),
        );

        if (this.serverError) {
          return;
        }
      }

      const headers = {
        Authorization: `GoogleLogin auth=${this.auth}`,
      };

      return this.load(
        this.fetch(
          `/api/greader.php/reader/api/0/subscription/list?output=json`,
          { headers },
        ).then((subscription) => {
          this.subscriptions = subscription.subscriptions.length;
        }),
        this.fetch(`/api/greader.php/reader/api/0/unread-count?output=json`, {
          headers,
        }).then((unreadcount) => {
          this.unread = unreadcount.max;
        }),
      );
    },
  },
};
</script>
