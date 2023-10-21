<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="running > 0" class="notif running" title="Running">
          {{ running }}
        </strong>
        <strong v-if="dead > 0" class="notif dead" title="Dead">
          {{ dead }}
        </strong>
        <strong
          v-if="misc > 0"
          class="notif misc"
          title="Other (creating, paused, exited, etc.)"
        >
          {{ misc }}
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Portainer",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    endpoints: null,
    containers: null,
  }),
  computed: {
    running: function () {
      if (!this.containers) {
        return "";
      }
      return this.containers.filter((container) => {
        return container.State.toLowerCase() === "running";
      }).length;
    },
    dead: function () {
      if (!this.containers) {
        return "";
      }
      return this.containers.filter((container) => {
        return container.State.toLowerCase() === "dead";
      }).length;
    },
    misc: function () {
      if (!this.containers) {
        return "";
      }
      return this.containers.filter((container) => {
        return (
          container.State.toLowerCase() !== "running" &&
          container.State.toLowerCase() !== "dead"
        );
      }).length;
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const headers = {
        "X-Api-Key": this.item.apikey,
      };

      this.endpoints = await this.fetch("/api/endpoints", { headers }).catch(
        (e) => {
          console.error(e);
        },
      );

      let containers = [];
      for (let endpoint of this.endpoints) {
        if (
          this.item.environments &&
          !this.item.environments.includes(endpoint.Name)
        ) {
          continue;
        }
        const uri = `/api/endpoints/${endpoint.Id}/docker/containers/json?all=1`;
        const endpointContainers = await this.fetch(uri, { headers }).catch(
          (e) => {
            console.error(e);
          },
        );

        if (endpointContainers) {
          containers = containers.concat(endpointContainers);
        }
      }

      this.containers = containers;
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

    &.running {
      background-color: #4fd671;
    }

    &.dead {
      background-color: #e51111;
    }

    &.misc {
      background-color: #2ed0c8;
    }
  }
}
</style>
