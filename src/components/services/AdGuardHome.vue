<template>
  <div>
    <div class="card" :class="item.class">
      <a :href="item.url" :target="item.target" rel="noreferrer">
        <div class="card-content">
          <div class="media">
            <div v-if="item.logo" class="media-left">
              <figure class="image is-48x48">
                <img :src="item.logo" :alt="`${item.name} logo`" />
              </figure>
            </div>
            <div v-if="item.icon" class="media-left">
              <figure class="image is-48x48">
                <i style="font-size: 35px" :class="['fa-fw', item.icon]"></i>
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">{{ item.name }}</p>
              <p class="subtitle is-6">
                <template v-if="item.subtitle">
                  {{ item.subtitle }}
                </template>
                <template v-else-if="stats">
                  {{ percentage }}&percnt; blocked
                </template>
              </p>
            </div>
            <div class="status" :class="protection">
              {{ protection }}
            </div>
          </div>
          <div class="tag" :class="item.tagstyle" v-if="item.tag">
            <strong class="tag-text">#{{ item.tag }}</strong>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdGuardHome",
  props: {
    item: Object,
  },
  data: () => {
    return {
      status: null,
      stats: null,
    };
  },
  computed: {
    percentage: function () {
      if (this.stats) {
        return (
          (this.stats.num_blocked_filtering * 100) /
          this.stats.num_dns_queries
        ).toFixed(2);
      }
      return "";
    },
    protection: function () {
      if (this.status) {
        return this.status.protection_enabled ? "enabled" : "disabled";
      } else return "unknown";
    },
  },
  created: function () {
    this.fetchStatus();
    if (!this.item.subtitle) {
      this.fetchStats();
    }
  },
  methods: {
    fetchStatus: async function () {
      this.status = await fetch(`${this.item.url}/control/status`, {
        credentials: "include",
      })
        .then((response) => response.json())
        .catch((e) => console.log(e));
    },
    fetchStats: async function () {
      this.stats = await fetch(`${this.item.url}/control/stats`, {
        credentials: "include",
      })
        .then((response) => response.json())
        .catch((e) => console.log(e));
    },
  },
};
</script>

<style scoped lang="scss">
.media-left img {
  max-height: 100%;
}
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.enabled:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0px 0px 4px 1px #94e185;
  }

  &.disabled:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0px 0px 4px 1px #c9404d;
  }

  &.unknown:before {
    background-color: #c9c740;
    border-color: #ccc935;
    box-shadow: 0px 0px 4px 1px #c9c740;
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
