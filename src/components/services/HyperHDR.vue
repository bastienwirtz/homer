<template>
  <Generic
    :item="item"
    :subtitle="currentInstance && `Current instance: ${currentInstance}`"
    :status="reachabilityStatus()"
    :badges="badges"
  />
</template>
<script>
import service from "@/mixins/service.js";

const ENDPPOINT_SERVER_INFO = "/json-rpc?request=";

export default {
  name: "HyperHDR",
  mixins: [service],
  data: () => ({
    serverInfo: null,
    serverError: null,
  }),
  computed: {
    instances: function () {
      const instances = this.serverInfo?.info?.instance;
      return instances ?? [];
    },

    currentInstance: function () {
      const instanceId = this.serverInfo?.info?.currentInstance;
      return this.instances.find((instance) => instance.instance === instanceId)
        ?.friendly_name;
    },

    running: function () {
      if (!this.instances) {
        return 0;
      }

      return this.instances.filter((instance) => instance.running === true)
        .length;
    },

    stopped: function () {
      if (!this.instances) {
        return 0;
      }

      return this.instances.length - this.running;
    },

    badges() {
      return [
        {
          key: "running",
          label: "Running",
          value: this.running,
          tone: "success",
        },
        {
          key: "stopped",
          label: "Stopped",
          value: this.stopped,
          tone: "neutral",
        },
      ];
    },
  },
  methods: {
    fetchData: async function () {
      const headers = {};

      const command = {
        command: "serverinfo",
      };

      const requestUrl = `${ENDPPOINT_SERVER_INFO}${encodeURIComponent(
        JSON.stringify(command),
      )}`;

      return this.load(
        this.fetch(requestUrl, { headers }).then((response) => {
          this.serverInfo = response;
        }),
      );
    },
  },
};
</script>
