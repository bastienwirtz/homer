<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="passed > 0" class="notif passed" title="Passed">
          {{ passed }}
        </strong>
        <strong v-if="failed > 0" class="notif failed" title="Failed">
          {{ failed }}
        </strong>
        <strong v-if="unknown > 0" class="notif unknown" title="Unknown">
          {{ unknown }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Scrutiny API, check your url in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Scrutiny",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => {
    return {
      passed: null,
      failed: null,
      unknown: null,
      serverError: false,
    };
  },
  created: function () {
    const updateInterval = parseInt(this.item.updateInterval, 10) || 0;
    if (updateInterval > 0) {
      setInterval(() => this.fetchSummary(), updateInterval);
    }
    this.fetchSummary();
  },
  methods: {
    fetchSummary: function () {
      this.fetch(`/api/summary`)
        .then((scrutinyData) => {
          const devices = Object.values(scrutinyData.data.summary);
          this.passed =
            devices.filter((device) => device.device.device_status === 0)
              ?.length || 0;
          this.failed =
            devices.filter(
              (device) =>
                device.device.device_status > 0 &&
                device.device.device_status <= 3,
            )?.length || 0;
          this.unknown = devices.length - (this.passed + this.failed) || 0;
        })
        .catch((e) => {
          console.error(e);
          this.serverError = true;
        });
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
    &.passed {
      background-color: green;
    }

    &.failed {
      background-color: #e51111;
    }

    &.unknown {
      background-color: #d08d2e;
    }
  }
}
</style>
