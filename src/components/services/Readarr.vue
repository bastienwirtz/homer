<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="activity > 0" class="notif activity" title="Activity">
          {{ activity }}
        </strong>
        <strong v-if="missing > 0" class="notif missing" title="Missing">
          {{ missing }}
        </strong>
        <strong v-if="warnings > 0" class="notif warnings" title="Warning">
          {{ warnings }}
        </strong>
        <strong v-if="errors > 0" class="notif errors" title="Error">
          {{ errors }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Readarr API, check url and apikey in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

const API = "/api/v1";

export default {
  name: "Readarr",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => {
    return {
      activity: null,
      missing: null,
      warnings: null,
      errors: null,
      serverError: false,
    };
  },
  created: function () {
    this.fetchConfig();
  },
  methods: {
    fetchConfig: function () {
      const handleError = (e) => {
        console.error(e);
        this.serverError = true;
      };
      this.fetch(`${API}/health?apikey=${this.item.apikey}`)
        .then((health) => {
          this.warnings = health.filter((h) => h.type === "warning").length;
          this.errors = health.filter((h) => h.type === "errors").length;
        })
        .catch(handleError);
      this.fetch(`${API}/queue?apikey=${this.item.apikey}`)
        .then((queue) => {
          this.activity = queue.totalRecords;
        })
        .catch(handleError);
      this.fetch(`${API}/wanted/missing?apikey=${this.item.apikey}`)
        .then((missing) => {
          this.missing = missing.totalRecords;
        })
        .catch(handleError);
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
  display: flex;
  gap: 0.2rem;
  .notif {
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    font-size: 0.8em;
    &.activity {
      background-color: #4fb5d6;
    }

    &.missing {
      background-color: #9d00ff;
    }

    &.warnings {
      background-color: #d08d2e;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
