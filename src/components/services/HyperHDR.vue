<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="currentInstance">
          Current instance: {{ currentInstance }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div class="notifs">
        <strong v-if="running > 0" class="notif running" title="Running">
          {{ running }}
        </strong>
        <strong v-if="stopped > 0" class="notif stopped" title="Stopped">
          {{ stopped }}
        </strong>
      </div>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>
<script>
import service from "@/mixins/service.js";

const ENDPPOINT_SERVER_INFO = "/json-rpc?request=";

export default {
  name: "HyperHDR",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    serverInfo: null,
    error: false,
  }),
  computed: {
    instances: function () {
      const instances = this.serverInfo?.info?.instance;
      return instances ?? [];
    },

    currentInstance: function () {
      const instanceId = this.serverInfo?.info?.currentInstance;
      return this.instances.find(
        (instance) => instance.instance === instanceId
      )?.friendly_name;
    },

    running: function () {
      if (!this.instances) {
        return 0;
      }

      return this.instances.filter(
        (instance) => instance.running === true
      ).length;
    },
    
    stopped: function () {
      if (!this.instances) {
        return 0;
      }

      this.instances.length - this.running;
    },

    status: function () {
      return !this.error ? "online" : "offline";
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const headers = {};

      const command = {
        command: "serverinfo",
      };

      const requestUrl = `${ENDPPOINT_SERVER_INFO}${encodeURIComponent(
        JSON.stringify(command)
      )}`;

      try {
        const response = await this.fetch(requestUrl, { headers });
        this.error = false;
        this.serverInfo = response;
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

    &.running {
      background-color: #4fd671;
    }

    &.stopped {
      background-color: #e51111;
    }
  }
}
</style>
