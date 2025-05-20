<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="statusMessage.up !== false">
          <i class="fa-solid fa-signal"></i> {{ statusMessage.up }}
          <span class="separator"> | </span>
          <i class="fa-solid fa-stopwatch"></i> {{ statusMessage.avgRes }}
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
  data: () => {
    return {
      up: 0,
      down: 0,
      avgRespTime: 0,
    };
  },
  computed: {
    total: function () {
      return this.up + this.down;
    },
    percentageGood: function () {
      if (this.up == 0) return 0;
      return Math.round((this.up / this.total) * 100);
    },
    status: function () {
      if (this.up == 0 && this.down == 0) return false;
      if (this.down == this.total) return "bad";
      if (this.up == this.total) return "good";
      return "warn";
    },
    statusMessage: function () {
      if (this.up == 0 && this.down == 0) return false;
      return {
        up: `${this.up}/${this.total}`,
        avgRes: `${Math.round(this.avgRespTime * 100) / 100} ms avg.`,
      };
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: function () {
      const now = Date.now();
      this.fetch(`/api/v1/endpoints/statuses?cachebust=${now}`)
        .then((endpoints) => {
          this.up = 0;
          this.down = 0;
          for (var i = 0; i < endpoints.length; i++) {
            const latestResult =
              endpoints[i].results[endpoints[i].results.length - 1];
            if (latestResult.success) {
              this.up++;
              const duration = latestResult.duration / 1000000; // convert to ms
              console.log(`${endpoints[i].name}: ${duration}ms`);
              this.avgRespTime = (this.avgRespTime + duration) / this.up;
            } else {
              this.down++;
            }
          }
        })
        .catch((e) => console.error(e));
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
