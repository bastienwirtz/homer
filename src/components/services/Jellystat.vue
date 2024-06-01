<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="streams > 0"
          class="notif playing"
          :title="`${streams} active stream${streams > 1 ? 's' : ''}`"
        >
          {{ streams }}
        </strong>
        <i
          v-if="error"
          class="notif error fa-solid fa-triangle-exclamation"
          title="Unable to fetch current status"
        ></i>
      </div>
    </template>
  </Generic>
</template>
<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Jellyfin",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    stats: null,
    error: false,
  }),
  computed: {
    streams: function () {
      if (!this.stats) {
        return "";
      }
      let nb_streams = 0;
      for (let stream of this.stats) {
        if ("NowPlayingItem" in stream) nb_streams++;
      }
      return nb_streams;
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const headers = {
        Authorization: `bearer ${this.item.apikey}`,
      };
      try {
        const response = await this.fetch("/proxy/getSessions", { headers });
        this.error = false;
        this.stats = response;
      } catch (e) {
        this.error = true;
        console.error(e);
      }
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

    &.playing {
      background-color: #28a9a3;
    }

    &.error {
      border-radius: 50%;
      aspect-ratio: 1;
      background-color: #e51111;
    }
  }
}
</style>
