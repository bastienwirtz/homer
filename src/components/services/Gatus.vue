<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <i class="fa-solid fa-signal"></i> {{ up }}/{{ total }}
        <template v-if="avgRespTime > 0">
          <span class="separator"> | </span>
          <i class="fa-solid fa-stopwatch"></i> {{ avgRespTime }} ms avg.
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status !== false" class="status" :class="status">
        {{ percentageGood }}&percnt;
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Gatus",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    up: 0,
    down: 0,
    total: 0,
    avgRespTime: NaN,
    percentageGood: NaN,
    status: false,
    statusMessage: false,
  }),
  created() {
    const updateInterval = parseInt(this.item.updateInterval, 10) || 0;
    if (updateInterval > 0) {
      setInterval(() => this.fetchStatus(), updateInterval);
    }
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      this.fetch("/api/v1/endpoints/statuses", {
        method: "GET",
        cache: "no-cache",
      })
        .then((response) => {
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
            this.status = false;
          } else if (this.down == this.total) {
            this.status = "bad";
          } else if (this.up == this.total) {
            this.status = "good";
          } else {
            this.status = "warn";
          }
        })
        .catch((e) => {
          console.error(e);
        });
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
  &.warn:before {
    background-color: #f8a306;
    border-color: #e1b35e;
    box-shadow: 0 0 5px 1px #f8a306;
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
