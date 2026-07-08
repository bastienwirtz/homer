<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="status === 'running'">
          {{ software }} | v{{ version }} | {{ players.online }}/{{ players.max }} players
        </template>
        <template v-else>
          Minecraft Server
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Minecraft",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    status: "",
    software: "",
    version: "",
    players: {
      online: 0,
      max: 0,
    },
  }),
  created() {
    this.fetchServerStatus();
  },
  methods: {
    fetchServerStatus: async function () {
      const host = this.item.host || "127.0.0.1";
      const port = this.item.port || 25565;

      window
        .fetch(`https://api.mcsrvstat.us/2/${host}:${port}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.online) {
            this.status = "running";
            this.software = data.software || "Unknown";
            this.version = data.version || "N/A";
            this.players.online = data.players?.online || 0;
            this.players.max = data.players?.max || 0;
          } else {
            this.status = "stopped";
          }
        })
        .catch((e) => {
          console.log(e);
          this.status = "error";
        });
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.running:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.stopped:before,
  &.error:before {
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
</style>
