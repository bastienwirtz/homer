<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="running > 0" class="notif warnings" title="Running">
          {{ running }}
        </strong>
        <strong v-if="update > 0" class="notif errors" title="Update">
          {{ update }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to WUD API, check url in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "WUD",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => {
    return {
      running: null,
      update: null,
      serverError: false,
    };
  },
  created: function () {
    this.fetchConfig();
  },
  methods: {
    fetchConfig: function () {
      this.fetch(`/api/containers`)
        .then((containers) => {
          this.running = 0;
          this.update = 0;
          for (var i = 0; i < containers.length; i++) {
            this.running++;
            if (containers[i].updateAvailable) {
              this.update++;
            }
          }
        })
        .catch(() => {
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
    display: inline-block;
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
    font-size: 0.8em;

    &.warnings {
      background-color: #d08d2e;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
