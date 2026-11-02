<template>
  <Generic :item="item">
    <template #subtitle>
      <div class="select is-small">
        <select v-model="theme" @change="switchTheme">
          <option value="" disabled selected>Available themes</option>
          <option value="theme-classic">classic</option>
          <option value="theme-neon">neon</option>
          <option value="theme-walkxcode">walkxcode</option>
        </select>
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
// Bulma sizes its controls at 2.5em, which overflows the card under the title.
.select {
  --bulma-control-height: 1.5rem;
  --bulma-control-padding-vertical: 0;
  --bulma-control-padding-horizontal: 0.5em;
}

select {
  background-color: var(--card-background);
}
</style>
