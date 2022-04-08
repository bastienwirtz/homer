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
      return this.incident.ok && this.incident.incident == null
        ? "good"
        : "bad";
    },
    statusMessage: function () {
      if (!this.incident) {
        return "";
      }
      const inc = this.incident.incident;
      return inc ? inc.title : "No Incidents";
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
    this.fetchStatus();
  },
  methods: {
    fetchStatus: function () {
      this.fetch(`/api/status-page/${this.dashboard}`)
        .catch((e) => console.log(e))
        .then((resp) => (this.incident = resp));

      this.fetch(`/api/status-page/heartbeat/${this.dashboard}`)
        .catch((e) => console.log(e))
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
