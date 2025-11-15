<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="subscriptions > 0"
          class="notif subscriptions"
          title="Subscriptions"
        >
          {{ subscriptions }}
        </strong>
        <strong v-if="unread > 0" class="notif unread" title="Unread">
          {{ unread }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to the FreshRSS API, check url username and password in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "FreshRSS",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => {
    return {
      subscriptions: 0,
      unread: 0,
      serverError: false,
    };
  },
  created: function () {
    const updateInterval = parseInt(this.item.updateInterval, 10) || 0;
    if (updateInterval > 0)
      setInterval(() => this.fetchConfig(), updateInterval);

    this.fetchConfig();
  },
  methods: {
    fetchConfig: async function () {
      if (!this.auth) {
        const match = await this.fetch(
          `/api/greader.php/accounts/ClientLogin?Email=${this.item.username}&Passwd=${this.item.password}`,
          { method: "GET", cache: "no-cache" },
          false,
        ).then((body) => {
          return body.match(/Auth=(([([a-z0-9]+)\/([([a-z0-9]+))/i);
        });
        if (match !== null) this.auth = match[1];
      }

      const headers = {
        Authorization: `GoogleLogin auth=${this.auth}`,
      };

      this.fetch(
        `/api/greader.php/reader/api/0/subscription/list?output=json`,
        { headers },
      )
        .then((subscription) => {
          this.subscriptions = subscription.subscriptions.length;
        })
        .catch((e) => {
          console.error(e);
          this.serverError = true;
        });
      this.fetch(`/api/greader.php/reader/api/0/unread-count?output=json`, {
        headers,
      })
        .then((unreadcount) => {
          this.unread = unreadcount.max;
        })
        .catch((e) => {
          console.error(e);
          this.serverError = true;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.notifs {
  position: absolute;
  color: white;
  font-family: sans-serif;
  top: 0.3em;
  right: 0.5em;

  .notif {
    display: inline-block;
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
    font-size: 0.8em;

    &.subscriptions {
      background-color: #4fb5d6;
    }

    &.unread {
      background-color: #d08d2e;
    }
  }
}
</style>
