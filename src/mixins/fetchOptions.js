export default {
  methods: {
    fetchOptions(options = {}) {
      if (
        this.item &&
        this.item.fetchWithCredentials &&
        this.item.fetchWithCredentials == true
      ) {
        options.credentials = "include";
      }
      return options;
    },
  },
};
