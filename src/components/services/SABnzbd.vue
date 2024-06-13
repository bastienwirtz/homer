<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="downloads > 0"
          class="notif downloading"
          :title="`${downloads} active download${downloads > 1 ? 's' : ''}`"
        >
          {{ downloads }}
        </strong>
        <i
          v-if="error"
          class="notif error fa-solid fa-triangle-exclamation"
          title="Unable to fetch current download count"
        ></i>
      </div>
      <div class="notifs notifs-down">
        <strong
          v-if="!this.item.rateDisabled && downloads > 0"
          class="notif downloading"
          :title="`${downRate}B/s `"
        >
          {{ downRate }}B/s
        </strong>
        <i
          v-if="error"
          class="notif error fa-solid fa-triangle-exclamation"
          title="Unable to fetch current download speed"
        ></i>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "SABnzbd",
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
    downloads: function () {
      if (!this.stats) {
        return "";
      }
      return this.stats.noofslots;
    },
    downRate: function() {
      if (!this.stats) {
        return "";
      }
      return this.stats.speed;
    },
  },
  created() {
    const downloadInterval = parseInt(this.item.downloadInterval, 10) || 0;
    const apikey = this.item.apikey;

    if (!apikey) {
      console.error(
      "apikey is not present in config.yml for the SABnzbd entry!"
      );
      return;
    }

    if (downloadInterval > 0) {
      setInterval(() => this.fetchStatus(), downloadInterval);
    }

    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      try {
        const response = await this.fetch(
          `/api?output=json&apikey=${this.item.apikey}&mode=queue`,
        );
        this.error = false;
        this.stats = response.queue;
      } catch (e) {
        this.error = true;
        console.error(e);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.notifs-down {
  top: unset !important;
  bottom: 0.3em;
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

    &.downloading {
      background-color: #4fb5d6;
    }

    &.error {
      border-radius: 50%;
      aspect-ratio: 1;
      background-color: #e51111;
    }
  }
}
</style>
