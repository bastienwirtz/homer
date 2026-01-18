<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="item.sensors && sensors.length > 0">
          <span class="sensors">
            <span
              v-for="(sensor, index) in sensors"
              :key="index"
              class="sensor"
            >
              <i :class="sensor.icon"></i>
              <span class="sensor-value">{{ sensor.value }}</span>
            </span>
          </span>
        </template>
        <template v-else>
          {{ details }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "HomeAssistant",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    status: "",
    version: "",
    entities: 0,
    location_name: "",
    separator: " ",
    items: ["name", "version"],
    sensors: [],
  }),
  computed: {
    headers: function () {
      return {
        Authorization: `Bearer ${this.item.apikey}`,
        "Content-Type": "application/json",
      };
    },
    details: function () {
      const details = [];
      const items = this.items;
      const separator = this.separator;

      for (const i in items) {
        const key = items[i];

        switch (key) {
          case "version":
            details.push(`v${this.version}`);
            break;
          case "name":
            details.push(`${this.location_name}`);
            break;
          case "entities":
            details.push(`${this.entities} entities`);
            break;
          default:
            details.push(`undefined key ${key} `);
        }
      }

      return details.join(separator);
    },
  },
  created() {
    if (this.item.sensors) {
      // If sensors are configured, fetch sensor data
      this.fetchSensors();

      // Set up configurable refresh interval (default 30 seconds)
      const updateInterval = parseInt(this.item.updateInterval, 10) || 30000;
      setInterval(() => this.fetchSensors(), updateInterval);
    } else {
      // Original behavior for status/stats
      this.fetchServerStatus().then(() => {
        if (!this.item.subtitle && this.status !== "dead") {
          if (this.item.items) this.items = this.item.items;
          if (this.item.separator) this.separator = this.item.separator;

          this.fetchServerStats();
        }
      });
    }
  },
  methods: {
    fetchSensors: async function () {
      const headers = this.headers;

      try {
        const response = await this.fetch("/api/states", { headers });

        // Use configurable sensors from item.sensors
        this.sensors = this.item.sensors
          .map((sensorConfig) => {
            const match = response.find((s) => s.entity_id === sensorConfig.id);
            if (match && !isNaN(parseFloat(match.state))) {
              const value = parseFloat(match.state).toFixed(1);
              const unit = match.attributes?.unit_of_measurement || "";
              const showUnits = this.item.showUnits !== false; // Default to true
              return {
                icon: sensorConfig.icon,
                value: (showUnits && unit) ? `${value}${unit}` : value,
              };
            } else {
              return null;
            }
          })
          .filter(Boolean); // Remove null entries
      } catch (error) {
        console.error("Failed to fetch sensors:", error);
        this.sensors = [];
      }
    },
    fetchServerStatus: async function () {
      const headers = this.headers;

      return this.fetch("/api/", { headers })
        .then((response) => {
          if (response && response.message) this.status = "running";
          else throw new Error();
        })
        .catch((e) => {
          console.log(e);
          this.status = "dead";
        });
    },
    fetchServerStats: async function () {
      const headers = this.headers;

      this.fetch("/api/config", { headers })
        .then((response) => {
          if (response) {
            if (response.version) this.version = response.version;
            if (response.location_name)
              this.location_name = response.location_name;
          } else throw new Error();
        })
        .catch((e) => {
          console.log(e);
          this.status = "dead";
        });

      this.fetch("/api/states", { headers })
        .then((response) => {
          if (response) {
            this.entities = response.length;
          } else throw new Error();
        })
        .catch((e) => {
          console.log(e);
          this.status = "dead";
        });
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.running:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.dead:before {
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

.sensors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sensor {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
