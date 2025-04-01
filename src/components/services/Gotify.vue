<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="messages > 0">
          <template v-if="messages > 100">100+</template>
          <template v-else>{{ messages }}</template>
          <template v-if="messages === 1"> message</template>
          <template v-else> messages</template>
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status"></div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Gotify",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    health: {},
    messages: 0,
  }),
  computed: {
    status: function () {
      const statuses = [this.health.health, this.health.database];

      if (statuses.includes("red")) {
        return "red";
      } else if (statuses.includes("orange")) {
        return "orange";
      }

      return "green";
    },
  },
  created() {
    this.fetchStatus();
    this.fetchMessages();
  },
  methods: {
    fetchStatus: async function () {
      await this.fetch(`/health`)
        .catch((e) => console.log(e))
        .then((resp) => (this.health = resp));
    },
    fetchMessages: async function () {
      const headers = {
        "X-Gotify-Key": this.item.apikey,
      };
      await this.fetch(`/message?limit=100`, { headers })
        .catch((e) => console.log(e))
        .then((resp) => (this.messages = resp.messages.length));
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.green:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.orange:before {
    background-color: #ee863e;
    border-color: #e77322;
    box-shadow: 0 0 5px 1px #ee863e;
  }

  &.red:before {
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
