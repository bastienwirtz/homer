<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Scrutiny",
  mixins: [service],
  data: () => {
    return {
      passed: null,
      failed: null,
      unknown: null,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
        {
          key: "passed",
          label: "Passed",
          value: this.passed,
          tone: "success",
        },
        { key: "failed", label: "Failed", value: this.failed, tone: "danger" },
        {
          key: "unknown",
          label: "Unknown",
          value: this.unknown,
          tone: "warning",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch(`/api/summary`).then((scrutinyData) => {
          const devices = Object.values(scrutinyData.data.summary);
          const availableDevices = devices.filter(
            (device) =>
              device.device.archived === false && !device.device.DeletedAt,
          );
          this.passed =
            availableDevices.filter(
              (device) => device.device.device_status === 0,
            )?.length || 0;
          this.failed =
            availableDevices.filter(
              (device) =>
                device.device.device_status > 0 &&
                device.device.device_status <= 3,
            )?.length || 0;
          this.unknown =
            availableDevices.length - (this.passed + this.failed) || 0;
        }),
      );
    },
  },
};
</script>
