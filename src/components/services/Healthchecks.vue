<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="up > 0" class="notif up" title="Up">
          {{ up }}
        </strong>
        <strong v-if="down > 0" class="notif down" title="Down">
          {{ down }}
        </strong>
        <strong v-if="grace > 0" class="notif grace" title="Grace">
          {{ grace }}
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Healthchecks",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    api: null,
  }),
  computed: {
    up: function () {
      if (!this.api) {
        return "";
      }
      return this.api.checks?.filter((check) => {
        return check.status.toLowerCase() === "up";
      }).length;
    },
    down: function () {
      if (!this.api) {
        return "";
      }
      return this.api.checks?.filter((check) => {
        return check.status.toLowerCase() === "down";
      }).length;
    },
    grace: function () {
      if (!this.api) {
        return "";
      }
      return this.api.checks?.filter((check) => {
        return check.status.toLowerCase() === "grace";
      }).length;
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const apikey = this.item.apikey;
      if (!apikey) {
        console.error(
          "apikey is not present in config.yml for the Healthchecks entry!",
        );
        return;
      }

      const headers = {
        "X-Api-Key": this.item.apikey,
      };

      this.api = await this.fetch("/api/v1/checks/", { headers }).catch((e) => {
        console.error(e);
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

    &.up {
      background-color: #4fd671;
    }

    &.down {
      background-color: #e51111;
    }

    &.grace {
      background-color: #cdd02e;
    }
  }
}
</style>
