<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="queries">
          Requests: {{ queries.total }}: {{ queries.percent_blocked.toFixed(2) }}&percnt; blocked
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "PiHole",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    status: "disabled",
    sid: "",
    queries: null,
  }),
  created() {
    const checkInterval = parseInt(this.item.checkInterval, 10) || 0;
    if (checkInterval > 0) {
      setInterval(() => this.fetchData(), checkInterval);
    }
    this.fetchData();
  },
  methods: {
    handleError: function(e) {
        console.error(e);
        this.subtitle = e;
        this.status = "disabled";
    },
    authenticate: async function () {
      const result = await this.fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify({
          password: this.item.apikey,
        }),
      }).catch((e) =>
        this.handleError(e),
      );

      if (result && result.session.sid) {
        this.sid = result.session.sid;
      } else {
        handleError("Failed to authenticate");
        return;
      }
    },
    fetchData: async function () {
      if (!this.sid) {
        await this.authenticate();
      }
      const result = await this.fetch(`/api/stats/summary?sid=`+this.sid).catch((e) =>
        this.handleError(e),
      );
      if (!result) {
        this.sid = "";
        this.handleError("Failed to fetch data");
        return;
      }
      this.status = "enabled";
      this.queries = result.queries;
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.enabled:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.disabled:before {
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
