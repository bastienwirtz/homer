<template>
  <Generic :item="item" :title="state" :status="status">
    <template #subtitle>
      <template v-if="!error && display == 'text' && printing">
        <i class="fa-solid fa-gear mr-1"></i>
        <b v-if="completion">{{ completion.toFixed() }}%</b>
        <span class="mx-1"> | </span>
        <span v-if="printTime" :title="`${displayDuration(printTimeLeft)} left`">
          <i class="fa-solid fa-stopwatch mr-1"></i>
          {{ displayDuration(printTime) }}
        </span>
      </template>
      <template v-if="!error && display == 'text' && state == 'Operational'">
        <i class="fa-solid fa-temperature-half mr-1"></i>
        <b v-if="printer.temperature.bed"
          >{{ printer.temperature.bed.actual.toFixed() }} C</b
        >
        <span class="mx-1"> | </span>
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
          :title="`${state} - ${completion.toFixed()}%, ${displayDuration(
            printTimeLeft,
          )} left`"
        >
          {{ completion }}%
        </progress>
      </template>
      <span v-if="error" :title="error">{{ error }}</span>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import { displayDuration } from "@/utils/format.js";

const PRINTER_STATE = {
  Operational: "online",
  Offline: "offline",
  Printing: "busy",
};

export default {
  name: "OctoPrint",
  mixins: [service],
  data: () => ({
    printTime: null,
    printTimeLeft: null,
    completion: null,
    state: null,
    printer: null,
    error: null,
  }),
  computed: {
    display: function () {
      return this.item.display == "bar" ? this.item.display : "text";
    },
    printing: function () {
      return this.state === "Printing";
    },
    status: function () {
      if (!this.state) {
        return null;
      }
      return { state: PRINTER_STATE[this.state] ?? "warning", label: null };
    },
  },
  methods: {
    fetchData: async function () {
      this.fetchPrinterStatus();
      this.fetchStatus();
    },
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
    displayDuration,
  },
};
</script>

<style scoped lang="scss">
.progress {
  height: 8px;
  width: 90%;
}
</style>
