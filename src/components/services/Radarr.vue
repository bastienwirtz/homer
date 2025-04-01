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
          title="Connection error to Radarr API, check url and apikey in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

const V3_API = "/api/v3";
const LEGACY_API = "/api";

export default {
  name: "Radarr",
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
  computed: {
    apiPath() {
      return this.item.legacyApi ? LEGACY_API : V3_API;
    },
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
      this.fetch(`${this.apiPath}/health?apikey=${this.item.apikey}`)
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
      if (!this.item.legacyApi) {
        this.fetch(`${this.apiPath}/queue/details?apikey=${this.item.apikey}`)
          .then((queue) => {
            for (var i = 0; i < queue.length; i++) {
              if (queue[i].trackedDownloadStatus == "warning") {
                this.warnings++;
              } else if (queue[i].trackedDownloadStaus == "error") {
                this.errors++;
              }
            }
          })
          .catch(handleError);
      }
      this.fetch(`${this.apiPath}/queue?apikey=${this.item.apikey}`)
        .then((queue) => {
          this.activity = 0;

          if (this.item.legacyApi) {
            for (var i = 0; i < queue.length; i++) {
              if (queue[i].movie) {
                this.activity++;
              }
            }
          } else {
            this.activity = queue.totalRecords;
          }
        })
        .catch(handleError);
      if (!this.item.legacyApi) {
        this.fetch(
          `${this.apiPath}/wanted/missing?pageSize=1&apikey=${this.item.apikey}`,
        )
          .then((overview) => {
            this.fetch(
              `${this.apiPath}/wanted/missing?pageSize=${overview.totalRecords}&apikey=${this.item.apikey}`,
            ).then((movies) => {
              this.missing = movies.records.filter(
                (m) => m.monitored && m.isAvailable && !m.hasFile,
              ).length;
            });
          })
          .catch(handleError);
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
