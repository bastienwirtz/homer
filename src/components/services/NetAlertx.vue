<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "NetAlertx",
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
    fetchData: function () {
      return this.load(
        this.fetch("/devices/totals", {
          headers: { Authorization: `Bearer ${this.item.apikey}` },
        }).then((response) => {
          this.total = response.total || response[0] || 0;
          this.connected = response.connected || response[1] || 0;
          this.newdevices = response.new || response[3] || 0;
          this.downalert = response.down || response[4] || 0;
        }),
      );
    },
  },
};
</script>
