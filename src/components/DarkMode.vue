<template>
  <a
    v-on:click="toggleTheme()"
    aria-label="Toggle dark mode"
    class="navbar-item is-inline-block-mobile"
  >
    <i class="fas fa-fw fa-adjust"></i>
  </a>
</template>

<script>
export default {
  name: "Darkmode",
  props: {
    isDark: Boolean,
  },
  created: function () {
    let isDark =
      "overrideDark" in localStorage
        ? JSON.parse(localStorage.overrideDark)
        : this.isDark === null
        ? matchMedia("(prefers-color-scheme: dark)").matches
        : this.isDark;
    this.$emit("updated", isDark);
  },
  methods: {
    toggleTheme: function () {
      let isDark = !this.isDark;
      localStorage.overrideDark = isDark;
      this.$emit("updated", isDark);
    },
  },
};
</script>
