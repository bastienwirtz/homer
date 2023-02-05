export default {
  props: {
    proxy: Object,
  },
  computed: {
    // custom service often consume info from an API using the item link (url) as a base url,
    // but sometimes the base url is different. An optional alternative URL can be provided with the "endpoint" key.
    endpoint() {
      return this.item.endpoint || this.item.url.replace(/\/$/, '');
    }
  },
  methods: {
    fetch(path, init, json = true) {
      let options = {
		    // Each item can override the credential settings
        credentials: this.item.useCredentials !== undefined ?
          this.item.useCredentials ? 'include' : 'omit' :
          this.proxy?.useCredentials ? 'include' : 'omit'
      };
      options = { ...options, ...init };
      let url = this.endpoint + '/' + (path[0] === '/' ? path.slice(1) : path);
      return fetch(url, options)
        .then(response => {
          if (!response.ok) throw new Error("Not 2xx response");
          return json ? response.json() : response;
        });
    },
  },
};
