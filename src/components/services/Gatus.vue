<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <div v-if="up > 0" class="notif up" title="Up">
          {{ up }}
        </div>
        <div v-if="down > 0" class="notif down" title="Down">
          {{ down }}
        </div>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Gatus",
  mixins: [service],
  props: {
    item: Object,
  },

  data: () => ({
    api: null,
  }),
  computed: {
    up: function() {
      return this.countUp();
    },
    down: function() {
      return this.countDown();
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      this.api = await this.fetch("/api/v1/endpoints/statuses", { method: "GET", cache: "no-cache" }).catch((e) => {
        console.error(e);
      });
    },
    countUp: function() {
      if (!this.api) {
        return -1;
      }
      var count = 0;
      this.api.forEach((job) => {
        if (job.results[job.results.length - 1].success === true) {
          count++;
        };
      }
      );
      return count;
    },
    countDown: function() {
      if (!this.api) {
        return -1;
      }
      return this.api.length - this.countUp();
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

    &.up {
      background-color: #4fd671;
    }

    &.down {
      background-color: #e51111;
    }

  }
}
</style>
