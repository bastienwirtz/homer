export default {
  props: {
    proxy: Object,
  },
  methods: {
    buildFetchOptions(init = {}, options = {}) {
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
      if (this.item?.headers && !!this.item.headers) {
        options.headers = this.item.headers;
      }

      return Object.assign(options, init);
    },
  },
};
