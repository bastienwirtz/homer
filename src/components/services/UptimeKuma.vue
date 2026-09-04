<template>
  <Generic :item="item" :subtitle="statusMessage" :status="status" />
</template>

<script>
import service from "@/mixins/service.js";

const PAGE_STATE = {
  good: "online",
  warn: "warning",
  bad: "offline",
};

export default {
  name: "UptimeKuma",
  mixins: [service],
  data: () => ({
    incident: null,
    heartbeat: null,
    serverError: null,
  }),
  computed: {
    slug: function () {
      return this.item.slug ? this.item.slug : "default";
    },
    state: function () {
      if (!this.incident) {
        return "";
      }
      return this.incident.incident == null ? this.pageStatus : "bad";
    },
    status: function () {
      if (this.serverError) {
        return this.reachabilityStatus();
      }
      return (
        this.state && {
          state: PAGE_STATE[this.state],
          label: `${this.uptime}%`,
        }
      );
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

      let message;
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
  methods: {
    fetchData: function () {
      const now = Date.now();

      return this.load(
        this.fetch(`/api/status-page/${this.slug}?cachebust=${now}`).then(
          (incident) => {
            this.incident = incident;
          },
        ),
        this.fetch(
          `/api/status-page/heartbeat/${this.slug}?cachebust=${now}`,
        ).then((heartbeat) => {
          this.heartbeat = heartbeat;
        }),
      );
    },
  },
};
</script>
