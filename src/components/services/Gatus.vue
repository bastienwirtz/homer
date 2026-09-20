<template>
  <Generic :item="item" :status="status">
    <template #subtitle>
      <i class="fa-solid fa-signal"></i> {{ up }}/{{ total }}
      <template v-if="avgRespTime > 0">
        <span class="mx-1"> | </span>
        <i class="fa-solid fa-stopwatch"></i> {{ avgRespTime }} ms avg.
      </template>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Gatus",
  mixins: [service],
  data: () => ({
    up: 0,
    down: 0,
    total: 0,
    avgRespTime: NaN,
    percentageGood: NaN,
    state: null,
    serverError: null,
  }),
  computed: {
    status: function () {
      if (this.serverError) {
        return this.reachabilityStatus();
      }
      return (
        this.state && { state: this.state, label: `${this.percentageGood}%` }
      );
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch("/api/v1/endpoints/statuses", {
          method: "GET",
          cache: "no-cache",
        }).then((response) => {
          // Apply filtering by groups, if defined
          if (this.item.groups) {
            response = response?.filter((job) => {
              return this.item.groups.includes(job.group) === true;
            });
          }

          // Initialise counts, avg times
          this.total = response.length;
          this.up = 0;

          let totalrestime = 0;
          let totalresults = 0;

          response.forEach((job) => {
            if (job.results[job.results.length - 1].success === true) {
              this.up++;
            }

            if (!this.item.hideaverages) {
              // Update array of average times
              let totalduration = 0;
              let rescounter = 0;
              job.results.forEach((res) => {
                totalduration += parseInt(res.duration, 10) / 1000000;
                rescounter++;
              });

              totalrestime += totalduration;
              totalresults += rescounter;
            } else {
              totalrestime = 0;
              totalresults = 1;
            }
          });

          // Rest are down
          this.down = this.total - this.up;

          // Calculate overall average response time
          this.avgRespTime = (totalrestime / totalresults).toFixed(2);

          // Update representations
          if (this.up == 0 || this.total == 0) {
            this.percentageGood = 0;
          } else {
            this.percentageGood = Math.round((this.up / this.total) * 100);
          }

          // Status flag
          if (this.up == 0 && this.down == 0) {
            this.state = null;
          } else if (this.down == this.total) {
            this.state = "offline";
          } else if (this.up == this.total) {
            this.state = "online";
          } else {
            this.state = "warning";
          }
        }),
      );
    },
  },
};
</script>
