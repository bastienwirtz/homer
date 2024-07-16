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
        {{ status_msg }}
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
    status_msg: "",
    items: ["ads_percentage_today"],
    results: [],
    format: "{0}% blocked",
  }),
  computed: {
    details: function () {
      if (this.results) {
        return this.format.replace(
          /{(\d+)}/g,
          (match, index) => this.results[index],
        );
      }
      return "";
    },
  },
  created() {
    if (this.item.items) this.items = this.item.items;
    if (this.item.format) this.format = this.item.format;

    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const authQueryParams = this.item.apikey
        ? `?summaryRaw&auth=${this.item.apikey}`
        : "";
      return this.fetch(`/api.php${authQueryParams}`)
        .then((response) => {
          if (response) {
            this.status = response.status;

            if (response.status == "enabled") {
              this.status_msg = "enabled";
            } else {
              this.status_msg = "dns only";
            }

            for (const i in this.items)
              this.results[i] = response[this.items[i]];
          } else throw new Error();
          1;
        })
        .catch((e) => {
          console.log(e);
          this.status = "dead";
        });
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
    background-color: #e8bb7d;
    border-color: #e8bb7d;
    box-shadow: 0 0 5px 1px #e8bb7d;
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
