<template>
  <Generic :item="item">
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>

<script>
import Generic from "./Generic.vue";

export default {
  name: "Ping",
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    status: null,
  }),
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const url = `${this.item.url}`;
      fetch(url, {
        method: "HEAD",
        cache: "no-cache",
        credentials: "include",
      })
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
