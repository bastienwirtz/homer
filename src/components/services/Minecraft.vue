<template>
  <Generic :item="displayItem">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="status === 'online'">
          {{ details }}
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

const MINECRAFT_API = "https://api.mcsrvstat.us/3";

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
    logo: "",
    players: {
      online: 0,
      max: 0,
    },
  }),

  computed: {
    displayItem() {
      if (!this.logo) {
        return this.item;
      }

      return { ...this.item, logo: this.logo };
    },

    server() {
      return this.item.host || "";
    },

    useServerIcon() {
      return this.item.useServerIcon !== false;
    },

    details() {
      const players = `${this.players.online}/${this.players.max} players`;

      return [this.software, this.version, players]
        .filter(Boolean)
        .join(" | ");
    },
  },

  created() {
    this.endpoint = MINECRAFT_API;
    this.autoUpdateMethod = this.fetchServerStatus;
    this.fetchServerStatus();
  },

  methods: {
    fetchServerStatus() {
      if (!this.server) {
        console.error(
          `Minecraft: "${this.item.name}" is missing the host option`,
        );

        this.status = "error";
        return;
      }

      return this.fetch(this.server)
        .then((data) => {
          if (!data.online) {
            this.status = "offline";
            return;
          }

          this.status = "online";

          this.software = data.software || "";
          this.version = data.version || "";

          if (data.icon && this.useServerIcon) {
            this.logo = data.icon;
          } else {
            this.logo = "";
          }

          this.players.online = data.players?.online || 0;
          this.players.max = data.players?.max || 0;
        })
        .catch((error) => {
          console.error(
            `Minecraft: failed to fetch "${this.server}"`,
            error,
          );

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

  &.online:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.offline:before,
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
