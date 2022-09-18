<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="status">
          {{ statusMessage }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ uptime }}&percnt;
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "UptimeKuma",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    incident: null,
    heartbeat: null,
  }),
  computed: {
    dashboard: function () {
      return this.item.slug ? this.item.slug : "default";
    },
    status: function () {
      if (!this.incident) {
        return "";
      }
      return this.incident.incident == null ? this.pageStatus : "bad";
    },
    lastHeartBeatList: function () {
      let result = {};

      for (let id in this.heartbeat.heartbeatList) {
        let index = this.heartbeat.heartbeatList[id].length - 1;
        result[id] = this.heartbeat.heartbeatList[id][index];
      }

      return result;
    },
    pageStatus: function () {
      if (!this.heartbeat) {
        return "";
      }
      if (Object.keys(this.heartbeat.heartbeatList).length === 0) {
        return "";
      }
      let result = "good";
      let hasUp = false;
      for (let id in this.lastHeartBeatList) {
        let beat = this.lastHeartBeatList[id];
        if (beat.status == 1) {
          hasUp = true;
        } else {
          result = "warn";
        }
      }
      if (!hasUp) {
        result = "bad";
      }
      return result;
    },
    statusMessage: function () {
      if (!this.incident) {
        return "";
      }
      if (this.incident.incident) {
        return this.incident.incident.title;
      }

      let message = "";
      switch (this.pageStatus) {
        case "good":
          message = "All Systems Operational";
          break;
        case "warn":
          message = "Partially Degraded Service";
          break;
        case "bad":
          message = "Degraded Service";
          break;
        default:
          message = "Unknown service status";
      }
      return message;
    },
    uptime: function () {
      if (!this.heartbeat) {
        return 0;
      }
      const data = Object.values(this.heartbeat.uptimeList);
      const percent = data.reduce((a, b) => a + b, 0) / data.length || 0;
      return (percent * 100).toFixed(1);
    },
  },
  created() {
    /* eslint-disable */
    this.item.url = `${this.item.url}/status/${this.dashboard}`;
    this.fetchStatus();
  },
  methods: {
    fetchStatus: function () {
      const now = Date.now()
      this.fetch(`/api/status-page/${this.dashboard}?cachebust=${now}`)
        .catch((e) => console.error(e))
        .then((resp) => (this.incident = resp));

      this.fetch(
        `/api/status-page/heartbeat/${this.dashboard}?cachebust=${now}`
      )
        .catch((e) => console.error(e))
        .then((resp) => (this.heartbeat = resp));
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.good:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.warn:before {
    background-color: #f8a306;
    border-color: #e1b35e;
    box-shadow: 0 0 5px 1px #f8a306;
  }

  &.bad:before {
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
</style>
