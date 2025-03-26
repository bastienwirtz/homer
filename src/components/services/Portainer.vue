<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="versionstring">
          Version {{ versionstring }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div class="notifs">
        <strong v-if="running > 0" class="notif running" title="Running">
          {{ running }}
        </strong>
        <strong v-if="dead > 0" class="notif dead" title="Dead">
          {{ dead }}
        </strong>
        <strong v-if="misc > 0" class="notif misc" title="Other (creating, paused, exited, etc.)">
          {{ misc }}
        </strong>
      </div>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Portainer",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    endpoints: null,
    containers: null,
    fetchOk: null,
    versionstring: null,
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
    status: function () {
      return this.fetchOk ? "online" : "offline";
    },
  },
  created() {
    this.fetchStatus();
    this.fetchVersion();
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
    fetchVersion: async function () {
      const headers = {
        "X-Api-Key": this.item.apikey,
      };
      this.fetch("/api/status", { headers })
        .then((response) => {
          this.fetchOk = true;
          this.versionstring = response.Version;
        })
        .catch((e) => {
          this.fetchOk = false;
          console.error(e);
        });
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);
  white-space: nowrap;
  margin-left: 0.25rem;

  &.online:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.offline:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0 0 5px 1px #c9404d;
  }

  &:before {
    content: " ";
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 10px;
    border: 1px solid #000;
    border-radius: 7px;
  }
}

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
