import updateScheduler from "@/utils/updateScheduler.js";

export default {
  props: {
    proxy: Object,
  },
  inject: {
    // Inject global config from parent components
    config: {
      default: () => ({}),
    },
  },
  computed: {
    globalConfig() {
      return this.config() || {};
    },
  },
  created: function () {
    // Custom service often consume info from an API using the item link (url) as a base url,
    // but sometimes the base url is different. An optional alternative URL can be provided with the "endpoint" key.
    this.endpoint = this.item.endpoint || this.item.url;

    if (this.endpoint && this.endpoint.endsWith("/")) {
      this.endpoint = this.endpoint.slice(0, -1);
    }
  },
  beforeMount: function () {
    // Initialize auto-update if configured
    this.initAutoUpdate();
  },
  beforeUnmount() {
    // Clean up auto-update registration
    updateScheduler.unregister(this);
  },
  methods: {
    fetch: function (path, init, json = true) {
      let options = {};

      if (this.proxy?.useCredentials) {
        options.credentials = "include";
      }

      if (this.proxy?.headers && !!this.proxy.headers) {
        options.headers = this.proxy.headers;
      }

      // Each item can override the credential settings
      if (this.item.useCredentials !== undefined) {
        options.credentials =
          this.item.useCredentials === true ? "include" : "omit";
      }

      // Each item can have their own headers
      if (this.item.headers !== undefined && !!this.item.headers) {
        options.headers = this.item.headers;
      }

      options = Object.assign(options, init);

      if (path.startsWith("/")) {
        path = path.slice(1);
      }

      let url = this.endpoint;

      if (path) {
        url = `${this.endpoint}/${path}`;
      }

      return fetch(url, options).then((response) => {
        let success = response.ok;
        if (Array.isArray(this.item.successCodes)) {
          success = this.item.successCodes.includes(response.status);
        }

        if (!success) {
          throw new Error(
            `Fail to fetch ressource: (${response.status} error)`,
            { cause: response },
          );
        }

        return json ? response.json() : response.text();
      });
    },
    initAutoUpdate: function () {
      // Check if component has defined an auto-update method and interval
      if (typeof this.autoUpdateMethod !== "function") {
        return;
      }

      const interval = this.getUpdateInterval();
      if (interval > 0) {
        return;
      }
      updateScheduler.register(this, interval, this.autoUpdateMethod);
    },
    getUpdateInterval: function () {
      let intervalKey = "updateIntervalMs";

      if (!Object.hasOwn(this.item, intervalKey)) {
        const deprecatedKeys = [
          "checkInterval",
          "downloadInterval",
          "rateInterval",
          "torrentInterval",
          "updateInterval",
        ];

        for (const key of deprecatedKeys) {
          if (Object.hasOwn(this.item, key)) {
            console.warn(
              `[DEPRECATED] Service "${this.item.name || "unknown"}" uses deprecated config key "${key}". ` +
                `Please use "${intervalKey}" instead. Support for "${key}" will be removed in a future version.`,
            );
            intervalKey = key;
            break;
          }
        }
      }

      let interval = this.item[intervalKey];

      // Check if auto-update is explicitly disabled for this service
      if (interval === false || interval === 0) {
        return 0;
      }

      // Use service-specific interval if defined
      if (interval) {
        return parseInt(this.item.updateInterval, 10) || 0;
      }

      // Use global auto-update configuration
      return this.getGlobalUpdateInterval();
    },

    getGlobalUpdateInterval: function () {
      const globalAutoUpdate = this.globalConfig.updateIntervalMs;

      // If auto-update is not configured globally, disable
      if (!globalAutoUpdate) {
        return 0;
      }

      return parseInt(globalAutoUpdate, 10) || 0;
    },
  },
};
