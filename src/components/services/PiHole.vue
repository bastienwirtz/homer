<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="percentage">
          {{ percentage }}&percnt; blocked
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
  name: "PiHole",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    status: "",
    ads_percentage_today: 0,
  }),
  computed: {
    percentage: function () {
      if (this.ads_percentage_today) {
        return this.ads_percentage_today.toFixed(1);
      }
      return "";
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const authQueryParams = this.item.apikey
        ? `?summaryRaw&auth=${this.item.apikey}`
        : "";
      const result = await this.fetch(`/api.php${authQueryParams}`).catch((e) =>
        console.log(e),
      );

      this.status = result.status;
      this.ads_percentage_today = result.ads_percentage_today;
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
