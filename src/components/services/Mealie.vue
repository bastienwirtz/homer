<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="mealtext">
          {{ mealtext }}
        </template>
        <template v-else-if="statsText">
          {{ statsText }}
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Mealie",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    stats: null,
    meal: null,
  }),
  computed: {
    mealtext: function () {
      if (this.meal && this.meal.length > 0) {
        return `Today: ${this.meal[0].recipe.name}`;
      }
      return null;
    },
    statsText: function () {
      if (this.stats) {
        return `Happily keeping ${this.stats.totalRecipes} recipes organized`;
      }
      return null;
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const headers = {
        Authorization: "Bearer " + this.item.apikey,
        Accept: "application/json",
      };

      if (this.item.subtitle != null) return;

      this.meal = await this.fetch("/api/groups/mealplans/today", {
        headers,
      }).catch((e) => console.log(e));
      this.stats = await this.fetch("/api/admin/about/statistics", {
        headers,
      }).catch((e) => console.log(e));
    },
  },
};
</script>
