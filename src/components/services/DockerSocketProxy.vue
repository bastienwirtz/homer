<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="running > 0"
          class="notif running"
          title="Running Containers"
        >
          {{ running }}
        </strong>
        <strong
          v-if="stopped > 0"
          class="notif stopped"
          title="Stopped Containers"
        >
          {{ stopped }}
        </strong>
        <strong v-if="errors > 0" class="notif errors" title="Error">
          {{ errors }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Docker Socket Proxy API"
        >
          Unavailable
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
export default {
  name: "DockerSocketProxy",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => {
    return {
      running: null,
      stopped: null,
      errors: null,
      serverError: false,
    };
  },
  created: function () {
    const checkInterval = parseInt(this.item.checkInterval, 10) || 0;
    if (checkInterval > 0) {
      setInterval(() => this.fetchData(), checkInterval);
    }
    this.fetchData();
  },
  methods: {
    fetchData: function () {
      const handleError = (e) => {
        console.error(e);
        this.serverError = true;
      };

      // Fetch all containers (including stopped) from Docker Socket Proxy
      this.fetch("/containers/json?all=true") // Docker endpoint for container statuses
        .then((containers) => {
          this.running = containers.filter(
            (container) => container.State === "running",
          ).length;
          this.stopped = containers.filter(
            (container) => container.State === "exited",
          ).length;
        })
        .catch(handleError);
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
      background-color: #4fb5d6;
    }

    &.stopped {
      background-color: #d08d2e;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
