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
          title="Connection error to Lidarr API, check url and apikey in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Lidarr",
  mixins: [service],
  props: {
    item: Object,
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
    const checkInterval = parseInt(this.item.checkInterval, 10) || 0;
    if (checkInterval > 0) {
      setInterval(() => this.fetchConfig(), checkInterval);
    }

    this.fetchConfig();
  },
  methods: {
    fetchConfig: function () {
      const handleError = (e) => {
        console.error(e);
        this.serverError = true;
      };
      this.fetch(`/api/v1/health?apikey=${this.item.apikey}`)
        .then((health) => {
          this.warnings = 0;
          this.errors = 0;
          for (var i = 0; i < health.length; i++) {
            if (health[i].type == "warning") {
              this.warnings++;
            } else if (health[i].type == "error") {
              this.errors++;
            }
          }
        })
        .catch(handleError);
      this.fetch(`/api/v1/queue/status?apikey=${this.item.apikey}`)
        .then((queue) => {
          this.activity = queue.totalCount;
        })
        .catch(handleError);
      this.fetch(`/api/v1/wanted/missing?apikey=${this.item.apikey}`)
        .then((queue) => {
          this.missing = queue.totalRecords;
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
  .notif {
    display: inline-block;
    padding-right: 0.35em;
    padding-left: 0.35em;
    padding-top: 0.2em;
    padding-bottom: 0.2em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
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
