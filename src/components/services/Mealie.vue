<template>
  <div>
    <div class="card" :class="item.class">
      <a :href="item.url" :target="item.target" rel="noreferrer">
        <div class="card-content">
          <div class="media">
            <div v-if="item.logo" class="media-left">
              <figure class="image is-48x48">
                <img :src="item.logo" :alt="`${item.name} logo`" />
              </figure>
            </div>
            <div v-if="item.icon" class="media-left">
              <figure class="image is-48x48">
                <i style="font-size: 35px" :class="['fa-fw', item.icon]"></i>
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">{{ item.name }}</p>
              <p class="subtitle is-6">
                <template v-if="item.subtitle">
                  {{ item.subtitle }}
                </template>
                <template v-else-if="meal"> Today: {{ meal.name }} </template>
                <template v-else-if="stats">
                  happily keeping {{ stats.totalRecipes }} recipes organized
                </template>
              </p>
            </div>
          </div>
          <div class="tag" :class="item.tagstyle" v-if="item.tag">
            <strong class="tag-text">#{{ item.tag }}</strong>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "Mealie",
  props: {
    item: Object,
  },
  data: () => ({
    stats: null,
    meal: null,
  }),
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      if (this.item.subtitle != null) return; // omitting unnecessary ajax call as the subtitle is showing
      this.meal = await fetch(`${this.item.url}/api/meal-plans/today/`, {
        headers: {
          Authorization: "Bearer " + this.item.apikey,
          Accept: "application/json",
        },
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Not 2xx response");
          } else {
            if (response != null) {
              return response.json();
            }
          }
        })
        .catch((e) => console.log(e));
      this.stats = await fetch(`${this.item.url}/api/debug/statistics/`, {
        headers: {
          Authorization: "Bearer " + this.item.apikey,
          Accept: "application/json",
        },
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Not 2xx response");
          } else {
            return response.json();
          }
        })
        .catch((e) => console.log(e));
    },
  },
};
</script>

<style scoped lang="scss">
.media-left img {
  max-height: 100%;
}
</style>
