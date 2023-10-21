<template>
  <Generic :item="item">
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
    <template #indicator>
      <span v-if="!error" class="count"
        >{{ count }}
        <template v-if="count === 1">torrent</template>
        <template v-else>torrents</template>
      </span>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";
const units = ["B", "KB", "MB", "GB"];

// Take the rate in bytes and keep dividing it by 1k until the lowest
// value for which we have a unit is determined. Return the value with
// up to two decimals as a string and unit/s appended.
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
  name: "qBittorrent",
  mixins: [service],
  props: { item: Object },
  components: { Generic },
  data: () => ({ dl: null, ul: null, count: null, error: null }),
  computed: {
    downRate: function () {
      return displayRate(this.dl);
    },
    upRate: function () {
      return displayRate(this.ul);
    },
  },
  created() {
    const rateInterval = parseInt(this.item.rateInterval, 10) || 0;
    const torrentInterval = parseInt(this.item.torrentInterval, 10) || 0;
    if (rateInterval > 0) {
      setInterval(() => this.getRate(), rateInterval);
    }
    if (torrentInterval > 0) {
      setInterval(() => this.fetchCount(), torrentInterval);
    }

    this.getRate();
    this.fetchCount();
  },
  methods: {
    fetchCount: async function () {
      try {
        const body = await this.fetch("/api/v2/torrents/info");
        this.error = false;
        this.count = body.length;
      } catch (e) {
        this.error = true;
        console.error(e);
      }
    },
    getRate: async function () {
      try {
        const body = await this.fetch("/api/v2/transfer/info");
        this.error = false;
        this.dl = body.dl_info_speed;
        this.ul = body.up_info_speed;
      } catch (e) {
        this.error = true;
        console.error(e);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.error {
  color: #e51111 !important;
}

.down {
  margin-right: 1em;
}

.count {
  color: var(--text);
  font-size: 0.8em;
}

.monospace {
  font-weight: 300;
  font-family: monospace;
}
</style>
