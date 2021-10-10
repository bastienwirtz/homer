export default {
  props: {
    proxy: Object,
  },
  created: function () {
    // custom service often consume info from an API using the item link (url) as a base url,
    // but sometimes the base url is different. An optional alternative URL can be provided with the "endpoint" key.
    this.endpoint = this.item.endpoint || this.item.url;
  },
  methods: {
    fetch: function (path, init) {
      let options = {};

      if (this.proxy?.useCredentials) {
        options.credentials = "include";
      }

      options = Object.assign(options, init);

      return fetch(`${this.endpoint}/${path}`, options).then((response) => {
        if (!response.ok) {
          throw new Error("Not 2xx response");
        }
        return response.json();
      });
    },
  },
};
