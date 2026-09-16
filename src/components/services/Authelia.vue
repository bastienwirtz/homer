<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="user">
          {{ user }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ statusLabel }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Authelia",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    status: null,
    user: null,
  }),
  computed: {
    statusLabel: function () {
      return {
        "signed-in": "signed in",
        "signed-out": "signed out",
        offline: "offline",
      }[this.status];
    },
  },
  created() {
    this.autoUpdateMethod = this.fetchUserInfo;
    this.fetchUserInfo();
  },
  methods: {
    fetchUserInfo: async function () {
      this.fetch("/api/user/info", { cache: "no-cache" })
        .then((response) => {
          const info = response?.data ?? {};
          this.status = "signed-in";
          this.user = info.display_name || info.emails?.[0] || null;
        })
        .catch((e) => {
          if (e.cause?.status === 403) {
            this.status = "signed-out";
            this.user = null;
            return;
          }
          this.status = "offline";
          this.user = null;
          console.log(e);
        });
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);
  white-space: nowrap;
  margin-left: 0.25rem;

  &.signed-in:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.signed-out:before {
    background-color: #dbdbdb;
    border-color: #b5b5b5;
    box-shadow: 0 0 5px 1px #dbdbdb;
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
