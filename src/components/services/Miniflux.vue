<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="unread > 0" class="notif unread" title="Unread">
          {{ unread }}
        </strong>
        <strong
          v-if="serverError"
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
  data: () => {
    return {
      unread: null,
      serverError: false,
    };
  },
  created: function () {
    const checkInterval = parseInt(this.item.checkInterval, 10) || 0;
    if (checkInterval > 0) {
      setInterval(() => this.fetchConfig(), checkInterval);
    }

    this.fetchConfig();
  },
  methods: {
    fetchConfig: function () {
      const headers = {
        "X-Auth-Token": this.item.apikey,
      };

      this.fetch("/v1/entries?status=unread&limit=1", {
        headers,
      })
        .then((response) => {
          this.unread = response.total || 0;
          this.serverError = false;
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

    &.unread {
      background-color: #4fb5d6;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
