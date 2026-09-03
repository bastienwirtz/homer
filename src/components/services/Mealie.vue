<template>
  <Generic :item="item" :subtitle="mealtext || statsText" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Mealie",
  mixins: [service],
  data: () => ({
    stats: null,
    meal: null,
    serverError: null,
  }),
  computed: {
    badges() {
      return [this.connectionBadge()];
    },
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
  methods: {
    fetchData: async function () {
      const headers = {
        Authorization: "Bearer " + this.item.apikey,
        Accept: "application/json",
      };

      if (this.item.subtitle != null) return;

      return this.load(
        this.fetch("/api/groups/mealplans/today", { headers }).then((meal) => {
          this.meal = meal;
        }),
        // Admin-only, so a non-admin key must not sink the whole card.
        this.fetch("/api/admin/about/statistics", { headers })
          .then((stats) => {
            this.stats = stats;
          })
          .catch((e) => console.warn("Mealie statistics unavailable:", e)),
      );
    },
  },
};
</script>
