<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="queue > 0"
          class="notif queue"
          :title="`${queue} items queued`"
        >
          {{ queue }}
        </strong>
        <strong
          v-if="errored > 0"
          class="notif errored"
          :title="`${errored} items`"
        >
          {{ errored }}
        </strong>
        <i
          v-if="error"
          class="notif error fa-solid fa-triangle-exclamation"
          title="Unable to fetch current status"
        ></i>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Tdarr",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    stats: null,
    error: false,
  }),
  computed: {
    queue: function () {
      if (!this.stats) {
        return "";
      }
      return this.stats.table1Count;
    },
    errored: function () {
      if (!this.stats) {
        return "";
      }
      return this.stats.table6Count;
    },
  },
  created() {
    const checkInterval = parseInt(this.item.checkInterval, 10) || 0;
    if (checkInterval > 0) {
      setInterval(() => this.fetchStatus(), checkInterval);
    }

    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      try {
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            headers: { "content-Type": "application/json" },
            data: {
              collection: "StatisticsJSONDB",
              mode: "getById",
              docID: "statistics",
              obj: {},
            },
            timeout: 1000,
          }),
        };
        const response = await this.fetch(`/api/v2/cruddb`, options);
        this.error = false;
        this.stats = response;
      } catch (e) {
        this.error = true;
        console.error(e);
      }
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

    &.queue {
      background-color: #28a9a3;
    }

    &.errored {
      background-color: #e51111;
    }

    &.error {
      border-radius: 50%;
      aspect-ratio: 1;
      background-color: #e51111;
    }
  }
}
</style>
