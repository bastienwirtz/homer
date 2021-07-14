<template>
  <span>{{ domain }}</span>
</template>

<script>
export default {
  name: "DomainChecker",
  props: {
    config: Object,
  },
  data: function () {
    return {
      domain: null,
    };
  },
  created() {
    this.getDomain(this.config.method);
  },
  methods: {
    checkUrl: function (config) {
        const hostname = window.location.hostname;
        const href = window.location.href;
        switch (config.method) {
          case "hostname":
            for (const domain in config.hostnames) {
              if (config.hostnames[domain] && config.hostnames[domain].includes(hostname)) {
                return domain;
              }
            }
            break;
          case "regex":
            for (const domain in config.regex) {
              if (new RegExp(config.regex[domain]).test(href)) {
                return domain;
              }
            }
            break;
        }

        return null;
    },

    pingUrl: function (config) {
      let that = this;

      for (const domain in config) {
        console.log(config[domain])
        for (const url in config[domain]) {
          return fetch(config[domain][url], {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-store",
          })
          .then(function () {
            that.domain = domain;
          })
          .catch(function () {
            that.domain = null;
          })
          .finally(function () {
            that.$emit("domain-update", that.domain);
          })
        }
      }
    },

    getDomain: function (method) {
        switch (method) {
            case "url":
                this.domain = this.checkUrl(this.config.url);
                this.$emit("domain-update", this.domain);
                break;
            case "ping":
                this.domain = this.pingUrl(this.config.ping);
                break;
            default:
                this.domain = null;
                break;
        }
    },

  },
}
</script>