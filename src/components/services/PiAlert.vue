<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "PiAlert",
  mixins: [service],
  data: () => {
    return {
      total: 0,
      connected: 0,
      newdevices: 0,
      downalert: 0,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
        {
          key: "total",
          label: "Total Devices",
          value: this.total,
          tone: "neutral",
          showZero: true,
        },
        {
          key: "connected",
          label: "Connected Devices",
          value: this.connected,
          tone: "success",
          showZero: true,
        },
        {
          key: "newdevices",
          label: "New Devices",
          value: this.newdevices,
          tone: "info",
          showZero: true,
        },
        {
          key: "downalert",
          label: "Down Alerts",
          value: this.downalert,
          tone: "danger",
          showZero: true,
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: async function () {
      return this.load(
        this.fetch("/php/server/devices.php?action=getDevicesTotals").then(
          (response) => {
            this.total = response[0];
            this.connected = response[1];
            this.newdevices = response[3];
            this.downalert = response[4];
          },
        ),
      );
    },
  },
};
</script>
