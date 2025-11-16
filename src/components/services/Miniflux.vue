<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle"> {{ item.subtitle }} </template>
        <template v-else-if="unreadEntries">
          <template v-if="unreadFeeds < 2">
            {{ unreadEntries }} unread
          </template>
          <template v-else>
            {{ unreadEntries }} unread in {{ unreadFeeds }} feeds
          </template>
        </template>
      </p>
    </template>
    <template #indicator>
      <i v-if="loading" class="fa fa-circle-notch fa-spin"></i>
      <div v-else-if="style == 'status'" class="status" :class="statusClass">
        {{ status }}
      </div>
      <div v-else class="notifs">
        <strong v-if="unreadEntries > 0" class="notif unread" title="Unread">
          {{ unreadEntries }}
        </strong>
        <strong
          v-if="!isHealthy"
          class="notif errors"
          title="Connection error to Miniflux API, check url and apikey in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Miniflux",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    unreadEntries: 0,
    unreadFeeds: 0,
    isHealthy: false,
    loading: true,
    style: "status",
  }),
  computed: {
    status: function () {
      if (!this.isHealthy) {
        return "Error";
      }
      return this.unreadEntries > 0 ? "Unread" : "Online";
    },
    statusClass: function () {
      return this.status.toLowerCase();
    },
  },
  created() {
    const checkInterval = parseInt(this.item.checkInterval, 10) || 0;
    if (checkInterval > 0) {
      setInterval(() => this.fetchConfig(), checkInterval);
    }
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const headers = {
        "X-Auth-Token": this.item.apikey,
      };

      let counters;
      try {
        counters = await this.fetch("/v1/feeds/counters", { headers });
        this.isHealthy = true;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }

      if (!this.isHealthy) {
        return;
      }

      const unreads = Object.values(counters.unreads || {});
      this.unreadFeeds = unreads.length;
      this.unreadEntries = unreads.reduce((accumulator, value) => {
        return accumulator + value;
      }, 0);
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

  &.unread:before {
    background-color: #1774ff;
    border-color: #1774ff;
    box-shadow: 0 0 5px 1px #1774ff;
  }

  &.error:before {
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

    &.unread {
      background-color: #4fb5d6;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
