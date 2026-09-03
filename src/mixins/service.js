import updateScheduler from "@/utils/updateScheduler.js";

// Header names are case-insensitive, so they are lowercased before merging and
// each source overrides the previous one whatever its casing. Unset values are
// skipped: a card must not replace a configured header with `undefined`.
function mergeHeaders(...sources) {
  const merged = {};
  for (const source of sources) {
    for (const [name, value] of Object.entries(source ?? {})) {
      if (value !== undefined && value !== null) {
        merged[name.toLowerCase()] = value;
      }
    }
  }
  return merged;
}

export default {
  props: {
    item: Object,
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
    versionSubtitle() {
      return this.versionstring ? `Version ${this.versionstring}` : null;
    },
  },
  created: function () {
    // Custom service often consume info from an API using the item link (url) as a base url,
    // but sometimes the base url is different. An optional alternative URL can be provided with the "endpoint" key.
    this.endpoint = this.item.endpoint || this.item.url;

    if (this.endpoint && this.endpoint.endsWith("/")) {
      this.endpoint = this.endpoint.slice(0, -1);
    }

    // A card's own created() runs after this one, so it can still override
    // autoUpdateMethod to pick a method at runtime.
    if (typeof this.fetchData === "function") {
      this.autoUpdateMethod = this.fetchData;
      this.fetchData();
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
    isValueShown(key) {
      return !(this.item.hide || []).includes(key);
    },
    reachabilityStatus() {
      if (this.serverError === null || this.serverError === undefined) {
        return null;
      }
      return this.serverError
        ? { state: "offline", label: "offline" }
        : { state: "online", label: "online" };
    },
    async load(...requests) {
      let failed = false;
      await Promise.all(
        requests.map((request) =>
          request.catch((e) => {
            console.error(e);
            failed = true;
          }),
        ),
      );
      this.serverError = failed;
    },
    requireConfig(...keys) {
      const missing = keys.filter((key) => !this.item[key]);
      if (!missing.length) {
        return true;
      }
      console.error(
        `Missing ${missing.join(", ")} in config.yml for the "${this.item.name || this.item.type}" entry.`,
      );
      this.serverError = true;
      return false;
    },
    connectionBadge() {
      return {
        key: "serverError",
        label: `Connection error to the ${this.item.type} API, check the url and credentials in config.yml`,
        value: this.serverError ? "?" : null,
        tone: "danger",
      };
    },
    fetch: function (path, init, json = true) {
      let options = {};

      if (this.proxy?.useCredentials) {
        options.credentials = "include";
      }

      // Each item can override the credential settings
      if (this.item.useCredentials !== undefined) {
        options.credentials =
          this.item.useCredentials === true ? "include" : "omit";
      }

      options = Object.assign(options, init);

      // Headers are layered: proxy configuration, then item configuration,
      // then the ones built by the service itself.
      options.headers = mergeHeaders(
        this.proxy?.headers,
        this.item.headers,
        init?.headers,
      );

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
            `Failed to fetch resource: (${response.status} error)`,
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
      if (interval <= 0) {
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
        return parseInt(interval, 10) || 0;
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
