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
              </p>
            </div>
            <div v-if="status" class="status" :class="status">
              {{ status }}
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
  name: "CorsPing",
  props: {
    item: Object,
  },
  data: () => ({
    status: null,
  }),
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const url = `${this.item.cors_proxy}`;
      fetch(url, { method: "HEAD", cache: "no-cache" })
        .then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          this.status = "online";
        })
        .catch(() => {
          this.status = "offline";
        });
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
</style>
