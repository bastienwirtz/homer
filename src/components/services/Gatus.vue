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
    total: 0,
    avgRespTime: NaN,
    percentageGood: NaN,
    status: false,
    statusMessage: false,
    intervalId: null,
  }),
  created() {
    const updateInterval = parseInt(this.item.updateInterval, 10) || 0;
    if (updateInterval > 0) {
      this.intervalId = setInterval(() => this.fetchStatus(), updateInterval);
    }
    this.fetchStatus();
  },
  unmounted() {
    clearInterval(this.intervalId);
  },
  methods: {
    isUp: function (job) {
      return job.results[job.results.length - 1].success ? 1 : 0;
    },
    filter: function (response) {
      // Apply filtering by groups, if defined
      if (this.item.groups) {
        return response?.filter((job) => this.item.groups.includes(job.group));
      }
      return response;
    },
    reduceResults: function (job) {
      const init = { totalduration: 0, rescounter: 0 };

      if (this.item.hideaverages) {
        return init;
      }

      return job.results.reduce(({ totalduration, rescounter }, res) => {
        if (res.duration > 0) {
          return {
            totalduration: totalduration + res.duration / 10e5,
            rescounter: rescounter + 1,
          };
        }
        return { totalduration, rescounter };
      }, init);
    },
    reduceResponse: function (response) {
      return response.reduce(
        ({ totalrestime, totalresults, up }, job) => {
          const { totalduration, rescounter } = this.reduceResults(job);

          return {
            totalrestime: totalrestime + totalduration,
            totalresults: totalresults + rescounter,
            up: up + this.isUp(job),
          };
        },
        { totalrestime: 0, totalresults: 0, up: 0 }
      );
    },
    fetchStatus: async function () {
      this.fetch("/api/v1/endpoints/statuses", {
        method: "GET",
        cache: "no-cache",
      })
        .then(this.filter)
        .then((response) => {
          const { up, totalrestime, totalresults } =
            this.reduceResponse(response);

          this.total = response.length;
          this.up = up;

          // Calculate overall average response time
          if (!this.item.hideaverages) {
            this.avgRespTime = (totalrestime / totalresults).toFixed(2);
          }

          // Update representations
          this.percentageGood =
            this.total > 0 ? Math.round((this.up / this.total) * 100) : 0;

          // Status flag
          if (this.total === 0) {
            this.status = false;
          } else if (this.up === 0) {
            this.status = "bad";
          } else if (this.up === this.total) {
            this.status = "good";
          } else {
            this.status = "warn";
          }
        })
        .catch(console.error);
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
