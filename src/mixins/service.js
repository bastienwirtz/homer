export default {
  props: {
    proxy: Object,
  },
  created: function () {
    // custom service often consume info from an API using the item link (url) as a base url,
    // but sometimes the base url is different. An optional alternative URL can be provided with the "endpoint" key.
    this.endpoint = this.item.endpoint || this.item.url;

    if (this.endpoint && this.endpoint.endsWith("/")) {
      this.endpoint = this.endpoint.slice(0, -1);
    }
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
        if (!response.ok) {
          throw new Error("Not 2xx response");
        }

        return json ? response.json() : response;
      });
    },
  },
};
