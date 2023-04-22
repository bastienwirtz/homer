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
  import service from "@/mixins/service.js";
  import Generic from "./Generic.vue";

  export default {
    name: "Ping",
    mixins: [service],
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
      switch (this.item.ping_src) {
        case 'uptime-kuma':
          this.fetchUptimeKumaStatus();
          break;
        case null || undefined:
          this.fetchStatus();
          break;

        default:
          console.error(`Ping: ${this.item.ping_src} is not a supported source`);
          break;
      }
    },
    methods: {
      getMethod: function () {
        const method = typeof this.item.method === "string"
            ? this.item.method.toUpperCase()
            : "HEAD";

        if (!["GET", "HEAD", "OPTION"].includes(method)) {
          console.error(`Ping: ${method} is not a supported HTTP method`);
          return;
        }

        return method;
      },
      fetchStatus: async function () {
        const method = this.getMethod();
        this.fetch("/", { method, cache: "no-cache" }, false)
          .then(() => this.status = "online")
          .catch(() => this.status = "offline");
      },
      fetchUptimeKumaStatus: async function () {
        this.fetch(`/api/badge/${this.item.monitorID}/status?upLabel=online&downLabel=offline`, { method: 'GET', cache: "no-cache" }, false)
          .then(async res => await res.text())
          .then(badgeSvg => this.status = badgeSvg.includes('online') ? 'online' : 'offline')
          .catch(() => this.status = "offline");
      }
    },
  };
</script>

<style scoped lang="scss">
  .status {
    font-size: 0.8rem;
    color: var(--text-title);
    white-space: nowrap;
    margin-left: 0.25rem;

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
