<template>
  <Generic :item="item" :title="state">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle && !state">
          {{ item.subtitle }}
        </template>
        <template
          v-if="!error && display == 'text' && statusClass == 'in-progress'"
        >
          <i class="fa-solid fa-gear mr-1"></i>
          <b v-if="completion">{{ completion.toFixed() }}%</b>
          <span class="separator mx-1"> | </span>
          <span v-if="printTime" :title="`${formatTime(printTimeLeft)} left`">
            <i class="fa-solid fa-stopwatch mr-1"></i>
            {{ formatTime(printTime) }}
          </span>
        </template>
        <template v-if="!error && display == 'text' && statusClass == 'ready'">
          <i class="fa-solid fa-temperature-half mr-1"></i>
          <b v-if="printer.temperature.bed"
            >{{ printer.temperature.bed.actual.toFixed() }} C</b
          >
          <span class="separator mx-1"> | </span>
          <b v-if="printer.temperature.tool0"
            >{{ printer.temperature.tool0.actual.toFixed() }} C</b
          >
        </template>
        <template v-if="!error && display == 'bar'">
          <progress
            v-if="completion"
            class="progress is-primary"
            :value="completion"
            max="100"
            :title="`${state} - ${completion.toFixed()}%, ${formatTime(
              printTimeLeft,
            )} left`"
          >
            {{ completion }}%
          </progress>
        </template>
        <span v-if="error" :title="error">{{ error }}</span>
      </p>
    </template>
    <template #indicator>
      <i :class="['status', statusClass]" :title="state"></i>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "OctoPrint",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    printTime: null,
    printTimeLeft: null,
    completion: null,
    state: null,
    printer: null,
    error: null,
  }),
  computed: {
    statusClass: function () {
      switch (this.state) {
        case "Operational":
          return "ready";
        case "Offline":
          return "offline";
        case "Printing":
          return "in-progress";
        default:
          return "pending";
      }
    },
  },
  created() {
    this.display = this.item.display == "bar" ? this.item.display : "text";
    this.fetchPrinterStatus();
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      try {
        const response = await this.fetch(`api/job?apikey=${this.item.apikey}`);
        this.printTime = response.progress.printTime;
        this.printTimeLeft = response.progress.printTimeLeft;
        this.completion = response.progress.completion;
        this.state = response.state;
        this.error = response.error;
      } catch (e) {
        this.error = `Fail to fetch octoprint data (${e.message})`;
        console.error(e);
      }
    },
    fetchPrinterStatus: async function () {
      try {
        const response = await this.fetch(
          `api/printer?apikey=${this.item.apikey}`,
        );
        this.printer = response;
        this.error = response.error;
      } catch (e) {
        this.error = `Fail to fetch octoprint data (${e.message})`;
        console.error(e);
      }
    },
    formatTime: function (seconds) {
      const days = Math.floor(seconds / 86400);
      let remainingSeconds = seconds % 86400;
      const hours = Math.floor(remainingSeconds / 3600);
      remainingSeconds %= 3600;
      const minutes = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;

      const formattedHrs = hours.toString().padStart(2, "0");
      const formattedMins = minutes.toString().padStart(2, "0");
      const formattedSecs = secs.toString().padStart(2, "0");

      if (days > 0) {
        return `${days}d ${formattedHrs}h ${formattedMins}m`;
      } else if (hours > 0) {
        return `${formattedHrs}h ${formattedMins}m ${formattedSecs}s`;
      } else if (minutes > 0) {
        return `${formattedMins}m ${formattedSecs}s`;
      } else {
        return `${secs} seconds`;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.fa-triangle-exclamation::before {
  color: #d65c68;
}

.progress {
  height: 8px;
  width: 90%;
}
</style>
