<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <div class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <div class="select is-small">
          <select v-model="theme" @change="switchTheme">
            <option value="" disabled selected>Available themes</option>
            <option value="theme-classic">classic</option>
            <option value="theme-neon">neon</option>
            <option value="theme-walkxcode">walkxcode</option>
          </select>
        </div>
      </div>
    </template>
  </Generic>
</template>

<script>
let currentTheme;
const app = document.getElementById("app");

export default {
  name: "ThemeChooser",
  props: {
    item: Object,
  },
  data: () => {
    return {
      theme: null,
    };
  },
  created: function () {
    currentTheme = Array.from(app.classList).filter((word) =>
      word.startsWith("theme-"),
    )[0];
    this.theme = currentTheme;
  },
  methods: {
    switchTheme: function () {
      app.classList.replace(currentTheme, this.theme);
      currentTheme = this.theme;
    },
  },
};
</script>

<style scoped lang="scss">
.select,
select {
  width: 100%;
  background-color: var(--card-background);
}
</style>
