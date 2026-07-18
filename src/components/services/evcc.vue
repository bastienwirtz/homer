 <template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">
        {{ batterySoc ?? "--" }}%
      </p>

      <p class="subtitle is-6">
        Battery
      </p>

      <div class="stats">
        <div>🔋 {{ batteryPower ?? "--" }} W</div>
        <div>☀️ {{ pvPower ?? "--" }} W</div>
        <div>🏠 {{ homePower ?? "--" }} W</div>
        <div>⚡ {{ gridPower ?? "--" }} W</div>
        <div>🌍 {{ co2kWh ?? "--" }} kg/kWh</div>
      </div>
    </template>

    <template #indicator>
      <div
        class="status"
        :class="{
          charging: batteryPower > 0,
          discharging: batteryPower < 0,
          idle: batteryPower === 0
        }"
      >
        {{
          batteryPower > 0
            ? "Charging"
            : batteryPower < 0
            ? "Discharging"
            : "Idle"
        }}
      </div>
    </template>
  </Generic>
</template>


<script>
import service from "@/mixins/service.js";

export default {
  name: "EVCC",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => {
    return {
      batteryPower: null,
      batterySoc: null,
      gridPower: null,
      homePower: null,
      pvPower: null,
      co2kWh: null,
    };
  },
  computed: {
  },
  created: function () {
    // Set up auto-update method for the scheduler
    this.autoUpdateMethod = this.fetchStatus;

    // Initial data fetch
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      this.fetch("/api/state")
        .then((status) => {
          this.batteryPower = status.battery.power || null;
          this.batterySoc = status.battery.soc || null;
          this.gridPower = status.grid.power || null;
          this.homePower = status.homePower || null;
          this.pvPower = status.pv.pvPower || null;
          this.co2kWh = status.tariffCo2 || null;
        })
        .catch((e) => console.log(e));
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.enabled:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0px 0px 4px 1px #94e185;
  }

  &.disabled:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0px 0px 4px 1px #c9404d;
  }

  &.unknown:before {
    background-color: #c9c740;
    border-color: #ccc935;
    box-shadow: 0px 0px 4px 1px #c9c740;
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
