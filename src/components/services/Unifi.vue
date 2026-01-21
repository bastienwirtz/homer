<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="!serverError">
          <span class="sensors">
            <span
              v-if="clients !== null"
              class="sensor"
              title="Connected Clients"
            >
              <i class="fas fa-users"></i>
              <span class="sensor-value">{{ clients }}</span>
            </span>
            <span
              v-if="accessPoints !== null"
              class="sensor"
              title="Access Points"
            >
              <i class="fas fa-wifi"></i>
              <span class="sensor-value">{{ accessPoints }}</span>
            </span>
            <span
              v-if="devices !== null"
              class="sensor"
              title="Other Network Devices"
            >
              <i class="fas fa-network-wired"></i>
              <span class="sensor-value">{{ devices }}</span>
            </span>
          </span>
        </template>
        <template v-else> Connection Error </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="serverError" class="status error">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Unifi",
  components: {
    Generic,
  },
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => {
    return {
      clients: null,
      devices: null,
      accessPoints: null,
      serverError: false,
      sessionCookie: null,
    };
  },
  computed: {
    site() {
      return this.item.site || "default";
    },
    prefix() {
      if (this.item.url && (this.item.url.includes("/manage") || this.item.url.includes("/proxy/network"))) {
        // the configuration already include the prefix
        return "";
      }
      return this.item.udm ? "/proxy/network" : "/manage";
    },
    loginEndpoint() {
      // Most self-hosted controllers use /api/login (legacy endpoint)
      // Only explicitly modern controllers use /api/auth/login
      return this.item.legacy === false ? "/api/auth/login" : "/api/login";
    },
  },
  created() {
    const interval = parseInt(this.item.interval, 10) || 30000;

    // Set up interval if configured
    if (interval > 0) {
      setInterval(() => this.fetchData(), interval);
    }

    // Initial fetch
    this.fetchData();
  },
  methods: {
    async authenticateUnifi() {
      try {
        if (!this.item.auth) {
          throw new Error("Authentication credentials not provided");
        }

        // Parse auth field in format "username:password"
        const [username, password] = this.item.auth.split(":");
        if (!username || !password) {
          throw new Error(
            "Authentication format should be 'username:password'",
          );
        }

        const credentials = {
          username: username,
          password: password,
        };

        await this.fetch(this.loginEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        this.sessionCookie = true;
      } catch (error) {
        console.error("Unifi authentication failed:", error);
        this.sessionCookie = null;
        throw error;
      }
    },

    async fetchData() {
      try {
        // First authenticate if we don't have a session
        if (!this.sessionCookie) {
          await this.authenticateUnifi();
        }

        // Fetch devices data only
        const devicesData = await this.fetch(
          `${this.prefix}/api/s/${this.site}/stat/device`,
        );

        // Count access points (devices with type 'uap')
        this.accessPoints =
          devicesData.data?.filter((device) => device.type === "uap")?.length ||
          0;

        // Count other devices (exclude access points to avoid double counting)
        this.devices = (devicesData.data?.length || 0) - this.accessPoints;

        // For clients, we can use the total connected clients from devices that report client counts
        // or set to null if we don't have this data from devices endpoint
        this.clients =
          devicesData.data?.reduce((total, device) => {
            return total + (device.num_sta || 0);
          }, 0) || null;

        this.serverError = false;
      } catch (e) {
        console.error("UniFi service error:", e);
        this.serverError = true;
        this.sessionCookie = null; // Reset session on error
      }
    },
  },
};
</script>

<style scoped lang="scss">
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

.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.error:before {
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
