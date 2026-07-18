<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p v-if="summary" class="subtitle is-6">
        {{ summary }}
      </p>
    </template>
  </Generic>
</template>

<script>
import Generic from "@/components/services/Generic.vue";
import service from "@/mixins/service.js";

export default {
  name: "EVCC",
  components: {
    Generic,
  },
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    batteryPower: null,
    batterySoc: null,
    gridPower: null,
    homePower: null,
    pvPower: null,
    co2kWh: null,
  }),
  created() {
    this.autoUpdateMethod = this.fetchStatus;
    this.fetchStatus();
  },
  computed: {
    summary() {
      const items = [];

      if (this.batterySoc !== null) {
        if(this.batterySoc >= 20) {
          items.push(`🔋 ${this.round(this.batterySoc)} %`);
        } else {
          items.push(`🪫 ${this.round(this.batterySoc)} %`);
        }
      }

      if (this.batteryPower !== null) {
        items.push(`🔋 ${this.round(this.batteryPower)} W`);
      }

      if (this.pvPower !== null) {
        items.push(`☀️ ${this.round(this.pvPower)} W`);
      }

      if (this.gridPower !== null) {
        items.push(`⚡ ${this.round(this.gridPower)} W`);
      }

      if (this.co2kWh !== null) {
        items.push(`🌍 ${this.round(this.co2kWh)} g/kWh`);
      }

      return items.join(" · ");
    },
  },
  methods: {
    fetchStatus: async function () {
      this.fetch("/api/state")
        .then((status) => {
          this.batteryPower = status.battery.power || null;
          this.batterySoc = status.battery.soc || null;
          this.gridPower = status.grid.power || null;
          this.homePower = status.homePower || null;
          this.pvPower = status.pvPower || null;
          this.co2kWh = status.tariffCo2 || null;
        })
        .catch((e) => console.log(e));
    },
    round(value) {
      return Math.round(value);
    },
  },
};
</script>

<style scoped lang="scss">
:deep(.card-content) {
  height: auto;
  overflow: visible;
}

.subtitle {
  margin-top: 0.35rem;
  line-height: 1.65;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  word-break: break-word;
}
</style>
