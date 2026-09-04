<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">{{ item.subtitle }}</template>
        <template v-else-if="statsText">{{ statsText }}</template>
      </p>
    </template>
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="stats && stats.books_reading > 0"
          class="notif reading"
          title="Currently reading"
        >
          {{ stats.books_reading }}
        </strong>
        <strong
          v-if="stats && stats.books_want_to_read > 0"
          class="notif want-to-read"
          title="Want to read"
        >
          {{ stats.books_want_to_read }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to LibrisLog API, check url and apikey in config.yml"
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
  name: "LibrisLog",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    stats: null,
    serverError: false,
  }),
  computed: {
    statsText() {
      if (!this.stats) return null;
      return `${this.stats.books_read} / ${this.stats.total_books} books read`;
    },
  },
  created() {
    this.autoUpdateMethod = this.fetchStats;
    this.fetchStats();
  },
  methods: {
    fetchStats() {
      const headers = {
        "X-API-Key": this.item.apikey,
      };
      this.fetch("/api/books/stats", { headers })
        .then((data) => {
          this.stats = data;
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

    &.reading {
      background-color: #4fb5d6;
    }

    &.want-to-read {
      background-color: #9d00ff;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
