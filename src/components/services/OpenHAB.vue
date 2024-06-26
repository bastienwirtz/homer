<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else>
          {{ details }}
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
import Generic from "./Generic.vue";

export default {
  name: "OpenHAB",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    status: "",
    things: {
      count: 0,
      online: 0,
    },
    items: {
      count: 0,
    },
  }),
  computed: {
    headers: function () {
      const basicAuth = `${this.item.apikey}:`;

      return {
        Authorization: `Basic ${btoa(basicAuth)}`,
      };
    },
    details: function () {
      const details = [];

      if (this.item.things) {
        details.push(
          `${this.things.count} things (${this.things.online} Online)`,
        );
      }

      if (this.item.items) {
        details.push(`${this.items.count} items`);
      }

      return details.join(", ");
    },
  },
  created() {
    this.fetchServerStatus();

    if (!this.item.subtitle && this.status !== "dead") {
      this.fetchServerStats();
    }
  },
  methods: {
    fetchServerStatus: async function () {
      const headers = this.headers;
      this.fetch("/rest/systeminfo", { headers })
        .then((response) => {
          if (response && response.systemInfo) this.status = "running";
          else throw new Error();
        })
        .catch((e) => {
          console.log(e);
          this.status = "dead";
        });
    },
    fetchServerStats: async function () {
      const headers = this.headers;

      if (this.item.things) {
        const data = await this.fetch("/rest/things?summary=true", {
          headers,
        }).catch((e) => {
          console.log(e);
        });

        this.things.count = data.length;
        this.things.online = data.filter(
          (e) => e.statusInfo.status === "ONLINE",
        ).length;
      }

      if (this.item.items) {
        const data = await this.fetch("/rest/items", { headers }).catch((e) => {
          console.log(e);
        });

        this.items.count = data.length;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.running:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.dead:before {
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
