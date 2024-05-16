<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <span v-if="error" class="error">An error has occurred.</span>
        <template v-else>
          <span class="down monospace">
            <i class="fas fa-download" aria-hidden="true"></i>
            {{ downRate }}
          </span>
          <span class="up monospace">
            <i class="fas fa-upload" aria-hidden="true"></i>
            {{ upRate }}
          </span>
        </template>
      </p>
    </template>
    <template #indicator>
      <div class="notifs">
        <strong v-if="count > 0" class="notif activity" title="Torrents">
          {{ count }}
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

const units = ["B", "KB", "MB", "GB"];

// Take the rate in bytes and keep dividing it by 1k until the lowest
// value for which we have a unit is determined. Return the value with
// up to two decimals as a string and unit/s appended.
const displayRate = (rate) => {
  let i = 0;

  while (rate > 1000 && i < units.length) {
    rate /= 1000;
    i++;
  }
  return (
    Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
      rate || 0
    ) + ` ${units[i]}/s`
  );
};

export default {
  name: "Transmission",
  mixins: [service],
  props: { item: Object },
  components: { Generic },
  data: () => ({ dl: null, ul: null, count: null, error: null }),
  computed: {
    downRate: function () {
      return displayRate(this.dl);
    },
    upRate: function () {
      return displayRate(this.ul);
    },
  },
  created() {
    const updateInterval = parseInt(this.item?.updateInterval, 10) || 0;
    if (updateInterval > 0) {
      this.interval = setInterval(() => this.fetchData(), updateInterval);
    }
    if (this.item?.sessionId) {
      this.sessionId = this.item.sessionId;
    }

    this.fetchData();
  },
  unmounted() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
  methods: {
    fetchData: async function () {
      try {
        const auth = {};
        if (this.item?.username && this.item?.password) {
          auth.user = this.item.username;
          auth.password = this.item.password;
        }
        const {
          arguments: { torrentCount, downloadSpeed, uploadSpeed },
        } = await this.transmissionFetch("session-stats", auth);

        this.error = false;
        this.ul = uploadSpeed;
        this.dl = downloadSpeed;
        this.count = torrentCount;
      } catch (e) {
        this.error = true;
        console.error(e);
      }
    },
    /**
     * @param {string} method
     * @param {{user: string, password: string}?} auth
     * @returns {Promise<{result: string, arguments: any}>}
     */
    transmissionFetch: async function (method, auth) {
      /**
       * @type {RequestInit}
       */
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: method,
        }),
      };

      if (this.proxy?.useCredentials) {
        options.credentials = "include";
      }

      // Each item can override the credential settings
      if (this.item.useCredentials !== undefined) {
        options.credentials =
          this.item.useCredentials === true ? "include" : "omit";
      }

      // Add the credentials if they are set
      if (auth?.user && auth?.password) {
        options.headers["Authorization"] = `Basic ${btoa(
          `${auth.user}:${auth.password}`
        )}`;
      }

      // Add the session id if it is set
      if (this?.sessionId) {
        options.headers["X-Transmission-Session-Id"] = this.sessionId;
      }

      let url;
      if (this.item?.rpc) {
        url = this.item.rpc;
      } else {
        url = this.endpoint;
        if (url.endsWith("/")) {
          url = url.slice(0, -1);
        }
        if (url.endsWith("/web")) {
          url = url.slice(0, -4);
          url += "/rpc";
        }
      }

      const response = await fetch(url, options);

      // If the session id is not set, we need to get it from the response
      if (response.status === 409 && !this.sessionId) {
        const body = await response.text();
        const match = body.match(/X-Transmission-Session-Id: ([a-z0-9]+)/i);
        this.sessionId = match[1];
        return await this.transmissionFetch(method, auth);
      }
      if (!response.ok) {
        throw new Error("Not 2xx response");
      }
      return await response.json();
    },
  },
};
</script>

<style lang="scss" scoped>
.error {
  color: #e51111 !important;
}

.down {
  margin-right: 1em;
}

.count {
  color: var(--text);
  font-size: 0.8em;
}

.monospace {
  font-weight: 300;
  font-family: monospace;
}

.fa-download {
    color: #00C853;
}

.fa-upload {
    color: #D50000;
}

.notifs {
  position: absolute;
  color: white;
  font-family: sans-serif;
  top: 0.3em;
  right: 0.5em;
  .notif {
    display: inline-block;
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
    font-size: 0.8em;
    &.activity {
      background-color: #4fb5d6;
    }
  }
}
</style>
