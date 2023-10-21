<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="api"> {{ count }} {{ level }} alerts </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="api" class="status" :class="level">
        {{ count }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

const AlertsStatus = Object.freeze({
  firing: "firing",
  pending: "pending",
  inactive: "inactive",
});

export default {
  name: "Prometheus",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    api: {
      status: "",
      count: 0,
      alerts: {
        firing: 0,
        inactive: 0,
        pending: 0,
      },
    },
  }),
  computed: {
    count: function () {
      return (
        this.countFiring() || this.countPending() || this.countInactive() || 0
      );
    },
    level: function () {
      if (this.countFiring()) {
        return AlertsStatus.firing;
      } else if (this.countPending()) {
        return AlertsStatus.pending;
      }
      return AlertsStatus.inactive;
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      this.api = await this.fetch("api/v1/alerts").catch((e) => console.log(e));
    },
    countFiring: function () {
      if (this.api) {
        return this.api.data?.alerts?.filter(
          (alert) => alert.state === AlertsStatus.firing,
        ).length;
      }
      return 0;
    },
    countPending: function () {
      if (this.api) {
        return this.api.data?.alerts?.filter(
          (alert) => alert.state === AlertsStatus.pending,
        ).length;
      }
      return 0;
    },
    countInactive: function () {
      if (this.api) {
        return this.api.data?.alerts?.filter(
          (alert) => alert.state === AlertsStatus.pending,
        ).length;
      }
      return 0;
    },
  },
};
</script>

<style scoped lang="scss">
.media-left {
  .image {
    display: flex;
    align-items: center;
  }

  img {
    max-height: 100%;
  }
}
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.firing:before {
    background-color: #d65c68;
    border-color: #e87d88;
    box-shadow: 0 0 5px 1px #d65c68;
  }

  &.pending:before {
    background-color: #e8bb7d;
    border-color: #d6a35c;
    box-shadow: 0 0 5px 1px #e8bb7d;
  }

  &.inactive:before {
    background-color: #8fe87d;
    border-color: #70d65c;
    box-shadow: 0 0 5px 1px #8fe87d;
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
