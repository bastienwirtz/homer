<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">{{ percentage }}%</p>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Glances",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    percentage: 0,
  }),
  created() {
    this.fetchStat();
  },
  methods: {
    fetchStat: async function () {
      this.fetch(`/api/4/${this.item.stat}`)
        .then((response) => {
          if (this.item.stat === "cpu") {
            this.percentage = response.total;
          }
          if (this.item.stat === "mem") {
            this.percentage = response.percent;
          }
        })
        .catch((e) => {
          this.percentage = "Error fetching data";
        });
    },
  },
};
</script>
