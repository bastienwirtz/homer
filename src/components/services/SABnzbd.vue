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
          title="Unable to fetch current status"
        ></i>
      </div>
    </template>
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <span v-if="error" class="error">An error has occurred.</span>
        <template v-else>
          <span class="down monospace">
            <p class="fas fa-download"></p>
            {{ downRate }}
          </span>
          <span class="up monospace">
            <p class="fas fa-upload"></p>
            {{ upRate }}
          </span>
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

const units = ["B", "KB", "MB", "GB"];

// Function to convert rate into a human-readable format
const displayRate = (rate) => {
  let i = 0;

  while (rate > 1000 && i < units.length) {
    rate /= 1000;
    i++;
  }
  return (
    Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
      rate || 0,
    ) + ` ${units[i]}/s`
  );
};

export default {
  name: "SABnzbd",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    stats: null,
    error: false,
    dlSpeed: null,
    ulSpeed: null,
  }),
  computed: {
    downloads() {
      if (!this.stats) {
        return "";
      }
      return this.stats.noofslots;
    },
    downRate() {
      return displayRate(this.dlSpeed);
    },
    upRate() {
      return displayRate(this.ulSpeed);
    },
  },
  created() {
    const downloadInterval = parseInt(this.item.downloadInterval, 10) || 0;
    if (downloadInterval > 0) {
      setInterval(() => this.fetchStatus(), downloadInterval);
    }

    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      try {
        const response = await this.fetch(
          `/api?output=json&apikey=${this.item.apikey}&mode=queue`
        );
        this.error = false;
        this.stats = response.queue;

        // Assuming the response provides download/upload speeds
        this.dlSpeed = response.queue.dl_speed; // Adjust this based on your API response
        this.ulSpeed = response.queue.up_speed; // Adjust this based on your API response
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

.error {
  color: #e51111 !important;
}

.down {
  margin-right: 1em;
}

.monospace {
  font-weight: 300;
  font-family: monospace;
}
</style>
