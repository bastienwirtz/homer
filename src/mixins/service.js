export default {
  props: {
    proxy: Object,
  },
  methods: {
    fetch: function (path, init = {}) {
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
      console.log(options);
      return fetch(path, options);
    },
  },
};
