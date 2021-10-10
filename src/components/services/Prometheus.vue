<template>
  <div>
    <div
      class="card"
      :style="`background-color:${item.background};`"
      :class="item.class"
    >
      <a :href="item.url" :target="item.target" rel="noreferrer">
        <div class="card-content">
          <div :class="mediaClass">
            <slot name="icon">
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
            </slot>
            <div class="media-content">
              <slot name="content">
                <p class="title is-4">{{ item.name }}</p>
                <p class="subtitle is-6">
                  <template v-if="item.subtitle">
                    {{ item.subtitle }}
                  </template>
                  <template v-else-if="api">
                    {{ count }} {{ level }} alerts
                  </template>
                </p>
              </slot>
            </div>
            <div v-if="api" class="status" :class="level">
              {{ count }}
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
  name: "Prometheus",
  props: {
    item: Object,
  },
  data: () => ({
    api: {
      status: "",
      count: 0,
      alerts: {
        firing: 0,
        inactive: 0,
        pending: 0,
      },
    },
  }),
  computed: {
    mediaClass: function () {
      return { media: true, "no-subtitle": !this.item.subtitle };
    },
    count: function () {
      return (
        this.countFiring() || this.countPending() || this.countInactive() || 0
      );
    },
    level: function () {
      if (this.countFiring()) {
        return "firing";
      } else if (this.countPending()) {
        return "pending";
      }
      return "inactive";
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const url = `${this.item.url}/api/v1/alerts`;
      this.api = await fetch(url, { method: "get" })
        .then((response) => {
          return response.json();
        })
        .catch((e) => console.log(e));
    },
    countFiring: function () {
      if (this.api) {
        return this.api.data?.alerts?.filter(
          (alert) => alert.state === "firing"
        ).length;
      }
      return 0;
    },
    countPending: function () {
      if (this.api) {
        return this.api.data?.alerts?.filter(
          (alert) => alert.state === "pending"
        ).length;
      }
      return 0;
    },
    countInactive: function () {
      if (this.api) {
        return this.api.data?.alerts?.filter(
          (alert) => alert.state === "inactive"
        ).length;
      }
      return 0;
    },
  },
};
</script>

<style scoped lang="scss">
.media-left {
  .image {
    display: flex;
    align-items: center;
  }

  img {
    max-height: 100%;
  }
}
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.firing:before {
    background-color: #d65c68;
    border-color: #e87d88;
    box-shadow: 0 0 5px 1px #d65c68;
  }

  &.pending:before {
    background-color: #e8bb7d;
    border-color: #d6a35c;
    box-shadow: 0 0 5px 1px #e8bb7d;
  }

  &.inactive:before {
    background-color: #8fe87d;
    border-color: #70d65c;
    box-shadow: 0 0 5px 1px #8fe87d;
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
