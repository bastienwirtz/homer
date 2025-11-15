<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle"> {{ item.subtitle }} </template>
        <template v-else-if="unreadEntries">
          <template v-if="unreadFeeds < 2">
            {{ unreadEntries }} unread
          </template>
          <template v-else>
            {{ unreadEntries }} unread in {{ unreadFeeds }} feeds
          </template>
        </template>
      </p>
    </template>
    <template #indicator>
      <i v-if="loading" class="fa fa-circle-notch fa-spin fa-2xl"></i>
      <div
        v-else
        v-bind:class="[
          'status',
          isHealthy ? (unreadEntries ? 'unread' : 'healthy') : 'unhealthy',
        ]"
      >
        {{ status }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Miniflux",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    unreadEntries: 0,
    unreadFeeds: 0,
    status: "",
    isHealthy: false,
    loading: true,
  }),
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const options = {
        headers: {
          "X-Auth-Token": this.item.api_token,
        },
      };

      const STATUS = {
        OK: "OK",
        ERROR: "Error",
        OFFLINE: "Offline",
        UNREAD: "Unread",
      };
      const healthy = await this.fetch("/healthcheck", options, false)
        .then(function (response) {
          if (response.status == 200) {
            return STATUS.OK;
          } else {
            return STATUS.ERROR;
          }
        })
        .catch((err) => {
          console.error(err);
          return STATUS.OFFLINE;
        });

      this.status = healthy;
      this.isHealthy = this.status == STATUS.OK;

      if (this.status != STATUS.OFFLINE) {
        const status = await this.fetch("/v1/feeds/counters", options).catch(
          (err) => {
            console.error(err);
          }
        );
        const unreads = Object.values(status.unreads);

        this.unreadEntries = unreads.reduce((accumulator, value) => {
          return accumulator + value;
        }, 0);
        this.unreadFeeds = unreads.length;

        if (this.unreadEntries) {
          this.status = STATUS.UNREAD;
        }
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.healthy:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.unread:before {
    background-color: #1774ff;
    border-color: #1774ff;
    box-shadow: 0 0 5px 1px #1774ff;
  }

  &.unhealthy:before {
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
