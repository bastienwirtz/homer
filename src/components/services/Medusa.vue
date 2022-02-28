<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="config !== null && config.system.news.unread > 0"
          class="notif news"
          title="News"
          >{{ config.system.news.unread }}</strong
        >
        <strong
          v-if="config !== null && config.main.logs.numWarnings > 0"
          class="notif warnings"
          title="Warning"
          >{{ config.main.logs.numWarnings }}</strong
        >
        <strong
          v-if="config !== null && config.main.logs.numErrors > 0"
          class="notif errors"
          title="Error"
          >{{ config.main.logs.numErrors }}</strong
        >
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Medusa API, check url and apikey in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Medusa",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => {
    return {
      config: null,
      serverError: false,
    };
  },
  created: function () {
    this.fetchConfig();
  },
  methods: {
    fetchConfig: function () {
      this.fetch("/api/v2/config", {
        headers: { "X-Api-Key": this.item.apikey },
      })
        .then((conf) => {
          this.config = conf;
        })
        .catch((e) => {
          console.log(e);
          this.serverError = true;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.notifs {
  position: absolute;
  color: white;
  font-family: sans-serif;
  top: 0.3em;
  right: 0.5em;
  .notif {
    padding-right: 0.35em;
    padding-left: 0.35em;
    padding-top: 0.2em;
    padding-bottom: 0.2em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
    font-size: 0.8em;
    &.news {
      background-color: #777777;
    }

    &.warnings {
      background-color: #d08d2e;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
